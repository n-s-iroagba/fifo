import fs from 'fs';
import path from 'path';
import { Document, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, WidthType, BorderStyle, ShadingType } from 'docx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface MacaGuideData {
    applicantName: string;
    roleTitle: string;
    interviewDate?: string | null;
    interviewTime?: string | null;
    interviewLink?: string | null;
    timezone?: string | null;
}

/**
 * Loads the raw markdown guide from server/src/assets/maca-employee-onboarding-guide.md
 * and replaces placeholders with applicant specific data.
 */
export function getPopulatedMacaGuideMarkdown(data: MacaGuideData): string {
    const templatePath = path.join(__dirname, '../assets/maca-employee-onboarding-guide.md');
    let content = fs.readFileSync(templatePath, 'utf8');

    const applicant = data.applicantName || 'Applicant';
    const role = data.roleTitle || 'FIFO Mining & Engineering Specialist';
    const interviewStr = data.interviewDate 
        ? `${data.interviewDate}${data.interviewTime ? ` at ${data.interviewTime}` : ''} (${data.timezone || 'AWST'})`
        : 'Scheduled Technical Interview (Date & Zoom link to be confirmed)';

    // Replace specific placeholders in template
    content = content.replace(/\*\*A\.2 You:\*\*\\?\s*\\?\[To be completed\\?\]/g, `**A.2 You:** ${applicant}`);
    content = content.replace(/\*\*A\.2 You:\*\*\s*\[To be completed\]/g, `**A.2 You:** ${applicant}`);
    content = content.replace(/\*\*A\.3 Role:\*\*\\?\s*\\?\[To be completed\\?\]/g, `**A.3 Role:** ${role}`);
    content = content.replace(/\*\*A\.3 Role:\*\*\s*\[To be completed\]/g, `**A.3 Role:** ${role}`);
    content = content.replace(/### \*\*1\\?\. INTERVIEW\*\*\s*\n\s*\*\*Date:\*\*/g, `### **1. INTERVIEW**\n\n**Date:** ${interviewStr}`);

    return content;
}

/**
 * Generates an executive DOCX document of the MACA Employee Onboarding Guide
 * following the brand theme of maca.net.au (MACA Red, Bold Charcoal, White).
 */
export async function generateMacaOnboardingGuideDocx(data: MacaGuideData): Promise<Document> {
    const applicant = data.applicantName || 'Applicant';
    const role = data.roleTitle || 'FIFO Mining & Engineering Specialist';
    const interviewStr = data.interviewDate 
        ? `${data.interviewDate}${data.interviewTime ? ` at ${data.interviewTime}` : ''} (${data.timezone || 'AWST'})`
        : 'Scheduled Technical Interview (Date & Zoom link confirmed)';

    const macaRed = 'ED1B2D';
    const darkCharcoal = '1E2229';
    const lightBg = 'F4F5F7';
    const slateDark = '0F172A';

    const children: (Paragraph | Table)[] = [];

    // 1. MACA Corporate Header
    children.push(
        new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 100 },
            children: [
                new TextRun({
                    text: 'MACA LIMITED',
                    bold: true,
                    size: 36,
                    color: macaRed,
                    font: 'Arial'
                })
            ]
        }),
        new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 200 },
            children: [
                new TextRun({
                    text: 'MINING & INFRASTRUCTURE | WESTERN AUSTRALIA',
                    bold: true,
                    size: 20,
                    color: darkCharcoal,
                    font: 'Arial'
                })
            ]
        }),
        new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 300 },
            children: [
                new TextRun({
                    text: 'POTENTIAL OVERSEAS EMPLOYEE ONBOARDING GUIDE',
                    bold: true,
                    size: 24,
                    color: macaRed,
                    font: 'Arial'
                })
            ]
        })
    );

    // 2. Candidate Particulars Table (Styled Card)
    const cardTable = new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
            new TableRow({
                children: [
                    new TableCell({
                        shading: { type: ShadingType.CLEAR, fill: lightBg },
                        borders: {
                            left: { style: BorderStyle.SINGLE, size: 24, color: macaRed },
                            top: { style: BorderStyle.SINGLE, size: 4, color: 'E2E8F0' },
                            right: { style: BorderStyle.SINGLE, size: 4, color: 'E2E8F0' },
                            bottom: { style: BorderStyle.SINGLE, size: 4, color: 'E2E8F0' }
                        },
                        margins: { top: 140, bottom: 140, left: 200, right: 200 },
                        children: [
                            new Paragraph({
                                spacing: { after: 60 },
                                children: [
                                    new TextRun({ text: 'CANDIDATE NAME: ', bold: true, color: slateDark, size: 20 }),
                                    new TextRun({ text: applicant, bold: true, color: macaRed, size: 20 })
                                ]
                            }),
                            new Paragraph({
                                spacing: { after: 60 },
                                children: [
                                    new TextRun({ text: 'POSITION / ROLE: ', bold: true, color: slateDark, size: 20 }),
                                    new TextRun({ text: role, bold: false, color: darkCharcoal, size: 20 })
                                ]
                            }),
                            new Paragraph({
                                spacing: { after: 60 },
                                children: [
                                    new TextRun({ text: 'CONFIRMED INTERVIEW: ', bold: true, color: slateDark, size: 20 }),
                                    new TextRun({ text: interviewStr, bold: false, color: darkCharcoal, size: 20 })
                                ]
                            }),
                            new Paragraph({
                                children: [
                                    new TextRun({ text: 'DOCUMENT REF: ', bold: true, color: slateDark, size: 18 }),
                                    new TextRun({ text: 'MACA-ONB-2026-WA | SUBCLASS 482 SKILLS IN DEMAND SPONSORSHIP', color: '64748B', size: 18 })
                                ]
                            })
                        ]
                    })
                ]
            })
        ]
    });
    children.push(cardTable);
    children.push(new Paragraph({ spacing: { after: 200 } }));

    // Read full markdown lines and structure paragraphs
    const populatedMd = getPopulatedMacaGuideMarkdown(data);
    const mdLines = populatedMd.split('\n');

    for (let i = 0; i < mdLines.length; i++) {
        const line = mdLines[i].trim();
        if (!line) continue;

        // Skip the very first title if redundant with hero
        if (line.startsWith('# **Potential Overseas Employee Guide**')) continue;

        if (line.startsWith('## ')) {
            const hText = line.replace(/^##\s*\**|\**$/g, '').trim();
            children.push(
                new Paragraph({
                    heading: HeadingLevel.HEADING_1,
                    spacing: { before: 300, after: 120 },
                    children: [
                        new TextRun({
                            text: hText,
                            bold: true,
                            size: 24,
                            color: macaRed,
                            font: 'Arial'
                        })
                    ]
                })
            );
        } else if (line.startsWith('### ')) {
            const hText = line.replace(/^###\s*\**|\**$/g, '').trim();
            children.push(
                new Paragraph({
                    heading: HeadingLevel.HEADING_2,
                    spacing: { before: 200, after: 80 },
                    children: [
                        new TextRun({
                            text: hText,
                            bold: true,
                            size: 21,
                            color: darkCharcoal,
                            font: 'Arial'
                        })
                    ]
                })
            );
        } else if (line.startsWith('#### ')) {
            const hText = line.replace(/^####\s*\**|\**$/g, '').trim();
            children.push(
                new Paragraph({
                    heading: HeadingLevel.HEADING_3,
                    spacing: { before: 160, after: 60 },
                    children: [
                        new TextRun({
                            text: hText,
                            bold: true,
                            size: 19,
                            color: slateDark,
                            font: 'Arial'
                        })
                    ]
                })
            );
        } else if (line.startsWith('* ') || line.startsWith('- ')) {
            const bulletText = line.replace(/^[*\-]\s+/, '').replace(/\*\*/g, '').replace(/\\/g, '');
            children.push(
                new Paragraph({
                    bullet: { level: 0 },
                    spacing: { before: 40, after: 40 },
                    children: [
                        new TextRun({
                            text: bulletText,
                            size: 19,
                            color: darkCharcoal,
                            font: 'Calibri'
                        })
                    ]
                })
            );
        } else {
            const cleanLine = line.replace(/\*\*/g, '').replace(/\\/g, '');
            const isCallout = cleanLine.startsWith('What this means for you:') || cleanLine.startsWith('Important Disclaimer:');
            children.push(
                new Paragraph({
                    spacing: { before: 60, after: 80 },
                    children: [
                        new TextRun({
                            text: cleanLine,
                            size: 19,
                            bold: isCallout,
                            color: isCallout ? macaRed : darkCharcoal,
                            font: 'Calibri'
                        })
                    ]
                })
            );
        }
    }

    return new Document({
        sections: [
            {
                properties: {
                    page: {
                        margin: {
                            top: 1000,
                            right: 1000,
                            bottom: 1000,
                            left: 1000
                        }
                    }
                },
                children
            }
        ]
    });
}

/**
 * Generates an executive PDF of the MACA Employee Onboarding Guide
 * formatted according to maca.net.au corporate guidelines.
 */
export function generateMacaOnboardingGuidePDF(data: MacaGuideData): Buffer {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 14;

    const applicant = data.applicantName || 'Applicant';
    const role = data.roleTitle || 'FIFO Mining & Engineering Specialist';
    const interviewStr = data.interviewDate 
        ? `${data.interviewDate}${data.interviewTime ? ` at ${data.interviewTime}` : ''} (${data.timezone || 'AWST'})`
        : 'Scheduled Technical Interview (Date & Zoom link confirmed)';

    // Header Band - MACA Red & Dark Charcoal
    doc.setFillColor(237, 27, 45); // MACA Red (#ED1B2D)
    doc.rect(0, 0, pageWidth, 28, 'F');
    doc.setFillColor(30, 34, 41); // Dark Charcoal
    doc.rect(0, 28, pageWidth, 4, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('MACA LIMITED', 14, 13);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('MINING & INFRASTRUCTURE | WESTERN AUSTRALIA FIFO OPERATIONS', 14, 21);

    y = 40;

    // Candidate Card
    doc.setFillColor(244, 245, 247);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(14, y, 182, 30, 2, 2, 'FD');

    // Red left accent border
    doc.setFillColor(237, 27, 45);
    doc.rect(14, y, 3, 30, 'F');

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('CANDIDATE:', 22, y + 8);
    doc.setFont('helvetica', 'normal');
    doc.text(applicant, 60, y + 8);

    doc.setFont('helvetica', 'bold');
    doc.text('TARGET ROLE:', 22, y + 15);
    doc.setFont('helvetica', 'normal');
    doc.text(role, 60, y + 15);

    doc.setFont('helvetica', 'bold');
    doc.text('INTERVIEW:', 22, y + 22);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(237, 27, 45);
    doc.text(interviewStr, 60, y + 22);

    y += 38;

    // Introduction & Visa details
    doc.setTextColor(237, 27, 45);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('A. VISA SPONSORSHIP & SUBCLASS 482 FRAMEWORK', 14, y);
    y += 6;

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    const introP = 'MACA Limited acts as the primary visa sponsor for the Subclass 482 (Skills in Demand) visa. The employer directly lodges your nomination, funds your Trades Recognition Australia (TRA) skills assessment, pays Department of Home Affairs processing fees, issues your TRN, and provides fully funded international flight tickets and arrival reception in Western Australia.';
    const linesIntro = doc.splitTextToSize(introP, 182);
    doc.text(linesIntro, 14, y);
    y += linesIntro.length * 4.5 + 4;

    // Roadmap Table
    const steps = [
        ['Phase 1', 'Technical Video Interview', 'Interview via Zoom covering practical trade experience, site safety awareness, and English communication.'],
        ['Phase 2', 'Employment Contract & TRN', 'Ratification of Australian Industrial Employment Agreement ($146,576 / $79,423 AUD thresholds) and TRN issue.'],
        ['Phase 3', 'Skills Assessment (TRA)', 'Lodgement of CertHero accredited competency tickets and qualifications with Trades Recognition Australia. Fee paid by MACA.'],
        ['Phase 4', 'Medicals & Character', 'HAP ID medical examination with panel physician; police clearance certificates and Form 80 completion.'],
        ['Phase 5', 'Visa Lodgement & Grant', 'Department of Home Affairs visa submission linked via TRN (processed in as little as 7 working days).'],
        ['Phase 6', 'Flights & Site Mobilisation', 'One-way international flight to Perth, 3-day corporate safety induction, 3 months paid off-site housing, and FIFO charter flight.']
    ];

    autoTable(doc, {
        startY: y,
        head: [['Stage', 'Milestone', 'MACA Sponsor Commitment']],
        body: steps,
        theme: 'grid',
        headStyles: { fillColor: [30, 34, 41], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
        bodyStyles: { fontSize: 8, textColor: [51, 65, 85] },
        columnStyles: {
            0: { cellWidth: 20, fontStyle: 'bold' },
            1: { cellWidth: 50, fontStyle: 'bold', textColor: [237, 27, 45] },
            2: { cellWidth: 112 }
        },
        margin: { left: 14, right: 14 }
    });

    y = (doc as any).lastAutoTable.finalY + 8;

    // Disclaimer Box
    doc.setFillColor(244, 245, 247);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(14, y, 182, 18, 2, 2, 'FD');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text('LEGAL & IMMIGRATION NOTICE:', 18, y + 6);
    doc.text('Immigration policies, income thresholds, fees and requirements are subject to change by Australian migration authorities. Always confirm current regulations on the Department of Home Affairs portal (immi.homeaffairs.gov.au).', 18, y + 11);

    // Footer
    doc.setDrawColor(226, 232, 240);
    doc.line(14, 280, 196, 280);
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text('MACA Limited | ABN 42 144 745 782 | 45 Briggs St, Welshpool WA 6106 | maca.net.au', 14, 285);
    doc.text('Page 1 of 1', 184, 285);

    return Buffer.from(doc.output('arraybuffer'));
}
