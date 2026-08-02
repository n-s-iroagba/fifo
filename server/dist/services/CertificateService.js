"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CertificateService = void 0;
const Certificate_1 = require("../models/Certificate");
const CertificationGap_1 = require("../models/CertificationGap");
const uuid_1 = require("uuid");
class CertificateService {
    static async getLearnerCertificates(userId) {
        return await Certificate_1.Certificate.findAll({
            where: { userId }
        });
    }
    static async issueCertificate(userId, certificationTypeId) {
        // Implement full logic to check if all courses are passed.
        // Mock verification here
        const isQualified = true;
        if (!isQualified)
            throw new Error('REQUIREMENTS_NOT_MET');
        const cert = await Certificate_1.Certificate.create({
            userId,
            certificationTypeId,
            certificateNumber: `CERT-${(0, uuid_1.v4)().split('-')[0].toUpperCase()}`,
            issueDate: new Date(),
            expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 2)),
            status: 'Valid',
            downloadUrl: 'https://example.com/cert.pdf'
        });
        // Update gap
        const gap = await CertificationGap_1.CertificationGap.findOne({
            where: { userId, certificationTypeId, status: 'Missing' }
        });
        if (gap) {
            gap.status = 'Valid';
            await gap.save();
        }
        return cert;
    }
}
exports.CertificateService = CertificateService;
