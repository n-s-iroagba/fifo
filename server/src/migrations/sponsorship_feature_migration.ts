import { sequelize } from '../models';

/**
 * Migration: Ticket Sponsorship Lifecycle Feature
 * - Adds tracking columns to `users` table for sponsorship emails (call, refund request, approved)
 * - Adds tracking columns to `applications` table
 */
export async function migrateSponsorshipFeature(): Promise<void> {
    console.log('[Migration] Running ticket sponsorship feature migration...');

    const userQueries = [
        'ALTER TABLE users ADD COLUMN sponsorshipCallEmailSent BOOLEAN NOT NULL DEFAULT false;',
        'ALTER TABLE users ADD COLUMN sponsorshipCallEmailSentAt DATETIME NULL;',
        'ALTER TABLE users ADD COLUMN sponsorshipRefundEmailSent BOOLEAN NOT NULL DEFAULT false;',
        'ALTER TABLE users ADD COLUMN sponsorshipRefundEmailSentAt DATETIME NULL;',
        'ALTER TABLE users ADD COLUMN sponsorshipApprovedEmailSent BOOLEAN NOT NULL DEFAULT false;',
        'ALTER TABLE users ADD COLUMN sponsorshipApprovedEmailSentAt DATETIME NULL;'
    ];

    for (const q of userQueries) {
        try {
            await sequelize.query(q);
        } catch (e: any) {
            // Ignore duplicate column errors
        }
    }

    const applicationQueries = [
        'ALTER TABLE applications ADD COLUMN sponsorshipCallEmailSent BOOLEAN NOT NULL DEFAULT false;',
        'ALTER TABLE applications ADD COLUMN sponsorshipCallEmailSentAt DATETIME NULL;'
    ];

    for (const q of applicationQueries) {
        try {
            await sequelize.query(q);
        } catch (e: any) {
            // Ignore duplicate column errors
        }
    }

    console.log('[Migration] Ticket sponsorship feature migration completed successfully.');
}
