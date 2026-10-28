"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPopulatedMacaGuideMarkdown = getPopulatedMacaGuideMarkdown;
exports.generateMacaOnboardingGuideDocx = generateMacaOnboardingGuideDocx;
exports.generateMacaOnboardingGuidePDF = generateMacaOnboardingGuidePDF;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const docx_1 = require("docx");
const jspdf_1 = require("jspdf");
const jspdf_autotable_1 = __importDefault(require("jspdf-autotable"));
/**
 * Loads the raw markdown guide from server/src/assets/maca-employee-onboarding-guide.md
 * and replaces placeholders with applicant specific data.
 */
function getPopulatedMacaGuideMarkdown(data) {
    const templatePath = path_1.default.join(__dirname, '../assets/maca-employee-onboarding-guide.md');
    let content = fs_1.default.readFileSync(templatePath, 'utf8');
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
async function generateMacaOnboardingGuideDocx(data) {
    const applicant = data.applicantName || 'Applicant';
    const role = data.roleTitle || 'FIFO Mining & Engineering Specialist';
    const interviewStr = data.interviewDate
        ? `${data.interviewDate}${data.interviewTime ? ` at ${data.interviewTime}` : ''} (${data.timezone || 'AWST'})`
        : 'Scheduled Technical Interview (Date & Zoom link confirmed)';
    const macaRed = 'ED1B2D';
    const darkCharcoal = '1E2229';
    const lightBg = 'F4F5F7';
    const slateDark = '0F172A';
    const children = [];
    // Embed official MACA Logo
    const macaLogoPath = path_1.default.join(__dirname, '../assets/maca_logo.png');
    if (fs_1.default.existsSync(macaLogoPath)) {
        try {
            children.push(new docx_1.Paragraph({
                alignment: docx_1.AlignmentType.CENTER,
                spacing: { before: 100, after: 120 },
                children: [
                    new docx_1.ImageRun({
                        data: fs_1.default.readFileSync(macaLogoPath),
                        transformation: { width: 140, height: 86 },
                        type: 'png'
                    })
                ]
            }));
        }
        catch (e) {
            console.warn('[macaOnboardingGuide] Failed to embed maca_logo in DOCX:', e);
        }
    }
    // 1. MACA Corporate Header
    children.push(new docx_1.Paragraph({
        alignment: docx_1.AlignmentType.CENTER,
        spacing: { before: 200, after: 100 },
        children: [
            new docx_1.TextRun({
                text: 'MACA LIMITED',
                bold: true,
                size: 36,
                color: macaRed,
                font: 'Arial'
            })
        ]
    }), new docx_1.Paragraph({
        alignment: docx_1.AlignmentType.CENTER,
        spacing: { before: 0, after: 200 },
        children: [
            new docx_1.TextRun({
                text: 'MINING & INFRASTRUCTURE | WESTERN AUSTRALIA',
                bold: true,
                size: 20,
                color: darkCharcoal,
                font: 'Arial'
            })
        ]
    }), new docx_1.Paragraph({
        alignment: docx_1.AlignmentType.CENTER,
        spacing: { before: 0, after: 300 },
        children: [
            new docx_1.TextRun({
                text: 'POTENTIAL OVERSEAS EMPLOYEE ONBOARDING GUIDE',
                bold: true,
                size: 24,
                color: macaRed,
                font: 'Arial'
            })
        ]
    }));
    // 2. Candidate Particulars Table (Styled Card)
    const cardTable = new docx_1.Table({
        width: { size: 100, type: docx_1.WidthType.PERCENTAGE },
        rows: [
            new docx_1.TableRow({
                children: [
                    new docx_1.TableCell({
                        shading: { type: docx_1.ShadingType.CLEAR, fill: lightBg },
                        borders: {
                            left: { style: docx_1.BorderStyle.SINGLE, size: 24, color: macaRed },
                            top: { style: docx_1.BorderStyle.SINGLE, size: 4, color: 'E2E8F0' },
                            right: { style: docx_1.BorderStyle.SINGLE, size: 4, color: 'E2E8F0' },
                            bottom: { style: docx_1.BorderStyle.SINGLE, size: 4, color: 'E2E8F0' }
                        },
                        margins: { top: 140, bottom: 140, left: 200, right: 200 },
                        children: [
                            new docx_1.Paragraph({
                                spacing: { after: 60 },
                                children: [
                                    new docx_1.TextRun({ text: 'CANDIDATE NAME: ', bold: true, color: slateDark, size: 20 }),
                                    new docx_1.TextRun({ text: applicant, bold: true, color: macaRed, size: 20 })
                                ]
                            }),
                            new docx_1.Paragraph({
                                spacing: { after: 60 },
                                children: [
                                    new docx_1.TextRun({ text: 'POSITION / ROLE: ', bold: true, color: slateDark, size: 20 }),
                                    new docx_1.TextRun({ text: role, bold: false, color: darkCharcoal, size: 20 })
                                ]
                            }),
                            new docx_1.Paragraph({
                                spacing: { after: 60 },
                                children: [
                                    new docx_1.TextRun({ text: 'CONFIRMED INTERVIEW: ', bold: true, color: slateDark, size: 20 }),
                                    new docx_1.TextRun({ text: interviewStr, bold: false, color: darkCharcoal, size: 20 })
                                ]
                            }),
                            new docx_1.Paragraph({
                                children: [
                                    new docx_1.TextRun({ text: 'DOCUMENT REF: ', bold: true, color: slateDark, size: 18 }),
                                    new docx_1.TextRun({ text: 'MACA-ONB-2026-WA | SUBCLASS 482 SKILLS IN DEMAND SPONSORSHIP', color: '64748B', size: 18 })
                                ]
                            })
                        ]
                    })
                ]
            })
        ]
    });
    children.push(cardTable);
    children.push(new docx_1.Paragraph({ spacing: { after: 200 } }));
    // Read full markdown lines and structure paragraphs
    const populatedMd = getPopulatedMacaGuideMarkdown(data);
    const mdLines = populatedMd.split('\n');
    for (let i = 0; i < mdLines.length; i++) {
        const line = mdLines[i].trim();
        if (!line)
            continue;
        // Skip the very first title if redundant with hero
        if (line.startsWith('# **Potential Overseas Employee Guide**'))
            continue;
        if (line.startsWith('## ')) {
            const hText = line.replace(/^##\s*\**|\**$/g, '').trim();
            children.push(new docx_1.Paragraph({
                heading: docx_1.HeadingLevel.HEADING_1,
                spacing: { before: 300, after: 120 },
                children: [
                    new docx_1.TextRun({
                        text: hText,
                        bold: true,
                        size: 24,
                        color: macaRed,
                        font: 'Arial'
                    })
                ]
            }));
        }
        else if (line.startsWith('### ')) {
            const hText = line.replace(/^###\s*\**|\**$/g, '').trim();
            children.push(new docx_1.Paragraph({
                heading: docx_1.HeadingLevel.HEADING_2,
                spacing: { before: 200, after: 80 },
                children: [
                    new docx_1.TextRun({
                        text: hText,
                        bold: true,
                        size: 21,
                        color: darkCharcoal,
                        font: 'Arial'
                    })
                ]
            }));
        }
        else if (line.startsWith('#### ')) {
            const hText = line.replace(/^####\s*\**|\**$/g, '').trim();
            children.push(new docx_1.Paragraph({
                heading: docx_1.HeadingLevel.HEADING_3,
                spacing: { before: 160, after: 60 },
                children: [
                    new docx_1.TextRun({
                        text: hText,
                        bold: true,
                        size: 19,
                        color: slateDark,
                        font: 'Arial'
                    })
                ]
            }));
        }
        else if (line.startsWith('* ') || line.startsWith('- ')) {
            const bulletText = line.replace(/^[*\-]\s+/, '').replace(/\*\*/g, '').replace(/\\/g, '');
            children.push(new docx_1.Paragraph({
                bullet: { level: 0 },
                spacing: { before: 40, after: 40 },
                children: [
                    new docx_1.TextRun({
                        text: bulletText,
                        size: 19,
                        color: darkCharcoal,
                        font: 'Calibri'
                    })
                ]
            }));
        }
        else {
            const cleanLine = line.replace(/\*\*/g, '').replace(/\\/g, '');
            const isCallout = cleanLine.startsWith('What this means for you:') || cleanLine.startsWith('Important Disclaimer:');
            children.push(new docx_1.Paragraph({
                spacing: { before: 60, after: 80 },
                children: [
                    new docx_1.TextRun({
                        text: cleanLine,
                        size: 19,
                        bold: isCallout,
                        color: isCallout ? macaRed : darkCharcoal,
                        font: 'Calibri'
                    })
                ]
            }));
        }
    }
    return new docx_1.Document({
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
function generateMacaOnboardingGuidePDF(data) {
    const doc = new jspdf_1.jsPDF({ unit: 'mm', format: 'a4' });
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
    // Embed MACA Logo in PDF Header
    const macaLogoPath = path_1.default.join(__dirname, '../assets/maca_logo.png');
    if (fs_1.default.existsSync(macaLogoPath)) {
        try {
            const logoData = fs_1.default.readFileSync(macaLogoPath);
            const logoBase64 = `data:image/png;base64,${logoData.toString('base64')}`;
            doc.addImage(logoBase64, 'PNG', pageWidth - 42, 4, 30, 18);
        }
        catch (e) {
            console.warn('[macaOnboardingGuide] Failed to add MACA logo to PDF:', e);
        }
    }
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
    (0, jspdf_autotable_1.default)(doc, {
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
    y = doc.lastAutoTable.finalY + 8;
    // Disclaimer Box
    doc.setFillColor(244, 245, 247);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(14, y, 182, 18, 2, 2, 'FD');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text('LEGAL & IMMIGRATION NOTICE:', 18, y + 6);
    doc.text('Immigration policies, income thresholds, fees and requirements are subject to change by Australian migration authorities. Always confirm current regulations on the Department of Home Affairs portal (immi.homeaffairs.gov.au).', 18, y + 11);
    // Footer Page 1
    doc.setDrawColor(226, 232, 240);
    doc.line(14, 280, 196, 280);
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text('MACA Limited | ABN 42 144 745 782 | 45 Briggs St, Welshpool WA 6106 | maca.net.au', 14, 285);
    doc.text('Page 1 of 2', 184, 285);
    // ==========================================
    // PAGE 2: Required Documents & Regional Channels
    // ==========================================
    doc.addPage();
    // Header Band - Page 2
    doc.setFillColor(237, 27, 45); // MACA Red
    doc.rect(0, 0, pageWidth, 24, 'F');
    doc.setFillColor(30, 34, 41); // Dark Charcoal
    doc.rect(0, 24, pageWidth, 3, 'F');
    if (fs_1.default.existsSync(macaLogoPath)) {
        try {
            const logoData = fs_1.default.readFileSync(macaLogoPath);
            const logoBase64 = `data:image/png;base64,${logoData.toString('base64')}`;
            doc.addImage(logoBase64, 'PNG', pageWidth - 38, 3, 26, 16);
        }
        catch (e) {
            // ignore
        }
    }
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('MACA LIMITED — ONBOARDING PROTOCOL', 14, 12);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.text('MASTER DOCUMENT CHECKLIST & COMMUNICATION DIRECTIVES', 14, 19);
    let y2 = 34;
    // Section B: Master Document Checklist
    doc.setTextColor(237, 27, 45);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('B. MASTER ONBOARDING DOCUMENT CHECKLIST', 14, y2);
    y2 += 6;
    const checklistItems = [
        ['1. Identity & Travel', 'Certified color copies of valid International Passport (bio-page and travel stamps), National ID card, and current driver licence.'],
        ['2. Competency Tickets', 'All CertHero / Aveling accredited VOC and High Risk Work Licenses required for your specific heavy-industry site classification.'],
        ['3. Skills Assessment', 'Formal positive skills assessment outcome letter issued by Trades Recognition Australia (TRA) under Subclass 482 guidelines.'],
        ['4. Prior Employment', 'Signed formal employer reference letters (confirming job title, exact dates, weekly hours, duties), payslips, tax records or bank statements.'],
        ['5. English & Medicals', 'Approved English language proficiency score report (IELTS 5.0+ or equivalent), and official HAP ID health examination clearance.'],
        ['6. Character Clearances', 'Original Police Clearance Certificates from each country lived in for 12+ months in the last 10 years, plus completed Form 80.']
    ];
    (0, jspdf_autotable_1.default)(doc, {
        startY: y2,
        head: [['Category', 'Required Documentary Evidence']],
        body: checklistItems,
        theme: 'grid',
        headStyles: { fillColor: [30, 34, 41], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
        bodyStyles: { fontSize: 7.8, textColor: [51, 65, 85] },
        columnStyles: {
            0: { cellWidth: 45, fontStyle: 'bold', textColor: [237, 27, 45] },
            1: { cellWidth: 137 }
        },
        margin: { left: 14, right: 14 }
    });
    y2 = doc.lastAutoTable.finalY + 8;
    // Section C: Communication Channels & Warning
    doc.setTextColor(237, 27, 45);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('C. OFFICIAL REGIONAL COMMUNICATION CHANNELS', 14, y2);
    y2 += 5;
    // Strong Warning Box
    doc.setFillColor(254, 242, 242);
    doc.setDrawColor(239, 68, 68);
    doc.roundedRect(14, y2, 182, 16, 2, 2, 'FD');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(185, 28, 28);
    doc.text('CRITICAL NOTICE: REGIONAL COMMUNICATION CHANNEL RESTRICTION', 18, y2 + 5.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(153, 27, 27);
    const warnText = 'Strong notice is given regarding non-Australians using the Australian communication channel and vice versa, as this will result in delay in response or no response at all. You must strictly use your assigned regional channel.';
    const warnLines = doc.splitTextToSize(warnText, 174);
    doc.text(warnLines, 18, y2 + 10);
    y2 += 21;
    // Table of regional emails
    const channelRows = [
        ['Australian & New Zealand Residents', 'all.recruitment@maca.net.au', 'Dedicated domestic recruitment and mobilisation team.'],
        ['Non-Australian & Non-NZ Residents', 'recruitement@maca.works', 'Overseas international candidate visa and flight processing.']
    ];
    (0, jspdf_autotable_1.default)(doc, {
        startY: y2,
        head: [['Jurisdiction / Residency', 'Dedicated Email Channel', 'Operational Function']],
        body: channelRows,
        theme: 'grid',
        headStyles: { fillColor: [30, 34, 41], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 7.5 },
        bodyStyles: { fontSize: 7.5, textColor: [30, 41, 59] },
        columnStyles: {
            0: { cellWidth: 55, fontStyle: 'bold' },
            1: { cellWidth: 55, fontStyle: 'bold', textColor: [237, 27, 45] },
            2: { cellWidth: 72 }
        },
        margin: { left: 14, right: 14 }
    });
    y2 = doc.lastAutoTable.finalY + 8;
    // Section D: Bold Mandatory HR Submission Protocol
    doc.setFillColor(255, 251, 235);
    doc.setDrawColor(245, 158, 11);
    doc.roundedRect(14, y2, 182, 34, 2, 2, 'FD');
    doc.setFillColor(237, 27, 45);
    doc.rect(14, y2, 3, 34, 'F');
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(146, 64, 14);
    doc.text('MANDATORY STEP TO INITIATE EMPLOYEE ONBOARDING', 21, y2 + 7);
    doc.setFontSize(8);
    doc.setTextColor(120, 53, 15);
    const subNotice1 = 'IT IS MANDATORY THAT UPON FINALISATION OF EMPLOYMENT AND VISA PROCESSING, APPLICANTS MUST SUBMIT PHOTOCOPIES OF ALL DOCUMENTS CONTAINED IN THIS ATTACHED FILE (maca-employee-onboarding-guide.pdf) TO THE HUMAN RESOURCE DEPARTMENT USING THE EMAIL:';
    const subNotice1Lines = doc.splitTextToSize(subNotice1, 172);
    doc.text(subNotice1Lines, 21, y2 + 13);
    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(237, 27, 45);
    doc.text('hr@maca.net.au', 21, y2 + 23);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(146, 64, 14);
    const subNotice2 = 'Applicants must understand that completing this step is strictly important to formally initiate employee onboarding, activate your payroll staff record, issue site induction tickets, and confirm your flight tickets to Western Australia.';
    const subNotice2Lines = doc.splitTextToSize(subNotice2, 172);
    doc.text(subNotice2Lines, 21, y2 + 28);
    // Footer Page 2
    doc.setDrawColor(226, 232, 240);
    doc.line(14, 280, 196, 280);
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text('MACA Limited | ABN 42 144 745 782 | 45 Briggs St, Welshpool WA 6106 | maca.net.au', 14, 285);
    doc.text('Page 2 of 2', 184, 285);
    return Buffer.from(doc.output('arraybuffer'));
}
