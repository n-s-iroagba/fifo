"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScheduleCatalogue = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class ScheduleCatalogue extends sequelize_1.Model {
}
exports.ScheduleCatalogue = ScheduleCatalogue;
ScheduleCatalogue.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    date: {
        type: sequelize_1.DataTypes.DATEONLY,
        allowNull: false,
    },
    time: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    isBooked: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
    },
}, {
    sequelize: database_1.sequelize,
    tableName: 'schedule_catalogues',
    timestamps: true,
});
