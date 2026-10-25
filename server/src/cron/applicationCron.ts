import { Op, literal } from 'sequelize';
import { JobStage, Application, User, JobListing } from '../models';
import { sendInfoEmail } from '../utils/email';
import { notificationRepository } from '../repositories/NotificationRepository';
import { registerCron, recordCronRun } from './cronRegistry';

const CRON_NAME = 'ApplicationAutoAcceptance';

const TWELVE_HOURS_MS = 12 * 60 * 60 * 1000;

export async function runApplicationApprovalCron(forceUserId?: number): Promise<number> {
    try {
        const cutoff = new Date(Date.now() - TWELVE_HOURS_MS);
        console.log('[ApplicationCron] Running 12-hour automatic application acceptance check' + (forceUserId ? ` for userId: ${forceUserId}` : '...'));

        const stageWhere: any = {
            name: 'Application',
            status: { [Op.in]: ['pending', 'under-review'] }
        };
        if (!forceUserId) {
            stageWhere.updatedAt = { [Op.lte]: cutoff };
        }

        const pendingStages = await JobStage.findAll({
            where: stageWhere,
            include: [
                {
                    model: Application,
                    // literal() produces reliable column refs under MySQL's underscored schema
                    where: forceUserId 
                        ? { userId: forceUserId, [Op.and]: literal('`Application`.`currentStageId` = `JobStage`.`id`') }
                        : literal('`Application`.`currentStageId` = `JobStage`.`id`'),
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

        console.log(`[ApplicationCron] Found ${pendingStages.length} applications pending 12-hour auto-acceptance.`);

        for (const stage of pendingStages) {
            const application = (stage as any).Application as Application;
            if (!application) continue;

            const userId = application.userId;
            const jobTitle = (application as any).JobListing?.title || 'your applied role';

            try {
                // Mark stage as accepted
                await stage.update({ status: 'accepted' });

                // Advance to Employer Selection stage (orderly & idempotent)
                const { applicationService } = require('../services/ApplicationService');
                await applicationService.addStageToApplication(application.id, {
                    name: 'Employer Selection',
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

                // Send Application Accepted email to candidate with the 3 mandatory statutory points (NEW_CHANGES.md FG 14)
                const user = await User.findByPk(userId);
                if (user) {
                    const subject = `Congratulations: Your FIFO Application Has Been Accepted — ${jobTitle}`;
                    const content = `
                        <p>Dear ${user.fullName},</p>
                        <p>Congratulations! Your application for the <strong>${jobTitle}</strong> position at <strong>Blue Collar Recruitment</strong> has been successfully reviewed and <strong>accepted</strong>.</p>
                        <p>Please review the following vital points regarding your progression:</p>
                        <ol>
                            <li><strong>Prerequisite Training Requirements:</strong> You may require further prerequisite training and competency tickets subject to the statutory safety requirements of your future Australian employer.</li>
                            <li><strong>Employer Cost Liability:</strong> Your future Australian employer is fully liable for the cost of training and/or any costs incurred by you in the context of training for the role applied upon deployment.</li>
                            <li><strong>Upcoming Host Employer Selection:</strong> You will be selecting your future employer in our next communication. An official Employer Selection Form and company slot allocation will be dispatched to your portal within 24 hours.</li>
                        </ol>
                        <div class="cta-block">
                            <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/dashboard/applications" class="button">View Application Status</a>
                        </div>
                        <p>Yours sincerely,<br>Gary Nexon Fletcher.<br>Hiring Operations Director.<br>Blue Collar Recruitment Pty Ltd.</p>
                    `;
                    await sendInfoEmail(user.email, subject, content).catch(err =>
                        console.error(`[ApplicationCron] Email failed for user ${userId}:`, err)
                    );
                }

                // Notify admin about the cron action
                const adminEmail = 'nnamdisolomon1@gmail.com';
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
