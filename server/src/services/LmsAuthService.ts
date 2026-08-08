import { LmsCredential } from '../models/LmsCredential';
import { User } from '../models/User';
import { Op } from 'sequelize';
import { sequelize } from '../config/database';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

export class LmsAuthService {
    static async getLmsCredentialsStatus(applicantId: string | number) {
        const user = await User.findByPk(applicantId);
        const credential = await LmsCredential.findOne({ where: { userId: String(applicantId) } });

        const lmsUsername = user?.avelingUsername || credential?.lmsUsername || null;
        const lmsPassword = user?.avelingPassword || null;

        return {
            applicantId,
            hasLmsAccess: !!(lmsUsername || credential),
            lmsUsername,
            lmsPassword
        };
    }

    static async generateCredentials(applicantId: string | number) {
        // Check if user exists
        const user = await User.findByPk(applicantId);
        if (!user) {
            throw new Error('APPLICANT_NOT_FOUND');
        }

        // Generate username and temporary password
        const names = (user.fullName || 'User').trim().split(' ');
        const first = names[0] || 'App';
        const last = names[names.length - 1] || 'User';
        const lmsUsername = `Aveling-${first.substring(0, 3)}${last.substring(0, 3)}${Math.floor(1000 + Math.random() * 9000)}`.toUpperCase();
        const temporaryPassword = `temp-${uuidv4().split('-')[0]}!`;
        const passwordHash = await bcrypt.hash(temporaryPassword, 10);

        await user.update({
            avelingUsername: lmsUsername,
            avelingPassword: temporaryPassword
        });

        const existing = await LmsCredential.findOne({ where: { userId: String(applicantId) } });
        if (existing) {
            await existing.update({
                lmsUsername,
                passwordHash,
                isActive: true
            });
        } else {
            await LmsCredential.create({
                userId: String(applicantId),
                lmsUsername,
                passwordHash,
                isActive: true
            });
        }

        return {
            lmsUsername,
            temporaryPassword
        };
    }

    static async login(lmsUsername: string, password: string) {
        const cleanUsername = (lmsUsername || '').trim();
        if (!cleanUsername || !password) {
            throw new Error('INVALID_CREDENTIALS');
        }

        // 1. Search User by avelingUsername, candidateNumber, or email
        let user = await User.findOne({
            where: {
                [Op.or]: [
                    sequelize.where(sequelize.fn('LOWER', sequelize.col('avelingUsername')), cleanUsername.toLowerCase()),
                    sequelize.where(sequelize.fn('LOWER', sequelize.col('candidateNumber')), cleanUsername.toLowerCase()),
                    sequelize.where(sequelize.fn('LOWER', sequelize.col('email')), cleanUsername.toLowerCase())
                ]
            }
        });

        // 2. Search LmsCredential by lmsUsername
        let credential = await LmsCredential.findOne({
            where: sequelize.where(sequelize.fn('LOWER', sequelize.col('lms_username')), cleanUsername.toLowerCase()),
            include: [{ model: User }]
        });

        if (!user && credential) {
            user = (credential as any).User;
        }

        if (!user) {
            throw new Error('INVALID_CREDENTIALS');
        }

        let isMatch = false;

        // Check user.avelingPassword (plain text or bcrypt)
        if (user.avelingPassword) {
            if (user.avelingPassword === password) {
                isMatch = true;
            } else {
                try {
                    isMatch = await bcrypt.compare(password, user.avelingPassword);
                } catch (e) {
                    isMatch = false;
                }
            }
        }

        // Check LmsCredential passwordHash
        if (!isMatch && credential && credential.passwordHash) {
            try {
                isMatch = await bcrypt.compare(password, credential.passwordHash);
            } catch (e) {
                isMatch = false;
            }
        }

        // Check main user passwordHash
        if (!isMatch && user.passwordHash) {
            try {
                isMatch = await bcrypt.compare(password, user.passwordHash);
            } catch (e) {
                isMatch = false;
            }
        }

        if (!isMatch) {
            throw new Error('INVALID_CREDENTIALS');
        }

        const activeUsername = user.avelingUsername || credential?.lmsUsername || user.candidateNumber || user.email;

        // Generate JWT
        const accessToken = jwt.sign(
            { id: user.id, role: 'LEARNER', lmsUsername: activeUsername },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: (process.env.JWT_EXPIRES_IN || '15m') as any }
        );

        return {
            accessToken,
            user: {
                id: user.id,
                name: user.fullName,
                lmsUsername: activeUsername,
                role: 'LEARNER'
            }
        };
    }
}

