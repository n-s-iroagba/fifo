import 'dotenv/config';
import app from './app';
import { connectDB, sequelize } from './config/database';
import { logger } from './utils/logger';

// Initializes Associations Mapping
import './models';
import { seedDatabase } from './seedDatabase';
import { run } from './runMigration';
import { migrateStageManagement } from './migrations/stage_management_migration';
import { migratePaymentMilestone } from './migrations/payment_milestone_migration';
import { migrateAccountingAndSubsidy } from './migrations/accounting_migration';


const PORT = process.env.PORT || 5000;

const startServer = async () => {

    try {
        await connectDB();
        app.listen(PORT, async () => {
            logger.info(`Server activated and mapping routes on port ${PORT}`);

            // Run heavy seeding and migrations in the background so Fly.io health checks don't timeout
            try {
                migrateStageManagement().then(() => {
                    return migratePaymentMilestone();
                }).then(() => {
                    return migrateAccountingAndSubsidy();
                }).then(() => {
                    return seedDatabase();
                }).then(() => {
                    logger.info('Database seeded successfully in background.');
                }).catch(err => {
                    logger.error('Background database initialization error:', err);
                });
                if (process.env.NODE_ENV !== 'production') {
                    logger.info('Database Synchronized successfully.');
                }
            } catch (err) {
                console.error('Failed background database initialization:', err);
            }
        });
    } catch (error) {
        logger.error('Failed to initialize server processes comprehensively', error);
        process.exit(1);
    }
};

startServer();
