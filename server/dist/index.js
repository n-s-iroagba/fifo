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
const runMigration_1 = require("./runMigration");
const PORT = process.env.PORT || 5000;
const startServer = async () => {
    try {
        await (0, database_1.connectDB)();
        await (0, runMigration_1.run)(); // Execute migrations
        // await seedDatabase().catch(err => {
        //     console.error('Failed to seed database:', err);
        //     process.exit(1);
        // });
        if (process.env.NODE_ENV !== 'production') {
            //
            logger_1.logger.info('Database Synchronized successfully.');
        }
        app_1.default.listen(PORT, () => {
            logger_1.logger.info(`Server activated and mapping routes on port ${PORT}`);
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to initialize server processes comprehensively', error);
        process.exit(1);
    }
};
startServer();
