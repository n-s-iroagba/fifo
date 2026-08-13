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
        comment: 'Wallet nickname (e.g. Corporate Binance)',
    },
    accountNumber: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        comment: 'USDT TRC-20 wallet address',
    },
    accountName: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
        comment: 'Legal entity / account holder name',
    },
    accountHolderName: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
        comment: 'Display name shown on high-value payment notices',
    },
    accountType: {
        type: sequelize_1.DataTypes.ENUM(constants_1.CONSTANTS.BANK_ACCOUNT_TYPES.OPEN_BENEFICIARY, constants_1.CONSTANTS.BANK_ACCOUNT_TYPES.NORMAL),
        allowNull: false,
        defaultValue: constants_1.CONSTANTS.BANK_ACCOUNT_TYPES.NORMAL,
    },
    routingCode: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
        defaultValue: 'TRC-20',
        comment: 'Network label — always TRC-20 for USDT',
    },
    currency: {
        type: sequelize_1.DataTypes.STRING,
        defaultValue: 'USDT',
    },
    isActive: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: true,
    },
    isDefault: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: false,
    },
}, {
    sequelize: database_1.sequelize,
    tableName: 'bank_accounts',
    timestamps: true,
});
