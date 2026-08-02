import { Request, Response } from 'express';
import { authService } from '../services/AuthService';
import { CONSTANTS } from '../constants';

export class AuthController {
    public async register(req: Request, res: Response): Promise<void> {
        try {
            const { user, accessToken, refreshToken } = await authService.register(req.body);
            this.setRefreshTokenCookie(res, refreshToken);
            res.status(CONSTANTS.HTTP_STATUS.CREATED).json({
                message: CONSTANTS.SUCCESS_MESSAGES.REGISTER_SUCCESS,
                user: { id: user.id, email: user.email, role: user.role, fullName: user.fullName, cvUrl: user.cvUrl, phoneNumber: user.phoneNumber, nationality: user.nationality },
                accessToken
            });
        } catch (error: any) {
            console.error('[AuthController.register]', error);
            if (error.message === CONSTANTS.ERROR_MESSAGES.EMAIL_EXISTS) {
                res.status(CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({ error: error.message });
                return;
            }
            res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }

    public async registerAdmin(req: Request, res: Response): Promise<void> {
        try {
            const { user, accessToken, refreshToken } = await authService.registerAdmin(req.body);
            this.setRefreshTokenCookie(res, refreshToken);
            res.status(CONSTANTS.HTTP_STATUS.CREATED).json({
                message: CONSTANTS.SUCCESS_MESSAGES.REGISTER_SUCCESS,
                user: { id: user.id, email: user.email, role: user.role, fullName: user.fullName, cvUrl: user.cvUrl, phoneNumber: user.phoneNumber, nationality: user.nationality },
                accessToken
            });
        } catch (error: any) {
            console.error('[AuthController.registerAdmin]', error);
            if (error.message === CONSTANTS.ERROR_MESSAGES.EMAIL_EXISTS) {
                res.status(CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({ error: error.message });
                return;
            }
            res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }

    public async verifyEmail(req: Request, res: Response): Promise<void> {
        try {
            const { token } = req.query;
            await authService.verifyEmail(token as string);
            res.status(CONSTANTS.HTTP_STATUS.OK).json({
                message: CONSTANTS.SUCCESS_MESSAGES.VERIFY_SUCCESS
            });
        } catch (error: any) {
            console.error('[AuthController.verifyEmail]', error);
            res.status(CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({ error: error.message });
        }
    }

    public async forgotPassword(req: Request, res: Response): Promise<void> {
        try {
            const { email } = req.body;
            await authService.forgotPassword(email);
            res.status(CONSTANTS.HTTP_STATUS.OK).json({
                message: CONSTANTS.SUCCESS_MESSAGES.FORGOT_PASSWORD_SUCCESS
            });
        } catch (error: any) {
            console.error('[AuthController.forgotPassword]', error);
            res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }

    public async resetPassword(req: Request, res: Response): Promise<void> {
        try {
            const { token, password } = req.body;
            await authService.resetPassword(token, password);
            res.status(CONSTANTS.HTTP_STATUS.OK).json({
                message: CONSTANTS.SUCCESS_MESSAGES.RESET_PASSWORD_SUCCESS
            });
        } catch (error: any) {
            console.error('[AuthController.resetPassword]', error);
            res.status(CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({ error: error.message });
        }
    }

    public async resendVerification(req: Request, res: Response): Promise<void> {
        try {
            const { email } = req.body;
            await authService.resendVerification(email);
            res.status(CONSTANTS.HTTP_STATUS.OK).json({
                message: 'Verification link resent successfully.'
            });
        } catch (error: any) {
            console.error('[AuthController.resendVerification]', error);
            res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }

    public async login(req: Request, res: Response): Promise<void> {
        try {
            const { email, password } = req.body;
            const { user, accessToken, refreshToken } = await authService.login(email, password);

            this.setRefreshTokenCookie(res, refreshToken);
            res.status(CONSTANTS.HTTP_STATUS.OK).json({
                message: CONSTANTS.SUCCESS_MESSAGES.LOGIN_SUCCESS,
                user: { 
                    id: user.id, 
                    email: user.email, 
                    role: user.role, 
                    fullName: user.fullName,
                    cvUrl: user.cvUrl,
                    phoneNumber: user.phoneNumber,
                    nationality: user.nationality
                },
                accessToken
            });
        } catch (error: any) {
            console.error('[AuthController.login]', error);
            if (error.message === CONSTANTS.ERROR_MESSAGES.INVALID_CREDENTIALS) {
                res.status(CONSTANTS.HTTP_STATUS.UNAUTHORIZED).json({ error: error.message });
                return;
            }
            if (error.message === CONSTANTS.ERROR_MESSAGES.EMAIL_NOT_VERIFIED) {
                res.status(CONSTANTS.HTTP_STATUS.FORBIDDEN).json({ error: error.message });
                return;
            }
            res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }

    public async refresh(req: Request, res: Response): Promise<void> {
        try {
            const refreshToken = req.cookies.refreshToken;
            if (!refreshToken) {
                res.status(CONSTANTS.HTTP_STATUS.UNAUTHORIZED).json({ error: 'Refresh token missing' });
                return;
            }

            const { accessToken, refreshToken: newRefreshToken } = await authService.refresh(refreshToken);
            this.setRefreshTokenCookie(res, newRefreshToken);
            res.status(CONSTANTS.HTTP_STATUS.OK).json({ accessToken });
        } catch (error: any) {
            console.error('[AuthController.refresh]', error);
            res.status(CONSTANTS.HTTP_STATUS.UNAUTHORIZED).json({ error: error.message });
        }
    }

    public async getMe(req: Request, res: Response): Promise<void> {
        try {
            // req.user is populated by requireAuth middleware
            const userId = (req as any).user.id;
            const user = await authService.getMe(userId);
            res.status(CONSTANTS.HTTP_STATUS.OK).json({
                user: {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                    fullName: user.fullName,
                    phoneNumber: user.phoneNumber,
                    dateOfBirth: user.dateOfBirth,
                    gender: user.gender,
                    nationality: user.nationality,
                    address: user.address,
                    city: user.city,
                    state: user.state,
                    country: user.country,
                    countryOfResidence: user.countryOfResidence,
                    zipCode: user.zipCode,
                    cvUrl: user.cvUrl,
                    languages: user.languages
                }
            });
        } catch (error: any) {
            console.error('[AuthController.getMe]', error);
            res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: error.message });
        }
    }

    public async updateProfile(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).user.id;
            const user = await authService.updateProfile(userId, req.body);
            res.status(CONSTANTS.HTTP_STATUS.OK).json({
                message: CONSTANTS.SUCCESS_MESSAGES.UPDATED,
                user: {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                    fullName: user.fullName,
                    phoneNumber: user.phoneNumber,
                    dateOfBirth: user.dateOfBirth,
                    gender: user.gender,
                    nationality: user.nationality,
                    address: user.address,
                    city: user.city,
                    state: user.state,
                    country: user.country,
                    countryOfResidence: user.countryOfResidence,
                    zipCode: user.zipCode,
                    cvUrl: user.cvUrl,
                    languages: user.languages
                }
            });
        } catch (error: any) {
            console.error('[AuthController.updateProfile]', error);
            res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }

    public async changePassword(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).user.id;
            const { currentPassword, newPassword } = req.body;
            await authService.changePassword(userId, currentPassword, newPassword);
            res.status(CONSTANTS.HTTP_STATUS.OK).json({
                message: 'Passphrase successfully updated.'
            });
        } catch (error: any) {
            console.error('[AuthController.changePassword]', error);
            if (error.message === CONSTANTS.ERROR_MESSAGES.INVALID_CREDENTIALS) {
                res.status(CONSTANTS.HTTP_STATUS.UNAUTHORIZED).json({ error: 'Verification of current passphrase failed.' });
                return;
            }
            res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }

    public async logout(req: Request, res: Response): Promise<void> {
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
        });
        res.status(CONSTANTS.HTTP_STATUS.OK).json({ message: 'Logged out successfully' });
    }

    private setRefreshTokenCookie(res: Response, token: string): void {
        res.cookie('refreshToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });
    }
}

export const authController = new AuthController();
