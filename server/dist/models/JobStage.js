"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobStage = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class JobStage extends sequelize_1.Model {
}
exports.JobStage = JobStage;
JobStage.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    applicationId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    orderPosition: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    requiresPayment: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: false,
    },
    amount: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: true,
    },
    currency: {
        type: sequelize_1.DataTypes.STRING,
        defaultValue: 'USD',
    },
    feeType: {
        type: sequelize_1.DataTypes.STRING,
        defaultValue: 'Free',
    },
    refundMessage: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    instructions: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    deadlineDays: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
    notifyEmail: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: true,
    },
    notifyPush: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: true,
    },
    isCompleted: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: false,
    }
}, {
    sequelize: database_1.sequelize,
    tableName: 'job_stages',
    timestamps: true,
});
