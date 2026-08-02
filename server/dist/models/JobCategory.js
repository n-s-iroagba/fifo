"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobCategory = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class JobCategory extends sequelize_1.Model {
}
exports.JobCategory = JobCategory;
JobCategory.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    description: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    }
}, {
    sequelize: database_1.sequelize,
    tableName: 'job_categories',
    timestamps: true,
});
