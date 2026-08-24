import 'dotenv/config';
import app from './app';
import { connectDB, sequelize } from './config/database';
import { logger } from './utils/logger';

// Initializes Associations Mapping
import './models';
import { seedDatabase } from './seedDatabase';
import { run } from './runMigration';

import { migratePaymentMilestone } from './migrations/payment_milestone_migration';
import { migrateAccountingAndSubsidy } from './migrations/accounting_migration';
import { migrateCourseFormatEnum } from './migrations/course_format_migration';
import { startNominationCron } from './cron/nominationCron';
import { startApplicationCron } from './cron/applicationCron';
import { startSponsorshipCron } from './cron/sponsorshipCron';
import { startContractCron } from './cron/contractCron';


const PORT = process.env.PORT || 5000;

const startServer = async () => {

    try {
        await connectDB();
        app.listen(PORT, async () => {
            logger.info(`Server activated and mapping routes on port ${PORT}`);

            // Run heavy seeding and migrations in the background so Fly.io health checks don't timeout
            (async () => {
                try {
                    await migratePaymentMilestone();
                    await migrateAccountingAndSubsidy();
                    await migrateCourseFormatEnum();
                    await seedDatabase();
                    logger.info('Database seeded successfully in background.');
                } catch (err) {
                    logger.error('Background database initialization error:', err);
                } finally {
                    startNominationCron();
                    startApplicationCron();
                    startSponsorshipCron();
                    startContractCron();
                    logger.info('All background cron jobs started.');
                }
            })();

            if (process.env.NODE_ENV !== 'production') {
                logger.info('Database Synchronized successfully.');
            }
        });
    } catch (error) {
        logger.error('Failed to initialize server processes comprehensively', error);
        process.exit(1);
    }
};

startServer();
