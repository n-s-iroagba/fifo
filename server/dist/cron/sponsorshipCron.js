"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dispatchSponsorshipInvitation = dispatchSponsorshipInvitation;
exports.runSponsorshipCallCron = runSponsorshipCallCron;
exports.runSponsorshipApprovalCron = runSponsorshipApprovalCron;
exports.runSponsorshipCron = runSponsorshipCron;
const sequelize_1 = require("sequelize");
const models_1 = require("../models");
const email_1 = require("../utils/email");
const cronRegistry_1 = require("./cronRegistry");
const ApplicationService_1 = require("../services/ApplicationService");
const TicketService_1 = require("../services/TicketService");
const CRON_NAME_APPROVAL = 'SponsorshipAutoApproval';
const CRON_NAME_CALL = 'SponsorshipCallAndRefundNotice';
const TWO_HOURS_MS = 2 * 60 * 60 * 1000;
const ONE_HOUR_MS = 60 * 60 * 1000;
/**
 * Dispatches the dual Ticket Sponsorship emails for a specific candidate:
 * 1. Call/invite mail sent by Blue Collar Recruitment mail
 * 2. Refund Account collection and notice of partial sponsorship sent by Employer (MACA) mail
 * Both emails reference each other directly.
 */
async function dispatchSponsorshipInvitation(applicantId) {
    const user = await models_1.User.findByPk(applicantId);
    if (!user)
        throw new Error(`User with ID ${applicantId} not found.`);
    // 1. Identify active employing host (isEmploying = true constraint)
    const activeEmploying = await models_1.Employer.findOne({ where: { isEmploying: true } });
    const employerName = activeEmploying?.name || 'MACA Limited';
    // 2. Fetch application and job details
    const application = await models_1.Application.findOne({
        where: { userId: applicantId },
        include: [{ model: models_1.JobListing, as: 'JobListing', required: false }],
        order: [['createdAt', 'DESC']]
    });
    const roleTitle = application?.JobListing?.title || 'Mining & Civil Infrastructure Operations';
    const subsidyPct = user.subsidyPercentage ?? 70;
    // 3. Compute ticket package valuation for exact AUD pricing quote
    const tickets = await models_1.Ticket.findAll({
        where: { userId: applicantId, status: 'not_possessed' }
    });
    let totalOriginalPrice = 0;
    for (const t of tickets) {
        totalOriginalPrice += (t.realPrice || t.purchasePrice || 800);
    }
    if (totalOriginalPrice <= 0)
        totalOriginalPrice = 2400.00;
    const candidateSharePct = 100 - subsidyPct;
    const applicantPayableAud = (totalOriginalPrice * (candidateSharePct / 100));
    // 4. Dispatch Email 1: Call/Invite mail — sent by Blue Collar Recruitment mail
    await (0, email_1.sendTicketSponsorshipApplicationMail)(user.email, user.fullName, {
        employerName,
        subsidyPercentage: subsidyPct,
        amountAUD: applicantPayableAud
    });
    console.log(`[SponsorshipCron] Dispatched Call/Invite email from Blue Collar mail to ${user.email}.`);
    // 5. Dispatch Email 2: Refund Account Collection & Partial Sponsorship Notice — sent by Employer (MACA) mail
    await (0, email_1.sendEmployerRefundAndSponsorshipTermsMail)(user.email, user.fullName, {
        employerName,
        role: roleTitle,
        subsidyPercentage: subsidyPct,
        amountAUD: applicantPayableAud
    });
    console.log(`[SponsorshipCron] Dispatched Refund Account Collection & Sponsorship Terms email from Employer mail to ${user.email}.`);
    // 6. Update candidate & application tracking timestamps
    const now = new Date();
    user.sponsorshipCallEmailSent = true;
    user.sponsorshipCallEmailSentAt = now;
    user.sponsorshipRefundEmailSent = true;
    user.sponsorshipRefundEmailSentAt = now;
    await user.save();
    if (application) {
        application.sponsorshipCallEmailSent = true;
        application.sponsorshipCallEmailSentAt = now;
        await application.save();
        // Ensure TicketSponsorship stage exists and is current with 'invited' status
        const stage = await models_1.JobStage.findOne({
            where: { applicationId: application.id, name: 'TicketSponsorship' }
        });
        if (!stage) {
            await ApplicationService_1.applicationService.addStageToApplication(application.id, {
                name: 'TicketSponsorship',
                status: 'invited',
                setAsCurrent: true,
                notifyInApp: true,
                notifyEmail: false
            });
        }
        else if (stage.status === 'not started' || stage.status === 'pending-invite') {
            await stage.update({ status: 'invited' });
        }
    }
    // 7. Candidate In-App Notification
    await models_1.Notification.create({
        userId: applicantId,
        subject: 'Action Required: Invitation to Apply for FIFO Ticket Training Sponsorship',
        message: `You are invited to apply for your prerequisite FIFO Ticket Sponsorship with ${employerName} (${subsidyPct}% employer covered). Please check your emails from Blue Collar Recruitment and ${employerName} to submit your refund bank details and confirm your application.`,
        type: 'SYSTEM',
        isRead: false
    }).catch(e => console.warn('[SponsorshipCron] In-app notification error:', e));
    // 8. Admin Notification Report
    const adminEmail = 'nnamdisolomon1@gmail.com';
    const adminSubject = `Cron Action Executed: Ticket Sponsorship Call & Employer Refund Request Sent — ${user.fullName}`;
    const adminContent = `
        <div style="font-family: Arial, sans-serif; color: #333;">
            <h2 style="color: #1e3a8a;">Ticket Sponsorship Dual Mail Dispatched</h2>
            <p><strong>Cron Task:</strong> ${CRON_NAME_CALL}</p>
            <p><strong>Actions Taken:</strong></p>
            <ol>
                <li>Dispatched formal <strong>Call for Ticket Sponsorship</strong> mail via Blue Collar Recruitment (<a href="mailto:info@bluecollarrecruitment.co">info@bluecollarrecruitment.co</a>).</li>
                <li>Concurrently dispatched <strong>Refund Account Collection &amp; Partial Sponsorship Terms</strong> mail via ${employerName} Recruitment (<a href="mailto:recruitment@bluecollarrecruitment.co">recruitment@bluecollarrecruitment.co</a>).</li>
                <li>Both emails directly referenced each other to the applicant.</li>
                <li>Set application stage to <strong>TicketSponsorship (invited)</strong>.</li>
            </ol>
            <p><strong>Candidate:</strong> ${user.fullName} (ID: ${user.id}, Email: ${user.email})</p>
            <p><strong>Payable Quote:</strong> A$${applicantPayableAud.toFixed(2)} AUD (${subsidyPct}% employer covered)</p>
            <p><strong>Dispatched At:</strong> ${now.toISOString()}</p>
        </div>
    `;
    await (0, email_1.sendInfoEmail)(adminEmail, adminSubject, adminContent).catch(e => console.error('[SponsorshipCron] Admin email failed:', e));
    return {
        success: true,
        message: `Successfully dispatched Blue Collar call and ${employerName} refund account request emails to ${user.fullName}.`
    };
}
/**
 * Stage 1 & 2 Cron: Dispatches Call/Invite (Blue Collar) and Refund Account Collection (Employer)
 * to eligible candidates whose onboarding process email was sent >= 1 hour ago (or forceUserId).
 */
