import { Ticket, User, Application } from '../models';
import { notificationService } from './NotificationService';
import { sendAvelingEmail } from '../utils/email';

export class TicketService {
    public async getUserTickets(userId: number) {
        return await Ticket.findAll({
            where: { userId },
            include: [{ model: Application, as: 'Application' }],
            order: [['createdAt', 'DESC']]
        });
    }

    public async getTicketById(ticketId: number, userId?: number) {
        const whereClause: any = { id: ticketId };
        if (userId) whereClause.userId = userId;

        const ticket = await Ticket.findOne({
            where: whereClause,
            include: [{ model: User }, { model: Application, as: 'Application' }]
        });

        if (!ticket) throw new Error('TICKET_NOT_FOUND');
        return ticket;
    }

    public async createTicket(userId: number, data: any) {
        const ticket = await Ticket.create({
            userId,
            applicationId: data.applicationId || null,
            status: data.status || 'not_possessed',
            ticketNumber: data.ticketNumber || null,
            ticketType: data.ticketType,
            description: data.description || '',
            purchasePrice: data.purchasePrice || 0,
            purchaseDate: data.purchaseDate || null,
            expiryDate: data.expiryDate || null,
            proof: data.proof || null,
            proofThumbnail: data.proofThumbnail || null,
            courseId: data.courseId || null,
            ticketSponsorship: data.applySponsorship ? 'applied' : 'no_application'
        });

        if (data.applySponsorship) {
            await notificationService.sendNotification(
                userId,
                'Ticket Sponsorship Application Submitted',
                `Your sponsorship application for ${ticket.ticketType} has been submitted for admin review.`
            );
        }

        return ticket;
    }

    public async updateTicket(ticketId: number, userId: number, data: any) {
        const ticket = await this.getTicketById(ticketId, userId);

        await ticket.update({
            status: data.status !== undefined ? data.status : ticket.status,
            ticketNumber: data.ticketNumber !== undefined ? data.ticketNumber : ticket.ticketNumber,
            ticketType: data.ticketType !== undefined ? data.ticketType : ticket.ticketType,
            description: data.description !== undefined ? data.description : ticket.description,
            purchasePrice: data.purchasePrice !== undefined ? data.purchasePrice : ticket.purchasePrice,
            purchaseDate: data.purchaseDate !== undefined ? data.purchaseDate : ticket.purchaseDate,
            expiryDate: data.expiryDate !== undefined ? data.expiryDate : ticket.expiryDate,
            proof: data.proof !== undefined ? data.proof : ticket.proof,
            proofThumbnail: data.proofThumbnail !== undefined ? data.proofThumbnail : ticket.proofThumbnail,
            courseId: data.courseId !== undefined ? data.courseId : ticket.courseId,
        });

        return ticket;
    }

    public async applySponsorship(ticketId: number, userId: number, bankDetails: { bankName: string; accountNumber: string; accountName: string }) {
        const ticket = await this.getTicketById(ticketId, userId);

        await ticket.update({
            ticketSponsorship: 'applied',
        });

        const user = await User.findByPk(userId);
        if (user) {
            await user.update({
                bankName: bankDetails.bankName,
                accountNumber: bankDetails.accountNumber,
                accountName: bankDetails.accountName,
            });
        }

        await notificationService.sendNotification(
            userId,
            'Sponsorship Application Received',
            `Your sponsorship request for ${ticket.ticketType} is now being processed by administration.`
        );

        return ticket;
    }

    public async requestRetake(ticketId: number, userId: number) {
        const ticket = await this.getTicketById(ticketId, userId);

        if (ticket.ticketSponsorship !== 'first_attempt_failed') {
            throw new Error('Only tickets with a failed first attempt can request a retake.');
        }

        const threeDaysFromNow = new Date();
        threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

        await ticket.update({
            ticketSponsorship: 'second_attempt_approved',
            sponsorshipDeadline: threeDaysFromNow,
            paymentStatus: 'unpaid',
            courseAccessGranted: false
        });

        await notificationService.sendNotification(
            userId,
            'Retake Approved',
            `Your retake for ${ticket.ticketType} has been approved. Please complete the payment on Aveling LMS to unlock your second attempt.`
        );

        return ticket;
    }

    public async adminGetAllTickets(filters?: { sponsorshipStatus?: string; search?: string }) {
        const whereClause: any = {};
        if (filters?.sponsorshipStatus) {
            whereClause.ticketSponsorship = filters.sponsorshipStatus;
        }

        return await Ticket.findAll({
            where: whereClause,
            include: [{ model: User }, { model: Application, as: 'Application' }],
            order: [['updatedAt', 'DESC']]
        });
    }

