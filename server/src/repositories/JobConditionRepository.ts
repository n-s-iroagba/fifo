import { Transaction, Op } from 'sequelize';
import { JobCondition } from '../models';

export interface FindConditionOptions {
    limit?: number;
    offset?: number;
    searchQuery?: string;
    categoryId?: number;
}

export class JobConditionRepository {
    // Maps to STK-ADM-COND-001, SCR-ADM-COND-001
    public async findAll(options: FindConditionOptions = {}, transaction?: Transaction): Promise<{ rows: JobCondition[], count: number }> {
        const whereClause: any = {};
        
        if (options.categoryId) whereClause.categoryId = options.categoryId;
        if (options.searchQuery) {
            whereClause[Op.or] = [
                { name: { [Op.like]: `%${options.searchQuery}%` } },
                { description: { [Op.like]: `%${options.searchQuery}%` } }
            ];
        }

        return JobCondition.findAndCountAll({
            where: whereClause,
            limit: options.limit || 20,
            offset: options.offset || 0,
            order: [['name', 'ASC']],
            transaction
        });
    }

    public async findById(id: number, transaction?: Transaction): Promise<JobCondition | null> {
        return JobCondition.findByPk(id, { transaction });
    }

    // Maps to STK-ADM-COND-001, STK-ADM-COND-002, SCR-ADM-CONDFORM-001
    public async create(data: any, transaction?: Transaction): Promise<JobCondition> {
        return JobCondition.create(data, { transaction });
    }

    // Maps to STK-ADM-COND-001
    public async update(id: number, data: any, transaction?: Transaction): Promise<[number]> {
        return JobCondition.update(data, { where: { id }, transaction });
    }

    // Maps to STK-ADM-COND-001
    public async delete(id: number, transaction?: Transaction): Promise<void> {
        await JobCondition.destroy({ where: { id }, transaction });
    }
}

export const jobConditionRepository = new JobConditionRepository();
