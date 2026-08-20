"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cvService = exports.CvService = void 0;
const UserRepository_1 = require("../repositories/UserRepository");
const constants_1 = require("../constants");
const ApplicationService_1 = require("./ApplicationService");
const email_1 = require("../utils/email");
class CvService {
    // Maps to STK-APP-CV-001, STK-APP-CV-002, STK-APP-CV-003
    async uploadCv(userId, cvUrl, fileType, fileSizeMb) {
        if (fileSizeMb > constants_1.CONSTANTS.FILE_CONSTRAINTS.CV_LIMIT_MB) {
            throw new Error(constants_1.CONSTANTS.ERROR_MESSAGES.VALIDATION_ERROR);
        }
        const user = await UserRepository_1.userRepository.findById(userId);
        if (!user)
            throw new Error(constants_1.CONSTANTS.ERROR_MESSAGES.RESOURCE_NOT_FOUND);
        await UserRepository_1.userRepository.update(userId, { cvUrl });
        const updatedUser = await UserRepository_1.userRepository.findById(userId);
        // Update stage to 'Cv uploaded'
        try {
            await ApplicationService_1.applicationService.updateLatestApplicationStageStatus(userId, 'Cv uploaded');
        }
        catch (err) {
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
            await (0, email_1.sendInfoEmail)(updatedUser.email, subject, content).catch(err => console.error('[CvService] CV Uploaded email failed:', err));
        }
        return updatedUser;
    }
    // Maps to STK-APP-CV-001 (Read)
    async getCv(userId) {
        const user = await UserRepository_1.userRepository.findById(userId);
        if (!user || !user.cvUrl)
            return null;
        const cvUrl = user.cvUrl;
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
    async updateCv(userId, cvUrl, fileType, fileSizeMb) {
        return this.uploadCv(userId, cvUrl, fileType, fileSizeMb);
    }
    // Maps to STK-APP-CV-001 (Delete) — REG-004: right to data deletion
    async deleteCv(userId) {
        const user = await UserRepository_1.userRepository.findById(userId);
        if (!user)
            throw new Error(constants_1.CONSTANTS.ERROR_MESSAGES.RESOURCE_NOT_FOUND);
        await UserRepository_1.userRepository.update(userId, { cvUrl: null });
    }
}
exports.CvService = CvService;
exports.cvService = new CvService();
