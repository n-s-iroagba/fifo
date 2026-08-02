import { Transaction, Op } from 'sequelize';
import { JobListing, JobCategory, JobBenefit, JobCondition, JobStage } from '../models';

export interface FindJobsOptions {
    limit?: number;
    offset?: number;
    categoryId?: number;
    employmentType?: string;
    searchQuery?: string;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
}

export class JobRepository {
    // Maps to STK-APP-DASH-001, STK-ADM-JOB-004
    public async findAllActive(options: FindJobsOptions = {}): Promise<{ rows: JobListing[]; count: number }> {
        const whereClause: any = { isActive: true };

        if (options.categoryId) whereClause.categoryId = options.categoryId;
        if (options.employmentType) whereClause.employmentType = options.employmentType;
        if (options.searchQuery) {
            const searchPattern = `%${options.searchQuery}%`;
            whereClause[Op.or] = [
                { title: { [Op.like]: searchPattern } },
                { location: { [Op.like]: searchPattern } },
                { company: { [Op.like]: searchPattern } },
                { description: { [Op.like]: searchPattern } },
                { '$JobCategory.name$': { [Op.like]: searchPattern } }
            ];
        }

        const order: any[] = [];
        if (options.sortBy) {
            order.push([options.sortBy, options.sortOrder || 'DESC']);
        } else {
            order.push(['createdAt', 'DESC']);
        }

        // Step 1: Find matching job IDs with pagination and only JobCategory included (which is 1:1, so subQuery: false is safe)
        const jobIdsResult = await JobListing.findAndCountAll({
            attributes: ['id'],
            where: whereClause,
            limit: options.limit || 10,
            offset: options.offset || 0,
            include: [JobCategory],
            order,
            subQuery: false
        });

        const jobIds = jobIdsResult.rows.map(job => job.id);

        // Step 2: Fetch the full details with all associations for the retrieved IDs
        const rows = jobIds.length > 0 ? await JobListing.findAll({
            where: { id: jobIds },
            include: [JobCategory, JobBenefit, JobCondition],
            order
        }) : [];

        return {
            rows,
            count: jobIdsResult.count
        };
    }

    // Maps to STK-ADM-JOB-001, NFR-PERF-004
    public async findAllAdmin(options: FindJobsOptions = {}): Promise<{ rows: JobListing[]; count: number }> {
        const whereClause: any = {};

        if (options.categoryId) whereClause.categoryId = options.categoryId;
        if (options.employmentType) whereClause.employmentType = options.employmentType;
        if (options.searchQuery) {
            const searchPattern = `%${options.searchQuery}%`;
            whereClause[Op.or] = [
                { title: { [Op.like]: searchPattern } },
                { location: { [Op.like]: searchPattern } },
                { company: { [Op.like]: searchPattern } },
                { description: { [Op.like]: searchPattern } },
                { '$JobCategory.name$': { [Op.like]: searchPattern } }
            ];
        }

        const order: any[] = [];
        if (options.sortBy) {
            order.push([options.sortBy, options.sortOrder || 'DESC']);
        } else {
            order.push(['createdAt', 'DESC']);
        }

        return JobListing.findAndCountAll({
            where: whereClause,
            limit: options.limit || 20,
            offset: options.offset || 0,
            include: [JobCategory],
            order,
            subQuery: false
        });
    }

    // Maps to STK-APP-APPLY-001, STK-APP-PAY-001
    public async findById(id: number, transaction?: Transaction): Promise<JobListing | null> {
        return JobListing.findByPk(id, {
            include: [JobCategory, JobBenefit, JobCondition],
            transaction
        });
    }

    // Maps to STK-ADM-JOB-001, STK-ADM-JOB-003, NFR-SEC-009
    public async create(jobData: any, transaction?: Transaction): Promise<JobListing> {
        return JobListing.create(jobData, { transaction });
    }

    // Maps to STK-ADM-JOB-001, STK-ADM-JOB-005
    public async update(id: number, updateData: any, transaction?: Transaction): Promise<[number]> {
        const [updatedCount] = await JobListing.update(updateData, { where: { id }, transaction });
        return [updatedCount]; // Handled by Service layer fetching the record
    }

    // Maps to STK-ADM-JOB-001
    public async delete(id: number, transaction?: Transaction): Promise<void> {
        await JobListing.destroy({ where: { id }, transaction });
    }
}

export const jobRepository = new JobRepository();
