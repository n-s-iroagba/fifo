import { Transaction } from 'sequelize';
import { CryptoWallet } from '../models';

export class CryptoWalletRepository {
    // Maps to STK-ADM-CRYPTO-001, SCR-ADM-CRYPTO-001
    public async findAll(transaction?: Transaction): Promise<{ rows: CryptoWallet[], count: number }> {
        return CryptoWallet.findAndCountAll({
            order: [['createdAt', 'DESC']],
            transaction
        });
    }

    // Maps to STK-APP-PAY-001 (Applicants fetching available payment methods)
    public async findAllActive(transaction?: Transaction): Promise<CryptoWallet[]> {
        return CryptoWallet.findAll({
            where: { isActive: true },
            order: [['displayLabel', 'ASC']],
            transaction
        });
    }

    public async findById(id: number, transaction?: Transaction): Promise<CryptoWallet | null> {
        return CryptoWallet.findByPk(id, { transaction });
    }

    // Maps to STK-ADM-CRYPTO-001, STK-ADM-CRYPTO-002, SCR-ADM-CRYPTOFORM-001
    public async create(data: any, transaction?: Transaction): Promise<CryptoWallet> {
        return CryptoWallet.create(data, { transaction });
    }

    // Maps to STK-ADM-CRYPTO-001
    public async update(id: number, data: any, transaction?: Transaction): Promise<[number]> {
        return CryptoWallet.update(data, { where: { id }, transaction });
    }

    // Maps to STK-ADM-CRYPTO-001, NFR-DATA-001
    public async delete(id: number, transaction?: Transaction): Promise<void> {
        await CryptoWallet.destroy({ where: { id }, transaction });
    }
}

export const cryptoWalletRepository = new CryptoWalletRepository();
