import { Transaction } from 'sequelize';
import { BankAccount } from '../models';

export class BankAccountRepository {
    // Maps to STK-ADM-BANK-001, SCR-ADM-BANK-001
    public async findAll(transaction?: Transaction): Promise<{ rows: BankAccount[], count: number }> {
        return BankAccount.findAndCountAll({
            order: [['createdAt', 'DESC']],
            transaction
        });
    }

    // Maps to STK-APP-PAY-001 (Applicants fetching available payment methods)
    public async findAllActive(transaction?: Transaction): Promise<BankAccount[]> {
        return BankAccount.findAll({
            where: { isActive: true },
            order: [['bankName', 'ASC']],
            transaction
        });
    }

    public async findById(id: number, transaction?: Transaction): Promise<BankAccount | null> {
        return BankAccount.findByPk(id, { transaction });
    }

    // Maps to STK-ADM-BANK-001, STK-ADM-BANK-002, SCR-ADM-BANKFORM-001
    public async create(data: any, transaction?: Transaction): Promise<BankAccount> {
        return BankAccount.create(data, { transaction });
    }

    // Maps to STK-ADM-BANK-001, STK-ADM-BANK-004
    public async update(id: number, data: any, transaction?: Transaction): Promise<[number]> {
        return BankAccount.update(data, { where: { id }, transaction });
    }

    // Maps to STK-ADM-BANK-001, NFR-DATA-001
    public async delete(id: number, transaction?: Transaction): Promise<void> {
        await BankAccount.destroy({ where: { id }, transaction });
    }
}

export const bankAccountRepository = new BankAccountRepository();
