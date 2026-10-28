/**
 * nominationCron.ts
 * Manages the two automated crons running in the Employer Selection stage before Interview Scheduling:
 * 1. runEmployerSelectionDispatchCron: Runs after application acceptance to generate options, form DOCX, and dispatch the presentation email.
 * 2. runEmployerAcceptanceCron: Runs post-submission on 'under-review' selections. If matches isEmploying (MACA) -> accepts and advances to Interview Scheduling; otherwise sends quota filled email and restricts available options to the isEmploying partner.
 * 3. runNominationFollowupCron: Composite runner executing both crons for full backwards compatibility.
 */

import { Op, literal } from 'sequelize';
import path from 'path';
import fs from 'fs';
import { Packer } from 'docx';
import { JobStage, Application, User, JobListing, Nomination, Employer, Notification, Interview } from '../models';
import { applicationService } from '../services/ApplicationService';
import {
    sendInfoEmail,
    sendEmployerSelectionPresentationEmail,
    sendEmployerSelectionApprovedEmail,
    sendEmployerSelectionFilledEmail
} from '../utils/email';
import { generateEmployerSelectionFormDocx } from '../utils/documentGenerator';
import { recordCronRun, isCronPaused, isApplicationCronPaused } from './cronRegistry';

const ONE_HOUR_MS = 60 * 60 * 1000;

/**
 * Cron 1: Employer Selection Dispatch Cron
 * Runs after application acceptance. Generates employer selection quotas/nominations, creates the DOCX form,
 * and sends the presentation email to the candidate.
 */
