import { Request, Response } from 'express';
import { interestService } from '../services/InterestService';
import { CONSTANTS } from '../constants';
import { sendInfoEmail } from '../utils/email';
import { User } from '../models/User';
import { applicationService } from '../services/ApplicationService';

export class InterestController {
    public async createInterest(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).user.id;
            const interest = await interestService.createInterest(userId, req.body);

            // Notify Admin of Expression of Interest
            await sendInfoEmail(
                'BlueCollar@gmail.com',
                'New Expression of Interest Received',
                `
                <p>A new professional has expressed interest in the Apex Network audit.</p>
                <div style="background-color: #f8fafc; padding: 25px; border-radius: 12px; border: 1px solid #eef2f6;">
                    <p><strong>User ID:</strong> ${userId}</p>
                    <p><strong>Roles:</strong> ${req.body.roles?.join(', ')}</p>
                </div>
                `
            ).catch(err => console.error('[InterestController] Admin notification failed:', err));

            // Notify Candidate
            const user = await User.findByPk(userId);
            if (user) {
                await sendInfoEmail(
                    user.email,
                    'Expression of Interest Received',
                    `
                    <p>Dear ${user.fullName},</p>
                    <p>We have successfully received your Expression of Interest.</p>
                    <p>Our team will review your profile against upcoming vacancies and contact you when a suitable role becomes available.</p>
                    `
                ).catch(err => console.error('[InterestController] Candidate notification failed:', err));
            }

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
    public async updateInterest(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).user.id;
            const interest = await interestService.updateInterest(userId, req.body);
            if (!interest) {
                res.status(CONSTANTS.HTTP_STATUS.NOT_FOUND).json({ error: CONSTANTS.ERROR_MESSAGES.RESOURCE_NOT_FOUND });
                return;
            }
            res.status(CONSTANTS.HTTP_STATUS.OK).json(interest);
        } catch (error) {
            console.error('[InterestController.updateInterest]', error);
            res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }

    public async deleteInterest(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id as string, 10);
            await interestService.deleteInterest(id);
            res.status(CONSTANTS.HTTP_STATUS.OK).json({ message: CONSTANTS.SUCCESS_MESSAGES.DELETED });
        } catch (error) {
            console.error('[InterestController.deleteInterest]', error);
            res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }

    public async approveInterest(req: Request, res: Response): Promise<void> {
        try {
            const interestId = parseInt(req.params.id as string, 10);
            const { jobId } = req.body;

            if (!jobId) {
                res.status(CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({ error: 'jobId is required for approval' });
                return;
            }

            // Get interest to find userId
            const interests = await interestService.getAllInterests(); // Note: might be better to have getById
            const interest = (interests as any[]).find((i: any) => i.id === interestId);
            if (!interest) {
                res.status(CONSTANTS.HTTP_STATUS.NOT_FOUND).json({ error: 'Interest not found' });
                return;
            }

            const userId = interest.userId;

            // Create Application via applicationService.startApplication
            const application = await applicationService.startApplication(userId, jobId, []);

            // Send Vacancy Available Email
            const user = await User.findByPk(userId);
            if (user) {
                await sendInfoEmail(
                    user.email,
                    'Vacancy Available - Application Created',
                    `
                    <p>Dear ${user.fullName},</p>
                    <p>Based on your Expression of Interest, we have found a matching vacancy for you and have automatically created an application on your behalf.</p>
                    <p>Please log in to your dashboard to review the application and proceed with the next steps.</p>
                    `
                ).catch(err => console.error('[InterestController] Vacancy available email failed:', err));
            }

            res.status(CONSTANTS.HTTP_STATUS.OK).json({ message: 'Interest approved and application created successfully', application });
        } catch (error) {
            console.error('[InterestController.approveInterest]', error);
            res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }
}

export const interestController = new InterestController();
