"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Experience = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class Experience extends sequelize_1.Model {
}
exports.Experience = Experience;
Experience.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    userId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    companyName: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    jobTitle: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    startDate: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    endDate: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    isCurrent: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: false,
    },
    responsibilities: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
}, {
    sequelize: database_1.sequelize,
    tableName: 'experiences',
    timestamps: true,
});
