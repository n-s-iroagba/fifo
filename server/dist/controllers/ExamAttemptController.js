"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.examAttemptController = exports.ExamAttemptController = void 0;
const ExamAttemptService_1 = require("../services/ExamAttemptService");
const constants_1 = require("../constants");
class ExamAttemptController {
    // GET /api/exams/attempts/:attemptId
    async getAttemptDetails(req, res, next) {
        try {
            const data = await ExamAttemptService_1.ExamAttemptService.getAttemptDetails(req.params.attemptId);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json({ success: true, data });
        }
        catch (error) {
            if (error.message === 'ATTEMPT_NOT_FOUND')
                return res.status(404).json({ code: 404, message: 'Attempt not found.' });
            next(error);
        }
    }
    // POST /api/exams/attempts/start
    async startAttempt(req, res, next) {
        try {
            const userId = req.user?.id;
            if (!userId)
                throw new Error('UNAUTHORIZED_ACCESS');
            const data = await ExamAttemptService_1.ExamAttemptService.startAttempt(userId, req.body.courseId);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json({ success: true, data });
        }
        catch (error) {
            if (error.message === 'RETAKE_LIMIT_EXCEEDED')
                return res.status(403).json({ code: 403, message: 'Retake limit exceeded. A maximum of 2 attempts are permitted under the Sponsorship Agreement.' });
            if (error.message === 'PAYMENT_REQUIRED')
                return res.status(402).json({ code: 402, error: 'PAYMENT_REQUIRED', message: 'Course payment required to start exam.' });
            if (error.message === 'DEPOSIT_REQUIRED')
                return res.status(402).json({ code: 402, error: 'DEPOSIT_REQUIRED', message: 'Your A$500 initial commitment deposit must be verified before accessing the first training module. Please submit your deposit receipt.' });
            if (error.message === 'FULL_BALANCE_REQUIRED')
                return res.status(402).json({ code: 402, error: 'FULL_BALANCE_REQUIRED', message: 'Your full programme balance must be paid before accessing Training Module 4 and beyond. Please submit your balance receipt.' });
            next(error);
        }
    }
    // POST /api/exams/attempts/:attemptId/answers
    async saveAnswers(req, res, next) {
        try {
            const data = await ExamAttemptService_1.ExamAttemptService.saveAnswers(req.params.attemptId, req.body.answers);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json({ success: true, data });
        }
        catch (error) {
            if (error.message === 'ATTEMPT_NOT_FOUND')
                return res.status(404).json({ code: 404, message: 'Attempt not found.' });
            next(error);
        }
    }
    // POST /api/exams/attempts/:attemptId/submit
    async submitAttempt(req, res, next) {
        try {
            const data = await ExamAttemptService_1.ExamAttemptService.submitAttempt(req.params.attemptId, req.body.answers || req.body);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json({ success: true, data });
        }
        catch (error) {
            if (error.message === 'ATTEMPT_NOT_FOUND')
                return res.status(404).json({ code: 404, message: 'Attempt not found.' });
            next(error);
        }
    }
    // GET /api/exams/attempts/:attemptId/result
    async getAttemptResult(req, res, next) {
        try {
            const data = await ExamAttemptService_1.ExamAttemptService.getAttemptResult(req.params.attemptId);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json({ success: true, data });
        }
        catch (error) {
            if (error.message === 'ATTEMPT_NOT_FOUND')
                return res.status(404).json({ code: 404, message: 'Attempt not found.' });
            next(error);
        }
    }
}
exports.ExamAttemptController = ExamAttemptController;
exports.examAttemptController = new ExamAttemptController();
