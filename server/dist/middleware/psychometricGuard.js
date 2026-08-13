"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requirePsychometricClear = void 0;
const constants_1 = require("../constants");
const requirePsychometricClear = async (req, res, next) => {
    try {
        const user = req.user;
        if (!user) {
            res.status(constants_1.CONSTANTS.HTTP_STATUS.UNAUTHORIZED).json({ error: 'Unauthorized' });
            return;
        }
        // Admins are exempt from the psychometric check
        if (user.role === constants_1.CONSTANTS.ROLES.ADMIN) {
            return next();
        }
        // Check if both modules are passed
        if (!user.psychometricModule1Passed || !user.psychometricModule2Passed) {
            res.status(constants_1.CONSTANTS.HTTP_STATUS.FORBIDDEN).json({
                error: 'You must complete and pass the two-module psychometric assessment before submitting applications.'
            });
            return;
        }
        next();
    }
    catch (error) {
        console.error('[requirePsychometricClear]', error);
        res.status(constants_1.CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: constants_1.CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
    }
};
exports.requirePsychometricClear = requirePsychometricClear;
