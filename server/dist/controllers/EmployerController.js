"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.employerController = exports.EmployerController = void 0;
const models_1 = require("../models");
const constants_1 = require("../constants");
const logger_1 = require("../utils/logger");
class EmployerController {
    /**
     * Get all employers
     */
    async getAll(req, res) {
        try {
            const employers = await models_1.Employer.findAll({
                order: [['isEmploying', 'DESC'], ['name', 'ASC']],
            });
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json({ success: true, data: employers });
        }
        catch (error) {
            logger_1.logger.error('[EmployerController.getAll]', error);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: error.message || 'Failed to fetch employers' });
        }
    }
    /**
     * Get employer by ID
     */
    async getById(req, res) {
        try {
            const { id } = req.params;
            const employer = await models_1.Employer.findByPk(Number(id), {
                include: [
                    {
                        model: models_1.JoblistingEmployer,
                        as: 'JoblistingEmployers',
                        include: [{ model: models_1.JobListing, as: 'JobListing' }]
                    }
                ]
            });
            if (!employer) {
                res.status(constants_1.CONSTANTS.HTTP_STATUS.NOT_FOUND).json({ error: 'Employer not found' });
                return;
            }
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json({ success: true, data: employer });
        }
        catch (error) {
            logger_1.logger.error('[EmployerController.getById]', error);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: error.message || 'Failed to fetch employer' });
        }
    }
    /**
     * Get currently employing host employer (only one true in system)
     */
    async getCurrentlyEmploying(req, res) {
        try {
            let employer = await models_1.Employer.findOne({ where: { isEmploying: true } });
            if (!employer) {
                // Fallback to first employer if none marked
                employer = await models_1.Employer.findOne();
            }
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json({ success: true, data: employer });
        }
        catch (error) {
            logger_1.logger.error('[EmployerController.getCurrentlyEmploying]', error);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: error.message || 'Failed to fetch currently employing employer' });
        }
    }
    /**
     * Create employer (enforce only 1 isEmploying === true)
     */
    async create(req, res) {
        try {
            const { name, websiteUrl, companyDescription, isEmploying, location, logoUrl } = req.body;
            if (!name || !websiteUrl || !companyDescription) {
                res.status(constants_1.CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({ error: 'Name, websiteUrl, and companyDescription are required' });
                return;
            }
            const shouldBeEmploying = Boolean(isEmploying);
            if (shouldBeEmploying) {
                // Set all other employers to isEmploying = false
                await models_1.Employer.update({ isEmploying: false }, { where: {} });
            }
            const employer = await models_1.Employer.create({
                name,
                websiteUrl,
                companyDescription,
                isEmploying: shouldBeEmploying,
                location: location || null,
                logoUrl: logoUrl || null
            });
            res.status(constants_1.CONSTANTS.HTTP_STATUS.CREATED).json({ success: true, data: employer });
        }
        catch (error) {
            logger_1.logger.error('[EmployerController.create]', error);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: error.message || 'Failed to create employer' });
        }
    }
    /**
     * Update employer (enforce only 1 isEmploying === true)
     */
    async update(req, res) {
        try {
            const { id } = req.params;
            const { name, websiteUrl, companyDescription, isEmploying, location, logoUrl } = req.body;
            const employer = await models_1.Employer.findByPk(Number(id));
            if (!employer) {
                res.status(constants_1.CONSTANTS.HTTP_STATUS.NOT_FOUND).json({ error: 'Employer not found' });
                return;
            }
            if (isEmploying === true || isEmploying === 'true') {
                // Clear any other employer's isEmploying flag
                await models_1.Employer.update({ isEmploying: false }, { where: {} });
                employer.isEmploying = true;
            }
            else if (isEmploying === false || isEmploying === 'false') {
                employer.isEmploying = false;
            }
            if (name !== undefined)
                employer.name = name;
            if (websiteUrl !== undefined)
                employer.websiteUrl = websiteUrl;
            if (companyDescription !== undefined)
                employer.companyDescription = companyDescription;
            if (location !== undefined)
                employer.location = location;
            if (logoUrl !== undefined)
                employer.logoUrl = logoUrl;
            await employer.save();
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json({ success: true, data: employer });
        }
        catch (error) {
            logger_1.logger.error('[EmployerController.update]', error);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: error.message || 'Failed to update employer' });
        }
    }
    /**
     * Delete employer
     */
    async delete(req, res) {
        try {
            const { id } = req.params;
            const employer = await models_1.Employer.findByPk(Number(id));
            if (!employer) {
                res.status(constants_1.CONSTANTS.HTTP_STATUS.NOT_FOUND).json({ error: 'Employer not found' });
                return;
            }
            await models_1.JoblistingEmployer.destroy({ where: { employerId: id } });
            await employer.destroy();
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json({ success: true, message: 'Employer deleted successfully' });
        }
        catch (error) {
            logger_1.logger.error('[EmployerController.delete]', error);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: error.message || 'Failed to delete employer' });
        }
    }
    /**
     * Get all JoblistingEmployer records with vacancy URLs
     */
    async getAllJoblistingEmployers(req, res) {
        try {
            const items = await models_1.JoblistingEmployer.findAll({
                include: [
                    { model: models_1.Employer, as: 'Employer', attributes: ['id', 'name', 'websiteUrl', 'isEmploying'] },
                    { model: models_1.JobListing, as: 'JobListing', attributes: ['id', 'title', 'company', 'location'] }
                ],
                order: [['createdAt', 'DESC']]
            });
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json({ success: true, data: items });
        }
        catch (error) {
            logger_1.logger.error('[EmployerController.getAllJoblistingEmployers]', error);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: error.message || 'Failed to fetch vacancy URLs' });
        }
    }
    /**
     * Update vacancyUrl for a JoblistingEmployer item
     */
    async updateVacancyUrl(req, res) {
        try {
            const { id } = req.params;
            const { vacancyUrl } = req.body;
            const item = await models_1.JoblistingEmployer.findByPk(Number(id));
            if (!item) {
                res.status(constants_1.CONSTANTS.HTTP_STATUS.NOT_FOUND).json({ error: 'Joblisting employer record not found' });
                return;
            }
            item.vacancyUrl = vacancyUrl !== undefined ? (vacancyUrl?.trim() || null) : null;
            await item.save();
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json({
                success: true,
                message: 'Vacancy URL updated successfully',
                data: item
            });
        }
        catch (error) {
            logger_1.logger.error('[EmployerController.updateVacancyUrl]', error);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: error.message || 'Failed to update vacancy URL' });
        }
    }
}
exports.EmployerController = EmployerController;
exports.employerController = new EmployerController();
