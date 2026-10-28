"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.interviewController = exports.InterviewController = void 0;
const models_1 = require("../models");
const constants_1 = require("../constants");
const logger_1 = require("../utils/logger");
const email_1 = require("../utils/email");
const axios_1 = __importDefault(require("axios"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
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
                        attributes: ['id', 'fullName', 'email', 'candidateNumber', 'phoneNumber', 'canPickSchedule', 'interviewEmailSentAt', 'onboardingEmailSent'],
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
            const { applicantId, scheduleCatalogueId, overview, outcome, meetingLink, zoomLink, interviewUrl, interviewDate, interviewTime, timezone = 'AWST (UTC+8)', } = req.body;
            if (!applicantId) {
                res.status(constants_1.CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
                    error: 'Applicant ID is required',
                });
                return;
            }
            // Check applicant existence
            const applicant = await models_1.User.findByPk(applicantId);
            if (!applicant) {
                res.status(constants_1.CONSTANTS.HTTP_STATUS.NOT_FOUND).json({ error: 'Applicant not found' });
                return;
            }
            let slotDate = interviewDate;
            let slotTime = interviewTime;
            if (scheduleCatalogueId) {
                const schedule = await models_1.ScheduleCatalogue.findByPk(scheduleCatalogueId);
                if (schedule) {
                    slotDate = schedule.date;
                    slotTime = schedule.time;
                    schedule.isBooked = true;
                    await schedule.save();
                }
            }
            const effectiveMeetingLink = (meetingLink || zoomLink || interviewUrl || applicant.interviewLink || '').trim();
            const effectiveDate = slotDate || applicant.interviewDate || null;
            const effectiveTime = slotTime || applicant.interviewTime || null;
            const interview = await models_1.Interview.create({
                applicantId,
                scheduleCatalogueId: scheduleCatalogueId ? Number(scheduleCatalogueId) : null,
                interviewDate: effectiveDate ? String(effectiveDate) : null,
                interviewTime: effectiveTime ? String(effectiveTime) : null,
                timezone: String(timezone),
                interviewUrl: effectiveMeetingLink || null,
                meetingLink: effectiveMeetingLink || null,
                overview: overview || (effectiveDate ? `Interview scheduled for ${effectiveDate} at ${effectiveTime} (${timezone})` : null),
                outcome: outcome || 'Pending',
            });
            if (effectiveDate)
                applicant.interviewDate = String(effectiveDate);
            if (effectiveTime)
                applicant.interviewTime = String(effectiveTime);
            if (effectiveMeetingLink)
                applicant.interviewLink = effectiveMeetingLink;
            await applicant.save();
            // Send in-app notification to applicant
            try {
                await models_1.Notification.create({
                    userId: applicantId,
                    subject: 'Interview Scheduled',
                    message: effectiveDate
                        ? `Your interview has been scheduled for ${effectiveDate} at ${effectiveTime} (${timezone}).`
                        : 'Your interview has been scheduled. Please check your dashboard for details.',
                    type: 'SYSTEM',
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
     * Admin: Update an interview (overview, outcome, meeting link, date, time).
     */
    async update(req, res) {
        try {
            const { id } = req.params;
            const { scheduleCatalogueId, overview, outcome, meetingLink, interviewUrl, interviewDate, interviewTime, timezone, } = req.body;
            const interview = await models_1.Interview.findByPk(Number(id));
            if (!interview) {
                res.status(constants_1.CONSTANTS.HTTP_STATUS.NOT_FOUND).json({ error: 'Interview record not found' });
                return;
            }
            // If scheduleCatalogueId is changed
            if (scheduleCatalogueId && scheduleCatalogueId !== interview.scheduleCatalogueId) {
                const newSchedule = await models_1.ScheduleCatalogue.findByPk(Number(scheduleCatalogueId));
                if (newSchedule && !newSchedule.isBooked) {
                    const oldSchedule = interview.scheduleCatalogueId ? await models_1.ScheduleCatalogue.findByPk(interview.scheduleCatalogueId) : null;
                    if (oldSchedule) {
                        oldSchedule.isBooked = false;
                        await oldSchedule.save();
                    }
                    newSchedule.isBooked = true;
                    await newSchedule.save();
                    interview.scheduleCatalogueId = scheduleCatalogueId;
                }
            }
            if (overview !== undefined)
                interview.overview = overview;
            if (outcome !== undefined)
                interview.outcome = outcome;
            if (meetingLink !== undefined)
                interview.meetingLink = meetingLink;
            if (interviewUrl !== undefined)
                interview.interviewUrl = interviewUrl;
            if (interviewDate !== undefined)
                interview.interviewDate = interviewDate;
            if (interviewTime !== undefined)
                interview.interviewTime = interviewTime;
            if (timezone !== undefined)
                interview.timezone = timezone;
            await interview.save();
            // Sync with User model
            const applicant = await models_1.User.findByPk(interview.applicantId);
            if (applicant) {
                if (interviewDate !== undefined)
                    applicant.interviewDate = interviewDate;
                if (interviewTime !== undefined)
                    applicant.interviewTime = interviewTime;
                if (meetingLink || interviewUrl)
                    applicant.interviewLink = (interviewUrl || meetingLink || '').trim();
                await applicant.save();
            }
            // Notify applicant of outcome change if applicable
            if (outcome && outcome !== 'Pending') {
                try {
                    await models_1.Notification.create({
                        userId: interview.applicantId,
                        subject: 'Interview Outcome Updated',
                        message: `Your interview status has been updated to: ${outcome}.`,
                        type: 'SYSTEM',
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
            // Free the schedule slot if linked
            if (interview.scheduleCatalogueId) {
                const schedule = await models_1.ScheduleCatalogue.findByPk(interview.scheduleCatalogueId);
                if (schedule) {
                    schedule.isBooked = false;
                    await schedule.save();
                }
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
                attributes: ['id', 'fullName', 'email', 'candidateNumber', 'canPickSchedule', 'interviewDate', 'interviewTime', 'interviewLink'],
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
            let responseData = null;
            if (interview) {
                const raw = interview.toJSON();
                responseData = {
                    ...raw,
                    interviewDate: interview.interviewDate || user.interviewDate || raw.selectedSchedule?.date || null,
                    interviewTime: interview.interviewTime || user.interviewTime || raw.selectedSchedule?.time || null,
                    timezone: interview.timezone || 'AWST (UTC+8)',
                    interviewUrl: interview.interviewUrl || interview.meetingLink || user.interviewLink || null,
                    meetingLink: interview.meetingLink || interview.interviewUrl || user.interviewLink || null,
                };
            }
            else if (user.interviewDate) {
                responseData = {
                    id: 0,
                    applicantId: userId,
                    interviewDate: user.interviewDate,
                    interviewTime: user.interviewTime,
                    timezone: 'AWST (UTC+8)',
                    interviewUrl: user.interviewLink,
                    meetingLink: user.interviewLink,
                    overview: `Interview confirmed for ${user.interviewDate} at ${user.interviewTime}.`,
                    outcome: 'Pending'
                };
            }
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json({
                success: true,
                canPickSchedule: Boolean(user.canPickSchedule),
                data: responseData,
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
                    subject: 'Interview Confirmed',
                    message: `Your interview has been booked for ${schedule.date} at ${schedule.time}.`,
                    type: 'SYSTEM',
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
                        subject: 'Interview Scheduling Authorized',
                        message: 'You are now authorized to select your interview schedule. Navigate to the Interviews tab in your dashboard.',
                        type: 'SYSTEM',
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
    /**
     * F005 / INAS01: Conditional Invitation for interview sent from Employer email.
     * Admin must include zoom link. Updates applicant.interviewDate, applicant.interviewTime, applicant.interviewLink.
     * Operational manual attached as file (not link).
     * Schedules employerSecondContact (maca-employee-onboarding-guide.pdf) 1 hour later.
     */
    async scheduleAndNotify(req, res) {
        try {
            const { applicantId, interviewDate, interviewTime, zoomLink, timezone = 'AWST (UTC+8)' } = req.body;
            if (!applicantId) {
                res.status(constants_1.CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({ error: 'Applicant ID is required' });
                return;
            }
            if (!zoomLink || !zoomLink.trim()) {
                res.status(constants_1.CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({ error: 'Zoom meeting link is strictly mandatory before sending the interview notification email.' });
                return;
            }
            if (!interviewDate || !interviewTime) {
                res.status(constants_1.CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({ error: 'Interview date and time are required' });
                return;
            }
            const applicant = await models_1.User.findByPk(Number(applicantId));
            if (!applicant) {
                res.status(constants_1.CONSTANTS.HTTP_STATUS.NOT_FOUND).json({ error: 'Applicant record not found' });
                return;
            }
            // Update applicant database attributes
            applicant.interviewDate = String(interviewDate);
            applicant.interviewTime = String(interviewTime);
            applicant.interviewLink = zoomLink.trim();
            await applicant.save();
            // Find application & JobListing to fetch operational manual
            const application = await models_1.Application.findOne({
                where: { userId: applicant.id },
                include: [{ model: models_1.JobListing, as: 'JobListing' }]
            });
            const jobListing = application?.JobListing;
            const roleTitle = jobListing?.title || 'FIFO Mining & Resource Operations';
            // Prepare operational manual attachment as a FILE downloaded from Cloudinary/URL
            const operationalUrl = req.body.manualUrl?.trim() || jobListing?.operationalManualUrl?.trim();
            let manualAttachment = null;
            if (operationalUrl && operationalUrl.startsWith('http')) {
                try {
                    const response = await axios_1.default.get(operationalUrl, { responseType: 'arraybuffer', timeout: 15000 });
                    const filename = `${jobListing?.title ? jobListing.title.toLowerCase().replace(/[^a-z0-9]/g, '-') : 'role'}-operational-procedure-document.pdf`;
                    manualAttachment = {
                        filename,
                        content: Buffer.from(response.data),
                        contentType: response.headers['content-type'] || 'application/pdf'
                    };
                }
                catch (fetchErr) {
                    logger_1.logger.warn(`Failed to download remote operational manual from URL (${operationalUrl}), falling back to local asset: ${fetchErr?.message || fetchErr}`);
                }
            }
            if (!manualAttachment) {
                // Fallback to local default operational procedure manual
                const defaultManualPath = path_1.default.resolve(__dirname, '../assets/HIRING_PROCESS_INFORMATION.pdf');
                if (fs_1.default.existsSync(defaultManualPath)) {
                    manualAttachment = {
                        filename: `mining-site-operational-procedure-manual.pdf`,
                        content: fs_1.default.readFileSync(defaultManualPath),
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

                <!-- Operational Manual File Attachment Notice -->
                <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 16px 20px; margin: 20px 0; border-radius: 4px;">
                    <p style="margin: 0 0 6px 0; font-size: 13.5px; color: #92400e; font-weight: bold;">
                        📄 Role Operational Document Attached
                    </p>
                    <p style="margin: 0; font-size: 13px; color: #78350f; line-height: 1.5;">
                        The official operational document for your role (<strong>${roleTitle}</strong>) has been downloaded from our operational repository and attached to this email as a file. You are required to review this document in detail prior to your interview, as the technical panel will assess your operational competencies and familiarity with site safety standards.
                    </p>
                </div>

                <!-- Critical Next Step Notice: Onboarding Process Email -->
                <div style="background-color: #eff6ff; border-left: 4px solid #2563eb; border-radius: 6px; padding: 18px 20px; margin: 24px 0;">
                    <p style="margin: 0 0 8px 0; font-size: 14px; font-weight: 800; color: #1e3a8a; text-transform: uppercase;">
                        ⚠️ CRITICAL NEXT STEP: Onboarding Process Email Arriving in Less Than 2 Hours
                    </p>
                    <p style="margin: 0 0 8px 0; font-size: 13.5px; color: #1e40af; line-height: 1.5;">
                        Please be advised that you will receive our second official email — the <strong>MACA Onboarding Process Email</strong> — in <strong>less than 2 hours (1 hour post-interview dispatch)</strong>.
                    </p>
                    <p style="margin: 0; font-size: 13px; color: #1e3a8a; line-height: 1.5; font-weight: bold;">
                        This upcoming communication is of vital importance to your visa sponsorship and site deployment. You must ensure you monitor your inbox, thoroughly read the onboarding email, and carefully review its attached file (<code>maca-employee-onboarding-guide.pdf</code>) immediately upon arrival.
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
            await (0, email_1.sendEmployerEmail)(applicant.email, emailSubject, emailContent, attachments);
            logger_1.logger.info(`[InterviewController] Interview notification sent from Employer mail to ${applicant.email}`);
            const now = new Date();
            // Also create or update Interview record in DB
            let interview = await models_1.Interview.findOne({ where: { applicantId: applicant.id } });
            if (interview) {
                interview.interviewDate = String(interviewDate);
                interview.interviewTime = String(interviewTime);
                interview.timezone = String(timezone);
                interview.interviewUrl = zoomLink.trim();
                interview.meetingLink = zoomLink.trim();
                interview.overview = `Interview scheduled for ${interviewDate} at ${interviewTime} (${timezone}). Zoom: ${zoomLink.trim()}`;
                interview.outcome = 'Pending';
                interview.interviewEmailSentAt = now;
                interview.onboardingEmailSent = false;
                await interview.save();
            }
            else {
                interview = await models_1.Interview.create({
                    applicantId: applicant.id,
                    scheduleCatalogueId: null,
                    interviewDate: String(interviewDate),
                    interviewTime: String(interviewTime),
                    timezone: String(timezone),
                    interviewUrl: zoomLink.trim(),
                    meetingLink: zoomLink.trim(),
                    overview: `Interview scheduled for ${interviewDate} at ${interviewTime} (${timezone}). Zoom: ${zoomLink.trim()}`,
                    outcome: 'Pending',
                    interviewEmailSentAt: now,
                    onboardingEmailSent: false
                });
            }
            // Update applicant record
            applicant.interviewEmailSentAt = now;
            applicant.onboardingEmailSent = false;
            await applicant.save();
            // Update application stage to Interview Scheduling
            if (application) {
                try {
                    const { applicationService } = require('../services/ApplicationService');
                    await applicationService.addStageToApplication(application.id, {
                        name: 'Interview Scheduling',
                        status: 'invited',
                        setAsCurrent: true,
                        notifyInApp: true,
                        notifyEmail: false
                    });
                }
                catch (stageErr) {
                    logger_1.logger.warn(`[InterviewController] Could not update application stage: ${stageErr?.message || stageErr}`);
                }
            }
            // INA02 Safety Timer (1 hour) in addition to background cron
            const { dispatchApplicantOnboardingGuide } = require('../cron/onboardingCron');
            setTimeout(async () => {
                try {
                    const currentInterview = await models_1.Interview.findOne({ where: { applicantId: applicant.id } });
                    if (currentInterview && !currentInterview.onboardingEmailSent) {
                        await dispatchApplicantOnboardingGuide(applicant.id);
                    }
                }
                catch (tErr) {
                    logger_1.logger.error('[InterviewController] Safety timer onboarding dispatch failed:', tErr);
                }
            }, 60 * 60 * 1000);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json({
                success: true,
                message: 'Interview invitation successfully dispatched from Employer email with operational document attached. Onboarding guide scheduled for 1-hour follow-up.',
                data: {
                    applicantId: applicant.id,
                    interviewDate,
                    interviewTime,
                    interviewLink: zoomLink.trim(),
                    interviewId: interview.id
                }
            });
        }
        catch (error) {
            logger_1.logger.error('[InterviewController.scheduleAndNotify]', error);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                error: error.message || 'Failed to dispatch interview notification'
            });
        }
    }
    /**
     * Dispatch of maca-employee-onboarding-guide.pdf on demand (for admin convenience)
     */
    async dispatchOnboardingGuide(req, res) {
        try {
            const { applicantId } = req.body;
            if (!applicantId) {
                res.status(constants_1.CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({ error: 'Applicant ID is required' });
                return;
            }
            const { dispatchApplicantOnboardingGuide } = require('../cron/onboardingCron');
            const result = await dispatchApplicantOnboardingGuide(Number(applicantId));
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json({
                success: true,
                message: result.message
            });
        }
        catch (error) {
            logger_1.logger.error('[InterviewController.dispatchOnboardingGuide]', error);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: error.message || 'Failed to dispatch guide' });
        }
    }
}
exports.InterviewController = InterviewController;
exports.interviewController = new InterviewController();
