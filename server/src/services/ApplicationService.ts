import { sequelize } from '../config/database';
import { applicationRepository } from '../repositories/ApplicationRepository';
import { jobRepository } from '../repositories/JobRepository';

import { jobStageRepository } from '../repositories/JobStageRepository';
import { notificationRepository } from '../repositories/NotificationRepository';
import { CONSTANTS } from '../constants';
import { sendInfoEmail } from '../utils/email';

export class ApplicationService {
    // Maps to STK-APP-APPLIST-001
    public async getUserApplications(userId: number, limit?: number, offset?: number) {
        return applicationRepository.findByUserId(userId, { limit, offset });
    }

    // Maps to STK-APP-DASH-001..003 — dashboard aggregation with pending stages and unpaid payments
    public async getDashboardSummary(userId: number) {
        const applications = await applicationRepository.findByUserId(userId, {});
        const appsList = (applications as any).rows ?? applications;

        const pendingStages: any[] = [];
        const unpaidPayments: any[] = [];
        const allPayments: any[] = [];
        const completedGroups: any[] = [];

        for (const app of appsList) {
            // Collect draft applications
            if (app.status === CONSTANTS.APPLICATION_STATUSES.DRAFT) {
                pendingStages.push({
                    applicationId: app.id,
                    jobTitle: app.JobListing?.title,
                    jobCompany: app.JobListing?.company,
                    jobLocation: app.JobListing?.location,
                    jobSalary: app.JobListing?.salary,
                    jobId: app.jobId,
                    stageId: null,
                    requiresPayment: false,
                    isCompleted: false,
                    amount: 0,
                    currency: 'USD',
                    stageName: 'Draft Application',
                    stageDescription: 'You have started this application but not yet submitted it. Click Details to continue.',
                    paymentStatus: 'Unpaid',
                    stageStatus: 'draft',
                });
            }
            // Collect pending stages (active apps with a current stage)
            else if (app.status === CONSTANTS.APPLICATION_STATUSES.ACTIVE && app.currentStageId) {
                const currentStage = await jobStageRepository.findById(app.currentStageId);
                pendingStages.push({
                    applicationId: app.id,
                    jobTitle: app.JobListing?.title,
                    jobCompany: app.JobListing?.company,
                    jobLocation: app.JobListing?.location,
                    jobSalary: app.JobListing?.salary,
                    jobId: app.jobId,
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
            const stages = await jobStageRepository.findByApplicationId(app.id);
            const appCompletedStages = (stages.rows || []).filter((s: any) => s.status === 'completed');

            if (appCompletedStages.length > 0) {
                completedGroups.push({
                    applicationId: app.id,
                    jobTitle: app.JobListing?.title,
                    jobCompany: app.JobListing?.company,
                    jobLocation: app.JobListing?.location,
                    jobSalary: app.JobListing?.salary,
                    appStatus: app.status,
                    stages: appCompletedStages.map((s: any) => ({
                        stageId: s.id,
                        stageName: s.name,
                        stageDescription: null,
                        completedAt: s.updatedAt
                    }))
                });
            }
        }



        const activeJobs = await jobRepository.findAllActive({ limit: 5 });

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
    public async getApplicationsByStatus(status: string, limit?: number, offset?: number, userId?: number) {
        return applicationRepository.findAllAdmin({ status, limit, offset, userId });
    }

    // Maps to STK-ADM-APP-002, SCR-ADM-DRAFTS-001 — explicit draft filter
    public async getDraftApplications(limit?: number, offset?: number) {
        return applicationRepository.findAllAdmin({
            status: CONSTANTS.APPLICATION_STATUSES.DRAFT,
            limit,
            offset,
        });
    }

    // Maps to STK-APP-APPLY-002, SCR-APP-JOBAPPLY-001
    public async getApplicationDetails(id: number) {
        const app = await applicationRepository.findById(id);
        if (!app) throw new Error(CONSTANTS.ERROR_MESSAGES.RESOURCE_NOT_FOUND);
        return app;
    }

    public async draftApplication(userId: number, jobId: number) {
        const t = await sequelize.transaction();
        try {
            const job = await jobRepository.findById(jobId, t);
            if (!job) throw new Error(CONSTANTS.ERROR_MESSAGES.RESOURCE_NOT_FOUND);

            // Create application in draft status
            const newApp = await applicationRepository.create({
                userId,
                jobId,
                status: CONSTANTS.APPLICATION_STATUSES.DRAFT,
                currentStageId: null
            }, t);

            await t.commit();
            return applicationRepository.findById(newApp.id);
        } catch (error) {
            await t.rollback();
            throw error;
        }
    }

    // UPDATED: Only create "Credential Screening" on application start
    public async startApplication(userId: number, jobId: number, ticketsData: any[] = []) {
        const t = await sequelize.transaction();
        try {
            const job = await jobRepository.findById(jobId, t);
            if (!job) throw new Error(CONSTANTS.ERROR_MESSAGES.RESOURCE_NOT_FOUND);

            // Delete any existing draft applications for this user and job
            const { Application } = require('../models');
            await Application.destroy({
                where: {
                    userId,
                    jobId,
                    status: CONSTANTS.APPLICATION_STATUSES.DRAFT
                },
                transaction: t
            });

            const newApp = await applicationRepository.create({
                userId,
                jobId,
                status: CONSTANTS.APPLICATION_STATUSES.ACTIVE,
                currentStageId: null
            }, t);

            // ── Stage: Application submitted → under-review (spec step 4) ──
            const initialStage = await jobStageRepository.create({
                applicationId: newApp.id,
                name: 'Application',
                status: 'under-review'
            }, t);

            // Set initial stage pointer
            await applicationRepository.update(newApp.id, {
                currentStageId: initialStage.id
            }, t);

            // ── Ticket Copying (Spec Step 2) ──────────────────────────────────
            // All RequiredTickets from the job are copied as applicant ticket gaps.
            // If the user declared they already possess some tickets in ticketsData,
            // those are marked 'possessed'; the rest default to 'not_possessed'.
            const { Ticket, Course, TicketCatalog } = require('../models');
            const { Op } = require('sequelize');

            // Build a Set of possessed ticket names declared by the applicant
            const possessedNames = new Set(
                (ticketsData || []).map((td: any) => (td.ticketType || '').toLowerCase().trim())
            );

            // Collect source: RequiredTickets from the job listing (canonical gaps)
            let catalogTickets: any[] = (job as any).RequiredTickets && Array.isArray((job as any).RequiredTickets)
                ? (job as any).RequiredTickets
                : [];

            // If the M:M relationship is empty, fallback to fetching from the ticketIds JSON array
            if (catalogTickets.length === 0 && Array.isArray(job.ticketIds) && job.ticketIds.length > 0) {
                catalogTickets = await TicketCatalog.findAll({
                    where: { id: { [Op.in]: job.ticketIds } },
                    transaction: t
                });
            }

            // Also include any user-declared possessed tickets not already in the job catalog
            const extraPossessedTickets = (ticketsData || []).filter((td: any) => {
                const name = (td.ticketType || '').toLowerCase().trim();
                return !catalogTickets.some((c: any) => c.name.toLowerCase() === name);
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
                                .filter((w: string) => w.length > 4)
                                .slice(0, 2)
                                .map((w: string) => ({ title: { [Op.like]: `%${w}%` } })))
                        ]
                    },
                    transaction: t
                });

                const isAlreadyPossessed = possessedNames.has(cat.name.toLowerCase().trim());

                const { User } = require('../models');
                const applicant = await User.findByPk(userId, { transaction: t });
                const normalPrice = cat.normalPrice || 0;

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
                    purchasePrice: normalPrice,
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
            await notificationRepository.create({
                userId,
                subject: 'Application Registered',
                message: `Your application for "${job.title}" has been successfully registered. Current Phase: Application Review in Progress.`,
                type: 'SYSTEM',
            }, t);

            // Notify Admin of New Application
            await sendInfoEmail(
                'BlueCollar@gmail.com',
                'Internal Alert: New Application Received',
                `
                <p>A new application has been submitted for a role.</p>
                <div style="background-color: #f8fafc; padding: 25px; border-radius: 12px; border: 1px solid #eef2f6;">
                    <p><strong>Job Title:</strong> ${job.title}</p>
                    <p><strong>Company:</strong> ${job.company}</p>
                    <p><strong>Applicant ID:</strong> ${userId}</p>
                </div>
                `
            ).catch(err => console.error('[ApplicationService] Admin notification failed:', err));

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
                await sendInfoEmail(
                    user.email,
                    applicantSubject,
                    applicantContent
                ).catch(err => console.error('[ApplicationService] Applicant acknowledgment email failed:', err));
            }

            await t.commit();
            return applicationRepository.findById(newApp.id);
        } catch (error) {
            await t.rollback();
            throw error;
        }
    }

