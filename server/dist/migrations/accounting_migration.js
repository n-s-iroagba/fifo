"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.migrateAccountingAndSubsidy = migrateAccountingAndSubsidy;
const database_1 = require("../config/database");
async function migrateAccountingAndSubsidy() {
    try {
        console.log('Starting Accounting & Subsidy migration...');
        // 1. Add subsidyPercentage to users table
        try {
            await database_1.sequelize.query('ALTER TABLE users ADD COLUMN subsidyPercentage INT DEFAULT 70;');
            console.log('Added subsidyPercentage to users table.');
        }
        catch (e) {
            // Ignore if column already exists
            if (e.message.includes('Duplicate column name')) {
                console.log('subsidyPercentage column already exists in users table.');
            }
            else {
                console.error('Error adding subsidyPercentage:', e.message);
            }
        }
        // 2. Create invoices table
        await database_1.sequelize.query(`
            CREATE TABLE IF NOT EXISTS invoices (
                id INT AUTO_INCREMENT PRIMARY KEY,
                applicantId INT NOT NULL,
                purpose ENUM('aveling-partial', 'aveling-complete-after-partial', 'aveling-complete', 'second-attempt', 'shipping') NOT NULL,
                amountInUSD FLOAT NOT NULL,
                date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                receiptProofSubmission DATETIME NULL,
                createdAt DATETIME NOT NULL,
                updatedAt DATETIME NOT NULL,
                FOREIGN KEY (applicantId) REFERENCES users(id) ON DELETE CASCADE
            ) ENGINE=InnoDB;
        `);
        console.log('Invoices table ensured.');
        // 3. Create receipts table
        await database_1.sequelize.query(`
            CREATE TABLE IF NOT EXISTS receipts (
                id INT AUTO_INCREMENT PRIMARY KEY,
                invoiceId INT NOT NULL,
                amountPaid FLOAT NOT NULL,
                createdAt DATETIME NOT NULL,
                updatedAt DATETIME NOT NULL,
                FOREIGN KEY (invoiceId) REFERENCES invoices(id) ON DELETE CASCADE
            ) ENGINE=InnoDB;
        `);
        console.log('Receipts table ensured.');
        // 4. Drop old tables safely
        try {
            await database_1.sequelize.query('DROP TABLE IF EXISTS course_subsidies;');
            console.log('course_subsidies table dropped.');
        }
        catch (e) {
            console.log('Error dropping course_subsidies:', e.message);
        }
        try {
            await database_1.sequelize.query('DROP TABLE IF EXISTS payments;');
            console.log('payments table dropped.');
        }
        catch (e) {
            console.log('Error dropping payments:', e.message);
        }
        console.log('Accounting & Subsidy migration completed successfully.');
    }
    catch (error) {
        console.error('Migration failed:', error);
    }
}
