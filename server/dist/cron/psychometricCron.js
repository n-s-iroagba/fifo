"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runPsychometricApprovalCron = runPsychometricApprovalCron;
const sequelize_1 = require("sequelize");
const models_1 = require("../models");
const ApplicationService_1 = require("../services/ApplicationService");
const email_1 = require("../utils/email");
const cronRegistry_1 = require("./cronRegistry");
const CRON_NAME = 'PsychometricAutoApproval';
const ONE_HOUR_MS = 60 * 60 * 1000;
async function runPsychometricApprovalCron() {
    try {
        console.log('[PsychometricCron] Running module 2 auto-approval check...');
        const cutoff = new Date(Date.now() - ONE_HOUR_MS);
        // Find users who have module 2 pending
        const attempts = await models_1.PsychometricAttempt.findAll({
            where: {
                module: 'module_2',
                passed: false,
                createdAt: { [sequelize_1.Op.lte]: cutoff }
            },
            include: [{ model: models_1.User, required: true }]
        });
        console.log(`[PsychometricCron] Found ${attempts.length} potential module 2 attempts to auto-approve.`);
        for (const attempt of attempts) {
            const user = attempt.User;
            if (user.psychometricModule2Passed)
                continue;
            // Check if this is the absolute latest attempt for module 2 for this user
            const latestAttempt = await models_1.PsychometricAttempt.findOne({
                where: { userId: user.id, module: 'module_2' },
                order: [['createdAt', 'DESC']]
            });
            if (latestAttempt && latestAttempt.id === attempt.id) {
                // To avoid approving explicitly rejected attempts, we could check if updatedAt is significantly different from createdAt.
                // However, the requirement is to auto pass after 1hr.
                try {
                    user.psychometricModule2Passed = true;
                    user.psychometricCompletedAt = new Date();
                    await user.save();
                    attempt.passed = true;
                    await attempt.save();
                    await ApplicationService_1.applicationService.updateLatestApplicationStageStatus(user.id, 'Psychometric Test Module 2 passed');
                    await (0, email_1.sendAvelingEmail)(user.email, 'Psychometric Module 2 Completed Successfully', `<p>Dear ${user.fullName},</p><p>Congratulations! You have successfully passed Psychometric Module 2. You have now completed the psychometric evaluation phase.</p>`);
                    console.log(`[PsychometricCron] Auto-approved module 2 for user ${user.id}.`);
                }
                catch (innerErr) {
                    console.error(`[PsychometricCron] Error processing user ${user.id}:`, innerErr);
                }
            }
        }
        (0, cronRegistry_1.recordCronRun)(CRON_NAME, 'ok');
        return attempts.length;
    }
    catch (err) {
        console.error('[PsychometricCron] Fatal error:', err);
        (0, cronRegistry_1.recordCronRun)(CRON_NAME, 'error', String(err));
        return 0;
    }
}
