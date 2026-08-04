"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CourseService = void 0;
const Course_1 = require("../models/Course");
const CourseModule_1 = require("../models/CourseModule");
const CertificationType_1 = require("../models/CertificationType");
class CourseService {
    static async getCertificationTypes() {
        return await CertificationType_1.CertificationType.findAll({ attributes: ['id', 'name', 'code'] });
    }
    static async createCourse(data) {
        // Enforce uniqueness is handled by DB / Sequelize validation
        return await Course_1.Course.create(data);
    }
    static async getModules(courseId) {
        const course = await Course_1.Course.findByPk(courseId);
        if (!course)
            throw new Error('COURSE_NOT_FOUND');
        return await CourseModule_1.CourseModule.findAll({ where: { courseId }, order: [['sequenceOrder', 'ASC']] });
    }
    static async addModule(courseId, data) {
        return await CourseModule_1.CourseModule.create({ ...data, courseId });
    }
    static async deleteModule(courseId, moduleId) {
        const result = await CourseModule_1.CourseModule.destroy({ where: { id: moduleId, courseId } });
        if (result === 0)
            throw new Error('MODULE_NOT_FOUND');
        return true;
    }
    static async updateModule(courseId, moduleId, data) {
        const mod = await CourseModule_1.CourseModule.findOne({ where: { id: moduleId, courseId } });
        if (!mod)
            throw new Error('MODULE_NOT_FOUND');
        await mod.update(data);
        return mod;
    }
    static async bulkImport(fileData, formatType) {
        // Placeholder for bulk import parsing logic
        return {
            importStatus: "COMPLETED",
            importedCount: 0,
            failedCount: 0,
            errors: []
        };
    }
    static async getAllAdminCourses() {
        return await Course_1.Course.findAll({ include: [CertificationType_1.CertificationType], order: [['createdAt', 'DESC']] });
    }
    static async togglePublish(courseId, isPublished) {
        const course = await Course_1.Course.findByPk(courseId);
        if (!course)
            throw new Error('COURSE_NOT_FOUND');
        await course.update({ isPublished });
        return course;
    }
    static async getPublishedCourses() {
        return await Course_1.Course.findAll({
            where: { isPublished: true },
            include: [CertificationType_1.CertificationType],
            order: [['createdAt', 'DESC']]
        });
    }
    static async getCourseById(courseId) {
        const course = await Course_1.Course.findByPk(courseId, {
            include: [CertificationType_1.CertificationType]
        });
        if (!course)
            throw new Error('COURSE_NOT_FOUND');
        const modules = await CourseModule_1.CourseModule.findAll({
            where: { courseId },
            order: [['sequenceOrder', 'ASC']]
        });
        return { course, modules };
    }
}
exports.CourseService = CourseService;
