import { Request, Response, NextFunction } from 'express';
import { ticketService } from '../services/TicketService';
import { CONSTANTS } from '../constants';

export class TicketController {
    public async getUserTickets(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = (req as any).user.id;
            const tickets = await ticketService.getUserTickets(userId);
            res.status(CONSTANTS.HTTP_STATUS.OK).json({ success: true, data: tickets });
        } catch (error) { next(error); }
    }

    public async getTicketById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = (req as any).user.id;
            const ticketId = parseInt(req.params.id as string, 10);
            const ticket = await ticketService.getTicketById(ticketId, userId);
            res.status(CONSTANTS.HTTP_STATUS.OK).json({ success: true, data: ticket });
        } catch (error: any) {
            if (error.message === 'TICKET_NOT_FOUND') {
                res.status(CONSTANTS.HTTP_STATUS.NOT_FOUND).json({ code: 404, message: 'Ticket not found.' });
                return;
            }
            next(error);
        }
    }

    public async createTicket(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = (req as any).user.id;
            const ticket = await ticketService.createTicket(userId, req.body);
            res.status(CONSTANTS.HTTP_STATUS.CREATED).json({ success: true, data: ticket });
        } catch (error) { next(error); }
    }

    public async updateTicket(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = (req as any).user.id;
            const ticketId = parseInt(req.params.id as string, 10);
            const ticket = await ticketService.updateTicket(ticketId, userId, req.body);
            res.status(CONSTANTS.HTTP_STATUS.OK).json({ success: true, data: ticket });
        } catch (error: any) {
            if (error.message === 'TICKET_NOT_FOUND') {
                res.status(CONSTANTS.HTTP_STATUS.NOT_FOUND).json({ code: 404, message: 'Ticket not found.' });
                return;
            }
            next(error);
        }
    }

    public async applySponsorship(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = (req as any).user.id;
            const ticketId = parseInt(req.params.id as string, 10);
            const { bankName, accountNumber, accountName } = req.body;

            if (!bankName || !accountNumber || !accountName) {
                res.status(CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
                    code: 400,
                    message: 'Please carefully provide complete bank account details for refund processing.'
                });
                return;
            }

            const ticket = await ticketService.applySponsorship(ticketId, userId, { bankName, accountNumber, accountName });
            res.status(CONSTANTS.HTTP_STATUS.OK).json({ success: true, data: ticket });
        } catch (error: any) {
            if (error.message === 'TICKET_NOT_FOUND') {
                res.status(CONSTANTS.HTTP_STATUS.NOT_FOUND).json({ code: 404, message: 'Ticket not found.' });
                return;
            }
            next(error);
        }
    }

    public async processRefundChoice(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = (req as any).user.id;
            const ticketId = parseInt(req.params.id as string, 10);
            const { action } = req.body; // 'use_for_another_ticket' | 'refund_to_bank'

            if (!action || !['use_for_another_ticket', 'refund_to_bank'].includes(action)) {
                res.status(CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({ code: 400, message: 'Invalid refund action.' });
                return;
            }

            const ticket = await ticketService.processRefundChoice(ticketId, userId, action);
            res.status(CONSTANTS.HTTP_STATUS.OK).json({ success: true, data: ticket });
        } catch (error: any) {
            if (error.message === 'TICKET_NOT_FOUND') {
                res.status(CONSTANTS.HTTP_STATUS.NOT_FOUND).json({ code: 404, message: 'Ticket not found.' });
                return;
            }
            if (error.message === 'TICKET_NOT_ISSUED_FOR_REFUND') {
                res.status(CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({ code: 400, message: 'Ticket must be issued to claim refund.' });
                return;
            }
            next(error);
        }
    }

    public async payTicketOnAveling(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = (req as any).user.id;
            const ticketId = parseInt(req.params.id as string, 10);
            const result = await ticketService.payTicketOnAveling(ticketId, userId);
            res.status(CONSTANTS.HTTP_STATUS.OK).json(result);
        } catch (error) { next(error); }
    }

    public async recordExamOutcome(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const ticketId = parseInt(req.params.id as string, 10);
            const { passed, attemptNumber } = req.body;
            const result = await ticketService.recordExamOutcome(ticketId, Boolean(passed), attemptNumber || 1);
            res.status(CONSTANTS.HTTP_STATUS.OK).json({ success: true, data: result });
        } catch (error) { next(error); }
    }

    // STEP-1.1.20: Called when candidate submits exam — sets course to review-awaiting before grading
    public async setExamReviewAwaiting(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = (req as any).user.id;
            const ticketId = parseInt(req.params.id as string, 10);
            const result = await ticketService.setExamReviewAwaiting(ticketId, userId);
            res.status(CONSTANTS.HTTP_STATUS.OK).json({ success: true, data: result });
        } catch (error: any) {
            if (error.message === 'TICKET_NOT_FOUND') {
                res.status(CONSTANTS.HTTP_STATUS.NOT_FOUND).json({ code: 404, message: 'Ticket not found.' });
                return;
            }
            next(error);
        }
    }

    public async candidateLookup(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { candidateNumber } = req.body;
            if (!candidateNumber) {
                res.status(CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({ code: 400, message: 'Candidate number is required.' });
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
                res.status(CONSTANTS.HTTP_STATUS.NOT_FOUND).json({ code: 404, message: 'Candidate not found with provided number.' });
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
            const ticketsWithCourses = await Promise.all(tickets.map(async (t: any) => {
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

            res.status(CONSTANTS.HTTP_STATUS.OK).json({
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
        } catch (error) { next(error); }
    }

    public async sendCheckoutPaymentEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const ticketId = parseInt(req.params.id as string, 10);
            const result = await ticketService.sendCheckoutPaymentEmail(ticketId);
            res.status(CONSTANTS.HTTP_STATUS.OK).json({ success: true, data: result });
        } catch (error: any) {
            if (error.message === 'TICKET_NOT_FOUND') {
                res.status(CONSTANTS.HTTP_STATUS.NOT_FOUND).json({ code: 404, message: 'Ticket not found.' });
                return;
            }
            next(error);
        }
    }

    // Admin APIs
    public async adminGetAllTickets(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const sponsorshipStatus = req.query.sponsorshipStatus as string;
            const tickets = await ticketService.adminGetAllTickets({ sponsorshipStatus });
            res.status(CONSTANTS.HTTP_STATUS.OK).json({ success: true, data: tickets });
        } catch (error) { next(error); }
    }

    public async adminUpdateTicket(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const ticketId = parseInt(req.params.id as string, 10);
            const includeMail = Boolean(req.body.includeMail);
            const ticket = await ticketService.adminUpdateTicket(ticketId, req.body, includeMail);
            res.status(CONSTANTS.HTTP_STATUS.OK).json({ success: true, data: ticket });
        } catch (error: any) {
            if (error.message === 'TICKET_NOT_FOUND') {
                res.status(CONSTANTS.HTTP_STATUS.NOT_FOUND).json({ code: 404, message: 'Ticket not found.' });
                return;
            }
            next(error);
        }
    }
    public async adminBulkSeedTickets(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { tickets } = req.body;
            if (!Array.isArray(tickets)) {
                res.status(CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({ code: 400, message: 'Tickets array is required.' });
                return;
            }
            const created = await ticketService.bulkSeedTickets(tickets);
            res.status(CONSTANTS.HTTP_STATUS.CREATED).json({ success: true, data: created });
        } catch (error) { next(error); }
    }

    // STEP-1.1.11: Admin approves uploaded payment receipt → unlocks course for candidate
    public async adminApproveReceipt(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const ticketId = parseInt(req.params.id as string, 10);
            const ticket = await ticketService.adminApproveTicketReceipt(ticketId);
            res.status(CONSTANTS.HTTP_STATUS.OK).json({ success: true, data: ticket });
        } catch (error: any) {
            if (error.message === 'TICKET_NOT_FOUND') {
                res.status(CONSTANTS.HTTP_STATUS.NOT_FOUND).json({ code: 404, message: 'Ticket not found.' });
                return;
            }
            next(error);
        }
    }
}

export const ticketController = new TicketController();
