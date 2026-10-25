import { 
    Document, Paragraph, TextRun, HeadingLevel, AlignmentType, 
    Table, TableRow, TableCell, WidthType, BorderStyle, ShadingType,
    Packer
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
const SLATE_DARK = '0F172A';
const CHARCOAL = '1E293B';
const LIGHT_BG = 'F8FAFC';
const EMERALD = '10B981';
const BORDER_LIGHT = 'E2E8F0';

/**
 * 1. Employer Selection Form (renamed from Nomination Form)
 */
export async function generateEmployerSelectionFormDocx(data: ApplicantDocData): Promise<Document> {
    const employer = data.employerName || 'MACA LIMITED';
    const children: (Paragraph | Table)[] = [];

    // Header
    children.push(
        new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 100 },
            children: [
                new TextRun({ text: 'BLUE COLLAR RECRUITMENT AUSTRALIA', bold: true, size: 28, color: NAVY, font: 'Arial' })
            ]
        }),
        new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 200 },
            children: [
                new TextRun({ text: 'OFFICIAL NOTICE OF EMPLOYER SELECTION & TRADE SPONSORSHIP', bold: true, size: 20, color: CHARCOAL, font: 'Arial' })
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
        new Paragraph({ spacing: { after: 200 } })
    );

    // Official Sponsor Employers List Table
    children.push(
        new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 180, after: 100 },
            children: [new TextRun({ text: '1. OFFICIAL SPONSOR EMPLOYERS LIST', bold: true, size: 22, color: NAVY })]
        }),
        new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
                new TableRow({
                    children: [
                        new TableCell({ shading: { type: ShadingType.CLEAR, fill: NAVY }, children: [new Paragraph({ children: [new TextRun({ text: 'Host Employer', bold: true, color: 'FFFFFF' })] })] }),
                        new TableCell({ shading: { type: ShadingType.CLEAR, fill: NAVY }, children: [new Paragraph({ children: [new TextRun({ text: 'Target Role', bold: true, color: 'FFFFFF' })] })] }),
                        new TableCell({ shading: { type: ShadingType.CLEAR, fill: NAVY }, children: [new Paragraph({ children: [new TextRun({ text: 'Allocated Slots', bold: true, color: 'FFFFFF' })] })] }),
                        new TableCell({ shading: { type: ShadingType.CLEAR, fill: NAVY }, children: [new Paragraph({ children: [new TextRun({ text: 'Status', bold: true, color: 'FFFFFF' })] })] })
                    ]
                }),
                new TableRow({
                    children: [
                        new TableCell({ margins: { top: 80, bottom: 80, left: 100, right: 100 }, children: [new Paragraph({ children: [new TextRun({ text: employer, bold: true })] })] }),
                        new TableCell({ margins: { top: 80, bottom: 80, left: 100, right: 100 }, children: [new Paragraph({ children: [new TextRun({ text: data.jobTitle })] })] }),
                        new TableCell({ margins: { top: 80, bottom: 80, left: 100, right: 100 }, children: [new Paragraph({ children: [new TextRun({ text: '5 Active Positions' })] })] }),
                        new TableCell({ margins: { top: 80, bottom: 80, left: 100, right: 100 }, children: [new Paragraph({ children: [new TextRun({ text: 'Currently Employing (Active Sponsor)', color: '15803D', bold: true })] })] })
                    ]
                })
            ]
        }),
        new Paragraph({ spacing: { after: 160 } })
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
        new Paragraph({ spacing: { after: 200 } })
    );

    // Instructions & Signatures
    children.push(
        new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 180, after: 100 },
            children: [new TextRun({ text: '2. CANDIDATE SELECTION DECLARATION', bold: true, size: 22, color: NAVY })]
        }),
        new Paragraph({
            children: [
                new TextRun({
                    text: `I, ${data.fullName}, formally confirm my selection of ${employer} as my nominated sponsoring employer for the position of ${data.jobTitle}. I understand that upon completion of my competency tickets with CertHero RTO, ${employer} will proceed with my Subclass 482 visa nomination and Australian site mobilisation.`,
                    size: 20
                })
            ]
        }),
        new Paragraph({ spacing: { before: 300, after: 100 } }),
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
 * 2. CertHero Enrollment Letter
 */
