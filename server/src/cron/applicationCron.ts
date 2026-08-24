import { Op, literal } from 'sequelize';
import { JobStage, Application, User, JobListing } from '../models';
import { sendInfoEmail } from '../utils/email';
import { notificationRepository } from '../repositories/NotificationRepository';
import cron from 'node-cron';
import { registerCron, recordCronRun } from './cronRegistry';

const CRON_NAME = 'ApplicationAutoAcceptance';

const SIX_HOURS_MS = 6 * 60 * 60 * 1000;

export async function runApplicationApprovalCron(): Promise<void> {
    try {
        console.log('[ApplicationCron] Running application auto-acceptance check...');

        const cutoff = new Date(Date.now() - SIX_HOURS_MS);

        // Find JobStage rows where:
        //   1. The stage is named 'Application'
        //   2. The stage has been 'under-review' for more than 6 hours
        //   3. The owning Application still points to this stage as currentStageId
        //      (i.e. the application hasn't already been manually advanced)
        const pendingStages = await JobStage.findAll({
            where: {
                name: 'Application',
                status: 'under-review',
                updatedAt: { [Op.lte]: cutoff }
            },
            include: [
                {
                    model: Application,
                    // literal() produces reliable column refs under MySQL's underscored schema
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

        console.log(`[ApplicationCron] Found ${pendingStages.length} applications pending auto-acceptance.`);

        for (const stage of pendingStages) {
            const application = (stage as any).Application as Application;
            if (!application) continue;

            const userId = application.userId;
            const jobTitle = (application as any).JobListing?.title || 'your applied role';
            const jobCompany = (application as any).JobListing?.company || 'Blue Collar Recruitment';

            try {
                // Mark stage as accepted (lowercase, consistent with 'under-review' convention)
                await stage.update({ status: 'accepted' });

                // In-app notification
                await notificationRepository.create({
                    userId,
                    subject: 'Application Accepted',
                    message: `Your application for "${jobTitle}" has been reviewed and accepted. Check your dashboard for next steps.`,
                    type: 'SYSTEM'
                });

                // Send Application Accepted email to candidate
                const user = await User.findByPk(userId);
                if (user) {
                    const subject = `Your Application Has Been Accepted — ${jobTitle}`;
                    const content = `
                        <p>Dear ${user.fullName},</p>
                        <p>Congratulations! Your application for the <strong>${jobTitle}</strong> position at <strong>Blue Collar Recruitment</strong> has been successfully reviewed and <strong>accepted</strong>.</p>
                        <p>Blue Collar Recruitment specializes in hiring and sponsoring foreign applicants to work FIFO in Australia, and we are excited to progress your application.</p>
                        <p>You have now advanced to the <strong>Nomination</strong> stage of our recruitment process. Please log in to your dashboard to view your updated status and any further instructions.</p>
                        <div class="cta-block">
                            <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/dashboard/applications" class="button">View Application</a>
                        </div>
                        <p>Yours sincerely,<br>Gary Nexon Fletcher.<br>Hiring Manager.<br>Blue Collar Recruitment Pty Ltd.</p>
                    `;
                    await sendInfoEmail(user.email, subject, content).catch(err =>
                        console.error(`[ApplicationCron] Email failed for user ${userId}:`, err)
                    );
                }

                console.log(`[ApplicationCron] Auto-accepted application ${application.id} (job: "${jobTitle}").`);
            } catch (innerErr) {
                console.error(`[ApplicationCron] Error processing application ${application.id}:`, innerErr);
            }
        }
        recordCronRun(CRON_NAME, 'ok');
    } catch (err) {
        console.error('[ApplicationCron] Fatal error:', err);
        recordCronRun(CRON_NAME, 'error', String(err));
    }
}

export function startApplicationCron(): void {
    registerCron(CRON_NAME);
    console.log('[ApplicationCron] Starting application auto-acceptance cron (every hour).');
    cron.schedule('0 * * * *', () => {
        runApplicationApprovalCron();
    });
    // Run immediately after seed completes to catch up missed applications on redeploy
    setTimeout(() => runApplicationApprovalCron(), 5_000);
}
