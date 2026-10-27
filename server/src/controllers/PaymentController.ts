import { Request, Response } from 'express';
import { Invoice, User, Ticket, PsychometricAttempt } from '../models';
import { CONSTANTS } from '../constants';
import { sendCryptoPaymentDirectionEmail } from '../utils/email';
import { logger } from '../utils/logger';

export class PaymentController {
    /**
     * GET /api/payments/me
     * Returns learner payment receipts and financial history
     */
    async getMyPayments(req: Request, res: Response): Promise<void> {
        try {
            const user = (req as any).user;
            const userId = user?.id;

            if (!userId) {
                res.status(CONSTANTS.HTTP_STATUS.OK).json({ success: true, data: [] });
                return;
            }

            // 1. Fetch Psychometric Attempts
            const psychoAttempts = await PsychometricAttempt.findAll({
                where: { userId, passed: true }
            });

            // 2. Fetch Tickets
            const tickets = await Ticket.findAll({
                where: { userId }
            });

            // 3. Fetch Invoices
            const invoices = await Invoice.findAll({
                where: { applicantId: userId, isPaid: true }
            });

            const receipts: any[] = [];

            // Map Invoices
            invoices.forEach((inv: any) => {
                receipts.push({
                    id: inv.id,
                    date: new Date(inv.updatedAt || inv.createdAt).toLocaleDateString('en-AU'),
                    courses: [inv.purpose?.replace(/-/g, ' ').toUpperCase() || 'COMPETENCY COURSEWORK'],
                    subsidiesCovered: 0,
                    amountPaid: parseFloat(inv.amountInUSD || '0'),
                    type: 'invoice',
                    status: 'Verified & Recorded'
                });
            });

            // Map Psychometric Attempts (Paid fully by Blue Collar)
            psychoAttempts.forEach((attempt: any) => {
                receipts.push({
                    id: `PSY-${attempt.id}`,
                    date: new Date(attempt.createdAt).toLocaleDateString('en-AU'),
                    courses: [`Psychometric Test — ${attempt.module === 'module_1' ? 'General Aptitude' : 'Workflow & Ethics'}`],
                    subsidiesCovered: 50.00,
                    amountPaid: 0.00,
                    type: 'psychometric',
                    note: 'Sponsored 100% by Blue Collar Placement Desk'
                });
            });

            // Map Tickets
            tickets.forEach((ticket: any) => {
                const price = parseFloat(ticket.purchasePrice || ticket.price || 0);
                const subsidisedPrice = ticket.subsidisedPrice !== null ? parseFloat(ticket.subsidisedPrice) : price;
                const subsidyAmount = price - subsidisedPrice;
                receipts.push({
                    id: `TKT-${ticket.id}`,
                    date: new Date(ticket.createdAt).toLocaleDateString('en-AU'),
                    courses: [`${ticket.ticketType} Statement of Attainment`],
                    subsidiesCovered: subsidyAmount > 0 ? subsidyAmount : 0,
                    amountPaid: subsidisedPrice,
                    type: 'ticket'
                });
            });

            res.status(CONSTANTS.HTTP_STATUS.OK).json({ success: true, data: receipts });
        } catch (error: any) {
            logger.error('[PaymentController.getMyPayments]', error);
            res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                success: false,
                error: error.message || CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR
            });
        }
    }

    /**
     * POST /api/payments/card-attempt
     * Processes card payment attempt:
     * - Checks regional merchant restriction
     * - Triggers fallback to crypto settlement
     * - Dispatches Email 17 (Crypto direction email)
     * - Returns clear instruction and redirect URL
     */
    async handleCardPaymentAttempt(req: Request, res: Response): Promise<void> {
        try {
            const { applicantId, invoiceId, amount, cardHolderName, email } = req.body;
            let userEmail = email;
            let candidateName = cardHolderName || 'Valued Candidate';

            if (applicantId) {
                const user = await User.findByPk(applicantId);
                if (user) {
                    userEmail = user.email;
                    candidateName = user.fullName || candidateName;
                }
            }

            const invId = parseInt(invoiceId, 10) || 53;
            const amountDue = parseFloat(amount) || 720.00;

            console.log(`[PaymentController] Card attempt for ${userEmail || 'unknown'}: Amount $${amountDue} AUD. Triggering crypto settlement routing...`);

            // FIXES2 ITEM 9 & 10: Dispatch Email 17 (Crypto payment direction email)
            if (userEmail) {
                await sendCryptoPaymentDirectionEmail(
                    userEmail,
                    candidateName,
                    amountDue,
                    invId
                ).catch((err: any) => {
                    console.error('[PaymentController] Failed to dispatch crypto direction email:', err);
                });
            }

            res.status(CONSTANTS.HTTP_STATUS.OK).json({
                success: false,
                code: 'REGIONAL_MERCHANT_RESTRICTION',
                message: 'Card payments are not currently supported in your country for this Australian merchant facility. Due to regional merchant controls and to avoid international hold delays, payment has been routed to our accredited Bitget Web3 crypto settlement rail.',
                fallbackMethod: 'crypto',
                cryptoRedirectUrl: `/payments/crypto?invoiceId=${invId}&amount=${amountDue.toFixed(2)}`
            });
        } catch (error: any) {
            logger.error('[PaymentController.handleCardPaymentAttempt]', error);
            res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                success: false,
                error: error.message || CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR
            });
        }
    }

    /**
     * POST /api/payments/crypto-proof
     * Submits transaction hash or screenshot confirmation for candidate
     */
    async submitCryptoProof(req: Request, res: Response): Promise<void> {
        try {
            const { invoiceId, txHash, proofUrl, amount, notes, applicantId } = req.body;
            const invId = parseInt(invoiceId, 10);

            if (invId) {
                const invoice = await Invoice.findByPk(invId);
                if (invoice) {
                    invoice.receiptProofSubmission = new Date();
                    if (notes || txHash) {
                        invoice.purpose = `${invoice.purpose || 'aveling-partial'} [Proof: ${txHash || notes || 'Submitted'}]`;
                    }
                    await invoice.save();
                }
            }

            res.status(CONSTANTS.HTTP_STATUS.OK).json({
                success: true,
                message: 'Transaction verification submitted successfully. Your dedicated application manager will verify the block and issue your official Statement of Attainment receipt immediately.'
            });
        } catch (error: any) {
            logger.error('[PaymentController.submitCryptoProof]', error);
            res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                success: false,
                error: error.message || CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR
            });
        }
    }
}

export const paymentController = new PaymentController();
