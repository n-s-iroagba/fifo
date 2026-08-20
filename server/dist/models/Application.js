"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Application = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class Application extends sequelize_1.Model {
}
exports.Application = Application;
Application.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    currentStageId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
    userId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    jobId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    visaSponsorshipStatus: {
        type: sequelize_1.DataTypes.ENUM('Pending', 'Approved', 'Rejected'),
        allowNull: true,
        defaultValue: null
    }
}, {
    sequelize: database_1.sequelize,
    tableName: 'applications',
    timestamps: true,
});
