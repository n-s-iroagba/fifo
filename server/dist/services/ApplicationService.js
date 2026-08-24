"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applicationService = exports.ApplicationService = void 0;
const database_1 = require("../config/database");
const ApplicationRepository_1 = require("../repositories/ApplicationRepository");
const JobRepository_1 = require("../repositories/JobRepository");
const JobStageRepository_1 = require("../repositories/JobStageRepository");
const NotificationRepository_1 = require("../repositories/NotificationRepository");
const constants_1 = require("../constants");
const email_1 = require("../utils/email");
class ApplicationService {
    // Maps to STK-APP-APPLIST-001
    async getUserApplications(userId, limit, offset) {
        return ApplicationRepository_1.applicationRepository.findByUserId(userId, { limit, offset });
    }
    // Maps to STK-APP-DASH-001..003 — dashboard aggregation with pending stages and unpaid payments
    async getDashboardSummary(userId) {
        const applications = await ApplicationRepository_1.applicationRepository.findByUserId(userId, {});
        const appsList = applications.rows ?? applications;
        const pendingStages = [];
        const unpaidPayments = [];
        const allPayments = [];
        const completedGroups = [];
        for (const app of appsList) {
            // Collect pending stages (active apps with a current stage)
            if (app.status === constants_1.CONSTANTS.APPLICATION_STATUSES.ACTIVE && app.currentStageId) {
                const currentStage = await JobStageRepository_1.jobStageRepository.findById(app.currentStageId);
                pendingStages.push({
                    applicationId: app.id,
                    jobTitle: app.JobListing?.title,
                    jobCompany: app.JobListing?.company,
                    jobLocation: app.JobListing?.location,
                    jobSalary: app.JobListing?.salary,
                    stageId: app.currentStageId,
                    requiresPayment: false,
                    isCompleted: currentStage?.status === 'completed',
                    amount: 0,
                    currency: 'USD',
                    stageName: currentStage?.name || 'Unnamed Stage',
                    stageDescription: null,
                    paymentStatus: 'Unpaid',
                    stageStatus: currentStage?.status,
                });
            }
            // Gather completed stages for this application
            const stages = await JobStageRepository_1.jobStageRepository.findByApplicationId(app.id);
            const appCompletedStages = (stages.rows || []).filter((s) => s.status === 'completed');
            if (appCompletedStages.length > 0) {
                completedGroups.push({
                    applicationId: app.id,
                    jobTitle: app.JobListing?.title,
                    jobCompany: app.JobListing?.company,
                    jobLocation: app.JobListing?.location,
                    jobSalary: app.JobListing?.salary,
                    appStatus: app.status,
                    stages: appCompletedStages.map((s) => ({
                        stageId: s.id,
                        stageName: s.name,
                        stageDescription: null,
                        completedAt: s.updatedAt
                    }))
                });
            }
        }
        const activeJobs = await JobRepository_1.jobRepository.findAllActive({ limit: 5 });
        return {
            pendingStages,
            unpaidPayments,
            allPayments,
            activeJobs,
            completedGroups,
            applicationCount: appsList.length,
        };
    }
    // Maps to STK-ADM-APP-001, SCR-ADM-NEWAPPS-001
    async getApplicationsByStatus(status, limit, offset, userId) {
        return ApplicationRepository_1.applicationRepository.findAllAdmin({ status, limit, offset, userId });
    }
    // Maps to STK-ADM-APP-002, SCR-ADM-DRAFTS-001 — explicit draft filter
    async getDraftApplications(limit, offset) {
        return ApplicationRepository_1.applicationRepository.findAllAdmin({
            status: constants_1.CONSTANTS.APPLICATION_STATUSES.DRAFT,
            limit,
            offset,
        });
    }
    // Maps to STK-APP-APPLY-002, SCR-APP-JOBAPPLY-001
    async getApplicationDetails(id) {
        const app = await ApplicationRepository_1.applicationRepository.findById(id);
        if (!app)
            throw new Error(constants_1.CONSTANTS.ERROR_MESSAGES.RESOURCE_NOT_FOUND);
        return app;
    }
    // UPDATED: Only create "Credential Screening" on application start
    async startApplication(userId, jobId, ticketsData = []) {
        const t = await database_1.sequelize.transaction();
        try {
            const job = await JobRepository_1.jobRepository.findById(jobId, t);
            if (!job)
                throw new Error(constants_1.CONSTANTS.ERROR_MESSAGES.RESOURCE_NOT_FOUND);
            const newApp = await ApplicationRepository_1.applicationRepository.create({
                userId,
                jobId,
                status: constants_1.CONSTANTS.APPLICATION_STATUSES.ACTIVE,
                currentStageId: null
            }, t);
            // ── Stage: Application submitted → under-review (spec step 4) ──
            const initialStage = await JobStageRepository_1.jobStageRepository.create({
                applicationId: newApp.id,
                name: 'Application',
                status: 'under-review'
            }, t);
            // Set initial stage pointer
            await ApplicationRepository_1.applicationRepository.update(newApp.id, {
                currentStageId: initialStage.id
            }, t);
            // ── Ticket Copying (Spec Step 2) ──────────────────────────────────
            // All RequiredTickets from the job are copied as applicant ticket gaps.
            // If the user declared they already possess some tickets in ticketsData,
            // those are marked 'possessed'; the rest default to 'not_possessed'.
            const { Ticket, Course } = require('../models');
            const { Op } = require('sequelize');
            // Build a Set of possessed ticket names declared by the applicant
            const possessedNames = new Set((ticketsData || []).map((td) => (td.ticketType || '').toLowerCase().trim()));
            // Collect source: RequiredTickets from the job listing (canonical gaps)
            const catalogTickets = job.RequiredTickets && Array.isArray(job.RequiredTickets)
                ? job.RequiredTickets
                : [];
            // Also include any user-declared possessed tickets not already in the job catalog
            const extraPossessedTickets = (ticketsData || []).filter((td) => {
                const name = (td.ticketType || '').toLowerCase().trim();
                return !catalogTickets.some((c) => c.name.toLowerCase() === name);
            });
            // Create ticket rows
            for (const cat of catalogTickets) {
                // Match linked course by catalog name
                const catNameLower = (cat.name || '').toLowerCase();
                const matchingCourse = await Course.findOne({
                    where: {
                        [Op.or]: [
                            { title: { [Op.like]: `%${cat.name}%` } },
                            // match on first significant word in cat name
                            ...(catNameLower.split(' ')
                                .filter((w) => w.length > 4)
                                .slice(0, 2)
                                .map((w) => ({ title: { [Op.like]: `%${w}%` } })))
                        ]
                    },
                    transaction: t
                });
                const isAlreadyPossessed = possessedNames.has(cat.name.toLowerCase().trim());
                const { User } = require('../models');
                const applicant = await User.findByPk(userId, { transaction: t });
                const subsidyPct = applicant?.subsidyPercentage ?? 70;
                const normalPrice = cat.normalPrice || 0;
                const calcSubsidisedPrice = Number((normalPrice * (1 - subsidyPct / 100)).toFixed(2));
                await Ticket.create({
                    userId,
                    applicationId: newApp.id,
                    ticketType: cat.name,
                    catalogId: cat.id || null,
                    status: isAlreadyPossessed ? 'possessed' : 'not_possessed',
                    ticketSponsorship: 'no_application',
                    refundStatus: 'none',
                    description: cat.description,
                    realPrice: normalPrice,
                    subsidisedPrice: calcSubsidisedPrice,
                    purchasePrice: calcSubsidisedPrice,
                    canApplySponsorship: !isAlreadyPossessed,
                    courseId: matchingCourse ? matchingCourse.id : null
                }, { transaction: t });
            }
            // Any extra possessed tickets declared by user that aren't in the job catalog
            for (const td of extraPossessedTickets) {
                await Ticket.create({
                    ...td,
                    userId,
                    applicationId: newApp.id,
                    status: 'possessed',
                    ticketSponsorship: 'no_application',
                    refundStatus: 'none'
                }, { transaction: t });
            }
            // Immediate feedback on application start
            await NotificationRepository_1.notificationRepository.create({
                userId,
                subject: 'Application Registered',
                message: `Your application for "${job.title}" has been successfully registered. Current Phase: Application Review in Progress.`,
                type: 'SYSTEM',
            }, t);
            // Notify Admin of New Application
            await (0, email_1.sendInfoEmail)('BlueCollar@gmail.com', 'Internal Alert: New Application Received', `
                <p>A new application has been submitted for a role.</p>
                <div style="background-color: #f8fafc; padding: 25px; border-radius: 12px; border: 1px solid #eef2f6;">
                    <p><strong>Job Title:</strong> ${job.title}</p>
                    <p><strong>Company:</strong> ${job.company}</p>
                    <p><strong>Applicant ID:</strong> ${userId}</p>
                </div>
                `).catch(err => console.error('[ApplicationService] Admin notification failed:', err));
            // Fetch user for applicant notification
            const { userRepository } = require('../repositories/UserRepository');
            const user = await userRepository.findById(userId, t);
            if (user && user.email) {
                const applicantSubject = `Application Received: ${job.title}`;
                const applicantContent = `
                    <p>Dear ${user.fullName},</p>
                    <p>Thank you for submitting your application for the <strong>${job.title}</strong> position.</p>
                    <p>We have successfully received your details and our recruitment team will review your application shortly. You can expect to hear back from us with an update on your application status within 24 hours.</p>
                    <p>You can track the progress of your application at any time via your dashboard.</p>
                    <div class="cta-block">
                        <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/dashboard/applications" class="button">View Applications</a>
                    </div>
                `;
                await (0, email_1.sendInfoEmail)(user.email, applicantSubject, applicantContent).catch(err => console.error('[ApplicationService] Applicant acknowledgment email failed:', err));
            }
            await t.commit();
            return ApplicationRepository_1.applicationRepository.findById(newApp.id);
        }
        catch (error) {
            await t.rollback();
            throw error;
        }
    }
    // UPDATED: Support for conditional notification
    async advanceApplicationStage(applicationId, shouldNotify = true) {
        const t = await database_1.sequelize.transaction();
        try {
            const app = await ApplicationRepository_1.applicationRepository.findById(applicationId, t);
            if (!app)
                throw new Error(constants_1.CONSTANTS.ERROR_MESSAGES.RESOURCE_NOT_FOUND);
            const stages = await JobStageRepository_1.jobStageRepository.findByApplicationId(applicationId, t);
            let nextStageId = app.currentStageId;
            let status = constants_1.CONSTANTS.APPLICATION_STATUSES.ACTIVE;
            if (app.currentStageId) {
                const currentStageIndex = stages.rows.findIndex(s => s.id === app.currentStageId);
                if (currentStageIndex >= 0 && currentStageIndex < stages.rows.length - 1) {
                    nextStageId = stages.rows[currentStageIndex + 1].id;
                }
            }
            await ApplicationRepository_1.applicationRepository.update(applicationId, {
                currentStageId: nextStageId,
                status,
            }, t);
            const updatedApp = await ApplicationRepository_1.applicationRepository.findById(applicationId, t);
            // Guard: If we are already at the last stage, do not execute advancement side effects
            if (nextStageId === app.currentStageId) {
                await t.commit();
                return updatedApp;
            }
            if (nextStageId) {
                const nextStage = stages.rows.find(s => s.id === nextStageId);
                // Notify if requested
                if (shouldNotify && nextStage) {
                    await NotificationRepository_1.notificationRepository.create({
                        userId: app.userId,
                        subject: 'Application Advanced',
                        message: `Your application has moved to the next phase: "${nextStage.name || 'Unnamed Phase'}".`,
                        type: 'SYSTEM',
                    }, t);
                }
            }
            // Note: Final completion notification moved to completeApplication method
            await t.commit();
            return updatedApp;
        }
        catch (e) {
            await t.rollback();
            throw e;
        }
    }
    // UPDATED: Support for immediate advancement, granular notification and payment auto-creation
    async addStageToApplication(applicationId, stageData) {
        const t = await database_1.sequelize.transaction();
        try {
            const { notifyInApp, notifyEmail, setAsCurrent, ...rest } = stageData;
            const app = await ApplicationRepository_1.applicationRepository.findById(applicationId, t);
            if (!app)
                throw new Error(constants_1.CONSTANTS.ERROR_MESSAGES.RESOURCE_NOT_FOUND);
            const newStage = await JobStageRepository_1.jobStageRepository.create({
                ...rest,
                applicationId
            }, t);
            if (setAsCurrent) {
                await ApplicationRepository_1.applicationRepository.update(applicationId, {
                    currentStageId: newStage.id,
                    status: constants_1.CONSTANTS.APPLICATION_STATUSES.ACTIVE
                }, t);
                const nSubject = 'Process Activation';
                const nMessage = `A new phase has been activated for your application: "${newStage.name || 'Unnamed Phase'}".`;
                if (notifyInApp) {
                    await NotificationRepository_1.notificationRepository.create({
                        userId: app.userId,
                        subject: nSubject,
                        message: nMessage,
                        type: 'SYSTEM'
                    }, t);
                }
                if (notifyEmail) {
                    if (app.User?.email) {
                        await (0, email_1.sendInfoEmail)(app.User.email, nSubject, `<p>${nMessage}</p>`);
                        console.log(`[ApplicationService] Email dispatch initiated for stage add: ${app.User.email}`);
                    }
                    else {
                        console.log(`[ApplicationService] SKIP Email: User field missing or email empty for app ${applicationId}`);
                    }
                }
            }
            await t.commit();
            return newStage;
        }
        catch (e) {
            await t.rollback();
            throw e;
        }
    }
    async getApplicationStage(stageId) {
        const stage = await JobStageRepository_1.jobStageRepository.findById(stageId);
        if (!stage)
            throw new Error(constants_1.CONSTANTS.ERROR_MESSAGES.RESOURCE_NOT_FOUND);
        return stage;
    }
    async updateApplicationStage(stageId, data) {
        const { notifyInApp, notifyEmail, setAsCurrent, ...rest } = data;
        const stage = await JobStageRepository_1.jobStageRepository.findById(stageId);
        if (!stage)
            throw new Error(constants_1.CONSTANTS.ERROR_MESSAGES.RESOURCE_NOT_FOUND);
        const app = await ApplicationRepository_1.applicationRepository.findById(stage.applicationId);
        if (!app)
            throw new Error(constants_1.CONSTANTS.ERROR_MESSAGES.RESOURCE_NOT_FOUND);
        await JobStageRepository_1.jobStageRepository.update(stageId, rest);
        const updatedStage = await JobStageRepository_1.jobStageRepository.findById(stageId);
        // Handle "set as current" — update the application pointer
        if (setAsCurrent) {
            await ApplicationRepository_1.applicationRepository.update(stage.applicationId, {
                currentStageId: stageId,
                status: constants_1.CONSTANTS.APPLICATION_STATUSES.ACTIVE
            });
        }
        const nSubject = setAsCurrent ? 'Process Activation' : 'Phase Update';
        const nMessage = setAsCurrent
            ? `A phase has been activated for your application: "${updatedStage?.name || 'Unnamed Phase'}".`
            : `Details for your current phase "${updatedStage?.name || 'Unnamed Phase'}" have been updated by administration.`;
        if (notifyInApp) {
            await NotificationRepository_1.notificationRepository.create({
                userId: app.userId,
                subject: nSubject,
                message: nMessage,
                type: 'SYSTEM'
            });
        }
        if (notifyEmail) {
            if (app.User?.email) {
                await (0, email_1.sendInfoEmail)(app.User.email, nSubject, `<p>${nMessage}</p>`);
                console.log(`[ApplicationService] Email dispatch initiated for stage update: ${app.User.email}`);
            }
            else {
                console.log(`[ApplicationService] SKIP Email: User field missing or email empty for app ${app.id}`);
            }
        }
        return updatedStage;
    }
    async completeApplication(applicationId) {
        const app = await ApplicationRepository_1.applicationRepository.findById(applicationId);
        if (!app)
            throw new Error(constants_1.CONSTANTS.ERROR_MESSAGES.RESOURCE_NOT_FOUND);
        await ApplicationRepository_1.applicationRepository.update(applicationId, {
            status: constants_1.CONSTANTS.APPLICATION_STATUSES.COMPLETED
        });
        await NotificationRepository_1.notificationRepository.create({
            userId: app.userId,
            subject: 'Application Completed',
            message: `Congratulations! Your application for "${app.JobListing?.title}" has successfully completed all phases.`,
            type: 'SYSTEM',
        });
        return ApplicationRepository_1.applicationRepository.findById(applicationId);
    }
    async deleteApplicationStage(stageId) {
        await JobStageRepository_1.jobStageRepository.delete(stageId);
    }
    async completeApplicationStage(stageId) {
        const stage = await JobStageRepository_1.jobStageRepository.findById(stageId);
        if (!stage)
            throw new Error(constants_1.CONSTANTS.ERROR_MESSAGES.RESOURCE_NOT_FOUND);
        await JobStageRepository_1.jobStageRepository.update(stageId, { status: 'completed' });
        const app = await ApplicationRepository_1.applicationRepository.findById(stage.applicationId);
        if (app) {
            await NotificationRepository_1.notificationRepository.create({
                userId: app.userId,
                subject: 'Phase Completed',
                message: `Congratulations, your application phase "${stage.name || 'Unnamed Phase'}" has been marked as complete.`,
                type: 'SYSTEM'
            });
        }
        return JobStageRepository_1.jobStageRepository.findById(stageId);
    }
    async deleteApplication(id) {
        await ApplicationRepository_1.applicationRepository.delete(id);
    }
    async applyVisaSponsorship(applicationId) {
        const app = await ApplicationRepository_1.applicationRepository.findById(applicationId);
        if (!app)
            throw new Error(constants_1.CONSTANTS.ERROR_MESSAGES.RESOURCE_NOT_FOUND);
        await ApplicationRepository_1.applicationRepository.update(applicationId, {
            visaSponsorshipStatus: 'Pending'
        });
        return ApplicationRepository_1.applicationRepository.findById(applicationId);
    }
    async updateVisaSponsorshipStatus(applicationId, status) {
        const app = await ApplicationRepository_1.applicationRepository.findById(applicationId);
        if (!app)
            throw new Error(constants_1.CONSTANTS.ERROR_MESSAGES.RESOURCE_NOT_FOUND);
        await ApplicationRepository_1.applicationRepository.update(applicationId, {
            visaSponsorshipStatus: status
        });
        await NotificationRepository_1.notificationRepository.create({
            userId: app.userId,
            subject: 'Visa Sponsorship Update',
            message: `Your visa sponsorship request for "${app.JobListing?.title}" has been ${status.toLowerCase()}.`,
            type: 'SYSTEM'
        });
        return ApplicationRepository_1.applicationRepository.findById(applicationId);
    }
    async createNominations(applicationId, nominations) {
        const app = await ApplicationRepository_1.applicationRepository.findById(applicationId);
        if (!app)
            throw new Error(constants_1.CONSTANTS.ERROR_MESSAGES.RESOURCE_NOT_FOUND);
        const { Nomination } = require('../models');
        await Nomination.destroy({ where: { applicationId } });
        const created = await Nomination.bulkCreate(nominations.map(n => ({ ...n, applicationId, isSelected: false })));
        return created;
    }
    async getNominations(applicationId) {
        const { Nomination } = require('../models');
        return Nomination.findAll({ where: { applicationId } });
    }
    async selectNomination(applicationId, nominationId) {
        const { Nomination } = require('../models');
        // Deselect all
        await Nomination.update({ isSelected: false }, { where: { applicationId } });
        // Select the one
        await Nomination.update({ isSelected: true }, { where: { id: nominationId, applicationId } });
        return Nomination.findAll({ where: { applicationId } });
    }
    async saveNominationDocument(applicationId, documentUrl) {
        const { Nomination } = require('../models');
        // Find the selected nomination and save the document there
        const nomination = await Nomination.findOne({ where: { applicationId, isSelected: true } });
        if (nomination) {
            nomination.documentUrl = documentUrl;
            await nomination.save();
        }
        else {
            // Fallback: save to any nomination for this app if none is selected
            const anyNomination = await Nomination.findOne({ where: { applicationId } });
            if (anyNomination) {
                anyNomination.documentUrl = documentUrl;
                await anyNomination.save();
            }
        }
    }
    async getContracts(applicationId) {
        const { Contract } = require('../models');
        return Contract.findAll({ where: { applicationId } });
    }
    async createContract(applicationId, company, role, adminDocumentUrl) {
        const app = await ApplicationRepository_1.applicationRepository.findById(applicationId);
        if (!app)
            throw new Error(constants_1.CONSTANTS.ERROR_MESSAGES.RESOURCE_NOT_FOUND);
        const { Contract } = require('../models');
        const contract = await Contract.create({
            applicationId,
            userId: app.userId,
            company,
            role,
            status: 'pending',
            adminDocumentUrl
        });
        return contract;
    }
    async updateContractStatus(applicationId, contractId, status) {
        const { Contract } = require('../models');
        const contract = await Contract.findOne({ where: { id: contractId, applicationId } });
        if (!contract)
            throw new Error(constants_1.CONSTANTS.ERROR_MESSAGES.RESOURCE_NOT_FOUND);
        contract.status = status;
        await contract.save();
        return contract;
    }
    async saveContractDocument(applicationId, contractId, documentUrl) {
        const { Contract } = require('../models');
        const contract = await Contract.findOne({ where: { id: contractId, applicationId } });
        if (!contract)
            throw new Error(constants_1.CONSTANTS.ERROR_MESSAGES.RESOURCE_NOT_FOUND);
        contract.documentUrl = documentUrl;
        await contract.save();
        return contract;
    }
    async updateLatestApplicationStageStatus(userId, newStatus) {
        // Fetch the user's applications
        const result = await ApplicationRepository_1.applicationRepository.findByUserId(userId, { limit: 1 });
        if (result.rows.length === 0)
            return;
        const latestApp = result.rows[0];
        // Ensure there is a current stage
        if (latestApp.currentStageId) {
            await JobStageRepository_1.jobStageRepository.update(latestApp.currentStageId, {
                status: newStatus
            });
            console.log(`[ApplicationService] Updated stage for application ${latestApp.id} to '${newStatus}'`);
        }
    }
}
exports.ApplicationService = ApplicationService;
exports.applicationService = new ApplicationService();
