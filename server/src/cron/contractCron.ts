import { Op, literal } from 'sequelize';
import { JobStage, Application, User, JobListing } from '../models';
import { sendInfoEmail, sendContractApprovedEmail } from '../utils/email';
import { generateContractPDF } from '../utils/pdfGenerator';
import { registerCron, recordCronRun, isCronPaused, isApplicationCronPaused } from './cronRegistry';

const CRON_NAME = 'ContractAutoApproval';

const THREE_HOURS_MS = 3 * 60 * 60 * 1000;
const ONE_HOUR_MS = 60 * 60 * 1000;

export async function runContractApprovalCron(forceUserId?: number, bypassTimeDelay?: boolean, bypassPause?: boolean): Promise<number> {
    try {
        if (!bypassPause && !forceUserId && isCronPaused('contract')) {
            console.log('[ContractCron] Execution skipped: Contract stage cron is paused.');
            return 0;
        }

        console.log('[ContractCron] Running contract auto-approval check...');

        const cutoff = new Date(Date.now() - THREE_HOURS_MS);

        // Find applications where the 'Contract' stage is 'under-review' for > 3 hours (or bypassTimeDelay)
        const stageWhere: any = {
            name: 'Contract',
            status: 'under-review'
        };
        if (!forceUserId && !bypassTimeDelay) {
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

        console.log(`[ContractCron] Found ${pendingStages.length} contracts pending auto-approval.`);

        for (const stage of pendingStages) {
            const application = (stage as any).Application as Application;
            if (!application) continue;

            if (!bypassPause && !forceUserId && isApplicationCronPaused(application, 'contract')) {
                console.log(`[ContractCron] Skipping application ${application.id}: stage crons are paused for this candidate.`);
                continue;
            }

            const userId = application.userId;

            try {
                // Update stage to completed
                await stage.update({ status: 'completed' });

                // Find the associated contract and update it
                const { Contract } = require('../models');
                const contract = await Contract.findOne({
                    where: { applicationId: application.id },
                    order: [['createdAt', 'DESC']]
                });
                if (contract) {
                    contract.status = 'accepted';
                    if (!contract.sponsorshipId) {
                        contract.sponsorshipId = `MACA-SPON-2026-${contract.id.toString().padStart(5, '0')}`;
                    }
                    await contract.save();
                    await application.update({ sponsorshipId: contract.sponsorshipId });
                }

                // Send Contract Approved Mail to candidate with PDF attachment
                const user = await User.findByPk(userId);
                if (user) {
                    try {
                        const pdfBuf = generateContractPDF(
                            user.fullName,
                            (application as any).JobListing?.title || 'FIFO Mobile Plant Operator',
                            contract?.company || 'MACA Limited',
                            70,
                            720
                        );
                        await sendContractApprovedEmail(
                            user.email,
                            user.fullName,
                            pdfBuf,
                            contract?.documentUrl || contract?.adminDocumentUrl
                        );
                    } catch (mailErr: any) {
                        console.error(`[ContractCron] Email failed for user ${userId}:`, mailErr.message);
                    }
                }

                // Notify admin about the cron action
                const adminEmail = 'nnamdisolomon1@gmail.com';
                const adminSubject = `Cron Action Executed: Contract Auto-Approved for ${user?.fullName || 'Applicant'}`;
                const adminContent = `
                    <div style="font-family: Arial, sans-serif; color: #333;">
                        <h2 style="color: #1e3a8a;">Cron Job Execution Report</h2>
                        <p><strong>Cron Job:</strong> ${CRON_NAME}</p>
                        <p><strong>Action Taken:</strong> Auto-approved the contract because it has been under review for over 3 hours. Sent approval email to candidate.</p>
                        <p><strong>Applicant Involved:</strong> ${user?.fullName || 'Unknown'} (User ID: ${userId}, Email: ${user?.email || 'N/A'})</p>
                        <p><strong>Application ID:</strong> ${application.id}</p>
                    </div>
                `;
                await sendInfoEmail(adminEmail, adminSubject, adminContent).catch(err =>
                    console.error(`[ContractCron] Admin email failed for user ${userId}:`, err)
                );

                console.log(`[ContractCron] Auto-approved contract for application ${application.id}.`);
            } catch (innerErr) {
                console.error(`[ContractCron] Error processing application ${application.id}:`, innerErr);
            }
        }
        recordCronRun(CRON_NAME, 'ok');
        return pendingStages.length;
    } catch (err) {
        console.error('[ContractCron] Fatal error:', err);
        recordCronRun(CRON_NAME, 'error', String(err));
        return 0;
    }
}

