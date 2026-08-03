"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applicantAuditMiddleware = void 0;
const email_1 = require("../utils/email");
const constants_1 = require("../constants");
const applicantAuditMiddleware = (req, res, next) => {
    // Intercept successful login/registration in the response
    const originalJson = res.json;
    res.json = function (data) {
        const path = req.originalUrl;
        const method = req.method;
        const isAuthMove = path.includes('/auth/login') || path.includes('/auth/register') || path.includes('/auth/verify');
        // If it's a successful auth move and we have user data in response
        if (isAuthMove && res.statusCode < 400 && data && (data.user || data.accessToken)) {
            const user = data.user || {};
            (0, email_1.sendInfoEmail)('BlueCollar@gmail.com', `Applicant Identity Alert: ${user.fullName || 'New User'}`, `
                <div style="background-color: #f8fafc; padding: 25px; border-radius: 12px; border: 1px solid #eef2f6;">
                    <p><strong>Identity Event:</strong> ${path}</p>
                    <p><strong>User:</strong> ${user.fullName} (${user.email})</p>
                    <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
                </div>
                `).catch(err => console.error('[AuditMiddleware] Auth notification failed:', err));
        }
        return originalJson.call(this, data);
    };
    const user = req.user;
    // Only track moves by applicants for authenticated mutations
    if (user && user.role === constants_1.CONSTANTS.ROLES.APPLICANT) {
        const method = req.method;
        const path = req.originalUrl;
        const isMutation = ['POST', 'PATCH', 'PUT', 'DELETE'].includes(method);
        if (isMutation) {
            (0, email_1.sendInfoEmail)('BlueCollar@gmail.com', `Applicant Action Alert: ${user.fullName}`, `
                <div style="background-color: #f8fafc; padding: 25px; border-radius: 12px; border: 1px solid #eef2f6;">
                    <p><strong>Applicant:</strong> ${user.fullName} (${user.email})</p>
                    <p><strong>Action Type:</strong> ${method}</p>
                    <p><strong>Protocol Path:</strong> ${path}</p>
                    <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
                    <div style="margin-top: 15px; padding: 15px; background: #fff; border-radius: 8px; font-family: monospace; font-size: 12px; color: #475569;">
                        <strong>Payload Preview:</strong><br/>
                        ${JSON.stringify(req.body, null, 2).substring(0, 500)}...
                    </div>
                </div>
                `).catch(err => console.error('[AuditMiddleware] Mutation notification failed:', err));
        }
    }
    next();
};
exports.applicantAuditMiddleware = applicantAuditMiddleware;
