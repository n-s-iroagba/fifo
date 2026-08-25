import { Request, Response } from 'express';
import { runApplicationApprovalCron } from '../cron/applicationCron';
import { runNominationFollowupCron } from '../cron/nominationCron';
import { runContractApprovalCron } from '../cron/contractCron';
import { runSponsorshipApprovalCron } from '../cron/sponsorshipCron';

export const cronController = {
    async application(req: Request, res: Response) {
        try {
            await runApplicationApprovalCron();
            res.status(200).json({ success: true });
        } catch (error: any) {
            console.error('Error in application cron webhook:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    },
    async nomination(req: Request, res: Response) {
        try {
            await runNominationFollowupCron();
            res.status(200).json({ success: true });
        } catch (error: any) {
            console.error('Error in nomination cron webhook:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    },
    async contract(req: Request, res: Response) {
        try {
            await runContractApprovalCron();
            res.status(200).json({ success: true });
        } catch (error: any) {
            console.error('Error in contract cron webhook:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    },
    async sponsorship(req: Request, res: Response) {
        try {
            await runSponsorshipApprovalCron();
            res.status(200).json({ success: true });
        } catch (error: any) {
            console.error('Error in sponsorship cron webhook:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }
};
