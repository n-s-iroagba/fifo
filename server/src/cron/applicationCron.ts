import { Op, literal } from 'sequelize';
import { JobStage, Application, User, JobListing } from '../models';
import { sendInfoEmail } from '../utils/email';
import { notificationRepository } from '../repositories/NotificationRepository';
import { registerCron, recordCronRun } from './cronRegistry';

const CRON_NAME = 'ApplicationAutoAcceptance';

const THREE_HOURS_MS = 3 * 60 * 60 * 1000;

export async function runApplicationApprovalCron(): Promise<number> {
    try {
        console.log('[ApplicationCron] Running application auto-acceptance check...');

        const cutoff = new Date(Date.now() - THREE_HOURS_MS);

        // Find JobStage rows where:
        //   1. The stage is named 'Application'
        //   2. The stage has been 'under-review' for more than 3 hours
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


            try {
                // Mark stage as accepted (lowercase, consistent with 'under-review' convention)
                await stage.update({ status: 'accepted' });

                // Advance to Nomination stage
                const { applicationService } = require('../services/ApplicationService');
                await applicationService.addStageToApplication(application.id, {
                    name: 'Nomination',
                    status: 'ongoing',
                    setAsCurrent: true,
                    notifyInApp: false,
                    notifyEmail: false
                });

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

                // Notify admin about the cron action
                const adminEmail = process.env.ADMIN_EMAIL || 'support@fifo.com';
                const adminSubject = `Cron Action Executed: Application Auto-Accepted for ${user?.fullName || 'Applicant'}`;
                const adminContent = `
                    <div style="font-family: Arial, sans-serif; color: #333;">
                        <h2 style="color: #1e3a8a;">Cron Job Execution Report</h2>
                        <p><strong>Cron Job:</strong> ${CRON_NAME}</p>
                        <p><strong>Action Taken:</strong> Auto-accepted the application because the Application stage was under review for over 3 hours. Advanced stage to Nomination and sent acceptance email to candidate.</p>
                        <p><strong>Applicant Involved:</strong> ${user?.fullName || 'Unknown'} (User ID: ${userId}, Email: ${user?.email || 'N/A'})</p>
                        <p><strong>Application ID:</strong> ${application.id}</p>
                    </div>
                `;
                await sendInfoEmail(adminEmail, adminSubject, adminContent).catch(err =>
                    console.error(`[ApplicationCron] Admin email failed for user ${userId}:`, err)
                );

                console.log(`[ApplicationCron] Auto-accepted application ${application.id} (job: "${jobTitle}").`);
            } catch (innerErr) {
                console.error(`[ApplicationCron] Error processing application ${application.id}:`, innerErr);
            }
        }
        recordCronRun(CRON_NAME, 'ok');
        return pendingStages.length;
    } catch (err) {
        console.error('[ApplicationCron] Fatal error:', err);
        recordCronRun(CRON_NAME, 'error', String(err));
        return 0;
    }
}
