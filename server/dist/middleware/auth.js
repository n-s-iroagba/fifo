"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = void 0;
const token_1 = require("../utils/token");
const constants_1 = require("../constants");
const requireAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(constants_1.CONSTANTS.HTTP_STATUS.UNAUTHORIZED).json({ error: constants_1.CONSTANTS.ERROR_MESSAGES.UNAUTHORIZED_ACCESS });
        return;
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = (0, token_1.verifyToken)(token);
        req.user = decoded; // Attach user payload to request
        next();
    }
    catch (error) {
        res.status(constants_1.CONSTANTS.HTTP_STATUS.UNAUTHORIZED).json({ error: constants_1.CONSTANTS.ERROR_MESSAGES.UNAUTHORIZED_ACCESS });
        return;
    }
};
exports.requireAuth = requireAuth;
