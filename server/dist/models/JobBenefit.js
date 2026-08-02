"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobBenefit = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class JobBenefit extends sequelize_1.Model {
}
exports.JobBenefit = JobBenefit;
JobBenefit.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    benefitType: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
    value: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    categoryId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    }
}, {
    sequelize: database_1.sequelize,
    tableName: 'job_benefits',
    timestamps: true,
});
