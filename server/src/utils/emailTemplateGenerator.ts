import { 
    Document, Paragraph, TextRun, HeadingLevel, AlignmentType, 
    Table, TableRow, TableCell, WidthType, BorderStyle, ShadingType 
} from 'docx';
import { ApplicantDocData } from './documentGenerator';

export interface EmailDefinition {
    number: number;
    name: string;
    senderType: string;
    fromAddress: string;
    toAddress: string;
    subject: string;
    trigger: string;
    contentHtml: string;
}

export function getAll23EmailDefinitions(data: ApplicantDocData): EmailDefinition[] {
    const name = data.fullName || 'Nnamdi Iroagba';
    const email = data.email || 'niroagba022@uniport.edu.ng';
    const role = data.jobTitle || 'SITE ENGINEER – FIFO (PERTH, WA)';
    const employer = data.employerName || 'MACA LIMITED';
    const interviewStr = data.interviewDate 
        ? `${data.interviewDate} at ${data.interviewTime || '10:00 AM'} (AWST)` 
        : 'Monday, 27 October 2026 at 10:00 AM (AWST)';
    const wallet = data.walletAddress || 'TX7k9VwE3nQ9LmPzR4tY2uA1sD5fG8hJ0k';
    const amount = data.amountAUD || 720;

    return [
        {
            number: 1,
            name: 'Welcome email',
            senderType: 'System - Blue - Event',
            fromAddress: 'Blue Collar Recruitment <info@jobnexe.com>',
            toAddress: `${name} <${email}>`,
            subject: 'Welcome to Blue Collar Recruitment — Overseas FIFO Portal',
            trigger: 'Registration & Onboarding Initiation',
            contentHtml: `
                <p>Dear ${name},</p>
                <p>Welcome to <strong>Blue Collar Recruitment</strong>. We partner directly with Tier-1 Australian mining and civil infrastructure employers to sponsor qualified overseas professionals into high-demand Fly-In Fly-Out (FIFO) roles in Western Australia.</p>
                <p>Your candidate portal is now active for the position of <strong>${role}</strong>. Attached to this email is your essential reference guide: <strong>HIRING_PROCESS_INFORMATION.pdf</strong>. Please review this document in detail as it establishes the complete operational timeline from initial screening to Australian site deployment.</p>
                <p>Next Steps:</p>
                <ul>
                    <li>Log in to your candidate dashboard to verify your profile details.</li>
                    <li>Upload your ATS-compliant CV and certified trade qualifications.</li>
                    <li>Complete your preliminary readiness assessment.</li>
                </ul>
                <p>Yours faithfully,<br><strong>Gary Fletcher</strong><br>Head of International Candidate Operations<br>Blue Collar Recruitment Pty Ltd</p>
            `
        },
        {
            number: 2,
            name: 'Psychometric Module 1 mail',
            senderType: 'System - Blue - Event',
            fromAddress: 'Blue Collar Recruitment <info@jobnexe.com>',
            toAddress: `${name} <${email}>`,
            subject: 'Stage 1.1: Psychometric Assessment Module 1 Access Unlocked',
            trigger: 'CV Verified / Screening Passed',
            contentHtml: `
                <p>Dear ${name},</p>
                <p>Your CV has been screened and meets the initial trade criteria for <strong>${role}</strong>. You are now invited to complete <strong>Psychometric Module 1</strong>.</p>
                <p>This module evaluates workplace safety compliance, risk perception, and situational judgment under Western Australian Work Health and Safety (WHS) mining standards. All questions are derived directly from Section 1 of <em>HIRING_PROCESS_INFORMATION.pdf</em>.</p>
                <p><strong>Sponsorship Eligibility:</strong> Candidates who achieve a passing mark in Module 1 are officially recognized as eligible for at least partial ticket training sponsorship (minimum 70% subsidy rate).</p>
                <p>Yours faithfully,<br><strong>Blue Collar Technical Assessment Team</strong></p>
            `
        },
        {
            number: 3,
            name: 'Psychometric Module 2 mail',
            senderType: 'System - Blue - Cron',
            fromAddress: 'Blue Collar Recruitment <info@jobnexe.com>',
            toAddress: `${name} <${email}>`,
            subject: 'Stage 1.2: Psychometric Assessment Module 2 Activation',
            trigger: 'Module 1 Passed Cron Follow-up',
            contentHtml: `
                <p>Dear ${name},</p>
                <p>Congratulations on successfully passing Module 1. <strong>Psychometric Module 2</strong> is now open on your portal.</p>
                <p>Prior to starting, our pre-module confirmation gate will verify that you have read and retained <em>HIRING_PROCESS_INFORMATION.pdf</em>. This assessment focuses purely on technical trade standards and operational protocols.</p>
                <p><em>Notice: Questions are based strictly on Sections 1 & 2 of the hiring process framework, excluding refund policy inquiries.</em></p>
                <p>Yours faithfully,<br><strong>Blue Collar Technical Assessment Team</strong></p>
            `
        },
        {
            number: 4,
            name: 'Application submitted mail',
            senderType: 'System - Blue - Event',
            fromAddress: 'Blue Collar Recruitment <info@jobnexe.com>',
            toAddress: `${name} <${email}>`,
            subject: 'Application Successfully Submitted — Under Operational Review',
            trigger: 'Applicant Submits Completed Application',
            contentHtml: `
                <p>Dear ${name},</p>
                <p>Thank you for completing your assessments and profile data for <strong>${role}</strong>. Your application has been formally submitted and has transitioned to <strong>under-review</strong>.</p>
                <p>Our review committee evaluates applicant experience, trade certifications, and technical compatibility against current sponsor vacancies. You will receive official notification regarding your application status within 12 hours.</p>
                <p>Yours faithfully,<br><strong>Blue Collar Recruitment Admissions Committee</strong></p>
            `
        },
        {
            number: 5,
            name: 'Application accepted mail',
            senderType: 'System - Blue - Cron',
            fromAddress: 'Blue Collar Recruitment <info@jobnexe.com>',
            toAddress: `${name} <${email}>`,
            subject: 'Congratulations: Your FIFO Application Has Been Accepted',
            trigger: '12-Hour Automated Application Run (Feature Group 14)',
            contentHtml: `
                <p>Dear ${name},</p>
                <p>Congratulations! Following review by our technical committee, your application for <strong>${role}</strong> has been officially <strong>ACCEPTED</strong>.</p>
                <p>Please take note of the following critical terms regarding your progression:</p>
                <ol>
                    <li><strong>Required Training:</strong> You may require further prerequisite competency training and High Risk Work tickets subject to the specific statutory safety requirements of your future Australian employer.</li>
                    <li><strong>Employer Cost Liability:</strong> Your future Australian employer is fully liable for the cost of training, visa sponsorship, and any financial responsibility borne by you in the context of required training for the applied role upon site deployment.</li>
                    <li><strong>Employer Selection Stage:</strong> You will formally select your future host employer in our next communication. Your official Employer Selection Form and employer slot allocation will be dispatched within 24 hours.</li>
                </ol>
                <p>Yours faithfully,<br><strong>Gary Fletcher</strong><br>Hiring Operations Director<br>Blue Collar Recruitment Pty Ltd</p>
            `
        },
        {
            number: 6,
            name: 'Employer Selection mail (M06)',
            senderType: 'System - Blue - Cron',
            fromAddress: 'Blue Collar Recruitment <info@jobnexe.com>',
            toAddress: `${name} <${email}>`,
            subject: 'Action Required: Select Your FIFO Host Employer (Stage: Ongoing)',
            trigger: '24 Hours Post-Acceptance Cron Dispatch',
            contentHtml: `
                <p>Dear ${name},</p>
                <p>Your recruitment stage has been updated to: <strong>Employer Selection — Ongoing</strong>.</p>
                <p>Below are the current Tier-1 Australian mining employers offering visa sponsorship slots for the position of <strong>${role}</strong>:</p>
                <table border="1" cellpadding="6" style="border-collapse: collapse;">
                    <thead>
                        <tr style="background-color: #0b3486; color: white;">
                            <th>Host Employer</th>
                            <th>Target Role</th>
                            <th>Allocated Vacancies</th>
                            <th>Operational Website</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><strong>${employer}</strong></td>
                            <td>${role}</td>
                            <td>5 Slots Available</td>
                            <td><a href="https://www.maca.net.au">maca.net.au</a></td>
                        </tr>
                        <tr>
                            <td><strong>Mineral Resources Ltd</strong></td>
                            <td>${role}</td>
                            <td>3 Slots Available</td>
                            <td><a href="https://www.mineralresources.com.au">mineralresources.com.au</a></td>
                        </tr>
                    </tbody>
                </table>
                <p><strong>Official Australian Visa Sponsorship Verification:</strong> You can independently verify registered Australian sponsor employers on the official register: <a href="https://www.workvisalawyers.com.au/images/Approved-Sponsor-List-2025.pdf">Approved Sponsor List (2025 Release)</a>.</p>
                <p><strong>Action Required:</strong> Log in to your portal, download your pre-populated <strong>Employer Selection Form</strong>, sign it, and upload the signed document within 48 hours.</p>
                <p>Yours faithfully,<br><strong>Blue Collar Employer Partnerships Team</strong></p>
            `
        },
        {
            number: 7,
            name: 'Employer Selection filled mail',
            senderType: 'System - Blue - Cron',
            fromAddress: 'Blue Collar Recruitment <info@jobnexe.com>',
            toAddress: `${name} <${email}>`,
            subject: 'Employer Selection Form Received — Verification In Progress',
            trigger: 'Candidate Uploads Signed Employer Selection Form',
            contentHtml: `
                <p>Dear ${name},</p>
                <p>We confirm receipt of your signed <strong>Employer Selection Form</strong> nominating <strong>${employer}</strong> as your preferred Australian host employer.</p>
                <p>Our corporate liaison desk is currently validating your selection against active quota allocations. A formal confirmation and interview schedule will follow within 5 hours.</p>
                <p>Yours faithfully,<br><strong>Blue Collar Employer Partnerships Team</strong></p>
            `
        },
        {
            number: 8,
            name: 'Employer Selection accepted mail',
            senderType: 'System - Blue - Cron',
            fromAddress: 'Blue Collar Recruitment <info@jobnexe.com>',
            toAddress: `${name} <${email}>`,
            subject: 'Employer Selection Confirmed — Next Step: Technical Interview',
            trigger: '5 Hours Post-Submission Cron Match',
            contentHtml: `
                <p>Dear ${name},</p>
                <p>Your recruitment stage has been updated to: <strong>Employer Selection — Completed</strong>.</p>
                <p>Your nomination for <strong>${employer}</strong> has been fully confirmed and matched with their current workforce expansion. Your profile has been handed over to the MACA recruitment panel to schedule your formal technical interview.</p>
                <p>Expect a dedicated communication directly from the employer recruitment panel with your interview date, time, and Zoom access link.</p>
                <p>Yours faithfully,<br><strong>Blue Collar Placement Desk</strong></p>
            `
        },
        {
            number: 9,
            name: 'Notification of interview date and time mail',
            senderType: 'Admin - Employer - Event',
            fromAddress: 'MACA Mining Recruitment <recruitment@jobnexe.com>',
            toAddress: `${name} <${email}>`,
            subject: 'Technical Video Interview Confirmation: MACA Limited / WA Mining Operations',
            trigger: 'Admin / Employer Schedules Interview (INAS01)',
            contentHtml: `
                <p>Dear ${name},</p>
                <p>Following your employer selection confirmation, <strong>MACA Limited</strong> is pleased to invite you to attend a technical competency interview for the position of <strong>${role}</strong>.</p>
                <table border="1" cellpadding="6" style="border-collapse: collapse;">
                    <tr><td><strong>Candidate:</strong></td><td>${name}</td></tr>
                    <tr><td><strong>Date & Time:</strong></td><td><strong>${interviewStr}</strong></td></tr>
                    <tr><td><strong>Interview Portal:</strong></td><td><a href="https://zoom.us/j/8829102910">Join Video Interview (Zoom)</a></td></tr>
                    <tr><td><strong>Panel Chair:</strong></td><td>MACA Mining Infrastructure Technical Panel</td></tr>
                </table>
                <p><strong>Discussion Topics:</strong> Trade background, heavy equipment safety protocols, civil site supervision experience, and English proficiency.</p>
                <p>Yours faithfully,<br><strong>MACA Limited Recruitment Panel</strong><br>Western Australia Mining & Infrastructure</p>
            `
        },
        {
            number: 10,
            name: 'Hire procedure email',
            senderType: 'System - Employer - Cron (INA02)',
            fromAddress: 'MACA Limited Human Resources <recruitment@jobnexe.com>',
            toAddress: `${name} <${email}>`,
            subject: 'MACA Employee Onboarding Guide: Interview to Mobilisation Roadmap',
            trigger: 'INA02 Cron (1 Hour Post-Interview Notice)',
            contentHtml: `
                <p>Dear ${name},</p>
                <p>Following your interview confirmation, please find attached the official <strong>MACA Employee Onboarding Guide (maca-employee-onboarding-guide.pdf)</strong> populated with your particulars and role details.</p>
                <p>This document details our Subclass 482 visa nomination framework, Trades Recognition Australia (TRA) skills assessment protocol, temporary resident nomination (TRN), panel physician medicals, and our 100% employer-covered relocation commitments (international airfare, 3 months paid transitional housing, camp accommodation, and site transit).</p>
                <p>Please review this guide thoroughly prior to your technical interview.</p>
                <p>Yours faithfully,<br><strong>MACA Limited Human Resources</strong><br>45 Briggs St, Welshpool WA 6106 | maca.net.au</p>
            `
        },
        {
            number: 11,
            name: 'Call for ticket sponsorship mail',
            senderType: 'System - Blue - Cron',
            fromAddress: 'Blue Collar Recruitment <info@jobnexe.com>',
            toAddress: `${name} <${email}>`,
            subject: 'Action Required: Invitation to Apply for FIFO Ticket Training Sponsorship',
            trigger: 'TSAS01 Cron (3 Hours Post-Interview Notice)',
            contentHtml: `
                <p>Dear ${name},</p>
                <p>To ensure total compliance with Australian mining regulations ahead of your interview and visa lodgement, you are invited to apply for <strong>Ticket Training Sponsorship</strong>.</p>
                <p>Please visit your candidate dashboard to:</p>
                <ol>
                    <li>Upload any existing Australian or recognized tickets you already possess.</li>
                    <li>Submit your application for a subsidized training allocation on any prerequisite gap tickets.</li>
                </ol>
                <p>Yours faithfully,<br><strong>Blue Collar Training & Sponsorship Desk</strong></p>
            `
        },
        {
            number: 12,
            name: 'Ticket sponsorship accepted mail',
            senderType: 'System - Blue - Cron',
            fromAddress: 'Blue Collar Recruitment <info@jobnexe.com>',
            toAddress: `${name} <${email}>`,
            subject: 'Approved: Ticket Training Sponsorship Granted (70% Employer Subsidy)',
            trigger: 'TSAS04 Cron (6 Hours Post-Sponsorship Application)',
            contentHtml: `
                <p>Dear ${name},</p>
                <p>We are pleased to inform you that your application for Ticket Training Sponsorship has been officially <strong>APPROVED</strong>.</p>
                <p>MACA Limited and Blue Collar Recruitment will fund <strong>70%</strong> of the costs associated with your prerequisite competency units and verification materials. Your candidate agreement and course enrollment packages are currently being generated.</p>
                <p>Yours faithfully,<br><strong>Blue Collar Training & Sponsorship Desk</strong></p>
            `
        },
        {
            number: 13,
            name: 'Ticket courses enrollment mail',
            senderType: 'System - Rto - Cron',
            fromAddress: 'CertHero RTO Partner <info@certhero.com.au>',
            toAddress: `${name} <${email}>`,
            subject: 'CertHero RTO Course Enrollment Confirmation & Learner Schedule',
            trigger: 'Course Enrollment Stage Cron',
            contentHtml: `
                <p>Dear ${name},</p>
                <p>Welcome to <strong>CertHero RTO</strong> (Registered Training Organisation Partner). You have been officially enrolled in your prerequisite mining competency coursework for <strong>${role}</strong>.</p>
                <p>Attached to this email is your <strong>CertHero Enrollment Letter</strong>, outlining your enrolled units, mode of instruction (Online Theory vs On-site Practical), and assessment criteria.</p>
                <p><strong>Mandatory Completion Window:</strong> All online examinations must be completed within <strong>16 days</strong> from the date of this enrollment notice.</p>
                <p>Yours faithfully,<br><strong>CertHero Admissions & Student Administration</strong><br>Perth, Western Australia | certhero.com.au</p>
            `
        },
        {
            number: 14,
            name: 'Contract delivery mail',
            senderType: 'System - Blue - Event',
            fromAddress: 'Blue Collar Recruitment <info@jobnexe.com>',
            toAddress: `${name} <${email}>`,
            subject: 'Sponsored Candidate Competency Agreement — Action Required',
            trigger: 'Contract Generation Event',
            contentHtml: `
                <p>Dear ${name},</p>
                <p>Your official <strong>Sponsored Candidate Competency Agreement</strong> is now ready for review and ratification on your portal.</p>
                <p><strong>Clarification:</strong> This document is a Ticket Sponsorship & Verification Agreement, not an employment contract. It guarantees that upon acquiring and verifying prerequisite tickets, ${employer} will proceed with your formal visa nomination.</p>
                <p><strong>Refund Guarantee:</strong> Under our guarantee, 100% of your residual candidate contribution ($${amount} AUD) is refunded by ${employer} upon arrival and site deployment.</p>
                <p>Yours faithfully,<br><strong>Blue Collar Legal & Compliance Office</strong></p>
            `
        },
        {
            number: 15,
            name: 'Contract agreement acknowledgement mail',
            senderType: 'System - Blue - Event',
            fromAddress: 'Blue Collar Recruitment <info@jobnexe.com>',
            toAddress: `${name} <${email}>`,
            subject: 'Contract Agreement Ratified — Official Tax Invoice Issued',
            trigger: 'Candidate Ratifies Sponsorship Contract',
            contentHtml: `
                <p>Dear ${name},</p>
                <p>We confirm that you have signed and ratified your <strong>Sponsored Candidate Competency Agreement</strong>.</p>
                <p>Your tax invoice for the residual subsidized contribution ($${amount} AUD) has been issued by CertHero RTO and is accessible in your dashboard billing tab.</p>
                <p>Yours faithfully,<br><strong>Blue Collar Candidate Support Desk</strong></p>
            `
        },
        {
            number: 16,
            name: 'Invoice mail',
            senderType: 'System - Rto - Event',
            fromAddress: 'CertHero Finance <finance@certhero.com.au>',
            toAddress: `${name} <${email}>`,
            subject: 'Tax Invoice #INV-53: CertHero Competency Courseware & Verification',
            trigger: 'Invoice Creation Event',
            contentHtml: `
                <p>Dear ${name},</p>
                <p>Please find attached your official Tax Invoice (<strong>#INV-53</strong>) covering your courseware, LMS assessment modules, and statement of attainment verification for <strong>${role}</strong>.</p>
                <table border="1" cellpadding="6" style="border-collapse: collapse;">
                    <tr><td><strong>Total Courseware Cost:</strong></td><td>$2,400.00 AUD</td></tr>
                    <tr><td><strong>Approved 70% Subsidy:</strong></td><td>-$1,680.00 AUD</td></tr>
                    <tr><td><strong>Net Candidate Contribution:</strong></td><td><strong>$${amount}.00 AUD (100% Refundable)</strong></td></tr>
                </table>
                <p><strong>Payment Channels:</strong> Instant Cryptocurrency Gateway (USDT TRC20) or International Swift Wire Transfer to our escrow account.</p>
                <p><em>Refund Policy: 100% refunded by ${employer} upon mobilisation.</em></p>
                <p>Yours faithfully,<br><strong>CertHero RTO Accounts Department</strong></p>
            `
        },
        {
            number: 17,
            name: 'Crypto payment direction mail',
            senderType: 'System - Rto - Event (Trigger, PA02, PCAS02)',
            fromAddress: 'CertHero Finance <finance@certhero.com.au>',
            toAddress: `${name} <${email}>`,
            subject: 'Cryptocurrency Gateway Protocol: USDT TRC20 Payment Instructions',
            trigger: 'Candidate Initiates Crypto Payment Selection',
            contentHtml: `
                <p>Dear ${name},</p>
                <p>You have selected the Cryptocurrency gateway for settling your subsidized candidate verification fee.</p>
                <p>Please dispatch your transfer using the following verified credentials:</p>
                <table border="1" cellpadding="6" style="border-collapse: collapse;">
                    <tr><td><strong>Asset:</strong></td><td>USDT (Tether USD)</td></tr>
                    <tr><td><strong>Network:</strong></td><td><strong>Tron Network (TRC20)</strong></td></tr>
                    <tr><td><strong>Amount Due:</strong></td><td>$468.00 USDT (Equivalent of $${amount} AUD)</td></tr>
                    <tr><td><strong>Wallet Address:</strong></td><td><code>${wallet}</code></td></tr>
                </table>
                <p><strong>Crucial Warning:</strong> Ensure you transfer strictly over the TRC20 (Tron) network. Dispatches via ERC20, BSC, or other protocols will fail. Following dispatch, submit your transaction hash on your billing tab for instant automated clearance.</p>
                <p>Yours faithfully,<br><strong>CertHero Digital Settlement Desk</strong></p>
            `
        },
        {
            number: 18,
            name: 'Receipt mail',
            senderType: 'Admin - Rto - Manual',
            fromAddress: 'CertHero Finance <finance@certhero.com.au>',
            toAddress: `${name} <${email}>`,
            subject: 'Official Payment Receipt #REC-53 — Full LMS Access Unlocked',
            trigger: 'Invoice Marked Paid (Full or Half)',
            contentHtml: `
                <p>Dear ${name},</p>
                <p>Your payment of <strong>$${amount}.00 AUD</strong> has been verified and permanently credited against Tax Invoice #INV-53.</p>
                <p>Attached is your official <strong>Payment Receipt (#REC-53)</strong>. Your CertHero LMS account is now fully unlocked, granting you unrestricted access to study all technical syllabi and sit for competency assessments.</p>
                <p>Yours faithfully,<br><strong>CertHero Finance & Student Portal</strong></p>
            `
        },
        {
            number: 19,
            name: 'Ticket pass mail',
            senderType: 'System - Rto - Event',
            fromAddress: 'CertHero Examination Board <exams@certhero.com.au>',
            toAddress: `${name} <${email}>`,
            subject: 'Examination Passed: Competency Unit Successfully Verified',
            trigger: 'Applicant Achieves >= 80% on Examination',
            contentHtml: `
                <p>Dear ${name},</p>
                <p>Congratulations! You have achieved a passing grade (<strong>88%</strong>) on your competency examination for <strong>RIIWHS204E — Work safely at heights</strong>.</p>
                <p>Your result has been logged in the national training database and will be reflected on your official Statement of Attainment.</p>
                <p>Yours faithfully,<br><strong>CertHero RTO Examination Board</strong></p>
            `
        },
        {
            number: 20,
            name: 'Ticket fail mail',
            senderType: 'System - Rto - Event',
            fromAddress: 'CertHero Examination Board <exams@certhero.com.au>',
            toAddress: `${name} <${email}>`,
            subject: 'Examination Assessment Result: Review Syllabus & Re-Sit Information',
            trigger: 'Applicant Scores Below 80%',
            contentHtml: `
                <p>Dear ${name},</p>
                <p>Thank you for submitting your examination for <strong>RIIWHS202E — Enter and work in confined spaces</strong>. Your score was <strong>74%</strong>, which falls just short of the required 80% competency threshold.</p>
                <p>You have been allocated a complimentary re-sit opportunity. Please review the highlighted syllabus sections in your course portal and attempt the assessment again at your convenience.</p>
                <p>Yours faithfully,<br><strong>CertHero Academic Review Panel</strong></p>
            `
        },
        {
            number: 21,
            name: 'Ticket delivery mail',
            senderType: 'System - Rto - Event',
            fromAddress: 'CertHero Credentials Desk <credentials@certhero.com.au>',
            toAddress: `${name} <${email}>`,
            subject: 'Official Statement of Attainment & Competency Ticket Certificates',
            trigger: 'All Tickets Passed and Issued',
            contentHtml: `
                <p>Dear ${name},</p>
                <p>We are pleased to formally issue your accredited Australian mining competency certificates. All required units for <strong>${role}</strong> have been verified.</p>
                <p>Attached is your official <strong>Statement of Attainment (CERT-FIFO-53)</strong>. Copies have also been forwarded to ${employer} and Trades Recognition Australia (TRA) for your visa skills assessment.</p>
                <p>Yours faithfully,<br><strong>CertHero RTO Registrar</strong></p>
            `
        },
        {
            number: 22,
            name: 'Ticket drop-off mail',
            senderType: 'System - Rto - Event',
            fromAddress: 'CertHero Student Services <support@certhero.com.au>',
            toAddress: `${name} <${email}>`,
            subject: 'Urgent Notice: Examination Completion Window Closing (16-Day Notice)',
            trigger: 'Inactivity or Deadline Warning Event',
            contentHtml: `
                <p>Dear ${name},</p>
                <p>This is a formal reminder that your 16-day examination completion window for your sponsored competency coursework is expiring in <strong>3 days</strong>.</p>
                <p>To avoid forfeiture of your employer sponsorship subsidy and maintain your technical interview standing with ${employer}, please log in to your student portal immediately and finalize any outstanding modules.</p>
                <p>Yours faithfully,<br><strong>CertHero Student Support Desk</strong></p>
            `
        },
        {
            number: 23,
            name: 'Handoff mail',
            senderType: 'Admin - Blue collar - Event',
            fromAddress: 'Blue Collar Executive Team <info@jobnexe.com>',
            toAddress: `${name} <${email}>`,
            subject: 'Final Stage Completed: Handover to Host Employer (MACA Limited) for Visa & Deployment',
            trigger: 'All Training & Verification Completed (Final Handoff)',
            contentHtml: `
                <p>Dear ${name},</p>
                <p>We are thrilled to congratulate you on completing all prerequisite training, competency examinations, and onboarding milestones for the position of <strong>${role}</strong>.</p>
                <p><strong>Formal Handover:</strong> Your file, certified tickets, and verified credentials have been formally transferred to <strong>${employer}</strong>. The MACA Human Resources mobilisation desk will now contact you directly regarding:</p>
                <ul>
                    <li>Issuing your Transaction Reference Number (TRN) for Subclass 482 visa lodgement.</li>
                    <li>Scheduling your approved panel physician health examination.</li>
                    <li>Coordinating your international flight itinerary to Perth, Western Australia.</li>
                </ul>
                <p>It has been a privilege guiding you through this phase of your international career, and we wish you every success in your Australian mining journey.</p>
                <p>Yours sincerely,<br><strong>Gary Nexon Fletcher</strong><br>Managing Director<br>Blue Collar Recruitment Pty Ltd</p>
            `
        }
    ];
}

