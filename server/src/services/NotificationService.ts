import { Notification, PushSubscription } from '../models';
import { notificationRepository } from '../repositories/NotificationRepository';
import webpush from 'web-push';

export class NotificationService {
    constructor() {
        if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
            webpush.setVapidDetails(
                'mailto:BlueCollar@gmail.com',
                process.env.VAPID_PUBLIC_KEY,
                process.env.VAPID_PRIVATE_KEY
            );
        }
    }

    // Maps to TRUST-008
    public async getUserNotifications(userId: number) {
        if (!userId) return [];
        return notificationRepository.findByUserId(userId);
    }

    // Maps to TRUST-008, STK-ADM-APP-004
    public async sendNotification(userId: number, subject: string, message: string, type: string = 'SYSTEM') {
        if (!userId) return null;
        const notification = await notificationRepository.create({
            userId,
            subject,
            message,
            type
        });

        // Trigger Push Notification
        this.triggerPushNotification(userId, subject, message).catch(err =>
            console.error('[NotificationService.triggerPushNotification]', err)
        );

        return notification;
    }

    private async triggerPushNotification(userId: number, title: string, body: string) {
        if (!userId) return;
        const subscriptions = await PushSubscription.findAll({ where: { userId } });

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
            return webpush.sendNotification(pushSub, payload).catch(err => {
                if (err.statusCode === 410 || err.statusCode === 404) {
                    // Subscription has expired or is no longer valid
                    return sub.destroy();
                }
                throw err;
            });
        }));
    }

    public async savePushSubscription(userId: number, subscription: any) {
        if (!userId) return null;
        // Avoid duplicate endpoints for the same user
        const existing = await PushSubscription.findOne({
            where: {
                userId,
                endpoint: subscription.endpoint
            }
        });

        if (existing) return existing;

        return PushSubscription.create({
            userId,
            endpoint: subscription.endpoint,
            p256dh: subscription.keys.p256dh,
            auth: subscription.keys.auth
        });
    }

    public async markAsRead(id: number) {
        await notificationRepository.markAsRead(id);
        return Notification.findByPk(id);
    }

    public async markAllAsRead(userId: number) {
        if (!userId) return [0];
        return notificationRepository.markAllAsRead(userId);
    }
}

export const notificationService = new NotificationService();
