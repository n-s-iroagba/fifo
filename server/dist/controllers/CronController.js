"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cronController = void 0;
const applicationCron_1 = require("../cron/applicationCron");
const nominationCron_1 = require("../cron/nominationCron");
const contractCron_1 = require("../cron/contractCron");
const sponsorshipCron_1 = require("../cron/sponsorshipCron");
const rtoCron_1 = require("../cron/rtoCron");
const psychometricCron_1 = require("../cron/psychometricCron");
const email_1 = require("../utils/email");
const cronRegistry_1 = require("../cron/cronRegistry");
const notifyAdmin = async (cronName, itemsProcessed) => {
    if (itemsProcessed <= 0)
        return; // Do not send email if nothing happened
    try {
        await (0, email_1.sendInfoEmail)('nnamdisolomon1@gmail.com', `Cron Job Executed: ${cronName}`, `<p>The <strong>${cronName}</strong> cron job has been triggered and successfully processed <strong>${itemsProcessed}</strong> item(s) at ${new Date().toISOString()}.</p>`);
    }
    catch (err) {
        console.error(`Failed to send admin notification for ${cronName}:`, err);
    }
};
exports.cronController = {
    async application(req, res) {
        if ((0, cronRegistry_1.isCronPaused)('application'))
            return res.status(200).json({ success: true, processed: 0, paused: true, cron: 'application' });
        try {
            const count = await (0, applicationCron_1.runApplicationApprovalCron)();
            await notifyAdmin('Application Auto-Acceptance', count);
            res.status(200).json({ success: true, processed: count });
        }
        catch (error) {
            console.error('Error in application cron webhook:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    },
    async employerSelection(req, res) {
        if ((0, cronRegistry_1.isCronPaused)('employer-selection'))
            return res.status(200).json({ success: true, processed: 0, paused: true, cron: 'employer-selection' });
        try {
            const count = await (0, nominationCron_1.runEmployerSelectionDispatchCron)();
            await notifyAdmin('Employer Selection Presentation Dispatch', count);
            res.status(200).json({ success: true, processed: count });
        }
        catch (error) {
            console.error('Error in employer-selection cron webhook:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    },
    async employerAcceptance(req, res) {
        if ((0, cronRegistry_1.isCronPaused)('employer-acceptance'))
            return res.status(200).json({ success: true, processed: 0, paused: true, cron: 'employer-acceptance' });
        try {
            const count = await (0, nominationCron_1.runEmployerAcceptanceCron)();
            await notifyAdmin('Employer Selection Acceptance & Allocation Evaluation', count);
            res.status(200).json({ success: true, processed: count });
        }
        catch (error) {
            console.error('Error in employer-acceptance cron webhook:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    },
    async nomination(req, res) {
        if ((0, cronRegistry_1.isCronPaused)('nomination'))
            return res.status(200).json({ success: true, processed: 0, paused: true, cron: 'nomination' });
        try {
            const count = await (0, nominationCron_1.runNominationFollowupCron)();
            await notifyAdmin('Nomination Followup (Composite)', count);
            res.status(200).json({ success: true, processed: count });
        }
        catch (error) {
            console.error('Error in nomination cron webhook:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    },
    async onboarding(req, res) {
        if ((0, cronRegistry_1.isCronPaused)('onboarding'))
            return res.status(200).json({ success: true, processed: 0, paused: true, cron: 'onboarding' });
        try {
            const { runOnboardingCron } = require('../cron/onboardingCron');
            const count = await runOnboardingCron();
            await notifyAdmin('Post-Interview Onboarding Process Email Followup', count);
            res.status(200).json({ success: true, processed: count });
        }
        catch (error) {
            console.error('Error in onboarding cron webhook:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    },
    async contract(req, res) {
        if ((0, cronRegistry_1.isCronPaused)('contract'))
            return res.status(200).json({ success: true, processed: 0, paused: true, cron: 'contract' });
        try {
            const count = await (0, contractCron_1.runContractApprovalCron)();
            await notifyAdmin('Contract Auto-Approval', count);
            res.status(200).json({ success: true, processed: count });
        }
        catch (error) {
            console.error('Error in contract cron webhook:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    },
    async sponsorship(req, res) {
        if ((0, cronRegistry_1.isCronPaused)('sponsorship'))
            return res.status(200).json({ success: true, processed: 0, paused: true, cron: 'sponsorship' });
        try {
            const count = await (0, sponsorshipCron_1.runSponsorshipCron)();
            await notifyAdmin('Ticket Sponsorship (Call/Invite & Auto-Approval)', count);
            res.status(200).json({ success: true, processed: count });
        }
        catch (error) {
            console.error('Error in sponsorship cron webhook:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    },
    async rto(req, res) {
        const welcomePaused = (0, cronRegistry_1.isCronPaused)('rto-welcome');
        const deliveryPaused = (0, cronRegistry_1.isCronPaused)('rto-delivery');
        if (welcomePaused && deliveryPaused) {
            return res.status(200).json({ success: true, processed: 0, paused: true, cron: 'rto' });
        }
        try {
            const count1 = welcomePaused ? 0 : await (0, rtoCron_1.runRtoWelcomeCron)();
            const count2 = deliveryPaused ? 0 : await (0, rtoCron_1.runRtoTicketDeliveryCron)();
            const count = count1 + count2;
            await notifyAdmin('RTO (CertHero) Welcome & Ticket Delivery', count);
            res.status(200).json({ success: true, processed: count });
        }
        catch (error) {
            console.error('Error in rto cron webhook:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    },
    async aveling(req, res) {
        return (exports.cronController.rto || this.rto)(req, res);
    },
    async psychometric(req, res) {
        if ((0, cronRegistry_1.isCronPaused)('psychometric'))
            return res.status(200).json({ success: true, processed: 0, paused: true, cron: 'psychometric' });
        try {
            const count = await (0, psychometricCron_1.runPsychometricApprovalCron)();
            await notifyAdmin('Psychometric Auto-Approval', count);
            res.status(200).json({ success: true, processed: count });
        }
        catch (error) {
            console.error('Error in psychometric cron webhook:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }
};
