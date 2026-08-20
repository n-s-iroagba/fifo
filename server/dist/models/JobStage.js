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
    prefillStageId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
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
