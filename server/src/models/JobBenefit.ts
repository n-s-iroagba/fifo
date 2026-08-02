import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export class JobBenefit extends Model {
    declare id: number;
    declare benefitType: string;
    declare description: string;
    declare value: string | null;
    declare categoryId: number | null;
    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;
}

JobBenefit.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    benefitType: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    value: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    categoryId: {
        type: DataTypes.INTEGER,
        allowNull: true,
    }
}, {
    sequelize,
    tableName: 'job_benefits',
    timestamps: true,
});
