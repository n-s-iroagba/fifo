import { PracticalCriterion } from '../models/PracticalCriterion';

export class PracticalAssessmentService {
    static async getCriteria(courseId: string) {
        return await PracticalCriterion.findAll({ where: { courseId } });
    }

    static async addCriterion(courseId: string, data: any) {
        return await PracticalCriterion.create({ ...data, courseId });
    }

    static async deleteCriterion(criterionId: string) {
        const result = await PracticalCriterion.destroy({ where: { id: criterionId } });
        if (result === 0) throw new Error('CRITERION_NOT_FOUND');
        return true;
    }

    static async updateCriterion(criterionId: string, data: any) {
        const crit = await PracticalCriterion.findByPk(criterionId);
        if (!crit) throw new Error('CRITERION_NOT_FOUND');
        await crit.update(data);
        return crit;
    }
}
