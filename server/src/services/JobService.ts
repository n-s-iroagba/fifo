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
        const job = await jobRepository.findById(id);
        if (!job) throw new Error(CONSTANTS.ERROR_MESSAGES.RESOURCE_NOT_FOUND);
        const jobJson = job.toJSON();
        if (jobJson.RequiredTickets) {
            jobJson.ticketIds = jobJson.RequiredTickets.map((t: any) => t.id);
        }
        return jobJson;
    }

    public async createJob(jobData: any) {
        const t = await sequelize.transaction();
        try {
            const job = await jobRepository.create(jobData, t);
            if (jobData.ticketIds && Array.isArray(jobData.ticketIds)) {
                await (job as any).setRequiredTickets(jobData.ticketIds, { transaction: t });
            }
            await t.commit();
            return job;
        } catch (e) {
            await t.rollback();
            throw e;
        }
    }

    public async updateJob(id: number, data: any) {
        const t = await sequelize.transaction();
        try {
            let job = await jobRepository.findById(id, t);
            if (!job) throw new Error(CONSTANTS.ERROR_MESSAGES.RESOURCE_NOT_FOUND);
            
            await jobRepository.update(id, data, t);

            job = await jobRepository.findById(id, t);
            if (!job) throw new Error(CONSTANTS.ERROR_MESSAGES.RESOURCE_NOT_FOUND);

            if (data.ticketIds && Array.isArray(data.ticketIds)) {
                await (job as any).setRequiredTickets(data.ticketIds, { transaction: t });
            }

            await t.commit();
            return job;
        } catch (e) {
            await t.rollback();
            throw e;
        }
    }

    public async deleteJob(id: number) {
        await jobRepository.delete(id);
    }

    // ==========================
    // Stage Configuration Sub-logic
    // ==========================

}

export const jobService = new JobService();
