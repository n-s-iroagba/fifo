import { Request, Response, NextFunction } from 'express';
import { PracticalAssessmentService } from '../services/PracticalAssessmentService';
import { CONSTANTS } from '../constants';

export class PracticalAssessmentController {
    async getCriteria(req: Request, res: Response, next: NextFunction) {
        try {
            const data = await PracticalAssessmentService.getCriteria(req.params.courseId as string);
            res.status(CONSTANTS.HTTP_STATUS.OK).json({ success: true, data });
        } catch (error) { next(error); }
    }

    async addCriterion(req: Request, res: Response, next: NextFunction) {
        try {
            const data = await PracticalAssessmentService.addCriterion(req.params.courseId as string, req.body);
            res.status(CONSTANTS.HTTP_STATUS.OK).json({ success: true, data });
        } catch (error) { next(error); }
    }

    async deleteCriterion(req: Request, res: Response, next: NextFunction) {
        try {
            await PracticalAssessmentService.deleteCriterion(req.params.criterionId as string);
            res.status(CONSTANTS.HTTP_STATUS.OK).json({ success: true, message: 'Criterion deleted' });
        } catch (error: any) {
            if (error.message === 'CRITERION_NOT_FOUND') return res.status(404).json({ code: 404, message: 'Criterion not found.' });
            next(error);
        }
    }

    async updateCriterion(req: Request, res: Response, next: NextFunction) {
        try {
            const data = await PracticalAssessmentService.updateCriterion(req.params.criterionId as string, req.body);
            res.status(CONSTANTS.HTTP_STATUS.OK).json({ success: true, data });
        } catch (error: any) {
            if (error.message === 'CRITERION_NOT_FOUND') return res.status(404).json({ code: 404, message: 'Criterion not found.' });
            next(error);
        }
    }
}
export const practicalAssessmentController = new PracticalAssessmentController();
