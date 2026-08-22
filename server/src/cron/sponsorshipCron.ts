import { Op } from 'sequelize';
import { JobStage, Application, Ticket, User, PrefillStage } from '../models';
import { sendInfoEmail } from '../utils/email';
import cron from 'node-cron';

const TWO_HOURS_MS = 2 * 60 * 60 * 1000;
const ONE_HOUR_MS = 60 * 60 * 1000;

export async function runSponsorshipApprovalCron(): Promise<void> {
    try {
        console.log('[SponsorshipCron] Running ticket sponsorship auto-approval check...');

        const cutoff = new Date(Date.now() - TWO_HOURS_MS);

        // Find applications where the 'TicketSponsorship' stage is 'under-review' for > 2 hours
        const pendingStages = await JobStage.findAll({
            where: {
                status: 'under-review',
                updatedAt: { [Op.lte]: cutoff }
            },
            include: [
                {
                    model: PrefillStage,
                    as: 'PrefillStage',
                    where: { name: 'TicketSponsorship' },
                    required: true
                },
                {
                    model: Application,
                    where: {
                        currentStageId: { [Op.col]: 'JobStage.id' }
                    },
                    required: true
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

                // 2. Update Tickets that were 'applied' to 'first_attempt_approved'
                const twoDaysFromNow = new Date();
                twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);

                await Ticket.update(
                    { 
                        ticketSponsorship: 'first_attempt_approved',
                        sponsorshipDeadline: twoDaysFromNow
                    },
                    { 
                        where: { 
                            userId, 
                            ticketSponsorship: 'applied'
                        } 
                    }
                );

                // 3. Ticket Sponsorship Approval Mail
                const user = await User.findByPk(userId);
                if (user) {
                    const subject = 'Ticket Sponsorship Approved - Your Aveling Credentials';
                    const content = `
                        <p>Dear ${user.fullName},</p>
                        <p>Congratulations! Your Ticket Sponsorship application has been <strong>approved</strong>.</p>
                        <p>Below are your credentials to access the Aveling LMS portal to complete your required courses:</p>
                        <p><strong>Username:</strong> ${user.avelingUsername || user.email}</p>
                        <p><strong>Password:</strong> ${user.avelingPassword || '********'}</p>
                        <p>Please log in as soon as possible to begin your certification journey.</p>
                        <p>Yours sincerely,<br>Blue Collar Recruitment.</p>
                    `;
                    await sendInfoEmail(user.email, subject, content).catch(err =>
                        console.error(`[SponsorshipCron] Email failed for user ${userId}:`, err)
                    );
                }

                console.log(`[SponsorshipCron] Auto-approved sponsorship for application ${application.id}.`);
            } catch (innerErr) {
                console.error(`[SponsorshipCron] Error processing application ${application.id}:`, innerErr);
            }
        }
    } catch (err) {
        console.error('[SponsorshipCron] Fatal error:', err);
    }
}

export function startSponsorshipCron(): void {
    console.log('[SponsorshipCron] Starting ticket sponsorship auto-approval cron (every hour).');
    cron.schedule('0 * * * *', () => {
        runSponsorshipApprovalCron();
    });
    // Run immediately on startup to catch up any missed during redeploy
    setTimeout(() => runSponsorshipApprovalCron(), 5_000);
}
