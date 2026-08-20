import { sequelize } from '../config/database';
import { DataTypes } from 'sequelize';
import { PrefillStage } from '../models/PrefillStage';
import { JobStage } from '../models/JobStage';
import { Application } from '../models/Application';

export async function migrateStageManagement() {
    try {
        console.log('[Migration] Starting Stage Management Migration...');

        // 1. Create or sync prefill_stages table and alter it to add missing columns (e.g. adminDisplay)
        await PrefillStage.sync({ alter: true });
        console.log('[Migration] prefill_stages table synchronized safely with alter:true.');
        
        // Recreate job_stages with the new schema (prefillStageId instead of hardcoded strings)
        await JobStage.sync({ force: true });
        console.log('[Migration] job_stages table recreated with new schema.');

        // Clean up legacy incorrect stages that conflict with the document
        const validApplicantStages = ['Application', 'Nomination', 'TicketSponsorship', 'Contract'];
        const Op = require('sequelize').Op;
        await PrefillStage.destroy({
            where: {
                type: 'applicant_display',
                name: { [Op.notIn]: validApplicantStages }
            }
        });
        console.log('[Migration] Cleaned up legacy incorrect applicant_display stages.');

        // Seed default PrefillStages for applicant flow in order
        const applicantStages = [
            { name: 'Application', type: 'applicant_display', orderIndex: 1 },
            { name: 'Nomination', type: 'applicant_display', orderIndex: 2 },
            { name: 'TicketSponsorship', type: 'applicant_display', orderIndex: 3 },
            { name: 'Contract', type: 'applicant_display', orderIndex: 4 }
        ];

        let defaultStage: any = null;
        for (const stageData of applicantStages) {
            const [stage] = await PrefillStage.findOrCreate({
                where: { name: stageData.name, type: stageData.type },
                defaults: { orderIndex: stageData.orderIndex }
            });
            if (stageData.name === 'Application') {
                defaultStage = stage;
            } else {
                // Ensure the orderIndex is perfectly aligned
                if (stage.orderIndex !== stageData.orderIndex) {
                    await stage.update({ orderIndex: stageData.orderIndex });
                }
            }
        }
        
        // Seed default JobStage for all applications
        const applications = await Application.findAll();
        let seededCount = 0;
        for (const app of applications) {
            const [stage, created] = await JobStage.findOrCreate({
                where: { applicationId: app.id, prefillStageId: defaultStage.id },
                defaults: { status: 'Not Started', isCurrent: true }
            });
            if (created) seededCount++;
        }
        console.log(`[Migration] Seeded default JobStage for ${seededCount} applications.`);

        // 2. Add adminStageId to users table if it does not exist
        const queryInterface = sequelize.getQueryInterface();
        const tableDescription: any = await queryInterface.describeTable('users');

        if (!tableDescription.adminStageId) {
            await queryInterface.addColumn('users', 'adminStageId', {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: {
                    model: 'prefill_stages',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL'
            });
            console.log('[Migration] Added adminStageId to users table.');
        } else {
            console.log('[Migration] adminStageId already exists on users table.');
        }

        console.log('[Migration] Stage Management Migration completed successfully.');
    } catch (error: any) {
        console.error('[Migration] Error in migrateStageManagement:', error.message);
    }
}
