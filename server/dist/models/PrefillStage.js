"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrefillStage = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class PrefillStage extends sequelize_1.Model {
}
exports.PrefillStage = PrefillStage;
PrefillStage.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    type: {
        type: sequelize_1.DataTypes.ENUM('admin_display', 'applicant_display'),
        allowNull: false,
    },
    orderIndex: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    }
}, {
    sequelize: database_1.sequelize,
    tableName: 'prefill_stages',
    timestamps: true,
});
