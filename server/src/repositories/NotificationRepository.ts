import { Transaction } from 'sequelize';
import { Notification } from '../models';

export class NotificationRepository {
    // Maps to TRUST-008 (User checking notifications)
    public async findByUserId(userId: number, transaction?: Transaction): Promise<Notification[]> {
        return Notification.findAll({
            where: { userId },
            order: [['createdAt', 'DESC']],
            transaction
        });
    }

    // Maps to TRUST-008, STK-ADM-APP-004
    public async create(data: any, transaction?: Transaction): Promise<Notification> {
        return Notification.create(data, { transaction });
    }

    public async markAsRead(id: number, transaction?: Transaction): Promise<[number]> {
        return Notification.update({ isRead: true }, { where: { id }, transaction });
    }

    public async markAllAsRead(userId: number, transaction?: Transaction): Promise<[number]> {
        return Notification.update({ isRead: true }, { where: { userId, isRead: false }, transaction });
    }
}

export const notificationRepository = new NotificationRepository();
