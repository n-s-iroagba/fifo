import { sequelize } from '../config/database';
import { DataTypes } from 'sequelize';
import { PrefillStage } from '../models/PrefillStage';

export async function migrateStageManagement() {
    try {
        console.log('[Migration] Starting Stage Management Migration...');

        // 1. Create or sync prefill_stages table without altering existing data
        await PrefillStage.sync();
        console.log('[Migration] prefill_stages table synchronized safely.');

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
