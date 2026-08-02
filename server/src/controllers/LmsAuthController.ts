import { Request, Response, NextFunction } from 'express';
import { LmsAuthService } from '../services/LmsAuthService';
import { CONSTANTS } from '../constants';
import { z } from 'zod';

export class LmsAuthController {
    // STEP-030: GET /api/lms-credentials/applicants/:applicantId
    async getLmsCredentialsStatus(req: Request, res: Response, next: NextFunction) {
        try {
            const { applicantId } = req.params as { applicantId: string };

            if (!applicantId) {
                return res.status(CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
                    code: 400,
                    message: CONSTANTS.ERROR_MESSAGES.VALIDATION_ERROR
                });
            }

            const data = await LmsAuthService.getLmsCredentialsStatus(applicantId);

            res.status(CONSTANTS.HTTP_STATUS.OK).json({
                success: true,
                data
            });
        } catch (error) {
            next(error);
        }
    }

    // STEP-030: POST /api/lms-credentials/generate
    async generateCredentials(req: Request, res: Response, next: NextFunction) {
        try {
            const schema = z.object({
                applicantId: z.string().or(z.number())
            });

            const validation = schema.safeParse(req.body);
            if (!validation.success) {
                return res.status(CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
                    code: 400,
                    message: CONSTANTS.ERROR_MESSAGES.VALIDATION_ERROR
                });
            }

            const data = await LmsAuthService.generateCredentials(validation.data.applicantId);

            res.status(CONSTANTS.HTTP_STATUS.OK).json({
                success: true,
                data
            });
        } catch (error: any) {
            if (error.message === 'APPLICANT_NOT_FOUND') {
                // error-063
                return res.status(CONSTANTS.HTTP_STATUS.NOT_FOUND).json({
                    code: 404,
                    message: 'Applicant not found.'
                });
            }
            if (error.message === 'CREDENTIALS_EXIST') {
                // error-064
                return res.status(CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({ // Using 400 or 409 as per spec (409 in spec)
                    code: 409,
                    message: 'Applicant already has LMS credentials.'
                });
            }
            next(error);
        }
    }

    // STEP-031: POST /api/lms-auth/login
    async login(req: Request, res: Response, next: NextFunction) {
        try {
            const schema = z.object({
                lmsUsername: z.string(),
                password: z.string()
            });

            const validation = schema.safeParse(req.body);
            if (!validation.success) {
                return res.status(CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
                    code: 400,
                    message: CONSTANTS.ERROR_MESSAGES.VALIDATION_ERROR
                });
            }

            const data = await LmsAuthService.login(validation.data.lmsUsername, validation.data.password);

            res.status(CONSTANTS.HTTP_STATUS.OK).json({
                success: true,
                data
            });
        } catch (error: any) {
            if (error.message === 'INVALID_CREDENTIALS') {
                // error-065
                return res.status(CONSTANTS.HTTP_STATUS.UNAUTHORIZED).json({
                    code: 401,
                    message: 'Invalid LMS username or password.'
                });
            }
            next(error);
        }
    }
}

export const lmsAuthController = new LmsAuthController();
