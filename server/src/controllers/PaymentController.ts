import { Request, Response } from 'express';
import { paymentService } from '../services/PaymentService';
import { CONSTANTS } from '../constants';

export class PaymentController {
    public async getMyAvelingInvoices(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).user.id;
            
            // 1. Fetch Psychometric Attempts
            const { PsychometricAttempt, Ticket } = require('../models');
            const psychoAttempts = await PsychometricAttempt.findAll({
                where: { userId, passed: true }
            });
            
            // 2. Fetch Tickets
            const tickets = await Ticket.findAll({
                where: { userId }
            });

            const receipts: any[] = [];
            
            // Map Psychometric Attempts (Paid fully by Blue Collar)
            psychoAttempts.forEach((attempt: any) => {
                receipts.push({
                    id: `INV-PSY-${attempt.id}`,
                    date: new Date(attempt.createdAt).toLocaleDateString(),
                    courses: [`Psychometric Test - ${attempt.module === 'module_1' ? 'General' : 'Flow Course'}`],
                    subsidiesCovered: 50.00, // Fixed price for psycho test covered by Blue Collar
                    amountPaid: 0.00,
                    type: 'psychometric',
                    note: 'Paid on behalf of applicant by Blue Collar'
                });
            });
            
            // Map Tickets
            tickets.forEach((ticket: any) => {
                const price = parseFloat(ticket.purchasePrice || ticket.price || 0);
                const subsidisedPrice = ticket.subsidisedPrice !== null ? parseFloat(ticket.subsidisedPrice) : price;
                const subsidyAmount = price - subsidisedPrice;
                
                receipts.push({
                    id: `INV-TKT-${ticket.id}`,
                    date: new Date(ticket.createdAt).toLocaleDateString(),
                    courses: [`${ticket.ticketType} Certification`],
                    subsidiesCovered: subsidyAmount > 0 ? subsidyAmount : 0,
                    amountPaid: subsidisedPrice,
                    type: 'ticket'
                });
            });

            // Sort by date descending
            receipts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

