import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export class Employer extends Model {
    declare id: number;
    declare name: string;
    declare websiteUrl: string;
    declare companyDescription: string;
    declare isEmploying: boolean;
    declare location: string | null;
    declare logoUrl: string | null;
    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;
}

Employer.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    websiteUrl: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    companyDescription: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    isEmploying: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
    },
    location: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    logoUrl: {
        type: DataTypes.STRING,
        allowNull: true,
    },
}, {
    sequelize,
    tableName: 'employers',
    timestamps: true,
});
