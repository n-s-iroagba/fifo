"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jobService = exports.JobService = void 0;
const JobRepository_1 = require("../repositories/JobRepository");
const constants_1 = require("../constants");
const database_1 = require("../config/database");
const models_1 = require("../models");
class JobService {
    // Maps to STK-APP-DASH-001
    async getActiveJobs(limit, offset, categoryId, employmentType, searchQuery, sortBy, sortOrder) {
        return JobRepository_1.jobRepository.findAllActive({ limit, offset, categoryId, employmentType, searchQuery, sortBy, sortOrder });
    }
    // Maps to STK-ADM-JOB-004
    async getAllJobsAdmin(options = {}) {
        return JobRepository_1.jobRepository.findAllAdmin(options);
    }
    async getJobStats() {
        const totalListing = await models_1.JobListing.count();
        const activeRoles = await models_1.JobListing.count({ where: { isActive: true } });
        const inReview = await models_1.JobListing.count({ where: { isActive: false } });
        const appVolume = await models_1.Application.count();
        const categoryCount = await models_1.JobCategory.count();
        return {
            totalListing,
            activeRoles,
            inReview,
            appVolume,
            categoryCount
        };
    }
    // Maps to STK-APP-APPLY-001
    async getJobDetails(id) {
        const job = await JobRepository_1.jobRepository.findById(id);
        if (!job)
            throw new Error(constants_1.CONSTANTS.ERROR_MESSAGES.RESOURCE_NOT_FOUND);
        return job;
    }
    // Maps to STK-ADM-JOB-001, STK-ADM-JOB-003
    async createJob(jobData, benefitsIds, conditionsIds) {
        const t = await database_1.sequelize.transaction();
        try {
            const job = await JobRepository_1.jobRepository.create(jobData, t);
            if (benefitsIds && benefitsIds.length > 0)
                await job.setJobBenefits(benefitsIds, { transaction: t });
            if (conditionsIds && conditionsIds.length > 0)
                await job.setJobConditions(conditionsIds, { transaction: t });
            await t.commit();
            return job;
        }
        catch (e) {
            await t.rollback();
            throw e;
        }
    }
    // Maps to STK-ADM-JOB-005
    async updateJob(id, data, benefitsIds, conditionsIds) {
        const t = await database_1.sequelize.transaction();
        try {
            let job = await JobRepository_1.jobRepository.findById(id, t);
            if (!job)
                throw new Error(constants_1.CONSTANTS.ERROR_MESSAGES.RESOURCE_NOT_FOUND);
            await JobRepository_1.jobRepository.update(id, data, t);
            job = await JobRepository_1.jobRepository.findById(id, t);
            if (!job)
                throw new Error(constants_1.CONSTANTS.ERROR_MESSAGES.RESOURCE_NOT_FOUND);
            if (benefitsIds)
                await job.setJobBenefits(benefitsIds, { transaction: t });
            if (conditionsIds)
                await job.setJobConditions(conditionsIds, { transaction: t });
            await t.commit();
            return job;
        }
        catch (e) {
            await t.rollback();
            throw e;
        }
    }
    async deleteJob(id) {
        await JobRepository_1.jobRepository.delete(id);
    }
}
exports.JobService = JobService;
exports.jobService = new JobService();
