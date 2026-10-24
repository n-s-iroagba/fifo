import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export class Wallet extends Model {
    declare id: number;
    declare address: string;
    declare network: string;
    declare qrCodeUrl: string | null;
    declare isActive: boolean;
    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;
}

Wallet.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    address: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    network: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'USDT TRON (TRC20)',
    },
    qrCodeUrl: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
}, {
    sequelize,
    tableName: 'wallets',
    timestamps: true,
});
