"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JoblistingEmployer = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class JoblistingEmployer extends sequelize_1.Model {
}
exports.JoblistingEmployer = JoblistingEmployer;
JoblistingEmployer.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    employerId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    joblistingId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    vacancyUrl: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
        defaultValue: null,
    },
}, {
    sequelize: database_1.sequelize,
    tableName: 'joblisting_employers',
    timestamps: true,
});
