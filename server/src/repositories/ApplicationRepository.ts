import { Transaction } from 'sequelize';
import { Application, JobListing, Payment, JobStage, User, Ticket } from '../models';

export interface FindApplicationOptions {
    limit?: number;
    offset?: number;
    status?: string;
    userId?: number;
}

export class ApplicationRepository {
    // Maps to STK-APP-APPLIST-001, SCR-APP-APPLIST-001
    public async findByUserId(userId: number, options: FindApplicationOptions = {}, transaction?: Transaction): Promise<{ rows: Application[]; count: number }> {
        const result = await Application.findAndCountAll({
            where: { userId },
            limit: options.limit || 10,
            offset: options.offset || 0,
            include: [
                { model: JobListing },
                { model: JobStage, as: 'JobStages' }
            ],
            order: [['updatedAt', 'DESC']],
            transaction
        });

        for (const app of result.rows) {
            if (!app.JobListing && app.jobId) {
                const job = await JobListing.findByPk(app.jobId, { transaction });
                if (job) {
                    (app as any).setDataValue('JobListing', job.toJSON());
                }
            }
        }

        return result;
    }

    // Maps to STK-ADM-APP-001, SCR-ADM-NEWAPPS-001
    public async findAllAdmin(options: FindApplicationOptions = {}, transaction?: Transaction): Promise<{ rows: Application[]; count: number }> {
        const whereClause: any = {};
        if (options.status) whereClause.status = options.status;
        if (options.userId) whereClause.userId = options.userId;

        const result = await Application.findAndCountAll({
            where: whereClause,
            limit: options.limit || 20,
            offset: options.offset || 0,
            include: [
                { model: User, attributes: ['id', 'fullName', 'email'] },
                { model: JobListing },
                { model: JobStage, as: 'JobStages' },
                { model: Payment, include: [{ model: JobStage, attributes: ['name'] }] }
            ],
            order: [['createdAt', 'DESC']],
            transaction
        });

        for (const app of result.rows) {
            if (!app.JobListing && app.jobId) {
                const job = await JobListing.findByPk(app.jobId, { transaction });
                if (job) {
                    (app as any).setDataValue('JobListing', job.toJSON());
                } else {
                    (app as any).setDataValue('JobListing', {
                        id: app.jobId,
                        title: 'General FIFO Application',
                        company: 'BlueCollar Recruitment'
                    });
                }
            }
        }

        return result;
    }

    // Maps to STK-APP-APPLY-002, SCR-APP-JOBAPPLY-001
    public async findById(id: number, transaction?: Transaction): Promise<Application | null> {
        const app = await Application.findByPk(id, {
            include: [
                JobListing,
                Payment,
                User,
                { model: Ticket, as: 'Tickets' },
                { model: JobStage, as: 'JobStages' }
            ],
            transaction
        });

        if (app && !app.JobListing && app.jobId) {
            const job = await JobListing.findByPk(app.jobId, { transaction });
            if (job) {
                (app as any).setDataValue('JobListing', job.toJSON());
            } else {
                (app as any).setDataValue('JobListing', {
                    id: app.jobId,
                    title: 'General FIFO Application',
                    company: 'BlueCollar Recruitment',
                    location: 'Australia',
                    salary: 'Competitive',
                    description: 'Application details for FIFO position.',
                    visaSponsorship: false
                });
            }
        }

        return app;
    }

    // Maps to STK-APP-APPLY-001, TRUST-009
    public async create(appData: any, transaction?: Transaction): Promise<Application> {
        return Application.create(appData, { transaction });
    }

    // Maps to STK-APP-APPLY-005, STK-APP-PAY-003, DM-001
    public async update(id: number, updateData: any, transaction?: Transaction): Promise<[number]> {
        return Application.update(updateData, { where: { id }, transaction });
    }

    // Maps to STK-APP-PROFILE-001
    public async delete(id: number, transaction?: Transaction): Promise<void> {
        await Application.destroy({ where: { id }, transaction });
    }
}

export const applicationRepository = new ApplicationRepository();
