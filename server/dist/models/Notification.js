"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Notification = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class Notification extends sequelize_1.Model {
}
exports.Notification = Notification;
Notification.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    userId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    subject: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    message: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
    isRead: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: false,
    },
    type: {
        type: sequelize_1.DataTypes.STRING,
        defaultValue: 'SYSTEM',
    },
    title: {
        type: sequelize_1.DataTypes.VIRTUAL,
        get() {
            return this.getDataValue('subject');
        },
        set(value) {
            this.setDataValue('subject', value);
        }
    },
    body: {
        type: sequelize_1.DataTypes.VIRTUAL,
        get() {
            return this.getDataValue('message');
        },
        set(value) {
            this.setDataValue('message', value);
        }
    }
}, {
    sequelize: database_1.sequelize,
    tableName: 'notifications',
    timestamps: true,
    hooks: {
        beforeValidate: (notification) => {
            if (!notification.subject && notification.title) {
                notification.subject = notification.title;
            }
            if (!notification.message && notification.body) {
                notification.message = notification.body;
            }
        }
    }
});
