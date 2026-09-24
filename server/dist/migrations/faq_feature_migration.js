"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.migrateFaqFeature = migrateFaqFeature;
const models_1 = require("../models");
/**
 * Migration: FAQ Feature
 * - Creates / syncs `faqs` table
 * - Enforces unique constraint on `type` ('process' | 'payment')
 */
async function migrateFaqFeature() {
    console.log('[Migration] Running FAQ feature migration...');
    try {
        await models_1.Faq.sync();
        console.log('[Migration] faqs table synced successfully.');
    }
    catch (e) {
        console.error('[Migration] Failed to sync faqs table:', e.message);
    }
    // Explicitly ensure the unique constraint exists on `type` in case sync didn't apply it
    try {
        await models_1.sequelize.query('ALTER TABLE faqs ADD UNIQUE INDEX unique_faq_type (type);');
        console.log('[Migration] Added unique index on faqs(type).');
    }
    catch (e) {
        if (e.message?.includes('Duplicate key name') || e.original?.code === 'ER_DUP_KEYNAME') {
            console.log('[Migration] unique_faq_type index already exists on faqs.');
        }
        else {
            // Index might already be created by sync()
            console.log('[Migration] Note on faqs.type unique index:', e.message);
        }
    }
    console.log('[Migration] FAQ feature migration completed.');
}
