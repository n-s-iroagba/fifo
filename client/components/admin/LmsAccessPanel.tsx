'use client';

import React, { useState } from 'react';
import { useApiQuery } from '@/lib/hooks';
import api from '@/lib/api';

export function LmsAccessPanel({ applicantId }: { applicantId: string }) {
    const { data, isLoading, refetch } = useApiQuery<{ data: { hasLmsAccess: boolean, lmsUsername?: string } }>(
        ['admin', 'lms-credentials', applicantId],
        `/lms-credentials/applicants/${applicantId}`
    );

    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [generatedCredentials, setGeneratedCredentials] = useState<{ lmsUsername: string, temporaryPassword?: string } | null>(null);

    if (isLoading) {
        return <div className="text-[10px] font-bold uppercase tracking-widest text-blue-400">Loading LMS Status...</div>;
    }

    const hasAccess = data?.data?.hasLmsAccess;

    const handleGenerate = async () => {
        setIsGenerating(true);
        setError('');
        setSuccessMsg('');
        setGeneratedCredentials(null);

        try {
            const res = await api.post('/lms-credentials/generate', { applicantId });
            if (res.data?.success) {
                setSuccessMsg('LMS credentials generated successfully.');
                setGeneratedCredentials(res.data.data);
                refetch();
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to generate credentials.');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="bg-white p-10 rounded-[2.5rem] border border-blue-100 shadow-2xl shadow-blue-900/5 mt-8">
            <div className="flex items-center gap-4 mb-10 pb-4 border-b border-blue-50">
                <span className="material-symbols-outlined text-blue-900">school</span>
                <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-900">LMS Access Management</h2>
            </div>

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-400">Access Status</p>
                        <p className="text-sm font-bold text-blue-900 mt-1">
                            {hasAccess ? (
                                <span className="text-emerald-600 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-sm">check_circle</span>
                                    Access Granted
                                </span>
                            ) : (
                                <span className="text-gray-500 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-sm">cancel</span>
                                    No Access
                                </span>
                            )}
                        </p>
                    </div>

                    {hasAccess && data?.data?.lmsUsername && (
                        <div className="text-right">
                            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-400">LMS Username</p>
                            <p className="text-sm font-bold text-blue-900 mt-1">{data.data.lmsUsername}</p>
                        </div>
                    )}
                </div>

                {!hasAccess && (
                    <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 mt-6">
                        <p className="text-xs text-blue-800 mb-4 font-medium">
                            Generate separate Aveling LMS credentials for this applicant to access training courses.
                        </p>
                        <button
                            onClick={handleGenerate}
                            disabled={isGenerating}
                            className="bg-blue-900 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-black transition-all shadow-xl shadow-blue-900/20 active:scale-95 disabled:opacity-50 flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined text-base">key</span>
                            {isGenerating ? 'Generating...' : 'Generate LMS Credentials'}
                        </button>
                        
                        {error && (
                            <p className="text-red-500 text-xs mt-3 font-bold">{error}</p>
                        )}
                        {successMsg && (
                            <p className="text-emerald-600 text-xs mt-3 font-bold">{successMsg}</p>
                        )}
                    </div>
                )}

                {generatedCredentials && (
                    <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-200 mt-6 space-y-3">
                        <h3 className="text-xs font-black text-emerald-800 uppercase tracking-widest flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">new_releases</span>
                            New Credentials Created
                        </h3>
                        <p className="text-sm text-emerald-900">Please provide these credentials to the applicant. The password will only be shown once.</p>
                        <div className="bg-white p-4 rounded-xl border border-emerald-100 font-mono text-sm">
                            <p><span className="font-bold text-emerald-700">Username:</span> {generatedCredentials.lmsUsername}</p>
                            {generatedCredentials.temporaryPassword && (
                                <p><span className="font-bold text-emerald-700">Temporary Password:</span> {generatedCredentials.temporaryPassword}</p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
