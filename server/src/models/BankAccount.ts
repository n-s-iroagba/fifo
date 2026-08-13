import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';
import { CONSTANTS } from '../constants';

export class BankAccount extends Model {
    declare id: number;
    declare bankName: string;        // Wallet Nickname
    declare accountNumber: string;   // USDT Wallet Address (TRC-20)
    declare accountName: string;     // Legal / account holder name
    declare accountHolderName: string; // Display name for high-value notices
    declare accountType: string;
    declare routingCode: string;     // Reserved for network label (TRC-20)
    declare currency: string;
    declare isActive: boolean;
    declare isDefault: boolean;
    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;
}

BankAccount.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    bankName: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Wallet nickname (e.g. Corporate Binance)',
    },
    accountNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'USDT TRC-20 wallet address',
    },
    accountName: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Legal entity / account holder name',
    },
    accountHolderName: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Display name shown on high-value payment notices',
    },
    accountType: {
        type: DataTypes.ENUM(CONSTANTS.BANK_ACCOUNT_TYPES.OPEN_BENEFICIARY, CONSTANTS.BANK_ACCOUNT_TYPES.NORMAL),
        allowNull: false,
        defaultValue: CONSTANTS.BANK_ACCOUNT_TYPES.NORMAL,
    },
    routingCode: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'TRC-20',
        comment: 'Network label — always TRC-20 for USDT',
    },
    currency: {
        type: DataTypes.STRING,
        defaultValue: 'USDT',
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    isDefault: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
}, {
    sequelize,
    tableName: 'bank_accounts',
    timestamps: true,
});
