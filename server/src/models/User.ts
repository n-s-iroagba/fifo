import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';
import { CONSTANTS } from '../constants';

export class User extends Model {
    declare id: number;
    declare fullName: string;
    declare email: string;
    declare passwordHash: string;
    declare role: string;
    declare preferences: object;
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
    declare isApexMember: boolean;
    declare apexStatus: string | null; // 'PENDING', 'APPROVED', 'INVITED'
    declare candidateNumber: string | null;
    declare walletBalance: number;
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
    }
}, {
    sequelize,
    tableName: 'users',
    timestamps: true,
});
