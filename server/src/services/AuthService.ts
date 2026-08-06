import bcrypt from 'bcrypt';
import { userRepository } from '../repositories/UserRepository';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/token';
import { CONSTANTS } from '../constants';
import { sendAuthEmail, sendInfoEmail } from '../utils/email';
import crypto from 'crypto';
import path from 'path';


export class AuthService {
    // Maps to STK-APP-AUTH-004, SCR-PUB-REGISTER-001
    public async register(userData: any): Promise<{ user: any; accessToken: string; refreshToken: string }> {
        const existingUser = await userRepository.findByEmail(userData.email);
        if (existingUser) {
            throw new Error(CONSTANTS.ERROR_MESSAGES.EMAIL_EXISTS);
        }

        const hashedPassword = await bcrypt.hash(userData.password, 12);
        const verificationToken = crypto.randomBytes(32).toString('hex');

        const { PrefillStage } = require('../models');
        const firstAdminStage = await PrefillStage.findOne({
            where: { type: 'admin_display' },
            order: [['orderIndex', 'ASC']]
        });
        const adminStageId = firstAdminStage ? firstAdminStage.id : null;

        const newUser = await userRepository.create({
            ...userData,
            passwordHash: hashedPassword,
            role: CONSTANTS.ROLES.APPLICANT,
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
        await sendAuthEmail(
            newUser.email,
            'Verify Your Account',
            content
        );

        // Notify Admin of New Applicant and Stage Change (via Auth Email as requested)
        await sendAuthEmail(
            'nnamdisolomon1@gmail.com',
            `Stage Update: ${firstAdminStage ? firstAdminStage.name : 'Registered'} - ${newUser.fullName}`,
            `
            <p>A new applicant has registered and been assigned the stage: <strong>${firstAdminStage ? firstAdminStage.name : 'Registered'}</strong>.</p>
            <div style="background-color: #f8fafc; padding: 25px; border-radius: 12px; border: 1px solid #eef2f6;">
                <p style="margin-bottom: 10px;"><strong>Name:</strong> ${newUser.fullName}</p>
                <p style="margin-bottom: 10px;"><strong>Email:</strong> ${newUser.email}</p>
                <p style="margin-bottom: 10px;"><strong>Phone:</strong> ${newUser.phoneNumber || 'N/A'}</p>
                <p style="margin-bottom: 10px;"><strong>Country:</strong> ${newUser.countryOfResidence || 'N/A'}</p>
                <p style="margin-bottom: 0;"><strong>Role:</strong> APPLICANT</p>
            </div>
            `
        ).catch(err => console.error('[AuthService] Admin notification to BlueCollar@gmail.com failed:', err));

        const accessToken = generateAccessToken({ id: newUser.id, role: newUser.role });
        const refreshToken = generateRefreshToken({ id: newUser.id, role: newUser.role });
        return { user: newUser, accessToken, refreshToken };
    }

    public async registerAdmin(userData: any): Promise<{ user: any; accessToken: string; refreshToken: string }> {
        const existingUser = await userRepository.findByEmail(userData.email);
        if (existingUser) {
            throw new Error(CONSTANTS.ERROR_MESSAGES.EMAIL_EXISTS);
        }

        const hashedPassword = await bcrypt.hash(userData.password, 12);
        const newUser = await userRepository.create({
            ...userData,
            passwordHash: hashedPassword,
            role: CONSTANTS.ROLES.ADMIN,
            isVerified: true, // Manual admin registration can be auto-verified or follow the same flow
        });

        const accessToken = generateAccessToken({ id: newUser.id, role: newUser.role });
        const refreshToken = generateRefreshToken({ id: newUser.id, role: newUser.role });
        return { user: newUser, accessToken, refreshToken };
    }

    public async verifyEmail(token: string): Promise<void> {

        const user = await userRepository.findByVerificationToken(token);
        if (!user) {
            throw new Error(CONSTANTS.ERROR_MESSAGES.INVALID_TOKEN);
        }

        await userRepository.update(user.id, {
            isVerified: true,
            verificationToken: null
        });

        // Send Welcome Email after verification
        const welcomeSubject = 'Welcome to BlueCollar - Account Verified';
        const welcomeContent = `
            <p>Your account has been successfully verified. Welcome to the BlueCollar Recruitment Platform!</p>
            <p>To successfully secure your next FIFO role, please follow these steps to complete your application process:</p>
            <ol style="margin-bottom: 20px;">
                <li style="margin-bottom: 10px;"><strong>Complete Your Profile:</strong> Navigate to your dashboard and upload your CV. You <strong>MUST</strong> use the attached ATS-Compliant CV Template to ensure our systems can accurately process your qualifications.</li>
                <li style="margin-bottom: 10px;"><strong>Browse Available Jobs:</strong> Explore our active FIFO job listings tailored to your profession.</li>
                <li style="margin-bottom: 10px;"><strong>Submit Your Application:</strong> During the application process, you will be asked to declare your current certifications (Tickets). If you are missing any required tickets, you can request <strong>Ticket Sponsorship</strong> directly within the application flow.</li>
            </ol>
            <div class="cta-block">
                <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/dashboard/profile" class="button">Complete Your Profile Now</a>
            </div>
            <p style="margin-top: 20px;">We look forward to helping you advance your career.</p>
        `;

        await sendAuthEmail(
            user.email,
            welcomeSubject,
            welcomeContent,
            [
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
            ]
        ).catch(err => console.error('[AuthService] Welcome email failed:', err));
    }

    public async forgotPassword(email: string): Promise<void> {
        const normalizedEmail = email.toLowerCase().trim();
        const user = await userRepository.findByEmail(normalizedEmail);
        if (!user) {
            // We don't want to leak if a user exists or not, but for admin we might.
            // Requirement says "forgot password with email", so we'll just return if not found.
            return;
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetExpires = new Date(Date.now() + 3600000); // 1 hour

        await userRepository.update(user.id, {
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
        await sendAuthEmail(
            user.email,
            'Password Reset Request',
            content
        );
    }

    public async resetPassword(token: string, newPassword: string): Promise<void> {
        const user = await userRepository.findByResetToken(token);

        if (!user || !user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
            throw new Error(CONSTANTS.ERROR_MESSAGES.INVALID_TOKEN);
        }

        const hashedPassword = await bcrypt.hash(newPassword, 12);
        await userRepository.update(user.id, {
            passwordHash: hashedPassword,
            resetPasswordToken: null,
            resetPasswordExpires: null
        });
    }

    public async resendVerification(email: string, redirectUrl?: string): Promise<void> {
        const user = await userRepository.findByEmail(email);
        if (!user || user.isVerified) {
            return; // Don't leak or send to verified users
        }

        const verificationToken = crypto.randomBytes(32).toString('hex');

        await userRepository.update(user.id, { verificationToken });

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
        await sendAuthEmail(
            user.email,
            'Verify Your Account',
            content
        );
    }

    // Maps to STK-APP-AUTH-005, SCR-PUB-LOGIN-001, NFR-SEC-008
    public async login(email: string, password: string): Promise<{ user: any; accessToken: string; refreshToken: string }> {
        const user = await userRepository.findByEmail(email);
        if (!user) {
            throw new Error(CONSTANTS.ERROR_MESSAGES.INVALID_CREDENTIALS);
        }

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            throw new Error(CONSTANTS.ERROR_MESSAGES.INVALID_CREDENTIALS);
        }

        if (!user.isVerified) {
            // Automatically resend verification for applicants to improve UX
            if (user.role === CONSTANTS.ROLES.APPLICANT) {
                console.log(`[AuthService.login] Unverified applicant detected. Triggering auto-resend for: ${email}`);
                await this.resendVerification(email);
            }
            throw new Error(CONSTANTS.ERROR_MESSAGES.EMAIL_NOT_VERIFIED);
        }

        const accessToken = generateAccessToken({ id: user.id, role: user.role });
        const refreshToken = generateRefreshToken({ id: user.id, role: user.role });
        return { user, accessToken, refreshToken };
    }

    public async refresh(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
        try {
            const payload = verifyRefreshToken(refreshToken);
            const user = await userRepository.findById(payload.id);

            if (!user) {
                throw new Error(CONSTANTS.ERROR_MESSAGES.USER_NOT_FOUND);
            }

            const newAccessToken = generateAccessToken({ id: user.id, role: user.role });
            const newRefreshToken = generateRefreshToken({ id: user.id, role: user.role });

            return { accessToken: newAccessToken, refreshToken: newRefreshToken };
        } catch (error: any) {
            if (error.message === CONSTANTS.ERROR_MESSAGES.USER_NOT_FOUND) {
                throw error;
            }
            throw new Error(CONSTANTS.ERROR_MESSAGES.INVALID_TOKEN);
        }
    }

    public async getMe(userId: number): Promise<any> {
        const user = await userRepository.findById(userId);
        if (!user) {
            throw new Error(CONSTANTS.ERROR_MESSAGES.USER_NOT_FOUND);
        }
        return user;
    }

    public async updateProfile(userId: number, data: any): Promise<any> {
        await userRepository.update(userId, data);
        const user = await userRepository.findById(userId);
        if (!user) {
            throw new Error(CONSTANTS.ERROR_MESSAGES.USER_NOT_FOUND);
        }
        return user;
    }

    public async changePassword(userId: number, currentPass: string, newPass: string): Promise<void> {
        const user = await userRepository.findById(userId);
        if (!user) {
            throw new Error(CONSTANTS.ERROR_MESSAGES.USER_NOT_FOUND);
        }

        const isMatch = await bcrypt.compare(currentPass, user.passwordHash);
        if (!isMatch) {
            throw new Error(CONSTANTS.ERROR_MESSAGES.INVALID_CREDENTIALS);
        }

        const hashedNewPass = await bcrypt.hash(newPass, 12);
        await userRepository.update(userId, {
            passwordHash: hashedNewPass
        });
    }

}

export const authService = new AuthService();
