"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Employer = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class Employer extends sequelize_1.Model {
}
exports.Employer = Employer;
Employer.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    websiteUrl: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    companyDescription: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
    isEmploying: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
    },
    location: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    logoUrl: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
}, {
    sequelize: database_1.sequelize,
    tableName: 'employers',
    timestamps: true,
});
