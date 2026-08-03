"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketCatalog = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class TicketCatalog extends sequelize_1.Model {
}
exports.TicketCatalog = TicketCatalog;
TicketCatalog.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    normalPrice: {
        type: sequelize_1.DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
    },
    sponsorshipPrice: {
        type: sequelize_1.DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
    },
    description: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    }
}, {
    sequelize: database_1.sequelize,
    tableName: 'ticket_catalogs',
    timestamps: true,
});
