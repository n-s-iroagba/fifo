"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../config/database");
async function up() {
    const t = await database_1.sequelize.transaction();
    try {
        console.log('Removing prefillStageId from job_stages...');
        // Remove foreign key if exists
        try {
            await database_1.sequelize.query('ALTER TABLE `job_stages` DROP FOREIGN KEY `job_stages_ibfk_1`;', { transaction: t });
            await database_1.sequelize.query('ALTER TABLE `job_stages` DROP FOREIGN KEY `job_stages_ibfk_2`;', { transaction: t });
            await database_1.sequelize.query('ALTER TABLE `job_stages` DROP FOREIGN KEY `job_stages_prefillStageId_foreign_idx`;', { transaction: t });
        }
        catch (e) { }
        // Add name column if it doesn't exist
        try {
            await database_1.sequelize.query('ALTER TABLE `job_stages` ADD COLUMN `name` VARCHAR(255) NOT NULL DEFAULT "Application";', { transaction: t });
        }
        catch (e) { }
        // Drop prefillStageId column
        try {
            await database_1.sequelize.query('ALTER TABLE `job_stages` DROP COLUMN `prefillStageId`;', { transaction: t });
        }
        catch (e) { }
        console.log('Removing adminStageId from users...');
        try {
            await database_1.sequelize.query('ALTER TABLE `users` DROP FOREIGN KEY `users_ibfk_1`;', { transaction: t });
            await database_1.sequelize.query('ALTER TABLE `users` DROP COLUMN `adminStageId`;', { transaction: t });
        }
        catch (e) { }
        console.log('Dropping prefill_stages table...');
        await database_1.sequelize.query('DROP TABLE IF EXISTS `prefill_stages`;', { transaction: t });
        await t.commit();
        console.log('Migration successful.');
    }
    catch (error) {
        await t.rollback();
        console.error('Migration failed:', error);
    }
}
up().then(() => process.exit(0));
