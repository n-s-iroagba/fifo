"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Ticket = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class Ticket extends sequelize_1.Model {
}
exports.Ticket = Ticket;
Ticket.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    userId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    applicationId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
    status: {
        type: sequelize_1.DataTypes.ENUM('not_possessed', 'possessed'),
        defaultValue: 'not_possessed',
        allowNull: false,
    },
    ticketNumber: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    ticketType: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    purchasePrice: {
        type: sequelize_1.DataTypes.FLOAT,
        defaultValue: 0,
    },
    realPrice: {
        type: sequelize_1.DataTypes.FLOAT,
        allowNull: true,
    },
    subsidisedPrice: {
        type: sequelize_1.DataTypes.FLOAT,
        allowNull: true,
    },
    purchaseDate: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    expiryDate: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    proof: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    proofThumbnail: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    sponsorshipDeadline: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    ticketSponsorship: {
        type: sequelize_1.DataTypes.ENUM('no_application', 'applied', 'first_attempt_approved', 'first_attempt_failed', 'second_attempt_approved', 'second_attempt_failed', 'ticket_issued'),
        defaultValue: 'no_application',
        allowNull: false,
    },
    canApplySponsorship: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
    },
    ticketSponsorshipRefundAmount: {
        type: sequelize_1.DataTypes.FLOAT,
        allowNull: true,
    },
    refundStatus: {
        type: sequelize_1.DataTypes.ENUM('none', 'requested', 'refunded_to_wallet', 'refunded_to_bank'),
        defaultValue: 'none',
        allowNull: false,
    },
    courseId: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    receiptUrl: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    receiptReference: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    paymentStatus: {
        type: sequelize_1.DataTypes.ENUM('unpaid', 'receipt_submitted', 'payment_verified'),
        defaultValue: 'unpaid',
        allowNull: false,
    },
    courseAccessGranted: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
    },
}, {
    sequelize: database_1.sequelize,
    tableName: 'tickets',
    timestamps: true,
    underscored: true,
});
