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
    // 1. Add canPickSchedule & interview tracking to users table if missing
    const userQueries = [
        'ALTER TABLE users ADD COLUMN canPickSchedule BOOLEAN NOT NULL DEFAULT false;',
        'ALTER TABLE users ADD COLUMN interviewEmailSentAt DATETIME NULL;',
        'ALTER TABLE users ADD COLUMN onboardingEmailSentAt DATETIME NULL;',
        'ALTER TABLE users ADD COLUMN onboardingEmailSent BOOLEAN NOT NULL DEFAULT false;'
    ];
    for (const q of userQueries) {
        try {
            await models_1.sequelize.query(q);
        }
        catch (e) {
            // ignore duplicate column
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
        const queries = [
            'ALTER TABLE interviews ADD COLUMN interviewEmailSentAt DATETIME NULL;',
            'ALTER TABLE interviews ADD COLUMN onboardingEmailSentAt DATETIME NULL;',
            'ALTER TABLE interviews ADD COLUMN onboardingEmailSent BOOLEAN NOT NULL DEFAULT false;'
        ];
        for (const q of queries) {
            try {
                await models_1.sequelize.query(q);
            }
            catch (colErr) {
                // Ignore duplicate column errors
            }
        }
        console.log('[Migration] interviews table synced and patched successfully.');
    }
    catch (e) {
        console.error('[Migration] Failed to sync interviews table:', e.message);
    }
    console.log('[Migration] Interview feature migration completed.');
}
