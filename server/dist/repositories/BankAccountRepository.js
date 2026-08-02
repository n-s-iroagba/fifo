"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bankAccountRepository = exports.BankAccountRepository = void 0;
const models_1 = require("../models");
class BankAccountRepository {
    // Maps to STK-ADM-BANK-001, SCR-ADM-BANK-001
    async findAll(transaction) {
        return models_1.BankAccount.findAndCountAll({
            order: [['createdAt', 'DESC']],
            transaction
        });
    }
    // Maps to STK-APP-PAY-001 (Applicants fetching available payment methods)
    async findAllActive(transaction) {
        return models_1.BankAccount.findAll({
            where: { isActive: true },
            order: [['bankName', 'ASC']],
            transaction
        });
    }
    async findById(id, transaction) {
        return models_1.BankAccount.findByPk(id, { transaction });
    }
    // Maps to STK-ADM-BANK-001, STK-ADM-BANK-002, SCR-ADM-BANKFORM-001
    async create(data, transaction) {
        return models_1.BankAccount.create(data, { transaction });
    }
    // Maps to STK-ADM-BANK-001, STK-ADM-BANK-004
    async update(id, data, transaction) {
        return models_1.BankAccount.update(data, { where: { id }, transaction });
    }
    // Maps to STK-ADM-BANK-001, NFR-DATA-001
    async delete(id, transaction) {
        await models_1.BankAccount.destroy({ where: { id }, transaction });
    }
}
exports.BankAccountRepository = BankAccountRepository;
exports.bankAccountRepository = new BankAccountRepository();
