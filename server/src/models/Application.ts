import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';


export class Application extends Model {
    declare id: number;
    declare userId: number;
    declare jobId: number;
    declare currentStageId: number | null;
    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;
    declare status: string;
    declare visaSponsorshipStatus: string | null;
    declare isCronPaused: boolean;
    declare pausedStageCrons: string[] | null;
    declare sponsorshipCallEmailSent: boolean;
    declare sponsorshipCallEmailSentAt: Date | null;
    declare sponsorshipId: string | null;

    // Associations
    declare User?: any;
    declare JobListing?: any;
    declare JobStages?: any[];
}

Application.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    currentStageId: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    jobId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'Active'
    },
    visaSponsorshipStatus: {
        type: DataTypes.ENUM('Pending', 'Approved', 'Rejected'),
        allowNull: true,
        defaultValue: null
    },
    isCronPaused: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    pausedStageCrons: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: []
    },
    sponsorshipCallEmailSent: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    sponsorshipCallEmailSentAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    sponsorshipId: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    sequelize,
    tableName: 'applications',
    timestamps: true,
});
