"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ticketService = exports.TicketService = void 0;
const models_1 = require("../models");
const NotificationService_1 = require("./NotificationService");
const email_1 = require("../utils/email");
/** Schedule 1 / Clause 5.1 — Payment Milestone & Liability Constants */
const DEPOSIT_AMOUNT = 500; // A$500 initial commitment deposit
const DEPOSIT_UNLOCKS_UP_TO = 3; // deposit unlocks tickets 1 through 3
const CANDIDATE_TRAINING_SHARE_TOTAL = 1240.75; // 35% candidate share for training items 1-7
const CANDIDATE_VISA_SHARE = 1405.25; // 35% candidate share for Subclass 482 Visa VAC
const CANDIDATE_LICENSING_SHARE = 185.50; // 100% candidate share for WA CTT, PDA, & License card
const SCHEDULE_1_NET_CANDIDATE_TOTAL = 2830.95; // A$1,240.75 + A$1,405.25 + A$185.50
const MAX_CANDIDATE_LIABILITY = 3599.20; // Clause 5.2 upper contractual liability ceiling cap
class TicketService {
    async getUserTickets(userId) {
        return await models_1.Ticket.findAll({
            where: { userId },
            include: [{ model: models_1.Application, as: 'Application' }],
            order: [['createdAt', 'DESC']]
        });
    }
    /**
     * PAYMENT MILESTONE GATE (Schedule 1 / Clause 5.1)
     *
     * Returns the gate status for a given ticket:
     *   - 'ok'               → access allowed
     *   - 'DEPOSIT_REQUIRED' → A$500 deposit not yet paid/verified
     *   - 'FULL_BALANCE_REQUIRED' → ticket 4+ but full balance not yet paid
     *
     * Gate logic:
     *   ticketSequenceNumber 1–3 → depositPaid must be true
     *   ticketSequenceNumber 4+  → fullBalancePaid must be true
     *   ticketSequenceNumber null → treat as ticket 1 (deposit required)
     *   fullBalancePaid=true     → always allowed (covers entire programme)
     */
    async checkPaymentMilestoneGate(userId, ticketId) {
        const user = await models_1.User.findByPk(userId);
        if (!user)
            throw new Error('USER_NOT_FOUND');
        // Full balance paid → unrestricted access to all tickets
        if (user.fullBalancePaid)
            return 'ok';
        const ticket = await models_1.Ticket.findByPk(ticketId);
        if (!ticket)
            throw new Error('TICKET_NOT_FOUND');
        const seq = ticket.ticketSequenceNumber ?? 1;
        if (seq >= 1 && seq <= DEPOSIT_UNLOCKS_UP_TO) {
            // Tickets 1-3: require deposit
            return user.depositPaid ? 'ok' : 'DEPOSIT_REQUIRED';
        }
        // Ticket 4+: require full balance & notify admin
        try {
            const admins = await models_1.User.findAll({ where: { role: 'admin' } });
            for (const admin of admins) {
                await NotificationService_1.notificationService.sendNotification(admin.id, `⚠️ Milestone Alert: Candidate #${user.candidateNumber || user.id} Accessing Module #${seq}`, `Candidate ${user.fullName || user.email} has reached Module #${seq} (${ticket.ticketType}) with PARTIAL payment status. Full balance invoice required.`);
            }
        }
        catch (e) {
            console.warn('[TicketService] Admin notification for ticket 4 milestone failed:', e);
        }
        return 'FULL_BALANCE_REQUIRED';
    }
    /**
     * Admin explicitly updates an applicant's payment status to 'partial' (deposit verified)
     * or 'complete' (full balance verified) or 'unpaid'.
     */
    async adminUpdatePaymentStatus(userId, status) {
        const user = await models_1.User.findByPk(userId);
        if (!user)
            throw new Error('USER_NOT_FOUND');
        if (status === 'partial') {
            await user.update({ depositPaid: true, depositPaidAt: user.depositPaidAt || new Date(), fullBalancePaid: false });
        }
        else if (status === 'complete') {
            await user.update({ depositPaid: true, depositPaidAt: user.depositPaidAt || new Date(), fullBalancePaid: true });
        }
        else {
            await user.update({ depositPaid: false, depositPaidAt: null, fullBalancePaid: false });
        }
        await NotificationService_1.notificationService.sendNotification(userId, 'Payment Status Updated', `Your programme payment status has been set to ${status.toUpperCase()} by your recruitment manager.`);
        return { userId, status, depositPaid: user.depositPaid, fullBalancePaid: user.fullBalancePaid };
    }
    /**
     * Custom invoice generation with currency conversion & bank account selector.
     */
    async createAndSendCustomInvoice(userId, data) {
        const user = await models_1.User.findByPk(userId);
        if (!user)
            throw new Error('USER_NOT_FOUND');
        const selectedBank = {
            bankName: 'ANZ International Corporate',
            accountNumber: '98765432',
            accountName: 'Blue Collar Recruitment Pty Ltd'
        };
        const invoiceNumber = `INV-BCR-2026-${Math.floor(10000 + Math.random() * 90000)}`;
        const candidateNumber = user.candidateNumber || `CND-${10000 + user.id}`;
        const itemsHtml = (data.lineItems && data.lineItems.length > 0 ? data.lineItems : [
            { title: data.description || 'FIFO Competency Training Package & Statutory Fees', amountAud: data.amountAud }
        ]).map((item) => `
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 12px;">${item.title}</td>
                <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 12px; text-align: right; font-weight: bold;">A$${item.amountAud.toFixed(2)}</td>
                <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 12px; text-align: right; color: #1e3a8a;">
                    ${data.currency} ${(item.amountAud * data.exchangeRate).toFixed(2)}
                </td>
            </tr>
        `).join('');
        const avelingUrl = `https://aveling.online/checkout`;
        const emailHtml = `
        <div style="font-family: Arial, sans-serif; color: #1e3a8a; max-width: 650px; margin: 0 auto; border: 1px solid #cbd5e1; border-radius: 16px; overflow: hidden; background: #ffffff;">
            <div style="background: #1e3a8a; color: #ffffff; padding: 24px; text-align: center;">
                <h1 style="margin:0; font-size: 22px; text-transform: uppercase; letter-spacing: 1px;">Blue Collar Recruitment Pty Ltd</h1>
                <p style="margin:4px 0 0 0; font-size: 11px; opacity: 0.8; text-transform: uppercase; letter-spacing: 2px;">Official Tax Invoice & Payment Request</p>
            </div>
            <div style="padding: 24px;">
                <div style="display:flex; justify-content:space-between; margin-bottom: 20px; font-size: 12px; color: #475569;">
                    <div>
                        <p style="margin:2px 0;"><strong>Billed To:</strong> ${user.fullName}</p>
                        <p style="margin:2px 0;"><strong>Candidate ID:</strong> ${candidateNumber}</p>
                        <p style="margin:2px 0;"><strong>Email:</strong> ${user.email}</p>
                    </div>
                    <div style="text-align: right;">
                        <p style="margin:2px 0;"><strong>Invoice Ref:</strong> ${invoiceNumber}</p>
                        <p style="margin:2px 0;"><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
                        <p style="margin:2px 0; color: #d97706; font-weight: bold;">Status: Payment Requested</p>
                    </div>
                </div>

                <h3 style="font-size: 13px; text-transform: uppercase; letter-spacing: 1px; color: #1e3a8a; border-bottom: 2px solid #1e3a8a; padding-bottom: 6px; margin-top: 20px;">Itemized Invoice Statement</h3>
                <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                    <thead>
                        <tr style="background: #f1f5f9; font-size: 10px; text-transform: uppercase; color: #475569;">
                            <th style="padding: 8px; text-align: left;">Description</th>
                            <th style="padding: 8px; text-align: right;">Amount (AUD)</th>
                            <th style="padding: 8px; text-align: right;">Converted (${data.currency})</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHtml}
                    </tbody>
                </table>

                <div style="background: #fffbeb; border: 1px solid #fcd34d; border-radius: 12px; padding: 16px; margin-top: 20px;">
                    <h4 style="margin: 0 0 8px 0; font-size: 12px; color: #92400e; text-transform: uppercase;">Currency & FX Exchange Summary</h4>
                    <p style="margin: 3px 0; font-size: 11px; color: #78350f;">Base Amount: <strong>A$${data.amountAud.toFixed(2)} AUD</strong></p>
                    <p style="margin: 3px 0; font-size: 11px; color: #78350f;">Exchange Rate Applied: <strong>1 AUD = ${data.exchangeRate} ${data.currency}</strong></p>
                    <p style="margin: 6px 0 0 0; font-size: 13px; font-weight: bold; color: #92400e; border-top: 1px solid #fde68a; padding-top: 6px;">Total Payable Amount: ${data.currency} ${data.convertedAmount.toFixed(2)}</p>
                </div>

                <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-top: 20px;">
                    <h3 style="margin: 0 0 10px; font-size: 14px; color: #1e3a8a;">USDT (TRC-20) Payment Instructions</h3>
                    <p style="margin: 3px 0; font-size: 11px; color: #334155;"><strong>Wallet Name:</strong> ${selectedBank.bankName}</p>
                    <p style="margin: 3px 0; font-size: 11px; color: #334155;"><strong>Network:</strong> TRC-20</p>
                    <p style="margin: 3px 0; font-size: 11px; color: #334155;"><strong>USDT Wallet Address:</strong> ${selectedBank.accountNumber}</p>
                    <p style="margin: 3px 0; font-size: 11px; color: #334155;"><strong>Account Name:</strong> ${selectedBank.accountName}</p>
                    <p style="margin: 10px 0 0; font-size: 11px; color: #64748b;"><em>* All payments must be made in USDT on the Tron (TRC-20) network.</em></p>
                    <p style="margin: 3px 0; font-size: 11px; color: #1e3a8a;"><strong>Payment Reference:</strong> ${invoiceNumber} (${candidateNumber})</p>
                </div>

                <div style="margin-top: 24px; text-align: center;">
                    <a href="${avelingUrl}" style="background: #1e3a8a; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 10px; font-size: 12px; font-weight: bold; text-transform: uppercase; display: inline-block;">Upload Transfer Receipt</a>
                </div>
            </div>
        </div>
        `;
        if (user.email) {
            await this.sendCustomEmail(user.email, `Invoice ${invoiceNumber}: ${data.description || 'Sponsorship Payment Request'}`, emailHtml);
        }
        await NotificationService_1.notificationService.sendNotification(userId, `Invoice ${invoiceNumber} Issued`, `An invoice of A$${data.amountAud.toFixed(2)} (${data.currency} ${data.convertedAmount.toFixed(2)}) has been sent to your email with USDT TRC-20 payment details.`);
        return { invoiceNumber, userId, amountAud: data.amountAud, convertedAmount: data.convertedAmount, currency: data.currency, selectedBank };
    }
    /**
     * Admin verifies the A$500 initial deposit receipt.
     * Sets depositPaid=true, notifies candidate, unlocks Tickets 1-3.
     */
    async adminVerifyDeposit(userId, receiptReference) {
        const user = await models_1.User.findByPk(userId);
        if (!user)
            throw new Error('USER_NOT_FOUND');
        await user.update({
            depositPaid: true,
            depositPaidAt: new Date(),
        });
        // Unlock all sequence 1-3 tickets for this user that have payment_verified blocked
        const earlyTickets = await models_1.Ticket.findAll({
            where: { userId, paymentStatus: 'receipt_submitted' },
        });
        const unlocked = [];
        for (const t of earlyTickets) {
            const seq = t.ticketSequenceNumber ?? 1;
            if (seq >= 1 && seq <= DEPOSIT_UNLOCKS_UP_TO) {
                await this.adminApproveTicketReceipt(t.id);
                unlocked.push(t.id);
            }
        }
        await NotificationService_1.notificationService.sendNotification(userId, '✅ Initial Deposit Confirmed — Courses 1–3 Unlocked', `Your A$${DEPOSIT_AMOUNT} initial commitment deposit has been verified. You can now access and pay for your first ${DEPOSIT_UNLOCKS_UP_TO} training modules. To unlock modules 4 and beyond, please remit the remaining programme balance.`);
        if (user.email) {
            await this.sendCustomEmail(user.email, 'Deposit Confirmed — Aveling LMS Courses 1–3 Unlocked', `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
                    <div style="background:#111827;padding:20px 24px;border-radius:8px 8px 0 0;">
                        <h2 style="color:#FFC700;margin:0;font-size:18px;">Deposit Received ✓</h2>
                    </div>
                    <div style="padding:24px;background:#fff;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px;">
                        <p>Hello <strong>${user.fullName}</strong>,</p>
                        <p>Your initial commitment deposit of <strong>A$${DEPOSIT_AMOUNT}</strong> has been received and verified.</p>
                        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin:16px 0;">
                            <p style="margin:0;font-size:14px;font-weight:bold;color:#166534;">✅ Training Modules 1–${DEPOSIT_UNLOCKS_UP_TO} are now unlocked</p>
                            ${receiptReference ? `<p style="margin:4px 0;font-size:12px;color:#4b5563;">Receipt Reference: ${receiptReference}</p>` : ''}
                        </div>
                        <p style="font-size:13px;color:#6b7280;">To unlock Training Module 4 and beyond, the full remaining programme balance must be remitted before your 4th scheduled course (Schedule 1). Log into your Aveling LMS portal to view your payment schedule.</p>
                    </div>
                </div>`);
        }
        return { depositVerified: true, ticketsUnlocked: unlocked };
    }
    /**
     * Admin verifies the full programme balance receipt.
     * Sets fullBalancePaid=true, unlocks ALL remaining tickets for this user.
     */
    async adminVerifyFullBalance(userId, receiptReference) {
        const user = await models_1.User.findByPk(userId);
        if (!user)
            throw new Error('USER_NOT_FOUND');
        await user.update({
            depositPaid: true, // Implied: if paying full balance, deposit is also covered
            depositPaidAt: user.depositPaidAt || new Date(),
            fullBalancePaid: true,
        });
        // Unlock ALL pending tickets for this user
        const pendingTickets = await models_1.Ticket.findAll({
            where: { userId, paymentStatus: 'receipt_submitted' },
        });
        const unlocked = [];
        for (const t of pendingTickets) {
            await this.adminApproveTicketReceipt(t.id);
            unlocked.push(t.id);
        }
        await NotificationService_1.notificationService.sendNotification(userId, '✅ Full Programme Balance Confirmed — All Modules Unlocked', `Your full programme balance payment has been verified. All training modules across your entire sponsorship programme are now accessible. Your candidate wallet will receive the full 100% re-credit upon passing each module.`);
        if (user.email) {
            await this.sendCustomEmail(user.email, 'Full Balance Confirmed — All Aveling LMS Modules Unlocked', `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
                    <div style="background:#111827;padding:20px 24px;border-radius:8px 8px 0 0;">
                        <h2 style="color:#FFC700;margin:0;font-size:18px;">Full Programme Payment Received ✓</h2>
                    </div>
                    <div style="padding:24px;background:#fff;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px;">
                        <p>Hello <strong>${user.fullName}</strong>,</p>
                        <p>Your full programme balance has been received and verified. All training modules are now unlocked.</p>
                        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin:16px 0;">
                            <p style="margin:0;font-size:14px;font-weight:bold;color:#166534;">✅ All Training Modules Unlocked</p>
                            ${receiptReference ? `<p style="margin:4px 0;font-size:12px;color:#4b5563;">Receipt Reference: ${receiptReference}</p>` : ''}
                        </div>
                        <p style="font-size:13px;color:#6b7280;">As you pass each module, your 35% candidate contribution for that module will be automatically re-credited to your Candidate Wallet (Clause 7.1).</p>
                    </div>
                </div>`);
        }
        return { fullBalanceVerified: true, ticketsUnlocked: unlocked };
    }
    /**
     * Returns the payment milestone status for an applicant.
     * Used by both the client portal and the admin panel.
     */
    async getPaymentMilestoneStatus(userId) {
        const user = await models_1.User.findByPk(userId);
        if (!user)
            throw new Error('USER_NOT_FOUND');
        const allTickets = await models_1.Ticket.findAll({
            where: { userId },
            order: [['ticketSequenceNumber', 'ASC'], ['createdAt', 'ASC']],
        });
        const totalCandidateLiability = allTickets.reduce((sum, t) => sum + (t.purchasePrice || 0), 0);
        const paidTicketsCount = allTickets.filter(t => t.paymentStatus === 'payment_verified' || t.courseAccessGranted).length;
        return {
            depositPaid: user.depositPaid,
            depositPaidAt: user.depositPaidAt,
            fullBalancePaid: user.fullBalancePaid,
            depositAmount: DEPOSIT_AMOUNT,
            depositUnlocksUpTo: DEPOSIT_UNLOCKS_UP_TO,
            totalCandidateLiability: Math.min(totalCandidateLiability, SCHEDULE_1_NET_CANDIDATE_TOTAL),
            schedule1NetTotal: SCHEDULE_1_NET_CANDIDATE_TOTAL,
            maxLiabilityCap: MAX_CANDIDATE_LIABILITY,
            candidateTrainingShareTotal: CANDIDATE_TRAINING_SHARE_TOTAL,
            candidateVisaShare: CANDIDATE_VISA_SHARE,
            candidateLicensingShare: CANDIDATE_LICENSING_SHARE,
            totalTickets: allTickets.length,
            paidTicketsCount,
            walletBalance: user.walletBalance || 0,
            tickets: allTickets.map(t => ({
                id: t.id,
                ticketType: t.ticketType,
                ticketSequenceNumber: t.ticketSequenceNumber ?? null,
                purchasePrice: t.purchasePrice,
                paymentStatus: t.paymentStatus,
                courseAccessGranted: t.courseAccessGranted,
                gateStatus: (() => {
                    if (user.fullBalancePaid || t.courseAccessGranted)
                        return 'unlocked';
                    const seq = t.ticketSequenceNumber ?? 1;
                    if (seq <= DEPOSIT_UNLOCKS_UP_TO)
                        return user.depositPaid ? 'deposit_ok' : 'deposit_required';
                    return 'full_balance_required';
                })(),
            })),
        };
    }
    async getTicketById(ticketId, userId) {
        const whereClause = { id: ticketId };
        if (userId)
            whereClause.userId = userId;
        const ticket = await models_1.Ticket.findOne({
            where: whereClause,
            include: [{ model: models_1.User }, { model: models_1.Application, as: 'Application' }]
        });
        if (!ticket)
            throw new Error('TICKET_NOT_FOUND');
        return ticket;
    }
    async createTicket(userId, data) {
        const ticket = await models_1.Ticket.create({
            userId,
            applicationId: data.applicationId || null,
            status: data.status || 'not_possessed',
            ticketNumber: data.ticketNumber || null,
            ticketType: data.ticketType,
            description: data.description || '',
            purchasePrice: data.purchasePrice || 0,
            purchaseDate: data.purchaseDate || null,
            expiryDate: data.expiryDate || null,
            proof: data.proof || null,
            proofThumbnail: data.proofThumbnail || null,
            courseId: data.courseId || null,
            ticketSponsorship: data.applySponsorship ? 'applied' : 'no_application'
        });
        if (data.applySponsorship) {
            await NotificationService_1.notificationService.sendNotification(userId, 'Ticket Sponsorship Application Submitted', `Your sponsorship application for ${ticket.ticketType} has been submitted for admin review.`);
        }
        return ticket;
    }
    async updateTicket(ticketId, userId, data) {
        const ticket = await this.getTicketById(ticketId, userId);
        const newStatus = data.status !== undefined ? data.status : ticket.status;
        await ticket.update({
            status: newStatus,
            ticketNumber: data.ticketNumber !== undefined ? data.ticketNumber : ticket.ticketNumber,
            ticketType: data.ticketType !== undefined ? data.ticketType : ticket.ticketType,
            description: data.description !== undefined ? data.description : ticket.description,
            purchasePrice: data.purchasePrice !== undefined ? data.purchasePrice : ticket.purchasePrice,
            purchaseDate: data.purchaseDate !== undefined ? data.purchaseDate : ticket.purchaseDate,
            expiryDate: data.expiryDate !== undefined ? data.expiryDate : ticket.expiryDate,
            proof: data.proof !== undefined ? data.proof : ticket.proof,
            proofThumbnail: data.proofThumbnail !== undefined ? data.proofThumbnail : ticket.proofThumbnail,
            courseId: newStatus === 'possessed' ? null : (data.courseId !== undefined ? data.courseId : ticket.courseId),
            // Reset course and payment requirements if user already possesses the ticket
            ticketSponsorship: newStatus === 'possessed' ? 'no_application' : ticket.ticketSponsorship,
            paymentStatus: newStatus === 'possessed' ? 'unpaid' : ticket.paymentStatus,
            courseAccessGranted: newStatus === 'possessed' ? false : ticket.courseAccessGranted,
            canApplySponsorship: newStatus === 'possessed' ? false : ticket.canApplySponsorship,
        });
        return ticket;
    }
    async requestRetake(ticketId, userId) {
        const ticket = await this.getTicketById(ticketId, userId);
        if (ticket.ticketSponsorship !== 'first_attempt_failed') {
            throw new Error('Only tickets with a failed first attempt can request a retake.');
        }
        const twoDaysFromNow = new Date();
        twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);
        await ticket.update({
            ticketSponsorship: 'second_attempt_approved',
            paymentStatus: 'unpaid',
            courseAccessGranted: false
        });
        await NotificationService_1.notificationService.sendNotification(userId, 'Retake Approved', `Your retake for ${ticket.ticketType} has been approved. Please complete the payment on Aveling LMS to unlock your second attempt.`);
        return ticket;
    }
    async adminGetAllTickets(filters) {
        const whereClause = {};
        if (filters?.sponsorshipStatus) {
            whereClause.ticketSponsorship = filters.sponsorshipStatus;
        }
        return await models_1.Ticket.findAll({
            where: whereClause,
            include: [{ model: models_1.User }, { model: models_1.Application, as: 'Application' }],
            order: [['updatedAt', 'DESC']]
        });
    }
    async adminUpdateTicket(ticketId, data, includeMail = false) {
        const ticket = await models_1.Ticket.findByPk(ticketId, {
            include: [{ model: models_1.User }]
        });
        if (!ticket)
            throw new Error('TICKET_NOT_FOUND');
        const oldStatus = ticket.ticketSponsorship;
        const newStatus = data.ticketSponsorship || ticket.ticketSponsorship;
        // Removed sponsorship deadline logic
        const updatePayload = {
            status: data.status !== undefined ? data.status : ticket.status,
            ticketNumber: data.ticketNumber !== undefined ? data.ticketNumber : ticket.ticketNumber,
            ticketType: data.ticketType !== undefined ? data.ticketType : ticket.ticketType,
            description: data.description !== undefined ? data.description : ticket.description,
            purchasePrice: data.purchasePrice !== undefined ? data.purchasePrice : ticket.purchasePrice,
            realPrice: data.realPrice !== undefined ? data.realPrice : ticket.realPrice,
            canApplySponsorship: data.canApplySponsorship !== undefined ? data.canApplySponsorship : ticket.canApplySponsorship,
            purchaseDate: data.purchaseDate !== undefined ? data.purchaseDate : ticket.purchaseDate,
            expiryDate: data.expiryDate !== undefined ? data.expiryDate : ticket.expiryDate,
            proof: data.proof !== undefined ? data.proof : ticket.proof,
            proofThumbnail: data.proofThumbnail !== undefined ? data.proofThumbnail : ticket.proofThumbnail,
            ticketSponsorship: newStatus,
            ticketSponsorshipRefundAmount: data.ticketSponsorshipRefundAmount !== undefined ? data.ticketSponsorshipRefundAmount : ticket.ticketSponsorshipRefundAmount,
            courseId: data.courseId !== undefined ? data.courseId : ticket.courseId,
        };
        if (updatePayload.status === 'possessed') {
            updatePayload.courseId = null;
            updatePayload.ticketSponsorship = 'no_application';
            updatePayload.paymentStatus = 'unpaid';
            updatePayload.courseAccessGranted = false;
            updatePayload.canApplySponsorship = false;
        }
        await ticket.update(updatePayload);
        // Always create in-app notification
        const user = ticket.User;
        const message = `Your ticket (${ticket.ticketType}) status has been updated to: ${ticket.ticketSponsorship.replace(/_/g, ' ').toUpperCase()}.`;
        if (user?.id) {
            await NotificationService_1.notificationService.sendNotification(user.id, `Ticket Sponsorship Status Update: ${ticket.ticketType}`, message);
        }
        // Send Email if includeMail is requested (1.4.4) or approval triggered
        if (includeMail || (newStatus === 'first_attempt_approved' || newStatus === 'second_attempt_approved')) {
            await this.sendTicketEmailNotification(ticket, user, newStatus);
        }
        return ticket;
    }
    async processRefundChoice(ticketId, userId, action) {
        const ticket = await this.getTicketById(ticketId, userId);
        if (ticket.ticketSponsorship !== 'ticket_issued') {
            throw new Error('TICKET_NOT_ISSUED_FOR_REFUND');
        }
        if (action === 'use_for_another_ticket') {
            await ticket.update({ refundStatus: 'refunded_to_wallet' });
            await NotificationService_1.notificationService.sendNotification(userId, 'Refund Applied to Next Sponsorship', `Your refund amount of $${ticket.ticketSponsorshipRefundAmount || ticket.purchasePrice} has been credited for your next ticket sponsorship course.`);
        }
        else if (action === 'refund_to_bank') {
            await ticket.update({ refundStatus: 'refunded_to_bank' });
            const user = await models_1.User.findByPk(userId);
            await NotificationService_1.notificationService.sendNotification(userId, 'Bank Refund Requested', `Your refund of $${ticket.ticketSponsorshipRefundAmount || ticket.purchasePrice} has been queued for payout to your registered wallet (${user?.bankName || 'N/A'} - ${user?.accountNumber || 'N/A'}).`);
        }
        return ticket;
    }
    async payTicketOnAveling(ticketId, userId) {
        const ticket = await this.getTicketById(ticketId, userId);
        const avelingCourseUrl = `https://aveling.online/courses/${ticket.courseId || 'ticket-course'}`;
        const user = ticket.User;
        await NotificationService_1.notificationService.sendNotification(userId, 'Ticket Payment Successful', `Payment for ${ticket.ticketType} course completed successfully. You can now access your training on Aveling LMS.`);
        if (user?.email) {
            await this.sendCustomEmail(user.email, `Aveling LMS: Access your ${ticket.ticketType} Course`, `<p>Hello ${user.fullName || 'Learner'},</p>
                 <p>Your payment for <strong>${ticket.ticketType}</strong> was successful!</p>
                 <p>Click the link below to access your course on Aveling LMS:</p>
                 <p><a href="${avelingCourseUrl}" style="background:#1e3a8a;color:#ffffff;padding:10px 20px;text-decoration:none;border-radius:6px;display:inline-block;">Go to Course on Aveling LMS</a></p>`);
        }
        return {
            success: true,
            avelingCourseUrl,
            ticket
        };
    }
    async recordExamOutcome(ticketId, passed, attemptNumber = 1, score) {
        const ticket = await models_1.Ticket.findByPk(ticketId, { include: [{ model: models_1.User }] });
        if (!ticket)
            throw new Error('TICKET_NOT_FOUND');
        const user = ticket.User;
        const clientTicketUrl = `http://localhost:3000/dashboard/tickets/${ticket.id}`;
        if (passed) {
            // Clause 7.1: re-credit exactly 100% of what candidate paid — not a multiplier.
            const refundAmount = ticket.purchasePrice || 100;
            await ticket.update({
                ticketSponsorship: 'ticket_issued',
                status: 'possessed',
                ticketSponsorshipRefundAmount: refundAmount,
            });
            if (user?.id) {
                // Update User wallet balance upon completion
                const currentWallet = user.walletBalance || 0;
                await user.update({ walletBalance: currentWallet + refundAmount });
                // Update Enrollment status to Completed if courseId is present
                if (ticket.courseId) {
                    const { Enrollment } = require('../models');
                    await Enrollment.update({ status: 'Completed' }, { where: { userId: user.id, courseId: ticket.courseId } });
                }
                await NotificationService_1.notificationService.sendNotification(user.id, 'Congratulations! Ticket Issued & Refund Credited', `You passed your exam for ${ticket.ticketType}! Your ticket has been issued and your sponsorship contribution of $${refundAmount.toFixed(2)} AUD has been fully re-credited to your Candidate Wallet (Clause 7.1).`);
                // Clause 8.3: Notify all admins that a mandatory screening interview must be
                // conducted within 72 hours of the candidate's first module pass.
                try {
                    const { User: UserModel } = require('../models');
                    const admins = await UserModel.findAll({ where: { role: 'admin' } });
                    for (const admin of admins) {
                        await NotificationService_1.notificationService.sendNotification(admin.id, `⚠️ 72-Hour Interview Required: ${user.fullName || 'Candidate'}`, `Candidate ${user.fullName || user.email} has passed their first module (${ticket.ticketType}). Per Clause 8.3 of the Sponsorship Agreement, a mandatory screening interview must be conducted within 72 hours.`);
                    }
                }
                catch (e) {
                    console.warn('[TicketService] Admin interview alert failed (non-fatal):', e);
                }
            }
            const candidateNum = user?.candidateNumber || `CND-${10000 + (user?.id || 1)}`;
            if (user?.email) {
                await this.sendCustomEmail(user.email, `Official Exam Results & Digital Ticket: ${ticket.ticketType} (Candidate #${candidateNum})`, `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
                        <div style="background:#111827;padding:20px 24px;border-radius:8px 8px 0 0;text-align:center;">
                            <h2 style="color:#FFC700;margin:0;font-size:20px;">ASSESSMENT PASSED ✓</h2>
                        </div>
                        <div style="padding:24px;background:#fff;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px;">
                            <p>Congratulations <strong>${user.fullName || 'Learner'}</strong> (Candidate #${candidateNum})!</p>
                            <p>You have successfully passed the theory assessment for <strong>${ticket.ticketType}</strong>.</p>
                            
                            <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin:16px 0;">
                                <h3 style="margin:0 0 12px;font-size:14px;text-transform:uppercase;letter-spacing:0.05em;color:#166534;">Your Exam Results</h3>
                                <p style="margin:4px 0;font-size:24px;font-weight:bold;color:#15803d;">Score: ${score !== undefined ? score : 'Passed'}%</p>
                                <p style="margin:4px 0;"><strong>Status:</strong> PASS</p>
                                <p style="margin:4px 0;"><strong>Attempt:</strong> #${attemptNumber}</p>
                            </div>

                            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin:16px 0;">
                                <h3 style="margin:0 0 12px;font-size:14px;text-transform:uppercase;letter-spacing:0.05em;color:#334155;">Ticket Status & Sponsorship Refund</h3>
                                <p style="margin:4px 0;">Your digital <strong>Statement of Attainment (Ticket)</strong> has been officially issued and synced to your recruiter placement portal.</p>
                                <p style="margin:12px 0 4px;font-weight:bold;color:#1f2937;">Eligible Sponsorship Refund Amount Credited to Wallet: <span style="color:#16a34a;">$${refundAmount.toFixed(2)} AUD</span></p>
                            </div>

                            <p style="font-size:13px;color:#6b7280;">You can view and download your digital ticket or request a USDT payout of your refund from your applicant dashboard.</p>
                            
                            <div style="margin-top:24px;text-align:center;">
                                <a href="${clientTicketUrl}" style="background:#0b3486;color:#ffffff;padding:12px 24px;text-decoration:none;border-radius:6px;display:inline-block;font-weight:bold;font-size:14px;">View Digital Ticket & Wallet</a>
                            </div>
                        </div>
                    </div>`);
            }
        }
        else {
            const failedStatus = attemptNumber === 1 ? 'first_attempt_failed' : 'second_attempt_failed';
            await ticket.update({
                ticketSponsorship: failedStatus,
            });
            if (user?.id) {
                await NotificationService_1.notificationService.sendNotification(user.id, 'Exam Attempt Result', `Exam attempt ${attemptNumber} for ${ticket.ticketType} was not successful.`);
            }
            if (user?.email) {
                const isSecondFail = attemptNumber >= 2;
                const subject = isSecondFail
                    ? `Important: Academic Default Notice – ${ticket.ticketType}`
                    : `Exam Result: First Attempt Unsuccessful – ${ticket.ticketType}`;
                const failBody = isSecondFail
                    ? `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
                        <div style="background:#7f1d1d;padding:20px 24px;border-radius:8px 8px 0 0;">
                            <h2 style="color:#fef2f2;margin:0;font-size:18px;">Assessment Default Notice</h2>
                        </div>
                        <div style="padding:24px;background:#fff;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px;">
                            <p>Hello <strong>${user.fullName || 'Candidate'}</strong>,</p>
                            <p>Your second and final attempt at the assessment for <strong>${ticket.ticketType}</strong> was not successful. Under <strong>Clause 6.6.3</strong> of your Sponsorship Agreement (BCR-FIFO-2026-0810), a third attempt is not permitted within the standard sponsored financial structure.</p>
                            <div style="background:#fef2f2;border:1px solid #fca5a5;border-radius:8px;padding:16px;margin:16px 0;">
                                <h3 style="margin:0 0 8px;font-size:13px;text-transform:uppercase;color:#7f1d1d;">Available Remediation Options (Clause 9.2)</h3>
                                <ul style="margin:0;padding-left:20px;font-size:13px;">
                                    <li>A further attempt may be permitted strictly at your sole separate expense, outside company subsidy.</li>
                                    <li>You may be considered for an alternative non-trade occupational stream.</li>
                                    <li>The Agreement may be dissolved for academic default — all previously passed wallet credits remain fully protected and withdrawable.</li>
                                </ul>
                            </div>
                            <p>Your Candidate Wallet balance from any previously passed modules remains fully yours and protected under Clause 7.3. Please contact your recruitment coordinator to discuss next steps.</p>
                            <p><a href="${clientTicketUrl}" style="background:#1e3a8a;color:#fff;padding:10px 20px;text-decoration:none;border-radius:6px;display:inline-block;">View Wallet & Ticket Status</a></p>
                        </div>
                    </div>`
                    : `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
                        <div style="background:#111827;padding:20px 24px;border-radius:8px 8px 0 0;">
                            <h2 style="color:#FFC700;margin:0;font-size:18px;">Exam Result — First Attempt</h2>
                        </div>
                        <div style="padding:24px;background:#fff;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px;">
                            <p>Hello <strong>${user.fullName || 'Learner'}</strong>,</p>
                            <p>Your first attempt at the assessment for <strong>${ticket.ticketType}</strong> was not successful.</p>
                            <div style="background:#fffbeb;border:1px solid #fcd34d;border-radius:8px;padding:16px;margin:16px 0;">
                                <p style="margin:0;font-size:13px;"><strong>Next Step (Clause 6.6.2):</strong> You are entitled to one retake. Your recruitment coordinator will notify you once the retake has been approved. The retake must be completed within <strong>48 hours</strong> of approval for remote online modules.</p>
                            </div>
                            <p><a href="${clientTicketUrl}" style="background:#1e3a8a;color:#fff;padding:10px 20px;text-decoration:none;border-radius:6px;display:inline-block;">View Ticket Status</a></p>
                        </div>
                    </div>`;
                await this.sendCustomEmail(user.email, subject, failBody);
            }
        }
        return {
            ticket,
            clientTicketUrl
        };
    }
    async bulkSeedTickets(ticketsData) {
        const createdTickets = [];
        for (const item of ticketsData) {
            const ticket = await models_1.Ticket.create({
                userId: item.userId,
                ticketType: item.ticketType,
                description: item.description || `Admin assigned ${item.ticketType}`,
                purchasePrice: item.purchasePrice || 150,
                status: item.status || 'not_possessed',
                ticketSponsorship: item.ticketSponsorship || 'first_attempt_approved',
                courseId: item.courseId || null,
            });
            createdTickets.push(ticket);
        }
        return createdTickets;
    }
    async adminDeleteTicket(ticketId) {
        const ticket = await models_1.Ticket.findByPk(ticketId);
        if (!ticket)
            throw new Error('TICKET_NOT_FOUND');
        await ticket.destroy();
    }
    async adminAddApplicationTicket(applicationId, data) {
        const application = await models_1.Application.findByPk(applicationId);
        if (!application)
            throw new Error('APPLICATION_NOT_FOUND');
        const { TicketCatalog, Course } = require('../models');
        let ticketType = data.ticketType;
        let description = data.description || null;
        let realPrice = data.realPrice ?? null;
        let courseId = data.courseId || null;
        // If cloning from a catalog template
        if (data.catalogId) {
            const catalog = await TicketCatalog.findByPk(data.catalogId);
            if (catalog) {
                ticketType = ticketType || catalog.name;
                description = description || catalog.description;
                if (realPrice === null)
                    realPrice = catalog.normalPrice;
            }
        }
        // Auto-link matching course if courseId is not set
        if (!courseId && ticketType) {
            const allCourses = await Course.findAll();
            const lowerType = ticketType.toLowerCase();
            const matched = allCourses.find((c) => {
                const cTitle = (c.title || '').toLowerCase();
                const cCode = (c.code || '').toLowerCase();
                return ((cCode && lowerType.includes(cCode)) ||
                    (cTitle && lowerType.includes(cTitle)) ||
                    (cTitle && cTitle.split(' ').some((word) => word.length > 3 && lowerType.includes(word))));
            });
            if (matched) {
                courseId = matched.id;
            }
        }
        // Avoid duplicate ticket gap for the same application and ticket type
        if (ticketType) {
            const existingTicket = await models_1.Ticket.findOne({
                where: {
                    applicationId,
                    ticketType
                }
            });
            if (existingTicket) {
                return existingTicket;
            }
        }
        const ticket = await models_1.Ticket.create({
            userId: application.userId,
            applicationId: applicationId,
            ticketType: ticketType || 'Certification Ticket Requirement',
            status: 'not_possessed',
            ticketSponsorship: 'no_application',
            description: description,
            realPrice: realPrice,
            purchasePrice: realPrice ?? 0,
            canApplySponsorship: data.canApplySponsorship ?? true,
            courseId: courseId,
        });
        return ticket;
    }
    async adminBatchAddApplicationTickets(applicationId, ticketsData) {
        const application = await models_1.Application.findByPk(applicationId);
        if (!application)
            throw new Error('APPLICATION_NOT_FOUND');
        if (!Array.isArray(ticketsData) || ticketsData.length === 0) {
            throw new Error('NO_TICKETS_PROVIDED');
        }
        const createdTickets = [];
        for (const item of ticketsData) {
            const created = await this.adminAddApplicationTicket(applicationId, item);
            createdTickets.push(created);
        }
        return createdTickets;
    }
    async cloneTicketForApplicant(data) {
        const { User, TicketCatalog, Course } = require('../models');
        const user = await User.findByPk(data.targetUserId);
        if (!user)
            throw new Error('USER_NOT_FOUND');
        let baseTicketType = data.ticketType || 'Work Safely at Heights (RIIWHS204E)';
        let baseDescription = data.description || 'Assigned certification ticket course';
        let defaultRealPrice = 280;
        let defaultSubsidisedPrice = 280 * 0.35;
        let defaultCourseId = data.customCourseId || null;
        if (data.sourceTicketId) {
            const sourceTicket = await models_1.Ticket.findByPk(data.sourceTicketId);
            if (sourceTicket) {
                baseTicketType = sourceTicket.ticketType;
                baseDescription = sourceTicket.description || baseDescription;
                defaultRealPrice = sourceTicket.realPrice ?? sourceTicket.purchasePrice ?? 280;
                defaultCourseId = defaultCourseId || sourceTicket.courseId;
            }
        }
        else if (data.sourceCatalogId) {
            const catalog = await TicketCatalog.findByPk(data.sourceCatalogId);
            if (catalog) {
                baseTicketType = catalog.name;
                baseDescription = catalog.description || baseDescription;
                defaultRealPrice = catalog.normalPrice || 280;
            }
        }
        if (!defaultCourseId) {
            const matchingCourse = await Course.findOne({
                where: {
                    [require('sequelize').Op.or]: [
                        { code: 'RIIWHS204E' },
                        { title: { [require('sequelize').Op.like]: `%${baseTicketType}%` } }
                    ]
                }
            });
            if (matchingCourse) {
                defaultCourseId = matchingCourse.id;
            }
        }
        const realPrice = data.customRealPrice ?? defaultRealPrice;
        const purchasePrice = data.customPurchasePrice ?? realPrice;
        const clonedTicket = await models_1.Ticket.create({
            userId: data.targetUserId,
            applicationId: data.applicationId || null,
            ticketType: baseTicketType,
            description: baseDescription,
            status: 'not_possessed',
            ticketSponsorship: 'applied',
            canApplySponsorship: data.canApplySponsorship ?? true,
            realPrice: realPrice,
            purchasePrice: purchasePrice,
            courseId: defaultCourseId,
            paymentStatus: 'unpaid',
            courseAccessGranted: false
        });
        return clonedTicket;
    }
    async sendTicketEmailNotification(ticket, user, sponsorshipStatus) {
        if (!user?.email)
            return;
        const avelingPayUrl = `https://aveling.online/checkout?ticketId=${ticket.id}&courseId=${ticket.courseId || ''}`;
        const subject = `Ticket Sponsorship Update: ${ticket.ticketType}`;
        let body = `<p>Hello ${user.fullName || 'Applicant'},</p>
                    <p>Your sponsorship for <strong>${ticket.ticketType}</strong> has been updated to <strong>${sponsorshipStatus.replace(/_/g, ' ').toUpperCase()}</strong>.</p>`;
        if (sponsorshipStatus === 'first_attempt_approved' || sponsorshipStatus === 'second_attempt_approved') {
            body += `<p>Please proceed to pay and start your course on Aveling LMS within the next 2 days.</p>
                     <p><a href="${avelingPayUrl}" style="background:#1e3a8a;color:#ffffff;padding:10px 20px;text-decoration:none;border-radius:6px;display:inline-block;">Proceed to Aveling LMS Payment</a></p>`;
        }
        await this.sendCustomEmail(user.email, subject, body);
    }
    async sendCustomEmail(to, subject, htmlContent) {
        try {
            await (0, email_1.sendAvelingEmail)(to, subject, htmlContent);
        }
        catch (e) {
            // Non-fatal: log and continue — email failure must not break the ticket flow
            console.warn(`[TicketService] Email to ${to} failed (non-fatal):`, e?.message || e);
        }
    }
    // STEP-1.1.11: Admin approves payment receipt → sets Enrollment to active/paid, notifies learner
    async adminApproveTicketReceipt(ticketId) {
        const ticket = await models_1.Ticket.findByPk(ticketId, { include: [{ model: models_1.User }] });
        if (!ticket)
            throw new Error('TICKET_NOT_FOUND');
        const user = ticket.User;
        // Mark the ticket as receipt-verified (unlock course)
        await ticket.update({
            paymentStatus: 'payment_verified',
            courseAccessGranted: true
        });
        // Set the enrollment for this course as active/paid if valid course exists
        if (ticket.courseId && user?.id) {
            const { Enrollment, Course } = require('../models');
            const validCourse = await Course.findByPk(ticket.courseId);
            if (validCourse) {
                const existingEnrollment = await Enrollment.findOne({
                    where: { userId: user.id, courseId: ticket.courseId }
                });
                if (existingEnrollment) {
                    await existingEnrollment.update({ paymentStatus: 'Paid', status: 'Active' });
                }
                else {
                    await Enrollment.create({
                        userId: user.id,
                        courseId: ticket.courseId,
                        paymentStatus: 'Paid',
                        status: 'Active',
                        amountPaid: ticket.purchasePrice ?? 0
                    });
                }
            }
            else {
                console.warn(`[TicketService] Ticket #${ticket.id} references non-existent courseId ${ticket.courseId}. Skipping Enrollment creation.`);
            }
        }
        // Notify learner that course is unlocked
        if (user?.id) {
            await NotificationService_1.notificationService.sendNotification(user.id, 'Course Unlocked!', `Your payment receipt for ${ticket.ticketType} has been verified by our team. Your course modules are now available to access.`);
        }
        if (user?.email && ticket.courseId) {
            const courseUrl = `https://aveling.online/courses/${ticket.courseId}`;
            await this.sendCustomEmail(user.email, `Course Access Unlocked: ${ticket.ticketType}`, `<p>Hello ${user.fullName || 'Learner'},</p>
                 <p>Your payment receipt has been verified by our admin team. Your course is now unlocked!</p>
                 <p><a href="${courseUrl}" style="background:#FFC700;color:#000;padding:12px 24px;text-decoration:none;border-radius:6px;display:inline-block;font-weight:bold;">Start Your Course Now</a></p>`);
        }
        return ticket;
    }
    // STEP-1.1.20: Set review-awaiting status on exam submission (before grading)
    async setExamReviewAwaiting(ticketId, userId) {
        const ticket = await models_1.Ticket.findByPk(ticketId);
        if (!ticket)
            throw new Error('TICKET_NOT_FOUND');
        if (ticket.courseId) {
            const { Enrollment } = require('../models');
            await Enrollment.update({ status: 'Review-Awaiting' }, { where: { userId, courseId: ticket.courseId } });
        }
        return { success: true };
    }
    async getExamAttemptsForTicket(ticketId) {
        const ticket = await models_1.Ticket.findByPk(ticketId);
        if (!ticket)
            throw new Error('TICKET_NOT_FOUND');
        if (!ticket.courseId || !ticket.userId) {
            return [];
        }
        const { ExamAttempt } = require('../models');
        const attempts = await ExamAttempt.findAll({
            where: {
                userId: ticket.userId,
                courseId: ticket.courseId
            },
            order: [['createdAt', 'DESC']]
        });
        return attempts;
    }
    // Generate Aveling login credentials for an approved-sponsorship candidate
    async generateAvelingCredentials(ticketId) {
        const ticket = await models_1.Ticket.findByPk(ticketId, { include: [{ model: models_1.User }] });
        if (!ticket)
            throw new Error('TICKET_NOT_FOUND');
        const user = ticket.User;
        if (!user)
            throw new Error('USER_NOT_FOUND');
        // Check sponsorship is approved
        if (!['first_attempt_approved', 'second_attempt_approved'].includes(ticket.ticketSponsorship)) {
            throw new Error('TICKET_NOT_APPROVED');
        }
        // Generate simple credentials if not already set
        const username = user.avelingUsername || `${user.candidateNumber || `AV${user.id}`}`.toLowerCase();
        const rawPassword = user.avelingPassword || Math.random().toString(36).slice(2, 10).toUpperCase();
        await user.update({ avelingUsername: username, avelingPassword: rawPassword });
        const bankSettings = {
            platform_bank_name: 'Corporate Binance Wallet',
            platform_bank_account_number: 'T...',
            platform_bank_account_name: 'FIFO Training Operations'
        };
        const realPrice = ticket.realPrice ?? 0;
        const subsidyPct = user.subsidyPercentage ?? 70;
        const courseFee = realPrice ? Number((realPrice * (1 - subsidyPct / 100)).toFixed(2)) : (ticket.purchasePrice ?? 0);
        // Send credentials + payment instructions email
        if (user.email) {
            await this.sendCustomEmail(user.email, `Your Aveling LMS Login & Payment Instructions – ${ticket.ticketType}`, `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
                    <div style="background:#111827;padding:20px 24px;border-radius:8px 8px 0 0;">
                        <h2 style="color:#FFC700;margin:0;font-size:20px;">Aveling LMS — Ticket Sponsorship</h2>
                    </div>
                    <div style="padding:24px;background:#fff;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px;">
                        <p>Hello <strong>${user.fullName}</strong>,</p>
                        <p>Your sponsorship application for <strong>${ticket.ticketType}</strong> has been <span style="color:#16a34a;font-weight:bold;">APPROVED</span>.</p>

                        <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin:16px 0;">
                            <h3 style="margin:0 0 12px;font-size:14px;text-transform:uppercase;letter-spacing:0.05em;color:#6b7280;">Your Aveling LMS Login</h3>
                            <p style="margin:4px 0;"><strong>Login URL:</strong> <a href="${process.env.AVELING_URL || 'https://aveling.online'}">${process.env.AVELING_URL || 'https://aveling.online'}</a></p>
                            <p style="margin:4px 0;"><strong>Username:</strong> <code style="background:#f3f4f6;padding:2px 6px;border-radius:4px;">${username}</code></p>
                            <p style="margin:4px 0;"><strong>Password:</strong> <code style="background:#f3f4f6;padding:2px 6px;border-radius:4px;">${rawPassword}</code></p>
                        </div>

                        <div style="background:#fffbeb;border:1px solid #fcd34d;border-radius:8px;padding:16px;margin:16px 0;">
                            <h3 style="margin:0 0 12px;font-size:14px;text-transform:uppercase;letter-spacing:0.05em;color:#92400e;">Course Fee & Payment</h3>
                            ${realPrice && realPrice > courseFee ? `<p style="margin:4px 0;color:#6b7280;"><del>Full price: $${realPrice.toFixed(2)}</del></p>` : ''}
                            <p style="margin:4px 0;font-size:18px;font-weight:bold;color:#1f2937;">Your Price: $${courseFee.toFixed(2)} AUD ${realPrice && realPrice > courseFee ? '<span style="color:#16a34a;font-size:12px;">(Subsidised)</span>' : ''}</p>
                            <p style="margin:8px 0 4px;color:#6b7280;font-size:13px;">This amount is <strong>fully refundable</strong> upon passing your exam.</p>
                        </div>

                        ${bankSettings.platform_bank_name ? `
                        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin:16px 0;">
                            <h3 style="margin:0 0 12px;font-size:14px;text-transform:uppercase;letter-spacing:0.05em;color:#166534;">USDT (TRC-20) Wallet Details</h3>
                            <p style="margin:4px 0;"><strong>Wallet Name:</strong> ${bankSettings.platform_bank_name}</p>
                            <p style="margin:4px 0;"><strong>Network:</strong> TRC-20</p>
                            <p style="margin:4px 0;"><strong>USDT Wallet Address:</strong> ${bankSettings.platform_bank_account_number}</p>
                            <p style="margin:4px 0;"><strong>Account Name:</strong> ${bankSettings.platform_bank_account_name}</p>
                            <p style="margin: 8px 0 0; font-size: 12px; color: #991b1b;">* Note: All incoming candidate transfers must execute strictly via USDT on the TRC-20 (Tron) network. Other networks or currencies are rejected.</p>
                        </div>` : ''}

                        <p style="font-size:13px;color:#6b7280;">After making your USDT transfer, log into Aveling and upload your transaction receipt. Course materials will unlock once admin verifies your payment.</p>
                    </div>
                </div>`);
        }
        return { username, password: rawPassword, credentialsGenerated: true };
    }
    // Candidate submits payment receipt (or pays via wallet)
    async submitReceipt(ticketId, userId, data) {
        const effectiveUserId = userId || data?.userId;
        const whereClause = { id: ticketId };
        if (effectiveUserId) {
            whereClause.userId = effectiveUserId;
        }
        const ticket = await models_1.Ticket.findOne({ where: whereClause, include: [{ model: models_1.User }] });
        if (!ticket)
            throw new Error('TICKET_NOT_FOUND');
        const user = ticket.User;
        if (!user)
            throw new Error('USER_NOT_FOUND');
        let coursePrice = ticket.purchasePrice ?? 0;
        const realPrice = ticket.realPrice ?? 0;
        if (realPrice) {
            const subsidyPct = user.subsidyPercentage ?? 70;
            coursePrice = Number((realPrice * (1 - subsidyPct / 100)).toFixed(2));
        }
        let isFullyCovered = false;
        if (data?.useWallet && user.walletBalance && user.walletBalance > 0) {
            if (user.walletBalance >= coursePrice) {
                // Wallet fully covers the price
                await user.update({ walletBalance: user.walletBalance - coursePrice });
                isFullyCovered = true;
            }
            else {
                // Wallet partially covers the price
                coursePrice = coursePrice - user.walletBalance; // Remaining balance to pay via bank
                await user.update({ walletBalance: 0 });
            }
        }
        if (isFullyCovered) {
            // Auto-verify payment
            await ticket.update({
                paymentStatus: 'payment_verified',
                courseAccessGranted: true,
                receiptReference: 'WALLET_PAYMENT',
            });
            // Unlock course enrollment if valid course exists
            if (ticket.courseId && user?.id) {
                const { Enrollment, Course } = require('../models');
                const validCourse = await Course.findByPk(ticket.courseId);
                if (validCourse) {
                    const existingEnrollment = await Enrollment.findOne({
                        where: { userId: user.id, courseId: ticket.courseId }
                    });
                    if (existingEnrollment) {
                        await existingEnrollment.update({ paymentStatus: 'Paid', status: 'Active' });
                    }
                    else {
                        await Enrollment.create({
                            userId: user.id,
                            courseId: ticket.courseId,
                            paymentStatus: 'Paid',
                            status: 'Active',
                            amountPaid: coursePrice
                        });
                    }
                }
                else {
                    console.warn(`[TicketService] Ticket #${ticket.id} references non-existent courseId ${ticket.courseId}. Skipping Enrollment creation.`);
                }
            }
            await NotificationService_1.notificationService.sendNotification(user.id, 'Payment Verified via Wallet', `Your payment for ${ticket.ticketType} was fully covered by your wallet balance. Course unlocked!`);
        }
        else {
            // Standard bank receipt submission
            await ticket.update({
                paymentStatus: 'receipt_submitted',
                receiptReference: data?.receiptReference || null,
                receiptUrl: data?.receiptUrl || null,
            });
            // Notify admins
            const { User: UserModel } = require('../models');
            const admins = await UserModel.findAll({ where: { role: 'admin' } });
            for (const admin of admins) {
                await NotificationService_1.notificationService.sendNotification(admin.id, 'Payment Receipt Submitted', `Candidate submitted a receipt for ${ticket.ticketType} (Ticket #${ticket.id}). Please verify.`);
            }
        }
        return ticket;
    }
    // Admin validates payment and unlocks course access
    async adminValidatePayment(ticketId) {
        const ticket = await models_1.Ticket.findByPk(ticketId, { include: [{ model: models_1.User }] });
        if (!ticket)
            throw new Error('TICKET_NOT_FOUND');
        const user = ticket.User;
        await ticket.update({
            paymentStatus: 'payment_verified',
            courseAccessGranted: true,
        });
        if (user?.id) {
            await NotificationService_1.notificationService.sendNotification(user.id, 'Payment Verified – Course Unlocked!', `Your payment for ${ticket.ticketType} has been verified. Log into Aveling LMS to start your course and exam.`);
        }
        if (user?.email && ticket.courseId) {
            const courseUrl = `${process.env.AVELING_URL || 'https://aveling.online'}/courses/${ticket.courseId}`;
            await this.sendCustomEmail(user.email, `Payment Verified – Start Your Course Now: ${ticket.ticketType}`, `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
                    <div style="background:#111827;padding:20px 24px;border-radius:8px 8px 0 0;">
                        <h2 style="color:#FFC700;margin:0;">Payment Verified ✓</h2>
                    </div>
                    <div style="padding:24px;background:#fff;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px;">
                        <p>Hello <strong>${user.fullName}</strong>,</p>
                        <p>Your payment for <strong>${ticket.ticketType}</strong> has been verified by our admin team.</p>
                        <p>Your course materials and exam are now accessible on Aveling LMS.</p>
                        <p><a href="${courseUrl}" style="background:#FFC700;color:#000;padding:12px 24px;text-decoration:none;border-radius:6px;display:inline-block;font-weight:bold;">Start Your Course Now →</a></p>
                        <p style="font-size:12px;color:#6b7280;margin-top:16px;">Remember: exam results undergo a proper grading review process. Results will be communicated to you once grading is complete.</p>
                    </div>
                </div>`);
        }
        return ticket;
    }
    // Admin marks exam result (subject to approval - candidate sees "grading in progress")
    async adminApproveExamResult(ticketId, passed) {
        return this.recordExamOutcome(ticketId, passed);
    }
    // Clause 7.4: Candidate wallet statement (itemised ledger issued within 48hrs on request)
    async getCandidateWalletStatement(userId) {
        const { User: UserModel } = require('../models');
        const user = await UserModel.findByPk(userId);
        if (!user)
            throw new Error('USER_NOT_FOUND');
        // Get all tickets for this candidate
        const tickets = await models_1.Ticket.findAll({ where: { userId } });
        const entries = [];
        for (const t of tickets) {
            if (t.purchasePrice && t.purchasePrice > 0) {
                entries.push({
                    ticketType: t.ticketType,
                    event: 'Candidate Contribution Paid',
                    amount: -(t.purchasePrice),
                    date: t.createdAt ? new Date(t.createdAt).toISOString() : 'N/A',
                });
            }
            if (t.ticketSponsorship === 'ticket_issued' && t.ticketSponsorshipRefundAmount) {
                entries.push({
                    ticketType: t.ticketType,
                    event: 'Course Passed – 100% Re-Credit (Clause 7.1)',
                    amount: t.ticketSponsorshipRefundAmount,
                    date: t.updatedAt ? new Date(t.updatedAt).toISOString() : 'N/A',
                });
            }
        }
        return {
            candidateId: userId,
            candidateNumber: user.candidateNumber || `CND-${10000 + userId}`,
            fullName: user.fullName,
            currentWalletBalance: user.walletBalance || 0,
            maximumCandidateLiability: 3599.20, // Clause 5.2
            entries,
            generatedAt: new Date().toISOString(),
        };
    }
    // Clause 9.2: Admin remediation after second_attempt_failed
    // Options: (a) paid_third_attempt | (b) role_reassignment | (c) terminate
    async adminRemediateSecondFail(ticketId, action, notes) {
        const ticket = await models_1.Ticket.findByPk(ticketId, { include: [{ model: models_1.User }] });
        if (!ticket)
            throw new Error('TICKET_NOT_FOUND');
        if (ticket.ticketSponsorship !== 'second_attempt_failed') {
            throw new Error('TICKET_NOT_IN_SECOND_FAIL_STATE');
        }
        const user = ticket.User;
        if (action === 'paid_third_attempt') {
            // Option (a): allow further attempt at candidate's sole cost
            await ticket.update({
                ticketSponsorship: 'second_attempt_approved', // Re-open, but payment is now outside subsidy
                paymentStatus: 'unpaid',
                courseAccessGranted: false,
                description: `${ticket.description || ''} [Clause 9.2(a): Third attempt authorised at candidate cost. Notes: ${notes || 'N/A'}]`,
            });
            if (user?.id) {
                await NotificationService_1.notificationService.sendNotification(user.id, 'Remediation: Third Attempt Authorised (Candidate Cost)', `Per Clause 9.2(a), a further attempt has been authorised for ${ticket.ticketType} strictly at your personal expense, outside company subsidy. Please make payment to proceed.`);
            }
        }
        else if (action === 'role_reassignment') {
            // Option (b): reassign to alternative occupational stream
            await ticket.update({
                ticketSponsorship: 'no_application',
                description: `${ticket.description || ''} [Clause 9.2(b): Reassigned to alternative role. Notes: ${notes || 'N/A'}]`,
            });
            if (user?.id) {
                await NotificationService_1.notificationService.sendNotification(user.id, 'Placement Update: Alternative Role Consideration', `Following your assessment results for ${ticket.ticketType}, our team will consider you for an alternative non-trade occupational stream better suited to your current capabilities (Clause 9.2(b)).`);
            }
        }
        else if (action === 'terminate') {
            // Option (c): terminate agreement for academic default – wallet credits remain
            await ticket.update({
                ticketSponsorship: 'second_attempt_failed', // keep status, add note
                description: `${ticket.description || ''} [Clause 9.2(c): Agreement dissolved for academic default. All passed wallet credits remain fully withdrawable. Notes: ${notes || 'N/A'}]`,
            });
            if (user?.id) {
                await NotificationService_1.notificationService.sendNotification(user.id, 'Agreement Dissolved – Wallet Credits Protected', `Your Sponsorship Agreement has been dissolved for academic default following the second assessment failure for ${ticket.ticketType} (Clause 9.2(c)). Your Candidate Wallet balance from all previously passed modules remains fully yours and withdrawable.`);
            }
        }
        return ticket;
    }
    // Bulk ticket creation for an applicant (Assign all tickets at once)
    async assignAllTicketsToUser(userId, customTickets) {
        const { User: UserModel } = require('../models');
        const user = await UserModel.findByPk(userId);
        if (!user)
            throw new Error('USER_NOT_FOUND');
        const defaultPackage = [
            {
                ticketType: 'EEHA Certification (Hazardous Areas)',
                description: 'Electrical Equipment in Hazardous Areas (UEE42620 / EEHA) Competency Ticket',
                realPrice: 1850.00,
                canApplySponsorship: true,
                courseId: 'eeha-cert-01'
            },
            {
                ticketType: 'Standard 11 Mining Induction (WA)',
                description: 'Surface and Underground Mining Health and Safety Induction (RIIRIS301E)',
                realPrice: 690.00,
                canApplySponsorship: true,
                courseId: 'std11-mining-02'
            },
            {
                ticketType: 'White Card WA (CPCWHS1001)',
                description: 'Prepare to Work Safely in the Construction Industry (CPCWHS1001)',
                realPrice: 95.00,
                canApplySponsorship: true,
                courseId: 'whitecard-wa-03'
            },
            {
                ticketType: 'Working at Heights (RIIWHS204E)',
                description: 'Work Safely at Heights Competency Ticket (RIIWHS204E)',
                realPrice: 270.00,
                canApplySponsorship: true,
                courseId: 'heights-04'
            },
            {
                ticketType: 'Confined Space Entry (RIIWHS202E)',
                description: 'Enter and Work in Confined Spaces Competency Ticket (RIIWHS202E)',
                realPrice: 290.00,
                canApplySponsorship: true,
                courseId: 'confined-space-05'
            },
            {
                ticketType: 'Gas Test Atmospheres (MSMWHS217)',
                description: 'Conduct Gas Testing Atmospheres Competency Ticket (MSMWHS217)',
                realPrice: 190.00,
                canApplySponsorship: true,
                courseId: 'gas-test-06'
            },
            {
                ticketType: 'Provide First Aid (HLTAID011)',
                description: 'Provide First Aid and CPR Competency Ticket (HLTAID011)',
                realPrice: 160.00,
                canApplySponsorship: true,
                courseId: 'first-aid-07'
            }
        ];
        const ticketsToCreate = (customTickets && customTickets.length > 0) ? customTickets : defaultPackage;
        const createdTickets = [];
        for (const item of ticketsToCreate) {
            // Check if ticket of same type already exists for this user
            const existing = await models_1.Ticket.findOne({ where: { userId, ticketType: item.ticketType } });
            if (!existing) {
                const created = await models_1.Ticket.create({
                    userId,
                    ticketType: item.ticketType,
                    status: 'not_possessed',
                    ticketSponsorship: 'no_application',
                    realPrice: item.realPrice,
                    purchasePrice: item.realPrice,
                    canApplySponsorship: item.canApplySponsorship !== false,
                    courseId: item.courseId || null,
                    description: item.description || null
                });
                createdTickets.push(created);
            }
        }
        if (createdTickets.length > 0) {
            await NotificationService_1.notificationService.sendNotification(userId, 'Sponsorship Ticket Package Configured', `Your recruitment manager has assigned your complete ${createdTickets.length}-ticket sponsorship package. Log in to your candidate portal to submit your sponsorship application.`);
        }
        return createdTickets;
    }
    // Applicant applies for sponsorship of their assigned ticket package
    async applyBatchPackageSponsorship(userId, bankData) {
        const { User: UserModel } = require('../models');
        const user = await UserModel.findByPk(userId);
        if (!user)
            throw new Error('USER_NOT_FOUND');
        // Save bank account info on user profile
        await user.update({
            bankName: bankData.bankName,
            accountNumber: bankData.accountNumber,
            accountName: bankData.accountName
        });
        // Find all unpossessed tickets for user with 'no_application'
        const tickets = await models_1.Ticket.findAll({
            where: {
                userId,
                status: 'not_possessed',
                ticketSponsorship: 'no_application'
            }
        });
        if (tickets.length === 0) {
            throw new Error('NO_ELIGIBLE_TICKETS_FOR_SPONSORSHIP');
        }
        for (const t of tickets) {
            await t.update({ ticketSponsorship: 'applied' });
        }
        const { Application, JobStage } = require('../models');
        const application = await Application.findOne({
            where: { userId },
            order: [['createdAt', 'DESC']]
        });
        if (application) {
            const stage = await JobStage.findOne({
                where: { applicationId: application.id, name: 'TicketSponsorship' }
            });
            if (stage) {
                await stage.update({ status: 'under-review' });
            }
        }
        if (user.email) {
            await (0, email_1.sendInfoEmail)(user.email, 'Sponsorship Application Review Confirmation', `<p>Dear ${user.fullName},</p>
                 <p>Your full package sponsorship application for ${tickets.length} ticket requirement(s) has been successfully submitted and is currently under review.</p>
                 <p>Our team will review your application and you will receive an official approval notice shortly.</p>
                 <p>Thank you,<br>Blue Collar Recruitment</p>`);
        }
        await NotificationService_1.notificationService.sendNotification(userId, 'Package Sponsorship Application Submitted', `Your sponsorship application for ${tickets.length} ticket requirement(s) has been submitted for administrative review. An invoice and approval notice will be issued shortly.`);
        return { count: tickets.length, tickets };
    }
    // Admin approves candidate's ticket package and dispatches official corporate invoice with selected bank account
    async approveSponsorshipPackage(userId) {
        const { User: UserModel } = require('../models');
        const user = await UserModel.findByPk(userId);
        if (!user)
            throw new Error('USER_NOT_FOUND');
        const tickets = await models_1.Ticket.findAll({ where: { userId } });
        const appliedTickets = tickets.filter(t => t.ticketSponsorship === 'applied');
        // Transition applied tickets to 'first_attempt_approved'
        for (const t of appliedTickets) {
            await t.update({
                ticketSponsorship: 'first_attempt_approved'
            });
        }
        await NotificationService_1.notificationService.sendNotification(userId, 'Sponsorship Package Approved', `Your ticket sponsorship application has been approved by Blue Collar Recruitment! You will receive your training invoice from Aveling shortly.`);
        return { ticketsApproved: appliedTickets.length };
    }
}
exports.TicketService = TicketService;
exports.ticketService = new TicketService();
