"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedDatabase = seedDatabase;
const models_1 = require("./models");
const fifoJobs_1 = require("./data/fifoJobs");
const lmsData_1 = require("./data/lmsData");
async function seedDatabase() {
    console.log('Starting idempotent seeding process...');
    // 1. Initialize Tables (Safe Non-Destructive Production Sync)
    // Runs standard model sync (CREATE TABLE IF NOT EXISTS) preserving all production data.
    const excludedModels = ['User', 'Application', 'LmsCredential'];
    for (const modelName of Object.keys(models_1.sequelize.models)) {
        if (!excludedModels.includes(modelName)) {
            await models_1.sequelize.models[modelName].sync();
        }
    }
    // Safely add visaSponsorshipStatus to Application without triggering FK re-checks
    try {
        await models_1.sequelize.query("ALTER TABLE applications ADD COLUMN visaSponsorshipStatus ENUM('Pending', 'Approved', 'Rejected') DEFAULT NULL;");
        console.log("Safely patched applications table with visaSponsorshipStatus.");
    }
    catch (e) {
        if (e.original && e.original.code !== 'ER_DUP_FIELDNAME') {
            console.log("Notice: Column might already exist or could not be added:", e.message);
        }
    }
    // Safely add missing LMS/billing columns to User without triggering full User sync
    const userColumns = [
        "ADD COLUMN candidateNumber VARCHAR(255) UNIQUE DEFAULT NULL",
        "ADD COLUMN walletBalance FLOAT NOT NULL DEFAULT 0",
        "ADD COLUMN bankName VARCHAR(255) DEFAULT NULL",
        "ADD COLUMN accountNumber VARCHAR(255) DEFAULT NULL",
        "ADD COLUMN accountName VARCHAR(255) DEFAULT NULL",
        "ADD COLUMN avelingUsername VARCHAR(255) DEFAULT NULL",
        "ADD COLUMN avelingPassword VARCHAR(255) DEFAULT NULL"
    ];
    for (const colDef of userColumns) {
        try {
            await models_1.sequelize.query(`ALTER TABLE users ${colDef};`);
            console.log(`Safely patched users table: ${colDef}`);
        }
        catch (e) {
            if (e.original && e.original.code !== 'ER_DUP_FIELDNAME') {
                console.log(`Notice for users table patch ${colDef}:`, e.message);
            }
        }
    }
    await models_1.sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    // 4. Seed Categories
    const categoryMap = {};
    const sectors = [
        { name: 'Mining Operations', description: 'Technical and physical operations in mine sites.' },
        { name: 'Mobile Plant Operations', description: 'Operation of heavy machinery and earthmoving equipment.' },
        { name: 'Drilling & Blasting', description: 'Specialized drilling, exploration, and blast hole operations.' },
        { name: 'Processing / Fixed Plant / Plant Operations', description: 'Mineral processing and refinery operations.' },
        { name: 'Shutdowns / Maintenance', description: 'Critical maintenance and project-based shutdown works.' },
        { name: 'Mechanical Trades', description: 'Diesel fitting, mechanical fitting, and heavy equipment maintenance.' },
        { name: 'Electrical / Instrumentation', description: 'HV electrical, instrumentation, and control systems.' },
        { name: 'Construction & Civil', description: 'Industrial construction and civil engineering projects.' },
        { name: 'Oil & Gas / Energy / Power', description: 'Power generation and hydrocarbons extraction.' },
        { name: 'HSE / Safety / Quality', description: 'Health, Safety, and Environment management.' },
        { name: 'Engineering / Technical', description: 'Engineering design, planning, and technical oversight.' },
        { name: 'Geology / Exploration', description: 'Mineral exploration and geological mapping.' },
        { name: 'Laboratory / Sampling', description: 'Assay operations and mineral analysis.' },
        { name: 'Transport / Logistics / Heavy Haulage', description: 'Heavy vehicle operation and site logistics.' },
        { name: 'Warehousing / Stores / Supply', description: 'Inventory management and supply chain operations.' },
        { name: 'Camp / Village / Utilities', description: 'Village management and site lifestyle services.' },
        { name: 'Catering / Hospitality / Housekeeping', description: 'Catering and camp cleaning services.' },
        { name: 'Medical / Emergency Response', description: 'Remote medicine and site emergency services.' },
        { name: 'Administration / Site Administration / Payroll / Document Control', description: 'Site support and business administration.' },
        { name: 'HR / Recruitment / Training', description: 'Personnel management and compliance training.' },
        { name: 'IT / Communications', description: 'Network infrastructure and site IT support.' },
        { name: 'Security', description: 'Site access control and asset protection.' },
        { name: 'Supervisory / Leadership / Management', description: 'Site leadership and departmental management.' },
        { name: 'Entry-Level / Utility / Traineeship / Trades Assistant', description: 'Entry pathways into the resources sector.' }
    ];
    for (const sector of sectors) {
        let cat = await models_1.JobCategory.findOne({ where: { name: sector.name } });
        if (!cat) {
            cat = await models_1.JobCategory.create(sector);
        }
        categoryMap[sector.name] = cat;
    }
    console.log(`Checking/Importing ${fifoJobs_1.fifoJobs.length} FIFO jobs...`);
    for (const jobData of fifoJobs_1.fifoJobs) {
        const category = categoryMap[jobData.category];
        if (!category) {
            console.warn(`Category ${jobData.category} not found for job ${jobData.title}. Skipping.`);
            continue;
        }
        const [job] = await models_1.JobListing.findOrCreate({
            where: {
                title: jobData.title,
                categoryId: category.id
            },
            defaults: {
                description: `Join Australian Resource Group as a ${jobData.title}. This role offers a competitive salary of ${jobData.salary} and a stable shift roster within the ${jobData.category} sector.`,
                location: 'Remote WA/QLD (FIFO)',
                employmentType: 'Full-Time (FIFO)',
                requirements: jobData.requirements.join(', '),
                company: 'Australian Resource Group',
                salary: jobData.salary,
                visaSponsorship: false,
                isActive: true,
                stages: []
            }
        });
        // 6. Link Benefits
        for (const benefitDesc of jobData.benefits) {
            const [benefit] = await models_1.JobBenefit.findOrCreate({
                where: { description: benefitDesc },
                defaults: {
                    benefitType: 'Employment Benefit',
                    description: benefitDesc,
                    categoryId: category.id
                }
            });
            await job.addJobBenefit(benefit);
        }
        // 7. Link Conditions
        for (const condDesc of jobData.requirements) {
            const [condition] = await models_1.JobCondition.findOrCreate({
                where: { description: condDesc },
                defaults: {
                    name: 'Site Requirement',
                    description: condDesc,
                    categoryId: category.id
                }
            });
            await job.addJobCondition(condition);
        }
    }
    console.log('Seeding LMS Data (Courses, Exams, Criteria)...');
    for (const data of lmsData_1.lmsSeedData) {
        // Create Certification Type
        const [certType] = await models_1.CertificationType.findOrCreate({
            where: { name: data.certificationName },
            defaults: {
                description: data.description,
                validityMonths: 24,
                requiresRefresher: true
            }
        });
        // Create Course
        const [course] = await models_1.Course.findOrCreate({
            where: { title: data.course.title },
            defaults: {
                description: data.course.description,
                certificationTypeId: certType.id,
                format: data.course.format,
                price: data.course.price,
                durationHours: data.course.duration,
                capacity: data.course.capacity,
                isPublished: true
            }
        });
        // Create Exam Config
        const [examConfig] = await models_1.ExamConfig.findOrCreate({
            where: { courseId: course.id },
            defaults: {
                passThreshold: data.course.examConfig.passThreshold,
                maxAttempts: data.course.examConfig.maxAttempts,
                timeLimitMinutes: 60,
                randomizeQuestions: true
            }
        });
        // Create Exam Questions
        for (const q of data.course.questions) {
            await models_1.ExamQuestion.findOrCreate({
                where: { courseId: course.id, questionText: q.questionText },
                defaults: {
                    questionType: q.questionType,
                    options: q.options,
                    correctOptionIndex: q.correctOptionIndex,
                    weight: q.weight
                }
            });
        }
        // Create Practical Criteria
        for (const crit of data.course.practicalCriteria) {
            await models_1.PracticalCriterion.findOrCreate({
                where: { courseId: course.id, description: crit },
                defaults: {
                    isMandatory: true
                }
            });
        }
    }
    console.log('Idempotent seeding completed successfully!');
}
if (require.main === module) {
    seedDatabase().catch(err => {
        console.error('Seeding failed:', err);
        process.exit(1);
    });
}
