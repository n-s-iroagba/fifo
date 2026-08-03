"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CourseSubsidy = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class CourseSubsidy extends sequelize_1.Model {
    id;
    userId;
    courseId;
    amount;
    isNotified;
    createdAt;
    updatedAt;
}
exports.CourseSubsidy = CourseSubsidy;
CourseSubsidy.init({
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
    amount: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    isNotified: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    sequelize: database_1.sequelize,
    modelName: 'CourseSubsidy',
    tableName: 'course_subsidies',
    timestamps: true,
    underscored: true,
});
