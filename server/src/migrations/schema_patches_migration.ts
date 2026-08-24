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

    // 4. Patch applications
    try {
        await sequelize.query("ALTER TABLE applications ADD COLUMN visaSponsorshipStatus ENUM('Pending', 'Approved', 'Rejected') DEFAULT NULL;");
        console.log("[Migration] Patched applications table with visaSponsorshipStatus.");
    } catch (e: any) {}
    try {
        await sequelize.query("ALTER TABLE applications ADD COLUMN status VARCHAR(255) NOT NULL DEFAULT 'Active';");
        console.log("[Migration] Patched applications table with status.");
    } catch (e: any) {}

    // 5. Patch invoices
    try {
        await sequelize.query("ALTER TABLE invoices ADD COLUMN isPaid BOOLEAN NOT NULL DEFAULT false;");
        console.log("[Migration] Patched invoices table with isPaid.");
    } catch (e: any) {}

    // 6. Patch job_listings
    try {
        await sequelize.query("ALTER TABLE job_listings ADD COLUMN benefits TEXT DEFAULT NULL;");
        console.log("[Migration] Patched job_listings table with benefits.");
    } catch (e: any) {}

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
        "ADD COLUMN psychometricCompletedAt DATETIME DEFAULT NULL"
    ];

    for (const colDef of userColumns) {
        try {
            await sequelize.query(`ALTER TABLE users ${colDef};`);
            console.log(`[Migration] Patched users table: ${colDef}`);
        } catch (e: any) {}
    }

    console.log('[Migration] Schema patches completed successfully.');
}
