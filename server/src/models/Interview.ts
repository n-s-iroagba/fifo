import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export class Interview extends Model {
    declare id: number;
    declare scheduleCatalogueId: number | null;
    declare applicantId: number;
    declare overview: string | null;
    declare outcome: 'Pending' | 'Passed' | 'Failed' | 'Completed' | 'Rescheduled';
    declare meetingLink: string | null;
    declare interviewUrl: string | null;
    declare interviewDate: string | null;
    declare interviewTime: string | null;
    declare timezone: string | null;
    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;
}

Interview.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        scheduleCatalogueId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'schedule_catalogues',
                key: 'id',
            },
            onDelete: 'SET NULL',
        },
        applicantId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id',
            },
            onDelete: 'CASCADE',
        },
        interviewDate: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        interviewTime: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        timezone: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: 'AWST (UTC+8)',
        },
        interviewUrl: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        overview: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        outcome: {
            type: DataTypes.ENUM('Pending', 'Passed', 'Failed', 'Completed', 'Rescheduled'),
            defaultValue: 'Pending',
            allowNull: false,
        },
        meetingLink: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: 'interviews',
        timestamps: true,
    }
);
