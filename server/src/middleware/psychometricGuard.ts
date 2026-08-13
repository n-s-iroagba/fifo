import { Request, Response, NextFunction } from 'express';
import { CONSTANTS } from '../constants';

export const requirePsychometricClear = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const user = (req as any).user;
        if (!user) {
            res.status(CONSTANTS.HTTP_STATUS.UNAUTHORIZED).json({ error: 'Unauthorized' });
            return;
        }

        // Admins are exempt from the psychometric check
        if (user.role === CONSTANTS.ROLES.ADMIN) {
            return next();
        }

        // Check if both modules are passed
        if (!user.psychometricModule1Passed || !user.psychometricModule2Passed) {
            res.status(CONSTANTS.HTTP_STATUS.FORBIDDEN).json({ 
                error: 'You must complete and pass the two-module psychometric assessment before submitting applications.' 
            });
            return;
        }

        next();
    } catch (error) {
        console.error('[requirePsychometricClear]', error);
        res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
    }
};
