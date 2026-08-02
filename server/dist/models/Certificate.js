"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Certificate = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class Certificate extends sequelize_1.Model {
    id;
    userId;
    certificationTypeId;
    issueDate;
    expiryDate;
    createdAt;
    updatedAt;
}
exports.Certificate = Certificate;
Certificate.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    userId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: { model: 'Users', key: 'id' },
        onDelete: 'CASCADE'
    },
    certificationTypeId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: { model: 'certification_types', key: 'id' },
        onDelete: 'CASCADE'
    },
    issueDate: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false
    },
    expiryDate: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true
    }
}, {
    sequelize: database_1.sequelize,
    modelName: 'Certificate',
    tableName: 'certificates',
    timestamps: true,
    underscored: true,
});
