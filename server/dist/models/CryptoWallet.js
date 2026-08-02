"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CryptoWallet = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class CryptoWallet extends sequelize_1.Model {
}
exports.CryptoWallet = CryptoWallet;
CryptoWallet.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    currencyName: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    networkType: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    walletAddress: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    memoTag: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    isActive: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
    displayLabel: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
}, {
    sequelize: database_1.sequelize,
    tableName: 'crypto_wallets',
    timestamps: true,
});
