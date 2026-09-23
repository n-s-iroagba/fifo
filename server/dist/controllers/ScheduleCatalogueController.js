"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scheduleCatalogueController = exports.ScheduleCatalogueController = void 0;
const models_1 = require("../models");
const constants_1 = require("../constants");
const logger_1 = require("../utils/logger");
class ScheduleCatalogueController {
    /**
     * Get all schedule catalogue slots.
     * Optional query param: `availableOnly=true` to fetch only unbooked slots.
     */
    async getAll(req, res) {
        try {
            const { availableOnly } = req.query;
            const whereClause = {};
            if (availableOnly === 'true') {
                whereClause.isBooked = false;
            }
            const schedules = await models_1.ScheduleCatalogue.findAll({
                where: whereClause,
                order: [
                    ['date', 'ASC'],
                    ['time', 'ASC'],
                ],
                include: [
                    {
                        model: models_1.Interview,
                        as: 'interview',
                        required: false,
                        include: [
                            {
                                model: models_1.User,
                                as: 'applicant',
                                attributes: ['id', 'fullName', 'email', 'candidateNumber', 'phoneNumber'],
                            },
                        ],
                    },
                ],
            });
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json({
                success: true,
                data: schedules,
                count: schedules.length,
            });
        }
        catch (error) {
            logger_1.logger.error('Failed to fetch schedule catalogues:', error);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                error: 'Failed to retrieve schedule catalogues',
            });
        }
    }
    /**
     * Get single schedule catalogue by ID.
     */
    async getById(req, res) {
        try {
            const { id } = req.params;
            const schedule = await models_1.ScheduleCatalogue.findByPk(Number(id), {
                include: [
                    {
                        model: models_1.Interview,
                        as: 'interview',
                        include: [
                            {
                                model: models_1.User,
                                as: 'applicant',
                                attributes: ['id', 'fullName', 'email', 'candidateNumber', 'phoneNumber'],
                            },
                        ],
                    },
                ],
            });
            if (!schedule) {
                res.status(constants_1.CONSTANTS.HTTP_STATUS.NOT_FOUND).json({ error: 'Schedule slot not found' });
                return;
            }
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json({ success: true, data: schedule });
        }
        catch (error) {
            logger_1.logger.error('Failed to fetch schedule catalogue details:', error);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                error: 'Failed to retrieve schedule details',
            });
        }
    }
    /**
     * Admin: Create new schedule catalogue slot.
     */
    async create(req, res) {
        try {
            const { date, time } = req.body;
            if (!date || !time) {
                res.status(constants_1.CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
                    error: 'Date and Time are required to create a schedule slot',
                });
                return;
            }
            const schedule = await models_1.ScheduleCatalogue.create({
                date,
                time: time.trim(),
                isBooked: false,
            });
            logger_1.logger.info(`Admin created schedule slot ID ${schedule.id} for ${date} at ${time}`);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.CREATED).json({
                success: true,
                data: schedule,
                message: 'Schedule slot created successfully',
            });
        }
        catch (error) {
            logger_1.logger.error('Failed to create schedule catalogue slot:', error);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                error: error.message || 'Failed to create schedule slot',
            });
        }
    }
    /**
     * Admin: Update schedule catalogue slot.
     */
    async update(req, res) {
        try {
            const { id } = req.params;
            const { date, time, isBooked } = req.body;
            const schedule = await models_1.ScheduleCatalogue.findByPk(Number(id));
            if (!schedule) {
                res.status(constants_1.CONSTANTS.HTTP_STATUS.NOT_FOUND).json({ error: 'Schedule slot not found' });
                return;
            }
            if (date !== undefined)
                schedule.date = date;
            if (time !== undefined)
                schedule.time = time.trim();
            if (isBooked !== undefined)
                schedule.isBooked = Boolean(isBooked);
            await schedule.save();
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json({
                success: true,
                data: schedule,
                message: 'Schedule slot updated successfully',
            });
        }
        catch (error) {
            logger_1.logger.error('Failed to update schedule catalogue slot:', error);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                error: error.message || 'Failed to update schedule slot',
            });
        }
    }
    /**
     * Admin: Delete schedule catalogue slot.
     */
    async delete(req, res) {
        try {
            const { id } = req.params;
            const schedule = await models_1.ScheduleCatalogue.findByPk(Number(id));
            if (!schedule) {
                res.status(constants_1.CONSTANTS.HTTP_STATUS.NOT_FOUND).json({ error: 'Schedule slot not found' });
                return;
            }
            // If an interview exists for this slot, remove or handle
            await models_1.Interview.destroy({ where: { scheduleCatalogueId: id } });
            await schedule.destroy();
            logger_1.logger.info(`Admin deleted schedule slot ID ${id}`);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json({
                success: true,
                message: 'Schedule slot deleted successfully',
            });
        }
        catch (error) {
            logger_1.logger.error('Failed to delete schedule catalogue slot:', error);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                error: error.message || 'Failed to delete schedule slot',
            });
        }
    }
}
exports.ScheduleCatalogueController = ScheduleCatalogueController;
exports.scheduleCatalogueController = new ScheduleCatalogueController();
