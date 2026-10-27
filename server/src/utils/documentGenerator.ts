import fs from 'fs';
import path from 'path';
import { 
    Document, Paragraph, TextRun, HeadingLevel, AlignmentType, 
    Table, TableRow, TableCell, WidthType, BorderStyle, ShadingType,
    ImageRun, Packer
} from 'docx';
import { generateMacaOnboardingGuideDocx, MacaGuideData } from './macaOnboardingGuide';

export interface ApplicantDocData {
    applicantId: number;
    fullName: string;
    email: string;
    phone?: string;
    address?: string;
    jobTitle: string;
    employerName?: string;
    interviewDate?: string;
    interviewTime?: string;
    interviewLink?: string;
    subsidyPercentage?: number;
    amountAUD?: number;
    amountUSD?: number;
    walletAddress?: string;
    paymentType?: 'complete' | 'partial';
    onlyEmployingEmployer?: boolean;
    passportNumber?: string;
    nationality?: string;
    countryOfResidence?: string;
    bankDetails?: {
        bankName: string;
        accountName: string;
        accountNumber: string;
        routingCode: string;
    };
    tickets?: {
        ticketType: string;
        description?: string;
        status?: string;
        mode?: string;
    }[];
}

const NAVY = '0B3486';
const ORANGE = 'EAA240';
const GOLD = 'FFC700';
const AMBER = 'ED9139';
const SLATE_DARK = '0F172A';
const CHARCOAL = '1E293B';
const LIGHT_BG = 'F8FAFC';
const EMERALD = '10B981';
const BORDER_LIGHT = 'E2E8F0';

const CERTHERO_LOGO_PATH = path.join(__dirname, '../assets/certhero_logo.png');
const BLUE_COLLAR_LOGO_PATH = path.join(__dirname, '../assets/email-logo.jpg');

function createLogoParagraph(imagePath: string, width: number, height: number, alignment = AlignmentType.CENTER): Paragraph | null {
    try {
        if (fs.existsSync(imagePath)) {
            const ext = path.extname(imagePath).toLowerCase();
            const imgType: 'png' | 'jpg' = (ext === '.jpg' || ext === '.jpeg') ? 'jpg' : 'png';
            return new Paragraph({
                alignment,
                spacing: { before: 120, after: 120 },
                children: [
                    new ImageRun({
                        data: fs.readFileSync(imagePath),
                        transformation: { width, height },
                        type: imgType
                    })
                ]
            });
        }
    } catch (e) {
        console.warn(`[documentGenerator] Failed to load logo from ${imagePath}:`, e);
    }
    return null;
}

/**
 * 1. Employer Selection Form (Always includes all 4 employers with slots 2–3, total pool = slots + 2)
 */
