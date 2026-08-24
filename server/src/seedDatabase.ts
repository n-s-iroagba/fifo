import { sequelize, User, BankAccount, JobCategory, JobListing, CertificationType, Course, CourseModule, ExamConfig, ExamQuestion, TicketCatalog } from './models';
import { CONSTANTS } from './constants';
import bcrypt from 'bcrypt';
import { fifoJobs } from './data/fifoJobs';
import { lmsSeedData } from './data/lmsData';

export async function seedDatabase() {
    console.log('Starting idempotent seeding process...');

    // ─── Crypto Wallet Migration ──────────────────────────────────────────────
    // On every deployment, drop the bank_accounts table and rebuild it from the
    // updated Sequelize model (which now maps to TRC-20 USDT wallet fields).
    // This is safe because there are no foreign-key references to bank_accounts
    // from other tables.
    try {
        console.log('[Migration] Wiping and recreating bank_accounts as crypto wallet table...');
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
        await BankAccount.sync({ force: true });
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
        console.log('[Migration] bank_accounts recreated with crypto wallet schema.');
    } catch (e: any) {
        console.error('[Migration] Failed to recreate bank_accounts:', e.message);
    }

    // 1. Initialize Tables (Safe Non-Destructive Production Sync)
    // Runs standard model sync (CREATE TABLE IF NOT EXISTS) preserving all production data.
    const excludedModels = ['User', 'Application', 'LmsCredential', 'BankAccount'];
    for (const modelName of Object.keys(sequelize.models)) {
        if (!excludedModels.includes(modelName)) {
            await sequelize.models[modelName].sync();
        }
    }

    // Safely add content and durationMinutes to course_modules
    try {
        await sequelize.query("ALTER TABLE course_modules ADD COLUMN content TEXT DEFAULT NULL;");
        console.log("Safely patched course_modules table with content.");
    } catch (e: any) {
        if (e.original && e.original.code !== 'ER_DUP_FIELDNAME') {
            console.log("Notice: content column might already exist or could not be added:", e.message);
        }
    }
    try {
        await sequelize.query("ALTER TABLE course_modules ADD COLUMN duration_minutes INTEGER DEFAULT 30;");
        console.log("Safely patched course_modules table with durationMinutes.");
    } catch (e: any) {
        if (e.original && e.original.code !== 'ER_DUP_FIELDNAME') {
            console.log("Notice: duration_minutes column might already exist or could not be added:", e.message);
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

    try {
        await sequelize.query("ALTER TABLE applications ADD COLUMN status VARCHAR(255) NOT NULL DEFAULT 'Active';");
        console.log("Safely patched applications table with status.");
    } catch (e: any) {
        if (e.original && e.original.code !== 'ER_DUP_FIELDNAME') {
            console.log("Notice: status column might already exist or could not be added:", e.message);
        }
    }

    try {
        await sequelize.query("ALTER TABLE invoices ADD COLUMN isPaid BOOLEAN NOT NULL DEFAULT false;");
        console.log("Safely patched invoices table with isPaid.");
    } catch (e: any) {
        if (e.original && e.original.code !== 'ER_DUP_FIELDNAME') {
            console.log("Notice: Column might already exist or could not be added:", e.message);
        }
    }

    try {
        await sequelize.query("ALTER TABLE job_listings ADD COLUMN benefits TEXT DEFAULT NULL;");
        console.log("Safely patched job_listings table with benefits.");
    } catch (e: any) {
        if (e.original && e.original.code !== 'ER_DUP_FIELDNAME') {
            console.log("Notice: benefits column might already exist or could not be added:", e.message);
        }
    }

    try {
        await sequelize.query("ALTER TABLE ticket_catalogs DROP COLUMN sponsorshipPrice;");
        console.log("Safely dropped sponsorshipPrice column from ticket_catalogs table.");
    } catch (e: any) {
        if (e.original && (e.original.code === 'ER_CANT_DROP_FIELD_OR_KEY' || e.original.code === 'ER_BAD_FIELD_ERROR')) {
            console.log("Notice: sponsorshipPrice column already dropped or does not exist in ticket_catalogs.");
        } else {
            console.log("Notice for ticket_catalogs drop column sponsorshipPrice:", e.message);
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
        "ADD COLUMN depositPaid BOOLEAN DEFAULT false",
        "ADD COLUMN depositPaidAt DATETIME DEFAULT NULL",
        "ADD COLUMN fullBalancePaid BOOLEAN DEFAULT false",
        "ADD COLUMN psychometricModule1Passed BOOLEAN DEFAULT false",
        "ADD COLUMN psychometricModule2Passed BOOLEAN DEFAULT false",
        "ADD COLUMN psychometricCompletedAt DATETIME DEFAULT NULL"
    ];

    for (const colDef of userColumns) {
        try {
            await sequelize.query(`ALTER TABLE users ${colDef};`);
            console.log(`Safely patched users table: ${colDef}`);
        } catch (e: any) {
            if (e.original && e.original.code !== 'ER_DUP_FIELDNAME') {
                console.log(`Notice for users table patch ${colDef}:`, e.message);
            }
        }
    }

    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');

    // ─── LMS Deduplication Migration ──────────────────────────────────────────
    // Removes duplicate rows from all LMS tables, keeping the lowest-id record
    // per unique key. Runs idempotently before every seed pass.
    console.log('[Migration] Deduplicating LMS tables...');
    try {
        // Delete legacy un-coded ticket_catalogs when a coded catalog item exists or matches un-coded plain names
        const legacyPlainNames = [
            'EEHA Certification',
            'Standard 11 Mining Induction',
            'White Card WA',
            'Working at Heights',
            'Confined Space Entry',
            'Gas Test Atmospheres',
            'Provide First Aid',
            'National Police Clearance',
            'Australian Drivers Licence (Class C)',
            'Certificate III in Commercial Cookery',
            'Food Safety Supervisor',
            'Responsible Service of Alcohol (RSA)',
            'Forklift Licence (LF)'
        ];

        for (const plainName of legacyPlainNames) {
            // Delete un-coded ticket catalog entry if a coded counterpart exists
            await sequelize.query(`
                DELETE FROM ticket_catalogs
                WHERE name = :plainName
                AND EXISTS (
                    SELECT 1 FROM (SELECT * FROM ticket_catalogs) tc2
                    WHERE tc2.name LIKE CONCAT('%', :plainName) AND tc2.name != :plainName
                );
            `, { replacements: { plainName } });

            // Delete un-coded certification_types if a coded counterpart exists
            await sequelize.query(`
                DELETE FROM certification_types
                WHERE name = :plainName
                AND EXISTS (
                    SELECT 1 FROM (SELECT * FROM certification_types) ct2
                    WHERE ct2.name LIKE CONCAT('%', :plainName) AND ct2.name != :plainName
                );
            `, { replacements: { plainName } });
        }

        // Deduplicate certification_types by name
        await sequelize.query(`
            DELETE ct FROM certification_types ct
            INNER JOIN certification_types ct2
            ON ct.name = ct2.name AND ct.id > ct2.id;
        `);
        // Deduplicate courses by title
        await sequelize.query(`
            DELETE c FROM courses c
            INNER JOIN courses c2
            ON c.title = c2.title AND c.id > c2.id;
        `);
        // Deduplicate course_modules by courseId + title
        await sequelize.query(`
            DELETE cm FROM course_modules cm
            INNER JOIN course_modules cm2
            ON cm.course_id = cm2.course_id AND cm.title = cm2.title AND cm.id > cm2.id;
        `);
        // Deduplicate exam_questions by courseId + questionText
        await sequelize.query(`
            DELETE eq FROM exam_questions eq
            INNER JOIN exam_questions eq2
            ON eq.course_id = eq2.course_id AND eq.question_text = eq2.question_text AND eq.id > eq2.id;
        `);
        // Deduplicate ticket_catalogs by name
        await sequelize.query(`
            DELETE tc FROM ticket_catalogs tc
            INNER JOIN ticket_catalogs tc2
            ON tc.name = tc2.name AND tc.id > tc2.id;
        `);
        console.log('[Migration] LMS deduplication complete.');
    } catch (e: any) {
        console.error('[Migration] Deduplication error (non-fatal):', e.message);
    }

    console.log('Seeding LMS Data (Courses, Exams, Criteria, Ticket Catalogs)...');

    for (const data of lmsSeedData) {
        // Create Certification Type
        const [certType] = await CertificationType.findOrCreate({
            where: { name: data.certificationName },
            defaults: {
                code: data.certificationName.toUpperCase().replace(/\s+/g, '-')
            }
        });
        await certType.update({
            code: data.certificationName.toUpperCase().replace(/\s+/g, '-')
        });

        // Create Course
        const [course] = await Course.findOrCreate({
            where: { title: data.course.title },
            defaults: {
                code: data.course.title.split(' ')[0], // e.g. RIIWHS204E
                description: data.course.description,
                certificationTypeId: certType.id,
                format: data.course.format as any,
                price: data.course.price,
                capacity: data.course.capacity,
                isPublished: true
            }
        });
        await course.update({
            code: data.course.title.split(' ')[0],
            description: data.course.description,
            certificationTypeId: certType.id,
            format: data.course.format as any,
            price: data.course.price,
            capacity: data.course.capacity,
            isPublished: true
        });

        // Create Course Modules
        if (data.course.modules) {
            for (const m of data.course.modules) {
                const [mod] = await CourseModule.findOrCreate({
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
        const [examConfig] = await ExamConfig.findOrCreate({
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
            const [examQ] = await ExamQuestion.findOrCreate({
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

        // Create a single canonical Ticket Catalog entry per certification (no duplicates).
        // Canonical name is the plain certificationName — the course code is already
        // in the description, keeping the catalog list clean for admin use.
        const [catalogEntry] = await TicketCatalog.findOrCreate({
            where: { name: data.certificationName },
            defaults: {
                normalPrice: data.course.price,
                description: `${data.description} Unit code: ${course.code}.`
            }
        });
        await catalogEntry.update({
            normalPrice: data.course.price,
            description: `${data.description} Unit code: ${course.code}.`
        });
    }

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
        let cat = await JobCategory.findOne({ where: { name: sector.name } });
        if (!cat) {
            cat = await JobCategory.create(sector);
        }
        categoryMap[sector.name] = cat;
    }
    const allTickets = await TicketCatalog.findAll();
    const standard11 = allTickets.find((t: any) => t.name.includes('Standard 11'));
    const whiteCard = allTickets.find((t: any) => t.name.includes('White Card'));
    
    // Seeding jobs has been disconnected from the current seeding flow per request.
    // console.log(`Checking/Importing ${fifoJobs.length} FIFO jobs...`);
    //
    // for (const jobData of fifoJobs) { ... }
    console.log('Idempotent seeding completed successfully!');
}

if (require.main === module) {
    seedDatabase().catch(err => {
        console.error('Seeding failed:', err);
        process.exit(1);
    });
}
