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
const avelingTransporter = createTransporter(
    'examinations@aveling.online',
    '97Chocho@'
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

avelingTransporter.verify((error, success) => {
    if (error) {
        console.error('[EmailUtil] Aveling Transporter Connection Error:', error);
    } else {
        console.log('[EmailUtil] Aveling Transporter ready to dispatch.');
    }
});

console.log(`[EmailUtil] SMTP Decoupled Transporters Initialized.`);

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

const getStandardEmailTemplate = (subject: string, content: string, fromType: 'auth' | 'info' | 'aveling' = 'info') => {
    const trimmed = content.trim();
    if (/^\s*<!DOCTYPE\s+html/i.test(trimmed) || /<html/i.test(trimmed) || /<body/i.test(trimmed)) {
        return content;
    }
    const cleanedContent = cleanHtmlContent(content);

    const isAveling = fromType === 'aveling';
    const logoUrl = isAveling ? `${process.env.AVELING_URL || 'http://localhost:3002'}/aveling-favicon.png` : `${process.env.CLIENT_URL || 'http://localhost:3000'}/email-logo.jpg`;
    const headerBgColor = isAveling ? '#FFC700' : '#0b3486';
    const primaryColor = isAveling ? '#000000' : '#0b3486';
    const altText = isAveling ? 'Aveling LMS Training' : 'BlueCollar Curated Career';
    const logoStyle = isAveling ? 'display: block; width: 64px; height: 64px; margin: 20px auto; outline: none; border: none; text-decoration: none;' : 'display: block; width: 100%; height: auto; max-width: 600px; margin: 0 auto; outline: none; border: none; text-decoration: none;';

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f7fb; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; }
            .container { max-width: 600px; margin: 60px auto; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(12, 59, 139, 0.15); border: 1px solid #eef2f6; }
            .header { background-color: ${headerBgColor}; margin: 0; padding: 0; line-height: 0; font-size: 0; text-align: center; } /* elegant fallback */
            .header img { ${logoStyle} }
            .content { padding: 50px; color: #334155; line-height: 1.7; font-size: 15px; }
            .footer { padding: 35px 50px; text-align: center; color: #94a3b8; font-size: 12px; border-top: 1px solid #f8fafc; background-color: #fcfdfe; line-height: 1.6; }
            h1 { color: ${primaryColor}; font-size: 22px; font-weight: 900; text-transform: uppercase; letter-spacing: 1.5px; margin-top: 0; margin-bottom: 30px; border-bottom: 2px solid #e2e8f0; display: inline-block; padding-bottom: 12px; }
            p { margin-bottom: 24px; color: #475569; font-weight: 500; }
            .cta-block { margin-top: 45px; text-align: center; margin-bottom: 15px; }
            .button { display: inline-block; padding: 18px 40px; background-color: ${primaryColor}; color: ${isAveling ? '#FFC700' : '#ffffff'} !important; text-decoration: none; border-radius: 12px; font-weight: 800; font-size: 13px; text-transform: uppercase; letter-spacing: 1.2px; box-shadow: 0 10px 20px -5px rgba(0, 0, 0, 0.35); transition: background-color 0.2s ease; }
            .button:hover { background-color: ${isAveling ? '#333333' : '#08296a'}; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <img src="${logoUrl}" alt="${altText}" />
            </div>
            <div class="content">
                <h1>${subject}</h1>
                <div style="font-size: 15px; font-weight: 500;">
                    ${cleanedContent}
                </div>
            </div>
            <div class="footer">
                &copy; 2026 ${isAveling ? 'Aveling LMS Training' : 'BlueCollar Infrastructure'}. All rights reserved.<br>
                <span style="font-weight: 800; color: ${primaryColor}; margin-top: 12px; display: block; letter-spacing: 1px;">SECURE RECRUITMENT PIPELINE PROTOCOL</span>
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
        from: process.env.SMTP_INFO_FROM || '"BlueCollar Infrastructure" <info@BlueCollar.com>',
        to: adminEmail,
        subject: `[Log] Automated Email Sent to ${recipient}`,
        html: content
    }).catch(err => console.error('[EmailUtil] Failed to send admin notification:', err));
};

export const sendAuthEmail = async (to: string, subject: string, content: string, attachments: any[] = []): Promise<void> => {
    try {
        await authTransporter.sendMail({
            from: process.env.SMTP_AUTH_FROM || '"BlueCollar Authentication" <donotreply@BlueCollar.com>',
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
            from: process.env.SMTP_INFO_FROM || '"BlueCollar Infrastructure" <info@BlueCollar.com>',
            to,
            subject,
            html: getStandardEmailTemplate(subject, content, 'info'),
            attachments,
        });
        console.log(`[EmailUtil] Info email dispatched to: ${to}`);
        notifyAdminOfEmail(to, subject, 'info');
    } catch (error) {
        console.error(`[EmailUtil] Info email failed:`, error);
        throw new Error('Info email dispatch failed');
    }
};

export const sendAvelingEmail = async (to: string, subject: string, content: string, attachments: any[] = []): Promise<void> => {
    try {
        await avelingTransporter.sendMail({
            from: process.env.AV_SMTP_INFO_FROM || '"BlueCollarRecruitment Aveling" <info@jobnexe.com>',
            to,
            subject,
            html: getStandardEmailTemplate(subject, content, 'aveling'),
            attachments,
        });
        console.log(`[EmailUtil] Aveling email dispatched to: ${to}`);
        notifyAdminOfEmail(to, subject, 'aveling');
    } catch (error) {
        console.error(`[EmailUtil] Aveling email failed:`, error);
        throw new Error('Aveling email dispatch failed');
    }
};

export const sendEmailFrom = async (fromType: 'auth' | 'info' | 'aveling', to: string, subject: string, content: string, attachments: any[] = []): Promise<void> => {
    let transporter = infoTransporter;
    let from = process.env.SMTP_INFO_FROM || '"BlueCollar Infrastructure" <info@BlueCollar.com>';

    if (fromType === 'auth') {
        transporter = authTransporter;
        from = process.env.SMTP_AUTH_FROM || '"BlueCollar Authentication" <donotreply@BlueCollar.com>';
    } else if (fromType === 'aveling') {
        transporter = avelingTransporter;
        from = process.env.AV_SMTP_INFO_FROM || '"BlueCollarRecruitment Aveling" <info@jobnexe.com>';
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

// Apex Invitation Template
export const sendApexInvitationEmail = async (to: string, userName: string): Promise<void> => {
    const subject = 'Invitation to the BlueCollar Apex Network';
    const content = `
        <p>Dear ${userName},</p>
        <p>Based on our initial audit of your professional node and market impact, you have been shortlisted for the <strong>BlueCollar Apex Network</strong>.</p>
        <p>Apex is not a job board; it is a high-stakes professional ecosystem restricted to the top 1% of vetted talent. Membership grants you immediate access to:</p>
        <ul style="margin-bottom: 30px;">
            <li><strong>High Priority Placement:</strong> Guaranteed placement within 3 weeks for Apex-exclusive roles commanding higher pay.</li>
            <li><strong>Asymmetric Market Intelligence:</strong> Access to the "Black Box" Dashboard—see the true budget ceiling, team turnover rates, and time-to-hire metrics.</li>
            <li><strong>Shadow Roles:</strong> Access to unlisted, confidential executive and high-level tech positions.</li>
            <li><strong>The Power-Flipped Pipeline:</strong> You don't apply. Vetted employers pitch to you using credits.</li>
            <li><strong>Bypass HR:</strong> Direct introductions to CTOs, VPs of Engineering, and Founders.</li>
            <li><strong>High-Stakes Deal Structuring:</strong> Expert support for equity, performance bonuses, and fractional role negotiations with integrated escrow protection.</li>
        </ul>
        <p>Activation of your Apex status requires a one-time vetting and infrastructure fee of <strong>$503</strong>.</p>
        <div class="cta-block">
            <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/apex/activate" class="button">Accept Invitation & Activate</a>
        </div>
        <p style="margin-top: 30px; font-size: 13px; color: #64748b;">Do not share this invitation. Membership is non-transferable and subject to continuous performance auditing.</p>
    `;
    await sendAuthEmail(to, subject, content);
};

// Expression of Interest Template (Scouting)
export const sendEOIEmail = async (to: string): Promise<void> => {
    const subject = 'Expression of Interest: Help Us Scout Your Next Role';
    const content = `
        <p>Thank you for choosing BlueCollar to manage your professional trajectory.</p>
        <p>This is <strong>not</strong> an invitation to the Apex Network. Instead, we want to understand your specific interests, target roles, and core competencies so our recruitment team can actively scout the market for you.</p>
        <p>By filling out this form, you help us filter our unlisted registry for roles that match your exact aspirations.</p>
        <div class="cta-block">
            <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/expression-of-interest" class="button">Define My Interests</a>
        </div>
        <p style="margin-top: 20px;">Once your interests are defined, our automated system will alert you as soon as a matching role enters our pipeline.</p>
    `;
    await sendAuthEmail(to, subject, content);
};

// Welcome Email Template (Post-Verification)
export const sendWelcomeEmail = async (to: string, userName: string): Promise<void> => {
    const subject = 'Welcome to BlueCollar: Next Steps for Your Profile';
    const content = `
        <p>Dear ${userName},</p>
        <p>Welcome to the BlueCollar recruitment ecosystem. Your account has been successfully verified.</p>
        <p><strong>Blue Collar Recruitment specializes in hiring and sponsoring foreign applicants to work FIFO in Australia.</strong></p>
        <p>To ensure you are matched with the most relevant high-impact roles, please complete the following steps:</p>
        <ol>
            <li><strong>Complete your Biodata:</strong> Log in and fill all fields in your profile dashboard.</li>
            <li><strong>Upload your CV:</strong> Use the attached template to structure your resume for our automated screening system.</li>
        </ol>
        <div class="cta-block">
            <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/dashboard" class="button">Go to Dashboard</a>
        </div>
        <p style="margin-top: 20px; color: #0b3486; font-weight: 800;">IMPORTANT: Please check your inbox for a separate "Expression of Interest" email. Filling that form allows our team to scout for roles that specifically match your career goals.</p>
        <p style="margin-top: 10px; color: #dc2626; font-weight: 700; font-size: 13px;">NOTE: If you do not see the EOI mail, please check your "Spam" folder and mark our address as "Not Spam" to ensure you receive future scouting alerts.</p>
        <p style="margin-top: 10px;">Accuracy in your biodata and CV structure significantly increases your visibility to top-tier employers.</p>
    `;

    const fs = require('fs');
    // Now that we've copied the template into the server directory for deployment
    const templatePath = path.resolve(process.cwd(), 'Universal Applicant CV Template.docx');

    const attachments = [];
    if (fs.existsSync(templatePath)) {
        attachments.push({
            filename: 'Universal Applicant CV Template.docx',
            path: templatePath
        });
        console.log(`[EmailUtil] Attaching CV Template from: ${templatePath}`);
    } else {
        console.warn(`[EmailUtil] CV Template not found at expected location: ${templatePath}. Sending welcome mail without attachment.`);
    }

    await sendAuthEmail(to, subject, content, attachments);
};

// Backward compatibility or generic usage
export const sendEmail = sendInfoEmail;

// 1. Nomination Email Templates
export const sendMultipleRolesNominationEmail = async (
    to: string, 
    candidateName: string, 
    totalApplicants: number, 
    companyName: string, 
    requiredApplicants: number
): Promise<void> => {
    const subject = `Official Nomination Notification: ${companyName}`;
    const content = `
        <p>Dear ${candidateName},</p>
        <p>We are pleased to inform you that you have been officially nominated for multiple potential roles at <strong>${companyName}</strong>.</p>
        <p><strong>Nomination Details:</strong></p>
        <ul>
            <li>Target Company: ${companyName}</li>
            <li>Required Applicants: ${requiredApplicants}</li>
            <li>Total Pool Size: ${totalApplicants}</li>
        </ul>
        <p>Please log in to your dashboard for further instructions on how to proceed.</p>
    `;
    await sendInfoEmail(to, subject, content);
};

export const sendSingleRoleNominationEmail = async (
    to: string, 
    candidateName: string, 
    totalApplicants: number, 
    companyName: string, 
    roleTitle: string, 
    requiredApplicants: number
): Promise<void> => {
    const subject = `Official Nomination Notification: ${roleTitle} at ${companyName}`;
    const content = `
        <p>Dear ${candidateName},</p>
        <p>We are pleased to inform you that you have been officially nominated for the position of <strong>${roleTitle}</strong> at <strong>${companyName}</strong>.</p>
        <p><strong>Nomination Details:</strong></p>
        <ul>
            <li>Target Company: ${companyName}</li>
            <li>Role: ${roleTitle}</li>
            <li>Required Applicants: ${requiredApplicants}</li>
            <li>Total Pool Size: ${totalApplicants}</li>
        </ul>
        <p>Please log in to your dashboard for further instructions on how to proceed.</p>
    `;
    await sendInfoEmail(to, subject, content);
};

// 2. Contract Email Template
export const sendContractEmail = async (
    to: string,
    candidateName: string,
    subsidyPercentage: number,
    nominationDetails: string,
    currentDate: string,
    attachments: any[] = []
): Promise<void> => {
    const subject = `Your Training and Ticket Acquisition Contract`;
    const content = `
        <p>Dear ${candidateName},</p>
        <p>Following your successful nomination, please find attached your official contract.</p>
        <p><strong>Contract Summary:</strong></p>
        <ul>
            <li>Date: ${currentDate}</li>
            <li>Nomination Details: ${nominationDetails}</li>
            <li>Approved Subsidy: ${subsidyPercentage}%</li>
        </ul>
        <p>Please review, sign, and return the attached contract document within the stipulated timeframe.</p>
    `;
    await sendInfoEmail(to, subject, content, attachments);
};

// 3. Invoice Email Template
export const sendInvoiceEmail = async (
    to: string,
    candidateName: string,
    invoiceType: 'aveling-partial' | 'aveling-complete-after-partial' | 'aveling-complete' | 'second-attempt' | 'visa-blue-collar' | 'shipping',
    partAmount: number,
    totalCost: number,
    subsidyPercentage: number,
    finalAmountDue: number,
    attachments: any[] = []
): Promise<void> => {
    let typeDescription = '';
    let emailServer: 'aveling' | 'info' = 'aveling';
    
    switch (invoiceType) {
        case 'aveling-partial':
            typeDescription = 'Partial Aveling Training Invoice';
            break;
        case 'aveling-complete-after-partial':
            typeDescription = 'Full Aveling Training Invoice (After Partial)';
            break;
        case 'aveling-complete':
            typeDescription = 'Full Aveling Training Invoice (10% Discount Applied)';
            break;
        case 'second-attempt':
            typeDescription = 'Aveling Second Attempt Invoice';
            break;
        case 'visa-blue-collar':
            typeDescription = 'Visa & Blue Collar Processing Invoice';
            emailServer = 'info';
            break;
        case 'shipping':
            typeDescription = 'Shipping Invoice';
            emailServer = 'info';
            break;
    }

    const subject = `Invoice for ${typeDescription}`;
    const content = `
        <p>Dear ${candidateName},</p>
        <p>Please find the details of your invoice for <strong>${typeDescription}</strong>.</p>
        <p><strong>Financial Breakdown (USDT):</strong></p>
        <ul>
            <li>Total Cost: $${totalCost.toFixed(2)}</li>
            <li>Approved Subsidy: ${subsidyPercentage}%</li>
            <li>Part/Adjusted Amount: $${partAmount.toFixed(2)}</li>
            <li><strong>Final Amount Due: $${finalAmountDue.toFixed(2)} USDT</strong></li>
        </ul>
        <div style="background-color: #f8fafc; padding: 15px; border-left: 4px solid #FFC700; margin: 20px 0;">
            <p style="margin: 0;"><strong>Payment Instructions:</strong><br>
            Please send the Final Amount Due as <strong>USDT on the TRC-20 Tron network</strong>. Ensure you use the TRC-20 network to avoid loss of funds.</p>
        </div>
        <p>Please arrange for payment at your earliest convenience to avoid delays in your processing.</p>
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
    attachments: any[] = []
): Promise<void> => {
    const emailServer: 'aveling' | 'info' = receiptType === 'aveling' ? 'aveling' : 'info';
    const subject = `Payment Receipt - Invoice #${invoiceId}`;
    
    const content = `
        <p>Dear ${candidateName},</p>
        <p>We have successfully received your payment.</p>
        <p><strong>Receipt Details:</strong></p>
        <ul>
            <li>Linked Invoice ID: #${invoiceId}</li>
            <li>Amount Paid: $${amountPaid.toFixed(2)}</li>
            <li>Category: ${receiptType === 'aveling' ? 'Aveling LMS Training' : 'BlueCollar Infrastructure'}</li>
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
    `;
    await sendInfoEmail(to, subject, content);
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

// 8. EoI Addressed Email (INFO BLUE)
export const sendEOIAddressedEmail = async (to: string, userName: string): Promise<void> => {
    const subject = 'Expression of Interest Processed';
    const content = `
        <p>Dear ${userName},</p>
        <p>Your Expression of Interest has been processed, and our team has taken the necessary next steps.</p>
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

// 16. Notification/Nomination form mail (INFO BLUE)
export const sendNominationFormEmail = async (to: string, userName: string): Promise<void> => {
    const subject = 'Official Nomination Form Issued';
    const content = `
        <p>Dear ${userName},</p>
        <p>Your Official Nomination Form has been issued and is available on your dashboard.</p>
        <p>Please review, sign, and upload the document to proceed.</p>
    `;
    await sendInfoEmail(to, subject, content);
};

// 17. Contract form mail (INFO BLUE)
export const sendContractFormEmail = async (to: string, userName: string): Promise<void> => {
    const subject = 'Employment Contract Issued';
    const content = `
        <p>Dear ${userName},</p>
        <p>Your employment contract has been generated and is now available on your dashboard.</p>
        <p>Please review, sign, and upload the contract to proceed.</p>
    `;
    await sendInfoEmail(to, subject, content);
};

// 18. Payment Proof reception Acknowledgement
export const sendPaymentProofReceivedEmail = async (
    to: string, 
    userName: string, 
    typeDescription: string,
    isAveling: boolean = false
): Promise<void> => {
    const subject = 'Payment Proof Received';
    const content = `
        <p>Dear ${userName},</p>
        <p>We have successfully received your proof of payment for <strong>${typeDescription}</strong>.</p>
        <p>Our finance team will review and verify this transaction shortly.</p>
    `;
    
    if (isAveling) {
        await sendAvelingEmail(to, subject, content);
    } else {
        await sendInfoEmail(to, subject, content);
    }
};

// 19. Apply for Ticket Sponsorship And Upload Possed Tickets Mail (Blue Collar INFO)
export const sendTicketSponsorshipEmail = async (to: string, userName: string): Promise<void> => {
    const subject = 'Ticket Sponsorship Application Received';
    const content = `
        <p>Dear ${userName},</p>
        <p>We have received your application for Ticket Sponsorship along with your uploaded tickets.</p>
        <p>Our team is reviewing your eligibility. We will notify you once the assessment is complete.</p>
    `;
    await sendInfoEmail(to, subject, content);
};

// 20. Aveling Candidateship Notice (AVELING INFO)
export const sendAvelingCandidateshipNotice = async (to: string, userName: string): Promise<void> => {
    const subject = 'Aveling Candidateship Notice';
    const content = `
        <p>Dear ${userName},</p>
        <p>This is an official notice regarding your Aveling LMS Candidateship.</p>
        <p>Your profile is now being processed for Aveling training integration. Please check your dashboard for pending training modules.</p>
    `;
    await sendAvelingEmail(to, subject, content);
};

// 21. Aveling Notice OF Payment (AVELING INFO)
export const sendAvelingNoticeOfPayment = async (to: string, userName: string): Promise<void> => {
    const subject = 'Aveling Notice of Payment';
    const content = `
        <p>Dear ${userName},</p>
        <p>This is a formal notice regarding payment for your Aveling Training modules.</p>
        <p>Please ensure all outstanding invoices are cleared to avoid disruption to your training schedule.</p>
    `;
    await sendAvelingEmail(to, subject, content);
};
