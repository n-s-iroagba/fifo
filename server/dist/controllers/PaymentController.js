"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentController = exports.PaymentController = void 0;
const PaymentService_1 = require("../services/PaymentService");
const constants_1 = require("../constants");
class PaymentController {
    async getMyAvelingInvoices(req, res) {
        try {
            const userId = req.user.id;
            // 1. Fetch Psychometric Attempts
            const { PsychometricAttempt, Ticket } = require('../models');
            const psychoAttempts = await PsychometricAttempt.findAll({
                where: { userId, passed: true }
            });
            // 2. Fetch Tickets
            const tickets = await Ticket.findAll({
                where: { userId }
            });
            const receipts = [];
            // Map Psychometric Attempts (Paid fully by Blue Collar)
            psychoAttempts.forEach((attempt) => {
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
            tickets.forEach((ticket) => {
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
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json({ data: receipts });
        }
        catch (error) {
            console.error('[PaymentController.getMyAvelingInvoices]', error);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: constants_1.CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }
    async getUserAvelingInvoices(req, res) {
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
            const receipts = [];
            // Map Psychometric Attempts (Paid fully by Blue Collar)
            psychoAttempts.forEach((attempt) => {
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
            tickets.forEach((ticket) => {
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
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json({ data: receipts });
        }
        catch (error) {
            console.error('[PaymentController.getUserAvelingInvoices]', error);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: constants_1.CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }
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
