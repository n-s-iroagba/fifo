"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PracticalSession = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class PracticalSession extends sequelize_1.Model {
    id;
    courseId;
    instructorId;
    startTime;
    endTime;
    capacity;
    createdAt;
    updatedAt;
}
exports.PracticalSession = PracticalSession;
PracticalSession.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    courseId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: { model: 'courses', key: 'id' },
        onDelete: 'CASCADE'
    },
    instructorId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: { model: 'Users', key: 'id' }
    },
    startTime: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false
    },
    endTime: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false
    },
    capacity: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false
    }
}, {
    sequelize: database_1.sequelize,
    modelName: 'PracticalSession',
    tableName: 'practical_sessions',
    timestamps: true,
    underscored: true,
});