            res.status(CONSTANTS.HTTP_STATUS.OK).json({ data: receipts });
        } catch (error: any) {
            console.error('[PaymentController.getMyAvelingInvoices]', error);
            res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }

    public async getUserAvelingInvoices(req: Request, res: Response): Promise<void> {
        try {
            const userId = parseInt(req.params.userId, 10);
            
            // 1. Fetch Psychometric Attempts
            const { PsychometricAttempt, Ticket } = require('../models');
            const psychoAttempts = await PsychometricAttempt.findAll({
                where: { userId, passed: true }
            });
            
            // 2. Fetch Tickets
            const tickets = await Ticket.findAll({
                where: { userId }
            });

            const receipts: any[] = [];
            
            // Map Psychometric Attempts (Paid fully by Blue Collar)
            psychoAttempts.forEach((attempt: any) => {
                receipts.push({
                    id: `INV-PSY-${attempt.id}`,
                    date: new Date(attempt.createdAt).toLocaleDateString(),
                    courses: [`Psychometric Test - ${attempt.module === 'module_1' ? 'General' : 'Flow Course'}`],
                    subsidiesCovered: 50.00, // Fixed price for psycho test covered by Blue Collar
                    amountPaid: 0.00,
                    type: 'psychometric',
                    note: 'Paid on behalf of applicant by Blue Collar'
                });
            });
            
            // Map Tickets
            tickets.forEach((ticket: any) => {
                const price = parseFloat(ticket.purchasePrice || ticket.price || 0);
                const subsidisedPrice = ticket.subsidisedPrice !== null ? parseFloat(ticket.subsidisedPrice) : price;
                const subsidyAmount = price - subsidisedPrice;
                
                receipts.push({
                    id: `INV-TKT-${ticket.id}`,
                    date: new Date(ticket.createdAt).toLocaleDateString(),
                    courses: [`${ticket.ticketType} Certification`],
                    subsidiesCovered: subsidyAmount > 0 ? subsidyAmount : 0,
                    amountPaid: subsidisedPrice,
                    type: 'ticket'
                });
            });

            // Sort by date descending
            receipts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

            res.status(CONSTANTS.HTTP_STATUS.OK).json({ data: receipts });
        } catch (error: any) {
            console.error('[PaymentController.getUserAvelingInvoices]', error);
            res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }

    // Maps to STK-APP-PAY-001 — get payment details with appropriate bank account display
    public async getPaymentDetails(req: Request, res: Response): Promise<void> {
        try {
            const paymentId = parseInt(req.params.id as string, 10);
            const details = await paymentService.getPaymentDetails(paymentId);
            res.status(CONSTANTS.HTTP_STATUS.OK).json(details);
        } catch (error: any) {
            console.error('[PaymentController.getPaymentDetails]', error);
            console.error('[PaymentController.getPaymentDetails]', error);
            if (error.message === CONSTANTS.ERROR_MESSAGES.RESOURCE_NOT_FOUND) {
                res.status(CONSTANTS.HTTP_STATUS.NOT_FOUND).json({ error: error.message });
                return;
            }
            res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }

    // Maps to STK-APP-PAY-002, STK-APP-PAY-003, TRUST-007
    public async uploadProof(req: Request, res: Response): Promise<void> {
        try {
            const paymentId = parseInt(req.params.id as string, 10);
            const { proofUrl } = req.body;
            const payment = await paymentService.uploadPaymentProof(paymentId, proofUrl);
            res.status(CONSTANTS.HTTP_STATUS.OK).json({
                message: CONSTANTS.SUCCESS_MESSAGES.UPDATED,
                payment,
            });
        } catch (error: any) {
            console.error('[PaymentController.uploadProof]', error);
            console.error('[PaymentController.uploadProof]', error);
            if (error.message === CONSTANTS.ERROR_MESSAGES.RESOURCE_NOT_FOUND) {
                res.status(CONSTANTS.HTTP_STATUS.NOT_FOUND).json({ error: error.message });
                return;
            }
            res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }

    // Maps to STK-ADM-PAY-003 — admin: unpaid payments view
    public async getPendingPaymentsAdmin(req: Request, res: Response): Promise<void> {
        try {
            const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
            const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : 0;
            const payments = await paymentService.getPendingPayments(limit, offset);
            res.status(CONSTANTS.HTTP_STATUS.OK).json(payments);
        } catch (error) {
            console.error('[PaymentController.getPendingPaymentsAdmin]', error);
            console.error('[PaymentController.getPendingPaymentsAdmin]', error);
            res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }

    // Maps to STK-ADM-PAY-004 — admin: unverified payments (screenshot uploaded, not confirmed)
    public async getUnverifiedPaymentsAdmin(req: Request, res: Response): Promise<void> {
        try {
            const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
            const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : 0;
            const payments = await paymentService.getUnverifiedPayments(limit, offset);
            res.status(CONSTANTS.HTTP_STATUS.OK).json(payments);
        } catch (error) {
            console.error('[PaymentController.getUnverifiedPaymentsAdmin]', error);
            console.error('[PaymentController.getUnverifiedPaymentsAdmin]', error);
            res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }

    // Maps to STK-ADM-PAY-001, STK-ADM-PAY-002
    public async verifyPayment(req: Request, res: Response): Promise<void> {
        try {
            const paymentId = parseInt(req.params.id as string, 10);
            const adminId = (req as any).user.id;
            const { isApproved, note } = req.body;
            const payment = await paymentService.verifyPayment(paymentId, adminId, isApproved, note);
            res.status(CONSTANTS.HTTP_STATUS.OK).json({
                message: CONSTANTS.SUCCESS_MESSAGES.UPDATED,
                payment,
            });
        } catch (error: any) {
            console.error('[PaymentController.verifyPayment]', error);
            console.error('[PaymentController.verifyPayment]', error);
            if (error.message === CONSTANTS.ERROR_MESSAGES.RESOURCE_NOT_FOUND) {
                res.status(CONSTANTS.HTTP_STATUS.NOT_FOUND).json({ error: error.message });
                return;
            }
            res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }
}

export const paymentController = new PaymentController();
