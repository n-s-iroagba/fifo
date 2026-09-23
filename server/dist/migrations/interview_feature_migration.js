"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.migrateInterviewFeature = migrateInterviewFeature;
const models_1 = require("../models");
/**
 * Migration: Interview Management Feature
 * - Adds `canPickSchedule` to `users` table
 * - Creates `schedule_catalogues` table
 * - Creates `interviews` table
 */
async function migrateInterviewFeature() {
    console.log('[Migration] Running interview feature migration...');
    // 1. Add canPickSchedule to users table if missing
    try {
        await models_1.sequelize.query('ALTER TABLE users ADD COLUMN canPickSchedule BOOLEAN NOT NULL DEFAULT false;');
        console.log('[Migration] Added canPickSchedule column to users table.');
    }
    catch (e) {
        if (e.message?.includes('Duplicate column') || e.original?.code === 'ER_DUP_FIELDNAME') {
            console.log('[Migration] canPickSchedule column already exists on users.');
        }
        else {
            console.log('[Migration] Note on users.canPickSchedule:', e.message);
        }
    }
    // 2. Sync schedule_catalogues table
    try {
        await models_1.ScheduleCatalogue.sync();
        console.log('[Migration] schedule_catalogues table synced successfully.');
    }
    catch (e) {
        console.error('[Migration] Failed to sync schedule_catalogues table:', e.message);
    }
    // 3. Sync interviews table
    try {
        await models_1.Interview.sync();
        console.log('[Migration] interviews table synced successfully.');
    }
    catch (e) {
        console.error('[Migration] Failed to sync interviews table:', e.message);
    }
    console.log('[Migration] Interview feature migration completed.');
}
