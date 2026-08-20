import { Request, Response } from 'express';
import { applicationService } from '../services/ApplicationService';
import { CONSTANTS } from '../constants';

export class ApplicationController {
    // Maps to STK-APP-APPLY-001, TRUST-009
    public async startApplication(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).user.id;
            const jobId = parseInt(req.body.jobId, 10);
            const tickets = req.body.tickets || [];
            const application = await applicationService.startApplication(userId, jobId, tickets);
            res.status(CONSTANTS.HTTP_STATUS.CREATED).json(application);
        } catch (error: any) {
            console.error('[ApplicationController.startApplication]', error);
            if (error.message === CONSTANTS.ERROR_MESSAGES.RESOURCE_NOT_FOUND) {
                res.status(CONSTANTS.HTTP_STATUS.NOT_FOUND).json({ error: error.message });
                return;
            }
            res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }

    // Maps to STK-APP-APPLY-005, DM-001
    public async advanceApplication(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id as string, 10);
            const { shouldNotify } = req.body;
            const app = await applicationService.advanceApplicationStage(id, shouldNotify !== false);
            res.status(CONSTANTS.HTTP_STATUS.OK).json(app);
        } catch (error: any) {
            console.error('[ApplicationController.advanceApplication]', error);
            if (error.message === CONSTANTS.ERROR_MESSAGES.RESOURCE_NOT_FOUND) {
                res.status(CONSTANTS.HTTP_STATUS.NOT_FOUND).json({ error: error.message });
                return;
            }
            res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }

    // Maps to STK-APP-APPLIST-001
    public async getUserApplications(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).user.id;
            const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
            const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : 0;
            const applications = await applicationService.getUserApplications(userId, limit, offset);
            res.status(CONSTANTS.HTTP_STATUS.OK).json(applications);
        } catch (error) {
            console.error('[ApplicationController.getUserApplications]', error);
            res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }

    // Maps to STK-APP-APPLY-002
    public async getApplicationDetails(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id as string, 10);
            const app = await applicationService.getApplicationDetails(id);
            res.status(CONSTANTS.HTTP_STATUS.OK).json(app);
        } catch (error: any) {
            console.error('[ApplicationController.getApplicationDetails]', error);
            if (error.message === CONSTANTS.ERROR_MESSAGES.RESOURCE_NOT_FOUND) {
                res.status(CONSTANTS.HTTP_STATUS.NOT_FOUND).json({ error: error.message });
                return;
            }
            res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }

    // Maps to STK-APP-DASH-001..003 — applicant dashboard aggregation
    public async getDashboardSummary(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).user.id;
            const summary = await applicationService.getDashboardSummary(userId);
            res.status(CONSTANTS.HTTP_STATUS.OK).json(summary);
        } catch (error) {
            console.error('[ApplicationController.getDashboardSummary]', error);
            res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }

    // Maps to STK-ADM-APP-001 — admin: new/completed applications
    public async getAdminApplications(req: Request, res: Response): Promise<void> {
        try {
            const status = req.query.status as string;
            const userId = req.query.userId ? parseInt(req.query.userId as string, 10) : undefined;
            const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
            const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : 0;
            const applications = await applicationService.getApplicationsByStatus(status, limit, offset, userId);
            res.status(CONSTANTS.HTTP_STATUS.OK).json(applications);
        } catch (error) {
            console.error('[ApplicationController.getAdminApplications]', error);
            res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }

    // Maps to STK-ADM-APP-002 — admin: draft applications view
    public async getDraftApplications(req: Request, res: Response): Promise<void> {
        try {
            const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
            const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : 0;
            const drafts = await applicationService.getDraftApplications(limit, offset);
            res.status(CONSTANTS.HTTP_STATUS.OK).json(drafts);
        } catch (error) {
            console.error('[ApplicationController.getDraftApplications]', error);
            res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }

    // Admin: inject ad-hoc stage into application pipeline
    public async addStage(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id as string, 10);
            const stage = await applicationService.addStageToApplication(id, req.body);
            res.status(CONSTANTS.HTTP_STATUS.CREATED).json(stage);
        } catch (error: any) {
            console.error('[ApplicationController.addStage]', error);
            if (error.message === CONSTANTS.ERROR_MESSAGES.RESOURCE_NOT_FOUND) {
                res.status(CONSTANTS.HTTP_STATUS.NOT_FOUND).json({ error: error.message });
                return;
            }
            res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }

    public async getStageDetails(req: Request, res: Response): Promise<void> {
        try {
            const stageId = parseInt(req.params.stageId as string, 10);
            const stage = await applicationService.getApplicationStage(stageId);
            res.status(CONSTANTS.HTTP_STATUS.OK).json(stage);
        } catch (error: any) {
            console.error('[ApplicationController.getStageDetails]', error);
            if (error.message === CONSTANTS.ERROR_MESSAGES.RESOURCE_NOT_FOUND) {
                res.status(CONSTANTS.HTTP_STATUS.NOT_FOUND).json({ error: error.message });
                return;
            }
            res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }

    public async updateStage(req: Request, res: Response): Promise<void> {
        try {
            const stageId = parseInt(req.params.stageId as string, 10);
            const stage = await applicationService.updateApplicationStage(stageId, req.body);
            res.status(CONSTANTS.HTTP_STATUS.OK).json(stage);
        } catch (error: any) {
            console.error('[ApplicationController.updateStage]', error);
            if (error.message === CONSTANTS.ERROR_MESSAGES.RESOURCE_NOT_FOUND) {
                res.status(CONSTANTS.HTTP_STATUS.NOT_FOUND).json({ error: error.message });
                return;
            }
            res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }

    public async deleteStage(req: Request, res: Response): Promise<void> {
        try {
            const stageId = parseInt(req.params.stageId as string, 10);
            await applicationService.deleteApplicationStage(stageId);
            res.status(CONSTANTS.HTTP_STATUS.OK).json({ message: CONSTANTS.SUCCESS_MESSAGES.DELETED });
        } catch (error: any) {
            console.error('[ApplicationController.deleteStage]', error);
            res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }

    public async completeApplication(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id as string, 10);
            const app = await applicationService.completeApplication(id);
            res.status(CONSTANTS.HTTP_STATUS.OK).json(app);
        } catch (error: any) {
            console.error('[ApplicationController.completeApplication]', error);
            if (error.message === CONSTANTS.ERROR_MESSAGES.RESOURCE_NOT_FOUND) {
                res.status(CONSTANTS.HTTP_STATUS.NOT_FOUND).json({ error: error.message });
                return;
            }
            res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }

    public async completeApplicationStage(req: Request, res: Response): Promise<void> {
        try {
            const stageId = parseInt(req.params.stageId as string, 10);
            const stage = await applicationService.completeApplicationStage(stageId);
            res.status(CONSTANTS.HTTP_STATUS.OK).json(stage);
        } catch (error: any) {
            console.error('[ApplicationController.completeApplicationStage]', error);
            if (error.message === CONSTANTS.ERROR_MESSAGES.RESOURCE_NOT_FOUND) {
                res.status(CONSTANTS.HTTP_STATUS.NOT_FOUND).json({ error: error.message });
                return;
            }
            res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }

    public async deleteApplication(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id as string, 10);
            await applicationService.deleteApplication(id);
            res.status(CONSTANTS.HTTP_STATUS.OK).json({ message: CONSTANTS.SUCCESS_MESSAGES.DELETED });
        } catch (error) {
            console.error('[ApplicationController.deleteApplication]', error);
            res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }

    public async applyVisaSponsorship(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id as string, 10);
            const app = await applicationService.applyVisaSponsorship(id);
            res.status(CONSTANTS.HTTP_STATUS.OK).json(app);
        } catch (error: any) {
            console.error('[ApplicationController.applyVisaSponsorship]', error);
            if (error.message === CONSTANTS.ERROR_MESSAGES.RESOURCE_NOT_FOUND) {
                res.status(CONSTANTS.HTTP_STATUS.NOT_FOUND).json({ error: error.message });
                return;
            }
            res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }

    public async updateVisaSponsorshipStatus(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id as string, 10);
            const { status } = req.body;
            const app = await applicationService.updateVisaSponsorshipStatus(id, status);
            res.status(CONSTANTS.HTTP_STATUS.OK).json(app);
        } catch (error: any) {
            console.error('[ApplicationController.updateVisaSponsorshipStatus]', error);
            if (error.message === CONSTANTS.ERROR_MESSAGES.RESOURCE_NOT_FOUND) {
                res.status(CONSTANTS.HTTP_STATUS.NOT_FOUND).json({ error: error.message });
                return;
            }
            res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }

    public async createNominations(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id as string, 10);
            const { nominations } = req.body;
            const created = await applicationService.createNominations(id, nominations);
            res.status(CONSTANTS.HTTP_STATUS.CREATED).json(created);
        } catch (error: any) {
            console.error('[ApplicationController.createNominations]', error);
            res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }

    public async getNominations(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id as string, 10);
            const nominations = await applicationService.getNominations(id);
            res.status(CONSTANTS.HTTP_STATUS.OK).json(nominations);
        } catch (error: any) {
            console.error('[ApplicationController.getNominations]', error);
            res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }

    public async selectNomination(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id as string, 10);
            const nominationId = parseInt(req.params.nominationId as string, 10);
            const nominations = await applicationService.selectNomination(id, nominationId);
            res.status(CONSTANTS.HTTP_STATUS.OK).json(nominations);
        } catch (error: any) {
            console.error('[ApplicationController.selectNomination]', error);
            res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }

    public async uploadNominationDocument(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).user.id;
            const { documentUrl, documentType, applicationId } = req.body;

            if (!documentUrl || !applicationId) {
                res.status(400).json({ error: 'documentUrl and applicationId are required' });
                return;
            }

            await applicationService.saveNominationDocument(applicationId, documentUrl);

            const { sendInfoEmail } = require('../utils/email');
            
            // Send the document to the admin
            const adminEmail = process.env.ADMIN_EMAIL || 'support@fifo.com';
            const subject = `New Signed Nomination Form Uploaded (User ID: ${userId})`;
            const content = `
                <p>Hello Admin,</p>
                <p>A candidate has uploaded their signed nomination form.</p>
                <ul>
                    <li><strong>Candidate User ID:</strong> ${userId}</li>
                    <li><strong>Application ID:</strong> ${applicationId}</li>
                    <li><strong>Document Type:</strong> ${documentType || 'Nomination Form'}</li>
                    <li><strong>Document URL:</strong> <a href="${documentUrl}">View Document</a></li>
                </ul>
            `;

            await sendInfoEmail(adminEmail, subject, content);

            res.status(200).json({ message: 'Document uploaded successfully and sent to admin.' });
        } catch (error: any) {
            console.error('[ApplicationController.uploadNominationDocument]', error);
            res.status(500).json({ error: 'Failed to upload document' });
        }
    }

    public async getContracts(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id as string, 10);
            const contracts = await applicationService.getContracts(id);
            res.status(CONSTANTS.HTTP_STATUS.OK).json(contracts);
        } catch (error: any) {
            console.error('[ApplicationController.getContracts]', error);
            res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }

    public async createContract(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id as string, 10);
            const { company, role } = req.body;
            const contract = await applicationService.createContract(id, company, role);
            res.status(CONSTANTS.HTTP_STATUS.CREATED).json(contract);
        } catch (error: any) {
            console.error('[ApplicationController.createContract]', error);
            res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }

    public async acceptContract(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id as string, 10);
            const contractId = parseInt(req.params.contractId as string, 10);
            const contract = await applicationService.updateContractStatus(id, contractId, 'accepted');
            res.status(CONSTANTS.HTTP_STATUS.OK).json(contract);
        } catch (error: any) {
            console.error('[ApplicationController.acceptContract]', error);
            res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }

    public async rejectContract(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id as string, 10);
            const contractId = parseInt(req.params.contractId as string, 10);
            const contract = await applicationService.updateContractStatus(id, contractId, 'rejected');
            res.status(CONSTANTS.HTTP_STATUS.OK).json(contract);
        } catch (error: any) {
            console.error('[ApplicationController.rejectContract]', error);
            res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }

    public async uploadContractDocument(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).user.id;
            const { documentUrl, documentType, applicationId, contractId } = req.body;

            if (!documentUrl || !applicationId || !contractId) {
                res.status(400).json({ error: 'documentUrl, applicationId, and contractId are required' });
                return;
            }

            await applicationService.saveContractDocument(applicationId, contractId, documentUrl);

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
        } catch (error: any) {
            console.error('[ApplicationController.uploadContractDocument]', error);
            res.status(500).json({ error: 'Failed to upload document' });
        }
    }
}

export const applicationController = new ApplicationController();
