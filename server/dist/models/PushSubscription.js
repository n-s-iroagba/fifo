"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PushSubscription = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class PushSubscription extends sequelize_1.Model {
}
exports.PushSubscription = PushSubscription;
PushSubscription.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    userId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    endpoint: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
    p256dh: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    auth: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    }
}, {
    sequelize: database_1.sequelize,
    tableName: 'push_subscriptions',
    timestamps: true,
});