export async function generateCertHeroEnrollmentLetterDocx(data: ApplicantDocData): Promise<Document> {
    const children: (Paragraph | Table)[] = [];

    // Header
    children.push(
        new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 100 },
            children: [
                new TextRun({ text: 'CERTHERO TRAINING & ASSESSMENT SYSTEMS', bold: true, size: 28, color: SLATE_DARK, font: 'Arial' })
            ]
        }),
        new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 200 },
            children: [
                new TextRun({ text: 'OFFICIAL LEARNER ENROLLMENT CONFIRMATION & TRAINING PROTOCOL', bold: true, size: 20, color: ORANGE, font: 'Arial' })
            ]
        }),
        new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 240 },
            children: [
                new TextRun({ text: 'RTO Partner: CertHero Pty Ltd | ABN 89 612 431 902 | Perth, Western Australia', color: '64748B', size: 18 })
            ]
        })
    );

    // Particulars
    children.push(
        new Paragraph({ children: [new TextRun({ text: `Date: ${new Date().toLocaleDateString('en-AU')}`, bold: true })] }),
        new Paragraph({ children: [new TextRun({ text: `Learner: ${data.fullName}`, bold: true })] }),
        new Paragraph({ children: [new TextRun({ text: `Target Role: ${data.jobTitle}`, bold: true })] }),
        new Paragraph({ spacing: { after: 160 } })
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
        new Paragraph({ spacing: { after: 180 } })
    );

    // Procedures & Deadline
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
                    text: '• Mandatory Completion Deadline: All online examinations must be completed within 16 days from the dispatch of this enrollment package to maintain your employer sponsorship status.',
                    size: 20,
                    bold: true,
                    color: 'B45309'
                })
            ]
        }),
        new Paragraph({
            children: [
                new TextRun({
                    text: '• Official Communication Channel: support@certhero.com.au | Response window: within 4 business hours.',
                    size: 20
                })
            ]
        })
    );

    return new Document({ sections: [{ children }] });
}

/**
 * 3. Ticket Sponsorship Contract
 */
export async function generateSponsorshipContractDocx(data: ApplicantDocData): Promise<Document> {
    const employer = data.employerName || 'MACA LIMITED';
    const amount = data.amountAUD || 720;
    const subsidy = data.subsidyPercentage || 70;
    const children: (Paragraph | Table)[] = [];

    // Title
    children.push(
        new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 100 },
            children: [new TextRun({ text: 'CERTHERO TRAINING & ASSESSMENT SYSTEMS', bold: true, size: 28, color: SLATE_DARK })]
        }),
        new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 200 },
            children: [new TextRun({ text: 'SPONSORED CANDIDATE COMPETENCY AGREEMENT', bold: true, size: 20, color: ORANGE })]
        }),
        new Paragraph({
            spacing: { after: 140 },
            children: [
                new TextRun({
                    text: 'IMPORTANT CLARIFICATION NOTICE: This agreement is a Ticket Sponsorship & Prerequisite Verification Agreement. It is NOT a binding employment contract. Its purpose is to verify prerequisite competency tickets required by Australian mining regulators prior to formal job placement.',
                    italics: true,
                    bold: true,
                    color: '92400E'
                })
            ]
        })
    );

    // Particulars Table
    children.push(
        new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
                new TableRow({
                    children: [
                        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Candidate Name', bold: true })] })] }),
                        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: data.fullName })] })] })
                    ]
                }),
                new TableRow({
                    children: [
                        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Target FIFO Role', bold: true })] })] }),
                        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: data.jobTitle })] })] })
                    ]
                }),
                new TableRow({
                    children: [
                        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Host Employer Partner', bold: true })] })] }),
                        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: employer })] })] })
                    ]
                }),
                new TableRow({
                    children: [
                        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Approved Training Subsidy Rate', bold: true })] })] }),
                        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `${subsidy}% Sponsoring Contribution` })] })] })
                    ]
                }),
                new TableRow({
                    children: [
                        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Candidate Contribution (AUD)', bold: true })] })] }),
                        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `$${amount.toFixed(2)} AUD (100% Refundable upon Deployment)`, bold: true, color: '15803D' })] })] })
                    ]
                })
            ]
        }),
        new Paragraph({ spacing: { after: 180 } })
    );

    // Provisions & Refund Policy
    children.push(
        new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 140, after: 80 },
            children: [new TextRun({ text: '100% REFUND POLICY & EMPLOYER-COVERED COMMITMENTS', bold: true, size: 22, color: SLATE_DARK })]
        }),
        new Paragraph({
            children: [
                new TextRun({
                    text: '1. Refunder & Refund Guarantee: Under the Blue Collar Partner Guarantee, 100% of the candidate contribution ($720 AUD) is reimbursed by the employer upon completion of tickets and deployment to site.',
                    size: 20
                })
            ]
        }),
        new Paragraph({
            children: [
                new TextRun({
                    text: `2. Employer Covered Commitments in Employment Contract: ${employer} directly funds and covers:`,
                    size: 20,
                    bold: true
                })
            ]
        }),
        new Paragraph({ bullet: { level: 0 }, children: [new TextRun({ text: 'Skills assessment fees with Trades Recognition Australia (TRA).' })] }),
        new Paragraph({ bullet: { level: 0 }, children: [new TextRun({ text: 'Pre-employment medicals and health examinations.' })] }),
        new Paragraph({ bullet: { level: 0 }, children: [new TextRun({ text: 'Subclass 482 visa nomination fees and Department processing charges.' })] }),
        new Paragraph({ bullet: { level: 0 }, children: [new TextRun({ text: 'One-way international air travel to Perth, Western Australia.' })] }),
        new Paragraph({ bullet: { level: 0 }, children: [new TextRun({ text: 'Off-site transitional housing (up to 3 months) and free en-suite camp accommodation on site.' })] }),
        new Paragraph({ spacing: { before: 240, after: 100 } }),
        new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
                new TableRow({
                    children: [
                        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: '_______________________________' }), new TextRun({ text: '\nAuthorized CertHero Officer', bold: true })] })] }),
                        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: '_______________________________' }), new TextRun({ text: '\nCandidate Acknowledgment Signature', bold: true })] })] })
                    ]
                })
            ]
        })
    );

    return new Document({ sections: [{ children }] });
}

