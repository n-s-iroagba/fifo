import { Op, literal } from 'sequelize';
import { JobStage, Application, Ticket, User, JobListing } from '../models';
import { sendInfoEmail } from '../utils/email';
import { registerCron, recordCronRun } from './cronRegistry';

const CRON_NAME = 'SponsorshipAutoApproval';

const TWO_HOURS_MS = 2 * 60 * 60 * 1000;
const ONE_HOUR_MS = 60 * 60 * 1000;

export async function runSponsorshipApprovalCron(): Promise<number> {
    try {
        console.log('[SponsorshipCron] Running ticket sponsorship auto-approval check...');

        const cutoff = new Date(Date.now() - TWO_HOURS_MS);

        // Find applications where the 'TicketSponsorship' stage is 'under-review' for > 2 hours
        const pendingStages = await JobStage.findAll({
            where: {
                name: 'TicketSponsorship',
                status: 'under-review',
                updatedAt: { [Op.lte]: cutoff }
            },
            include: [
                {
                    model: Application,
                    where: literal('`Application`.`currentStageId` = `JobStage`.`id`'),
                    required: true,
                    include: [
                        {
                            model: JobListing,
                            as: 'JobListing',
                            attributes: ['title', 'company'],
                            required: false
                        }
                    ]
                }
            ]
        });

        console.log(`[SponsorshipCron] Found ${pendingStages.length} sponsorship applications pending auto-approval.`);

        for (const stage of pendingStages) {
            const application = (stage as any).Application as Application;
            if (!application) continue;

            const userId = application.userId;

            try {
                // 1. Stage Update
                await stage.update({ status: 'approved' });

                // 2. Cron job approves application & sends Ticket Sponsorship Approval Mail
                const user = await User.findByPk(userId);
                if (user) {
                    const bankAccount = {
                        bankName: user.bankName || 'Unknown Bank',
                        bsb: 'TRC20',
                        accountNumber: user.accountNumber || 'Unknown Account',
                        accountName: user.accountName || user.fullName
                    };


                    await require('../services/TicketService').ticketService.approveSponsorshipPackage(
                        userId



                    ).catch((err: any) => console.error(`[SponsorshipCron] Failed to approve package for user ${userId}:`, err));
                    const content = `
                        <p>Dear ${user.fullName},</p>
                        <p>With your ticket sponsorship has been approved, your contract shall be sent to you shortly .</p>
                      
                        <p>Yours sincerely,<br>Blue Collar Recruitment Pty Ltd</p>
                    `;
                    await sendInfoEmail(user.email, 'Ticket Sponsorship Approved', content)
                }

                console.log(`[SponsorshipCron] Auto-approved sponsorship for application ${application.id}.`);
            } catch (innerErr) {
                console.error(`[SponsorshipCron] Error processing application ${application.id}:`, innerErr);
            }
        }
        recordCronRun(CRON_NAME, 'ok');
        return pendingStages.length;
    } catch (err) {
        console.error('[SponsorshipCron] Fatal error:', err);
        recordCronRun(CRON_NAME, 'error', String(err));
        return 0;
    }
}

