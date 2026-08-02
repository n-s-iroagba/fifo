import { Request, Response } from 'express';
import { adminService } from '../services/AdminService';
import { CONSTANTS } from '../constants';

export class AdminController {
    // Maps to STK-ADM-HEALTH-001..003 — extended health metrics
    public async getHealth(req: Request, res: Response): Promise<void> {
        try {
            const health = await adminService.getSystemHealth();
            res.status(CONSTANTS.HTTP_STATUS.OK).json(health);
        } catch (error) {
            console.error('[AdminController.getHealth]', error);
            res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }

    // ==========================
    // Financial Configurations — STK-ADM-BANK-001..004, STK-ADM-CRYPTO-001..003
    // ==========================
    public async getFinancialConfigs(req: Request, res: Response): Promise<void> {
        try {
            res.status(CONSTANTS.HTTP_STATUS.OK).json(await adminService.getFinancialConfigurations());
        } catch (error) {
            console.error('[AdminController.getFinancialConfigs]', error);
            res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }

    public async getAllBankAccounts(req: Request, res: Response): Promise<void> {
        try {
            res.status(CONSTANTS.HTTP_STATUS.OK).json(await adminService.getAllBankAccounts());
        } catch (error) {
            console.error('[AdminController.getAllBankAccounts]', error);
            res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }

    public async getAllCryptoWallets(req: Request, res: Response): Promise<void> {
        try {
            res.status(CONSTANTS.HTTP_STATUS.OK).json(await adminService.getAllCryptoWallets());
        } catch (error) {
            console.error('[AdminController.getAllCryptoWallets]', error);
            res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }

    public async getBankAccountById(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id as string, 10);
            res.status(CONSTANTS.HTTP_STATUS.OK).json(await adminService.getBankAccountById(id));
        } catch (error: any) {
            console.error('[AdminController.getBankAccountById]', error);
            const status = error.message === CONSTANTS.ERROR_MESSAGES.RESOURCE_NOT_FOUND ? CONSTANTS.HTTP_STATUS.NOT_FOUND : CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR;
            res.status(status).json({ error: error.message });
        }
    }

    public async getCryptoWalletById(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id as string, 10);
            res.status(CONSTANTS.HTTP_STATUS.OK).json(await adminService.getCryptoWalletById(id));
        } catch (error: any) {
            console.error('[AdminController.getCryptoWalletById]', error);
            const status = error.message === CONSTANTS.ERROR_MESSAGES.RESOURCE_NOT_FOUND ? CONSTANTS.HTTP_STATUS.NOT_FOUND : CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR;
            res.status(status).json({ error: error.message });
        }
    }

