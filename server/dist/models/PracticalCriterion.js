"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PracticalCriterion = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class PracticalCriterion extends sequelize_1.Model {
    id;
    courseId;
    title;
    description;
    isMandatory;
    createdAt;
    updatedAt;
}
exports.PracticalCriterion = PracticalCriterion;
PracticalCriterion.init({
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
    description: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true
    },
    isMandatory: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    sequelize: database_1.sequelize,
    modelName: 'PracticalCriterion',
    tableName: 'practical_criteria',
    timestamps: true,
    underscored: true,
});
