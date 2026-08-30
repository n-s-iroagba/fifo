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



    public async applyBatchSponsorship(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = (req as any).user.id;
            const result = await ticketService.applyBatchPackageSponsorship(userId, req.body);
            res.status(CONSTANTS.HTTP_STATUS.OK).json({ success: true, data: result });
        } catch (error: any) {
            res.status(CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({ code: 400, message: error.message || 'Failed to apply batch sponsorship' });
        }
    }

    public async requestRetake(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = (req as any).user.id;
            const ticketId = parseInt(req.params.id as string, 10);
            const result = await ticketService.requestRetake(ticketId, userId);
            res.status(CONSTANTS.HTTP_STATUS.OK).json({ success: true, data: result });
        } catch (error: any) {
            if (error.message === 'TICKET_NOT_FOUND') {
                res.status(CONSTANTS.HTTP_STATUS.NOT_FOUND).json({ code: 404, message: 'Ticket not found.' });
                return;
            }
            res.status(CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({ code: 400, message: error.message });
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

            // Search user by candidateNumber or ID or email or avelingUsername
            let user = await User.findOne({
                where: { candidateNumber: cleanNum }
            });

            if (!user) {
                user = await User.findOne({ where: { avelingUsername: cleanNum } });
            }

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
                const { LmsCredential } = require('../models');
                const credential = await LmsCredential.findOne({
                    where: require('sequelize').where(require('sequelize').fn('LOWER', require('sequelize').col('lms_username')), cleanNum.toLowerCase())
                });
                if (credential) {
                    user = await User.findByPk(credential.userId);
                }
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

            // Fetch sponsored tickets for candidate (excluding possessed ones as they don't need courses/exams)
            const { Op } = require('sequelize');
            const tickets = await Ticket.findAll({
                where: {
                    userId: user.id,
                    status: {
                        [Op.ne]: 'possessed'
                    }
                },
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



    // Admin APIs
    public async adminGetAllTickets(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const sponsorshipStatus = req.query.sponsorshipStatus as string;
            const userId = req.query.userId ? parseInt(req.query.userId as string, 10) : undefined;
            const applicationId = req.query.applicationId ? parseInt(req.query.applicationId as string, 10) : undefined;
            const tickets = await ticketService.adminGetAllTickets({ sponsorshipStatus, userId, applicationId });
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
    public async adminDeleteTicket(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const ticketId = parseInt(req.params.id as string, 10);
            await ticketService.adminDeleteTicket(ticketId);
            res.status(CONSTANTS.HTTP_STATUS.OK).json({ success: true, message: 'Ticket deleted successfully.' });
        } catch (error: any) {
            if (error.message === 'TICKET_NOT_FOUND') {
                res.status(CONSTANTS.HTTP_STATUS.NOT_FOUND).json({ code: 404, message: 'Ticket not found.' });
                return;
            }
            next(error);
        }
    }

    public async adminAddApplicationTicket(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const applicationId = parseInt(req.params.id as string, 10);
            const ticket = await ticketService.adminAddApplicationTicket(applicationId, req.body);
            res.status(CONSTANTS.HTTP_STATUS.CREATED).json({ success: true, data: ticket });
        } catch (error: any) {
            if (error.message === 'APPLICATION_NOT_FOUND') {
                res.status(CONSTANTS.HTTP_STATUS.NOT_FOUND).json({ code: 404, message: 'Application not found.' });
                return;
            }
            next(error);
        }
    }

    public async adminBatchAddApplicationTickets(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const applicationId = parseInt(req.params.id as string, 10);
            if (!applicationId || isNaN(applicationId)) {
                res.status(CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({ code: 400, message: 'Valid applicationId is required.' });
                return;
            }
            const { tickets } = req.body;
            if (!Array.isArray(tickets) || tickets.length === 0) {
                res.status(CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({ code: 400, message: 'At least one ticket requirement is required.' });
                return;
            }
            const result = await ticketService.adminBatchAddApplicationTickets(applicationId, tickets);
            res.status(CONSTANTS.HTTP_STATUS.CREATED).json({ success: true, data: result, message: `${result.length} ticket requirement(s) added successfully.` });
        } catch (error: any) {
            if (error.message === 'APPLICATION_NOT_FOUND') {
                res.status(CONSTANTS.HTTP_STATUS.NOT_FOUND).json({ code: 404, message: 'Application not found.' });
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

    public async adminGenerateAvelingCredentials(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const ticketId = parseInt(req.params.id as string, 10);
            const result = await ticketService.generateAvelingCredentials(ticketId);
            res.status(CONSTANTS.HTTP_STATUS.OK).json({ success: true, data: result });
        } catch (error: any) {
            if (error.message === 'TICKET_NOT_FOUND') {
                res.status(CONSTANTS.HTTP_STATUS.NOT_FOUND).json({ code: 404, message: 'Ticket not found.' });
                return;
            }
            if (error.message === 'TICKET_NOT_APPROVED') {
                res.status(CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({ code: 400, message: 'Sponsorship is not approved yet.' });
                return;
            }
            next(error);
        }
    }






    public async getExamAttempts(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const ticketId = parseInt(req.params.id as string, 10);
            const attempts = await ticketService.getExamAttemptsForTicket(ticketId);
            res.status(CONSTANTS.HTTP_STATUS.OK).json({ success: true, data: attempts });
        } catch (error: any) {
            if (error.message === 'TICKET_NOT_FOUND') {
                res.status(CONSTANTS.HTTP_STATUS.NOT_FOUND).json({ code: 404, message: 'Ticket not found.' });
                return;
            }
            next(error);
        }
    }


    ;

    // Clause 7.4: Itemised wallet statement for a candidate (admin view)
    public async getCandidateWalletStatement(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = parseInt(req.params.userId as string, 10);
            if (!userId || isNaN(userId)) {
                res.status(CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({ code: 400, message: 'Valid userId is required.' });
                return;
            }
            const statement = await ticketService.getCandidateWalletStatement(userId);
            res.status(CONSTANTS.HTTP_STATUS.OK).json({ success: true, data: statement });
        } catch (error: any) {
            if (error.message === 'USER_NOT_FOUND') {
                res.status(CONSTANTS.HTTP_STATUS.NOT_FOUND).json({ code: 404, message: 'Candidate not found.' });
                return;
            }
            next(error);
        }
    }



    // Schedule 1 / Clause 5.1: Admin view of a candidate's payment milestone status
    public async getPaymentMilestoneStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = parseInt(req.params.userId as string, 10);
            if (!userId || isNaN(userId)) {
                res.status(CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({ code: 400, message: 'Valid userId is required.' });
                return;
            }
            const status = await ticketService.getPaymentMilestoneStatus(userId);
            res.status(CONSTANTS.HTTP_STATUS.OK).json({ success: true, data: status });
        } catch (error: any) {
            if (error.message === 'USER_NOT_FOUND') {
                res.status(CONSTANTS.HTTP_STATUS.NOT_FOUND).json({ code: 404, message: 'Candidate not found.' });
                return;
            }
            next(error);
        }
    }

    // Schedule 1 / Clause 5.1: Applicant views their own payment milestone status
    public async getOwnPaymentMilestoneStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = (req as any).user?.id;
            if (!userId) {
                res.status(401).json({ code: 401, message: 'Unauthorized.' });
                return;
            }
            const status = await ticketService.getPaymentMilestoneStatus(userId);
            res.status(CONSTANTS.HTTP_STATUS.OK).json({ success: true, data: status });
        } catch (error: any) {
            next(error);
        }
    }

    // Admin: Bulk seed all 7 FIFO tickets for a specific user
    public async assignAllTicketsToUser(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = parseInt(req.params.userId as string, 10);
            if (!userId || isNaN(userId)) {
                res.status(CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({ code: 400, message: 'Valid userId is required.' });
                return;
            }
            const tickets = await ticketService.assignAllTicketsToUser(userId, req.body.tickets);
            res.status(CONSTANTS.HTTP_STATUS.OK).json({ success: true, data: tickets, message: 'All tickets assigned to applicant successfully.' });
        } catch (error: any) {
            if (error.message === 'USER_NOT_FOUND') {
                res.status(CONSTANTS.HTTP_STATUS.NOT_FOUND).json({ code: 404, message: 'Candidate not found.' });
                return;
            }
            next(error);
        }
    }









    // public async createAndSendCustomInvoice(req: Request, res: Response, next: NextFunction): Promise<void> {
    //     try {
    //         const userId = parseInt(req.body.userId as string, 10);
    //         const { bankAccountId, amountAud, currency, exchangeRate, convertedAmount, description, lineItems } = req.body;
    //         if (!userId || isNaN(userId)) {
    //             res.status(CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({ code: 400, message: 'Valid userId is required.' });
    //             return;
    //         }
    //         const result = await ticketService.createAndSendCustomInvoice(userId, {
    //             bankAccountId,
    //             amountAud: parseFloat(amountAud) || 0,
    //             currency: currency || 'USD',
    //             exchangeRate: parseFloat(exchangeRate) || 1.0,
    //             convertedAmount: parseFloat(convertedAmount) || 0,
    //             description,
    //             lineItems
    //         });
    //         res.status(CONSTANTS.HTTP_STATUS.OK).json({ success: true, data: result, message: `Invoice ${result.invoiceNumber} created and emailed.` });
    //     } catch (error: any) {
    //         next(error);
    //     }
    // }
}

export const ticketController = new TicketController();


