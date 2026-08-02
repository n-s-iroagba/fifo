'use client';

import React, { useState } from 'react';
import api from '@/lib/api';

export function LmsAccessPanel({ applicantId }: { applicantId: string }) {
    const [generating, setGenerating] = useState(false);
    const [credentials, setCredentials] = useState<{ username?: string; password?: string } | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleGenerateCredentials = async () => {
        setGenerating(true);
        setError(null);
        try {
            const res = await api.post('/lms-auth/generate-credentials', { applicantId: String(applicantId) });
            setCredentials(res.data?.data || res.data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to generate LMS credentials.');
        } finally {
            setGenerating(false);
        }
    };

    return (
        <div className="bg-white p-8 rounded-[2.5rem] border border-blue-100 shadow-2xl shadow-blue-900/5 space-y-4">
            <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-blue-900">school</span>
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-900">Aveling LMS Access</h3>
            </div>
            <p className="text-[11px] text-slate-500">
                Generate or manage LMS credentials for training portal access and exam completion.
            </p>

            {credentials && (
                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl space-y-2 text-xs">
                    <p className="font-bold text-emerald-800">LMS Credentials Generated:</p>
                    <p className="font-mono text-emerald-950">Username: {credentials.username}</p>
                    {credentials.password && <p className="font-mono text-emerald-950">Password: {credentials.password}</p>}
                </div>
            )}

            {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-xs font-bold text-red-600">
                    {error}
                </div>
            )}

            <button
                onClick={handleGenerateCredentials}
                disabled={generating}
                className="w-full bg-blue-900 hover:bg-blue-800 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-md"
            >
                {generating ? 'Generating Credentials...' : 'Generate / Refresh LMS Credentials'}
            </button>
        </div>
    );
}
