"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExamAttempt = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class ExamAttempt extends sequelize_1.Model {
    id;
    userId;
    courseId;
    score;
    isPass;
    attemptNumber;
    createdAt;
    updatedAt;
}
exports.ExamAttempt = ExamAttempt;
ExamAttempt.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    userId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE'
    },
    courseId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: { model: 'courses', key: 'id' },
        onDelete: 'CASCADE'
    },
    score: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    isPass: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    attemptNumber: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
    }
}, {
    sequelize: database_1.sequelize,
    modelName: 'ExamAttempt',
    tableName: 'exam_attempts',
    timestamps: true,
    underscored: true,
});
