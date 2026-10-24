"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminService = exports.AdminService = void 0;
const BankAccountRepository_1 = require("../repositories/BankAccountRepository");
const JobCategoryRepository_1 = require("../repositories/JobCategoryRepository");
const UserRepository_1 = require("../repositories/UserRepository");
const NotificationRepository_1 = require("../repositories/NotificationRepository");
const email_1 = require("../utils/email");
const database_1 = require("../config/database");
const constants_1 = require("../constants");
const LmsCredential_1 = require("../models/LmsCredential");
const bcrypt_1 = __importDefault(require("bcrypt"));
class AdminService {
    // ==========================
    // Health Monitoring — STK-ADM-HEALTH-001..003
    // ==========================
    async getSystemHealth() {
        // STK-ADM-HEALTH-001: CPU, Memory, Uptime
        const memUsage = process.memoryUsage();
        let dbStatus = 'Connected';
        let poolInfo = {};
        try {
            await database_1.sequelize.authenticate();
            // STK-ADM-HEALTH-002: DB connection pool status
            poolInfo = {
                max: database_1.sequelize.config?.pool?.max ?? 30,
                idle: database_1.sequelize.config?.pool?.idle ?? 30000,
                acquire: database_1.sequelize.config?.pool?.acquire ?? 10000,
            };
        }
        catch (e) {
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
    async getFinancialConfigurations() {
        const banks = await BankAccountRepository_1.bankAccountRepository.findAll();
        return {
            bankAccounts: banks.rows,
        };
    }
    async getAllBankAccounts() { return BankAccountRepository_1.bankAccountRepository.findAll(); }
    async getBankAccountById(id) {
        const account = await BankAccountRepository_1.bankAccountRepository.findById(id);
        if (!account)
            throw new Error(constants_1.CONSTANTS.ERROR_MESSAGES.RESOURCE_NOT_FOUND);
        return account;
    }
    // STK-ADM-BANK-003: get bank account by amount threshold
    async getBankAccountForAmount(amount) {
        const result = await BankAccountRepository_1.bankAccountRepository.findAll();
        const type = amount >= constants_1.CONSTANTS.SEED_DEFAULTS.HIGH_VALUE_THRESHOLD
            ? constants_1.CONSTANTS.BANK_ACCOUNT_TYPES.NORMAL
            : constants_1.CONSTANTS.BANK_ACCOUNT_TYPES.OPEN_BENEFICIARY;
        return result.rows.filter(a => a.accountType === type);
    }
    // Bank Account CRUD — Single Agent Bank Account Enforced
    async createBankAccount(data) {
        const existing = await BankAccountRepository_1.bankAccountRepository.findAll();
        if (existing.rows && existing.rows.length > 0) {
            const id = existing.rows[0].id;
            await BankAccountRepository_1.bankAccountRepository.update(id, data);
            return BankAccountRepository_1.bankAccountRepository.findById(id);
        }
        return BankAccountRepository_1.bankAccountRepository.create(data);
    }
    async updateBankAccount(id, data) {
        const account = await BankAccountRepository_1.bankAccountRepository.findById(id);
        if (!account)
            throw new Error(constants_1.CONSTANTS.ERROR_MESSAGES.RESOURCE_NOT_FOUND);
        await BankAccountRepository_1.bankAccountRepository.update(id, data);
        return BankAccountRepository_1.bankAccountRepository.findById(id);
    }
    async deleteBankAccount(id) { await BankAccountRepository_1.bankAccountRepository.delete(id); }
    // ==========================
    // Job Configurations
    // ==========================
    async getJobConfigurations() {
        const cats = await JobCategoryRepository_1.jobCategoryRepository.findAll({ limit: 100 });
        return {
            categories: cats.rows,
        };
    }
    async getAllCategories(options = {}) { return JobCategoryRepository_1.jobCategoryRepository.findAll(options); }
    async getCategoryById(id) {
        const category = await JobCategoryRepository_1.jobCategoryRepository.findById(id);
        if (!category)
            throw new Error(constants_1.CONSTANTS.ERROR_MESSAGES.RESOURCE_NOT_FOUND);
        return category;
    }
    // Category CRUD — STK-ADM-CAT-001
    async createCategory(data) { return JobCategoryRepository_1.jobCategoryRepository.create(data); }
    async updateCategory(id, data) {
        const category = await JobCategoryRepository_1.jobCategoryRepository.findById(id);
        if (!category)
            throw new Error(constants_1.CONSTANTS.ERROR_MESSAGES.RESOURCE_NOT_FOUND);
        await JobCategoryRepository_1.jobCategoryRepository.update(id, data);
        return JobCategoryRepository_1.jobCategoryRepository.findById(id);
    }
    async deleteCategory(id) { await JobCategoryRepository_1.jobCategoryRepository.delete(id); }
    // ==========================
    // Admin Communication — STK-ADM-APP-003, STK-ADM-APP-004
    // ==========================
    async sendMailToApplicant(applicantId, subject, message, sendPushNotification = false, email, attachments = [], fromType = 'info') {
        let user;
        let targetEmail = email;
        if (applicantId) {
            user = await UserRepository_1.userRepository.findById(applicantId);
            if (user)
                targetEmail = user.email;
        }
        else if (email) {
            user = await UserRepository_1.userRepository.findByEmail(email);
        }
        // Allow sending even if user is not in DB if we have a target email
        if (!user && !targetEmail)
            throw new Error(constants_1.CONSTANTS.ERROR_MESSAGES.RESOURCE_NOT_FOUND);
        // Send email — STK-ADM-APP-003 (Always send if we have an email)
        if (targetEmail) {
            const formattedMessage = /<[a-z][\s\S]*>/i.test(message) ? message : `<p>${message}</p>`;
            await (0, email_1.sendEmailFrom)(fromType, targetEmail, subject, formattedMessage, attachments);
        }
        // Optionally create push notification — ONLY if a user record exists
        if (sendPushNotification && user) {
            const isHtml = /<[a-z][\s\S]*>/i.test(message);
            const cleanNotificationMsg = isHtml ? message.replace(/<[^>]*>/g, '') : message;
            await NotificationRepository_1.notificationRepository.create({
                userId: user.id,
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
    async getApplicantById(id) {
        const user = await UserRepository_1.userRepository.findById(id);
        if (!user || user.role !== constants_1.CONSTANTS.ROLES.APPLICANT) {
            throw new Error(constants_1.CONSTANTS.ERROR_MESSAGES.RESOURCE_NOT_FOUND);
        }
        const { Ticket } = require('../models');
        const tickets = await Ticket.findAll({ where: { userId: id } });
        const userJson = user.toJSON();
        return { ...userJson, Tickets: tickets };
    }
    async getAllApplicants(limit, offset) {
        return UserRepository_1.userRepository.findAndCountAll({ role: constants_1.CONSTANTS.ROLES.APPLICANT, limit, offset });
    }
    async deleteApplicant(id) {
        const user = await UserRepository_1.userRepository.findById(id);
        if (!user || user.role !== constants_1.CONSTANTS.ROLES.APPLICANT) {
            throw new Error(constants_1.CONSTANTS.ERROR_MESSAGES.RESOURCE_NOT_FOUND);
        }
        await UserRepository_1.userRepository.delete(id);
    }
    async sendWelcomeMail(userId) {
        const user = await UserRepository_1.userRepository.findById(userId);
        if (!user)
            throw new Error(constants_1.CONSTANTS.ERROR_MESSAGES.RESOURCE_NOT_FOUND);
        await (0, email_1.sendWelcomeApplicationFoundEmail)(user.email, user.fullName);
        return { success: true };
    }
    async sendEOIMail(userId) {
        const user = await UserRepository_1.userRepository.findById(userId);
        if (!user)
            throw new Error(constants_1.CONSTANTS.ERROR_MESSAGES.RESOURCE_NOT_FOUND);
        await (0, email_1.sendEOIReceivedEmail)(user.email, user.fullName);
        return { success: true };
    }
    async updateApplicantWallet(id, walletBalance) {
        const user = await UserRepository_1.userRepository.findById(id);
        if (!user || user.role !== constants_1.CONSTANTS.ROLES.APPLICANT) {
            throw new Error(constants_1.CONSTANTS.ERROR_MESSAGES.RESOURCE_NOT_FOUND);
        }
        const oldBalance = user.walletBalance || 0;
        await user.update({ walletBalance });
        // Maintain robust audit trail for offline-to-online wallet balance updates
        await NotificationRepository_1.notificationRepository.create({
            userId: id,
            subject: 'Refund Wallet Updated',
            message: `Your refund wallet balance was adjusted from $${oldBalance} to $${walletBalance}.`,
            type: 'SYSTEM',
            isRead: false
        });
        return { success: true, walletBalance: user.walletBalance };
    }
    async updateRtoCredentials(id, rtoUsername, rtoPassword, sendEmail = true) {
        const user = await UserRepository_1.userRepository.findById(id);
        if (!user || user.role !== constants_1.CONSTANTS.ROLES.APPLICANT) {
            throw new Error(constants_1.CONSTANTS.ERROR_MESSAGES.RESOURCE_NOT_FOUND);
        }
        const updateData = {};
        const usernameVal = rtoUsername ? rtoUsername.trim() : null;
        const passwordVal = rtoPassword ? rtoPassword.trim() : null;
        if (rtoUsername !== undefined) {
            updateData.rtoUsername = usernameVal;
            updateData.avelingUsername = usernameVal;
        }
        if (rtoPassword !== undefined) {
            updateData.rtoPassword = passwordVal;
            updateData.avelingPassword = passwordVal;
        }
        await user.update(updateData);
        // Also sync LmsCredential if provided
        const finalUsername = updateData.rtoUsername || user.rtoUsername || user.avelingUsername || `CERTHERO-${user.id}`;
        if (updateData.rtoUsername || updateData.rtoPassword) {
            const existingCred = await LmsCredential_1.LmsCredential.findOne({ where: { userId: String(id) } });
            const passwordHash = updateData.rtoPassword ? await bcrypt_1.default.hash(updateData.rtoPassword, 10) : (existingCred?.passwordHash || '');
            if (existingCred) {
                await existingCred.update({
                    lmsUsername: finalUsername,
                    ...(updateData.rtoPassword ? { passwordHash } : {})
                });
            }
            else if (passwordHash) {
                await LmsCredential_1.LmsCredential.create({
                    userId: String(id),
                    lmsUsername: finalUsername,
                    passwordHash,
                    isActive: true
                });
            }
        }
        let emailDispatched = false;
        const credUser = updateData.rtoUsername || user.rtoUsername || user.avelingUsername;
        const credPass = updateData.rtoPassword || user.rtoPassword || user.avelingPassword;
        if (sendEmail && user.email && credUser) {
            const { sendRtoCredentialsEmail } = require('../utils/email');
            try {
                await sendRtoCredentialsEmail(user.email, user.fullName, credUser, credPass || undefined);
                emailDispatched = true;
            }
            catch (err) {
                console.error('[AdminService.updateRtoCredentials] Failed to dispatch RTO email:', err);
            }
        }
        return {
            success: true,
            rtoUsername: credUser,
            rtoPassword: credPass,
            avelingUsername: credUser,
            avelingPassword: credPass,
            emailDispatched
        };
    }
    async updateAvelingCredentials(id, avelingUsername, avelingPassword, sendEmail = true) {
        return this.updateRtoCredentials(id, avelingUsername, avelingPassword, sendEmail);
    }
}
exports.AdminService = AdminService;
exports.adminService = new AdminService();
