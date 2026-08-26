import 'dotenv/config';
import app from './app';
import { connectDB, sequelize } from './config/database';
import { logger } from './utils/logger';

// Initializes Associations Mapping
import './models';
import registerCrons from './scripts/register-qstash-crons';








const PORT = process.env.PORT || 5000;

const startServer = async () => {

    try {
        await connectDB();
        app.listen(PORT, async () => {
            logger.info(`Server activated and mapping routes on port ${PORT}`);

            // Run heavy seeding and migrations in the background so Fly.io health checks don't timeout
            (async () => {
                try {


                    await registerCrons()
                    logger.info('QStash endpoints are ready for background jobs.');

                    logger.info('Database seeded successfully in background.');
                } catch (err) {
                    logger.error('Background database initialization error:', err);
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
