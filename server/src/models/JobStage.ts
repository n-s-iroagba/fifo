import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export class JobStage extends Model {
    declare id: number;
    declare applicationId: number;
    declare name: string;
    declare status: string;
    declare isCurrent: boolean;

    // Associations
    declare Application?: any;
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
