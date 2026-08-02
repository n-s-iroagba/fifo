import { Request, Response, NextFunction } from 'express';
import { ExamService } from '../services/ExamService';
import { CONSTANTS } from '../constants';

export class ExamController {
    async getQuestionBank(req: Request, res: Response, next: NextFunction) {
        try {
            const data = await ExamService.getQuestionBank(req.params.courseId as string);
            res.status(CONSTANTS.HTTP_STATUS.OK).json({ success: true, data });
        } catch (error: any) {
            if (error.message === 'CONFIG_NOT_FOUND') return res.status(404).json({ code: 404, message: 'Exam configuration missing for course.' });
            next(error);
        }
    }

    async addQuestion(req: Request, res: Response, next: NextFunction) {
        try {
            const data = await ExamService.addQuestion(req.params.courseId as string, req.body);
            res.status(CONSTANTS.HTTP_STATUS.OK).json({ success: true, data });
        } catch (error) { next(error); }
    }

    async updateQuestion(req: Request, res: Response, next: NextFunction) {
        try {
            const data = await ExamService.updateQuestion(req.params.questionId as string, req.body);
            res.status(CONSTANTS.HTTP_STATUS.OK).json({ success: true, data });
        } catch (error: any) {
            if (error.message === 'QUESTION_NOT_FOUND') return res.status(404).json({ code: 404, message: 'Question ID not found.' });
            next(error);
        }
    }

    async deleteQuestion(req: Request, res: Response, next: NextFunction) {
        try {
            await ExamService.deleteQuestion(req.params.questionId as string);
            res.status(CONSTANTS.HTTP_STATUS.OK).json({ success: true, message: 'Question removed from bank' });
        } catch (error: any) {
            if (error.message === 'QUESTION_NOT_FOUND') return res.status(404).json({ code: 404, message: 'Question ID not found.' });
            next(error);
        }
    }

    async updateSettings(req: Request, res: Response, next: NextFunction) {
        try {
            const data = await ExamService.updateSettings(req.params.courseId as string, req.body);
            res.status(CONSTANTS.HTTP_STATUS.OK).json({ success: true, data });
        } catch (error) { next(error); }
    }
}
export const examController = new ExamController();
