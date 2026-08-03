import { Request, Response, NextFunction } from 'express';
import { CourseService } from '../services/CourseService';
import { CONSTANTS } from '../constants';

export class CourseController {
    async getCertificationTypes(req: Request, res: Response, next: NextFunction) {
        try {
            const data = await CourseService.getCertificationTypes();
            res.status(CONSTANTS.HTTP_STATUS.OK).json({ success: true, data });
        } catch (error) { next(error); }
    }

    async createCourse(req: Request, res: Response, next: NextFunction) {
        try {
            const data = await CourseService.createCourse(req.body);
            res.status(CONSTANTS.HTTP_STATUS.OK).json({ success: true, data });
        } catch (error: any) {
            if (error.name === 'SequelizeUniqueConstraintError') {
                return res.status(409).json({ code: 409, message: 'Course code already exists.' });
            }
            next(error);
        }
    }

    async getModules(req: Request, res: Response, next: NextFunction) {
        try {
            const data = await CourseService.getModules(req.params.id as string);
            res.status(CONSTANTS.HTTP_STATUS.OK).json({ success: true, data });
        } catch (error: any) {
            if (error.message === 'COURSE_NOT_FOUND') return res.status(404).json({ code: 404, message: 'Course not found.' });
            next(error);
        }
    }

    async addModule(req: Request, res: Response, next: NextFunction) {
        try {
            const data = await CourseService.addModule(req.params.id as string, req.body);
            res.status(CONSTANTS.HTTP_STATUS.OK).json({ success: true, data });
        } catch (error) { next(error); }
    }

    async deleteModule(req: Request, res: Response, next: NextFunction) {
        try {
            await CourseService.deleteModule(req.params.id as string, req.params.moduleId as string);
            res.status(CONSTANTS.HTTP_STATUS.OK).json({ success: true, message: 'Module deleted successfully' });
        } catch (error: any) {
            if (error.message === 'MODULE_NOT_FOUND') return res.status(404).json({ code: 404, message: 'Module ID not found.' });
            next(error);
        }
    }

    async updateModule(req: Request, res: Response, next: NextFunction) {
        try {
            const data = await CourseService.updateModule(req.params.id as string, req.params.moduleId as string, req.body);
            res.status(CONSTANTS.HTTP_STATUS.OK).json({ success: true, data });
        } catch (error: any) {
            if (error.message === 'MODULE_NOT_FOUND') return res.status(404).json({ code: 404, message: 'Module ID not found.' });
            next(error);
        }
    }

    async bulkImport(req: Request, res: Response, next: NextFunction) {
        try {
            const data = await CourseService.bulkImport(req.body.fileData, req.body.formatType);
            res.status(CONSTANTS.HTTP_STATUS.OK).json({ success: true, data });
        } catch (error) { next(error); }
    }

    async getAllAdminCourses(req: Request, res: Response, next: NextFunction) {
        try {
            const data = await CourseService.getAllAdminCourses();
            res.status(CONSTANTS.HTTP_STATUS.OK).json({ success: true, data });
        } catch (error) { next(error); }
    }

    async togglePublish(req: Request, res: Response, next: NextFunction) {
        try {
            const data = await CourseService.togglePublish(req.params.id as string, req.body.isPublished);
            res.status(CONSTANTS.HTTP_STATUS.OK).json({ success: true, data });
        } catch (error) { next(error); }
    }

    async getPublishedCourses(req: Request, res: Response, next: NextFunction) {
        try {
            const data = await CourseService.getPublishedCourses();
            res.status(CONSTANTS.HTTP_STATUS.OK).json({ success: true, data });
        } catch (error) { next(error); }
    }

    async getCourseById(req: Request, res: Response, next: NextFunction) {
        try {
            const data = await CourseService.getCourseById(req.params.id as string);
            res.status(CONSTANTS.HTTP_STATUS.OK).json({ success: true, data });
        } catch (error: any) {
            if (error.message === 'COURSE_NOT_FOUND') return res.status(404).json({ code: 404, message: 'Course not found.' });
            next(error);
        }
    }
}
export const courseController = new CourseController();
