"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedJobCategories = seedJobCategories;
exports.seedLmsAndTickets = seedLmsAndTickets;
exports.seedDatabase = seedDatabase;
const models_1 = require("./models");
const lmsData_1 = require("./data/lmsData");
const migrations_1 = require("./migrations");
/**
 * Model Seed 1: Job Categories (Sectors)
 */
async function seedJobCategories() {
    console.log('[Seeding] Seeding Job Categories (Sectors)...');
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
        await models_1.JobCategory.findOrCreate({
            where: { name: sector.name },
            defaults: sector
        });
    }
    console.log('[Seeding] Job Categories seeded successfully.');
}
/**
 * Model Seed 2: LMS Infrastructure & Ticket Catalogs
 * Seeds CertificationType -> Course -> CourseModule -> ExamConfig & Questions -> TicketCatalog
 * (Tickets are seeded directly alongside their courses and questions per LMS entry)
 */
async function seedLmsAndTickets() {
    console.log('[Seeding] Seeding LMS Data (Certifications, Courses, Modules, Questions & Ticket Catalogs)...');
    for (const data of lmsData_1.lmsSeedData) {
        // 1. CertificationType Model
        const certCode = data.certificationName.toUpperCase().replace(/\s+/g, '-');
        const [certType] = await models_1.CertificationType.findOrCreate({
            where: { name: data.certificationName },
            defaults: { code: certCode }
        });
        await certType.update({ code: certCode });
        // 2. Course Model
        const courseCode = data.course.title.split(' ')[0];
        const [course] = await models_1.Course.findOrCreate({
            where: { title: data.course.title },
            defaults: {
                code: courseCode,
                description: data.course.description,
                certificationTypeId: certType.id,
                format: data.course.format,
                price: data.course.price,
                capacity: data.course.capacity,
                isPublished: true
            }
        });
        await course.update({
            code: courseCode,
            description: data.course.description,
            certificationTypeId: certType.id,
            format: data.course.format,
            price: data.course.price,
            capacity: data.course.capacity,
            isPublished: true
        });
        // 3. CourseModule Model
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
                await mod.update({
                    content: m.content,
                    durationMinutes: m.durationMinutes,
                    contentType: m.contentType || 'TEXT',
                    contentUrl: m.contentUrl || 'local-content',
                    sequenceOrder: m.sequenceOrder
                });
            }
        }
        // 4. ExamConfig Model
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
        // 5. ExamQuestion Model
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
        // 6. TicketCatalog Model (Seeded directly alongside Course & Questions)
        const [catalogEntry] = await models_1.TicketCatalog.findOrCreate({
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
    console.log('[Seeding] LMS Data & Ticket Catalogs seeded successfully.');
}
/**
 * Main Idempotent Database Seeding Entrypoint
 */
async function seedDatabase() {
    console.log('====================================================');
    console.log('Starting Idempotent Seeding Process...');
    console.log('====================================================');
    // 1. Run migrations cleanly prior to seeding
    await (0, migrations_1.runAllMigrations)();
    // 2. Seed data model by model
    await seedJobCategories();
    await seedLmsAndTickets();
    console.log('====================================================');
    console.log('Idempotent Seeding Completed Successfully!');
    console.log('====================================================');
}
if (require.main === module) {
    seedDatabase().catch(err => {
        console.error('Seeding failed:', err);
        process.exit(1);
    });
}
