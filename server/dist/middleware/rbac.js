"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = void 0;
const constants_1 = require("../constants");
const requireRole = (allowedRoles) => {
    return (req, res, next) => {
        const userRole = req.user?.role;
        if (!userRole || !allowedRoles.includes(userRole)) {
            res.status(constants_1.CONSTANTS.HTTP_STATUS.FORBIDDEN).json({ error: constants_1.CONSTANTS.ERROR_MESSAGES.UNAUTHORIZED_ACCESS });
            return;
        }
        next();
    };
};
exports.requireRole = requireRole;
