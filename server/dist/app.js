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
app.use(express_1.default.json({ limit: '50mb' }));
app.use(express_1.default.urlencoded({ limit: '50mb', extended: true }));
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
