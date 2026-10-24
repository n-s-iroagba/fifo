"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendTicketCoursePassedEmail = exports.sendTicketCourseFailedEmail = exports.sendTicketCourseSubmittedEmail = exports.sendAvelingCredentialsEmail = exports.sendRtoCredentialsEmail = exports.sendContractApprovedEmail = exports.sendTicketSponsorshipApprovalMail = exports.sendSponsorshipReviewConfirmationMail = exports.sendTicketSponsorshipApplicationMail = exports.sendNominationApprovedEmail = exports.sendHowToExpressInterestEmail = exports.sendApplicationAcceptedEmail = exports.sendApplicationSubmittedEmail = exports.sendPsychoMod2PassedEmail = exports.sendPsychoMod2SubmittedEmail = exports.sendPsychoMod1PassedEmail = exports.sendBioReceivedEmail = exports.sendCVUploadEmail = exports.sendEOIReceivedEmail = exports.sendWelcomeApplicationFoundEmail = exports.sendVerificationEmail = exports.sendReceiptEmail = exports.sendInvoiceEmail = exports.sendEmail = exports.sendEmailFrom = exports.sendAvelingEmail = exports.sendEmployerEmail = exports.sendRtoEmail = exports.sendInfoEmail = exports.sendAuthEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const path_1 = __importDefault(require("path"));
const createTransporter = (user, pass) => {
    return nodemailer_1.default.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '465', 10),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
            user: user,
            pass: pass,
        },
    });
};
const authTransporter = createTransporter(process.env.SMTP_AUTH_USER, process.env.SMTP_AUTH_PASS);
const infoTransporter = createTransporter(process.env.SMTP_INFO_USER, process.env.SMTP_INFO_PASS);
const rtoTransporter = createTransporter(process.env.RTO_SMTP_USER || process.env.AV_SMTP_INFO_USER || process.env.SMTP_INFO_USER, process.env.RTO_SMTP_PASS || process.env.AV_SMTP_INFO_PASS || process.env.SMTP_INFO_PASS);
const employerTransporter = createTransporter(process.env.EMPLOYER_SMTP_USER || process.env.SMTP_INFO_USER, process.env.EMPLOYER_SMTP_PASS || process.env.SMTP_INFO_PASS);
// Self-Diagnostic: Verify connection on startup
authTransporter.verify((error, success) => {
    if (error) {
        console.error('[EmailUtil] Auth Transporter Connection Error:', error);
    }
    else {
        console.log('[EmailUtil] Auth Transporter ready to dispatch.');
    }
});
infoTransporter.verify((error, success) => {
    if (error) {
        console.error('[EmailUtil] Info Transporter Connection Error:', error);
    }
    else {
        console.log('[EmailUtil] Info Transporter ready to dispatch.');
    }
});
rtoTransporter.verify((error, success) => {
    if (error) {
        console.error('[EmailUtil] RTO Transporter Connection Error:', error);
    }
    else {
        console.log('[EmailUtil] RTO Transporter ready to dispatch.');
    }
});
employerTransporter.verify((error, success) => {
    if (error) {
        console.error('[EmailUtil] Employer Transporter Connection Error:', error);
    }
    else {
        console.log('[EmailUtil] Employer Transporter ready to dispatch.');
    }
});
console.log(`[EmailUtil] SMTP Decoupled Transporters (Auth, Info, RTO, Employer) Initialized.`);
const cleanHtmlContent = (content) => {
    let cleaned = content.trim();
    if (cleaned.startsWith('<p>') && cleaned.endsWith('</p>')) {
        const inner = cleaned.slice(3, -4).trim();
        if (/<(p|div|ul|ol|li|h[1-6]|table|blockquote|pre)/i.test(inner)) {
            cleaned = inner;
        }
    }
    return cleaned;
};
const getStandardEmailTemplate = (subject, content, fromType = 'info') => {
    const trimmed = content.trim();
    if (/^\s*<!DOCTYPE\s+html/i.test(trimmed) || /<html/i.test(trimmed) || /<body/i.test(trimmed)) {
        return content;
    }
    const cleanedContent = cleanHtmlContent(content);
    const isRto = fromType === 'rto' || fromType === 'aveling';
    const isEmployer = fromType === 'employer';
    let headerBgColor = '#0b3486';
    let accentColor = '#004ac6';
    let primaryColor = '#0b3486';
    let footerBrand = 'BlueCollar Infrastructure';
    let footerTag = 'SECURE RECRUITMENT PIPELINE PROTOCOL';
    let headerContent = `
        <div style="background-color: ${headerBgColor}; margin: 0; padding: 0; text-align: center;">
            <img src="${process.env.CLIENT_URL || 'http://localhost:3000'}/email-logo.jpg" alt="BlueCollar Infrastructure" style="display: block; width: 100%; height: auto; max-width: 600px; margin: 0 auto; outline: none; border: none; text-decoration: none;" />
        </div>
    `;
    if (isRto) {
        headerBgColor = '#0f172a';
        accentColor = '#ED9139';
        primaryColor = '#0f172a';
        footerBrand = 'CertHero Training & Assessment Systems (Accredited RTO Partner)';
        footerTag = 'NATIONALLY RECOGNISED TRAINING COMPLIANCE';
        headerContent = `
            <div style="padding: 28px 24px 22px; background: linear-gradient(135deg, #090d16 0%, #0f172a 100%); border-bottom: 3px solid #ED9139; text-align: center;">
                <div style="display: inline-block; font-family: 'Inter', Arial, sans-serif;">
                    <span style="color: #ffffff; font-size: 26px; font-weight: 900; letter-spacing: 0.18em; text-transform: uppercase;">CERT HERO</span>
                    <span style="display: block; color: #ED9139; font-size: 11px; font-weight: 800; letter-spacing: 0.22em; margin-top: 4px; text-transform: uppercase;">ACCREDITED RTO TRAINING PARTNER</span>
                </div>
            </div>
        `;
    }
    else if (isEmployer) {
        headerBgColor = '#18181b';
        accentColor = '#f59e0b';
        primaryColor = '#18181b';
        footerBrand = 'MACA Limited / Direct Australian Hiring Employer';
        footerTag = 'DIRECT RECRUITMENT & VISA SPONSORSHIP PORTFOLIO';
        headerContent = `
            <div style="padding: 28px 24px 22px; background: linear-gradient(135deg, #09090b 0%, #18181b 100%); border-bottom: 3px solid #f59e0b; text-align: center;">
                <div style="display: inline-block; font-family: 'Inter', Arial, sans-serif;">
                    <span style="color: #ffffff; font-size: 24px; font-weight: 900; letter-spacing: 0.16em; text-transform: uppercase;">MACA LIMITED</span>
                    <span style="display: block; color: #f59e0b; font-size: 11px; font-weight: 800; letter-spacing: 0.2em; margin-top: 4px; text-transform: uppercase;">MINING & INFRASTRUCTURE SERVICES - HOST EMPLOYER</span>
                </div>
            </div>
        `;
    }
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f7fb; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; }
            .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px -10px rgba(15, 23, 42, 0.12); border: 1px solid #e2e8f0; }
            .content { padding: 42px 40px; color: #334155; line-height: 1.7; font-size: 15px; }
            .footer { padding: 30px 40px; text-align: center; color: #64748b; font-size: 12px; border-top: 1px solid #f1f5f9; background-color: #f8fafc; line-height: 1.6; }
            h1 { color: ${primaryColor}; font-size: 22px; font-weight: 900; text-transform: uppercase; letter-spacing: 1.2px; margin-top: 0; margin-bottom: 24px; border-bottom: 2px solid ${accentColor}; display: inline-block; padding-bottom: 10px; }
            p { margin-bottom: 20px; color: #475569; font-weight: 500; }
            .cta-block { margin-top: 35px; text-align: center; margin-bottom: 15px; }
            .button { display: inline-block; padding: 16px 36px; background-color: ${accentColor}; color: #ffffff !important; text-decoration: none; border-radius: 10px; font-weight: 800; font-size: 13px; text-transform: uppercase; letter-spacing: 1.2px; box-shadow: 0 8px 16px -4px rgba(237, 145, 57, 0.35); transition: background-color 0.2s ease; }
            .button:hover { opacity: 0.9; }
        </style>
    </head>
    <body>
        <div class="container">
            ${headerContent}
            <div class="content">
                <h1>${subject}</h1>
                <div style="font-size: 15px; font-weight: 500;">
                    ${cleanedContent}
                </div>
            </div>
            <div class="footer">
                &copy; 2026 ${footerBrand}. All rights reserved.<br>
                <span style="font-weight: 800; color: ${primaryColor}; margin-top: 10px; display: block; letter-spacing: 1px;">${footerTag}</span>
            </div>
        </div>
    </body>
    </html>
    `;
};
const notifyAdminOfEmail = (recipient, originalSubject, fromType) => {
    const adminEmail = 'nnamdisolomon1@gmail.com';
    const content = `
        <div style="font-family: sans-serif; padding: 20px;">
            <h3>System Email Dispatch Notification</h3>
            <p>An automated email was successfully dispatched from the platform.</p>
            <ul>
                <li><strong>Recipient:</strong> ${recipient}</li>
                <li><strong>Subject:</strong> ${originalSubject}</li>
                <li><strong>Sent Via:</strong> ${fromType}</li>
                <li><strong>Timestamp:</strong> ${new Date().toISOString()}</li>
            </ul>
        </div>
    `;
    infoTransporter.sendMail({
        from: process.env.SMTP_INFO_FROM || '"BlueCollar Recruitment" <info@jobnexe.com>',
        to: adminEmail,
        subject: `[Log] Automated Email Sent to ${recipient}`,
        html: content
    }).catch(err => console.error('[EmailUtil] Failed to send admin notification:', err));
};
const sendAuthEmail = async (to, subject, content, attachments = []) => {
    try {
        await authTransporter.sendMail({
            from: process.env.SMTP_AUTH_FROM || '"BlueCollar Authentication" <donotreply@jobnexe.com>',
            to,
            subject,
            html: getStandardEmailTemplate(subject, content, 'auth'),
            attachments,
        });
        console.log(`[EmailUtil] Auth email dispatched to: ${to}`);
        notifyAdminOfEmail(to, subject, 'auth');
    }
    catch (error) {
        console.error(`[EmailUtil] Auth email failed to ${to}:`, {
            message: error.message,
            code: error.code,
            command: error.command,
            responseCode: error.responseCode
        });
        throw new Error('Auth email dispatch failed');
    }
};
exports.sendAuthEmail = sendAuthEmail;
const sendInfoEmail = async (to, subject, content, attachments = []) => {
    try {
        await infoTransporter.sendMail({
            from: process.env.SMTP_INFO_FROM || '"BlueCollar Recruitment" <info@jobnexe.com>',
            to,
            subject,
            html: getStandardEmailTemplate(subject, content, 'info'),
            ...(attachments[0] && { attachments: [attachments[0]] })
        });
        console.log(`[EmailUtil] Info email dispatched to: ${to}`);
        notifyAdminOfEmail(to, subject, 'info');
    }
    catch (error) {
        console.error(`[EmailUtil] Info email failed:`, error);
        throw new Error('Info email dispatch failed');
    }
};
exports.sendInfoEmail = sendInfoEmail;
const sendRtoEmail = async (to, subject, content, attachments = []) => {
    try {
        await rtoTransporter.sendMail({
            from: process.env.RTO_SMTP_FROM || process.env.AV_SMTP_INFO_FROM || '"CertHero RTO" <training@jobnexe.com>',
            to,
            subject,
            html: getStandardEmailTemplate(subject, content, 'rto'),
            attachments,
        });
        console.log(`[EmailUtil] RTO (CertHero) email dispatched to: ${to}`);
        notifyAdminOfEmail(to, subject, 'rto');
    }
    catch (error) {
        console.error(`[EmailUtil] RTO email failed:`, error);
        throw new Error('RTO email dispatch failed');
    }
};
exports.sendRtoEmail = sendRtoEmail;
const sendEmployerEmail = async (to, subject, content, attachments = []) => {
    try {
        await employerTransporter.sendMail({
            from: process.env.EMPLOYER_SMTP_FROM || '"MACA Mining Recruitment" <recruitment@jobnexe.com>',
            to,
            subject,
            html: getStandardEmailTemplate(subject, content, 'employer'),
            attachments,
        });
        console.log(`[EmailUtil] Employer email dispatched to: ${to}`);
        notifyAdminOfEmail(to, subject, 'employer');
    }
    catch (error) {
        console.error(`[EmailUtil] Employer email failed:`, error);
        throw new Error('Employer email dispatch failed');
    }
};
exports.sendEmployerEmail = sendEmployerEmail;
exports.sendAvelingEmail = exports.sendRtoEmail;
const sendEmailFrom = async (fromType, to, subject, content, attachments = []) => {
    let transporter = infoTransporter;
    let from = process.env.SMTP_INFO_FROM || '"BlueCollar Recruitment" <info@jobnexe.com>';
    if (fromType === 'auth') {
        transporter = authTransporter;
        from = process.env.SMTP_AUTH_FROM || '"BlueCollar Authentication" <donotreply@jobnexe.com>';
    }
    else if (fromType === 'rto' || fromType === 'aveling') {
        transporter = rtoTransporter;
        from = process.env.RTO_SMTP_FROM || process.env.AV_SMTP_INFO_FROM || '"CertHero RTO" <training@jobnexe.com>';
    }
    else if (fromType === 'employer') {
        transporter = employerTransporter;
        from = process.env.EMPLOYER_SMTP_FROM || '"MACA Mining Recruitment" <recruitment@jobnexe.com>';
    }
    try {
        await transporter.sendMail({
            from,
            to,
            subject,
            html: getStandardEmailTemplate(subject, content, fromType),
            attachments,
        });
        console.log(`[EmailUtil] ${fromType} email dispatched to: ${to}`);
        notifyAdminOfEmail(to, subject, fromType);
    }
    catch (error) {
        console.error(`[EmailUtil] ${fromType} email failed:`, error);
        throw new Error(`${fromType} email dispatch failed`);
    }
};
exports.sendEmailFrom = sendEmailFrom;
// Backward compatibility or generic usage
exports.sendEmail = exports.sendInfoEmail;
// 3. Invoice Email Template
const sendInvoiceEmail = async (to, candidateName, invoiceType, partAmount, totalCost, subsidyPercentage, finalAmountDue, attachments = [], walletAddress) => {
    let typeDescription = '';
    let emailServer = 'aveling';
    let note = '';
    switch (invoiceType) {
        case 'aveling-partial':
            typeDescription = 'Partial Ticket Sponsorship Payment';
            note = 'partial ticket courses and certification payment.';
            break;
        case 'aveling-complete-after-partial':
            typeDescription = 'Final Ticket Sponsorship Payment';
            note = 'completion of partial ticket courses and certification payment.';
            break;
        case 'aveling-complete':
            typeDescription = 'Full Ticket Sponsorship Payment';
            note = 'completion of full ticket courses and certification payment (10% discount applied).';
            break;
        case 'shipping':
            typeDescription = 'Ticket Shipping Fee';
            note = 'physical shipping of your hardcopy tickets.';
            break;
        case 'visa-blue-collar':
            typeDescription = 'Visa Fee Subsidy';
            emailServer = 'info';
            note = 'visa fee subsidy.';
            break;
    }
    const subject = `Invoice: ${typeDescription}`;
    const content = `
        <p>Dear ${candidateName},</p>
        <p>Please find the details of your invoice for <strong>${note}</strong></p>
        <p><strong>Financial Breakdown:</strong></p>
        <ul>
            ${totalCost > 0 ? `<li>Total Cost: $${totalCost.toFixed(2)}</li>` : ''}
            ${subsidyPercentage > 0 && totalCost > 0 ? `<li>Approved Subsidy: ${subsidyPercentage}%</li>` : ''}
            ${partAmount > 0 ? `<li>Part/Adjusted Amount: $${partAmount.toFixed(2)}</li>` : ''}
            <li><strong>Final Amount Due: $${finalAmountDue.toFixed(2)}</strong></li>
        </ul>
        <div style="background-color: #f8fafc; padding: 15px; border-left: 4px solid #FFC700; margin: 20px 0;">
            <p style="margin: 0;"><strong>Payment Instructions:</strong><br>
            Please send the Final Amount Due using the approved payment details.</p>
            ${walletAddress ? `<p style="margin-top: 10px; word-break: break-all;"><strong>Payment Details:</strong><br>${walletAddress}</p>` : ''}
        </div>
        <p>Please arrange for payment at your earliest convenience.</p>
    `;
    if (emailServer === 'aveling') {
        await (0, exports.sendAvelingEmail)(to, subject, content, attachments);
    }
    else {
        await (0, exports.sendInfoEmail)(to, subject, content, attachments);
    }
};
exports.sendInvoiceEmail = sendInvoiceEmail;
// 4. Receipt Email Template
const sendReceiptEmail = async (to, candidateName, receiptType, amountPaid, invoiceId, attachments = [], walletAddress) => {
    const emailServer = receiptType === 'aveling' ? 'aveling' : 'info';
    const subject = `Official Payment Receipt - Invoice #${invoiceId}`;
    const content = `
        <p>Dear ${candidateName},</p>
        <p>We have successfully received and verified your payment.</p>
        <p><strong>Official Receipt Particulars:</strong></p>
        <ul>
            <li>Linked Invoice ID: #${invoiceId}</li>
            <li>Amount Paid: $${amountPaid.toFixed(2)}</li>
            <li>Issuing Entity: ${receiptType === 'aveling' ? 'Aveling LMS Training' : 'BlueCollar Infrastructure'}</li>
            ${walletAddress ? `<li>Payment Details: ${walletAddress}</li>` : ''}
            <li>Verification Status: Confirmed & Paid</li>
        </ul>
        <p>Thank you for your prompt payment.</p>
    `;
    if (emailServer === 'aveling') {
        await (0, exports.sendAvelingEmail)(to, subject, content, attachments);
    }
    else {
        await (0, exports.sendInfoEmail)(to, subject, content, attachments);
    }
};
exports.sendReceiptEmail = sendReceiptEmail;
// 5. Verify Email (Auth)
const sendVerificationEmail = async (to, userName, verifyLink) => {
    const subject = 'Verify your BlueCollar Account';
    const content = `
        <p>Dear ${userName},</p>
        <p>Please verify your email address by clicking the link below:</p>
        <div class="cta-block">
            <a href="${verifyLink}" class="button">Verify Email</a>
        </div>
    `;
    await (0, exports.sendAuthEmail)(to, subject, content);
};
exports.sendVerificationEmail = sendVerificationEmail;
// 6. Welcome Email - Application found (INFO BLUE)
const sendWelcomeApplicationFoundEmail = async (to, userName) => {
    const subject = 'Welcome to BlueCollar - Active Application Found';
    const content = `
        <p>Dear ${userName},</p>
        <p>Welcome to BlueCollar! Blue Collar Recruitment specializes in hiring and sponsoring foreign applicants to work FIFO in Australia. We detected an active application associated with your profile.</p>
        <p>You can track the progress of your application on your dashboard.</p>
        <div style="background-color:#fff8e1;border-left:5px solid #FFC700;padding:18px 22px;border-radius:8px;margin:28px 0;">
            <p style="margin:0 0 10px 0;font-weight:900;font-size:15px;color:#1a1a1a;text-transform:uppercase;letter-spacing:0.5px;">
                📄 IMPORTANT: Please Read the Attached Document
            </p>
            <p style="margin:0;color:#374151;font-size:14px;font-weight:600;line-height:1.6;">
                We have attached our official <strong>Hiring Process Information Guide (HIRING_PROCESS_INFORMATION.pdf)</strong> to this email. This document contains critical information regarding our partnership with CertHero RTO, our 9-step recruitment workflow, zero-cost migration benefits, and candidate refund policies.
            </p>
            <p style="margin:12px 0 0 0;color:#374151;font-size:14px;font-weight:700;">
                ⚠️ You are required to read and understand this document before proceeding with your application. Psychometric Test Module 2 strictly evaluates your comprehension of Sections 1 and 2.
            </p>
        </div>
        <p>If you have any questions about the hiring process document, please reach out to your assigned coordinator.</p>
    `;
    const hiringProcessPath = path_1.default.resolve(__dirname, '../assets/HIRING_PROCESS_INFORMATION.pdf');
    await (0, exports.sendInfoEmail)(to, subject, content, [
        {
            filename: 'HIRING_PROCESS_INFORMATION.pdf',
            path: hiringProcessPath,
            contentType: 'application/pdf',
        },
    ]);
};
exports.sendWelcomeApplicationFoundEmail = sendWelcomeApplicationFoundEmail;
// 7. Eoi received Email (INFO BLUE)
const sendEOIReceivedEmail = async (to, userName) => {
    const subject = 'Expression of Interest Received';
    const content = `
        <p>Dear ${userName},</p>
        <p>We have successfully received your Expression of Interest. Our team will review your profile against our unlisted registry.</p>
    `;
    await (0, exports.sendInfoEmail)(to, subject, content);
};
exports.sendEOIReceivedEmail = sendEOIReceivedEmail;
// 9. CV upload Email (INFO BLUE)
const sendCVUploadEmail = async (to, userName) => {
    const subject = 'CV Successfully Uploaded';
    const content = `
        <p>Dear ${userName},</p>
        <p>Your CV has been successfully uploaded and is now being analyzed by our automated screening system.</p>
    `;
    await (0, exports.sendInfoEmail)(to, subject, content);
};
exports.sendCVUploadEmail = sendCVUploadEmail;
// 10. Bio received Email (INFO BLUE)
const sendBioReceivedEmail = async (to, userName) => {
    const subject = 'Biodata Successfully Received';
    const content = `
        <p>Dear ${userName},</p>
        <p>Your biodata form has been successfully received and added to your profile.</p>
    `;
    await (0, exports.sendInfoEmail)(to, subject, content);
};
exports.sendBioReceivedEmail = sendBioReceivedEmail;
// 11. psychometric module 1 passed mail (INFO BLUE)
const sendPsychoMod1PassedEmail = async (to, userName) => {
    const subject = 'Psychometric Module 1 Completed Successfully';
    const content = `
        <p>Dear ${userName},</p>
        <p>Congratulations! You have successfully passed Psychometric Module 1.</p>
        <p>Please log in to your dashboard to proceed to the next module.</p>
    `;
    await (0, exports.sendInfoEmail)(to, subject, content);
};
exports.sendPsychoMod1PassedEmail = sendPsychoMod1PassedEmail;
// 12. psychometric module 2 submitted email (INFO BLUE)
const sendPsychoMod2SubmittedEmail = async (to, userName) => {
    const subject = 'Psychometric Module 2 Submitted';
    const content = `
        <p>Dear ${userName},</p>
        <p>We have received your submission for Psychometric Module 2. Our team is currently reviewing your results.</p>
    `;
    await (0, exports.sendInfoEmail)(to, subject, content);
};
exports.sendPsychoMod2SubmittedEmail = sendPsychoMod2SubmittedEmail;
// 13. psychometric module 2 passed (INFO BLUE)
const sendPsychoMod2PassedEmail = async (to, userName) => {
    const subject = 'Psychometric Module 2 Completed Successfully';
    const content = `
        <p>Dear ${userName},</p>
        <p>Congratulations! You have successfully passed Psychometric Module 2. You have now completed the psychometric evaluation phase.</p>
    `;
    await (0, exports.sendInfoEmail)(to, subject, content);
};
exports.sendPsychoMod2PassedEmail = sendPsychoMod2PassedEmail;
// 14. Application submitted mail ( Application in review) (INFO BLUE)
const sendApplicationSubmittedEmail = async (to, userName) => {
    const subject = 'Application Submitted - Under Review';
    const content = `
        <p>Dear ${userName},</p>
        <p>Your application has been successfully submitted and is currently under review by our team.</p>
        <p>We will notify you once an update is available.</p>
    `;
    await (0, exports.sendInfoEmail)(to, subject, content);
};
exports.sendApplicationSubmittedEmail = sendApplicationSubmittedEmail;
// 15. Application Accepted mail (INFO BLUE)
const sendApplicationAcceptedEmail = async (to, userName) => {
    const subject = 'Application Accepted';
    const content = `
        <p>Dear ${userName},</p>
        <p>Congratulations! Your application has been accepted into our pipeline.</p>
        <p>Please log in to your dashboard for your next steps.</p>
    `;
    await (0, exports.sendInfoEmail)(to, subject, content);
};
exports.sendApplicationAcceptedEmail = sendApplicationAcceptedEmail;
const sendHowToExpressInterestEmail = async (to, userName) => {
    const subject = 'How to Express Interest';
    const content = `
        <p>Dear ${userName},</p>
        <p>Thank you for registering. Since there are no immediate matching vacancies, please complete the Expression of Interest form on your dashboard.</p>
    `;
    await (0, exports.sendInfoEmail)(to, subject, content);
};
exports.sendHowToExpressInterestEmail = sendHowToExpressInterestEmail;
const sendNominationApprovedEmail = async (to, userName) => {
    const subject = 'Nomination Approved';
    const content = `
        <p>Dear ${userName},</p>
        <p>Congratulations! Your nomination has been formally approved by the company.</p>
        <p>Please check your dashboard for further instructions.</p>
    `;
    await (0, exports.sendInfoEmail)(to, subject, content);
};
exports.sendNominationApprovedEmail = sendNominationApprovedEmail;
const sendTicketSponsorshipApplicationMail = async (to, userName) => {
    const subject = 'Action Required: Ticket Uploads & Sponsorship Application';
    const content = `
        <p>Dear ${userName},</p>
        <p>It is now time to finalize your tickets. Please log in to your dashboard to upload any possessed tickets and apply for sponsorship for the remaining gaps.</p>
    `;
    await (0, exports.sendInfoEmail)(to, subject, content);
};
exports.sendTicketSponsorshipApplicationMail = sendTicketSponsorshipApplicationMail;
const sendSponsorshipReviewConfirmationMail = async (to, userName) => {
    const subject = 'Sponsorship Application Under Review';
    const content = `
        <p>Dear ${userName},</p>
        <p>We have received your ticket uploads and sponsorship application. It is currently under review.</p>
    `;
    await (0, exports.sendInfoEmail)(to, subject, content);
};
exports.sendSponsorshipReviewConfirmationMail = sendSponsorshipReviewConfirmationMail;
const sendTicketSponsorshipApprovalMail = async (to, userName) => {
    const subject = 'Ticket Sponsorship Approved';
    const content = `
        <p>Dear ${userName},</p>
        <p>Great news! Your ticket sponsorship application has been approved.</p>
    `;
    await (0, exports.sendInfoEmail)(to, subject, content);
};
exports.sendTicketSponsorshipApprovalMail = sendTicketSponsorshipApprovalMail;
const sendContractApprovedEmail = async (to, userName) => {
    const subject = 'Contract Approved';
    const content = `
        <p>Dear ${userName},</p>
        <p>Your signed contract has been reviewed and officially approved.</p>
    `;
    await (0, exports.sendInfoEmail)(to, subject, content);
};
exports.sendContractApprovedEmail = sendContractApprovedEmail;
const sendRtoCredentialsEmail = async (to, userName, username, password, loginUrl) => {
    const subject = 'Your Official CertHero RTO LMS Credentials';
    const lmsUrl = loginUrl || (process.env.RTO_URL ? `${process.env.RTO_URL.replace(/\/$/, '')}/login` : (process.env.AVELING_URL ? `${process.env.AVELING_URL.replace(/\/$/, '')}/login` : 'https://certhero.online/login'));
    const content = `
        <p>Dear ${userName},</p>
        <p>Your official <strong>CertHero LMS Training Portal</strong> account has been configured. You can now log in, access your assigned competency tickets, review courseware modules, and sit for your online theory examinations.</p>
        <div style="background-color: #f8fafc; border: 2px solid #ED9139; border-radius: 12px; padding: 22px; margin: 24px 0;">
            <p style="margin: 0 0 12px 0; font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #0f172a;">CertHero Portal Login Credentials</p>
            <p style="margin: 6px 0; font-size: 14px;"><strong>LMS Portal URL:</strong> <a href="${lmsUrl}" style="color: #116DFF; font-weight: 700;">${lmsUrl}</a></p>
            <p style="margin: 6px 0; font-size: 14px;"><strong>Candidate Username / ID:</strong> <span style="font-family: monospace; font-weight: bold; background: #e2e8f0; padding: 2px 8px; border-radius: 4px;">${username || 'See Dashboard'}</span></p>
            <p style="margin: 6px 0; font-size: 14px;"><strong>Password:</strong> <span style="font-family: monospace; font-weight: bold; background: #e2e8f0; padding: 2px 8px; border-radius: 4px;">${password || 'See Dashboard'}</span></p>
        </div>
        <div class="cta-block">
            <a href="${lmsUrl}" class="button">Log In to CertHero LMS</a>
        </div>
        <p style="margin-top: 24px; font-size: 13px; color: #64748b;"><strong>Exam Protocol:</strong> Each ticket theory assessment is timed at strictly <strong>15 minutes</strong>. Ensure you have an uninterrupted internet connection before launching an assessment.</p>
    `;
    await (0, exports.sendRtoEmail)(to, subject, content);
};
exports.sendRtoCredentialsEmail = sendRtoCredentialsEmail;
exports.sendAvelingCredentialsEmail = exports.sendRtoCredentialsEmail;
const sendTicketCourseSubmittedEmail = async (to, userName) => {
    const subject = 'Ticket Course Exam Submitted';
    const content = `
        <p>Dear ${userName},</p>
        <p>We have received your exam submission for your ticket course. It is now being graded.</p>
    `;
    await (0, exports.sendAvelingEmail)(to, subject, content);
};
exports.sendTicketCourseSubmittedEmail = sendTicketCourseSubmittedEmail;
const sendTicketCourseFailedEmail = async (to, userName) => {
    const subject = 'Ticket Course Exam Failed';
    const content = `
        <p>Dear ${userName},</p>
        <p>Unfortunately, you did not pass the ticket course exam. You may have another attempt.</p>
    `;
    await (0, exports.sendAvelingEmail)(to, subject, content);
};
exports.sendTicketCourseFailedEmail = sendTicketCourseFailedEmail;
const sendTicketCoursePassedEmail = async (to, userName) => {
    const subject = 'Ticket Course Exam Passed';
    const content = `
        <p>Dear ${userName},</p>
        <p>Congratulations! You have successfully passed your ticket course exam.</p>
    `;
    await (0, exports.sendAvelingEmail)(to, subject, content);
};
exports.sendTicketCoursePassedEmail = sendTicketCoursePassedEmail;
