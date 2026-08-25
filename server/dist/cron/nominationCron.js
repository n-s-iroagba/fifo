"use strict";
/**
 * nominationCron.ts
 * Runs every hour. Finds applications where the 'Nomination' stage was completed
 * exactly or more than 1 hour ago, and the application is still on the 'Nomination' stage.
 * It advances the application to the 'TicketSponsorship' stage and sends the email.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.runNominationFollowupCron = runNominationFollowupCron;
const sequelize_1 = require("sequelize");
const models_1 = require("../models");
const ApplicationService_1 = require("../services/ApplicationService");
const email_1 = require("../utils/email");
const cronRegistry_1 = require("./cronRegistry");
const CRON_NAME = 'NominationFollowup';
const ONE_HOUR_MS = 60 * 60 * 1000;
async function runNominationFollowupCron() {
    try {
        const start = Date.now();
        console.log('[NominationCron] Running nomination followup check (1 hour post-approval)...');
        const cutoff = new Date(Date.now() - ONE_HOUR_MS);
        // Find applications where the 'Nomination' stage is 'completed' for > 1 hour
        // AND it's still the current stage of the application (meaning we haven't advanced to TicketSponsorship yet)
        const completedStages = await models_1.JobStage.findAll({
            where: {
                name: 'Nomination',
                status: 'completed',
                updatedAt: { [sequelize_1.Op.lte]: cutoff },
            },
            include: [
                {
                    model: models_1.Application,
                    where: (0, sequelize_1.literal)('`Application`.`currentStageId` = `JobStage`.`id`'),
                    required: true,
                    include: [
                        {
                            model: models_1.JobListing,
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
            const application = stage.Application;
            if (!application)
                continue;
            const userId = application.userId;
            try {
                // Advance to TicketSponsorship stage
                await ApplicationService_1.applicationService.addStageToApplication(application.id, {
                    name: 'TicketSponsorship',
                    status: 'Not Started',
                    setAsCurrent: true,
                    notifyInApp: true,
                    notifyEmail: false // We send a custom email below
                });
                // Send Ticket Uploads And Sponsorship Application Mail to candidate
                const user = await models_1.User.findByPk(userId);
                if (user) {
                    const subject = 'Action Required: Ticket Uploads & Sponsorship Application';
                    const content = `
                        <p>Dear ${user.fullName},</p>
                        <p>With your nomination approved, it is time for the final administrative step before finalizing your contract.</p>
                        <p>Please log in to your dashboard and visit the <strong>Tickets</strong> section. You must upload proof of any required tickets you already possess. For the tickets you do not currently hold, you can easily apply for our Ticket Sponsorship program directly on the same page.</p>
                        <p>Please complete this step as soon as possible so we can proceed with your deployment.</p>
                        <p>Yours sincerely,<br>Blue Collar Recruitment Pty Ltd</p>
                    `;
                    await (0, email_1.sendInfoEmail)(user.email, subject, content).catch(err => console.error(`[NominationCron] Email failed for user ${userId}:`, err));
                }
                console.log(`[NominationCron] Sent followup and advanced stage for application ${application.id}.`);
            }
            catch (innerErr) {
                console.error(`[NominationCron] Error processing application ${application.id}:`, innerErr);
            }
        }
        (0, cronRegistry_1.recordCronRun)(CRON_NAME, 'ok');
    }
    catch (err) {
        console.error('[NominationCron] Fatal error:', err);
        (0, cronRegistry_1.recordCronRun)(CRON_NAME, 'error', String(err));
    }
}