    public async adminUpdateTicket(ticketId: number, data: any, includeMail: boolean = false) {
        const ticket = await Ticket.findByPk(ticketId, {
            include: [{ model: User }]
        });

        if (!ticket) throw new Error('TICKET_NOT_FOUND');

        const oldStatus = ticket.ticketSponsorship;
        const newStatus = data.ticketSponsorship || ticket.ticketSponsorship;

        let sponsorshipDeadline = ticket.sponsorshipDeadline;
        // If sponsorship approved, set deadline to 3 days after approval
        if (
            (newStatus === 'first_attempt_approved' || newStatus === 'second_attempt_approved') &&
            oldStatus !== newStatus
        ) {
            const threeDaysFromNow = new Date();
            threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
            sponsorshipDeadline = threeDaysFromNow;
        } else if (data.sponsorshipDeadline) {
            sponsorshipDeadline = new Date(data.sponsorshipDeadline);
        }

        await ticket.update({
            status: data.status !== undefined ? data.status : ticket.status,
            ticketNumber: data.ticketNumber !== undefined ? data.ticketNumber : ticket.ticketNumber,
            ticketType: data.ticketType !== undefined ? data.ticketType : ticket.ticketType,
            description: data.description !== undefined ? data.description : ticket.description,
            purchasePrice: data.purchasePrice !== undefined ? data.purchasePrice : ticket.purchasePrice,
            realPrice: data.realPrice !== undefined ? data.realPrice : ticket.realPrice,
            subsidisedPrice: data.subsidisedPrice !== undefined ? data.subsidisedPrice : ticket.subsidisedPrice,
            canApplySponsorship: data.canApplySponsorship !== undefined ? data.canApplySponsorship : ticket.canApplySponsorship,
            purchaseDate: data.purchaseDate !== undefined ? data.purchaseDate : ticket.purchaseDate,
            expiryDate: data.expiryDate !== undefined ? data.expiryDate : ticket.expiryDate,
            proof: data.proof !== undefined ? data.proof : ticket.proof,
            proofThumbnail: data.proofThumbnail !== undefined ? data.proofThumbnail : ticket.proofThumbnail,
            ticketSponsorship: newStatus,
            ticketSponsorshipRefundAmount: data.ticketSponsorshipRefundAmount !== undefined ? data.ticketSponsorshipRefundAmount : ticket.ticketSponsorshipRefundAmount,
            sponsorshipDeadline,
            courseId: data.courseId !== undefined ? data.courseId : ticket.courseId,
        });

        // Always create in-app notification
        const user = (ticket as any).User;
        const message = `Your ticket (${ticket.ticketType}) status has been updated to: ${ticket.ticketSponsorship.replace(/_/g, ' ').toUpperCase()}.`;

        if (user?.id) {
            await notificationService.sendNotification(
                user.id,
                `Ticket Sponsorship Status Update: ${ticket.ticketType}`,
                message
            );
        }

        // Send Email if includeMail is requested (1.4.4) or approval triggered
        if (includeMail || (newStatus === 'first_attempt_approved' || newStatus === 'second_attempt_approved')) {
            await this.sendTicketEmailNotification(ticket, user, newStatus);
        }

        return ticket;
    }

    public async processRefundChoice(ticketId: number, userId: number, action: 'use_for_another_ticket' | 'refund_to_bank') {
        const ticket = await this.getTicketById(ticketId, userId);

        if (ticket.ticketSponsorship !== 'ticket_issued') {
            throw new Error('TICKET_NOT_ISSUED_FOR_REFUND');
        }

        if (action === 'use_for_another_ticket') {
            await ticket.update({ refundStatus: 'refunded_to_wallet' });
            await notificationService.sendNotification(
                userId,
                'Refund Applied to Next Sponsorship',
                `Your refund amount of $${ticket.ticketSponsorshipRefundAmount || ticket.purchasePrice} has been credited for your next ticket sponsorship course.`
            );
        } else if (action === 'refund_to_bank') {
            await ticket.update({ refundStatus: 'refunded_to_bank' });
            const user = await User.findByPk(userId);
            await notificationService.sendNotification(
                userId,
                'Bank Refund Requested',
                `Your refund of $${ticket.ticketSponsorshipRefundAmount || ticket.purchasePrice} has been queued for payout to your registered bank account (${user?.bankName || 'N/A'} - ${user?.accountNumber || 'N/A'}).`
            );
        }

        return ticket;
    }

    public async payTicketOnAveling(ticketId: number, userId: number) {
        const ticket = await this.getTicketById(ticketId, userId);

        const avelingCourseUrl = `http://localhost:3002/courses/${ticket.courseId || 'ticket-course'}`;
        const user = (ticket as any).User;

        await notificationService.sendNotification(
            userId,
            'Ticket Payment Successful',
            `Payment for ${ticket.ticketType} course completed successfully. You can now access your training on Aveling LMS.`
        );

        if (user?.email) {
            await this.sendCustomEmail(
                user.email,
                `Aveling LMS: Access your ${ticket.ticketType} Course`,
                `<p>Hello ${user.fullName || 'Learner'},</p>
                 <p>Your payment for <strong>${ticket.ticketType}</strong> was successful!</p>
                 <p>Click the link below to access your course on Aveling LMS:</p>
                 <p><a href="${avelingCourseUrl}" style="background:#1e3a8a;color:#ffffff;padding:10px 20px;text-decoration:none;border-radius:6px;display:inline-block;">Go to Course on Aveling LMS</a></p>`
            );
        }

        return {
            success: true,
            avelingCourseUrl,
            ticket
        };
    }

