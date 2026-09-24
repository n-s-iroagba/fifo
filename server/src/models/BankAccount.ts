import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';
import { CONSTANTS } from '../constants';

export class BankAccount extends Model {
    declare id: number;
    declare bankName: string;        // Bank / Institution Name
    declare accountNumber: string;   // Account / Reference Number
    declare accountName: string;     // Legal / account holder name
    declare accountHolderName: string; // Display name for high-value notices
    declare accountType: string;
    declare routingCode: string;     // Routing / Swift / BSB code
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
        comment: 'Bank / Institution Name',
    },
    accountNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Account / Reference number',
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
        defaultValue: null,
        comment: 'Routing / Swift / BSB code',
    },
    currency: {
        type: DataTypes.STRING,
        defaultValue: 'AUD',
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
