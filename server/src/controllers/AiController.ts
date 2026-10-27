import { Request, Response } from 'express';
import { aiBotService, AiChatRequest } from '../services/AiBotService';
import { Invoice } from '../models';
import { verifyAccessToken } from '../utils/token';

export class AiController {
    public async chat(req: Request, res: Response): Promise<void> {
        try {
            const { message, history, studyContext } = req.body;

            if (!message || typeof message !== 'string') {
                res.status(400).json({ error: 'Message text is required.' });
                return;
            }

            // Determine if user has verified payment
            let hasPaid = Boolean(req.body.hasPaid);
            let userId = (req as any).user?.id || req.body.userId;

            if (!userId && req.headers.authorization?.startsWith('Bearer ')) {
                try {
                    const token = req.headers.authorization.split(' ')[1];
                    const decoded: any = verifyAccessToken(token);
                    userId = decoded?.id;
                } catch {
                    // Ignore token decode failure for prospective learners
                }
            }

            if (!hasPaid && userId) {
                const paidInvoice = await Invoice.findOne({
                    where: { applicantId: userId, isPaid: true }
                });
                if (paidInvoice) {
                    hasPaid = true;
                }
            }

            const chatReq: AiChatRequest = {
                message,
                history,
                hasPaid,
                studyContext
            };

            const result = await aiBotService.chat(chatReq);
            res.status(200).json({
                success: true,
                ...result
            });
        } catch (error: any) {
            console.error('[AiController.chat] Error processing AI chat:', error);
            res.status(500).json({
                error: 'An unexpected error occurred while communicating with the AI Assistant.'
            });
        }
    }
}

export const aiController = new AiController();
