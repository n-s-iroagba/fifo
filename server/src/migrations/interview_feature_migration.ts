import { sequelize, ScheduleCatalogue, Interview } from '../models';

/**
 * Migration: Interview Management Feature
 * - Adds `canPickSchedule` to `users` table
 * - Creates `schedule_catalogues` table
 * - Creates `interviews` table
 */
export async function migrateInterviewFeature(): Promise<void> {
    console.log('[Migration] Running interview feature migration...');

    // 1. Add canPickSchedule to users table if missing
    try {
        await sequelize.query('ALTER TABLE users ADD COLUMN canPickSchedule BOOLEAN NOT NULL DEFAULT false;');
        console.log('[Migration] Added canPickSchedule column to users table.');
    } catch (e: any) {
        if (e.message?.includes('Duplicate column') || e.original?.code === 'ER_DUP_FIELDNAME') {
            console.log('[Migration] canPickSchedule column already exists on users.');
        } else {
            console.log('[Migration] Note on users.canPickSchedule:', e.message);
        }
    }

    // 2. Sync schedule_catalogues table
    try {
        await ScheduleCatalogue.sync();
        console.log('[Migration] schedule_catalogues table synced successfully.');
    } catch (e: any) {
        console.error('[Migration] Failed to sync schedule_catalogues table:', e.message);
    }

    // 3. Sync interviews table
    try {
        await Interview.sync();
        console.log('[Migration] interviews table synced successfully.');
    } catch (e: any) {
        console.error('[Migration] Failed to sync interviews table:', e.message);
    }

    console.log('[Migration] Interview feature migration completed.');
}
