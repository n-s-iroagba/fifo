import { LmsCredential } from '../models/LmsCredential';
import { User } from '../models/User';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

export class LmsAuthService {
    static async getLmsCredentialsStatus(applicantId: string | number) {
        const credential = await LmsCredential.findOne({ where: { userId: String(applicantId) } });
        
        if (!credential) {
            return {
                applicantId,
                hasLmsAccess: false
            };
        }

        return {
            applicantId,
            hasLmsAccess: true,
            lmsUsername: credential.lmsUsername
        };
    }

    static async generateCredentials(applicantId: string | number) {
        // Check if user exists
        const user = await User.findByPk(applicantId);
        if (!user) {
            throw new Error('APPLICANT_NOT_FOUND');
        }

        // Check if credentials already exist
        const existing = await LmsCredential.findOne({ where: { userId: String(applicantId) } });
        if (existing) {
            throw new Error('CREDENTIALS_EXIST');
        }

        // Generate username and temporary password
        const names = user.fullName.split(' ');
        const first = names[0] || 'App';
        const last = names[names.length - 1] || 'User';
        const lmsUsername = `Aveling-${first.substring(0, 3)}${last.substring(0, 3)}${Math.floor(1000 + Math.random() * 9000)}`.toUpperCase();
        const temporaryPassword = `temp-${uuidv4().split('-')[0]}!`;
        const passwordHash = await bcrypt.hash(temporaryPassword, 10);

        const credential = await LmsCredential.create({
            userId: String(applicantId),
            lmsUsername,
            passwordHash,
            isActive: true
        });

        // Normally, dispatch an email here.
        // await MailService.sendLmsCredentials(user.email, lmsUsername, temporaryPassword);

        return {
            lmsUsername,
            temporaryPassword
        };
    }

    static async login(lmsUsername: string, password: string) {
        const credential = await LmsCredential.findOne({
            where: { lmsUsername, isActive: true },
            include: [{ model: User }]
        });

        if (!credential) {
            throw new Error('INVALID_CREDENTIALS');
        }

        const isMatch = await bcrypt.compare(password, credential.passwordHash);
        if (!isMatch) {
            throw new Error('INVALID_CREDENTIALS');
        }

        // Generate JWT
        const user = (credential as any).User;
        const accessToken = jwt.sign(
            { id: user.id, role: 'LEARNER', lmsUsername: credential.lmsUsername },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: (process.env.JWT_EXPIRES_IN || '15m') as any }
        );

        return {
            accessToken,
            user: {
                id: user.id,
                name: user.fullName,
                lmsUsername: credential.lmsUsername,
                role: 'LEARNER'
            }
        };
    }
}
