"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
const constants_1 = require("../constants");
class User extends sequelize_1.Model {
}
exports.User = User;
User.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    fullName: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    passwordHash: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    role: {
        type: sequelize_1.DataTypes.ENUM(constants_1.CONSTANTS.ROLES.ADMIN, constants_1.CONSTANTS.ROLES.APPLICANT),
        defaultValue: constants_1.CONSTANTS.ROLES.APPLICANT,
        allowNull: false,
    },
    preferences: {
        type: sequelize_1.DataTypes.JSON,
        allowNull: true,
    },
    isVerified: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: false,
    },
    cvUrl: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    verificationToken: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    resetPasswordToken: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    resetPasswordExpires: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    phoneNumber: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    dateOfBirth: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    gender: {
        type: sequelize_1.DataTypes.ENUM('Male', 'Female', 'Other'),
        allowNull: true,
    },
    nationality: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    address: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    city: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    state: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    country: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    countryOfResidence: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    zipCode: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    isApexMember: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: false,
    },
    apexStatus: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    languages: {
        type: sequelize_1.DataTypes.JSON,
        allowNull: true,
    },
    candidateNumber: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
        unique: true,
    },
    walletBalance: {
        type: sequelize_1.DataTypes.FLOAT,
        defaultValue: 0,
        allowNull: false,
    }
}, {
    sequelize: database_1.sequelize,
    tableName: 'users',
    timestamps: true,
});
