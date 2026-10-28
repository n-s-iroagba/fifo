"use strict";
/**
 * nominationCron.ts
 * Manages the two automated crons running in the Employer Selection stage before Interview Scheduling:
 * 1. runEmployerSelectionDispatchCron: Runs after application acceptance to generate options, form DOCX, and dispatch the presentation email.
 * 2. runEmployerAcceptanceCron: Runs post-submission on 'under-review' selections. If matches isEmploying (MACA) -> accepts and advances to Interview Scheduling; otherwise sends quota filled email and restricts available options to the isEmploying partner.
 * 3. runNominationFollowupCron: Composite runner executing both crons for full backwards compatibility.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runEmployerSelectionDispatchCron = runEmployerSelectionDispatchCron;
exports.runEmployerAcceptanceCron = runEmployerAcceptanceCron;
exports.runNominationFollowupCron = runNominationFollowupCron;
const sequelize_1 = require("sequelize");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const docx_1 = require("docx");
const models_1 = require("../models");
const ApplicationService_1 = require("../services/ApplicationService");
const email_1 = require("../utils/email");
const documentGenerator_1 = require("../utils/documentGenerator");
const pdfGenerator_1 = require("../utils/pdfGenerator");
const cronRegistry_1 = require("./cronRegistry");
const ONE_HOUR_MS = 60 * 60 * 1000;
/**
 * Cron 1: Employer Selection Dispatch Cron
 * Runs after application acceptance. Generates employer selection quotas/nominations, creates the DOCX form,
 * and sends the presentation email to the candidate.
 */
