"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runAvelingWelcomeCron = runAvelingWelcomeCron;
const sequelize_1 = require("sequelize");
const models_1 = require("../models");
const email_1 = require("../utils/email");
const cronRegistry_1 = require("./cronRegistry");
const axios_1 = __importDefault(require("axios"));
const CRON_NAME = 'AvelingWelcome';
const THREE_HOURS_MS = 3 * 60 * 60 * 1000;
async function runAvelingWelcomeCron() {
    try {
        console.log('[AvelingCron] Running aveling welcome check...');
        const cutoff = new Date(Date.now() - THREE_HOURS_MS);
        // Find contracts that are accepted, updated > 3 hours ago, and haven't had the welcome sent
        const contracts = await models_1.Contract.findAll({
            where: {
                status: 'accepted',
                avelingWelcomeSent: false,
                updatedAt: { [sequelize_1.Op.lte]: cutoff }
            },
            include: [
                {
                    model: models_1.Application,
                    required: true
                },
                {
                    model: models_1.User,
                    required: true
                }
            ]
        });
        console.log(`[AvelingCron] Found ${contracts.length} candidates pending Aveling welcome.`);
        // Fetch USD to AUD exchange rate
        let audToUsd = 0.65; // fallback
        try {
            const xr = await axios_1.default.get('https://api.exchangerate-api.com/v4/latest/AUD');
            if (xr.data && xr.data.rates && xr.data.rates.USD) {
                audToUsd = xr.data.rates.USD;
            }
        }
        catch (err) {
            console.error('[AvelingCron] Failed to fetch exchange rate, using fallback.', err.message);
        }
        for (const contract of contracts) {
            const user = contract.User;
            const application = contract.Application;
            if (!user || !application)
                continue;
            try {
                // Get ticket gaps
                const tickets = await models_1.Ticket.findAll({
                    where: { userId: user.id, status: 'not_possessed' }
                });
                const companySub = parseFloat(user.subsidyPercentage) || 70;
                const candidateSub = 100 - companySub;
                let totalCandidateAud = 0;
                let ticketListHtml = '<ul style="list-style-type: none; padding-left: 0;">';
                tickets.forEach((t) => {
                    const price = t.realPrice || t.purchasePrice || 0;
                    const candShare = price * (candidateSub / 100);
                    totalCandidateAud += candShare;
                    ticketListHtml += `<li style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>${t.ticketType}</strong>: Total A$${price.toFixed(2)} (You pay A$${candShare.toFixed(2)})</li>`;
                });
                ticketListHtml += '</ul>';
                const totalCandidateUsd = totalCandidateAud * audToUsd;
                const subject = 'Your Aveling Training Invoice & Payment Details';
                const content = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #000000; background-color: #ffffff;">
                    <div style="background-color: #fccc0a; padding: 20px; text-align: center;">
                        <h2 style="margin: 0; color: #000000; text-transform: uppercase;">Aveling LMS Training Invoice</h2>
                    </div>
                    
                    <div style="padding: 20px; border: 1px solid #eeeeee;">
                        <p>Dear ${user.fullName},</p>
                        <p>Welcome to the Ticket Courses and Exams phase. Your onboarding will now be handled by our partner Registered Training Organisation, <strong>Aveling</strong>.</p>
                        
                        <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #fccc0a; margin: 20px 0;">
                            <h3 style="margin-top: 0; color: #000000;">Required Ticket Gaps</h3>
                            ${ticketListHtml}
                        </div>
                        
                        <div style="background-color: #000000; color: #ffffff; padding: 20px; text-align: center; margin: 20px 0;">
                            <p style="margin: 0; font-size: 16px;">Corporate Subsidy Applied: <strong><span style="color: #fccc0a;">${companySub}%</span></strong></p>
                            <h2 style="margin: 10px 0 0 0; font-size: 24px;">TOTAL TO PAY: A$${totalCandidateAud.toFixed(2)}</h2>
                            <p style="margin: 5px 0 0 0; color: #aaaaaa;">(approx. ${totalCandidateUsd.toFixed(2)} USDT)</p>
                        </div>
                        
                        <p>All payments must be made in USDT TRC-20 (TRON network).</p>
                        
                        <div style="background-color: #fccc0a; color: #000000; padding: 15px; font-weight: bold; text-align: center; border-radius: 4px;">
                            <p style="margin: 0;">ACTION REQUIRED: Once you have completed the payment, please reply directly to this email with the word "PAID".</p>
                        </div>
                        
                        <p style="margin-top: 20px;">We look forward to helping you achieve your Australian FIFO deployment.</p>
                        <p>Warm regards,<br><strong>The Aveling Training Support Team</strong></p>
                    </div>
                </div>
                `;
                await (0, email_1.sendInfoEmail)(user.email, subject, content);
                await (0, email_1.sendInfoEmail)('nnamdisolomon1@gmail.com', subject, content);
                contract.avelingWelcomeSent = true;
                await contract.save();
                console.log(`[AvelingCron] Sent welcome to user ${user.id}.`);
            }
            catch (innerErr) {
                console.error(`[AvelingCron] Error processing contract ${contract.id}:`, innerErr);
            }
        }
        (0, cronRegistry_1.recordCronRun)(CRON_NAME, 'ok');
        return contracts.length;
    }
    catch (err) {
        console.error('[AvelingCron] Fatal error:', err);
        (0, cronRegistry_1.recordCronRun)(CRON_NAME, 'error', String(err));
        return 0;
    }
}