    public async recordExamOutcome(ticketId: number, passed: boolean, attemptNumber: number = 1, score?: number) {
        const ticket = await Ticket.findByPk(ticketId, { include: [{ model: User }] });
        if (!ticket) throw new Error('TICKET_NOT_FOUND');

        const user = (ticket as any).User;
        const clientTicketUrl = `http://localhost:3000/dashboard/tickets/${ticket.id}`;

        if (passed) {
            const refundMultiplier = attemptNumber >= 2 ? 2 : 1;
            const refundAmount = (ticket.purchasePrice || 100) * refundMultiplier;

            await ticket.update({
                ticketSponsorship: 'ticket_issued',
                status: 'possessed',
                ticketSponsorshipRefundAmount: refundAmount,
            });

            if (user?.id) {
                // Update User wallet balance upon completion
                const currentWallet = user.walletBalance || 0;
                await user.update({ walletBalance: currentWallet + refundAmount });

                // Update Enrollment status to Completed if courseId is present
                if (ticket.courseId) {
                    const { Enrollment } = require('../models');
                    await Enrollment.update(
                        { status: 'Completed' },
                        { where: { userId: user.id, courseId: ticket.courseId } }
                    );
                }

                await notificationService.sendNotification(
                    user.id,
                    'Congratulations! Ticket Issued & Refund Credited',
                    `You passed your exam for ${ticket.ticketType}! Your ticket has been issued and your refund of $${refundAmount} has been credited to your wallet.`
                );
            }

            const candidateNum = user?.candidateNumber || `CND-${10000 + (user?.id || 1)}`;

            if (user?.email) {
                await this.sendCustomEmail(
                    user.email,
                    `Official Exam Results & Digital Ticket: ${ticket.ticketType} (Candidate #${candidateNum})`,
                    `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
                        <div style="background:#111827;padding:20px 24px;border-radius:8px 8px 0 0;text-align:center;">
                            <h2 style="color:#FFC700;margin:0;font-size:20px;">ASSESSMENT PASSED ✓</h2>
                        </div>
                        <div style="padding:24px;background:#fff;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px;">
                            <p>Congratulations <strong>${user.fullName || 'Learner'}</strong> (Candidate #${candidateNum})!</p>
                            <p>You have successfully passed the theory assessment for <strong>${ticket.ticketType}</strong>.</p>
                            
                            <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin:16px 0;">
                                <h3 style="margin:0 0 12px;font-size:14px;text-transform:uppercase;letter-spacing:0.05em;color:#166534;">Your Exam Results</h3>
                                <p style="margin:4px 0;font-size:24px;font-weight:bold;color:#15803d;">Score: ${score !== undefined ? score : 'Passed'}%</p>
                                <p style="margin:4px 0;"><strong>Status:</strong> PASS</p>
                                <p style="margin:4px 0;"><strong>Attempt:</strong> #${attemptNumber}</p>
                            </div>

                            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin:16px 0;">
                                <h3 style="margin:0 0 12px;font-size:14px;text-transform:uppercase;letter-spacing:0.05em;color:#334155;">Ticket Status & Sponsorship Refund</h3>
                                <p style="margin:4px 0;">Your digital <strong>Statement of Attainment (Ticket)</strong> has been officially issued and synced to your recruiter placement portal.</p>
                                <p style="margin:12px 0 4px;font-weight:bold;color:#1f2937;">Eligible Sponsorship Refund Amount Credited to Wallet: <span style="color:#16a34a;">$${refundAmount.toFixed(2)} AUD</span></p>
                            </div>

                            <p style="font-size:13px;color:#6b7280;">You can view and download your digital ticket or request a bank payout of your refund from your applicant dashboard.</p>
                            
                            <div style="margin-top:24px;text-align:center;">
                                <a href="${clientTicketUrl}" style="background:#0b3486;color:#ffffff;padding:12px 24px;text-decoration:none;border-radius:6px;display:inline-block;font-weight:bold;font-size:14px;">View Digital Ticket & Wallet</a>
                            </div>
                        </div>
                    </div>`
                );
            }
        } else {
            const failedStatus = attemptNumber === 1 ? 'first_attempt_failed' : 'second_attempt_failed';
            await ticket.update({
                ticketSponsorship: failedStatus,
            });

            if (user?.id) {
                await notificationService.sendNotification(
                    user.id,
                    'Exam Attempt Result',
                    `Exam attempt ${attemptNumber} for ${ticket.ticketType} was not successful.`
                );
            }

            if (user?.email) {
                await this.sendCustomEmail(
                    user.email,
                    `Exam Result Update: ${ticket.ticketType}`,
                    `<p>Hello ${user.fullName || 'Learner'},</p>
                     <p>Your exam attempt #${attemptNumber} for <strong>${ticket.ticketType}</strong> was not successful.</p>
                     <p><a href="${clientTicketUrl}">View Ticket Status & Options</a></p>`
                );
            }
        }

        return {
            ticket,
            clientTicketUrl
        };
    }

