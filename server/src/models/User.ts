import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';
import { CONSTANTS } from '../constants';

export class User extends Model {
    declare id: number;
    declare fullName: string;
    declare email: string;
    declare passwordHash: string;
    declare role: string;
    declare subsidyPercentage: number | null

    declare isVerified: boolean;
    declare cvUrl: string | null;
    declare verificationToken: string | null;
    declare resetPasswordToken: string | null;
    declare resetPasswordExpires: Date | null;
    declare phoneNumber: string | null;
    declare dateOfBirth: Date | null;
    declare gender: string | null;
    declare nationality: string | null;
    declare address: string | null;
    declare city: string | null;
    declare state: string | null;
    declare country: string | null;
    declare countryOfResidence: string | null;
    declare zipCode: string | null;


    declare candidateNumber: string | null;
    declare walletBalance: number;
    declare bankName: string | null;
    declare accountNumber: string | null;
    declare accountName: string | null;
    declare avelingUsername: string | null;
    declare avelingPassword: string | null;


    declare psychometricModule1Passed: boolean;
    declare psychometricModule2Passed: boolean;
    declare psychometricCompletedAt: Date | null;
    declare depositPaid: boolean;
    declare depositPaidAt: Date | null;
    declare fullBalancePaid: boolean;
    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;
}

User.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    fullName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    passwordHash: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    role: {
        type: DataTypes.ENUM(CONSTANTS.ROLES.ADMIN, CONSTANTS.ROLES.APPLICANT),
        defaultValue: CONSTANTS.ROLES.APPLICANT,
        allowNull: false,
    },
    preferences: {
        type: DataTypes.JSON,
        allowNull: true,
    },
    isVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    cvUrl: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    verificationToken: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    resetPasswordToken: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    resetPasswordExpires: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    phoneNumber: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    dateOfBirth: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    gender: {
        type: DataTypes.ENUM('Male', 'Female', 'Other'),
        allowNull: true,
    },
    nationality: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    address: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    city: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    state: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    country: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    countryOfResidence: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    zipCode: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    isApexMember: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    apexStatus: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    languages: {
        type: DataTypes.JSON,
        allowNull: true,
    },
    candidateNumber: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
    },
    walletBalance: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
        allowNull: false,
    },
    bankName: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    accountNumber: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    accountName: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    avelingUsername: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    avelingPassword: {
        type: DataTypes.STRING,
        allowNull: true,
    },

    // Payment milestone gate (A$500 deposit → tickets 1-3; full balance → ticket 4+)
    depositPaid: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
    },
    depositPaidAt: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    fullBalancePaid: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
    },
    psychometricModule1Passed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
    },
    psychometricModule2Passed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
    },
    psychometricCompletedAt: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    subsidyPercentage: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 70,
        validate: {
            min: 0,
            max: 100
        }
    }
}, {
    sequelize,
    tableName: 'users',
    timestamps: true,
});
