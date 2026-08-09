"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applicationService = exports.ApplicationService = void 0;
const database_1 = require("../config/database");
const ApplicationRepository_1 = require("../repositories/ApplicationRepository");
const JobRepository_1 = require("../repositories/JobRepository");
const PaymentRepository_1 = require("../repositories/PaymentRepository");
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
        const completedGroups = [];
        for (const app of appsList) {
            // Collect pending stages (active apps with a current stage)
            if (app.status === constants_1.CONSTANTS.APPLICATION_STATUSES.ACTIVE && app.currentStageId) {
                const currentStage = await JobStageRepository_1.jobStageRepository.findById(app.currentStageId);
                const currentPaymentResult = await PaymentRepository_1.paymentRepository.findAllAdmin({
                    applicationId: app.id,
                    stageId: app.currentStageId,
                });
                const payment = currentPaymentResult.rows[0];
                pendingStages.push({
                    applicationId: app.id,
                    jobTitle: app.JobListing?.title,
                    jobCompany: app.JobListing?.company,
                    jobLocation: app.JobListing?.location,
                    jobSalary: app.JobListing?.salary,
                    stageId: app.currentStageId,
                    requiresPayment: currentStage?.requiresPayment || false,
                    isCompleted: currentStage?.isCompleted || false,
                    amount: payment?.amount ?? currentStage?.amount,
                    currency: payment?.currency ?? currentStage?.currency,
                    stageName: currentStage?.name,
                    stageDescription: currentStage?.description,
                    paymentStatus: payment?.status || 'Unpaid',
                });
            }
            // Gather completed stages for this application
            const stages = await JobStageRepository_1.jobStageRepository.findByApplicationId(app.id);
            const appCompletedStages = (stages.rows || []).filter((s) => s.isCompleted);
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
                        stageDescription: s.description,
                        completedAt: s.updatedAt
                    }))
                });
            }
            // STK-APP-DASH-001: current unpaid payments across all applications
            const unpaidPaymentsResult = await PaymentRepository_1.paymentRepository.findAllAdmin({
                applicationId: app.id,
                status: constants_1.CONSTANTS.PAYMENT_STATUSES.UNPAID,
            });
            unpaidPayments.push(...unpaidPaymentsResult.rows);
        }
        // Collect all payments for history
        const allPayments = [];
        for (const app of appsList) {
            const payments = await PaymentRepository_1.paymentRepository.findByApplicationId(app.id);
            allPayments.push(...payments);
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
            const { PrefillStage } = require('../models');
            const firstApplicantStage = await PrefillStage.findOne({
                where: { type: 'applicant_display' },
                order: [['orderIndex', 'ASC']],
                transaction: t
            });
            const initialStageName = firstApplicantStage ? firstApplicantStage.name : 'under review';
            // Create singular initial stage based on prefill
            const initialStage = await JobStageRepository_1.jobStageRepository.create({
                applicationId: newApp.id,
                name: initialStageName,
                description: 'Your application has been received and is currently under review by our recruitment team.',
                orderPosition: 1,
                requiresPayment: false,
                notifyEmail: true,
                notifyPush: true
            }, t);
            // Set initial stage pointer
            await ApplicationRepository_1.applicationRepository.update(newApp.id, {
                currentStageId: initialStage.id
            }, t);
            // Create associated tickets
            if (ticketsData && ticketsData.length > 0) {
                const { Ticket } = require('../models');
                for (const ticket of ticketsData) {
                    await Ticket.create({
                        ...ticket,
                        userId,
                        applicationId: newApp.id,
                        status: ticket.status || 'not_possessed',
                        ticketSponsorship: 'no_application',
                        refundStatus: 'none'
                    }, { transaction: t });
                }
            }
            else if (job.ticketIds && Array.isArray(job.ticketIds) && job.ticketIds.length > 0) {
                const { TicketCatalog, Ticket, Course } = require('../models');
                const catalogs = await TicketCatalog.findAll({
                    where: { id: job.ticketIds },
                    transaction: t
                });
                for (const cat of catalogs) {
                    let cId = null;
                    const matchingCourse = await Course.findOne({
                        where: {
                            [require('sequelize').Op.or]: [
                                { code: 'RIIWHS204E' },
                                { title: { [require('sequelize').Op.like]: `%${cat.name}%` } }
                            ]
                        },
                        transaction: t
                    });
                    if (matchingCourse)
                        cId = matchingCourse.id;
                    await Ticket.create({
                        userId,
                        applicationId: newApp.id,
                        ticketType: cat.name,
                        status: 'not_possessed',
                        ticketSponsorship: 'no_application',
                        refundStatus: 'none',
                        description: cat.description,
                        realPrice: cat.normalPrice,
                        subsidisedPrice: cat.sponsorshipPrice,
                        purchasePrice: cat.sponsorshipPrice ?? cat.normalPrice ?? 0,
                        canApplySponsorship: true,
                        courseId: cId
                    }, { transaction: t });
                }
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
            // Create unpaid payment record when next stage requires payment
            if (nextStageId) {
                const nextStage = stages.rows.find(s => s.id === nextStageId);
                if (nextStage && nextStage.requiresPayment) {
                    const existingPayment = await PaymentRepository_1.paymentRepository.findAllAdmin({
                        applicationId,
                        stageId: nextStage.id
                    }, t);
                    if (existingPayment.count === 0) {
                        await PaymentRepository_1.paymentRepository.create({
                            applicationId,
                            stageId: nextStage.id,
                            status: constants_1.CONSTANTS.PAYMENT_STATUSES.UNPAID,
                            amount: nextStage.amount,
                            currency: nextStage.currency,
                        }, t);
                    }
                }
                // Notify if requested
                if (shouldNotify && nextStage) {
                    await NotificationRepository_1.notificationRepository.create({
                        userId: app.userId,
                        subject: 'Application Advanced',
                        message: `Your application has moved to the next phase: "${nextStage.name}".`,
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
            const existingStages = await JobStageRepository_1.jobStageRepository.findByApplicationId(applicationId, t);
            const nextPosition = existingStages.rows.length > 0
                ? Math.max(...existingStages.rows.map(s => s.orderPosition)) + 1
                : 1;
            const newStage = await JobStageRepository_1.jobStageRepository.create({
                ...rest,
                applicationId,
                orderPosition: rest.orderPosition || nextPosition
            }, t);
            if (setAsCurrent) {
                await ApplicationRepository_1.applicationRepository.update(applicationId, {
                    currentStageId: newStage.id,
                    status: constants_1.CONSTANTS.APPLICATION_STATUSES.ACTIVE
                }, t);
                // Auto-create payment if required
                if (newStage.requiresPayment) {
                    await PaymentRepository_1.paymentRepository.create({
                        applicationId,
                        stageId: newStage.id,
                        status: constants_1.CONSTANTS.PAYMENT_STATUSES.UNPAID,
                        amount: newStage.amount,
                        currency: newStage.currency,
                    }, t);
                }
                const nSubject = 'Process Activation';
                const nMessage = `A new phase has been activated for your application: "${newStage.name}".`;
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
        // If this stage is (or just became) the current stage and requires payment, ensure payment record exists
        const isCurrentStage = setAsCurrent || app.currentStageId === stageId;
        if (isCurrentStage && updatedStage?.requiresPayment) {
            const existingPayment = await PaymentRepository_1.paymentRepository.findAllAdmin({
                applicationId: app.id,
                stageId: stageId
            });
            if (existingPayment.count === 0) {
                await PaymentRepository_1.paymentRepository.create({
                    applicationId: app.id,
                    stageId: stageId,
                    status: constants_1.CONSTANTS.PAYMENT_STATUSES.UNPAID,
                    amount: updatedStage.amount,
                    currency: updatedStage.currency,
                });
            }
            else {
                const pendingPayment = existingPayment.rows[0];
                if (pendingPayment && (pendingPayment.status === constants_1.CONSTANTS.PAYMENT_STATUSES.UNPAID || pendingPayment.status === constants_1.CONSTANTS.PAYMENT_STATUSES.PENDING)) {
                    await PaymentRepository_1.paymentRepository.update(pendingPayment.id, {
                        amount: updatedStage.amount,
                        currency: updatedStage.currency,
                    });
                }
            }
        }
        const nSubject = setAsCurrent ? 'Process Activation' : 'Phase Update';
        const nMessage = setAsCurrent
            ? `A phase has been activated for your application: "${updatedStage?.name}".`
            : `Details for your current phase "${updatedStage?.name}" have been updated by administration.`;
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
        await JobStageRepository_1.jobStageRepository.update(stageId, { isCompleted: true });
        const app = await ApplicationRepository_1.applicationRepository.findById(stage.applicationId);
        if (app) {
            await NotificationRepository_1.notificationRepository.create({
                userId: app.userId,
                subject: 'Phase Completed',
                message: `Congratulations, your application phase "${stage.name}" has been marked as complete.`,
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
}
exports.ApplicationService = ApplicationService;
exports.applicationService = new ApplicationService();
