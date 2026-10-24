import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export class Notification extends Model {
    declare id: number;
    declare userId: number;
    declare subject: string;
    declare message: string;
    declare isRead: boolean;
    declare type: string; // e.g.EMAIL, PUSH
    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;
}

Notification.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    subject: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    isRead: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    type: {
        type: DataTypes.STRING,
        defaultValue: 'SYSTEM',
    },
    title: {
        type: DataTypes.VIRTUAL,
        get() {
            return this.getDataValue('subject');
        },
        set(value: string) {
            this.setDataValue('subject', value);
        }
    },
    body: {
        type: DataTypes.VIRTUAL,
        get() {
            return this.getDataValue('message');
        },
        set(value: string) {
            this.setDataValue('message', value);
        }
    }
}, {
    sequelize,
    tableName: 'notifications',
    timestamps: true,
    hooks: {
        beforeValidate: (notification: any) => {
            if (!notification.subject && notification.title) {
                notification.subject = notification.title;
            }
            if (!notification.message && notification.body) {
                notification.message = notification.body;
            }
        }
    }
});
