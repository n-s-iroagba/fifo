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

// QStash Webhooks (must be before express.json() so verifySignature can access raw body)
import { Receiver } from '@upstash/qstash';
import { cronController } from './controllers/CronController';

const receiver = new Receiver({
    currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY || '',
    nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY || '',
});

const qstashMiddleware = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const signature = req.headers['upstash-signature'];
    if (!signature || typeof signature !== 'string') {
        return res.status(401).json({ error: 'Missing or invalid signature header' });
    }

    try {
        const body = req.body instanceof Buffer ? req.body.toString('utf8') : req.body;
        await receiver.verify({
            signature,
            body: typeof body === 'string' ? body : JSON.stringify(body)
        });
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid signature' });
    }
};

app.post('/api/cron/application', express.raw({type: 'application/json'}), qstashMiddleware, cronController.application);
app.post('/api/cron/nomination', express.raw({type: 'application/json'}), qstashMiddleware, cronController.nomination);
app.post('/api/cron/contract', express.raw({type: 'application/json'}), qstashMiddleware, cronController.contract);
app.post('/api/cron/sponsorship', express.raw({type: 'application/json'}), qstashMiddleware, cronController.sponsorship);
app.post('/api/cron/aveling', express.raw({type: 'application/json'}), qstashMiddleware, cronController.aveling);
app.post('/api/cron/psychometric', express.raw({type: 'application/json'}), qstashMiddleware, cronController.psychometric);


app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve uploaded documents
app.use('/uploads', express.static(require('path').join(__dirname, '../public/uploads')));
app.use('/uploads', express.static(require('path').join(__dirname, '../uploads')));


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
