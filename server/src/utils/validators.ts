import { z } from 'zod';
import { CONSTANTS } from '../constants';

// Mapped to TRUST-001 (File validation) and TRUST-003, TRUST-007
export const PaymentProofSchema = z.object({
    proofUrl: z.string().url(),
    format: z.string().refine((val) => CONSTANTS.FILE_CONSTRAINTS.ALLOWED_IMAGE_TYPES.includes(val), {
        message: 'Invalid file format for payment proof',
    }),
    sizeMB: z.number().max(CONSTANTS.FILE_CONSTRAINTS.PAYMENT_LIMIT_MB, 'File size exceeds 10MB limit'),
});

// Mapped to STK-APP-AUTH-004, STK-APP-AUTH-005
export const RegisterSchema = z.object({
    fullName: z.string().min(2, 'Full name must be at least 2 characters'),
    email: z.string().email('Invalid email format'),
    password: z.string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number')
        .regex(/[\W_]/, 'Password must contain at least one special character'),
});

// Mapped to STK-ADM-JOB-002, STK-ADM-JOB-003
export const JobListingSchema = z.object({
    title: z.string().min(5),
    description: z.string().min(20),
    location: z.string().optional(),
    employmentType: z.string(),
    requirements: z.string(),
    categoryId: z.number().int().positive(),
    isActive: z.boolean().default(true)
});

// File validator helper
export const validateFileTypeAndSize = (mimeType: string, sizeBytes: number, isCV: boolean = false) => {
    const sizeMB = sizeBytes / (1024 * 1024);

    if (isCV) {
        if (!CONSTANTS.FILE_CONSTRAINTS.ALLOWED_CV_TYPES.includes(mimeType)) throw new Error('Invalid CV format. Use PDF or DOCX.');
        if (sizeMB > CONSTANTS.FILE_CONSTRAINTS.CV_LIMIT_MB) throw new Error(`CV exceeds ${CONSTANTS.FILE_CONSTRAINTS.CV_LIMIT_MB}MB limit.`);
    } else {
        if (!CONSTANTS.FILE_CONSTRAINTS.ALLOWED_IMAGE_TYPES.includes(mimeType)) throw new Error('Invalid payment format. Use JPEG, PNG, or PDF.');
        if (sizeMB > CONSTANTS.FILE_CONSTRAINTS.PAYMENT_LIMIT_MB) throw new Error(`Payment proof exceeds ${CONSTANTS.FILE_CONSTRAINTS.PAYMENT_LIMIT_MB}MB limit.`);
    }
    return true;
};
