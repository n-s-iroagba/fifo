import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';
import { CONSTANTS } from '../constants';

dotenv.config({ path: path.join(__dirname, '../../.env') });

export const connectDB = async (): Promise<void> => {
    await sequelize.authenticate();
};

const dbHost = process.env.DB_HOST || '127.0.0.1';
const dbPort = parseInt(process.env.DB_PORT || '5432', 10);
const dbUser = process.env.DB_USER || 'testuser';
const dbPassword = process.env.DB_PASSWORD || 'testpassword';
const dbName = process.env.DB_NAME || 'job_agency_db';

export const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
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
