'use client';

import React, { useState } from 'react';
import { useApiQuery } from '@/lib/hooks';
import api from '@/lib/api';

interface ExamAttempt {
    id: string;
    score: number;
    isPass: boolean;
    attemptNumber: number;
    createdAt: string;
}

export function ExamReviewPanel({ ticketId }: { ticketId: string }) {
    const { data, isLoading, refetch } = useApiQuery<{ data: ExamAttempt[] }>(
        ['admin', 'ticket-exams', ticketId],
        `/admin/tickets/${ticketId}/exams`
    );

    const [isApproving, setIsApproving] = useState(false);
    const [isFailing, setIsFailing] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const attempts = data?.data || [];

    if (isLoading) {
        return <div className="text-[10px] font-bold uppercase tracking-widest text-blue-400">Loading Exam Attempts...</div>;
    }

    const handleAction = async (passed: boolean) => {
        if (!confirm(`Are you sure you want to ${passed ? 'APPROVE' : 'FAIL'} this ticket's exam requirement? This will notify the candidate.`)) return;
        
        passed ? setIsApproving(true) : setIsFailing(true);
        setError('');
        setSuccessMsg('');

        try {
            const res = await api.post(`/admin/tickets/${ticketId}/approve-exam`, { passed });
            if (res.data?.success) {
                setSuccessMsg(`Exam result successfully marked as ${passed ? 'PASSED (Ticket Issued)' : 'FAILED'}.`);
                refetch();
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to update exam outcome.');
        } finally {
            setIsApproving(false);
            setIsFailing(false);
        }
    };

    return (
        <div className="bg-white p-10 rounded-[2.5rem] border border-blue-100 shadow-2xl shadow-blue-900/5 mt-8">
            <div className="flex items-center gap-4 mb-10 pb-4 border-b border-blue-50">
                <span className="material-symbols-outlined text-blue-900">fact_check</span>
                <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-900">Exam Results Review</h2>
            </div>

            <div className="space-y-6">
                {attempts.length === 0 ? (
                    <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl text-center">
                        <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">pending_actions</span>
                        <p className="text-xs text-slate-500 font-medium">No exam attempts recorded yet.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {attempts.map(attempt => (
                            <div key={attempt.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Attempt #{attempt.attemptNumber}</p>
                                    <p className="text-sm font-bold text-blue-900 flex items-center gap-2">
                                        Score: {attempt.score}%
                                        {attempt.isPass ? (
                                            <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-700">Auto-Pass</span>
                                        ) : (
                                            <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest bg-red-100 text-red-700">Auto-Fail</span>
                                        )}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-bold text-slate-500">{new Date(attempt.createdAt).toLocaleString()}</p>
                                </div>
                            </div>
                        ))}

                        <div className="pt-6 border-t border-slate-100">
                            <p className="text-xs text-slate-600 mb-4 font-medium text-center">
                                Review the automated scoring above. You have final authority to issue the ticket (pass) or require a retake (fail).
                            </p>
                            
                            <div className="flex gap-4">
                                <button
                                    onClick={() => handleAction(false)}
                                    disabled={isApproving || isFailing}
                                    className="flex-1 bg-white border border-red-200 hover:border-red-300 hover:bg-red-50 text-red-700 font-bold text-[10px] uppercase tracking-widest py-3.5 rounded-xl transition-all shadow-sm"
                                >
                                    {isFailing ? 'Processing...' : 'Fail & Request Retake'}
                                </button>
                                <button
                                    onClick={() => handleAction(true)}
                                    disabled={isApproving || isFailing}
                                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] uppercase tracking-widest py-3.5 rounded-xl transition-all shadow-xl shadow-emerald-900/20"
                                >
                                    {isApproving ? 'Processing...' : 'Approve & Issue Ticket'}
                                </button>
                            </div>

                            {error && (
                                <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-[10px] font-bold uppercase tracking-widest text-center">{error}</div>
                            )}
                            {successMsg && (
                                <div className="mt-4 p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-700 text-[10px] font-bold uppercase tracking-widest text-center">{successMsg}</div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
