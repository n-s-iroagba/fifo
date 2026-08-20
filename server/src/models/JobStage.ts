import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export class JobStage extends Model {
    declare id: number;
    declare applicationId: number;
    declare prefillStageId: number;
    declare status: 'not started' | 'pending' | 'completed' | 'failed' | 'approved' | 'rejected';
    declare isCurrent: boolean;

    // Associations
    declare Application?: any;
    declare PrefillStage?: any;
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
    prefillStageId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'not started',
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
