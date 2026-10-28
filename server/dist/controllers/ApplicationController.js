"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.applicationController = exports.ApplicationController = void 0;
const path_1 = __importDefault(require("path"));
const ApplicationService_1 = require("../services/ApplicationService");
const constants_1 = require("../constants");
const email_1 = require("../utils/email");
const models_1 = require("../models");
const pdfGenerator_1 = require("../utils/pdfGenerator");
class ApplicationController {
    // Maps to STK-APP-APPLY-001, TRUST-009
    async startApplication(req, res) {
        try {
            const userId = req.user.id;
            const jobId = parseInt(req.body.jobId, 10);
            const tickets = req.body.tickets || [];
            const application = await ApplicationService_1.applicationService.startApplication(userId, jobId, tickets);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.CREATED).json(application);
        }
        catch (error) {
            console.error('[ApplicationController.startApplication]', error);
            if (error.message === constants_1.CONSTANTS.ERROR_MESSAGES.RESOURCE_NOT_FOUND) {
                res.status(constants_1.CONSTANTS.HTTP_STATUS.NOT_FOUND).json({ error: error.message });
                return;
            }
            res.status(constants_1.CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: constants_1.CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }
    async draftApplication(req, res) {
        try {
            const userId = req.user.id;
            const jobId = parseInt(req.body.jobId, 10);
            const deleteExisting = req.body.deleteExisting === true;
            const application = await ApplicationService_1.applicationService.draftApplication(userId, jobId, deleteExisting);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.CREATED).json(application);
        }
        catch (error) {
            console.error('[ApplicationController.draftApplication]', error);
            if (error.message === constants_1.CONSTANTS.ERROR_MESSAGES.RESOURCE_NOT_FOUND) {
                res.status(constants_1.CONSTANTS.HTTP_STATUS.NOT_FOUND).json({ error: error.message });
                return;
            }
            res.status(constants_1.CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: constants_1.CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }
    // Maps to STK-APP-APPLY-005, DM-001
    async advanceApplication(req, res) {
        try {
            const id = parseInt(req.params.id, 10);
            const { shouldNotify } = req.body;
            const app = await ApplicationService_1.applicationService.advanceApplicationStage(id, shouldNotify !== false);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json(app);
        }
        catch (error) {
            console.error('[ApplicationController.advanceApplication]', error);
            if (error.message === constants_1.CONSTANTS.ERROR_MESSAGES.RESOURCE_NOT_FOUND) {
                res.status(constants_1.CONSTANTS.HTTP_STATUS.NOT_FOUND).json({ error: error.message });
                return;
            }
            res.status(constants_1.CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: constants_1.CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }
    // Maps to STK-APP-APPLIST-001
    async getUserApplications(req, res) {
        try {
            const userId = req.user.id;
            const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
            const offset = req.query.offset ? parseInt(req.query.offset, 10) : 0;
            const applications = await ApplicationService_1.applicationService.getUserApplications(userId, limit, offset);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json(applications);
        }
        catch (error) {
            console.error('[ApplicationController.getUserApplications]', error);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: constants_1.CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }
    // Maps to STK-APP-APPLY-002
    async getApplicationDetails(req, res) {
        try {
            const id = parseInt(req.params.id, 10);
            const app = await ApplicationService_1.applicationService.getApplicationDetails(id);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json(app);
        }
        catch (error) {
            console.error('[ApplicationController.getApplicationDetails]', error);
            if (error.message === constants_1.CONSTANTS.ERROR_MESSAGES.RESOURCE_NOT_FOUND) {
                res.status(constants_1.CONSTANTS.HTTP_STATUS.NOT_FOUND).json({ error: error.message });
                return;
            }
            res.status(constants_1.CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: constants_1.CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }
    // Maps to STK-APP-DASH-001..003 — applicant dashboard aggregation
    async getDashboardSummary(req, res) {
        try {
            const userId = req.user.id;
            const summary = await ApplicationService_1.applicationService.getDashboardSummary(userId);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json(summary);
        }
        catch (error) {
            console.error('[ApplicationController.getDashboardSummary]', error);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: constants_1.CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }
    // Maps to STK-ADM-APP-001 — admin: new/completed applications
    async getAdminApplications(req, res) {
        try {
            const status = req.query.status;
            const userId = req.query.userId ? parseInt(req.query.userId, 10) : undefined;
            const limit = req.query.limit ? parseInt(req.query.limit, 10) : 20;
            const offset = req.query.offset ? parseInt(req.query.offset, 10) : 0;
            const applications = await ApplicationService_1.applicationService.getApplicationsByStatus(status, limit, offset, userId);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json(applications);
        }
        catch (error) {
            console.error('[ApplicationController.getAdminApplications]', error);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: constants_1.CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }
    // Maps to STK-ADM-APP-002 — admin: draft applications view
    async getDraftApplications(req, res) {
        try {
            const limit = req.query.limit ? parseInt(req.query.limit, 10) : 20;
            const offset = req.query.offset ? parseInt(req.query.offset, 10) : 0;
            const drafts = await ApplicationService_1.applicationService.getDraftApplications(limit, offset);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json(drafts);
        }
        catch (error) {
            console.error('[ApplicationController.getDraftApplications]', error);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: constants_1.CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }
    // Admin: inject ad-hoc stage into application pipeline
    async addStage(req, res) {
        try {
            const id = parseInt(req.params.id, 10);
            const stage = await ApplicationService_1.applicationService.addStageToApplication(id, req.body);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.CREATED).json(stage);
        }
        catch (error) {
            console.error('[ApplicationController.addStage]', error);
            if (error.message === constants_1.CONSTANTS.ERROR_MESSAGES.RESOURCE_NOT_FOUND) {
                res.status(constants_1.CONSTANTS.HTTP_STATUS.NOT_FOUND).json({ error: error.message });
                return;
            }
            res.status(constants_1.CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: constants_1.CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }
    async getStageDetails(req, res) {
        try {
            const stageId = parseInt(req.params.stageId, 10);
            const stage = await ApplicationService_1.applicationService.getApplicationStage(stageId);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json(stage);
        }
        catch (error) {
            console.error('[ApplicationController.getStageDetails]', error);
            if (error.message === constants_1.CONSTANTS.ERROR_MESSAGES.RESOURCE_NOT_FOUND) {
                res.status(constants_1.CONSTANTS.HTTP_STATUS.NOT_FOUND).json({ error: error.message });
                return;
            }
            res.status(constants_1.CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: constants_1.CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }
    async updateStage(req, res) {
        try {
            const stageId = parseInt(req.params.stageId, 10);
            const stage = await ApplicationService_1.applicationService.updateApplicationStage(stageId, req.body);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json(stage);
        }
        catch (error) {
            console.error('[ApplicationController.updateStage]', error);
            if (error.message === constants_1.CONSTANTS.ERROR_MESSAGES.RESOURCE_NOT_FOUND) {
                res.status(constants_1.CONSTANTS.HTTP_STATUS.NOT_FOUND).json({ error: error.message });
                return;
            }
            res.status(constants_1.CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: constants_1.CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }
    async deleteStage(req, res) {
        try {
            const stageId = parseInt(req.params.stageId, 10);
            await ApplicationService_1.applicationService.deleteApplicationStage(stageId);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json({ message: constants_1.CONSTANTS.SUCCESS_MESSAGES.DELETED });
        }
        catch (error) {
            console.error('[ApplicationController.deleteStage]', error);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: constants_1.CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }
    async completeApplication(req, res) {
        try {
            const id = parseInt(req.params.id, 10);
            const app = await ApplicationService_1.applicationService.completeApplication(id);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json(app);
        }
        catch (error) {
            console.error('[ApplicationController.completeApplication]', error);
            if (error.message === constants_1.CONSTANTS.ERROR_MESSAGES.RESOURCE_NOT_FOUND) {
                res.status(constants_1.CONSTANTS.HTTP_STATUS.NOT_FOUND).json({ error: error.message });
                return;
            }
            res.status(constants_1.CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: constants_1.CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }
    async completeApplicationStage(req, res) {
        try {
            const stageId = parseInt(req.params.stageId, 10);
            const stage = await ApplicationService_1.applicationService.completeApplicationStage(stageId);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json(stage);
        }
        catch (error) {
            console.error('[ApplicationController.completeApplicationStage]', error);
            if (error.message === constants_1.CONSTANTS.ERROR_MESSAGES.RESOURCE_NOT_FOUND) {
                res.status(constants_1.CONSTANTS.HTTP_STATUS.NOT_FOUND).json({ error: error.message });
                return;
            }
            res.status(constants_1.CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: constants_1.CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }
    async deleteApplication(req, res) {
        try {
            const id = parseInt(req.params.id, 10);
            await ApplicationService_1.applicationService.deleteApplication(id);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json({ message: constants_1.CONSTANTS.SUCCESS_MESSAGES.DELETED });
        }
        catch (error) {
            console.error('[ApplicationController.deleteApplication]', error);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: constants_1.CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }
    async applyVisaSponsorship(req, res) {
        try {
            const id = parseInt(req.params.id, 10);
            const app = await ApplicationService_1.applicationService.applyVisaSponsorship(id);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json(app);
        }
        catch (error) {
            console.error('[ApplicationController.applyVisaSponsorship]', error);
            if (error.message === constants_1.CONSTANTS.ERROR_MESSAGES.RESOURCE_NOT_FOUND) {
                res.status(constants_1.CONSTANTS.HTTP_STATUS.NOT_FOUND).json({ error: error.message });
                return;
            }
            res.status(constants_1.CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: constants_1.CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }
    async updateVisaSponsorshipStatus(req, res) {
        try {
            const id = parseInt(req.params.id, 10);
            const { status } = req.body;
            const app = await ApplicationService_1.applicationService.updateVisaSponsorshipStatus(id, status);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json(app);
        }
        catch (error) {
            console.error('[ApplicationController.updateVisaSponsorshipStatus]', error);
            if (error.message === constants_1.CONSTANTS.ERROR_MESSAGES.RESOURCE_NOT_FOUND) {
                res.status(constants_1.CONSTANTS.HTTP_STATUS.NOT_FOUND).json({ error: error.message });
                return;
            }
            res.status(constants_1.CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: constants_1.CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }
    async createNominations(req, res) {
        try {
            const id = parseInt(req.params.id, 10);
            const { nominations, userId, candidateName, candidateEmail, documentUrl, totalApplicants } = req.body;
            const created = await ApplicationService_1.applicationService.createNominations(id, nominations);
            // Update stage to Nomination on-going
            if (userId) {
                try {
                    await ApplicationService_1.applicationService.updateLatestApplicationStageStatus(parseInt(userId, 10), 'on-going');
                }
                catch (stageErr) {
                    console.error('[ApplicationController.createNominations] stage update failed:', stageErr);
                }
            }
            // Send NominationPresentationMail with document attachment and employer details
            if (candidateEmail && documentUrl) {
                try {
                    // Fetch application details to get job listing and linked employers
                    const app = await models_1.Application.findByPk(id, {
                        include: [
                            {
                                model: models_1.JobListing,
                                include: [
                                    {
                                        model: models_1.JoblistingEmployer,
                                        as: 'joblistingEmployers',
                                        include: [{ model: models_1.Employer, as: 'employer' }]
                                    }
                                ]
                            }
                        ]
                    });
                    let employersSectionHtml = '';
                    const linkedEmployers = app?.JobListing?.joblistingEmployers || [];
                    if (linkedEmployers.length > 0) {
                        employersSectionHtml = linkedEmployers.map((item) => {
                            const emp = item.employer;
                            if (!emp)
                                return '';
                            return `
                                <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 16px; margin: 12px 0;">
                                    <h4 style="margin: 0 0 6px 0; color: #0b3486; font-size: 14px; font-weight: 700;">Participating Hiring Partner: ${emp.name}</h4>
                                    <p style="margin: 0 0 8px 0; color: #334155; font-size: 12px; line-height: 1.5;">${emp.companyDescription || ''}</p>
                                    <p style="margin: 0 0 4px 0; font-size: 12px; color: #475569;">
                                        <strong>Website:</strong> <a href="${emp.websiteUrl}" target="_blank" style="color: #0b3486; text-decoration: underline;">${emp.websiteUrl}</a>
                                    </p>
                                    ${item.vacancyUrl ? `
                                    <p style="margin: 4px 0 0 0; font-size: 12px; color: #475569;">
                                        <strong>Official Vacancy Posting:</strong> <a href="${item.vacancyUrl}" target="_blank" style="color: #0b3486; text-decoration: underline;">${item.vacancyUrl}</a>
                                    </p>` : ''}
                                </div>
                            `;
                        }).join('');
                    }
                    const subject = 'Your Official Employer Selection & Trade Nomination – Action Required Within 48 Hours';
                    const content = `
                        <p>Dear ${candidateName || 'Candidate'},</p>
                        <p>Blue Collar Recruitment Pty Limited is pleased to present your Official Notice of Employer Selection.</p>
                        <p>Please find your employer selection document attached. Kindly review the available partner opportunities below, select exactly <strong>one (1) option</strong>, sign the document, and return it within <strong>forty-eight (48) hours</strong>.</p>
                        <p>You may also review, sign, and submit your selection online through your candidate dashboard.</p>
                        
                        ${employersSectionHtml}

                        <div style="background-color: #f1f5f9; border-left: 4px solid #0b3486; padding: 14px 16px; margin: 18px 0; border-radius: 4px;">
                            <p style="margin: 0; font-weight: 600; color: #1e293b; font-size: 14px;">Official Australian Visa Sponsorship Verification</p>
                            <p style="margin: 6px 0 0 0; color: #475569; font-size: 13px; line-height: 1.5;">
                                You can verify that the employers listed in your selection document are registered Australian visa sponsors by reviewing the official public ledger:
                                <br/>
                                <a href="https://www.workvisalawyers.com.au/images/Approved-Sponsor-List-2025.pdf" target="_blank" style="color: #0b3486; font-weight: 700; text-decoration: underline;">
                                    View Official Approved Visa Sponsor List (PDF) &rarr;
                                </a>
                            </p>
                            <p style="margin: 8px 0 0 0; font-size: 12px; color: #64748b;">
                                <em>Note: The most recent official sponsor list public release was issued in 2025 (against 2026).</em>
                            </p>
                        </div>
                        <p>Yours sincerely,<br>Troy Latuff<br>Chief Executive Officer<br>Blue Collar Recruitment Pty Ltd</p>
                    `;
                    let attachments = [];
                    if (documentUrl) {
                        if (typeof documentUrl === 'string' && documentUrl.startsWith('data:')) {
                            const base64Data = documentUrl.split(';base64,').pop() || '';
                            attachments.push({
                                filename: 'Employer_Selection_Form.pdf',
                                content: Buffer.from(base64Data, 'base64'),
                                contentType: 'application/pdf'
                            });
                        }
                        else if (typeof documentUrl === 'string' && documentUrl.startsWith('http')) {
                            attachments.push({
                                filename: 'Employer_Selection_Form.pdf',
                                path: documentUrl,
                                contentType: 'application/pdf'
                            });
                        }
                        else if (typeof documentUrl === 'string') {
                            const localPath = path_1.default.isAbsolute(documentUrl)
                                ? documentUrl
                                : path_1.default.resolve(__dirname, '../../public', documentUrl.replace(/^\//, ''));
                            attachments.push({
                                filename: 'Employer_Selection_Form.pdf',
                                path: localPath,
                                contentType: 'application/pdf'
                            });
                        }
                    }
                    else {
                        try {
                            const pdfBuf = (0, pdfGenerator_1.generateEmployerSelectionFormPDF)({
                                applicantId: userId,
                                fullName: candidateName || 'Candidate',
                                email: candidateEmail,
                                jobTitle: app?.JobListing?.title || 'FIFO Specialist',
                                onlyEmployingEmployer: false
                            });
                            attachments.push({
                                filename: 'Employer_Selection_Form.pdf',
                                content: pdfBuf,
                                contentType: 'application/pdf'
                            });
                        }
                        catch (genErr) {
                            console.error('[ApplicationController.createNominations] fallback pdf gen error:', genErr);
                        }
                    }
                    await (0, email_1.sendInfoEmail)(candidateEmail, subject, content, attachments);
                }
                catch (mailErr) {
                    console.error('[ApplicationController.createNominations] email failed:', mailErr);
                }
            }
            res.status(constants_1.CONSTANTS.HTTP_STATUS.CREATED).json(created);
        }
        catch (error) {
            console.error('[ApplicationController.createNominations]', error);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: constants_1.CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }
    async getNominations(req, res) {
        try {
            const id = parseInt(req.params.id, 10);
            const nominations = await ApplicationService_1.applicationService.getNominations(id);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json(nominations);
        }
        catch (error) {
            console.error('[ApplicationController.getNominations]', error);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: constants_1.CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }
    async getAllNominations(req, res) {
        try {
            const nominations = await ApplicationService_1.applicationService.getAllNominations();
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json(nominations);
        }
        catch (error) {
            console.error('[ApplicationController.getAllNominations]', error);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: constants_1.CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }
    async uploadNominationDocument(req, res) {
        try {
            const userId = req.user.id;
            const { documentUrl, applicationId, nominationIds } = req.body;
            if (!documentUrl || !applicationId) {
                res.status(400).json({ error: 'documentUrl and applicationId are required' });
                return;
            }
            if (nominationIds && Array.isArray(nominationIds) && nominationIds.length > 0) {
                await ApplicationService_1.applicationService.selectNominations(applicationId, nominationIds);
            }
            await ApplicationService_1.applicationService.saveNominationDocument(applicationId, documentUrl);
            // Fetch user, application, and active employing employer
            const user = await models_1.User.findByPk(userId);
            const app = await models_1.Application.findByPk(applicationId, {
                include: [{ model: models_1.JobListing }]
            });
            const employingEmployer = await models_1.Employer.findOne({ where: { isEmploying: true } });
            const employingName = employingEmployer?.name || 'MACA Limited';
            // Find currently selected nomination
            const selectedNomination = await models_1.Nomination.findOne({
                where: { applicationId, isSelected: true }
            });
            const selectedHost = selectedNomination?.hostEmployer || '';
            const isMaca = selectedHost.toLowerCase().includes('maca') ||
                (employingEmployer && selectedHost.toLowerCase().trim() === employingEmployer.name.toLowerCase().trim());
            // 1. Email 7a ALWAYS runs on every submission (Submission Confirmation)
            if (user) {
                try {
                    await (0, email_1.sendEmployerSelectionSubmittedEmail)(user.email, user.fullName, selectedHost || employingName);
                }
                catch (mailErr7a) {
                    console.error('[ApplicationController.uploadNominationDocument] Email 7a failed:', mailErr7a);
                }
            }
            // 2. Mark stage as under-review for the Employer Acceptance Cron to evaluate
            try {
                await ApplicationService_1.applicationService.updateLatestApplicationStageStatus(userId, 'under-review');
            }
            catch (stageErr) {
                console.error('[ApplicationController.uploadNominationDocument] stage update failed:', stageErr);
            }
            // 3. Create candidate in-app notification
            try {
                const { Notification } = require('../models');
                await Notification.create({
                    userId,
                    subject: 'Employer Selection Submitted — Verification In Progress',
                    message: `Your signed Employer Selection Form has been received and is currently under review by our corporate partnerships desk. You will receive an operational update once quota verification concludes.`,
                    type: 'SYSTEM',
                    isRead: false
                });
            }
            catch (notifErr) {
                console.error('[ApplicationController] Notification create failed:', notifErr);
            }
            // 4. Notify admin of submission
            const adminEmail = 'nnamdisolomon1@gmail.com';
            const subject = `Signed Employer Selection Uploaded – Candidate: ${user?.fullName || userId}`;
            const content = `
                <p>Hello Admin,</p>
                <p>A candidate has uploaded their signed employer selection document.</p>
                <ul>
                    <li><strong>Candidate:</strong> ${user?.fullName || 'N/A'} (User ID: ${userId})</li>
                    <li><strong>Application ID:</strong> ${applicationId}</li>
                    <li><strong>Nominated Employer:</strong> ${selectedHost || 'Unspecified'}</li>
                    <li><strong>Document URL:</strong> <a href="${documentUrl}">View Document</a></li>
                </ul>
                <p>Status has been set to <strong>under-review</strong>. The automated Employer Acceptance Cron will evaluate the quota allocation against active employing partners.</p>
            `;
            await (0, email_1.sendInfoEmail)(adminEmail, subject, content).catch(e => console.error('[uploadNominationDocument] admin email:', e));
            res.status(200).json({
                message: 'Document uploaded successfully! Your nomination is now under review.',
                status: 'under-review'
            });
        }
        catch (error) {
            console.error('[ApplicationController.uploadNominationDocument]', error);
            res.status(500).json({ error: 'Failed to upload document' });
        }
    }
    async getContracts(req, res) {
        try {
            const id = parseInt(req.params.id, 10);
            const contracts = await ApplicationService_1.applicationService.getContracts(id);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json(contracts);
        }
        catch (error) {
            console.error('[ApplicationController.getContracts]', error);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: constants_1.CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }
    async createContract(req, res) {
        try {
            const id = parseInt(req.params.id, 10);
            const { company, role, adminDocumentUrl } = req.body;
            const contract = await ApplicationService_1.applicationService.createContract(id, company, role, adminDocumentUrl);
            try {
                // Fetch app to get applicant's userId
                const app = await ApplicationService_1.applicationService.getApplicationDetails(id);
                if (app && app.userId) {
                    await ApplicationService_1.applicationService.updateLatestApplicationStageStatus(app.userId, 'ongoing');
                    // Send the contract email to the applicant
                    if (app.User && app.User.email) {
                        const subject = 'Action Required: Your Training and Ticket Acquisition Contract';
                        const content = `
                            <p>Dear ${app.User.fullName || 'Candidate'},</p>
                            <p>Blue Collar Recruitment Pty Limited has generated your Official Training and Ticket Acquisition Contract for the <strong>${role}</strong> position at <strong>${company}</strong>.</p>
                            <p>Please find your contract document attached. Kindly review, sign, and return it within the stipulated time frame.</p>
                            <p>To return it, upload the signed document directly through your applicant dashboard.</p>
                            <p>Best regards,<br>The Blue Collar Recruitment Team</p>
                        `;
                        let attachments = [];
                        if (adminDocumentUrl) {
                            if (typeof adminDocumentUrl === 'string' && adminDocumentUrl.startsWith('data:')) {
                                const base64Data = adminDocumentUrl.split(';base64,').pop() || '';
                                attachments.push({
                                    filename: 'fifo-candidate-agreement.pdf',
                                    content: Buffer.from(base64Data, 'base64'),
                                    contentType: 'application/pdf'
                                });
                            }
                            else if (typeof adminDocumentUrl === 'string' && adminDocumentUrl.startsWith('http')) {
                                attachments.push({
                                    filename: 'fifo-candidate-agreement.pdf',
                                    path: adminDocumentUrl,
                                    contentType: 'application/pdf'
                                });
                            }
                            else if (typeof adminDocumentUrl === 'string') {
                                const contractPath = path_1.default.isAbsolute(adminDocumentUrl)
                                    ? adminDocumentUrl
                                    : path_1.default.resolve(__dirname, '../../public', adminDocumentUrl.replace(/^\//, ''));
                                attachments.push({
                                    filename: 'fifo-candidate-agreement.pdf',
                                    path: contractPath,
                                    contentType: 'application/pdf'
                                });
                            }
                        }
                        else {
                            try {
                                const buf = (0, pdfGenerator_1.generateContractPDF)(app.User.fullName || 'Candidate', role, company, 70, 720);
                                attachments.push({
                                    filename: 'fifo-candidate-agreement.pdf',
                                    content: buf,
                                    contentType: 'application/pdf'
                                });
                            }
                            catch (e) {
                                console.error('[ApplicationController.createContract] Fallback contract PDF failed:', e);
                            }
                        }
                        await (0, email_1.sendInfoEmail)(app.User.email, subject, content, attachments);
                    }
                }
            }
            catch (err) {
                console.error('[ApplicationController.createContract] stage update or email error:', err);
            }
            res.status(constants_1.CONSTANTS.HTTP_STATUS.CREATED).json(contract);
        }
        catch (error) {
            console.error('[ApplicationController.createContract]', error);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: constants_1.CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }
    async acceptContract(req, res) {
        try {
            const id = parseInt(req.params.id, 10);
            const contractId = parseInt(req.params.contractId, 10);
            const contract = await ApplicationService_1.applicationService.updateContractStatus(id, contractId, 'accepted');
            // Complete Contract stage and dispatch approval email
            try {
                const { JobStage, User, Application } = require('../models');
                const { sendInfoEmail } = require('../utils/email');
                const app = await Application.findByPk(id);
                if (app) {
                    const stage = await JobStage.findOne({ where: { applicationId: id, name: 'Contract' } });
                    if (stage)
                        await stage.update({ status: 'completed' });
                    const user = await User.findByPk(app.userId);
                    if (user) {
                        const subject = 'Your Contract Has Been Approved';
                        const content = `
                            <p>Dear ${user.fullName},</p>
                            <p>Your signed contract has been reviewed and <strong>approved</strong>.</p>
                            <div style="background-color: #f8fafc; border-left: 4px solid #10b981; padding: 16px; margin: 20px 0; border-radius: 8px;">
                                <p style="margin: 0; font-size: 13px; color: #64748b; text-transform: uppercase; font-weight: bold;">Official Sponsorship Identifier</p>
                                <h3 style="margin: 4px 0 0; font-size: 20px; color: #065f46; font-family: monospace;">${contract.sponsorshipId || 'MACA-SPON-2026'}</h3>
                            </div>
                            <p>We are excited to move forward with your deployment. Please log in to your dashboard to view your fully executed contract.</p>
                            <p><strong>Important Note:</strong> The next stages of your onboarding, specifically the Ticket Courses and Exams phase, shall be handled by our partner Registered Training Organisation, <strong>CertHero</strong>. You will receive further communication from them shortly detailing your next steps.</p>
                            <p>Yours sincerely,<br>Gary Nexon Fletcher.<br>Hiring Manager.<br>Blue Collar Recruitment.</p>
                        `;
                        await sendInfoEmail(user.email, subject, content).catch((err) => console.error('[ApplicationController.acceptContract] Email failed:', err));
                    }
                }
            }
            catch (stageErr) {
                console.error('[ApplicationController.acceptContract] Stage completion error:', stageErr);
            }
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json(contract);
        }
        catch (error) {
            console.error('[ApplicationController.acceptContract]', error);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: constants_1.CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }
    async rejectContract(req, res) {
        try {
            const id = parseInt(req.params.id, 10);
            const contractId = parseInt(req.params.contractId, 10);
            const contract = await ApplicationService_1.applicationService.updateContractStatus(id, contractId, 'rejected');
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json(contract);
        }
        catch (error) {
            console.error('[ApplicationController.rejectContract]', error);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: constants_1.CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }
    async uploadContractDocument(req, res) {
        try {
            const userId = req.user.id;
            const { documentUrl, documentType, applicationId, contractId } = req.body;
            if (!documentUrl || !applicationId || !contractId) {
                res.status(400).json({ error: 'documentUrl, applicationId, and contractId are required' });
                return;
            }
            await ApplicationService_1.applicationService.saveContractDocument(applicationId, contractId, documentUrl, documentType);
            try {
                await ApplicationService_1.applicationService.updateLatestApplicationStageStatus(userId, 'under-review');
            }
            catch (err) {
                console.error('[ApplicationController.uploadContractDocument] stage update error:', err);
            }
            const { sendInfoEmail } = require('../utils/email');
            // Send the document to the admin
            const adminEmail = 'nnamdisolomon1@gmail.com';
            const adminSubject = `New Signed Contract Uploaded (User ID: ${userId})`;
            const adminContent = `
                <p>Hello Admin,</p>
                <p>A candidate has uploaded their signed contract (${documentType || 'Document'}).</p>
                <ul>
                    <li><strong>Candidate User ID:</strong> ${userId}</li>
                    <li><strong>Application ID:</strong> ${applicationId}</li>
                    <li><strong>Contract ID:</strong> ${contractId}</li>
                    <li><strong>Document URL:</strong> <a href="${documentUrl}">View Document</a></li>
                </ul>
            `;
            await sendInfoEmail(adminEmail, adminSubject, adminContent);
            // Send confirmation to candidate
            try {
                const { User } = require('../models');
                const user = await User.findByPk(userId);
                if (user) {
                    const candidateSubject = `Contract Received and Under Review`;
                    const candidateContent = `
                        <p>Dear ${user.fullName || 'Candidate'},</p>
                        <p>We have successfully received your signed contract document (${documentType || 'Document'}).</p>
                        <p>Your contract is currently <strong>Under Review</strong>. This process typically takes up to 3 hours.</p>
                        <p>We will notify you once the contract has been fully approved.</p>
                        <p>Best regards,<br>The Blue Collar Recruitment Team</p>
                    `;
                    await sendInfoEmail(user.email, candidateSubject, candidateContent);
                }
            }
            catch (err) {
                console.error('[ApplicationController.uploadContractDocument] Failed to send candidate email', err);
            }
            res.status(200).json({ message: 'Document uploaded successfully and sent to admin.' });
        }
        catch (error) {
            console.error('[ApplicationController.uploadContractDocument]', error);
            res.status(500).json({ error: 'Failed to upload document' });
        }
    }
    /**
     * CHANGES.md Prompt 8: Manual Application Acceptance by Admin with mandatory drafted mail.
     */
    async acceptApplicationWithDraft(req, res) {
        try {
            const applicationId = parseInt(req.params.id, 10);
            const { subject, message, fromType = 'info' } = req.body;
            if (!subject || !message || !message.trim()) {
                res.status(constants_1.CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
                    error: 'Subject and drafted message content are mandatory for application acceptance.'
                });
                return;
            }
            const { Application, JobStage, JobListing, User, Notification } = require('../models');
            const application = await Application.findByPk(applicationId, {
                include: [
                    { model: JobListing },
                    { model: User }
                ]
            });
            if (!application) {
                res.status(constants_1.CONSTANTS.HTTP_STATUS.NOT_FOUND).json({ error: 'Application not found' });
                return;
            }
            const applicant = application.User;
            const jobTitle = application.JobListing?.title || 'Applied FIFO Position';
            // 1. Mark 'Application' stage as accepted
            const appStage = await JobStage.findOne({
                where: {
                    applicationId: application.id,
                    name: 'Application'
                }
            });
            if (appStage) {
                await appStage.update({ status: 'accepted' });
            }
            // 2. Advance to Employer Selection stage (ongoing)
            const nextStage = await ApplicationService_1.applicationService.addStageToApplication(application.id, {
                name: 'Employer Selection',
                status: 'ongoing',
                setAsCurrent: true,
                notifyInApp: true,
                notifyEmail: false
            });
            // 3. Create in-app notification
            await Notification.create({
                userId: application.userId,
                subject: 'Application Accepted',
                message: `Your application for "${jobTitle}" has been reviewed and accepted. Please check your dashboard for Employer Selection details.`,
                type: 'SYSTEM',
                isRead: false
            });
            // 4. Send drafted notification email from specified channel (info/blue collar)
            await (0, email_1.sendEmailFrom)(fromType, applicant.email, subject, message);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json({
                success: true,
                message: 'Application accepted and notification email successfully dispatched to applicant.',
                stage: nextStage
            });
        }
        catch (error) {
            console.error('[ApplicationController.acceptApplicationWithDraft]', error);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                error: error.message || 'Failed to accept application'
            });
        }
    }
}
exports.ApplicationController = ApplicationController;
exports.applicationController = new ApplicationController();
