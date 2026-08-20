'use client';

import React, { useState } from 'react';
import { useApiQuery, useApiMutation } from '@/lib/hooks';

// ─── Nomination Document Generator ──────────────────────────────────────────

async function generateNominationPDF(applicant: any, options: any[], totalApplicants: number, dateStr: string): Promise<string> {
    const { jsPDF } = await import('jspdf');
    const autoTable = (await import('jspdf-autotable')).default;

    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    let y = 15;

    const addLine = (text: string, size = 10, bold = false, color = [0, 0, 0] as [number, number, number], indent = 14) => {
        doc.setFontSize(size);
        doc.setFont('helvetica', bold ? 'bold' : 'normal');
        doc.setTextColor(color[0], color[1], color[2]);
        const lines = doc.splitTextToSize(text, 182 - (indent - 14));
        doc.text(lines, indent, y);
        y += (lines.length * size * 0.4) + 2;
    };

    const addSpace = (h = 4) => { y += h; };

    // Header
    addLine('BLUE COLLAR RECRUITMENT PTY LTD', 13, true, [0, 0, 128]);
    addSpace(1);
    addLine('Document Ref: BCR-FIFO-2026-NOM-V2', 8, false, [80, 80, 80]);
    addSpace(3);

    // Divider
    doc.setDrawColor(0, 0, 128);
    doc.line(14, y, 196, y);
    addSpace(5);

    addLine('OFFICIAL NOTICE OF NOMINATION & TRADE SELECTION', 12, true, [0, 0, 0]);
    addSpace(4);

    addLine(`Candidate Name: ${applicant.fullName}`, 10, true);
    addLine(`Date of Instrument: ${dateStr}`, 10);
    addLine('Status: Partial Ticket Sponsorship Pending Trade Alignment', 10);
    addSpace(4);

    const introText =
        'In accordance with your execution of the FIFO Candidate Agreement, Blue Collar Recruitment Pty Limited has advanced your structural profile to our principal mining resource partners in Western Australia. We have secured active vacancy nomination quotas mapped to specific tier-1 operations out of Perth. Per your instructions, the vacancy total and competitor pools have been updated below.';
    addLine(introText, 10, false, [0, 0, 0]);
    addSpace(4);

    addLine('Please review the available options below, select exactly one (1) interconnected option (Trade Specialisation and hosting Client Enterprise), and return this signed notice within forty-eight (48) hours.', 10, false, [0, 0, 0]);
    addSpace(5);

    // Options table
    const tableBody = options.map((opt, idx) => [
        `[ ] Option ${idx + 1}`,
        opt.tradeStream,
        opt.hostEmployer,
        opt.vacancies,
        `${totalApplicants} Applicants (Same Applicants across all)`,
    ]);

    autoTable(doc, {
        startY: y,
        head: [['Select', 'Option / Trade Stream', 'Host Employer', 'Total Required Vacancies', 'Competitor Applicants']],
        body: tableBody,
        styles: { fontSize: 9, cellPadding: 3 },
        headStyles: { fillColor: [0, 0, 128], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [240, 245, 255] },
        margin: { left: 14, right: 14 },
    });

    y = (doc as any).lastAutoTable.finalY + 8;

    // Declaration
    addLine('CANDIDATE SELECTION AFFIRMATION & DECLARATION', 11, true);
    addSpace(2);
    const declaration = `I, ${applicant.fullName}, hereby formally select the option indicated above as my chosen vocational path. I acknowledge that this choice links my upcoming Subclass 482 visa nomination directly to the corresponding host employer and trade stream. I request Blue Collar Recruitment Pty Ltd to lock in this selection and complete my mobilization scheduling accordingly.`;
    addLine(declaration, 9.5, false, [0, 0, 0]);
    addSpace(3);
    const declaration2 = 'I further acknowledge that in the event the vacancies for my selected option are filled, I am willing to be considered for an alternative trade stream for which I am qualified, given the current applicant-to-vacancy ratio.';
    addLine(declaration2, 9.5, false, [0, 0, 0]);
    addSpace(8);

    // Signature block
    doc.setDrawColor(180, 180, 180);
    doc.line(14, y, 100, y);
    doc.line(110, y, 196, y);
    addSpace(4);
    addLine('Troy Latuff', 10, true, [0, 0, 0], 14);
    addLine(`${applicant.fullName}`, 10, true, [0, 0, 0], 110);
    y -= 5;
    addLine('Chief Executive Officer', 9, false, [80, 80, 80], 14);
    addLine('Applicant / Candidate', 9, false, [80, 80, 80], 110);
    y -= 5;
    addLine('Blue Collar Recruitment Pty Ltd', 9, false, [80, 80, 80], 14);
    addSpace(5);
    addLine(`Date: ${dateStr}`, 9, false, [80, 80, 80], 14);
    addLine('Date: ___________________________________', 9, false, [80, 80, 80], 110);

    return doc.output('datauristring');
}

