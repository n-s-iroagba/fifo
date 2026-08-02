"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jobConditionRepository = exports.JobConditionRepository = void 0;
const sequelize_1 = require("sequelize");
const models_1 = require("../models");
class JobConditionRepository {
    // Maps to STK-ADM-COND-001, SCR-ADM-COND-001
    async findAll(options = {}, transaction) {
        const whereClause = {};
        if (options.categoryId)
            whereClause.categoryId = options.categoryId;
        if (options.searchQuery) {
            whereClause[sequelize_1.Op.or] = [
                { name: { [sequelize_1.Op.like]: `%${options.searchQuery}%` } },
                { description: { [sequelize_1.Op.like]: `%${options.searchQuery}%` } }
            ];
        }
        return models_1.JobCondition.findAndCountAll({
            where: whereClause,
            limit: options.limit || 20,
            offset: options.offset || 0,
            order: [['name', 'ASC']],
            transaction
        });
    }
    async findById(id, transaction) {
        return models_1.JobCondition.findByPk(id, { transaction });
    }
    // Maps to STK-ADM-COND-001, STK-ADM-COND-002, SCR-ADM-CONDFORM-001
    async create(data, transaction) {
        return models_1.JobCondition.create(data, { transaction });
    }
    // Maps to STK-ADM-COND-001
    async update(id, data, transaction) {
        return models_1.JobCondition.update(data, { where: { id }, transaction });
    }
    // Maps to STK-ADM-COND-001
    async delete(id, transaction) {
        await models_1.JobCondition.destroy({ where: { id }, transaction });
    }
}
exports.JobConditionRepository = JobConditionRepository;
exports.jobConditionRepository = new JobConditionRepository();
