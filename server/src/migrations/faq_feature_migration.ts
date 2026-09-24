import { sequelize, Faq } from '../models';

/**
 * Migration: FAQ Feature
 * - Creates / syncs `faqs` table
 * - Enforces unique constraint on `type` ('process' | 'payment')
 */
export async function migrateFaqFeature(): Promise<void> {
    console.log('[Migration] Running FAQ feature migration...');

    try {
        await Faq.sync();
        console.log('[Migration] faqs table synced successfully.');
    } catch (e: any) {
        console.error('[Migration] Failed to sync faqs table:', e.message);
    }

    // Explicitly ensure the unique constraint exists on `type` in case sync didn't apply it
    try {
        await sequelize.query('ALTER TABLE faqs ADD UNIQUE INDEX unique_faq_type (type);');
        console.log('[Migration] Added unique index on faqs(type).');
    } catch (e: any) {
        if (e.message?.includes('Duplicate key name') || e.original?.code === 'ER_DUP_KEYNAME') {
            console.log('[Migration] unique_faq_type index already exists on faqs.');
        } else {
            // Index might already be created by sync()
            console.log('[Migration] Note on faqs.type unique index:', e.message);
        }
    }

    console.log('[Migration] FAQ feature migration completed.');
}
