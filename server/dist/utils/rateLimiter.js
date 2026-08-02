"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authLimiter = exports.apiLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const constants_1 = require("../constants");
// Maps to NFR-SEC-008
exports.apiLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: { error: constants_1.CONSTANTS.ERROR_MESSAGES.RATE_LIMIT_EXCEEDED },
    standardHeaders: true,
    legacyHeaders: false,
});
// Stricter limits for authentication routes
exports.authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 100, // Limit each IP to 5 login requests per windowMs
    message: { error: 'Too many authentication attempts from this IP, please try again after an hour' },
    standardHeaders: true,
    legacyHeaders: false,
});
