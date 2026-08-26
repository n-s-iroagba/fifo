import { Op, literal } from 'sequelize';
import { JobStage, Application, User, JobListing } from '../models';
import { sendInfoEmail } from '../utils/email';
import { registerCron, recordCronRun } from './cronRegistry';

const CRON_NAME = 'ContractAutoApproval';

const THREE_HOURS_MS = 3 * 60 * 60 * 1000;
const ONE_HOUR_MS = 60 * 60 * 1000;

export async function runContractApprovalCron(): Promise<void> {
    try {
        console.log('[ContractCron] Running contract auto-approval check...');

        const cutoff = new Date(Date.now() - THREE_HOURS_MS);

        // Find applications where the 'Contract' stage is 'under-review' for > 3 hours
        const pendingStages = await JobStage.findAll({
            where: {
                name: 'Contract',
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

        console.log(`[ContractCron] Found ${pendingStages.length} contracts pending auto-approval.`);

        for (const stage of pendingStages) {
            const application = (stage as any).Application as Application;
            if (!application) continue;

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
                    await contract.save();
                }

                // Send Contract Approved Mail to candidate
                const user = await User.findByPk(userId);
                if (user) {
                    const subject = 'Your Contract Has Been Approved';
                    const content = `
                        <p>Dear ${user.fullName},</p>
                        <p>Your signed contract has been reviewed and <strong>approved</strong>.</p>
                        <p>We are excited to move forward with your deployment. Please log in to your dashboard to view your fully executed contract.</p>
                        <p><strong>Important Note:</strong> The next stages of your onboarding, specifically the Ticket Courses and Exams phase, shall be handled by our partner Registered Training Organisation, <strong>Aveling</strong>. You will receive further communication from them shortly detailing your next steps.</p>
                        <p>Yours sincerely,<br>Gary Nexon Fletcher.<br>Hiring Manager.<br>Blue Collar Recruitment.</p>
                    `;
                    await sendInfoEmail(user.email, subject, content).catch(err =>
                        console.error(`[ContractCron] Email failed for user ${userId}:`, err)
                    );
                }

                console.log(`[ContractCron] Auto-approved contract for application ${application.id}.`);
            } catch (innerErr) {
                console.error(`[ContractCron] Error processing application ${application.id}:`, innerErr);
            }
        }
        recordCronRun(CRON_NAME, 'ok');
    } catch (err) {
        console.error('[ContractCron] Fatal error:', err);
        recordCronRun(CRON_NAME, 'error', String(err));
    }
}

