import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export class ScheduleCatalogue extends Model {
    declare id: number;
    declare date: string;
    declare time: string;
    declare isBooked: boolean;
    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;
}

ScheduleCatalogue.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        date: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
        time: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        isBooked: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false,
        },
    },
    {
        sequelize,
        tableName: 'schedule_catalogues',
        timestamps: true,
    }
);
