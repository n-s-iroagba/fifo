import { Request, Response } from 'express';
import { jobService } from '../services/JobService';
import { CONSTANTS } from '../constants';

export class JobController {
    // Maps to STK-APP-DASH-001
    public async getActiveJobs(req: Request, res: Response): Promise<void> {
        try {
            const categoryId = req.query.categoryId ? parseInt(req.query.categoryId as string, 10) : undefined;
            const employmentType = req.query.employmentType as string;
            const searchQuery = (req.query.search || req.query.searchQuery) as string;
            const sortBy = req.query.sortBy as string;
            const sortOrder = req.query.sortOrder as 'ASC' | 'DESC';
            const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
            const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : 0;

            const result = await jobService.getActiveJobs(limit, offset, categoryId, employmentType, searchQuery, sortBy, sortOrder);
            res.status(CONSTANTS.HTTP_STATUS.OK).json(result);
        } catch (error) {
            console.error('[JobController.getActiveJobs]', error);
            res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }

    // Maps to STK-APP-APPLY-001
    public async getJobDetails(req: Request, res: Response): Promise<void> {
        try {
            const jobId = parseInt(req.params.id as string, 10);
            const job = await jobService.getJobDetails(jobId);
            res.status(CONSTANTS.HTTP_STATUS.OK).json(job);
        } catch (error: any) {
            console.error('[JobController.getJobDetails]', error);
            if (error.message === CONSTANTS.ERROR_MESSAGES.RESOURCE_NOT_FOUND) {
                res.status(CONSTANTS.HTTP_STATUS.NOT_FOUND).json({ error: error.message });
                return;
            }
            res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }

    // Maps to STK-ADM-JOB-004
    public async getAllJobsAdmin(req: Request, res: Response): Promise<void> {
        try {
            const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
            const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : 0;
            const categoryId = req.query.categoryId ? parseInt(req.query.categoryId as string, 10) : undefined;
            const searchQuery = (req.query.search || req.query.searchQuery) as string;
            const sortBy = req.query.sortBy as string;
            const sortOrder = req.query.sortOrder as 'ASC' | 'DESC';

            const result = await jobService.getAllJobsAdmin({ limit, offset, categoryId, searchQuery, sortBy, sortOrder });
            res.status(CONSTANTS.HTTP_STATUS.OK).json(result);
        } catch (error) {
            console.error('[JobController.getAllJobsAdmin]', error);
            res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }

    public async getJobStats(req: Request, res: Response): Promise<void> {
        try {
            const stats = await jobService.getJobStats();
            res.status(CONSTANTS.HTTP_STATUS.OK).json(stats);
        } catch (error) {
            console.error('[JobController.getJobStats]', error);
            res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }

    // Maps to STK-ADM-JOB-001, STK-ADM-JOB-003
    public async createJob(req: Request, res: Response): Promise<void> {
        try {
            const { benefitsIds, conditionsIds, ...jobData } = req.body;
            const job = await jobService.createJob(jobData, benefitsIds || [], conditionsIds || []);
            res.status(CONSTANTS.HTTP_STATUS.CREATED).json(job);
        } catch (error) {
            console.error('[JobController.createJob]', error);
            res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }

    // Maps to STK-ADM-JOB-005
    public async updateJob(req: Request, res: Response): Promise<void> {
        try {
            const jobId = parseInt(req.params.id as string, 10);
            const { benefitsIds, conditionsIds, ...jobData } = req.body;
            const job = await jobService.updateJob(jobId, jobData, benefitsIds, conditionsIds);
            res.status(CONSTANTS.HTTP_STATUS.OK).json(job);
        } catch (error: any) {
            console.error('[JobController.updateJob]', error);
            if (error.message === CONSTANTS.ERROR_MESSAGES.RESOURCE_NOT_FOUND) {
                res.status(CONSTANTS.HTTP_STATUS.NOT_FOUND).json({ error: error.message });
                return;
            }
            res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }

    // Maps to STK-ADM-JOB-001
    public async deleteJob(req: Request, res: Response): Promise<void> {
        try {
            const jobId = parseInt(req.params.id as string, 10);
            await jobService.deleteJob(jobId);
            res.status(CONSTANTS.HTTP_STATUS.OK).json({ message: CONSTANTS.SUCCESS_MESSAGES.DELETED });
        } catch (error) {
            console.error('[JobController.deleteJob]', error);
            res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }

}

export const jobController = new JobController();
