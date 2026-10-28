"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateMacaOnboardingGuideDocx = void 0;
exports.generateEmployerSelectionFormDocx = generateEmployerSelectionFormDocx;
exports.generateCertHeroEnrollmentLetterDocx = generateCertHeroEnrollmentLetterDocx;
exports.generateSponsorshipContractDocx = generateSponsorshipContractDocx;
exports.generateTaxInvoiceDocx = generateTaxInvoiceDocx;
exports.generateOfficialReceiptDocx = generateOfficialReceiptDocx;
exports.generateTicketCertificateDocx = generateTicketCertificateDocx;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const docx_1 = require("docx");
const macaOnboardingGuide_1 = require("./macaOnboardingGuide");
Object.defineProperty(exports, "generateMacaOnboardingGuideDocx", { enumerable: true, get: function () { return macaOnboardingGuide_1.generateMacaOnboardingGuideDocx; } });
const NAVY = '0B3486';
const ORANGE = 'EAA240';
const GOLD = 'FFC700';
const AMBER = 'ED9139';
const SLATE_DARK = '0F172A';
const CHARCOAL = '1E293B';
const LIGHT_BG = 'F8FAFC';
const EMERALD = '10B981';
const BORDER_LIGHT = 'E2E8F0';
const CERTHERO_LOGO_PATH = path_1.default.join(__dirname, '../assets/certhero_logo.png');
const BLUE_COLLAR_LOGO_PATH = path_1.default.join(__dirname, '../assets/email-logo.jpg');
function createLogoParagraph(imagePath, width, height, alignment = docx_1.AlignmentType.CENTER) {
    try {
        if (fs_1.default.existsSync(imagePath)) {
            const ext = path_1.default.extname(imagePath).toLowerCase();
            const imgType = (ext === '.jpg' || ext === '.jpeg') ? 'jpg' : 'png';
            return new docx_1.Paragraph({
                alignment,
                spacing: { before: 120, after: 120 },
                children: [
                    new docx_1.ImageRun({
                        data: fs_1.default.readFileSync(imagePath),
                        transformation: { width, height },
                        type: imgType
                    })
                ]
            });
        }
    }
    catch (e) {
        console.warn(`[documentGenerator] Failed to load logo from ${imagePath}:`, e);
    }
    return null;
}
/**
 * 1. Employer Selection Form (Always includes all 4 employers with slots 2–3, total pool = slots + 2)
 */
