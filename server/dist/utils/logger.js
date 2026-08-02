"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
exports.logger = {
    // Maps to NFR-OBS-001 (Basic systemic logging mapped out for future integration with Pino or ELK)
    info: (message, meta = {}) => {
        if (process.env.NODE_ENV !== 'test') {
            console.log(JSON.stringify({ level: 'INFO', timestamp: new Date().toISOString(), message, ...meta }));
        }
    },
    warn: (message, meta = {}) => {
        if (process.env.NODE_ENV !== 'test') {
            console.warn(JSON.stringify({ level: 'WARN', timestamp: new Date().toISOString(), message, ...meta }));
        }
    },
    error: (message, error, meta = {}) => {
        if (process.env.NODE_ENV !== 'test') {
            console.error(JSON.stringify({
                level: 'ERROR',
                timestamp: new Date().toISOString(),
                message,
                error: error?.message || error,
                stack: error?.stack,
                ...meta
            }));
        }
    }
};
