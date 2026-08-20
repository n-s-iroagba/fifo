"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Receipt = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class Receipt extends sequelize_1.Model {
}
exports.Receipt = Receipt;
Receipt.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    invoiceId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false
    },
    amountPaid: {
        type: sequelize_1.DataTypes.FLOAT,
        allowNull: false
    }
}, {
    sequelize: database_1.sequelize,
    tableName: 'receipts',
    modelName: 'Receipt',
    timestamps: true
});
