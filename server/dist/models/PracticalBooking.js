"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PracticalBooking = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class PracticalBooking extends sequelize_1.Model {
}
exports.PracticalBooking = PracticalBooking;
PracticalBooking.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    sessionId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: { model: 'practical_sessions', key: 'id' },
        onDelete: 'CASCADE'
    },
    userId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE'
    },
    attendanceStatus: {
        type: sequelize_1.DataTypes.ENUM('Booked', 'Attended', 'NoShow'),
        defaultValue: 'Booked'
    },
    passStatus: {
        type: sequelize_1.DataTypes.ENUM('Pending', 'Pass', 'Fail'),
        defaultValue: 'Pending'
    }
}, {
    sequelize: database_1.sequelize,
    modelName: 'PracticalBooking',
    tableName: 'practical_bookings',
    timestamps: true,
    underscored: true,
});
