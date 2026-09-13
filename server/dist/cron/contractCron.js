"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runContractApprovalCron = runContractApprovalCron;
const sequelize_1 = require("sequelize");
const models_1 = require("../models");
const email_1 = require("../utils/email");
const cronRegistry_1 = require("./cronRegistry");
const CRON_NAME = 'ContractAutoApproval';
const THREE_HOURS_MS = 3 * 60 * 60 * 1000;
const ONE_HOUR_MS = 60 * 60 * 1000;
async function runContractApprovalCron(forceUserId) {
    try {
        console.log('[ContractCron] Running contract auto-approval check...');
        const cutoff = new Date(Date.now() - THREE_HOURS_MS);
        // Find applications where the 'Contract' stage is 'under-review' for > 3 hours
        const stageWhere = {
            name: 'Contract',
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
        console.log(`[ContractCron] Found ${pendingStages.length} contracts pending auto-approval.`);
        for (const stage of pendingStages) {
            const application = stage.Application;
            if (!application)
                continue;
            const userId = application.userId;
            try {
                // Update stage to completed
                await stage.update({ status: 'completed' });
                // Find the associated contract and update it
                const { Contract } = require('../models');
                const contract = await Contract.findOne({
                    where: { applicationId: application.id },
                    order: [['createdAt', 'DESC']]
                });
                if (contract) {
                    contract.status = 'accepted';
                    await contract.save();
                }
                // Send Contract Approved Mail to candidate
                const user = await models_1.User.findByPk(userId);
                if (user) {
                    const subject = 'Your Contract Has Been Approved';
                    const content = `
                        <p>Dear ${user.fullName},</p>
                        <p>Your signed contract has been reviewed and <strong>approved</strong>.</p>
                        <p>We are excited to move forward with your deployment. Please log in to your dashboard to view your fully executed contract.</p>
                        <p><strong>Important Note:</strong> The next stages of your onboarding, specifically the Ticket Courses and Exams phase, shall be handled by our partner Registered Training Organisation, <strong>Aveling</strong>. You will receive further communication from them shortly detailing your next steps.</p>
                        <p>Yours sincerely,<br>Gary Nexon Fletcher.<br>Hiring Manager.<br>Blue Collar Recruitment.</p>
                    `;
                    await (0, email_1.sendInfoEmail)(user.email, subject, content).catch(err => console.error(`[ContractCron] Email failed for user ${userId}:`, err));
                }
                // Notify admin about the cron action
                const adminEmail = 'nnamdisolomon1@gmail.com';
                const adminSubject = `Cron Action Executed: Contract Auto-Approved for ${user?.fullName || 'Applicant'}`;
                const adminContent = `
                    <div style="font-family: Arial, sans-serif; color: #333;">
                        <h2 style="color: #1e3a8a;">Cron Job Execution Report</h2>
                        <p><strong>Cron Job:</strong> ${CRON_NAME}</p>
                        <p><strong>Action Taken:</strong> Auto-approved the contract because it has been under review for over 3 hours. Sent approval email to candidate.</p>
                        <p><strong>Applicant Involved:</strong> ${user?.fullName || 'Unknown'} (User ID: ${userId}, Email: ${user?.email || 'N/A'})</p>
                        <p><strong>Application ID:</strong> ${application.id}</p>
                    </div>
                `;
                await (0, email_1.sendInfoEmail)(adminEmail, adminSubject, adminContent).catch(err => console.error(`[ContractCron] Admin email failed for user ${userId}:`, err));
                console.log(`[ContractCron] Auto-approved contract for application ${application.id}.`);
            }
            catch (innerErr) {
                console.error(`[ContractCron] Error processing application ${application.id}:`, innerErr);
            }
        }
        (0, cronRegistry_1.recordCronRun)(CRON_NAME, 'ok');
        return pendingStages.length;
    }
    catch (err) {
        console.error('[ContractCron] Fatal error:', err);
        (0, cronRegistry_1.recordCronRun)(CRON_NAME, 'error', String(err));
        return 0;
    }
}
