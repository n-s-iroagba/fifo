import { Request, Response } from 'express';
import { interestService } from '../services/InterestService';
import { CONSTANTS } from '../constants';
import { sendInfoEmail } from '../utils/email';

export class InterestController {
    public async createInterest(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).user.id;
            const interest = await interestService.createInterest(userId, req.body);

            // Notify Admin of Expression of Interest
            await sendInfoEmail(
                'BlueCollarRecruitment@gmail.com',
                'New Expression of Interest Received',
                `
                <p>A new professional has expressed interest in the Apex Network audit.</p>
                <div style="background-color: #f8fafc; padding: 25px; border-radius: 12px; border: 1px solid #eef2f6;">
                    <p><strong>User ID:</strong> ${userId}</p>
                    <p><strong>Roles:</strong> ${req.body.roles?.join(', ')}</p>
                </div>
                `
            ).catch(err => console.error('[InterestController] Admin notification failed:', err));

            res.status(CONSTANTS.HTTP_STATUS.CREATED).json(interest);
        } catch (error) {
            console.error('[InterestController.createInterest]', error);
            res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }

    public async getUserInterest(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).user.id;
            const interest = await interestService.getUserInterest(userId);
            res.status(CONSTANTS.HTTP_STATUS.OK).json(interest);
        } catch (error) {
            console.error('[InterestController.getUserInterest]', error);
            res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }

    public async getAllInterests(req: Request, res: Response): Promise<void> {
        try {
            const interests = await interestService.getAllInterests();
            res.status(CONSTANTS.HTTP_STATUS.OK).json(interests);
        } catch (error) {
            console.error('[InterestController.getAllInterests]', error);
            res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }
}

export const interestController = new InterestController();
