import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';
import { CONSTANTS } from '../constants';

export class Application extends Model {
    declare id: number;
    declare userId: number;
    declare jobId: number;
    declare currentStageId: number | null;
    declare status: string;
    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;

    // Associations
    declare User?: any;
    declare JobListing?: any;
    declare JobStages?: any[];
    declare Payments?: any[];
}

Application.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    jobId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    currentStageId: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    status: {
        type: DataTypes.ENUM(
            CONSTANTS.APPLICATION_STATUSES.DRAFT,
            CONSTANTS.APPLICATION_STATUSES.ACTIVE,
            CONSTANTS.APPLICATION_STATUSES.WITHDRAWN,
            CONSTANTS.APPLICATION_STATUSES.FAILED,
            CONSTANTS.APPLICATION_STATUSES.SUCCEEDED,
            CONSTANTS.APPLICATION_STATUSES.HIRED,
            CONSTANTS.APPLICATION_STATUSES.COMPLETED,
            CONSTANTS.APPLICATION_STATUSES.REJECTED
        ),
        defaultValue: CONSTANTS.APPLICATION_STATUSES.DRAFT,
    },
    isPaid: {
        type: DataTypes.VIRTUAL,
        get() {
            const payments = (this as any).Payments;
            if (!payments || !Array.isArray(payments)) return false;
            return payments.some((p: any) => p.status === CONSTANTS.PAYMENT_STATUSES.VERIFIED);
        }
    }
}, {
    sequelize,
    tableName: 'applications',
    timestamps: true,
});
