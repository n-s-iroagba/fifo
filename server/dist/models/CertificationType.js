"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CertificationType = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class CertificationType extends sequelize_1.Model {
}
exports.CertificationType = CertificationType;
CertificationType.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    code: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true
    }
}, {
    sequelize: database_1.sequelize,
    modelName: 'CertificationType',
    tableName: 'certification_types',
    timestamps: true,
    underscored: true,
});
