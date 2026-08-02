"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobCondition = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class JobCondition extends sequelize_1.Model {
}
exports.JobCondition = JobCondition;
JobCondition.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
    categoryId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    }
}, {
    sequelize: database_1.sequelize,
    tableName: 'job_conditions',
    timestamps: true,
});