    public async bulkSeedTickets(ticketsData: any[]) {
        const createdTickets = [];
        for (const item of ticketsData) {
            const ticket = await Ticket.create({
                userId: item.userId,
                ticketType: item.ticketType,
                description: item.description || `Admin assigned ${item.ticketType}`,
                purchasePrice: item.purchasePrice || 150,
                status: item.status || 'not_possessed',
                ticketSponsorship: item.ticketSponsorship || 'first_attempt_approved',
                courseId: item.courseId || null,
            });
            createdTickets.push(ticket);
        }
        return createdTickets;
    }

    public async adminDeleteTicket(ticketId: number) {
        const ticket = await Ticket.findByPk(ticketId);
        if (!ticket) throw new Error('TICKET_NOT_FOUND');
        await ticket.destroy();
    }

    public async adminAddApplicationTicket(applicationId: number, data: any) {
        const application = await Application.findByPk(applicationId);
        if (!application) throw new Error('APPLICATION_NOT_FOUND');

        const { TicketCatalog, Course } = require('../models');

        let ticketType = data.ticketType;
        let description = data.description || null;
        let realPrice = data.realPrice ?? null;
        let subsidisedPrice = data.subsidisedPrice ?? null;
        let courseId = data.courseId || null;

        // If cloning from a catalog template
        if (data.catalogId) {
            const catalog = await TicketCatalog.findByPk(data.catalogId);
            if (catalog) {
                ticketType = ticketType || catalog.name;
                description = description || catalog.description;
                if (realPrice === null) realPrice = catalog.normalPrice;
                if (subsidisedPrice === null) subsidisedPrice = catalog.sponsorshipPrice;
            }
        }

        // Auto-link matching course if courseId is not set
        if (!courseId && ticketType) {
            const allCourses = await Course.findAll();
            const lowerType = ticketType.toLowerCase();
            const matched = allCourses.find((c: any) => {
                const cTitle = (c.title || '').toLowerCase();
                const cCode = (c.code || '').toLowerCase();
                return (
                    (cCode && lowerType.includes(cCode)) ||
                    (cTitle && lowerType.includes(cTitle)) ||
                    (cTitle && cTitle.split(' ').some((word: string) => word.length > 3 && lowerType.includes(word)))
                );
            });
            if (matched) {
                courseId = matched.id;
            }
        }

        const ticket = await Ticket.create({
            userId: application.userId,
            applicationId: applicationId,
            ticketType: ticketType || 'Certification Ticket Requirement',
            status: 'not_possessed',
            ticketSponsorship: 'no_application',
            description: description,
            realPrice: realPrice,
            subsidisedPrice: subsidisedPrice,
            purchasePrice: subsidisedPrice ?? realPrice ?? 0,
            canApplySponsorship: data.canApplySponsorship ?? true,
            courseId: courseId,
        });

        return ticket;
    }

    public async cloneTicketForApplicant(data: {
        targetUserId: number;
        sourceTicketId?: number;
        sourceCatalogId?: number;
        applicationId?: number;
        ticketType?: string;
        description?: string;
        customPurchasePrice?: number;
        customRealPrice?: number;
        customSubsidisedPrice?: number;
        customCourseId?: string;
        canApplySponsorship?: boolean;
    }) {
        const { User, TicketCatalog, Course } = require('../models');
        const user = await User.findByPk(data.targetUserId);
        if (!user) throw new Error('USER_NOT_FOUND');

        let baseTicketType = data.ticketType || 'Work Safely at Heights (RIIWHS204E)';
        let baseDescription = data.description || 'Assigned certification ticket course';
        let defaultRealPrice = 280;
        let defaultSubsidisedPrice = 140;
        let defaultCourseId = data.customCourseId || null;

        if (data.sourceTicketId) {
            const sourceTicket = await Ticket.findByPk(data.sourceTicketId);
            if (sourceTicket) {
                baseTicketType = sourceTicket.ticketType;
                baseDescription = sourceTicket.description || baseDescription;
                defaultRealPrice = sourceTicket.realPrice ?? sourceTicket.purchasePrice ?? 280;
                defaultSubsidisedPrice = sourceTicket.subsidisedPrice ?? (defaultRealPrice / 2);
                defaultCourseId = defaultCourseId || sourceTicket.courseId;
            }
        } else if (data.sourceCatalogId) {
            const catalog = await TicketCatalog.findByPk(data.sourceCatalogId);
            if (catalog) {
                baseTicketType = catalog.name;
                baseDescription = catalog.description || baseDescription;
                defaultRealPrice = catalog.normalPrice || 280;
                defaultSubsidisedPrice = catalog.sponsorshipPrice || (defaultRealPrice / 2);
            }
        }

        if (!defaultCourseId) {
            const matchingCourse = await Course.findOne({
                where: {
                    [require('sequelize').Op.or]: [
                        { code: 'RIIWHS204E' },
                        { title: { [require('sequelize').Op.like]: `%${baseTicketType}%` } }
                    ]
                }
            });
            if (matchingCourse) {
                defaultCourseId = matchingCourse.id;
            }
        }

        const realPrice = data.customRealPrice ?? defaultRealPrice;
        const subsidisedPrice = data.customSubsidisedPrice ?? defaultSubsidisedPrice;
        const purchasePrice = data.customPurchasePrice ?? subsidisedPrice;

        const clonedTicket = await Ticket.create({
            userId: data.targetUserId,
            applicationId: data.applicationId || null,
            ticketType: baseTicketType,
            description: baseDescription,
            status: 'not_possessed',
            ticketSponsorship: 'applied',
            canApplySponsorship: data.canApplySponsorship ?? true,
            realPrice: realPrice,
            subsidisedPrice: subsidisedPrice,
            purchasePrice: purchasePrice,
            courseId: defaultCourseId,
            paymentStatus: 'unpaid',
            courseAccessGranted: false
        });

        return clonedTicket;
    }

