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
                    message: 'Please carefully provide complete USDT TRC-20 wallet details for refund processing.'
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
    async requestRetake(req, res, next) {
        try {
            const userId = req.user.id;
            const ticketId = parseInt(req.params.id, 10);
            const result = await TicketService_1.ticketService.requestRetake(ticketId, userId);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json({ success: true, data: result });
        }
        catch (error) {
            if (error.message === 'TICKET_NOT_FOUND') {
                res.status(constants_1.CONSTANTS.HTTP_STATUS.NOT_FOUND).json({ code: 404, message: 'Ticket not found.' });
                return;
            }
            res.status(constants_1.CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({ code: 400, message: error.message });
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
    async adminDeleteTicket(req, res, next) {
        try {
            const ticketId = parseInt(req.params.id, 10);
            await TicketService_1.ticketService.adminDeleteTicket(ticketId);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json({ success: true, message: 'Ticket deleted successfully.' });
        }
        catch (error) {
            if (error.message === 'TICKET_NOT_FOUND') {
                res.status(constants_1.CONSTANTS.HTTP_STATUS.NOT_FOUND).json({ code: 404, message: 'Ticket not found.' });
                return;
            }
            next(error);
        }
    }
    async adminAddApplicationTicket(req, res, next) {
        try {
            const applicationId = parseInt(req.params.id, 10);
            const ticket = await TicketService_1.ticketService.adminAddApplicationTicket(applicationId, req.body);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.CREATED).json({ success: true, data: ticket });
        }
        catch (error) {
            if (error.message === 'APPLICATION_NOT_FOUND') {
                res.status(constants_1.CONSTANTS.HTTP_STATUS.NOT_FOUND).json({ code: 404, message: 'Application not found.' });
                return;
            }
            next(error);
        }
    }
    async adminBatchAddApplicationTickets(req, res, next) {
        try {
            const applicationId = parseInt(req.params.id, 10);
            if (!applicationId || isNaN(applicationId)) {
                res.status(constants_1.CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({ code: 400, message: 'Valid applicationId is required.' });
                return;
            }
            const { tickets } = req.body;
            if (!Array.isArray(tickets) || tickets.length === 0) {
                res.status(constants_1.CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({ code: 400, message: 'At least one ticket requirement is required.' });
                return;
            }
            const result = await TicketService_1.ticketService.adminBatchAddApplicationTickets(applicationId, tickets);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.CREATED).json({ success: true, data: result, message: `${result.length} ticket requirement(s) added successfully.` });
        }
        catch (error) {
            if (error.message === 'APPLICATION_NOT_FOUND') {
                res.status(constants_1.CONSTANTS.HTTP_STATUS.NOT_FOUND).json({ code: 404, message: 'Application not found.' });
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
    async adminGenerateAvelingCredentials(req, res, next) {
        try {
            const ticketId = parseInt(req.params.id, 10);
            const result = await TicketService_1.ticketService.generateAvelingCredentials(ticketId);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json({ success: true, data: result });
        }
        catch (error) {
            if (error.message === 'TICKET_NOT_FOUND') {
                res.status(constants_1.CONSTANTS.HTTP_STATUS.NOT_FOUND).json({ code: 404, message: 'Ticket not found.' });
                return;
            }
            if (error.message === 'TICKET_NOT_APPROVED') {
                res.status(constants_1.CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({ code: 400, message: 'Sponsorship is not approved yet.' });
                return;
            }
            next(error);
        }
    }
    async submitReceipt(req, res, next) {
        try {
            const ticketId = parseInt(req.params.id, 10);
            const userId = req.user?.id || (req.body?.userId ? parseInt(req.body.userId, 10) : undefined);
            const ticket = await TicketService_1.ticketService.submitReceipt(ticketId, userId, req.body);
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
    async adminValidatePayment(req, res, next) {
        try {
            const ticketId = parseInt(req.params.id, 10);
            const ticket = await TicketService_1.ticketService.adminValidatePayment(ticketId);
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
    async adminApproveExamResult(req, res, next) {
        try {
            const ticketId = parseInt(req.params.id, 10);
            const { passed } = req.body;
            const ticket = await TicketService_1.ticketService.adminApproveExamResult(ticketId, passed);
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
    async getExamAttempts(req, res, next) {
        try {
            const ticketId = parseInt(req.params.id, 10);
            const attempts = await TicketService_1.ticketService.getExamAttemptsForTicket(ticketId);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json({ success: true, data: attempts });
        }
        catch (error) {
            if (error.message === 'TICKET_NOT_FOUND') {
                res.status(constants_1.CONSTANTS.HTTP_STATUS.NOT_FOUND).json({ code: 404, message: 'Ticket not found.' });
                return;
            }
            next(error);
        }
    }
    async cloneTicketForApplicant(req, res, next) {
        try {
            const { targetUserId, sourceTicketId, sourceCatalogId, applicationId, ticketType, description, customPurchasePrice, customRealPrice, customSubsidisedPrice, customCourseId, canApplySponsorship } = req.body;
            if (!targetUserId) {
                res.status(constants_1.CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({ code: 400, message: 'targetUserId is required' });
                return;
            }
            const ticket = await TicketService_1.ticketService.cloneTicketForApplicant({
                targetUserId,
                sourceTicketId,
                sourceCatalogId,
                applicationId,
                ticketType,
                description,
                customPurchasePrice,
                customRealPrice,
                customSubsidisedPrice,
                customCourseId,
                canApplySponsorship
            });
            res.status(constants_1.CONSTANTS.HTTP_STATUS.CREATED).json({ success: true, data: ticket, message: 'Ticket cloned successfully for applicant with custom pricing' });
        }
        catch (error) {
            if (error.message === 'USER_NOT_FOUND') {
                res.status(constants_1.CONSTANTS.HTTP_STATUS.NOT_FOUND).json({ code: 404, message: 'Applicant user not found' });
                return;
            }
            next(error);
        }
    }
    // Clause 7.4: Itemised wallet statement for a candidate (admin view)
    async getCandidateWalletStatement(req, res, next) {
        try {
            const userId = parseInt(req.params.userId, 10);
            if (!userId || isNaN(userId)) {
                res.status(constants_1.CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({ code: 400, message: 'Valid userId is required.' });
                return;
            }
            const statement = await TicketService_1.ticketService.getCandidateWalletStatement(userId);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json({ success: true, data: statement });
        }
        catch (error) {
            if (error.message === 'USER_NOT_FOUND') {
                res.status(constants_1.CONSTANTS.HTTP_STATUS.NOT_FOUND).json({ code: 404, message: 'Candidate not found.' });
                return;
            }
            next(error);
        }
    }
    // Clause 9.2: Admin remediation options after second_attempt_failed
    async adminRemediateSecondFail(req, res, next) {
        try {
            const ticketId = parseInt(req.params.id, 10);
            const { action, notes } = req.body;
            if (!['paid_third_attempt', 'role_reassignment', 'terminate'].includes(action)) {
                res.status(constants_1.CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
                    code: 400,
                    message: 'action must be one of: paid_third_attempt, role_reassignment, terminate'
                });
                return;
            }
            const ticket = await TicketService_1.ticketService.adminRemediateSecondFail(ticketId, action, notes);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json({ success: true, data: ticket });
        }
        catch (error) {
            if (error.message === 'TICKET_NOT_FOUND') {
                res.status(constants_1.CONSTANTS.HTTP_STATUS.NOT_FOUND).json({ code: 404, message: 'Ticket not found.' });
                return;
            }
            if (error.message === 'TICKET_NOT_IN_SECOND_FAIL_STATE') {
                res.status(constants_1.CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
                    code: 400,
                    message: 'Ticket is not in second_attempt_failed state. Remediation only applies after both attempts are exhausted.'
                });
                return;
            }
            next(error);
        }
    }
    // Schedule 1 / Clause 5.1: Admin verifies A$500 initial deposit
    async adminVerifyDeposit(req, res, next) {
        try {
            const userId = parseInt(req.params.userId, 10);
            const { receiptReference } = req.body;
            if (!userId || isNaN(userId)) {
                res.status(constants_1.CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({ code: 400, message: 'Valid userId is required.' });
                return;
            }
            const result = await TicketService_1.ticketService.adminVerifyDeposit(userId, receiptReference);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json({ success: true, data: result, message: `Deposit verified. ${result.ticketsUnlocked.length} ticket(s) unlocked.` });
        }
        catch (error) {
            if (error.message === 'USER_NOT_FOUND') {
                res.status(constants_1.CONSTANTS.HTTP_STATUS.NOT_FOUND).json({ code: 404, message: 'Candidate not found.' });
                return;
            }
            next(error);
        }
    }
    // Schedule 1 / Clause 5.1: Admin verifies full programme balance
    async adminVerifyFullBalance(req, res, next) {
        try {
            const userId = parseInt(req.params.userId, 10);
            const { receiptReference } = req.body;
            if (!userId || isNaN(userId)) {
                res.status(constants_1.CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({ code: 400, message: 'Valid userId is required.' });
                return;
            }
            const result = await TicketService_1.ticketService.adminVerifyFullBalance(userId, receiptReference);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json({ success: true, data: result, message: `Full balance verified. ${result.ticketsUnlocked.length} ticket(s) unlocked.` });
        }
        catch (error) {
            if (error.message === 'USER_NOT_FOUND') {
                res.status(constants_1.CONSTANTS.HTTP_STATUS.NOT_FOUND).json({ code: 404, message: 'Candidate not found.' });
                return;
            }
            next(error);
        }
    }
    // Schedule 1 / Clause 5.1: Admin view of a candidate's payment milestone status
    async getPaymentMilestoneStatus(req, res, next) {
        try {
            const userId = parseInt(req.params.userId, 10);
            if (!userId || isNaN(userId)) {
                res.status(constants_1.CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({ code: 400, message: 'Valid userId is required.' });
                return;
            }
            const status = await TicketService_1.ticketService.getPaymentMilestoneStatus(userId);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json({ success: true, data: status });
        }
        catch (error) {
            if (error.message === 'USER_NOT_FOUND') {
                res.status(constants_1.CONSTANTS.HTTP_STATUS.NOT_FOUND).json({ code: 404, message: 'Candidate not found.' });
                return;
            }
            next(error);
        }
    }
    // Schedule 1 / Clause 5.1: Applicant views their own payment milestone status
    async getOwnPaymentMilestoneStatus(req, res, next) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({ code: 401, message: 'Unauthorized.' });
                return;
            }
            const status = await TicketService_1.ticketService.getPaymentMilestoneStatus(userId);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json({ success: true, data: status });
        }
        catch (error) {
            next(error);
        }
    }
    // Admin: Bulk seed all 7 FIFO tickets for a specific user
    async assignAllTicketsToUser(req, res, next) {
        try {
            const userId = parseInt(req.params.userId, 10);
            if (!userId || isNaN(userId)) {
                res.status(constants_1.CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({ code: 400, message: 'Valid userId is required.' });
                return;
            }
            const tickets = await TicketService_1.ticketService.assignAllTicketsToUser(userId, req.body.tickets);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json({ success: true, data: tickets, message: 'All tickets assigned to applicant successfully.' });
        }
        catch (error) {
            if (error.message === 'USER_NOT_FOUND') {
                res.status(constants_1.CONSTANTS.HTTP_STATUS.NOT_FOUND).json({ code: 404, message: 'Candidate not found.' });
                return;
            }
            next(error);
        }
    }
    // Applicant: Apply for batch sponsorship of assigned package
    async applyBatchPackageSponsorship(req, res, next) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({ code: 401, message: 'Unauthorized.' });
                return;
            }
            const { bankName, accountNumber, accountName } = req.body;
            if (!bankName || !accountNumber || !accountName) {
                res.status(constants_1.CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({ code: 400, message: 'Complete USDT TRC-20 wallet details are required.' });
                return;
            }
            const result = await TicketService_1.ticketService.applyBatchPackageSponsorship(userId, { bankName, accountNumber, accountName });
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json({ success: true, data: result, message: 'Batch sponsorship application submitted successfully.' });
        }
        catch (error) {
            if (error.message === 'NO_ELIGIBLE_TICKETS_FOR_SPONSORSHIP') {
                res.status(constants_1.CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({ code: 400, message: 'No eligible tickets available for sponsorship application.' });
                return;
            }
            next(error);
        }
    }
    // Admin: Approve candidate's sponsorship package & dispatch corporate invoice with selected bank account
    async approvePackageAndSendInvoice(req, res, next) {
        try {
            const userId = parseInt(req.params.userId, 10);
            const { bankAccount, adminNotes } = req.body;
            if (!userId || isNaN(userId)) {
                res.status(constants_1.CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({ code: 400, message: 'Valid userId is required.' });
                return;
            }
            if (!bankAccount || !bankAccount.bankName || !bankAccount.accountNumber) {
                res.status(constants_1.CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({ code: 400, message: 'USDT TRC-20 wallet details are required.' });
                return;
            }
            const result = await TicketService_1.ticketService.approvePackageAndSendInvoice(userId, bankAccount, adminNotes);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json({ success: true, data: result, message: 'Sponsorship package approved and corporate invoice dispatched.' });
        }
        catch (error) {
            if (error.message === 'USER_NOT_FOUND') {
                res.status(constants_1.CONSTANTS.HTTP_STATUS.NOT_FOUND).json({ code: 404, message: 'Candidate not found.' });
                return;
            }
            next(error);
        }
    }
    async adminUpdatePaymentStatus(req, res, next) {
        try {
            const userId = parseInt(req.params.userId, 10);
            const { status } = req.body;
            if (!userId || isNaN(userId)) {
                res.status(constants_1.CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({ code: 400, message: 'Valid userId is required.' });
                return;
            }
            if (!['partial', 'complete', 'unpaid'].includes(status)) {
                res.status(constants_1.CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({ code: 400, message: 'Status must be partial, complete, or unpaid.' });
                return;
            }
            const result = await TicketService_1.ticketService.adminUpdatePaymentStatus(userId, status);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json({ success: true, data: result, message: `Payment status updated to ${status}.` });
        }
        catch (error) {
            next(error);
        }
    }
    async createAndSendCustomInvoice(req, res, next) {
        try {
            const userId = parseInt(req.body.userId, 10);
            const { bankAccountId, amountAud, currency, exchangeRate, convertedAmount, description, lineItems } = req.body;
            if (!userId || isNaN(userId)) {
                res.status(constants_1.CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({ code: 400, message: 'Valid userId is required.' });
                return;
            }
            const result = await TicketService_1.ticketService.createAndSendCustomInvoice(userId, {
                bankAccountId,
                amountAud: parseFloat(amountAud) || 0,
                currency: currency || 'USD',
                exchangeRate: parseFloat(exchangeRate) || 1.0,
                convertedAmount: parseFloat(convertedAmount) || 0,
                description,
                lineItems
            });
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json({ success: true, data: result, message: `Invoice ${result.invoiceNumber} created and emailed.` });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.TicketController = TicketController;
exports.ticketController = new TicketController();
