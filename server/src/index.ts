import 'dotenv/config';
import app from './app';
import { connectDB, sequelize } from './config/database';
import { logger } from './utils/logger';

// Initializes Associations Mapping
import './models';
import { seedDatabase } from './seedDatabase';
import { run } from './runMigration';




const PORT = process.env.PORT || 5000;

const startServer = async () => {

    try {
        await connectDB();
        await run(); // Execute migrations
        // await seedDatabase().catch(err => {
        //     console.error('Failed to seed database:', err);
        //     process.exit(1);
        // });

        if (process.env.NODE_ENV !== 'production') {
            //
            logger.info('Database Synchronized successfully.');
        }

        app.listen(PORT, () => {
            logger.info(`Server activated and mapping routes on port ${PORT}`);
        });
    } catch (error) {
        logger.error('Failed to initialize server processes comprehensively', error);
        process.exit(1);
    }
};

startServer();