    public async sendCheckoutPaymentEmail(ticketId: number) {
        const ticket = await Ticket.findByPk(ticketId, { include: [{ model: User }] });
        if (!ticket) throw new Error('TICKET_NOT_FOUND');
        const user = (ticket as any).User;

        if (!user) return { success: false, message: 'User not found' };

        // Ensure candidate number exists
        if (!user.candidateNumber) {
            const candidateNum = `CND-${10000 + user.id}`;
            await user.update({ candidateNumber: candidateNum });
        }

        const candidateNum = user.candidateNumber;
        const checkoutUrl = `http://localhost:3002/checkout?ticketId=${ticket.id}&candidateNumber=${candidateNum}`;

        const { BankAccount } = require('../models');
        const bank = await BankAccount.findOne({ where: { isActive: true } });
        const bankName = bank?.bankName || 'Commonwealth Bank Australia';
        const accountNumber = bank?.accountNumber || '062-000 12345678';
        const accountName = bank?.bankName ? 'FIFO Training Operations' : 'Aveling Training PTY LTD';

        const subject = `Payment Details & Instructions for ${ticket.ticketType} (Candidate #${candidateNum})`;
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; padding: 24px;">
                <h2 style="color: #1e3a8a; margin-top: 0;">Sponsored Course Payment Instructions</h2>
                <p>Hello <strong>${user.fullName}</strong>,</p>
                <p>Your candidate registration number is: <strong style="font-size: 16px; color: #d97706;">${candidateNum}</strong></p>
                <p>Here are the payment details for your sponsored ticket course <strong>${ticket.ticketType}</strong>:</p>
                
                <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; padding: 16px; margin: 20px 0;">
                    <p style="margin: 4px 0;"><strong>Bank Name:</strong> ${bankName}</p>
                    <p style="margin: 4px 0;"><strong>Account Name:</strong> ${accountName}</p>
                    <p style="margin: 4px 0;"><strong>Account Number / BSB:</strong> ${accountNumber}</p>
                    <p style="margin: 4px 0;"><strong>Payment Reference:</strong> ${candidateNum}-${ticket.id}</p>
                    <p style="margin: 4px 0;"><strong>Amount Due:</strong> $${ticket.purchasePrice || 150}</p>
                </div>

                <p>Please complete your payment and click the button below to upload your payment receipt proof:</p>
                <p><a href="${checkoutUrl}" style="background:#1e3a8a;color:#ffffff;padding:12px 24px;text-decoration:none;border-radius:6px;display:inline-block;font-weight:bold;">Go to Checkout & Upload Receipt</a></p>
            </div>
        `;

        await this.sendCustomEmail(user.email, subject, html);
        return { success: true, candidateNum, checkoutUrl };
    }

    private async sendTicketEmailNotification(ticket: any, user: any, sponsorshipStatus: string) {
        if (!user?.email) return;

        const avelingPayUrl = `http://localhost:3002/checkout?ticketId=${ticket.id}&courseId=${ticket.courseId || ''}`;
        const subject = `Ticket Sponsorship Update: ${ticket.ticketType}`;

        let body = `<p>Hello ${user.fullName || 'Applicant'},</p>
                    <p>Your sponsorship for <strong>${ticket.ticketType}</strong> has been updated to <strong>${sponsorshipStatus.replace(/_/g, ' ').toUpperCase()}</strong>.</p>`;

        if (sponsorshipStatus === 'first_attempt_approved' || sponsorshipStatus === 'second_attempt_approved') {
            body += `<p>Please proceed to pay and start your course on Aveling LMS before the deadline (${ticket.sponsorshipDeadline ? new Date(ticket.sponsorshipDeadline).toLocaleDateString() : '3 days'}).</p>
                     <p><a href="${avelingPayUrl}" style="background:#1e3a8a;color:#ffffff;padding:10px 20px;text-decoration:none;border-radius:6px;display:inline-block;">Proceed to Aveling LMS Payment</a></p>`;
        }

        await this.sendCustomEmail(user.email, subject, body);
    }

