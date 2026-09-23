"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.interviewController = exports.InterviewController = void 0;
const models_1 = require("../models");
const constants_1 = require("../constants");
const logger_1 = require("../utils/logger");
class InterviewController {
    /**
     * Admin: Get all interviews.
     */
    async getAll(req, res) {
        try {
            const { outcome, applicantId } = req.query;
            const whereClause = {};
            if (outcome) {
                whereClause.outcome = outcome;
            }
            if (applicantId) {
                whereClause.applicantId = applicantId;
            }
            const interviews = await models_1.Interview.findAll({
                where: whereClause,
                order: [['createdAt', 'DESC']],
                include: [
                    {
                        model: models_1.ScheduleCatalogue,
                        as: 'selectedSchedule',
                        attributes: ['id', 'date', 'time', 'isBooked'],
                    },
                    {
                        model: models_1.User,
                        as: 'applicant',
                        attributes: ['id', 'fullName', 'email', 'candidateNumber', 'phoneNumber', 'canPickSchedule'],
                    },
                ],
            });
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json({
                success: true,
                data: interviews,
                count: interviews.length,
            });
        }
        catch (error) {
            logger_1.logger.error('Failed to fetch interviews:', error);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                error: 'Failed to retrieve interviews',
            });
        }
    }
    /**
     * Admin: Get single interview by ID.
     */
    async getById(req, res) {
        try {
            const { id } = req.params;
            const interview = await models_1.Interview.findByPk(Number(id), {
                include: [
                    {
                        model: models_1.ScheduleCatalogue,
                        as: 'selectedSchedule',
                        attributes: ['id', 'date', 'time', 'isBooked'],
                    },
                    {
                        model: models_1.User,
                        as: 'applicant',
                        attributes: ['id', 'fullName', 'email', 'candidateNumber', 'phoneNumber', 'canPickSchedule'],
                    },
                ],
            });
            if (!interview) {
                res.status(constants_1.CONSTANTS.HTTP_STATUS.NOT_FOUND).json({ error: 'Interview record not found' });
                return;
            }
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json({ success: true, data: interview });
        }
        catch (error) {
            logger_1.logger.error('Failed to fetch interview details:', error);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                error: 'Failed to retrieve interview details',
            });
        }
    }
    /**
     * Admin: Manually create an interview.
     */
    async create(req, res) {
        try {
            const { applicantId, scheduleCatalogueId, overview, outcome, meetingLink } = req.body;
            if (!applicantId || !scheduleCatalogueId) {
                res.status(constants_1.CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
                    error: 'Applicant ID and Schedule Slot ID are required',
                });
                return;
            }
            // Check applicant existence
            const applicant = await models_1.User.findByPk(applicantId);
            if (!applicant) {
                res.status(constants_1.CONSTANTS.HTTP_STATUS.NOT_FOUND).json({ error: 'Applicant not found' });
                return;
            }
            // Check schedule slot existence and availability
            const schedule = await models_1.ScheduleCatalogue.findByPk(scheduleCatalogueId);
            if (!schedule) {
                res.status(constants_1.CONSTANTS.HTTP_STATUS.NOT_FOUND).json({ error: 'Schedule slot not found' });
                return;
            }
            if (schedule.isBooked) {
                res.status(constants_1.CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
                    error: 'This schedule slot is already booked for another interview',
                });
                return;
            }
            // Check if applicant already has an interview on this slot or pending
            const existing = await models_1.Interview.findOne({ where: { scheduleCatalogueId } });
            if (existing) {
                res.status(constants_1.CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
                    error: 'An interview is already linked to this schedule slot',
                });
                return;
            }
            const interview = await models_1.Interview.create({
                applicantId,
                scheduleCatalogueId,
                overview: overview || null,
                outcome: outcome || 'Pending',
                meetingLink: meetingLink || null,
            });
            schedule.isBooked = true;
            await schedule.save();
            // Send in-app notification to applicant
            try {
                await models_1.Notification.create({
                    userId: applicantId,
                    title: 'Interview Scheduled',
                    body: `Your interview has been scheduled for ${schedule.date} at ${schedule.time}.`,
                    isRead: false,
                });
            }
            catch (notifyErr) {
                logger_1.logger.warn(`Failed to send interview notification: ${notifyErr?.message}`);
            }
            logger_1.logger.info(`Interview created ID ${interview.id} for applicant ${applicantId}`);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.CREATED).json({
                success: true,
                data: interview,
                message: 'Interview successfully created',
            });
        }
        catch (error) {
            logger_1.logger.error('Failed to create interview:', error);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                error: error.message || 'Failed to create interview',
            });
        }
    }
    /**
     * Admin: Update an interview (overview, outcome, meeting link, or change schedule slot).
     */
    async update(req, res) {
        try {
            const { id } = req.params;
            const { scheduleCatalogueId, overview, outcome, meetingLink } = req.body;
            const interview = await models_1.Interview.findByPk(Number(id));
            if (!interview) {
                res.status(constants_1.CONSTANTS.HTTP_STATUS.NOT_FOUND).json({ error: 'Interview record not found' });
                return;
            }
            // If scheduleCatalogueId is changed
            if (scheduleCatalogueId && scheduleCatalogueId !== interview.scheduleCatalogueId) {
                const newSchedule = await models_1.ScheduleCatalogue.findByPk(Number(scheduleCatalogueId));
                if (!newSchedule) {
                    res.status(constants_1.CONSTANTS.HTTP_STATUS.NOT_FOUND).json({ error: 'New schedule slot not found' });
                    return;
                }
                if (newSchedule.isBooked) {
                    res.status(constants_1.CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
                        error: 'The new schedule slot is already booked',
                    });
                    return;
                }
                // Free old schedule slot
                const oldSchedule = await models_1.ScheduleCatalogue.findByPk(interview.scheduleCatalogueId);
                if (oldSchedule) {
                    oldSchedule.isBooked = false;
                    await oldSchedule.save();
                }
                // Claim new schedule slot
                newSchedule.isBooked = true;
                await newSchedule.save();
                interview.scheduleCatalogueId = scheduleCatalogueId;
            }
            if (overview !== undefined)
                interview.overview = overview;
            if (outcome !== undefined)
                interview.outcome = outcome;
            if (meetingLink !== undefined)
                interview.meetingLink = meetingLink;
            await interview.save();
            // Notify applicant of outcome change if applicable
            if (outcome && outcome !== 'Pending') {
                try {
                    await models_1.Notification.create({
                        userId: interview.applicantId,
                        title: 'Interview Outcome Updated',
                        body: `Your interview status has been updated to: ${outcome}.`,
                        isRead: false,
                    });
                }
                catch (notifyErr) {
                    logger_1.logger.warn(`Failed to send interview outcome notification: ${notifyErr?.message}`);
                }
            }
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json({
                success: true,
                data: interview,
                message: 'Interview updated successfully',
            });
        }
        catch (error) {
            logger_1.logger.error('Failed to update interview:', error);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                error: error.message || 'Failed to update interview',
            });
        }
    }
    /**
     * Admin: Delete interview (frees up schedule slot).
     */
    async delete(req, res) {
        try {
            const { id } = req.params;
            const interview = await models_1.Interview.findByPk(Number(id));
            if (!interview) {
                res.status(constants_1.CONSTANTS.HTTP_STATUS.NOT_FOUND).json({ error: 'Interview record not found' });
                return;
            }
            // Free the schedule slot
            const schedule = await models_1.ScheduleCatalogue.findByPk(interview.scheduleCatalogueId);
            if (schedule) {
                schedule.isBooked = false;
                await schedule.save();
            }
            await interview.destroy();
            logger_1.logger.info(`Admin deleted interview ID ${id}`);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json({
                success: true,
                message: 'Interview record deleted successfully and schedule slot freed',
            });
        }
        catch (error) {
            logger_1.logger.error('Failed to delete interview:', error);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                error: error.message || 'Failed to delete interview',
            });
        }
    }
    /**
     * Applicant: Get logged-in applicant's interview details & canPickSchedule authorization status.
     */
    async getApplicantInterview(req, res) {
        try {
            const userId = req.user?.id;
            const user = await models_1.User.findByPk(userId, {
                attributes: ['id', 'fullName', 'email', 'candidateNumber', 'canPickSchedule'],
            });
            if (!user) {
                res.status(constants_1.CONSTANTS.HTTP_STATUS.NOT_FOUND).json({ error: 'Applicant record not found' });
                return;
            }
            const interview = await models_1.Interview.findOne({
                where: { applicantId: userId },
                order: [['createdAt', 'DESC']],
                include: [
                    {
                        model: models_1.ScheduleCatalogue,
                        as: 'selectedSchedule',
                        attributes: ['id', 'date', 'time', 'isBooked'],
                    },
                ],
            });
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json({
                success: true,
                canPickSchedule: Boolean(user.canPickSchedule),
                data: interview || null,
            });
        }
        catch (error) {
            logger_1.logger.error('Failed to fetch applicant interview:', error);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                error: 'Failed to retrieve your interview information',
            });
        }
    }
    /**
     * Applicant: Select a schedule slot from Schedule Catalogue.
     * Automatically creates an Interview on the backend!
     * Enforces:
     * 1. Applicant can only pick schedule if admin authorized them (canPickSchedule === true).
     * 2. Slot must be unbooked.
     * 3. Prevents duplicate active interviews.
     */
    async bookSchedule(req, res) {
        try {
            const userId = req.user?.id;
            const { scheduleCatalogueId, overview } = req.body;
            if (!scheduleCatalogueId) {
                res.status(constants_1.CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
                    error: 'Please select a valid schedule slot from the catalogue',
                });
                return;
            }
            // 1. Check authorization gate
            const user = await models_1.User.findByPk(userId);
            if (!user) {
                res.status(constants_1.CONSTANTS.HTTP_STATUS.NOT_FOUND).json({ error: 'User record not found' });
                return;
            }
            if (!user.canPickSchedule) {
                res.status(constants_1.CONSTANTS.HTTP_STATUS.FORBIDDEN).json({
                    error: 'You are not authorized to pick an interview schedule at this time. An interview will be set after you have passed your third ticket examination.',
                    canPickSchedule: false,
                });
                return;
            }
            // 2. Check if applicant already has an active scheduled interview
            const existingInterview = await models_1.Interview.findOne({
                where: {
                    applicantId: userId,
                    outcome: ['Pending', 'Rescheduled'],
                },
                include: [
                    {
                        model: models_1.ScheduleCatalogue,
                        as: 'selectedSchedule',
                    },
                ],
            });
            if (existingInterview) {
                res.status(409).json({
                    error: 'You already have an active scheduled interview. Please contact administration if you need to reschedule.',
                    data: existingInterview,
                });
                return;
            }
            // 3. Check schedule slot availability
            const schedule = await models_1.ScheduleCatalogue.findByPk(Number(scheduleCatalogueId));
            if (!schedule) {
                res.status(constants_1.CONSTANTS.HTTP_STATUS.NOT_FOUND).json({ error: 'Selected schedule slot not found' });
                return;
            }
            if (schedule.isBooked) {
                res.status(constants_1.CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
                    error: 'This schedule slot has just been booked. Please pick another available time slot.',
                });
                return;
            }
            // 4. Create interview automatically and mark schedule slot booked
            const interview = await models_1.Interview.create({
                applicantId: userId,
                scheduleCatalogueId: Number(scheduleCatalogueId),
                overview: overview || 'Applicant self-selected interview slot from schedule catalogue.',
                outcome: 'Pending',
            });
            schedule.isBooked = true;
            await schedule.save();
            // Reload with associations
            const populatedInterview = await models_1.Interview.findByPk(interview.id, {
                include: [
                    {
                        model: models_1.ScheduleCatalogue,
                        as: 'selectedSchedule',
                        attributes: ['id', 'date', 'time', 'isBooked'],
                    },
                ],
            });
            // Send notification
            try {
                await models_1.Notification.create({
                    userId,
                    title: 'Interview Confirmed',
                    body: `Your interview has been booked for ${schedule.date} at ${schedule.time}.`,
                    isRead: false,
                });
            }
            catch (notifyErr) {
                logger_1.logger.warn(`Failed to send booking notification: ${notifyErr?.message}`);
            }
            logger_1.logger.info(`Applicant ID ${userId} booked interview ID ${interview.id} for ${schedule.date} ${schedule.time}`);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.CREATED).json({
                success: true,
                message: 'Your interview has been scheduled successfully!',
                data: populatedInterview,
            });
        }
        catch (error) {
            logger_1.logger.error('Failed to book schedule:', error);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                error: error.message || 'Failed to schedule interview',
            });
        }
    }
    /**
     * Admin: Toggle or set `canPickSchedule` for an applicant.
     */
    async setCanPickSchedule(req, res) {
        try {
            const { userId } = req.params;
            const { canPickSchedule } = req.body;
            const user = await models_1.User.findByPk(Number(userId));
            if (!user) {
                res.status(constants_1.CONSTANTS.HTTP_STATUS.NOT_FOUND).json({ error: 'Applicant record not found' });
                return;
            }
            user.canPickSchedule = Boolean(canPickSchedule);
            await user.save();
            // Notify user if granted
            if (user.canPickSchedule) {
                try {
                    await models_1.Notification.create({
                        userId: user.id,
                        title: 'Interview Scheduling Authorized',
                        body: 'You are now authorized to select your interview schedule. Navigate to the Interviews tab in your dashboard.',
                        isRead: false,
                    });
                }
                catch (notifyErr) {
                    logger_1.logger.warn(`Failed to send interview authorization notification: ${notifyErr?.message}`);
                }
            }
            logger_1.logger.info(`Admin set canPickSchedule=${user.canPickSchedule} for user ID ${user.id}`);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json({
                success: true,
                canPickSchedule: user.canPickSchedule,
                message: `Applicant interview scheduling authorization set to ${user.canPickSchedule}`,
            });
        }
        catch (error) {
            logger_1.logger.error('Failed to update canPickSchedule:', error);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                error: error.message || 'Failed to update authorization',
            });
        }
    }
}
exports.InterviewController = InterviewController;
exports.interviewController = new InterviewController();
