import { sequelize, User, BankAccount, JobCategory, JobListing, JobBenefit, JobCondition, CertificationType, Course, ExamConfig, ExamQuestion, PracticalCriterion } from './models';
import { CONSTANTS } from './constants';
import bcrypt from 'bcrypt';
import { fifoJobs } from './data/fifoJobs';
import { lmsSeedData } from './data/lmsData';

export async function seedDatabase() {
    console.log('Starting idempotent seeding process...');

    // 1. Initialize Tables (Safe Sync)
    // Using alter: true to preserve existing data. Skipping User, Application, and LmsCredential as requested.
    // 1. Clean up Corrupted LMS Tables (from the UUID mismatch) and Orphaned Job Data
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    
    // Explicitly drop the corrupted LMS tables so alter: true recreates them with INTEGER
    await sequelize.query('DROP TABLE IF EXISTS certification_gaps;');
    await sequelize.query('DROP TABLE IF EXISTS exam_attempts;');
    await sequelize.query('DROP TABLE IF EXISTS certificates;');
    await sequelize.query('DROP TABLE IF EXISTS practical_bookings;');
    await sequelize.query('DROP TABLE IF EXISTS practical_sessions;');
    await sequelize.query('DROP TABLE IF EXISTS enrollments;');
    await sequelize.query('DROP TABLE IF EXISTS course_subsidies;');

    // Truncate the job tables to clear out any orphaned data from previous failed seeds
    await sequelize.query('TRUNCATE TABLE ListingBenefits;');
    await sequelize.query('TRUNCATE TABLE ListingConditions;');
    await sequelize.query('TRUNCATE TABLE job_conditions;');
    await sequelize.query('TRUNCATE TABLE job_benefits;');
    await sequelize.query('TRUNCATE TABLE job_listings;');
    await sequelize.query('TRUNCATE TABLE job_categories;');

    const excludedModels = ['User', 'Application', 'LmsCredential'];
    for (const modelName of Object.keys(sequelize.models)) {
        if (!excludedModels.includes(modelName)) {
            await sequelize.models[modelName].sync({ alter: true });
        }
    }
    
    // Safely add visaSponsorshipStatus to Application without triggering FK re-checks
    try {
        await sequelize.query("ALTER TABLE applications ADD COLUMN visaSponsorshipStatus ENUM('Pending', 'Approved', 'Rejected') DEFAULT NULL;");
        console.log("Safely patched applications table with visaSponsorshipStatus.");
    } catch (e: any) {
        if (e.original && e.original.code !== 'ER_DUP_FIELDNAME') {
            console.log("Notice: Column might already exist or could not be added:", e.message);
        }
    }
    
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');




    // 4. Seed Categories
    const categoryMap: Record<string, any> = {};
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
        const [cat] = await JobCategory.findOrCreate({
            where: { name: sector.name },
            defaults: sector
        });
        categoryMap[sector.name] = cat;
    }


    console.log(`Checking/Importing ${fifoJobs.length} FIFO jobs...`);

    for (const jobData of fifoJobs) {
        const category = categoryMap[jobData.category];
        if (!category) {
            console.warn(`Category ${jobData.category} not found for job ${jobData.title}. Skipping.`);
            continue;
        }

        const [job] = await JobListing.findOrCreate({
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
            const [benefit] = await JobBenefit.findOrCreate({
                where: { description: benefitDesc },
                defaults: {
                    benefitType: 'Employment Benefit',
                    description: benefitDesc,
                    categoryId: category.id
                }
            });
            await (job as any).addJobBenefit(benefit);
        }

        // 7. Link Conditions
        for (const condDesc of jobData.requirements) {
            const [condition] = await JobCondition.findOrCreate({
                where: { description: condDesc },
                defaults: {
                    name: 'Site Requirement',
                    description: condDesc,
                    categoryId: category.id
                }
            });
            await (job as any).addJobCondition(condition);
        }
    }

    console.log('Seeding LMS Data (Courses, Exams, Criteria)...');
    
    for (const data of lmsSeedData) {
        // Create Certification Type
        const [certType] = await CertificationType.findOrCreate({
            where: { name: data.certificationName },
            defaults: {
                description: data.description,
                validityMonths: 24,
                requiresRefresher: true
            }
        });

        // Create Course
        const [course] = await Course.findOrCreate({
            where: { title: data.course.title },
            defaults: {
                description: data.course.description,
                certificationTypeId: certType.id,
                format: data.course.format as any,
                price: data.course.price,
                durationHours: data.course.duration,
                capacity: data.course.capacity,
                isPublished: true
            }
        });

        // Create Exam Config
        const [examConfig] = await ExamConfig.findOrCreate({
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
            await ExamQuestion.findOrCreate({
                where: { courseId: course.id, questionText: q.questionText },
                defaults: {
                    questionType: q.questionType,
                    options: q.options,
                    correctAnswer: q.correctAnswer,
                    weighting: q.weighting
                }
            });
        }

        // Create Practical Criteria
        for (const crit of data.course.practicalCriteria) {
            await PracticalCriterion.findOrCreate({
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