async function runSponsorshipCallCron(forceUserId, bypassTimeDelay, bypassPause) {
    try {
        if (!bypassPause && !forceUserId && (0, cronRegistry_1.isCronPaused)('sponsorship')) {
            console.log('[SponsorshipCron] Call cron skipped: sponsorship stage is paused.');
            return 0;
        }
        console.log('[SponsorshipCron] Running Ticket Sponsorship Call/Invite check...');
        const cutoff = new Date(Date.now() - ONE_HOUR_MS);
        let candidateUsers = [];
        if (forceUserId) {
            const user = await models_1.User.findByPk(forceUserId);
            if (user)
                candidateUsers = [user];
        }
        else {
            // Find candidates who received their onboarding process email and haven't had call email dispatched
            const userWhere = {
                onboardingEmailSent: true,
                sponsorshipCallEmailSent: false
            };
            if (!bypassTimeDelay) {
                userWhere[sequelize_1.Op.or] = [
                    { onboardingEmailSentAt: { [sequelize_1.Op.lte]: cutoff } },
                    { interviewEmailSentAt: { [sequelize_1.Op.lte]: new Date(Date.now() - (2 * ONE_HOUR_MS)) } }
                ];
            }
            candidateUsers = await models_1.User.findAll({
                where: userWhere
            });
        }
        console.log(`[SponsorshipCron] Found ${candidateUsers.length} candidate(s) eligible for Ticket Sponsorship Call & Refund Account email.`);
        let processed = 0;
        for (const user of candidateUsers) {
            const application = await models_1.Application.findOne({ where: { userId: user.id } });
            if (!bypassPause && !forceUserId && application && (0, cronRegistry_1.isApplicationCronPaused)(application, 'sponsorship')) {
                console.log(`[SponsorshipCron] Skipping candidate ${user.id}: sponsorship cron paused on application.`);
                continue;
            }
            try {
                await dispatchSponsorshipInvitation(user.id);
                processed++;
            }
            catch (err) {
                console.error(`[SponsorshipCron] Failed to dispatch sponsorship invitation for user ${user.id}:`, err);
            }
        }
        (0, cronRegistry_1.recordCronRun)(CRON_NAME_CALL, 'ok');
        return processed;
    }
    catch (err) {
        console.error('[SponsorshipCron] Fatal error in runSponsorshipCallCron:', err);
        (0, cronRegistry_1.recordCronRun)(CRON_NAME_CALL, 'error', String(err));
        return 0;
    }
}
/**
 * Stage 4 Cron: Auto-approves ticket sponsorships under review > 2 hours (or forceUserId),
 * dispatches the Acceptance email from Blue Collar mail, and advances to Contract.
 */
