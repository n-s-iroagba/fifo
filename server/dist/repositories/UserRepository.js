"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRepository = exports.UserRepository = void 0;
const models_1 = require("../models");
class UserRepository {
    // Maps to STK-APP-AUTH-004, STK-APP-AUTH-005
    async findByEmail(email, transaction) {
        return models_1.User.findOne({ where: { email }, transaction });
    }
    // Maps to STK-APP-AUTH-004, REG-002
    async create(userData, transaction) {
        return models_1.User.create(userData, { transaction });
    }
    // Maps to NFR-SEC-004
    async findById(id, transaction) {
        return models_1.User.findByPk(id, { transaction });
    }
    async findByVerificationToken(token, transaction) {
        return models_1.User.findOne({ where: { verificationToken: token }, transaction });
    }
    async findByResetToken(token, transaction) {
        return models_1.User.findOne({ where: { resetPasswordToken: token }, transaction });
    }
    // Maps to STK-ADM-USERS-001 (Derived Admin View)
    async findAndCountAll(options = {}) {
        const whereClause = {};
        if (options.role)
            whereClause.role = options.role;
        if (options.isVerified !== undefined)
            whereClause.isVerified = options.isVerified;
        return models_1.User.findAndCountAll({
            where: whereClause,
            limit: options.limit || 10,
            offset: options.offset || 0,
            order: [['createdAt', 'DESC']]
        });
    }
    // Maps to STK-APP-PROFILE-001
    async update(id, updateData, transaction) {
        return models_1.User.update(updateData, { where: { id }, transaction });
    }
    // Maps to STK-APP-PROFILE-001 (Derived from data deletion requests REG-004)
    async delete(id, transaction) {
        await models_1.User.destroy({ where: { id }, transaction });
    }
}
exports.UserRepository = UserRepository;
exports.userRepository = new UserRepository();
