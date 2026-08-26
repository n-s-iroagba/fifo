import { migrateCourseFormatEnum } from './course_format_migration';
import { runSchemaPatches } from './schema_patches_migration';
import { migrateAccountingAndSubsidy } from './accounting_migration';
import { migratePaymentMilestone } from './payment_milestone_migration';
import { runLmsDeduplication } from './lms_deduplication_migration';

/**
 * Runs all database migrations cleanly in execution order.
 */
export async function runAllMigrations(): Promise<void> {
    console.log('====================================================');
    console.log('[Migrations] Starting All Database Migrations...');
    console.log('====================================================');

    await migrateCourseFormatEnum();
    await runSchemaPatches();
    await migrateAccountingAndSubsidy();
    await migratePaymentMilestone();
    await runLmsDeduplication();

    console.log('====================================================');
    console.log('[Migrations] All Migrations Completed Successfully!');
    console.log('====================================================');
}
