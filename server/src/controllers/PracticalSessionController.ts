import { Request, Response, NextFunction } from 'express';
import { PracticalSessionService } from '../services/PracticalSessionService';
import { CONSTANTS } from '../constants';
import { z } from 'zod';

export class PracticalSessionController {
    // GET /api/practical-sessions/prerequisite-check/:courseId
    async checkPrerequisites(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req as any).user?.id;
            if (!userId) throw new Error('UNAUTHORIZED_ACCESS');
            const data = await PracticalSessionService.checkPrerequisites(userId, req.params.courseId as string);
            res.status(CONSTANTS.HTTP_STATUS.OK).json({ success: true, data });
        } catch (error: any) {
            next(error);
        }
    }

    // GET /api/practical-sessions/available-slots
    async getAvailableSlots(req: Request, res: Response, next: NextFunction) {
        try {
            const courseId = req.query.courseId as string;
            const data = await PracticalSessionService.getAvailableSlots(courseId);
            res.status(CONSTANTS.HTTP_STATUS.OK).json({ success: true, data });
        } catch (error: any) {
            next(error);
        }
    }

    // POST /api/practical-sessions/bookings
    async bookSession(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req as any).user?.id;
            if (!userId) throw new Error('UNAUTHORIZED_ACCESS');
            const data = await PracticalSessionService.bookSession(userId, req.body.sessionId);
            res.status(CONSTANTS.HTTP_STATUS.OK).json({ success: true, data });
        } catch (error: any) {
            if (error.message === 'SESSION_FULL') return res.status(409).json({ code: 409, message: 'Session is full.' });
            if (error.message === 'SESSION_NOT_FOUND') return res.status(404).json({ code: 404, message: 'Session not found.' });
            next(error);
        }
    }

    // DELETE /api/practical-sessions/bookings/:bookingId
    async cancelBooking(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req as any).user?.id;
            if (!userId) throw new Error('UNAUTHORIZED_ACCESS');
            await PracticalSessionService.cancelBooking(userId, req.params.bookingId as string);
            res.status(CONSTANTS.HTTP_STATUS.OK).json({ success: true, message: 'Booking cancelled.' });
        } catch (error: any) {
            if (error.message === 'BOOKING_NOT_FOUND') return res.status(404).json({ code: 404, message: 'Booking not found.' });
            next(error);
        }
    }

    // GET /api/practical-sessions/:sessionId/roster
    async getRoster(req: Request, res: Response, next: NextFunction) {
        try {
            const data = await PracticalSessionService.getRoster(req.params.sessionId as string);
            res.status(CONSTANTS.HTTP_STATUS.OK).json({ success: true, data });
        } catch (error: any) {
            if (error.message === 'SESSION_NOT_FOUND') return res.status(404).json({ code: 404, message: 'Session not found.' });
            next(error);
        }
    }

    // POST /api/practical-sessions/:sessionId/attendance
    async markAttendance(req: Request, res: Response, next: NextFunction) {
        try {
            const data = await PracticalSessionService.markAttendance(req.params.sessionId as string, req.body.attendanceData);
            res.status(CONSTANTS.HTTP_STATUS.OK).json({ success: true, data });
        } catch (error: any) {
            if (error.message === 'SESSION_NOT_FOUND') return res.status(404).json({ code: 404, message: 'Session not found.' });
            next(error);
        }
    }
}
export const practicalSessionController = new PracticalSessionController();
