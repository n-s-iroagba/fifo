"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExamConfig = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class ExamConfig extends sequelize_1.Model {
}
exports.ExamConfig = ExamConfig;
ExamConfig.init({
    courseId: {
        type: sequelize_1.DataTypes.UUID,
        primaryKey: true,
        references: { model: 'courses', key: 'id' },
        onDelete: 'CASCADE'
    },
    passThreshold: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 80
    },
    timeLimitMinutes: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 30
    }
}, {
    sequelize: database_1.sequelize,
    modelName: 'ExamConfig',
    tableName: 'exam_configs',
    timestamps: true,
    underscored: true,
});
