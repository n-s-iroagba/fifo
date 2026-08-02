"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobListing = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class JobListing extends sequelize_1.Model {
}
exports.JobListing = JobListing;
JobListing.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    benefitIds: {
        type: sequelize_1.DataTypes.JSON
    },
    conditionIds: {
        type: sequelize_1.DataTypes.JSON
    },
    stages: {
        type: sequelize_1.DataTypes.JSON,
        allowNull: true,
    },
    company: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    visaSponsorship: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
    },
    title: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
    location: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    employmentType: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    requirements: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
    categoryId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    isActive: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: true,
    },
    salary: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    jobType: {
        type: sequelize_1.DataTypes.ENUM('NORMAL', 'APEX'),
        defaultValue: 'NORMAL',
    }
}, {
    sequelize: database_1.sequelize,
    tableName: 'job_listings',
    timestamps: true,
});
