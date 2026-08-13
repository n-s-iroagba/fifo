import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';
import { User } from './User';

export class PsychometricAttempt extends Model {
    declare id: number;
    declare userId: number;
    declare module: 'module_1' | 'module_2';
    declare score: number;
    declare passed: boolean;
    declare answers: object;
    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;
}

PsychometricAttempt.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        },
        onDelete: 'CASCADE'
    },
    module: {
        type: DataTypes.ENUM('module_1', 'module_2'),
        allowNull: false,
    },
    score: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    passed: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
    },
    answers: {
        type: DataTypes.JSON,
        allowNull: true,
    }
}, {
    sequelize,
    tableName: 'psychometric_attempts',
    timestamps: true,
});