export async function generateEmployerSelectionFormDocx(data: ApplicantDocData): Promise<Document> {
    const children: (Paragraph | Table)[] = [];

    // Blue Collar Logo
    const logoP = createLogoParagraph(BLUE_COLLAR_LOGO_PATH, 140, 93);
    if (logoP) children.push(logoP);

    // Header
    children.push(
        new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 100, after: 80 },
            children: [
                new TextRun({ text: 'BLUE COLLAR RECRUITMENT AUSTRALIA', bold: true, size: 28, color: NAVY, font: 'Arial' })
            ]
        }),
        new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 60 },
            children: [
                new TextRun({ text: 'OFFICIAL NOTICE OF EMPLOYER SELECTION & TRADE SPONSORSHIP', bold: true, size: 20, color: CHARCOAL, font: 'Arial' })
            ]
        }),
        new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 180 },
            children: [
                new TextRun({ text: 'Licensed Recruitment & Workforce Deployment | Suite 213/35-37 Doody St, Alexandria NSW 2015 | ABN 67 105 263 151', size: 16, color: '64748B' })
            ]
        })
    );

    // Candidate details card
    children.push(
        new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
                new TableRow({
                    children: [
                        new TableCell({
                            shading: { type: ShadingType.CLEAR, fill: LIGHT_BG },
                            borders: {
                                left: { style: BorderStyle.SINGLE, size: 20, color: NAVY },
                                top: { style: BorderStyle.SINGLE, size: 4, color: BORDER_LIGHT },
                                right: { style: BorderStyle.SINGLE, size: 4, color: BORDER_LIGHT },
                                bottom: { style: BorderStyle.SINGLE, size: 4, color: BORDER_LIGHT }
                            },
                            margins: { top: 120, bottom: 120, left: 180, right: 180 },
                            children: [
                                new Paragraph({ children: [new TextRun({ text: 'CANDIDATE: ', bold: true, color: SLATE_DARK }), new TextRun({ text: data.fullName, color: NAVY, bold: true })] }),
                                new Paragraph({ children: [new TextRun({ text: 'EMAIL: ', bold: true, color: SLATE_DARK }), new TextRun({ text: data.email })] }),
                                new Paragraph({ children: [new TextRun({ text: 'APPLIED ROLE: ', bold: true, color: SLATE_DARK }), new TextRun({ text: data.jobTitle, bold: true })] }),
                                new Paragraph({ children: [new TextRun({ text: 'DOCUMENT REF: ', bold: true, color: SLATE_DARK }), new TextRun({ text: `ESF-APP-${data.applicantId}-2026`, color: '64748B' })] })
                            ]
                        })
                    ]
                })
            ]
        }),
        new Paragraph({ spacing: { after: 160 } })
    );

    const isMacaOnly = Boolean(data.onlyEmployingEmployer);
    const employer = isMacaOnly ? (data.employerName || 'MACA Limited') : (data.employerName || 'MACA LIMITED');

    // Official Sponsor Employers List Table
    // If onlyEmployingEmployer is true (re-selection form after 7b): shows ONLY MACA Limited (3 slots, total pool = 5)
    // Otherwise: All 4 employers included (MACA: 3 slots, MinRes: 2 slots, Northern Star: 2 slots, Rio Tinto: 3 slots. Total slots = 10, Total pool = 12)
    const tableRows: TableRow[] = [
        new TableRow({
            children: [
                new TableCell({ shading: { type: ShadingType.CLEAR, fill: NAVY }, children: [new Paragraph({ children: [new TextRun({ text: 'Host Mining Employer', bold: true, color: 'FFFFFF' })] })] }),
                new TableCell({ shading: { type: ShadingType.CLEAR, fill: NAVY }, children: [new Paragraph({ children: [new TextRun({ text: 'Target FIFO Trade Stream', bold: true, color: 'FFFFFF' })] })] }),
                new TableCell({ shading: { type: ShadingType.CLEAR, fill: NAVY }, children: [new Paragraph({ children: [new TextRun({ text: 'Allocated Slots', bold: true, color: 'FFFFFF' })] })] }),
                new TableCell({ shading: { type: ShadingType.CLEAR, fill: NAVY }, children: [new Paragraph({ children: [new TextRun({ text: 'Sponsorship Status', bold: true, color: 'FFFFFF' })] })] })
            ]
        }),
        new TableRow({
            children: [
                new TableCell({ margins: { top: 80, bottom: 80, left: 80, right: 80 }, children: [new Paragraph({ children: [new TextRun({ text: 'MACA Limited', bold: true })] })] }),
                new TableCell({ margins: { top: 80, bottom: 80, left: 80, right: 80 }, children: [new Paragraph({ children: [new TextRun({ text: data.jobTitle })] })] }),
                new TableCell({ margins: { top: 80, bottom: 80, left: 80, right: 80 }, children: [new Paragraph({ children: [new TextRun({ text: '3 Active Positions' })] })] }),
                new TableCell({ margins: { top: 80, bottom: 80, left: 80, right: 80 }, children: [new Paragraph({ children: [new TextRun({ text: 'Active Sponsor (Approved 482)', color: '15803D', bold: true })] })] })
            ]
        })
    ];

    if (!isMacaOnly) {
        tableRows.push(
            new TableRow({
                children: [
                    new TableCell({ margins: { top: 80, bottom: 80, left: 80, right: 80 }, children: [new Paragraph({ children: [new TextRun({ text: 'Mineral Resources Limited', bold: true })] })] }),
                    new TableCell({ margins: { top: 80, bottom: 80, left: 80, right: 80 }, children: [new Paragraph({ children: [new TextRun({ text: data.jobTitle })] })] }),
                    new TableCell({ margins: { top: 80, bottom: 80, left: 80, right: 80 }, children: [new Paragraph({ children: [new TextRun({ text: '2 Active Positions' })] })] }),
                    new TableCell({ margins: { top: 80, bottom: 80, left: 80, right: 80 }, children: [new Paragraph({ children: [new TextRun({ text: 'Active Sponsor (Approved 482)', color: '15803D', bold: true })] })] })
                ]
            }),
            new TableRow({
                children: [
                    new TableCell({ margins: { top: 80, bottom: 80, left: 80, right: 80 }, children: [new Paragraph({ children: [new TextRun({ text: 'Northern Star Resources Ltd.', bold: true })] })] }),
                    new TableCell({ margins: { top: 80, bottom: 80, left: 80, right: 80 }, children: [new Paragraph({ children: [new TextRun({ text: data.jobTitle })] })] }),
                    new TableCell({ margins: { top: 80, bottom: 80, left: 80, right: 80 }, children: [new Paragraph({ children: [new TextRun({ text: '2 Active Positions' })] })] }),
                    new TableCell({ margins: { top: 80, bottom: 80, left: 80, right: 80 }, children: [new Paragraph({ children: [new TextRun({ text: 'Active Sponsor (Approved 482)', color: '15803D', bold: true })] })] })
                ]
            }),
            new TableRow({
                children: [
                    new TableCell({ margins: { top: 80, bottom: 80, left: 80, right: 80 }, children: [new Paragraph({ children: [new TextRun({ text: 'Rio Tinto', bold: true })] })] }),
                    new TableCell({ margins: { top: 80, bottom: 80, left: 80, right: 80 }, children: [new Paragraph({ children: [new TextRun({ text: data.jobTitle })] })] }),
                    new TableCell({ margins: { top: 80, bottom: 80, left: 80, right: 80 }, children: [new Paragraph({ children: [new TextRun({ text: '3 Active Positions' })] })] }),
                    new TableCell({ margins: { top: 80, bottom: 80, left: 80, right: 80 }, children: [new Paragraph({ children: [new TextRun({ text: 'Active Sponsor (Approved 482)', color: '15803D', bold: true })] })] })
                ]
            })
        );
    }

    children.push(
        new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 140, after: 80 },
            children: [new TextRun({ text: isMacaOnly ? '1. ASSIGNED SPONSORING HOST EMPLOYER' : '1. PARTICIPATING HOST EMPLOYERS & ALLOCATED SLOTS', bold: true, size: 22, color: NAVY })]
        }),
        new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: tableRows
        }),
        new Paragraph({
            spacing: { before: 80, after: 140 },
            children: [
                new TextRun({
                    text: isMacaOnly
                        ? 'Total Host Employer Positions Available: 3 | Total Nominated Candidate Pool: 5 qualified candidates (Sum of slots + 2). Slots are locked in order of signed document submission and ticket commencement.'
                        : 'Total Host Employer Positions Available: 10 | Total Nominated Candidate Pool: 12 qualified candidates (Sum of slots + 2). Slots are locked in order of signed document submission and ticket commencement.',
                    size: 18,
                    italics: true,
                    color: '475569'
                })
            ]
        })
    );

    // Official Australian Visa Sponsorship Notice
    children.push(
        new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
                new TableRow({
                    children: [
                        new TableCell({
                            shading: { type: ShadingType.CLEAR, fill: 'FEF3C7' },
                            borders: {
                                left: { style: BorderStyle.SINGLE, size: 18, color: 'D97706' },
                                top: { style: BorderStyle.SINGLE, size: 4, color: 'FDE68A' },
                                right: { style: BorderStyle.SINGLE, size: 4, color: 'FDE68A' },
                                bottom: { style: BorderStyle.SINGLE, size: 4, color: 'FDE68A' }
                            },
                            margins: { top: 100, bottom: 100, left: 140, right: 140 },
                            children: [
                                new Paragraph({ children: [new TextRun({ text: 'OFFICIAL AUSTRALIAN VISA SPONSORSHIP VERIFICATION:', bold: true, color: '92400E' })] }),
                                new Paragraph({ children: [new TextRun({ text: 'You can verify approved Australian visa sponsors on the official public register: https://www.workvisalawyers.com.au/images/Approved-Sponsor-List-2025.pdf', color: '78350F' })] }),
                                new Paragraph({ children: [new TextRun({ text: 'Notice: The most recent official public list was released in 2025 (against 2026).', italics: true, color: 'B45309' })] })
                            ]
                        })
                    ]
                })
            ]
        }),
        new Paragraph({ spacing: { after: 180 } })
    );

    // Candidate Declaration & Signatures
    children.push(
        new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 140, after: 80 },
            children: [new TextRun({ text: '2. CANDIDATE SELECTION DECLARATION', bold: true, size: 22, color: NAVY })]
        }),
        new Paragraph({
            children: [
                new TextRun({
                    text: `I, ${data.fullName}, formally confirm my selection of ${employer} as my nominated sponsoring employer for the position of ${data.jobTitle}. I understand that upon completion of prerequisite competency tickets with CertHero RTO, ${employer} will proceed with my Subclass 482 visa nomination and Australian site mobilisation.`,
                    size: 20
                })
            ]
        }),
        new Paragraph({ spacing: { before: 240, after: 80 } }),
        new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
                new TableRow({
                    children: [
                        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: '_______________________________' }), new TextRun({ text: '\nCandidate Signature', bold: true })] })] }),
                        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: '_______________________________' }), new TextRun({ text: '\nDate of Signing', bold: true })] })] })
                    ]
                })
            ]
        })
    );

    return new Document({ sections: [{ children }] });
}

