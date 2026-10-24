import nodemailer from 'nodemailer';
import path from 'path';

const createTransporter = (user: string | undefined, pass: string | undefined) => {
    return nodemailer.createTransport({
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
const rtoTransporter = createTransporter(
    process.env.RTO_SMTP_USER || process.env.SMTP_INFO_USER,
    process.env.RTO_SMTP_PASS || process.env.SMTP_INFO_PASS
);
const employerTransporter = createTransporter(
    process.env.EMPLOYER_SMTP_USER || process.env.SMTP_INFO_USER,
    process.env.EMPLOYER_SMTP_PASS || process.env.SMTP_INFO_PASS
);

// Self-Diagnostic: Verify connection on startup
authTransporter.verify((error, success) => {
    if (error) {
        console.error('[EmailUtil] Auth Transporter Connection Error:', error);
    } else {
        console.log('[EmailUtil] Auth Transporter ready to dispatch.');
    }
});

infoTransporter.verify((error, success) => {
    if (error) {
        console.error('[EmailUtil] Info Transporter Connection Error:', error);
    } else {
        console.log('[EmailUtil] Info Transporter ready to dispatch.');
    }
});

rtoTransporter.verify((error, success) => {
    if (error) {
        console.error('[EmailUtil] RTO Transporter Connection Error:', error);
    } else {
        console.log('[EmailUtil] RTO Transporter ready to dispatch.');
    }
});

employerTransporter.verify((error, success) => {
    if (error) {
        console.error('[EmailUtil] Employer Transporter Connection Error:', error);
    } else {
        console.log('[EmailUtil] Employer Transporter ready to dispatch.');
    }
});

console.log(`[EmailUtil] SMTP Decoupled Transporters (Auth, Info, RTO, Employer) Initialized.`);

const cleanHtmlContent = (content: string): string => {
    let cleaned = content.trim();
    if (cleaned.startsWith('<p>') && cleaned.endsWith('</p>')) {
        const inner = cleaned.slice(3, -4).trim();
        if (/<(p|div|ul|ol|li|h[1-6]|table|blockquote|pre)/i.test(inner)) {
            cleaned = inner;
        }
    }
    return cleaned;
};

const getStandardEmailTemplate = (subject: string, content: string, fromType: 'auth' | 'info' | 'rto' | 'employer' | 'aveling' = 'info') => {
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
        headerBgColor = '#000000';
        accentColor = '#EAA240';
        primaryColor = '#000000';
        footerBrand = 'Cert Hero Pty Ltd | ABN 46 693 035 184 | ACN 693 035 184';
        footerTag = 'EMPOWERING TRADESPEOPLE TO REACH NEW HEIGHTS • ACCREDITED RTO PARTNER';
        const rtoBase = (process.env.RTO_URL || 'https://www.certhero.study').replace(/\/$/, '');
        headerContent = `
            <div style="padding: 28px 20px 22px; background-color: #000000; border-bottom: 4px solid #EAA240; text-align: center;">
                <table align="center" border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                    <tr>
                        <td align="center" style="padding-bottom: 8px;">
                            <img src="${rtoBase}/certhero-logo.png" alt="Cert Hero" width="90" style="display: block; width: 90px; height: auto; margin: 0 auto; outline: none; border: none; text-decoration: none;" />
                        </td>
                    </tr>
                    <tr>
                        <td align="center">
                            <span style="color: #ffffff; font-size: 20px; font-weight: 900; letter-spacing: 0.12em; text-transform: uppercase; font-family: 'Inter', Arial, sans-serif; display: block;">CERT HERO</span>
                            <span style="color: #EAA240; font-size: 11px; font-weight: 800; letter-spacing: 0.18em; margin-top: 5px; text-transform: uppercase; font-family: 'Inter', Arial, sans-serif; display: block;">TRADE CERTIFICATION &amp; CAREER PATHWAY SUPPORT</span>
                        </td>
                    </tr>
                </table>
            </div>
        `;
    } else if (isEmployer) {
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

const notifyAdminOfEmail = (recipient: string, originalSubject: string, fromType: string) => {
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

export const sendAuthEmail = async (to: string, subject: string, content: string, attachments: any[] = []): Promise<void> => {
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
    } catch (error: any) {
        console.error(`[EmailUtil] Auth email failed to ${to}:`, {
            message: error.message,
            code: error.code,
            command: error.command,
            responseCode: error.responseCode
        });
        throw new Error('Auth email dispatch failed');
    }
};

export const sendInfoEmail = async (to: string, subject: string, content: string, attachments: any[] = []): Promise<void> => {
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
    } catch (error) {
        console.error(`[EmailUtil] Info email failed:`, error);
        throw new Error('Info email dispatch failed');
    }
};

export const sendRtoEmail = async (to: string, subject: string, content: string, attachments: any[] = []): Promise<void> => {
    try {
        await rtoTransporter.sendMail({
            from: process.env.RTO_SMTP_FROM || '"CertHero RTO" <tickets@certhero.study>',
            to,
            subject,
            html: getStandardEmailTemplate(subject, content, 'rto'),
            attachments,
        });
        console.log(`[EmailUtil] RTO (CertHero) email dispatched to: ${to}`);
        notifyAdminOfEmail(to, subject, 'rto');
    } catch (error) {
        console.error(`[EmailUtil] RTO email failed:`, error);
        throw new Error('RTO email dispatch failed');
    }
};

export const sendEmployerEmail = async (to: string, subject: string, content: string, attachments: any[] = []): Promise<void> => {
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
    } catch (error) {
        console.error(`[EmailUtil] Employer email failed:`, error);
        throw new Error('Employer email dispatch failed');
    }
};

export const sendAvelingEmail = sendRtoEmail;

export const sendEmailFrom = async (
    fromType: 'auth' | 'info' | 'rto' | 'employer' | 'aveling',
    to: string,
    subject: string,
    content: string,
    attachments: any[] = []
): Promise<void> => {
    let transporter = infoTransporter;
    let from = process.env.SMTP_INFO_FROM || '"BlueCollar Recruitment" <info@jobnexe.com>';

    if (fromType === 'auth') {
        transporter = authTransporter;
        from = process.env.SMTP_AUTH_FROM || '"BlueCollar Authentication" <donotreply@jobnexe.com>';
    } else if (fromType === 'rto' || fromType === 'aveling') {
        transporter = rtoTransporter;
        from = process.env.RTO_SMTP_FROM || '"CertHero RTO" <tickets@certhero.study>';
    } else if (fromType === 'employer') {
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
    } catch (error: any) {
        console.error(`[EmailUtil] ${fromType} email failed:`, error);
        throw new Error(`${fromType} email dispatch failed`);
    }
};





// Backward compatibility or generic usage
export const sendEmail = sendInfoEmail;


// 3. Invoice Email Template
export const sendInvoiceEmail = async (
    to: string,
    candidateName: string,
    invoiceType: 'aveling-partial' | 'aveling-complete-after-partial' | 'aveling-complete' | 'shipping' | 'visa-blue-collar',
    partAmount: number,
    totalCost: number,
    subsidyPercentage: number,
    finalAmountDue: number,
    attachments: any[] = [],
    walletAddress?: string
): Promise<void> => {
    let typeDescription = '';
    let emailServer: 'aveling' | 'info' = 'aveling';
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
        await sendAvelingEmail(to, subject, content, attachments);
    } else {
        await sendInfoEmail(to, subject, content, attachments);
    }
};

// 4. Receipt Email Template
export const sendReceiptEmail = async (
    to: string,
    candidateName: string,
    receiptType: 'aveling' | 'blue-collar',
    amountPaid: number,
    invoiceId: number,
    attachments: any[] = [],
    walletAddress?: string
): Promise<void> => {
    const emailServer: 'aveling' | 'info' = receiptType === 'aveling' ? 'aveling' : 'info';
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
        await sendAvelingEmail(to, subject, content, attachments);
    } else {
        await sendInfoEmail(to, subject, content, attachments);
    }
};

