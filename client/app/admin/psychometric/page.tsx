'use client';

import { useApiQuery, useApiMutation } from '@/lib/hooks';
import React, { useState } from 'react';

export default function AdminPsychometricPage() {
    const { data: response, isLoading, refetch } = useApiQuery<any>(['admin', 'psychometric', 'attempts'], '/admin/psychometric/attempts');
    const approveMutation = useApiMutation('post', '/admin/psychometric/attempts/:id/approve');
    const rejectMutation = useApiMutation('post', '/admin/psychometric/attempts/:id/reject');
    const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});

    const toggleRow = (id: number) => {
        setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
    };
    
    const attempts = response?.attempts || [];

    if (isLoading) return <div className="p-12 text-center text-[10px] font-bold uppercase tracking-widest text-blue-400">Loading Assessments...</div>;

    return (
        <div className="font-sans antialiased text-blue-900">
            <div className="mb-12">
                <h1 className="text-3xl font-bold tracking-tight uppercase leading-tight">Psychometric Test Reviews</h1>
                <p className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.3em] mt-2">Review candidate assessment grades and approve test results</p>
            </div>

            <div className="bg-white rounded-[2rem] border border-blue-100 overflow-hidden shadow-2xl shadow-blue-900/5">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-blue-50 border-b border-blue-100">
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">Applicant</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">Module</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">System Grade</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-blue-50">
                            {attempts.map((attempt: any) => {
                                const isApproved = attempt.module === 'module_1' ? attempt.User?.psychometricModule1Passed : attempt.User?.psychometricModule2Passed;
                                
                                return (
                                <React.Fragment key={attempt.id}>
                                <tr className="hover:bg-blue-50/50 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <button onClick={() => toggleRow(attempt.id)} className="p-1 rounded hover:bg-blue-100 text-blue-500">
                                                <span className="material-symbols-outlined text-sm">
                                                    {expandedRows[attempt.id] ? 'expand_less' : 'expand_more'}
                                                </span>
                                            </button>
                                            <div className="w-10 h-10 rounded-xl bg-blue-900 text-white flex items-center justify-center font-black text-xs uppercase shadow-lg shadow-blue-900/10">
                                                {(attempt.User?.fullName || 'U').charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-blue-900 uppercase tracking-tight">{attempt.User?.fullName}</p>
                                                <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">{attempt.User?.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <p className="text-sm font-bold text-blue-900 uppercase tracking-tight">
                                            {attempt.module === 'module_1' ? 'Module 1: Psychometrics' : 'Module 2: Process Literacy'}
                                        </p>
                                        <p className="text-[10px] text-blue-400 font-bold uppercase tracking-[0.2em]">
                                            {new Date(attempt.createdAt).toLocaleDateString()}
                                        </p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2">
                                                <span className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${attempt.passed ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                                                    {attempt.passed ? 'System Passed' : 'System Failed'}
                                                </span>
                                            </div>
                                            <p className="text-[11px] font-bold text-blue-900 uppercase tracking-tight">Score: {Math.round(attempt.score)}%</p>
                                            <p className="text-[9px] font-bold text-red-500 uppercase">Failed: {attempt.failedQuestions?.length || 0} Qs</p>
                                        </div>
                                    </td>

                                    <td className="px-8 py-6 text-right">
                                        {isApproved ? (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-widest">
                                                <span className="material-symbols-outlined text-sm">check_circle</span>
                                                Approved
                                            </span>
                                        ) : (
                                            <div className="flex flex-col sm:flex-row items-center justify-end gap-3">
                                                <button
                                                    onClick={async () => {
                                                        if (confirm('Are you sure you want to approve this test? This will update the candidate profile and override the system grade if they failed.')) {
                                                            try {
                                                                await approveMutation.mutateAsync({ params: { id: attempt.id }, data: {} });
                                                                refetch();
                                                            } catch (err) {
                                                                console.error('Approve failed:', err);
                                                            }
                                                        }
                                                    }}
                                                    className="inline-flex items-center justify-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] hover:bg-emerald-700 transition-all shadow-sm active:scale-95"
                                                >
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={async () => {
                                                        if (confirm('Are you sure you want to reject this test? The candidate will have to retake.')) {
                                                            try {
                                                                await rejectMutation.mutateAsync({ params: { id: attempt.id }, data: {} });
                                                                refetch();
                                                            } catch (err) {
                                                                console.error('Reject failed:', err);
                                                            }
                                                        }
                                                    }}
                                                    className="inline-flex items-center justify-center gap-2 bg-white border border-red-200 text-red-600 px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] hover:bg-red-50 transition-all shadow-sm active:scale-95"
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                                {expandedRows[attempt.id] && (
                                    <tr key={`${attempt.id}-expanded`}>
                                        <td colSpan={4} className="px-8 py-6 bg-slate-50 border-t border-slate-100">
                                            <div className="space-y-4">
                                                <h4 className="text-sm font-black text-blue-900 uppercase">Failed Questions ({attempt.failedQuestions?.length || 0})</h4>
                                                {attempt.failedQuestions && attempt.failedQuestions.length > 0 ? (
                                                    <div className="grid gap-3">
                                                        {attempt.failedQuestions.map((q: any, i: number) => (
                                                            <div key={i} className="bg-white p-4 rounded-xl border border-red-100 shadow-sm">
                                                                <p className="text-xs font-bold text-slate-800 mb-2">{i + 1}. {q.questionText}</p>
                                                                <div className="flex flex-col sm:flex-row sm:gap-6 gap-2">
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="material-symbols-outlined text-[14px] text-red-500">cancel</span>
                                                                        <span className="text-[10px] font-bold text-red-600">Candidate chose: <span className="text-red-700 font-black">{q.selectedOptionText}</span></span>
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="material-symbols-outlined text-[14px] text-emerald-500">check_circle</span>
                                                                        <span className="text-[10px] font-bold text-emerald-600">Correct answer: <span className="text-emerald-700 font-black">{q.correctOptionText}</span></span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-xs text-slate-500">No failed questions recorded for this attempt.</p>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )}
                                </React.Fragment>
                            )})}
                        </tbody>
                    </table>
                </div>
                {attempts.length === 0 && (
                    <div className="py-20 text-center flex flex-col items-center">
                        <span className="material-symbols-outlined text-4xl text-blue-100 mb-4">fact_check</span>
                        <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">No psychometric tests pending review.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
