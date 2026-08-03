"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Application = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
const constants_1 = require("../constants");
class Application extends sequelize_1.Model {
}
exports.Application = Application;
Application.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    userId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    jobId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    currentStageId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
    status: {
        type: sequelize_1.DataTypes.ENUM(constants_1.CONSTANTS.APPLICATION_STATUSES.DRAFT, constants_1.CONSTANTS.APPLICATION_STATUSES.ACTIVE, constants_1.CONSTANTS.APPLICATION_STATUSES.WITHDRAWN, constants_1.CONSTANTS.APPLICATION_STATUSES.FAILED, constants_1.CONSTANTS.APPLICATION_STATUSES.SUCCEEDED, constants_1.CONSTANTS.APPLICATION_STATUSES.HIRED, constants_1.CONSTANTS.APPLICATION_STATUSES.COMPLETED, constants_1.CONSTANTS.APPLICATION_STATUSES.REJECTED),
        defaultValue: constants_1.CONSTANTS.APPLICATION_STATUSES.DRAFT,
    },
    isPaid: {
        type: sequelize_1.DataTypes.VIRTUAL,
        get() {
            const payments = this.Payments;
            if (!payments || !Array.isArray(payments))
                return false;
            return payments.some((p) => p.status === constants_1.CONSTANTS.PAYMENT_STATUSES.VERIFIED);
        }
    },
    visaSponsorshipStatus: {
        type: sequelize_1.DataTypes.ENUM('Pending', 'Approved', 'Rejected'),
        allowNull: true,
        defaultValue: null
    }
}, {
    sequelize: database_1.sequelize,
    tableName: 'applications',
    timestamps: true,
});
