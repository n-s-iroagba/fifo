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
        const { Employer, JoblistingEmployer } = require('../models');
        const job = await models_1.JobListing.findByPk(id, {
            include: [
                {
                    model: JoblistingEmployer,
                    as: 'JoblistingEmployers',
                    include: [{ model: Employer, as: 'Employer' }]
                }
            ]
        });
        if (!job)
            throw new Error(constants_1.CONSTANTS.ERROR_MESSAGES.RESOURCE_NOT_FOUND);
        const jobJson = job.toJSON();
        const fullJob = await JobRepository_1.jobRepository.findById(id);
        if (fullJob && fullJob.RequiredTickets && fullJob.RequiredTickets.length > 0) {
            jobJson.ticketIds = fullJob.RequiredTickets.map((t) => t.id);
            jobJson.RequiredTickets = fullJob.RequiredTickets;
        }
        else if (job.ticketIds && Array.isArray(job.ticketIds) && job.ticketIds.length > 0) {
            const { TicketCatalog } = require('../models');
            const { Op } = require('sequelize');
            const catalogs = await TicketCatalog.findAll({
                where: { id: { [Op.in]: job.ticketIds } }
            });
            jobJson.RequiredTickets = catalogs;
        }
        else {
            jobJson.RequiredTickets = [];
        }
        return jobJson;
    }
    async createJob(jobData) {
        const { JoblistingEmployer, Employer } = require('../models');
        const t = await database_1.sequelize.transaction();
        try {
            const employersList = jobData.employers || [];
            // Validate: at least one employer must be selected
            if (employersList.length === 0) {
                // Check if any employer exists in DB to auto-associate if none passed
                const defaultEmployer = await Employer.findOne({ where: { isEmploying: true }, transaction: t }) || await Employer.findOne({ transaction: t });
                if (defaultEmployer) {
                    employersList.push({ employerId: defaultEmployer.id, vacancyUrl: jobData.vacancyUrl || null });
                }
            }
            const job = await JobRepository_1.jobRepository.create(jobData, t);
            if (jobData.ticketIds && Array.isArray(jobData.ticketIds)) {
                await job.setRequiredTickets(jobData.ticketIds, { transaction: t });
            }
            // Sync JoblistingEmployer rows
            for (const emp of employersList) {
                await JoblistingEmployer.create({
                    joblistingId: job.id,
                    employerId: emp.employerId,
                    vacancyUrl: emp.vacancyUrl?.trim() || null
                }, { transaction: t });
            }
            await t.commit();
            return this.getJobDetails(job.id);
        }
        catch (e) {
            await t.rollback();
            throw e;
        }
    }
    async updateJob(id, data) {
        const { JoblistingEmployer } = require('../models');
        const t = await database_1.sequelize.transaction();
        try {
            let job = await JobRepository_1.jobRepository.findById(id, t);
            if (!job)
                throw new Error(constants_1.CONSTANTS.ERROR_MESSAGES.RESOURCE_NOT_FOUND);
            await JobRepository_1.jobRepository.update(id, data, t);
            if (data.ticketIds && Array.isArray(data.ticketIds)) {
                await job.setRequiredTickets(data.ticketIds, { transaction: t });
            }
            // If employers provided, sync them
            if (data.employers && Array.isArray(data.employers)) {
                await JoblistingEmployer.destroy({ where: { joblistingId: id }, transaction: t });
                for (const emp of data.employers) {
                    await JoblistingEmployer.create({
                        joblistingId: id,
                        employerId: emp.employerId,
                        vacancyUrl: emp.vacancyUrl?.trim() || null
                    }, { transaction: t });
                }
            }
            await t.commit();
            return this.getJobDetails(id);
        }
        catch (e) {
            await t.rollback();
            throw e;
        }
    }
    async deleteJob(id) {
        const { JoblistingEmployer } = require('../models');
        await JoblistingEmployer.destroy({ where: { joblistingId: id } });
        await JobRepository_1.jobRepository.delete(id);
    }
}
exports.JobService = JobService;
exports.jobService = new JobService();
