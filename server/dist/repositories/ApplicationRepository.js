"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applicationRepository = exports.ApplicationRepository = void 0;
const models_1 = require("../models");
class ApplicationRepository {
    // Maps to STK-APP-APPLIST-001, SCR-APP-APPLIST-001
    async findByUserId(userId, options = {}, transaction) {
        const result = await models_1.Application.findAndCountAll({
            where: { userId },
            limit: options.limit || 10,
            offset: options.offset || 0,
            include: [
                { model: models_1.JobListing },
                {
                    model: models_1.JobStage,
                    as: 'JobStages',
                    include: [{ model: models_1.PrefillStage, as: 'PrefillStage' }]
                }
            ],
            order: [['updatedAt', 'DESC']],
            transaction
        });
        for (const app of result.rows) {
            if (!app.JobListing && app.jobId) {
                const job = await models_1.JobListing.findByPk(app.jobId, { transaction });
                if (job) {
                    app.setDataValue('JobListing', job.toJSON());
                }
                else {
                    app.setDataValue('JobListing', {
                        id: app.jobId,
                        title: 'General FIFO Application',
                        company: 'BlueCollar Recruitment',
                        location: 'Australia',
                        salary: 'Competitive',
                        visaSponsorship: false
                    });
                }
            }
            if (!app.JobStages || app.JobStages.length === 0) {
                const defaultStage = await models_1.JobStage.create({
                    applicationId: app.id,
                    prefillStageId: 1,
                    status: 'not started'
                }, { transaction });
                app.setDataValue('JobStages', [defaultStage.toJSON()]);
                app.setDataValue('currentStageId', defaultStage.id);
            }
            else if (!app.currentStageId && app.JobStages && app.JobStages.length > 0) {
                app.setDataValue('currentStageId', app.JobStages[0].id);
            }
            if (!app.status) {
                app.setDataValue('status', 'Active');
            }
        }
        return result;
    }
    // Maps to STK-ADM-APP-001, SCR-ADM-NEWAPPS-001
    async findAllAdmin(options = {}, transaction) {
        const whereClause = {};
        if (options.status)
            whereClause.status = options.status;
        if (options.userId)
            whereClause.userId = options.userId;
        const result = await models_1.Application.findAndCountAll({
            where: whereClause,
            limit: options.limit || 20,
            offset: options.offset || 0,
            include: [
                { model: models_1.User, attributes: ['id', 'fullName', 'email'] },
                { model: models_1.JobListing },
                {
                    model: models_1.JobStage,
                    as: 'JobStages',
                    include: [{ model: models_1.PrefillStage, as: 'PrefillStage' }]
                }
            ],
            order: [['createdAt', 'DESC']],
            transaction
        });
        for (const app of result.rows) {
            if (!app.JobListing && app.jobId) {
                const job = await models_1.JobListing.findByPk(app.jobId, { transaction });
                if (job) {
                    app.setDataValue('JobListing', job.toJSON());
                }
                else {
                    app.setDataValue('JobListing', {
                        id: app.jobId,
                        title: 'General FIFO Application',
                        company: 'BlueCollar Recruitment'
                    });
                }
            }
            if (!app.JobStages || app.JobStages.length === 0) {
                const defaultStage = await models_1.JobStage.create({
                    applicationId: app.id,
                    prefillStageId: 1,
                    status: 'not started'
                }, { transaction });
                app.setDataValue('JobStages', [defaultStage.toJSON()]);
                app.setDataValue('currentStageId', defaultStage.id);
            }
            else if (!app.currentStageId && app.JobStages && app.JobStages.length > 0) {
                app.setDataValue('currentStageId', app.JobStages[0].id);
            }
            if (!app.status) {
                app.setDataValue('status', 'Active');
            }
        }
        return result;
    }
    // Maps to STK-APP-APPLY-002, SCR-APP-JOBAPPLY-001
    async findById(id, transaction) {
        const app = await models_1.Application.findByPk(id, {
            include: [
                models_1.JobListing,
                models_1.User,
                { model: models_1.Ticket, as: 'Tickets' },
                {
                    model: models_1.JobStage,
                    as: 'JobStages',
                    include: [{ model: models_1.PrefillStage, as: 'PrefillStage' }]
                }
            ],
            transaction
        });
        if (app) {
            if (!app.JobListing && app.jobId) {
                const job = await models_1.JobListing.findByPk(app.jobId, { transaction });
                if (job) {
                    app.setDataValue('JobListing', job.toJSON());
                }
                else {
                    app.setDataValue('JobListing', {
                        id: app.jobId,
                        title: 'General FIFO Application',
                        company: 'BlueCollar Recruitment',
                        location: 'Australia',
                        salary: 'Competitive',
                        description: 'Application details for FIFO position.',
                        visaSponsorship: false
                    });
                }
            }
            if (!app.JobStages || app.JobStages.length === 0) {
                const defaultStage = await models_1.JobStage.create({
                    applicationId: app.id,
                    prefillStageId: 1,
                    status: 'not started'
                }, { transaction });
                app.setDataValue('JobStages', [defaultStage.toJSON()]);
                app.setDataValue('currentStageId', defaultStage.id);
            }
            else if (!app.currentStageId && app.JobStages && app.JobStages.length > 0) {
                app.setDataValue('currentStageId', app.JobStages[0].id);
            }
            if (!app.status) {
                app.setDataValue('status', 'Active');
            }
            // Attach applicant's exam attempts with course information
            try {
                const { ExamAttempt, Course } = require('../models');
                const attempts = await ExamAttempt.findAll({
                    where: { userId: app.userId },
                    include: [{ model: Course }],
                    order: [['createdAt', 'DESC']],
                    transaction
                });
                app.setDataValue('ExamAttempts', attempts.map((a) => a.toJSON()));
            }
            catch (err) {
                console.error('[ApplicationRepository] Error fetching exam attempts:', err);
                app.setDataValue('ExamAttempts', []);
            }
        }
        return app;
    }
    // Maps to STK-APP-APPLY-001, TRUST-009
    async create(appData, transaction) {
        return models_1.Application.create(appData, { transaction });
    }
    // Maps to STK-APP-APPLY-005, STK-APP-PAY-003, DM-001
    async update(id, updateData, transaction) {
        return models_1.Application.update(updateData, { where: { id }, transaction });
    }
    // Maps to STK-APP-PROFILE-001
    async delete(id, transaction) {
        await models_1.Application.destroy({ where: { id }, transaction });
    }
}
exports.ApplicationRepository = ApplicationRepository;
exports.applicationRepository = new ApplicationRepository();
