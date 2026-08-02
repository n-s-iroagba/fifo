import { Transaction, Op } from 'sequelize';
import { JobBenefit } from '../models';

export interface FindBenefitOptions {
    limit?: number;
    offset?: number;
    searchQuery?: string;
    categoryId?: number;
}

export class JobBenefitRepository {
    // Maps to STK-ADM-BEN-001, STK-ADM-BEN-004, SCR-ADM-BEN-001
    public async findAll(options: FindBenefitOptions = {}, transaction?: Transaction): Promise<{ rows: JobBenefit[], count: number }> {
        const whereClause: any = {};
        
        if (options.categoryId) whereClause.categoryId = options.categoryId;
        if (options.searchQuery) {
            whereClause[Op.or] = [
                { benefitType: { [Op.like]: `%${options.searchQuery}%` } },
                { description: { [Op.like]: `%${options.searchQuery}%` } }
            ];
        }

        return JobBenefit.findAndCountAll({
            where: whereClause,
            limit: options.limit || 20,
            offset: options.offset || 0,
            order: [['benefitType', 'ASC']],
            transaction
        });
    }

    public async findById(id: number, transaction?: Transaction): Promise<JobBenefit | null> {
        return JobBenefit.findByPk(id, { transaction });
    }

    // Maps to STK-ADM-BEN-001, STK-ADM-BEN-002, SCR-ADM-BENFORM-001
    public async create(data: any, transaction?: Transaction): Promise<JobBenefit> {
        return JobBenefit.create(data, { transaction });
    }

    // Maps to STK-ADM-BEN-001
    public async update(id: number, data: any, transaction?: Transaction): Promise<[number]> {
        return JobBenefit.update(data, { where: { id }, transaction });
    }

    // Maps to STK-ADM-BEN-001
    public async delete(id: number, transaction?: Transaction): Promise<void> {
        await JobBenefit.destroy({ where: { id }, transaction });
    }
}

export const jobBenefitRepository = new JobBenefitRepository();
