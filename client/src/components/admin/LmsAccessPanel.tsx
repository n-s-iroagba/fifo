'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

export function LmsAccessPanel({ applicantId, initialUsername, initialPassword, onUpdated }: { applicantId: string; initialUsername?: string | null; initialPassword?: string | null; onUpdated?: () => void }) {
    const [candidateId, setCandidateId] = useState(initialUsername || '');
    const [password, setPassword] = useState(initialPassword || '');
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (initialUsername !== undefined) setCandidateId(initialUsername || '');
        if (initialPassword !== undefined) setPassword(initialPassword || '');
    }, [initialUsername, initialPassword]);

    const handleFetchCredentials = async () => {
        try {
            const res = await api.get(`/lms-credentials/applicants/${applicantId}`);
            if (res.data?.data) {
                setCandidateId(res.data.data.lmsUsername || '');
                setPassword(res.data.data.lmsPassword || '');
            }
        } catch (e) {
            // ignore
        }
    };

    useEffect(() => {
        if (!initialUsername && !initialPassword) {
            handleFetchCredentials();
        }
    }, [applicantId]);

    const handleSaveCredentials = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setSaving(true);
        setMessage(null);
        setError(null);
        try {
            await api.put(`/admin/users/${applicantId}/aveling-credentials`, {
                avelingUsername: candidateId || null,
                avelingPassword: password || null
            });
            setMessage('Aveling candidate credentials saved successfully.');
            setIsEditing(false);
            if (onUpdated) onUpdated();
        } catch (err: any) {
            setError(err.response?.data?.message || err.response?.data?.error || 'Failed to save candidate credentials.');
        } finally {
            setSaving(false);
        }
    };

    const handleGenerateCredentials = async () => {
        setGenerating(true);
        setMessage(null);
        setError(null);
        try {
            const res = await api.post('/lms-credentials/generate', { applicantId: String(applicantId) });
            const data = res.data?.data || res.data;
            if (data?.lmsUsername) {
                setCandidateId(data.lmsUsername);
                setPassword(data.temporaryPassword || data.password || '');
                setMessage('Aveling candidate credentials generated!');
                if (onUpdated) onUpdated();
            }
        } catch (err: any) {
            setError(err.response?.data?.message || err.response?.data?.error || 'Failed to generate LMS credentials.');
        } finally {
            setGenerating(false);
        }
    };

    const handleClearCredentials = async () => {
        if (!confirm('Are you sure you want to clear Aveling credentials for this candidate?')) return;
        setSaving(true);
        setMessage(null);
        setError(null);
        try {
            await api.put(`/admin/users/${applicantId}/aveling-credentials`, {
                avelingUsername: null,
                avelingPassword: null
            });
            setCandidateId('');
            setPassword('');
            setMessage('Aveling credentials cleared.');
            setIsEditing(false);
            if (onUpdated) onUpdated();
        } catch (err: any) {
            setError(err.response?.data?.message || err.response?.data?.error || 'Failed to clear credentials.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="bg-white p-8 rounded-[2.5rem] border border-blue-100 shadow-2xl shadow-blue-900/5 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-blue-50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-blue-900 flex items-center justify-center text-white shadow-lg shadow-blue-900/10">
                        <span className="material-symbols-outlined text-lg">school</span>
                    </div>
                    <div>
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-blue-900">Aveling Candidate Credentials</h3>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">LMS Portal Access & Verification</p>
                    </div>
                </div>
                {!isEditing && (
                    <button
                        type="button"
                        onClick={() => setIsEditing(true)}
                        className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-900 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all"
                    >
                        Edit Credentials
                    </button>
                )}
            </div>

            {message && (
                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-xs font-bold text-emerald-800 flex items-center gap-2">
                    <span className="material-symbols-outlined text-base">check_circle</span>
                    {message}
                </div>
            )}

            {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-xs font-bold text-red-600 flex items-center gap-2">
                    <span className="material-symbols-outlined text-base">error</span>
                    {error}
                </div>
            )}

            {!isEditing ? (
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                            <span className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Candidate ID / Username</span>
                            <span className="font-mono text-xs font-bold text-blue-950 block select-all">
                                {candidateId || <span className="text-slate-400 italic">Not set</span>}
                            </span>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                            <span className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Password</span>
                            <span className="font-mono text-xs font-bold text-blue-950 block select-all">
                                {password || <span className="text-slate-400 italic">Not set</span>}
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        <button
                            type="button"
                            onClick={handleGenerateCredentials}
                            disabled={generating}
                            className="flex-1 bg-blue-900 hover:bg-blue-800 disabled:opacity-50 text-white py-3 px-4 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined text-sm">autorenew</span>
                            {generating ? 'Generating...' : 'Auto-Generate Credentials'}
                        </button>
                        {(candidateId || password) && (
                            <button
                                type="button"
                                onClick={handleClearCredentials}
                                disabled={saving}
                                className="bg-red-50 hover:bg-red-100 text-red-600 py-3 px-4 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border border-red-100 flex items-center justify-center gap-1.5"
                            >
                                <span className="material-symbols-outlined text-sm">delete</span>
                                Clear Credentials
                            </button>
                        )}
                    </div>
                </div>
            ) : (
                <form onSubmit={handleSaveCredentials} className="space-y-4">
                    <div>
                        <label className="block text-[9px] font-black uppercase tracking-widest text-blue-900 mb-1.5">
                            Aveling Candidate ID / Username
                        </label>
                        <input
                            type="text"
                            value={candidateId}
                            onChange={(e) => setCandidateId(e.target.value)}
                            placeholder="e.g. AV10293 or Aveling-JOH1092"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-blue-950 focus:outline-none focus:ring-2 focus:ring-blue-900"
                        />
                    </div>
                    <div>
                        <label className="block text-[9px] font-black uppercase tracking-widest text-blue-900 mb-1.5">
                            Password
                        </label>
                        <input
                            type="text"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter password"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-blue-950 focus:outline-none focus:ring-2 focus:ring-blue-900"
                        />
                    </div>

                    <div className="flex gap-2 pt-2">
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 py-3 bg-blue-900 text-white text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-black transition-all shadow-md disabled:opacity-50"
                        >
                            {saving ? 'Saving...' : 'Save Credentials'}
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsEditing(false)}
                            className="flex-1 py-3 bg-white text-slate-500 border border-slate-200 text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-50 transition-all"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}
