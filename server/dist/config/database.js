"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sequelize = exports.connectDB = void 0;
const sequelize_1 = require("sequelize");
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.join(__dirname, '../../.env') });
const connectDB = async () => {
    await exports.sequelize.authenticate();
};
exports.connectDB = connectDB;
const dbHost = process.env.DB_HOST || '127.0.0.1';
const dbPort = parseInt(process.env.DB_PORT || '5432', 10);
const dbUser = process.env.DB_USER || 'testuser';
const dbPassword = process.env.DB_PASSWORD || 'testpassword';
const dbName = process.env.DB_NAME || 'job_agency_db';
exports.sequelize = new sequelize_1.Sequelize(dbName, dbUser, dbPassword, {
    host: dbHost,
    port: dbPort,
    dialect: 'mysql',
    logging: false, // Set to console.log in development if debugging is needed
    pool: {
        max: 30, // Scale up to 30 based on 80-user concurrent scenario in StRS 6.2
        min: 10,
        acquire: 10000,
        idle: 30000
    }
});
