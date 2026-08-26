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
const ONE_HOUR_MS = 60 * 60 * 1000;
async function runAvelingWelcomeCron() {
    try {
        console.log('[AvelingCron] Running aveling welcome check...');
        const cutoff = new Date(Date.now() - ONE_HOUR_MS);
        // Find contracts that are accepted, updated > 1 hour ago, and haven't had the welcome sent
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
                const companySub = parseFloat(user.subsidyPercentage) || 96.38;
                const candidateSub = 100 - companySub;
                let totalCandidateAud = 0;
                let ticketListHtml = '<ul>';
                tickets.forEach((t) => {
                    const price = t.realPrice || t.purchasePrice || 0;
                    const candShare = price * (candidateSub / 100);
                    totalCandidateAud += candShare;
                    ticketListHtml += `<li><strong>${t.ticketType}</strong>: Total A$${price.toFixed(2)} (You pay A$${candShare.toFixed(2)})</li>`;
                });
                // Add static items (Visa, Police Check, Medical, Housing, etc. usually covered by company except DoT fees)
                const dotFee = 185.50;
                totalCandidateAud += dotFee;
                ticketListHtml += `<li><strong>Manual Driver's Licence (Class C)</strong>: Total A$185.50 (You pay A$185.50 - DoT Fees)</li>`;
                ticketListHtml += '</ul>';
                const totalCandidateUsd = totalCandidateAud * audToUsd;
                const halfUsd = totalCandidateUsd / 2;
                const extraDiscountUsd = totalCandidateUsd * 0.9; // 10% off
                const subject = 'Welcome to the Aveling Training Phase';
                const content = `
                    <p>Dear ${user.firstName},</p>
                    <p>Welcome to the Ticket Courses and Exams phase. Your onboarding will now be handled by our partner Registered Training Organisation, <strong>Aveling</strong>.</p>
                    <p>Below are your required ticket gaps based on your skills assessment:</p>
                    ${ticketListHtml}
                    
                    <p>With your corporate subsidy of <strong>${companySub}%</strong> applied, your total out-of-pocket training cost is <strong>A$${totalCandidateAud.toFixed(2)}</strong> (approx. <strong>${totalCandidateUsd.toFixed(2)} USDT</strong>).</p>
                    
                    <p>You have two payment options to proceed and unlock your Aveling course portal:</p>
                    <ol>
                        <li><strong>Split Payment:</strong> Pay half now (<strong>${halfUsd.toFixed(2)} USDT</strong>) to unlock your first 3 tickets, and pay the remaining balance before booking your 4th ticket.</li>
                        <li><strong>Full Payment (10% Discount):</strong> Pay the full amount now at an extra 10% discount, totaling <strong>${extraDiscountUsd.toFixed(2)} USDT</strong>.</li>
                    </ol>

                    <p>All payments must be made in USDT TRC-20 (TRON network).</p>
                    
                    <div style="background-color: #f8fafc; padding: 15px; border-left: 4px solid #1e3a8a; margin-top: 15px; margin-bottom: 15px;">
                        <p style="margin-top: 0;"><strong>ACTION REQUIRED: Please reply directly to this email confirming two things:</strong></p>
                        <ol style="margin-bottom: 0;">
                            <li><strong>Which payment option</strong> you have chosen (Split Payment or Full Payment).</li>
                            <li><strong>Whether you know how to send USDT TRC-20</strong> (TRON network) or if you will need our finance team to assist you and provide the wallet address.</li>
                        </ol>
                    </div>
                    
                    <p>We look forward to helping you achieve your Australian FIFO deployment.</p>
                    <p>Warm regards,<br>The Aveling Training Support Team</p>
                `;
                await (0, email_1.sendInfoEmail)(user.email, subject, content);
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
