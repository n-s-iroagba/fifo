"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Interest = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class Interest extends sequelize_1.Model {
}
exports.Interest = Interest;
Interest.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    userId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    roles: {
        type: sequelize_1.DataTypes.JSON,
        allowNull: false,
        defaultValue: [],
    },
    skills: {
        type: sequelize_1.DataTypes.JSON,
        allowNull: false,
        defaultValue: [],
    },
    qualifications: {
        type: sequelize_1.DataTypes.JSON,
        allowNull: false,
        defaultValue: [],
    },
    experience: {
        type: sequelize_1.DataTypes.JSON,
        allowNull: false,
        defaultValue: [],
    }
}, {
    sequelize: database_1.sequelize,
    tableName: 'interests',
    timestamps: true,
});
