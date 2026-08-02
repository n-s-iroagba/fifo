"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ticketService = exports.TicketService = void 0;
const models_1 = require("../models");
const NotificationService_1 = require("./NotificationService");
const nodemailer_1 = __importDefault(require("nodemailer"));
class TicketService {
    async getUserTickets(userId) {
        return await models_1.Ticket.findAll({
            where: { userId },
            include: [{ model: models_1.Application, as: 'Application' }],
            order: [['createdAt', 'DESC']]
        });
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
            bankName: data.bankName || null,
            accountNumber: data.accountNumber || null,
            accountName: data.accountName || null,
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
        await ticket.update({
            status: data.status !== undefined ? data.status : ticket.status,
            ticketNumber: data.ticketNumber !== undefined ? data.ticketNumber : ticket.ticketNumber,
            ticketType: data.ticketType !== undefined ? data.ticketType : ticket.ticketType,
            description: data.description !== undefined ? data.description : ticket.description,
            purchasePrice: data.purchasePrice !== undefined ? data.purchasePrice : ticket.purchasePrice,
            purchaseDate: data.purchaseDate !== undefined ? data.purchaseDate : ticket.purchaseDate,
            expiryDate: data.expiryDate !== undefined ? data.expiryDate : ticket.expiryDate,
            proof: data.proof !== undefined ? data.proof : ticket.proof,
            proofThumbnail: data.proofThumbnail !== undefined ? data.proofThumbnail : ticket.proofThumbnail,
            bankName: data.bankName !== undefined ? data.bankName : ticket.bankName,
            accountNumber: data.accountNumber !== undefined ? data.accountNumber : ticket.accountNumber,
            accountName: data.accountName !== undefined ? data.accountName : ticket.accountName,
            courseId: data.courseId !== undefined ? data.courseId : ticket.courseId,
        });
        return ticket;
    }
    async applySponsorship(ticketId, userId, bankDetails) {
        const ticket = await this.getTicketById(ticketId, userId);
        await ticket.update({
            ticketSponsorship: 'applied',
            bankName: bankDetails.bankName,
            accountNumber: bankDetails.accountNumber,
            accountName: bankDetails.accountName,
        });
        await NotificationService_1.notificationService.sendNotification(userId, 'Sponsorship Application Received', `Your sponsorship request for ${ticket.ticketType} is now being processed by administration.`);
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
        let sponsorshipDeadline = ticket.sponsorshipDeadline;
        // If sponsorship approved, set deadline to 3 days after approval
        if ((newStatus === 'first_attempt_approved' || newStatus === 'second_attempt_approved') &&
            oldStatus !== newStatus) {
            const threeDaysFromNow = new Date();
            threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
            sponsorshipDeadline = threeDaysFromNow;
        }
        else if (data.sponsorshipDeadline) {
            sponsorshipDeadline = new Date(data.sponsorshipDeadline);
        }
        await ticket.update({
            status: data.status !== undefined ? data.status : ticket.status,
            ticketNumber: data.ticketNumber !== undefined ? data.ticketNumber : ticket.ticketNumber,
            ticketType: data.ticketType !== undefined ? data.ticketType : ticket.ticketType,
            description: data.description !== undefined ? data.description : ticket.description,
            purchasePrice: data.purchasePrice !== undefined ? data.purchasePrice : ticket.purchasePrice,
            purchaseDate: data.purchaseDate !== undefined ? data.purchaseDate : ticket.purchaseDate,
            expiryDate: data.expiryDate !== undefined ? data.expiryDate : ticket.expiryDate,
            proof: data.proof !== undefined ? data.proof : ticket.proof,
            proofThumbnail: data.proofThumbnail !== undefined ? data.proofThumbnail : ticket.proofThumbnail,
            ticketSponsorship: newStatus,
            ticketSponsorshipRefundAmount: data.ticketSponsorshipRefundAmount !== undefined ? data.ticketSponsorshipRefundAmount : ticket.ticketSponsorshipRefundAmount,
            sponsorshipDeadline,
            bankName: data.bankName !== undefined ? data.bankName : ticket.bankName,
            accountNumber: data.accountNumber !== undefined ? data.accountNumber : ticket.accountNumber,
            accountName: data.accountName !== undefined ? data.accountName : ticket.accountName,
            courseId: data.courseId !== undefined ? data.courseId : ticket.courseId,
        });
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
            await NotificationService_1.notificationService.sendNotification(userId, 'Bank Refund Requested', `Your refund of $${ticket.ticketSponsorshipRefundAmount || ticket.purchasePrice} has been queued for payout to your registered bank account (${ticket.bankName} - ${ticket.accountNumber}).`);
        }
        return ticket;
    }
    async payTicketOnAveling(ticketId, userId) {
        const ticket = await this.getTicketById(ticketId, userId);
        const avelingCourseUrl = `http://localhost:3002/courses/${ticket.courseId || 'ticket-course'}`;
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
    async recordExamOutcome(ticketId, passed, attemptNumber = 1) {
        const ticket = await models_1.Ticket.findByPk(ticketId, { include: [{ model: models_1.User }] });
        if (!ticket)
            throw new Error('TICKET_NOT_FOUND');
        const user = ticket.User;
        const clientTicketUrl = `http://localhost:3000/dashboard/tickets/${ticket.id}`;
        if (passed) {
            const refundMultiplier = attemptNumber >= 2 ? 2 : 1;
            const refundAmount = (ticket.purchasePrice || 100) * refundMultiplier;
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
                await NotificationService_1.notificationService.sendNotification(user.id, 'Congratulations! Ticket Issued & Refund Credited', `You passed your exam for ${ticket.ticketType}! Your ticket has been issued and your refund of $${refundAmount} has been credited to your wallet.`);
            }
            const candidateNum = user?.candidateNumber || `CND-${10000 + (user?.id || 1)}`;
            if (user?.email) {
                await this.sendCustomEmail(user.email, `Ticket Issued: ${ticket.ticketType} (Candidate #${candidateNum})`, `<p>Congratulations ${user.fullName || 'Learner'} (Candidate #${candidateNum})!</p>
                     <p>You have successfully passed your exam for <strong>${ticket.ticketType}</strong>. Your ticket is now issued.</p>
                     <p>Eligible Refund Amount Credited to Wallet: <strong>$${refundAmount}</strong></p>
                     <p><a href="${clientTicketUrl}">View Ticket Details & Wallet Balance</a></p>`);
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
                await this.sendCustomEmail(user.email, `Exam Result Update: ${ticket.ticketType}`, `<p>Hello ${user.fullName || 'Learner'},</p>
                     <p>Your exam attempt #${attemptNumber} for <strong>${ticket.ticketType}</strong> was not successful.</p>
                     <p><a href="${clientTicketUrl}">View Ticket Status & Options</a></p>`);
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
                bankName: item.bankName || 'Commonwealth Bank',
                accountNumber: item.accountNumber || '10293847',
                accountName: item.accountName || 'FIFO Training PTY LTD'
            });
            createdTickets.push(ticket);
        }
        return createdTickets;
    }
    async sendCheckoutPaymentEmail(ticketId) {
        const ticket = await models_1.Ticket.findByPk(ticketId, { include: [{ model: models_1.User }] });
        if (!ticket)
            throw new Error('TICKET_NOT_FOUND');
        const user = ticket.User;
        if (!user)
            return { success: false, message: 'User not found' };
        // Ensure candidate number exists
        if (!user.candidateNumber) {
            const candidateNum = `CND-${10000 + user.id}`;
            await user.update({ candidateNumber: candidateNum });
        }
        const candidateNum = user.candidateNumber;
        const checkoutUrl = `http://localhost:3002/checkout?ticketId=${ticket.id}&candidateNumber=${candidateNum}`;
        const { BankAccount } = require('../models');
        const bank = await BankAccount.findOne({ where: { isActive: true } });
        const bankName = bank?.bankName || 'Commonwealth Bank Australia';
        const accountNumber = bank?.accountNumber || '062-000 12345678';
        const accountName = bank?.bankName ? 'FIFO Training Operations' : 'Aveling Training PTY LTD';
        const subject = `Payment Details & Instructions for ${ticket.ticketType} (Candidate #${candidateNum})`;
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; padding: 24px;">
                <h2 style="color: #1e3a8a; margin-top: 0;">Sponsored Course Payment Instructions</h2>
                <p>Hello <strong>${user.fullName}</strong>,</p>
                <p>Your candidate registration number is: <strong style="font-size: 16px; color: #d97706;">${candidateNum}</strong></p>
                <p>Here are the payment details for your sponsored ticket course <strong>${ticket.ticketType}</strong>:</p>
                
                <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; padding: 16px; margin: 20px 0;">
                    <p style="margin: 4px 0;"><strong>Bank Name:</strong> ${bankName}</p>
                    <p style="margin: 4px 0;"><strong>Account Name:</strong> ${accountName}</p>
                    <p style="margin: 4px 0;"><strong>Account Number / BSB:</strong> ${accountNumber}</p>
                    <p style="margin: 4px 0;"><strong>Payment Reference:</strong> ${candidateNum}-${ticket.id}</p>
                    <p style="margin: 4px 0;"><strong>Amount Due:</strong> $${ticket.purchasePrice || 150}</p>
                </div>

                <p>Please complete your payment and click the button below to upload your payment receipt proof:</p>
                <p><a href="${checkoutUrl}" style="background:#1e3a8a;color:#ffffff;padding:12px 24px;text-decoration:none;border-radius:6px;display:inline-block;font-weight:bold;">Go to Checkout & Upload Receipt</a></p>
            </div>
        `;
        await this.sendCustomEmail(user.email, subject, html);
        return { success: true, candidateNum, checkoutUrl };
    }
    async sendTicketEmailNotification(ticket, user, sponsorshipStatus) {
        if (!user?.email)
            return;
        const avelingPayUrl = `http://localhost:3002/checkout?ticketId=${ticket.id}&courseId=${ticket.courseId || ''}`;
        const subject = `Ticket Sponsorship Update: ${ticket.ticketType}`;
        let body = `<p>Hello ${user.fullName || 'Applicant'},</p>
                    <p>Your sponsorship for <strong>${ticket.ticketType}</strong> has been updated to <strong>${sponsorshipStatus.replace(/_/g, ' ').toUpperCase()}</strong>.</p>`;
        if (sponsorshipStatus === 'first_attempt_approved' || sponsorshipStatus === 'second_attempt_approved') {
            body += `<p>Please proceed to pay and start your course on Aveling LMS before the deadline (${ticket.sponsorshipDeadline ? new Date(ticket.sponsorshipDeadline).toLocaleDateString() : '3 days'}).</p>
                     <p><a href="${avelingPayUrl}" style="background:#1e3a8a;color:#ffffff;padding:10px 20px;text-decoration:none;border-radius:6px;display:inline-block;">Proceed to Aveling LMS Payment</a></p>`;
        }
        await this.sendCustomEmail(user.email, subject, body);
    }
    async sendCustomEmail(to, subject, htmlContent) {
        try {
            const transporter = nodemailer_1.default.createTransport({
                host: process.env.SMTP_HOST || 'smtp.ethereal.email',
                port: parseInt(process.env.SMTP_PORT || '587'),
                secure: false,
                auth: {
                    user: process.env.SMTP_USER || 'mock_user',
                    pass: process.env.SMTP_PASS || 'mock_pass',
                },
            });
            await transporter.sendMail({
                from: '"FIFO Recruitment & Training" <booking@swiftwings.online>',
                to,
                subject,
                html: htmlContent,
            }).catch(err => {
                console.log(`[TicketService.sendCustomEmail] Email dispatched to ${to} (mock logger):`, subject);
            });
        }
        catch (e) {
            console.log(`[TicketService.sendCustomEmail] Mock email log to ${to}: ${subject}`);
        }
    }
}
exports.TicketService = TicketService;
exports.ticketService = new TicketService();
