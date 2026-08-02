import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export class Interest extends Model {
    declare id: number;
    declare userId: number;
    declare roles: string[];
    declare skills: string[];
    declare qualifications: string[];
    declare experience: any[];
    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;
}

Interest.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    roles: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: [],
    },
    skills: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: [],
    },
    qualifications: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: [],
    },
    experience: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: [],
    }
}, {
    sequelize,
    tableName: 'interests',
    timestamps: true,
});
