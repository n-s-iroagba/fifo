import { sequelize, User, Employer, JoblistingEmployer, Wallet, ApplicantQualification, Experience, JobListing, Course } from '../models';

/**
 * Migration: Schema Updates for CHANGES.md
 * Ensures all columns and new tables exist on the database without failing if already present.
 */
export async function migrateSchemaUpdates(): Promise<void> {
    console.log('[Migration] Checking schema updates for CHANGES.md...');

    // 1. Ensure User columns exist
    const userColumns = [
        { name: 'rtoUsername', type: 'VARCHAR(255) NULL' },
        { name: 'rtoPassword', type: 'VARCHAR(255) NULL' },
        { name: 'testimonialConsent', type: 'BOOLEAN NOT NULL DEFAULT false' },
        { name: 'interviewDate', type: 'VARCHAR(255) NULL' },
        { name: 'interviewTime', type: 'VARCHAR(255) NULL' },
        { name: 'interviewLink', type: 'VARCHAR(255) NULL' },
        { name: 'canPickSchedule', type: 'BOOLEAN NOT NULL DEFAULT false' },
        { name: 'depositPaid', type: 'BOOLEAN NOT NULL DEFAULT false' },
        { name: 'depositPaidAt', type: 'DATETIME NULL' },
        { name: 'fullBalancePaid', type: 'BOOLEAN NOT NULL DEFAULT false' },
        { name: 'subsidyPercentage', type: 'INT NULL DEFAULT 70' }
    ];

    for (const col of userColumns) {
        try {
            await sequelize.query(`ALTER TABLE users ADD COLUMN \`${col.name}\` ${col.type};`);
            console.log(`[Migration] Added column ${col.name} to users table.`);
        } catch (e: any) {
            if (e.message?.includes('Duplicate column') || e.original?.code === 'ER_DUP_FIELDNAME') {
                // Already exists, ignore
            } else {
                console.log(`[Migration] Note on users.${col.name}:`, e.message);
            }
        }
    }

    // 2. Ensure JobListing columns exist
    try {
        await sequelize.query('ALTER TABLE job_listings ADD COLUMN `operationalManualUrl` TEXT NULL;');
        console.log('[Migration] Added operationalManualUrl column to job_listings table.');
    } catch (e: any) {
        if (!e.message?.includes('Duplicate column') && e.original?.code !== 'ER_DUP_FIELDNAME') {
            console.log('[Migration] Note on job_listings.operationalManualUrl:', e.message);
        }
    }

    // 3. Ensure Course columns exist
    try {
        await sequelize.query('ALTER TABLE courses ADD COLUMN `contentUrl` VARCHAR(500) NULL;');
        console.log('[Migration] Added contentUrl column to courses table.');
    } catch (e: any) {
        if (!e.message?.includes('Duplicate column') && e.original?.code !== 'ER_DUP_FIELDNAME') {
            console.log('[Migration] Note on courses.contentUrl:', e.message);
        }
    }

    try {
        await sequelize.query('ALTER TABLE courses ADD COLUMN `syllabus` JSON NULL;');
        console.log('[Migration] Added syllabus column to courses table.');
    } catch (e: any) {
        if (!e.message?.includes('Duplicate column') && e.original?.code !== 'ER_DUP_FIELDNAME') {
            console.log('[Migration] Note on courses.syllabus:', e.message);
        }
    }

    // 4. Sync new models if not yet synced
    try {
        await Employer.sync();
        await JoblistingEmployer.sync();
        await Wallet.sync();
        await ApplicantQualification.sync();
        await Experience.sync();
        console.log('[Migration] Synced new model tables successfully.');
    } catch (e: any) {
        console.log('[Migration] Note on syncing new tables:', e.message);
    }

    console.log('[Migration] Schema updates migration completed.');
}