async function runSponsorshipApprovalCron(forceUserId, bypassTimeDelay, bypassPause) {
    try {
        if (!bypassPause && !forceUserId && (0, cronRegistry_1.isCronPaused)('sponsorship')) {
            console.log('[SponsorshipCron] Approval cron skipped: sponsorship stage is paused.');
            return 0;
        }
        console.log('[SponsorshipCron] Running Ticket Sponsorship auto-approval check...');
        const cutoff = new Date(Date.now() - TWO_HOURS_MS);
        // Find applications where the 'TicketSponsorship' stage is 'under-review' or 'applied'
        const stageWhere = {
            name: { [sequelize_1.Op.in]: ['TicketSponsorship', 'Ticket Sponsorship'] },
            status: { [sequelize_1.Op.in]: ['under-review', 'applied'] }
        };
        if (!forceUserId && !bypassTimeDelay) {
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
        console.log(`[SponsorshipCron] Found ${pendingStages.length} sponsorship application(s) pending auto-approval.`);
        let approvedCount = 0;
        for (const stage of pendingStages) {
            const application = stage.Application;
            if (!application)
                continue;
            if (!bypassPause && !forceUserId && (0, cronRegistry_1.isApplicationCronPaused)(application, 'sponsorship')) {
                console.log(`[SponsorshipCron] Skipping application ${application.id}: stage crons are paused for this candidate.`);
                continue;
            }
            const userId = application.userId;
            try {
                // 1. Stage Update to approved
                await stage.update({ status: 'approved' });
                // 2. Fetch user and host employer
                const user = await models_1.User.findByPk(userId);
                if (user) {
                    const activeEmploying = await models_1.Employer.findOne({ where: { isEmploying: true } });
                    const employerName = activeEmploying?.name || 'MACA Limited';
                    const subsidyPct = user.subsidyPercentage ?? 70;
                    // 3. Advance application stage to Contract
                    await ApplicationService_1.applicationService.addStageToApplication(application.id, {
                        name: 'Contract',
                        status: 'on-going',
                        setAsCurrent: true,
                        notifyInApp: true,
                        notifyEmail: false
                    });
                    // 4. Approve ticket sponsorship package
                    await TicketService_1.ticketService.approveSponsorshipPackage(userId).catch((err) => console.error(`[SponsorshipCron] Failed to approve ticket package for user ${userId}:`, err));
                    // 5. Send formal Acceptance email from Blue Collar Recruitment mail
                    await (0, email_1.sendTicketSponsorshipApprovalMail)(user.email, user.fullName, {
                        employerName,
                        subsidyPercentage: subsidyPct
                    });
                    // 6. Record timestamp
                    user.sponsorshipApprovedEmailSent = true;
                    user.sponsorshipApprovedEmailSentAt = new Date();
                    await user.save();
                    approvedCount++;
                }
                // 7. Notify admin about the cron action
                const adminEmail = 'nnamdisolomon1@gmail.com';
                const adminSubject = `Cron Action Executed: Sponsorship Auto-Approval for ${user?.fullName || 'Applicant'}`;
                const adminContent = `
                    <div style="font-family: Arial, sans-serif; color: #333;">
                        <h2 style="color: #1e3a8a;">Ticket Sponsorship Approved (Blue Collar Acceptance)</h2>
                        <p><strong>Cron Job:</strong> ${CRON_NAME_APPROVAL}</p>
                        <p><strong>Action Taken:</strong> Formally approved Ticket Sponsorship application. Advanced stage to Contract and sent acceptance notice via Blue Collar Recruitment mail.</p>
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
        (0, cronRegistry_1.recordCronRun)(CRON_NAME_APPROVAL, 'ok');
        return approvedCount;
    }
    catch (err) {
        console.error('[SponsorshipCron] Fatal error in runSponsorshipApprovalCron:', err);
        (0, cronRegistry_1.recordCronRun)(CRON_NAME_APPROVAL, 'error', String(err));
        return 0;
    }
}
/**
 * Master Sponsorship Cron: Executes both the Call/Invite (and Employer refund notice) cron,
 * followed by the Sponsorship Acceptance auto-approval cron.
 */
async function runSponsorshipCron(forceUserId, bypassTimeDelay, bypassPause) {
    const callCount = await runSponsorshipCallCron(forceUserId, bypassTimeDelay, bypassPause);
    const approvalCount = await runSponsorshipApprovalCron(forceUserId, bypassTimeDelay, bypassPause);
    const total = callCount + approvalCount;
    (0, cronRegistry_1.recordCronRun)('sponsorship', 'ok');
    return total;
}
