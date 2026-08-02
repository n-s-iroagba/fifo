"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExamService = void 0;
const ExamConfig_1 = require("../models/ExamConfig");
const ExamQuestion_1 = require("../models/ExamQuestion");
class ExamService {
    static async getQuestionBank(courseId) {
        const config = await ExamConfig_1.ExamConfig.findOne({ where: { courseId } });
        if (!config)
            throw new Error('CONFIG_NOT_FOUND');
        const questions = await ExamQuestion_1.ExamQuestion.findAll({ where: { courseId } });
        return {
            courseId,
            passThreshold: config.passThreshold,
            timeLimitMinutes: config.timeLimitMinutes,
            questions
        };
    }
    static async addQuestion(courseId, data) {
        return await ExamQuestion_1.ExamQuestion.create({ ...data, courseId });
    }
    static async updateQuestion(questionId, data) {
        const question = await ExamQuestion_1.ExamQuestion.findByPk(questionId);
        if (!question)
            throw new Error('QUESTION_NOT_FOUND');
        await question.update({
            questionText: data.questionText !== undefined ? data.questionText : question.questionText,
            questionType: data.questionType !== undefined ? data.questionType : question.questionType,
            options: data.options !== undefined ? data.options : question.options,
            correctOptionIndex: data.correctOptionIndex !== undefined ? data.correctOptionIndex : question.correctOptionIndex,
            correctAnswer: data.correctAnswer !== undefined ? data.correctAnswer : question.correctAnswer,
            weight: data.weight !== undefined ? data.weight : question.weight,
        });
        return question;
    }
    static async deleteQuestion(questionId) {
        const result = await ExamQuestion_1.ExamQuestion.destroy({ where: { id: questionId } });
        if (result === 0)
            throw new Error('QUESTION_NOT_FOUND');
        return true;
    }
    static async updateSettings(courseId, data) {
        let config = await ExamConfig_1.ExamConfig.findOne({ where: { courseId } });
        if (!config) {
            config = await ExamConfig_1.ExamConfig.create({ ...data, courseId });
        }
        else {
            await config.update(data);
        }
        return config;
    }
}
exports.ExamService = ExamService;
