import { jobRepository, FindJobsOptions } from '../repositories/JobRepository';
import { jobStageRepository } from '../repositories/JobStageRepository';
import { CONSTANTS } from '../constants';
import { sequelize } from '../config/database';
import { JobListing, Application, JobCategory } from '../models';

export class JobService {
    // Maps to STK-APP-DASH-001
    public async getActiveJobs(limit?: number, offset?: number, categoryId?: number, employmentType?: string, searchQuery?: string, sortBy?: string, sortOrder?: 'ASC' | 'DESC') {
        return jobRepository.findAllActive({ limit, offset, categoryId, employmentType, searchQuery, sortBy, sortOrder });
    }

    // Maps to STK-ADM-JOB-004
    public async getAllJobsAdmin(options: FindJobsOptions = {}) {
        return jobRepository.findAllAdmin(options);
    }

    public async getJobStats() {
        const totalListing = await JobListing.count();
        const activeRoles = await JobListing.count({ where: { isActive: true } });
        const inReview = await JobListing.count({ where: { isActive: false } });
        const appVolume = await Application.count();
        const categoryCount = await JobCategory.count();

        return {
            totalListing,
            activeRoles,
            inReview,
            appVolume,
            categoryCount
        };
    }

    // Maps to STK-APP-APPLY-001
    public async getJobDetails(id: number) {
        const { Employer, JoblistingEmployer } = require('../models');
        const job = await JobListing.findByPk(id, {
            include: [
                {
                    model: JoblistingEmployer,
                    as: 'JoblistingEmployers',
                    include: [{ model: Employer, as: 'Employer' }]
                }
            ]
        });
        if (!job) throw new Error(CONSTANTS.ERROR_MESSAGES.RESOURCE_NOT_FOUND);
        const jobJson = job.toJSON();
        const fullJob = await jobRepository.findById(id);
        if (fullJob && (fullJob as any).RequiredTickets && (fullJob as any).RequiredTickets.length > 0) {
            jobJson.ticketIds = (fullJob as any).RequiredTickets.map((t: any) => t.id);
            jobJson.RequiredTickets = (fullJob as any).RequiredTickets;
        } else if (job.ticketIds && Array.isArray(job.ticketIds) && job.ticketIds.length > 0) {
            const { TicketCatalog } = require('../models');
            const { Op } = require('sequelize');
            const catalogs = await TicketCatalog.findAll({
                where: { id: { [Op.in]: job.ticketIds } }
            });
            jobJson.RequiredTickets = catalogs;
        } else {
            jobJson.RequiredTickets = [];
        }
        return jobJson;
    }

    public async createJob(jobData: any) {
        const { JoblistingEmployer, Employer } = require('../models');
        const t = await sequelize.transaction();
        try {
            const employersList: Array<{ employerId: number, vacancyUrl?: string }> = jobData.employers || [];
            
            // Validate: at least one employer must be selected
            if (employersList.length === 0) {
                // Check if any employer exists in DB to auto-associate if none passed
                const defaultEmployer = await Employer.findOne({ where: { isEmploying: true }, transaction: t }) || await Employer.findOne({ transaction: t });
                if (defaultEmployer) {
                    employersList.push({ employerId: defaultEmployer.id, vacancyUrl: jobData.vacancyUrl || null });
                }
            }

            const job = await jobRepository.create(jobData, t);
            if (jobData.ticketIds && Array.isArray(jobData.ticketIds)) {
                await (job as any).setRequiredTickets(jobData.ticketIds, { transaction: t });
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
        } catch (e) {
            await t.rollback();
            throw e;
        }
    }

    public async updateJob(id: number, data: any) {
        const { JoblistingEmployer } = require('../models');
        const t = await sequelize.transaction();
        try {
            let job = await jobRepository.findById(id, t);
            if (!job) throw new Error(CONSTANTS.ERROR_MESSAGES.RESOURCE_NOT_FOUND);
            
            await jobRepository.update(id, data, t);

            if (data.ticketIds && Array.isArray(data.ticketIds)) {
                await (job as any).setRequiredTickets(data.ticketIds, { transaction: t });
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
        } catch (e) {
            await t.rollback();
            throw e;
        }
    }

    public async deleteJob(id: number) {
        const { JoblistingEmployer } = require('../models');
        await JoblistingEmployer.destroy({ where: { joblistingId: id } });
        await jobRepository.delete(id);
    }

    // ==========================
    // Stage Configuration Sub-logic
    // ==========================

}

export const jobService = new JobService();
