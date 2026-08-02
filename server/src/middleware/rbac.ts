import { Request, Response, NextFunction } from 'express';
import { CONSTANTS } from '../constants';

export const requireRole = (allowedRoles: string[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const userRole = (req as any).user?.role;

        if (!userRole || !allowedRoles.includes(userRole)) {
            res.status(CONSTANTS.HTTP_STATUS.FORBIDDEN).json({ error: CONSTANTS.ERROR_MESSAGES.UNAUTHORIZED_ACCESS });
            return;
        }
        next();
    };
};
