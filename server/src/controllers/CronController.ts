import { Request, Response } from 'express';
import { runApplicationApprovalCron } from '../cron/applicationCron';
import { runNominationFollowupCron } from '../cron/nominationCron';
import { runContractApprovalCron } from '../cron/contractCron';
import { runSponsorshipApprovalCron } from '../cron/sponsorshipCron';
import { runAvelingWelcomeCron, runAvelingTicketDeliveryCron } from '../cron/avelingCron';
import { runPsychometricApprovalCron } from '../cron/psychometricCron';
import { sendInfoEmail } from '../utils/email';

const notifyAdmin = async (cronName: string, itemsProcessed: number) => {
    if (itemsProcessed <= 0) return; // Do not send email if nothing happened

    try {
        await sendInfoEmail(
            'nnamdisolomon1@gmail.com',
            `Cron Job Executed: ${cronName}`,
            `<p>The <strong>${cronName}</strong> cron job has been triggered and successfully processed <strong>${itemsProcessed}</strong> item(s) at ${new Date().toISOString()}.</p>`
        );
    } catch (err) {
        console.error(`Failed to send admin notification for ${cronName}:`, err);
    }
};

export const cronController = {
    async application(req: Request, res: Response) {
        try {
            const count = await runApplicationApprovalCron();
            await notifyAdmin('Application Auto-Acceptance', count);
            res.status(200).json({ success: true, processed: count });
        } catch (error: any) {
            console.error('Error in application cron webhook:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    },
    async nomination(req: Request, res: Response) {
        try {
            const count = await runNominationFollowupCron();
            await notifyAdmin('Nomination Followup', count);
            res.status(200).json({ success: true, processed: count });
        } catch (error: any) {
            console.error('Error in nomination cron webhook:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    },
    async contract(req: Request, res: Response) {
        try {
            const count = await runContractApprovalCron();
            await notifyAdmin('Contract Auto-Approval', count);
            res.status(200).json({ success: true, processed: count });
        } catch (error: any) {
            console.error('Error in contract cron webhook:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    },
    async sponsorship(req: Request, res: Response) {
        try {
            const count = await runSponsorshipApprovalCron();
            await notifyAdmin('Sponsorship Auto-Approval', count);
            res.status(200).json({ success: true, processed: count });
        } catch (error: any) {
            console.error('Error in sponsorship cron webhook:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    },
    async aveling(req: Request, res: Response) {
        try {
            const count1 = await runAvelingWelcomeCron();
            const count2 = await runAvelingTicketDeliveryCron();
            const count = count1 + count2;
            await notifyAdmin('Aveling Welcome & Ticket Delivery', count);
            res.status(200).json({ success: true, processed: count });
        } catch (error: any) {
            console.error('Error in aveling cron webhook:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    },
    async psychometric(req: Request, res: Response) {
        try {
            const count = await runPsychometricApprovalCron();
            await notifyAdmin('Psychometric Auto-Approval', count);
            res.status(200).json({ success: true, processed: count });
        } catch (error: any) {
            console.error('Error in psychometric cron webhook:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }
};
