import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export class ApplicantQualification extends Model {
    declare id: number;
    declare userId: number;
    declare qualificationName: string;
    declare institution: string | null;
    declare yearCompleted: string | null;
    declare certificateUrl: string | null;
    declare isVerified: boolean;
    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;
}

ApplicantQualification.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    qualificationName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    institution: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    yearCompleted: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    certificateUrl: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    isVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
}, {
    sequelize,
    tableName: 'applicant_qualifications',
    timestamps: true,
});