/**
 * 2. CertHero Enrollment Letter (Includes CertHero logo, actual calculated deadline date, and tickets@certhero.study)
 */
export async function generateCertHeroEnrollmentLetterDocx(data: ApplicantDocData): Promise<Document> {
    const children: (Paragraph | Table)[] = [];

    // CertHero Logo
    const logoP = createLogoParagraph(CERTHERO_LOGO_PATH, 75, 75);
    if (logoP) children.push(logoP);

    // Header
    children.push(
        new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 100, after: 60 },
            children: [
                new TextRun({ text: 'CERTHERO TRAINING & ASSESSMENT SYSTEMS', bold: true, size: 28, color: SLATE_DARK, font: 'Arial' })
            ]
        }),
        new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 60 },
            children: [
                new TextRun({ text: 'OFFICIAL LEARNER ENROLLMENT CONFIRMATION & TRAINING PROTOCOL', bold: true, size: 20, color: AMBER, font: 'Arial' })
            ]
        }),
        new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 200 },
            children: [
                new TextRun({ text: 'RTO Partner: CertHero Pty Ltd | ABN 89 612 431 902 | Perth, Western Australia | tickets@certhero.study', color: '64748B', size: 18 })
            ]
        })
    );

    // Calculate actual date 16 days from today
    const deadline = new Date(Date.now() + 16 * 24 * 60 * 60 * 1000);
    const formattedDeadline = deadline.toLocaleDateString('en-AU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    // Particulars
    children.push(
        new Paragraph({ children: [new TextRun({ text: `Date: ${new Date().toLocaleDateString('en-AU')}`, bold: true })] }),
        new Paragraph({ children: [new TextRun({ text: `Learner: ${data.fullName}`, bold: true })] }),
        new Paragraph({ children: [new TextRun({ text: `Target Role: ${data.jobTitle}`, bold: true })] }),
        new Paragraph({ spacing: { after: 140 } })
    );

    // Coursework Table
    const ticketList = data.tickets && data.tickets.length > 0 ? data.tickets : [
        { ticketType: 'STD11 Surface Mining Safety Induction', mode: 'Online Theory + Site Verification' },
        { ticketType: 'RIIWHS204E Work safely at heights', mode: 'Online Theory + Practical Assessment' },
        { ticketType: 'RIIWHS202E Enter and work in confined spaces', mode: 'Online Theory + Practical Assessment' },
        { ticketType: 'First Aid & CPR (HLTAID011)', mode: 'Online Theory + Practical Assessment' },
        { ticketType: 'CPCWHS1001 White Card WA', mode: 'Online Theory' }
    ];

    const tableRows = [
        new TableRow({
            children: [
                new TableCell({ shading: { type: ShadingType.CLEAR, fill: SLATE_DARK }, children: [new Paragraph({ children: [new TextRun({ text: '#', bold: true, color: 'FFFFFF' })] })] }),
                new TableCell({ shading: { type: ShadingType.CLEAR, fill: SLATE_DARK }, children: [new Paragraph({ children: [new TextRun({ text: 'Competency Unit / Ticket Name', bold: true, color: 'FFFFFF' })] })] }),
                new TableCell({ shading: { type: ShadingType.CLEAR, fill: SLATE_DARK }, children: [new Paragraph({ children: [new TextRun({ text: 'Mode of Instruction', bold: true, color: 'FFFFFF' })] })] }),
                new TableCell({ shading: { type: ShadingType.CLEAR, fill: SLATE_DARK }, children: [new Paragraph({ children: [new TextRun({ text: 'Verification Status', bold: true, color: 'FFFFFF' })] })] })
            ]
        })
    ];

    ticketList.forEach((t, i) => {
        tableRows.push(
            new TableRow({
                children: [
                    new TableCell({ margins: { top: 80, bottom: 80, left: 80, right: 80 }, children: [new Paragraph({ children: [new TextRun({ text: `${i + 1}` })] })] }),
                    new TableCell({ margins: { top: 80, bottom: 80, left: 80, right: 80 }, children: [new Paragraph({ children: [new TextRun({ text: t.ticketType, bold: true })] })] }),
                    new TableCell({ margins: { top: 80, bottom: 80, left: 80, right: 80 }, children: [new Paragraph({ children: [new TextRun({ text: t.mode || 'Online Theory + Site Verification' })] })] }),
                    new TableCell({ margins: { top: 80, bottom: 80, left: 80, right: 80 }, children: [new Paragraph({ children: [new TextRun({ text: 'Enrolled & Sponsored', color: '15803D', bold: true })] })] })
                ]
            })
        );
    });

    children.push(
        new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: tableRows
        }),
        new Paragraph({ spacing: { after: 160 } })
    );

    // Procedures & Deadline (Item 5 & 6: Actual date and tickets@certhero.study)
    children.push(
        new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 140, after: 80 },
            children: [new TextRun({ text: 'EXAMINATION DEADLINE & PROCEDURES', bold: true, size: 22, color: SLATE_DARK })]
        }),
        new Paragraph({
            children: [
                new TextRun({
                    text: '• Online Theory Procedure: Access all courseware through the CertHero LMS portal. Each competency module requires an 80% passing grade across 35 assessment questions.',
                    size: 20
                })
            ]
        }),
        new Paragraph({
            children: [
                new TextRun({
                    text: '• Practical Procedure: Practical high-risk work verification takes place during your initial 3-day on-site corporate induction following arrival in Western Australia.',
                    size: 20
                })
            ]
        }),
        new Paragraph({
            children: [
                new TextRun({
                    text: `• Mandatory Completion Deadline: All online examinations must be completed by ${formattedDeadline} (strictly 16 days from dispatch of this enrollment package) to maintain your employer sponsorship status.`,
                    size: 20,
                    bold: true,
                    color: 'B45309'
                })
            ]
        }),
        new Paragraph({
            children: [
                new TextRun({
                    text: '• Official Communication Channel: tickets@certhero.study | Response window: within 4 business hours.',
                    size: 20,
                    bold: true
                })
            ]
        })
    );

    return new Document({ sections: [{ children }] });
}

