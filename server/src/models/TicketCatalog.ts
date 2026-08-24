import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export class TicketCatalog extends Model {
    declare id: number;
    declare name: string;
    declare normalPrice: number;
    declare description: string;
    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;
}

TicketCatalog.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    normalPrice: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    }
}, {
    sequelize,
    tableName: 'ticket_catalogs',
    timestamps: true,
});