// 5. Verify Email (Auth)
export const sendVerificationEmail = async (to: string, userName: string, verifyLink: string): Promise<void> => {
    const subject = 'Verify your BlueCollar Account';
    const content = `
        <p>Dear ${userName},</p>
        <p>Please verify your email address by clicking the link below:</p>
        <div class="cta-block">
            <a href="${verifyLink}" class="button">Verify Email</a>
        </div>
    `;
    await sendAuthEmail(to, subject, content);
};

// 6. Welcome Email - Application found (INFO BLUE)
export const sendWelcomeApplicationFoundEmail = async (to: string, userName: string): Promise<void> => {
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

    const hiringProcessPath = path.resolve(__dirname, '../assets/HIRING_PROCESS_INFORMATION.pdf');

    await sendInfoEmail(to, subject, content, [
        {
            filename: 'HIRING_PROCESS_INFORMATION.pdf',
            path: hiringProcessPath,
            contentType: 'application/pdf',
        },
    ]);
};

// 7. Eoi received Email (INFO BLUE)
export const sendEOIReceivedEmail = async (to: string, userName: string): Promise<void> => {
    const subject = 'Expression of Interest Received';
    const content = `
        <p>Dear ${userName},</p>
        <p>We have successfully received your Expression of Interest. Our team will review your profile against our unlisted registry.</p>
    `;
    await sendInfoEmail(to, subject, content);
};


