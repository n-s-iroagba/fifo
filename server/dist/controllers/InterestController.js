"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.interestController = exports.InterestController = void 0;
const InterestService_1 = require("../services/InterestService");
const constants_1 = require("../constants");
const email_1 = require("../utils/email");
class InterestController {
    async createInterest(req, res) {
        try {
            const userId = req.user.id;
            const interest = await InterestService_1.interestService.createInterest(userId, req.body);
            // Notify Admin of Expression of Interest
            await (0, email_1.sendInfoEmail)('BlueCollar@gmail.com', 'New Expression of Interest Received', `
                <p>A new professional has expressed interest in the Apex Network audit.</p>
                <div style="background-color: #f8fafc; padding: 25px; border-radius: 12px; border: 1px solid #eef2f6;">
                    <p><strong>User ID:</strong> ${userId}</p>
                    <p><strong>Roles:</strong> ${req.body.roles?.join(', ')}</p>
                </div>
                `).catch(err => console.error('[InterestController] Admin notification failed:', err));
            res.status(constants_1.CONSTANTS.HTTP_STATUS.CREATED).json(interest);
        }
        catch (error) {
            console.error('[InterestController.createInterest]', error);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: constants_1.CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }
    async getUserInterest(req, res) {
        try {
            const userId = req.user.id;
            const interest = await InterestService_1.interestService.getUserInterest(userId);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json(interest);
        }
        catch (error) {
            console.error('[InterestController.getUserInterest]', error);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: constants_1.CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }
    async getAllInterests(req, res) {
        try {
            const interests = await InterestService_1.interestService.getAllInterests();
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json(interests);
        }
        catch (error) {
            console.error('[InterestController.getAllInterests]', error);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: constants_1.CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }
    async updateInterest(req, res) {
        try {
            const userId = req.user.id;
            const interest = await InterestService_1.interestService.updateInterest(userId, req.body);
            if (!interest) {
                res.status(constants_1.CONSTANTS.HTTP_STATUS.NOT_FOUND).json({ error: constants_1.CONSTANTS.ERROR_MESSAGES.RESOURCE_NOT_FOUND });
                return;
            }
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json(interest);
        }
        catch (error) {
            console.error('[InterestController.updateInterest]', error);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: constants_1.CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }
    async deleteInterest(req, res) {
        try {
            const id = parseInt(req.params.id, 10);
            await InterestService_1.interestService.deleteInterest(id);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json({ message: constants_1.CONSTANTS.SUCCESS_MESSAGES.DELETED });
        }
        catch (error) {
            console.error('[InterestController.deleteInterest]', error);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: constants_1.CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }
}
exports.InterestController = InterestController;
exports.interestController = new InterestController();
