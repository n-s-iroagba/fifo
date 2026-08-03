import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import apiRoutes from './routes/apiRoutes';
import { errorHandler } from './middleware/errorHandler';

const app = express();

// Set 'trust proxy' to correctly identify users behind Fly.io's proxy
app.set('trust proxy', 1);

// Security and utility middlewares
app.use(helmet());
const envOrigins = process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : [];
const defaultOrigins = ['http://localhost:3000', 'http://localhost:3002', 'https://bluecollarrecruitment.co', 'https://aveling.co'];

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
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint for infrastructure monitoring
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP', timestamp: new Date().toISOString() });
});

// Routing API mappings
app.use('/api', apiRoutes);

// Global Error Handler mapped at bottom of stack
app.use(errorHandler);

export default app;
