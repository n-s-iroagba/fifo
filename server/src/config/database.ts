import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';
import { CONSTANTS } from '../constants';

dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.join(__dirname, '../../.env') });
dotenv.config({ path: path.join(__dirname, '../.env') });

export const connectDB = async (): Promise<void> => {
    await sequelize.authenticate();
};

let dbHost = process.env.DB_HOST || '127.0.0.1';
let dbPort = parseInt(process.env.DB_PORT || '3306', 10);
let dbUser = process.env.DB_USER || 'testuser';
let dbPassword = process.env.DB_PASSWORD || 'testpassword';
let dbName = process.env.DB_NAME || 'job_agency_db';
let useSSL = process.env.DB_SSL === 'true' || process.env.NODE_ENV === 'production';

const rawUrl = process.env.DATABASE_URL || process.env.MYSQL_URL;
if (rawUrl) {
    try {
        const parsed = new URL(rawUrl);
        dbHost = parsed.hostname;
        dbPort = parseInt(parsed.port || '3306', 10);
        dbUser = decodeURIComponent(parsed.username);
        dbPassword = decodeURIComponent(parsed.password);
        dbName = parsed.pathname.replace(/^\//, '');
        if (rawUrl.includes('ssl-mode=REQUIRED') || rawUrl.includes('ssl=true') || dbHost.includes('aivencloud.com')) {
            useSSL = true;
        }
    } catch (e) {
        console.error('Failed to parse DATABASE_URL, falling back to individual env variables', e);
    }
} else if (dbHost.includes('aivencloud.com')) {
    useSSL = true;
}

export const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
    host: dbHost,
    port: dbPort,
    dialect: 'mysql',
    logging: false, // Set to console.log in development if debugging is needed
    dialectOptions: useSSL ? {
        ssl: {
            rejectUnauthorized: false
        },
        connectTimeout: 60000
    } : {
        connectTimeout: 60000
    },
    pool: {
        max: 30, // Scale up to 30 based on 80-user concurrent scenario in StRS 6.2
        min: 0,
        acquire: 60000,
        idle: 10000
    }
});
