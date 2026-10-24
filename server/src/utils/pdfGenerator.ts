import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * PDF Generator Utility for Server-Side Document Dispatch
 * Adheres strictly to corporate communications and CertHero/MACA design guidelines.
 */

// 1. MACA Employee Onboarding Guide
export function generateOnboardingGuidePDF(applicantName: string, interviewDate: string): Buffer {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    let y = 18;

    // Header Band
    doc.setFillColor(24, 24, 27); // Dark graphite
    doc.rect(0, 0, 210, 36, 'F');

    // Accent line
    doc.setFillColor(245, 158, 11); // Amber
    doc.rect(0, 36, 210, 2, 'F');

    // Header Text
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('MACA LIMITED - MINING & INFRASTRUCTURE', 14, 16);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(245, 158, 11);
    doc.text('CANDIDATE INTERVIEW & OVERSEAS ONBOARDING PROTOCOL', 14, 24);

    doc.setTextColor(200, 200, 200);
    doc.setFontSize(8);
    doc.text('Western Australia FIFO Operations | Head Office: 45 Briggs St, Welshpool WA 6106', 14, 30);

    y = 48;

    // Candidate Details Card
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(14, y, 182, 26, 3, 3, 'FD');

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('CANDIDATE NAME:', 20, y + 8);
    doc.setFont('helvetica', 'normal');
    doc.text(applicantName || 'Applicant', 65, y + 8);

    doc.setFont('helvetica', 'bold');
    doc.text('SCHEDULED INTERVIEW:', 20, y + 16);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(180, 83, 9);
    doc.text(interviewDate || 'To be confirmed by host employer', 65, y + 16);

    doc.setTextColor(100, 116, 139);
    doc.setFontSize(8);
    doc.text('DOCUMENT REF: MACA-ONB-2026-WA | STRICTLY CONFIDENTIAL', 20, y + 22);

    y += 34;

    // Section 1
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('1. PURPOSE OF THIS ONBOARDING GUIDE', 14, y);
    y += 6;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    const p1 = 'This document outlines the procedural path from your upcoming interview to final mobilisation on a Western Australian mining site. It is supplied to provide absolute clarity regarding statutory health standards, visa processing sequences, and operational responsibilities before you begin acquiring required competency certificates.';
    const lines1 = doc.splitTextToSize(p1, 182);
    doc.text(lines1, 14, y);
    y += lines1.length * 5 + 4;

    // Section 2: Pipeline Steps
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text('2. STEP-BY-STEP RECRUITMENT TO MOBILISATION ROADMAP', 14, y);
    y += 6;

    const steps = [
        ['Phase 1', 'Technical Video Interview', 'Interview via Zoom covering practical trade experience, site safety awareness, and English communication.'],
        ['Phase 2', 'Pre-Employment Medicals', 'Comprehensive physical: audiometric test, drug/alcohol screening, lung function, and chest X-ray.'],
        ['Phase 3', 'CertHero Ticket Verification', 'Online verification and assessment of mandatory High Risk Work tickets with CertHero RTO.'],
        ['Phase 4', 'Formal Contract & TRN', 'Issue of Australian Industrial Employment Agreement and Department of Home Affairs TRN allocation.'],
        ['Phase 5', 'TRA Skills Assessment & Visa', 'Submission of Trade Recognition Australia documentation followed by Subclass 482 / 494 visa grant.'],
        ['Phase 6', 'Perth Arrival & Site Mobilisation', 'Flight arrival in Perth, initial 3-day corporate safety induction, and FIFO charter flight to mine site.']
    ];

    autoTable(doc, {
        startY: y,
        head: [['Stage', 'Milestone', 'Operational Overview']],
        body: steps,
        theme: 'grid',
        headStyles: { fillColor: [24, 24, 27], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
        bodyStyles: { fontSize: 8, textColor: [51, 65, 85] },
        columnStyles: {
            0: { cellWidth: 20, fontStyle: 'bold' },
            1: { cellWidth: 46, fontStyle: 'bold' },
            2: { cellWidth: 116 }
        },
        margin: { left: 14, right: 14 }
    });

    y = (doc as any).lastAutoTable.finalY + 8;

    // Section 3: Employer Covered Commitments
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text('3. EMPLOYER-COVERED COMMITMENTS & RELOCATION PROVISIONS', 14, y);
    y += 6;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);
    const commitments = [
        '• Visa Sponsorship: 100% of employer nomination and visa nomination levy fees paid.',
        '• International Flights: One-way economy international flight to Perth, WA covered in full.',
        '• Site Accommodation: Free en-suite camp room, 3 hot meals daily, and recreation facilities on site.',
        '• Initial Off-Site Accommodation: Up to 3 months paid off-site transitional housing allowance.',
        '• FIFO Transit: All regional charter flights from Perth Airport to site provided at zero cost.'
    ];
    commitments.forEach((c) => {
        doc.text(c, 14, y);
        y += 4.5;
    });

    y += 4;

    // Footer
    doc.setDrawColor(226, 232, 240);
    doc.line(14, 280, 196, 280);
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text('MACA Limited | ABN 42 144 745 782 | Welshpool WA 6106 | Direct Recruiting Partner Protocol', 14, 285);
    doc.text('Page 1 of 1', 184, 285);

    return Buffer.from(doc.output('arraybuffer'));
}

