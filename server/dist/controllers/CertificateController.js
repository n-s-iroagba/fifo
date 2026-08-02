"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.certificateController = exports.CertificateController = void 0;
const CertificateService_1 = require("../services/CertificateService");
const constants_1 = require("../constants");
class CertificateController {
    // GET /api/certificates/learner/me
    async getMyCertificates(req, res, next) {
        try {
            const userId = req.user?.id;
            if (!userId)
                throw new Error('UNAUTHORIZED_ACCESS');
            const data = await CertificateService_1.CertificateService.getLearnerCertificates(userId);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json({ success: true, data });
        }
        catch (error) {
            next(error);
        }
    }
    // POST /api/certificates/issue
    async issueCertificate(req, res, next) {
        try {
            const data = await CertificateService_1.CertificateService.issueCertificate(req.body.userId, req.body.certificationTypeId);
            res.status(constants_1.CONSTANTS.HTTP_STATUS.OK).json({ success: true, data });
        }
        catch (error) {
            if (error.message === 'REQUIREMENTS_NOT_MET')
                return res.status(400).json({ code: 400, message: 'Requirements for certification not met.' });
            next(error);
        }
    }
}
exports.CertificateController = CertificateController;
exports.certificateController = new CertificateController();
