"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminService = exports.AdminService = void 0;
const BankAccountRepository_1 = require("../repositories/BankAccountRepository");
const JobCategoryRepository_1 = require("../repositories/JobCategoryRepository");
const JobConditionRepository_1 = require("../repositories/JobConditionRepository");
const JobBenefitRepository_1 = require("../repositories/JobBenefitRepository");
const UserRepository_1 = require("../repositories/UserRepository");
const NotificationRepository_1 = require("../repositories/NotificationRepository");
const email_1 = require("../utils/email");
const database_1 = require("../config/database");
const constants_1 = require("../constants");
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
    // Bank Account CRUD — STK-ADM-BANK-001
    async createBankAccount(data) { return BankAccountRepository_1.bankAccountRepository.create(data); }
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
        const conds = await JobConditionRepository_1.jobConditionRepository.findAll({ limit: 100 });
        const bens = await JobBenefitRepository_1.jobBenefitRepository.findAll({ limit: 100 });
        return {
            categories: cats.rows,
            conditions: conds.rows,
            benefits: bens.rows,
        };
    }
    async getAllCategories(options = {}) { return JobCategoryRepository_1.jobCategoryRepository.findAll(options); }
    async getCategoryById(id) {
        const category = await JobCategoryRepository_1.jobCategoryRepository.findById(id);
        if (!category)
            throw new Error(constants_1.CONSTANTS.ERROR_MESSAGES.RESOURCE_NOT_FOUND);
        return category;
    }
    async getAllConditions(options = {}) { return JobConditionRepository_1.jobConditionRepository.findAll(options); }
    async getConditionById(id) {
        const condition = await JobConditionRepository_1.jobConditionRepository.findById(id);
        if (!condition)
            throw new Error(constants_1.CONSTANTS.ERROR_MESSAGES.RESOURCE_NOT_FOUND);
        return condition;
    }
    async getAllBenefits(options = {}) { return JobBenefitRepository_1.jobBenefitRepository.findAll(options); }
    async getBenefitById(id) {
        const benefit = await JobBenefitRepository_1.jobBenefitRepository.findById(id);
        if (!benefit)
            throw new Error(constants_1.CONSTANTS.ERROR_MESSAGES.RESOURCE_NOT_FOUND);
        return benefit;
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
    // Condition CRUD — STK-ADM-COND-001
    async createCondition(data) { return JobConditionRepository_1.jobConditionRepository.create(data); }
    async updateCondition(id, data) {
        const condition = await JobConditionRepository_1.jobConditionRepository.findById(id);
        if (!condition)
            throw new Error(constants_1.CONSTANTS.ERROR_MESSAGES.RESOURCE_NOT_FOUND);
        await JobConditionRepository_1.jobConditionRepository.update(id, data);
        return JobConditionRepository_1.jobConditionRepository.findById(id);
    }
    async deleteCondition(id) { await JobConditionRepository_1.jobConditionRepository.delete(id); }
    // Benefit CRUD — STK-ADM-BEN-001
    async createBenefit(data) { return JobBenefitRepository_1.jobBenefitRepository.create(data); }
    async updateBenefit(id, data) {
        const benefit = await JobBenefitRepository_1.jobBenefitRepository.findById(id);
        if (!benefit)
            throw new Error(constants_1.CONSTANTS.ERROR_MESSAGES.RESOURCE_NOT_FOUND);
        await JobBenefitRepository_1.jobBenefitRepository.update(id, data);
        return JobBenefitRepository_1.jobBenefitRepository.findById(id);
    }
    async deleteBenefit(id) { await JobBenefitRepository_1.jobBenefitRepository.delete(id); }
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
        return user;
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
        await (0, email_1.sendWelcomeEmail)(user.email, user.fullName);
        return { success: true };
    }
    async sendEOIMail(userId) {
        const user = await UserRepository_1.userRepository.findById(userId);
        if (!user)
            throw new Error(constants_1.CONSTANTS.ERROR_MESSAGES.RESOURCE_NOT_FOUND);
        await (0, email_1.sendEOIEmail)(user.email);
        return { success: true };
    }
}
exports.AdminService = AdminService;
exports.adminService = new AdminService();