async function generateEmployerSelectionFormDocx(data) {
    const children = [];
    // Blue Collar Logo
    const logoP = createLogoParagraph(BLUE_COLLAR_LOGO_PATH, 140, 93);
    if (logoP)
        children.push(logoP);
    // Header
    children.push(new docx_1.Paragraph({
        alignment: docx_1.AlignmentType.CENTER,
        spacing: { before: 100, after: 80 },
        children: [
            new docx_1.TextRun({ text: 'BLUE COLLAR RECRUITMENT AUSTRALIA', bold: true, size: 28, color: NAVY, font: 'Arial' })
        ]
    }), new docx_1.Paragraph({
        alignment: docx_1.AlignmentType.CENTER,
        spacing: { before: 0, after: 60 },
        children: [
            new docx_1.TextRun({ text: 'OFFICIAL NOTICE OF EMPLOYER SELECTION & TRADE SPONSORSHIP', bold: true, size: 20, color: CHARCOAL, font: 'Arial' })
        ]
    }), new docx_1.Paragraph({
        alignment: docx_1.AlignmentType.CENTER,
        spacing: { before: 0, after: 180 },
        children: [
            new docx_1.TextRun({ text: 'Licensed Recruitment & Workforce Deployment | Suite 213/35-37 Doody St, Alexandria NSW 2015 | ABN 67 105 263 151', size: 16, color: '64748B' })
        ]
    }));
    // Candidate details card
    children.push(new docx_1.Table({
        width: { size: 100, type: docx_1.WidthType.PERCENTAGE },
        rows: [
            new docx_1.TableRow({
                children: [
                    new docx_1.TableCell({
                        shading: { type: docx_1.ShadingType.CLEAR, fill: LIGHT_BG },
                        borders: {
                            left: { style: docx_1.BorderStyle.SINGLE, size: 20, color: NAVY },
                            top: { style: docx_1.BorderStyle.SINGLE, size: 4, color: BORDER_LIGHT },
                            right: { style: docx_1.BorderStyle.SINGLE, size: 4, color: BORDER_LIGHT },
                            bottom: { style: docx_1.BorderStyle.SINGLE, size: 4, color: BORDER_LIGHT }
                        },
                        margins: { top: 120, bottom: 120, left: 180, right: 180 },
                        children: [
                            new docx_1.Paragraph({ children: [new docx_1.TextRun({ text: 'CANDIDATE: ', bold: true, color: SLATE_DARK }), new docx_1.TextRun({ text: data.fullName, color: NAVY, bold: true })] }),
                            new docx_1.Paragraph({ children: [new docx_1.TextRun({ text: 'EMAIL: ', bold: true, color: SLATE_DARK }), new docx_1.TextRun({ text: data.email })] }),
                            new docx_1.Paragraph({ children: [new docx_1.TextRun({ text: 'APPLIED ROLE: ', bold: true, color: SLATE_DARK }), new docx_1.TextRun({ text: data.jobTitle, bold: true })] }),
                            new docx_1.Paragraph({ children: [new docx_1.TextRun({ text: 'DOCUMENT REF: ', bold: true, color: SLATE_DARK }), new docx_1.TextRun({ text: `ESF-APP-${data.applicantId}-2026`, color: '64748B' })] })
                        ]
                    })
                ]
            })
        ]
    }), new docx_1.Paragraph({ spacing: { after: 160 } }));
    const isMacaOnly = Boolean(data.onlyEmployingEmployer);
    const employer = isMacaOnly ? (data.employerName || 'MACA Limited') : (data.employerName || 'MACA LIMITED');
    // Official Sponsor Employers List Table
    // If onlyEmployingEmployer is true (re-selection form after 7b): shows ONLY MACA Limited (3 slots, total pool = 5)
    // Otherwise: All 4 employers included (MACA: 3 slots, MinRes: 2 slots, Northern Star: 2 slots, Rio Tinto: 3 slots. Total slots = 10, Total pool = 12)
    const tableRows = [
        new docx_1.TableRow({
            children: [
                new docx_1.TableCell({ shading: { type: docx_1.ShadingType.CLEAR, fill: NAVY }, children: [new docx_1.Paragraph({ children: [new docx_1.TextRun({ text: 'Host Mining Employer', bold: true, color: 'FFFFFF' })] })] }),
                new docx_1.TableCell({ shading: { type: docx_1.ShadingType.CLEAR, fill: NAVY }, children: [new docx_1.Paragraph({ children: [new docx_1.TextRun({ text: 'Target FIFO Trade Stream', bold: true, color: 'FFFFFF' })] })] }),
                new docx_1.TableCell({ shading: { type: docx_1.ShadingType.CLEAR, fill: NAVY }, children: [new docx_1.Paragraph({ children: [new docx_1.TextRun({ text: 'Allocated Slots', bold: true, color: 'FFFFFF' })] })] }),
                new docx_1.TableCell({ shading: { type: docx_1.ShadingType.CLEAR, fill: NAVY }, children: [new docx_1.Paragraph({ children: [new docx_1.TextRun({ text: 'Sponsorship Status', bold: true, color: 'FFFFFF' })] })] })
            ]
        }),
        new docx_1.TableRow({
            children: [
                new docx_1.TableCell({ margins: { top: 80, bottom: 80, left: 80, right: 80 }, children: [new docx_1.Paragraph({ children: [new docx_1.TextRun({ text: 'MACA Limited', bold: true })] })] }),
                new docx_1.TableCell({ margins: { top: 80, bottom: 80, left: 80, right: 80 }, children: [new docx_1.Paragraph({ children: [new docx_1.TextRun({ text: data.jobTitle })] })] }),
                new docx_1.TableCell({ margins: { top: 80, bottom: 80, left: 80, right: 80 }, children: [new docx_1.Paragraph({ children: [new docx_1.TextRun({ text: '3 Active Positions' })] })] }),
                new docx_1.TableCell({ margins: { top: 80, bottom: 80, left: 80, right: 80 }, children: [new docx_1.Paragraph({ children: [new docx_1.TextRun({ text: 'Active Sponsor (Approved 482)', color: '15803D', bold: true })] })] })
            ]
        })
    ];
    if (!isMacaOnly) {
        tableRows.push(new docx_1.TableRow({
            children: [
                new docx_1.TableCell({ margins: { top: 80, bottom: 80, left: 80, right: 80 }, children: [new docx_1.Paragraph({ children: [new docx_1.TextRun({ text: 'Mineral Resources Limited', bold: true })] })] }),
                new docx_1.TableCell({ margins: { top: 80, bottom: 80, left: 80, right: 80 }, children: [new docx_1.Paragraph({ children: [new docx_1.TextRun({ text: data.jobTitle })] })] }),
                new docx_1.TableCell({ margins: { top: 80, bottom: 80, left: 80, right: 80 }, children: [new docx_1.Paragraph({ children: [new docx_1.TextRun({ text: '2 Active Positions' })] })] }),
                new docx_1.TableCell({ margins: { top: 80, bottom: 80, left: 80, right: 80 }, children: [new docx_1.Paragraph({ children: [new docx_1.TextRun({ text: 'Active Sponsor (Approved 482)', color: '15803D', bold: true })] })] })
            ]
        }), new docx_1.TableRow({
            children: [
                new docx_1.TableCell({ margins: { top: 80, bottom: 80, left: 80, right: 80 }, children: [new docx_1.Paragraph({ children: [new docx_1.TextRun({ text: 'Northern Star Resources Ltd.', bold: true })] })] }),
                new docx_1.TableCell({ margins: { top: 80, bottom: 80, left: 80, right: 80 }, children: [new docx_1.Paragraph({ children: [new docx_1.TextRun({ text: data.jobTitle })] })] }),
                new docx_1.TableCell({ margins: { top: 80, bottom: 80, left: 80, right: 80 }, children: [new docx_1.Paragraph({ children: [new docx_1.TextRun({ text: '2 Active Positions' })] })] }),
                new docx_1.TableCell({ margins: { top: 80, bottom: 80, left: 80, right: 80 }, children: [new docx_1.Paragraph({ children: [new docx_1.TextRun({ text: 'Active Sponsor (Approved 482)', color: '15803D', bold: true })] })] })
            ]
        }), new docx_1.TableRow({
            children: [
                new docx_1.TableCell({ margins: { top: 80, bottom: 80, left: 80, right: 80 }, children: [new docx_1.Paragraph({ children: [new docx_1.TextRun({ text: 'Rio Tinto', bold: true })] })] }),
                new docx_1.TableCell({ margins: { top: 80, bottom: 80, left: 80, right: 80 }, children: [new docx_1.Paragraph({ children: [new docx_1.TextRun({ text: data.jobTitle })] })] }),
                new docx_1.TableCell({ margins: { top: 80, bottom: 80, left: 80, right: 80 }, children: [new docx_1.Paragraph({ children: [new docx_1.TextRun({ text: '3 Active Positions' })] })] }),
                new docx_1.TableCell({ margins: { top: 80, bottom: 80, left: 80, right: 80 }, children: [new docx_1.Paragraph({ children: [new docx_1.TextRun({ text: 'Active Sponsor (Approved 482)', color: '15803D', bold: true })] })] })
            ]
        }));
    }
    children.push(new docx_1.Paragraph({
        heading: docx_1.HeadingLevel.HEADING_2,
        spacing: { before: 140, after: 80 },
        children: [new docx_1.TextRun({ text: isMacaOnly ? '1. ASSIGNED SPONSORING HOST EMPLOYER' : '1. PARTICIPATING HOST EMPLOYERS & ALLOCATED SLOTS', bold: true, size: 22, color: NAVY })]
    }), new docx_1.Table({
        width: { size: 100, type: docx_1.WidthType.PERCENTAGE },
        rows: tableRows
    }), new docx_1.Paragraph({
        spacing: { before: 80, after: 140 },
        children: [
            new docx_1.TextRun({
                text: isMacaOnly
                    ? 'Total Host Employer Positions Available: 3 | Total Nominated Candidate Pool: 5 qualified candidates (Sum of slots + 2). Slots are locked in order of signed document submission and ticket commencement.'
                    : 'Total Host Employer Positions Available: 10 | Total Nominated Candidate Pool: 12 qualified candidates (Sum of slots + 2). Slots are locked in order of signed document submission and ticket commencement.',
                size: 18,
                italics: true,
                color: '475569'
            })
        ]
    }));
    // Official Australian Visa Sponsorship Notice
    children.push(new docx_1.Table({
        width: { size: 100, type: docx_1.WidthType.PERCENTAGE },
        rows: [
            new docx_1.TableRow({
                children: [
                    new docx_1.TableCell({
                        shading: { type: docx_1.ShadingType.CLEAR, fill: 'FEF3C7' },
                        borders: {
                            left: { style: docx_1.BorderStyle.SINGLE, size: 18, color: 'D97706' },
                            top: { style: docx_1.BorderStyle.SINGLE, size: 4, color: 'FDE68A' },
                            right: { style: docx_1.BorderStyle.SINGLE, size: 4, color: 'FDE68A' },
                            bottom: { style: docx_1.BorderStyle.SINGLE, size: 4, color: 'FDE68A' }
                        },
                        margins: { top: 100, bottom: 100, left: 140, right: 140 },
                        children: [
                            new docx_1.Paragraph({ children: [new docx_1.TextRun({ text: 'OFFICIAL AUSTRALIAN VISA SPONSORSHIP VERIFICATION:', bold: true, color: '92400E' })] }),
                            new docx_1.Paragraph({ children: [new docx_1.TextRun({ text: 'You can verify approved Australian visa sponsors on the official public register: https://www.workvisalawyers.com.au/images/Approved-Sponsor-List-2025.pdf', color: '78350F' })] }),
                            new docx_1.Paragraph({ children: [new docx_1.TextRun({ text: 'Notice: The most recent official public list was released in 2025 (against 2026).', italics: true, color: 'B45309' })] })
                        ]
                    })
                ]
            })
        ]
    }), new docx_1.Paragraph({ spacing: { after: 180 } }));
    // Candidate Declaration & Signatures
    const declarationText = isMacaOnly
        ? `I, ${data.fullName}, formally accept and confirm ${employer} as my assigned sponsoring host employer for the position of ${data.jobTitle}. I understand that upon completion of prerequisite competency tickets with CertHero RTO, ${employer} will proceed with my Subclass 482 visa nomination and Australian site mobilisation.`
        : `I, ${data.fullName}, formally submit my selection from the participating host employers listed above as my preferred vocational pathway for the position of ${data.jobTitle}. I acknowledge that this selection initiates my employer nomination and allocation under the Australian Subclass 482 visa program. I confirm my intention to acquire prerequisite competency tickets through CertHero RTO and proceed with site mobilisation under my chosen sponsor.`;
    const declarationHeading = isMacaOnly
        ? '2. CANDIDATE SPONSORSHIP ACCEPTANCE DECLARATION'
        : '2. CANDIDATE SELECTION DECLARATION';
    children.push(new docx_1.Paragraph({
        heading: docx_1.HeadingLevel.HEADING_2,
        spacing: { before: 140, after: 80 },
        children: [new docx_1.TextRun({ text: declarationHeading, bold: true, size: 22, color: NAVY })]
    }), new docx_1.Paragraph({
        children: [
            new docx_1.TextRun({
                text: declarationText,
                size: 20
            })
        ]
    }));
    if (!isMacaOnly) {
        children.push(new docx_1.Paragraph({
            spacing: { before: 140, after: 80 },
            children: [
                new docx_1.TextRun({ text: 'Selected Host Employer: ____________________________________________________', bold: true, size: 20 })
            ]
        }));
    }
    children.push(new docx_1.Paragraph({ spacing: { before: 180, after: 80 } }), new docx_1.Table({
        width: { size: 100, type: docx_1.WidthType.PERCENTAGE },
        rows: [
            new docx_1.TableRow({
                children: [
                    new docx_1.TableCell({ children: [new docx_1.Paragraph({ children: [new docx_1.TextRun({ text: '_______________________________' }), new docx_1.TextRun({ text: '\nCandidate Signature', bold: true })] })] }),
                    new docx_1.TableCell({ children: [new docx_1.Paragraph({ children: [new docx_1.TextRun({ text: '_______________________________' }), new docx_1.TextRun({ text: '\nDate of Signing', bold: true })] })] })
                ]
            })
        ]
    }));
    return new docx_1.Document({ sections: [{ children }] });
}
/**
 * 2. CertHero Enrollment Letter (Includes CertHero logo, actual calculated deadline date, and tickets@certhero.study)
 */
