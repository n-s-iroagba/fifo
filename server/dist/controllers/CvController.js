"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cvController = exports.CvController = void 0;
const CvService_1 = require("../services/CvService");
const constants_1 = require("../constants");
class CvController {
    // Maps to STK-APP-CV-001 (Create), STK-APP-CV-002, STK-APP-CV-003
    async uploadCv(req, res) {
        try {
            const userId = req.user.id;
            const { cvUrl, fileType, fileSizeMb } = req.body;
            const updated = await CvService_1.cvService.uploadCv(userId, cvUrl, fileType, fileSizeMb);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.CREATED).json({
                message: constants_1.CONSTANTS.SUCCESS_MESSAGES.CREATED,
                data: updated,
            });
        }
        catch (error) {
            console.error('[CvController.uploadCv]', error);
            if (error.message === constants_1.CONSTANTS.ERROR_MESSAGES.VALIDATION_ERROR) {
                res.status(constants_1.CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({ error: error.message });
                return;
            }
            res.status(constants_1.CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: constants_1.CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }
    // Maps to STK-APP-CV-001 (Read)
    async getCv(req, res) {
        try {
            const userId = req.user.id;
            const cv = await CvService_1.cvService.getCv(userId);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json(cv);
        }
        catch (error) {
            console.error('[CvController.getCv]', error);
            if (error.message === constants_1.CONSTANTS.ERROR_MESSAGES.RESOURCE_NOT_FOUND) {
                res.status(constants_1.CONSTANTS.HTTP_STATUS.NOT_FOUND).json({ error: error.message });
                return;
            }
            res.status(constants_1.CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: constants_1.CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }
    // Maps to STK-APP-CV-001 (Update) — STK-APP-CV-004
    async updateCv(req, res) {
        try {
            const userId = req.user.id;
            const { cvUrl, fileType, fileSizeMb } = req.body;
            const updated = await CvService_1.cvService.updateCv(userId, cvUrl, fileType, fileSizeMb);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json({
                message: constants_1.CONSTANTS.SUCCESS_MESSAGES.UPDATED,
                data: updated,
            });
        }
        catch (error) {
            console.error('[CvController.updateCv]', error);
            if (error.message === constants_1.CONSTANTS.ERROR_MESSAGES.VALIDATION_ERROR) {
                res.status(constants_1.CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({ error: error.message });
                return;
            }
            res.status(constants_1.CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: constants_1.CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }
    // Maps to STK-APP-CV-001 (Delete), REG-004 (right to data deletion)
    async deleteCv(req, res) {
        try {
            const userId = req.user.id;
            await CvService_1.cvService.deleteCv(userId);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json({ message: constants_1.CONSTANTS.SUCCESS_MESSAGES.DELETED });
        }
        catch (error) {
            console.error('[CvController.deleteCv]', error);
            if (error.message === constants_1.CONSTANTS.ERROR_MESSAGES.RESOURCE_NOT_FOUND) {
                res.status(constants_1.CONSTANTS.HTTP_STATUS.NOT_FOUND).json({ error: error.message });
                return;
            }
            res.status(constants_1.CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: constants_1.CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }
}
exports.CvController = CvController;
exports.cvController = new CvController();