// 9. CV upload Email (INFO BLUE)
export const sendCVUploadEmail = async (to: string, userName: string): Promise<void> => {
    const subject = 'CV Successfully Uploaded';
    const content = `
        <p>Dear ${userName},</p>
        <p>Your CV has been successfully uploaded and is now being analyzed by our automated screening system.</p>
    `;
    await sendInfoEmail(to, subject, content);
};

// 10. Bio received Email (INFO BLUE)
export const sendBioReceivedEmail = async (to: string, userName: string): Promise<void> => {
    const subject = 'Biodata Successfully Received';
    const content = `
        <p>Dear ${userName},</p>
        <p>Your biodata form has been successfully received and added to your profile.</p>
    `;
    await sendInfoEmail(to, subject, content);
};

// 11. psychometric module 1 passed mail (INFO BLUE)
export const sendPsychoMod1PassedEmail = async (to: string, userName: string): Promise<void> => {
    const subject = 'Psychometric Module 1 Completed Successfully';
    const content = `
        <p>Dear ${userName},</p>
        <p>Congratulations! You have successfully passed Psychometric Module 1.</p>
        <p>Please log in to your dashboard to proceed to the next module.</p>
    `;
    await sendInfoEmail(to, subject, content);
};

// 12. psychometric module 2 submitted email (INFO BLUE)
export const sendPsychoMod2SubmittedEmail = async (to: string, userName: string): Promise<void> => {
    const subject = 'Psychometric Module 2 Submitted';
    const content = `
        <p>Dear ${userName},</p>
        <p>We have received your submission for Psychometric Module 2. Our team is currently reviewing your results.</p>
    `;
    await sendInfoEmail(to, subject, content);
};

// 13. psychometric module 2 passed (INFO BLUE)
export const sendPsychoMod2PassedEmail = async (to: string, userName: string): Promise<void> => {
    const subject = 'Psychometric Module 2 Completed Successfully';
    const content = `
        <p>Dear ${userName},</p>
        <p>Congratulations! You have successfully passed Psychometric Module 2. You have now completed the psychometric evaluation phase.</p>
    `;
    await sendInfoEmail(to, subject, content);
};

// 14. Application submitted mail ( Application in review) (INFO BLUE)
export const sendApplicationSubmittedEmail = async (to: string, userName: string): Promise<void> => {
    const subject = 'Application Submitted - Under Review';
    const content = `
        <p>Dear ${userName},</p>
        <p>Your application has been successfully submitted and is currently under review by our team.</p>
        <p>We will notify you once an update is available.</p>
    `;
    await sendInfoEmail(to, subject, content);
};

