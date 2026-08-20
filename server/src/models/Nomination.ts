import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';
import { Application } from './Application';

export class Nomination extends Model {
    declare id: number;
    declare applicationId: number;
    declare tradeStream: string;
    declare hostEmployer: string;
    declare vacancies: string;
    declare competitors: string;
    declare isSelected: boolean;
    declare documentUrl: string | null;
    declare adminDocumentUrl: string | null;
    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;

    declare Application?: Application;
}

Nomination.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    applicationId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    tradeStream: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    hostEmployer: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    vacancies: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    competitors: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    isSelected: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
    },
    documentUrl: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    adminDocumentUrl: {
        type: DataTypes.STRING,
        allowNull: true,
    }
}, {
    sequelize,
    tableName: 'nominations',
    timestamps: true,
});
