"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PsychometricAttempt = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class PsychometricAttempt extends sequelize_1.Model {
}
exports.PsychometricAttempt = PsychometricAttempt;
PsychometricAttempt.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    userId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        },
        onDelete: 'CASCADE'
    },
    module: {
        type: sequelize_1.DataTypes.ENUM('module_1', 'module_2'),
        allowNull: false,
    },
    score: {
        type: sequelize_1.DataTypes.FLOAT,
        allowNull: false,
    },
    passed: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
    },
    answers: {
        type: sequelize_1.DataTypes.JSON,
        allowNull: true,
    }
}, {
    sequelize: database_1.sequelize,
    tableName: 'psychometric_attempts',
    timestamps: true,
});
