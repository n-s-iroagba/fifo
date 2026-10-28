"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Interview = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class Interview extends sequelize_1.Model {
}
exports.Interview = Interview;
Interview.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    scheduleCatalogueId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'schedule_catalogues',
            key: 'id',
        },
        onDelete: 'SET NULL',
    },
    applicantId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id',
        },
        onDelete: 'CASCADE',
    },
    interviewDate: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    interviewTime: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    timezone: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
        defaultValue: 'AWST (UTC+8)',
    },
    interviewUrl: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    overview: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    outcome: {
        type: sequelize_1.DataTypes.ENUM('Pending', 'Passed', 'Failed', 'Completed', 'Rescheduled'),
        defaultValue: 'Pending',
        allowNull: false,
    },
    meetingLink: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    interviewEmailSentAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    onboardingEmailSentAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    onboardingEmailSent: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
    },
}, {
    sequelize: database_1.sequelize,
    tableName: 'interviews',
    timestamps: true,
});
