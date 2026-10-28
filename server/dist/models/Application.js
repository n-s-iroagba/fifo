"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Application = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class Application extends sequelize_1.Model {
}
exports.Application = Application;
Application.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    currentStageId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
    userId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    jobId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    status: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        defaultValue: 'Active'
    },
    visaSponsorshipStatus: {
        type: sequelize_1.DataTypes.ENUM('Pending', 'Approved', 'Rejected'),
        allowNull: true,
        defaultValue: null
    },
    isCronPaused: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    pausedStageCrons: {
        type: sequelize_1.DataTypes.JSON,
        allowNull: true,
        defaultValue: []
    },
    sponsorshipCallEmailSent: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    sponsorshipCallEmailSentAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true
    },
    sponsorshipId: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true
    }
}, {
    sequelize: database_1.sequelize,
    tableName: 'applications',
    timestamps: true,
});
