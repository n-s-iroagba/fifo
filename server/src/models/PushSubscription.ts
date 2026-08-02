import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export class PushSubscription extends Model {
    declare id: number;
    declare userId: number;
    declare endpoint: string;
    declare p256dh: string;
    declare auth: string;
    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;
}

PushSubscription.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    endpoint: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    p256dh: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    auth: {
        type: DataTypes.STRING,
        allowNull: false,
    }
}, {
    sequelize,
    tableName: 'push_subscriptions',
    timestamps: true,
});
