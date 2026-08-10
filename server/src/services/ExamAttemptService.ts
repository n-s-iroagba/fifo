import { ExamAttempt } from '../models/ExamAttempt';
import { ExamConfig } from '../models/ExamConfig';
import { ExamQuestion } from '../models/ExamQuestion';
import { v4 as uuidv4 } from 'uuid';

export class ExamAttemptService {
    static async getAttemptDetails(attemptId: string) {
        const attempt = await ExamAttempt.findByPk(attemptId);
        if (!attempt) throw new Error('ATTEMPT_NOT_FOUND');
        const questions = await ExamQuestion.findAll({ where: { courseId: attempt.courseId } });
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

    static async startAttempt(userId: number, courseId: string) {
        const { Ticket, Enrollment } = require('../models');

        // Check if the user has access
        const ticket = await Ticket.findOne({ where: { userId, courseId } });
        const enrollment = await Enrollment.findOne({ where: { userId, courseId } });

        if (ticket && ticket.courseAccessGranted === false) {
            throw new Error('PAYMENT_REQUIRED');
        }
        if (!ticket && enrollment && enrollment.paymentStatus !== 'Paid') {
            throw new Error('PAYMENT_REQUIRED');
        }

        const prevAttempts = await ExamAttempt.count({ where: { userId, courseId } });
        const config = await ExamConfig.findOne({ where: { courseId } });

        const attempt = await ExamAttempt.create({
            userId,
            courseId,
            score: 0,
            isPass: false,
            attemptNumber: prevAttempts + 1
        });

        return attempt;
    }

    static async saveAnswers(attemptId: string, answers: any) {
        const attempt = await ExamAttempt.findByPk(attemptId);
        if (!attempt) throw new Error('ATTEMPT_NOT_FOUND');
        // Implement save logic if answers are stored incrementally
        return { status: 'Saved' };
    }

    static async submitAttempt(attemptId: string, userAnswers: Record<string, any> = {}) {
        const attempt = await ExamAttempt.findByPk(attemptId);
        if (!attempt) throw new Error('ATTEMPT_NOT_FOUND');

        const { ExamQuestion, ExamConfig, Enrollment, Ticket } = require('../models');
        const questions = await ExamQuestion.findAll({ where: { courseId: attempt.courseId } });
        const config = await ExamConfig.findOne({ where: { courseId: attempt.courseId } });
        const passThreshold = config?.passScoreThreshold || 80;

        let totalWeight = 0;
        let earnedWeight = 0;
        let requiresManualReview = false;

        questions.forEach((q: any) => {
            const qWeight = q.weight || 10;
            totalWeight += qWeight;
            const submittedAns = userAnswers[q.id];

            if (q.questionType === 'mcq') {
                if (submittedAns !== undefined && Number(submittedAns) === q.correctOptionIndex) {
                    earnedWeight += qWeight;
                }
            } else if (q.questionType === 'input_answer') {
                if (submittedAns && q.correctAnswer && String(submittedAns).trim().toLowerCase() === String(q.correctAnswer).trim().toLowerCase()) {
                    earnedWeight += qWeight;
                }
            } else if (q.questionType === 'essay') {
                requiresManualReview = true;
                if (submittedAns && String(submittedAns).trim().length > 10) {
                    earnedWeight += qWeight * 0.8; // Partial credit allocated pending review
                }
            }
        });

        const calculatedScore = totalWeight > 0 ? Math.round((earnedWeight / totalWeight) * 100) : 85;
        const isPass = calculatedScore >= passThreshold;

        attempt.score = calculatedScore;
        attempt.isPass = isPass;
        await attempt.save();

        // 1.1.20 Update Course/Enrollment status to 'Review-Awaiting' upon exam submission
        const enrollment = await Enrollment.findOne({
            where: { userId: attempt.userId, courseId: attempt.courseId }
        });

        if (enrollment) {
            if (requiresManualReview || !isPass) {
                await enrollment.update({ status: 'Review-Awaiting' });
            } else {
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

    static async getAttemptResult(attemptId: string) {
        const attempt = await ExamAttempt.findByPk(attemptId);
        if (!attempt) throw new Error('ATTEMPT_NOT_FOUND');
        return attempt;
    }
}
