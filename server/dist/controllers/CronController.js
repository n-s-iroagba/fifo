"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cronController = void 0;
const applicationCron_1 = require("../cron/applicationCron");
const nominationCron_1 = require("../cron/nominationCron");
const contractCron_1 = require("../cron/contractCron");
const sponsorshipCron_1 = require("../cron/sponsorshipCron");
const email_1 = require("../utils/email");
const notifyAdmin = async (cronName) => {
    try {
        await (0, email_1.sendInfoEmail)('nnamdisolomon1@gmail.com', `Cron Job Triggered: ${cronName}`, `<p>The <strong>${cronName}</strong> cron job has been triggered and executed at ${new Date().toISOString()}.</p>`);
    }
    catch (err) {
        console.error(`Failed to send admin notification for ${cronName}:`, err);
    }
};
exports.cronController = {
    async application(req, res) {
        try {
            await (0, applicationCron_1.runApplicationApprovalCron)();
            await notifyAdmin('Application Auto-Acceptance');
            res.status(200).json({ success: true });
        }
        catch (error) {
            console.error('Error in application cron webhook:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    },
    async nomination(req, res) {
        try {
            await (0, nominationCron_1.runNominationFollowupCron)();
            await notifyAdmin('Nomination Followup');
            res.status(200).json({ success: true });
        }
        catch (error) {
            console.error('Error in nomination cron webhook:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    },
    async contract(req, res) {
        try {
            await (0, contractCron_1.runContractApprovalCron)();
            await notifyAdmin('Contract Auto-Approval');
            res.status(200).json({ success: true });
        }
        catch (error) {
            console.error('Error in contract cron webhook:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    },
    async sponsorship(req, res) {
        try {
            await (0, sponsorshipCron_1.runSponsorshipApprovalCron)();
            await notifyAdmin('Sponsorship Auto-Approval');
            res.status(200).json({ success: true });
        }
        catch (error) {
            console.error('Error in sponsorship cron webhook:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }
};
