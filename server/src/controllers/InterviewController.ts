import { Request, Response } from 'express';
import { Interview, ScheduleCatalogue, User, Notification, Application, JobListing, Employer } from '../models';
import { CONSTANTS } from '../constants';
import { logger } from '../utils/logger';
import { sendEmployerEmail } from '../utils/email';
import { generateOnboardingGuidePDF } from '../utils/pdfGenerator';
import axios from 'axios';
import path from 'path';
import fs from 'fs';

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

    /**
     * F005 / INAS01: Conditional Invitation for interview sent from Employer email.
     * Admin must include zoom link. Updates applicant.interviewDate, applicant.interviewTime, applicant.interviewLink.
     * Operational manual attached as file (not link).
     * Schedules employerSecondContact (maca-employee-onboarding-guide.pdf) 1 hour later.
     */
    async scheduleAndNotify(req: Request, res: Response): Promise<void> {
        try {
            const { applicantId, interviewDate, interviewTime, zoomLink, timezone = 'AWST (UTC+8)' } = req.body;

            if (!applicantId) {
                res.status(CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({ error: 'Applicant ID is required' });
                return;
            }

            if (!zoomLink || !zoomLink.trim()) {
                res.status(CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({ error: 'Zoom meeting link is strictly mandatory before sending the interview notification email.' });
                return;
            }

            if (!interviewDate || !interviewTime) {
                res.status(CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({ error: 'Interview date and time are required' });
                return;
            }

            const applicant = await User.findByPk(Number(applicantId));
            if (!applicant) {
                res.status(CONSTANTS.HTTP_STATUS.NOT_FOUND).json({ error: 'Applicant record not found' });
                return;
            }

            // Update applicant database attributes
            applicant.interviewDate = String(interviewDate);
            applicant.interviewTime = String(interviewTime);
            applicant.interviewLink = zoomLink.trim();
            await applicant.save();

            // Find application & JobListing to fetch operational manual
            const application = await Application.findOne({
                where: { userId: applicant.id },
                include: [{ model: JobListing, as: 'JobListing' }]
            });

            const jobListing = (application as any)?.JobListing;
            const roleTitle = jobListing?.title || 'FIFO Mining & Resource Operations';

            // Prepare operational manual attachment as a FILE (not a link)
            let manualAttachment: any = null;
            if (jobListing?.operationalManualUrl && jobListing.operationalManualUrl.startsWith('http')) {
                try {
                    const response = await axios.get(jobListing.operationalManualUrl, { responseType: 'arraybuffer', timeout: 8000 });
                    manualAttachment = {
                        filename: `${jobListing.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-operational-manual.pdf`,
                        content: Buffer.from(response.data),
                        contentType: 'application/pdf'
                    };
                } catch (fetchErr) {
                    logger.warn('Failed to download remote operational manual from URL, falling back to local asset');
                }
            }

            if (!manualAttachment) {
                // Check if local manual exists or use fallback HIRING_PROCESS_INFORMATION.pdf
                const defaultManualPath = path.resolve(__dirname, '../assets/HIRING_PROCESS_INFORMATION.pdf');
                if (fs.existsSync(defaultManualPath)) {
                    manualAttachment = {
                        filename: `mining-site-operational-procedure-manual.pdf`,
                        content: fs.readFileSync(defaultManualPath),
                        contentType: 'application/pdf'
                    };
                }
            }

            const attachments = manualAttachment ? [manualAttachment] : [];

            // Dispatch Interview Notification Email FROM EMPLOYER EMAIL
            const emailSubject = `Conditional Invitation for Technical Interview — ${roleTitle}`;
            const emailContent = `
                <p>Dear ${applicant.fullName},</p>
                <p>We are pleased to inform you that following your screening assessment, you have been conditionally selected for a technical competency interview with <strong>MACA Limited / Australian Mining Operations</strong> for the position of <strong>${roleTitle}</strong>.</p>
                <div style="background-color: #f8fafc; border: 2px solid #f59e0b; border-radius: 12px; padding: 20px; margin: 24px 0;">
                    <p style="margin: 0 0 10px 0; font-size: 13px; font-weight: 800; text-transform: uppercase; color: #18181b; letter-spacing: 1px;">Confirmed Interview Particulars</p>
                    <p style="margin: 6px 0; font-size: 14px;"><strong>Interview Date:</strong> ${interviewDate}</p>
                    <p style="margin: 6px 0; font-size: 14px;"><strong>Interview Time:</strong> ${interviewTime} (${timezone})</p>
                    <p style="margin: 6px 0; font-size: 14px;"><strong>Meeting Format:</strong> Video Call (Zoom)</p>
                    <p style="margin: 8px 0 0 0; font-size: 14px;"><strong>Zoom Meeting Link:</strong> <a href="${zoomLink.trim()}" style="color: #b45309; font-weight: bold; text-decoration: underline;">${zoomLink.trim()}</a></p>
                </div>
                <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 14px 18px; margin: 20px 0;">
                    <p style="margin: 0; font-size: 13px; color: #92400e; font-weight: bold;">
                        📄 Operational Knowledge Manual Attached
                    </p>
                    <p style="margin: 6px 0 0 0; font-size: 13px; color: #78350f;">
                        Attached to this email is the official <strong>Operational Procedure Manual</strong> for your applied job classification. You are required to review this document prior to your interview, as the technical panel will assess your operational and safety comprehension.
                    </p>
                </div>
                <p>Please ensure you are connected 5 minutes prior to the scheduled time with your video and microphone tested.</p>
                <div class="cta-block">
                    <a href="${zoomLink.trim()}" class="button" style="background-color: #f59e0b; color: #18181b !important;">Join Zoom Interview</a>
                </div>
                <p style="margin-top: 24px; font-size: 12px; color: #64748b;">
                    Yours faithfully,<br>
                    <strong>MACA Limited Recruitment Panel</strong><br>
                    Welshpool, Western Australia
                </p>
            `;

            await sendEmployerEmail(applicant.email, emailSubject, emailContent, attachments);
            logger.info(`[InterviewController] Interview notification sent from Employer mail to ${applicant.email}`);

            // INA02: Schedule employerSecondContact email 1 hour later with maca-employee-onboarding-guide.pdf
            const sendSecondContact = async () => {
                try {
                    const onboardingPdf = generateOnboardingGuidePDF(applicant.fullName, `${interviewDate} at ${interviewTime} (${timezone})`);
                    const secondSubject = 'MACA Employee Onboarding Guide: Interview to Mobilisation Roadmap';
                    const secondContent = `
                        <p>Dear ${applicant.fullName},</p>
                        <p>Following your interview confirmation, we are providing the official <strong>MACA Employee Onboarding Guide (maca-employee-onboarding-guide.pdf)</strong> attached to this email.</p>
                        <p>This comprehensive roadmap details the exact milestones from your upcoming interview to final site deployment in Western Australia, including our TRA skills assessment protocol, temporary resident nomination (TRN), pre-employment medical clearances, and zero-cost relocation benefits.</p>
                        <p>Please review the attached guide carefully and retain it for your records.</p>
                        <p>Yours faithfully,<br><strong>MACA Limited Human Resources</strong><br>Western Australia Mining Infrastructure</p>
                    `;
                    await sendEmployerEmail(applicant.email, secondSubject, secondContent, [
                        {
                            filename: 'maca-employee-onboarding-guide.pdf',
                            content: onboardingPdf,
                            contentType: 'application/pdf'
                        }
                    ]);
                    logger.info(`[InterviewController] INA02 employerSecondContact dispatched to ${applicant.email}`);
                } catch (scErr) {
                    logger.error('[InterviewController] Failed to dispatch INA02 second contact email:', scErr);
                }
            };

            // Schedule 1 hour timer
            setTimeout(sendSecondContact, 60 * 60 * 1000);

            // Also create or update Interview record in DB
            let interview = await Interview.findOne({ where: { applicantId: applicant.id } });
            if (interview) {
                interview.meetingLink = zoomLink.trim();
                interview.overview = `Interview scheduled for ${interviewDate} at ${interviewTime} (${timezone}). Zoom: ${zoomLink.trim()}`;
                await interview.save();
            } else {
                interview = await Interview.create({
                    applicantId: applicant.id,
                    scheduleCatalogueId: 1,
                    meetingLink: zoomLink.trim(),
                    overview: `Interview scheduled for ${interviewDate} at ${interviewTime} (${timezone}). Zoom: ${zoomLink.trim()}`,
                    outcome: 'Pending'
                });
            }

            res.status(CONSTANTS.HTTP_STATUS.OK).json({
                success: true,
                message: 'Interview invitation successfully dispatched from Employer email with operational manual attached. Onboarding guide scheduled for 1-hour follow-up.',
                data: {
                    applicantId: applicant.id,
                    interviewDate,
                    interviewTime,
                    interviewLink: zoomLink.trim(),
                    interviewId: interview.id
                }
            });
        } catch (error: any) {
            logger.error('[InterviewController.scheduleAndNotify]', error);
            res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                error: error.message || 'Failed to dispatch interview notification'
            });
        }
    }

    /**
     * Immediate dispatch of maca-employee-onboarding-guide.pdf on demand (for admin convenience)
     */
    async dispatchOnboardingGuide(req: Request, res: Response): Promise<void> {
        try {
            const { applicantId } = req.body;
            const applicant = await User.findByPk(Number(applicantId));
            if (!applicant) {
                res.status(CONSTANTS.HTTP_STATUS.NOT_FOUND).json({ error: 'Applicant not found' });
                return;
            }

            const interviewStr = applicant.interviewDate && applicant.interviewTime
                ? `${applicant.interviewDate} at ${applicant.interviewTime}`
                : 'Confirmed with Host Employer';

            const onboardingPdf = generateOnboardingGuidePDF(applicant.fullName, interviewStr);

            await sendEmployerEmail(
                applicant.email,
                'MACA Employee Onboarding Guide: Interview to Mobilisation Roadmap',
                `
                    <p>Dear ${applicant.fullName},</p>
                    <p>Please find attached your official <strong>MACA Employee Onboarding Guide (maca-employee-onboarding-guide.pdf)</strong>.</p>
                    <p>This document details our direct visa sponsorship pathway, medical assessments, and deployment provisions.</p>
                    <p>Yours faithfully,<br>MACA Limited Human Resources</p>
                `,
                [
                    {
                        filename: 'maca-employee-onboarding-guide.pdf',
                        content: onboardingPdf,
                        contentType: 'application/pdf'
                    }
                ]
            );

            res.status(CONSTANTS.HTTP_STATUS.OK).json({
                success: true,
                message: 'MACA Onboarding Guide successfully dispatched to applicant from Employer email.'
            });
        } catch (error: any) {
            logger.error('[InterviewController.dispatchOnboardingGuide]', error);
            res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: error.message || 'Failed to dispatch guide' });
        }
    }
}

export const interviewController = new InterviewController();
