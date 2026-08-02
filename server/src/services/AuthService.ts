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

        // Send Verification Email
        const verificationUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`;
        const content = `
            <p>Welcome to BlueCollarRecruitment. We require a high-priority identity verification to activate your professional node.</p>
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

        // Notify Admin of New Applicant (via Auth Email as requested)
        await sendAuthEmail(
            'BlueCollarRecruitment@gmail.com',
            'Internal Alert: New Applicant Registered',
            `
            <p>A new professional identity has entered the recruitment pipeline.</p>
            <div style="background-color: #f8fafc; padding: 25px; border-radius: 12px; border: 1px solid #eef2f6;">
                <p style="margin-bottom: 10px;"><strong>Name:</strong> ${newUser.fullName}</p>
                <p style="margin-bottom: 10px;"><strong>Email:</strong> ${newUser.email}</p>
                <p style="margin-bottom: 0;"><strong>Role:</strong> APPLICANT</p>
            </div>
            `
        ).catch(err => console.error('[AuthService] Admin notification to BlueCollarRecruitment@gmail.com failed:', err));

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
        const welcomeSubject = 'Welcome to BlueCollarRecruitment - Activate Your Node';
        const welcomeContent = `
            <p>Your professional node has been successfully verified. To fully activate your profile and become visible to our elite partner network, you must complete your biodata and upload your CV.</p>
            <p><strong>Strict Adherence Required:</strong> We require all applicants to follow our standardized CV template. This ensures algorithmic compatibility and professional clarity.</p>
            <div class="cta-block">
                <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/dashboard/profile" class="button">Complete Your Profile</a>
            </div>
            <p style="margin-top: 20px;">Attached to this email is the <strong>Universal Applicant CV Template</strong>. Please ensure your upload matches this structure exactly. Discrepancies will trigger a profile audit.</p>
            <p><strong>Note on Apex Network:</strong> High-impact talent may be eligible for the Apex Network. Members receive priority placement, asymmetric market intelligence, and access to unlisted shadow roles. You will be notified if your audit suggests Apex eligibility.</p>
        `;

        await sendAuthEmail(
            user.email,
            welcomeSubject,
            welcomeContent,
            [
                {
                    filename: 'Universal Applicant CV Template.docx',
                    path: path.join(__dirname, '../../../Universal Applicant CV Template.docx')
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
            <p>A cryptographic reset sequence has been initialized for your BlueCollarRecruitment account.</p>
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

    public async resendVerification(email: string): Promise<void> {
        const user = await userRepository.findByEmail(email);
        if (!user || user.isVerified) {
            return; // Don't leak or send to verified users
        }

        const verificationToken = crypto.randomBytes(32).toString('hex');

        await userRepository.update(user.id, { verificationToken });

        const verificationUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`;
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
