"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ticketController = exports.TicketController = void 0;
const TicketService_1 = require("../services/TicketService");
const constants_1 = require("../constants");
class TicketController {
    async getUserTickets(req, res, next) {
        try {
            const userId = req.user.id;
            const tickets = await TicketService_1.ticketService.getUserTickets(userId);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json({ success: true, data: tickets });
        }
        catch (error) {
            next(error);
        }
    }
    async getTicketById(req, res, next) {
        try {
            const userId = req.user.id;
            const ticketId = parseInt(req.params.id, 10);
            const ticket = await TicketService_1.ticketService.getTicketById(ticketId, userId);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json({ success: true, data: ticket });
        }
        catch (error) {
            if (error.message === 'TICKET_NOT_FOUND') {
                res.status(constants_1.CONSTANTS.HTTP_STATUS.NOT_FOUND).json({ code: 404, message: 'Ticket not found.' });
                return;
            }
            next(error);
        }
    }
    async createTicket(req, res, next) {
        try {
            const userId = req.user.id;
            const ticket = await TicketService_1.ticketService.createTicket(userId, req.body);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.CREATED).json({ success: true, data: ticket });
        }
        catch (error) {
            next(error);
        }
    }
    async updateTicket(req, res, next) {
        try {
            const userId = req.user.id;
            const ticketId = parseInt(req.params.id, 10);
            const ticket = await TicketService_1.ticketService.updateTicket(ticketId, userId, req.body);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json({ success: true, data: ticket });
        }
        catch (error) {
            if (error.message === 'TICKET_NOT_FOUND') {
                res.status(constants_1.CONSTANTS.HTTP_STATUS.NOT_FOUND).json({ code: 404, message: 'Ticket not found.' });
                return;
            }
            next(error);
        }
    }
    async applySponsorship(req, res, next) {
        try {
            const userId = req.user.id;
            const ticketId = parseInt(req.params.id, 10);
            const { bankName, accountNumber, accountName } = req.body;
            if (!bankName || !accountNumber || !accountName) {
                res.status(constants_1.CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
                    code: 400,
                    message: 'Please carefully provide complete bank account details for refund processing.'
                });
                return;
            }
            const ticket = await TicketService_1.ticketService.applySponsorship(ticketId, userId, { bankName, accountNumber, accountName });
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json({ success: true, data: ticket });
        }
        catch (error) {
            if (error.message === 'TICKET_NOT_FOUND') {
                res.status(constants_1.CONSTANTS.HTTP_STATUS.NOT_FOUND).json({ code: 404, message: 'Ticket not found.' });
                return;
            }
            next(error);
        }
    }
    async processRefundChoice(req, res, next) {
        try {
            const userId = req.user.id;
            const ticketId = parseInt(req.params.id, 10);
            const { action } = req.body; // 'use_for_another_ticket' | 'refund_to_bank'
            if (!action || !['use_for_another_ticket', 'refund_to_bank'].includes(action)) {
                res.status(constants_1.CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({ code: 400, message: 'Invalid refund action.' });
                return;
            }
            const ticket = await TicketService_1.ticketService.processRefundChoice(ticketId, userId, action);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json({ success: true, data: ticket });
        }
        catch (error) {
            if (error.message === 'TICKET_NOT_FOUND') {
                res.status(constants_1.CONSTANTS.HTTP_STATUS.NOT_FOUND).json({ code: 404, message: 'Ticket not found.' });
                return;
            }
            if (error.message === 'TICKET_NOT_ISSUED_FOR_REFUND') {
                res.status(constants_1.CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({ code: 400, message: 'Ticket must be issued to claim refund.' });
                return;
            }
            next(error);
        }
    }
    async payTicketOnAveling(req, res, next) {
        try {
            const userId = req.user.id;
            const ticketId = parseInt(req.params.id, 10);
            const result = await TicketService_1.ticketService.payTicketOnAveling(ticketId, userId);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json(result);
        }
        catch (error) {
            next(error);
        }
    }
    async recordExamOutcome(req, res, next) {
        try {
            const ticketId = parseInt(req.params.id, 10);
            const { passed, attemptNumber } = req.body;
            const result = await TicketService_1.ticketService.recordExamOutcome(ticketId, Boolean(passed), attemptNumber || 1);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json({ success: true, data: result });
        }
        catch (error) {
            next(error);
        }
    }
    // STEP-1.1.20: Called when candidate submits exam — sets course to review-awaiting before grading
    async setExamReviewAwaiting(req, res, next) {
        try {
            const userId = req.user.id;
            const ticketId = parseInt(req.params.id, 10);
            const result = await TicketService_1.ticketService.setExamReviewAwaiting(ticketId, userId);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json({ success: true, data: result });
        }
        catch (error) {
            if (error.message === 'TICKET_NOT_FOUND') {
                res.status(constants_1.CONSTANTS.HTTP_STATUS.NOT_FOUND).json({ code: 404, message: 'Ticket not found.' });
                return;
            }
            next(error);
        }
    }
    async candidateLookup(req, res, next) {
        try {
            const { candidateNumber } = req.body;
            if (!candidateNumber) {
                res.status(constants_1.CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({ code: 400, message: 'Candidate number is required.' });
                return;
            }
            const { User, Ticket, Course, CourseModule } = require('../models');
            const cleanNum = String(candidateNumber).trim().toUpperCase();
            // Search user by candidateNumber or ID or email
            let user = await User.findOne({
                where: { candidateNumber: cleanNum }
            });
            if (!user && (cleanNum.startsWith('CND-') || !isNaN(Number(cleanNum)))) {
                const numericId = parseInt(cleanNum.replace('CND-', ''), 10);
                if (!isNaN(numericId)) {
                    user = await User.findByPk(numericId);
                }
            }
            if (!user) {
                user = await User.findOne({ where: { email: cleanNum.toLowerCase() } });
            }
            if (!user) {
                res.status(constants_1.CONSTANTS.HTTP_STATUS.NOT_FOUND).json({ code: 404, message: 'Candidate not found with provided number.' });
                return;
            }
            // Ensure candidate number is assigned
            if (!user.candidateNumber) {
                const generatedNum = `CND-${10000 + user.id}`;
                await user.update({ candidateNumber: generatedNum });
                user.candidateNumber = generatedNum;
            }
            // Fetch sponsored tickets for candidate
            const tickets = await Ticket.findAll({
                where: { userId: user.id },
                order: [['createdAt', 'DESC']]
            });
            // Fetch course details if courseId is associated
            const ticketsWithCourses = await Promise.all(tickets.map(async (t) => {
                let courseData = null;
                if (t.courseId) {
                    courseData = await Course.findByPk(t.courseId, {
                        include: [{ model: CourseModule }]
                    });
                }
                return {
                    ...t.toJSON(),
                    Course: courseData
                };
            }));
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json({
                success: true,
                data: {
                    user: {
                        id: user.id,
                        fullName: user.fullName,
                        email: user.email,
                        candidateNumber: user.candidateNumber,
                        walletBalance: user.walletBalance || 0
                    },
                    tickets: ticketsWithCourses
                }
            });
        }
        catch (error) {
            next(error);
        }
    }
    async sendCheckoutPaymentEmail(req, res, next) {
        try {
            const ticketId = parseInt(req.params.id, 10);
            const result = await TicketService_1.ticketService.sendCheckoutPaymentEmail(ticketId);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json({ success: true, data: result });
        }
        catch (error) {
            if (error.message === 'TICKET_NOT_FOUND') {
                res.status(constants_1.CONSTANTS.HTTP_STATUS.NOT_FOUND).json({ code: 404, message: 'Ticket not found.' });
                return;
            }
            next(error);
        }
    }
    // Admin APIs
    async adminGetAllTickets(req, res, next) {
        try {
            const sponsorshipStatus = req.query.sponsorshipStatus;
            const tickets = await TicketService_1.ticketService.adminGetAllTickets({ sponsorshipStatus });
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json({ success: true, data: tickets });
        }
        catch (error) {
            next(error);
        }
    }
    async adminUpdateTicket(req, res, next) {
        try {
            const ticketId = parseInt(req.params.id, 10);
            const includeMail = Boolean(req.body.includeMail);
            const ticket = await TicketService_1.ticketService.adminUpdateTicket(ticketId, req.body, includeMail);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json({ success: true, data: ticket });
        }
        catch (error) {
            if (error.message === 'TICKET_NOT_FOUND') {
                res.status(constants_1.CONSTANTS.HTTP_STATUS.NOT_FOUND).json({ code: 404, message: 'Ticket not found.' });
                return;
            }
            next(error);
        }
    }
    async adminBulkSeedTickets(req, res, next) {
        try {
            const { tickets } = req.body;
            if (!Array.isArray(tickets)) {
                res.status(constants_1.CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({ code: 400, message: 'Tickets array is required.' });
                return;
            }
            const created = await TicketService_1.ticketService.bulkSeedTickets(tickets);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.CREATED).json({ success: true, data: created });
        }
        catch (error) {
            next(error);
        }
    }
    // STEP-1.1.11: Admin approves uploaded payment receipt → unlocks course for candidate
    async adminApproveReceipt(req, res, next) {
        try {
            const ticketId = parseInt(req.params.id, 10);
            const ticket = await TicketService_1.ticketService.adminApproveTicketReceipt(ticketId);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json({ success: true, data: ticket });
        }
        catch (error) {
            if (error.message === 'TICKET_NOT_FOUND') {
                res.status(constants_1.CONSTANTS.HTTP_STATUS.NOT_FOUND).json({ code: 404, message: 'Ticket not found.' });
                return;
            }
            next(error);
        }
    }
}
exports.TicketController = TicketController;
exports.ticketController = new TicketController();