    private async sendCustomEmail(to: string, subject: string, htmlContent: string) {
        try {
            await sendAvelingEmail(to, subject, htmlContent);
        } catch (e: any) {
            // Non-fatal: log and continue — email failure must not break the ticket flow
            console.warn(`[TicketService] Email to ${to} failed (non-fatal):`, e?.message || e);
        }
    }
    // STEP-1.1.11: Admin approves payment receipt → sets Enrollment to active/paid, notifies learner
    public async adminApproveTicketReceipt(ticketId: number) {
        const ticket = await Ticket.findByPk(ticketId, { include: [{ model: User }] });
        if (!ticket) throw new Error('TICKET_NOT_FOUND');

        const user = (ticket as any).User;

        // Mark the ticket as receipt-verified (unlock course)
        await ticket.update({
            paymentStatus: 'payment_verified',
            courseAccessGranted: true
        });

        // Set the enrollment for this course as active/paid if valid course exists
        if (ticket.courseId && user?.id) {
            const { Enrollment, Course } = require('../models');
            const validCourse = await Course.findByPk(ticket.courseId);
            if (validCourse) {
                const existingEnrollment = await Enrollment.findOne({
                    where: { userId: user.id, courseId: ticket.courseId }
                });
                if (existingEnrollment) {
                    await existingEnrollment.update({ paymentStatus: 'Paid', status: 'Active' });
                } else {
                    await Enrollment.create({
                        userId: user.id,
                        courseId: ticket.courseId,
                        paymentStatus: 'Paid',
                        status: 'Active',
                        amountPaid: ticket.purchasePrice ?? 0
                    });
                }
            } else {
                console.warn(`[TicketService] Ticket #${ticket.id} references non-existent courseId ${ticket.courseId}. Skipping Enrollment creation.`);
            }
        }

        // Notify learner that course is unlocked
        if (user?.id) {
            await notificationService.sendNotification(
                user.id,
                'Course Unlocked!',
                `Your payment receipt for ${ticket.ticketType} has been verified by our team. Your course modules are now available to access.`
            );
        }

        if (user?.email && ticket.courseId) {
            const courseUrl = `http://localhost:3002/courses/${ticket.courseId}`;
            await this.sendCustomEmail(
                user.email,
                `Course Access Unlocked: ${ticket.ticketType}`,
                `<p>Hello ${user.fullName || 'Learner'},</p>
                 <p>Your payment receipt has been verified by our admin team. Your course is now unlocked!</p>
                 <p><a href="${courseUrl}" style="background:#FFC700;color:#000;padding:12px 24px;text-decoration:none;border-radius:6px;display:inline-block;font-weight:bold;">Start Your Course Now</a></p>`
            );
        }

        return ticket;
    }

    // STEP-1.1.20: Set review-awaiting status on exam submission (before grading)
    public async setExamReviewAwaiting(ticketId: number, userId: number) {
        const ticket = await Ticket.findByPk(ticketId);
        if (!ticket) throw new Error('TICKET_NOT_FOUND');

        if (ticket.courseId) {
            const { Enrollment } = require('../models');
            await Enrollment.update(
                { status: 'Review-Awaiting' },
                { where: { userId, courseId: ticket.courseId } }
            );
        }

        return { success: true };
    }

    public async getExamAttemptsForTicket(ticketId: number) {
        const ticket = await Ticket.findByPk(ticketId);
        if (!ticket) throw new Error('TICKET_NOT_FOUND');

        if (!ticket.courseId || !ticket.userId) {
            return [];
        }

        const { ExamAttempt } = require('../models');
        const attempts = await ExamAttempt.findAll({
            where: {
                userId: ticket.userId,
                courseId: ticket.courseId
            },
            order: [['createdAt', 'DESC']]
        });
        
        return attempts;
    }

