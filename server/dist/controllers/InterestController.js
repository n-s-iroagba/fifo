"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.interestController = exports.InterestController = void 0;
const InterestService_1 = require("../services/InterestService");
const constants_1 = require("../constants");
const email_1 = require("../utils/email");
const User_1 = require("../models/User");
const ApplicationService_1 = require("../services/ApplicationService");
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
            // Notify Candidate
            const user = await User_1.User.findByPk(userId);
            if (user) {
                await (0, email_1.sendInfoEmail)(user.email, 'Expression of Interest Received', `
                    <p>Dear ${user.fullName},</p>
                    <p>We have successfully received your Expression of Interest.</p>
                    <p>Our team will review your profile against upcoming vacancies and contact you when a suitable role becomes available.</p>
                    `).catch(err => console.error('[InterestController] Candidate notification failed:', err));
            }
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
    async approveInterest(req, res) {
        try {
            const interestId = parseInt(req.params.id, 10);
            const { jobId } = req.body;
            if (!jobId) {
                res.status(constants_1.CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({ error: 'jobId is required for approval' });
                return;
            }
            // Get interest to find userId
            const interests = await InterestService_1.interestService.getAllInterests(); // Note: might be better to have getById
            const interest = interests.find((i) => i.id === interestId);
            if (!interest) {
                res.status(constants_1.CONSTANTS.HTTP_STATUS.NOT_FOUND).json({ error: 'Interest not found' });
                return;
            }
            const userId = interest.userId;
            // Create Application via applicationService.startApplication
            const application = await ApplicationService_1.applicationService.startApplication(userId, jobId, []);
            // Send Vacancy Available Email
            const user = await User_1.User.findByPk(userId);
            if (user) {
                await (0, email_1.sendInfoEmail)(user.email, 'Vacancy Available - Application Created', `
                    <p>Dear ${user.fullName},</p>
                    <p>Based on your Expression of Interest, we have found a matching vacancy for you and have automatically created an application on your behalf.</p>
                    <p>Please log in to your dashboard to review the application and proceed with the next steps.</p>
                    `).catch(err => console.error('[InterestController] Vacancy available email failed:', err));
            }
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json({ message: 'Interest approved and application created successfully', application });
        }
        catch (error) {
            console.error('[InterestController.approveInterest]', error);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: constants_1.CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }
}
exports.InterestController = InterestController;
exports.interestController = new InterestController();