/**
 * 3. Ticket Sponsorship Contract (Owned and sent by Blue Collar Recruitment Pty Limited / BC Recruit Pty Ltd)
 * Text reference: client/app/admin/contracts/ContractGenerator.ts
 */
export async function generateSponsorshipContractDocx(data: ApplicantDocData): Promise<Document> {
    const employer = data.employerName || 'MACA LIMITED';
    const amount = data.amountAUD || 720;
    const subsidy = data.subsidyPercentage || 70;
    const children: (Paragraph | Table)[] = [];

    // Blue Collar Logo
    const logoP = createLogoParagraph(BLUE_COLLAR_LOGO_PATH, 140, 93);
    if (logoP) children.push(logoP);

    // Header & Titles
    children.push(
        new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 100, after: 60 },
            children: [new TextRun({ text: 'BLUE COLLAR RECRUITMENT PTY LIMITED', bold: true, size: 28, color: NAVY })]
        }),
        new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 60 },
            children: [new TextRun({ text: 'FIFO EMPLOYMENT TICKETING, TRAINING & VISA SPONSORSHIP CANDIDATE AGREEMENT', bold: true, size: 20, color: SLATE_DARK })]
        }),
        new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 140 },
            children: [new TextRun({ text: 'DOCUMENT REF: BCR-FIFO-2026-0810 | STRICTLY CONFIDENTIAL', size: 16, color: '64748B' })]
        }),
        new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 180 },
            children: [new TextRun({ text: `DATE OF INSTRUMENT: ${new Date().toLocaleDateString('en-AU')}`, size: 16, color: '64748B' })]
        })
    );

    // Disclaimer Box (Required by CHANGE specs & FIX_1)
    children.push(
        new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
                new TableRow({
                    children: [
                        new TableCell({
                            shading: { type: ShadingType.CLEAR, fill: 'FEF3C7' },
                            borders: {
                                left: { style: BorderStyle.SINGLE, size: 20, color: 'D97706' },
                                top: { style: BorderStyle.SINGLE, size: 4, color: 'FDE68A' },
                                right: { style: BorderStyle.SINGLE, size: 4, color: 'FDE68A' },
                                bottom: { style: BorderStyle.SINGLE, size: 4, color: 'FDE68A' }
                            },
                            margins: { top: 120, bottom: 120, left: 160, right: 160 },
                            children: [
                                new Paragraph({
                                    children: [
                                        new TextRun({ text: 'DISCLAIMER : THIS IS NOT A CONTRACT OF EMPLOYMENT', bold: true, size: 20, color: '92400E' })
                                    ]
                                }),
                                new Paragraph({
                                    spacing: { before: 60, after: 60 },
                                    children: [
                                        new TextRun({
                                            text: 'This is a Ticket Sponsorship & Prerequisite Verification Agreement that binds all concerned parties in a covenant on the subject of training and hiring of the Candidate upon successful completion of training.',
                                            size: 19,
                                            color: '78350F'
                                        })
                                    ]
                                }),
                                new Paragraph({
                                    children: [
                                        new TextRun({
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
        }),
        new Paragraph({ spacing: { after: 160 } })
    );

    // 1. PARTIES
    children.push(
        new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 140, after: 80 },
            children: [new TextRun({ text: '1. PARTIES', bold: true, size: 22, color: NAVY })]
        }),
        new Paragraph({
            children: [
                new TextRun({ text: 'THE COMPANY: ', bold: true }),
                new TextRun({ text: 'Blue Collar Recruitment Pty Limited (BC Recruit Pty Ltd) (ACN: 105 263 151 / ABN: 67 105 263 151), a licensed labor hire and recruitment enterprise duly incorporated under Australian law, Suite 213/35-37 Doody St, Alexandria, NSW 2015, Australia ("the Company").' })
            ]
        }),
        new Paragraph({
            spacing: { before: 60, after: 60 },
            children: [
                new TextRun({ text: 'THE CANDIDATE: ', bold: true }),
                new TextRun({ text: `${data.fullName}, applying for the trade nomination position of ${data.jobTitle} with host employer ${employer} ("the Candidate").` })
            ]
        }),
        new Paragraph({
            children: [
                new TextRun({ text: 'THE TRAINING PARTNER: ', bold: true }),
                new TextRun({ text: 'CertHero (RTO Provider Code: 52418), an accredited Registered Training Organisation registered in Western Australia, delivering prerequisite mining competency tickets under the autonomous educational enrollment framework.' })
            ]
        }),
        new Paragraph({ spacing: { after: 140 } })
    );

    // 2. FISCAL SPONSORSHIP & BLUE COLLAR COVENANTS
    children.push(
        new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 140, after: 80 },
            children: [new TextRun({ text: '2. 100% SPONSORSHIP COVENANTS & EMPLOYER COVERAGE', bold: true, size: 22, color: NAVY })]
        }),
        new Paragraph({
            children: [
                new TextRun({
                    text: `2.1 100% Ticket Fees Coverage: The Company and host employer (${employer}) covenant to directly fund and cover 100% of all gross commercial training and assessment fees charged by CertHero RTO for all required units of competency.`,
                    size: 20
                })
            ]
        }),
        new Paragraph({
            spacing: { before: 60, after: 60 },
            children: [
                new TextRun({
                    text: '2.2 Statutory Visa Application Charges (VAC): The employer funds 100% of the statutory Subclass 482 Visa Application Charge in strict compliance with Regulation 2.87 of the Migration Regulations 1994 (Cth).',
                    size: 20
                })
            ]
        }),
        new Paragraph({
            children: [
                new TextRun({
                    text: '2.3 Full Employer-Covered Commitments: The sponsoring employer directly covers:\n• Standard Business Sponsorship (SBS) and Employer Nomination processing fees;\n• Skilling Australians Fund (SAF) statutory levy ($2,400 AUD);\n• Trades Recognition Australia (TRA) skills assessment fees;\n• Pre-employment medical examinations, audio testing, and drug screening;\n• International one-way flight to Perth and 3 months paid mobilization accommodation ($15,000 corporate allowance).',
                    size: 20
                })
            ]
        }),
        new Paragraph({ spacing: { after: 140 } })
    );

    // 3. CANDIDATE FINANCIAL OBLIGATIONS & 100% REFUND GUARANTEE
    children.push(
        new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 140, after: 80 },
            children: [new TextRun({ text: '3. CANDIDATE COMMITMENT DEPOSIT & 100% REFUND GUARANTEE', bold: true, size: 22, color: NAVY })]
        }),
        new Paragraph({
            children: [
                new TextRun({
                    text: `3.1 Commitment Security Deposit: Prior to course portal unlocking, the Candidate transfers a commitment security deposit of $${amount.toFixed(2)} AUD. This deposit serves as mutual commercial assurance of earnest intent to complete the training pathway.`,
                    size: 20
                })
            ]
        }),
        new Paragraph({
            spacing: { before: 60, after: 60 },
            children: [
                new TextRun({
                    text: '3.2 Partial Payment Option: Candidates may elect to make a partial payment of 50%+ of the deposit amount ($360+ AUD), permitting initial course access and completion of up to three (3) ticket examinations, with full balance settlement required prior to subsequent modules.',
                    size: 20
                })
            ]
        }),
        new Paragraph({
            children: [
                new TextRun({
                    text: `3.3 100% Refund Guarantee: Under the Blue Collar Recruitment Partner Guarantee, one hundred percent (100%) of the Candidate's commitment deposit ($${amount.toFixed(2)} AUD) is reimbursed upon ticket completion and site placement. Furthermore, if Blue Collar fails to secure candidate placement with the host employer, 100% of the deposit is refunded in full.`,
                    size: 20,
                    bold: true,
                    color: '15803D'
                })
            ]
        }),
        new Paragraph({ spacing: { after: 160 } })
    );

    // 4. SIGNATURES
    children.push(
        new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 140, after: 80 },
            children: [new TextRun({ text: '4. CONTRACTUAL EXECUTION & SIGNATURES', bold: true, size: 22, color: NAVY })]
        }),
        new Paragraph({
            children: [
                new TextRun({
                    text: 'IN WITNESS WHEREOF, the Parties hereto cause this Candidate Agreement to be duly executed, creating a reciprocal legal instrument effective as of the date written above.',
                    size: 20
                })
            ]
        }),
        new Paragraph({ spacing: { before: 200, after: 80 } }),
        new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
                new TableRow({
                    children: [
                        new TableCell({
                            children: [
                                new Paragraph({ children: [new TextRun({ text: 'For Blue Collar Recruitment Pty Limited:', bold: true })] }),
                                new Paragraph({ spacing: { before: 140 }, children: [new TextRun({ text: '_______________________________' })] }),
                                new Paragraph({ children: [new TextRun({ text: 'Name: Troy Latuff\nTitle: Chief Executive Officer\nBC Recruit Pty Ltd' })] })
                            ]
                        }),
                        new TableCell({
                            children: [
                                new Paragraph({ children: [new TextRun({ text: `For Candidate (${data.fullName}):`, bold: true })] }),
                                new Paragraph({ spacing: { before: 140 }, children: [new TextRun({ text: '_______________________________' })] }),
                                new Paragraph({ children: [new TextRun({ text: `Name: ${data.fullName}\nTitle: Applicant / Candidate\nDate: ________________________` })] })
                            ]
                        })
                    ]
                })
            ]
        })
    );

    return new Document({ sections: [{ children }] });
}

