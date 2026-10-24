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
        allowNull: false,
        unique: true
    },
    purpose: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
        defaultValue: 'CertHero Ticket Sponsorship'
    },
    paymentStatus: {
        type: sequelize_1.DataTypes.ENUM('unpaid', 'half_paid', 'paid'),
        allowNull: false,
        defaultValue: 'unpaid'
    },
    walletAddress: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true
    },
    amountInAUD: {
        type: sequelize_1.DataTypes.FLOAT,
        allowNull: true,
        defaultValue: 0
    },
    amountInUSD: {
        type: sequelize_1.DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0
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
