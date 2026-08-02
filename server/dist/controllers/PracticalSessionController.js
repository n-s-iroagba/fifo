"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.practicalSessionController = exports.PracticalSessionController = void 0;
const PracticalSessionService_1 = require("../services/PracticalSessionService");
const constants_1 = require("../constants");
class PracticalSessionController {
    // GET /api/practical-sessions/prerequisite-check/:courseId
    async checkPrerequisites(req, res, next) {
        try {
            const userId = req.user?.id;
            if (!userId)
                throw new Error('UNAUTHORIZED_ACCESS');
            const data = await PracticalSessionService_1.PracticalSessionService.checkPrerequisites(userId, req.params.courseId);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json({ success: true, data });
        }
        catch (error) {
            next(error);
        }
    }
    // GET /api/practical-sessions/available-slots
    async getAvailableSlots(req, res, next) {
        try {
            const courseId = req.query.courseId;
            const data = await PracticalSessionService_1.PracticalSessionService.getAvailableSlots(courseId);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json({ success: true, data });
        }
        catch (error) {
            next(error);
        }
    }
    // POST /api/practical-sessions/bookings
    async bookSession(req, res, next) {
        try {
            const userId = req.user?.id;
            if (!userId)
                throw new Error('UNAUTHORIZED_ACCESS');
            const data = await PracticalSessionService_1.PracticalSessionService.bookSession(userId, req.body.sessionId);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json({ success: true, data });
        }
        catch (error) {
            if (error.message === 'SESSION_FULL')
                return res.status(409).json({ code: 409, message: 'Session is full.' });
            if (error.message === 'SESSION_NOT_FOUND')
                return res.status(404).json({ code: 404, message: 'Session not found.' });
            next(error);
        }
    }
    // DELETE /api/practical-sessions/bookings/:bookingId
    async cancelBooking(req, res, next) {
        try {
            const userId = req.user?.id;
            if (!userId)
                throw new Error('UNAUTHORIZED_ACCESS');
            await PracticalSessionService_1.PracticalSessionService.cancelBooking(userId, req.params.bookingId);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json({ success: true, message: 'Booking cancelled.' });
        }
        catch (error) {
            if (error.message === 'BOOKING_NOT_FOUND')
                return res.status(404).json({ code: 404, message: 'Booking not found.' });
            next(error);
        }
    }
    // GET /api/practical-sessions/:sessionId/roster
    async getRoster(req, res, next) {
        try {
            const data = await PracticalSessionService_1.PracticalSessionService.getRoster(req.params.sessionId);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json({ success: true, data });
        }
        catch (error) {
            if (error.message === 'SESSION_NOT_FOUND')
                return res.status(404).json({ code: 404, message: 'Session not found.' });
            next(error);
        }
    }
    // POST /api/practical-sessions/:sessionId/attendance
    async markAttendance(req, res, next) {
        try {
            const data = await PracticalSessionService_1.PracticalSessionService.markAttendance(req.params.sessionId, req.body.attendanceData);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json({ success: true, data });
        }
        catch (error) {
            if (error.message === 'SESSION_NOT_FOUND')
                return res.status(404).json({ code: 404, message: 'Session not found.' });
            next(error);
        }
    }
}
exports.PracticalSessionController = PracticalSessionController;
exports.practicalSessionController = new PracticalSessionController();
