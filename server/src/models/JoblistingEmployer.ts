import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export class JoblistingEmployer extends Model {
    declare id: number;
    declare employerId: number;
    declare joblistingId: number;
    declare vacancyUrl: string | null;
    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;
}

JoblistingEmployer.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    employerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    joblistingId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    vacancyUrl: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null,
    },
}, {
    sequelize,
    tableName: 'joblisting_employers',
    timestamps: true,
});
