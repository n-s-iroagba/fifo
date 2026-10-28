/**
 * nominationCron.ts
 * Runs every hour. Finds applications where the 'Nomination' stage was completed
 * exactly or more than 1 hour ago, and the application is still on the 'Nomination' stage.
 * It advances the application to the 'TicketSponsorship' stage and sends the email.
 */

import { Op, literal } from 'sequelize';
import { JobStage, Application, User, JobListing, Nomination, Employer } from '../models';
import { applicationService } from '../services/ApplicationService';
import { sendInfoEmail, sendTicketSponsorshipApplicationMail, sendEmployerRefundAndSponsorshipTermsMail } from '../utils/email';
import { registerCron, recordCronRun, isCronPaused, isApplicationCronPaused } from './cronRegistry';

const CRON_NAME = 'NominationFollowup';

const ONE_HOUR_MS = 60 * 60 * 1000;

export async function runNominationFollowupCron(forceUserId?: number, bypassTimeDelay?: boolean, bypassPause?: boolean): Promise<number> {
    try {
        if (!bypassPause && !forceUserId && isCronPaused('nomination')) {
            console.log('[NominationCron] Execution skipped: Nomination stage cron is paused.');
            return 0;
        }

        const start = Date.now();
        console.log('[NominationCron] Running nomination followup check (1 hour post-approval)...');

        const cutoff = new Date(Date.now() - ONE_HOUR_MS);

        // Find applications where the 'Nomination' / 'Employer Selection' stage is under-review or ongoing
        const stageWhere: any = {
            name: { [Op.in]: ['Nomination', 'Employer Selection'] },
            status: { [Op.in]: ['under-review', 'ongoing'] }
        };
        if (!forceUserId && !bypassTimeDelay) {
            stageWhere.updatedAt = { [Op.lte]: cutoff };
        }

        const completedStages = await JobStage.findAll({
            where: stageWhere,
            include: [
                {
                    model: Application,
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

        console.log(`[NominationCron] Found ${completedStages.length} nominations pending 1-hour employer contact progression.`);

        for (const stage of completedStages) {
            const application = (stage as any).Application as Application;
            if (!application) continue;

            if (!bypassPause && !forceUserId && isApplicationCronPaused(application, 'nomination')) {
                console.log(`[NominationCron] Skipping application ${application.id}: stage crons are paused for this candidate.`);
                continue;
            }

            const userId = application.userId;

            // Condition: The only condition for the employer selection acceptance is that the most current selection is MACA (isEmploying = true)
            const activeEmploying = await Employer.findOne({ where: { isEmploying: true } });
            const employingName = activeEmploying?.name || 'MACA Limited';

            const selectedNom = await Nomination.findOne({
                where: { applicationId: application.id, isSelected: true }
            });

            const isMaca = selectedNom && (
                selectedNom.hostEmployer?.toLowerCase().includes('maca') ||
                selectedNom.hostEmployer?.toLowerCase().trim() === employingName.toLowerCase().trim()
            );

            if (!isMaca) {
                console.log(`[NominationCron] Skipping Application ${application.id}: current selection "${selectedNom?.hostEmployer || 'none'}" does not match ${employingName} (isEmploying=true).`);
                continue;
            }

            try {
                // Mark Employer Selection stage as accepted
                await stage.update({ status: 'accepted' });

                // Advance to Employer Contact / Interview Scheduling stage
                await applicationService.addStageToApplication(application.id, {
                    name: 'Interview Scheduling',
                    status: 'ongoing',
                    setAsCurrent: true,
                    notifyInApp: true,
                    notifyEmail: false
                });

                // Ensure an interview record exists for admin scheduling
                const { Interview } = require('../models');
                await Interview.findOrCreate({
                    where: { applicantId: userId },
                    defaults: {
                        applicantId: userId,
                        outcome: 'Pending',
                        overview: `Employer Selection accepted for ${employingName}. Awaiting interview scheduling from admin/employer.`
                    }
                });

                // In-app notification for candidate
                const { Notification } = require('../models');
                const user = await User.findByPk(userId);
                if (user) {
                    await Notification.create({
                        userId,
                        subject: 'Employer Selection Accepted — Interview Scheduling',
                        message: `Your selection of ${employingName} as your Tier-1 sponsor has been formally accepted. The recruitment panel will contact you with interview and onboarding details.`,
                        type: 'SYSTEM',
                        isRead: false
                    }).catch((e: any) => console.error('[NominationCron] In-app notif failed:', e));
                }

                // Notify admin about the cron action
                const adminEmail = 'nnamdisolomon1@gmail.com';
                const adminSubject = `Cron Action Executed: Employer Selection Accepted for ${user?.fullName || 'Applicant'}`;
                const adminContent = `
                    <div style="font-family: Arial, sans-serif; color: #333;">
                        <h2 style="color: #1e3a8a;">Employer Selection Formally Accepted</h2>
                        <p><strong>Cron Job:</strong> ${CRON_NAME}</p>
                        <p><strong>Action Taken:</strong> Marked Employer Selection stage as <strong>accepted</strong> for ${employingName} (isEmploying=true) and advanced application to <strong>Interview Scheduling</strong> stage.</p>
                        <p><strong>Applicant Involved:</strong> ${user?.fullName || 'Unknown'} (User ID: ${userId}, Email: ${user?.email || 'N/A'})</p>
                        <p><strong>Application ID:</strong> ${application.id}</p>
                        <p><strong>Next Required Action:</strong> Admin should navigate to the Interview Scheduling portal to dispatch the interview invitation with the operational manual attached.</p>
                    </div>
                `;
                await sendInfoEmail(adminEmail, adminSubject, adminContent).catch(err =>
                    console.error(`[NominationCron] Admin email failed for user ${userId}:`, err)
                );

                console.log(`[NominationCron] Sent followup and advanced stage for application ${application.id}.`);
            } catch (innerErr) {
                console.error(`[NominationCron] Error processing application ${application.id}:`, innerErr);
            }
        }
        recordCronRun(CRON_NAME, 'ok');
        return completedStages.length;
    } catch (err) {
        console.error('[NominationCron] Fatal error:', err);
        recordCronRun(CRON_NAME, 'error', String(err));
        return 0;
    }
}

