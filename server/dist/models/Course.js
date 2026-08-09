"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Course = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class Course extends sequelize_1.Model {
}
exports.Course = Course;
Course.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    title: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    code: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    description: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false
    },
    format: {
        type: sequelize_1.DataTypes.ENUM('Theory', 'Practical', 'Mixed'),
        allowNull: false
    },
    certificationTypeId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: { model: 'certification_types', key: 'id' }
    },
    price: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00
    },
    capacity: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    isPublished: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    sequelize: database_1.sequelize,
    modelName: 'Course',
    tableName: 'courses',
    timestamps: true,
    underscored: true,
});
