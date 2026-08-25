"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const axios_1 = __importDefault(require("axios"));
dotenv_1.default.config();
const QSTASH_TOKEN = process.env.QSTASH_TOKEN;
const QSTASH_URL = process.env.QSTASH_URL || 'https://qstash.upstash.io';
const API_URL = process.env.PRODUCTION_URL || 'https://blue-collar.fly.dev'; // User needs to set this or we can extract from config
const crons = [
    { name: 'application', schedule: '0 * * * *', endpoint: '/api/cron/application' }, // Every hour
    { name: 'nomination', schedule: '0 * * * *', endpoint: '/api/cron/nomination' }, // Every hour
    { name: 'contract', schedule: '0 * * * *', endpoint: '/api/cron/contract' }, // Every hour
    { name: 'sponsorship', schedule: '0 * * * *', endpoint: '/api/cron/sponsorship' } // Every hour
];
async function registerCrons() {
    if (!QSTASH_TOKEN) {
        console.error('QSTASH_TOKEN is missing from .env');
        process.exit(1);
    }
    // In production, you would run this script with PRODUCTION_URL=https://your-app.fly.dev
    if (API_URL === 'https://your-production-domain.com') {
        console.warn('WARNING: PRODUCTION_URL is not set. Using fallback dummy URL.');
        console.warn('Run with: PRODUCTION_URL=https://your-api.com npx ts-node scripts/register-qstash-crons.ts');
    }
    try {
        console.log('Fetching existing QStash schedules...');
        // We use the REST API to manage schedules
        // https://upstash.com/docs/qstash/api/schedules/list
        const listResponse = await axios_1.default.get(`https://qstash.upstash.io/v2/schedules`, {
            headers: { Authorization: `Bearer ${QSTASH_TOKEN}` }
        });
        const existingSchedules = listResponse.data;
        console.log(`Found ${existingSchedules.length} existing schedules. Clearing them...`);
        for (const schedule of existingSchedules) {
            await axios_1.default.delete(`https://qstash.upstash.io/v2/schedules/${schedule.scheduleId}`, {
                headers: { Authorization: `Bearer ${QSTASH_TOKEN}` }
            });
            console.log(`Deleted schedule: ${schedule.scheduleId}`);
        }
        console.log('\nRegistering new schedules...');
        for (const cron of crons) {
            const destinationUrl = `${API_URL}${cron.endpoint}`;
            const response = await axios_1.default.post(`https://qstash.upstash.io/v2/schedules/${destinationUrl}`, {}, {
                headers: {
                    Authorization: `Bearer ${QSTASH_TOKEN}`,
                    'Upstash-Cron': cron.schedule,
                    'Content-Type': 'application/json'
                }
            });
            console.log(`Registered [${cron.name}] at ${cron.schedule} -> ${destinationUrl}`);
            console.log(`Schedule ID: ${response.data.scheduleId}\n`);
        }
        console.log('All QStash crons successfully registered for production!');
    }
    catch (error) {
        console.error('Failed to register QStash schedules:', error.response?.data || error.message);
        process.exit(1);
    }
}
exports.default = registerCrons;
