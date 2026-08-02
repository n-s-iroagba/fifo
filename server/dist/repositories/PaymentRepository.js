"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentRepository = exports.PaymentRepository = void 0;
const models_1 = require("../models");
class PaymentRepository {
    // Maps to STK-ADM-PAY-003, SCR-ADM-UNPAID-001 NFR-PERF-004
    async findAllAdmin(options = {}, transaction) {
        const whereClause = {};
        if (options.status)
            whereClause.status = options.status;
        if (options.applicationId)
            whereClause.applicationId = options.applicationId;
        if (options.stageId)
            whereClause.stageId = options.stageId;
        return models_1.Payment.findAndCountAll({
            where: whereClause,
            limit: options.limit || 20,
            offset: options.offset || 0,
            include: [
                { model: models_1.Application, include: [{ model: models_1.User, attributes: ['id', 'fullName', 'email'] }, { model: models_1.JobListing, attributes: ['title'] }] },
                { model: models_1.JobStage, attributes: ['id', 'name', 'amount', 'currency'] },
                { model: models_1.User, as: 'Verifier', attributes: ['id', 'fullName'] }
            ],
            order: [['createdAt', 'DESC']],
            transaction
        });
    }
    // Maps to STK-APP-PAY-002, SCR-APP-PAYSTATUS-001
    async findByApplicationId(applicationId, transaction) {
        return models_1.Payment.findAll({
            where: { applicationId },
            include: [models_1.JobStage],
            order: [['createdAt', 'ASC']],
            transaction
        });
    }
    // Maps to STK-APP-PAY-001, SCR-APP-PAYUPLOAD-001 NFR-SEC-005
    async create(paymentData, transaction) {
        return models_1.Payment.create(paymentData, { transaction });
    }
    // Maps to STK-ADM-PAY-001, STK-ADM-PAY-002, SCR-ADM-UNVERIFIED-001
    async update(id, updateData, transaction) {
        return models_1.Payment.update(updateData, { where: { id }, transaction });
    }
    async findById(id, transaction) {
        return models_1.Payment.findByPk(id, {
            include: [
                models_1.Application,
                models_1.JobStage,
                { model: models_1.User, as: 'Verifier', attributes: ['id', 'fullName'] }
            ],
            transaction
        });
    }
}
exports.PaymentRepository = PaymentRepository;
exports.paymentRepository = new PaymentRepository();
