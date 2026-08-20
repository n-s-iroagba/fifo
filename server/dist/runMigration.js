"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.run = run;
const database_1 = require("./config/database");
const apex_network_migration_1 = require("./migrations/apex_network_migration");
const payment_milestone_migration_1 = require("./migrations/payment_milestone_migration");
const accounting_migration_1 = require("./migrations/accounting_migration");
async function run() {
    // Existing migrations...
    try {
        await database_1.sequelize.query('ALTER TABLE crypto_wallets MODIFY COLUMN currencyName VARCHAR(255);');
        await database_1.sequelize.query('ALTER TABLE crypto_wallets MODIFY COLUMN networkType VARCHAR(255);');
        console.log('Relaxed ENUM constraints in crypto_wallets');
    }
    catch (e) {
        console.error('Error relaxing crypto constraints:', e.message);
    }
    // New Apex Network Migration
    await (0, apex_network_migration_1.migrateApexNetwork)();
    // Payment Milestone Gate (Schedule 1 / Clause 5.1)
    await (0, payment_milestone_migration_1.migratePaymentMilestone)();
    // Accounting & Subsidy
    await (0, accounting_migration_1.migrateAccountingAndSubsidy)();
}
