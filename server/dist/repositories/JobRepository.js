"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jobRepository = exports.JobRepository = void 0;
const sequelize_1 = require("sequelize");
const models_1 = require("../models");
class JobRepository {
    // Maps to STK-APP-DASH-001, STK-ADM-JOB-004
    async findAllActive(options = {}) {
        const whereClause = { isActive: true };
        if (options.categoryId)
            whereClause.categoryId = options.categoryId;
        if (options.employmentType)
            whereClause.employmentType = options.employmentType;
        if (options.searchQuery) {
            const searchPattern = `%${options.searchQuery}%`;
            const lowerSearch = options.searchQuery.toLowerCase();
            const orConditions = [
                { title: { [sequelize_1.Op.like]: searchPattern } },
                { location: { [sequelize_1.Op.like]: searchPattern } },
                { description: { [sequelize_1.Op.like]: searchPattern } },
                { employmentType: { [sequelize_1.Op.like]: searchPattern } },
                { salary: { [sequelize_1.Op.like]: searchPattern } },
                { jobType: { [sequelize_1.Op.like]: searchPattern } },
                { '$JobCategory.name$': { [sequelize_1.Op.like]: searchPattern } }
            ];
            if (lowerSearch.includes('visa') || lowerSearch.includes('sponsor')) {
                const wantsNoVisa = lowerSearch.includes('no ') || lowerSearch.includes('without');
                orConditions.push({ visaSponsorship: !wantsNoVisa });
            }
            whereClause[sequelize_1.Op.or] = orConditions;
        }
        const order = [];
        if (options.sortBy) {
            order.push([options.sortBy, options.sortOrder || 'DESC']);
        }
        else {
            order.push(['createdAt', 'DESC']);
        }
        // Step 1: Find matching job IDs with pagination and only JobCategory included (which is 1:1, so subQuery: false is safe)
        const jobIdsResult = await models_1.JobListing.findAndCountAll({
            attributes: ['id'],
            where: whereClause,
            limit: options.limit || 10,
            offset: options.offset || 0,
            include: [models_1.JobCategory],
            order,
            subQuery: false
        });
        const jobIds = jobIdsResult.rows.map(job => job.id);
        // Step 2: Fetch the full details with all associations for the retrieved IDs
        const rows = jobIds.length > 0 ? await models_1.JobListing.findAll({
            where: { id: jobIds },
            include: [models_1.JobCategory],
            order
        }) : [];
        return {
            rows,
            count: jobIdsResult.count
        };
    }
    // Maps to STK-ADM-JOB-001, NFR-PERF-004
    async findAllAdmin(options = {}) {
        const whereClause = {};
        if (options.categoryId)
            whereClause.categoryId = options.categoryId;
        if (options.employmentType)
            whereClause.employmentType = options.employmentType;
        if (options.searchQuery) {
            const searchPattern = `%${options.searchQuery}%`;
            const lowerSearch = options.searchQuery.toLowerCase();
            const orConditions = [
                { title: { [sequelize_1.Op.like]: searchPattern } },
                { location: { [sequelize_1.Op.like]: searchPattern } },
                { description: { [sequelize_1.Op.like]: searchPattern } },
                { employmentType: { [sequelize_1.Op.like]: searchPattern } },
                { salary: { [sequelize_1.Op.like]: searchPattern } },
                { jobType: { [sequelize_1.Op.like]: searchPattern } },
                { '$JobCategory.name$': { [sequelize_1.Op.like]: searchPattern } }
            ];
            if (lowerSearch.includes('visa') || lowerSearch.includes('sponsor')) {
                const wantsNoVisa = lowerSearch.includes('no ') || lowerSearch.includes('without');
                orConditions.push({ visaSponsorship: !wantsNoVisa });
            }
            whereClause[sequelize_1.Op.or] = orConditions;
        }
        const order = [];
        if (options.sortBy) {
            order.push([options.sortBy, options.sortOrder || 'DESC']);
        }
        else {
            order.push(['createdAt', 'DESC']);
        }
        return models_1.JobListing.findAndCountAll({
            where: whereClause,
            limit: options.limit || 20,
            offset: options.offset || 0,
            include: [models_1.JobCategory, { model: models_1.TicketCatalog, as: 'RequiredTickets' }],
            order,
            subQuery: false
        });
    }
    // Maps to STK-APP-APPLY-001, STK-APP-PAY-001
    async findById(id, transaction) {
        return models_1.JobListing.findByPk(id, {
            include: [models_1.JobCategory, { model: models_1.TicketCatalog, as: 'RequiredTickets' }],
            transaction
        });
    }
    // Maps to STK-ADM-JOB-001, STK-ADM-JOB-003, NFR-SEC-009
    async create(jobData, transaction) {
        return models_1.JobListing.create(jobData, { transaction });
    }
    // Maps to STK-ADM-JOB-001, STK-ADM-JOB-005
    async update(id, updateData, transaction) {
        const [updatedCount] = await models_1.JobListing.update(updateData, { where: { id }, transaction });
        return [updatedCount]; // Handled by Service layer fetching the record
    }
    // Maps to STK-ADM-JOB-001
    async delete(id, transaction) {
        await models_1.JobListing.destroy({ where: { id }, transaction });
    }
}
exports.JobRepository = JobRepository;
exports.jobRepository = new JobRepository();
