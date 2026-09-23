import { Request, Response } from 'express';
import { Interview, ScheduleCatalogue, User, Notification } from '../models';
import { CONSTANTS } from '../constants';
import { logger } from '../utils/logger';

export class InterviewController {
    /**
     * Admin: Get all interviews.
     */
    async getAll(req: Request, res: Response): Promise<void> {
        try {
            const { outcome, applicantId } = req.query;
            const whereClause: any = {};

            if (outcome) {
                whereClause.outcome = outcome;
            }
            if (applicantId) {
                whereClause.applicantId = applicantId;
            }

            const interviews = await Interview.findAll({
                where: whereClause,
                order: [['createdAt', 'DESC']],
                include: [
                    {
                        model: ScheduleCatalogue,
                        as: 'selectedSchedule',
                        attributes: ['id', 'date', 'time', 'isBooked'],
                    },
                    {
                        model: User,
                        as: 'applicant',
                        attributes: ['id', 'fullName', 'email', 'candidateNumber', 'phoneNumber', 'canPickSchedule'],
                    },
                ],
            });

            res.status(CONSTANTS.HTTP_STATUS.OK).json({
                success: true,
                data: interviews,
                count: interviews.length,
            });
        } catch (error: any) {
            logger.error('Failed to fetch interviews:', error);
            res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                error: 'Failed to retrieve interviews',
            });
        }
    }

    /**
     * Admin: Get single interview by ID.
     */
    async getById(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const interview = await Interview.findByPk(Number(id), {
                include: [
                    {
                        model: ScheduleCatalogue,
                        as: 'selectedSchedule',
                        attributes: ['id', 'date', 'time', 'isBooked'],
                    },
                    {
                        model: User,
                        as: 'applicant',
                        attributes: ['id', 'fullName', 'email', 'candidateNumber', 'phoneNumber', 'canPickSchedule'],
                    },
                ],
            });

            if (!interview) {
                res.status(CONSTANTS.HTTP_STATUS.NOT_FOUND).json({ error: 'Interview record not found' });
                return;
            }

            res.status(CONSTANTS.HTTP_STATUS.OK).json({ success: true, data: interview });
        } catch (error: any) {
            logger.error('Failed to fetch interview details:', error);
            res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                error: 'Failed to retrieve interview details',
            });
        }
    }

    /**
     * Admin: Manually create an interview.
     */
    async create(req: Request, res: Response): Promise<void> {
        try {
            const { applicantId, scheduleCatalogueId, overview, outcome, meetingLink } = req.body;

            if (!applicantId || !scheduleCatalogueId) {
                res.status(CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
                    error: 'Applicant ID and Schedule Slot ID are required',
                });
                return;
            }

            // Check applicant existence
            const applicant = await User.findByPk(applicantId);
            if (!applicant) {
                res.status(CONSTANTS.HTTP_STATUS.NOT_FOUND).json({ error: 'Applicant not found' });
                return;
            }

            // Check schedule slot existence and availability
            const schedule = await ScheduleCatalogue.findByPk(scheduleCatalogueId);
            if (!schedule) {
                res.status(CONSTANTS.HTTP_STATUS.NOT_FOUND).json({ error: 'Schedule slot not found' });
                return;
            }

            if (schedule.isBooked) {
                res.status(CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
                    error: 'This schedule slot is already booked for another interview',
                });
                return;
            }

            // Check if applicant already has an interview on this slot or pending
            const existing = await Interview.findOne({ where: { scheduleCatalogueId } });
            if (existing) {
                res.status(CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
                    error: 'An interview is already linked to this schedule slot',
                });
                return;
            }

            const interview = await Interview.create({
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
                await Notification.create({
                    userId: applicantId,
                    title: 'Interview Scheduled',
                    body: `Your interview has been scheduled for ${schedule.date} at ${schedule.time}.`,
                    isRead: false,
                });
            } catch (notifyErr: any) {
                logger.warn(`Failed to send interview notification: ${notifyErr?.message}`);
            }

            logger.info(`Interview created ID ${interview.id} for applicant ${applicantId}`);
            res.status(CONSTANTS.HTTP_STATUS.CREATED).json({
                success: true,
                data: interview,
                message: 'Interview successfully created',
            });
        } catch (error: any) {
            logger.error('Failed to create interview:', error);
            res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                error: error.message || 'Failed to create interview',
            });
        }
    }

    /**
     * Admin: Update an interview (overview, outcome, meeting link, or change schedule slot).
     */
    async update(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const { scheduleCatalogueId, overview, outcome, meetingLink } = req.body;

            const interview = await Interview.findByPk(Number(id));
            if (!interview) {
                res.status(CONSTANTS.HTTP_STATUS.NOT_FOUND).json({ error: 'Interview record not found' });
                return;
            }

            // If scheduleCatalogueId is changed
            if (scheduleCatalogueId && scheduleCatalogueId !== interview.scheduleCatalogueId) {
                const newSchedule = await ScheduleCatalogue.findByPk(Number(scheduleCatalogueId));
                if (!newSchedule) {
                    res.status(CONSTANTS.HTTP_STATUS.NOT_FOUND).json({ error: 'New schedule slot not found' });
                    return;
                }
                if (newSchedule.isBooked) {
                    res.status(CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
                        error: 'The new schedule slot is already booked',
                    });
                    return;
                }

                // Free old schedule slot
                const oldSchedule = await ScheduleCatalogue.findByPk(interview.scheduleCatalogueId);
                if (oldSchedule) {
                    oldSchedule.isBooked = false;
                    await oldSchedule.save();
                }

                // Claim new schedule slot
                newSchedule.isBooked = true;
                await newSchedule.save();
                interview.scheduleCatalogueId = scheduleCatalogueId;
            }

            if (overview !== undefined) interview.overview = overview;
            if (outcome !== undefined) interview.outcome = outcome;
            if (meetingLink !== undefined) interview.meetingLink = meetingLink;

            await interview.save();

            // Notify applicant of outcome change if applicable
            if (outcome && outcome !== 'Pending') {
                try {
                    await Notification.create({
                        userId: interview.applicantId,
                        title: 'Interview Outcome Updated',
                        body: `Your interview status has been updated to: ${outcome}.`,
                        isRead: false,
                    });
                } catch (notifyErr: any) {
                    logger.warn(`Failed to send interview outcome notification: ${notifyErr?.message}`);
                }
            }

            res.status(CONSTANTS.HTTP_STATUS.OK).json({
                success: true,
                data: interview,
                message: 'Interview updated successfully',
            });
        } catch (error: any) {
            logger.error('Failed to update interview:', error);
            res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                error: error.message || 'Failed to update interview',
            });
        }
    }

    /**
     * Admin: Delete interview (frees up schedule slot).
     */
    async delete(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const interview = await Interview.findByPk(Number(id));

            if (!interview) {
                res.status(CONSTANTS.HTTP_STATUS.NOT_FOUND).json({ error: 'Interview record not found' });
                return;
            }

            // Free the schedule slot
            const schedule = await ScheduleCatalogue.findByPk(interview.scheduleCatalogueId);
            if (schedule) {
                schedule.isBooked = false;
                await schedule.save();
            }

            await interview.destroy();

            logger.info(`Admin deleted interview ID ${id}`);
            res.status(CONSTANTS.HTTP_STATUS.OK).json({
                success: true,
                message: 'Interview record deleted successfully and schedule slot freed',
            });
        } catch (error: any) {
            logger.error('Failed to delete interview:', error);
            res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                error: error.message || 'Failed to delete interview',
            });
        }
    }

    /**
     * Applicant: Get logged-in applicant's interview details & canPickSchedule authorization status.
     */
    async getApplicantInterview(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).user?.id;

            const user = await User.findByPk(userId, {
                attributes: ['id', 'fullName', 'email', 'candidateNumber', 'canPickSchedule'],
            });

            if (!user) {
                res.status(CONSTANTS.HTTP_STATUS.NOT_FOUND).json({ error: 'Applicant record not found' });
                return;
            }

            const interview = await Interview.findOne({
                where: { applicantId: userId },
                order: [['createdAt', 'DESC']],
                include: [
                    {
                        model: ScheduleCatalogue,
                        as: 'selectedSchedule',
                        attributes: ['id', 'date', 'time', 'isBooked'],
                    },
                ],
            });

            res.status(CONSTANTS.HTTP_STATUS.OK).json({
                success: true,
                canPickSchedule: Boolean(user.canPickSchedule),
                data: interview || null,
            });
        } catch (error: any) {
            logger.error('Failed to fetch applicant interview:', error);
            res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
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
    async bookSchedule(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).user?.id;
            const { scheduleCatalogueId, overview } = req.body;

            if (!scheduleCatalogueId) {
                res.status(CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
                    error: 'Please select a valid schedule slot from the catalogue',
                });
                return;
            }

            // 1. Check authorization gate
            const user = await User.findByPk(userId);
            if (!user) {
                res.status(CONSTANTS.HTTP_STATUS.NOT_FOUND).json({ error: 'User record not found' });
                return;
            }

            if (!user.canPickSchedule) {
                res.status(CONSTANTS.HTTP_STATUS.FORBIDDEN).json({
                    error: 'You are not authorized to pick an interview schedule at this time. An interview will be set after you have passed your third ticket examination.',
                    canPickSchedule: false,
                });
                return;
            }

            // 2. Check if applicant already has an active scheduled interview
            const existingInterview = await Interview.findOne({
                where: {
                    applicantId: userId,
                    outcome: ['Pending', 'Rescheduled'],
                },
                include: [
                    {
                        model: ScheduleCatalogue,
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
            const schedule = await ScheduleCatalogue.findByPk(Number(scheduleCatalogueId));
            if (!schedule) {
                res.status(CONSTANTS.HTTP_STATUS.NOT_FOUND).json({ error: 'Selected schedule slot not found' });
                return;
            }

            if (schedule.isBooked) {
                res.status(CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
                    error: 'This schedule slot has just been booked. Please pick another available time slot.',
                });
                return;
            }

            // 4. Create interview automatically and mark schedule slot booked
            const interview = await Interview.create({
                applicantId: userId,
                scheduleCatalogueId: Number(scheduleCatalogueId),
                overview: overview || 'Applicant self-selected interview slot from schedule catalogue.',
                outcome: 'Pending',
            });

            schedule.isBooked = true;
            await schedule.save();

            // Reload with associations
            const populatedInterview = await Interview.findByPk(interview.id, {
                include: [
                    {
                        model: ScheduleCatalogue,
                        as: 'selectedSchedule',
                        attributes: ['id', 'date', 'time', 'isBooked'],
                    },
                ],
            });

            // Send notification
            try {
                await Notification.create({
                    userId,
                    title: 'Interview Confirmed',
                    body: `Your interview has been booked for ${schedule.date} at ${schedule.time}.`,
                    isRead: false,
                });
            } catch (notifyErr: any) {
                logger.warn(`Failed to send booking notification: ${notifyErr?.message}`);
            }

            logger.info(`Applicant ID ${userId} booked interview ID ${interview.id} for ${schedule.date} ${schedule.time}`);

            res.status(CONSTANTS.HTTP_STATUS.CREATED).json({
                success: true,
                message: 'Your interview has been scheduled successfully!',
                data: populatedInterview,
            });
        } catch (error: any) {
            logger.error('Failed to book schedule:', error);
            res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                error: error.message || 'Failed to schedule interview',
            });
        }
    }

    /**
     * Admin: Toggle or set `canPickSchedule` for an applicant.
     */
    async setCanPickSchedule(req: Request, res: Response): Promise<void> {
        try {
            const { userId } = req.params;
            const { canPickSchedule } = req.body;

            const user = await User.findByPk(Number(userId));
            if (!user) {
                res.status(CONSTANTS.HTTP_STATUS.NOT_FOUND).json({ error: 'Applicant record not found' });
                return;
            }

            user.canPickSchedule = Boolean(canPickSchedule);
            await user.save();

            // Notify user if granted
            if (user.canPickSchedule) {
                try {
                    await Notification.create({
                        userId: user.id,
                        title: 'Interview Scheduling Authorized',
                        body: 'You are now authorized to select your interview schedule. Navigate to the Interviews tab in your dashboard.',
                        isRead: false,
                    });
                } catch (notifyErr: any) {
                    logger.warn(`Failed to send interview authorization notification: ${notifyErr?.message}`);
                }
            }

            logger.info(`Admin set canPickSchedule=${user.canPickSchedule} for user ID ${user.id}`);

            res.status(CONSTANTS.HTTP_STATUS.OK).json({
                success: true,
                canPickSchedule: user.canPickSchedule,
                message: `Applicant interview scheduling authorization set to ${user.canPickSchedule}`,
            });
        } catch (error: any) {
            logger.error('Failed to update canPickSchedule:', error);
            res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                error: error.message || 'Failed to update authorization',
            });
        }
    }
}

export const interviewController = new InterviewController();
