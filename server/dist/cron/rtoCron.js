"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runAvelingTicketDeliveryCron = exports.runAvelingWelcomeCron = void 0;
exports.runRtoWelcomeCron = runRtoWelcomeCron;
exports.runRtoTicketDeliveryCron = runRtoTicketDeliveryCron;
const sequelize_1 = require("sequelize");
const models_1 = require("../models");
const email_1 = require("../utils/email");
const cronRegistry_1 = require("./cronRegistry");
const axios_1 = __importDefault(require("axios"));
const CRON_NAME = 'RtoWelcome';
const THREE_HOURS_MS = 3 * 60 * 60 * 1000;
async function runRtoWelcomeCron(forceUserId) {
    try {
        console.log('[RtoCron] Running RTO (CertHero) welcome check...');
        const cutoff = new Date(Date.now() - THREE_HOURS_MS);
        const contractWhere = {
            status: 'accepted',
            [sequelize_1.Op.or]: [
                { rtoWelcomeSent: false },
                { avelingWelcomeSent: false }
            ]
        };
        if (!forceUserId) {
            contractWhere.updatedAt = { [sequelize_1.Op.lte]: cutoff };
        }
        const contracts = await models_1.Contract.findAll({
            where: contractWhere,
            include: [
                {
                    model: models_1.Application,
                    required: true
                },
                {
                    model: models_1.User,
                    where: forceUserId ? { id: forceUserId } : undefined,
                    required: true
                }
            ]
        });
        console.log(`[RtoCron] Found ${contracts.length} candidates pending RTO welcome.`);
        // Fetch USD to AUD exchange rate
        let audToUsd = 0.65; // fallback
        try {
            const xr = await axios_1.default.get('https://api.exchangerate-api.com/v4/latest/AUD');
            if (xr.data && xr.data.rates && xr.data.rates.USD) {
                audToUsd = xr.data.rates.USD;
            }
        }
        catch (err) {
            console.error('[RtoCron] Failed to fetch exchange rate, using fallback.', err.message);
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
                    ticketListHtml += `<li style="padding: 10px 0; border-bottom: 1px solid #e2e8f0;"><strong>${t.ticketType}</strong>: Total A$${price.toFixed(2)} (You pay A$${candShare.toFixed(2)})</li>`;
                });
                ticketListHtml += '</ul>';
                const totalCandidateUsd = totalCandidateAud * audToUsd;
                const subject = 'Your CertHero RTO Training Payment Confirmation';
                const content = `
                    <div style="padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
                        <p>Dear ${user.fullName},</p>
                        <p>Welcome to the Ticket Courses and Exams phase. Your onboarding will now be handled by our partner Registered Training Organisation, <strong>CertHero</strong>.</p>
                        
                        <div style="background-color: #f8fafc; padding: 18px; border-left: 4px solid #ED9139; border-radius: 8px; margin: 20px 0;">
                            <h3 style="margin-top: 0; color: #0f172a; font-size: 16px;">Required Ticket Competencies</h3>
                            ${ticketListHtml}
                        </div>
                        
                        <div style="background-color: #0f172a; color: #ffffff; padding: 22px; text-align: center; border-radius: 10px; margin: 20px 0;">
                            <p style="margin: 0; font-size: 14px; text-transform: uppercase; letter-spacing: 0.1em; color: #94a3b8;">Corporate Subsidy Applied: <strong><span style="color: #ED9139;">${companySub}%</span></strong></p>
                            <h2 style="margin: 10px 0 0 0; font-size: 26px; color: #ffffff;">TOTAL TO REMIT: A$${totalCandidateAud.toFixed(2)}</h2>
                        </div>
                        
                        <p>Before proceeding, please review your payment options:</p>
                        <ul style="padding-left: 20px; line-height: 1.6; color: #334155;">
                            <li style="margin-bottom: 10px;"><strong>Option 1:</strong> Pay the total amount in full and receive a <strong>10% discount</strong> courtesy of CertHero RTO.</li>
                            <li><strong>Option 2:</strong> Pay half the amount now, and complete the remaining payment before your 3rd ticket certification is dispatched.</li>
                        </ul>
                        
                        <div style="background-color: #fef3c7; color: #92400e; padding: 16px; font-weight: 700; text-align: center; border-radius: 8px; margin-top: 22px; border: 1px solid #fde68a;">
                            <p style="margin: 0;">ACTION REQUIRED: Please reply to this email indicating your preferred payment option. Your official CertHero training invoice will be issued upon your reply.</p>
                        </div>
                        
                        <p style="margin-top: 24px;">We look forward to helping you achieve your Australian FIFO compliance and site readiness.</p>
                        <p>Warm regards,<br><strong>The CertHero RTO Training Support Team</strong></p>
                    </div>
                `;
                await (0, email_1.sendRtoEmail)(user.email, subject, content);
                await (0, email_1.sendRtoEmail)('nnamdisolomon1@gmail.com', subject, content);
                contract.rtoWelcomeSent = true;
                contract.avelingWelcomeSent = true;
                await contract.save();
                // Notify admin about the cron action
                const adminEmail = 'nnamdisolomon1@gmail.com';
                const adminSubject = `Cron Action Executed: RTO Welcome Sent for ${user?.fullName || 'Applicant'}`;
                const adminContent = `
                    <div style="font-family: Arial, sans-serif; color: #333;">
                        <h2 style="color: #0f172a;">Cron Job Execution Report</h2>
                        <p><strong>Cron Job:</strong> ${CRON_NAME}</p>
                        <p><strong>Action Taken:</strong> Sent the CertHero RTO Training Invoice & Payment Details (Welcome) email to candidate. 3 hours passed since contract acceptance.</p>
                        <p><strong>Applicant Involved:</strong> ${user?.fullName || 'Unknown'} (User ID: ${user.id}, Email: ${user?.email || 'N/A'})</p>
                        <p><strong>Application ID:</strong> ${application.id}</p>
                    </div>
                `;
                await (0, email_1.sendInfoEmail)(adminEmail, adminSubject, adminContent).catch(err => console.error(`[RtoCron] Admin email failed for user ${user.id}:`, err));
                console.log(`[RtoCron] Sent welcome to user ${user.id}.`);
            }
            catch (innerErr) {
                console.error(`[RtoCron] Error processing contract ${contract.id}:`, innerErr);
            }
        }
        (0, cronRegistry_1.recordCronRun)(CRON_NAME, 'ok');
        return contracts.length;
    }
    catch (err) {
        console.error('[RtoCron] Fatal error:', err);
        (0, cronRegistry_1.recordCronRun)(CRON_NAME, 'error', String(err));
        return 0;
    }
}
async function runRtoTicketDeliveryCron(forceUserId) {
    try {
        console.log('[RtoCron] Running RTO ticket delivery check...');
        const FOUR_HOURS_MS = 4 * 60 * 60 * 1000;
        const cutoff = new Date(Date.now() - FOUR_HOURS_MS);
        const userWhere = { role: 'applicant' };
        if (forceUserId) {
            userWhere.id = forceUserId;
        }
        const users = await models_1.User.findAll({
            where: userWhere,
            include: [{
                    model: models_1.Ticket,
                    as: 'Tickets',
                    required: true
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
            const allTaken = tickets.every(t => ['ticket_issued', 'first_attempt_failed', 'second_attempt_failed'].includes(t.ticketSponsorship));
            if (!allTaken)
                continue;
            const passedTickets = tickets.filter(t => t.ticketSponsorship === 'ticket_issued');
            if (passedTickets.length === 0)
                continue;
            const lastUpdated = new Date(Math.max(...tickets.map(t => new Date(t.updatedAt).getTime())));
            if (!forceUserId && lastUpdated > cutoff) {
                continue;
            }
            let ticketsHtml = '';
            for (const pt of passedTickets) {
                ticketsHtml += `
                <div style="border: 2px solid #0f172a; padding: 22px; margin-bottom: 20px; border-radius: 10px; background: #ffffff;">
                    <div style="text-align: center; border-bottom: 2px solid #ED9139; padding-bottom: 12px; margin-bottom: 14px;">
                        <h2 style="margin: 0; color: #0f172a; font-family: 'Inter', serif; text-transform: uppercase; letter-spacing: 0.1em; font-size: 18px;">Statement of Attainment</h2>
                        <p style="margin: 5px 0 0; font-size: 12px; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 0.15em;">CertHero RTO Training — Certified Digital Qualification</p>
                    </div>
                    <div style="font-family: 'Inter', Arial, sans-serif;">
                        <p style="color: #64748b; font-size: 13px; margin: 0 0 4px;">This is to certify that:</p>
                        <h3 style="margin: 0 0 10px; color: #0f172a; text-transform: uppercase; font-size: 20px;">${user.fullName}</h3>
                        <p style="color: #64748b; font-size: 13px; margin: 0 0 16px;"><strong>Candidate Reference ID:</strong> ${user.candidateNumber || user.rtoUsername || 'N/A'}</p>
                        <p style="color: #64748b; font-size: 13px; margin: 0 0 4px;">Has fulfilled the national assessment requirements for competency:</p>
                        <h3 style="margin: 0 0 16px; color: #ED9139; font-size: 18px;">${pt.ticketType}</h3>
                        <p style="color: #64748b; font-size: 13px; margin: 0 0 4px;"><strong>Date Attained:</strong> ${new Date(pt.updatedAt).toLocaleDateString()}</p>
                        <p style="margin-top: 24px; font-size: 11px; color: #94a3b8; border-top: 1px dashed #cbd5e1; padding-top: 10px;">
                            Official digital certification verified under Nationally Recognised Training and AQF compliance frameworks.
                        </p>
                    </div>
                </div>
                `;
            }
            const subject = 'Your Official CertHero Digital Tickets & Statements of Attainment';
            const content = `
                <p>Dear ${user.fullName},</p>
                <p>Congratulations on completing your CertHero RTO Training requirements. Below you will find your digital Statement(s) of Attainment.</p>
                <div style="background-color: #f8fafc; padding: 20px; margin: 20px 0; border-radius: 12px; border: 1px solid #e2e8f0;">
                    ${ticketsHtml}
                </div>
                <p>You can also download PDF versions of these certificates directly from your candidate dashboard under the <strong>My Certifications</strong> section.</p>
                <p>Best regards,<br>CertHero RTO & Blue Collar Recruitment Team</p>
            `;
            try {
                await (0, email_1.sendRtoEmail)(user.email, subject, content);
                prefs.certificatesSent = true;
                await user.update({ preferences: prefs });
                processedCount++;
                const adminEmail = 'nnamdisolomon1@gmail.com';
                const adminSubject = `Cron Action Executed: Digital Tickets Delivered for ${user?.fullName || 'Applicant'}`;
                const adminContent = `
                    <div style="font-family: Arial, sans-serif; color: #333;">
                        <h2 style="color: #0f172a;">Cron Job Execution Report</h2>
                        <p><strong>Cron Job:</strong> RtoTicketDelivery</p>
                        <p><strong>Action Taken:</strong> Sent digital tickets (Statement of Attainment) email to candidate. 4 hours passed since last ticket update.</p>
                        <p><strong>Applicant Involved:</strong> ${user?.fullName || 'Unknown'} (User ID: ${user.id}, Email: ${user?.email || 'N/A'})</p>
                    </div>
                `;
                await (0, email_1.sendInfoEmail)(adminEmail, adminSubject, adminContent).catch((err) => console.error(`[RtoCron] Admin email failed for user ${user.id}:`, err));
                console.log(`[RtoCron] Sent digital tickets to user ${user.id}`);
            }
            catch (innerErr) {
                console.error(`[RtoCron] Failed to send tickets to user ${user.id}:`, innerErr);
            }
        }
        (0, cronRegistry_1.recordCronRun)('RtoTicketDelivery', 'ok');
        return processedCount;
    }
    catch (err) {
        console.error('[RtoCron] Ticket delivery fatal error:', err);
        (0, cronRegistry_1.recordCronRun)('RtoTicketDelivery', 'error', String(err));
        return 0;
    }
}
exports.runAvelingWelcomeCron = runRtoWelcomeCron;
exports.runAvelingTicketDeliveryCron = runRtoTicketDeliveryCron;
