import { Notification } from '../models';
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
        // Push notifications decommissioned
        return;
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
