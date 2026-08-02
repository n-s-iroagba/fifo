"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Payment = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
const constants_1 = require("../constants");
class Payment extends sequelize_1.Model {
}
exports.Payment = Payment;
Payment.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    applicationId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    stageId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    status: {
        type: sequelize_1.DataTypes.ENUM(constants_1.CONSTANTS.PAYMENT_STATUSES.PENDING, constants_1.CONSTANTS.PAYMENT_STATUSES.VERIFIED, constants_1.CONSTANTS.PAYMENT_STATUSES.REJECTED, constants_1.CONSTANTS.PAYMENT_STATUSES.PAID, constants_1.CONSTANTS.PAYMENT_STATUSES.UNPAID),
        defaultValue: constants_1.CONSTANTS.PAYMENT_STATUSES.UNPAID,
    },
    amount: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    currency: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    proofUrl: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    adminNote: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    verifiedById: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    }
}, {
    sequelize: database_1.sequelize,
    tableName: 'payments',
    timestamps: true,
});
