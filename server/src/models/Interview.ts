import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export class Interview extends Model {
    declare id: number;
    declare scheduleCatalogueId: number;
    declare applicantId: number;
    declare overview: string | null;
    declare outcome: 'Pending' | 'Passed' | 'Failed' | 'Completed' | 'Rescheduled';
    declare meetingLink: string | null;
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
            allowNull: false,
            unique: true,
            references: {
                model: 'schedule_catalogues',
                key: 'id',
            },
            onDelete: 'CASCADE',
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
