"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedJobCategories = seedJobCategories;
exports.seedEmployers = seedEmployers;
exports.seedWallet = seedWallet;
exports.seedJobListings = seedJobListings;
exports.seedLmsAndTickets = seedLmsAndTickets;
exports.seedDatabase = seedDatabase;
const models_1 = require("./models");
const lmsData_1 = require("./data/lmsData");
const fifoJobs_1 = require("./data/fifoJobs");
const expandTo35Questions_1 = require("./data/questions/expandTo35Questions");
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
 * Model Seed 2: Employers (MACA Limited as active partner, Mineral Resources)
 */
async function seedEmployers() {
    console.log('[Seeding] Seeding Hiring Employers...');
    const [maca] = await models_1.Employer.findOrCreate({
        where: { name: 'MACA Limited' },
        defaults: {
            websiteUrl: 'https://www.maca.net.au',
            companyDescription: 'MACA Limited is an international mining, civil construction, and infrastructure contracting company based in Welshpool, Western Australia, operating major open-pit and underground iron ore and gold projects across the Pilbara and Goldfields.',
            location: 'Welshpool, Western Australia',
            isEmploying: true,
            logoUrl: 'https://res.cloudinary.com/dh2cpesxu/image/upload/v1729700000/logos/maca_logo.png'
        }
    });
    await maca.update({
        websiteUrl: 'https://www.maca.net.au',
        companyDescription: 'MACA Limited is an international mining, civil construction, and infrastructure contracting company based in Welshpool, Western Australia, operating major open-pit and underground iron ore and gold projects across the Pilbara and Goldfields.',
        location: 'Welshpool, Western Australia',
        isEmploying: true
    });
    const [minRes] = await models_1.Employer.findOrCreate({
        where: { name: 'Mineral Resources Limited' },
        defaults: {
            websiteUrl: 'https://www.mineralresources.com.au',
            companyDescription: 'Mineral Resources (MinRes) is a leading diversified mining services and commodities company in Western Australia, with world-class iron ore, lithium, and energy operations across the Pilbara and Yilgarn regions.',
            location: 'Osborne Park, Western Australia',
            isEmploying: false,
            logoUrl: 'https://res.cloudinary.com/dh2cpesxu/image/upload/v1729700000/logos/minres_logo.png'
        }
    });
    await minRes.update({
        websiteUrl: 'https://www.mineralresources.com.au',
        companyDescription: 'Mineral Resources (MinRes) is a leading diversified mining services and commodities company in Western Australia, with world-class iron ore, lithium, and energy operations across the Pilbara and Yilgarn regions.',
        location: 'Osborne Park, Western Australia',
        isEmploying: false
    });
    console.log('[Seeding] Employers seeded successfully.');
    return { maca, minRes };
}
/**
 * Model Seed 3: Single USDT TRC-20 Crypto Wallet
 */
async function seedWallet() {
    console.log('[Seeding] Seeding Crypto Wallet...');
    const existing = await models_1.Wallet.findOne();
    if (!existing) {
        await models_1.Wallet.create({
            address: 'TLyHZ2iU8XwK8z392mH9xV39Bmqv8QeZ21',
            network: 'TRC20',
            currency: 'USDT',
            isActive: true
        });
    }
    console.log('[Seeding] Crypto Wallet seeded successfully.');
}
/**
 * Model Seed 4: Job Listings with Operational Manual & Linked Employers
 */
async function seedJobListings(maca, minRes) {
    console.log('[Seeding] Seeding FIFO Job Listings...');
    const defaultManualUrl = 'https://res.cloudinary.com/dh2cpesxu/image/upload/v1729700000/operational_manuals/maca_mining_standard_operating_procedure.pdf';
    for (const rawJob of fifoJobs_1.fifoJobs) {
        // Find category
        const cat = await models_1.JobCategory.findOne({ where: { name: rawJob.category } });
        const categoryId = cat ? cat.id : 1;
        const benefitsNumbered = rawJob.benefits.join('\n');
        const requirementsText = rawJob.requirements.join('\n');
        const [job] = await models_1.JobListing.findOrCreate({
            where: { title: rawJob.title },
            defaults: {
                title: rawJob.title,
                categoryId,
                employmentType: 'Full-time',
                location: 'Perth, Western Australia (FIFO)',
                description: `High-priority Western Australian resources sector opportunity for ${rawJob.title}. Complete operational induction, equipment maintenance, and field responsibilities across major Western Australian mining project leases.`,
                requirements: requirementsText,
                salary: rawJob.salary,
                benefits: benefitsNumbered,
                isActive: true,
                visaSponsorship: true,
                jobType: 'NORMAL',
                operationalManualUrl: defaultManualUrl
            }
        });
        await job.update({
            operationalManualUrl: defaultManualUrl,
            benefits: benefitsNumbered,
            requirements: requirementsText,
            salary: rawJob.salary,
            isActive: true,
            visaSponsorship: true
        });
        // Link with MACA Limited
        const [linkMaca] = await models_1.JoblistingEmployer.findOrCreate({
            where: { employerId: maca.id, joblistingId: job.id },
            defaults: {
                employerId: maca.id,
                joblistingId: job.id,
                vacancyUrl: 'https://www.maca.net.au/careers'
            }
        });
        await linkMaca.update({ vacancyUrl: 'https://www.maca.net.au/careers' });
        // Link with Mineral Resources
        const [linkMinRes] = await models_1.JoblistingEmployer.findOrCreate({
            where: { employerId: minRes.id, joblistingId: job.id },
            defaults: {
                employerId: minRes.id,
                joblistingId: job.id,
                vacancyUrl: 'https://www.mineralresources.com.au/careers'
            }
        });
        await linkMinRes.update({ vacancyUrl: 'https://www.mineralresources.com.au/careers' });
    }
    console.log('[Seeding] Job Listings seeded and linked to employers.');
}
/**
 * Model Seed 5: LMS Infrastructure, Courses (with syllabus & contentUrl), 35 Exam Questions, & Ticket Catalogs
 */
