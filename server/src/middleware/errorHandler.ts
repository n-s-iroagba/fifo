import { Request, Response, NextFunction } from 'express';
import { CONSTANTS } from '../constants';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction): void => {
    console.error('[Error Handler]', err);

    if (err.name === 'ZodError') {
        res.status(CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
            error: CONSTANTS.ERROR_MESSAGES.VALIDATION_ERROR,
            details: err.errors
        });
        return;
    }

    const status = err.status || CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR;
    const message = err.message || CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR;

    res.status(status).json({ error: message });
};
