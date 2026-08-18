'use client';

import React, { useState } from 'react';
import { useApiQuery, useApiMutation } from '@/lib/hooks';

export default function ContractsPage() {
    const [selectedApplicant, setSelectedApplicant] = useState('');
    const [attachments, setAttachments] = useState<File[]>([]);
    
    // Fetch applicants
    const { data: applicantsRes, isLoading } = useApiQuery<any>(
        ['admin', 'applicants'],
        '/admin/users?role=applicant&limit=100'
    );
    const applicants = applicantsRes?.rows || [];

    const { mutateAsync: sendMail, isPending: sending } = useApiMutation<any, any>('post', '/admin/mail');
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSendContract = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedApplicant) return;
        if (attachments.length === 0) {
            setError("Please attach the contract document.");
            return;
        }
        
        setError(null);
        setSuccess(false);

        const applicant = applicants.find((a: any) => a.id.toString() === selectedApplicant);
        if (!applicant) return;

        const emailBody = `
            <p>Dear ${applicant.fullName},</p>
            <p>Following your successful application review and nomination acceptance, please find attached your Training and Ticket Acquisition Contract.</p>
            <p>Kindly read the attached contract document carefully, sign where indicated, and reply to this email within the stipulated timeframe to confirm your acceptance of the contract terms.</p>
            <p>We look forward to welcoming you aboard!</p>
            <p>Yours sincerely,<br>Gary Nexon Fletcher.<br>Hiring Manager.<br>Blue Collar Recruitment.</p>
        `;

        try {
            const formData = new FormData();
            formData.append('email', applicant.email);
            formData.append('subject', 'Action Required: Your Training and Ticket Acquisition Contract');
            formData.append('message', emailBody);
            formData.append('fromType', 'info');

            attachments.forEach(file => {
                formData.append('attachments', file);
            });

            await sendMail({
                data: formData,
                headers: { 'Content-Type': undefined }
            });
            
            setSuccess(true);
            setSelectedApplicant('');
            setAttachments([]);
            setTimeout(() => setSuccess(false), 5000);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to send contract.');
        }
    };

    return (
        <div className="font-sans">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-blue-900 tracking-tight">Contract Dispatch</h1>
                    <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mt-1">Send official binding contracts to candidates</p>
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

            <div className="max-w-2xl bg-white p-8 rounded-2xl border border-blue-100 shadow-sm space-y-6">
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

                    <div className="space-y-3">
                        <label className="text-[10px] font-bold text-blue-400 uppercase tracking-widest px-1 block">Contract Document (PDF/Doc)</label>
                        <div className="flex flex-wrap gap-3">
                            {attachments.map((file, idx) => (
                                <div key={idx} className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-xl">
                                    <span className="material-symbols-outlined text-sm text-blue-900">description</span>
                                    <span className="text-[10px] font-bold text-blue-900 truncate max-w-[150px]">{file.name}</span>
                                    <button
                                        type="button"
                                        onClick={() => setAttachments(prev => prev.filter((_, i) => i !== idx))}
                                        className="ml-1 text-red-500 hover:text-red-700 transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-sm">close</span>
                                    </button>
                                </div>
                            ))}
                            {attachments.length === 0 && (
                                <label className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-blue-100 rounded-xl hover:bg-blue-50 hover:border-blue-300 transition-all cursor-pointer group w-full justify-center">
                                    <input
                                        type="file"
                                        accept=".pdf,.doc,.docx"
                                        className="hidden"
                                        onChange={(e) => {
                                            if (e.target.files) {
                                                setAttachments(Array.from(e.target.files));
                                            }
                                        }}
                                    />
                                    <span className="material-symbols-outlined text-sm text-blue-400 group-hover:text-blue-900">upload_file</span>
                                    <span className="text-[10px] font-bold text-blue-400 group-hover:text-blue-900 uppercase tracking-widest">Upload Contract Document</span>
                                </label>
                            )}
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                        <button
                            type="submit"
                            disabled={sending || isLoading || attachments.length === 0}
                            className="bg-blue-900 text-white px-8 py-3 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-blue-800 transition-all shadow-lg shadow-blue-900/10 disabled:opacity-50"
                        >
                            {sending ? 'Dispatching...' : 'Dispatch Contract'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
