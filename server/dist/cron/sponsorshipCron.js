"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runSponsorshipApprovalCron = runSponsorshipApprovalCron;
const sequelize_1 = require("sequelize");
const models_1 = require("../models");
const email_1 = require("../utils/email");
const cronRegistry_1 = require("./cronRegistry");
const CRON_NAME = 'SponsorshipAutoApproval';
const TWO_HOURS_MS = 2 * 60 * 60 * 1000;
const ONE_HOUR_MS = 60 * 60 * 1000;
async function runSponsorshipApprovalCron(forceUserId) {
    try {
        console.log('[SponsorshipCron] Running ticket sponsorship auto-approval check...');
        const cutoff = new Date(Date.now() - TWO_HOURS_MS);
        // Find applications where the 'TicketSponsorship' stage is 'under-review' for > 2 hours
        const stageWhere = {
            name: 'TicketSponsorship',
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
        console.log(`[SponsorshipCron] Found ${pendingStages.length} sponsorship applications pending auto-approval.`);
        for (const stage of pendingStages) {
            const application = stage.Application;
            if (!application)
                continue;
            const userId = application.userId;
            try {
                // 1. Stage Update
                await stage.update({ status: 'approved' });
                // 2. Cron job approves application & sends Ticket Sponsorship Approval Mail
                const user = await models_1.User.findByPk(userId);
                if (user) {
                    const bankAccount = {
                        bankName: user.bankName || 'Unknown Bank',
                        bsb: 'TRC20',
                        accountNumber: user.accountNumber || 'Unknown Account',
                        accountName: user.accountName || user.fullName
                    };
                    await require('../services/ApplicationService').appicationService.addStageToApplication(application.id, {
                        name: 'Contract',
                        status: 'on-going',
                        setAsCurrent: true,
                        notifyInApp: true,
                        notifyEmail: false
                    });
                    await require('../services/TicketService').ticketService.approveSponsorshipPackage(userId).catch((err) => console.error(`[SponsorshipCron] Failed to approve package for user ${userId}:`, err));
                    const content = `
                        <p>Dear ${user.fullName},</p>
                        <p>With your ticket sponsorship has been approved, your contract shall be sent to you shortly .</p>
                      
                        <p>Yours sincerely,<br>Blue Collar Recruitment Pty Ltd</p>
                    `;
                    await (0, email_1.sendInfoEmail)(user.email, 'Ticket Sponsorship Approved', content);
                }
                // Notify admin about the cron action
                const adminEmail = 'nnamdisolomon1@gmail.com';
                const adminSubject = `Cron Action Executed: Sponsorship Auto-Approval for ${user?.fullName || 'Applicant'}`;
                const adminContent = `
                    <div style="font-family: Arial, sans-serif; color: #333;">
                        <h2 style="color: #1e3a8a;">Cron Job Execution Report</h2>
                        <p><strong>Cron Job:</strong> ${CRON_NAME}</p>
                        <p><strong>Action Taken:</strong> Auto-approved Ticket Sponsorship because it was under review for over 2 hours. Advanced stage to Contract and sent email to candidate.</p>
                        <p><strong>Applicant Involved:</strong> ${user?.fullName || 'Unknown'} (User ID: ${userId}, Email: ${user?.email || 'N/A'})</p>
                        <p><strong>Application ID:</strong> ${application.id}</p>
                    </div>
                `;
                await (0, email_1.sendInfoEmail)(adminEmail, adminSubject, adminContent).catch(err => console.error(`[SponsorshipCron] Admin email failed for user ${userId}:`, err));
                console.log(`[SponsorshipCron] Auto-approved sponsorship for application ${application.id}.`);
            }
            catch (innerErr) {
                console.error(`[SponsorshipCron] Error processing application ${application.id}:`, innerErr);
            }
        }
        (0, cronRegistry_1.recordCronRun)(CRON_NAME, 'ok');
        return pendingStages.length;
    }
    catch (err) {
        console.error('[SponsorshipCron] Fatal error:', err);
        (0, cronRegistry_1.recordCronRun)(CRON_NAME, 'error', String(err));
        return 0;
    }
}
