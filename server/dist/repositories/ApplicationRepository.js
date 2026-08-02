"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applicationRepository = exports.ApplicationRepository = void 0;
const models_1 = require("../models");
class ApplicationRepository {
    // Maps to STK-APP-APPLIST-001, SCR-APP-APPLIST-001
    async findByUserId(userId, options = {}, transaction) {
        return models_1.Application.findAndCountAll({
            where: { userId },
            limit: options.limit || 10,
            offset: options.offset || 0,
            include: [
                { model: models_1.JobListing, attributes: ['id', 'title', 'company', 'location', 'salary'] }
            ],
            order: [['updatedAt', 'DESC']],
            transaction
        });
    }
    // Maps to STK-ADM-APP-001, SCR-ADM-NEWAPPS-001
    async findAllAdmin(options = {}, transaction) {
        const whereClause = {};
        if (options.status)
            whereClause.status = options.status;
        if (options.userId)
            whereClause.userId = options.userId;
        return models_1.Application.findAndCountAll({
            where: whereClause,
            limit: options.limit || 20,
            offset: options.offset || 0,
            include: [
                { model: models_1.User, attributes: ['id', 'fullName', 'email'] },
                { model: models_1.JobListing, attributes: ['id', 'title'] },
                { model: models_1.Payment, include: [{ model: models_1.JobStage, attributes: ['name'] }] }
            ],
            order: [['createdAt', 'DESC']],
            transaction
        });
    }
    // Maps to STK-APP-APPLY-002, SCR-APP-JOBAPPLY-001
    async findById(id, transaction) {
        return models_1.Application.findByPk(id, {
            include: [
                models_1.JobListing,
                models_1.Payment,
                models_1.User,
                { model: models_1.JobStage, as: 'JobStages' }
            ],
            transaction
        });
    }
    // Maps to STK-APP-APPLY-001, TRUST-009
    async create(appData, transaction) {
        return models_1.Application.create(appData, { transaction });
    }
    // Maps to STK-APP-APPLY-005, STK-APP-PAY-003, DM-001
    async update(id, updateData, transaction) {
        return models_1.Application.update(updateData, { where: { id }, transaction });
    }
    // Maps to STK-APP-PROFILE-001
    async delete(id, transaction) {
        await models_1.Application.destroy({ where: { id }, transaction });
    }
}
exports.ApplicationRepository = ApplicationRepository;
exports.applicationRepository = new ApplicationRepository();
