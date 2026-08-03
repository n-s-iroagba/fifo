"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Enrollment = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class Enrollment extends sequelize_1.Model {
    id;
    userId;
    courseId;
    status;
    paymentStatus;
    theoryProgress;
    createdAt;
    updatedAt;
}
exports.Enrollment = Enrollment;
Enrollment.init({
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
    courseId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: { model: 'courses', key: 'id' },
        onDelete: 'CASCADE'
    },
    status: {
        type: sequelize_1.DataTypes.ENUM('Pending', 'Active', 'Review-Awaiting', 'Completed', 'Failed'),
        allowNull: false,
        defaultValue: 'Pending'
    },
    paymentStatus: {
        type: sequelize_1.DataTypes.ENUM('Unpaid', 'Paid'),
        allowNull: false,
        defaultValue: 'Unpaid'
    },
    theoryProgress: {
        type: sequelize_1.DataTypes.INTEGER,
        defaultValue: 0
    }
}, {
    sequelize: database_1.sequelize,
    modelName: 'Enrollment',
    tableName: 'enrollments',
    timestamps: true,
    underscored: true,
});
