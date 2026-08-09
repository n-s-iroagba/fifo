"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CourseModule = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class CourseModule extends sequelize_1.Model {
}
exports.CourseModule = CourseModule;
CourseModule.init({
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
    title: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    contentType: {
        type: sequelize_1.DataTypes.ENUM('VIDEO', 'DOCUMENT', 'TEXT'),
        allowNull: false
    },
    contentUrl: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    content: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true
    },
    durationMinutes: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 30
    },
    sequenceOrder: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false
    }
}, {
    sequelize: database_1.sequelize,
    modelName: 'CourseModule',
    tableName: 'course_modules',
    timestamps: true,
    underscored: true,
});
