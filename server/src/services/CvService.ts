import { userRepository } from '../repositories/UserRepository';
import { CONSTANTS } from '../constants';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { screenCV } from '../utils/cvScreening';
import { applicationService } from './ApplicationService';
import { sendInfoEmail } from '../utils/email';

export class CvService {
    // Maps to STK-APP-CV-001, STK-APP-CV-002, STK-APP-CV-003
    public async uploadCv(userId: number, cvUrl: string, fileType: string, fileSizeMb: number): Promise<any> {
        if (fileSizeMb > CONSTANTS.FILE_CONSTRAINTS.CV_LIMIT_MB) {
            throw new Error(CONSTANTS.ERROR_MESSAGES.VALIDATION_ERROR);
        }

        const user = await userRepository.findById(userId);
        if (!user) throw new Error(CONSTANTS.ERROR_MESSAGES.RESOURCE_NOT_FOUND);

        await userRepository.update(userId, { cvUrl });
        const updatedUser = await userRepository.findById(userId);

        // Update stage to 'Cv uploaded'
        try {
            await applicationService.updateLatestApplicationStageStatus(userId, 'Cv uploaded');
        } catch (err) {
            console.error('[CvService] Failed to update stage to Cv uploaded:', err);
        }

        // Send CV Uploaded mail
        if (updatedUser) {
            const subject = 'CV Successfully Uploaded';
            const content = `
                <p>Dear ${updatedUser.fullName},</p>
                <p>Your CV has been successfully uploaded to your profile.</p>
                <p>Our team will review your document shortly as part of your application process.</p>
            `;
            await sendInfoEmail(updatedUser.email, subject, content).catch(err => console.error('[CvService] CV Uploaded email failed:', err));
        }

        return updatedUser;
    }

    // Maps to STK-APP-CV-001 (Read)
    public async getCv(userId: number): Promise<any> {
        const user = await userRepository.findById(userId);
        if (!user || !(user as any).cvUrl) return null;

        const cvUrl = (user as any).cvUrl;
        // Basic Metadata derivation
        return {
            id: user.id,
            fileUrl: cvUrl,
            fileName: cvUrl.split('/').pop() || 'resume.pdf',
            fileSize: 1024 * 1024 * 1.2, // Fallback placeholder (1.2MB)
            createdAt: user.updatedAt || new Date()
        };
    }

    // Maps to STK-APP-CV-001 (Update) — STK-APP-CV-004: replaces existing CV for all linked applications
    public async updateCv(userId: number, cvUrl: string, fileType: string, fileSizeMb: number): Promise<any> {
        return this.uploadCv(userId, cvUrl, fileType, fileSizeMb);
    }

    // Maps to STK-APP-CV-001 (Delete) — REG-004: right to data deletion
    public async deleteCv(userId: number): Promise<void> {
        const user = await userRepository.findById(userId);
        if (!user) throw new Error(CONSTANTS.ERROR_MESSAGES.RESOURCE_NOT_FOUND);
        await userRepository.update(userId, { cvUrl: null });
    }
}

export const cvService = new CvService();
