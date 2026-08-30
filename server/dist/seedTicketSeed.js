"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedOnlineTickets = seedOnlineTickets;
const models_1 = require("./models");
const seedData = [
    {
        certificationName: 'RIIHAN301E Operate elevating work platform',
        description: 'Operate boom-type elevating work platforms (under 11m)',
        code: 'RIIHAN301E',
        format: 'Mixed',
        price: 250.00
    },
    {
        certificationName: 'UEE30820 Cert III in Electrotechnology',
        description: 'Foundational trade qualification for electricians',
        code: 'UEE30820',
        format: 'Mixed',
        price: 4500.00
    },
    {
        certificationName: 'UETDRMP006 Low Voltage Rescue (LVR)',
        description: 'Mandatory safety requirement for working near energized equipment',
        code: 'UETDRMP006',
        format: 'Mixed',
        price: 150.00
    },
    {
        certificationName: 'UEECD0007 EEHA (Hazardous Areas)',
        description: 'Essential for processing plants and explosive gas/dust environments',
        code: 'UEECD0007',
        format: 'Mixed',
        price: 1850.00
    },
    {
        certificationName: 'UETDRMP007 HV Switching Ticket',
        description: 'Safely isolate and operate high-voltage distribution networks',
        code: 'UETDRMP007',
        format: 'Mixed',
        price: 1200.00
    },
    {
        certificationName: 'UEE40420 Cert IV Electrical Instrumentation',
        description: 'PLC, SCADA, calibration, and loop tuning for processing plants',
        code: 'UEE40420',
        format: 'Mixed',
        price: 3200.00
    },
    {
        certificationName: 'HV Electrician Course',
        description: 'Specialized upskilling for electric-drive haul trucks (e.g., Komatsu/CAT)',
        code: 'HVELEC',
        format: 'Mixed',
        price: 900.00
    },
    {
        certificationName: 'AUR20220 Air Conditioning Licence',
        description: 'ARC-issued licence for maintaining cabin HVAC systems',
        code: 'AUR20220',
        format: 'Mixed',
        price: 850.00
    }
];
async function seedOnlineTickets() {
    console.log('[Seeding] Seeding online tickets from ticketseed.md...');
    for (const data of seedData) {
        const certCode = data.code;
        const [certType] = await models_1.CertificationType.findOrCreate({
            where: { code: certCode },
            defaults: { name: data.certificationName, code: certCode }
        });
        const courseCode = data.code;
        const [course] = await models_1.Course.findOrCreate({
            where: { code: courseCode },
            defaults: {
                title: data.certificationName,
                code: courseCode,
                description: data.description,
                certificationTypeId: certType.id,
                format: data.format,
                price: data.price,
                capacity: 20,
                isPublished: true
            }
        });
        // Seed basic module
        await models_1.CourseModule.findOrCreate({
            where: { courseId: course.id, sequenceOrder: 1 },
            defaults: {
                title: `${data.code} Online Theory`,
                durationMinutes: 60,
                sequenceOrder: 1,
                content: `Comprehensive online theory module for ${data.certificationName}.`,
                contentType: 'TEXT',
                contentUrl: 'local-content'
            }
        });
        // Exam Config
        await models_1.ExamConfig.findOrCreate({
            where: { courseId: course.id },
            defaults: {
                passThreshold: 80,
                timeLimitMinutes: 60,
                maxAttempts: 2
            }
        });
        // Questions
        const sampleQuestions = [
            {
                questionText: `What is the primary objective of the ${data.code} certification?`,
                questionType: 'mcq',
                options: [
                    'Ensure safety and compliance',
                    'Increase speed of work',
                    'Reduce required paperwork',
                    'Bypass site inductions'
                ],
                correctOptionIndex: 0,
                weight: 10
            },
            {
                questionText: `Identify a hazard relevant to ${data.certificationName}.`,
                questionType: 'mcq',
                options: [
                    'Slippery surfaces',
                    'Excessive noise',
                    'Poor lighting',
                    'All of the above'
                ],
                correctOptionIndex: 3,
                weight: 10
            }
        ];
        for (const q of sampleQuestions) {
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
        // Ticket Catalog
        await models_1.TicketCatalog.findOrCreate({
            where: { name: data.certificationName },
            defaults: {
                normalPrice: data.price,
                description: `${data.description} Unit code: ${course.code}.`
            }
        });
    }
    console.log('[Seeding] Online tickets seeded successfully.');
}
if (require.main === module) {
    seedOnlineTickets().then(() => {
        console.log('Done seeding ticketseed data.');
        process.exit(0);
    }).catch(err => {
        console.error('Seeding failed:', err);
        process.exit(1);
    });
}
