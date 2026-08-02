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
            web_push_1.default.setVapidDetails('mailto:BlueCollarRecruitment@gmail.com', process.env.VAPID_PUBLIC_KEY, process.env.VAPID_PRIVATE_KEY);
        }
    }
    // Maps to TRUST-008
    async getUserNotifications(userId) {
        return NotificationRepository_1.notificationRepository.findByUserId(userId);
    }
    // Maps to TRUST-008, STK-ADM-APP-004
    async sendNotification(userId, subject, message, type = 'SYSTEM') {
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
        const subscriptions = await models_1.PushSubscription.findAll({ where: { userId } });
        const payload = JSON.stringify({
            title,
            body,
            icon: '/icon-192x192.png',
            badge: '/icon-192x192.png',
            data: {
                url: '/dashboard/notifications'
            }
        });
        await Promise.all(subscriptions.map(sub => {
            const pushSub = {
                endpoint: sub.endpoint,
                keys: {
                    p256dh: sub.p256dh,
                    auth: sub.auth
                }
            };
            return web_push_1.default.sendNotification(pushSub, payload).catch(err => {
                if (err.statusCode === 410 || err.statusCode === 404) {
                    // Subscription has expired or is no longer valid
                    return sub.destroy();
                }
                throw err;
            });
        }));
    }
    async savePushSubscription(userId, subscription) {
        // Avoid duplicate endpoints for the same user
        const existing = await models_1.PushSubscription.findOne({
            where: {
                userId,
                endpoint: subscription.endpoint
            }
        });
        if (existing)
            return existing;
        return models_1.PushSubscription.create({
            userId,
            endpoint: subscription.endpoint,
            p256dh: subscription.keys.p256dh,
            auth: subscription.keys.auth
        });
    }
    async markAsRead(id) {
        await NotificationRepository_1.notificationRepository.markAsRead(id);
        return models_1.Notification.findByPk(id);
    }
    async markAllAsRead(userId) {
        return NotificationRepository_1.notificationRepository.markAllAsRead(userId);
    }
}
exports.NotificationService = NotificationService;
exports.notificationService = new NotificationService();
