"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const apiRoutes_1 = __importDefault(require("./routes/apiRoutes"));
const errorHandler_1 = require("./middleware/errorHandler");
const cronRegistry_1 = require("./cron/cronRegistry");
const app = (0, express_1.default)();
// Set 'trust proxy' to correctly identify users behind Fly.io's proxy
app.set('trust proxy', 1);
// Security and utility middlewares
app.use((0, helmet_1.default)());
const envOrigins = process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : [];
const defaultOrigins = ['http://localhost:3000', 'https://aveling.online', 'https://www.bluecollarrecruitment.co', 'https://bluecollarrecruitment.co', 'https://www.aveling.online', 'https://aveling.online'];
const allowedOrigins = Array.from(new Set([...envOrigins, ...defaultOrigins]))
    .map((o) => o.trim())
    .filter(Boolean);
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Allow server-to-server requests (no origin) and whitelisted origins
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error(`CORS policy: origin ${origin} is not allowed.`));
        }
    },
    credentials: true,
}));
app.use((0, cookie_parser_1.default)());
// QStash Webhooks (must be before express.json() so verifySignature can access raw body)
const qstash_1 = require("@upstash/qstash");
const CronController_1 = require("./controllers/CronController");
const receiver = new qstash_1.Receiver({
    currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY || '',
    nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY || '',
});
const qstashMiddleware = async (req, res, next) => {
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
    }
    catch (error) {
        return res.status(401).json({ error: 'Invalid signature' });
    }
};
app.post('/api/cron/application', express_1.default.raw({ type: 'application/json' }), qstashMiddleware, CronController_1.cronController.application);
app.post('/api/cron/nomination', express_1.default.raw({ type: 'application/json' }), qstashMiddleware, CronController_1.cronController.nomination);
app.post('/api/cron/contract', express_1.default.raw({ type: 'application/json' }), qstashMiddleware, CronController_1.cronController.contract);
app.post('/api/cron/sponsorship', express_1.default.raw({ type: 'application/json' }), qstashMiddleware, CronController_1.cronController.sponsorship);
app.use(express_1.default.json({ limit: '50mb' }));
app.use(express_1.default.urlencoded({ limit: '50mb', extended: true }));
// Serve uploaded documents
app.use('/uploads', express_1.default.static(require('path').join(__dirname, '../public/uploads')));
app.use('/uploads', express_1.default.static(require('path').join(__dirname, '../uploads')));
// Health check endpoint for infrastructure monitoring
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP', timestamp: new Date().toISOString() });
});
// Cron health: verify all background jobs are running and have executed
app.get('/health/crons', (req, res) => {
    const jobs = (0, cronRegistry_1.getCronStatus)();
    const allHealthy = jobs.length > 0 && jobs.every(j => j.lastStatus !== 'error');
    res.status(allHealthy ? 200 : 503).json({
        status: allHealthy ? 'OK' : 'DEGRADED',
        timestamp: new Date().toISOString(),
        jobs
    });
});
// Routing API mappings
app.use('/api', apiRoutes_1.default);
// Global Error Handler mapped at bottom of stack
app.use(errorHandler_1.errorHandler);
exports.default = app;
