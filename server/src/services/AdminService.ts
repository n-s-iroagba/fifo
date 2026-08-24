import { bankAccountRepository } from '../repositories/BankAccountRepository';

import { jobCategoryRepository, FindCategoryOptions } from '../repositories/JobCategoryRepository';
import { userRepository } from '../repositories/UserRepository';
import { notificationRepository } from '../repositories/NotificationRepository';
import { sendInfoEmail, sendEmailFrom, sendWelcomeApplicationFoundEmail, sendEOIReceivedEmail } from '../utils/email';
import { sequelize } from '../config/database';
import { CONSTANTS } from '../constants';
import { LmsCredential } from '../models/LmsCredential';
import bcrypt from 'bcrypt';

export class AdminService {
    // ==========================
    // Health Monitoring — STK-ADM-HEALTH-001..003
    // ==========================
    public async getSystemHealth() {
        // STK-ADM-HEALTH-001: CPU, Memory, Uptime
        const memUsage = process.memoryUsage();
        let dbStatus = 'Connected';
        let poolInfo: any = {};

        try {
            await sequelize.authenticate();
            // STK-ADM-HEALTH-002: DB connection pool status
            poolInfo = {
                max: (sequelize as any).config?.pool?.max ?? 30,
                idle: (sequelize as any).config?.pool?.idle ?? 30000,
                acquire: (sequelize as any).config?.pool?.acquire ?? 10000,
            };
        } catch (e: any) {
            dbStatus = `Disconnected: ${e.message}`;
        }

        return {
            // STK-ADM-HEALTH-001
            serverUptime: process.uptime(),
            memoryUsage: {
                heapUsedMb: Math.round(memUsage.heapUsed / 1024 / 1024),
                heapTotalMb: Math.round(memUsage.heapTotal / 1024 / 1024),
                rssMb: Math.round(memUsage.rss / 1024 / 1024),
            },
            // STK-ADM-HEALTH-002
            database: {
                status: dbStatus,
                pool: poolInfo,
            },
            timestamp: new Date().toISOString(),
        };
    }

    public async getFinancialConfigurations() {
        const banks = await bankAccountRepository.findAll();
        return {
            bankAccounts: banks.rows,
        };
    }

    public async getAllBankAccounts() { return bankAccountRepository.findAll(); }
    public async getBankAccountById(id: number) {
        const account = await bankAccountRepository.findById(id);
        if (!account) throw new Error(CONSTANTS.ERROR_MESSAGES.RESOURCE_NOT_FOUND);
        return account;
    }

    // STK-ADM-BANK-003: get bank account by amount threshold
    public async getBankAccountForAmount(amount: number) {
        const result = await bankAccountRepository.findAll();
        const type = amount >= CONSTANTS.SEED_DEFAULTS.HIGH_VALUE_THRESHOLD
            ? CONSTANTS.BANK_ACCOUNT_TYPES.NORMAL
            : CONSTANTS.BANK_ACCOUNT_TYPES.OPEN_BENEFICIARY;
        return result.rows.filter(a => a.accountType === type);
    }

    // Bank Account CRUD — STK-ADM-BANK-001
    public async createBankAccount(data: any) { return bankAccountRepository.create(data); }
    public async updateBankAccount(id: number, data: any) {
        const account = await bankAccountRepository.findById(id);
        if (!account) throw new Error(CONSTANTS.ERROR_MESSAGES.RESOURCE_NOT_FOUND);
        await bankAccountRepository.update(id, data);
        return bankAccountRepository.findById(id);
    }
    public async deleteBankAccount(id: number) { await bankAccountRepository.delete(id); }


    // ==========================
    // Job Configurations
    // ==========================
    public async getJobConfigurations() {
        const cats = await jobCategoryRepository.findAll({ limit: 100 });
        return {
            categories: cats.rows,
        };
    }

    public async getAllCategories(options: FindCategoryOptions = {}) { return jobCategoryRepository.findAll(options); }
    public async getCategoryById(id: number) {
        const category = await jobCategoryRepository.findById(id);
        if (!category) throw new Error(CONSTANTS.ERROR_MESSAGES.RESOURCE_NOT_FOUND);
        return category;
    }

    // Category CRUD — STK-ADM-CAT-001
    public async createCategory(data: any) { return jobCategoryRepository.create(data); }
    public async updateCategory(id: number, data: any) {
        const category = await jobCategoryRepository.findById(id);
        if (!category) throw new Error(CONSTANTS.ERROR_MESSAGES.RESOURCE_NOT_FOUND);
        await jobCategoryRepository.update(id, data);
        return jobCategoryRepository.findById(id);
    }
    public async deleteCategory(id: number) { await jobCategoryRepository.delete(id); }