// 2. CertHero Ticket Sponsorship Contract
export function generateContractPDF(
    applicantName: string,
    roleTitle: string,
    employerName: string,
    subsidyPercentage: number,
    amountAUD: number,
    tickets: any[] = []
): Buffer {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    let y = 18;

    // Header Band
    doc.setFillColor(15, 23, 42); // CertHero navy
    doc.rect(0, 0, 210, 36, 'F');
    doc.setFillColor(237, 145, 57); // CertHero orange
    doc.rect(0, 36, 210, 2, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('CERTHERO TRAINING & ASSESSMENT SYSTEMS', 14, 16);

    doc.setFontSize(10);
    doc.setTextColor(237, 145, 57);
    doc.text('SPONSORED CANDIDATE COMPETENCY AGREEMENT', 14, 24);

    doc.setTextColor(203, 213, 225);
    doc.setFontSize(8);
    doc.text('RTO Partner: CertHero Pty Ltd | ABN 89 612 431 902 | Perth Western Australia', 14, 30);

    y = 48;

    // Notice Box
    doc.setFillColor(254, 243, 199);
    doc.setDrawColor(245, 158, 11);
    doc.roundedRect(14, y, 182, 16, 2, 2, 'FD');
    doc.setTextColor(146, 64, 14);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('IMPORTANT CLARIFICATION NOTICE:', 18, y + 6);
    doc.setFont('helvetica', 'normal');
    doc.text('This is a Ticket Sponsorship & Verification Agreement, not a binding employment contract. Its purpose is to verify prerequisite competency tickets required by Australian mining regulators prior to job placement.', 18, y + 11);

    y += 22;

    // Particulars
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text('1. CONTRACT PARTICULARS', 14, y);
    y += 5;

    const particulars = [
        ['Candidate Name', applicantName || 'Applicant'],
        ['Target Role', roleTitle || 'FIFO Mining Operator'],
        ['Host Employer Partner', employerName || 'MACA Limited'],
        ['Approved Subsidy Rate', `${subsidyPercentage || 70}%`],
        ['Candidate Contribution (AUD)', `$${(amountAUD || 0).toFixed(2)} AUD (100% Refundable upon Deployment)`]
    ];

    autoTable(doc, {
        startY: y,
        body: particulars,
        theme: 'plain',
        bodyStyles: { fontSize: 8, textColor: [51, 65, 85], cellPadding: 1.5 },
        columnStyles: { 0: { fontStyle: 'bold', cellWidth: 55 }, 1: { cellWidth: 125 } },
        margin: { left: 14, right: 14 }
    });

    y = (doc as any).lastAutoTable.finalY + 6;

    // Section 2: Ticket Gaps Table
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text('2. SPONSORED TICKET COMPETENCIES', 14, y);
    y += 5;

    const ticketRows = (tickets && tickets.length > 0 ? tickets : [
        { ticketType: 'Standard 11 Surface Mining Induction', status: 'not_possessed' },
        { ticketType: 'Work Safely at Heights (RIIWHS204E)', status: 'not_possessed' },
        { ticketType: 'Enter and Work in Confined Spaces (RIIWHS202E)', status: 'not_possessed' },
        { ticketType: 'First Aid & CPR (HLTAID011)', status: 'not_possessed' }
    ]).map((t: any, i: number) => [
        `#${i + 1}`,
        t.ticketType || 'Competency Ticket',
        'Online Theory + On-Site Assessment',
        'Fully Sponsored'
    ]);

    autoTable(doc, {
        startY: y,
        head: [['No.', 'Competency Unit Name', 'Delivery Mode', 'Funding Status']],
        body: ticketRows,
        theme: 'grid',
        headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontSize: 8, fontStyle: 'bold' },
        bodyStyles: { fontSize: 8, textColor: [51, 65, 85] },
        columnStyles: { 0: { cellWidth: 12 }, 1: { cellWidth: 90 }, 2: { cellWidth: 50 }, 3: { cellWidth: 30 } },
        margin: { left: 14, right: 14 }
    });

    y = (doc as any).lastAutoTable.finalY + 6;

    // Section 3: 100% Refund Policy
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text('3. 100% CANDIDATE REIMBURSEMENT POLICY', 14, y);
    y += 5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);
    const refundText = 'Under the Blue Collar Partner Guarantee, 100% of the candidate contribution is reimbursed by the employer upon completion of tickets and deployment to site. Furthermore, the hiring employer directly covers all visa application fees, return/arrival flights, medicals, on-site camp accommodation, and up to 3 months of off-site housing.';
    const linesRef = doc.splitTextToSize(refundText, 182);
    doc.text(linesRef, 14, y);
    y += linesRef.length * 4.5 + 4;

    // Signatures
    doc.line(14, 260, 90, 260);
    doc.line(110, 260, 196, 260);
    doc.setFontSize(8);
    doc.text('Authorized CertHero Officer', 14, 265);
    doc.text('Candidate Acknowledgment Signature', 110, 265);

    doc.line(14, 280, 196, 280);
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text('CertHero RTO Training Partner & Blue Collar Recruitment Australia', 14, 285);
    doc.text('Page 1 of 1', 184, 285);

    return Buffer.from(doc.output('arraybuffer'));
}

