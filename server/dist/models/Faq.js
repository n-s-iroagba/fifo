"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Faq = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class Faq extends sequelize_1.Model {
}
exports.Faq = Faq;
Faq.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    type: {
        type: sequelize_1.DataTypes.STRING(20),
        allowNull: false,
        unique: true,
        validate: {
            isIn: {
                args: [['process', 'payment']],
                msg: "Type must be either 'process' or 'payment'",
            },
        },
    },
    link: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'Link cannot be empty',
            },
        },
    },
    title: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    description: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
}, {
    sequelize: database_1.sequelize,
    tableName: 'faqs',
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['type'],
            name: 'unique_faq_type',
        },
    ],
});
