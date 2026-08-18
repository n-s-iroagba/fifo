"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationController = exports.NotificationController = void 0;
const NotificationService_1 = require("../services/NotificationService");
const constants_1 = require("../constants");
class NotificationController {
    // Maps to TRUST-008
    async getUserNotifications(req, res) {
        try {
            const userId = req.user.id;
            const notifications = await NotificationService_1.notificationService.getUserNotifications(userId);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json({
                rows: notifications,
                count: notifications.length
            });
        }
        catch (error) {
            console.error('[NotificationController.getUserNotifications]', error);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: constants_1.CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }
    async markAsRead(req, res) {
        try {
            const id = parseInt(req.params.id, 10);
            const notification = await NotificationService_1.notificationService.markAsRead(id);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json({ success: true, data: notification });
        }
        catch (error) {
            console.error('[NotificationController.markAsRead]', error);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: constants_1.CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }
    async markAllRead(req, res) {
        try {
            const userId = req.user.id;
            await NotificationService_1.notificationService.markAllAsRead(userId);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json({ success: true });
        }
        catch (error) {
            console.error('[NotificationController.markAllRead]', error);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: constants_1.CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }
}
exports.NotificationController = NotificationController;
exports.notificationController = new NotificationController();
