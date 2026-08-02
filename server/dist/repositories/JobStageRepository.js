"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jobStageRepository = exports.JobStageRepository = void 0;
const models_1 = require("../models");
class JobStageRepository {
    async findByApplicationId(applicationId, transaction) {
        return models_1.JobStage.findAndCountAll({
            where: { applicationId },
            order: [['orderPosition', 'ASC']],
            transaction
        });
    }
    async findById(id, transaction) {
        return models_1.JobStage.findByPk(id, { transaction });
    }
    // Maps to STK-ADM-STAGE-001, STK-ADM-STAGE-002, SCR-ADM-STAGEFORM-001
    async create(data, transaction) {
        return models_1.JobStage.create(data, { transaction });
    }
    // Maps to STK-ADM-STAGE-001, STK-ADM-STAGE-003, STK-ADM-STAGE-004
    async update(id, data, transaction) {
        return models_1.JobStage.update(data, { where: { id }, transaction });
    }
    // Maps to STK-ADM-STAGE-001
    async delete(id, transaction) {
        await models_1.JobStage.destroy({ where: { id }, transaction });
    }
}
exports.JobStageRepository = JobStageRepository;
exports.jobStageRepository = new JobStageRepository();
