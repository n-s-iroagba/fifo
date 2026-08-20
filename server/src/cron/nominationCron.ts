/**
 * nominationCron.ts
 * Runs every hour. Finds nominations where the applicant uploaded a signed document
 * more than 3 hours ago AND stage is 'Nomination under-review'.
 * Automatically approves: updates stage to 'Nomination completed' and sends approval mail.
 */

import { Op } from 'sequelize';
import { JobStage } from '../models/JobStage';
import { Application } from '../models/Application';
import { Nomination } from '../models/Nomination';
import { User } from '../models/User';
import { sendInfoEmail } from '../utils/email';
import cron from 'node-cron';

const THREE_HOURS_MS = 3 * 60 * 60 * 1000;
const ONE_HOUR_MS = 60 * 60 * 1000;

export async function runNominationApprovalCron(): Promise<void> {
    try {
        console.log('[NominationCron] Running nomination auto-approval check...');

        const cutoff = new Date(Date.now() - THREE_HOURS_MS);

        // Find all nominations that have a signed document uploaded more than 3 hours ago
        const pendingNominations = await Nomination.findAll({
            where: {
                documentUrl: { [Op.ne]: null },
                updatedAt: { [Op.lte]: cutoff },
            },
            include: [
                {
                    model: Application,
                    as: 'Application',
                    required: true,
                    include: [
                        {
                            model: JobStage,
                            as: 'JobStages',
                            where: {
                                name: 'Nomination',
                                status: 'under-review',
                                isCurrent: true,
                            },
                            required: true,
                        },
                    ],
                },
            ],
        });

        console.log(`[NominationCron] Found ${pendingNominations.length} nominations pending auto-approval.`);

        for (const nomination of pendingNominations) {
            const application = (nomination as any).Application as Application;
            if (!application) continue;

            const userId = application.userId;

            try {
                // Update stage to Nomination completed
                await JobStage.update(
                    { status: 'completed' },
                    {
                        where: {
                            applicationId: application.id,
                            name: 'Nomination',
                            isCurrent: true,
                        },
                    }
                );

                // Send NominationApprovedMail to candidate
                const user = await User.findByPk(userId);
                if (user) {
                    const subject = 'Your Nomination Has Been Approved 🎉';
                    const content = `
                        <p>Dear ${user.fullName},</p>
                        <p>Congratulations! Blue Collar Recruitment Pty Ltd has reviewed and <strong>approved your nomination</strong>.</p>
                        <p>Please log in to your dashboard to view your confirmed nomination details and proceed to the next steps in the onboarding process.</p>
                        <p>Yours sincerely,<br>Troy Latuff<br>Chief Executive Officer<br>Blue Collar Recruitment Pty Ltd</p>
                    `;
                    await sendInfoEmail(user.email, subject, content).catch(err =>
                        console.error(`[NominationCron] Email failed for user ${userId}:`, err)
                    );
                }

                console.log(`[NominationCron] Auto-approved nomination for application ${application.id}.`);
            } catch (innerErr) {
                console.error(`[NominationCron] Error processing application ${application.id}:`, innerErr);
            }
        }
    } catch (err) {
        console.error('[NominationCron] Fatal error:', err);
    }
}

export function startNominationCron(): void {
    console.log('[NominationCron] Starting nomination auto-approval cron (every hour).');
    cron.schedule('0 * * * *', () => {
        runNominationApprovalCron();
    });
    // Run immediately on startup to catch up any missed during redeploy
    setTimeout(() => runNominationApprovalCron(), 30_000);
}