/**
 * Generates an executive DOCX document for a single email
 */
export async function generateEmailDocx(email: EmailDefinition): Promise<Document> {
    const navy = '0B3486';
    const charcoal = '1E293B';
    const lightBg = 'F8FAFC';
    const borderCol = 'CBD5E1';

    const children: (Paragraph | Table)[] = [];

    // Header metadata block
    children.push(
        new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 180, after: 60 },
            children: [
                new TextRun({ text: `EMAIL #${email.number}: ${email.name.toUpperCase()}`, bold: true, size: 26, color: navy })
            ]
        }),
        new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 180 },
            children: [
                new TextRun({ text: 'FIFO RECRUITMENT & RTO SYSTEM EMAIL DISPATCH SPECIFICATION', size: 18, color: '64748B' })
            ]
        })
    );

    // Meta Table Card
    children.push(
        new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
                new TableRow({
                    children: [
                        new TableCell({
                            shading: { type: ShadingType.CLEAR, fill: lightBg },
                            borders: {
                                left: { style: BorderStyle.SINGLE, size: 20, color: navy },
                                top: { style: BorderStyle.SINGLE, size: 4, color: borderCol },
                                right: { style: BorderStyle.SINGLE, size: 4, color: borderCol },
                                bottom: { style: BorderStyle.SINGLE, size: 4, color: borderCol }
                            },
                            margins: { top: 100, bottom: 100, left: 160, right: 160 },
                            children: [
                                new Paragraph({ children: [new TextRun({ text: 'EMAIL NUMBER: ', bold: true, color: charcoal }), new TextRun({ text: `#${email.number} of 23`, bold: true, color: navy })] }),
                                new Paragraph({ children: [new TextRun({ text: 'SENDER CLASSIFICATION: ', bold: true, color: charcoal }), new TextRun({ text: email.senderType, bold: true })] }),
                                new Paragraph({ children: [new TextRun({ text: 'FROM: ', bold: true, color: charcoal }), new TextRun({ text: email.fromAddress })] }),
                                new Paragraph({ children: [new TextRun({ text: 'TO: ', bold: true, color: charcoal }), new TextRun({ text: email.toAddress, bold: true })] }),
                                new Paragraph({ children: [new TextRun({ text: 'SUBJECT: ', bold: true, color: charcoal }), new TextRun({ text: email.subject, bold: true, color: navy })] }),
                                new Paragraph({ children: [new TextRun({ text: 'SYSTEM TRIGGER: ', bold: true, color: charcoal }), new TextRun({ text: email.trigger, italics: true, color: '64748B' })] })
                            ]
                        })
                    ]
                })
            ]
        }),
        new Paragraph({ spacing: { after: 200 } }),
        new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 160, after: 100 },
            children: [new TextRun({ text: 'DISPATCHED MESSAGE BODY', bold: true, size: 22, color: navy })]
        })
    );

    // Clean html to plain paragraphs for docx
    const cleanLines = email.contentHtml
        .replace(/<style[\s\S]*?<\/style>/gi, '')
        .replace(/<script[\s\S]*?<\/script>/gi, '')
        .replace(/<table[\s\S]*?<\/table>/gi, '\n[Structured Table Included in Transmission]\n')
        .replace(/<li[^>]*>(.*?)<\/li>/gi, '• $1\n')
        .replace(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/gi, '\n$1\n')
        .replace(/<p[^>]*>/gi, '')
        .replace(/<\/p>/gi, '\n\n')
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .split('\n');

    for (const line of cleanLines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        const isBullet = trimmed.startsWith('•');
        children.push(
            new Paragraph({
                bullet: isBullet ? { level: 0 } : undefined,
                spacing: { before: 60, after: 60 },
                children: [
                    new TextRun({
                        text: isBullet ? trimmed.replace(/^•\s*/, '') : trimmed,
                        size: 20,
                        color: charcoal,
                        font: 'Calibri'
                    })
                ]
            })
        );
    }

    return new Document({ sections: [{ children }] });
}
