"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentController = exports.PaymentController = void 0;
const PaymentService_1 = require("../services/PaymentService");
const constants_1 = require("../constants");
class PaymentController {
    // Maps to STK-APP-PAY-001 — get payment details with appropriate bank account display
    async getPaymentDetails(req, res) {
        try {
            const paymentId = parseInt(req.params.id, 10);
            const details = await PaymentService_1.paymentService.getPaymentDetails(paymentId);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json(details);
        }
        catch (error) {
            console.error('[PaymentController.getPaymentDetails]', error);
            console.error('[PaymentController.getPaymentDetails]', error);
            if (error.message === constants_1.CONSTANTS.ERROR_MESSAGES.RESOURCE_NOT_FOUND) {
                res.status(constants_1.CONSTANTS.HTTP_STATUS.NOT_FOUND).json({ error: error.message });
                return;
            }
            res.status(constants_1.CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: constants_1.CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }
    // Maps to STK-APP-PAY-002, STK-APP-PAY-003, TRUST-007
    async uploadProof(req, res) {
        try {
            const paymentId = parseInt(req.params.id, 10);
            const { proofUrl } = req.body;
            const payment = await PaymentService_1.paymentService.uploadPaymentProof(paymentId, proofUrl);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json({
                message: constants_1.CONSTANTS.SUCCESS_MESSAGES.UPDATED,
                payment,
            });
        }
        catch (error) {
            console.error('[PaymentController.uploadProof]', error);
            console.error('[PaymentController.uploadProof]', error);
            if (error.message === constants_1.CONSTANTS.ERROR_MESSAGES.RESOURCE_NOT_FOUND) {
                res.status(constants_1.CONSTANTS.HTTP_STATUS.NOT_FOUND).json({ error: error.message });
                return;
            }
            res.status(constants_1.CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: constants_1.CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }
    // Maps to STK-ADM-PAY-003 — admin: unpaid payments view
    async getPendingPaymentsAdmin(req, res) {
        try {
            const limit = req.query.limit ? parseInt(req.query.limit, 10) : 20;
            const offset = req.query.offset ? parseInt(req.query.offset, 10) : 0;
            const payments = await PaymentService_1.paymentService.getPendingPayments(limit, offset);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json(payments);
        }
        catch (error) {
            console.error('[PaymentController.getPendingPaymentsAdmin]', error);
            console.error('[PaymentController.getPendingPaymentsAdmin]', error);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: constants_1.CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }
    // Maps to STK-ADM-PAY-004 — admin: unverified payments (screenshot uploaded, not confirmed)
    async getUnverifiedPaymentsAdmin(req, res) {
        try {
            const limit = req.query.limit ? parseInt(req.query.limit, 10) : 20;
            const offset = req.query.offset ? parseInt(req.query.offset, 10) : 0;
            const payments = await PaymentService_1.paymentService.getUnverifiedPayments(limit, offset);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json(payments);
        }
        catch (error) {
            console.error('[PaymentController.getUnverifiedPaymentsAdmin]', error);
            console.error('[PaymentController.getUnverifiedPaymentsAdmin]', error);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: constants_1.CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }
    // Maps to STK-ADM-PAY-001, STK-ADM-PAY-002
    async verifyPayment(req, res) {
        try {
            const paymentId = parseInt(req.params.id, 10);
            const adminId = req.user.id;
            const { isApproved, note } = req.body;
            const payment = await PaymentService_1.paymentService.verifyPayment(paymentId, adminId, isApproved, note);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json({
                message: constants_1.CONSTANTS.SUCCESS_MESSAGES.UPDATED,
                payment,
            });
        }
        catch (error) {
            console.error('[PaymentController.verifyPayment]', error);
            console.error('[PaymentController.verifyPayment]', error);
            if (error.message === constants_1.CONSTANTS.ERROR_MESSAGES.RESOURCE_NOT_FOUND) {
                res.status(constants_1.CONSTANTS.HTTP_STATUS.NOT_FOUND).json({ error: error.message });
                return;
            }
            res.status(constants_1.CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: constants_1.CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }
}
exports.PaymentController = PaymentController;
exports.paymentController = new PaymentController();
