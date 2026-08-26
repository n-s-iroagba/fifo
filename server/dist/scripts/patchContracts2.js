"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.patch = patch;
const database_1 = require("../config/database");
const sequelize_1 = require("sequelize");
async function patch() {
    try {
        const queryInterface = database_1.sequelize.getQueryInterface();
        await queryInterface.addColumn('contracts', 'avelingWelcomeSent', {
            type: sequelize_1.DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false
        });
        console.log('Added avelingWelcomeSent');
    }
    catch (e) {
        console.log('avelingWelcomeSent error:', e.message);
    }
    process.exit(0);
}
