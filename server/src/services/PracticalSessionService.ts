import { PracticalSession } from '../models/PracticalSession';
import { PracticalBooking } from '../models/PracticalBooking';
import { Course } from '../models/Course';
import { ExamAttempt } from '../models/ExamAttempt';
import { User } from '../models/User';

export class PracticalSessionService {
    static async checkPrerequisites(userId: number, courseId: string) {
        const course = await Course.findByPk(courseId);
        if (!course) throw new Error('COURSE_NOT_FOUND');

        // Mixed courses require theory pass before practical booking
        if (course.format === 'Mixed') {
            const passedExam = await ExamAttempt.findOne({
                where: { userId, courseId, isPass: true }
            });
            if (!passedExam) {
                return { isEligible: false, reason: 'Theory component not completed.' };
            }
        }
        return { isEligible: true, reason: 'Prerequisites met.' };
    }

    static async getAvailableSlots(courseId: string) {
        // Find future sessions with remaining capacity
        const sessions = await PracticalSession.findAll({
            where: { courseId }
        });
        
        const availableSessions = [];
        for (const session of sessions) {
            const enrolledCount = await PracticalBooking.count({ where: { sessionId: session.id, status: 'Confirmed' } });
            if (enrolledCount < session.capacity) {
                availableSessions.push(session);
            }
        }
        return availableSessions;
    }

    static async bookSession(userId: number, sessionId: string) {
        const session = await PracticalSession.findByPk(sessionId);
        if (!session) throw new Error('SESSION_NOT_FOUND');

        const enrolledCount = await PracticalBooking.count({ where: { sessionId: session.id, status: 'Confirmed' } });
        if (enrolledCount >= session.capacity) {
            throw new Error('SESSION_FULL');
        }

        const booking = await PracticalBooking.create({
            userId,
            sessionId,
            status: 'Confirmed'
        });

        return booking;
    }

    static async cancelBooking(userId: number, bookingId: string) {
        const booking = await PracticalBooking.findOne({ where: { id: bookingId, userId } });
        if (!booking) throw new Error('BOOKING_NOT_FOUND');

        await booking.destroy();
        return true;
    }

    static async getRoster(sessionId: string) {
        const session = await PracticalSession.findByPk(sessionId);
        if (!session) throw new Error('SESSION_NOT_FOUND');

        const bookings = await PracticalBooking.findAll({
            where: { sessionId },
            include: [{ model: User }]
        });

        return {
            session,
            bookings
        };
    }

    static async markAttendance(sessionId: string, attendanceData: Array<{ bookingId: string, status: string }>) {
        const session = await PracticalSession.findByPk(sessionId);
        if (!session) throw new Error('SESSION_NOT_FOUND');

        for (const data of attendanceData) {
            await PracticalBooking.update(
                { status: data.status },
                { where: { id: data.bookingId, sessionId } }
            );
        }

        return { status: 'Attendance Updated' };
    }
}
