"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.migrateCourseFormatEnum = migrateCourseFormatEnum;
const database_1 = require("../config/database");
/**
 * Adds 'Online' to the courses.format ENUM column.
 * The seed data uses 'Online' for awareness-only courses (NPC, DL-C, RSA)
 * but the column was originally defined with only 'Theory', 'Practical', 'Mixed'.
 * MySQL rejects inserts with unknown ENUM values with a truncation error,
 * so this ALTER TABLE must run before seedDatabase().
 */
async function migrateCourseFormatEnum() {
    try {
        console.log('[Migration] Updating courses.format ENUM to include Online...');
        await database_1.sequelize.query(`
            ALTER TABLE courses
            MODIFY COLUMN format ENUM('Theory', 'Practical', 'Mixed', 'Online') NOT NULL;
        `);
        console.log('[Migration] courses.format ENUM updated successfully.');
    }
    catch (e) {
        // If the ENUM already contains 'Online', the ALTER TABLE may still succeed —
        // MySQL ignores re-adding an existing ENUM value. Only log non-fatal failures.
        if (e.message?.includes("doesn't exist") || e.message?.includes('Table')) {
            console.log('[Migration] courses table does not exist yet, skipping format ENUM migration.');
        }
        else {
            console.error('[Migration] courses.format ENUM migration error (non-fatal):', e.message);
        }
    }
}
