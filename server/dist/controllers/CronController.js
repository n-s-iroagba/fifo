"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cronController = void 0;
const applicationCron_1 = require("../cron/applicationCron");
const nominationCron_1 = require("../cron/nominationCron");
const contractCron_1 = require("../cron/contractCron");
const sponsorshipCron_1 = require("../cron/sponsorshipCron");
exports.cronController = {
    async application(req, res) {
        try {
            await (0, applicationCron_1.runApplicationApprovalCron)();
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
            res.status(200).json({ success: true });
        }
        catch (error) {
            console.error('Error in sponsorship cron webhook:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }
};
