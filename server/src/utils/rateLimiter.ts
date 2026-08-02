import rateLimit from 'express-rate-limit';
import { CONSTANTS } from '../constants';

// Maps to NFR-SEC-008
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: { error: CONSTANTS.ERROR_MESSAGES.RATE_LIMIT_EXCEEDED },
    standardHeaders: true,
    legacyHeaders: false,
});

// Stricter limits for authentication routes
export const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 100, // Limit each IP to 5 login requests per windowMs
    message: { error: 'Too many authentication attempts from this IP, please try again after an hour' },
    standardHeaders: true,
    legacyHeaders: false,
});
