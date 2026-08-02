import { ExamConfig } from '../models/ExamConfig';
import { ExamQuestion } from '../models/ExamQuestion';
import { Course } from '../models/Course';

export class ExamService {
    static async getQuestionBank(courseId: string) {
        const config = await ExamConfig.findOne({ where: { courseId } });
        if (!config) throw new Error('CONFIG_NOT_FOUND');
        const questions = await ExamQuestion.findAll({ where: { courseId } });
        return {
            courseId,
            passThreshold: config.passThreshold,
            timeLimitMinutes: config.timeLimitMinutes,
            questions
        };
    }

    static async addQuestion(courseId: string, data: any) {
        return await ExamQuestion.create({ ...data, courseId });
    }

    static async updateQuestion(questionId: string, data: any) {
        const question = await ExamQuestion.findByPk(questionId);
        if (!question) throw new Error('QUESTION_NOT_FOUND');
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

    static async deleteQuestion(questionId: string) {
        const result = await ExamQuestion.destroy({ where: { id: questionId } });
        if (result === 0) throw new Error('QUESTION_NOT_FOUND');
        return true;
    }

    static async updateSettings(courseId: string, data: any) {
        let config = await ExamConfig.findOne({ where: { courseId } });
        if (!config) {
            config = await ExamConfig.create({ ...data, courseId });
        } else {
            await config.update(data);
        }
        return config;
    }
}