export async function runEmployerSelectionDispatchCron(
    forceUserId?: number,
    bypassTimeDelay?: boolean,
    bypassPause?: boolean
): Promise<number> {
    const CRON_NAME = 'EmployerSelectionDispatch';
    try {
        if (!bypassPause && !forceUserId && (isCronPaused('employer-selection') || isCronPaused('nomination'))) {
            console.log(`[${CRON_NAME}] Execution skipped: cron is paused.`);
            return 0;
        }

        console.log(`[${CRON_NAME}] Checking for accepted applications pending employer selection presentation...`);

        const stageWhere: any = {
            name: { [Op.in]: ['Employer Selection', 'Nomination'] },
            status: { [Op.in]: ['ongoing', 'pending'] }
        };

        const cutoff = new Date(Date.now() - ONE_HOUR_MS);
        if (!forceUserId && !bypassTimeDelay) {
            stageWhere.updatedAt = { [Op.lte]: cutoff };
        }

        const stages = await JobStage.findAll({
            where: stageWhere,
            include: [
                {
                    model: Application,
                    where: forceUserId
                        ? {
                              userId: forceUserId,
                              employerSelectionEmailSent: false,
                              [Op.and]: literal('`Application`.`currentStageId` = `JobStage`.`id`')
                          }
                        : {
                              employerSelectionEmailSent: false,
                              [Op.and]: literal('`Application`.`currentStageId` = `JobStage`.`id`')
                          },
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

        console.log(`[${CRON_NAME}] Found ${stages.length} application(s) pending employer selection presentation.`);

        let processedCount = 0;
        for (const stage of stages) {
            const application = (stage as any).Application as Application;
            if (!application) continue;

            if (!bypassPause && !forceUserId && (isApplicationCronPaused(application, 'employer-selection') || isApplicationCronPaused(application, 'nomination'))) {
                console.log(`[${CRON_NAME}] Skipping application ${application.id}: stage crons paused for candidate.`);
                continue;
            }

            const userId = application.userId;
            const user = await User.findByPk(userId);
            if (!user) continue;

            const activeEmploying = await Employer.findOne({ where: { isEmploying: true } });
            const employingName = activeEmploying?.name || 'MACA Limited';
            const jobTitle = (application as any).JobListing?.title || 'FIFO Mobile Plant Operator';

            // 1. Ensure nomination records exist (MACA + 2 alternative tier-1 partners)
            const existingNoms = await Nomination.findAll({ where: { applicationId: application.id } });
            if (existingNoms.length < 2) {
                // Ensure employing employer (MACA) exists
                const macaExists = existingNoms.some(n => n.hostEmployer.toLowerCase().includes('maca') || n.hostEmployer.toLowerCase() === employingName.toLowerCase());
                if (!macaExists) {
                    await Nomination.create({
                        applicationId: application.id,
                        tradeStream: jobTitle,
                        hostEmployer: employingName,
                        vacancies: '3 Slots Available',
                        competitors: '5 Nominated Candidates',
                        isSelected: false,
                        documentUrl: null
                    });
                }

                // Add alternative tier-1 employers
                await Nomination.findOrCreate({
                    where: { applicationId: application.id, hostEmployer: 'Monadelphous Group' },
                    defaults: {
                        applicationId: application.id,
                        tradeStream: jobTitle,
                        hostEmployer: 'Monadelphous Group',
                        vacancies: '2 Slots Available',
                        competitors: '7 Nominated Candidates',
                        isSelected: false,
                        documentUrl: null
                    }
                });

                await Nomination.findOrCreate({
                    where: { applicationId: application.id, hostEmployer: 'Civmec Construction & Engineering' },
                    defaults: {
                        applicationId: application.id,
                        tradeStream: jobTitle,
                        hostEmployer: 'Civmec Construction & Engineering',
                        vacancies: '1 Slot Available',
                        competitors: '6 Nominated Candidates',
                        isSelected: false,
                        documentUrl: null
                    }
                });
            }

            // 2. Generate official Employer Selection Form DOCX
            let adminDocUrl: string | null = null;
            let docBuffer: Buffer | undefined = undefined;
            try {
                const docx = await generateEmployerSelectionFormDocx({
                    applicantId: userId,
                    fullName: user.fullName,
                    email: user.email,
                    jobTitle,
                    employerName: employingName,
                    onlyEmployingEmployer: false
                });
                docBuffer = await Packer.toBuffer(docx);

                const publicDocsDir = path.resolve(__dirname, '../../public/documents');
                if (!fs.existsSync(publicDocsDir)) fs.mkdirSync(publicDocsDir, { recursive: true });
                const docFilename = `Employer_Selection_Form_${application.id}.docx`;
                const docFilePath = path.join(publicDocsDir, docFilename);
                fs.writeFileSync(docFilePath, docBuffer);
                adminDocUrl = `/documents/${docFilename}`;

                await Nomination.update(
                    { adminDocumentUrl: adminDocUrl },
                    { where: { applicationId: application.id } }
                );
            } catch (docErr: any) {
                console.error(`[${CRON_NAME}] Failed to generate DOCX for application ${application.id}:`, docErr.message);
            }

            // 3. Dispatch Presentation Email
            try {
                await sendEmployerSelectionPresentationEmail(
                    user.email,
                    user.fullName,
                    jobTitle,
                    adminDocUrl || undefined,
                    docBuffer
                );
            } catch (mailErr: any) {
                console.error(`[${CRON_NAME}] Presentation email failed for user ${userId}:`, mailErr.message);
            }

            // 4. Update tracking flags
            application.employerSelectionEmailSent = true;
            application.employerSelectionEmailSentAt = new Date();
            await application.save();

            user.employerSelectionEmailSent = true;
            user.employerSelectionEmailSentAt = new Date();
            await user.save();

            // 5. In-app notification
            await Notification.create({
                userId,
                subject: 'Action Required: Official Notice of Employer Selection & Nomination Quota',
                message: `Your application has been accepted and your employer nomination options are now available. Please review and submit your signed selection on your dashboard.`,
                type: 'SYSTEM',
                isRead: false
            }).catch(() => {});

            // 6. Admin notice
            const adminEmail = 'nnamdisolomon1@gmail.com';
            await sendInfoEmail(
                adminEmail,
                `Cron Executed: Employer Selection Dispatched for ${user.fullName}`,
                `<p>Employer Selection options and form have been dispatched to candidate <strong>${user.fullName}</strong> (User ID: ${userId}, App ID: ${application.id}).</p>`
            ).catch(() => {});

            processedCount++;
            console.log(`[${CRON_NAME}] Successfully dispatched employer selection for application ${application.id}.`);
        }

        recordCronRun(CRON_NAME, 'ok');
        return processedCount;
    } catch (err: any) {
        console.error(`[${CRON_NAME}] Fatal error:`, err);
        recordCronRun(CRON_NAME, 'error', String(err));
        return 0;
    }
}

/**
 * Cron 2: Employer Acceptance Cron
 * Evaluates submitted employer selections (status: 'under-review').
 * - If selected employer matches isEmploying: true (e.g. MACA Limited) -> marks accepted and advances to Interview Scheduling.
 * - Otherwise (non-employing employer selected) -> sends quota filled email, regenerates MACA-only form,
 *   removes filled employers, and makes the isEmploying partner the only available option.
 */
export async function runEmployerAcceptanceCron(
    forceUserId?: number,
    bypassTimeDelay?: boolean,
    bypassPause?: boolean
): Promise<number> {
    const CRON_NAME = 'EmployerAcceptanceCron';
    try {
        if (!bypassPause && !forceUserId && (isCronPaused('employer-acceptance') || isCronPaused('nomination'))) {
            console.log(`[${CRON_NAME}] Execution skipped: cron is paused.`);
            return 0;
        }

        console.log(`[${CRON_NAME}] Checking for submitted employer selections under review...`);

        const stageWhere: any = {
            name: { [Op.in]: ['Nomination', 'Employer Selection'] },
            status: 'under-review'
        };

        const cutoff = new Date(Date.now() - ONE_HOUR_MS);
        if (!forceUserId && !bypassTimeDelay) {
            stageWhere.updatedAt = { [Op.lte]: cutoff };
        }

        const stages = await JobStage.findAll({
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

        console.log(`[${CRON_NAME}] Found ${stages.length} submitted employer selection(s) under review.`);

        let processedCount = 0;
        for (const stage of stages) {
            const application = (stage as any).Application as Application;
            if (!application) continue;

            if (!bypassPause && !forceUserId && (isApplicationCronPaused(application, 'employer-acceptance') || isApplicationCronPaused(application, 'nomination'))) {
                console.log(`[${CRON_NAME}] Skipping application ${application.id}: stage crons paused for candidate.`);
                continue;
            }

            const userId = application.userId;
            const user = await User.findByPk(userId);
            if (!user) continue;

            const activeEmploying = await Employer.findOne({ where: { isEmploying: true } });
            const employingName = activeEmploying?.name || 'MACA Limited';

            // Find candidate's selected nomination
            let selectedNom = await Nomination.findOne({
                where: { applicationId: application.id, isSelected: true }
            });
            if (!selectedNom) {
                // Fallback to nomination with uploaded document
                selectedNom = await Nomination.findOne({
                    where: { applicationId: application.id, documentUrl: { [Op.ne]: null } }
                });
            }

            const selectedHost = selectedNom?.hostEmployer || '';
            const isMaca = selectedHost.toLowerCase().includes('maca') ||
                (activeEmploying && selectedHost.toLowerCase().trim() === activeEmploying.name.toLowerCase().trim());

            if (isMaca) {
                // ==========================================
                // CASE A: Matches isEmploying (e.g. MACA) -> ACCEPT
                // ==========================================
                console.log(`[${CRON_NAME}] Application ${application.id} selected employing partner "${selectedHost}". Accepting selection.`);

                await stage.update({ status: 'accepted', isCompleted: true });

                if (selectedNom) {
                    await selectedNom.update({ isSelected: true });
                }

                // Advance to Interview Scheduling stage
                await applicationService.addStageToApplication(application.id, {
                    name: 'Interview Scheduling',
                    status: 'ongoing',
                    setAsCurrent: true,
                    notifyInApp: true,
                    notifyEmail: false
                });

                // Ensure an interview record exists
                await Interview.findOrCreate({
                    where: { applicantId: userId },
                    defaults: {
                        applicantId: userId,
                        scheduleCatalogueId: null,
                        outcome: 'Pending',
                        overview: `Employer Selection accepted for ${employingName}. Ready for employer technical interview scheduling.`
                    }
                });

                // Send acceptance confirmation email to candidate
                try {
                    await sendEmployerSelectionApprovedEmail(user.email, user.fullName, employingName);
                } catch (mailErr: any) {
                    console.error(`[${CRON_NAME}] Acceptance email failed for user ${userId}:`, mailErr.message);
                }

                // In-app notification
                await Notification.create({
                    userId,
                    subject: 'Employer Selection Accepted — Interview Scheduling',
                    message: `Your selection of ${employingName} as your Tier-1 sponsor has been formally accepted. The recruitment panel will contact you with interview and onboarding details.`,
                    type: 'SYSTEM',
                    isRead: false
                }).catch(() => {});

                // Admin notification
                const adminEmail = 'nnamdisolomon1@gmail.com';
                await sendInfoEmail(
                    adminEmail,
                    `Cron Executed: Employer Selection Formally Accepted for ${user.fullName}`,
                    `<p>Employer Selection for <strong>${employingName}</strong> has been accepted. Application advanced to <strong>Interview Scheduling</strong> for candidate ${user.fullName} (User ID: ${userId}).</p>`
                ).catch(() => {});

                processedCount++;
            } else {
                // ==========================================
                // CASE B: Non-employing selected -> SEND FILLED EMAIL & MAKE isEmploying ONLY OPTION
                // ==========================================
                console.log(`[${CRON_NAME}] Application ${application.id} selected non-employing employer "${selectedHost}". Sending filled email and restricting to ${employingName}.`);

                // a) Generate updated Employer Selection Form containing ONLY MACA
                let updatedAdminDocUrl: string | null = null;
                let macBuffer: Buffer | undefined = undefined;
                try {
                    const macDocx = await generateEmployerSelectionFormDocx({
                        applicantId: userId,
                        fullName: user.fullName,
                        email: user.email,
                        jobTitle: (application as any).JobListing?.title || 'FIFO Mobile Plant Operator',
                        employerName: employingName,
                        onlyEmployingEmployer: true
                    });
                    macBuffer = await Packer.toBuffer(macDocx);

                    const publicDocsDir = path.resolve(__dirname, '../../public/documents');
                    if (!fs.existsSync(publicDocsDir)) fs.mkdirSync(publicDocsDir, { recursive: true });
                    const docFilename = `Employer_Selection_Form_MACA_${application.id}.docx`;
                    const docFilePath = path.join(publicDocsDir, docFilename);
                    fs.writeFileSync(docFilePath, macBuffer);
                    updatedAdminDocUrl = `/documents/${docFilename}`;
                } catch (docErr: any) {
                    console.error(`[${CRON_NAME}] Failed to generate MACA-only DOCX:`, docErr.message);
                }

                // b) Remove non-MACA nominations so dashboard displays ONLY MACA
                await Nomination.destroy({
                    where: {
                        applicationId: application.id,
                        hostEmployer: { [Op.notLike]: '%MACA%' }
                    }
                });

                // Ensure MACA nomination is the sole option and reset for selection
                let macaNom = await Nomination.findOne({
                    where: {
                        applicationId: application.id,
                        hostEmployer: { [Op.like]: '%MACA%' }
                    }
                });

                if (!macaNom) {
                    macaNom = await Nomination.create({
                        applicationId: application.id,
                        tradeStream: (application as any)?.JobListing?.title || 'FIFO Mobile Plant Operator',
                        hostEmployer: employingName,
                        vacancies: '3 Slots Available',
                        competitors: '5 Nominated Candidates',
                        isSelected: false,
                        documentUrl: null,
                        adminDocumentUrl: updatedAdminDocUrl
                    });
                } else {
                    macaNom.isSelected = false;
                    macaNom.documentUrl = null;
                    if (updatedAdminDocUrl) macaNom.adminDocumentUrl = updatedAdminDocUrl;
                    await macaNom.save();
                }

                // c) Send Email 7b (Employer Selection Filled mail)
                try {
                    await sendEmployerSelectionFilledEmail(
                        user.email,
                        user.fullName,
                        selectedHost,
                        updatedAdminDocUrl || undefined,
                        macBuffer
                    );
                } catch (mailErr7b: any) {
                    console.error(`[${CRON_NAME}] Filled email failed for user ${userId}:`, mailErr7b.message);
                }

                // d) Create in-app notification
                await Notification.create({
                    userId,
                    subject: 'Important: Employer Selection Quota Filled — Alternative Allocation Available',
                    message: `Your previously selected employer (${selectedHost}) vacancy has been filled due to high candidate quota limits. ${employingName} is currently the only available Tier-1 Australian sponsor with immediate site allocation. Please visit your Employer Selection page to confirm and submit your selection for ${employingName}.`,
                    type: 'SYSTEM',
                    isRead: false
                }).catch(() => {});

                // e) Reset stage status back to 'ongoing' so candidate can re-select and re-submit
                await stage.update({ status: 'ongoing', isCompleted: false });

                // f) Admin notification
                const adminEmail = 'nnamdisolomon1@gmail.com';
                await sendInfoEmail(
                    adminEmail,
                    `Cron Executed: Employer Selection Quota Filled for ${user.fullName}`,
                    `<p>Candidate <strong>${user.fullName}</strong> selected non-employing employer <strong>${selectedHost}</strong>. Quota filled email dispatched and options restricted exclusively to <strong>${employingName}</strong>.</p>`
                ).catch(() => {});

                processedCount++;
            }
        }

        recordCronRun(CRON_NAME, 'ok');
        return processedCount;
    } catch (err: any) {
        console.error(`[${CRON_NAME}] Fatal error:`, err);
        recordCronRun(CRON_NAME, 'error', String(err));
        return 0;
    }
}

/**
 * Composite Cron: Nomination Followup
 * Runs both the dispatch cron (for newly accepted applications) and the acceptance cron (for submitted applications).
 */
export async function runNominationFollowupCron(
    forceUserId?: number,
    bypassTimeDelay?: boolean,
    bypassPause?: boolean
): Promise<number> {
    const CRON_NAME = 'NominationFollowup';
    try {
        console.log(`[${CRON_NAME}] Running composite nomination crons (dispatch + acceptance)...`);
        const countDispatch = await runEmployerSelectionDispatchCron(forceUserId, bypassTimeDelay, bypassPause);
        const countAcceptance = await runEmployerAcceptanceCron(forceUserId, bypassTimeDelay, bypassPause);
        const total = countDispatch + countAcceptance;
        recordCronRun(CRON_NAME, 'ok');
        return total;
    } catch (err: any) {
        console.error(`[${CRON_NAME}] Fatal error:`, err);
        recordCronRun(CRON_NAME, 'error', String(err));
        return 0;
    }
}
