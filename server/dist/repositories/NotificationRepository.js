"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationRepository = exports.NotificationRepository = void 0;
const models_1 = require("../models");
class NotificationRepository {
    // Maps to TRUST-008 (User checking notifications)
    async findByUserId(userId, transaction) {
        return models_1.Notification.findAll({
            where: { userId },
            order: [['createdAt', 'DESC']],
            transaction
        });
    }
    // Maps to TRUST-008, STK-ADM-APP-004
    async create(data, transaction) {
        return models_1.Notification.create(data, { transaction });
    }
    async markAsRead(id, transaction) {
        return models_1.Notification.update({ isRead: true }, { where: { id }, transaction });
    }
    async markAllAsRead(userId, transaction) {
        return models_1.Notification.update({ isRead: true }, { where: { userId, isRead: false }, transaction });
    }
}
exports.NotificationRepository = NotificationRepository;
exports.notificationRepository = new NotificationRepository();
