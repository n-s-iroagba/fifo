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
    }
}, {
    sequelize,
    tableName: 'notifications',
    timestamps: true,
});
