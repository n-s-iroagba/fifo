import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import apiRoutes from './routes/apiRoutes';
import { errorHandler } from './middleware/errorHandler';
import { getCronStatus } from './cron/cronRegistry';

const app = express();

// Set 'trust proxy' to correctly identify users behind Fly.io's proxy
app.set('trust proxy', 1);

// Security and utility middlewares
app.use(helmet());
const envOrigins = process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : [];
const defaultOrigins = ['http://localhost:3000', 'https://aveling.online', 'https://www.bluecollarrecruitment.co', 'https://bluecollarrecruitment.co', 'https://www.aveling.online', 'https://aveling.online'];

const allowedOrigins = Array.from(new Set([...envOrigins, ...defaultOrigins]))
    .map((o) => o.trim())
    .filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        // Allow server-to-server requests (no origin) and whitelisted origins
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error(`CORS policy: origin ${origin} is not allowed.`));
        }
    },
    credentials: true,
}));
app.use(cookieParser());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Health check endpoint for infrastructure monitoring
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP', timestamp: new Date().toISOString() });
});

// Cron health: verify all background jobs are running and have executed
app.get('/health/crons', (req, res) => {
    const jobs = getCronStatus();
    const allHealthy = jobs.length > 0 && jobs.every(j => j.lastStatus !== 'error');
    res.status(allHealthy ? 200 : 503).json({
        status: allHealthy ? 'OK' : 'DEGRADED',
        timestamp: new Date().toISOString(),
        jobs
    });
});

// Routing API mappings
app.use('/api', apiRoutes);

// Global Error Handler mapped at bottom of stack
app.use(errorHandler);

export default app;
