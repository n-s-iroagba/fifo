"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Nomination = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class Nomination extends sequelize_1.Model {
}
exports.Nomination = Nomination;
Nomination.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    applicationId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    tradeStream: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    hostEmployer: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    vacancies: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    competitors: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    isSelected: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
    },
    documentUrl: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    }
}, {
    sequelize: database_1.sequelize,
    tableName: 'nominations',
    timestamps: true,
});