/**
 * 4. Official Tax Invoice
 */
export async function generateTaxInvoiceDocx(data: ApplicantDocData): Promise<Document> {
    const amount = data.amountAUD || 720;
    const amountUSD = data.amountUSD || Math.round(amount * 0.65);
    const wallet = data.walletAddress || 'TX7k9VwE3nQ9LmPzR4tY2uA1sD5fG8hJ0k';
    const children: (Paragraph | Table)[] = [];

    children.push(
        new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 80 },
            children: [new TextRun({ text: 'CERT HERO RTO — TAX INVOICE', bold: true, size: 28, color: SLATE_DARK })]
        }),
        new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 200 },
            children: [new TextRun({ text: `INVOICE REF: #INV-${data.applicantId}`, bold: true, size: 20, color: ORANGE })]
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
                        new TableCell({ shading: { type: ShadingType.CLEAR, fill: SLATE_DARK }, children: [new Paragraph({ children: [new TextRun({ text: 'Subsidy (70%)', bold: true, color: 'FFFFFF' })] })] }),
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
            children: [new TextRun({ text: 'APPROVED PAYMENT METHODS (100% REFUNDABLE)', bold: true, size: 22, color: SLATE_DARK })]
        }),
        new Paragraph({
            children: [
                new TextRun({ text: '1. Cryptocurrency Gateway (USDT TRC20 - Instant Verification):', bold: true }),
                new TextRun({ text: `\nWallet Address: ${wallet}\nNetwork: Tron (TRC20)` })
            ]
        }),
        new Paragraph({
            children: [
                new TextRun({ text: '2. International Swift Wire Transfer (Agent Escrow Account):', bold: true }),
                new TextRun({ text: '\nBank: Commonwealth Bank of Australia\nAccount Name: CertHero Escrow Trust\nAccount Number: 8829-1920-112\nRouting/Swift: CTBAAU2S' })
            ]
        }),
        new Paragraph({
            spacing: { before: 160 },
            children: [
                new TextRun({ text: 'REFUND POLICY: The residual cost of $720 AUD is 100% refundable upon ticket completion and deployment to site under the employer guarantee.', bold: true, color: '15803D' })
            ]
        })
    );

    return new Document({ sections: [{ children }] });
}

/**
 * 5. Official Receipt
 */
