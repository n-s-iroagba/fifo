import { Request, Response, NextFunction } from 'express';
import { CertificateService } from '../services/CertificateService';
import { CONSTANTS } from '../constants';

export class CertificateController {
    // GET /api/certificates/learner/me
    async getMyCertificates(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req as any).user?.id;
            if (!userId) throw new Error('UNAUTHORIZED_ACCESS');
            const data = await CertificateService.getLearnerCertificates(userId);
            res.status(CONSTANTS.HTTP_STATUS.OK).json({ success: true, data });
        } catch (error: any) {
            next(error);
        }
    }

    // POST /api/certificates/issue
    async issueCertificate(req: Request, res: Response, next: NextFunction) {
        try {
            const data = await CertificateService.issueCertificate(req.body.userId, req.body.certificationTypeId);
            res.status(CONSTANTS.HTTP_STATUS.OK).json({ success: true, data });
        } catch (error: any) {
            if (error.message === 'REQUIREMENTS_NOT_MET') return res.status(400).json({ code: 400, message: 'Requirements for certification not met.' });
            next(error);
        }
    }
}
export const certificateController = new CertificateController();
