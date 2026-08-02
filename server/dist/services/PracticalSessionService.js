"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PracticalSessionService = void 0;
const PracticalSession_1 = require("../models/PracticalSession");
const PracticalBooking_1 = require("../models/PracticalBooking");
const Course_1 = require("../models/Course");
const ExamAttempt_1 = require("../models/ExamAttempt");
const User_1 = require("../models/User");
class PracticalSessionService {
    static async checkPrerequisites(userId, courseId) {
        const course = await Course_1.Course.findByPk(courseId);
        if (!course)
            throw new Error('COURSE_NOT_FOUND');
        // Mixed courses require theory pass before practical booking
        if (course.format === 'Mixed') {
            const passedExam = await ExamAttempt_1.ExamAttempt.findOne({
                where: { userId, courseId, isPass: true }
            });
            if (!passedExam) {
                return { isEligible: false, reason: 'Theory component not completed.' };
            }
        }
        return { isEligible: true, reason: 'Prerequisites met.' };
    }
    static async getAvailableSlots(courseId) {
        // Find future sessions with remaining capacity
        const sessions = await PracticalSession_1.PracticalSession.findAll({
            where: { courseId }
        });
        const availableSessions = [];
        for (const session of sessions) {
            const enrolledCount = await PracticalBooking_1.PracticalBooking.count({ where: { sessionId: session.id, status: 'Confirmed' } });
            if (enrolledCount < session.capacity) {
                availableSessions.push(session);
            }
        }
        return availableSessions;
    }
    static async bookSession(userId, sessionId) {
        const session = await PracticalSession_1.PracticalSession.findByPk(sessionId);
        if (!session)
            throw new Error('SESSION_NOT_FOUND');
        const enrolledCount = await PracticalBooking_1.PracticalBooking.count({ where: { sessionId: session.id, status: 'Confirmed' } });
        if (enrolledCount >= session.capacity) {
            throw new Error('SESSION_FULL');
        }
        const booking = await PracticalBooking_1.PracticalBooking.create({
            userId,
            sessionId,
            status: 'Confirmed'
        });
        return booking;
    }
    static async cancelBooking(userId, bookingId) {
        const booking = await PracticalBooking_1.PracticalBooking.findOne({ where: { id: bookingId, userId } });
        if (!booking)
            throw new Error('BOOKING_NOT_FOUND');
        await booking.destroy();
        return true;
    }
    static async getRoster(sessionId) {
        const session = await PracticalSession_1.PracticalSession.findByPk(sessionId);
        if (!session)
            throw new Error('SESSION_NOT_FOUND');
        const bookings = await PracticalBooking_1.PracticalBooking.findAll({
            where: { sessionId },
            include: [{ model: User_1.User }]
        });
        return {
            session,
            bookings
        };
    }
    static async markAttendance(sessionId, attendanceData) {
        const session = await PracticalSession_1.PracticalSession.findByPk(sessionId);
        if (!session)
            throw new Error('SESSION_NOT_FOUND');
        for (const data of attendanceData) {
            await PracticalBooking_1.PracticalBooking.update({ status: data.status }, { where: { id: data.bookingId, sessionId } });
        }
        return { status: 'Attendance Updated' };
    }
}
exports.PracticalSessionService = PracticalSessionService;
