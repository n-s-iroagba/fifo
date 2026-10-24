"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicantQualification = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class ApplicantQualification extends sequelize_1.Model {
}
exports.ApplicantQualification = ApplicantQualification;
ApplicantQualification.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    userId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    qualificationName: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    institution: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    yearCompleted: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    certificateUrl: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    isVerified: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: false,
    },
}, {
    sequelize: database_1.sequelize,
    tableName: 'applicant_qualifications',
    timestamps: true,
});
