"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendTicketCoursePassedEmail = exports.sendTicketCourseFailedEmail = exports.sendTicketCourseSubmittedEmail = exports.sendAvelingCredentialsEmail = exports.sendRtoCredentialsEmail = exports.sendContractApprovedEmail = exports.sendTicketSponsorshipApprovalMail = exports.sendSponsorshipReviewConfirmationMail = exports.sendEmployerRefundAndSponsorshipTermsMail = exports.sendTicketSponsorshipApplicationMail = exports.sendNominationApprovedEmail = exports.sendEmployerSelectionFilledEmail = exports.sendEmployerSelectionSubmittedEmail = exports.sendHowToExpressInterestEmail = exports.sendApplicationAcceptedEmail = exports.sendApplicationSubmittedEmail = exports.sendPsychoMod2PassedEmail = exports.sendPsychoMod2SubmittedEmail = exports.sendPsychoMod1PassedEmail = exports.sendBioReceivedEmail = exports.sendCVUploadEmail = exports.sendEOIReceivedEmail = exports.sendWelcomeApplicationFoundEmail = exports.sendVerificationEmail = exports.sendReceiptEmail = exports.sendCryptoPaymentDirectionEmail = exports.sendInvoiceEmail = exports.sendEmail = exports.sendEmailFrom = exports.sendAvelingEmail = exports.sendEmployerEmail = exports.sendRtoEmail = exports.sendInfoEmail = exports.sendAuthEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const path_1 = __importDefault(require("path"));
const cryptoQr_1 = require("./cryptoQr");
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
const rtoTransporter = createTransporter(process.env.RTO_SMTP_USER || process.env.SMTP_INFO_USER, process.env.RTO_SMTP_PASS || process.env.SMTP_INFO_PASS);
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
    let footerBrand = 'Blue Collar Recruitment';
    let footerTag = 'AUSTRALIAN FIFO & TRADE CAREER OPPORTUNITIES';
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
    }
    else if (isEmployer) {
        headerBgColor = '#111111';
        accentColor = '#FFB800';
        primaryColor = '#111111';
        footerBrand = 'MACA Limited | Direct Australian Hiring Host Employer';
        footerTag = 'MINING & CIVIL INFRASTRUCTURE • 45 BRIGGS ST, WELSHPOOL WA 6106 • MACA.NET.AU';
        const clientBase = (process.env.CLIENT_URL || 'https://www.bluecollarrecruitment.co').replace(/\/$/, '');
        headerContent = `
            <div style="padding: 26px 20px 22px; background-color: #111111; border-bottom: 4px solid #FFB800; text-align: center;">
                <table align="center" border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                    <tr>
                        <td align="center" style="padding-bottom: 10px;">
                            <img src="${clientBase}/maca_logo.png" alt="MACA Limited" width="150" style="display: block; width: 150px; height: auto; margin: 0 auto; outline: none; border: none; text-decoration: none;" />
                        </td>
                    </tr>
                    <tr>
                        <td align="center">
                            <span style="color: #ffffff; font-size: 19px; font-weight: 900; letter-spacing: 0.14em; text-transform: uppercase; font-family: 'Inter', Arial, sans-serif; display: block;">MACA LIMITED</span>
                            <span style="color: #FFB800; font-size: 11px; font-weight: 800; letter-spacing: 0.2em; margin-top: 4px; text-transform: uppercase; font-family: 'Inter', Arial, sans-serif; display: block;">MINING &amp; CIVIL INFRASTRUCTURE • WESTERN AUSTRALIA</span>
                        </td>
                    </tr>
                </table>
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
        from: process.env.SMTP_INFO_FROM || '"BlueCollar Recruitment" <info@bluecollarrecruitment.co>',
        to: adminEmail,
        subject: `[Log] Automated Email Sent to ${recipient}`,
        html: content
    }).catch(err => console.error('[EmailUtil] Failed to send admin notification:', err));
};
const sendAuthEmail = async (to, subject, content, attachments = []) => {
    try {
        await authTransporter.sendMail({
            from: process.env.SMTP_AUTH_FROM || '"BlueCollar Authentication" <donotreply@bluecollarrecruitment.co>',
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
            from: process.env.SMTP_INFO_FROM || '"BlueCollar Recruitment" <info@bluecollarrecruitment.co>',
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
            from: process.env.RTO_SMTP_FROM || '"CertHero RTO" <tickets@certhero.study>',
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
            from: process.env.EMPLOYER_SMTP_FROM || '"MACA Mining Recruitment" <recruitment@bluecollarrecruitment.co>',
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
    let from = process.env.SMTP_INFO_FROM || '"BlueCollar Recruitment" <info@bluecollarrecruitment.co>';
    if (fromType === 'auth') {
        transporter = authTransporter;
        from = process.env.SMTP_AUTH_FROM || '"BlueCollar Authentication" <donotreply@bluecollarrecruitment.co>';
    }
    else if (fromType === 'rto' || fromType === 'aveling') {
        transporter = rtoTransporter;
        from = process.env.RTO_SMTP_FROM || '"CertHero RTO" <tickets@certhero.study>';
    }
    else if (fromType === 'employer') {
        transporter = employerTransporter;
        from = process.env.EMPLOYER_SMTP_FROM || '"MACA Mining Recruitment" <recruitment@bluecollarrecruitment.co>';
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
const sendInvoiceEmail = async (to, candidateName, invoiceType, partAmount, totalCost, subsidyPercentage, finalAmountDue, attachments = [], walletAddress, invoiceId) => {
    let typeDescription = '';
    let emailServer = 'aveling';
    let note = '';
    switch (invoiceType) {
        case 'aveling-partial':
            typeDescription = 'Partial Ticket Sponsorship Payment (50% Deposit)';
            note = 'partial ticket courses and certification commitment deposit.';
            break;
        case 'aveling-complete-after-partial':
            typeDescription = 'Final Ticket Sponsorship Balance Payment';
            note = 'completion of partial ticket courses balance payment.';
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
    const invId = invoiceId || 53;
    const rtoBase = (process.env.RTO_URL || 'http://localhost:3002').replace(/\/$/, '');
    const cardPaymentUrl = `${rtoBase}/payments/card?invoiceId=${invId}&amount=${finalAmountDue.toFixed(2)}`;
    const cryptoPaymentUrl = `${rtoBase}/payments/crypto?invoiceId=${invId}&amount=${finalAmountDue.toFixed(2)}`;
    let paymentFaqLink = `${rtoBase}/payments/faq`;
    try {
        const { Faq } = require('../models');
        const paymentFaq = await Faq.findOne({ where: { type: 'payment' } });
        if (paymentFaq && paymentFaq.link) {
            paymentFaqLink = paymentFaq.link;
        }
    }
    catch (e) {
        // Fallback silently if Faq model not initialized
    }
    const subject = `Tax Invoice #INV-${invId}: ${typeDescription}`;
    const content = `
        <p>Dear ${candidateName},</p>
        <p>Please find attached your official Tax Invoice (<strong>#INV-${invId}</strong>) covering your <strong>${note}</strong> for Australian site deployment.</p>

        <!-- REFUND POLICY 3G PROMINENT AT TOP -->
        <div style="background-color: #f0fdf4; border: 2px solid #22c55e; border-radius: 12px; padding: 20px; margin: 24px 0;">
            <p style="margin: 0 0 10px 0; font-size: 13.5px; font-weight: 800; color: #166534; text-transform: uppercase; letter-spacing: 0.5px;">
                🛡️ Host Employer Refund Guarantee (Policy 3G)
            </p>
            <p style="margin: 0; color: #15803d; font-size: 13.5px; line-height: 1.6;">
                The employer (<strong>MACA Limited</strong>) shall refund <strong>100%</strong> of your expenditure if you successfully complete the training and acquire the necessary tickets, and <strong>80%</strong> on failure to do so, with the 20% accounting for institutional RTO administrative and assessment fees.
            </p>
        </div>

        <p><strong>Financial Breakdown:</strong></p>
        <ul style="line-height: 1.7; font-size: 14.5px;">
            ${totalCost > 0 ? `<li>Standard Coursework & Licensing Value: <strong>$${totalCost.toFixed(2)} AUD</strong></li>` : ''}
            ${subsidyPercentage > 0 ? `<li>Approved Employer Subsidy: <strong>${subsidyPercentage}% (MACA Funded)</strong></li>` : ''}
            ${partAmount > 0 ? `<li>Initial Commitment Deposit Option (50%): <strong>$${partAmount.toFixed(2)} AUD</strong></li>` : ''}
            <li><strong>Final Balance Due: <span style="color: #0b3486; font-size: 16px;">$${finalAmountDue.toFixed(2)} AUD</span></strong></li>
        </ul>

        <!-- LIVE MANAGER ASSISTANCE & TIME PROMPT -->
        <div style="background-color: #eff6ff; border-left: 4px solid #2563eb; padding: 18px 20px; border-radius: 8px; margin: 22px 0;">
            <p style="margin: 0 0 8px 0; color: #1e40af; font-weight: bold; font-size: 14px;">
                📅 Preferred Payment Date &amp; Time Coordination (Live Manager Guidance)
            </p>
            <p style="margin: 0; color: #1d4ed8; font-size: 13.5px; line-height: 1.6;">
                Please reply directly to this invoice email with your <strong>preferred date and local time (including your timezone)</strong> when you intend to complete payment (e.g. <em>"Tomorrow, 2:30 PM WAT"</em>). This ensures your assigned application manager will be online to provide immediate guidance, verify transaction receipts, and confirm your course unlocking in real time.
            </p>
        </div>

        <p><strong>Approved Payment Methods &amp; Guidance:</strong></p>

        <!-- PAYMENT METHOD 1: CARD -->
        <div style="border: 1px solid #e2e8f0; border-radius: 10px; padding: 18px; margin-bottom: 16px; background-color: #ffffff;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                    <td>
                        <span style="font-size: 15px; font-weight: bold; color: #0f172a;">1. Credit / Debit Card Gateway</span>
                    </td>
                    <td align="right">
                        <a href="${cardPaymentUrl}" style="background-color: #0b3486; color: #ffffff !important; padding: 8px 18px; font-size: 12px; font-weight: 700; text-decoration: none; border-radius: 6px; text-transform: uppercase;">Pay via Card</a>
                    </td>
                </tr>
            </table>
            <p style="font-size: 13px; color: #475569; margin: 10px 0 6px 0;">
                <strong>Pros:</strong> Instant digital processing, familiar checkout interface.<br>
                <strong>Cons:</strong> International bank processing charges, subject to regional merchant card gateway restrictions depending on your issuing bank country.
            </p>
            <p style="font-size: 12.5px; color: #64748b; margin: 0; font-style: italic; border-top: 1px dashed #e2e8f0; padding-top: 8px;">
                <strong>Agent Proximity &amp; Delay Reduction Clause:</strong> Due to cross-border card merchant controls, card payment attempts automatically trigger routing to our regional agent network using blockchain-grade settlement rails. This eliminates multi-day international correspondent wire holds and prevents excessive banking conversion fees.
            </p>
        </div>

        <!-- PAYMENT METHOD 2: CRYPTO -->
        <div style="border: 1px solid #e2e8f0; border-radius: 10px; padding: 18px; margin-bottom: 16px; background-color: #ffffff;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                    <td>
                        <span style="font-size: 15px; font-weight: bold; color: #0f172a;">2. Cryptocurrency (USDT TRC20 via Bitget Web3)</span>
                    </td>
                    <td align="right">
                        <a href="${cryptoPaymentUrl}" style="background-color: #EAA240; color: #000000 !important; padding: 8px 18px; font-size: 12px; font-weight: 800; text-decoration: none; border-radius: 6px; text-transform: uppercase;">Pay via Crypto</a>
                    </td>
                </tr>
            </table>
            <p style="font-size: 13px; color: #475569; margin: 10px 0 6px 0;">
                <strong>Pros:</strong> 0% cross-border intermediary bank deductions, instant confirmation, 100% verifiable on TRON blockchain, direct Bitget Web3 app integration.<br>
                <strong>Cons:</strong> Requires basic wallet or Bitget exchange application familiarity.
            </p>
            <p style="font-size: 12.5px; color: #64748b; margin: 0; font-style: italic; border-top: 1px dashed #e2e8f0; padding-top: 8px;">
                Clicking the crypto checkout link navigates directly to our CertHero Web3 portal, where you can scan or 1-click launch your payment via Bitget Wallet with full protection.
            </p>
        </div>

        <!-- PAYMENT METHOD 3 & 4: WIRE -->
        <div style="background-color: #f8fafc; border-radius: 8px; padding: 14px 18px; margin-bottom: 20px; font-size: 13px; color: #475569;">
            <p style="margin: 0 0 6px 0;"><strong>3. International Bank Wire Transfer (SWIFT):</strong> Available for full tuition settlements above AUD 700 threshold (3–5 business days clearance).</p>
            <p style="margin: 0;"><strong>4. Agent Bank Wire Transfer:</strong> Available for candidate installments below AUD 700 through our designated regional correspondent bank account.</p>
        </div>

        <!-- SCREENSHOT CONFIRMATION NOTICE -->
        <div style="background-color: #fffbeb; border: 1px solid #fde68a; padding: 14px 18px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; font-size: 13px; color: #92400e; line-height: 1.5;">
                📸 <strong>Confirmation Screenshot Requirement:</strong> Upon completing payment via Card, Crypto, or Wire, please capture a clear screenshot of your payment receipt or transfer confirmation and reply to this email or upload it on your portal for instant verification by your application manager.
            </p>
        </div>

        ${paymentFaqLink ? `
        <p style="font-size: 13.5px; color: #475569;">
            <strong>Need Assistance?</strong> Review our comprehensive <a href="${paymentFaqLink}" target="_blank" style="color: #0b3486; font-weight: bold; text-decoration: underline;">Payment FAQ &amp; Guidance Guide</a>.
        </p>` : ''}

        <p>Yours faithfully,<br><strong>CertHero Finance &amp; Student Billing Desk</strong><br>Perth, Western Australia | tickets@certhero.study</p>
    `;
    if (emailServer === 'aveling') {
        await (0, exports.sendAvelingEmail)(to, subject, content, attachments);
    }
    else {
        await (0, exports.sendInfoEmail)(to, subject, content, attachments);
    }
};
exports.sendInvoiceEmail = sendInvoiceEmail;
// 3b. Crypto Payment Direction Email (Email 17)
const sendCryptoPaymentDirectionEmail = async (to, candidateName, amountDue, invoiceId) => {
    const invId = invoiceId || 53;
    const rtoBase = (process.env.RTO_URL || 'http://localhost:3002').replace(/\/$/, '');
    const checkoutUrl = `${rtoBase}/payments/crypto?invoiceId=${invId}&amount=${amountDue.toFixed(2)}`;
    const bitgetDeepLink = `https://bkcode.vip?action=dapp&url=${encodeURIComponent(checkoutUrl)}`;
    const paymentFaqUrl = `${rtoBase}/payments/faq`;
    const activeWallet = await (0, cryptoQr_1.getActiveWalletAddress)();
    const qrCodeDataUrl = await (0, cryptoQr_1.generateQrDataUrl)(bitgetDeepLink);
    const subject = `Secure Crypto Settlement Direction — Invoice #INV-${invId} (Bitget Web3 Guidance)`;
    const content = `
        <p>Dear ${candidateName},</p>
        <p>Following your payment request for your subsidized mining competency modules, our finance department has established an optimized, zero-fee settlement channel via our accredited partner <strong>Bitget Web3</strong>.</p>

        <!-- PSYCHOLOGY & TRUST BUILDING -->
        <div style="background-color: #f8fafc; border-left: 4px solid #000000; padding: 18px 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0 0 8px 0; font-size: 14px; font-weight: 800; color: #000000; text-transform: uppercase; letter-spacing: 0.5px;">
                Why CertHero Recommends Cryptocurrency (USDT TRC20)
            </p>
            <p style="margin: 0; font-size: 13.5px; color: #334155; line-height: 1.6;">
                International bank wires and overseas credit cards frequently experience arbitrary regional merchant blocks, multi-day delays, and steep foreign exchange conversion surcharges. 
                <br><br>
                To protect your candidate mobilization schedule, CertHero utilizes <strong>Bitget</strong>—one of the world's most trusted, fully regulated Web3 institutions with 100% proof-of-reserves. Paying via USDT (TRON network) ensures zero bank intermediary deductions, immediate block confirmation, and flawless settlement tracking directly linked to your candidate profile.
            </p>
        </div>

        <!-- BITGET APP STORE LINKS -->
        <div style="background-color: #f1f5f9; border-radius: 10px; padding: 16px 20px; margin: 20px 0;">
            <p style="margin: 0 0 10px 0; font-size: 13px; font-weight: 700; color: #0f172a; text-transform: uppercase;">
                Download Bitget Wallet (Official Apps &amp; Extension):
            </p>
            <table width="100%" cellpadding="6" cellspacing="0" border="0" style="font-size: 13px;">
                <tr>
                    <td>📱 <strong>Apple iOS:</strong> <a href="https://apps.apple.com/app/bitget-wallet-crypto-web3/id1552528731" target="_blank" style="color: #0284c7; font-weight: 600;">Download on App Store</a></td>
                </tr>
                <tr>
                    <td>🤖 <strong>Android:</strong> <a href="https://play.google.com/store/apps/details?id=com.bitkeep.wallet" target="_blank" style="color: #0284c7; font-weight: 600;">Download on Google Play</a></td>
                </tr>
                <tr>
                    <td>💻 <strong>Browser:</strong> <a href="https://chromewebstore.google.com/detail/bitget-wallet-crypto-web/jiidiaihnpaekcfingnlagblgnbihjem" target="_blank" style="color: #0284c7; font-weight: 600;">Install Chrome Extension</a></td>
                </tr>
            </table>
        </div>

        <!-- SCANNABLE / CLICKABLE QR CODE -->
        <div style="text-align: center; margin: 28px 0; padding: 22px; background-color: #ffffff; border: 2px solid #EAA240; border-radius: 14px;">
            <p style="margin: 0 0 12px 0; font-size: 14px; font-weight: 800; color: #000000; text-transform: uppercase; letter-spacing: 0.5px;">
                Click or Scan to Pay via Bitget Wallet
            </p>
            ${qrCodeDataUrl ? `
            <a href="${bitgetDeepLink}" target="_blank" style="display: inline-block; text-decoration: none;">
                <img src="${qrCodeDataUrl}" alt="Scan or Click for Bitget DeepLink" width="220" style="display: block; margin: 0 auto; border-radius: 10px; border: 1px solid #e2e8f0;" />
            </a>
            ` : ''}
            <p style="margin: 12px 0 6px 0; font-size: 12px; color: #64748b;">
                <strong>Device Intelligence:</strong> Clicking or scanning automatically launches Bitget Wallet to our checkout screen. If Bitget is not yet installed on your device, it directs you to your device app store to install.
            </p>
            <div style="margin-top: 14px;">
                <a href="${checkoutUrl}" class="button" style="display: inline-block; padding: 12px 28px; background-color: #EAA240; color: #000000 !important; font-weight: 900; text-decoration: none; border-radius: 8px; text-transform: uppercase; font-size: 12px;">
                    View Step-by-Step Payment Instructions
                </a>
            </div>
        </div>

        <!-- WALLET ADDRESS PARTICULARS -->
        <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 16px; margin: 20px 0; font-size: 13.5px;">
            <p style="margin: 0 0 6px 0;"><strong>Settlement Network:</strong> <span style="background-color: #fef08a; padding: 2px 6px; border-radius: 4px; font-weight: bold;">TRON (TRC20)</span></p>
            <p style="margin: 0 0 6px 0;"><strong>Token Currency:</strong> USDT (Tether USD)</p>
            <p style="margin: 0 0 6px 0;"><strong>Amount Due:</strong> <strong>$${amountDue.toFixed(2)} AUD</strong> (or equivalent USDT)</p>
            <p style="margin: 0 0 4px 0;"><strong>Official CertHero TRON Address:</strong></p>
            <p style="font-family: monospace; font-size: 13px; font-weight: bold; background: #ffffff; padding: 8px 12px; border: 1px solid #e2e8f0; border-radius: 6px; word-break: break-all; margin: 0; color: #0f172a;">
                ${activeWallet}
            </p>
        </div>

        <!-- SCREENSHOT UPLOAD -->
        <div style="background-color: #f0fdf4; border-left: 4px solid #16a34a; padding: 14px 18px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; font-size: 13px; color: #166534; line-height: 1.5;">
                📸 <strong>Proof of Transfer:</strong> Once your transfer is broadcast, please reply directly to this email with a screenshot of your transaction confirmation or TxID hash, or submit it on your <a href="${checkoutUrl}" style="color: #15803d; font-weight: bold; text-decoration: underline;">Crypto Checkout Portal</a>. Your application manager will verify the block and issue your official Statement of Attainment receipt immediately.
            </p>
        </div>

        <p style="font-size: 13px; color: #475569;">
            Have questions regarding crypto transfers? Visit our <a href="${paymentFaqUrl}" target="_blank" style="color: #0b3486; font-weight: bold; text-decoration: underline;">Crypto &amp; Payment FAQ</a>.
        </p>

        <p>Yours faithfully,<br><strong>CertHero Finance &amp; International Settlement Desk</strong><br>Perth, Western Australia | tickets@certhero.study</p>
    `;
    await (0, exports.sendRtoEmail)(to, subject, content);
};
exports.sendCryptoPaymentDirectionEmail = sendCryptoPaymentDirectionEmail;
// 4. Receipt Email Template
const sendReceiptEmail = async (to, candidateName, receiptType, amountPaid, invoiceId, attachments = [], walletAddress, paymentType) => {
    const isPartial = paymentType === 'partial';
    const emailServer = receiptType === 'aveling' ? 'aveling' : 'info';
    const subject = isPartial
        ? `Official Payment Receipt #REC-${invoiceId} — Partial Payment Confirmed (Deposit)`
        : `Official Payment Receipt #REC-${invoiceId} — Full Payment Confirmed`;
    const content = `
        <p>Dear ${candidateName},</p>
        <p>We have successfully received and verified your payment.</p>
        <p><strong>Official Receipt Particulars:</strong></p>
        <ul>
            <li>Linked Invoice ID: #${invoiceId}</li>
            <li>Amount Paid: $${amountPaid.toFixed(2)} AUD</li>
            <li>Settlement Type: <strong>${isPartial ? 'Partial Payment (50%+ Deposit)' : 'Complete Payment (100% Paid)'}</strong></li>
            <li>Issuing Entity: ${receiptType === 'aveling' ? 'CertHero RTO Training Systems' : 'BlueCollar Infrastructure'}</li>
            ${walletAddress ? `<li>Payment Reference: ${walletAddress}</li>` : ''}
            <li>Verification Status: Confirmed & Recorded</li>
        </ul>
        <div style="background-color: ${isPartial ? '#fef3c7' : '#dcfce7'}; border-left: 4px solid ${isPartial ? '#d97706' : '#16a34a'}; padding: 12px 16px; margin: 16px 0; border-radius: 4px;">
            <p style="margin: 0; font-weight: bold; color: ${isPartial ? '#92400e' : '#166534'};">
                ${isPartial ? 'PARTIAL PAYMENT REGISTERED (THREE-EXAM LIMIT NOTICE):' : 'FULL PAYMENT CONFIRMED — UNLIMITED LMS ACCESS UNLOCKED:'}
            </p>
            <p style="margin: 6px 0 0 0; font-size: 13px; color: ${isPartial ? '#78350f' : '#14532d'};">
                ${isPartial
        ? 'Your initial commitment deposit has been verified and registered. You are authorized to access course modules and complete up to three (3) competency unit examinations. Full balance settlement is required prior to unlocking remaining examinations and final credential issuance.'
        : 'Your payment has been verified and permanently registered. You are authorized to access all course modules and sit for the accredited examination portal without restriction.'}
            </p>
        </div>
        <p>Support & inquiries: <a href="mailto:tickets@certhero.study">tickets@certhero.study</a></p>
        <p>Thank you for your prompt commitment.</p>
    `;
    if (emailServer === 'aveling') {
        await (0, exports.sendAvelingEmail)(to, subject, content, attachments);
    }
    else {
        await (0, exports.sendInfoEmail)(to, subject, content, attachments);
    }
};
exports.sendReceiptEmail = sendReceiptEmail;
const sendVerificationEmail = async (to, userName, verifyLink) => {
    const subject = 'Verify Your Email Address - Blue Collar Recruitment';
    const content = `
        <p>Hi ${userName || 'there'},</p>
        <p>Thank you for signing up with <strong>Blue Collar Recruitment</strong>. Please confirm your email address by clicking the button below:</p>
        <div class="cta-block">
            <a href="${verifyLink}" class="button">Verify Email Address</a>
        </div>
        <p style="margin-top: 25px; font-size: 13px; color: #64748b;">
            If the button doesn't work, copy and paste this link into your browser:<br>
            <a href="${verifyLink}" style="color: #004ac6; word-break: break-all;">${verifyLink}</a>
        </p>
        <p style="font-size: 13px; color: #64748b;">
            If you did not create an account, you can safely ignore this email.
        </p>
        <p>Best regards,<br><strong>The Blue Collar Recruitment Team</strong></p>
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
        <div style="background-color: #f0f7ff; border-left: 4px solid #004ac6; padding: 16px 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #1e3a8a; font-size: 13.5px; line-height: 1.6;">
                <strong>A quick personal note on communications:</strong><br/>
                Our team dedicates a focused personal window every day between <strong>2:00 PM and 4:00 PM Australian Western Standard Time (AWST)</strong> to review submissions, answer questions, and provide status updates. You will always receive personal attention during this daily window.
            </p>
        </div>
        <div style="background-color:#fff8e1;border-left:5px solid #FFC700;padding:18px 22px;border-radius:8px;margin:24px 0;">
            <p style="margin:0 0 10px 0;font-weight:900;font-size:15px;color:#1a1a1a;text-transform:uppercase;letter-spacing:0.5px;">
                📄 IMPORTANT: Please Read the Attached Document
            </p>
            <p style="margin:0;color:#374151;font-size:14px;font-weight:600;line-height:1.6;">
                We have attached our official <strong>Hiring Process Information Guide (HIRING_PROCESS_INFORMATION.pdf)</strong> to this email. This document contains critical information regarding our partner Registered Training Organisation, our 9-step recruitment workflow, zero-cost migration benefits, and the technical interview conducted directly with your prospective employer (not Blue Collar Recruitment).
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
    const subject = 'Congratulations: You Have Passed Psychometric Module 1 — Training Sponsorship Eligibility Confirmed';
    const content = `
        <p>Dear ${userName},</p>
        <p>We are delighted to congratulate you on successfully passing <strong>Psychometric Module 1</strong>!</p>
        <div style="background-color: #f0fdf4; border: 2px solid #22c55e; border-radius: 12px; padding: 20px; margin: 24px 0;">
            <p style="margin: 0 0 10px 0; font-size: 14px; font-weight: 800; text-transform: uppercase; color: #166534; letter-spacing: 0.5px;">
                🎉 Training Sponsorship Eligibility Milestone Achieved
            </p>
            <p style="margin: 0 0 10px 0; font-size: 13.5px; color: #15803d; line-height: 1.6;">
                As detailed in our official <strong>Hiring Process Guide</strong>, successfully clearing Psychometric Module 1 confirms your cognitive readiness and trade problem-solving aptitude.
            </p>
            <p style="margin: 0; font-size: 13.5px; color: #166534; font-weight: 600; line-height: 1.6;">
                This qualification confirms that you are now <strong>officially eligible for corporate training sponsorship</strong> covering mandatory High Risk Work tickets and vocational certifications to bridge any knowledge or credential gaps you may possess for Australian site operations.
            </p>
        </div>
        <p><strong>Next Steps:</strong></p>
        <ol style="margin-bottom: 20px; font-size: 13.5px; color: #374151; line-height: 1.7;">
            <li>Please log in to your candidate portal and proceed to <strong>Psychometric Module 2</strong>.</li>
            <li>Module 2 assesses your comprehension of the 9-step recruitment workflow and operational guidelines from the Hiring Process Guide.</li>
            <li>Upon completing Module 2, our team will review your application file for employer selection and trade nomination.</li>
        </ol>
        <div class="cta-block">
            <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/dashboard" class="button">Access Candidate Portal</a>
        </div>
        <p style="margin-top: 24px; font-size: 13px; color: #64748b;">
            Warm regards,<br>
            <strong>The Blue Collar Recruitment Team</strong>
        </p>
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
const sendEmployerSelectionSubmittedEmail = async (to, userName, nominatedEmployer) => {
    const subject = 'Employer Selection Form Received — Verification In Progress';
    const content = `
        <p>Dear ${userName},</p>
        <p>We confirm that Blue Collar Recruitment has successfully received your submitted <strong>Employer Selection Form</strong> nominating <strong>${nominatedEmployer || 'your selected Australian host employer'}</strong>.</p>
        <p>Your nominated selection has been securely registered in our placement system. Our corporate partnerships desk is now validating your submission against active host employer quota allocations, visa compliance standards, and Western Australian resources project deployment schedules.</p>
        <p>Your candidate portal status has been updated to: <strong>Employer Selection — Under Review</strong>.</p>
        <p>We will provide a formal allocation update upon completion of the quota verification process.</p>
        <p>Yours faithfully,<br><strong>Blue Collar Employer Partnerships Team</strong><br>Blue Collar Recruitment Pty Ltd</p>
    `;
    await (0, exports.sendInfoEmail)(to, subject, content);
};
exports.sendEmployerSelectionSubmittedEmail = sendEmployerSelectionSubmittedEmail;
const sendEmployerSelectionFilledEmail = async (to, userName, previouslySelectedEmployer, updatedFormUrl, attachmentBuffer) => {
    const subject = 'Important Notice: Employer Selection Quota Filled — Alternative Allocation Available';
    const content = `
        <p>Dear ${userName},</p>
        <p>We are writing to provide an urgent operational update regarding your recent Employer Selection submission nominating <strong>${previouslySelectedEmployer}</strong>.</p>
        <p>Due to high applicant demand and statutory Subclass 482 visa nomination quota caps, the allocated vacancies for <strong>${previouslySelectedEmployer}</strong> have now been <strong>fully filled and closed</strong> for the current intake.</p>
        <p>To ensure your international mobilization timeline is protected and you do not lose your candidate standing, Blue Collar Recruitment has reserved your priority placement with our primary Tier-1 host employer: <strong>MACA Limited</strong>. MACA Limited currently represents the <strong>only active host employer with immediate open vacancies and approved Australian visa sponsorship</strong> for your trade stream.</p>
        <p><strong>Action Required:</strong></p>
        <ol>
            <li>Please review your updated <strong>Employer Selection Form</strong> containing exclusively <strong>MACA Limited</strong> (attached to this notification and available in your portal).</li>
            <li>Log in to your candidate dashboard (<a href="${process.env.CLIENT_URL || 'https://www.bluecollarrecruitment.co'}/dashboard/nominations">Employer Selection Portal</a>), where MACA Limited is now presented as your exclusive available option.</li>
            <li>Review, sign, and submit the updated Employer Selection Form for MACA Limited to lock in your guaranteed sponsorship allocation and technical interview schedule.</li>
        </ol>
        <p>Yours faithfully,<br><strong>Troy Latuff</strong><br>Chief Executive Officer<br>Blue Collar Recruitment Pty Ltd</p>
    `;
    const attachments = [];
    if (attachmentBuffer) {
        attachments.push({
            filename: 'Employer_Selection_Form_MACA.docx',
            content: attachmentBuffer
        });
    }
    else if (updatedFormUrl) {
        attachments.push({
            filename: 'Employer_Selection_Form_MACA.docx',
            path: updatedFormUrl
        });
    }
    await (0, exports.sendInfoEmail)(to, subject, content, attachments);
};
exports.sendEmployerSelectionFilledEmail = sendEmployerSelectionFilledEmail;
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
const sendTicketSponsorshipApplicationMail = async (to, userName, options) => {
    const employer = options?.employerName || 'MACA Limited';
    const subsidy = options?.subsidyPercentage ?? 70;
    const amount = options?.amountAUD ?? 720.00;
    const subject = 'Action Required: Invitation to Apply for FIFO Ticket Training Sponsorship';
    const content = `
        <p>Dear ${userName},</p>
        <p>Following the successful approval of your host employer nomination, you are formally invited to apply for prerequisite <strong>FIFO Ticket Training Sponsorship</strong>.</p>
        <p>Please note the following critical terms governing your sponsorship framework:</p>
        <ol style="line-height: 1.6; margin-top: 12px; margin-bottom: 16px;">
            <li><strong>Temporary Partial Coverage:</strong> Please be advised that your host employer, <strong>${employer}</strong>, only temporarily covers ticket sponsorship partially at this preparatory stage.</li>
            <li><strong>Refund Account Notice:</strong> Please keep a close eye on your mailbox, as <strong>${employer}</strong> will ask for your nominated bank account details to deposit your refund soon.</li>
            <li><strong>Commitment Rationale:</strong> The employer demands a temporary financial commitment from the applicant to reduce drop-off rates and in turn reduce financial waste for the employer on unutilized training allocations.</li>
            <li><strong>No Fees to Blue Collar Recruitment:</strong> Applicants are not in any way paying Blue Collar Recruitment Pty Ltd for recruitment services, representation, or visa nomination coordination.</li>
            <li><strong>Payment Directly to Cert Hero RTO After Enrollment:</strong> Applicants shall pay <strong>Cert Hero RTO</strong> after they have been enrolled for the ticket courses; not before, but a commitment deposit will be required to complete the courses and write the examinations.</li>
            <li><strong>Flexible Installment Options:</strong> Applicants can pay half of the fee initially and complete the balance midway or towards the end of the training.</li>
            <li><strong>Refund Guarantee Policy:</strong> The employer shall refund <strong>100%</strong> of your expenditure if you successfully complete the training and acquire the necessary tickets, and <strong>80%</strong> on failure to do so, with the 20% accounting for institutional admin fees.</li>
            <li><strong>Approved Coverage & Payable Amount:</strong> Your approved employer subsidy coverage is <strong>${subsidy}%</strong>, leaving an applicant payable commitment amount of <strong>$${amount.toFixed(2)} AUD</strong>.</li>
        </ol>
        <p>Please log in to your candidate dashboard (<a href="https://www.bluecollarrecruitment.co/dashboard/tickets">Tickets Portal</a>) to verify your competency requirements and submit your sponsorship application within 48 hours.</p>
        <p>Yours faithfully,<br><strong>Blue Collar Training & Sponsorship Desk</strong><br>Blue Collar Recruitment Pty Ltd</p>
    `;
    await (0, exports.sendInfoEmail)(to, subject, content);
};
exports.sendTicketSponsorshipApplicationMail = sendTicketSponsorshipApplicationMail;
const sendEmployerRefundAndSponsorshipTermsMail = async (to, userName, options) => {
    const employer = options?.employerName || 'MACA Limited';
    const role = options?.role || 'Mining & Civil Infrastructure Operations';
    const subsidy = options?.subsidyPercentage ?? 70;
    const amount = options?.amountAUD ?? 720.00;
    const subject = `${employer}: Refund Banking Details Request & Prerequisite Training Terms`;
    const content = `
        <p>Dear ${userName},</p>
        <p>Following your employer allocation to <strong>${employer}</strong> for the position of <strong>${role}</strong>, our corporate finance and mobilization department requires your banking particulars for our refund register.</p>
        <div style="background-color: #fdfaf6; border-left: 4px solid #FFB800; padding: 16px 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0 0 10px 0; font-size: 14px; font-weight: 800; color: #111111; text-transform: uppercase; letter-spacing: 0.5px;">
                Action Required — Refund Bank Account Submission
            </p>
            <p style="margin: 0; font-size: 13.5px; color: #374151; line-height: 1.6;">
                Please reply directly to this email with your nominated bank account details (including <strong>Account Name, Account Number / IBAN, Bank Name, Branch, and International SWIFT / BIC Code</strong>). These details will be placed on official file for the direct deposit and collection of your refunds of the money spent on mandatory training.
            </p>
        </div>
        <p><strong>Corporate Sponsorship &amp; Verification Terms:</strong></p>
        <ol style="line-height: 1.6; margin-top: 12px; margin-bottom: 16px;">
            <li><strong>Temporary Partial Coverage:</strong> Please be advised that ${employer} only temporarily covers ticket sponsorship partially at this offshore preparation stage.</li>
            <li><strong>Financial Commitment Rationale:</strong> Our executive management requires a temporary financial commitment from candidates to reduce drop-off rates and protect our allocated workforce sponsorship budget from unnecessary financial waste on uncompleted modules.</li>
            <li><strong>Institutional Training Payment to Cert Hero RTO:</strong> You shall pay accredited training provider <strong>Cert Hero RTO</strong> strictly after you have been successfully enrolled in the prerequisite ticket courses (not before). This commitment deposit is required to unlock your learning syllabus and sit your competency examinations.</li>
            <li><strong>Flexible Installment Options:</strong> To support your financial planning, you are permitted to pay half (50%) of the fee initially and complete the balance midway or towards the end of the training.</li>
            <li><strong>100% Employer Refund Covenant:</strong> ${employer} shall refund <strong>100%</strong> of your expenditure upon successful completion of your training and acquisition of the necessary tickets. In the event of failure to acquire the tickets, the employer shall refund <strong>80%</strong>, with the remaining 20% retained for institutional RTO assessment and administrative fees.</li>
            <li><strong>Coverage Percentage &amp; Payable Commitment:</strong> Under your approved allocation, ${employer} covers <strong>${subsidy}%</strong> of the ticketing costs, leaving an applicant payable commitment of <strong>$${amount.toFixed(2)} AUD</strong>.</li>
        </ol>
        <p>Please reply with your bank account details at your earliest convenience to ensure uninterrupted candidate processing.</p>
        <p>Yours faithfully,<br><strong>${employer} Recruitment &amp; Human Resources</strong><br>45 Briggs St, Welshpool WA 6106 | maca.net.au</p>
    `;
    await (0, exports.sendEmployerEmail)(to, subject, content);
};
exports.sendEmployerRefundAndSponsorshipTermsMail = sendEmployerRefundAndSponsorshipTermsMail;
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
    await (0, exports.sendRtoEmail)(to, subject, content);
};
exports.sendRtoCredentialsEmail = sendRtoCredentialsEmail;
exports.sendAvelingCredentialsEmail = exports.sendRtoCredentialsEmail;
const sendTicketCourseSubmittedEmail = async (to, userName) => {
    const subject = 'Cert Hero: Ticket Course Exam Submitted';
    const dashboardUrl = (process.env.RTO_URL || 'https://www.certhero.study').replace(/\/$/, '') + '/dashboard';
    const content = `
        <p>Dear ${userName},</p>
        <p>We have successfully received your examination submission for your ticket course on the <strong>Cert Hero LMS</strong>. Your answers have been recorded for grading and verification.</p>
        <div class="cta-block" style="text-align: center; margin: 24px 0;">
            <a href="${dashboardUrl}" class="button" style="display: inline-block; padding: 14px 30px; background-color: #EAA240; color: #000000 !important; font-weight: 900; text-decoration: none; border-radius: 8px;">View Candidate Dashboard</a>
        </div>
    `;
    await (0, exports.sendRtoEmail)(to, subject, content);
};
exports.sendTicketCourseSubmittedEmail = sendTicketCourseSubmittedEmail;
const sendTicketCourseFailedEmail = async (to, userName) => {
    const subject = 'Cert Hero: Ticket Course Assessment Result';
    const dashboardUrl = (process.env.RTO_URL || 'https://www.certhero.study').replace(/\/$/, '') + '/dashboard';
    const content = `
        <p>Dear ${userName},</p>
        <p>Your recent ticket course assessment on the <strong>Cert Hero LMS</strong> did not reach the required 80% passing threshold. Please review the syllabus modules thoroughly before initiating your re-sit attempt.</p>
        <div class="cta-block" style="text-align: center; margin: 24px 0;">
            <a href="${dashboardUrl}" class="button" style="display: inline-block; padding: 14px 30px; background-color: #000000; color: #ffffff !important; font-weight: 900; text-decoration: none; border-radius: 8px;">Review Syllabus &amp; Re-sit</a>
        </div>
    `;
    await (0, exports.sendRtoEmail)(to, subject, content);
};
exports.sendTicketCourseFailedEmail = sendTicketCourseFailedEmail;
const sendTicketCoursePassedEmail = async (to, userName) => {
    const subject = 'Cert Hero: Assessment Passed! Statement of Attainment Ready';
    const certsUrl = (process.env.RTO_URL || 'https://www.certhero.study').replace(/\/$/, '') + '/my-certifications';
    const content = `
        <p>Dear ${userName},</p>
        <p><strong>Congratulations!</strong> You have successfully passed your ticket course assessment on the <strong>Cert Hero LMS</strong>. Your digital competency verification has been recorded and submitted to your employer sponsor portfolio.</p>
        <div class="cta-block" style="text-align: center; margin: 24px 0;">
            <a href="${certsUrl}" class="button" style="display: inline-block; padding: 16px 34px; background-color: #EAA240; color: #000000 !important; font-weight: 900; text-decoration: none; border-radius: 10px;">Download Statement of Attainment</a>
        </div>
    `;
    await (0, exports.sendRtoEmail)(to, subject, content);
};
exports.sendTicketCoursePassedEmail = sendTicketCoursePassedEmail;
