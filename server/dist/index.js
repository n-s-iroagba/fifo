"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const app_1 = __importDefault(require("./app"));
const database_1 = require("./config/database");
const logger_1 = require("./utils/logger");
// Initializes Associations Mapping
require("./models");
const register_qstash_crons_1 = __importDefault(require("./scripts/register-qstash-crons"));
const PORT = process.env.PORT || 5000;
const startServer = async () => {
    try {
        await (0, database_1.connectDB)();
        app_1.default.listen(PORT, async () => {
            logger_1.logger.info(`Server activated and mapping routes on port ${PORT}`);
            // Run heavy seeding and migrations in the background so Fly.io health checks don't timeout
            (async () => {
                try {
                    await (0, register_qstash_crons_1.default)();
                    logger_1.logger.info('QStash endpoints are ready for background jobs.');
                    logger_1.logger.info('Database seeded successfully in background.');
                }
                catch (err) {
                    logger_1.logger.error('Background database initialization error:', err);
                }
            })();
            if (process.env.NODE_ENV !== 'production') {
                logger_1.logger.info('Database Synchronized successfully.');
            }
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to initialize server processes comprehensively', error);
        process.exit(1);
    }
};
startServer();
