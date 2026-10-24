import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export class Experience extends Model {
    declare id: number;
    declare userId: number;
    declare companyName: string;
    declare jobTitle: string;
    declare startDate: string | null;
    declare endDate: string | null;
    declare isCurrent: boolean;
    declare responsibilities: string | null;
    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;
}

Experience.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    companyName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    jobTitle: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    startDate: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    endDate: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    isCurrent: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    responsibilities: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
}, {
    sequelize,
    tableName: 'experiences',
    timestamps: true,
});
