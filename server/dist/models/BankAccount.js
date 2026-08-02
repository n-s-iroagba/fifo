"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BankAccount = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
const constants_1 = require("../constants");
class BankAccount extends sequelize_1.Model {
}
exports.BankAccount = BankAccount;
BankAccount.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    bankName: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    accountNumber: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    accountType: {
        type: sequelize_1.DataTypes.ENUM(constants_1.CONSTANTS.BANK_ACCOUNT_TYPES.OPEN_BENEFICIARY, constants_1.CONSTANTS.BANK_ACCOUNT_TYPES.NORMAL),
        allowNull: false,
    },
    routingCode: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    currency: {
        type: sequelize_1.DataTypes.STRING,
        defaultValue: 'USD',
    },
    isActive: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: true,
    }
}, {
    sequelize: database_1.sequelize,
    tableName: 'bank_accounts',
    timestamps: true,
});