    // UPDATED: Support for conditional notification
    public async advanceApplicationStage(applicationId: number, shouldNotify: boolean = true) {
        const t = await sequelize.transaction();
        try {
            const app = await applicationRepository.findById(applicationId, t);
            if (!app) throw new Error(CONSTANTS.ERROR_MESSAGES.RESOURCE_NOT_FOUND);

            const stages = await jobStageRepository.findByApplicationId(applicationId, t);

            let nextStageId: number | null = app.currentStageId;
            let status = CONSTANTS.APPLICATION_STATUSES.ACTIVE;

            if (app.currentStageId) {
                const currentStageIndex = stages.rows.findIndex(s => s.id === app.currentStageId);
                if (currentStageIndex >= 0 && currentStageIndex < stages.rows.length - 1) {
                    nextStageId = stages.rows[currentStageIndex + 1].id;
                }
            }

            await applicationRepository.update(applicationId, {
                currentStageId: nextStageId,
                status,
            }, t);

            const updatedApp = await applicationRepository.findById(applicationId, t);

            // Guard: If we are already at the last stage, do not execute advancement side effects
            if (nextStageId === app.currentStageId) {
                await t.commit();
                return updatedApp;
            }

            if (nextStageId) {
                const nextStage = stages.rows.find(s => s.id === nextStageId);
                // Notify if requested
                if (shouldNotify && nextStage) {
                    await notificationRepository.create({
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
        } catch (e) {
            await t.rollback();
            throw e;
        }
    }

    // UPDATED: Support for immediate advancement, granular notification and payment auto-creation
    public async addStageToApplication(applicationId: number, stageData: any) {
        const t = await sequelize.transaction();
        try {
            const { notifyInApp, notifyEmail, setAsCurrent, ...rest } = stageData;

            const app = await applicationRepository.findById(applicationId, t);
            if (!app) throw new Error(CONSTANTS.ERROR_MESSAGES.RESOURCE_NOT_FOUND);

            const newStage = await jobStageRepository.create({
                ...rest,
                applicationId
            }, t);

            if (setAsCurrent) {
                await applicationRepository.update(applicationId, {
                    currentStageId: newStage.id,
                    status: CONSTANTS.APPLICATION_STATUSES.ACTIVE
                }, t);



                const nSubject = 'Process Activation';
                const nMessage = `A new phase has been activated for your application: "${newStage.name || 'Unnamed Phase'}".`;

                if (notifyInApp) {
                    await notificationRepository.create({
                        userId: app.userId,
                        subject: nSubject,
                        message: nMessage,
                        type: 'SYSTEM'
                    }, t);
                }

                if (notifyEmail) {
                    if (app.User?.email) {
                        await sendInfoEmail(app.User.email, nSubject, `<p>${nMessage}</p>`);
                        console.log(`[ApplicationService] Email dispatch initiated for stage add: ${app.User.email}`);
                    } else {
                        console.log(`[ApplicationService] SKIP Email: User field missing or email empty for app ${applicationId}`);
                    }
                }
            }

            await t.commit();
            return newStage;
        } catch (e) {
            await t.rollback();
            throw e;
        }
    }

    public async getApplicationStage(stageId: number) {
        const stage = await jobStageRepository.findById(stageId);
        if (!stage) throw new Error(CONSTANTS.ERROR_MESSAGES.RESOURCE_NOT_FOUND);
        return stage;
    }

    public async updateApplicationStage(stageId: number, data: any) {
        const { notifyInApp, notifyEmail, setAsCurrent, ...rest } = data;
        const stage = await jobStageRepository.findById(stageId);
        if (!stage) throw new Error(CONSTANTS.ERROR_MESSAGES.RESOURCE_NOT_FOUND);

        const app = await applicationRepository.findById(stage.applicationId);
        if (!app) throw new Error(CONSTANTS.ERROR_MESSAGES.RESOURCE_NOT_FOUND);

        await jobStageRepository.update(stageId, rest);
        const updatedStage = await jobStageRepository.findById(stageId);

        // Handle "set as current" — update the application pointer
        if (setAsCurrent) {
            await applicationRepository.update(stage.applicationId, {
                currentStageId: stageId,
                status: CONSTANTS.APPLICATION_STATUSES.ACTIVE
            });
        }



        const nSubject = setAsCurrent ? 'Process Activation' : 'Phase Update';
        const nMessage = setAsCurrent
            ? `A phase has been activated for your application: "${updatedStage?.name || 'Unnamed Phase'}".`
            : `Details for your current phase "${updatedStage?.name || 'Unnamed Phase'}" have been updated by administration.`;

        if (notifyInApp) {
            await notificationRepository.create({
                userId: app.userId,
                subject: nSubject,
                message: nMessage,
                type: 'SYSTEM'
            });
        }

        if (notifyEmail) {
            if (app.User?.email) {
                await sendInfoEmail(app.User.email, nSubject, `<p>${nMessage}</p>`);
                console.log(`[ApplicationService] Email dispatch initiated for stage update: ${app.User.email}`);
            } else {
                console.log(`[ApplicationService] SKIP Email: User field missing or email empty for app ${app.id}`);
            }
        }

        return updatedStage;
    }

    public async completeApplication(applicationId: number) {
        const app = await applicationRepository.findById(applicationId);
        if (!app) throw new Error(CONSTANTS.ERROR_MESSAGES.RESOURCE_NOT_FOUND);

        await applicationRepository.update(applicationId, {
            status: CONSTANTS.APPLICATION_STATUSES.COMPLETED
        });

        await notificationRepository.create({
            userId: app.userId,
            subject: 'Application Completed',
            message: `Congratulations! Your application for "${app.JobListing?.title}" has successfully completed all phases.`,
            type: 'SYSTEM',
        });

        return applicationRepository.findById(applicationId);
    }

    public async deleteApplicationStage(stageId: number) {
        await jobStageRepository.delete(stageId);
    }

    public async completeApplicationStage(stageId: number) {
        const stage = await jobStageRepository.findById(stageId);
        if (!stage) throw new Error(CONSTANTS.ERROR_MESSAGES.RESOURCE_NOT_FOUND);

        await jobStageRepository.update(stageId, { status: 'completed' });

        const app = await applicationRepository.findById(stage.applicationId);
        if (app) {
            await notificationRepository.create({
                userId: app.userId,
                subject: 'Phase Completed',
                message: `Congratulations, your application phase "${stage.name || 'Unnamed Phase'}" has been marked as complete.`,
                type: 'SYSTEM'
            });
        }
        return jobStageRepository.findById(stageId);
    }

    public async deleteApplication(id: number) {
        await applicationRepository.delete(id);
    }

    public async applyVisaSponsorship(applicationId: number) {
        const app = await applicationRepository.findById(applicationId);
        if (!app) throw new Error(CONSTANTS.ERROR_MESSAGES.RESOURCE_NOT_FOUND);

        await applicationRepository.update(applicationId, {
            visaSponsorshipStatus: 'Pending'
        });
        return applicationRepository.findById(applicationId);
    }

    public async updateVisaSponsorshipStatus(applicationId: number, status: string) {
        const app = await applicationRepository.findById(applicationId);
        if (!app) throw new Error(CONSTANTS.ERROR_MESSAGES.RESOURCE_NOT_FOUND);

        await applicationRepository.update(applicationId, {
            visaSponsorshipStatus: status
        });

        await notificationRepository.create({
            userId: app.userId,
            subject: 'Visa Sponsorship Update',
            message: `Your visa sponsorship request for "${app.JobListing?.title}" has been ${status.toLowerCase()}.`,
            type: 'SYSTEM'
        });

        return applicationRepository.findById(applicationId);
    }

    public async createNominations(applicationId: number, nominations: any[]) {
        const app = await applicationRepository.findById(applicationId);
        if (!app) throw new Error(CONSTANTS.ERROR_MESSAGES.RESOURCE_NOT_FOUND);

        const { Nomination } = require('../models');
        await Nomination.destroy({ where: { applicationId } });

        const created = await Nomination.bulkCreate(
            nominations.map(n => ({ ...n, applicationId, isSelected: false }))
        );
        return created;
    }

    public async getNominations(applicationId: number) {
        const { Nomination } = require('../models');
        return Nomination.findAll({ where: { applicationId } });
    }

    public async selectNominations(applicationId: number, nominationIds: number[]) {
        const { Nomination } = require('../models');
        
        // Deselect all
        await Nomination.update({ isSelected: false }, { where: { applicationId } });
        
        // Select the ones in the array
        if (nominationIds && nominationIds.length > 0) {
            await Nomination.update(
                { isSelected: true }, 
                { where: { id: nominationIds, applicationId } }
            );
        }
        
        return Nomination.findAll({ where: { applicationId } });
    }

    public async saveNominationDocument(applicationId: number, documentUrl: string) {
        const { Nomination } = require('../models');
        
        // Find the selected nominations and save the document there
        const nominations = await Nomination.findAll({ where: { applicationId, isSelected: true } });
        if (nominations && nominations.length > 0) {
            for (const nom of nominations) {
                nom.documentUrl = documentUrl;
                await nom.save();
            }
        } else {
            // Fallback: save to any nomination for this app if none is selected
            const anyNomination = await Nomination.findOne({ where: { applicationId } });
            if (anyNomination) {
                anyNomination.documentUrl = documentUrl;
                await anyNomination.save();
            }
        }
    }

    public async getContracts(applicationId: number) {
        const { Contract } = require('../models');
        return Contract.findAll({ where: { applicationId } });
    }

    public async createContract(applicationId: number, company: string, role: string, adminDocumentUrl?: string) {
        const app = await applicationRepository.findById(applicationId);
        if (!app) throw new Error(CONSTANTS.ERROR_MESSAGES.RESOURCE_NOT_FOUND);

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

    public async updateContractStatus(applicationId: number, contractId: number, status: 'accepted' | 'rejected') {
        const { Contract } = require('../models');
        const contract = await Contract.findOne({ where: { id: contractId, applicationId } });
        if (!contract) throw new Error(CONSTANTS.ERROR_MESSAGES.RESOURCE_NOT_FOUND);

        contract.status = status;
        await contract.save();
        return contract;
    }

    public async saveContractDocument(applicationId: number, contractId: number, documentUrl: string, documentType?: string) {
        const { Contract } = require('../models');
        const contract = await Contract.findOne({ where: { id: contractId, applicationId } });
        if (!contract) throw new Error(CONSTANTS.ERROR_MESSAGES.RESOURCE_NOT_FOUND);

        if (documentType === 'Signed Contract Page 1') {
            contract.documentUrl1 = documentUrl;
        } else if (documentType === 'Signed Contract Page 15') {
            contract.documentUrl15 = documentUrl;
        } else {
            contract.documentUrl = documentUrl;
        }
        
        await contract.save();
        return contract;
    }

    public async updateLatestApplicationStageStatus(userId: number, newStatus: string): Promise<void> {
        // Fetch the user's applications
        const result = await applicationRepository.findByUserId(userId, { limit: 1 });
        if (result.rows.length === 0) return;

        const latestApp = result.rows[0];
        
        // Ensure there is a current stage
        if (latestApp.currentStageId) {
            await jobStageRepository.update(latestApp.currentStageId, {
                status: newStatus
            });
            console.log(`[ApplicationService] Updated stage for application ${latestApp.id} to '${newStatus}'`);
        }
    }
}

export const applicationService = new ApplicationService();
