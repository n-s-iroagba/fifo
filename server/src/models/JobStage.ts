import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export class JobStage extends Model {
    declare id: number;
    declare applicationId: number;
    declare name: string;
    declare description: string | null;
    declare orderPosition: number;
    declare requiresPayment: boolean;
    declare amount: number | null;
    declare currency: string;
    declare feeType: string | null;
    declare refundMessage: string | null;
    declare instructions: string | null;
    declare deadlineDays: number | null;
    declare notifyEmail: boolean;
    declare notifyPush: boolean;
    declare isCompleted: boolean;
    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;
}

JobStage.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    applicationId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    orderPosition: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    requiresPayment: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
    },
    currency: {
        type: DataTypes.STRING,
        defaultValue: 'USD',
    },
    feeType: {
        type: DataTypes.STRING,
        defaultValue: 'Free',
    },
    refundMessage: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    instructions: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    deadlineDays: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    notifyEmail: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    notifyPush: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    isCompleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    }
}, {
    sequelize,
    tableName: 'job_stages',
    timestamps: true,
});
