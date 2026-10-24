"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Wallet = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class Wallet extends sequelize_1.Model {
}
exports.Wallet = Wallet;
Wallet.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    address: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    network: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        defaultValue: 'USDT TRON (TRC20)',
    },
    qrCodeUrl: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    isActive: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: true,
    },
}, {
    sequelize: database_1.sequelize,
    tableName: 'wallets',
    timestamps: true,
});
