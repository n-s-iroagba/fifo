"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.migrateStageManagement = migrateStageManagement;
const database_1 = require("../config/database");
const sequelize_1 = require("sequelize");
const PrefillStage_1 = __importDefault(require("../models/PrefillStage"));
async function migrateStageManagement() {
    try {
        console.log('[Migration] Starting Stage Management Migration...');
        // 1. Create or sync prefill_stages table without altering existing data
        await PrefillStage_1.default.sync();
        console.log('[Migration] prefill_stages table synchronized safely.');
        // 2. Add adminStageId to users table if it does not exist
        const queryInterface = database_1.sequelize.getQueryInterface();
        const tableDescription = await queryInterface.describeTable('users');
        if (!tableDescription.adminStageId) {
            await queryInterface.addColumn('users', 'adminStageId', {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: true,
                references: {
                    model: 'prefill_stages',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL'
            });
            console.log('[Migration] Added adminStageId to users table.');
        }
        else {
            console.log('[Migration] adminStageId already exists on users table.');
        }
        console.log('[Migration] Stage Management Migration completed successfully.');
    }
    catch (error) {
        console.error('[Migration] Error in migrateStageManagement:', error.message);
    }
}
