"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LmsAuthService = void 0;
const LmsCredential_1 = require("../models/LmsCredential");
const User_1 = require("../models/User");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const uuid_1 = require("uuid");
class LmsAuthService {
    static async getLmsCredentialsStatus(applicantId) {
        const credential = await LmsCredential_1.LmsCredential.findOne({ where: { userId: String(applicantId) } });
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
    static async generateCredentials(applicantId) {
        // Check if user exists
        const user = await User_1.User.findByPk(applicantId);
        if (!user) {
            throw new Error('APPLICANT_NOT_FOUND');
        }
        // Check if credentials already exist
        const existing = await LmsCredential_1.LmsCredential.findOne({ where: { userId: String(applicantId) } });
        if (existing) {
            throw new Error('CREDENTIALS_EXIST');
        }
        // Generate username and temporary password
        const names = user.fullName.split(' ');
        const first = names[0] || 'App';
        const last = names[names.length - 1] || 'User';
        const lmsUsername = `Aveling-${first.substring(0, 3)}${last.substring(0, 3)}${Math.floor(1000 + Math.random() * 9000)}`.toUpperCase();
        const temporaryPassword = `temp-${(0, uuid_1.v4)().split('-')[0]}!`;
        const passwordHash = await bcrypt_1.default.hash(temporaryPassword, 10);
        const credential = await LmsCredential_1.LmsCredential.create({
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
    static async login(lmsUsername, password) {
        const credential = await LmsCredential_1.LmsCredential.findOne({
            where: { lmsUsername, isActive: true },
            include: [{ model: User_1.User }]
        });
        if (!credential) {
            throw new Error('INVALID_CREDENTIALS');
        }
        const isMatch = await bcrypt_1.default.compare(password, credential.passwordHash);
        if (!isMatch) {
            throw new Error('INVALID_CREDENTIALS');
        }
        // Generate JWT
        const user = credential.User;
        const accessToken = jsonwebtoken_1.default.sign({ id: user.id, role: 'LEARNER', lmsUsername: credential.lmsUsername }, process.env.JWT_SECRET || 'secret', { expiresIn: (process.env.JWT_EXPIRES_IN || '15m') });
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
exports.LmsAuthService = LmsAuthService;
