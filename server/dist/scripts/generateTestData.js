"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateAllTestData = generateAllTestData;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const docx_1 = require("docx");
const database_1 = require("../config/database");
const models_1 = require("../models");
const documentGenerator_1 = require("../utils/documentGenerator");
const emailTemplateGenerator_1 = require("../utils/emailTemplateGenerator");
async function generateAllTestData(applicationId = 53) {
    console.log(`[TestData] Connecting to DB and fetching Application #${applicationId}...`);
    await (0, database_1.connectDB)();
    const app = await models_1.Application.findByPk(applicationId, {
        include: [
            {
                model: models_1.User,
                include: [
                    { model: models_1.ApplicantQualification },
                    { model: models_1.Experience }
                ]
            },
            {
                model: models_1.JobListing,
                include: [{ model: models_1.Employer, as: 'Employers' }]
            },
            { model: models_1.JobStage, as: 'JobStages' },
            { model: models_1.Ticket, as: 'Tickets' }
        ]
    });
    if (!app) {
        throw new Error(`Application with ID ${applicationId} not found in database.`);
    }
    const appData = app.toJSON();
    const user = appData.User || {};
    const job = appData.JobListing || {};
    const tickets = (appData.Tickets || []).map((t) => ({
        ticketType: t.ticketType,
        description: t.description,
        status: t.status,
        mode: t.ticketType?.toLowerCase().includes('white card') ? 'Online Theory' : 'Online Theory + Practical Assessment'
    }));
    const candidateDocData = {
        applicantId: appData.id,
        fullName: user.fullName || 'Nnamdi Iroagba',
        email: user.email || 'niroagba022@uniport.edu.ng',
        phone: user.phoneNumber || '+2349038702607',
        address: `${user.address || 'Glasshouse, Ahoada East - West Road'}, ${user.city || 'Port Harcourt'}, ${user.countryOfResidence || 'Nigeria'}`,
        jobTitle: job.title || 'SITE ENGINEER – FIFO (PERTH, WA)',
        employerName: 'MACA LIMITED',
        interviewDate: user.interviewDate || 'Monday, 27 October 2026',
        interviewTime: user.interviewTime || '10:00 AM',
        interviewLink: user.interviewLink || 'https://zoom.us/j/8829102910',
        subsidyPercentage: user.subsidyPercentage || 70,
        amountAUD: 720.00,
        amountUSD: 468.00,
        walletAddress: 'TX7k9VwE3nQ9LmPzR4tY2uA1sD5fG8hJ0k',
        tickets: tickets
    };
    console.log(`[TestData] Target Candidate: ${candidateDocData.fullName} (${candidateDocData.email})`);
    console.log(`[TestData] Target Position: ${candidateDocData.jobTitle}`);
    // Create directories
    const baseDir = path_1.default.resolve(__dirname, '../../test_data');
    const mailsDir = path_1.default.join(baseDir, 'mails');
    const docsDir = path_1.default.join(baseDir, 'documents');
    fs_1.default.mkdirSync(mailsDir, { recursive: true });
    fs_1.default.mkdirSync(docsDir, { recursive: true });
    console.log(`[TestData] Created output directories:`);
    console.log(`  - ${mailsDir}`);
    console.log(`  - ${docsDir}`);
    // Clean up any obsolete email 07 file
    const oldMail07 = path_1.default.join(mailsDir, '07_Employer_Selection_filled_mail.docx');
    if (fs_1.default.existsSync(oldMail07)) {
        fs_1.default.unlinkSync(oldMail07);
    }
    // 1. Generate Emails in docx
    const emails = (0, emailTemplateGenerator_1.getAll23EmailDefinitions)(candidateDocData);
    console.log(`[TestData] Generating ${emails.length} emails in DOCX format...`);
    for (const emailDef of emails) {
        const doc = await (0, emailTemplateGenerator_1.generateEmailDocx)(emailDef);
        const buffer = await docx_1.Packer.toBuffer(doc);
        const safeName = emailDef.name.replace(/[^a-zA-Z0-9_\-]/g, '_');
        const numStr = typeof emailDef.number === 'number'
            ? String(emailDef.number).padStart(2, '0')
            : String(emailDef.number);
        const filename = `${numStr}_${safeName}.docx`;
        const filePath = path_1.default.join(mailsDir, filename);
        fs_1.default.writeFileSync(filePath, buffer);
        console.log(`  [Mail ${emailDef.number}/${emails.length}] Created ${filename}`);
    }
    // 2. Generate Documents in docx
    console.log(`[TestData] Generating documents in DOCX format...`);
    const docGenerators = [
        {
            name: '01_Employer_Selection_Form.docx',
            run: () => (0, documentGenerator_1.generateEmployerSelectionFormDocx)(candidateDocData)
        },
        {
            name: '01b_Employer_Selection_Form_MACA_Only.docx',
            run: () => (0, documentGenerator_1.generateEmployerSelectionFormDocx)({
                ...candidateDocData,
                onlyEmployingEmployer: true
            })
        },
        {
            name: '02_CertHero_Enrollment_Letter.docx',
            run: () => (0, documentGenerator_1.generateCertHeroEnrollmentLetterDocx)(candidateDocData)
        },
        {
            name: '03_Ticket_Sponsorship_Contract.docx',
            run: () => (0, documentGenerator_1.generateSponsorshipContractDocx)(candidateDocData)
        },
        {
            name: '04_Tax_Invoice.docx',
            run: () => (0, documentGenerator_1.generateTaxInvoiceDocx)(candidateDocData)
        },
        {
            name: '05_Official_Receipt.docx',
            run: () => (0, documentGenerator_1.generateOfficialReceiptDocx)(candidateDocData)
        },
        {
            name: '06_Competency_Ticket_Certificate.docx',
            run: () => (0, documentGenerator_1.generateTicketCertificateDocx)(candidateDocData)
        },
        {
            name: '07_MACA_Employee_Onboarding_Guide.docx',
            run: () => (0, documentGenerator_1.generateMacaOnboardingGuideDocx)({
                applicantName: candidateDocData.fullName,
                roleTitle: candidateDocData.jobTitle,
                interviewDate: candidateDocData.interviewDate,
                interviewTime: candidateDocData.interviewTime,
                interviewLink: candidateDocData.interviewLink
            })
        }
    ];
    for (const docItem of docGenerators) {
        const doc = await docItem.run();
        const buffer = await docx_1.Packer.toBuffer(doc);
        const filePath = path_1.default.join(docsDir, docItem.name);
        fs_1.default.writeFileSync(filePath, buffer);
        console.log(`  [Doc ${docItem.name}] Created successfully`);
    }
    console.log(`[TestData] Successfully generated all ${emails.length} emails and ${docGenerators.length} documents.`);
    return {
        mailsCount: emails.length,
        documentsCount: docGenerators.length,
        targetDir: baseDir
    };
}
if (require.main === module) {
    generateAllTestData(53)
        .then((res) => {
        console.log('Finished with result:', res);
        process.exit(0);
    })
        .catch((err) => {
        console.error('Failed generating test data:', err);
        process.exit(1);
    });
}
