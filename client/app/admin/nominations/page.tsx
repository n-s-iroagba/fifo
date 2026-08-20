'use client';

import React, { useState } from 'react';
import { useApiQuery, useApiMutation } from '@/lib/hooks';
import Link from 'next/link';
import { uploadFile } from '@/lib/utils';

export default function NominationsPage() {
    const [selectedApplicant, setSelectedApplicant] = useState('');
    const [options, setOptions] = useState([
        { tradeStream: '', hostEmployer: '', vacancies: '', competitors: '' }
    ]);

    // Fetch applicants
    const { data: applicantsRes, isLoading } = useApiQuery<any>(
        ['admin', 'applicants'],
        '/admin/users?role=applicant&limit=100'
    );
    const applicants = applicantsRes?.rows || [];

    const { mutateAsync: sendMail, isPending: sendingMail } = useApiMutation<any, any>('post', '/admin/mail');
    const { mutateAsync: createNominations, isPending: creatingNoms } = useApiMutation<any, any>('post', '/admin/applications/:id/nominations');
    const { data: appsRes } = useApiQuery<any>(
        ['admin', 'applications', selectedApplicant],
        `/admin/applications?userId=${selectedApplicant}&limit=1`,
        { enabled: !!selectedApplicant }
    );
    const appId = appsRes?.rows?.[0]?.id;

    const sending = sendingMail || creatingNoms;
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSendNomination = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedApplicant || options.length === 0) return;
        
        setError(null);
        setSuccess(false);

        const applicant = applicants.find((a: any) => a.id.toString() === selectedApplicant);
        if (!applicant) return;

        if (!appId) {
            setError("Candidate does not have an active application.");
            return;
        }

        // Generate PDF
        try {
            const { jsPDF } = await import('jspdf');
            const autoTable = (await import('jspdf-autotable')).default;

            const doc = new jsPDF();
            
            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.text('BLUE COLLAR RECRUITMENT PTY LTD', 14, 20);
            
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text('Document Ref: BCR-FIFO-2026-NOM-V2', 14, 26);
            
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text('OFFICIAL NOTICE OF NOMINATION & TRADE SELECTION', 14, 40);
            
            doc.setFontSize(12);
            doc.setFont('helvetica', 'normal');
            doc.text(`Candidate Name: ${applicant.fullName}`, 14, 50);
            doc.text(`Date of Instrument: ${new Date().toLocaleDateString()}`, 14, 56);
            doc.text(`Status: Partial Ticket Sponsorship Pending Trade Alignment`, 14, 62);
            
            const introText = `In accordance with your execution of the FIFO Candidate Agreement, Blue Collar Recruitment Pty Limited has advanced your structural profile to our principal mining resource partners in Western Australia. We have secured ${options.length} active vacancy nomination quotas mapped to specific tier-1 operations out of Perth. Per your instructions, the vacancy total and competitor pools have been updated below.`;
            
            const splitIntro = doc.splitTextToSize(introText, 180);
            doc.text(splitIntro, 14, 72);

            const instructionText = `Please review the available options below, select exactly one (1) interconnected option (Trade Specialisation and hosting Client Enterprise), and return this signed notice within forty-eight (48) hours.`;
            const splitInstruction = doc.splitTextToSize(instructionText, 180);
            doc.text(splitInstruction, 14, 96);

            const tableData = options.map((opt, idx) => [
                `[  ] Option ${idx + 1}`,
                opt.tradeStream,
                opt.hostEmployer,
                opt.vacancies,
                opt.competitors
            ]);

            autoTable(doc, {
                startY: 110,
                head: [['Select', 'Option / Trade Stream', 'Host Employer', 'Total Required Vacancies', 'Competitor Applicants']],
                body: tableData,
                theme: 'grid',
                headStyles: { fillColor: [30, 58, 138] }
            });

            const finalY = (doc as any).lastAutoTable.finalY + 15;
            
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text('CANDIDATE SELECTION AFFIRMATION & DECLARATION', 14, finalY);
            
            doc.setFontSize(10);
            doc.setFont('helvetica', 'italic');
            const declaration1 = `I, ${applicant.fullName}, hereby formally select the option indicated above as my chosen vocational path. I acknowledge that this choice links my upcoming Subclass 482 visa nomination directly to the corresponding host employer and trade stream. I request Blue Collar Recruitment Pty Ltd to lock in this selection and complete my mobilization scheduling accordingly.`;
            doc.text(doc.splitTextToSize(declaration1, 180), 14, finalY + 10);
            
            const declaration2 = `I further acknowledge that in the event the vacancies for my selected option are filled, I am willing to be considered for an alternative trade stream for which I am qualified, given the current applicant-to-vacancy ratio.`;
            doc.text(doc.splitTextToSize(declaration2, 180), 14, finalY + 30);

            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text('For the Company:', 14, finalY + 50);
            doc.text('Troy Latuff', 14, finalY + 56);
            doc.text('Chief Executive Officer', 14, finalY + 62);
            doc.text('Blue Collar Recruitment Pty Ltd', 14, finalY + 68);
            doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, finalY + 76);

            doc.text('For the Candidate:', 120, finalY + 50);
            doc.text('_____________________________', 120, finalY + 62);
            doc.text(`${applicant.fullName}`, 120, finalY + 68);
            doc.text('Date: ________________________', 120, finalY + 76);

            const pdfBlob = doc.output('blob');
            const pdfFile = new File([pdfBlob], 'BCR-Nomination-Form.pdf', { type: 'application/pdf' });

            const emailBody = `
                <p>Dear ${applicant.fullName},</p>
                <p>Congratulations! Having passed all initial requirements, you have been officially nominated for upcoming placements.</p>
                <p>Please find attached your Official Notice of Nomination & Trade Selection form. Review the available options, select exactly one (1) interconnected option, and return the signed notice within forty-eight (48) hours by uploading it to your dashboard.</p>
                <p>You must log in to your dashboard to formally upload the signed nomination.</p>
                <p>Yours sincerely,<br />Blue Collar Recruitment.</p>
            `;

            const formData = new FormData();
            formData.append('email', applicant.email);
            formData.append('subject', 'Action Required: Official Notice of Nomination');
            formData.append('message', emailBody);
            formData.append('fromType', 'info');
            formData.append('attachments', pdfFile);

            await sendMail({
                data: formData,
                headers: { 'Content-Type': undefined }
            });

            // Upload generated PDF to Cloudinary
            const uploadedPdfUrl = await uploadFile(pdfFile, 'image');

            // Attach adminDocumentUrl to each option
            const optionsWithDocs = options.map(opt => ({ ...opt, adminDocumentUrl: uploadedPdfUrl }));

            // Save nominations to database
            await createNominations({
                data: { nominations: optionsWithDocs },
                params: { id: appId }
            });
            
            setSuccess(true);
            setSelectedApplicant('');
            setOptions([{ tradeStream: '', hostEmployer: '', vacancies: '', competitors: '' }]);
            setTimeout(() => setSuccess(false), 5000);
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.error || 'Failed to send nomination.');
        }
    };

    return (
        <div className="font-sans">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-blue-900 tracking-tight">Candidate Nominations</h1>
                    <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mt-1">Issue official company nominations to candidates</p>
                </div>
            </div>

            {success && (
                <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-700 text-[11px] font-bold uppercase tracking-widest">
                    Nomination sent successfully!
                </div>
            )}
            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-[11px] font-bold uppercase tracking-widest">
                    {error}
                </div>
            )}

            <div className="max-w-2xl bg-white p-8 rounded-2xl border border-blue-100 shadow-sm space-y-6">
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
                                                const newOpts = [...options];
                                                newOpts[idx].tradeStream = e.target.value;
                                                setOptions(newOpts);
                                            }}
                                            required
                                            placeholder="e.g. Mechanical Trades Assistant"
                                            className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg text-sm font-medium focus:bg-white outline-none focus:ring-2 focus:ring-blue-900/5 transition-all text-blue-900"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-bold text-blue-400 uppercase tracking-widest px-1">Host Employer</label>
                                        <input
                                            type="text"
                                            value={opt.hostEmployer}
                                            onChange={(e) => {
                                                const newOpts = [...options];
                                                newOpts[idx].hostEmployer = e.target.value;
                                                setOptions(newOpts);
                                            }}
                                            required
                                            placeholder="e.g. BHP Iron Ore"
                                            className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg text-sm font-medium focus:bg-white outline-none focus:ring-2 focus:ring-blue-900/5 transition-all text-blue-900"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-bold text-blue-400 uppercase tracking-widest px-1">Total Vacancies</label>
                                        <input
                                            type="text"
                                            value={opt.vacancies}
                                            onChange={(e) => {
                                                const newOpts = [...options];
                                                newOpts[idx].vacancies = e.target.value;
                                                setOptions(newOpts);
                                            }}
                                            required
                                            placeholder="e.g. 3 Positions"
                                            className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg text-sm font-medium focus:bg-white outline-none focus:ring-2 focus:ring-blue-900/5 transition-all text-blue-900"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-bold text-blue-400 uppercase tracking-widest px-1">Competitor Applicants</label>
                                        <input
                                            type="text"
                                            value={opt.competitors}
                                            onChange={(e) => {
                                                const newOpts = [...options];
                                                newOpts[idx].competitors = e.target.value;
                                                setOptions(newOpts);
                                            }}
                                            required
                                            placeholder="e.g. 8 Applicants"
                                            className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg text-sm font-medium focus:bg-white outline-none focus:ring-2 focus:ring-blue-900/5 transition-all text-blue-900"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="pt-4 flex justify-end">
                        <button
                            type="submit"
                            disabled={sending || isLoading}
                            className="bg-blue-900 text-white px-8 py-3 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-blue-800 transition-all shadow-lg shadow-blue-900/10 disabled:opacity-50"
                        >
                            {sending ? 'Dispatching...' : 'Issue Nomination'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
