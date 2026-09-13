"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runApplicationApprovalCron = runApplicationApprovalCron;
const sequelize_1 = require("sequelize");
const models_1 = require("../models");
const email_1 = require("../utils/email");
const NotificationRepository_1 = require("../repositories/NotificationRepository");
const cronRegistry_1 = require("./cronRegistry");
const CRON_NAME = 'ApplicationAutoAcceptance';
const THREE_HOURS_MS = 3 * 60 * 60 * 1000;
async function runApplicationApprovalCron(forceUserId) {
    try {
        console.log('[ApplicationCron] Running application auto-acceptance check...');
        const cutoff = new Date(Date.now() - THREE_HOURS_MS);
        // Find JobStage rows where:
        //   1. The stage is named 'Application'
        //   2. The stage has been 'under-review' for more than 3 hours
        //   3. The owning Application still points to this stage as currentStageId
        //      (i.e. the application hasn't already been manually advanced)
        const stageWhere = {
            name: 'Application',
            status: 'under-review'
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
        console.log(`[ApplicationCron] Found ${pendingStages.length} applications pending auto-acceptance.`);
        for (const stage of pendingStages) {
            const application = stage.Application;
            if (!application)
                continue;
            const userId = application.userId;
            const jobTitle = application.JobListing?.title || 'your applied role';
            try {
                // Mark stage as accepted (lowercase, consistent with 'under-review' convention)
                await stage.update({ status: 'accepted' });
                // Advance to Nomination stage
                const { applicationService } = require('../services/ApplicationService');
                await applicationService.addStageToApplication(application.id, {
                    name: 'Nomination',
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
                // Send Application Accepted email to candidate
                const user = await models_1.User.findByPk(userId);
                if (user) {
                    const subject = `Your Application Has Been Accepted — ${jobTitle}`;
                    const content = `
                        <p>Dear ${user.fullName},</p>
                        <p>Congratulations! Your application for the <strong>${jobTitle}</strong> position at <strong>Blue Collar Recruitment</strong> has been successfully reviewed and <strong>accepted</strong>.</p>
                        <p>Blue Collar Recruitment specializes in hiring and sponsoring foreign applicants to work FIFO in Australia, and we are excited to progress your application.</p>
                        <p>You have now advanced to the <strong>Nomination</strong> stage of our recruitment process. Please log in to your dashboard to view your updated status and any further instructions.</p>
                        <div class="cta-block">
                            <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/dashboard/applications" class="button">View Application</a>
                        </div>
                        <p>Yours sincerely,<br>Gary Nexon Fletcher.<br>Hiring Manager.<br>Blue Collar Recruitment Pty Ltd.</p>
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
