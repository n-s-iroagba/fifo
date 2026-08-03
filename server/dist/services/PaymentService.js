"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentService = exports.PaymentService = void 0;
const database_1 = require("../config/database");
const PaymentRepository_1 = require("../repositories/PaymentRepository");
const NotificationRepository_1 = require("../repositories/NotificationRepository");
const BankAccountRepository_1 = require("../repositories/BankAccountRepository");
const email_1 = require("../utils/email");
const constants_1 = require("../constants");
const ApplicationService_1 = require("./ApplicationService");
class PaymentService {
    // Maps to STK-APP-PAY-001, STK-ADM-BANK-003 — display correct bank account type by amount
    async getPaymentDetails(paymentId) {
        const payment = await PaymentRepository_1.paymentRepository.findById(paymentId);
        if (!payment)
            throw new Error(constants_1.CONSTANTS.ERROR_MESSAGES.RESOURCE_NOT_FOUND);
        const amountStr = payment.amount || 0;
        const amount = typeof amountStr === 'string' ? parseFloat(amountStr) : amountStr;
        // STK-ADM-BANK-003, Scenario 3: High-value routing
        const bankType = amount >= constants_1.CONSTANTS.SEED_DEFAULTS.HIGH_VALUE_THRESHOLD
            ? constants_1.CONSTANTS.BANK_ACCOUNT_TYPES.NORMAL
            : constants_1.CONSTANTS.BANK_ACCOUNT_TYPES.OPEN_BENEFICIARY;
        const activeBankAccounts = await BankAccountRepository_1.bankAccountRepository.findAllActive();
        let relevantBankAccounts = activeBankAccounts.filter(a => a.accountType === bankType);
        // Fallback: If strict type matching yields nothing, return all active bank accounts
        if (relevantBankAccounts.length === 0) {
            relevantBankAccounts = activeBankAccounts;
        }
        return {
            payment,
            bankAccounts: relevantBankAccounts, // STK-APP-PAY-001
            isHighValue: amount >= constants_1.CONSTANTS.SEED_DEFAULTS.HIGH_VALUE_THRESHOLD,
        };
    }
    // Maps to STK-APP-PAY-002, STK-APP-PAY-003, NFR-SEC-005
    async uploadPaymentProof(paymentId, proofUrl) {
        const payment = await PaymentRepository_1.paymentRepository.findById(paymentId);
        if (!payment)
            throw new Error(constants_1.CONSTANTS.ERROR_MESSAGES.RESOURCE_NOT_FOUND);
        await PaymentRepository_1.paymentRepository.update(paymentId, {
            proofUrl,
            status: constants_1.CONSTANTS.PAYMENT_STATUSES.PENDING,
        });
        const updatedPayment = await PaymentRepository_1.paymentRepository.findById(paymentId);
        // TRUST-007: Notify applicant that proof was received
        await NotificationRepository_1.notificationRepository.create({
            userId: payment.Application?.userId,
            subject: 'Payment Proof Received',
            message: 'Your payment screenshot has been received and is currently in the verification queue.',
            type: 'SYSTEM',
        });
        return updatedPayment;
    }
    // Maps to STK-ADM-PAY-003 — unpaid payments view
    async getPendingPayments(limit, offset) {
        return PaymentRepository_1.paymentRepository.findAllAdmin({ status: constants_1.CONSTANTS.PAYMENT_STATUSES.UNPAID, limit, offset });
    }
    // Maps to STK-ADM-PAY-004 — unverified (screenshot uploaded, not yet verified)
    async getUnverifiedPayments(limit, offset) {
        return PaymentRepository_1.paymentRepository.findAllAdmin({ status: constants_1.CONSTANTS.PAYMENT_STATUSES.PENDING, limit, offset });
    }
    // Maps to STK-ADM-PAY-001, STK-ADM-PAY-002
    async verifyPayment(paymentId, adminId, isApproved, note) {
        const t = await database_1.sequelize.transaction();
        try {
            const payment = await PaymentRepository_1.paymentRepository.findById(paymentId, t);
            if (!payment)
                throw new Error(constants_1.CONSTANTS.ERROR_MESSAGES.RESOURCE_NOT_FOUND);
            const status = isApproved ? constants_1.CONSTANTS.PAYMENT_STATUSES.PAID : constants_1.CONSTANTS.PAYMENT_STATUSES.REJECTED;
            await PaymentRepository_1.paymentRepository.update(paymentId, {
                status,
                verifiedById: adminId,
                adminNote: note,
            }, t);
            const updatedPayment = await PaymentRepository_1.paymentRepository.findById(paymentId, t);
            const applicantUserId = payment.Application?.userId;
            if (applicantUserId) {
                const nSubject = isApproved ? 'Payment Verified' : 'Payment Rejected';
                const nMessage = isApproved
                    ? 'Your payment was successfully verified. Your application has been advanced to the next stage.'
                    : `Your payment was rejected. Reason: ${note || 'No reason provided'}. Please re-upload your payment proof.`;
                // STK-ADM-PAY-002: push notification
                await NotificationRepository_1.notificationRepository.create({
                    userId: applicantUserId,
                    subject: nSubject,
                    message: nMessage,
                    type: 'SYSTEM',
                }, t);
                // STK-APP-PAY-005, TRUST-008: email notification
                try {
                    const userEmail = payment.Application?.User?.email;
                    if (userEmail) {
                        await (0, email_1.sendInfoEmail)(userEmail, nSubject, `<p>${nMessage}</p>`);
                    }
                }
                catch (_emailErr) {
                    // STK-CAP-005: graceful degradation — don't fail if email is down
                }
                // NEW: Automatically advance application stage on approval
                const appCurrentStageId = payment.Application?.currentStageId;
                if (isApproved && appCurrentStageId === payment.stageId) {
                    await ApplicationService_1.applicationService.advanceApplicationStage(payment.applicationId);
                }
            }
            await t.commit();
            return updatedPayment;
        }
        catch (error) {
            await t.rollback();
            throw error;
        }
    }
}
exports.PaymentService = PaymentService;
exports.paymentService = new PaymentService();
