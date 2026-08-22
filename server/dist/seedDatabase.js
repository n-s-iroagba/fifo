"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedDatabase = seedDatabase;
const models_1 = require("./models");
const fifoJobs_1 = require("./data/fifoJobs");
const lmsData_1 = require("./data/lmsData");
async function seedDatabase() {
    console.log('Starting idempotent seeding process...');
    // ─── Crypto Wallet Migration ──────────────────────────────────────────────
    // On every deployment, drop the bank_accounts table and rebuild it from the
    // updated Sequelize model (which now maps to TRC-20 USDT wallet fields).
    // This is safe because there are no foreign-key references to bank_accounts
    // from other tables.
    try {
        console.log('[Migration] Wiping and recreating bank_accounts as crypto wallet table...');
        await models_1.sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
        await models_1.BankAccount.sync({ force: true });
        await models_1.sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
        console.log('[Migration] bank_accounts recreated with crypto wallet schema.');
    }
    catch (e) {
        console.error('[Migration] Failed to recreate bank_accounts:', e.message);
    }
    // 1. Initialize Tables (Safe Non-Destructive Production Sync)
    // Runs standard model sync (CREATE TABLE IF NOT EXISTS) preserving all production data.
    const excludedModels = ['User', 'Application', 'LmsCredential', 'BankAccount'];
    for (const modelName of Object.keys(models_1.sequelize.models)) {
        if (!excludedModels.includes(modelName)) {
            await models_1.sequelize.models[modelName].sync();
        }
    }
    // Safely add content and durationMinutes to course_modules
    try {
        await models_1.sequelize.query("ALTER TABLE course_modules ADD COLUMN content TEXT DEFAULT NULL;");
        console.log("Safely patched course_modules table with content.");
    }
    catch (e) {
        if (e.original && e.original.code !== 'ER_DUP_FIELDNAME') {
            console.log("Notice: content column might already exist or could not be added:", e.message);
        }
    }
    try {
        await models_1.sequelize.query("ALTER TABLE course_modules ADD COLUMN duration_minutes INTEGER DEFAULT 30;");
        console.log("Safely patched course_modules table with durationMinutes.");
    }
    catch (e) {
        if (e.original && e.original.code !== 'ER_DUP_FIELDNAME') {
            console.log("Notice: duration_minutes column might already exist or could not be added:", e.message);
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
    try {
        await models_1.sequelize.query("ALTER TABLE applications ADD COLUMN status VARCHAR(255) NOT NULL DEFAULT 'Active';");
        console.log("Safely patched applications table with status.");
    }
    catch (e) {
        if (e.original && e.original.code !== 'ER_DUP_FIELDNAME') {
            console.log("Notice: status column might already exist or could not be added:", e.message);
        }
    }
    try {
        await models_1.sequelize.query("ALTER TABLE invoices ADD COLUMN isPaid BOOLEAN NOT NULL DEFAULT false;");
        console.log("Safely patched invoices table with isPaid.");
    }
    catch (e) {
        if (e.original && e.original.code !== 'ER_DUP_FIELDNAME') {
            console.log("Notice: Column might already exist or could not be added:", e.message);
        }
    }
    try {
        await models_1.sequelize.query("ALTER TABLE job_listings ADD COLUMN benefits TEXT DEFAULT NULL;");
        console.log("Safely patched job_listings table with benefits.");
    }
    catch (e) {
        if (e.original && e.original.code !== 'ER_DUP_FIELDNAME') {
            console.log("Notice: benefits column might already exist or could not be added:", e.message);
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
        "ADD COLUMN avelingPassword VARCHAR(255) DEFAULT NULL",
        "ADD COLUMN adminStageId VARCHAR(255) DEFAULT NULL",
        "ADD COLUMN depositPaid BOOLEAN DEFAULT false",
        "ADD COLUMN depositPaidAt DATETIME DEFAULT NULL",
        "ADD COLUMN fullBalancePaid BOOLEAN DEFAULT false",
        "ADD COLUMN psychometricModule1Passed BOOLEAN DEFAULT false",
        "ADD COLUMN psychometricModule2Passed BOOLEAN DEFAULT false",
        "ADD COLUMN psychometricCompletedAt DATETIME DEFAULT NULL"
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
    console.log('Seeding LMS Data (Courses, Exams, Criteria, Ticket Catalogs)...');
    for (const data of lmsData_1.lmsSeedData) {
        // Create Certification Type
        const [certType] = await models_1.CertificationType.findOrCreate({
            where: { name: data.certificationName },
            defaults: {
                code: data.certificationName.toUpperCase().replace(/\s+/g, '-')
            }
        });
        await certType.update({
            code: data.certificationName.toUpperCase().replace(/\s+/g, '-')
        });
        // Create Course
        const [course] = await models_1.Course.findOrCreate({
            where: { title: data.course.title },
            defaults: {
                code: data.course.title.split(' ')[0], // e.g. RIIWHS204E
                description: data.course.description,
                certificationTypeId: certType.id,
                format: data.course.format,
                price: data.course.price,
                capacity: data.course.capacity,
                isPublished: true
            }
        });
        await course.update({
            code: data.course.title.split(' ')[0],
            description: data.course.description,
            certificationTypeId: certType.id,
            format: data.course.format,
            price: data.course.price,
            capacity: data.course.capacity,
            isPublished: true
        });
        // Create Course Modules
        if (data.course.modules) {
            for (const m of data.course.modules) {
                const [mod] = await models_1.CourseModule.findOrCreate({
                    where: { courseId: course.id, title: m.title },
                    defaults: {
                        durationMinutes: m.durationMinutes,
                        sequenceOrder: m.sequenceOrder,
                        content: m.content,
                        contentType: m.contentType || 'TEXT',
                        contentUrl: m.contentUrl || 'local-content'
                    }
                });
                // Enforce update for newly added schema fields
                await mod.update({
                    content: m.content,
                    durationMinutes: m.durationMinutes,
                    contentType: m.contentType || 'TEXT',
                    contentUrl: m.contentUrl || 'local-content',
                    sequenceOrder: m.sequenceOrder
                });
            }
        }
        // Create Exam Config
        const [examConfig] = await models_1.ExamConfig.findOrCreate({
            where: { courseId: course.id },
            defaults: {
                passThreshold: data.course.examConfig.passThreshold,
                timeLimitMinutes: 60
            }
        });
        await examConfig.update({
            passThreshold: data.course.examConfig.passThreshold
        });
        // Create Exam Questions
        for (const q of data.course.questions) {
            const [examQ] = await models_1.ExamQuestion.findOrCreate({
                where: { courseId: course.id, questionText: q.questionText },
                defaults: {
                    questionType: q.questionType,
                    options: q.options,
                    correctOptionIndex: q.correctOptionIndex,
                    weight: q.weight
                }
            });
            await examQ.update({
                options: q.options,
                correctOptionIndex: q.correctOptionIndex,
                weight: q.weight
            });
        }
        // Create Ticket Catalog Entry (both full name and simplified name for easy admin lookup)
        const catalogName = `${data.certificationName} (${course.code})`;
        const [catalogEntry] = await models_1.TicketCatalog.findOrCreate({
            where: { name: catalogName },
            defaults: {
                normalPrice: data.course.price,
                sponsorshipPrice: Number((data.course.price * 0.35).toFixed(2)),
                description: `Australian Ticket for ${data.certificationName} (${course.code})`
            }
        });
        await catalogEntry.update({
            normalPrice: data.course.price,
            sponsorshipPrice: Number((data.course.price * 0.35).toFixed(2)),
            description: `Australian Ticket for ${data.certificationName} (${course.code})`
        });
        // Also ensure standalone name entry exists in catalog
        const [standaloneCatalog] = await models_1.TicketCatalog.findOrCreate({
            where: { name: data.certificationName },
            defaults: {
                normalPrice: data.course.price,
                sponsorshipPrice: Number((data.course.price * 0.35).toFixed(2)),
                description: `Australian Ticket for ${data.certificationName}`
            }
        });
        await standaloneCatalog.update({
            normalPrice: data.course.price,
            sponsorshipPrice: Number((data.course.price * 0.35).toFixed(2)),
            description: `Australian Ticket for ${data.certificationName}`
        });
    }
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
    const allTickets = await models_1.TicketCatalog.findAll();
    const standard11 = allTickets.find((t) => t.name.includes('Standard 11'));
    const whiteCard = allTickets.find((t) => t.name.includes('White Card'));
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
                stages: [],
                benefits: jobData.benefits.join('\n')
            }
        });
        // Determine relevant tickets based on title and category
        let assignedTickets = [];
        // Everyone needs a White Card as a baseline in construction/mining
        if (whiteCard)
            assignedTickets.push(whiteCard);
        if (jobData.category.includes('Mining') || jobData.title.includes('Mine')) {
            if (standard11 && !assignedTickets.includes(standard11))
                assignedTickets.push(standard11);
        }
        const reqsString = jobData.requirements.join(' ').toLowerCase();
        const titleString = jobData.title.toLowerCase();
        for (const ticket of allTickets) {
            const ticketName = ticket.name.toLowerCase();
            if (!assignedTickets.includes(ticket) &&
                (reqsString.includes(ticketName.split(' ')[0]) || titleString.includes(ticketName.split(' ')[0]))) {
                assignedTickets.push(ticket);
            }
        }
        const ticketIds = assignedTickets.map(t => t.id);
        // Update Job with tickets to ensure no breaking changes (both JSON array and Relational table)
        await job.update({ ticketIds });
        if (job.setRequiredTickets) {
            await job.setRequiredTickets(ticketIds);
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
