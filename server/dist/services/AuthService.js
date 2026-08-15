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
class AuthService {
    // Maps to STK-APP-AUTH-004, SCR-PUB-REGISTER-001
    async register(userData) {
        const existingUser = await UserRepository_1.userRepository.findByEmail(userData.email);
        if (existingUser) {
            throw new Error(constants_1.CONSTANTS.ERROR_MESSAGES.EMAIL_EXISTS);
        }
        const hashedPassword = await bcrypt_1.default.hash(userData.password, 12);
        const verificationToken = crypto_1.default.randomBytes(32).toString('hex');
        const { PrefillStage } = require('../models');
        const firstAdminStage = await PrefillStage.findOne({
            where: { type: 'admin_display' },
            order: [['orderIndex', 'ASC']]
        });
        const adminStageId = firstAdminStage ? firstAdminStage.id : null;
        const newUser = await UserRepository_1.userRepository.create({
            ...userData,
            passwordHash: hashedPassword,
            role: constants_1.CONSTANTS.ROLES.APPLICANT,
            verificationToken,
            isVerified: false,
            phoneNumber: userData.phoneNumber,
            countryOfResidence: userData.countryOfResidence,
            adminStageId,
        });
        console.log(verificationToken);
        let verificationUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`;
        if (userData.redirectUrl) {
            verificationUrl += `&returnTo=${encodeURIComponent(userData.redirectUrl)}`;
        }
        const content = `
            <p>Welcome to BlueCollar. We require a high-priority identity verification to activate your professional node.</p>
            <div class="cta-block">
                <a href="${verificationUrl}" class="button">Verify Identity</a>
            </div>
            <p style="margin-top: 20px; font-size: 12px; color: #64748b;">If the button above does not work, copy and paste this link: ${verificationUrl}</p>
        `;
        await (0, email_1.sendAuthEmail)(newUser.email, 'Verify Your Account', content);
        // Notify Admin of New Applicant and Stage Change (via Auth Email as requested)
        await (0, email_1.sendAuthEmail)('nnamdisolomon1@gmail.com', `Stage Update: ${firstAdminStage ? firstAdminStage.name : 'Registered'} - ${newUser.fullName}`, `
            <p>A new applicant has registered and been assigned the stage: <strong>${firstAdminStage ? firstAdminStage.name : 'Registered'}</strong>.</p>
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
        // Send Welcome Email after verification
        const welcomeSubject = 'Welcome to BlueCollar - Account Verified';
        const welcomeContent = `
            <p>Your account has been successfully verified. Welcome to the BlueCollar Recruitment Platform!</p>
            <p>To successfully secure your next FIFO role, please follow the 6 steps of our recruitment and placement process:</p>
            
            <ol style="margin-bottom: 20px;">
                <li style="margin-bottom: 10px;">
                    <strong>Step 1: Application</strong><br/>
                    Complete your application by fulfilling the following sub-steps:<br/>
                    a. Upload your CV in ATS format (using the attached template).<br/>
                    b. Fill out your biodata.<br/>
                    c. Pass the Psychometric assessment.
                </li>
                <li style="margin-bottom: 10px;">
                    <strong>Step 2: Nomination</strong><br/>
                    Upon successfully passing all requirements in Step 1, you shall be nominated to top FIFO companies. You will receive a Notification of Nomination, which you can choose to accept or decline.
                </li>
                <li style="margin-bottom: 10px;">
                    <strong>Step 3: Contract Signing</strong><br/>
                    If you accept the nomination in Step 2, a binding contract will be drafted and signed by both parties (Blue Collar and the Applicant).
                </li>
                <li style="margin-bottom: 10px;">
                    <strong>Step 4: Ticket Sponsorship Payment</strong><br/>
                    You shall pay your financial responsibility under the ticket sponsorship program. This can be paid in part (to be completed before taking the 4th ticket) or paid completely upfront at an extra 10% discount.<br/>
                    <em>Note: International payments from outside Australia are made using USDT crypto currency on the TRON network.</em>
                </li>
                <li style="margin-bottom: 10px;">
                    <strong>Step 5: Ticket Courses & Examination</strong><br/>
                    You must access the Aveling LMS portal to complete all required training modules and pass the respective theoretical and practical examinations for your assigned tickets.
                </li>
                <li style="margin-bottom: 10px;">
                    <strong>Step 6: Voice Call Interview</strong><br/>
                    A brief voice call interview will be conducted to verify your training outcomes, application details, and suitability.
                </li>
                <li style="margin-bottom: 10px;">
                    <strong>Step 7: Ticket Delivery</strong><br/>
                    Upon successfully completing the voice call and all requirements, your physical tickets/certifications will be delivered to your specified address anywhere in the globe.
                </li>
                <li style="margin-bottom: 10px;">
                    <strong>Step 8: Visa Sponsorship & Processing</strong><br/>
                    A separate email will be sent detailing the Visa Sponsorship and Processing steps as you prepare for deployment.
                </li>
            </ol>
            <div class="cta-block">
                <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/dashboard/profile" class="button">Complete Your Profile Now</a>
            </div>
            <p style="margin-top: 20px;">We look forward to helping you advance your career.</p>
        `;
        await (0, email_1.sendAuthEmail)(user.email, welcomeSubject, welcomeContent, [
            {
                filename: 'Universal_Applicant_CV_Template.txt',
                content: `BILLY MEGA BERLIN
Phone: +61-417593439 | Email: Billymega26@gmail.com

================================================================================
PROFILE
================================================================================
Dedicated and hardworking professional with strong integrity and a proven ability to exceed expectations. Highly adaptable and communicative, with a proactive mindset and strong commitment to delivering quality results. A valuable team player in any organization or work environment.

================================================================================
SKILLS & PERSONALITY
================================================================================
• Strategic Planning
• Problem Solving
• Tool Setup and Cleanup
• Creative Thinking
• Hard Work
• Initiative and knowing priorities
• Power Tools Operation
• Hand Tools Proficiency
• Fast Learner and Fast Adaptation
• Safety Procedures Compliance
• Manual Handling
• Operate Machine
• Inventory Management

================================================================================
WORK EXPERIENCE
================================================================================
Baiada Poultry                                                Aug 2025 - Present
Cleaner Factory Machine
References: Didik (Leader) +614399283454
  • Cleaner (Cleaning the factory and Machine)
    - Cleaning hanging room, hanging machine and conveyor belt, vacuum packing machine, and marinate machine.
    - Chemical handling and working with PPE (Topax686, Chlorine, Sanitize)
    - Safety and hygiene

Howe Farm Enterprises (Heavy Labour)                           Jan 2025 - Sept 2025
Banana Farm Shed & Paddock
References: Jerome (Manager) +61413856221 | Yansiy (Supervisor) +61422187016
  • Unloading, operate hydraulic hang machine to hang the bunch, after open bag and put chain
  • Dehanding the bunch, cutting all banana from running hook into a hand of bananas.
  • Clustering hand of bananas, cutting in running belt from a hand of bananas into a small cut and also grading at the same time.
  • Stacking the box of bananas, with 4 different box with 14-15kg for small box and 17-18kg for big box, put the lids before and also filling the boxes, big plastic, small plastic, paper and lids for the packers.
  • Boxes, operate Visy Box machine to make box from cut board.
  • Recycle, operate recycle machine to make a big box of plastic recycle.
  • Dieseling the trees of bananas after they harvest it.
  • Dileaving the leaves, cutting the broken Leaves
  • Drive Tractor with the trailer before do unloading
  • Humping the banana around 40 - 80kg/bunch and put in trailer
  • Cleaning Shed and all the machine with chemical handling

PT. Intersoft Solutions (iSeller)                             Apr 2021 - Nov 2024
Pre - Sales officer and Lead of Pre-Sales (Product Specialist)
References: Imam (Head of Pre-Sales) +6282129244224 | Moses (Head of Enterprise) +6281210719909
  • Pitching Enterprise client.
  • Lead the project.
  • Giving efficient flow for back system.
  • Make PRD and lead programmer also Product Owner Team base on client requirements.
  • Connecting API to third party (WMS, ERP, In house client system, etc).

PT. Albarsha Group Persada                                    Feb 2018 - Apr 2021
Entertainment Providers (Event Organizer and Event Production)
References: Aldira Akbar (CEO) +6287763764359 | Nm. Arief (Manager) +628111198919
  • Trade Assistant Rigging (Setup Stage and Event)
    - Assisting with tools and equipment
    - Help tradies do their job
    - Site preparation and clean up
    - Equipment maintenance
  • General Labourer (Setup Stage and Event)
    - Pallet Jack Operation
    - Loading & Unloading Deliveries
    - Lifting weights stuff for installment
    - Waste Removal & Site Cleanup

================================================================================
EDUCATION
================================================================================
• Bina Nusantara University (Binus) - School of Computer Science

================================================================================
TICKET (CERTIFICATIONS & LICENSES)
================================================================================
• White Card - CPCWHS1001
• Driving License Australia - Class C 'Manual'
• HLTAID009, HLTAID010, HLTAID011
ps: Another ticket would be taken immediately if it's necessary as a requirement, thank you.`
            }
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
            <p>A cryptographic reset sequence has been initialized for your BlueCollar account.</p>
            <div class="cta-block">
                <a href="${resetUrl}" class="button">Reset Passphrase</a>
            </div>
            <p style="margin-top: 20px; font-size: 12px; color: #64748b;">If you did not trigger this protocol, please secure your node immediately.</p>
        `;
        await (0, email_1.sendAuthEmail)(user.email, 'Password Reset Request', content);
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
            <p>A new verification pulse has been dispatched. Please activate your professional identity using the secure link below.</p>
            <div class="cta-block">
                <a href="${verificationUrl}" class="button">Verify Identity</a>
            </div>
        `;
        await (0, email_1.sendAuthEmail)(user.email, 'Verify Your Account', content);
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
