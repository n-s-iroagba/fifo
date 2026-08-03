"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlatformSetting = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
// A key-value settings store for platform-wide configuration (e.g. bank account details)
class PlatformSetting extends sequelize_1.Model {
}
exports.PlatformSetting = PlatformSetting;
PlatformSetting.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    key: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    value: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
}, {
    sequelize: database_1.sequelize,
    tableName: 'platform_settings',
    timestamps: true,
    underscored: true,
});
