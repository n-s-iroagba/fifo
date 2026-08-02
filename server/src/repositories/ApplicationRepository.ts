import { Transaction } from 'sequelize';
import { Application, JobListing, Payment, JobStage, User } from '../models';

export interface FindApplicationOptions {
    limit?: number;
    offset?: number;
    status?: string;
    userId?: number;
}

export class ApplicationRepository {
    // Maps to STK-APP-APPLIST-001, SCR-APP-APPLIST-001
    public async findByUserId(userId: number, options: FindApplicationOptions = {}, transaction?: Transaction): Promise<{ rows: Application[]; count: number }> {
        return Application.findAndCountAll({
            where: { userId },
            limit: options.limit || 10,
            offset: options.offset || 0,
            include: [
                { model: JobListing, attributes: ['id', 'title', 'company', 'location', 'salary'] }
            ],
            order: [['updatedAt', 'DESC']],
            transaction
        });
    }

    // Maps to STK-ADM-APP-001, SCR-ADM-NEWAPPS-001
    public async findAllAdmin(options: FindApplicationOptions = {}, transaction?: Transaction): Promise<{ rows: Application[]; count: number }> {
        const whereClause: any = {};
        if (options.status) whereClause.status = options.status;
        if (options.userId) whereClause.userId = options.userId;

        return Application.findAndCountAll({
            where: whereClause,
            limit: options.limit || 20,
            offset: options.offset || 0,
            include: [
                { model: User, attributes: ['id', 'fullName', 'email'] },
                { model: JobListing, attributes: ['id', 'title'] },
                { model: Payment, include: [{ model: JobStage, attributes: ['name'] }] }
            ],
            order: [['createdAt', 'DESC']],
            transaction
        });
    }

    // Maps to STK-APP-APPLY-002, SCR-APP-JOBAPPLY-001
    public async findById(id: number, transaction?: Transaction): Promise<Application | null> {
        return Application.findByPk(id, {
            include: [
                JobListing, 
                Payment, 
                User,
                { model: JobStage, as: 'JobStages' }
            ],
            transaction
        });
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
