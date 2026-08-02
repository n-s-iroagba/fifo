"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jobController = exports.JobController = void 0;
const JobService_1 = require("../services/JobService");
const constants_1 = require("../constants");
class JobController {
    // Maps to STK-APP-DASH-001
    async getActiveJobs(req, res) {
        try {
            const categoryId = req.query.categoryId ? parseInt(req.query.categoryId, 10) : undefined;
            const employmentType = req.query.employmentType;
            const searchQuery = (req.query.search || req.query.searchQuery);
            const sortBy = req.query.sortBy;
            const sortOrder = req.query.sortOrder;
            const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
            const offset = req.query.offset ? parseInt(req.query.offset, 10) : 0;
            const result = await JobService_1.jobService.getActiveJobs(limit, offset, categoryId, employmentType, searchQuery, sortBy, sortOrder);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json(result);
        }
        catch (error) {
            console.error('[JobController.getActiveJobs]', error);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: constants_1.CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }
    // Maps to STK-APP-APPLY-001
    async getJobDetails(req, res) {
        try {
            const jobId = parseInt(req.params.id, 10);
            const job = await JobService_1.jobService.getJobDetails(jobId);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json(job);
        }
        catch (error) {
            console.error('[JobController.getJobDetails]', error);
            if (error.message === constants_1.CONSTANTS.ERROR_MESSAGES.RESOURCE_NOT_FOUND) {
                res.status(constants_1.CONSTANTS.HTTP_STATUS.NOT_FOUND).json({ error: error.message });
                return;
            }
            res.status(constants_1.CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: constants_1.CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }
    // Maps to STK-ADM-JOB-004
    async getAllJobsAdmin(req, res) {
        try {
            const limit = req.query.limit ? parseInt(req.query.limit, 10) : 20;
            const offset = req.query.offset ? parseInt(req.query.offset, 10) : 0;
            const categoryId = req.query.categoryId ? parseInt(req.query.categoryId, 10) : undefined;
            const searchQuery = (req.query.search || req.query.searchQuery);
            const sortBy = req.query.sortBy;
            const sortOrder = req.query.sortOrder;
            const result = await JobService_1.jobService.getAllJobsAdmin({ limit, offset, categoryId, searchQuery, sortBy, sortOrder });
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json(result);
        }
        catch (error) {
            console.error('[JobController.getAllJobsAdmin]', error);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: constants_1.CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }
    async getJobStats(req, res) {
        try {
            const stats = await JobService_1.jobService.getJobStats();
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json(stats);
        }
        catch (error) {
            console.error('[JobController.getJobStats]', error);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: constants_1.CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }
    // Maps to STK-ADM-JOB-001, STK-ADM-JOB-003
    async createJob(req, res) {
        try {
            const { benefitsIds, conditionsIds, ...jobData } = req.body;
            const job = await JobService_1.jobService.createJob(jobData, benefitsIds || [], conditionsIds || []);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.CREATED).json(job);
        }
        catch (error) {
            console.error('[JobController.createJob]', error);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: constants_1.CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }
    // Maps to STK-ADM-JOB-005
    async updateJob(req, res) {
        try {
            const jobId = parseInt(req.params.id, 10);
            const { benefitsIds, conditionsIds, ...jobData } = req.body;
            const job = await JobService_1.jobService.updateJob(jobId, jobData, benefitsIds, conditionsIds);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json(job);
        }
        catch (error) {
            console.error('[JobController.updateJob]', error);
            if (error.message === constants_1.CONSTANTS.ERROR_MESSAGES.RESOURCE_NOT_FOUND) {
                res.status(constants_1.CONSTANTS.HTTP_STATUS.NOT_FOUND).json({ error: error.message });
                return;
            }
            res.status(constants_1.CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: constants_1.CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }
    // Maps to STK-ADM-JOB-001
    async deleteJob(req, res) {
        try {
            const jobId = parseInt(req.params.id, 10);
            await JobService_1.jobService.deleteJob(jobId);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json({ message: constants_1.CONSTANTS.SUCCESS_MESSAGES.DELETED });
        }
        catch (error) {
            console.error('[JobController.deleteJob]', error);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: constants_1.CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }
}
exports.JobController = JobController;
exports.jobController = new JobController();
