"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applicationController = exports.ApplicationController = void 0;
const ApplicationService_1 = require("../services/ApplicationService");
const constants_1 = require("../constants");
const email_1 = require("../utils/email");
const User_1 = require("../models/User");
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
                    await ApplicationService_1.applicationService.updateLatestApplicationStageStatus(parseInt(userId, 10), 'Nomination on-going');
                }
                catch (stageErr) {
                    console.error('[ApplicationController.createNominations] stage update failed:', stageErr);
                }
            }
            // Send NominationPresentationMail with document attachment
            if (candidateEmail && documentUrl) {
                try {
                    const subject = 'Your Official Nomination – Action Required Within 48 Hours';
                    const content = `
                        <p>Dear ${candidateName || 'Candidate'},</p>
                        <p>Blue Collar Recruitment Pty Limited is pleased to present your Official Notice of Nomination &amp; Trade Selection.</p>
                        <p>Please find your nomination document attached. Kindly review the available options, select exactly <strong>one (1) option</strong>, sign the document, and return it within <strong>forty-eight (48) hours</strong>.</p>
                        <p>You may also download, sign, and upload the signed document through your dashboard nominations page.</p>
                        <p>Yours sincerely,<br>Troy Latuff<br>Chief Executive Officer<br>Blue Collar Recruitment Pty Ltd</p>
                    `;
                    await (0, email_1.sendInfoEmail)(candidateEmail, subject, content, documentUrl);
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
    async selectNomination(req, res) {
        try {
            const id = parseInt(req.params.id, 10);
            const nominationId = parseInt(req.params.nominationId, 10);
            const nominations = await ApplicationService_1.applicationService.selectNomination(id, nominationId);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json(nominations);
        }
        catch (error) {
            console.error('[ApplicationController.selectNomination]', error);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: constants_1.CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }
    async uploadNominationDocument(req, res) {
        try {
            const userId = req.user.id;
            const { documentUrl, documentType, applicationId } = req.body;
            if (!documentUrl || !applicationId) {
                res.status(400).json({ error: 'documentUrl and applicationId are required' });
                return;
            }
            await ApplicationService_1.applicationService.saveNominationDocument(applicationId, documentUrl);
            // Update stage to Nomination under-review
            try {
                await ApplicationService_1.applicationService.updateLatestApplicationStageStatus(userId, 'Nomination under-review');
            }
            catch (stageErr) {
                console.error('[ApplicationController.uploadNominationDocument] stage update failed:', stageErr);
            }
            // Send confirmation email to candidate
            try {
                const user = await User_1.User.findByPk(userId);
                if (user) {
                    const candidateSubject = 'Nomination Document Received – Under Review';
                    const candidateContent = `
                        <p>Dear ${user.fullName},</p>
                        <p>We have successfully received your signed Nomination Document.</p>
                        <p>Your nomination is currently under review by our team. You will be notified once a decision has been made.</p>
                        <p>Yours sincerely,<br>Blue Collar Recruitment Pty Ltd</p>
                    `;
                    await (0, email_1.sendInfoEmail)(user.email, candidateSubject, candidateContent);
                }
            }
            catch (mailErr) {
                console.error('[ApplicationController.uploadNominationDocument] candidate email failed:', mailErr);
            }
            // Notify admin
            const adminEmail = process.env.ADMIN_EMAIL || 'support@fifo.com';
            const subject = `Signed Nomination Uploaded – User ID: ${userId}`;
            const content = `
                <p>Hello Admin,</p>
                <p>A candidate has uploaded their signed nomination form.</p>
                <ul>
                    <li><strong>Candidate User ID:</strong> ${userId}</li>
                    <li><strong>Application ID:</strong> ${applicationId}</li>
                    <li><strong>Document URL:</strong> <a href="${documentUrl}">View Document</a></li>
                </ul>
            `;
            await (0, email_1.sendInfoEmail)(adminEmail, subject, content).catch(e => console.error('[uploadNominationDocument] admin email:', e));
            res.status(200).json({ message: 'Document uploaded successfully. Your nomination is now under review.' });
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
            const { company, role } = req.body;
            const contract = await ApplicationService_1.applicationService.createContract(id, company, role);
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
            await ApplicationService_1.applicationService.saveContractDocument(applicationId, contractId, documentUrl);
            const { sendInfoEmail } = require('../utils/email');
            // Send the document to the admin
            const adminEmail = process.env.ADMIN_EMAIL || 'support@fifo.com';
            const subject = `New Signed Contract Uploaded (User ID: ${userId})`;
            const content = `
                <p>Hello Admin,</p>
                <p>A candidate has uploaded their signed contract.</p>
                <ul>
                    <li><strong>Candidate User ID:</strong> ${userId}</li>
                    <li><strong>Application ID:</strong> ${applicationId}</li>
                    <li><strong>Contract ID:</strong> ${contractId}</li>
                    <li><strong>Document URL:</strong> <a href="${documentUrl}">View Document</a></li>
                </ul>
            `;
            await sendInfoEmail(adminEmail, subject, content);
            res.status(200).json({ message: 'Document uploaded successfully and sent to admin.' });
        }
        catch (error) {
            console.error('[ApplicationController.uploadContractDocument]', error);
            res.status(500).json({ error: 'Failed to upload document' });
        }
    }
}
exports.ApplicationController = ApplicationController;
exports.applicationController = new ApplicationController();
