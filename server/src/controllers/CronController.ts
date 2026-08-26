import { Request, Response } from 'express';
import { runApplicationApprovalCron } from '../cron/applicationCron';
import { runNominationFollowupCron } from '../cron/nominationCron';
import { runContractApprovalCron } from '../cron/contractCron';
import { runSponsorshipApprovalCron } from '../cron/sponsorshipCron';
import { runAvelingWelcomeCron } from '../cron/avelingCron';
import { sendInfoEmail } from '../utils/email';

const notifyAdmin = async (cronName: string) => {
    try {
        await sendInfoEmail(
            'nnamdisolomon1@gmail.com',
            `Cron Job Triggered: ${cronName}`,
            `<p>The <strong>${cronName}</strong> cron job has been triggered and executed at ${new Date().toISOString()}.</p>`
        );
    } catch (err) {
        console.error(`Failed to send admin notification for ${cronName}:`, err);
    }
};

export const cronController = {
    async application(req: Request, res: Response) {
        try {
            await runApplicationApprovalCron();
            await notifyAdmin('Application Auto-Acceptance');
            res.status(200).json({ success: true });
        } catch (error: any) {
            console.error('Error in application cron webhook:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    },
    async nomination(req: Request, res: Response) {
        try {
            await runNominationFollowupCron();
            await notifyAdmin('Nomination Followup');
            res.status(200).json({ success: true });
        } catch (error: any) {
            console.error('Error in nomination cron webhook:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    },
    async contract(req: Request, res: Response) {
        try {
            await runContractApprovalCron();
            await notifyAdmin('Contract Auto-Approval');
            res.status(200).json({ success: true });
        } catch (error: any) {
            console.error('Error in contract cron webhook:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    },
    async sponsorship(req: Request, res: Response) {
        try {
            await runSponsorshipApprovalCron();
            await notifyAdmin('Sponsorship Auto-Approval');
            res.status(200).json({ success: true });
        } catch (error: any) {
            console.error('Error in sponsorship cron webhook:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    },
    async aveling(req: Request, res: Response) {
        try {
            await runAvelingWelcomeCron();
            await notifyAdmin('Aveling Welcome');
            res.status(200).json({ success: true });
        } catch (error: any) {
            console.error('Error in aveling cron webhook:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }
};