async function seedLmsAndTickets() {
    console.log('[Seeding] Seeding LMS Data (Certifications, Courses, Modules, 35 Questions & Ticket Catalogs)...');
    const defaultCourseManualUrl = 'https://res.cloudinary.com/dh2cpesxu/image/upload/v1729700000/training_materials/certhero_accredited_course_manual.pdf';
    const syllabusTemplate = [
        {
            title: "Module 1: Workplace Health, Safety & Legislative Frameworks",
            topics: [
                "Duty of care in Western Australian resources sector",
                "Mines Safety and Inspection Act compliance",
                "Job Safety Analysis (JSA) and Take 5 dynamic hazard protocols"
            ]
        },
        {
            title: "Module 2: Operational Hazard Identification & Control",
            topics: [
                "Hierarchy of controls application",
                "Hazard reporting and Lockout/Tagout isolation procedures",
                "Environmental risk mitigation and spillage containment"
            ]
        },
        {
            title: "Module 3: Technical Skills, Inspection & Equipment Verification",
            topics: [
                "Pre-operational walkaround inspection routines",
                "Equipment safe working load limits and operational boundaries",
                "Defect identification, logging, and out-of-service tagging"
            ]
        },
        {
            title: "Module 4: Practical Demonstration & Regulatory Assessment",
            topics: [
                "Supervised field execution and positive radio communications",
                "Emergency response, muster procedures, and incident escalation",
                "Formal written compliance and knowledge evaluation"
            ]
        }
    ];
    for (const data of lmsData_1.lmsSeedData) {
        console.log(`[Seeding] Processing certification: ${data.certificationName}`);
        // 1. CertificationType Model
        const certCode = data.certificationName.toUpperCase().replace(/\s+/g, '-');
        const [certType] = await models_1.CertificationType.findOrCreate({
            where: { name: data.certificationName },
            defaults: { code: certCode }
        });
        await certType.update({ code: certCode });
        // 2. Course Model (with contentUrl and syllabus JSON template)
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
                isPublished: true,
                contentUrl: defaultCourseManualUrl,
                syllabus: syllabusTemplate
            }
        });
        await course.update({
            code: courseCode,
            description: data.course.description,
            certificationTypeId: certType.id,
            format: data.course.format,
            price: data.course.price,
            capacity: data.course.capacity,
            isPublished: true,
            contentUrl: defaultCourseManualUrl,
            syllabus: syllabusTemplate
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
                        contentUrl: m.contentUrl !== undefined ? m.contentUrl : null
                    }
                });
                await mod.update({
                    content: m.content,
                    durationMinutes: m.durationMinutes,
                    contentType: m.contentType || 'TEXT',
                    contentUrl: m.contentUrl !== undefined ? m.contentUrl : null,
                    sequenceOrder: m.sequenceOrder
                });
            }
        }
        // 4. ExamConfig Model
        const [examConfig] = await models_1.ExamConfig.findOrCreate({
            where: { courseId: course.id },
            defaults: {
                passThreshold: data.course.examConfig?.passThreshold || 80,
                timeLimitMinutes: 60
            }
        });
        await examConfig.update({
            passThreshold: data.course.examConfig?.passThreshold || 80
        });
        // 5. ExamQuestion Model (Ensuring 35 questions per course)
        const all35Questions = (0, expandTo35Questions_1.ensure35Questions)(data.course.questions || [], data.course.title, courseCode);
        console.log(`[Seeding]   -> Seeding ${all35Questions.length} examination questions for ${data.certificationName}`);
        for (const q of all35Questions) {
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
        // 6. TicketCatalog Model
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
    console.log('[Seeding] LMS Data & Ticket Catalogs seeded successfully with 35 questions per ticket.');
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
    const { maca, minRes } = await seedEmployers();
    await seedWallet();
    await seedJobListings(maca, minRes);
    await seedLmsAndTickets();
    console.log('====================================================');
    console.log('Idempotent Seeding Completed Successfully!');
    console.log('====================================================');
}
if (require.main === module) {
    seedDatabase().then(() => {
        process.exit(0);
    }).catch(err => {
        console.error('Seeding failed:', err);
        process.exit(1);
    });
}
