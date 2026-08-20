"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.migrateStageManagement = migrateStageManagement;
const database_1 = require("../config/database");
const sequelize_1 = require("sequelize");
const PrefillStage_1 = require("../models/PrefillStage");
const JobStage_1 = require("../models/JobStage");
const Application_1 = require("../models/Application");
async function migrateStageManagement() {
    try {
        console.log('[Migration] Starting Stage Management Migration...');
        // 1. Create or sync prefill_stages table without altering existing data
        await PrefillStage_1.PrefillStage.sync();
        console.log('[Migration] prefill_stages table synchronized safely.');
        // Recreate job_stages with the new schema (prefillStageId instead of hardcoded strings)
        await JobStage_1.JobStage.sync({ force: true });
        console.log('[Migration] job_stages table recreated with new schema.');
        // Create default PrefillStage
        const [defaultStage] = await PrefillStage_1.PrefillStage.findOrCreate({
            where: { name: 'Application', type: 'applicant_display' },
            defaults: { orderIndex: 1 }
        });
        // Seed default JobStage for all applications
        const applications = await Application_1.Application.findAll();
        let seededCount = 0;
        for (const app of applications) {
            const [stage, created] = await JobStage_1.JobStage.findOrCreate({
                where: { applicationId: app.id, prefillStageId: defaultStage.id },
                defaults: { status: 'not started', isCurrent: true }
            });
            if (created)
                seededCount++;
        }
        console.log(`[Migration] Seeded default JobStage for ${seededCount} applications.`);
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