    // STK-ADM-BANK-003: get bank accounts filtered by payment amount
    public async getBankAccountsForAmount(req: Request, res: Response): Promise<void> {
        try {
            const amount = parseFloat(req.query.amount as string);
            const accounts = await adminService.getBankAccountForAmount(amount);
            res.status(CONSTANTS.HTTP_STATUS.OK).json(accounts);
        } catch (error) {
            console.error('[AdminController.getBankAccountsForAmount]', error);
            res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }

    // STK-ADM-CRYPTO-003: active wallets for applicant display
    public async getActiveCryptoWallets(req: Request, res: Response): Promise<void> {
        try {
            const wallets = await adminService.getActiveCryptoWallets();
            res.status(CONSTANTS.HTTP_STATUS.OK).json(wallets);
        } catch (error) {
            console.error('[AdminController.getActiveCryptoWallets]', error);
            res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }

    // Bank Account CRUD — STK-ADM-BANK-001
    public async createBankAccount(req: Request, res: Response): Promise<void> {
        try {
            res.status(CONSTANTS.HTTP_STATUS.CREATED).json(await adminService.createBankAccount(req.body));
        } catch (error) {
            console.error('[AdminController.createBankAccount]', error);
            res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }
    public async updateBankAccount(req: Request, res: Response): Promise<void> {
        try {
            res.status(CONSTANTS.HTTP_STATUS.OK).json(await adminService.updateBankAccount(parseInt(req.params.id as string, 10), req.body));
        } catch (error) {
            console.error('[AdminController.updateBankAccount]', error);
            res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }
    public async deleteBankAccount(req: Request, res: Response): Promise<void> {
        try {
            await adminService.deleteBankAccount(parseInt(req.params.id as string, 10));
            res.status(CONSTANTS.HTTP_STATUS.OK).json({ message: CONSTANTS.SUCCESS_MESSAGES.DELETED });
        } catch (error) {
            console.error('[AdminController.deleteBankAccount]', error);
            res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }

    // Crypto Wallets CRUD — STK-ADM-CRYPTO-001
    public async createCryptoWallet(req: Request, res: Response): Promise<void> {
        try {
            res.status(CONSTANTS.HTTP_STATUS.CREATED).json(await adminService.createCryptoWallet(req.body));
        } catch (error) {
            console.error('[AdminController.createCryptoWallet]', error);
            res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }
    public async updateCryptoWallet(req: Request, res: Response): Promise<void> {
        try {
            res.status(CONSTANTS.HTTP_STATUS.OK).json(await adminService.updateCryptoWallet(parseInt(req.params.id as string, 10), req.body));
        } catch (error) {
            console.error('[AdminController.updateCryptoWallet]', error);
            res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }
    public async deleteCryptoWallet(req: Request, res: Response): Promise<void> {
        try {
            await adminService.deleteCryptoWallet(parseInt(req.params.id as string, 10));
            res.status(CONSTANTS.HTTP_STATUS.OK).json({ message: CONSTANTS.SUCCESS_MESSAGES.DELETED });
        } catch (error) {
            console.error('[AdminController.deleteCryptoWallet]', error);
            res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }

    // ==========================
    // Job Configurations — STK-ADM-CAT-001, STK-ADM-BEN-001, STK-ADM-COND-001
    // ==========================
    public async getJobConfigs(req: Request, res: Response): Promise<void> {
        try {
            res.status(CONSTANTS.HTTP_STATUS.OK).json(await adminService.getJobConfigurations());
        } catch (error) {
            console.error('[AdminController.getJobConfigs]', error);
            res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }

    public async getAllCategories(req: Request, res: Response): Promise<void> {
        try {
            const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
            const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : 0;
            const searchQuery = req.query.searchQuery as string;

            res.status(CONSTANTS.HTTP_STATUS.OK).json(await adminService.getAllCategories({ limit, offset, searchQuery }));
        } catch (error) {
            console.error('[AdminController.getAllCategories]', error);
            res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }

    public async getAllConditions(req: Request, res: Response): Promise<void> {
        try {
            const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
            const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : 0;
            const searchQuery = req.query.searchQuery as string;
            const categoryId = req.query.categoryId ? parseInt(req.query.categoryId as string, 10) : undefined;

            res.status(CONSTANTS.HTTP_STATUS.OK).json(await adminService.getAllConditions({ limit, offset, searchQuery, categoryId }));
        } catch (error) {
            console.error('[AdminController.getAllConditions]', error);
            res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }

    public async getAllBenefits(req: Request, res: Response): Promise<void> {
        try {
            const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
            const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : 0;
            const searchQuery = req.query.searchQuery as string;
            const categoryId = req.query.categoryId ? parseInt(req.query.categoryId as string, 10) : undefined;

            res.status(CONSTANTS.HTTP_STATUS.OK).json(await adminService.getAllBenefits({ limit, offset, searchQuery, categoryId }));
        } catch (error) {
            console.error('[AdminController.getAllBenefits]', error);
            res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }

    public async getCategoryById(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id as string, 10);
            res.status(CONSTANTS.HTTP_STATUS.OK).json(await adminService.getCategoryById(id));
        } catch (error: any) {
            console.error('[AdminController.getCategoryById]', error);
            const status = error.message === CONSTANTS.ERROR_MESSAGES.RESOURCE_NOT_FOUND ? CONSTANTS.HTTP_STATUS.NOT_FOUND : CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR;
            res.status(status).json({ error: error.message });
        }
    }

    public async getConditionById(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id as string, 10);
            res.status(CONSTANTS.HTTP_STATUS.OK).json(await adminService.getConditionById(id));
        } catch (error: any) {
            console.error('[AdminController.getConditionById]', error);
            const status = error.message === CONSTANTS.ERROR_MESSAGES.RESOURCE_NOT_FOUND ? CONSTANTS.HTTP_STATUS.NOT_FOUND : CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR;
            res.status(status).json({ error: error.message });
        }
    }

    public async getBenefitById(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id as string, 10);
            res.status(CONSTANTS.HTTP_STATUS.OK).json(await adminService.getBenefitById(id));
        } catch (error: any) {
            console.error('[AdminController.getBenefitById]', error);
            const status = error.message === CONSTANTS.ERROR_MESSAGES.RESOURCE_NOT_FOUND ? CONSTANTS.HTTP_STATUS.NOT_FOUND : CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR;
            res.status(status).json({ error: error.message });
        }
    }

    // Categories — STK-ADM-CAT-001
    public async createCategory(req: Request, res: Response): Promise<void> {
        try {
            res.status(CONSTANTS.HTTP_STATUS.CREATED).json(await adminService.createCategory(req.body));
        } catch (error) {
            console.error('[AdminController.createCategory]', error);
            res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }
    public async updateCategory(req: Request, res: Response): Promise<void> {
        try {
            res.status(CONSTANTS.HTTP_STATUS.OK).json(await adminService.updateCategory(parseInt(req.params.id as string, 10), req.body));
        } catch (error) {
            console.error('[AdminController.updateCategory]', error);
            res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }
    public async deleteCategory(req: Request, res: Response): Promise<void> {
        try {
            await adminService.deleteCategory(parseInt(req.params.id as string, 10));
            res.status(CONSTANTS.HTTP_STATUS.OK).json({ message: CONSTANTS.SUCCESS_MESSAGES.DELETED });
        } catch (error) {
            console.error('[AdminController.deleteCategory]', error);
            res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }

    // Conditions — STK-ADM-COND-001
    public async createCondition(req: Request, res: Response): Promise<void> {
        try {
            res.status(CONSTANTS.HTTP_STATUS.CREATED).json(await adminService.createCondition(req.body));
        } catch (error) {
            console.error('[AdminController.createCondition]', error);
            res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }
    public async updateCondition(req: Request, res: Response): Promise<void> {
        try {
            res.status(CONSTANTS.HTTP_STATUS.OK).json(await adminService.updateCondition(parseInt(req.params.id as string, 10), req.body));
        } catch (error) {
            console.error('[AdminController.updateCondition]', error);
            res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }
    public async deleteCondition(req: Request, res: Response): Promise<void> {
        try {
            await adminService.deleteCondition(parseInt(req.params.id as string, 10));
            res.status(CONSTANTS.HTTP_STATUS.OK).json({ message: CONSTANTS.SUCCESS_MESSAGES.DELETED });
        } catch (error) {
            console.error('[AdminController.deleteCondition]', error);
            res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }

    // Benefits — STK-ADM-BEN-001
    public async createBenefit(req: Request, res: Response): Promise<void> {
        try {
            res.status(CONSTANTS.HTTP_STATUS.CREATED).json(await adminService.createBenefit(req.body));
        } catch (error) {
            console.error('[AdminController.createBenefit]', error);
            res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }
    public async updateBenefit(req: Request, res: Response): Promise<void> {
        try {
            res.status(CONSTANTS.HTTP_STATUS.OK).json(await adminService.updateBenefit(parseInt(req.params.id as string, 10), req.body));
        } catch (error) {
            console.error('[AdminController.updateBenefit]', error);
            res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }
    public async deleteBenefit(req: Request, res: Response): Promise<void> {
        try {
            await adminService.deleteBenefit(parseInt(req.params.id as string, 10));
            res.status(CONSTANTS.HTTP_STATUS.OK).json({ message: CONSTANTS.SUCCESS_MESSAGES.DELETED });
        } catch (error) {
            console.error('[AdminController.deleteBenefit]', error);
            res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }

    // ==========================
    // Admin Communication — STK-ADM-APP-003, STK-ADM-APP-004
    // ==========================
    public async sendMailToApplicant(req: Request, res: Response): Promise<void> {
        try {
            const { applicantId, subject, message, sendPushNotification, email, fromType } = req.body;
            
            // Map multer files to Nodemailer attachments with explicit contentType for delivery success
            const rawFiles = req.files as Express.Multer.File[];
            console.log(`[AdminController.sendMailToApplicant] Received files: ${rawFiles?.length || 0}`);
            
            const attachments = rawFiles?.map(file => ({
                filename: file.originalname,
                content: file.buffer,
                contentType: file.mimetype
            })) || [];

            const result = await adminService.sendMailToApplicant(
                applicantId ? parseInt(applicantId as string, 10) : undefined,
                subject,
                message,
                sendPushNotification === 'true' || sendPushNotification === true,
                email,
                attachments,
                fromType || 'info'
            );
            res.status(CONSTANTS.HTTP_STATUS.OK).json(result);
        } catch (error: any) {
            console.error('[AdminController.sendMailToApplicant]', error);
            if (error.message === CONSTANTS.ERROR_MESSAGES.RESOURCE_NOT_FOUND) {
                res.status(CONSTANTS.HTTP_STATUS.NOT_FOUND).json({ error: error.message });
                return;
            }
            res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }

    public async getApplicantById(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id as string, 10);
            const user = await adminService.getApplicantById(id);
            res.status(CONSTANTS.HTTP_STATUS.OK).json({
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
                    cvUrl: user.cvUrl
                }
            });
        } catch (error: any) {
            console.error('[AdminController.getApplicantById]', error);
            const status = error.message === CONSTANTS.ERROR_MESSAGES.RESOURCE_NOT_FOUND ? CONSTANTS.HTTP_STATUS.NOT_FOUND : CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR;
            res.status(status).json({ error: error.message });
        }
    }

    // ==========================
    // User Views — REG-004
    // ==========================
    public async getAllApplicants(req: Request, res: Response): Promise<void> {
        try {
            const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
            const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : 0;
            const users = await adminService.getAllApplicants(limit, offset);
            res.status(CONSTANTS.HTTP_STATUS.OK).json(users);
        } catch (error) {
            console.error('[AdminController.getAllApplicants]', error);
            res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR });
        }
    }

    public async deleteApplicant(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id as string, 10);
            await adminService.deleteApplicant(id);
            res.status(CONSTANTS.HTTP_STATUS.OK).json({ message: CONSTANTS.SUCCESS_MESSAGES.DELETED });
        } catch (error: any) {
            console.error('[AdminController.deleteApplicant]', error);
            const status = error.message === CONSTANTS.ERROR_MESSAGES.RESOURCE_NOT_FOUND ? CONSTANTS.HTTP_STATUS.NOT_FOUND : CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR;
            res.status(status).json({ error: error.message });
        }
    }
    public async sendWelcomeMail(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id as string, 10);
            const result = await adminService.sendWelcomeMail(id);
            res.status(CONSTANTS.HTTP_STATUS.OK).json(result);
        } catch (error: any) {
            console.error('[AdminController.sendWelcomeMail]', error);
            const status = error.message === CONSTANTS.ERROR_MESSAGES.RESOURCE_NOT_FOUND ? CONSTANTS.HTTP_STATUS.NOT_FOUND : CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR;
            res.status(status).json({ error: error.message });
        }
    }

    public async sendEOIMail(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id as string, 10);
            const result = await adminService.sendEOIMail(id);
            res.status(CONSTANTS.HTTP_STATUS.OK).json(result);
        } catch (error: any) {
            console.error('[AdminController.sendEOIMail]', error);
            const status = error.message === CONSTANTS.ERROR_MESSAGES.RESOURCE_NOT_FOUND ? CONSTANTS.HTTP_STATUS.NOT_FOUND : CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR;
            res.status(status).json({ error: error.message });
        }
    }
}

export const adminController = new AdminController();
