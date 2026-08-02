"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.migrateApexNetwork = migrateApexNetwork;
const database_1 = require("../config/database");
async function migrateApexNetwork() {
    console.log('--- Initializing Apex Network Migration Sequence ---');
    // 1. Update users Table
    try {
        await database_1.sequelize.query('ALTER TABLE users ADD COLUMN isApexMember TINYINT(1) DEFAULT 0;');
        await database_1.sequelize.query("ALTER TABLE users ADD COLUMN apexStatus VARCHAR(255) DEFAULT 'NONE';");
        await database_1.sequelize.query('ALTER TABLE users ADD COLUMN countryOfResidence VARCHAR(255);');
        await database_1.sequelize.query('ALTER TABLE users ADD COLUMN languages JSON;');
        console.log('[SUCCESS] users table updated with Apex metadata.');
    }
    catch (e) {
        if (e.message.includes("Duplicate column name")) {
            console.log('[INFO] users table already contains Apex metadata.');
        }
        else {
            console.error('[ERROR] Failed to update users table:', e.message);
        }
    }
    // 2. Update job_listings Table
    try {
        await database_1.sequelize.query("ALTER TABLE job_listings ADD COLUMN jobType VARCHAR(255) DEFAULT 'NORMAL';");
        console.log('[SUCCESS] job_listings table updated with jobType.');
    }
    catch (e) {
        if (e.message.includes("Duplicate column name")) {
            console.log('[INFO] job_listings table already contains jobType.');
        }
        else {
            console.error('[ERROR] Failed to update job_listings table:', e.message);
        }
    }
    // 3. Update job_stages Table
    try {
        await database_1.sequelize.query("ALTER TABLE job_stages ADD COLUMN feeType VARCHAR(255) DEFAULT 'NONE';");
        await database_1.sequelize.query('ALTER TABLE job_stages ADD COLUMN refundMessage TEXT;');
        console.log('[SUCCESS] job_stages table updated with feeType/refundMessage.');
    }
    catch (e) {
        if (e.message.includes("Duplicate column name")) {
            console.log('[INFO] job_stages table already contains fee/refund metadata.');
        }
        else {
            console.error('[ERROR] Failed to update job_stages table:', e.message);
        }
    }
    // 4. Create interests Table
    try {
        await database_1.sequelize.query(`
            CREATE TABLE IF NOT EXISTS interests (
                id INT AUTO_INCREMENT PRIMARY KEY,
                userId INT NOT NULL,
                roles JSON,
                skills JSON,
                qualifications JSON,
                experience JSON,
                createdAt DATETIME NOT NULL,
                updatedAt DATETIME NOT NULL,
                FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
            ) ENGINE=InnoDB;
        `);
        console.log('[SUCCESS] interests table synchronized.');
    }
    catch (e) {
        console.error('[ERROR] Failed to create interests table:', e.message);
    }
    console.log('--- Apex Network Migration Sequence Completed ---');
}
