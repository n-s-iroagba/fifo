"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LmsCredential = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class LmsCredential extends sequelize_1.Model {
    id;
    userId;
    lmsUsername;
    passwordHash;
    isActive;
    createdAt;
    updatedAt;
}
exports.LmsCredential = LmsCredential;
LmsCredential.init({
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
    lmsUsername: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    passwordHash: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    isActive: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    sequelize: database_1.sequelize,
    modelName: 'LmsCredential',
    tableName: 'lms_credentials',
    timestamps: true,
    underscored: true,
});
