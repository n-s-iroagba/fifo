import { Request, Response } from 'express';
import { paymentService } from '../services/PaymentService';
import { CONSTANTS } from '../constants';

export class PaymentController {
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
