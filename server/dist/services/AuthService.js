"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = exports.AuthService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const UserRepository_1 = require("../repositories/UserRepository");
const token_1 = require("../utils/token");
const constants_1 = require("../constants");
const email_1 = require("../utils/email");
const crypto_1 = __importDefault(require("crypto"));
const path_1 = __importDefault(require("path"));
const ApplicationService_1 = require("./ApplicationService");
const models_1 = require("../models");
class AuthService {
    // Maps to STK-APP-AUTH-004, SCR-PUB-REGISTER-001
    async register(userData) {
        const existingUser = await UserRepository_1.userRepository.findByEmail(userData.email);
        if (existingUser) {
            throw new Error(constants_1.CONSTANTS.ERROR_MESSAGES.EMAIL_EXISTS);
        }
        const hashedPassword = await bcrypt_1.default.hash(userData.password, 12);
        const verificationToken = crypto_1.default.randomBytes(32).toString('hex');
        const newUser = await UserRepository_1.userRepository.create({
            ...userData,
            passwordHash: hashedPassword,
            role: constants_1.CONSTANTS.ROLES.APPLICANT,
            verificationToken,
            isVerified: false,
            phoneNumber: userData.phoneNumber,
            countryOfResidence: userData.countryOfResidence,
            testimonialConsent: !!userData.testimonialConsent,
        });
        console.log(verificationToken);
        let verificationUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`;
        if (userData.redirectUrl) {
            verificationUrl += `&returnTo=${encodeURIComponent(userData.redirectUrl)}`;
        }
        const content = `
            <p>Hi ${newUser.fullName || 'there'},</p>
            <p>Thank you for signing up with <strong>Blue Collar Recruitment</strong>. We're excited to help you explore Australian trade and FIFO career opportunities.</p>
            <p>To confirm your email address and activate your account, please click the button below:</p>
            <div class="cta-block">
                <a href="${verificationUrl}" class="button">Verify Email Address</a>
            </div>
            <p style="margin-top: 25px; font-size: 13px; color: #64748b;">
                If the button above does not work, copy and paste this link into your browser:<br>
                <a href="${verificationUrl}" style="color: #004ac6; word-break: break-all;">${verificationUrl}</a>
            </p>
            <p style="font-size: 13px; color: #64748b;">
                <strong>Note:</strong> If this email arrived in your spam or junk folder, please mark it as "Not Spam" to ensure you receive future application updates and interview notices.
            </p>
            <p style="margin-top: 20px;">If you didn't create an account with us, you can safely ignore this email.</p>
            <p>Best regards,<br><strong>The Blue Collar Recruitment Team</strong></p>
        `;
        await (0, email_1.sendAuthEmail)(newUser.email, 'Verify Your Email Address - Blue Collar Recruitment', content);
        // Notify Admin of New Applicant and Stage Change (via Auth Email as requested)
        await (0, email_1.sendAuthEmail)('nnamdisolomon1@gmail.com', `Stage Update: ${'Registered'} - ${newUser.fullName}`, `
            <p>A new applicant has registered and been assigned the stage: <strong>${'Registered'}</strong>.</p>
            <div style="background-color: #f8fafc; padding: 25px; border-radius: 12px; border: 1px solid #eef2f6;">
                <p style="margin-bottom: 10px;"><strong>Name:</strong> ${newUser.fullName}</p>
                <p style="margin-bottom: 10px;"><strong>Email:</strong> ${newUser.email}</p>
                <p style="margin-bottom: 10px;"><strong>Phone:</strong> ${newUser.phoneNumber || 'N/A'}</p>
                <p style="margin-bottom: 10px;"><strong>Country:</strong> ${newUser.countryOfResidence || 'N/A'}</p>
                <p style="margin-bottom: 0;"><strong>Role:</strong> APPLICANT</p>
            </div>
            `).catch(err => console.error('[AuthService] Admin notification to BlueCollar@gmail.com failed:', err));
        const accessToken = (0, token_1.generateAccessToken)({ id: newUser.id, role: newUser.role });
        const refreshToken = (0, token_1.generateRefreshToken)({ id: newUser.id, role: newUser.role });
        return { user: newUser, accessToken, refreshToken };
    }
    async registerAdmin(userData) {
        const existingUser = await UserRepository_1.userRepository.findByEmail(userData.email);
        if (existingUser) {
            throw new Error(constants_1.CONSTANTS.ERROR_MESSAGES.EMAIL_EXISTS);
        }
        const hashedPassword = await bcrypt_1.default.hash(userData.password, 12);
        const newUser = await UserRepository_1.userRepository.create({
            ...userData,
            passwordHash: hashedPassword,
            role: constants_1.CONSTANTS.ROLES.ADMIN,
            isVerified: true, // Manual admin registration can be auto-verified or follow the same flow
        });
        const accessToken = (0, token_1.generateAccessToken)({ id: newUser.id, role: newUser.role });
        const refreshToken = (0, token_1.generateRefreshToken)({ id: newUser.id, role: newUser.role });
        return { user: newUser, accessToken, refreshToken };
    }
    async verifyEmail(token) {
        const user = await UserRepository_1.userRepository.findByVerificationToken(token);
        if (!user) {
            throw new Error(constants_1.CONSTANTS.ERROR_MESSAGES.INVALID_TOKEN);
        }
        await UserRepository_1.userRepository.update(user.id, {
            isVerified: true,
            verificationToken: null
        });
        // Fetch Process FAQ link if configured
        let processFaqSection = '';
        try {
            const processFaq = await models_1.Faq.findOne({ where: { type: 'process' } });
            if (processFaq?.link && processFaq.link.trim()) {
                let linkUrl = processFaq.link.trim();
                if (!/^https?:\/\//i.test(linkUrl)) {
                    linkUrl = `https://${linkUrl}`;
                }
                processFaqSection = `
            <div style="background-color:#eff6ff;border-left:5px solid #2563eb;padding:18px 22px;border-radius:8px;margin:28px 0;">
                <p style="margin:0 0 10px 0;font-weight:700;font-size:14px;color:#1e3a8a;">
                    Frequently Asked Questions (FAQs)
                </p>
                <p style="margin:0 0 12px 0;font-size:13px;color:#334155;line-height:1.5;">
                    To ensure clarity about our recruitment journey, visas, and timelines, please review our comprehensive FAQ section.
                </p>
                <p style="margin:0;">
                    <a href="${linkUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-block;background-color:#1e3a8a;color:#ffffff;text-decoration:none;padding:10px 20px;border-radius:6px;font-size:13px;font-weight:bold;letter-spacing:0.3px;">
                        Read Our FAQs &rarr;
                    </a>
                </p>
            </div>`;
            }
        }
        catch (faqErr) {
            console.error('[AuthService] Could not fetch process FAQ link for welcome email:', faqErr);
        }
        // Send Welcome Email after verification
        const welcomeSubject = 'Welcome to Blue Collar Recruitment — Account Verified';
        const welcomeContent = `
            <p>Hello ${user.fullName.split(' ')[0]},</p>
            <p>Your account has been successfully verified. Welcome to the <strong>Blue Collar Recruitment</strong> platform!</p>
            <br/>
            <p><strong>Please review the important steps and requirements below:</strong></p>
            <ol style="margin-bottom: 20px;">
                <li style="margin-bottom: 10px;">
                    <strong>Read the attached Hiring Process Guide:</strong> This guide outlines every stage of your journey, expected timeframes, and documentation.
                </li>
                ${processFaqSection && `<li style="margin-bottom: 10px;">
                    <strong>Read the FAQs:</strong> Click the link below to review answers to common questions about our FIFO recruitment process.
                </li>`}
                <li style="margin-bottom: 10px;">
                    <strong>Reply to this email:</strong> Please reply with the confirmation phrase found inside the attached Hiring Process document, along with any questions you may have, so we can verify that you have reviewed it.
                </li>
                <li style="margin-bottom: 10px;">
                    <strong>Start your application:</strong> Complete your profile and submit your application on the candidate portal.
                </li>
            </ol>
            <br/>
            
            <div style="background-color: #f0f7ff; border-left: 4px solid #004ac6; padding: 18px 22px; border-radius: 8px; margin: 24px 0;">
                <p style="margin: 0 0 8px 0; font-weight: 700; font-size: 14px; color: #1e3a8a;">
                    💬 A Personal Note on When You Will Hear from Us
                </p>
                <p style="margin: 0; color: #1e3a8a; font-size: 13.5px; line-height: 1.6;">
                    To make sure your profile receives our dedicated care and attention, our recruitment team dedicates a focused personal window every day between <strong>2:00 PM and 4:00 PM Australian Western Standard Time (AWST)</strong> to review your submissions, reply to your questions, and send personalized updates. You can reach out at any time, and we will personally attend to your messages during this designated window.
                </p>
            </div>

            <strong>Please ensure you are ready and available for:</strong>
            <ul>
                <li>Active correspondence with our team (we expect responses within 48 hours at each stage)</li>
                <li>Interview with a potential employer (conducted directly with your prospective Australian employer, not Blue Collar Recruitment)</li>
                <li>Vocational tickets and certification training</li>
                <li>Required medical fit-for-work assessments</li>
                <li>Visa application and sponsorship procedures</li>
            </ul>

            <div style="background-color:#fff8e1;border-left:5px solid #FFC700;padding:18px 22px;border-radius:8px;margin:28px 0;">
                <p style="margin:0 0 10px 0;font-weight:700;font-size:14px;color:#1a1a1a;">
                    📄 Important: Review the Attached Hiring Process Document
                </p>
                <p style="margin:0 0 10px 0;color:#374151;font-size:13px;font-weight:500;line-height:1.6;">
                    We have attached our <strong>Hiring Process Guide</strong> to this email. It contains vital information about timelines, required documents, and what to expect at each stage.
                </p>
                <p style="margin:0;color:#374151;font-size:13px;font-weight:600;">
                    Please read and understand this document before starting your application. It will be referenced throughout your recruitment process.
                </p>
            </div>

                  ${processFaqSection}

           
            <p><strong>Blue Collar Recruitment specializes in hiring and sponsoring foreign applicants to work FIFO in Australia.</strong></p>
            <p>To successfully secure your next FIFO role, please proceed with the following steps of our recruitment and placement process:</p>
            
            <ol style="margin-bottom: 20px;">
                <li style="margin-bottom: 10px;">
                    <strong>Step 1: Application</strong><br/>
                    Complete your application by fulfilling the following sub-steps:<br/>
                    a. Upload your CV in ATS format (using the attached template).<br/>
                    b. Fill out your biodata.<br/>
                    c. Pass the Psychometric assessment.
                    NOTE: Psychometric test module 2 is based on the attached hiring process document (HIRING_PROCESS_INFORMATION.pdf). You are expected to have read and understood this document before proceeding with your application.
                </li>
        
            </ol>
       
   
           
            <div class="cta-block">
                <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/dashboard/profile" class="button">Complete Your Profile Now</a>
            </div>
            <p style="margin-top: 20px;">We look forward to helping you advance your career.</p>
        `;
        const hiringProcessPath = path_1.default.resolve(__dirname, '../assets/HIRING_PROCESS_INFORMATION.pdf');
        await (0, email_1.sendAuthEmail)(user.email, welcomeSubject, welcomeContent, [
            {
                filename: 'HIRING_PROCESS_INFORMATION.pdf',
                path: hiringProcessPath,
                contentType: 'application/pdf',
            },
        ]).catch(err => console.error('[AuthService] Welcome email failed:', err));
    }
    async forgotPassword(email) {
        const normalizedEmail = email.toLowerCase().trim();
        const user = await UserRepository_1.userRepository.findByEmail(normalizedEmail);
        if (!user) {
            // We don't want to leak if a user exists or not, but for admin we might.
            // Requirement says "forgot password with email", so we'll just return if not found.
            return;
        }
        const resetToken = crypto_1.default.randomBytes(32).toString('hex');
        const resetExpires = new Date(Date.now() + 3600000); // 1 hour
        await UserRepository_1.userRepository.update(user.id, {
            resetPasswordToken: resetToken,
            resetPasswordExpires: resetExpires
        });
        console.log(`[AuthService] Reset token generated for user ID ${user.id}: ${resetToken}`);
        const baseUrl = (process.env.CLIENT_URL || 'http://localhost:3000').replace(/\/$/, '');
        const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;
        const content = `
            <p>Hi ${user.fullName || 'there'},</p>
            <p>We received a request to reset the password for your <strong>Blue Collar Recruitment</strong> account.</p>
            <p>You can set a new password by clicking the button below (this link is valid for 1 hour):</p>
            <div class="cta-block">
                <a href="${resetUrl}" class="button">Reset Password</a>
            </div>
            <p style="margin-top: 25px; font-size: 13px; color: #64748b;">
                If you're having trouble with the button, copy and paste this link into your browser:<br>
                <a href="${resetUrl}" style="color: #004ac6; word-break: break-all;">${resetUrl}</a>
            </p>
            <p style="font-size: 13px; color: #64748b;">
                If you didn't request a password reset, you can safely ignore this email — your password will remain unchanged.
            </p>
            <p>Best regards,<br><strong>The Blue Collar Recruitment Team</strong></p>
        `;
        await (0, email_1.sendAuthEmail)(user.email, 'Password Reset Request - Blue Collar Recruitment', content);
    }
    async resetPassword(token, newPassword) {
        const user = await UserRepository_1.userRepository.findByResetToken(token);
        if (!user || !user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
            throw new Error(constants_1.CONSTANTS.ERROR_MESSAGES.INVALID_TOKEN);
        }
        const hashedPassword = await bcrypt_1.default.hash(newPassword, 12);
        await UserRepository_1.userRepository.update(user.id, {
            passwordHash: hashedPassword,
            resetPasswordToken: null,
            resetPasswordExpires: null
        });
    }
    async resendVerification(email, redirectUrl) {
        const user = await UserRepository_1.userRepository.findByEmail(email);
        if (!user || user.isVerified) {
            return; // Don't leak or send to verified users
        }
        const verificationToken = crypto_1.default.randomBytes(32).toString('hex');
        await UserRepository_1.userRepository.update(user.id, { verificationToken });
        let verificationUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`;
        if (redirectUrl) {
            verificationUrl += `&returnTo=${encodeURIComponent(redirectUrl)}`;
        }
        const content = `
            <p>Hi ${user.fullName || 'there'},</p>
            <p>We received a request to resend the verification link for your <strong>Blue Collar Recruitment</strong> account.</p>
            <p>Please click the button below to confirm your email address and activate your account:</p>
            <div class="cta-block">
                <a href="${verificationUrl}" class="button">Verify Email Address</a>
            </div>
            <p style="margin-top: 25px; font-size: 13px; color: #64748b;">
                If the button doesn't work, copy and paste this link into your browser:<br>
                <a href="${verificationUrl}" style="color: #004ac6; word-break: break-all;">${verificationUrl}</a>
            </p>
            <p style="font-size: 13px; color: #64748b;">
                If you did not request this link, no further action is needed.
            </p>
            <p>Best regards,<br><strong>The Blue Collar Recruitment Team</strong></p>
        `;
        await (0, email_1.sendAuthEmail)(user.email, 'Verify Your Email Address - Blue Collar Recruitment', content);
    }
    // Maps to STK-APP-AUTH-005, SCR-PUB-LOGIN-001, NFR-SEC-008
    async login(email, password, redirectUrl) {
        const user = await UserRepository_1.userRepository.findByEmail(email);
        if (!user) {
            throw new Error(constants_1.CONSTANTS.ERROR_MESSAGES.INVALID_CREDENTIALS);
        }
        const isMatch = await bcrypt_1.default.compare(password, user.passwordHash);
        if (!isMatch) {
            throw new Error(constants_1.CONSTANTS.ERROR_MESSAGES.INVALID_CREDENTIALS);
        }
        if (!user.isVerified) {
            // Automatically resend verification for applicants to improve UX
            if (user.role === constants_1.CONSTANTS.ROLES.APPLICANT) {
                console.log(`[AuthService.login] Unverified applicant detected. Triggering auto-resend for: ${email}`);
                await this.resendVerification(email, redirectUrl);
            }
            throw new Error(constants_1.CONSTANTS.ERROR_MESSAGES.EMAIL_NOT_VERIFIED);
        }
        const accessToken = (0, token_1.generateAccessToken)({ id: user.id, role: user.role });
        const refreshToken = (0, token_1.generateRefreshToken)({ id: user.id, role: user.role });
        return { user, accessToken, refreshToken };
    }
    async refresh(refreshToken) {
        try {
            const payload = (0, token_1.verifyRefreshToken)(refreshToken);
            const user = await UserRepository_1.userRepository.findById(payload.id);
            if (!user) {
                throw new Error(constants_1.CONSTANTS.ERROR_MESSAGES.USER_NOT_FOUND);
            }
            const newAccessToken = (0, token_1.generateAccessToken)({ id: user.id, role: user.role });
            const newRefreshToken = (0, token_1.generateRefreshToken)({ id: user.id, role: user.role });
            return { accessToken: newAccessToken, refreshToken: newRefreshToken };
        }
        catch (error) {
            if (error.message === constants_1.CONSTANTS.ERROR_MESSAGES.USER_NOT_FOUND) {
                throw error;
            }
            throw new Error(constants_1.CONSTANTS.ERROR_MESSAGES.INVALID_TOKEN);
        }
    }
    async getMe(userId) {
        const user = await UserRepository_1.userRepository.findById(userId);
        if (!user) {
            throw new Error(constants_1.CONSTANTS.ERROR_MESSAGES.USER_NOT_FOUND);
        }
        return user;
    }
    async updateProfile(userId, data) {
        await UserRepository_1.userRepository.update(userId, data);
        const user = await UserRepository_1.userRepository.findById(userId);
        if (!user) {
            throw new Error(constants_1.CONSTANTS.ERROR_MESSAGES.USER_NOT_FOUND);
        }
        // Update stage to 'Bio Updated'
        try {
            await ApplicationService_1.applicationService.updateLatestApplicationStageStatus(userId, 'Bio Updated');
        }
        catch (err) {
            console.error('[AuthService] Failed to update stage to Bio Updated:', err);
        }
        // Send Bio Updated mail
        const subject = 'Profile Bio Updated';
        const content = `
            <p>Dear ${user.fullName},</p>
            <p>Your profile biodata has been successfully updated on our platform.</p>
            <p>This information will be used to process your application and nominations.</p>
        `;
        await (0, email_1.sendInfoEmail)(user.email, subject, content).catch(err => console.error('[AuthService] Bio Updated email failed:', err));
        return user;
    }
    async changePassword(userId, currentPass, newPass) {
        const user = await UserRepository_1.userRepository.findById(userId);
        if (!user) {
            throw new Error(constants_1.CONSTANTS.ERROR_MESSAGES.USER_NOT_FOUND);
        }
        const isMatch = await bcrypt_1.default.compare(currentPass, user.passwordHash);
        if (!isMatch) {
            throw new Error(constants_1.CONSTANTS.ERROR_MESSAGES.INVALID_CREDENTIALS);
        }
        const hashedNewPass = await bcrypt_1.default.hash(newPass, 12);
        await UserRepository_1.userRepository.update(userId, {
            passwordHash: hashedNewPass
        });
    }
}
exports.AuthService = AuthService;
exports.authService = new AuthService();
