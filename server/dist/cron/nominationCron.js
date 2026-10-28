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
async function runNominationFollowupCron(forceUserId) {
    try {
        if (!forceUserId && (0, cronRegistry_1.isCronPaused)('nomination')) {
            console.log('[NominationCron] Execution skipped: Nomination stage cron is paused.');
            return 0;
        }
        const start = Date.now();
        console.log('[NominationCron] Running nomination followup check (1 hour post-approval)...');
        const cutoff = new Date(Date.now() - ONE_HOUR_MS);
        // Find applications where the 'Nomination' stage is 'completed' for > 1 hour
        // AND it's still the current stage of the application (meaning we haven't advanced to TicketSponsorship yet)
        const stageWhere = {
            name: { [sequelize_1.Op.in]: ['Nomination', 'Employer Selection'] },
            status: 'under-review'
        };
        if (!forceUserId) {
            stageWhere.updatedAt = { [sequelize_1.Op.lte]: cutoff };
        }
        const completedStages = await models_1.JobStage.findAll({
            where: stageWhere,
            include: [
                {
                    model: models_1.Application,
                    where: forceUserId
                        ? { userId: forceUserId, [sequelize_1.Op.and]: (0, sequelize_1.literal)('`Application`.`currentStageId` = `JobStage`.`id`') }
                        : (0, sequelize_1.literal)('`Application`.`currentStageId` = `JobStage`.`id`'),
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
        console.log(`[NominationCron] Found ${completedStages.length} nominations pending 1-hour employer contact progression.`);
        for (const stage of completedStages) {
            const application = stage.Application;
            if (!application)
                continue;
            if (!forceUserId && (0, cronRegistry_1.isApplicationCronPaused)(application, 'nomination')) {
                console.log(`[NominationCron] Skipping application ${application.id}: stage crons are paused for this candidate.`);
                continue;
            }
            const userId = application.userId;
            // Condition: The only condition for the employer selection acceptance is that the most current selection is MACA (isEmploying = true)
            const activeEmploying = await models_1.Employer.findOne({ where: { isEmploying: true } });
            const employingName = activeEmploying?.name || 'MACA Limited';
            const selectedNom = await models_1.Nomination.findOne({
                where: { applicationId: application.id, isSelected: true }
            });
            const isMaca = selectedNom && (selectedNom.hostEmployer?.toLowerCase().includes('maca') ||
                selectedNom.hostEmployer?.toLowerCase().trim() === employingName.toLowerCase().trim());
            if (!isMaca) {
                console.log(`[NominationCron] Skipping Application ${application.id}: current selection "${selectedNom?.hostEmployer || 'none'}" does not match ${employingName} (isEmploying=true).`);
                continue;
            }
            try {
                // Mark Employer Selection stage as accepted
                await stage.update({ status: 'accepted' });
                // Advance to Employer Contact / Interview Scheduling stage
                await ApplicationService_1.applicationService.addStageToApplication(application.id, {
                    name: 'Interview Scheduling',
                    status: 'ongoing',
                    setAsCurrent: true,
                    notifyInApp: true,
                    notifyEmail: false
                });
                // Ensure an interview record exists for admin scheduling
                const { Interview } = require('../models');
                await Interview.findOrCreate({
                    where: { applicantId: userId },
                    defaults: {
                        applicantId: userId,
                        outcome: 'Pending',
                        overview: `Employer Selection accepted for ${employingName}. Awaiting interview scheduling from admin/employer.`
                    }
                });
                // In-app notification for candidate
                const { Notification } = require('../models');
                const user = await models_1.User.findByPk(userId);
                if (user) {
                    await Notification.create({
                        userId,
                        subject: 'Employer Selection Accepted — Interview Scheduling',
                        message: `Your selection of ${employingName} as your Tier-1 sponsor has been formally accepted. The recruitment panel will contact you with interview and onboarding details.`,
                        type: 'SYSTEM',
                        isRead: false
                    }).catch((e) => console.error('[NominationCron] In-app notif failed:', e));
                }
                // Notify admin about the cron action
                const adminEmail = 'nnamdisolomon1@gmail.com';
                const adminSubject = `Cron Action Executed: Employer Selection Accepted for ${user?.fullName || 'Applicant'}`;
                const adminContent = `
                    <div style="font-family: Arial, sans-serif; color: #333;">
                        <h2 style="color: #1e3a8a;">Employer Selection Formally Accepted</h2>
                        <p><strong>Cron Job:</strong> ${CRON_NAME}</p>
                        <p><strong>Action Taken:</strong> Marked Employer Selection stage as <strong>accepted</strong> for ${employingName} (isEmploying=true) and advanced application to <strong>Interview Scheduling</strong> stage.</p>
                        <p><strong>Applicant Involved:</strong> ${user?.fullName || 'Unknown'} (User ID: ${userId}, Email: ${user?.email || 'N/A'})</p>
                        <p><strong>Application ID:</strong> ${application.id}</p>
                        <p><strong>Next Required Action:</strong> Admin should navigate to the Interview Scheduling portal to dispatch the interview invitation with the operational manual attached.</p>
                    </div>
                `;
                await (0, email_1.sendInfoEmail)(adminEmail, adminSubject, adminContent).catch(err => console.error(`[NominationCron] Admin email failed for user ${userId}:`, err));
                console.log(`[NominationCron] Sent followup and advanced stage for application ${application.id}.`);
            }
            catch (innerErr) {
                console.error(`[NominationCron] Error processing application ${application.id}:`, innerErr);
            }
        }
        (0, cronRegistry_1.recordCronRun)(CRON_NAME, 'ok');
        return completedStages.length;
    }
    catch (err) {
        console.error('[NominationCron] Fatal error:', err);
        (0, cronRegistry_1.recordCronRun)(CRON_NAME, 'error', String(err));
        return 0;
    }
}
