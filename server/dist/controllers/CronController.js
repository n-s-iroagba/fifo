"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cronController = void 0;
const applicationCron_1 = require("../cron/applicationCron");
const nominationCron_1 = require("../cron/nominationCron");
const contractCron_1 = require("../cron/contractCron");
const sponsorshipCron_1 = require("../cron/sponsorshipCron");
const avelingCron_1 = require("../cron/avelingCron");
const psychometricCron_1 = require("../cron/psychometricCron");
const email_1 = require("../utils/email");
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
    async nomination(req, res) {
        try {
            const count = await (0, nominationCron_1.runNominationFollowupCron)();
            await notifyAdmin('Nomination Followup', count);
            res.status(200).json({ success: true, processed: count });
        }
        catch (error) {
            console.error('Error in nomination cron webhook:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    },
    async contract(req, res) {
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
        try {
            const count = await (0, sponsorshipCron_1.runSponsorshipApprovalCron)();
            await notifyAdmin('Sponsorship Auto-Approval', count);
            res.status(200).json({ success: true, processed: count });
        }
        catch (error) {
            console.error('Error in sponsorship cron webhook:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    },
    async aveling(req, res) {
        try {
            const count1 = await (0, avelingCron_1.runAvelingWelcomeCron)();
            const count2 = await (0, avelingCron_1.runAvelingTicketDeliveryCron)();
            const count = count1 + count2;
            await notifyAdmin('Aveling Welcome & Ticket Delivery', count);
            res.status(200).json({ success: true, processed: count });
        }
        catch (error) {
            console.error('Error in aveling cron webhook:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    },
    async psychometric(req, res) {
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
