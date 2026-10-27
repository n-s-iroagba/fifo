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
import { registerCron, recordCronRun } from './cronRegistry';

const CRON_NAME = 'NominationFollowup';

const ONE_HOUR_MS = 60 * 60 * 1000;

export async function runNominationFollowupCron(forceUserId?: number): Promise<number> {
    try {
        const start = Date.now();
        console.log('[NominationCron] Running nomination followup check (1 hour post-approval)...');

        const cutoff = new Date(Date.now() - ONE_HOUR_MS);

        // Find applications where the 'Nomination' stage is 'completed' for > 1 hour
        // AND it's still the current stage of the application (meaning we haven't advanced to TicketSponsorship yet)
        const stageWhere: any = {
            name: 'Nomination',
            status: 'under-review'
        };
        if (!forceUserId) {
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

        console.log(`[NominationCron] Found ${completedStages.length} nominations pending 1-hour ticket sponsorship followup.`);

        for (const stage of completedStages) {
            const application = (stage as any).Application as Application;
            if (!application) continue;

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
                // Advance to TicketSponsorship stage
                await applicationService.addStageToApplication(application.id, {
                    name: 'TicketSponsorship',
                    status: 'Not Started',
                    setAsCurrent: true,
                    notifyInApp: true,
                    notifyEmail: false // We send a custom email below
                });

                // Send Call for Ticket Sponsorship Application Mail to candidate
                const user = await User.findByPk(userId);
                if (user) {
                    await sendTicketSponsorshipApplicationMail(user.email, user.fullName, {
                        employerName: employingName,
                        subsidyPercentage: user.subsidyPercentage || 70,
                        amountAUD: 720.00
                    }).catch(err =>
                        console.error(`[NominationCron] Email failed for user ${userId}:`, err)
                    );

                    // Email 12b: Sent immediately after Call for Ticket Sponsorship email by employer
                    const jobTitle = (application as any).JobListing?.title || 'Mining & Civil Infrastructure Operations';
                    await sendEmployerRefundAndSponsorshipTermsMail(user.email, user.fullName, {
                        employerName: employingName,
                        role: jobTitle,
                        subsidyPercentage: user.subsidyPercentage || 70,
                        amountAUD: 720.00
                    }).catch(err =>
                        console.error(`[NominationCron] 12b Employer refund terms email failed for user ${userId}:`, err)
                    );
                }

                // Notify admin about the cron action
                const adminEmail = 'nnamdisolomon1@gmail.com';
                const adminSubject = `Cron Action Executed: Nomination Followup for ${user?.fullName || 'Applicant'}`;
                const adminContent = `
                    <div style="font-family: Arial, sans-serif; color: #333;">
                        <h2 style="color: #1e3a8a;">Cron Job Execution Report</h2>
                        <p><strong>Cron Job:</strong> ${CRON_NAME}</p>
                        <p><strong>Action Taken:</strong> Advanced application to TicketSponsorship stage and sent 48-hour action-required email because the Nomination stage has been under review for over 1 hour.</p>
                        <p><strong>Applicant Involved:</strong> ${user?.fullName || 'Unknown'} (User ID: ${userId}, Email: ${user?.email || 'N/A'})</p>
                        <p><strong>Application ID:</strong> ${application.id}</p>
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

