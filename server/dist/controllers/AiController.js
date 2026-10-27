"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiController = exports.AiController = void 0;
const AiBotService_1 = require("../services/AiBotService");
const models_1 = require("../models");
const token_1 = require("../utils/token");
class AiController {
    async chat(req, res) {
        try {
            const { message, history, studyContext } = req.body;
            if (!message || typeof message !== 'string') {
                res.status(400).json({ error: 'Message text is required.' });
                return;
            }
            // Determine if user has verified payment
            let hasPaid = Boolean(req.body.hasPaid);
            let userId = req.user?.id || req.body.userId;
            if (!userId && req.headers.authorization?.startsWith('Bearer ')) {
                try {
                    const token = req.headers.authorization.split(' ')[1];
                    const decoded = (0, token_1.verifyAccessToken)(token);
                    userId = decoded?.id;
                }
                catch {
                    // Ignore token decode failure for prospective learners
                }
            }
            if (!hasPaid && userId) {
                const paidInvoice = await models_1.Invoice.findOne({
                    where: { applicantId: userId, isPaid: true }
                });
                if (paidInvoice) {
                    hasPaid = true;
                }
            }
            const chatReq = {
                message,
                history,
                hasPaid,
                studyContext
            };
            const result = await AiBotService_1.aiBotService.chat(chatReq);
            res.status(200).json({
                success: true,
                ...result
            });
        }
        catch (error) {
            console.error('[AiController.chat] Error processing AI chat:', error);
            res.status(500).json({
                error: 'An unexpected error occurred while communicating with the AI Assistant.'
            });
        }
    }
}
exports.AiController = AiController;
exports.aiController = new AiController();
