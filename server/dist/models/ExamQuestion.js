"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExamQuestion = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class ExamQuestion extends sequelize_1.Model {
}
exports.ExamQuestion = ExamQuestion;
ExamQuestion.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    courseId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: { model: 'courses', key: 'id' },
        onDelete: 'CASCADE'
    },
    questionText: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false
    },
    questionType: {
        type: sequelize_1.DataTypes.ENUM('mcq', 'essay', 'input_answer'),
        allowNull: false,
        defaultValue: 'mcq'
    },
    options: {
        type: sequelize_1.DataTypes.JSON,
        allowNull: true
    },
    correctOptionIndex: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true
    },
    correctAnswer: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true
    },
    weight: {
        type: sequelize_1.DataTypes.INTEGER,
        defaultValue: 10
    }
}, {
    sequelize: database_1.sequelize,
    modelName: 'ExamQuestion',
    tableName: 'exam_questions',
    timestamps: true,
    underscored: true,
});
