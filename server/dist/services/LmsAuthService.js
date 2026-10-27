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
        const last = names.length > 1 ? names[names.length - 1] : 'User';
        const lmsUsername = `CERTHERO-${first.substring(0, 3)}${last.substring(0, 3)}${Math.floor(1000 + Math.random() * 9000)}`.toUpperCase();
        const temporaryPassword = `temp-${(0, uuid_1.v4)().split('-')[0]}!`;
        const passwordHash = await bcrypt_1.default.hash(temporaryPassword, 10);
        await user.update({
            rtoUsername: lmsUsername,
            rtoPassword: temporaryPassword,
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
                await sendAvelingCredentialsEmail(user.email, user.fullName, lmsUsername, temporaryPassword);
                const prefs = {
                    ...(user.preferences || {}),
                    credentialsSent: true
                };
                await user.update({ preferences: prefs });
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
        // 1. Search User by rtoUsername, avelingUsername, candidateNumber, or email
        let user = await User_1.User.findOne({
            where: {
                [sequelize_1.Op.or]: [
                    database_1.sequelize.where(database_1.sequelize.fn('LOWER', database_1.sequelize.col('rtoUsername')), cleanUsername.toLowerCase()),
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
        // Check user.rtoPassword (plain text or bcrypt)
        if (user.rtoPassword) {
            if (user.rtoPassword === password) {
                isMatch = true;
            }
            else {
                try {
                    isMatch = await bcrypt_1.default.compare(password, user.rtoPassword);
                }
                catch (e) {
                    isMatch = false;
                }
            }
        }
        // Check user.avelingPassword (plain text or bcrypt)
        if (!isMatch && user.avelingPassword) {
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
        // Trigger Email 12b if applicant performs their first RTO LMS login
        // after enrollment letter and email with credentials have been sent.
        // It must be sent just once at first RTO LMS login.
        if (user.role === constants_1.CONSTANTS.ROLES.APPLICANT || user.role === 'applicant') {
            try {
                const prefs = { ...(user.preferences || {}) };
                // Record first RTO LMS login timestamp if not yet set
                if (!prefs.firstRtoLoginAt) {
                    prefs.firstRtoLoginAt = new Date().toISOString();
                    await user.update({ preferences: prefs });
                }
                if (!prefs.email12bSent) {
                    // Check if enrollment letter and email with credentials have been sent
                    const { Contract } = require('../models/Contract');
                    const contract = await Contract.findOne({
                        where: {
                            userId: user.id,
                            [sequelize_1.Op.or]: [
                                { rtoWelcomeSent: true },
                                { avelingWelcomeSent: true }
                            ]
                        }
                    });
                    const enrollmentLetterSent = Boolean(contract ||
                        prefs.enrollmentLetterSent ||
                        prefs.rtoWelcomeSent);
                    const credentialsSent = Boolean(prefs.credentialsSent ||
                        (user.rtoUsername && (user.rtoPassword || user.avelingPassword)) ||
                        (user.avelingUsername && user.avelingPassword) ||
                        (credential && credential.lmsUsername));
                    if (enrollmentLetterSent && credentialsSent) {
                        // Mark as sent immediately to ensure it is sent just once
                        prefs.email12bSent = true;
                        prefs.email12bSentAt = new Date().toISOString();
                        await user.update({ preferences: prefs });
                        // Retrieve details for email 12b
                        let employerName = contract?.company;
                        let role = contract?.role;
                        if (!employerName || !role) {
                            try {
                                const { Application } = require('../models/Application');
                                const { JobListing } = require('../models/JobListing');
                                const app = await Application.findOne({
                                    where: { userId: user.id },
                                    include: [{ model: JobListing, as: 'JobListing' }],
                                    order: [['createdAt', 'DESC']]
                                });
                                if (app) {
                                    if (!employerName && app.JobListing?.company) {
                                        employerName = app.JobListing.company;
                                    }
                                    if (!role && app.JobListing?.title) {
                                        role = app.JobListing.title;
                                    }
                                }
                            }
                            catch (appErr) {
                                console.error('[LmsAuthService] Failed to load application details for email 12b:', appErr);
                            }
                        }
                        if (!employerName) {
                            try {
                                const { Employer } = require('../models/Employer');
                                const employingEmployer = await Employer.findOne({
                                    where: {
                                        [sequelize_1.Op.or]: [
                                            { isEmploying: true },
                                            { is_employing: true }
                                        ]
                                    }
                                });
                                if (employingEmployer) {
                                    employerName = employingEmployer.name;
                                }
                            }
                            catch (e) { }
                        }
                        employerName = employerName || 'MACA Limited';
                        role = role || 'Mining & Civil Infrastructure Operations';
                        const subsidyPercentage = user.subsidyPercentage || 70;
                        let amountAUD = 720.00;
                        try {
                            const { Ticket } = require('../models/Ticket');
                            const tickets = await Ticket.findAll({
                                where: { userId: user.id, status: 'not_possessed' }
                            });
                            if (tickets && tickets.length > 0) {
                                const candidateSub = 100 - subsidyPercentage;
                                let totalCandidateAud = 0;
                                tickets.forEach((t) => {
                                    const price = t.realPrice || t.purchasePrice || 0;
                                    totalCandidateAud += price * (candidateSub / 100);
                                });
                                if (totalCandidateAud > 0) {
                                    amountAUD = totalCandidateAud;
                                }
                            }
                        }
                        catch (tickErr) {
                            console.error('[LmsAuthService] Failed to calculate ticket amount for email 12b:', tickErr);
                        }
                        // Dispatch Email 12b
                        const { sendEmployerRefundAndSponsorshipTermsMail } = require('../utils/email');
                        sendEmployerRefundAndSponsorshipTermsMail(user.email, user.fullName, {
                            employerName,
                            role,
                            subsidyPercentage,
                            amountAUD
                        }).then(() => {
                            console.log(`[LmsAuthService] Successfully dispatched email 12b to ${user.email} on first RTO LMS login.`);
                        }).catch((err) => {
                            console.error(`[LmsAuthService] Email 12b failed for user ${user.id}:`, err);
                        });
                    }
                }
            }
            catch (triggerErr) {
                console.error('[LmsAuthService] Error in Email 12b first-login check:', triggerErr);
            }
        }
        const activeUsername = user.rtoUsername || user.avelingUsername || credential?.lmsUsername || user.candidateNumber || user.email;
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