async function runEmployerSelectionDispatchCron(forceUserId, bypassTimeDelay, bypassPause) {
    const CRON_NAME = 'EmployerSelectionDispatch';
    try {
        if (!bypassPause && !forceUserId && ((0, cronRegistry_1.isCronPaused)('employer-selection') || (0, cronRegistry_1.isCronPaused)('nomination'))) {
            console.log(`[${CRON_NAME}] Execution skipped: cron is paused.`);
            return 0;
        }
        console.log(`[${CRON_NAME}] Checking for accepted applications pending employer selection presentation...`);
        const stageWhere = {
            name: { [sequelize_1.Op.in]: ['Employer Selection', 'Nomination'] },
            status: { [sequelize_1.Op.in]: ['ongoing', 'pending'] }
        };
        const cutoff = new Date(Date.now() - ONE_HOUR_MS);
        if (!forceUserId && !bypassTimeDelay) {
            stageWhere.updatedAt = { [sequelize_1.Op.lte]: cutoff };
        }
        const stages = await models_1.JobStage.findAll({
            where: stageWhere,
            include: [
                {
                    model: models_1.Application,
                    where: forceUserId
                        ? {
                            userId: forceUserId,
                            employerSelectionEmailSent: false,
                            [sequelize_1.Op.and]: (0, sequelize_1.literal)('`Application`.`currentStageId` = `JobStage`.`id`')
                        }
                        : {
                            employerSelectionEmailSent: false,
                            [sequelize_1.Op.and]: (0, sequelize_1.literal)('`Application`.`currentStageId` = `JobStage`.`id`')
                        },
                    required: true,
                    include: [
                        {
                            model: models_1.JobListing,
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
            const application = stage.Application;
            if (!application)
                continue;
            if (!bypassPause && !forceUserId && ((0, cronRegistry_1.isApplicationCronPaused)(application, 'employer-selection') || (0, cronRegistry_1.isApplicationCronPaused)(application, 'nomination'))) {
                console.log(`[${CRON_NAME}] Skipping application ${application.id}: stage crons paused for candidate.`);
                continue;
            }
            const userId = application.userId;
            const user = await models_1.User.findByPk(userId);
            if (!user)
                continue;
            const activeEmploying = await models_1.Employer.findOne({ where: { isEmploying: true } });
            const employingName = activeEmploying?.name || 'MACA Limited';
            const jobTitle = application.JobListing?.title || 'FIFO Mobile Plant Operator';
            // 1. Ensure nomination records exist (MACA + 2 alternative tier-1 partners)
            const existingNoms = await models_1.Nomination.findAll({ where: { applicationId: application.id } });
            if (existingNoms.length < 2) {
                // Ensure employing employer (MACA) exists
                const macaExists = existingNoms.some(n => n.hostEmployer.toLowerCase().includes('maca') || n.hostEmployer.toLowerCase() === employingName.toLowerCase());
                if (!macaExists) {
                    await models_1.Nomination.create({
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
                await models_1.Nomination.findOrCreate({
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
                await models_1.Nomination.findOrCreate({
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
            // 2. Generate official Employer Selection Form (PDF & DOCX)
            let adminDocUrl = null;
            let docBuffer = undefined;
            try {
                // Generate primary PDF form
                docBuffer = (0, pdfGenerator_1.generateEmployerSelectionFormPDF)({
                    applicantId: userId,
                    fullName: user.fullName,
                    email: user.email,
                    jobTitle,
                    employerName: employingName,
                    onlyEmployingEmployer: false
                });
                const publicDocsDir = path_1.default.resolve(__dirname, '../../public/documents');
                if (!fs_1.default.existsSync(publicDocsDir))
                    fs_1.default.mkdirSync(publicDocsDir, { recursive: true });
                const pdfFilename = `Employer_Selection_Form_${application.id}.pdf`;
                const pdfFilePath = path_1.default.join(publicDocsDir, pdfFilename);
                fs_1.default.writeFileSync(pdfFilePath, docBuffer);
                adminDocUrl = `/documents/${pdfFilename}`;
                // Also generate DOCX for archive compatibility
                try {
                    const docx = await (0, documentGenerator_1.generateEmployerSelectionFormDocx)({
                        applicantId: userId,
                        fullName: user.fullName,
                        email: user.email,
                        jobTitle,
                        employerName: employingName,
                        onlyEmployingEmployer: false
                    });
                    const docxBuf = await docx_1.Packer.toBuffer(docx);
                    fs_1.default.writeFileSync(path_1.default.join(publicDocsDir, `Employer_Selection_Form_${application.id}.docx`), docxBuf);
                }
                catch (docxErr) {
                    console.warn(`[${CRON_NAME}] DOCX archive copy failed:`, docxErr.message);
                }
                await models_1.Nomination.update({ adminDocumentUrl: adminDocUrl }, { where: { applicationId: application.id } });
            }
            catch (docErr) {
                console.error(`[${CRON_NAME}] Failed to generate PDF for application ${application.id}:`, docErr.message);
            }
            // 3. Dispatch Presentation Email with PDF Attachment
            try {
                await (0, email_1.sendEmployerSelectionPresentationEmail)(user.email, user.fullName, jobTitle, adminDocUrl || undefined, docBuffer);
            }
            catch (mailErr) {
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
            await models_1.Notification.create({
                userId,
                subject: 'Action Required: Official Notice of Employer Selection & Nomination Quota',
                message: `Your application has been accepted and your employer nomination options are now available. Please review and submit your signed selection on your dashboard.`,
                type: 'SYSTEM',
                isRead: false
            }).catch(() => { });
            // 6. Admin notice
            const adminEmail = 'nnamdisolomon1@gmail.com';
            await (0, email_1.sendInfoEmail)(adminEmail, `Cron Executed: Employer Selection Dispatched for ${user.fullName}`, `<p>Employer Selection options and form have been dispatched to candidate <strong>${user.fullName}</strong> (User ID: ${userId}, App ID: ${application.id}).</p>`).catch(() => { });
            processedCount++;
            console.log(`[${CRON_NAME}] Successfully dispatched employer selection for application ${application.id}.`);
        }
        (0, cronRegistry_1.recordCronRun)(CRON_NAME, 'ok');
        return processedCount;
    }
    catch (err) {
        console.error(`[${CRON_NAME}] Fatal error:`, err);
        (0, cronRegistry_1.recordCronRun)(CRON_NAME, 'error', String(err));
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
async function runEmployerAcceptanceCron(forceUserId, bypassTimeDelay, bypassPause) {
    const CRON_NAME = 'EmployerAcceptanceCron';
    try {
        if (!bypassPause && !forceUserId && ((0, cronRegistry_1.isCronPaused)('employer-acceptance') || (0, cronRegistry_1.isCronPaused)('nomination'))) {
            console.log(`[${CRON_NAME}] Execution skipped: cron is paused.`);
            return 0;
        }
        console.log(`[${CRON_NAME}] Checking for submitted employer selections under review...`);
        const stageWhere = {
            name: { [sequelize_1.Op.in]: ['Nomination', 'Employer Selection'] },
            status: 'under-review'
        };
        const cutoff = new Date(Date.now() - ONE_HOUR_MS);
        if (!forceUserId && !bypassTimeDelay) {
            stageWhere.updatedAt = { [sequelize_1.Op.lte]: cutoff };
        }
        const stages = await models_1.JobStage.findAll({
            where: stageWhere,
            include: [
                {
                    model: models_1.Application,
                    where: forceUserId
                        ? { userId: forceUserId, [sequelize_1.Op.and]: (0, sequelize_1.literal)('`Application`.`currentStageId` = `JobStage`.`id`') }
                        : (0, sequelize_1.literal)('`Application`.`currentStageId` = `JobStage`.`id`'),
                    required: true,
                    include: [
                        {
                            model: models_1.JobListing,
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
            const application = stage.Application;
            if (!application)
                continue;
            if (!bypassPause && !forceUserId && ((0, cronRegistry_1.isApplicationCronPaused)(application, 'employer-acceptance') || (0, cronRegistry_1.isApplicationCronPaused)(application, 'nomination'))) {
                console.log(`[${CRON_NAME}] Skipping application ${application.id}: stage crons paused for candidate.`);
                continue;
            }
            const userId = application.userId;
            const user = await models_1.User.findByPk(userId);
            if (!user)
                continue;
            const activeEmploying = await models_1.Employer.findOne({ where: { isEmploying: true } });
            const employingName = activeEmploying?.name || 'MACA Limited';
            // Find candidate's selected nomination
            let selectedNom = await models_1.Nomination.findOne({
                where: { applicationId: application.id, isSelected: true }
            });
            if (!selectedNom) {
                // Fallback to nomination with uploaded document
                selectedNom = await models_1.Nomination.findOne({
                    where: { applicationId: application.id, documentUrl: { [sequelize_1.Op.ne]: null } }
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
                await ApplicationService_1.applicationService.addStageToApplication(application.id, {
                    name: 'Interview Scheduling',
                    status: 'ongoing',
                    setAsCurrent: true,
                    notifyInApp: true,
                    notifyEmail: false
                });
                // Ensure an interview record exists
                await models_1.Interview.findOrCreate({
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
                    await (0, email_1.sendEmployerSelectionApprovedEmail)(user.email, user.fullName, employingName);
                }
                catch (mailErr) {
                    console.error(`[${CRON_NAME}] Acceptance email failed for user ${userId}:`, mailErr.message);
                }
                // In-app notification
                await models_1.Notification.create({
                    userId,
                    subject: 'Employer Selection Accepted — Interview Scheduling',
                    message: `Your selection of ${employingName} as your Tier-1 sponsor has been formally accepted. The recruitment panel will contact you with interview and onboarding details.`,
                    type: 'SYSTEM',
                    isRead: false
                }).catch(() => { });
                // Admin notification
                const adminEmail = 'nnamdisolomon1@gmail.com';
                await (0, email_1.sendInfoEmail)(adminEmail, `Cron Executed: Employer Selection Formally Accepted for ${user.fullName}`, `<p>Employer Selection for <strong>${employingName}</strong> has been accepted. Application advanced to <strong>Interview Scheduling</strong> for candidate ${user.fullName} (User ID: ${userId}).</p>`).catch(() => { });
                processedCount++;
            }
            else {
                // ==========================================
                // CASE B: Non-employing selected -> SEND FILLED EMAIL & MAKE isEmploying ONLY OPTION
                // ==========================================
                console.log(`[${CRON_NAME}] Application ${application.id} selected non-employing employer "${selectedHost}". Sending filled email and restricting to ${employingName}.`);
                // a) Generate updated Employer Selection Form (PDF & DOCX) containing ONLY MACA
                let updatedAdminDocUrl = null;
                let macBuffer = undefined;
                try {
                    // Generate primary PDF form (Form 2 imposes MACA Limited)
                    macBuffer = (0, pdfGenerator_1.generateEmployerSelectionFormPDF)({
                        applicantId: userId,
                        fullName: user.fullName,
                        email: user.email,
                        jobTitle: application.JobListing?.title || 'FIFO Mobile Plant Operator',
                        employerName: employingName,
                        onlyEmployingEmployer: true,
                        employingEmployerName: employingName
                    });
                    const publicDocsDir = path_1.default.resolve(__dirname, '../../public/documents');
                    if (!fs_1.default.existsSync(publicDocsDir))
                        fs_1.default.mkdirSync(publicDocsDir, { recursive: true });
                    const pdfFilename = `Employer_Selection_Form_MACA_${application.id}.pdf`;
                    const pdfFilePath = path_1.default.join(publicDocsDir, pdfFilename);
                    fs_1.default.writeFileSync(pdfFilePath, macBuffer);
                    updatedAdminDocUrl = `/documents/${pdfFilename}`;
                    // Also generate DOCX for archive compatibility
                    try {
                        const macDocx = await (0, documentGenerator_1.generateEmployerSelectionFormDocx)({
                            applicantId: userId,
                            fullName: user.fullName,
                            email: user.email,
                            jobTitle: application.JobListing?.title || 'FIFO Mobile Plant Operator',
                            employerName: employingName,
                            onlyEmployingEmployer: true
                        });
                        const macDocxBuf = await docx_1.Packer.toBuffer(macDocx);
                        fs_1.default.writeFileSync(path_1.default.join(publicDocsDir, `Employer_Selection_Form_MACA_${application.id}.docx`), macDocxBuf);
                    }
                    catch (docxErr) {
                        console.warn(`[${CRON_NAME}] MACA DOCX archive copy failed:`, docxErr.message);
                    }
                }
                catch (docErr) {
                    console.error(`[${CRON_NAME}] Failed to generate MACA-only PDF:`, docErr.message);
                }
                // b) Remove non-MACA nominations so dashboard displays ONLY MACA
                await models_1.Nomination.destroy({
                    where: {
                        applicationId: application.id,
                        hostEmployer: { [sequelize_1.Op.notLike]: '%MACA%' }
                    }
                });
                // Ensure MACA nomination is the sole option and reset for selection
                let macaNom = await models_1.Nomination.findOne({
                    where: {
                        applicationId: application.id,
                        hostEmployer: { [sequelize_1.Op.like]: '%MACA%' }
                    }
                });
                if (!macaNom) {
                    macaNom = await models_1.Nomination.create({
                        applicationId: application.id,
                        tradeStream: application?.JobListing?.title || 'FIFO Mobile Plant Operator',
                        hostEmployer: employingName,
                        vacancies: '3 Slots Available',
                        competitors: '5 Nominated Candidates',
                        isSelected: false,
                        documentUrl: null,
                        adminDocumentUrl: updatedAdminDocUrl
                    });
                }
                else {
                    macaNom.isSelected = false;
                    macaNom.documentUrl = null;
                    if (updatedAdminDocUrl)
                        macaNom.adminDocumentUrl = updatedAdminDocUrl;
                    await macaNom.save();
                }
                // c) Send Email 7b (Employer Selection Filled mail with PDF attachment)
                try {
                    await (0, email_1.sendEmployerSelectionFilledEmail)(user.email, user.fullName, selectedHost, updatedAdminDocUrl || undefined, macBuffer);
                }
                catch (mailErr7b) {
                    console.error(`[${CRON_NAME}] Filled email failed for user ${userId}:`, mailErr7b.message);
                }
                // d) Create in-app notification
                await models_1.Notification.create({
                    userId,
                    subject: 'Important: Employer Selection Quota Filled — Alternative Allocation Available',
                    message: `Your previously selected employer (${selectedHost}) vacancy has been filled due to high candidate quota limits. ${employingName} is currently the only available Tier-1 Australian sponsor with immediate site allocation. Please visit your Employer Selection page to confirm and submit your selection for ${employingName}.`,
                    type: 'SYSTEM',
                    isRead: false
                }).catch(() => { });
                // e) Reset stage status back to 'ongoing' so candidate can re-select and re-submit
                await stage.update({ status: 'ongoing', isCompleted: false });
                // f) Admin notification
                const adminEmail = 'nnamdisolomon1@gmail.com';
                await (0, email_1.sendInfoEmail)(adminEmail, `Cron Executed: Employer Selection Quota Filled for ${user.fullName}`, `<p>Candidate <strong>${user.fullName}</strong> selected non-employing employer <strong>${selectedHost}</strong>. Quota filled email dispatched and options restricted exclusively to <strong>${employingName}</strong>.</p>`).catch(() => { });
                processedCount++;
            }
        }
        (0, cronRegistry_1.recordCronRun)(CRON_NAME, 'ok');
        return processedCount;
    }
    catch (err) {
        console.error(`[${CRON_NAME}] Fatal error:`, err);
        (0, cronRegistry_1.recordCronRun)(CRON_NAME, 'error', String(err));
        return 0;
    }
}
/**
 * Composite Cron: Nomination Followup
 * Runs both the dispatch cron (for newly accepted applications) and the acceptance cron (for submitted applications).
 */
async function runNominationFollowupCron(forceUserId, bypassTimeDelay, bypassPause) {
    const CRON_NAME = 'NominationFollowup';
    try {
        console.log(`[${CRON_NAME}] Running composite nomination crons (dispatch + acceptance)...`);
        const countDispatch = await runEmployerSelectionDispatchCron(forceUserId, bypassTimeDelay, bypassPause);
        const countAcceptance = await runEmployerAcceptanceCron(forceUserId, bypassTimeDelay, bypassPause);
        const total = countDispatch + countAcceptance;
        (0, cronRegistry_1.recordCronRun)(CRON_NAME, 'ok');
        return total;
    }
    catch (err) {
        console.error(`[${CRON_NAME}] Fatal error:`, err);
        (0, cronRegistry_1.recordCronRun)(CRON_NAME, 'error', String(err));
        return 0;
    }
}
