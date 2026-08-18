'use client';

import React, { useState } from 'react';
import { useApiQuery, useApiMutation } from '@/lib/hooks';
import Link from 'next/link';

export default function NominationsPage() {
    const [selectedApplicant, setSelectedApplicant] = useState('');
    const [totalApplicants, setTotalApplicants] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [requiredApplicants, setRequiredApplicants] = useState('');
    
    // Fetch applicants
    const { data: applicantsRes, isLoading } = useApiQuery<any>(
        ['admin', 'applicants'],
        '/admin/users?role=applicant&limit=100'
    );
    const applicants = applicantsRes?.rows || [];

    const { mutateAsync: sendMail, isPending: sending } = useApiMutation<any, any>('post', '/admin/mail');
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSendNomination = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedApplicant || !companyName || !requiredApplicants) return;
        
        setError(null);
        setSuccess(false);

        const applicant = applicants.find((a: any) => a.id.toString() === selectedApplicant);
        if (!applicant) return;

        const emailBody = `
            <p>Dear ${applicant.fullName},</p>
            <p>Congratulations! Having passed all initial requirements, you have been officially nominated to <strong>${companyName}</strong>.</p>
            <p><strong>Nomination Details:</strong><br/>
            Target Company: ${companyName}<br/>
            Required Applicants: ${requiredApplicants}<br/>
            Total Applicants Pool: ${totalApplicants || 'N/A'}</p>
            <p>You must now log in to your dashboard to formally <strong>Accept</strong> or <strong>Decline</strong> this nomination. If accepted, we will proceed to draft your binding contract.</p>
            <p>Yours sincerely,<br />Blue Collar Recruitment.</p>
        `;

        try {
            const formData = new FormData();
            formData.append('email', applicant.email);
            formData.append('subject', 'Congratulations: Notification of Company Nomination');
            formData.append('message', emailBody);
            formData.append('fromType', 'info');

            await sendMail({
                data: formData,
                headers: { 'Content-Type': undefined }
            });
            
            setSuccess(true);
            setSelectedApplicant('');
            setTotalApplicants('');
            setCompanyName('');
            setRequiredApplicants('');
            setTimeout(() => setSuccess(false), 5000);
        } catch (err: any) {
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

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-blue-400 uppercase tracking-widest px-1">Target Company Name</label>
                        <input
                            type="text"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            required
                            placeholder="e.g. BHP Billiton"
                            className="w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg text-sm font-medium focus:bg-white outline-none focus:ring-2 focus:ring-blue-900/5 transition-all text-blue-900"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-blue-400 uppercase tracking-widest px-1">Required Applicants</label>
                            <input
                                type="number"
                                value={requiredApplicants}
                                onChange={(e) => setRequiredApplicants(e.target.value)}
                                required
                                placeholder="Number required by company"
                                className="w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg text-sm font-medium focus:bg-white outline-none focus:ring-2 focus:ring-blue-900/5 transition-all text-blue-900"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-blue-400 uppercase tracking-widest px-1">Total Applicants Pool</label>
                            <input
                                type="number"
                                value={totalApplicants}
                                onChange={(e) => setTotalApplicants(e.target.value)}
                                placeholder="Optional: Total pool size"
                                className="w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg text-sm font-medium focus:bg-white outline-none focus:ring-2 focus:ring-blue-900/5 transition-all text-blue-900"
                            />
                        </div>
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
