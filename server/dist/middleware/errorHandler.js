"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const constants_1 = require("../constants");
const errorHandler = (err, req, res, next) => {
    console.error('[Error Handler]', err);
    if (err.name === 'ZodError') {
        res.status(constants_1.CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
            error: constants_1.CONSTANTS.ERROR_MESSAGES.VALIDATION_ERROR,
            details: err.errors
        });
        return;
    }
    const status = err.status || constants_1.CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR;
    const message = err.message || constants_1.CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR;
    res.status(status).json({ error: message });
};
exports.errorHandler = errorHandler;