async function downloadNominationDOCX(applicant: any, options: any[], totalApplicants: number, dateStr: string) {
    const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, BorderStyle, AlignmentType, HeadingLevel } = await import('docx');

    const boldText = (text: string, size = 22) =>
        new TextRun({ text, bold: true, size });
    const normalText = (text: string, size = 20) =>
        new TextRun({ text, size });

    const tableRows = [
        new TableRow({
            children: ['Select', 'Option / Trade Stream', 'Host Employer', 'Total Required Vacancies', 'Competitor Applicants'].map(h =>
                new TableCell({ children: [new Paragraph({ children: [boldText(h, 18)], alignment: AlignmentType.CENTER })] })
            ),
        }),
        ...options.map((opt, idx) =>
            new TableRow({
                children: [
                    `[ ] Option ${idx + 1}`,
                    opt.tradeStream,
                    opt.hostEmployer,
                    opt.vacancies,
                    `${totalApplicants} Applicants (Same Applicants across all)`,
                ].map(cell =>
                    new TableCell({ children: [new Paragraph({ children: [normalText(cell, 18)] })] })
                ),
            })
        ),
    ];

    const doc = new Document({
        sections: [{
            children: [
                new Paragraph({ children: [boldText('BLUE COLLAR RECRUITMENT PTY LTD', 28)], heading: HeadingLevel.HEADING_1 }),
                new Paragraph({ children: [normalText('Document Ref: BCR-FIFO-2026-NOM-V2', 18)] }),
                new Paragraph({}),
                new Paragraph({ children: [boldText('OFFICIAL NOTICE OF NOMINATION & TRADE SELECTION', 24)], alignment: AlignmentType.CENTER }),
                new Paragraph({}),
                new Paragraph({ children: [boldText(`Candidate Name: ${applicant.fullName}`)] }),
                new Paragraph({ children: [normalText(`Date of Instrument: ${dateStr}`)] }),
                new Paragraph({ children: [normalText('Status: Partial Ticket Sponsorship Pending Trade Alignment')] }),
                new Paragraph({}),
                new Paragraph({ children: [normalText('In accordance with your execution of the FIFO Candidate Agreement, Blue Collar Recruitment Pty Limited has advanced your structural profile to our principal mining resource partners in Western Australia. We have secured active vacancy nomination quotas mapped to specific tier-1 operations out of Perth. Per your instructions, the vacancy total and competitor pools have been updated below.')] }),
                new Paragraph({}),
                new Paragraph({ children: [normalText('Please review the available options below, select exactly one (1) interconnected option (Trade Specialisation and hosting Client Enterprise), and return this signed notice within forty-eight (48) hours.')] }),
                new Paragraph({}),
                new Table({ rows: tableRows, width: { size: 100, type: WidthType.PERCENTAGE } }),
                new Paragraph({}),
                new Paragraph({ children: [boldText('CANDIDATE SELECTION AFFIRMATION & DECLARATION')] }),
                new Paragraph({}),
                new Paragraph({ children: [normalText(`I, ${applicant.fullName}, hereby formally select the option indicated above as my chosen vocational path. I acknowledge that this choice links my upcoming Subclass 482 visa nomination directly to the corresponding host employer and trade stream. I request Blue Collar Recruitment Pty Ltd to lock in this selection and complete my mobilization scheduling accordingly.`, 19)] }),
                new Paragraph({}),
                new Paragraph({ children: [normalText('I further acknowledge that in the event the vacancies for my selected option are filled, I am willing to be considered for an alternative trade stream for which I am qualified, given the current applicant-to-vacancy ratio.', 19)] }),
                new Paragraph({}),
                new Paragraph({ children: [normalText('___________________________________________          ___________________________________________')] }),
                new Paragraph({ children: [normalText(`Troy Latuff                                          ${applicant.fullName}`)] }),
                new Paragraph({ children: [normalText('Chief Executive Officer                              Applicant / Candidate')] }),
                new Paragraph({ children: [normalText('Blue Collar Recruitment Pty Ltd')] }),
                new Paragraph({ children: [normalText(`Date: ${dateStr}                                        Date: _________________________________`)] }),
            ],
        }],
    });

    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `BCR-FIFO-NOM-${applicant.fullName.replace(/\s+/g, '_')}-${dateStr.replace(/\s+/g, '_')}.docx`;
    a.click();
    URL.revokeObjectURL(url);
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function NominationsPage() {
    const [selectedApplicant, setSelectedApplicant] = useState('');
    const [options, setOptions] = useState([
        { tradeStream: '', hostEmployer: '', vacancies: '', competitors: '' }
    ]);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [previewPdf, setPreviewPdf] = useState<string | null>(null);

    const { data: applicantsRes, isLoading } = useApiQuery<any>(
        ['admin', 'applicants'],
        '/admin/users?role=applicant&limit=200'
    );
    const applicants = applicantsRes?.rows || [];
    const totalApplicants: number = applicantsRes?.count || applicants.length;

    const { data: appsRes } = useApiQuery<any>(
        ['admin', 'applications', selectedApplicant],
        `/admin/applications?userId=${selectedApplicant}&limit=1`,
        { enabled: !!selectedApplicant }
    );
    const appId = appsRes?.rows?.[0]?.id;

    const { mutateAsync: createNominations, isPending: creatingNoms } = useApiMutation<any, any>('post', `/admin/applications/${appId}/nominations`);
    const { mutateAsync: sendMail } = useApiMutation<any, any>('post', '/admin/mail');

    const getToday = () => {
        const d = new Date();
        return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }).replace(/(\d+)/, (m) => {
            const n = parseInt(m);
            const s = ['th', 'st', 'nd', 'rd'];
            const v = n % 100;
            return n + (s[(v - 20) % 10] || s[v] || s[0]);
        });
    };

    const handlePreview = async () => {
        setError(null);
        const applicant = applicants.find((a: any) => a.id.toString() === selectedApplicant);
        if (!applicant) { setError('Please select a candidate.'); return; }
        if (options.some(o => !o.tradeStream || !o.hostEmployer || !o.vacancies)) {
            setError('Please fill in all option fields before previewing.');
            return;
        }
        try {
            const uri = await generateNominationPDF(applicant, options, totalApplicants, getToday());
            setPreviewPdf(uri);
        } catch (err: any) {
            setError('PDF preview failed: ' + (err.message || err));
        }
    };

    const handleDownloadDOCX = async () => {
        setError(null);
        const applicant = applicants.find((a: any) => a.id.toString() === selectedApplicant);
        if (!applicant) { setError('Please select a candidate.'); return; }
        try {
            await downloadNominationDOCX(applicant, options, totalApplicants, getToday());
        } catch (err: any) {
            setError('DOCX download failed: ' + (err.message || err));
        }
    };

    const handleSendNomination = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedApplicant || options.length === 0 || !appId) {
            setError('Please select a candidate with an active application.');
            return;
        }
        setError(null);
        setSuccess(false);

        const applicant = applicants.find((a: any) => a.id.toString() === selectedApplicant);
        if (!applicant) return;

        try {
            const pdfUri = await generateNominationPDF(applicant, options, totalApplicants, getToday());
            const base64 = pdfUri.split(',')[1];

            // Create nominations on server (triggers stage update + email via controller)
            await createNominations({
                nominations: options,
                userId: applicant.id,
                candidateName: applicant.fullName,
                candidateEmail: applicant.email,
                documentUrl: pdfUri,
                totalApplicants,
            });

            setSuccess(true);
            setPreviewPdf(null);
        } catch (err: any) {
            setError(err?.response?.data?.error || 'Failed to issue nomination.');
        }
    };

    return (
        <div className="font-sans">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-blue-900 tracking-tight">Nominations</h1>
                    <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mt-1">Issue official nomination documents to candidates</p>
                </div>
                <div className="text-[10px] text-blue-500 font-medium">
                    Total applicants in pool: <span className="font-bold text-blue-900">{totalApplicants}</span>
                </div>
            </div>

            {success && (
                <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-700 text-[11px] font-bold uppercase tracking-widest">
                    Nomination issued successfully! Document emailed to candidate.
                </div>
            )}
            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-[11px] font-bold uppercase tracking-widest">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Form */}
                <div className="bg-white p-8 rounded-2xl border border-blue-100 shadow-sm space-y-6">
                    <div>
                        <h2 className="text-sm font-bold text-blue-900 uppercase tracking-widest mb-1">Issue Nomination</h2>
                        <p className="text-xs text-blue-500">Build a nomination document matching the BCR-FIFO-2026-NOM-V2 template.</p>
                    </div>

                    <form onSubmit={handleSendNomination} className="space-y-6">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-blue-400 uppercase tracking-widest px-1">Select Candidate</label>
                            <select
                                value={selectedApplicant}
                                onChange={(e) => setSelectedApplicant(e.target.value)}
                                required
                                className="w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg text-sm font-medium focus:bg-white outline-none focus:ring-2 focus:ring-blue-900/5 transition-all text-blue-900"
                            >
                                <option value="" disabled>Select a candidate...</option>
                                {applicants.map((a: any) => (
                                    <option key={a.id} value={a.id}>{a.fullName} ({a.email})</option>
                                ))}
                            </select>
                            {selectedApplicant && !appId && (
                                <p className="text-[10px] text-amber-600 font-bold uppercase tracking-widest px-1">⚠ This candidate has no active application.</p>
                            )}
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-bold text-blue-900 uppercase tracking-widest">Nomination Options</h3>
                                <button
                                    type="button"
                                    onClick={() => setOptions([...options, { tradeStream: '', hostEmployer: '', vacancies: '', competitors: '' }])}
                                    className="text-[10px] font-bold bg-blue-100 text-blue-800 px-3 py-1.5 rounded-lg uppercase tracking-widest hover:bg-blue-200"
                                >
                                    + Add Option
                                </button>
                            </div>

                            {options.map((opt, idx) => (
                                <div key={idx} className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl space-y-4 relative">
                                    {options.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => setOptions(options.filter((_, i) => i !== idx))}
                                            className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                                        >
                                            <span className="material-symbols-outlined text-sm">close</span>
                                        </button>
                                    )}
                                    <h4 className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Option {idx + 1}</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[9px] font-bold text-blue-400 uppercase tracking-widest px-1">Trade Stream</label>
                                            <input
                                                type="text"
                                                value={opt.tradeStream}
                                                onChange={(e) => {
                                                    const n = [...options]; n[idx].tradeStream = e.target.value; setOptions(n);
                                                }}
                                                required
                                                placeholder="e.g. Mechanical Trades Assistant"
                                                className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg text-sm font-medium outline-none focus:ring-2 focus:ring-blue-900/5 transition-all text-blue-900"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[9px] font-bold text-blue-400 uppercase tracking-widest px-1">Host Employer</label>
                                            <input
                                                type="text"
                                                value={opt.hostEmployer}
                                                onChange={(e) => {
                                                    const n = [...options]; n[idx].hostEmployer = e.target.value; setOptions(n);
                                                }}
                                                required
                                                placeholder="e.g. BHP Iron Ore"
                                                className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg text-sm font-medium outline-none focus:ring-2 focus:ring-blue-900/5 transition-all text-blue-900"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[9px] font-bold text-blue-400 uppercase tracking-widest px-1">Total Vacancies</label>
                                            <input
                                                type="text"
                                                value={opt.vacancies}
                                                onChange={(e) => {
                                                    const n = [...options]; n[idx].vacancies = e.target.value; setOptions(n);
                                                }}
                                                required
                                                placeholder="e.g. 3 Positions"
                                                className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg text-sm font-medium outline-none focus:ring-2 focus:ring-blue-900/5 transition-all text-blue-900"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[9px] font-bold text-blue-400 uppercase tracking-widest px-1">Competitor Count (auto: total pool)</label>
                                            <input
                                                type="text"
                                                value={opt.competitors || `${totalApplicants} Applicants`}
                                                onChange={(e) => {
                                                    const n = [...options]; n[idx].competitors = e.target.value; setOptions(n);
                                                }}
                                                placeholder={`${totalApplicants} Applicants`}
                                                className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg text-sm font-medium outline-none focus:ring-2 focus:ring-blue-900/5 transition-all text-blue-900"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="pt-2 flex flex-wrap gap-3 justify-end">
                            <button
                                type="button"
                                onClick={handlePreview}
                                disabled={!selectedApplicant || options.some(o => !o.tradeStream || !o.hostEmployer || !o.vacancies)}
                                className="bg-blue-50 text-blue-800 border border-blue-200 px-6 py-3 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-blue-100 transition-all disabled:opacity-40"
                            >
                                Preview PDF
                            </button>
                            <button
                                type="button"
                                onClick={handleDownloadDOCX}
                                disabled={!selectedApplicant || options.some(o => !o.tradeStream || !o.hostEmployer || !o.vacancies)}
                                className="bg-blue-50 text-blue-800 border border-blue-200 px-6 py-3 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-blue-100 transition-all disabled:opacity-40"
                            >
                                Download DOCX
                            </button>
                            <button
                                type="submit"
                                disabled={creatingNoms || isLoading || !appId}
                                className="bg-blue-900 text-white px-8 py-3 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-blue-800 transition-all shadow-lg shadow-blue-900/10 disabled:opacity-50"
                            >
                                {creatingNoms ? 'Issuing...' : 'Issue Nomination'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* PDF Preview */}
                <div className="bg-white p-6 rounded-2xl border border-blue-100 shadow-sm space-y-4">
                    <h2 className="text-sm font-bold text-blue-900 uppercase tracking-widest">Document Preview</h2>
                    {previewPdf ? (
                        <iframe
                            src={previewPdf}
                            className="w-full rounded-xl border border-blue-100"
                            style={{ height: '600px' }}
                            title="Nomination PDF Preview"
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <span className="material-symbols-outlined text-blue-200 text-5xl mb-3">description</span>
                            <p className="text-sm text-blue-400 font-medium">Fill in the form and click <strong>Preview PDF</strong> to see the document here.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
