"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.practicalAssessmentController = exports.PracticalAssessmentController = void 0;
const PracticalAssessmentService_1 = require("../services/PracticalAssessmentService");
const constants_1 = require("../constants");
class PracticalAssessmentController {
    async getCriteria(req, res, next) {
        try {
            const data = await PracticalAssessmentService_1.PracticalAssessmentService.getCriteria(req.params.courseId);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json({ success: true, data });
        }
        catch (error) {
            next(error);
        }
    }
    async addCriterion(req, res, next) {
        try {
            const data = await PracticalAssessmentService_1.PracticalAssessmentService.addCriterion(req.params.courseId, req.body);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json({ success: true, data });
        }
        catch (error) {
            next(error);
        }
    }
    async deleteCriterion(req, res, next) {
        try {
            await PracticalAssessmentService_1.PracticalAssessmentService.deleteCriterion(req.params.criterionId);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json({ success: true, message: 'Criterion deleted' });
        }
        catch (error) {
            if (error.message === 'CRITERION_NOT_FOUND')
                return res.status(404).json({ code: 404, message: 'Criterion not found.' });
            next(error);
        }
    }
    async updateCriterion(req, res, next) {
        try {
            const data = await PracticalAssessmentService_1.PracticalAssessmentService.updateCriterion(req.params.criterionId, req.body);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json({ success: true, data });
        }
        catch (error) {
            if (error.message === 'CRITERION_NOT_FOUND')
                return res.status(404).json({ code: 404, message: 'Criterion not found.' });
            next(error);
        }
    }
}
exports.PracticalAssessmentController = PracticalAssessmentController;
exports.practicalAssessmentController = new PracticalAssessmentController();