// 3. Official Invoice PDF
export function generateInvoicePDF(
    invoiceId: number | string,
    candidateName: string,
    amountAUD: number,
    amountUSD: number,
    walletAddress?: string | null,
    bankDetails?: any
): Buffer {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    let y = 18;

    // Header Band
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 210, 32, 'F');
    doc.setFillColor(237, 145, 57);
    doc.rect(0, 32, 210, 2, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('CERT HERO RTO - TAX INVOICE', 14, 16);

    doc.setFontSize(9);
    doc.setTextColor(237, 145, 57);
    doc.text(`INVOICE REF: #INV-${invoiceId}`, 14, 24);

    y = 44;

    // Bill To
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('ISSUED TO:', 14, y);
    doc.setFont('helvetica', 'normal');
    doc.text(candidateName || 'Candidate', 45, y);

    doc.setFont('helvetica', 'bold');
    doc.text('DATE:', 140, y);
    doc.setFont('helvetica', 'normal');
    doc.text(new Date().toLocaleDateString('en-AU'), 160, y);

    y += 12;

    // Line items
    autoTable(doc, {
        startY: y,
        head: [['Item Description', 'Qty', 'Unit Price', 'Amount (AUD)']],
        body: [
            ['Ticket Competency Verification & LMS Course Access (After 70% Subsidy)', '1', `$${(amountAUD || 0).toFixed(2)}`, `$${(amountAUD || 0).toFixed(2)} AUD`]
        ],
        theme: 'grid',
        headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontSize: 8, fontStyle: 'bold' },
        bodyStyles: { fontSize: 8, textColor: [51, 65, 85] },
        columnStyles: { 0: { cellWidth: 110 }, 1: { cellWidth: 15 }, 2: { cellWidth: 25 }, 3: { cellWidth: 32 } },
        margin: { left: 14, right: 14 }
    });

    y = (doc as any).lastAutoTable.finalY + 10;

    // Total Due Box
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(120, y, 76, 20, 2, 2, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text(`TOTAL DUE: $${(amountAUD || 0).toFixed(2)} AUD`, 124, y + 12);
    if (amountUSD) {
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text(`Approx. $${amountUSD.toFixed(2)} USD`, 124, y + 17);
    }

    y += 28;

    // Payment instructions
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text('APPROVED PAYMENT METHODS', 14, y);
    y += 6;

    if (walletAddress) {
        doc.setFillColor(248, 250, 252);
        doc.setDrawColor(226, 232, 240);
        doc.roundedRect(14, y, 182, 18, 2, 2, 'FD');
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.text('Cryptocurrency Gateway (USDT TRC20 - Instant Processing):', 18, y + 6);
        doc.setFont('courier', 'normal');
        doc.text(walletAddress, 18, y + 12);
        y += 24;
    }

    if (bankDetails) {
        doc.setFillColor(248, 250, 252);
        doc.setDrawColor(226, 232, 240);
        doc.roundedRect(14, y, 182, 22, 2, 2, 'FD');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.text('International Swift Wire Transfer (Agent Bank Account):', 18, y + 6);
        doc.setFont('helvetica', 'normal');
        doc.text(`Bank Name: ${bankDetails.bankName || 'Commonwealth Bank'} | Account Name: ${bankDetails.accountName || 'CertHero Escrow'}`, 18, y + 11);
        doc.text(`Account No: ${bankDetails.accountNumber || 'N/A'} | Swift/Routing: ${bankDetails.routingCode || 'N/A'}`, 18, y + 16);
        y += 28;
    }

    doc.line(14, 280, 196, 280);
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text('CertHero RTO | 100% Refundable Guarantee under Blue Collar FIFO Partnership', 14, 285);

    return Buffer.from(doc.output('arraybuffer'));
}

