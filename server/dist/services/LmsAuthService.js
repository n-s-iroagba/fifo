"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LmsAuthService = void 0;
const LmsCredential_1 = require("../models/LmsCredential");
const User_1 = require("../models/User");
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const uuid_1 = require("uuid");
const constants_1 = require("../constants");
class LmsAuthService {
    static async getLmsCredentialsStatus(applicantId) {
        const user = await User_1.User.findByPk(applicantId);
        const credential = await LmsCredential_1.LmsCredential.findOne({ where: { userId: String(applicantId) } });
        const lmsUsername = user?.avelingUsername || credential?.lmsUsername || null;
        const lmsPassword = user?.avelingPassword || null;
        return {
            applicantId,
            hasLmsAccess: !!(lmsUsername || credential),
            lmsUsername,
            lmsPassword
        };
    }
    static async generateCredentials(applicantId) {
        // Check if user exists
        const user = await User_1.User.findByPk(applicantId);
        if (!user) {
            throw new Error('APPLICANT_NOT_FOUND');
        }
        // Generate username and temporary password
        const names = (user.fullName || 'User').trim().split(' ');
        const first = names[0] || 'App';
        const last = names[names.length - 1] || 'User';
        const lmsUsername = `Aveling-${first.substring(0, 3)}${last.substring(0, 3)}${Math.floor(1000 + Math.random() * 9000)}`.toUpperCase();
        const temporaryPassword = `temp-${(0, uuid_1.v4)().split('-')[0]}!`;
        const passwordHash = await bcrypt_1.default.hash(temporaryPassword, 10);
        await user.update({
            avelingUsername: lmsUsername,
            avelingPassword: temporaryPassword
        });
        const existing = await LmsCredential_1.LmsCredential.findOne({ where: { userId: String(applicantId) } });
        if (existing) {
            await existing.update({
                lmsUsername,
                passwordHash,
                isActive: true
            });
        }
        else {
            await LmsCredential_1.LmsCredential.create({
                userId: String(applicantId),
                lmsUsername,
                passwordHash,
                isActive: true
            });
        }
        const { sendAvelingCredentialsEmail } = require('../utils/email');
        if (user.email) {
            try {
                await sendAvelingCredentialsEmail(user.email, user.fullName);
            }
            catch (err) {
                console.error('[LmsAuthService] Failed to send credentials email', err);
            }
        }
        return {
            lmsUsername,
            temporaryPassword
        };
    }
    static async login(lmsUsername, password) {
        const cleanUsername = (lmsUsername || '').trim();
        if (!cleanUsername || !password) {
            throw new Error('INVALID_CREDENTIALS');
        }
        // 1. Search User by avelingUsername, candidateNumber, or email
        let user = await User_1.User.findOne({
            where: {
                [sequelize_1.Op.or]: [
                    database_1.sequelize.where(database_1.sequelize.fn('LOWER', database_1.sequelize.col('avelingUsername')), cleanUsername.toLowerCase()),
                    database_1.sequelize.where(database_1.sequelize.fn('LOWER', database_1.sequelize.col('candidateNumber')), cleanUsername.toLowerCase()),
                    database_1.sequelize.where(database_1.sequelize.fn('LOWER', database_1.sequelize.col('email')), cleanUsername.toLowerCase())
                ]
            }
        });
        // 2. Search LmsCredential by lmsUsername
        let credential = await LmsCredential_1.LmsCredential.findOne({
            where: database_1.sequelize.where(database_1.sequelize.fn('LOWER', database_1.sequelize.col('lms_username')), cleanUsername.toLowerCase()),
            include: [{ model: User_1.User }]
        });
        if (!user && credential) {
            user = credential.User;
        }
        if (!user) {
            throw new Error('INVALID_CREDENTIALS');
        }
        let isMatch = false;
        // Check user.avelingPassword (plain text or bcrypt)
        if (user.avelingPassword) {
            if (user.avelingPassword === password) {
                isMatch = true;
            }
            else {
                try {
                    isMatch = await bcrypt_1.default.compare(password, user.avelingPassword);
                }
                catch (e) {
                    isMatch = false;
                }
            }
        }
        // Check LmsCredential passwordHash
        if (!isMatch && credential && credential.passwordHash) {
            try {
                isMatch = await bcrypt_1.default.compare(password, credential.passwordHash);
            }
            catch (e) {
                isMatch = false;
            }
        }
        // Check main user passwordHash
        if (!isMatch && user.passwordHash) {
            try {
                isMatch = await bcrypt_1.default.compare(password, user.passwordHash);
            }
            catch (e) {
                isMatch = false;
            }
        }
        if (!isMatch) {
            throw new Error('INVALID_CREDENTIALS');
        }
        const activeUsername = user.avelingUsername || credential?.lmsUsername || user.candidateNumber || user.email;
        // Generate JWT
        const accessToken = jsonwebtoken_1.default.sign({ id: user.id, role: constants_1.CONSTANTS.ROLES.APPLICANT, lmsUsername: activeUsername }, process.env.JWT_SECRET || 'secret', { expiresIn: (process.env.JWT_EXPIRES_IN || '15m') });
        return {
            accessToken,
            user: {
                id: user.id,
                name: user.fullName,
                lmsUsername: activeUsername,
                role: constants_1.CONSTANTS.ROLES.APPLICANT
            }
        };
    }
}
exports.LmsAuthService = LmsAuthService;
