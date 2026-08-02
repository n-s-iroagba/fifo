"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jobCategoryRepository = exports.JobCategoryRepository = void 0;
const sequelize_1 = require("sequelize");
const models_1 = require("../models");
class JobCategoryRepository {
    // Maps to STK-ADM-CAT-001, SCR-ADM-CAT-001
    async findAll(options = {}, transaction) {
        const whereClause = {};
        if (options.searchQuery) {
            whereClause.name = { [sequelize_1.Op.like]: `%${options.searchQuery}%` };
        }
        return models_1.JobCategory.findAndCountAll({
            where: whereClause,
            limit: options.limit || 20,
            offset: options.offset || 0,
            order: [['name', 'ASC']],
            transaction
        });
    }
    async findById(id, transaction) {
        return models_1.JobCategory.findByPk(id, { transaction });
    }
    // Maps to STK-ADM-CAT-001, STK-ADM-CAT-002, SCR-ADM-CATFORM-001
    async create(data, transaction) {
        return models_1.JobCategory.create(data, { transaction });
    }
    // Maps to STK-ADM-CAT-001
    async update(id, data, transaction) {
        return models_1.JobCategory.update(data, { where: { id }, transaction });
    }
    // Maps to STK-ADM-CAT-001
    async delete(id, transaction) {
        await models_1.JobCategory.destroy({ where: { id }, transaction });
    }
}
exports.JobCategoryRepository = JobCategoryRepository;
exports.jobCategoryRepository = new JobCategoryRepository();