async function generateCertHeroEnrollmentLetterDocx(data) {
    const children = [];
    // CertHero Logo
    const logoP = createLogoParagraph(CERTHERO_LOGO_PATH, 75, 75);
    if (logoP)
        children.push(logoP);
    // Header
    children.push(new docx_1.Paragraph({
        alignment: docx_1.AlignmentType.CENTER,
        spacing: { before: 100, after: 60 },
        children: [
            new docx_1.TextRun({ text: 'CERTHERO TRAINING & ASSESSMENT SYSTEMS', bold: true, size: 28, color: SLATE_DARK, font: 'Arial' })
        ]
    }), new docx_1.Paragraph({
        alignment: docx_1.AlignmentType.CENTER,
        spacing: { before: 0, after: 60 },
        children: [
            new docx_1.TextRun({ text: 'OFFICIAL LEARNER ENROLLMENT CONFIRMATION & TRAINING PROTOCOL', bold: true, size: 20, color: AMBER, font: 'Arial' })
        ]
    }), new docx_1.Paragraph({
        alignment: docx_1.AlignmentType.CENTER,
        spacing: { before: 0, after: 200 },
        children: [
            new docx_1.TextRun({ text: 'RTO Partner: CertHero Pty Ltd | ABN 89 612 431 902 | Perth, Western Australia | tickets@certhero.study', color: '64748B', size: 18 })
        ]
    }));
    // Calculate actual date 16 days from today
    const deadline = new Date(Date.now() + 16 * 24 * 60 * 60 * 1000);
    const formattedDeadline = deadline.toLocaleDateString('en-AU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
    // Particulars
    children.push(new docx_1.Paragraph({ children: [new docx_1.TextRun({ text: `Date: ${new Date().toLocaleDateString('en-AU')}`, bold: true })] }), new docx_1.Paragraph({ children: [new docx_1.TextRun({ text: `Learner: ${data.fullName}`, bold: true })] }), new docx_1.Paragraph({ children: [new docx_1.TextRun({ text: `Target Role: ${data.jobTitle}`, bold: true })] }), new docx_1.Paragraph({ spacing: { after: 140 } }));
    // Coursework Table
    const ticketList = data.tickets && data.tickets.length > 0 ? data.tickets : [
        { ticketType: 'STD11 Surface Mining Safety Induction', mode: 'Online Theory + Site Verification' },
        { ticketType: 'RIIWHS204E Work safely at heights', mode: 'Online Theory + Practical Assessment' },
        { ticketType: 'RIIWHS202E Enter and work in confined spaces', mode: 'Online Theory + Practical Assessment' },
        { ticketType: 'First Aid & CPR (HLTAID011)', mode: 'Online Theory + Practical Assessment' },
        { ticketType: 'CPCWHS1001 White Card WA', mode: 'Online Theory' }
    ];
    const tableRows = [
        new docx_1.TableRow({
            children: [
                new docx_1.TableCell({ shading: { type: docx_1.ShadingType.CLEAR, fill: SLATE_DARK }, children: [new docx_1.Paragraph({ children: [new docx_1.TextRun({ text: '#', bold: true, color: 'FFFFFF' })] })] }),
                new docx_1.TableCell({ shading: { type: docx_1.ShadingType.CLEAR, fill: SLATE_DARK }, children: [new docx_1.Paragraph({ children: [new docx_1.TextRun({ text: 'Competency Unit / Ticket Name', bold: true, color: 'FFFFFF' })] })] }),
                new docx_1.TableCell({ shading: { type: docx_1.ShadingType.CLEAR, fill: SLATE_DARK }, children: [new docx_1.Paragraph({ children: [new docx_1.TextRun({ text: 'Mode of Instruction', bold: true, color: 'FFFFFF' })] })] }),
                new docx_1.TableCell({ shading: { type: docx_1.ShadingType.CLEAR, fill: SLATE_DARK }, children: [new docx_1.Paragraph({ children: [new docx_1.TextRun({ text: 'Verification Status', bold: true, color: 'FFFFFF' })] })] })
            ]
        })
    ];
    ticketList.forEach((t, i) => {
        tableRows.push(new docx_1.TableRow({
            children: [
                new docx_1.TableCell({ margins: { top: 80, bottom: 80, left: 80, right: 80 }, children: [new docx_1.Paragraph({ children: [new docx_1.TextRun({ text: `${i + 1}` })] })] }),
                new docx_1.TableCell({ margins: { top: 80, bottom: 80, left: 80, right: 80 }, children: [new docx_1.Paragraph({ children: [new docx_1.TextRun({ text: t.ticketType, bold: true })] })] }),
                new docx_1.TableCell({ margins: { top: 80, bottom: 80, left: 80, right: 80 }, children: [new docx_1.Paragraph({ children: [new docx_1.TextRun({ text: t.mode || 'Online Theory + Site Verification' })] })] }),
                new docx_1.TableCell({ margins: { top: 80, bottom: 80, left: 80, right: 80 }, children: [new docx_1.Paragraph({ children: [new docx_1.TextRun({ text: 'Enrolled & Sponsored', color: '15803D', bold: true })] })] })
            ]
        }));
    });
    children.push(new docx_1.Table({
        width: { size: 100, type: docx_1.WidthType.PERCENTAGE },
        rows: tableRows
    }), new docx_1.Paragraph({ spacing: { after: 160 } }));
    // Procedures & Deadline (Item 5 & 6: Actual date and tickets@certhero.study)
    children.push(new docx_1.Paragraph({
        heading: docx_1.HeadingLevel.HEADING_2,
        spacing: { before: 140, after: 80 },
        children: [new docx_1.TextRun({ text: 'EXAMINATION DEADLINE & PROCEDURES', bold: true, size: 22, color: SLATE_DARK })]
    }), new docx_1.Paragraph({
        children: [
            new docx_1.TextRun({
                text: '• Online Theory Procedure: Access all courseware through the CertHero LMS portal. Each competency module requires an 80% passing grade across 35 assessment questions.',
                size: 20
            })
        ]
    }), new docx_1.Paragraph({
        children: [
            new docx_1.TextRun({
                text: '• Practical Procedure: Practical high-risk work verification takes place during your initial 3-day on-site corporate induction following arrival in Western Australia.',
                size: 20
            })
        ]
    }), new docx_1.Paragraph({
        children: [
            new docx_1.TextRun({
                text: `• Mandatory Completion Deadline: All online examinations must be completed by ${formattedDeadline} (strictly 16 days from dispatch of this enrollment package) to maintain your employer sponsorship status.`,
                size: 20,
                bold: true,
                color: 'B45309'
            })
        ]
    }), new docx_1.Paragraph({
        children: [
            new docx_1.TextRun({
                text: '• Official Communication Channel: tickets@certhero.study | Response window: within 4 business hours.',
                size: 20,
                bold: true
            })
        ]
    }));
    return new docx_1.Document({ sections: [{ children }] });
}
/**
 * 3. Ticket Sponsorship Contract (Owned and sent by Blue Collar Recruitment Pty Limited / BC Recruit Pty Ltd)
 * Text reference: client/app/admin/contracts/ContractGenerator.ts
 */
async function generateSponsorshipContractDocx(data) {
    const employer = data.employerName || 'MACA LIMITED';
    const amount = data.amountAUD || 720;
    const subsidy = data.subsidyPercentage || 70;
    const children = [];
    // Blue Collar Logo
    const logoP = createLogoParagraph(BLUE_COLLAR_LOGO_PATH, 140, 93);
    if (logoP)
        children.push(logoP);
    // Header & Titles
    children.push(new docx_1.Paragraph({
        alignment: docx_1.AlignmentType.CENTER,
        spacing: { before: 100, after: 60 },
        children: [new docx_1.TextRun({ text: 'BLUE COLLAR RECRUITMENT PTY LIMITED', bold: true, size: 28, color: NAVY })]
    }), new docx_1.Paragraph({
        alignment: docx_1.AlignmentType.CENTER,
        spacing: { before: 0, after: 60 },
        children: [new docx_1.TextRun({ text: 'FIFO EMPLOYMENT TICKETING, TRAINING & VISA SPONSORSHIP CANDIDATE AGREEMENT', bold: true, size: 20, color: SLATE_DARK })]
    }), new docx_1.Paragraph({
        alignment: docx_1.AlignmentType.CENTER,
        spacing: { before: 0, after: 140 },
        children: [new docx_1.TextRun({ text: 'DOCUMENT REF: BCR-FIFO-2026-0810 | STRICTLY CONFIDENTIAL', size: 16, color: '64748B' })]
    }), new docx_1.Paragraph({
        alignment: docx_1.AlignmentType.CENTER,
        spacing: { before: 0, after: 180 },
        children: [new docx_1.TextRun({ text: `DATE OF INSTRUMENT: ${new Date().toLocaleDateString('en-AU')}`, size: 16, color: '64748B' })]
    }));
    // Disclaimer Box (Required by CHANGE specs & FIX_1)
    children.push(new docx_1.Table({
        width: { size: 100, type: docx_1.WidthType.PERCENTAGE },
        rows: [
            new docx_1.TableRow({
                children: [
                    new docx_1.TableCell({
                        shading: { type: docx_1.ShadingType.CLEAR, fill: 'FEF3C7' },
                        borders: {
                            left: { style: docx_1.BorderStyle.SINGLE, size: 20, color: 'D97706' },
                            top: { style: docx_1.BorderStyle.SINGLE, size: 4, color: 'FDE68A' },
                            right: { style: docx_1.BorderStyle.SINGLE, size: 4, color: 'FDE68A' },
                            bottom: { style: docx_1.BorderStyle.SINGLE, size: 4, color: 'FDE68A' }
                        },
                        margins: { top: 120, bottom: 120, left: 160, right: 160 },
                        children: [
                            new docx_1.Paragraph({
                                children: [
                                    new docx_1.TextRun({ text: 'DISCLAIMER : THIS IS NOT A CONTRACT OF EMPLOYMENT', bold: true, size: 20, color: '92400E' })
                                ]
                            }),
                            new docx_1.Paragraph({
                                spacing: { before: 60, after: 60 },
                                children: [
                                    new docx_1.TextRun({
                                        text: 'This is a Ticket Sponsorship & Prerequisite Verification Agreement that binds all concerned parties in a covenant on the subject of training and hiring of the Candidate upon successful completion of training.',
                                        size: 19,
                                        color: '78350F'
                                    })
                                ]
                            }),
                            new docx_1.Paragraph({
                                children: [
                                    new docx_1.TextRun({
                                        text: 'Candidates are not in any way paying to be hired. They are transferring a refundable deposit as a financial token of commitment to our accredited training partner. Blue Collar Recruitment Pty Ltd charges the employing company a fee for every successful hire, and will never ask the applicant to make any form of payment to be hired.',
                                        size: 19,
                                        bold: true,
                                        color: '92400E'
                                    })
                                ]
                            })
                        ]
                    })
                ]
            })
        ]
    }), new docx_1.Paragraph({ spacing: { after: 160 } }));
    // 1. PARTIES
    children.push(new docx_1.Paragraph({
        heading: docx_1.HeadingLevel.HEADING_2,
        spacing: { before: 140, after: 80 },
        children: [new docx_1.TextRun({ text: '1. PARTIES', bold: true, size: 22, color: NAVY })]
    }), new docx_1.Paragraph({
        children: [
            new docx_1.TextRun({ text: 'THE COMPANY: ', bold: true }),
            new docx_1.TextRun({ text: 'Blue Collar Recruitment Pty Limited (BC Recruit Pty Ltd) (ACN: 105 263 151 / ABN: 67 105 263 151), a licensed labor hire and recruitment enterprise duly incorporated under Australian law, Suite 213/35-37 Doody St, Alexandria, NSW 2015, Australia ("the Company").' })
        ]
    }), new docx_1.Paragraph({
        spacing: { before: 60, after: 60 },
        children: [
            new docx_1.TextRun({ text: 'THE CANDIDATE: ', bold: true }),
            new docx_1.TextRun({ text: `${data.fullName}, applying for the trade nomination position of ${data.jobTitle} with host employer ${employer} ("the Candidate").` })
        ]
    }), new docx_1.Paragraph({
        children: [
            new docx_1.TextRun({ text: 'THE TRAINING PARTNER: ', bold: true }),
            new docx_1.TextRun({ text: 'CertHero (RTO Provider Code: 52418), an accredited Registered Training Organisation registered in Western Australia, delivering prerequisite mining competency tickets under the autonomous educational enrollment framework.' })
        ]
    }), new docx_1.Paragraph({ spacing: { after: 140 } }));
    // 2. FISCAL SPONSORSHIP & BLUE COLLAR COVENANTS
    children.push(new docx_1.Paragraph({
        heading: docx_1.HeadingLevel.HEADING_2,
        spacing: { before: 140, after: 80 },
        children: [new docx_1.TextRun({ text: '2. 100% SPONSORSHIP COVENANTS & EMPLOYER COVERAGE', bold: true, size: 22, color: NAVY })]
    }), new docx_1.Paragraph({
        children: [
            new docx_1.TextRun({
                text: `2.1 100% Ticket Fees Coverage: The Company and host employer (${employer}) covenant to directly fund and cover 100% of all gross commercial training and assessment fees charged by CertHero RTO for all required units of competency.`,
                size: 20
            })
        ]
    }), new docx_1.Paragraph({
        spacing: { before: 60, after: 60 },
        children: [
            new docx_1.TextRun({
                text: '2.2 Statutory Visa Application Charges (VAC): The employer funds 100% of the statutory Subclass 482 Visa Application Charge in strict compliance with Regulation 2.87 of the Migration Regulations 1994 (Cth).',
                size: 20
            })
        ]
    }), new docx_1.Paragraph({
        children: [
            new docx_1.TextRun({
                text: '2.3 Full Employer-Covered Commitments: The sponsoring employer directly covers:\n• Standard Business Sponsorship (SBS) and Employer Nomination processing fees;\n• Skilling Australians Fund (SAF) statutory levy ($2,400 AUD);\n• Trades Recognition Australia (TRA) skills assessment fees;\n• Pre-employment medical examinations, audio testing, and drug screening;\n• International one-way flight to Perth and 3 months paid mobilization accommodation ($15,000 corporate allowance).',
                size: 20
            })
        ]
    }), new docx_1.Paragraph({ spacing: { after: 140 } }));
    // 3. CANDIDATE FINANCIAL OBLIGATIONS & 100% REFUND GUARANTEE
    children.push(new docx_1.Paragraph({
        heading: docx_1.HeadingLevel.HEADING_2,
        spacing: { before: 140, after: 80 },
        children: [new docx_1.TextRun({ text: '3. CANDIDATE COMMITMENT DEPOSIT & 100% REFUND GUARANTEE', bold: true, size: 22, color: NAVY })]
    }), new docx_1.Paragraph({
        children: [
            new docx_1.TextRun({
                text: `3.1 Commitment Security Deposit: Prior to course portal unlocking, the Candidate transfers a commitment security deposit of $${amount.toFixed(2)} AUD. This deposit serves as mutual commercial assurance of earnest intent to complete the training pathway.`,
                size: 20
            })
        ]
    }), new docx_1.Paragraph({
        spacing: { before: 60, after: 60 },
        children: [
            new docx_1.TextRun({
                text: '3.2 Partial Payment Option: Candidates may elect to make a partial payment of 50%+ of the deposit amount ($360+ AUD), permitting initial course access and completion of up to three (3) ticket examinations, with full balance settlement required prior to subsequent modules.',
                size: 20
            })
        ]
    }), new docx_1.Paragraph({
        children: [
            new docx_1.TextRun({
                text: `3.3 100% Refund Guarantee: Under the Blue Collar Recruitment Partner Guarantee, one hundred percent (100%) of the Candidate's commitment deposit ($${amount.toFixed(2)} AUD) is reimbursed upon ticket completion and site placement. Furthermore, if Blue Collar fails to secure candidate placement with the host employer, 100% of the deposit is refunded in full.`,
                size: 20,
                bold: true,
                color: '15803D'
            })
        ]
    }), new docx_1.Paragraph({ spacing: { after: 160 } }));
    // 4. SIGNATURES
    children.push(new docx_1.Paragraph({
        heading: docx_1.HeadingLevel.HEADING_2,
        spacing: { before: 140, after: 80 },
        children: [new docx_1.TextRun({ text: '4. CONTRACTUAL EXECUTION & SIGNATURES', bold: true, size: 22, color: NAVY })]
    }), new docx_1.Paragraph({
        children: [
            new docx_1.TextRun({
                text: 'IN WITNESS WHEREOF, the Parties hereto cause this Candidate Agreement to be duly executed, creating a reciprocal legal instrument effective as of the date written above.',
                size: 20
            })
        ]
    }), new docx_1.Paragraph({ spacing: { before: 200, after: 80 } }), new docx_1.Table({
        width: { size: 100, type: docx_1.WidthType.PERCENTAGE },
        rows: [
            new docx_1.TableRow({
                children: [
                    new docx_1.TableCell({
                        children: [
                            new docx_1.Paragraph({ children: [new docx_1.TextRun({ text: 'For Blue Collar Recruitment Pty Limited:', bold: true })] }),
                            new docx_1.Paragraph({ spacing: { before: 140 }, children: [new docx_1.TextRun({ text: '_______________________________' })] }),
                            new docx_1.Paragraph({ children: [new docx_1.TextRun({ text: 'Name: Troy Latuff\nTitle: Chief Executive Officer\nBC Recruit Pty Ltd' })] })
                        ]
                    }),
                    new docx_1.TableCell({
                        children: [
                            new docx_1.Paragraph({ children: [new docx_1.TextRun({ text: `For Candidate (${data.fullName}):`, bold: true })] }),
                            new docx_1.Paragraph({ spacing: { before: 140 }, children: [new docx_1.TextRun({ text: '_______________________________' })] }),
                            new docx_1.Paragraph({ children: [new docx_1.TextRun({ text: `Name: ${data.fullName}\nTitle: Applicant / Candidate\nDate: ________________________` })] })
                        ]
                    })
                ]
            })
        ]
    }));
    return new docx_1.Document({ sections: [{ children }] });
}
/**
 * 4. Official Tax Invoice (Includes CertHero logo and tickets@certhero.study)
 */
async function generateTaxInvoiceDocx(data) {
    const amount = data.amountAUD || 720;
    const amountUSD = data.amountUSD || Math.round(amount * 0.65);
    const wallet = data.walletAddress || 'TX7k9VwE3nQ9LmPzR4tY2uA1sD5fG8hJ0k';
    const children = [];
    // CertHero Logo
    const logoP = createLogoParagraph(CERTHERO_LOGO_PATH, 75, 75);
    if (logoP)
        children.push(logoP);
    children.push(new docx_1.Paragraph({
        alignment: docx_1.AlignmentType.CENTER,
        spacing: { before: 100, after: 60 },
        children: [new docx_1.TextRun({ text: 'CERTHERO RTO — TAX INVOICE', bold: true, size: 28, color: SLATE_DARK })]
    }), new docx_1.Paragraph({
        alignment: docx_1.AlignmentType.CENTER,
        spacing: { before: 0, after: 60 },
        children: [new docx_1.TextRun({ text: `INVOICE REF: #INV-${data.applicantId}`, bold: true, size: 20, color: AMBER })]
    }), new docx_1.Paragraph({
        alignment: docx_1.AlignmentType.CENTER,
        spacing: { before: 0, after: 180 },
        children: [new docx_1.TextRun({ text: 'RTO Partner: CertHero Pty Ltd | ABN 89 612 431 902 | Support: tickets@certhero.study', size: 16, color: '64748B' })]
    }), new docx_1.Paragraph({ children: [new docx_1.TextRun({ text: `ISSUED TO: ${data.fullName}`, bold: true })] }), new docx_1.Paragraph({ children: [new docx_1.TextRun({ text: `EMAIL: ${data.email}` })] }), new docx_1.Paragraph({ children: [new docx_1.TextRun({ text: `DATE: ${new Date().toLocaleDateString('en-AU')}` })] }), new docx_1.Paragraph({ spacing: { after: 140 } }));
    // Items table
    children.push(new docx_1.Table({
        width: { size: 100, type: docx_1.WidthType.PERCENTAGE },
        rows: [
            new docx_1.TableRow({
                children: [
                    new docx_1.TableCell({ shading: { type: docx_1.ShadingType.CLEAR, fill: SLATE_DARK }, children: [new docx_1.Paragraph({ children: [new docx_1.TextRun({ text: 'Description', bold: true, color: 'FFFFFF' })] })] }),
                    new docx_1.TableCell({ shading: { type: docx_1.ShadingType.CLEAR, fill: SLATE_DARK }, children: [new docx_1.Paragraph({ children: [new docx_1.TextRun({ text: 'Standard Price', bold: true, color: 'FFFFFF' })] })] }),
                    new docx_1.TableCell({ shading: { type: docx_1.ShadingType.CLEAR, fill: SLATE_DARK }, children: [new docx_1.Paragraph({ children: [new docx_1.TextRun({ text: 'Employer Subsidy (70%)', bold: true, color: 'FFFFFF' })] })] }),
                    new docx_1.TableCell({ shading: { type: docx_1.ShadingType.CLEAR, fill: SLATE_DARK }, children: [new docx_1.Paragraph({ children: [new docx_1.TextRun({ text: 'Total Due (AUD)', bold: true, color: 'FFFFFF' })] })] })
                ]
            }),
            new docx_1.TableRow({
                children: [
                    new docx_1.TableCell({ margins: { top: 80, bottom: 80, left: 80, right: 80 }, children: [new docx_1.Paragraph({ children: [new docx_1.TextRun({ text: 'CertHero Full Mining Competency Verification & LMS Access', bold: true })] })] }),
                    new docx_1.TableCell({ margins: { top: 80, bottom: 80, left: 80, right: 80 }, children: [new docx_1.Paragraph({ children: [new docx_1.TextRun({ text: '$2,400.00 AUD' })] })] }),
                    new docx_1.TableCell({ margins: { top: 80, bottom: 80, left: 80, right: 80 }, children: [new docx_1.Paragraph({ children: [new docx_1.TextRun({ text: '-$1,680.00 AUD', color: '15803D' })] })] }),
                    new docx_1.TableCell({ margins: { top: 80, bottom: 80, left: 80, right: 80 }, children: [new docx_1.Paragraph({ children: [new docx_1.TextRun({ text: `$${amount.toFixed(2)} AUD`, bold: true })] })] })
                ]
            })
        ]
    }), new docx_1.Paragraph({ spacing: { after: 160 } }));
    // Payment details
    children.push(new docx_1.Paragraph({
        heading: docx_1.HeadingLevel.HEADING_2,
        spacing: { before: 140, after: 80 },
        children: [new docx_1.TextRun({ text: 'APPROVED PAYMENT METHODS (100% REFUNDABLE DEPOSIT)', bold: true, size: 22, color: SLATE_DARK })]
    }), new docx_1.Paragraph({
        children: [
            new docx_1.TextRun({ text: '1. Cryptocurrency Gateway (USDT TRC20 - Instant Automated Verification):', bold: true }),
            new docx_1.TextRun({ text: `\nWallet Address: ${wallet}\nNetwork: Tron (TRC20)` })
        ]
    }), new docx_1.Paragraph({
        spacing: { before: 60 },
        children: [
            new docx_1.TextRun({ text: '2. International Swift Wire Transfer (Agent Escrow Trust Account):', bold: true }),
            new docx_1.TextRun({ text: '\nBank: Commonwealth Bank of Australia\nAccount Name: CertHero Escrow Trust\nAccount Number: 8829-1920-112\nRouting/Swift: CTBAAU2S' })
        ]
    }), new docx_1.Paragraph({
        spacing: { before: 140 },
        children: [
            new docx_1.TextRun({ text: 'REFUND POLICY GUARANTEE: The commitment deposit of $720 AUD is 100% refundable upon ticket completion and deployment to site under the employer guarantee.', bold: true, color: '15803D' })
        ]
    }));
    return new docx_1.Document({ sections: [{ children }] });
}
/**
 * 5. Official Receipt (Includes CertHero logo, supports dynamic partial vs complete payment notice, tickets@certhero.study)
 */
async function generateOfficialReceiptDocx(data) {
    const isPartial = data.paymentType === 'partial';
    const amount = isPartial ? (data.amountAUD ? data.amountAUD / 2 : 360) : (data.amountAUD || 720);
    const children = [];
    // CertHero Logo
    const logoP = createLogoParagraph(CERTHERO_LOGO_PATH, 75, 75);
    if (logoP)
        children.push(logoP);
    const statusText = isPartial
        ? `RECEIPT REF: #REC-${data.applicantId} | STATUS: PARTIAL PAYMENT CONFIRMED (DEPOSIT)`
        : `RECEIPT REF: #REC-${data.applicantId} | STATUS: PAID & FULL PAYMENT CONFIRMED`;
    const statusColor = isPartial ? AMBER : EMERALD;
    children.push(new docx_1.Paragraph({
        alignment: docx_1.AlignmentType.CENTER,
        spacing: { before: 100, after: 60 },
        children: [new docx_1.TextRun({ text: 'CERTHERO RTO — OFFICIAL PAYMENT RECEIPT', bold: true, size: 28, color: SLATE_DARK })]
    }), new docx_1.Paragraph({
        alignment: docx_1.AlignmentType.CENTER,
        spacing: { before: 0, after: 60 },
        children: [new docx_1.TextRun({ text: statusText, bold: true, size: 20, color: statusColor })]
    }), new docx_1.Paragraph({
        alignment: docx_1.AlignmentType.CENTER,
        spacing: { before: 0, after: 180 },
        children: [new docx_1.TextRun({ text: 'RTO Partner: CertHero Pty Ltd | ABN 89 612 431 902 | Support: tickets@certhero.study', size: 16, color: '64748B' })]
    }), new docx_1.Paragraph({ children: [new docx_1.TextRun({ text: `CANDIDATE: ${data.fullName}`, bold: true })] }), new docx_1.Paragraph({ children: [new docx_1.TextRun({ text: `LINKED INVOICE: #INV-${data.applicantId}` })] }), new docx_1.Paragraph({ children: [new docx_1.TextRun({ text: `DATE OF PAYMENT: ${new Date().toLocaleDateString('en-AU')}` })] }), new docx_1.Paragraph({ spacing: { after: 140 } }));
    children.push(new docx_1.Table({
        width: { size: 100, type: docx_1.WidthType.PERCENTAGE },
        rows: [
            new docx_1.TableRow({
                children: [
                    new docx_1.TableCell({ shading: { type: docx_1.ShadingType.CLEAR, fill: SLATE_DARK }, children: [new docx_1.Paragraph({ children: [new docx_1.TextRun({ text: 'Particulars', bold: true, color: 'FFFFFF' })] })] }),
                    new docx_1.TableCell({ shading: { type: docx_1.ShadingType.CLEAR, fill: SLATE_DARK }, children: [new docx_1.Paragraph({ children: [new docx_1.TextRun({ text: 'Settlement Type', bold: true, color: 'FFFFFF' })] })] }),
                    new docx_1.TableCell({ shading: { type: docx_1.ShadingType.CLEAR, fill: SLATE_DARK }, children: [new docx_1.Paragraph({ children: [new docx_1.TextRun({ text: 'Amount Paid (AUD)', bold: true, color: 'FFFFFF' })] })] })
                ]
            }),
            new docx_1.TableRow({
                children: [
                    new docx_1.TableCell({ margins: { top: 80, bottom: 80, left: 80, right: 80 }, children: [new docx_1.Paragraph({ children: [new docx_1.TextRun({ text: 'CertHero Competency Verification & LMS Courseware Access' })] })] }),
                    new docx_1.TableCell({ margins: { top: 80, bottom: 80, left: 80, right: 80 }, children: [new docx_1.Paragraph({ children: [new docx_1.TextRun({ text: isPartial ? 'Partial Payment (50%+ Deposit)' : 'Complete Payment (100% Paid)' })] })] }),
                    new docx_1.TableCell({ margins: { top: 80, bottom: 80, left: 80, right: 80 }, children: [new docx_1.Paragraph({ children: [new docx_1.TextRun({ text: `$${amount.toFixed(2)} AUD`, bold: true, color: '15803D' })] })] })
                ]
            })
        ]
    }), new docx_1.Paragraph({ spacing: { after: 160 } }));
    // Dynamic Notice Box reflecting admin choice (Item 8 in FIX_1)
    if (isPartial) {
        children.push(new docx_1.Table({
            width: { size: 100, type: docx_1.WidthType.PERCENTAGE },
            rows: [
                new docx_1.TableRow({
                    children: [
                        new docx_1.TableCell({
                            shading: { type: docx_1.ShadingType.CLEAR, fill: 'FEF3C7' },
                            borders: {
                                left: { style: docx_1.BorderStyle.SINGLE, size: 20, color: 'D97706' },
                                top: { style: docx_1.BorderStyle.SINGLE, size: 4, color: 'FDE68A' },
                                right: { style: docx_1.BorderStyle.SINGLE, size: 4, color: 'FDE68A' },
                                bottom: { style: docx_1.BorderStyle.SINGLE, size: 4, color: 'FDE68A' }
                            },
                            margins: { top: 100, bottom: 100, left: 140, right: 140 },
                            children: [
                                new docx_1.Paragraph({
                                    children: [
                                        new docx_1.TextRun({
                                            text: 'PARTIAL PAYMENT (50%+) REGISTERED — THREE-EXAM LIMIT NOTICE:',
                                            bold: true,
                                            color: '92400E'
                                        })
                                    ]
                                }),
                                new docx_1.Paragraph({
                                    spacing: { before: 60 },
                                    children: [
                                        new docx_1.TextRun({
                                            text: 'Your initial commitment deposit has been verified and registered. You are authorized to access course modules and complete up to three (3) competency unit examinations. Full balance settlement is required prior to unlocking remaining examinations and final credential issuance.',
                                            color: '78350F'
                                        })
                                    ]
                                })
                            ]
                        })
                    ]
                })
            ]
        }));
    }
    else {
        children.push(new docx_1.Table({
            width: { size: 100, type: docx_1.WidthType.PERCENTAGE },
            rows: [
                new docx_1.TableRow({
                    children: [
                        new docx_1.TableCell({
                            shading: { type: docx_1.ShadingType.CLEAR, fill: 'DCFCE7' },
                            borders: {
                                left: { style: docx_1.BorderStyle.SINGLE, size: 20, color: '16A34A' },
                                top: { style: docx_1.BorderStyle.SINGLE, size: 4, color: 'BBF7D0' },
                                right: { style: docx_1.BorderStyle.SINGLE, size: 4, color: 'BBF7D0' },
                                bottom: { style: docx_1.BorderStyle.SINGLE, size: 4, color: 'BBF7D0' }
                            },
                            margins: { top: 100, bottom: 100, left: 140, right: 140 },
                            children: [
                                new docx_1.Paragraph({
                                    children: [
                                        new docx_1.TextRun({
                                            text: 'FULL PAYMENT CONFIRMED — UNLIMITED LMS ACCESS UNLOCKED:',
                                            bold: true,
                                            color: '166534'
                                        })
                                    ]
                                }),
                                new docx_1.Paragraph({
                                    spacing: { before: 60 },
                                    children: [
                                        new docx_1.TextRun({
                                            text: 'Your payment has been verified and permanently registered. You are authorized to access all course modules and sit for the accredited examination portal without restriction.',
                                            color: '14532D'
                                        })
                                    ]
                                })
                            ]
                        })
                    ]
                })
            ]
        }));
    }
    return new docx_1.Document({ sections: [{ children }] });
}
/**
 * 6. Competency Ticket Certificate (Styled with CertHero theme: Gold #FFC700, Charcoal #0F172A, Amber #ED9139, & CertHero logo)
 */
async function generateTicketCertificateDocx(data) {
    const children = [];
    // CertHero Logo
    const logoP = createLogoParagraph(CERTHERO_LOGO_PATH, 80, 80);
    if (logoP)
        children.push(logoP);
    children.push(new docx_1.Paragraph({
        alignment: docx_1.AlignmentType.CENTER,
        spacing: { before: 100, after: 60 },
        children: [new docx_1.TextRun({ text: 'NATIONALLY RECOGNISED TRAINING', bold: true, size: 24, color: SLATE_DARK })]
    }), new docx_1.Paragraph({
        alignment: docx_1.AlignmentType.CENTER,
        spacing: { before: 0, after: 80 },
        children: [new docx_1.TextRun({ text: 'CERTHERO RTO PARTNER — STATEMENT OF ATTAINMENT', bold: true, size: 28, color: AMBER })]
    }), new docx_1.Paragraph({
        alignment: docx_1.AlignmentType.CENTER,
        spacing: { before: 0, after: 180 },
        children: [new docx_1.TextRun({ text: 'RTO Provider Code: 52418 | ABN 89 612 431 902 | Perth, Western Australia | tickets@certhero.study', size: 18, color: '64748B' })]
    }), new docx_1.Paragraph({
        alignment: docx_1.AlignmentType.CENTER,
        spacing: { before: 100, after: 80 },
        children: [new docx_1.TextRun({ text: 'This is to certify that:', italics: true, size: 22 })]
    }), new docx_1.Paragraph({
        alignment: docx_1.AlignmentType.CENTER,
        spacing: { before: 0, after: 180 },
        children: [new docx_1.TextRun({ text: data.fullName.toUpperCase(), bold: true, size: 32, color: SLATE_DARK })]
    }), new docx_1.Paragraph({
        alignment: docx_1.AlignmentType.CENTER,
        spacing: { before: 0, after: 120 },
        children: [new docx_1.TextRun({ text: 'has fulfilled all statutory requirements and demonstrated competency in the following units:', size: 20 })]
    }));
    // Itemized tickets styled with Gold and Charcoal theme
    const ticketUnits = [
        'RIIWHS204E — WORK SAFELY AT HEIGHTS',
        'RIIWHS202E — ENTER AND WORK IN CONFINED SPACES',
        'STD11 — SURFACE MINING SAFETY INDUCTION',
        'HLTAID011 — PROVIDE FIRST AID & CPR',
        'CPCWHS1001 — PREPARE TO WORK SAFELY IN THE CONSTRUCTION INDUSTRY (WHITE CARD WA)'
    ];
    ticketUnits.forEach(unit => {
        children.push(new docx_1.Paragraph({
            alignment: docx_1.AlignmentType.CENTER,
            spacing: { before: 40, after: 40 },
            children: [
                new docx_1.TextRun({ text: '✔ ', bold: true, color: AMBER }),
                new docx_1.TextRun({ text: unit, bold: true, size: 22, color: SLATE_DARK })
            ]
        }));
    });
    children.push(new docx_1.Paragraph({ spacing: { before: 200, after: 100 } }), new docx_1.Table({
        width: { size: 100, type: docx_1.WidthType.PERCENTAGE },
        rows: [
            new docx_1.TableRow({
                children: [
                    new docx_1.TableCell({
                        children: [
                            new docx_1.Paragraph({ children: [new docx_1.TextRun({ text: `Certificate No: CERT-FIFO-${data.applicantId}`, bold: true })] }),
                            new docx_1.Paragraph({ children: [new docx_1.TextRun({ text: `Date Issued: ${new Date().toLocaleDateString('en-AU')}` })] }),
                            new docx_1.Paragraph({ children: [new docx_1.TextRun({ text: 'Verification: https://certhero.study/verify', color: '64748B' })] })
                        ]
                    }),
                    new docx_1.TableCell({
                        children: [
                            new docx_1.Paragraph({ children: [new docx_1.TextRun({ text: '_______________________________' })] }),
                            new docx_1.Paragraph({ children: [new docx_1.TextRun({ text: 'Principal Executive Officer / RTO Director\nCertHero Training & Assessment Systems', bold: true })] })
                        ]
                    })
                ]
            })
        ]
    }));
    return new docx_1.Document({ sections: [{ children }] });
}
