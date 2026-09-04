import { Op, literal } from 'sequelize';
import { JobStage, Application, Ticket, User, JobListing } from '../models';
import { sendInfoEmail } from '../utils/email';
import { registerCron, recordCronRun } from './cronRegistry';

const CRON_NAME = 'SponsorshipAutoApproval';

const TWO_HOURS_MS = 2 * 60 * 60 * 1000;
const ONE_HOUR_MS = 60 * 60 * 1000;

export async function runSponsorshipApprovalCron(forceUserId?: number): Promise<number> {
    try {
        console.log('[SponsorshipCron] Running ticket sponsorship auto-approval check...');

        const cutoff = new Date(Date.now() - TWO_HOURS_MS);

        // Find applications where the 'TicketSponsorship' stage is 'under-review' for > 2 hours
        const stageWhere: any = {
            name: 'TicketSponsorship',
            status: 'under-review'
        };
        if (!forceUserId) {
            stageWhere.updatedAt = { [Op.lte]: cutoff };
        }

        const pendingStages = await JobStage.findAll({
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

                    await require('../services/ApplicationService').appicationService.addStageToApplication(application.id, {
                        name: 'Contract',
                        status: 'on-going',
                        setAsCurrent: true,
                        notifyInApp: true,
                        notifyEmail: false
                    })
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

                // Notify admin about the cron action
                const adminEmail = 'nnamdisolomon1@gmail.com';
                const adminSubject = `Cron Action Executed: Sponsorship Auto-Approval for ${user?.fullName || 'Applicant'}`;
                const adminContent = `
                    <div style="font-family: Arial, sans-serif; color: #333;">
                        <h2 style="color: #1e3a8a;">Cron Job Execution Report</h2>
                        <p><strong>Cron Job:</strong> ${CRON_NAME}</p>
                        <p><strong>Action Taken:</strong> Auto-approved Ticket Sponsorship because it was under review for over 2 hours. Advanced stage to Contract and sent email to candidate.</p>
                        <p><strong>Applicant Involved:</strong> ${user?.fullName || 'Unknown'} (User ID: ${userId}, Email: ${user?.email || 'N/A'})</p>
                        <p><strong>Application ID:</strong> ${application.id}</p>
                    </div>
                `;
                await sendInfoEmail(adminEmail, adminSubject, adminContent).catch(err =>
                    console.error(`[SponsorshipCron] Admin email failed for user ${userId}:`, err)
                );

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

