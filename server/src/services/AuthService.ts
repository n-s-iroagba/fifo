import bcrypt from 'bcrypt';
import { userRepository } from '../repositories/UserRepository';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/token';
import { CONSTANTS } from '../constants';
import { sendAuthEmail, sendInfoEmail } from '../utils/email';
import crypto from 'crypto';
import path from 'path';
import { applicationService } from './ApplicationService';


export class AuthService {
    // Maps to STK-APP-AUTH-004, SCR-PUB-REGISTER-001
    public async register(userData: any): Promise<{ user: any; accessToken: string; refreshToken: string }> {
        const existingUser = await userRepository.findByEmail(userData.email);
        if (existingUser) {
            throw new Error(CONSTANTS.ERROR_MESSAGES.EMAIL_EXISTS);
        }

        const hashedPassword = await bcrypt.hash(userData.password, 12);
        const verificationToken = crypto.randomBytes(32).toString('hex');

        const newUser = await userRepository.create({
            ...userData,
            passwordHash: hashedPassword,
            role: CONSTANTS.ROLES.APPLICANT,
            verificationToken,
            isVerified: false,
            phoneNumber: userData.phoneNumber,
            countryOfResidence: userData.countryOfResidence,
        });
        console.log(verificationToken);

        let verificationUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`;
        if (userData.redirectUrl) {
            verificationUrl += `&returnTo=${encodeURIComponent(userData.redirectUrl)}`;
        }
        const content = `
            <p>Welcome to BlueCollar. We require a high-priority identity verification to activate your professional node.</p>
            <p style="font-size: 12px; color: #64748b;"><strong>Note:</strong> If mail found in spam, please mark as not spam to receive future communications and always check your spam folder for updates from BlueCollar and its partners.</p>
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
            `Stage Update: ${'Registered'} - ${newUser.fullName}`,
            `
            <p>A new applicant has registered and been assigned the stage: <strong>${'Registered'}</strong>.</p>
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
            <p><strong>Blue Collar Recruitment specializes in hiring and sponsoring foreign applicants to work FIFO in Australia.</strong></p>
            <p>To successfully secure your next FIFO role, please follow the 9 steps of our recruitment and placement process:</p>
            
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
                    <strong>Step 3: Apply For Ticket Sponsorship and Upload Possessed Tickets</strong><br/>
                    If you accept the nomination in Step 2, you will be required to apply for ticket sponsorship and upload your possessed tickets.
                </li>
                  <li style="margin-bottom: 10px;">
                    <strong>Step 4: Contract Signing</strong><br/>
                    If you accept the nomination in Step 2, a binding contract will be drafted and signed by both parties (Blue Collar and the Applicant).
                </li>
                <li style="margin-bottom: 10px;">
                    <strong>Step 5: Ticket Sponsorship Payment</strong><br/>
                    You shall pay your financial responsibility under the ticket sponsorship program. This can be paid in part (to be completed before taking the 4th ticket) or paid completely upfront at an extra 10% discount.<br/>
                    <em>Note: International payments from outside Australia are made using USDT crypto currency on the TRON network.</em>
                </li>
                <li style="margin-bottom: 10px;">
                    <strong>Step 6: Ticket Courses & Examination</strong><br/>
                    You must access the Aveling LMS portal to complete all required training modules and pass the respective theoretical and practical examinations for your assigned tickets.
                </li>
                <li style="margin-bottom: 10px;">
                    <strong>Step 7: Voice Call Interview</strong><br/>
                    A brief voice call interview will be conducted to verify your training outcomes, application details, and suitability.
                </li>
                <li style="margin-bottom: 10px;">
                    <strong>Step 8: Ticket Delivery</strong><br/>
                    Upon successfully completing the voice call and all requirements, your physical tickets/certifications will be delivered to your specified address anywhere in the globe.
                </li>
                <li style="margin-bottom: 10px;">
                    <strong>Step 9: Visa Sponsorship & Processing</strong><br/>
                    A separate email will be sent detailing the Visa Sponsorship and Processing steps as you prepare for deployment.
                </li>
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
    public async login(email: string, password: string, redirectUrl?: string): Promise<{ user: any; accessToken: string; refreshToken: string }> {
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
                await this.resendVerification(email, redirectUrl);
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

        // Update stage to 'Bio Updated'
        try {
            await applicationService.updateLatestApplicationStageStatus(userId, 'Bio Updated');
        } catch (err) {
            console.error('[AuthService] Failed to update stage to Bio Updated:', err);
        }

        // Send Bio Updated mail
        const subject = 'Profile Bio Updated';
        const content = `
            <p>Dear ${user.fullName},</p>
            <p>Your profile biodata has been successfully updated on our platform.</p>
            <p>This information will be used to process your application and nominations.</p>
        `;
        await sendInfoEmail(user.email, subject, content).catch(err => console.error('[AuthService] Bio Updated email failed:', err));

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
