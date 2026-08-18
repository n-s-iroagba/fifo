"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationService = exports.NotificationService = void 0;
const models_1 = require("../models");
const NotificationRepository_1 = require("../repositories/NotificationRepository");
const web_push_1 = __importDefault(require("web-push"));
class NotificationService {
    constructor() {
        if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
            web_push_1.default.setVapidDetails('mailto:BlueCollar@gmail.com', process.env.VAPID_PUBLIC_KEY, process.env.VAPID_PRIVATE_KEY);
        }
    }
    // Maps to TRUST-008
    async getUserNotifications(userId) {
        if (!userId)
            return [];
        return NotificationRepository_1.notificationRepository.findByUserId(userId);
    }
    // Maps to TRUST-008, STK-ADM-APP-004
    async sendNotification(userId, subject, message, type = 'SYSTEM') {
        if (!userId)
            return null;
        const notification = await NotificationRepository_1.notificationRepository.create({
            userId,
            subject,
            message,
            type
        });
        // Trigger Push Notification
        this.triggerPushNotification(userId, subject, message).catch(err => console.error('[NotificationService.triggerPushNotification]', err));
        return notification;
    }
    async triggerPushNotification(userId, title, body) {
        // Push notifications decommissioned
        return;
    }
    async markAsRead(id) {
        await NotificationRepository_1.notificationRepository.markAsRead(id);
        return models_1.Notification.findByPk(id);
    }
    async markAllAsRead(userId) {
        if (!userId)
            return [0];
        return NotificationRepository_1.notificationRepository.markAllAsRead(userId);
    }
}
exports.NotificationService = NotificationService;
exports.notificationService = new NotificationService();
