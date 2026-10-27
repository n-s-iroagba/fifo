"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runApplicationApprovalCron = runApplicationApprovalCron;
const sequelize_1 = require("sequelize");
const models_1 = require("../models");
const email_1 = require("../utils/email");
const NotificationRepository_1 = require("../repositories/NotificationRepository");
const cronRegistry_1 = require("./cronRegistry");
const CRON_NAME = 'ApplicationAutoAcceptance';
const TWELVE_HOURS_MS = 12 * 60 * 60 * 1000;
async function runApplicationApprovalCron(forceUserId) {
    try {
        const cutoff = new Date(Date.now() - TWELVE_HOURS_MS);
        console.log('[ApplicationCron] Running 12-hour automatic application acceptance check' + (forceUserId ? ` for userId: ${forceUserId}` : '...'));
        const stageWhere = {
            name: 'Application',
            status: { [sequelize_1.Op.in]: ['pending', 'under-review'] }
        };
        if (!forceUserId) {
            stageWhere.updatedAt = { [sequelize_1.Op.lte]: cutoff };
        }
        const pendingStages = await models_1.JobStage.findAll({
            where: stageWhere,
            include: [
                {
                    model: models_1.Application,
                    // literal() produces reliable column refs under MySQL's underscored schema
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
        console.log(`[ApplicationCron] Found ${pendingStages.length} applications pending 12-hour auto-acceptance.`);
        for (const stage of pendingStages) {
            const application = stage.Application;
            if (!application)
                continue;
            const userId = application.userId;
            const jobTitle = application.JobListing?.title || 'your applied role';
            try {
                // Mark stage as accepted
                await stage.update({ status: 'accepted' });
                // Advance to Employer Selection stage (orderly & idempotent)
                const { applicationService } = require('../services/ApplicationService');
                await applicationService.addStageToApplication(application.id, {
                    name: 'Employer Selection',
                    status: 'ongoing',
                    setAsCurrent: true,
                    notifyInApp: false,
                    notifyEmail: false
                });
                // In-app notification
                await NotificationRepository_1.notificationRepository.create({
                    userId,
                    subject: 'Application Accepted',
                    message: `Your application for "${jobTitle}" has been reviewed and accepted. Check your dashboard for next steps.`,
                    type: 'SYSTEM'
                });
                // Send Application Accepted email to candidate with the 3 mandatory statutory points (NEW_CHANGES.md FG 14)
                const user = await models_1.User.findByPk(userId);
                if (user) {
                    const subject = `Congratulations: Your FIFO Application Has Been Accepted — ${jobTitle}`;
                    const content = `
                        <p>Dear ${user.fullName},</p>
                        <p>Congratulations! Your application for the <strong>${jobTitle}</strong> position at <strong>Blue Collar Recruitment</strong> has been successfully reviewed and <strong>accepted</strong>.</p>
                        <p>Please review the following vital points regarding your progression:</p>
                        <ol>
                            <li><strong>Prerequisite Training Requirements:</strong> You may require further prerequisite training and competency tickets subject to the statutory safety requirements of your future Australian employer.</li>
                            <li><strong>Employer Cost Liability:</strong> Your future Australian employer is fully liable for the cost of training and/or any costs incurred by you in the context of training for the role applied upon deployment.</li>
                            <li><strong>Upcoming Host Employer Selection:</strong> You will be selecting your future employer in our next communication. An official Employer Selection Form and company slot allocation will be dispatched to your portal within 24 hours.</li>
                        </ol>
                        <div class="cta-block">
                            <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/dashboard/applications" class="button">View Application Status</a>
                        </div>
                        <p>Yours sincerely,<br>Gary Nexon Fletcher.<br>Hiring Operations Director.<br>Blue Collar Recruitment Pty Ltd.</p>
                    `;
                    await (0, email_1.sendInfoEmail)(user.email, subject, content).catch(err => console.error(`[ApplicationCron] Email failed for user ${userId}:`, err));
                }
                // Notify admin about the cron action
                const adminEmail = 'nnamdisolomon1@gmail.com';
                const adminSubject = `Cron Action Executed: Application Auto-Accepted for ${user?.fullName || 'Applicant'}`;
                const adminContent = `
                    <div style="font-family: Arial, sans-serif; color: #333;">
                        <h2 style="color: #1e3a8a;">Cron Job Execution Report</h2>
                        <p><strong>Cron Job:</strong> ${CRON_NAME}</p>
                        <p><strong>Action Taken:</strong> Auto-accepted the application because the Application stage was under review for over 3 hours. Advanced stage to Nomination and sent acceptance email to candidate.</p>
                        <p><strong>Applicant Involved:</strong> ${user?.fullName || 'Unknown'} (User ID: ${userId}, Email: ${user?.email || 'N/A'})</p>
                        <p><strong>Application ID:</strong> ${application.id}</p>
                    </div>
                `;
                await (0, email_1.sendInfoEmail)(adminEmail, adminSubject, adminContent).catch(err => console.error(`[ApplicationCron] Admin email failed for user ${userId}:`, err));
                console.log(`[ApplicationCron] Auto-accepted application ${application.id} (job: "${jobTitle}").`);
            }
            catch (innerErr) {
                console.error(`[ApplicationCron] Error processing application ${application.id}:`, innerErr);
            }
        }
        (0, cronRegistry_1.recordCronRun)(CRON_NAME, 'ok');
        return pendingStages.length;
    }
    catch (err) {
        console.error('[ApplicationCron] Fatal error:', err);
        (0, cronRegistry_1.recordCronRun)(CRON_NAME, 'error', String(err));
        return 0;
    }
}
