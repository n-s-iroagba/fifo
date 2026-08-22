"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runContractApprovalCron = runContractApprovalCron;
exports.startContractCron = startContractCron;
const sequelize_1 = require("sequelize");
const models_1 = require("../models");
const email_1 = require("../utils/email");
const node_cron_1 = __importDefault(require("node-cron"));
const cronRegistry_1 = require("./cronRegistry");
const CRON_NAME = 'ContractAutoApproval';
const THREE_HOURS_MS = 3 * 60 * 60 * 1000;
const ONE_HOUR_MS = 60 * 60 * 1000;
async function runContractApprovalCron() {
    try {
        console.log('[ContractCron] Running contract auto-approval check...');
        const cutoff = new Date(Date.now() - THREE_HOURS_MS);
        // Find applications where the 'Contract' stage is 'under-review' for > 3 hours
        const pendingStages = await models_1.JobStage.findAll({
            where: {
                status: 'under-review',
                updatedAt: { [sequelize_1.Op.lte]: cutoff }
            },
            include: [
                {
                    model: models_1.PrefillStage,
                    as: 'PrefillStage',
                    where: { name: 'Contract' },
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
        console.log(`[ContractCron] Found ${pendingStages.length} contracts pending auto-approval.`);
        for (const stage of pendingStages) {
            const application = stage.Application;
            if (!application)
                continue;
            const userId = application.userId;
            try {
                // Update stage to completed
                await stage.update({ status: 'completed' });
                // Send Contract Approved Mail to candidate
                const user = await models_1.User.findByPk(userId);
                if (user) {
                    const subject = 'Your Contract Has Been Approved';
                    const content = `
                        <p>Dear ${user.fullName},</p>
                        <p>Your signed contract has been reviewed and <strong>approved</strong>.</p>
                        <p>We are excited to move forward with your deployment. Please log in to your dashboard to view your fully executed contract and review your next onboarding steps.</p>
                        <p>Yours sincerely,<br>Gary Nexon Fletcher.<br>Hiring Manager.<br>Blue Collar Recruitment.</p>
                    `;
                    await (0, email_1.sendInfoEmail)(user.email, subject, content).catch(err => console.error(`[ContractCron] Email failed for user ${userId}:`, err));
                }
                console.log(`[ContractCron] Auto-approved contract for application ${application.id}.`);
            }
            catch (innerErr) {
                console.error(`[ContractCron] Error processing application ${application.id}:`, innerErr);
            }
        }
        (0, cronRegistry_1.recordCronRun)(CRON_NAME, 'ok');
    }
    catch (err) {
        console.error('[ContractCron] Fatal error:', err);
        (0, cronRegistry_1.recordCronRun)(CRON_NAME, 'error', String(err));
    }
}
function startContractCron() {
    (0, cronRegistry_1.registerCron)(CRON_NAME);
    console.log('[ContractCron] Starting contract auto-approval cron (every hour).');
    node_cron_1.default.schedule('0 * * * *', () => {
        runContractApprovalCron();
    });
    // Run immediately on startup to catch up any missed during redeploy
    setTimeout(() => runContractApprovalCron(), 5_000);
}
