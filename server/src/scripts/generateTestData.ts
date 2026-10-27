import fs from 'fs';
import path from 'path';
import { Packer } from 'docx';
import { connectDB, sequelize } from '../config/database';
import { 
    Application, User, JobListing, JobStage, Ticket, 
    ApplicantQualification, Experience, Employer
} from '../models';
import { 
    ApplicantDocData,
    generateEmployerSelectionFormDocx,
    generateCertHeroEnrollmentLetterDocx,
    generateSponsorshipContractDocx,
    generateTaxInvoiceDocx,
    generateOfficialReceiptDocx,
    generateTicketCertificateDocx,
    generateMacaOnboardingGuideDocx
} from '../utils/documentGenerator';
import { getAll23EmailDefinitions, generateEmailDocx } from '../utils/emailTemplateGenerator';

export async function generateAllTestData(applicationId: number = 53): Promise<{
    mailsCount: number;
    documentsCount: number;
    targetDir: string;
}> {
    console.log(`[TestData] Connecting to DB and fetching Application #${applicationId}...`);
    await connectDB();

    const app = await Application.findByPk(applicationId, {
        include: [
            { 
                model: User,
                include: [
                    { model: ApplicantQualification },
                    { model: Experience }
                ]
            },
            { 
                model: JobListing,
                include: [{ model: Employer, as: 'Employers' }]
            },
            { model: JobStage, as: 'JobStages' },
            { model: Ticket, as: 'Tickets' }
        ]
    });

    if (!app) {
        throw new Error(`Application with ID ${applicationId} not found in database.`);
    }

    const appData = app.toJSON();
    const user = appData.User || {};
    const job = appData.JobListing || {};
    const tickets = (appData.Tickets || []).map((t: any) => ({
        ticketType: t.ticketType,
        description: t.description,
        status: t.status,
        mode: t.ticketType?.toLowerCase().includes('white card') ? 'Online Theory' : 'Online Theory + Practical Assessment'
    }));

    const candidateDocData: ApplicantDocData = {
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
    const baseDir = path.resolve(__dirname, '../../test_data');
    const mailsDir = path.join(baseDir, 'mails');
    const docsDir = path.join(baseDir, 'documents');

    fs.mkdirSync(mailsDir, { recursive: true });
    fs.mkdirSync(docsDir, { recursive: true });

    console.log(`[TestData] Created output directories:`);
    console.log(`  - ${mailsDir}`);
    console.log(`  - ${docsDir}`);

    // Clean up any obsolete email 07 file
    const oldMail07 = path.join(mailsDir, '07_Employer_Selection_filled_mail.docx');
    if (fs.existsSync(oldMail07)) {
        fs.unlinkSync(oldMail07);
    }

    // 1. Generate Emails in docx
    const emails = getAll23EmailDefinitions(candidateDocData);
    console.log(`[TestData] Generating ${emails.length} emails in DOCX format...`);

    for (const emailDef of emails) {
        const doc = await generateEmailDocx(emailDef);
        const buffer = await Packer.toBuffer(doc);
        const safeName = emailDef.name.replace(/[^a-zA-Z0-9_\-]/g, '_');
        const numStr = typeof emailDef.number === 'number' 
            ? String(emailDef.number).padStart(2, '0') 
            : String(emailDef.number);
        const filename = `${numStr}_${safeName}.docx`;
        const filePath = path.join(mailsDir, filename);
        fs.writeFileSync(filePath, buffer);
        console.log(`  [Mail ${emailDef.number}/${emails.length}] Created ${filename}`);
    }

    // 2. Generate Documents in docx
    console.log(`[TestData] Generating documents in DOCX format...`);
    const docGenerators: { name: string; run: () => Promise<any> }[] = [
        {
            name: '01_Employer_Selection_Form.docx',
            run: () => generateEmployerSelectionFormDocx(candidateDocData)
        },
        {
            name: '01b_Employer_Selection_Form_MACA_Only.docx',
            run: () => generateEmployerSelectionFormDocx({
                ...candidateDocData,
                onlyEmployingEmployer: true
            })
        },
        {
            name: '02_CertHero_Enrollment_Letter.docx',
            run: () => generateCertHeroEnrollmentLetterDocx(candidateDocData)
        },
        {
            name: '03_Ticket_Sponsorship_Contract.docx',
            run: () => generateSponsorshipContractDocx(candidateDocData)
        },
        {
            name: '04_Tax_Invoice.docx',
            run: () => generateTaxInvoiceDocx(candidateDocData)
        },
        {
            name: '05_Official_Receipt.docx',
            run: () => generateOfficialReceiptDocx(candidateDocData)
        },
        {
            name: '06_Competency_Ticket_Certificate.docx',
            run: () => generateTicketCertificateDocx(candidateDocData)
        },
        {
            name: '07_MACA_Employee_Onboarding_Guide.docx',
            run: () => generateMacaOnboardingGuideDocx({
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
        const buffer = await Packer.toBuffer(doc);
        const filePath = path.join(docsDir, docItem.name);
        fs.writeFileSync(filePath, buffer);
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