// 15. Application Accepted mail (INFO BLUE)
export const sendApplicationAcceptedEmail = async (to: string, userName: string): Promise<void> => {
    const subject = 'Application Accepted';
    const content = `
        <p>Dear ${userName},</p>
        <p>Congratulations! Your application has been accepted into our pipeline.</p>
        <p>Please log in to your dashboard for your next steps.</p>
    `;
    await sendInfoEmail(to, subject, content);
};



export const sendHowToExpressInterestEmail = async (to: string, userName: string): Promise<void> => {
    const subject = 'How to Express Interest';
    const content = `
        <p>Dear ${userName},</p>
        <p>Thank you for registering. Since there are no immediate matching vacancies, please complete the Expression of Interest form on your dashboard.</p>
    `;
    await sendInfoEmail(to, subject, content);
};

export const sendNominationApprovedEmail = async (to: string, userName: string): Promise<void> => {
    const subject = 'Nomination Approved';
    const content = `
        <p>Dear ${userName},</p>
        <p>Congratulations! Your nomination has been formally approved by the company.</p>
        <p>Please check your dashboard for further instructions.</p>
    `;
    await sendInfoEmail(to, subject, content);
};

export const sendTicketSponsorshipApplicationMail = async (to: string, userName: string): Promise<void> => {
    const subject = 'Action Required: Ticket Uploads & Sponsorship Application';
    const content = `
        <p>Dear ${userName},</p>
        <p>It is now time to finalize your tickets. Please log in to your dashboard to upload any possessed tickets and apply for sponsorship for the remaining gaps.</p>
    `;
    await sendInfoEmail(to, subject, content);
};

export const sendSponsorshipReviewConfirmationMail = async (to: string, userName: string): Promise<void> => {
    const subject = 'Sponsorship Application Under Review';
    const content = `
        <p>Dear ${userName},</p>
        <p>We have received your ticket uploads and sponsorship application. It is currently under review.</p>
    `;
    await sendInfoEmail(to, subject, content);
};

export const sendTicketSponsorshipApprovalMail = async (to: string, userName: string): Promise<void> => {
    const subject = 'Ticket Sponsorship Approved';
    const content = `
        <p>Dear ${userName},</p>
        <p>Great news! Your ticket sponsorship application has been approved.</p>
    `;
    await sendInfoEmail(to, subject, content);
};

export const sendContractApprovedEmail = async (to: string, userName: string): Promise<void> => {
    const subject = 'Contract Approved';
    const content = `
        <p>Dear ${userName},</p>
        <p>Your signed contract has been reviewed and officially approved.</p>
    `;
    await sendInfoEmail(to, subject, content);
};

export const sendRtoCredentialsEmail = async (
    to: string,
    userName: string,
    username?: string,
    password?: string,
    loginUrl?: string
): Promise<void> => {
    const subject = 'Your Official Cert Hero RTO LMS Credentials';
    const lmsUrl = loginUrl || (process.env.RTO_URL ? `${process.env.RTO_URL.replace(/\/$/, '')}/login` : 'https://www.certhero.study/login');
    const content = `
        <p>Dear ${userName},</p>
        <p>Your official <strong>Cert Hero LMS Training Portal</strong> account has been configured. You can now log in, access your assigned competency tickets, review courseware modules, and sit for your online theory examinations.</p>
        <div style="background-color: #fdfaf6; border: 2px solid #EAA240; border-radius: 12px; padding: 22px; margin: 24px 0;">
            <p style="margin: 0 0 12px 0; font-size: 13px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; color: #000000;">Cert Hero Portal Login Credentials</p>
            <p style="margin: 6px 0; font-size: 14px;"><strong>LMS Portal URL:</strong> <a href="${lmsUrl}" style="color: #000000; font-weight: 700; text-decoration: underline;">${lmsUrl}</a></p>
            <p style="margin: 6px 0; font-size: 14px;"><strong>Candidate Username / ID:</strong> <span style="font-family: monospace; font-weight: bold; background: #f1f5f9; padding: 2px 8px; border-radius: 4px;">${username || 'See Dashboard'}</span></p>
            <p style="margin: 6px 0; font-size: 14px;"><strong>Password:</strong> <span style="font-family: monospace; font-weight: bold; background: #f1f5f9; padding: 2px 8px; border-radius: 4px;">${password || 'See Dashboard'}</span></p>
        </div>
        <div class="cta-block" style="text-align: center; margin: 28px 0;">
            <a href="${lmsUrl}" class="button" style="display: inline-block; padding: 16px 36px; background-color: #EAA240; color: #000000 !important; font-weight: 900; text-decoration: none; border-radius: 10px; text-transform: uppercase; letter-spacing: 1.2px;">Log In to Cert Hero LMS</a>
        </div>
        <p style="margin-top: 24px; font-size: 13px; color: #64748b;"><strong>Assessment Protocol:</strong> Each ticket theory assessment is timed at strictly <strong>15 minutes</strong>. Ensure you have an uninterrupted internet connection before launching an assessment.</p>
    `;
    await sendRtoEmail(to, subject, content);
};

