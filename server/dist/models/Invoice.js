"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Invoice = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class Invoice extends sequelize_1.Model {
}
exports.Invoice = Invoice;
Invoice.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    applicantId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false
    },
    purpose: {
        type: sequelize_1.DataTypes.ENUM('aveling-partial', 'aveling-complete-after-partial', 'aveling-complete', 'second-attempt', 'shipping'),
        allowNull: false
    },
    amountInUSD: {
        type: sequelize_1.DataTypes.FLOAT,
        allowNull: false
    },
    date: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW
    },
    receiptProofSubmission: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true
    },
    isPaid: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
}, {
    sequelize: database_1.sequelize,
    tableName: 'invoices',
    modelName: 'Invoice',
    timestamps: true
});
