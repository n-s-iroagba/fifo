"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cryptoWalletRepository = exports.CryptoWalletRepository = void 0;
const models_1 = require("../models");
class CryptoWalletRepository {
    // Maps to STK-ADM-CRYPTO-001, SCR-ADM-CRYPTO-001
    async findAll(transaction) {
        return models_1.CryptoWallet.findAndCountAll({
            order: [['createdAt', 'DESC']],
            transaction
        });
    }
    // Maps to STK-APP-PAY-001 (Applicants fetching available payment methods)
    async findAllActive(transaction) {
        return models_1.CryptoWallet.findAll({
            where: { isActive: true },
            order: [['displayLabel', 'ASC']],
            transaction
        });
    }
    async findById(id, transaction) {
        return models_1.CryptoWallet.findByPk(id, { transaction });
    }
    // Maps to STK-ADM-CRYPTO-001, STK-ADM-CRYPTO-002, SCR-ADM-CRYPTOFORM-001
    async create(data, transaction) {
        return models_1.CryptoWallet.create(data, { transaction });
    }
    // Maps to STK-ADM-CRYPTO-001
    async update(id, data, transaction) {
        return models_1.CryptoWallet.update(data, { where: { id }, transaction });
    }
    // Maps to STK-ADM-CRYPTO-001, NFR-DATA-001
    async delete(id, transaction) {
        await models_1.CryptoWallet.destroy({ where: { id }, transaction });
    }
}
exports.CryptoWalletRepository = CryptoWalletRepository;
exports.cryptoWalletRepository = new CryptoWalletRepository();
