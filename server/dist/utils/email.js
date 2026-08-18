"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = exports.sendWelcomeEmail = exports.sendEOIEmail = exports.sendApexInvitationEmail = exports.sendEmailFrom = exports.sendAvelingEmail = exports.sendInfoEmail = exports.sendAuthEmail = void 0;
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
const avelingTransporter = createTransporter('examinations@aveling.online', '97Chocho@');
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
avelingTransporter.verify((error, success) => {
    if (error) {
        console.error('[EmailUtil] Aveling Transporter Connection Error:', error);
    }
    else {
        console.log('[EmailUtil] Aveling Transporter ready to dispatch.');
    }
});
console.log(`[EmailUtil] SMTP Decoupled Transporters Initialized.`);
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
const sendAuthEmail = async (to, subject, content, attachments = []) => {
    try {
        await authTransporter.sendMail({
            from: process.env.SMTP_AUTH_FROM || '"BlueCollar Authentication" <donotreply@BlueCollar.com>',
            to,
            subject,
            html: getStandardEmailTemplate(subject, content, 'auth'),
            attachments,
        });
        console.log(`[EmailUtil] Auth email dispatched to: ${to}`);
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
            from: process.env.SMTP_INFO_FROM || '"BlueCollar Infrastructure" <info@BlueCollar.com>',
            to,
            subject,
            html: getStandardEmailTemplate(subject, content, 'info'),
            attachments,
        });
        console.log(`[EmailUtil] Info email dispatched to: ${to}`);
    }
    catch (error) {
        console.error(`[EmailUtil] Info email failed:`, error);
        throw new Error('Info email dispatch failed');
    }
};
exports.sendInfoEmail = sendInfoEmail;
const sendAvelingEmail = async (to, subject, content, attachments = []) => {
    try {
        await avelingTransporter.sendMail({
            from: process.env.AV_SMTP_INFO_FROM || '"BlueCollarRecruitment Aveling" <info@jobnexe.com>',
            to,
            subject,
            html: getStandardEmailTemplate(subject, content, 'aveling'),
            attachments,
        });
        console.log(`[EmailUtil] Aveling email dispatched to: ${to}`);
    }
    catch (error) {
        console.error(`[EmailUtil] Aveling email failed:`, error);
        throw new Error('Aveling email dispatch failed');
    }
};
exports.sendAvelingEmail = sendAvelingEmail;
const sendEmailFrom = async (fromType, to, subject, content, attachments = []) => {
    let transporter = infoTransporter;
    let from = process.env.SMTP_INFO_FROM || '"BlueCollar Infrastructure" <info@BlueCollar.com>';
    if (fromType === 'auth') {
        transporter = authTransporter;
        from = process.env.SMTP_AUTH_FROM || '"BlueCollar Authentication" <donotreply@BlueCollar.com>';
    }
    else if (fromType === 'aveling') {
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
    }
    catch (error) {
        console.error(`[EmailUtil] ${fromType} email failed:`, error);
        throw new Error(`${fromType} email dispatch failed`);
    }
};
exports.sendEmailFrom = sendEmailFrom;
// Apex Invitation Template
const sendApexInvitationEmail = async (to, userName) => {
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
    await (0, exports.sendAuthEmail)(to, subject, content);
};
exports.sendApexInvitationEmail = sendApexInvitationEmail;
// Expression of Interest Template (Scouting)
const sendEOIEmail = async (to) => {
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
    await (0, exports.sendAuthEmail)(to, subject, content);
};
exports.sendEOIEmail = sendEOIEmail;
// Welcome Email Template (Post-Verification)
const sendWelcomeEmail = async (to, userName) => {
    const subject = 'Welcome to BlueCollar: Next Steps for Your Profile';
    const content = `
        <p>Dear ${userName},</p>
        <p>Welcome to the BlueCollar recruitment ecosystem. Your account has been successfully verified.</p>
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
    const templatePath = path_1.default.resolve(process.cwd(), 'Universal Applicant CV Template.docx');
    const attachments = [];
    if (fs.existsSync(templatePath)) {
        attachments.push({
            filename: 'Universal Applicant CV Template.docx',
            path: templatePath
        });
        console.log(`[EmailUtil] Attaching CV Template from: ${templatePath}`);
    }
    else {
        console.warn(`[EmailUtil] CV Template not found at expected location: ${templatePath}. Sending welcome mail without attachment.`);
    }
    await (0, exports.sendAuthEmail)(to, subject, content, attachments);
};
exports.sendWelcomeEmail = sendWelcomeEmail;
// Backward compatibility or generic usage
exports.sendEmail = exports.sendInfoEmail;