    // Generate Aveling login credentials for an approved-sponsorship candidate
    public async generateAvelingCredentials(ticketId: number) {
        const ticket = await Ticket.findByPk(ticketId, { include: [{ model: User }] });
        if (!ticket) throw new Error('TICKET_NOT_FOUND');

        const user = (ticket as any).User as User;
        if (!user) throw new Error('USER_NOT_FOUND');

        // Check sponsorship is approved
        if (!['first_attempt_approved', 'second_attempt_approved'].includes(ticket.ticketSponsorship)) {
            throw new Error('TICKET_NOT_APPROVED');
        }

        // Generate simple credentials if not already set
        const username = user.avelingUsername || `${user.candidateNumber || `AV${user.id}`}`.toLowerCase();
        const rawPassword = user.avelingPassword || Math.random().toString(36).slice(2, 10).toUpperCase();

        await user.update({ avelingUsername: username, avelingPassword: rawPassword });

        // Fetch platform bank details
        const { PlatformSetting } = require('../models');
        const bankSettings: any = {};
        const settings = await PlatformSetting.findAll({
            where: { key: ['platform_bank_name', 'platform_bank_bsb', 'platform_bank_account_number', 'platform_bank_account_name'] }
        });
        for (const s of settings) {
            bankSettings[s.key] = s.value;
        }

        const courseFee = ticket.subsidisedPrice ?? ticket.purchasePrice ?? 0;
        const realPrice = ticket.realPrice ?? null;

        // Send credentials + payment instructions email
        if (user.email) {
            await this.sendCustomEmail(
                user.email,
                `Your Aveling LMS Login & Payment Instructions – ${ticket.ticketType}`,
                `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
                    <div style="background:#111827;padding:20px 24px;border-radius:8px 8px 0 0;">
                        <h2 style="color:#FFC700;margin:0;font-size:20px;">Aveling LMS — Ticket Sponsorship</h2>
                    </div>
                    <div style="padding:24px;background:#fff;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px;">
                        <p>Hello <strong>${user.fullName}</strong>,</p>
                        <p>Your sponsorship application for <strong>${ticket.ticketType}</strong> has been <span style="color:#16a34a;font-weight:bold;">APPROVED</span>.</p>

                        <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin:16px 0;">
                            <h3 style="margin:0 0 12px;font-size:14px;text-transform:uppercase;letter-spacing:0.05em;color:#6b7280;">Your Aveling LMS Login</h3>
                            <p style="margin:4px 0;"><strong>Login URL:</strong> <a href="${process.env.AVELING_URL || 'http://localhost:3002'}">${process.env.AVELING_URL || 'http://localhost:3002'}</a></p>
                            <p style="margin:4px 0;"><strong>Username:</strong> <code style="background:#f3f4f6;padding:2px 6px;border-radius:4px;">${username}</code></p>
                            <p style="margin:4px 0;"><strong>Password:</strong> <code style="background:#f3f4f6;padding:2px 6px;border-radius:4px;">${rawPassword}</code></p>
                        </div>

                        <div style="background:#fffbeb;border:1px solid #fcd34d;border-radius:8px;padding:16px;margin:16px 0;">
                            <h3 style="margin:0 0 12px;font-size:14px;text-transform:uppercase;letter-spacing:0.05em;color:#92400e;">Course Fee & Payment</h3>
                            ${realPrice && realPrice > courseFee ? `<p style="margin:4px 0;color:#6b7280;"><del>Full price: $${realPrice.toFixed(2)}</del></p>` : ''}
                            <p style="margin:4px 0;font-size:18px;font-weight:bold;color:#1f2937;">Your Price: $${courseFee.toFixed(2)} AUD ${realPrice && realPrice > courseFee ? '<span style="color:#16a34a;font-size:12px;">(Subsidised)</span>' : ''}</p>
                            <p style="margin:8px 0 4px;color:#6b7280;font-size:13px;">This amount is <strong>fully refundable</strong> upon passing your exam.</p>
                        </div>

                        ${bankSettings.platform_bank_name ? `
                        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin:16px 0;">
                            <h3 style="margin:0 0 12px;font-size:14px;text-transform:uppercase;letter-spacing:0.05em;color:#166534;">Payment Bank Details</h3>
                            <p style="margin:4px 0;"><strong>Bank:</strong> ${bankSettings.platform_bank_name}</p>
                            ${bankSettings.platform_bank_bsb ? `<p style="margin:4px 0;"><strong>BSB:</strong> ${bankSettings.platform_bank_bsb}</p>` : ''}
                            <p style="margin:4px 0;"><strong>Account Number:</strong> ${bankSettings.platform_bank_account_number}</p>
                            <p style="margin:4px 0;"><strong>Account Name:</strong> ${bankSettings.platform_bank_account_name}</p>
                        </div>` : ''}

                        <p style="font-size:13px;color:#6b7280;">After making payment, log into Aveling and upload your transfer receipt. Course materials will unlock once admin verifies your payment.</p>
                    </div>
                </div>`
            );
        }

        return { username, password: rawPassword, credentialsGenerated: true };
    }

