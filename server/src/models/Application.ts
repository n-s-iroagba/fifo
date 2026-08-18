import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';
import { CONSTANTS } from '../constants';

export class Application extends Model {
    declare id: number;
    declare userId: number;
    declare jobId: number;

    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;
    declare visaSponsorshipStatus: string | null;

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
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    jobId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },

    visaSponsorshipStatus: {
        type: DataTypes.ENUM('Pending', 'Approved', 'Rejected'),
        allowNull: true,
        defaultValue: null
    }
}, {
    sequelize,
    tableName: 'applications',
    timestamps: true,
});
