import { Transaction } from 'sequelize';
import { User } from '../models';

export interface FindUsersOptions {
    limit?: number;
    offset?: number;
    role?: string;
    isVerified?: boolean;
}

export class UserRepository {
    // Maps to STK-APP-AUTH-004, STK-APP-AUTH-005
    public async findByEmail(email: string, transaction?: Transaction): Promise<User | null> {
        return User.findOne({ where: { email }, transaction });
    }

    // Maps to STK-APP-AUTH-004, REG-002
    public async create(userData: any, transaction?: Transaction): Promise<User> {
        return User.create(userData, { transaction });
    }

    // Maps to NFR-SEC-004
    public async findById(id: number, transaction?: Transaction): Promise<User | null> {
        return User.findByPk(id, { transaction });
    }

    public async findByVerificationToken(token: string, transaction?: Transaction): Promise<User | null> {
        return User.findOne({ where: { verificationToken: token }, transaction });
    }

    public async findByResetToken(token: string, transaction?: Transaction): Promise<User | null> {
        return User.findOne({ where: { resetPasswordToken: token }, transaction });
    }

    // Maps to STK-ADM-USERS-001 (Derived Admin View)
    public async findAndCountAll(options: FindUsersOptions = {}): Promise<{ rows: User[]; count: number }> {
        const whereClause: any = {};
        if (options.role) whereClause.role = options.role;
        if (options.isVerified !== undefined) whereClause.isVerified = options.isVerified;

        return User.findAndCountAll({
            where: whereClause,
            limit: options.limit || 10,
            offset: options.offset || 0,
            order: [['createdAt', 'DESC']]
        });
    }

    // Maps to STK-APP-PROFILE-001
    public async update(id: number, updateData: any, transaction?: Transaction): Promise<[number]> {
        return User.update(updateData, { where: { id }, transaction });
    }

    // Maps to STK-APP-PROFILE-001 (Derived from data deletion requests REG-004)
    public async delete(id: number, transaction?: Transaction): Promise<void> {
        await User.destroy({ where: { id }, transaction });
    }
}

export const userRepository = new UserRepository();
