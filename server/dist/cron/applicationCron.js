"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runApplicationApprovalCron = runApplicationApprovalCron;
exports.startApplicationCron = startApplicationCron;
const sequelize_1 = require("sequelize");
const models_1 = require("../models");
const email_1 = require("../utils/email");
const node_cron_1 = __importDefault(require("node-cron"));
const cronRegistry_1 = require("./cronRegistry");
const CRON_NAME = 'ApplicationAutoAcceptance';
const SIX_HOURS_MS = 6 * 60 * 60 * 1000;
const ONE_HOUR_MS = 60 * 60 * 1000;
async function runApplicationApprovalCron() {
    try {
        console.log('[ApplicationCron] Running application auto-acceptance check...');
        const cutoff = new Date(Date.now() - SIX_HOURS_MS);
        // Find applications where the 'Application' stage is 'under-review' for > 6 hours
        const pendingStages = await models_1.JobStage.findAll({
            where: {
                status: 'under-review',
                updatedAt: { [sequelize_1.Op.lte]: cutoff }
            },
            include: [
                {
                    model: models_1.PrefillStage,
                    as: 'PrefillStage',
                    where: { name: 'Application' },
                    required: true
                },
                {
                    model: models_1.Application,
                    where: {
                        currentStageId: { [sequelize_1.Op.col]: 'JobStage.id' }
                    },
                    required: true
                }
            ]
        });
        console.log(`[ApplicationCron] Found ${pendingStages.length} applications pending auto-acceptance.`);
        for (const stage of pendingStages) {
            const application = stage.Application;
            if (!application)
                continue;
            const userId = application.userId;
            try {
                // Update stage to accepted
                await stage.update({ status: 'Accepted' });
                // Send Application Accepted Mail to candidate
                const user = await models_1.User.findByPk(userId);
                if (user) {
                    const subject = 'Your Application Has Been Accepted 🎉';
                    const content = `
                        <p>Dear ${user.fullName},</p>
                        <p>Congratulations! Your application has been successfully reviewed and <strong>accepted</strong>.</p>
                        <p>You have now progressed to the nomination stage of our recruitment process. Please log in to your dashboard to view your new status and any further instructions.</p>
                        <p>Yours sincerely,<br>Gary Nexon Fletcher.<br>Hiring Manager.<br>Blue Collar Recruitment.</p>
                    `;
                    await (0, email_1.sendInfoEmail)(user.email, subject, content).catch(err => console.error(`[ApplicationCron] Email failed for user ${userId}:`, err));
                }
                console.log(`[ApplicationCron] Auto-accepted application ${application.id}.`);
            }
            catch (innerErr) {
                console.error(`[ApplicationCron] Error processing application ${application.id}:`, innerErr);
            }
        }
        (0, cronRegistry_1.recordCronRun)(CRON_NAME, 'ok');
    }
    catch (err) {
        console.error('[ApplicationCron] Fatal error:', err);
        (0, cronRegistry_1.recordCronRun)(CRON_NAME, 'error', String(err));
    }
}
function startApplicationCron() {
    (0, cronRegistry_1.registerCron)(CRON_NAME);
    console.log('[ApplicationCron] Starting application auto-acceptance cron (every hour).');
    node_cron_1.default.schedule('0 * * * *', () => {
        runApplicationApprovalCron();
    });
    // Run immediately on startup to catch up any missed during redeploy
    setTimeout(() => runApplicationApprovalCron(), 5_000);
}
