import { Request, Response, NextFunction } from 'express';
import { ExamAttemptService } from '../services/ExamAttemptService';
import { CONSTANTS } from '../constants';
import { z } from 'zod';

export class ExamAttemptController {
    // GET /api/exams/attempts/:attemptId
    async getAttemptDetails(req: Request, res: Response, next: NextFunction) {
        try {
            const data = await ExamAttemptService.getAttemptDetails(req.params.attemptId as string);
            res.status(CONSTANTS.HTTP_STATUS.OK).json({ success: true, data });
        } catch (error: any) {
            if (error.message === 'ATTEMPT_NOT_FOUND') return res.status(404).json({ code: 404, message: 'Attempt not found.' });
            next(error);
        }
    }

    // POST /api/exams/attempts/start
    async startAttempt(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req as any).user?.id;
            if (!userId) throw new Error('UNAUTHORIZED_ACCESS');
            const data = await ExamAttemptService.startAttempt(userId, req.body.courseId);
            res.status(CONSTANTS.HTTP_STATUS.OK).json({ success: true, data });
        } catch (error: any) {
            if (error.message === 'ALREADY_POSSESSED') return res.status(400).json({ code: 400, message: 'You already possess the ticket for this course. Exam is not required.' });
            if (error.message === 'RETAKE_LIMIT_EXCEEDED') return res.status(403).json({ code: 403, message: 'Retake limit exceeded. A maximum of 2 attempts are permitted under the Sponsorship Agreement.' });
            if (error.message === 'PAYMENT_REQUIRED') return res.status(402).json({ code: 402, error: 'PAYMENT_REQUIRED', message: 'Course payment required to start exam.' });
            if (error.message === 'DEPOSIT_REQUIRED') return res.status(402).json({ code: 402, error: 'DEPOSIT_REQUIRED', message: 'Your A$500 initial commitment deposit must be verified before accessing the first training module. Please submit your deposit receipt.' });
            if (error.message === 'FULL_BALANCE_REQUIRED') return res.status(402).json({ code: 402, error: 'FULL_BALANCE_REQUIRED', message: 'Your full programme balance must be paid before accessing Training Module 4 and beyond. Please submit your balance receipt.' });
            next(error);
        }
    }

    // POST /api/exams/attempts/:attemptId/answers
    async saveAnswers(req: Request, res: Response, next: NextFunction) {
        try {
            const data = await ExamAttemptService.saveAnswers(req.params.attemptId as string, req.body.answers);
            res.status(CONSTANTS.HTTP_STATUS.OK).json({ success: true, data });
        } catch (error: any) {
            if (error.message === 'ATTEMPT_NOT_FOUND') return res.status(404).json({ code: 404, message: 'Attempt not found.' });
            next(error);
        }
    }

    // POST /api/exams/attempts/:attemptId/submit
    async submitAttempt(req: Request, res: Response, next: NextFunction) {
        try {
            const data = await ExamAttemptService.submitAttempt(req.params.attemptId as string, req.body.answers || req.body);
            res.status(CONSTANTS.HTTP_STATUS.OK).json({ success: true, data });
        } catch (error: any) {
            if (error.message === 'ATTEMPT_NOT_FOUND') return res.status(404).json({ code: 404, message: 'Attempt not found.' });
            next(error);
        }
    }

    // GET /api/exams/attempts/:attemptId/result
    async getAttemptResult(req: Request, res: Response, next: NextFunction) {
        try {
            const data = await ExamAttemptService.getAttemptResult(req.params.attemptId as string);
            res.status(CONSTANTS.HTTP_STATUS.OK).json({ success: true, data });
        } catch (error: any) {
            if (error.message === 'ATTEMPT_NOT_FOUND') return res.status(404).json({ code: 404, message: 'Attempt not found.' });
            next(error);
        }
    }
}
export const examAttemptController = new ExamAttemptController();
