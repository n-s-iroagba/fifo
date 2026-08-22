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
const seedDatabase_1 = require("./seedDatabase");
const stage_management_migration_1 = require("./migrations/stage_management_migration");
const payment_milestone_migration_1 = require("./migrations/payment_milestone_migration");
const accounting_migration_1 = require("./migrations/accounting_migration");
const nominationCron_1 = require("./cron/nominationCron");
const applicationCron_1 = require("./cron/applicationCron");
const sponsorshipCron_1 = require("./cron/sponsorshipCron");
const contractCron_1 = require("./cron/contractCron");
const PORT = process.env.PORT || 5000;
const startServer = async () => {
    try {
        await (0, database_1.connectDB)();
        app_1.default.listen(PORT, async () => {
            logger_1.logger.info(`Server activated and mapping routes on port ${PORT}`);
            // Run heavy seeding and migrations in the background so Fly.io health checks don't timeout
            (0, stage_management_migration_1.migrateStageManagement)().then(() => {
                return (0, payment_milestone_migration_1.migratePaymentMilestone)();
            }).then(() => {
                return (0, accounting_migration_1.migrateAccountingAndSubsidy)();
            }).then(() => {
                return (0, seedDatabase_1.seedDatabase)();
            }).then(() => {
                logger_1.logger.info('Database seeded successfully in background.');
                // Start cron jobs AFTER seed completes so PrefillStage records exist
                (0, nominationCron_1.startNominationCron)();
                (0, applicationCron_1.startApplicationCron)();
                (0, sponsorshipCron_1.startSponsorshipCron)();
                (0, contractCron_1.startContractCron)();
                logger_1.logger.info('All background cron jobs started.');
            }).catch(err => {
                logger_1.logger.error('Background database initialization error:', err);
            });
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
