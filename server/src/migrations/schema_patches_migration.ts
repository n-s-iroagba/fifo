import { sequelize, BankAccount } from '../models';

/**
 * Migration: Schema Patches & Table Synchronizations
 * Safely applies missing columns and table schemas without destroying production data.
 */
export async function runSchemaPatches(): Promise<void> {
    console.log('[Migration] Running schema patches and table synchronizations...');

    // 1. Recreate bank_accounts table for USDT crypto wallet schema
    try {
        console.log('[Migration] Syncing bank_accounts table...');
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
        await BankAccount.sync({ force: true });
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
        console.log('[Migration] bank_accounts synced.');
    } catch (e: any) {
        console.error('[Migration] Failed to sync bank_accounts:', e.message);
    }

    // 2. Safe Non-Destructive Production Model Sync (CREATE TABLE IF NOT EXISTS)
    const excludedModels = ['User', 'Application', 'LmsCredential', 'BankAccount'];
    for (const modelName of Object.keys(sequelize.models)) {
        if (!excludedModels.includes(modelName)) {
            try {
                await sequelize.models[modelName].sync();
            } catch (e: any) {
                console.error(`[Migration] Error syncing model ${modelName}:`, e.message);
            }
        }
    }

    // 3. Patch course_modules
    try {
        await sequelize.query("ALTER TABLE course_modules ADD COLUMN content TEXT DEFAULT NULL;");
        console.log("[Migration] Patched course_modules table with content.");
    } catch (e: any) {}
    try {
        await sequelize.query("ALTER TABLE course_modules ADD COLUMN duration_minutes INTEGER DEFAULT 30;");
        console.log("[Migration] Patched course_modules table with durationMinutes.");
    } catch (e: any) {}
    try {
        await sequelize.query("ALTER TABLE course_modules MODIFY COLUMN content_url VARCHAR(255) NULL;");
        console.log("[Migration] Patched course_modules table content_url to allow NULL.");
    } catch (e: any) {}

    // 4. Patch applications
    try {
        await sequelize.query("ALTER TABLE applications ADD COLUMN visaSponsorshipStatus ENUM('Pending', 'Approved', 'Rejected') DEFAULT NULL;");
        console.log("[Migration] Patched applications table with visaSponsorshipStatus.");
    } catch (e: any) {}
    try {
        await sequelize.query("ALTER TABLE applications ADD COLUMN status VARCHAR(255) NOT NULL DEFAULT 'Active';");
        console.log("[Migration] Patched applications table with status.");
    } catch (e: any) {}
    try {
        await sequelize.query("ALTER TABLE applications ADD COLUMN sponsorshipCallEmailSent BOOLEAN NOT NULL DEFAULT false;");
        console.log("[Migration] Patched applications table with sponsorshipCallEmailSent.");
    } catch (e: any) {}
    try {
        await sequelize.query("ALTER TABLE applications ADD COLUMN sponsorshipCallEmailSentAt DATETIME DEFAULT NULL;");
        console.log("[Migration] Patched applications table with sponsorshipCallEmailSentAt.");
    } catch (e: any) {}
    try {
        await sequelize.query("ALTER TABLE applications ADD COLUMN employerSelectionEmailSent BOOLEAN NOT NULL DEFAULT false;");
        console.log("[Migration] Patched applications table with employerSelectionEmailSent.");
    } catch (e: any) {}
    try {
        await sequelize.query("ALTER TABLE applications ADD COLUMN employerSelectionEmailSentAt DATETIME DEFAULT NULL;");
        console.log("[Migration] Patched applications table with employerSelectionEmailSentAt.");
    } catch (e: any) {}

    // 5. Patch invoices
    try {
        await sequelize.query("ALTER TABLE invoices ADD COLUMN isPaid BOOLEAN NOT NULL DEFAULT false;");
        console.log("[Migration] Patched invoices table with isPaid.");
    } catch (e: any) {}
    try {
        await sequelize.query("ALTER TABLE invoices ADD COLUMN walletAddress VARCHAR(255) DEFAULT NULL;");
        console.log("[Migration] Patched invoices table with walletAddress.");
    } catch (e: any) {}
    try {
        await sequelize.query(
            "ALTER TABLE invoices MODIFY COLUMN purpose ENUM('aveling-partial','aveling-complete-after-partial','aveling-complete','second-attempt','shipping','visa-blue-collar') NOT NULL;"
        );
        console.log("[Migration] Patched invoices.purpose ENUM to include visa-blue-collar.");
    } catch (e: any) { console.error("[Migration] Failed to patch invoices purpose ENUM:", e.message); }

    // 6. Patch job_listings
    try {
        await sequelize.query("ALTER TABLE job_listings ADD COLUMN benefits TEXT DEFAULT NULL;");
        console.log("[Migration] Patched job_listings table with benefits.");
    } catch (e: any) {}
    try {
        await sequelize.query("ALTER TABLE job_listings ADD COLUMN operationalManualUrl VARCHAR(255) DEFAULT NULL;");
        console.log("[Migration] Patched job_listings table with operationalManualUrl.");
    } catch (e: any) {}

    // Patch courses table with contentUrl and syllabus
    try {
        await sequelize.query("ALTER TABLE courses ADD COLUMN content_url VARCHAR(255) DEFAULT NULL;");
        console.log("[Migration] Patched courses table with content_url.");
    } catch (e: any) {}
    try {
        await sequelize.query("ALTER TABLE courses ADD COLUMN contentUrl VARCHAR(255) DEFAULT NULL;");
        console.log("[Migration] Patched courses table with contentUrl.");
    } catch (e: any) {}
    try {
        await sequelize.query("ALTER TABLE courses ADD COLUMN syllabus JSON DEFAULT NULL;");
        console.log("[Migration] Patched courses table with syllabus.");
    } catch (e: any) {}

    // Patch tickets table with ticketCatalogId
    try {
        await sequelize.query("ALTER TABLE tickets ADD COLUMN ticket_catalog_id INT DEFAULT NULL;");
        console.log("[Migration] Patched tickets table with ticket_catalog_id.");
    } catch (e: any) {}
    try {
        await sequelize.query("ALTER TABLE tickets ADD COLUMN ticketCatalogId INT DEFAULT NULL;");
        console.log("[Migration] Patched tickets table with ticketCatalogId.");
    } catch (e: any) {}

    // Patch invoices with amountInAUD and paymentStatus
    try {
        await sequelize.query("ALTER TABLE invoices ADD COLUMN amountInAUD DECIMAL(10,2) DEFAULT NULL;");
        console.log("[Migration] Patched invoices table with amountInAUD.");
    } catch (e: any) {}
    try {
        await sequelize.query("ALTER TABLE invoices ADD COLUMN paymentStatus ENUM('unpaid', 'half_paid', 'paid') DEFAULT 'unpaid';");
        console.log("[Migration] Patched invoices table with paymentStatus.");
    } catch (e: any) {}

    // Ensure employers, joblisting_employers, wallets tables exist
    try {
        if (sequelize.models.Employer) await sequelize.models.Employer.sync();
        if (sequelize.models.JoblistingEmployer) await sequelize.models.JoblistingEmployer.sync();
        if (sequelize.models.Wallet) await sequelize.models.Wallet.sync();
        console.log("[Migration] Synced Employer, JoblistingEmployer, and Wallet tables.");
    } catch (e: any) {
        console.error("[Migration] Failed syncing new models:", e.message);
    }

    // 7. Patch job_stages table with missing columns if it was created by an older schema
    const jobStageColumns = [
        "ADD COLUMN name VARCHAR(255) DEFAULT 'Application'",
        "ADD COLUMN status VARCHAR(255) DEFAULT 'pending'",
        "ADD COLUMN isCompleted BOOLEAN DEFAULT false",
        "ADD COLUMN sequenceOrder INTEGER DEFAULT 1",
        "ADD COLUMN orderPosition INTEGER DEFAULT 1"
    ];

    for (const colDef of jobStageColumns) {
        try {
            await sequelize.query(`ALTER TABLE job_stages ${colDef};`);
            console.log(`[Migration] Patched job_stages table: ${colDef}`);
        } catch (e: any) {}
    }

    try {
        await sequelize.query("ALTER TABLE job_stages MODIFY COLUMN orderPosition INT DEFAULT 1 NULL;");
        console.log("[Migration] Patched job_stages table: MODIFY COLUMN orderPosition.");
    } catch (e: any) {}

    try {
        await sequelize.query("ALTER TABLE job_stages MODIFY COLUMN prefillStageId INT DEFAULT NULL;");
        console.log("[Migration] Modified prefillStageId on job_stages to be nullable.");
    } catch (e: any) {
        console.error("[Migration] Failed to modify prefillStageId:", e.message);
    }

    // Patch nominations table
    try {
        await sequelize.query("ALTER TABLE nominations ADD COLUMN adminDocumentUrl VARCHAR(255) DEFAULT NULL;");
        console.log("[Migration] Patched nominations table with adminDocumentUrl.");
    } catch (e: any) {}
    try {
        await sequelize.query("ALTER TABLE nominations ADD COLUMN documentUrl VARCHAR(255) DEFAULT NULL;");
        console.log("[Migration] Patched nominations table with documentUrl.");
    } catch (e: any) {}
    try {
        await sequelize.query("ALTER TABLE nominations ADD COLUMN status VARCHAR(255) DEFAULT 'pending';");
        console.log("[Migration] Patched nominations table with status.");
    } catch (e: any) {}

    // Patch contracts table
    try {
        await sequelize.query("ALTER TABLE contracts ADD COLUMN adminDocumentUrl VARCHAR(255) DEFAULT NULL;");
        console.log("[Migration] Patched contracts table with adminDocumentUrl.");
    } catch (e: any) {}
    try {
        await sequelize.query("ALTER TABLE contracts ADD COLUMN documentUrl VARCHAR(255) DEFAULT NULL;");
        console.log("[Migration] Patched contracts table with documentUrl.");
    } catch (e: any) {}




    try {
        await sequelize.query("ALTER TABLE contracts ADD COLUMN sponsorshipId VARCHAR(255) DEFAULT NULL;");
        console.log("[Migration] Patched contracts table with sponsorshipId.");
    } catch (e: any) {}
    try {
        await sequelize.query("ALTER TABLE applications ADD COLUMN sponsorshipId VARCHAR(255) DEFAULT NULL;");
        console.log("[Migration] Patched applications table with sponsorshipId.");
    } catch (e: any) {}

    // Patch interviews table
    const interviewColumns = [
        "ADD COLUMN interviewDate VARCHAR(255) DEFAULT NULL",
        "ADD COLUMN interviewTime VARCHAR(255) DEFAULT NULL",
        "ADD COLUMN timezone VARCHAR(255) DEFAULT 'AWST (UTC+8)'",
        "ADD COLUMN interviewUrl VARCHAR(255) DEFAULT NULL",
        "ADD COLUMN meetingLink VARCHAR(255) DEFAULT NULL",
        "ADD COLUMN overview TEXT DEFAULT NULL",
        "ADD COLUMN interviewEmailSentAt DATETIME DEFAULT NULL",
        "ADD COLUMN onboardingEmailSentAt DATETIME DEFAULT NULL",
        "ADD COLUMN onboardingEmailSent BOOLEAN NOT NULL DEFAULT false"
    ];

    for (const colDef of interviewColumns) {
        try {
            await sequelize.query(`ALTER TABLE interviews ${colDef};`);
            console.log(`[Migration] Patched interviews table: ${colDef}`);
        } catch (e: any) {}
    }

    try {
        await sequelize.query("ALTER TABLE interviews MODIFY COLUMN scheduleCatalogueId INT NULL DEFAULT NULL;");
        console.log("[Migration] Patched interviews table: scheduleCatalogueId NULL.");
    } catch (e: any) {}
    try {
        await sequelize.query("ALTER TABLE interviews MODIFY COLUMN schedule_catalogue_id INT NULL DEFAULT NULL;");
        console.log("[Migration] Patched interviews table: schedule_catalogue_id NULL.");
    } catch (e: any) {}

    // 8. Drop sponsorshipPrice from ticket_catalogs
    try {
        await sequelize.query("ALTER TABLE ticket_catalogs DROP COLUMN sponsorshipPrice;");
        console.log("[Migration] Dropped sponsorshipPrice column from ticket_catalogs.");
    } catch (e: any) {}

    // 9. Patch users table with missing columns
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
        "ADD COLUMN psychometricCompletedAt DATETIME DEFAULT NULL",
        "ADD COLUMN interviewDate VARCHAR(255) DEFAULT NULL",
        "ADD COLUMN interviewTime VARCHAR(255) DEFAULT NULL",
        "ADD COLUMN interviewLink VARCHAR(255) DEFAULT NULL",
        "ADD COLUMN onboardingEmailSent BOOLEAN NOT NULL DEFAULT false",
        "ADD COLUMN onboardingEmailSentAt DATETIME DEFAULT NULL",
        "ADD COLUMN sponsorshipCallEmailSent BOOLEAN NOT NULL DEFAULT false",
        "ADD COLUMN sponsorshipCallEmailSentAt DATETIME DEFAULT NULL",
        "ADD COLUMN sponsorshipRefundEmailSent BOOLEAN NOT NULL DEFAULT false",
        "ADD COLUMN sponsorshipRefundEmailSentAt DATETIME DEFAULT NULL",
        "ADD COLUMN sponsorshipApprovedEmailSent BOOLEAN NOT NULL DEFAULT false",
        "ADD COLUMN sponsorshipApprovedEmailSentAt DATETIME DEFAULT NULL",
        "ADD COLUMN hasLoggedIn BOOLEAN NOT NULL DEFAULT false",
        "ADD COLUMN firstLoginAt DATETIME DEFAULT NULL",
        "ADD COLUMN employerSelectionEmailSent BOOLEAN NOT NULL DEFAULT false",
        "ADD COLUMN employerSelectionEmailSentAt DATETIME DEFAULT NULL"
    ];

    for (const colDef of userColumns) {
        try {
            await sequelize.query(`ALTER TABLE users ${colDef};`);
            console.log(`[Migration] Patched users table: ${colDef}`);
        } catch (e: any) {}
    }

    console.log('[Migration] Schema patches completed successfully.');
}
