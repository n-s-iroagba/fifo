"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lmsAuthController = exports.LmsAuthController = void 0;
const LmsAuthService_1 = require("../services/LmsAuthService");
const constants_1 = require("../constants");
const zod_1 = require("zod");
class LmsAuthController {
    // STEP-030: GET /api/lms-credentials/applicants/:applicantId
    async getLmsCredentialsStatus(req, res, next) {
        try {
            const { applicantId } = req.params;
            if (!applicantId) {
                return res.status(constants_1.CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
                    code: 400,
                    message: constants_1.CONSTANTS.ERROR_MESSAGES.VALIDATION_ERROR
                });
            }
            const data = await LmsAuthService_1.LmsAuthService.getLmsCredentialsStatus(applicantId);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json({
                success: true,
                data
            });
        }
        catch (error) {
            next(error);
        }
    }
    // STEP-030: POST /api/lms-credentials/generate
    async generateCredentials(req, res, next) {
        try {
            const schema = zod_1.z.object({
                applicantId: zod_1.z.string().or(zod_1.z.number())
            });
            const validation = schema.safeParse(req.body);
            if (!validation.success) {
                return res.status(constants_1.CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
                    code: 400,
                    message: constants_1.CONSTANTS.ERROR_MESSAGES.VALIDATION_ERROR
                });
            }
            const data = await LmsAuthService_1.LmsAuthService.generateCredentials(validation.data.applicantId);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json({
                success: true,
                data
            });
        }
        catch (error) {
            if (error.message === 'APPLICANT_NOT_FOUND') {
                // error-063
                return res.status(constants_1.CONSTANTS.HTTP_STATUS.NOT_FOUND).json({
                    code: 404,
                    message: 'Applicant not found.'
                });
            }
            if (error.message === 'CREDENTIALS_EXIST') {
                // error-064
                return res.status(constants_1.CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
                    code: 409,
                    message: 'Applicant already has LMS credentials.'
                });
            }
            next(error);
        }
    }
    // STEP-031: POST /api/lms-auth/login
    async login(req, res, next) {
        try {
            const schema = zod_1.z.object({
                lmsUsername: zod_1.z.string(),
                password: zod_1.z.string()
            });
            const validation = schema.safeParse(req.body);
            if (!validation.success) {
                return res.status(constants_1.CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
                    code: 400,
                    message: constants_1.CONSTANTS.ERROR_MESSAGES.VALIDATION_ERROR
                });
            }
            const data = await LmsAuthService_1.LmsAuthService.login(validation.data.lmsUsername, validation.data.password);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json({
                success: true,
                data
            });
        }
        catch (error) {
            if (error.message === 'INVALID_CREDENTIALS') {
                // error-065
                return res.status(constants_1.CONSTANTS.HTTP_STATUS.UNAUTHORIZED).json({
                    code: 401,
                    message: 'Invalid LMS username or password.'
                });
            }
            next(error);
        }
    }
}
exports.LmsAuthController = LmsAuthController;
exports.lmsAuthController = new LmsAuthController();