export async function generateOfficialReceiptDocx(data: ApplicantDocData): Promise<Document> {
    const amount = data.amountAUD || 720;
    const children: (Paragraph | Table)[] = [];

    children.push(
        new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 80 },
            children: [new TextRun({ text: 'CERTHERO RTO — OFFICIAL PAYMENT RECEIPT', bold: true, size: 28, color: SLATE_DARK })]
        }),
        new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 200 },
            children: [new TextRun({ text: `RECEIPT REF: #REC-${data.applicantId} | STATUS: PAID & CONFIRMED`, bold: true, size: 20, color: EMERALD })]
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
                        new TableCell({ shading: { type: ShadingType.CLEAR, fill: SLATE_DARK }, children: [new Paragraph({ children: [new TextRun({ text: 'Payment Route', bold: true, color: 'FFFFFF' })] })] }),
                        new TableCell({ shading: { type: ShadingType.CLEAR, fill: SLATE_DARK }, children: [new Paragraph({ children: [new TextRun({ text: 'Amount Paid (AUD)', bold: true, color: 'FFFFFF' })] })] })
                    ]
                }),
                new TableRow({
                    children: [
                        new TableCell({ margins: { top: 80, bottom: 80, left: 80, right: 80 }, children: [new Paragraph({ children: [new TextRun({ text: 'CertHero Competency Verification & LMS Courseware Access' })] })] }),
                        new TableCell({ margins: { top: 80, bottom: 80, left: 80, right: 80 }, children: [new Paragraph({ children: [new TextRun({ text: 'Verified Electronic Transfer' })] })] }),
                        new TableCell({ margins: { top: 80, bottom: 80, left: 80, right: 80 }, children: [new Paragraph({ children: [new TextRun({ text: `$${amount.toFixed(2)} AUD`, bold: true, color: '15803D' })] })] })
                    ]
                })
            ]
        }),
        new Paragraph({ spacing: { after: 160 } })
    );

    children.push(
        new Paragraph({
            children: [
                new TextRun({
                    text: 'FULL PAYMENT CONFIRMED — LMS ACCESS UNLOCKED: Your payment has been verified and registered. You are authorized to access all course modules and sit for the accredited examination portal.',
                    bold: true,
                    color: '15803D'
                })
            ]
        })
    );

    return new Document({ sections: [{ children }] });
}

/**
 * 6. Competency Ticket Certificate
 */
export async function generateTicketCertificateDocx(data: ApplicantDocData): Promise<Document> {
    const children: (Paragraph | Table)[] = [];

    children.push(
        new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 60 },
            children: [new TextRun({ text: 'NATIONALLY RECOGNISED TRAINING', bold: true, size: 24, color: SLATE_DARK })]
        }),
        new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 100 },
            children: [new TextRun({ text: 'CERTHERO RTO PARTNER — STATEMENT OF ATTAINMENT', bold: true, size: 28, color: NAVY })]
        }),
        new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 200 },
            children: [new TextRun({ text: 'RTO Provider Code: 52418 | ABN 89 612 431 902 | Perth, Western Australia', size: 18, color: '64748B' })]
        }),
        new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 100, after: 100 },
            children: [new TextRun({ text: 'This is to certify that:', italics: true, size: 22 })]
        }),
        new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 200 },
            children: [new TextRun({ text: data.fullName.toUpperCase(), bold: true, size: 32, color: NAVY })]
        }),
        new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 120 },
            children: [new TextRun({ text: 'has fulfilled all requirements and demonstrated competency in:', size: 20 })]
        }),
        new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 80 },
            children: [new TextRun({ text: 'RIIWHS204E — WORK SAFELY AT HEIGHTS', bold: true, size: 24, color: SLATE_DARK })]
        }),
        new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 80 },
            children: [new TextRun({ text: 'RIIWHS202E — ENTER AND WORK IN CONFINED SPACES', bold: true, size: 24, color: SLATE_DARK })]
        }),
        new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 240 },
            children: [new TextRun({ text: 'STD11 — SURFACE MINING SAFETY INDUCTION', bold: true, size: 24, color: SLATE_DARK })]
        }),
        new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
                new TableRow({
                    children: [
                        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `Certificate No: CERT-FIFO-${data.applicantId}` }), new TextRun({ text: `\nDate Issued: ${new Date().toLocaleDateString('en-AU')}` })] })] }),
                        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: '_______________________________' }), new TextRun({ text: '\nPrincipal Executive Officer / RTO Director', bold: true })] })] })
                    ]
                })
            ]
        })
    );

    return new Document({ sections: [{ children }] });
}

export { generateMacaOnboardingGuideDocx };
