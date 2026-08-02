"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jobBenefitRepository = exports.JobBenefitRepository = void 0;
const sequelize_1 = require("sequelize");
const models_1 = require("../models");
class JobBenefitRepository {
    // Maps to STK-ADM-BEN-001, STK-ADM-BEN-004, SCR-ADM-BEN-001
    async findAll(options = {}, transaction) {
        const whereClause = {};
        if (options.categoryId)
            whereClause.categoryId = options.categoryId;
        if (options.searchQuery) {
            whereClause[sequelize_1.Op.or] = [
                { benefitType: { [sequelize_1.Op.like]: `%${options.searchQuery}%` } },
                { description: { [sequelize_1.Op.like]: `%${options.searchQuery}%` } }
            ];
        }
        return models_1.JobBenefit.findAndCountAll({
            where: whereClause,
            limit: options.limit || 20,
            offset: options.offset || 0,
            order: [['benefitType', 'ASC']],
            transaction
        });
    }
    async findById(id, transaction) {
        return models_1.JobBenefit.findByPk(id, { transaction });
    }
    // Maps to STK-ADM-BEN-001, STK-ADM-BEN-002, SCR-ADM-BENFORM-001
    async create(data, transaction) {
        return models_1.JobBenefit.create(data, { transaction });
    }
    // Maps to STK-ADM-BEN-001
    async update(id, data, transaction) {
        return models_1.JobBenefit.update(data, { where: { id }, transaction });
    }
    // Maps to STK-ADM-BEN-001
    async delete(id, transaction) {
        await models_1.JobBenefit.destroy({ where: { id }, transaction });
    }
}
exports.JobBenefitRepository = JobBenefitRepository;
exports.jobBenefitRepository = new JobBenefitRepository();
