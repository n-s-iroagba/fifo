import { Request, Response } from 'express';
import { runApplicationApprovalCron } from '../cron/applicationCron';
import { runNominationFollowupCron } from '../cron/nominationCron';
import { runContractApprovalCron } from '../cron/contractCron';
import { runSponsorshipCron, runSponsorshipApprovalCron, runSponsorshipCallCron } from '../cron/sponsorshipCron';
import { runRtoWelcomeCron, runRtoTicketDeliveryCron, runAvelingWelcomeCron, runAvelingTicketDeliveryCron } from '../cron/rtoCron';
import { runPsychometricApprovalCron } from '../cron/psychometricCron';
import { sendInfoEmail } from '../utils/email';
import { areCronsPaused, isCronPaused } from '../cron/cronRegistry';

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
        if (isCronPaused('application')) return res.status(200).json({ success: true, processed: 0, paused: true, cron: 'application' });
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
        if (isCronPaused('nomination')) return res.status(200).json({ success: true, processed: 0, paused: true, cron: 'nomination' });
        try {
            const count = await runNominationFollowupCron();
            await notifyAdmin('Nomination Followup', count);
            res.status(200).json({ success: true, processed: count });
        } catch (error: any) {
            console.error('Error in nomination cron webhook:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    },
    async onboarding(req: Request, res: Response) {
        if (isCronPaused('onboarding')) return res.status(200).json({ success: true, processed: 0, paused: true, cron: 'onboarding' });
        try {
            const { runOnboardingCron } = require('../cron/onboardingCron');
            const count = await runOnboardingCron();
            await notifyAdmin('Post-Interview Onboarding Process Email Followup', count);
            res.status(200).json({ success: true, processed: count });
        } catch (error: any) {
            console.error('Error in onboarding cron webhook:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    },
    async contract(req: Request, res: Response) {
        if (isCronPaused('contract')) return res.status(200).json({ success: true, processed: 0, paused: true, cron: 'contract' });
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
        if (isCronPaused('sponsorship')) return res.status(200).json({ success: true, processed: 0, paused: true, cron: 'sponsorship' });
        try {
            const count = await runSponsorshipCron();
            await notifyAdmin('Ticket Sponsorship (Call/Invite & Auto-Approval)', count);
            res.status(200).json({ success: true, processed: count });
        } catch (error: any) {
            console.error('Error in sponsorship cron webhook:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    },
    async rto(req: Request, res: Response) {
        const welcomePaused = isCronPaused('rto-welcome');
        const deliveryPaused = isCronPaused('rto-delivery');
        if (welcomePaused && deliveryPaused) {
            return res.status(200).json({ success: true, processed: 0, paused: true, cron: 'rto' });
        }
        try {
            const count1 = welcomePaused ? 0 : await runRtoWelcomeCron();
            const count2 = deliveryPaused ? 0 : await runRtoTicketDeliveryCron();
            const count = count1 + count2;
            await notifyAdmin('RTO (CertHero) Welcome & Ticket Delivery', count);
            res.status(200).json({ success: true, processed: count });
        } catch (error: any) {
            console.error('Error in rto cron webhook:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    },
    async aveling(req: Request, res: Response) {
        return (cronController.rto || (this as any).rto)(req, res);
    },
    async psychometric(req: Request, res: Response) {
        if (isCronPaused('psychometric')) return res.status(200).json({ success: true, processed: 0, paused: true, cron: 'psychometric' });
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
