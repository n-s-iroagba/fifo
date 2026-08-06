import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export class PrefillStage extends Model {
    declare id: number;
    declare name: string;
    declare type: 'admin_display' | 'applicant_display';
    declare orderIndex: number;
    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;
}

PrefillStage.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    type: {
        type: DataTypes.ENUM('admin_display', 'applicant_display'),
        allowNull: false,
    },
    orderIndex: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    }
}, {
    sequelize,
    tableName: 'prefill_stages',
    timestamps: true,
});
