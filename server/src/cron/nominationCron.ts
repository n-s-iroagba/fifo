/**
 * nominationCron.ts
 * Runs every hour. Finds applications where the 'Nomination' stage was completed
 * exactly or more than 1 hour ago, and the application is still on the 'Nomination' stage.
 * It advances the application to the 'TicketSponsorship' stage and sends the email.
 */

import { Op, literal } from 'sequelize';
import { JobStage, Application, User, JobListing } from '../models';
import { applicationService } from '../services/ApplicationService';
import { sendInfoEmail } from '../utils/email';
import { registerCron, recordCronRun } from './cronRegistry';

const CRON_NAME = 'NominationFollowup';

const ONE_HOUR_MS = 60 * 60 * 1000;

export async function runNominationFollowupCron(): Promise<number> {
    try {
        const start = Date.now();
        console.log('[NominationCron] Running nomination followup check (1 hour post-approval)...');

        const cutoff = new Date(Date.now() - ONE_HOUR_MS);

        // Find applications where the 'Nomination' stage is 'completed' for > 1 hour
        // AND it's still the current stage of the application (meaning we haven't advanced to TicketSponsorship yet)
        const completedStages = await JobStage.findAll({
            where: {
                name: 'Nomination',
                status: 'under-review',
                updatedAt: { [Op.lte]: cutoff },
            },
            include: [
                {
                    model: Application,
                    where: literal('`Application`.`currentStageId` = `JobStage`.`id`'),
                    required: true,
                    include: [
                        {
                            model: JobListing,
                            as: 'JobListing',
                            attributes: ['title', 'company'],
                            required: false
                        }
                    ]

                }
            ]
        });

        console.log(`[NominationCron] Found ${completedStages.length} nominations pending 1-hour ticket sponsorship followup.`);

        for (const stage of completedStages) {
            const application = (stage as any).Application as Application;
            if (!application) continue;

            const userId = application.userId;

            try {
                // Advance to TicketSponsorship stage
                await applicationService.addStageToApplication(application.id, {
                    name: 'TicketSponsorship',
                    status: 'Not Started',
                    setAsCurrent: true,
                    notifyInApp: true,
                    notifyEmail: false // We send a custom email below
                });

                // Send Ticket Uploads And Sponsorship Application Mail to candidate
                const user = await User.findByPk(userId);
                if (user) {
                    const subject = 'Action Required: Ticket Uploads & Sponsorship Application';
                    const content = `
                        <p>Dear ${user.fullName},</p>
                        <p>With your nomination approved, it is time for the final administrative step before finalizing your contract.</p>
                        <p>Please log in to your dashboard and visit the <strong>Tickets</strong> section. You must upload proof of any required tickets you already possess. For the tickets you do not currently hold, you can easily apply for our Ticket Sponsorship program directly on the same page.</p>
                        <p>Please complete this step as soon as possible in the next 48 hours, so we can proceed with your deployment.</p>
                        <p>Yours sincerely,<br>Blue Collar Recruitment Pty Ltd</p>
                    `;
                    await sendInfoEmail(user.email, subject, content).catch(err =>
                        console.error(`[NominationCron] Email failed for user ${userId}:`, err)
                    );
                }

                console.log(`[NominationCron] Sent followup and advanced stage for application ${application.id}.`);
            } catch (innerErr) {
                console.error(`[NominationCron] Error processing application ${application.id}:`, innerErr);
            }
        }
        recordCronRun(CRON_NAME, 'ok');
        return completedStages.length;
    } catch (err) {
        console.error('[NominationCron] Fatal error:', err);
        recordCronRun(CRON_NAME, 'error', String(err));
        return 0;
    }
}

