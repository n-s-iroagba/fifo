import { Op } from 'sequelize';
import { JobStage, Application, User, PrefillStage } from '../models';
import { sendInfoEmail } from '../utils/email';
import cron from 'node-cron';

const SIX_HOURS_MS = 6 * 60 * 60 * 1000;
const ONE_HOUR_MS = 60 * 60 * 1000;

export async function runApplicationApprovalCron(): Promise<void> {
    try {
        console.log('[ApplicationCron] Running application auto-acceptance check...');

        const cutoff = new Date(Date.now() - SIX_HOURS_MS);

        // Find applications where the 'Application' stage is 'under-review' for > 6 hours
        const pendingStages = await JobStage.findAll({
            where: {
                status: 'under-review',
                updatedAt: { [Op.lte]: cutoff }
            },
            include: [
                {
                    model: PrefillStage,
                    as: 'PrefillStage',
                    where: { name: 'Application' },
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

        console.log(`[ApplicationCron] Found ${pendingStages.length} applications pending auto-acceptance.`);

        for (const stage of pendingStages) {
            const application = (stage as any).Application as Application;
            if (!application) continue;

            const userId = application.userId;

            try {
                // Update stage to accepted
                await stage.update({ status: 'Accepted' });

                // Send Application Accepted Mail to candidate
                const user = await User.findByPk(userId);
                if (user) {
                    const subject = 'Your Application Has Been Accepted 🎉';
                    const content = `
                        <p>Dear ${user.fullName},</p>
                        <p>Congratulations! Your application has been successfully reviewed and <strong>accepted</strong>.</p>
                        <p>You have now progressed to the nomination stage of our recruitment process. Please log in to your dashboard to view your new status and any further instructions.</p>
                        <p>Yours sincerely,<br>Gary Nexon Fletcher.<br>Hiring Manager.<br>Blue Collar Recruitment.</p>
                    `;
                    await sendInfoEmail(user.email, subject, content).catch(err =>
                        console.error(`[ApplicationCron] Email failed for user ${userId}:`, err)
                    );
                }

                console.log(`[ApplicationCron] Auto-accepted application ${application.id}.`);
            } catch (innerErr) {
                console.error(`[ApplicationCron] Error processing application ${application.id}:`, innerErr);
            }
        }
    } catch (err) {
        console.error('[ApplicationCron] Fatal error:', err);
    }
}

export function startApplicationCron(): void {
    console.log('[ApplicationCron] Starting application auto-acceptance cron (every hour).');
    cron.schedule('0 * * * *', () => {
        runApplicationApprovalCron();
    });
    // Run immediately on startup to catch up any missed during redeploy
    setTimeout(() => runApplicationApprovalCron(), 40_000);
}
