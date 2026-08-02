import { Transaction, Op } from 'sequelize';
import { JobCategory } from '../models';

export interface FindCategoryOptions {
    limit?: number;
    offset?: number;
    searchQuery?: string;
}

export class JobCategoryRepository {
    // Maps to STK-ADM-CAT-001, SCR-ADM-CAT-001
    public async findAll(options: FindCategoryOptions = {}, transaction?: Transaction): Promise<{ rows: JobCategory[], count: number }> {
        const whereClause: any = {};
        
        if (options.searchQuery) {
            whereClause.name = { [Op.like]: `%${options.searchQuery}%` };
        }

        return JobCategory.findAndCountAll({
            where: whereClause,
            limit: options.limit || 20,
            offset: options.offset || 0,
            order: [['name', 'ASC']],
            transaction
        });
    }

    public async findById(id: number, transaction?: Transaction): Promise<JobCategory | null> {
        return JobCategory.findByPk(id, { transaction });
    }

    // Maps to STK-ADM-CAT-001, STK-ADM-CAT-002, SCR-ADM-CATFORM-001
    public async create(data: any, transaction?: Transaction): Promise<JobCategory> {
        return JobCategory.create(data, { transaction });
    }

    // Maps to STK-ADM-CAT-001
    public async update(id: number, data: any, transaction?: Transaction): Promise<[number]> {
        return JobCategory.update(data, { where: { id }, transaction });
    }

    // Maps to STK-ADM-CAT-001
    public async delete(id: number, transaction?: Transaction): Promise<void> {
        await JobCategory.destroy({ where: { id }, transaction });
    }
}

export const jobCategoryRepository = new JobCategoryRepository();
