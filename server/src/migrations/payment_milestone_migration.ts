import { sequelize } from '../config/database';

/**
 * Migration: Payment Milestone Gate (Schedule 1 / Clause 5.1)
 *
 * Adds:
 *  - users.deposit_paid         BOOLEAN  — A$500 initial deposit received and admin-verified
 *  - users.deposit_paid_at      DATETIME — timestamp of deposit verification
 *  - users.full_balance_paid    BOOLEAN  — full programme balance paid (unlocks ticket 4+)
 *  - tickets.ticket_sequence_number INT  — 1-based ordinal position in applicant's programme
 *
 * Gate Rules:
 *  - ticketSequenceNumber 1-3 → requires depositPaid === true
 *  - ticketSequenceNumber 4+  → requires fullBalancePaid === true
 *  - Upfront full payment     → admin sets fullBalancePaid=true immediately (covers all)
 */
export async function migratePaymentMilestone() {
    console.log('--- Initializing Payment Milestone Migration ---');

    try {
        await sequelize.query('ALTER TABLE users ADD COLUMN deposit_paid TINYINT(1) NOT NULL DEFAULT 0;');
        console.log('[SUCCESS] users.deposit_paid added.');
    } catch (e: any) {
        if (e.message?.includes('Duplicate column name')) {
            console.log('[INFO] users.deposit_paid already exists.');
        } else {
            console.error('[ERROR] Failed to add users.deposit_paid:', e.message);
        }
    }

    try {
        await sequelize.query('ALTER TABLE users ADD COLUMN deposit_paid_at DATETIME DEFAULT NULL;');
        console.log('[SUCCESS] users.deposit_paid_at added.');
    } catch (e: any) {
        if (e.message?.includes('Duplicate column name')) {
            console.log('[INFO] users.deposit_paid_at already exists.');
        } else {
            console.error('[ERROR] Failed to add users.deposit_paid_at:', e.message);
        }
    }

    try {
        await sequelize.query('ALTER TABLE users ADD COLUMN full_balance_paid TINYINT(1) NOT NULL DEFAULT 0;');
        console.log('[SUCCESS] users.full_balance_paid added.');
    } catch (e: any) {
        if (e.message?.includes('Duplicate column name')) {
            console.log('[INFO] users.full_balance_paid already exists.');
        } else {
            console.error('[ERROR] Failed to add users.full_balance_paid:', e.message);
        }
    }

    try {
        await sequelize.query('ALTER TABLE tickets ADD COLUMN ticket_sequence_number INT DEFAULT NULL;');
        console.log('[SUCCESS] tickets.ticket_sequence_number added.');
    } catch (e: any) {
        if (e.message?.includes('Duplicate column name')) {
            console.log('[INFO] tickets.ticket_sequence_number already exists.');
        } else {
            console.error('[ERROR] Failed to add tickets.ticket_sequence_number:', e.message);
        }
    }

    console.log('--- Payment Milestone Migration Completed ---');
}
