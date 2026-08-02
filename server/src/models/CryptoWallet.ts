import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { CONSTANTS } from '../constants';

interface CryptoWalletAttributes {
    id: number;
    currencyName: string;
    networkType: string;
    walletAddress: string;
    memoTag?: string;
    isActive: boolean;
    displayLabel: string;
    createdAt?: Date;
    updatedAt?: Date;
}

interface CryptoWalletCreationAttributes extends Optional<CryptoWalletAttributes, 'id'> { }

export class CryptoWallet extends Model<CryptoWalletAttributes, CryptoWalletCreationAttributes> implements CryptoWalletAttributes {
    declare id: number;
    declare currencyName: string;
    declare networkType: string;
    declare walletAddress: string;
    declare memoTag?: string;
    declare isActive: boolean;
    declare displayLabel: string;

    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;
}

CryptoWallet.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        currencyName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        networkType: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        walletAddress: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        memoTag: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
        displayLabel: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    },
    {
        sequelize,
        tableName: 'crypto_wallets',
        timestamps: true,
    }
);
