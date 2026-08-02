import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';
import { CONSTANTS } from '../constants';

export class BankAccount extends Model {
    declare id: number;
    declare bankName: string;
    declare accountNumber: string;
    declare accountType: string; // Using CONSTANTS.BANK_ACCOUNT_TYPES
    declare routingCode: string;
    declare currency: string;
    declare isActive: boolean;
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
    },
    accountNumber: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    accountType: {
        type: DataTypes.ENUM(CONSTANTS.BANK_ACCOUNT_TYPES.OPEN_BENEFICIARY, CONSTANTS.BANK_ACCOUNT_TYPES.NORMAL),
        allowNull: false,
    },
    routingCode: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    currency: {
        type: DataTypes.STRING,
        defaultValue: 'USD',
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    }
}, {
    sequelize,
    tableName: 'bank_accounts',
    timestamps: true,
});
