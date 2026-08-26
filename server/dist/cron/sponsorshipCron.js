"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runSponsorshipApprovalCron = runSponsorshipApprovalCron;
const sequelize_1 = require("sequelize");
const models_1 = require("../models");
const cronRegistry_1 = require("./cronRegistry");
const CRON_NAME = 'SponsorshipAutoApproval';
const TWO_HOURS_MS = 2 * 60 * 60 * 1000;
const ONE_HOUR_MS = 60 * 60 * 1000;
async function runSponsorshipApprovalCron() {
    try {
        console.log('[SponsorshipCron] Running ticket sponsorship auto-approval check...');
        const cutoff = new Date(Date.now() - TWO_HOURS_MS);
        // Find applications where the 'TicketSponsorship' stage is 'under-review' for > 2 hours
        const pendingStages = await models_1.JobStage.findAll({
            where: {
                name: 'TicketSponsorship',
                status: 'under-review',
                updatedAt: { [sequelize_1.Op.lte]: cutoff }
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
                    await require('../services/TicketService').ticketService.approvePackageAndSendInvoice(userId, bankAccount, 'Auto-approved via cron 2 hours after submission').catch((err) => console.error(`[SponsorshipCron] Failed to approve package and invoice user ${userId}:`, err));
                }
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
