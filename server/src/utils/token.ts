import jwt from 'jsonwebtoken';
import { CONSTANTS } from '../constants';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'refresh_secret_fallback_prod';

export const generateAccessToken = (payload: object): string => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '3h' });
};

export const generateRefreshToken = (payload: object): string => {
    return jwt.sign(payload, REFRESH_SECRET, { expiresIn: '7d' });
};

export const verifyAccessToken = (token: string): any => {
    return jwt.verify(token, JWT_SECRET);
};

export const verifyRefreshToken = (token: string): any => {
    return jwt.verify(token, REFRESH_SECRET);
};

// Keep deprecated verifyToken for backward compatibility during migration
export const verifyToken = (token: string): object | string => {
    return jwt.verify(token, JWT_SECRET);
};
