import { Transaction } from 'sequelize';
import { Payment, Application, User, JobStage, JobListing } from '../models';

export interface FindPaymentOptions {
    limit?: number;
    offset?: number;
    status?: string;
    applicationId?: number;
    stageId?: number;
}

export class PaymentRepository {
    // Maps to STK-ADM-PAY-003, SCR-ADM-UNPAID-001 NFR-PERF-004
    public async findAllAdmin(options: FindPaymentOptions = {}, transaction?: Transaction): Promise<{ rows: Payment[]; count: number }> {
        const whereClause: any = {};
        if (options.status) whereClause.status = options.status;
        if (options.applicationId) whereClause.applicationId = options.applicationId;
        if (options.stageId) whereClause.stageId = options.stageId;

        return Payment.findAndCountAll({
            where: whereClause,
            limit: options.limit || 20,
            offset: options.offset || 0,
            include: [
                { model: Application, include: [{ model: User, attributes: ['id', 'fullName', 'email'] }, { model: JobListing, attributes: ['title'] }] },
                { model: JobStage, attributes: ['id', 'name', 'amount', 'currency'] },
                { model: User, as: 'Verifier', attributes: ['id', 'fullName'] }
            ],
            order: [['createdAt', 'DESC']],
            transaction
        });
    }

    // Maps to STK-APP-PAY-002, SCR-APP-PAYSTATUS-001
    public async findByApplicationId(applicationId: number, transaction?: Transaction): Promise<Payment[]> {
        return Payment.findAll({
            where: { applicationId },
            include: [JobStage],
            order: [['createdAt', 'ASC']],
            transaction
        });
    }

    // Maps to STK-APP-PAY-001, SCR-APP-PAYUPLOAD-001 NFR-SEC-005
    public async create(paymentData: any, transaction?: Transaction): Promise<Payment> {
        return Payment.create(paymentData, { transaction });
    }

    // Maps to STK-ADM-PAY-001, STK-ADM-PAY-002, SCR-ADM-UNVERIFIED-001
    public async update(id: number, updateData: any, transaction?: Transaction): Promise<[number]> {
        return Payment.update(updateData, { where: { id }, transaction });
    }

    public async findById(id: number, transaction?: Transaction): Promise<Payment | null> {
        return Payment.findByPk(id, {
            include: [
                Application,
                JobStage,
                { model: User, as: 'Verifier', attributes: ['id', 'fullName'] }
            ],
            transaction
        });
    }
}

export const paymentRepository = new PaymentRepository();
