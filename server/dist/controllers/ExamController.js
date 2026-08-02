"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.examController = exports.ExamController = void 0;
const ExamService_1 = require("../services/ExamService");
const constants_1 = require("../constants");
class ExamController {
    async getQuestionBank(req, res, next) {
        try {
            const data = await ExamService_1.ExamService.getQuestionBank(req.params.courseId);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json({ success: true, data });
        }
        catch (error) {
            if (error.message === 'CONFIG_NOT_FOUND')
                return res.status(404).json({ code: 404, message: 'Exam configuration missing for course.' });
            next(error);
        }
    }
    async addQuestion(req, res, next) {
        try {
            const data = await ExamService_1.ExamService.addQuestion(req.params.courseId, req.body);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json({ success: true, data });
        }
        catch (error) {
            next(error);
        }
    }
    async updateQuestion(req, res, next) {
        try {
            const data = await ExamService_1.ExamService.updateQuestion(req.params.questionId, req.body);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json({ success: true, data });
        }
        catch (error) {
            if (error.message === 'QUESTION_NOT_FOUND')
                return res.status(404).json({ code: 404, message: 'Question ID not found.' });
            next(error);
        }
    }
    async deleteQuestion(req, res, next) {
        try {
            await ExamService_1.ExamService.deleteQuestion(req.params.questionId);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json({ success: true, message: 'Question removed from bank' });
        }
        catch (error) {
            if (error.message === 'QUESTION_NOT_FOUND')
                return res.status(404).json({ code: 404, message: 'Question ID not found.' });
            next(error);
        }
    }
    async updateSettings(req, res, next) {
        try {
            const data = await ExamService_1.ExamService.updateSettings(req.params.courseId, req.body);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json({ success: true, data });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.ExamController = ExamController;
exports.examController = new ExamController();
