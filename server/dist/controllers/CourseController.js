"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.courseController = exports.CourseController = void 0;
const CourseService_1 = require("../services/CourseService");
const constants_1 = require("../constants");
class CourseController {
    async getCertificationTypes(req, res, next) {
        try {
            const data = await CourseService_1.CourseService.getCertificationTypes();
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json({ success: true, data });
        }
        catch (error) {
            next(error);
        }
    }
    async createCourse(req, res, next) {
        try {
            const data = await CourseService_1.CourseService.createCourse(req.body);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json({ success: true, data });
        }
        catch (error) {
            if (error.name === 'SequelizeUniqueConstraintError') {
                return res.status(409).json({ code: 409, message: 'Course code already exists.' });
            }
            next(error);
        }
    }
    async getModules(req, res, next) {
        try {
            const data = await CourseService_1.CourseService.getModules(req.params.id);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json({ success: true, data });
        }
        catch (error) {
            if (error.message === 'COURSE_NOT_FOUND')
                return res.status(404).json({ code: 404, message: 'Course not found.' });
            next(error);
        }
    }
    async addModule(req, res, next) {
        try {
            const data = await CourseService_1.CourseService.addModule(req.params.id, req.body);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json({ success: true, data });
        }
        catch (error) {
            next(error);
        }
    }
    async deleteModule(req, res, next) {
        try {
            await CourseService_1.CourseService.deleteModule(req.params.id, req.params.moduleId);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json({ success: true, message: 'Module deleted successfully' });
        }
        catch (error) {
            if (error.message === 'MODULE_NOT_FOUND')
                return res.status(404).json({ code: 404, message: 'Module ID not found.' });
            next(error);
        }
    }
    async updateModule(req, res, next) {
        try {
            const data = await CourseService_1.CourseService.updateModule(req.params.id, req.params.moduleId, req.body);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json({ success: true, data });
        }
        catch (error) {
            if (error.message === 'MODULE_NOT_FOUND')
                return res.status(404).json({ code: 404, message: 'Module ID not found.' });
            next(error);
        }
    }
    async bulkImport(req, res, next) {
        try {
            const data = await CourseService_1.CourseService.bulkImport(req.body.fileData, req.body.formatType);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json({ success: true, data });
        }
        catch (error) {
            next(error);
        }
    }
    async getAllAdminCourses(req, res, next) {
        try {
            const data = await CourseService_1.CourseService.getAllAdminCourses();
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json({ success: true, data });
        }
        catch (error) {
            next(error);
        }
    }
    async togglePublish(req, res, next) {
        try {
            const data = await CourseService_1.CourseService.togglePublish(req.params.id, req.body.isPublished);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json({ success: true, data });
        }
        catch (error) {
            next(error);
        }
    }
    async getPublishedCourses(req, res, next) {
        try {
            const data = await CourseService_1.CourseService.getPublishedCourses();
            // Check for optional auth
            let userId = null;
            const authHeader = req.headers.authorization;
            if (authHeader && authHeader.startsWith('Bearer ')) {
                try {
                    const { verifyToken } = require('../utils/token');
                    const decoded = verifyToken(authHeader.split(' ')[1]);
                    if (decoded && decoded.id)
                        userId = decoded.id;
                }
                catch (e) {
                    // Ignore invalid token here
                }
            }
            if (userId) {
                const { Ticket, User } = require('../models');
                const user = await User.findByPk(userId);
                const missingTickets = await Ticket.findAll({
                    where: { userId, status: 'not_possessed' }
                });
                const gapCourseIds = missingTickets.map((t) => t.courseId);
                const subsidyPercentage = user?.subsidyPercentage || 0;
                const enrichedData = data.reduce((acc, c) => {
                    const plain = c.toJSON ? c.toJSON() : c;
                    const isGap = gapCourseIds.includes(plain.id);
                    if (isGap) {
                        if (subsidyPercentage > 0) {
                            plain.isGapRecommended = true;
                            plain.subsidyAmount = Math.round(plain.price * (subsidyPercentage / 100));
                            plain.subsidyReason = 'Corporate Subsidy applied';
                        }
                        acc.push(plain);
                    }
                    return acc;
                }, []);
                return res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json({ success: true, data: enrichedData });
            }
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json({ success: true, data });
        }
        catch (error) {
            next(error);
        }
    }
    async getCourseById(req, res, next) {
        try {
            const data = await CourseService_1.CourseService.getCourseById(req.params.id);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json({ success: true, data });
        }
        catch (error) {
            if (error.message === 'COURSE_NOT_FOUND')
                return res.status(404).json({ code: 404, message: 'Course not found.' });
            next(error);
        }
    }
}
exports.CourseController = CourseController;
exports.courseController = new CourseController();
