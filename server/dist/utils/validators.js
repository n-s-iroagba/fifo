"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateFileTypeAndSize = exports.JobListingSchema = exports.RegisterSchema = exports.PaymentProofSchema = void 0;
const zod_1 = require("zod");
const constants_1 = require("../constants");
// Mapped to TRUST-001 (File validation) and TRUST-003, TRUST-007
exports.PaymentProofSchema = zod_1.z.object({
    proofUrl: zod_1.z.string().url(),
    format: zod_1.z.string().refine((val) => constants_1.CONSTANTS.FILE_CONSTRAINTS.ALLOWED_IMAGE_TYPES.includes(val), {
        message: 'Invalid file format for payment proof',
    }),
    sizeMB: zod_1.z.number().max(constants_1.CONSTANTS.FILE_CONSTRAINTS.PAYMENT_LIMIT_MB, 'File size exceeds 10MB limit'),
});
// Mapped to STK-APP-AUTH-004, STK-APP-AUTH-005
exports.RegisterSchema = zod_1.z.object({
    fullName: zod_1.z.string().min(2, 'Full name must be at least 2 characters'),
    email: zod_1.z.string().email('Invalid email format'),
    password: zod_1.z.string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number')
        .regex(/[\W_]/, 'Password must contain at least one special character'),
});
// Mapped to STK-ADM-JOB-002, STK-ADM-JOB-003
exports.JobListingSchema = zod_1.z.object({
    title: zod_1.z.string().min(5),
    description: zod_1.z.string().min(20),
    location: zod_1.z.string().optional(),
    employmentType: zod_1.z.string(),
    requirements: zod_1.z.string(),
    categoryId: zod_1.z.number().int().positive(),
    isActive: zod_1.z.boolean().default(true)
});
// File validator helper
const validateFileTypeAndSize = (mimeType, sizeBytes, isCV = false) => {
    const sizeMB = sizeBytes / (1024 * 1024);
    if (isCV) {
        if (!constants_1.CONSTANTS.FILE_CONSTRAINTS.ALLOWED_CV_TYPES.includes(mimeType))
            throw new Error('Invalid CV format. Use PDF or DOCX.');
        if (sizeMB > constants_1.CONSTANTS.FILE_CONSTRAINTS.CV_LIMIT_MB)
            throw new Error(`CV exceeds ${constants_1.CONSTANTS.FILE_CONSTRAINTS.CV_LIMIT_MB}MB limit.`);
    }
    else {
        if (!constants_1.CONSTANTS.FILE_CONSTRAINTS.ALLOWED_IMAGE_TYPES.includes(mimeType))
            throw new Error('Invalid payment format. Use JPEG, PNG, or PDF.');
        if (sizeMB > constants_1.CONSTANTS.FILE_CONSTRAINTS.PAYMENT_LIMIT_MB)
            throw new Error(`Payment proof exceeds ${constants_1.CONSTANTS.FILE_CONSTRAINTS.PAYMENT_LIMIT_MB}MB limit.`);
    }
    return true;
};
exports.validateFileTypeAndSize = validateFileTypeAndSize;
