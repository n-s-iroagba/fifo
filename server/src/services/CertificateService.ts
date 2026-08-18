import { Certificate } from '../models/Certificate';
import { Ticket } from '../models/Ticket';
import { CertificationType } from '../models/CertificationType';
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

        // Update ticket if exists
        const certType = await CertificationType.findByPk(certificationTypeId);
        if (certType) {
            const ticket = await Ticket.findOne({
                where: { userId, ticketType: certType.name, status: 'not_possessed' }
            });
            
            if (ticket) {
                ticket.status = 'possessed';
                ticket.ticketSponsorship = 'ticket_issued';
                await ticket.save();
            }
        }

        return cert;
    }
}
