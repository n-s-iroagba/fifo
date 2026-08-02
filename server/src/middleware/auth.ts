import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/token';
import { CONSTANTS } from '../constants';

export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(CONSTANTS.HTTP_STATUS.UNAUTHORIZED).json({ error: CONSTANTS.ERROR_MESSAGES.UNAUTHORIZED_ACCESS });
        return;
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = verifyToken(token);
        (req as any).user = decoded; // Attach user payload to request
        next();
    } catch (error) {
        res.status(CONSTANTS.HTTP_STATUS.UNAUTHORIZED).json({ error: CONSTANTS.ERROR_MESSAGES.UNAUTHORIZED_ACCESS });
        return;
    }
};