/**
 * 4. Official Tax Invoice (Includes CertHero logo and tickets@certhero.study)
 */
export async function generateTaxInvoiceDocx(data: ApplicantDocData): Promise<Document> {
    const amount = data.amountAUD || 720;
    const amountUSD = data.amountUSD || Math.round(amount * 0.65);
    const wallet = data.walletAddress || 'TX7k9VwE3nQ9LmPzR4tY2uA1sD5fG8hJ0k';
    const children: (Paragraph | Table)[] = [];

    // CertHero Logo
    const logoP = createLogoParagraph(CERTHERO_LOGO_PATH, 75, 75);
    if (logoP) children.push(logoP);

    children.push(
        new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 100, after: 60 },
            children: [new TextRun({ text: 'CERTHERO RTO — TAX INVOICE', bold: true, size: 28, color: SLATE_DARK })]
        }),
        new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 60 },
            children: [new TextRun({ text: `INVOICE REF: #INV-${data.applicantId}`, bold: true, size: 20, color: AMBER })]
        }),
        new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 180 },
            children: [new TextRun({ text: 'RTO Partner: CertHero Pty Ltd | ABN 89 612 431 902 | Support: tickets@certhero.study', size: 16, color: '64748B' })]
        }),
        new Paragraph({ children: [new TextRun({ text: `ISSUED TO: ${data.fullName}`, bold: true })] }),
        new Paragraph({ children: [new TextRun({ text: `EMAIL: ${data.email}` })] }),
        new Paragraph({ children: [new TextRun({ text: `DATE: ${new Date().toLocaleDateString('en-AU')}` })] }),
        new Paragraph({ spacing: { after: 140 } })
    );

    // Items table
    children.push(
        new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
                new TableRow({
                    children: [
                        new TableCell({ shading: { type: ShadingType.CLEAR, fill: SLATE_DARK }, children: [new Paragraph({ children: [new TextRun({ text: 'Description', bold: true, color: 'FFFFFF' })] })] }),
                        new TableCell({ shading: { type: ShadingType.CLEAR, fill: SLATE_DARK }, children: [new Paragraph({ children: [new TextRun({ text: 'Standard Price', bold: true, color: 'FFFFFF' })] })] }),
                        new TableCell({ shading: { type: ShadingType.CLEAR, fill: SLATE_DARK }, children: [new Paragraph({ children: [new TextRun({ text: 'Employer Subsidy (70%)', bold: true, color: 'FFFFFF' })] })] }),
                        new TableCell({ shading: { type: ShadingType.CLEAR, fill: SLATE_DARK }, children: [new Paragraph({ children: [new TextRun({ text: 'Total Due (AUD)', bold: true, color: 'FFFFFF' })] })] })
                    ]
                }),
                new TableRow({
                    children: [
                        new TableCell({ margins: { top: 80, bottom: 80, left: 80, right: 80 }, children: [new Paragraph({ children: [new TextRun({ text: 'CertHero Full Mining Competency Verification & LMS Access', bold: true })] })] }),
                        new TableCell({ margins: { top: 80, bottom: 80, left: 80, right: 80 }, children: [new Paragraph({ children: [new TextRun({ text: '$2,400.00 AUD' })] })] }),
                        new TableCell({ margins: { top: 80, bottom: 80, left: 80, right: 80 }, children: [new Paragraph({ children: [new TextRun({ text: '-$1,680.00 AUD', color: '15803D' })] })] }),
                        new TableCell({ margins: { top: 80, bottom: 80, left: 80, right: 80 }, children: [new Paragraph({ children: [new TextRun({ text: `$${amount.toFixed(2)} AUD`, bold: true })] })] })
                    ]
                })
            ]
        }),
        new Paragraph({ spacing: { after: 160 } })
    );

    // Payment details
    children.push(
        new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 140, after: 80 },
            children: [new TextRun({ text: 'APPROVED PAYMENT METHODS (100% REFUNDABLE DEPOSIT)', bold: true, size: 22, color: SLATE_DARK })]
        }),
        new Paragraph({
            children: [
                new TextRun({ text: '1. Cryptocurrency Gateway (USDT TRC20 - Instant Automated Verification):', bold: true }),
                new TextRun({ text: `\nWallet Address: ${wallet}\nNetwork: Tron (TRC20)` })
            ]
        }),
        new Paragraph({
            spacing: { before: 60 },
            children: [
                new TextRun({ text: '2. International Swift Wire Transfer (Agent Escrow Trust Account):', bold: true }),
                new TextRun({ text: '\nBank: Commonwealth Bank of Australia\nAccount Name: CertHero Escrow Trust\nAccount Number: 8829-1920-112\nRouting/Swift: CTBAAU2S' })
            ]
        }),
        new Paragraph({
            spacing: { before: 140 },
            children: [
                new TextRun({ text: 'REFUND POLICY GUARANTEE: The commitment deposit of $720 AUD is 100% refundable upon ticket completion and deployment to site under the employer guarantee.', bold: true, color: '15803D' })
            ]
        })
    );

    return new Document({ sections: [{ children }] });
}

