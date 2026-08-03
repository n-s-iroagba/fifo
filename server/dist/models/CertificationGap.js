"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CertificationGap = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class CertificationGap extends sequelize_1.Model {
    id;
    userId;
    certificationTypeId;
    status;
    assignedByAdminId;
    createdAt;
    updatedAt;
}
exports.CertificationGap = CertificationGap;
CertificationGap.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    userId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE'
    },
    certificationTypeId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: { model: 'certification_types', key: 'id' },
        onDelete: 'CASCADE'
    },
    status: {
        type: sequelize_1.DataTypes.ENUM('Missing', 'Expired', 'Valid'),
        allowNull: false,
        defaultValue: 'Missing'
    },
    assignedByAdminId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' }
    }
}, {
    sequelize: database_1.sequelize,
    modelName: 'CertificationGap',
    tableName: 'certification_gaps',
    timestamps: true,
    underscored: true,
});
