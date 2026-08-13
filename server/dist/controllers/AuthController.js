"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = exports.AuthController = void 0;
const AuthService_1 = require("../services/AuthService");
const constants_1 = require("../constants");
class AuthController {
    async register(req, res) {
        try {
            const { user, accessToken, refreshToken } = await AuthService_1.authService.register(req.body);
            this.setRefreshTokenCookie(res, refreshToken);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.CREATED).json({
                message: constants_1.CONSTANTS.SUCCESS_MESSAGES.REGISTER_SUCCESS,
                user: { id: user.id, email: user.email, role: user.role, fullName: user.fullName, cvUrl: user.cvUrl, phoneNumber: user.phoneNumber, nationality: user.nationality, psychometricModule1Passed: user.psychometricModule1Passed, psychometricModule2Passed: user.psychometricModule2Passed },
                accessToken
            });
        }
        catch (error) {
            console.error('[AuthController.register]', error);
            if (error.message === constants_1.CONSTANTS.ERROR_MESSAGES.EMAIL_EXISTS) {
                res.status(constants_1.CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({ error: error.message });
                return;
            }
            res.status(constants_1.CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: constants_1.CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }
    async registerAdmin(req, res) {
        try {
            const { user, accessToken, refreshToken } = await AuthService_1.authService.registerAdmin(req.body);
            this.setRefreshTokenCookie(res, refreshToken);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.CREATED).json({
                message: constants_1.CONSTANTS.SUCCESS_MESSAGES.REGISTER_SUCCESS,
                user: { id: user.id, email: user.email, role: user.role, fullName: user.fullName, cvUrl: user.cvUrl, phoneNumber: user.phoneNumber, nationality: user.nationality, psychometricModule1Passed: user.psychometricModule1Passed, psychometricModule2Passed: user.psychometricModule2Passed },
                accessToken
            });
        }
        catch (error) {
            console.error('[AuthController.registerAdmin]', error);
            if (error.message === constants_1.CONSTANTS.ERROR_MESSAGES.EMAIL_EXISTS) {
                res.status(constants_1.CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({ error: error.message });
                return;
            }
            res.status(constants_1.CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: constants_1.CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }
    async verifyEmail(req, res) {
        try {
            const { token } = req.query;
            await AuthService_1.authService.verifyEmail(token);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json({
                message: constants_1.CONSTANTS.SUCCESS_MESSAGES.VERIFY_SUCCESS
            });
        }
        catch (error) {
            console.error('[AuthController.verifyEmail]', error);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({ error: error.message });
        }
    }
    async forgotPassword(req, res) {
        try {
            const { email } = req.body;
            await AuthService_1.authService.forgotPassword(email);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json({
                message: constants_1.CONSTANTS.SUCCESS_MESSAGES.FORGOT_PASSWORD_SUCCESS
            });
        }
        catch (error) {
            console.error('[AuthController.forgotPassword]', error);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: constants_1.CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }
    async resetPassword(req, res) {
        try {
            const { token, password } = req.body;
            await AuthService_1.authService.resetPassword(token, password);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json({
                message: constants_1.CONSTANTS.SUCCESS_MESSAGES.RESET_PASSWORD_SUCCESS
            });
        }
        catch (error) {
            console.error('[AuthController.resetPassword]', error);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({ error: error.message });
        }
    }
    async resendVerification(req, res) {
        try {
            const { email, redirectUrl } = req.body;
            await AuthService_1.authService.resendVerification(email, redirectUrl);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json({
                message: 'Verification link resent successfully.'
            });
        }
        catch (error) {
            console.error('[AuthController.resendVerification]', error);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: constants_1.CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }
    async login(req, res) {
        try {
            const { email, password } = req.body;
            const { user, accessToken, refreshToken } = await AuthService_1.authService.login(email, password);
            this.setRefreshTokenCookie(res, refreshToken);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json({
                message: constants_1.CONSTANTS.SUCCESS_MESSAGES.LOGIN_SUCCESS,
                user: {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                    fullName: user.fullName,
                    cvUrl: user.cvUrl,
                    phoneNumber: user.phoneNumber,
                    nationality: user.nationality,
                    psychometricModule1Passed: user.psychometricModule1Passed,
                    psychometricModule2Passed: user.psychometricModule2Passed
                },
                accessToken
            });
        }
        catch (error) {
            console.error('[AuthController.login]', error);
            if (error.message === constants_1.CONSTANTS.ERROR_MESSAGES.INVALID_CREDENTIALS) {
                res.status(constants_1.CONSTANTS.HTTP_STATUS.UNAUTHORIZED).json({ error: error.message });
                return;
            }
            if (error.message === constants_1.CONSTANTS.ERROR_MESSAGES.EMAIL_NOT_VERIFIED) {
                res.status(constants_1.CONSTANTS.HTTP_STATUS.FORBIDDEN).json({ error: error.message });
                return;
            }
            res.status(constants_1.CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: constants_1.CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }
    async refresh(req, res) {
        try {
            const refreshToken = req.cookies.refreshToken;
            if (!refreshToken) {
                res.status(constants_1.CONSTANTS.HTTP_STATUS.UNAUTHORIZED).json({ error: 'Refresh token missing' });
                return;
            }
            const { accessToken, refreshToken: newRefreshToken } = await AuthService_1.authService.refresh(refreshToken);
            this.setRefreshTokenCookie(res, newRefreshToken);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json({ accessToken });
        }
        catch (error) {
            console.error('[AuthController.refresh]', error);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.UNAUTHORIZED).json({ error: error.message });
        }
    }
    async getMe(req, res) {
        try {
            // req.user is populated by requireAuth middleware
            const userId = req.user.id;
            const user = await AuthService_1.authService.getMe(userId);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json({
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
                    languages: user.languages,
                    psychometricModule1Passed: user.psychometricModule1Passed,
                    psychometricModule2Passed: user.psychometricModule2Passed
                }
            });
        }
        catch (error) {
            console.error('[AuthController.getMe]', error);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: error.message });
        }
    }
    async updateProfile(req, res) {
        try {
            const userId = req.user.id;
            const user = await AuthService_1.authService.updateProfile(userId, req.body);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json({
                message: constants_1.CONSTANTS.SUCCESS_MESSAGES.UPDATED,
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
                    languages: user.languages,
                    psychometricModule1Passed: user.psychometricModule1Passed,
                    psychometricModule2Passed: user.psychometricModule2Passed
                }
            });
        }
        catch (error) {
            console.error('[AuthController.updateProfile]', error);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: constants_1.CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }
    async changePassword(req, res) {
        try {
            const userId = req.user.id;
            const { currentPassword, newPassword } = req.body;
            await AuthService_1.authService.changePassword(userId, currentPassword, newPassword);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json({
                message: 'Passphrase successfully updated.'
            });
        }
        catch (error) {
            console.error('[AuthController.changePassword]', error);
            if (error.message === constants_1.CONSTANTS.ERROR_MESSAGES.INVALID_CREDENTIALS) {
                res.status(constants_1.CONSTANTS.HTTP_STATUS.UNAUTHORIZED).json({ error: 'Verification of current passphrase failed.' });
                return;
            }
            res.status(constants_1.CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: constants_1.CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }
    async logout(req, res) {
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
        });
        res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json({ message: 'Logged out successfully' });
    }
    setRefreshTokenCookie(res, token) {
        res.cookie('refreshToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });
    }
}
exports.AuthController = AuthController;
exports.authController = new AuthController();