// 4. Official Receipt PDF
export function generateReceiptPDF(
    receiptId: number | string,
    invoiceId: number | string,
    candidateName: string,
    amountAUD: number,
    paymentMethod: string = 'Verified Electronic Transfer'
): Buffer {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    let y = 18;

    // Header Band
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 210, 32, 'F');
    doc.setFillColor(16, 185, 129); // Green emerald
    doc.rect(0, 32, 210, 2, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('OFFICIAL PAYMENT RECEIPT', 14, 16);

    doc.setFontSize(9);
    doc.setTextColor(16, 185, 129);
    doc.text(`RECEIPT REF: #REC-${receiptId} | STATUS: PAID & CONFIRMED`, 14, 24);

    y = 44;

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('CANDIDATE:', 14, y);
    doc.setFont('helvetica', 'normal');
    doc.text(candidateName || 'Candidate', 45, y);

    doc.setFont('helvetica', 'bold');
    doc.text('LINKED INVOICE:', 140, y);
    doc.setFont('helvetica', 'normal');
    doc.text(`#INV-${invoiceId}`, 172, y);

    y += 12;

    autoTable(doc, {
        startY: y,
        head: [['Particulars', 'Payment Method', 'Verification Date', 'Total Paid (AUD)']],
        body: [
            ['CertHero Ticket Sponsorship Contribution', paymentMethod, new Date().toLocaleDateString('en-AU'), `$${(amountAUD || 0).toFixed(2)} AUD`]
        ],
        theme: 'grid',
        headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontSize: 8, fontStyle: 'bold' },
        bodyStyles: { fontSize: 8, textColor: [51, 65, 85] },
        columnStyles: { 0: { cellWidth: 80 }, 1: { cellWidth: 42 }, 2: { cellWidth: 28 }, 3: { cellWidth: 32 } },
        margin: { left: 14, right: 14 }
    });

    y = (doc as any).lastAutoTable.finalY + 12;

    doc.setFillColor(236, 253, 245);
    doc.setDrawColor(52, 211, 153);
    doc.roundedRect(14, y, 182, 20, 2, 2, 'FD');
    doc.setTextColor(6, 95, 70);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('FULL PAYMENT CONFIRMED - LMS ACCESS UNLOCKED', 18, y + 8);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('Your payment has been logged in the Blue Collar / CertHero national registry. You are now authorized to view full courseware and sit for all competency examinations.', 18, y + 14);

    doc.line(14, 280, 196, 280);
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text('CertHero RTO Official Receipt | ABN 89 612 431 902 | Welshpool WA', 14, 285);

    return Buffer.from(doc.output('arraybuffer'));
}
