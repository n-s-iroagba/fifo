import { Request, Response } from 'express';
import { cvService } from '../services/CvService';
import { CONSTANTS } from '../constants';

export class CvController {
    // Maps to STK-APP-CV-001 (Create), STK-APP-CV-002, STK-APP-CV-003
    public async uploadCv(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).user.id;
            const { cvUrl, fileType, fileSizeMb } = req.body;
            const updated = await cvService.uploadCv(userId, cvUrl, fileType, fileSizeMb);
            res.status(CONSTANTS.HTTP_STATUS.CREATED).json({
                message: CONSTANTS.SUCCESS_MESSAGES.CREATED,
                data: updated,
            });
        } catch (error: any) {
            console.error('[CvController.uploadCv]', error);
            if (error.message === CONSTANTS.ERROR_MESSAGES.VALIDATION_ERROR) {
                res.status(CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({ error: error.message });
                return;
            }
            res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }

    // Maps to STK-APP-CV-001 (Read)
    public async getCv(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).user.id;
            const cv = await cvService.getCv(userId);
            res.status(CONSTANTS.HTTP_STATUS.OK).json(cv);
        } catch (error: any) {
            console.error('[CvController.getCv]', error);
            if (error.message === CONSTANTS.ERROR_MESSAGES.RESOURCE_NOT_FOUND) {
                res.status(CONSTANTS.HTTP_STATUS.NOT_FOUND).json({ error: error.message });
                return;
            }
            res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }

    // Maps to STK-APP-CV-001 (Update) — STK-APP-CV-004
    public async updateCv(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).user.id;
            const { cvUrl, fileType, fileSizeMb } = req.body;
            const updated = await cvService.updateCv(userId, cvUrl, fileType, fileSizeMb);
            res.status(CONSTANTS.HTTP_STATUS.OK).json({
                message: CONSTANTS.SUCCESS_MESSAGES.UPDATED,
                data: updated,
            });
        } catch (error: any) {
            console.error('[CvController.updateCv]', error);
            if (error.message === CONSTANTS.ERROR_MESSAGES.VALIDATION_ERROR) {
                res.status(CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({ error: error.message });
                return;
            }
            res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }

    // Maps to STK-APP-CV-001 (Delete), REG-004 (right to data deletion)
    public async deleteCv(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).user.id;
            await cvService.deleteCv(userId);
            res.status(CONSTANTS.HTTP_STATUS.OK).json({ message: CONSTANTS.SUCCESS_MESSAGES.DELETED });
        } catch (error: any) {
            console.error('[CvController.deleteCv]', error);
            if (error.message === CONSTANTS.ERROR_MESSAGES.RESOURCE_NOT_FOUND) {
                res.status(CONSTANTS.HTTP_STATUS.NOT_FOUND).json({ error: error.message });
                return;
            }
            res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }
}

export const cvController = new CvController();
