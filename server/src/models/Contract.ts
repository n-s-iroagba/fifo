import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';
import { Application } from './Application';
import { User } from './User';

export class Contract extends Model {
    declare id: number;
    declare applicationId: number;
    declare userId: number;
    declare company: string;
    declare role: string;
    declare status: 'pending' | 'accepted' | 'rejected';
    declare documentUrl: string | null;
    declare adminDocumentUrl: string | null;
    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;

    declare Application?: Application;
    declare User?: User;
}

Contract.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    applicationId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    company: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    role: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('pending', 'accepted', 'rejected'),
        defaultValue: 'pending',
        allowNull: false,
    },
    documentUrl: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    adminDocumentUrl: {
        type: DataTypes.STRING,
        allowNull: true,
    }
}, {
    sequelize,
    tableName: 'contracts',
    timestamps: true,
});
