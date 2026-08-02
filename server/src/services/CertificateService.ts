import { Certificate } from '../models/Certificate';
import { CertificationGap } from '../models/CertificationGap';
import { v4 as uuidv4 } from 'uuid';

export class CertificateService {
    static async getLearnerCertificates(userId: number) {
        return await Certificate.findAll({
            where: { userId }
        });
    }

    static async issueCertificate(userId: number, certificationTypeId: string) {
        // Implement full logic to check if all courses are passed.
        // Mock verification here
        const isQualified = true; 
        if (!isQualified) throw new Error('REQUIREMENTS_NOT_MET');

        const cert = await Certificate.create({
            userId,
            certificationTypeId,
            certificateNumber: `CERT-${uuidv4().split('-')[0].toUpperCase()}`,
            issueDate: new Date(),
            expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 2)),
            status: 'Valid',
            downloadUrl: 'https://example.com/cert.pdf'
        });

        // Update gap
        const gap = await CertificationGap.findOne({
            where: { userId, certificationTypeId, status: 'Missing' }
        });
        
        if (gap) {
            gap.status = 'Valid';
            await gap.save();
        }

        return cert;
    }
}
