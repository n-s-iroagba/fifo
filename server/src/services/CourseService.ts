import { Course } from '../models/Course';
import { CourseModule } from '../models/CourseModule';
import { CertificationType } from '../models/CertificationType';
import { sequelize } from '../config/database';
import { ExamConfig } from '../models/ExamConfig';
import { ExamQuestion } from '../models/ExamQuestion';

export class CourseService {
    static async getCertificationTypes() {
        return await CertificationType.findAll({ attributes: ['id', 'name', 'code'] });
    }

    static async createCourse(data: any) {
        // Enforce uniqueness is handled by DB / Sequelize validation
        return await Course.create(data);
    }

    static async getModules(courseId: string) {
        const course = await Course.findByPk(courseId);
        if (!course) throw new Error('COURSE_NOT_FOUND');
        return await CourseModule.findAll({ where: { courseId }, order: [['sequenceOrder', 'ASC']] });
    }

    static async addModule(courseId: string, data: any) {
        return await CourseModule.create({ ...data, courseId });
    }

    static async deleteModule(courseId: string, moduleId: string) {
        const result = await CourseModule.destroy({ where: { id: moduleId, courseId } });
        if (result === 0) throw new Error('MODULE_NOT_FOUND');
        return true;
    }

    static async updateModule(courseId: string, moduleId: string, data: any) {
        const mod = await CourseModule.findOne({ where: { id: moduleId, courseId } });
        if (!mod) throw new Error('MODULE_NOT_FOUND');
        await mod.update(data);
        return mod;
    }

    static async bulkImport(fileData: string, formatType: string) {
        // Placeholder for bulk import parsing logic
        return {
            importStatus: "COMPLETED",
            importedCount: 0,
            failedCount: 0,
            errors: []
        };
    }

    static async getAllAdminCourses() {
        return await Course.findAll({ include: [CertificationType], order: [['createdAt', 'DESC']] });
    }

    static async togglePublish(courseId: string, isPublished: boolean) {
        const course = await Course.findByPk(courseId);
        if (!course) throw new Error('COURSE_NOT_FOUND');
        await course.update({ isPublished });
        return course;
    }
}
