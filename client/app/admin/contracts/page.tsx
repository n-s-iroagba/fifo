'use client';

import React, { useState } from 'react';
import { useApiQuery, useApiMutation } from '@/lib/hooks';
import { uploadFile } from '@/lib/utils';

export default function ContractsPage() {
    const [selectedApplicant, setSelectedApplicant] = useState('');
    
    // Fetch applicants
    const { data: applicantsRes, isLoading } = useApiQuery<any>(
        ['admin', 'applicants'],
        '/admin/users?role=applicant&limit=100'
    );
    const applicants = applicantsRes?.rows || [];

    const { data: appsRes } = useApiQuery<any>(
        ['admin', 'applications', selectedApplicant],
        `/admin/applications?userId=${selectedApplicant}&limit=1`,
        { enabled: !!selectedApplicant }
    );
    const appId = appsRes?.rows?.[0]?.id;

    const { data: nominationsRes } = useApiQuery<any>(
        ['admin', 'nominations', appId],
        `/admin/applications/${appId}/nominations`,
        { enabled: !!appId }
    );
    const nominations = nominationsRes || [];
    const selectedNomination = nominations.find((n: any) => n.isSelected) || nominations[0];

    const { data: contracts = [], refetch } = useApiQuery<any[]>(
        ['admin', 'contracts', appId],
        `/admin/applications/${appId}/contracts`,
        { enabled: !!appId }
    );

    const { mutateAsync: sendMail, isPending: sendingMail } = useApiMutation<any, any>('post', '/admin/mail');
    const { mutateAsync: createContract, isPending: creatingContract } = useApiMutation<any, any>('post', `/admin/applications/${appId}/contracts`);
    const isPending = sendingMail || creatingContract;

    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSendContract = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedApplicant) return;
        
        setError(null);
        setSuccess(false);

        const applicant = applicants.find((a: any) => a.id.toString() === selectedApplicant);
        if (!applicant) return;

        if (!selectedNomination) {
            setError("Candidate does not have a selected nomination.");
            return;
        }

        const emailBody = `
            <p>Dear ${applicant.fullName},</p>
            <p>Following your successful application review and nomination acceptance, please find attached your Training and Ticket Acquisition Contract.</p>
            <p>Kindly read the attached contract document carefully, sign where indicated, and reply to this email within the stipulated timeframe to confirm your acceptance of the contract terms.</p>
            <p>We look forward to welcoming you aboard!</p>
            <p>Yours sincerely,<br>Gary Nexon Fletcher.<br>Hiring Manager.<br>Blue Collar Recruitment.</p>
        `;

        try {
            const { jsPDF } = await import('jspdf');
            const autoTable = (await import('jspdf-autotable')).default;

            const doc = new jsPDF();
            let y = 20;

            const addText = (text: string, size = 10, isBold = false) => {
                doc.setFontSize(size);
                doc.setFont('helvetica', isBold ? 'bold' : 'normal');
                const lines = doc.splitTextToSize(text, 180);
                lines.forEach((line: string) => {
                    if (y > 280) {
                        doc.addPage();
                        y = 20;
                    }
                    doc.text(line, 14, y);
                    y += (size / 10) * 5;
                });
                y += 2;
            };

            addText('Blue Collar Recruitment Pty Limited', 16, true);
            y += 5;
            addText('FIFO EMPLOYMENT TICKETING, TRAINING & VISA SPONSORSHIP CANDIDATE AGREEMENT', 12, true);
            addText('DOCUMENT REF: BCR-FIFO-2026-0810', 10);
            addText('STRICTLY CONFIDENTIAL', 10);
            addText(`DATE OF INSTRUMENT: ${new Date().toLocaleDateString()}`, 10);
            y += 5;

            addText('1. PARTIES', 12, true);
            addText(`This Binding Agreement is made and entered into on this ${new Date().toLocaleDateString()}, by and between:`);
            addText(`THE COMPANY: Blue Collar Recruitment Pty Limited (BC Recruit Pty Ltd), a licensed labor hire, workforce deployment, and recruitment enterprise duly incorporated under the laws of Australia...`);
            addText(`THE CANDIDATE: ${applicant.fullName}, an individual national of ${applicant.country || 'Guinea'}, currently residing within ${applicant.country || 'Guinea'}, holder of International Passport Number: ${applicant.passportNumber || '[____________________]'} (hereinafter referred to as "the Candidate").`);
            addText(`THE TRAINING PARTNER: Aveling (RTO Provider Code: 50503), an accredited Registered Training Organisation registered in the state of Western Australia.`);
            y += 5;

            addText('2. BACKGROUND & RECITALS', 12, true);
            addText(`WHEREAS:`);
            addText(`The Company operates an international recruitment infrastructure specializing in sourcing, certifying, and deploying qualified candidates into domestic Fly-In Fly-Out (FIFO) industrial roles...`);
            addText(`The Candidate has formally applied for structural career placement and requires specific vocational competencies, safety credentials, a verified skills assessment, and a lawful visa pathway...`);
            y += 5;

            addText('3. DEFINITIONS & INTERPRETATION', 12, true);
            addText(`"Nomination Position": The specific, designated employment classification of ${selectedNomination.tradeStream} at ${selectedNomination.hostEmployer} – Fly-In Fly-Out (FIFO), mapped under the Australian and New Zealand Standard Classification of Occupations (ANZSCO) structural codes.`);
            addText(`"Sponsorship Contribution": The explicit fiscal percentage allocation of eligible educational, administrative, and visa application outlays that the Company covenants to absorb or subsidize on behalf of the Candidate.`);
            addText(`"Candidate Wallet": An internal, verifiable corporate digital ledger maintained by the accounting infrastructure of the Company, serving to accurately record valid security deposits advanced by the Candidate alongside corresponding credits or success-based reimbursements accrued.`);
            y += 5;

            addText('4. FISCAL SPONSORSHIP & COMPANY COVENANTS', 12, true);
            addText(`4.1 Vocational Training Subsidy: The Company shall directly fund ninety six percent (96.38%) of the total gross commercial fees charged by the Training Partner for the administration and assessment of each individual course block, safety induction, and specialized modules listed under Schedule 1.`);
            addText(`4.2 Visa Charge Apportionment: The Company shall fund hundred percent (100%) of the statutory Visa Application Charge (VAC) applicable to the Subclass 482 visa framework in strict compliance with Regulation 2.87 of the Migration Regulations 1994 (Cth).`);
            y += 5;

            addText('SCHEDULE 1 — ITEMIZED FINANCIAL ARCHITECTURE & APPORTIONMENT BREAKDOWN', 12, true);
            if (y > 200) { doc.addPage(); y = 20; }
            autoTable(doc, {
                startY: y,
                head: [['Cost Item / Description', 'Total (AUD)', 'Company (96.38%)', 'Candidate (3.62%)']],
                body: [
                    ['1. White Card WA (CPCCWHS1001)', 'A$95.00', 'A$61.75', 'A$2.23'],
                    ['2. Working at Heights (RIIWHS204E)', 'A$270.00', 'A$175.50', 'A$6.35'],
                    ['3. Confined Space Entry (RIIWHS202E)', 'A$290.00', 'A$188.50', 'A$6.82'],
                    ['4. Manual Driver\'s Licence (Class C)', 'A$185.50', 'A$0.00', 'A$185.50'],
                    ['5. Standard 11 Mining Induction', 'A$690.00', 'A$448.50', 'A$16.23'],
                    ['6. Provide First Aid & CPR', 'A$160.00', 'A$104.00', 'A$3.76'],
                    ['7. National Police Clearance', 'A$55.00', 'A$0.00', 'A$55.00'],
                    ['8. Subclass 482 Visa (VAC Fee)', 'A$4,015.00', 'A$4,015.00', 'A$94.11'],
                    ['9. TRA Offshore Skills Assessment', 'Statutory', 'A$0.00', '100% Cand.'],
                    ['10. Mobilization Housing (3 Mo.)', 'A$12,000.00', 'A$12,000.00', 'A$0.00'],
                    ['CUMULATIVE MATRIX', 'A$21,110.50', 'A$18,938.00', 'A$370.00']
                ],
                theme: 'grid',
                headStyles: { fillColor: [30, 58, 138] }
            });

            y = (doc as any).lastAutoTable.finalY + 15;
            if (y > 250) { doc.addPage(); y = 20; }
            
            addText('CONTRACTUAL EXECUTION & SIGNATURES', 12, true);
            addText(`IN WITNESS WHEREOF, the Parties hereto have caused this Candidate Agreement to be duly executed by their respective authorized signatures, creating a binding, reciprocal legal instrument effective as of ${new Date().toLocaleDateString()}.`);
            
            y += 10;
            doc.text('For Blue Collar Recruitment Pty Limited:', 14, y);
            doc.text('For the Candidate:', 120, y);
            y += 15;
            doc.text('_____________________________', 14, y);
            doc.text('_____________________________', 120, y);
            y += 6;
            doc.text('Troy Latuff (CEO)', 14, y);
            doc.text(`${applicant.fullName}`, 120, y);
            y += 6;
            doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, y);
            doc.text('Date: ________________________', 120, y);

            const pdfBlob = doc.output('blob');
            const pdfFile = new File([pdfBlob], 'BCR-FIFO-CON-0810.pdf', { type: 'application/pdf' });

            const formData = new FormData();
            formData.append('email', applicant.email);
            formData.append('subject', 'Action Required: Your Training and Ticket Acquisition Contract');
            formData.append('message', emailBody);
            formData.append('fromType', 'info');
            formData.append('attachments', pdfFile);

            await sendMail({
                data: formData,
                headers: { 'Content-Type': undefined }
            });

            // Upload generated PDF to Cloudinary
            const uploadedPdfUrl = await uploadFile(pdfFile, 'image');

            // Create Contract in Database
            await createContract({
                data: {
                    company: selectedNomination.hostEmployer,
                    role: selectedNomination.tradeStream,
                    adminDocumentUrl: uploadedPdfUrl
                }
            });
            
            setSuccess(true);
            setSelectedApplicant('');
            setTimeout(() => setSuccess(false), 5000);
            await refetch();
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.error || 'Failed to dispatch contract.');
        }
    };

    return (
        <div className="font-sans">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-blue-900 tracking-tight">Contract Management</h1>
                    <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mt-1">Issue official binding contracts to candidates</p>
                </div>
            </div>

            {success && (
                <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-700 text-[11px] font-bold uppercase tracking-widest">
                    Contract dispatched successfully!
                </div>
            )}
            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-[11px] font-bold uppercase tracking-widest">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-2xl border border-blue-100 shadow-sm space-y-6">
                    <div>
                        <h2 className="text-sm font-bold text-blue-900 uppercase tracking-widest mb-1">Issue Contract</h2>
                        <p className="text-xs text-blue-500">Draft a new contract for a candidate based on their selected nomination.</p>
                    </div>
                    <form onSubmit={handleSendContract} className="space-y-6">
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

                        {selectedApplicant && selectedNomination && (
                            <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl space-y-2">
                                <h4 className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Selected Nomination</h4>
                                <p className="text-sm font-bold text-blue-900">{selectedNomination.tradeStream}</p>
                                <p className="text-xs text-blue-700">Host Employer: {selectedNomination.hostEmployer}</p>
                            </div>
                        )}
                        
                        {selectedApplicant && !selectedNomination && (
                            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                                <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">No selected nomination found for this candidate.</p>
                            </div>
                        )}

                        <div className="pt-4 flex justify-end">
                            <button
                                type="submit"
                                disabled={isPending || isLoading || !selectedNomination}
                                className="bg-blue-900 text-white px-8 py-3 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-blue-800 transition-all shadow-lg shadow-blue-900/10 disabled:opacity-50"
                            >
                                {isPending ? 'Dispatching...' : 'Dispatch Contract'}
                            </button>
                        </div>
                    </form>
                </div>

                <div className="bg-white p-8 rounded-2xl border border-blue-100 shadow-sm space-y-6">
                    <div>
                        <h2 className="text-sm font-bold text-blue-900 uppercase tracking-widest mb-1">Candidate Contracts</h2>
                        <p className="text-xs text-blue-500">
                            {selectedApplicant ? 'Contracts for the selected candidate.' : 'Select a candidate to view their contracts.'}
                        </p>
                    </div>

                    {!selectedApplicant ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <span className="material-symbols-outlined text-blue-200 text-4xl mb-3">person_search</span>
                            <p className="text-sm text-blue-400 font-medium">Select a candidate to view contracts</p>
                        </div>
                    ) : contracts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <span className="material-symbols-outlined text-blue-200 text-4xl mb-3">description</span>
                            <p className="text-sm text-blue-400 font-medium">No contracts issued yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {contracts.map(contract => (
                                <div key={contract.id} className="p-4 bg-blue-50 border border-blue-100 rounded-xl space-y-3">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-xs font-bold text-blue-900 uppercase tracking-widest">{contract.role}</h3>
                                            <p className="text-xs text-blue-600 font-medium">{contract.company}</p>
                                        </div>
                                        <div className={`px-2 py-1 rounded text-[9px] font-bold uppercase tracking-widest ${
                                            contract.status === 'accepted' ? 'bg-emerald-100 text-emerald-700' :
                                            contract.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                            'bg-amber-100 text-amber-700'
                                        }`}>
                                            {contract.status}
                                        </div>
                                    </div>
                                    {contract.documentUrl && (
                                        <div className="pt-2 border-t border-blue-200 flex justify-between items-center">
                                            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Signed Document</span>
                                            <a href={contract.documentUrl} target="_blank" rel="noreferrer" className="text-[10px] font-bold text-blue-600 hover:underline uppercase tracking-widest flex items-center gap-1">
                                                View <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                                            </a>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
