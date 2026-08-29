"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runAvelingWelcomeCron = runAvelingWelcomeCron;
exports.runAvelingTicketDeliveryCron = runAvelingTicketDeliveryCron;
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
async function runAvelingTicketDeliveryCron() {
    try {
        console.log('[AvelingCron] Running aveling ticket delivery check...');
        const FOUR_HOURS_MS = 4 * 60 * 60 * 1000;
        const cutoff = new Date(Date.now() - FOUR_HOURS_MS);
        // Find users who might have tickets ready
        const users = await models_1.User.findAll({
            where: {
                role: 'applicant'
            },
            include: [{
                    model: models_1.Ticket,
                    as: 'Tickets',
                    required: true // only users with tickets
                }]
        });
        let processedCount = 0;
        for (const user of users) {
            const anyUser = user;
            const prefs = anyUser.preferences || {};
            if (prefs.certificatesSent) {
                continue;
            }
            const tickets = anyUser.Tickets || [];
            if (tickets.length === 0)
                continue;
            // Check if all tickets have been taken
            // Taken means ticketSponsorship is in 'ticket_issued', 'first_attempt_failed', 'second_attempt_failed'
            const allTaken = tickets.every(t => ['ticket_issued', 'first_attempt_failed', 'second_attempt_failed'].includes(t.ticketSponsorship));
            if (!allTaken)
                continue;
            // Check if at least one ticket was issued (passed)
            const passedTickets = tickets.filter(t => t.ticketSponsorship === 'ticket_issued');
            if (passedTickets.length === 0)
                continue;
            // Check if the most recent update is > 4 hours ago
            const lastUpdated = new Date(Math.max(...tickets.map(t => new Date(t.updatedAt).getTime())));
            if (lastUpdated > cutoff) {
                continue;
            }
            // Generate HTML for the PDF-like tickets
            let ticketsHtml = '';
            for (const pt of passedTickets) {
                ticketsHtml += `
                <div style="border: 2px solid #000; padding: 20px; margin-bottom: 20px; border-radius: 8px; background: #fff;">
                    <div style="text-align: center; border-bottom: 2px solid #FFC700; padding-bottom: 10px; margin-bottom: 10px;">
                        <h2 style="margin: 0; color: #000; font-family: 'Times New Roman', serif; text-transform: uppercase;">Statement of Attainment</h2>
                        <p style="margin: 5px 0 0; font-size: 12px; color: #555;">Aveling LMS Training - Certified Digital Copy</p>
                    </div>
                    <div style="font-family: Arial, sans-serif;">
                        <p><strong>This is to certify that:</strong></p>
                        <h3 style="margin: 5px 0; color: #1e3a8a; text-transform: uppercase;">${user.fullName}</h3>
                        <p><strong>Candidate ID:</strong> ${user.candidateNumber || 'N/A'}</p>
                        <p style="margin-top: 20px;"><strong>Has fulfilled the requirements for:</strong></p>
                        <h3 style="margin: 5px 0; color: #000;">${pt.ticketType}</h3>
                        <p style="margin-top: 20px;"><strong>Date Issued:</strong> ${new Date(pt.updatedAt).toLocaleDateString()}</p>
                        <p style="margin-top: 30px; font-size: 11px; color: #777; border-top: 1px dashed #ccc; padding-top: 10px;">
                            This is an official digital ticket. A downloadable PDF version can also be generated from your portal.
                        </p>
                    </div>
                </div>
                `;
            }
            const subject = 'Your Official Digital Tickets & Statements of Attainment';
            const content = `
                <p>Dear ${user.fullName},</p>
                <p>Congratulations on completing your Aveling LMS Training requirements. Below you will find your digital Statement(s) of Attainment.</p>
                <div style="background-color: #f3f4f6; padding: 20px; margin: 20px 0; border-radius: 10px;">
                    ${ticketsHtml}
                </div>
                <p>You can download the PDF versions of these certificates directly from your candidate dashboard under the <strong>Tickets</strong> section.</p>
                <p>Best regards,<br>Aveling Training & Blue Collar Recruitment Team</p>
            `;
            try {
                const { sendAvelingEmail } = require('../utils/email');
                await sendAvelingEmail(user.email, subject, content);
                // Mark as sent
                prefs.certificatesSent = true;
                await user.update({ preferences: prefs });
                processedCount++;
                console.log(`[AvelingCron] Sent digital tickets to user ${user.id}`);
            }
            catch (innerErr) {
                console.error(`[AvelingCron] Failed to send tickets to user ${user.id}:`, innerErr);
            }
        }
        (0, cronRegistry_1.recordCronRun)('AvelingTicketDelivery', 'ok');
        return processedCount;
    }
    catch (err) {
        console.error('[AvelingCron] Ticket delivery fatal error:', err);
        (0, cronRegistry_1.recordCronRun)('AvelingTicketDelivery', 'error', String(err));
        return 0;
    }
}