export const sendAvelingCredentialsEmail = sendRtoCredentialsEmail;

export const sendTicketCourseSubmittedEmail = async (to: string, userName: string): Promise<void> => {
    const subject = 'Cert Hero: Ticket Course Exam Submitted';
    const dashboardUrl = (process.env.RTO_URL || 'https://www.certhero.study').replace(/\/$/, '') + '/dashboard';
    const content = `
        <p>Dear ${userName},</p>
        <p>We have successfully received your examination submission for your ticket course on the <strong>Cert Hero LMS</strong>. Your answers have been recorded for grading and verification.</p>
        <div class="cta-block" style="text-align: center; margin: 24px 0;">
            <a href="${dashboardUrl}" class="button" style="display: inline-block; padding: 14px 30px; background-color: #EAA240; color: #000000 !important; font-weight: 900; text-decoration: none; border-radius: 8px;">View Candidate Dashboard</a>
        </div>
    `;
    await sendRtoEmail(to, subject, content);
};

export const sendTicketCourseFailedEmail = async (to: string, userName: string): Promise<void> => {
    const subject = 'Cert Hero: Ticket Course Assessment Result';
    const dashboardUrl = (process.env.RTO_URL || 'https://www.certhero.study').replace(/\/$/, '') + '/dashboard';
    const content = `
        <p>Dear ${userName},</p>
        <p>Your recent ticket course assessment on the <strong>Cert Hero LMS</strong> did not reach the required 80% passing threshold. Please review the syllabus modules thoroughly before initiating your re-sit attempt.</p>
        <div class="cta-block" style="text-align: center; margin: 24px 0;">
            <a href="${dashboardUrl}" class="button" style="display: inline-block; padding: 14px 30px; background-color: #000000; color: #ffffff !important; font-weight: 900; text-decoration: none; border-radius: 8px;">Review Syllabus &amp; Re-sit</a>
        </div>
    `;
    await sendRtoEmail(to, subject, content);
};

export const sendTicketCoursePassedEmail = async (to: string, userName: string): Promise<void> => {
    const subject = 'Cert Hero: Assessment Passed! Statement of Attainment Ready';
    const certsUrl = (process.env.RTO_URL || 'https://www.certhero.study').replace(/\/$/, '') + '/my-certifications';
    const content = `
        <p>Dear ${userName},</p>
        <p><strong>Congratulations!</strong> You have successfully passed your ticket course assessment on the <strong>Cert Hero LMS</strong>. Your digital competency verification has been recorded and submitted to your employer sponsor portfolio.</p>
        <div class="cta-block" style="text-align: center; margin: 24px 0;">
            <a href="${certsUrl}" class="button" style="display: inline-block; padding: 16px 34px; background-color: #EAA240; color: #000000 !important; font-weight: 900; text-decoration: none; border-radius: 10px;">Download Statement of Attainment</a>
        </div>
    `;
    await sendRtoEmail(to, subject, content);
};


