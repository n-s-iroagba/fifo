import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';
import { CONSTANTS } from '../constants';

export class Payment extends Model {
    declare id: number;
    declare applicationId: number;
    declare stageId: number;
    declare status: string;
    declare amount: number;
    declare currency: string;
    declare proofUrl: string | null;
    declare adminNote: string | null;
    declare verifiedById: number | null;
    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;
}

Payment.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    applicationId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    stageId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM(
            CONSTANTS.PAYMENT_STATUSES.PENDING,
            CONSTANTS.PAYMENT_STATUSES.VERIFIED,
            CONSTANTS.PAYMENT_STATUSES.REJECTED,
            CONSTANTS.PAYMENT_STATUSES.PAID,
            CONSTANTS.PAYMENT_STATUSES.UNPAID
        ),
        defaultValue: CONSTANTS.PAYMENT_STATUSES.UNPAID,
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    currency: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    proofUrl: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    adminNote: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    verifiedById: {
        type: DataTypes.INTEGER,
        allowNull: true,
    }
}, {
    sequelize,
    tableName: 'payments',
    timestamps: true,
});