    // Candidate submits payment receipt (or pays via wallet)
    public async submitReceipt(ticketId: number, userId?: number, data?: { receiptReference?: string; receiptUrl?: string; useWallet?: boolean; userId?: number }) {
        const effectiveUserId = userId || data?.userId;
        const whereClause: any = { id: ticketId };
        if (effectiveUserId) {
            whereClause.userId = effectiveUserId;
        }
        const ticket = await Ticket.findOne({ where: whereClause, include: [{ model: User }] });
        if (!ticket) throw new Error('TICKET_NOT_FOUND');
        const user = (ticket as any).User as User;
        if (!user) throw new Error('USER_NOT_FOUND');

        let coursePrice = ticket.subsidisedPrice ?? ticket.purchasePrice ?? 0;
        let isFullyCovered = false;

        if (data?.useWallet && user.walletBalance && user.walletBalance > 0) {
            if (user.walletBalance >= coursePrice) {
                // Wallet fully covers the price
                await user.update({ walletBalance: user.walletBalance - coursePrice });
                isFullyCovered = true;
            } else {
                // Wallet partially covers the price
                coursePrice = coursePrice - user.walletBalance; // Remaining balance to pay via bank
                await user.update({ walletBalance: 0 });
            }
        }

        if (isFullyCovered) {
            // Auto-verify payment
            await ticket.update({
                paymentStatus: 'payment_verified',
                courseAccessGranted: true,
                receiptReference: 'WALLET_PAYMENT',
            });

            // Unlock course enrollment if valid course exists
            if (ticket.courseId && user?.id) {
                const { Enrollment, Course } = require('../models');
                const validCourse = await Course.findByPk(ticket.courseId);
                if (validCourse) {
                    const existingEnrollment = await Enrollment.findOne({
                        where: { userId: user.id, courseId: ticket.courseId }
                    });
                    if (existingEnrollment) {
                        await existingEnrollment.update({ paymentStatus: 'Paid', status: 'Active' });
                    } else {
                        await Enrollment.create({
                            userId: user.id,
                            courseId: ticket.courseId,
                            paymentStatus: 'Paid',
                            status: 'Active',
                            amountPaid: ticket.subsidisedPrice ?? ticket.purchasePrice ?? 0
                        });
                    }
                } else {
                    console.warn(`[TicketService] Ticket #${ticket.id} references non-existent courseId ${ticket.courseId}. Skipping Enrollment creation.`);
                }
            }

            await notificationService.sendNotification(
                user.id,
                'Payment Verified via Wallet',
                `Your payment for ${ticket.ticketType} was fully covered by your wallet balance. Course unlocked!`
            );
        } else {
            // Standard bank receipt submission
            await ticket.update({
                paymentStatus: 'receipt_submitted',
                receiptReference: data?.receiptReference || null,
                receiptUrl: data?.receiptUrl || null,
            });

            // Notify admins
            const { User: UserModel } = require('../models');
            const admins = await UserModel.findAll({ where: { role: 'admin' } });
            for (const admin of admins) {
                await notificationService.sendNotification(
                    admin.id,
                    'Payment Receipt Submitted',
                    `Candidate submitted a receipt for ${ticket.ticketType} (Ticket #${ticket.id}). Please verify.`
                );
            }
        }

        return ticket;
    }

    // Admin validates payment and unlocks course access
    public async adminValidatePayment(ticketId: number) {
        const ticket = await Ticket.findByPk(ticketId, { include: [{ model: User }] });
        if (!ticket) throw new Error('TICKET_NOT_FOUND');

        const user = (ticket as any).User as User;

        await ticket.update({
            paymentStatus: 'payment_verified',
            courseAccessGranted: true,
        });

        if (user?.id) {
            await notificationService.sendNotification(
                user.id,
                'Payment Verified – Course Unlocked!',
                `Your payment for ${ticket.ticketType} has been verified. Log into Aveling LMS to start your course and exam.`
            );
        }

        if (user?.email && ticket.courseId) {
            const courseUrl = `${process.env.AVELING_URL || 'http://localhost:3002'}/courses/${ticket.courseId}`;
            await this.sendCustomEmail(
                user.email,
                `Payment Verified – Start Your Course Now: ${ticket.ticketType}`,
                `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
                    <div style="background:#111827;padding:20px 24px;border-radius:8px 8px 0 0;">
                        <h2 style="color:#FFC700;margin:0;">Payment Verified ✓</h2>
                    </div>
                    <div style="padding:24px;background:#fff;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px;">
                        <p>Hello <strong>${user.fullName}</strong>,</p>
                        <p>Your payment for <strong>${ticket.ticketType}</strong> has been verified by our admin team.</p>
                        <p>Your course materials and exam are now accessible on Aveling LMS.</p>
                        <p><a href="${courseUrl}" style="background:#FFC700;color:#000;padding:12px 24px;text-decoration:none;border-radius:6px;display:inline-block;font-weight:bold;">Start Your Course Now →</a></p>
                        <p style="font-size:12px;color:#6b7280;margin-top:16px;">Remember: exam results undergo a proper grading review process. Results will be communicated to you once grading is complete.</p>
                    </div>
                </div>`
            );
        }

        return ticket;
    }

    // Admin marks exam result (subject to approval - candidate sees "grading in progress")
    public async adminApproveExamResult(ticketId: number, passed: boolean) {
        return this.recordExamOutcome(ticketId, passed);
    }

    // Platform bank account management
    public async getPlatformBankAccount() {
        const { PlatformSetting } = require('../models');
        const keys = ['platform_bank_name', 'platform_bank_bsb', 'platform_bank_account_number', 'platform_bank_account_name'];
        const settings = await PlatformSetting.findAll({ where: { key: keys } });
        const result: any = {};
        for (const s of settings) result[s.key] = s.value;
        return {
            bankName: result.platform_bank_name || null,
            bsb: result.platform_bank_bsb || null,
            accountNumber: result.platform_bank_account_number || null,
            accountName: result.platform_bank_account_name || null,
        };
    }

    public async updatePlatformBankAccount(data: { bankName?: string; bsb?: string; accountNumber?: string; accountName?: string }) {
        const { PlatformSetting } = require('../models');
        const entries: Record<string, string | undefined> = {
            platform_bank_name: data.bankName,
            platform_bank_bsb: data.bsb,
            platform_bank_account_number: data.accountNumber,
            platform_bank_account_name: data.accountName,
        };
        for (const [key, value] of Object.entries(entries)) {
            if (value !== undefined) {
                await PlatformSetting.upsert({ key, value });
            }
        }
    }
}

export const ticketService = new TicketService();