/**
 * 5. Official Receipt (Includes CertHero logo, supports dynamic partial vs complete payment notice, tickets@certhero.study)
 */
export async function generateOfficialReceiptDocx(data: ApplicantDocData): Promise<Document> {
    const isPartial = data.paymentType === 'partial';
    const amount = isPartial ? (data.amountAUD ? data.amountAUD / 2 : 360) : (data.amountAUD || 720);
    const children: (Paragraph | Table)[] = [];

    // CertHero Logo
    const logoP = createLogoParagraph(CERTHERO_LOGO_PATH, 75, 75);
    if (logoP) children.push(logoP);

    const statusText = isPartial 
        ? `RECEIPT REF: #REC-${data.applicantId} | STATUS: PARTIAL PAYMENT CONFIRMED (DEPOSIT)`
        : `RECEIPT REF: #REC-${data.applicantId} | STATUS: PAID & FULL PAYMENT CONFIRMED`;
    const statusColor = isPartial ? AMBER : EMERALD;

    children.push(
        new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 100, after: 60 },
            children: [new TextRun({ text: 'CERTHERO RTO — OFFICIAL PAYMENT RECEIPT', bold: true, size: 28, color: SLATE_DARK })]
        }),
        new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 60 },
            children: [new TextRun({ text: statusText, bold: true, size: 20, color: statusColor })]
        }),
        new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 180 },
            children: [new TextRun({ text: 'RTO Partner: CertHero Pty Ltd | ABN 89 612 431 902 | Support: tickets@certhero.study', size: 16, color: '64748B' })]
        }),
        new Paragraph({ children: [new TextRun({ text: `CANDIDATE: ${data.fullName}`, bold: true })] }),
        new Paragraph({ children: [new TextRun({ text: `LINKED INVOICE: #INV-${data.applicantId}` })] }),
        new Paragraph({ children: [new TextRun({ text: `DATE OF PAYMENT: ${new Date().toLocaleDateString('en-AU')}` })] }),
        new Paragraph({ spacing: { after: 140 } })
    );

    children.push(
        new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
                new TableRow({
                    children: [
                        new TableCell({ shading: { type: ShadingType.CLEAR, fill: SLATE_DARK }, children: [new Paragraph({ children: [new TextRun({ text: 'Particulars', bold: true, color: 'FFFFFF' })] })] }),
                        new TableCell({ shading: { type: ShadingType.CLEAR, fill: SLATE_DARK }, children: [new Paragraph({ children: [new TextRun({ text: 'Settlement Type', bold: true, color: 'FFFFFF' })] })] }),
                        new TableCell({ shading: { type: ShadingType.CLEAR, fill: SLATE_DARK }, children: [new Paragraph({ children: [new TextRun({ text: 'Amount Paid (AUD)', bold: true, color: 'FFFFFF' })] })] })
                    ]
                }),
                new TableRow({
                    children: [
                        new TableCell({ margins: { top: 80, bottom: 80, left: 80, right: 80 }, children: [new Paragraph({ children: [new TextRun({ text: 'CertHero Competency Verification & LMS Courseware Access' })] })] }),
                        new TableCell({ margins: { top: 80, bottom: 80, left: 80, right: 80 }, children: [new Paragraph({ children: [new TextRun({ text: isPartial ? 'Partial Payment (50%+ Deposit)' : 'Complete Payment (100% Paid)' })] })] }),
                        new TableCell({ margins: { top: 80, bottom: 80, left: 80, right: 80 }, children: [new Paragraph({ children: [new TextRun({ text: `$${amount.toFixed(2)} AUD`, bold: true, color: '15803D' })] })] })
                    ]
                })
            ]
        }),
        new Paragraph({ spacing: { after: 160 } })
    );

    // Dynamic Notice Box reflecting admin choice (Item 8 in FIX_1)
    if (isPartial) {
        children.push(
            new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: [
                    new TableRow({
                        children: [
                            new TableCell({
                                shading: { type: ShadingType.CLEAR, fill: 'FEF3C7' },
                                borders: {
                                    left: { style: BorderStyle.SINGLE, size: 20, color: 'D97706' },
                                    top: { style: BorderStyle.SINGLE, size: 4, color: 'FDE68A' },
                                    right: { style: BorderStyle.SINGLE, size: 4, color: 'FDE68A' },
                                    bottom: { style: BorderStyle.SINGLE, size: 4, color: 'FDE68A' }
                                },
                                margins: { top: 100, bottom: 100, left: 140, right: 140 },
                                children: [
                                    new Paragraph({
                                        children: [
                                            new TextRun({
                                                text: 'PARTIAL PAYMENT (50%+) REGISTERED — THREE-EXAM LIMIT NOTICE:',
                                                bold: true,
                                                color: '92400E'
                                            })
                                        ]
                                    }),
                                    new Paragraph({
                                        spacing: { before: 60 },
                                        children: [
                                            new TextRun({
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
            })
        );
    } else {
        children.push(
            new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: [
                    new TableRow({
                        children: [
                            new TableCell({
                                shading: { type: ShadingType.CLEAR, fill: 'DCFCE7' },
                                borders: {
                                    left: { style: BorderStyle.SINGLE, size: 20, color: '16A34A' },
                                    top: { style: BorderStyle.SINGLE, size: 4, color: 'BBF7D0' },
                                    right: { style: BorderStyle.SINGLE, size: 4, color: 'BBF7D0' },
                                    bottom: { style: BorderStyle.SINGLE, size: 4, color: 'BBF7D0' }
                                },
                                margins: { top: 100, bottom: 100, left: 140, right: 140 },
                                children: [
                                    new Paragraph({
                                        children: [
                                            new TextRun({
                                                text: 'FULL PAYMENT CONFIRMED — UNLIMITED LMS ACCESS UNLOCKED:',
                                                bold: true,
                                                color: '166534'
                                            })
                                        ]
                                    }),
                                    new Paragraph({
                                        spacing: { before: 60 },
                                        children: [
                                            new TextRun({
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
            })
        );
    }

    return new Document({ sections: [{ children }] });
}

/**
 * 6. Competency Ticket Certificate (Styled with CertHero theme: Gold #FFC700, Charcoal #0F172A, Amber #ED9139, & CertHero logo)
 */
export async function generateTicketCertificateDocx(data: ApplicantDocData): Promise<Document> {
    const children: (Paragraph | Table)[] = [];

    // CertHero Logo
    const logoP = createLogoParagraph(CERTHERO_LOGO_PATH, 80, 80);
    if (logoP) children.push(logoP);

    children.push(
        new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 100, after: 60 },
            children: [new TextRun({ text: 'NATIONALLY RECOGNISED TRAINING', bold: true, size: 24, color: SLATE_DARK })]
        }),
        new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 80 },
            children: [new TextRun({ text: 'CERTHERO RTO PARTNER — STATEMENT OF ATTAINMENT', bold: true, size: 28, color: AMBER })]
        }),
        new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 180 },
            children: [new TextRun({ text: 'RTO Provider Code: 52418 | ABN 89 612 431 902 | Perth, Western Australia | tickets@certhero.study', size: 18, color: '64748B' })]
        }),
        new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 100, after: 80 },
            children: [new TextRun({ text: 'This is to certify that:', italics: true, size: 22 })]
        }),
        new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 180 },
            children: [new TextRun({ text: data.fullName.toUpperCase(), bold: true, size: 32, color: SLATE_DARK })]
        }),
        new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 120 },
            children: [new TextRun({ text: 'has fulfilled all statutory requirements and demonstrated competency in the following units:', size: 20 })]
        })
    );

    // Itemized tickets styled with Gold and Charcoal theme
    const ticketUnits = [
        'RIIWHS204E — WORK SAFELY AT HEIGHTS',
        'RIIWHS202E — ENTER AND WORK IN CONFINED SPACES',
        'STD11 — SURFACE MINING SAFETY INDUCTION',
        'HLTAID011 — PROVIDE FIRST AID & CPR',
        'CPCWHS1001 — PREPARE TO WORK SAFELY IN THE CONSTRUCTION INDUSTRY (WHITE CARD WA)'
    ];

    ticketUnits.forEach(unit => {
        children.push(
            new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 40, after: 40 },
                children: [
                    new TextRun({ text: '✔ ', bold: true, color: AMBER }),
                    new TextRun({ text: unit, bold: true, size: 22, color: SLATE_DARK })
                ]
            })
        );
    });

    children.push(
        new Paragraph({ spacing: { before: 200, after: 100 } }),
        new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
                new TableRow({
                    children: [
                        new TableCell({
                            children: [
                                new Paragraph({ children: [new TextRun({ text: `Certificate No: CERT-FIFO-${data.applicantId}`, bold: true })] }),
                                new Paragraph({ children: [new TextRun({ text: `Date Issued: ${new Date().toLocaleDateString('en-AU')}` })] }),
                                new Paragraph({ children: [new TextRun({ text: 'Verification: https://certhero.study/verify', color: '64748B' })] })
                            ]
                        }),
                        new TableCell({
                            children: [
                                new Paragraph({ children: [new TextRun({ text: '_______________________________' })] }),
                                new Paragraph({ children: [new TextRun({ text: 'Principal Executive Officer / RTO Director\nCertHero Training & Assessment Systems', bold: true })] })
                            ]
                        })
                    ]
                })
            ]
        })
    );

    return new Document({ sections: [{ children }] });
}

export { generateMacaOnboardingGuideDocx };
