"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../config/database");
const sequelize_1 = require("sequelize");
async function patch() {
    try {
        const queryInterface = database_1.sequelize.getQueryInterface();
        await queryInterface.addColumn('contracts', 'documentUrl1', {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true
        });
        console.log('Added documentUrl1');
    }
    catch (e) {
        console.log('documentUrl1 already exists or error:', e);
    }
    try {
        const queryInterface = database_1.sequelize.getQueryInterface();
        await queryInterface.addColumn('contracts', 'documentUrl15', {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true
        });
    }
    catch (e) {
        console.log('documentUrl15 already exists or error:', e);
    }
    process.exit(0);
}
patch();
