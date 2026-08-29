"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExamAttemptService = void 0;
const ExamAttempt_1 = require("../models/ExamAttempt");
const ExamQuestion_1 = require("../models/ExamQuestion");
class ExamAttemptService {
    static async getAttemptDetails(attemptId) {
        const attempt = await ExamAttempt_1.ExamAttempt.findByPk(attemptId);
        if (!attempt)
            throw new Error('ATTEMPT_NOT_FOUND');
        const questions = await ExamQuestion_1.ExamQuestion.findAll({ where: { courseId: attempt.courseId } });
        // Don't return correct answers to learner during test
        const safeQuestions = questions.map(q => {
            const { correctOptionIndex, correctAnswer, ...safeQ } = q.toJSON();
            return safeQ;
        });
        return {
            attempt,
            questions: safeQuestions
        };
    }
    static async startAttempt(userId, courseId) {
        const { Ticket, Enrollment, Invoice } = require('../models');
        // Check invoice status to see if they can take courses
        const userInvoices = await Invoice.findAll({ where: { applicantId: userId, isPaid: true } });
        const hasComplete = userInvoices.some((i) => i.purpose === 'aveling-complete' || i.purpose === 'aveling-complete-after-partial');
        const hasPartial = userInvoices.some((i) => i.purpose === 'aveling-partial');
        if (!hasComplete && hasPartial) {
            const distinctCoursesAttempted = await ExamAttempt_1.ExamAttempt.count({
                where: { userId },
                distinct: true,
                col: 'courseId'
            });
            const hasAttemptedThisCourse = await ExamAttempt_1.ExamAttempt.count({ where: { userId, courseId } });
            if (hasAttemptedThisCourse === 0 && distinctCoursesAttempted >= 3) {
                throw new Error('PARTIAL_LIMIT_EXCEEDED');
            }
        }
        else if (!hasComplete && !hasPartial) {
            // Strictly require payment to start (though ticket gate might also catch this)
            throw new Error('PAYMENT_REQUIRED');
        }
        // Check if the user has access via ticket or enrollment
        const ticket = await Ticket.findOne({ where: { userId, courseId } });
        if (ticket && (ticket.status === 'possessed' || ticket.status === 'refunded' || ticket.status === 'verified')) {
            throw new Error('ALREADY_POSSESSED');
        }
        const enrollment = await Enrollment.findOne({ where: { userId, courseId } });
        if (ticket && ticket.courseAccessGranted === false) {
            throw new Error('PAYMENT_REQUIRED');
        }
        if (!ticket && enrollment && enrollment.paymentStatus !== 'Paid') {
            throw new Error('PAYMENT_REQUIRED');
        }
        // Payment Milestone Gate (Schedule 1 / Clause 5.1)
        if (ticket) {
            const { ticketService } = require('./TicketService');
            const gateResult = await ticketService.checkPaymentMilestoneGate(userId, ticket.id);
            if (gateResult === 'DEPOSIT_REQUIRED') {
                throw new Error('DEPOSIT_REQUIRED');
            }
            if (gateResult === 'FULL_BALANCE_REQUIRED') {
                throw new Error('FULL_BALANCE_REQUIRED');
            }
        }
        const prevAttempts = await ExamAttempt_1.ExamAttempt.count({ where: { userId, courseId } });
        if (prevAttempts >= 2) {
            throw new Error('RETAKE_LIMIT_EXCEEDED');
        }
        const attempt = await ExamAttempt_1.ExamAttempt.create({
            userId,
            courseId,
            score: 0,
            isPass: false,
            attemptNumber: prevAttempts + 1
        });
        return attempt;
    }
    static async saveAnswers(attemptId, answers) {
        const attempt = await ExamAttempt_1.ExamAttempt.findByPk(attemptId);
        if (!attempt)
            throw new Error('ATTEMPT_NOT_FOUND');
        // Implement save logic if answers are stored incrementally
        return { status: 'Saved' };
    }
    static async submitAttempt(attemptId, userAnswers = {}) {
        const attempt = await ExamAttempt_1.ExamAttempt.findByPk(attemptId);
        if (!attempt)
            throw new Error('ATTEMPT_NOT_FOUND');
        const { ExamQuestion, ExamConfig, Enrollment, Ticket } = require('../models');
        const questions = await ExamQuestion.findAll({ where: { courseId: attempt.courseId } });
        const config = await ExamConfig.findOne({ where: { courseId: attempt.courseId } });
        const passThreshold = config?.passScoreThreshold || 80;
        let totalWeight = 0;
        let earnedWeight = 0;
        let requiresManualReview = false;
        questions.forEach((q) => {
            const qWeight = q.weight || 10;
            totalWeight += qWeight;
            const submittedAns = userAnswers[q.id];
            if (q.questionType === 'mcq') {
                if (submittedAns !== undefined && Number(submittedAns) === q.correctOptionIndex) {
                    earnedWeight += qWeight;
                }
            }
            else if (q.questionType === 'input_answer') {
                if (submittedAns && q.correctAnswer && String(submittedAns).trim().toLowerCase() === String(q.correctAnswer).trim().toLowerCase()) {
                    earnedWeight += qWeight;
                }
            }
            else if (q.questionType === 'essay') {
                requiresManualReview = true;
                if (submittedAns && String(submittedAns).trim().length > 10) {
                    earnedWeight += qWeight * 0.8; // Partial credit allocated pending review
                }
            }
        });
        const calculatedScore = totalWeight > 0 ? Math.round((earnedWeight / totalWeight) * 100) : 85;
        let isPass = calculatedScore >= passThreshold;
        // Auto-pass 2nd attempt at exactly the passThreshold if they originally failed it
        if (!isPass && attempt.attemptNumber >= 2) {
            isPass = true;
            attempt.score = passThreshold;
        }
        else {
            attempt.score = calculatedScore;
        }
        attempt.isPass = isPass;
        await attempt.save();
        const { User } = require('../models');
        const user = await User.findByPk(attempt.userId);
        const { sendTicketCourseSubmittedEmail, sendTicketCourseFailedEmail, sendTicketCoursePassedEmail } = require('../utils/email');
        if (user) {
            try {
                await sendTicketCourseSubmittedEmail(user.email, user.fullName);
                if (isPass) {
                    await sendTicketCoursePassedEmail(user.email, user.fullName);
                }
                else {
                    await sendTicketCourseFailedEmail(user.email, user.fullName);
                }
            }
            catch (err) {
                console.error('[ExamAttemptService] Failed to send outcome emails', err);
            }
        }
        // 1.1.20 Update Course/Enrollment status to 'Review-Awaiting' upon exam submission
        const enrollment = await Enrollment.findOne({
            where: { userId: attempt.userId, courseId: attempt.courseId }
        });
        if (enrollment) {
            if (requiresManualReview || !isPass) {
                await enrollment.update({ status: 'Review-Awaiting' });
            }
            else {
                await enrollment.update({ status: 'Completed' });
            }
        }
        // Check if there is an associated ticket for this user & course
        const ticket = await Ticket.findOne({
            where: { userId: attempt.userId, courseId: attempt.courseId }
        });
        if (ticket) {
            const { ticketService } = require('./TicketService');
            await ticketService.recordExamOutcome(ticket.id, isPass, attempt.attemptNumber, calculatedScore);
        }
        return {
            attempt,
            score: calculatedScore,
            isPass,
            requiresManualReview,
            passThreshold
        };
    }
    static async getAttemptResult(attemptId) {
        const attempt = await ExamAttempt_1.ExamAttempt.findByPk(attemptId);
        if (!attempt)
            throw new Error('ATTEMPT_NOT_FOUND');
        return attempt;
    }
}
exports.ExamAttemptService = ExamAttemptService;
