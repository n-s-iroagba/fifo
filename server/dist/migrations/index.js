"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runAllMigrations = runAllMigrations;
const course_format_migration_1 = require("./course_format_migration");
const schema_patches_migration_1 = require("./schema_patches_migration");
const accounting_migration_1 = require("./accounting_migration");
const payment_milestone_migration_1 = require("./payment_milestone_migration");
const apex_network_migration_1 = require("./apex_network_migration");
const lms_deduplication_migration_1 = require("./lms_deduplication_migration");
/**
 * Runs all database migrations cleanly in execution order.
 */
async function runAllMigrations() {
    console.log('====================================================');
    console.log('[Migrations] Starting All Database Migrations...');
    console.log('====================================================');
    await (0, course_format_migration_1.migrateCourseFormatEnum)();
    await (0, schema_patches_migration_1.runSchemaPatches)();
    await (0, accounting_migration_1.migrateAccountingAndSubsidy)();
    await (0, payment_milestone_migration_1.migratePaymentMilestone)();
    await (0, apex_network_migration_1.migrateApexNetwork)();
    await (0, lms_deduplication_migration_1.runLmsDeduplication)();
    console.log('====================================================');
    console.log('[Migrations] All Migrations Completed Successfully!');
    console.log('====================================================');
}
