"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminController = exports.AdminController = void 0;
const AdminService_1 = require("../services/AdminService");
const constants_1 = require("../constants");
class AdminController {
    // Maps to STK-ADM-HEALTH-001..003 — extended health metrics
    async getHealth(req, res) {
        try {
            const health = await AdminService_1.adminService.getSystemHealth();
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json(health);
        }
        catch (error) {
            console.error('[AdminController.getHealth]', error);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: constants_1.CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }
    // ==========================
    // Financial Configurations — STK-ADM-BANK-001..004, STK-ADM-CRYPTO-001..003
    // ==========================
    async getFinancialConfigs(req, res) {
        try {
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json(await AdminService_1.adminService.getFinancialConfigurations());
        }
        catch (error) {
            console.error('[AdminController.getFinancialConfigs]', error);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: constants_1.CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }
    async getAllBankAccounts(req, res) {
        try {
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json(await AdminService_1.adminService.getAllBankAccounts());
        }
        catch (error) {
            console.error('[AdminController.getAllBankAccounts]', error);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: constants_1.CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }
    async getBankAccountById(req, res) {
        try {
            const id = parseInt(req.params.id, 10);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json(await AdminService_1.adminService.getBankAccountById(id));
        }
        catch (error) {
            console.error('[AdminController.getBankAccountById]', error);
            const status = error.message === constants_1.CONSTANTS.ERROR_MESSAGES.RESOURCE_NOT_FOUND ? constants_1.CONSTANTS.HTTP_STATUS.NOT_FOUND : constants_1.CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR;
            res.status(status).json({ error: error.message });
        }
    }
    // STK-ADM-BANK-003: get bank accounts filtered by payment amount
    async getBankAccountsForAmount(req, res) {
        try {
            const amount = parseFloat(req.query.amount);
            const accounts = await AdminService_1.adminService.getBankAccountForAmount(amount);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json(accounts);
        }
        catch (error) {
            console.error('[AdminController.getBankAccountsForAmount]', error);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: constants_1.CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }
    // Bank Account CRUD — STK-ADM-BANK-001
    async createBankAccount(req, res) {
        try {
            res.status(constants_1.CONSTANTS.HTTP_STATUS.CREATED).json(await AdminService_1.adminService.createBankAccount(req.body));
        }
        catch (error) {
            console.error('[AdminController.createBankAccount]', error);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: constants_1.CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }
    async updateBankAccount(req, res) {
        try {
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json(await AdminService_1.adminService.updateBankAccount(parseInt(req.params.id, 10), req.body));
        }
        catch (error) {
            console.error('[AdminController.updateBankAccount]', error);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: constants_1.CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }
    async deleteBankAccount(req, res) {
        try {
            await AdminService_1.adminService.deleteBankAccount(parseInt(req.params.id, 10));
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json({ message: constants_1.CONSTANTS.SUCCESS_MESSAGES.DELETED });
        }
        catch (error) {
            console.error('[AdminController.deleteBankAccount]', error);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: constants_1.CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }
    // ==========================
    // Job Configurations — STK-ADM-CAT-001, STK-ADM-BEN-001, STK-ADM-COND-001
    // ==========================
    async getJobConfigs(req, res) {
        try {
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json(await AdminService_1.adminService.getJobConfigurations());
        }
        catch (error) {
            console.error('[AdminController.getJobConfigs]', error);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: constants_1.CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }
    async getAllCategories(req, res) {
        try {
            const limit = req.query.limit ? parseInt(req.query.limit, 10) : 20;
            const offset = req.query.offset ? parseInt(req.query.offset, 10) : 0;
            const searchQuery = req.query.searchQuery;
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json(await AdminService_1.adminService.getAllCategories({ limit, offset, searchQuery }));
        }
        catch (error) {
            console.error('[AdminController.getAllCategories]', error);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: constants_1.CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }
    async getCategoryById(req, res) {
        try {
            const id = parseInt(req.params.id, 10);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json(await AdminService_1.adminService.getCategoryById(id));
        }
        catch (error) {
            console.error('[AdminController.getCategoryById]', error);
            const status = error.message === constants_1.CONSTANTS.ERROR_MESSAGES.RESOURCE_NOT_FOUND ? constants_1.CONSTANTS.HTTP_STATUS.NOT_FOUND : constants_1.CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR;
            res.status(status).json({ error: error.message });
        }
    }
    // Categories — STK-ADM-CAT-001
    async createCategory(req, res) {
        try {
            res.status(constants_1.CONSTANTS.HTTP_STATUS.CREATED).json(await AdminService_1.adminService.createCategory(req.body));
        }
        catch (error) {
            console.error('[AdminController.createCategory]', error);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: constants_1.CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }
    async updateCategory(req, res) {
        try {
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json(await AdminService_1.adminService.updateCategory(parseInt(req.params.id, 10), req.body));
        }
        catch (error) {
            console.error('[AdminController.updateCategory]', error);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: constants_1.CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }
    async deleteCategory(req, res) {
        try {
            await AdminService_1.adminService.deleteCategory(parseInt(req.params.id, 10));
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json({ message: constants_1.CONSTANTS.SUCCESS_MESSAGES.DELETED });
        }
        catch (error) {
            console.error('[AdminController.deleteCategory]', error);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: constants_1.CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }
    // ==========================
    // Admin Communication — STK-ADM-APP-003, STK-ADM-APP-004
    // ==========================
    async sendMailToApplicant(req, res) {
        try {
            const { applicantId, subject, message, sendPushNotification, email, fromType } = req.body;
            // Map multer files to Nodemailer attachments with explicit contentType for delivery success
            const rawFiles = req.files;
            console.log(`[AdminController.sendMailToApplicant] Received files: ${rawFiles?.length || 0}`);
            const attachments = rawFiles?.map(file => ({
                filename: file.originalname,
                content: file.buffer,
                contentType: file.mimetype
            })) || [];
            const result = await AdminService_1.adminService.sendMailToApplicant(applicantId ? parseInt(applicantId, 10) : undefined, subject, message, sendPushNotification === 'true' || sendPushNotification === true, email, attachments, fromType || 'info');
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json(result);
        }
        catch (error) {
            console.error('[AdminController.sendMailToApplicant]', error);
            if (error.message === constants_1.CONSTANTS.ERROR_MESSAGES.RESOURCE_NOT_FOUND) {
                res.status(constants_1.CONSTANTS.HTTP_STATUS.NOT_FOUND).json({ error: error.message });
                return;
            }
            res.status(constants_1.CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: constants_1.CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }
    async getApplicantById(req, res) {
        try {
            const id = parseInt(req.params.id, 10);
            const user = await AdminService_1.adminService.getApplicantById(id);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json({
                user: {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                    fullName: user.fullName,
                    phoneNumber: user.phoneNumber,
                    dateOfBirth: user.dateOfBirth,
                    gender: user.gender,
                    nationality: user.nationality,
                    address: user.address,
                    city: user.city,
                    state: user.state,
                    country: user.country,
                    zipCode: user.zipCode,
                    cvUrl: user.cvUrl,
                    walletBalance: user.walletBalance,
                    avelingUsername: user.avelingUsername,
                    avelingPassword: user.avelingPassword,
                    subsidyPercentage: user.subsidyPercentage,
                    Tickets: user.Tickets
                }
            });
        }
        catch (error) {
            console.error('[AdminController.getApplicantById]', error);
            const status = error.message === constants_1.CONSTANTS.ERROR_MESSAGES.RESOURCE_NOT_FOUND ? constants_1.CONSTANTS.HTTP_STATUS.NOT_FOUND : constants_1.CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR;
            res.status(status).json({ error: error.message });
        }
    }
    // ==========================
    // User Views — REG-004
    // ==========================
    async getAllApplicants(req, res) {
        try {
            const limit = req.query.limit ? parseInt(req.query.limit, 10) : 20;
            const offset = req.query.offset ? parseInt(req.query.offset, 10) : 0;
            const users = await AdminService_1.adminService.getAllApplicants(limit, offset);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json(users);
        }
        catch (error) {
            console.error('[AdminController.getAllApplicants]', error);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: constants_1.CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }
    async deleteApplicant(req, res) {
        try {
            const id = parseInt(req.params.id, 10);
            await AdminService_1.adminService.deleteApplicant(id);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json({ message: constants_1.CONSTANTS.SUCCESS_MESSAGES.DELETED });
        }
        catch (error) {
            console.error('[AdminController.deleteApplicant]', error);
            const status = error.message === constants_1.CONSTANTS.ERROR_MESSAGES.RESOURCE_NOT_FOUND ? constants_1.CONSTANTS.HTTP_STATUS.NOT_FOUND : constants_1.CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR;
            res.status(status).json({ error: error.message });
        }
    }
    async sendWelcomeMail(req, res) {
        try {
            const id = parseInt(req.params.id, 10);
            const result = await AdminService_1.adminService.sendWelcomeMail(id);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json(result);
        }
        catch (error) {
            console.error('[AdminController.sendWelcomeMail]', error);
            const status = error.message === constants_1.CONSTANTS.ERROR_MESSAGES.RESOURCE_NOT_FOUND ? constants_1.CONSTANTS.HTTP_STATUS.NOT_FOUND : constants_1.CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR;
            res.status(status).json({ error: error.message });
        }
    }
    async dispatchInvoiceEmail(req, res) {
        try {
            const { applicantId, invoiceType, partAmount, totalCost, subsidyPercentage, finalAmountDue, email, walletAddress } = req.body;
            const { sendInvoiceEmail } = require('../utils/email');
            const { User, Invoice } = require('../models');
            const user = await User.findByPk(applicantId);
            if (!user) {
                res.status(404).json({ success: false, message: 'Applicant not found' });
                return;
            }
            const rawFiles = req.files;
            const attachments = rawFiles?.map((file) => ({
                filename: file.originalname,
                content: file.buffer,
                contentType: file.mimetype
            })) || [];
            const parsedFinalAmount = parseFloat(finalAmountDue || '0');
            const parsedPartAmount = parseFloat(partAmount || '0');
            const parsedTotalCost = parseFloat(totalCost || '0');
            const parsedSubsidy = parseFloat(subsidyPercentage || String(user.subsidyPercentage || 0));
            await sendInvoiceEmail(email || user.email, user.fullName, invoiceType, parsedPartAmount, parsedTotalCost, parsedSubsidy, parsedFinalAmount, attachments, walletAddress || undefined);
            // Persist the invoice record
            await Invoice.create({
                applicantId: user.id,
                purpose: invoiceType,
                amountInUSD: parsedFinalAmount,
                walletAddress: walletAddress || null,
            });
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json({ success: true, message: 'Invoice email dispatched successfully' });
        }
        catch (error) {
            console.error('[AdminController.dispatchInvoiceEmail]', error);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: error.message || constants_1.CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }
    async getAllInvoices(req, res) {
        try {
            const { Invoice, User } = require('../models');
            const invoices = await Invoice.findAll({
                include: [{ model: User, as: 'applicant', attributes: ['id', 'fullName', 'email', 'candidateNumber'] }],
                order: [['createdAt', 'DESC']]
            });
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json(invoices);
        }
        catch (error) {
            console.error('[AdminController.getAllInvoices]', error);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: constants_1.CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }
    async generateInvoiceReceipt(req, res) {
        try {
            const { Invoice, User } = require('../models');
            const { sendReceiptEmail } = require('../utils/email');
            const id = parseInt(req.params.id, 10);
            const invoice = await Invoice.findByPk(id, {
                include: [{ model: User, as: 'applicant' }]
            });
            if (!invoice) {
                res.status(404).json({ success: false, message: 'Invoice not found' });
                return;
            }
            invoice.isPaid = true;
            invoice.receiptProofSubmission = new Date();
            await invoice.save();
            const receiptType = invoice.purpose === 'visa-blue-collar' ? 'blue-collar' : 'aveling';
            const rawFiles = req.files;
            const attachments = rawFiles?.map((file) => ({
                filename: file.originalname,
                content: file.buffer,
                contentType: file.mimetype
            })) || [];
            if (invoice.applicant && invoice.applicant.email) {
                await sendReceiptEmail(invoice.applicant.email, invoice.applicant.fullName, receiptType, parseFloat(invoice.amountInUSD || '0'), invoice.id, attachments, invoice.walletAddress || undefined);
            }
            if (invoice.purpose && invoice.purpose.startsWith('aveling')) {
                const { ticketService } = require('../services/TicketService');
                await ticketService.processAvelingInvoicePayment(invoice.applicantId, invoice.purpose);
            }
            const senderLabel = receiptType === 'blue-collar' ? 'BlueCollar Infrastructure' : 'Aveling LMS Training';
            res.status(200).json({
                success: true,
                message: `Receipt generated, marked as paid, and dispatched via ${senderLabel}.`,
                invoice
            });
        }
        catch (error) {
            console.error('[AdminController.generateInvoiceReceipt]', error);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: constants_1.CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }
    async sendEOIMail(req, res) {
        try {
            const id = parseInt(req.params.id, 10);
            const result = await AdminService_1.adminService.sendEOIMail(id);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json(result);
        }
        catch (error) {
            console.error('[AdminController.sendEOIMail]', error);
            const status = error.message === constants_1.CONSTANTS.ERROR_MESSAGES.RESOURCE_NOT_FOUND ? constants_1.CONSTANTS.HTTP_STATUS.NOT_FOUND : constants_1.CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR;
            res.status(status).json({ error: error.message });
        }
    }
    async updateApplicantWallet(req, res) {
        try {
            const id = parseInt(req.params.id, 10);
            const { walletBalance } = req.body;
            const result = await AdminService_1.adminService.updateApplicantWallet(id, parseFloat(walletBalance));
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json(result);
        }
        catch (error) {
            console.error('[AdminController.updateApplicantWallet]', error);
            const status = error.message === constants_1.CONSTANTS.ERROR_MESSAGES.RESOURCE_NOT_FOUND ? constants_1.CONSTANTS.HTTP_STATUS.NOT_FOUND : constants_1.CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR;
            res.status(status).json({ error: error.message });
        }
    }
    async updateAvelingCredentials(req, res) {
        try {
            const id = parseInt(req.params.id, 10);
            const { avelingUsername, avelingPassword, sendEmail } = req.body;
            const result = await AdminService_1.adminService.updateAvelingCredentials(id, avelingUsername, avelingPassword, sendEmail !== undefined ? Boolean(sendEmail) : true);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json(result);
        }
        catch (error) {
            console.error('[AdminController.updateAvelingCredentials]', error);
            const status = error.message === constants_1.CONSTANTS.ERROR_MESSAGES.RESOURCE_NOT_FOUND ? constants_1.CONSTANTS.HTTP_STATUS.NOT_FOUND : constants_1.CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR;
            res.status(status).json({ error: error.message });
        }
    }
    async updateApplicantSubsidy(req, res) {
        try {
            const id = parseInt(req.params.id, 10);
            const { subsidyPercentage } = req.body;
            const { User } = require('../models');
            const user = await User.findByPk(id);
            if (!user) {
                res.status(404).json({ success: false, message: 'Applicant not found' });
                return;
            }
            await user.update({ subsidyPercentage });
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json({ success: true, message: 'Subsidy percentage updated successfully', data: user });
        }
        catch (error) {
            console.error('[AdminController.updateApplicantSubsidy]', error);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: error.message || constants_1.CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }
    async triggerSeed(req, res) {
        try {
            const { seedDatabase } = require('../seedDatabase');
            seedDatabase().then(() => {
                console.log('[AdminController.triggerSeed] Database seeding completed successfully via API trigger.');
            }).catch((err) => {
                console.error('[AdminController.triggerSeed] Seeding error:', err);
            });
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json({ success: true, message: 'Database seeding initiated in background.' });
        }
        catch (error) {
            console.error('[AdminController.triggerSeed]', error);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: error.message || constants_1.CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }
    async triggerCron(req, res) {
        try {
            const { applicantId, cronName } = req.body;
            if (!applicantId || !cronName) {
                res.status(400).json({ success: false, message: 'Applicant ID and Cron Name are required' });
                return;
            }
            let result = 0;
            switch (cronName) {
                case 'application':
                    const { runApplicationApprovalCron } = require('../cron/applicationCron');
                    result = await runApplicationApprovalCron(parseInt(applicantId));
                    break;
                case 'nomination':
                    const { runNominationFollowupCron } = require('../cron/nominationCron');
                    result = await runNominationFollowupCron(parseInt(applicantId));
                    break;
                case 'sponsorship':
                    const { runSponsorshipApprovalCron } = require('../cron/sponsorshipCron');
                    result = await runSponsorshipApprovalCron(parseInt(applicantId));
                    break;
                case 'contract':
                    const { runContractApprovalCron } = require('../cron/contractCron');
                    result = await runContractApprovalCron(parseInt(applicantId));
                    break;
                case 'aveling-welcome':
                    const { runAvelingWelcomeCron } = require('../cron/avelingCron');
                    result = await runAvelingWelcomeCron(parseInt(applicantId));
                    break;
                case 'aveling-delivery':
                    const { runAvelingTicketDeliveryCron } = require('../cron/avelingCron');
                    result = await runAvelingTicketDeliveryCron(parseInt(applicantId));
                    break;
                case 'psychometric':
                    const { runPsychometricApprovalCron } = require('../cron/psychometricCron');
                    result = await runPsychometricApprovalCron(parseInt(applicantId));
                    break;
                default:
                    res.status(400).json({ success: false, message: 'Invalid cron name' });
                    return;
            }
            res.status(200).json({ success: true, message: `Cron triggered successfully. Processes affected: ${result}` });
        }
        catch (error) {
            console.error('[AdminController.triggerCron]', error);
            res.status(500).json({ success: false, message: error.message || 'Failed to trigger cron' });
        }
    }
    async pauseCrons(req, res) {
        try {
            const { setCronsPaused } = require('../cron/cronRegistry');
            setCronsPaused(true);
            res.status(200).json({ success: true, message: 'All crons have been paused.' });
        }
        catch (error) {
            console.error('[AdminController.pauseCrons]', error);
            res.status(500).json({ success: false, message: error.message || 'Failed to pause crons' });
        }
    }
    async resumeCrons(req, res) {
        try {
            const { setCronsPaused } = require('../cron/cronRegistry');
            setCronsPaused(false);
            res.status(200).json({ success: true, message: 'All crons have been resumed.' });
        }
        catch (error) {
            console.error('[AdminController.resumeCrons]', error);
            res.status(500).json({ success: false, message: error.message || 'Failed to resume crons' });
        }
    }
    async getCronStatus(req, res) {
        try {
            const { areCronsPaused } = require('../cron/cronRegistry');
            const paused = areCronsPaused();
            res.status(200).json({ success: true, paused });
        }
        catch (error) {
            console.error('[AdminController.getCronStatus]', error);
            res.status(500).json({ success: false, message: error.message || 'Failed to get cron status' });
        }
    }
}
exports.AdminController = AdminController;
exports.adminController = new AdminController();
