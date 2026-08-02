"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PracticalAssessmentService = void 0;
const PracticalCriterion_1 = require("../models/PracticalCriterion");
class PracticalAssessmentService {
    static async getCriteria(courseId) {
        return await PracticalCriterion_1.PracticalCriterion.findAll({ where: { courseId } });
    }
    static async addCriterion(courseId, data) {
        return await PracticalCriterion_1.PracticalCriterion.create({ ...data, courseId });
    }
    static async deleteCriterion(criterionId) {
        const result = await PracticalCriterion_1.PracticalCriterion.destroy({ where: { id: criterionId } });
        if (result === 0)
            throw new Error('CRITERION_NOT_FOUND');
        return true;
    }
    static async updateCriterion(criterionId, data) {
        const crit = await PracticalCriterion_1.PracticalCriterion.findByPk(criterionId);
        if (!crit)
            throw new Error('CRITERION_NOT_FOUND');
        await crit.update(data);
        return crit;
    }
}
exports.PracticalAssessmentService = PracticalAssessmentService;