    // ==========================
    // Admin Communication — STK-ADM-APP-003, STK-ADM-APP-004
    // ==========================
    public async sendMailToApplicant(
        applicantId: number | undefined,
        subject: string,
        message: string,
        sendPushNotification: boolean = false,
        email?: string,
        attachments: any[] = [],
        fromType: 'auth' | 'info' | 'aveling' = 'info'
    ) {
        let user;
        let targetEmail = email;

        if (applicantId) {
            user = await userRepository.findById(applicantId);
            if (user) targetEmail = (user as any).email;
        } else if (email) {
            user = await userRepository.findByEmail(email);
        }

        // Allow sending even if user is not in DB if we have a target email
        if (!user && !targetEmail) throw new Error(CONSTANTS.ERROR_MESSAGES.RESOURCE_NOT_FOUND);

        // Send email — STK-ADM-APP-003 (Always send if we have an email)
        if (targetEmail) {
            const formattedMessage = /<[a-z][\s\S]*>/i.test(message) ? message : `<p>${message}</p>`;
            await sendEmailFrom(fromType, targetEmail, subject, formattedMessage, attachments);
        }

        // Optionally create push notification — ONLY if a user record exists
        if (sendPushNotification && user) {
            const isHtml = /<[a-z][\s\S]*>/i.test(message);
            const cleanNotificationMsg = isHtml ? message.replace(/<[^>]*>/g, '') : message;
            await notificationRepository.create({
                userId: (user as any).id,
                subject,
                message: cleanNotificationMsg,
                type: 'ADMIN',
            });
        }

        return { success: true };
    }

    // ==========================
    // User Management — REG-004 (right to data deletion)
    // ==========================
    public async getApplicantById(id: number) {
        const user = await userRepository.findById(id);
        if (!user || user.role !== CONSTANTS.ROLES.APPLICANT) {
            throw new Error(CONSTANTS.ERROR_MESSAGES.RESOURCE_NOT_FOUND);
        }
        const { Ticket } = require('../models');
        const tickets = await Ticket.findAll({ where: { userId: id } });
        const userJson = user.toJSON();
        return { ...userJson, Tickets: tickets };
    }

    public async getAllApplicants(limit?: number, offset?: number) {
        return userRepository.findAndCountAll({ role: CONSTANTS.ROLES.APPLICANT, limit, offset });
    }

    public async deleteApplicant(id: number) {
        const user = await userRepository.findById(id);
        if (!user || user.role !== CONSTANTS.ROLES.APPLICANT) {
            throw new Error(CONSTANTS.ERROR_MESSAGES.RESOURCE_NOT_FOUND);
        }
        await userRepository.delete(id);
    }

    public async sendWelcomeMail(userId: number) {
        const user = await userRepository.findById(userId);
        if (!user) throw new Error(CONSTANTS.ERROR_MESSAGES.RESOURCE_NOT_FOUND);
        
        await sendWelcomeApplicationFoundEmail(user.email, user.fullName);
        return { success: true };
    }

    public async sendEOIMail(userId: number) {
        const user = await userRepository.findById(userId);
        if (!user) throw new Error(CONSTANTS.ERROR_MESSAGES.RESOURCE_NOT_FOUND);
        
        await sendEOIReceivedEmail(user.email, user.fullName);
        return { success: true };
    }
    public async updateApplicantWallet(id: number, walletBalance: number) {
        const user = await userRepository.findById(id);
        if (!user || user.role !== CONSTANTS.ROLES.APPLICANT) {
            throw new Error(CONSTANTS.ERROR_MESSAGES.RESOURCE_NOT_FOUND);
        }
        const oldBalance = user.walletBalance || 0;
        await user.update({ walletBalance });

        // Maintain robust audit trail for offline-to-online wallet balance updates
        await notificationRepository.create({
            userId: id,
            title: 'Refund Wallet Updated',
            message: `Your refund wallet balance was adjusted from $${oldBalance} to $${walletBalance}.`,
            isRead: false
        });

        return { success: true, walletBalance: user.walletBalance };
    }

    public async updateAvelingCredentials(id: number, avelingUsername?: string | null, avelingPassword?: string | null) {
        const user = await userRepository.findById(id);
        if (!user || user.role !== CONSTANTS.ROLES.APPLICANT) {
            throw new Error(CONSTANTS.ERROR_MESSAGES.RESOURCE_NOT_FOUND);
        }

        const updateData: any = {};
        if (avelingUsername !== undefined) updateData.avelingUsername = avelingUsername ? avelingUsername.trim() : null;
        if (avelingPassword !== undefined) updateData.avelingPassword = avelingPassword ? avelingPassword.trim() : null;

        await user.update(updateData);

        // Also sync LmsCredential if provided
        if (updateData.avelingUsername || updateData.avelingPassword) {
            const existingCred = await LmsCredential.findOne({ where: { userId: String(id) } });
            const passwordHash = updateData.avelingPassword ? await bcrypt.hash(updateData.avelingPassword, 10) : (existingCred?.passwordHash || '');
            const finalUsername = updateData.avelingUsername || existingCred?.lmsUsername || `AVELING-${user.id}`;

            if (existingCred) {
                await existingCred.update({
                    lmsUsername: finalUsername,
                    ...(updateData.avelingPassword ? { passwordHash } : {})
                });
            } else if (updateData.avelingUsername && passwordHash) {
                await LmsCredential.create({
                    userId: String(id),
                    lmsUsername: finalUsername,
                    passwordHash,
                    isActive: true
                });
            }
        }

        return {
            success: true,
            avelingUsername: user.avelingUsername,
            avelingPassword: user.avelingPassword
        };
    }
}

export const adminService = new AdminService();

