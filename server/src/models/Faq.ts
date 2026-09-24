import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export type FaqType = 'process' | 'payment';

export class Faq extends Model {
    declare id: number;
    declare type: FaqType;
    declare link: string;
    declare title: string | null;
    declare description: string | null;
    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;
}

Faq.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        type: {
            type: DataTypes.STRING(20),
            allowNull: false,
            unique: true,
            validate: {
                isIn: {
                    args: [['process', 'payment']],
                    msg: "Type must be either 'process' or 'payment'",
                },
            },
        },
        link: {
            type: DataTypes.TEXT,
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: 'Link cannot be empty',
                },
            },
        },
        title: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: 'faqs',
        timestamps: true,
        indexes: [
            {
                unique: true,
                fields: ['type'],
                name: 'unique_faq_type',
            },
        ],
    }
);
