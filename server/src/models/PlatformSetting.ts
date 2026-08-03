import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

// A key-value settings store for platform-wide configuration (e.g. bank account details)
export class PlatformSetting extends Model {
    declare id: number;
    declare key: string;
    declare value: string | null;
    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;
}

PlatformSetting.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    key: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    value: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
}, {
    sequelize,
    tableName: 'platform_settings',
    timestamps: true,
    underscored: true,
});
