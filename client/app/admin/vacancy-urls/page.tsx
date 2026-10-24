'use client';

import React, { useState } from 'react';
import { useApiQuery, useApiMutation } from '@/lib/hooks';

interface JoblistingEmployerItem {
    id: number;
    employerId: number;
    joblistingId: number;
    vacancyUrl: string | null;
    createdAt?: string;
    updatedAt?: string;
    employer?: {
        id: number;
        name: string;
        websiteUrl: string;
        isEmploying: boolean;
    };
    joblisting?: {
        id: number;
        title: string;
        slug: string;
    };
}

export default function VacancyUrlsAdminPage() {
    const { data: items, isLoading, refetch } = useApiQuery<JoblistingEmployerItem[]>(
        ['admin', 'joblisting-employers'],
        '/admin/joblisting-employers'
    );

    const [editingId, setEditingId] = useState<number | null>(null);
    const [tempUrl, setTempUrl] = useState('');
    const [savingId, setSavingId] = useState<number | null>(null);
    const [feedback, setFeedback] = useState<string | null>(null);

    const updateMutation = useApiMutation('put', '/admin/joblisting-employers', {
        onSuccess: () => {
            refetch();
            setEditingId(null);
            setSavingId(null);
            setFeedback('Vacancy URL updated successfully.');
            setTimeout(() => setFeedback(null), 3000);
        },
        onError: (err: any) => {
            setSavingId(null);
            alert(err.response?.data?.message || 'Failed to update vacancy URL');
        }
    });

    const startEditing = (item: JoblistingEmployerItem) => {
        setEditingId(item.id);
        setTempUrl(item.vacancyUrl || '');
    };

    const cancelEditing = () => {
        setEditingId(null);
        setTempUrl('');
    };

    const handleSave = async (id: number) => {
        setSavingId(id);
        await updateMutation.mutateAsync({
            data: { vacancyUrl: tempUrl.trim() || null },
            params: { id }
        });
    };

    const rows = items || [];

    return (
        <div className="font-sans">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-blue-900 tracking-tight">Employer Vacancy URLs</h1>
                    <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mt-1">
                        Map active vacancies for each Job Listing and Employer combination
                    </p>
                </div>
            </div>

            {feedback && (
                <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">check_circle</span>
                    {feedback}
                </div>
            )}

            {isLoading ? (
                <div className="p-12 text-center text-[10px] font-bold uppercase tracking-widest text-blue-400">
                    Loading Vacancy URLs...
                </div>
            ) : rows.length === 0 ? (
                <div className="bg-white rounded-2xl border border-blue-100 p-12 text-center">
                    <p className="text-sm font-medium text-slate-500 mb-2">No job listing employer links found.</p>
                    <p className="text-xs text-slate-400">Assign employers to job listings when creating or editing jobs.</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-blue-100 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-blue-50 border-b border-blue-100">
                                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-blue-400">Job Title</th>
                                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-blue-400">Hiring Employer</th>
                                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-blue-400">Official Vacancy Link</th>
                                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-blue-400 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-blue-50">
                                {rows.map((row) => {
                                    const isEditing = editingId === row.id;
                                    const isSaving = savingId === row.id;

                                    return (
                                        <tr key={row.id} className="hover:bg-blue-50/50 transition-colors">
                                            <td className="px-6 py-5">
                                                <div className="font-semibold text-sm text-blue-900">
                                                    {row.joblisting?.title || `Job #${row.joblistingId}`}
                                                </div>
                                                <div className="text-[10px] text-slate-400 font-mono">
                                                    ID: {row.joblistingId}
                                                </div>
                                            </td>

                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-xs text-blue-900">
                                                        {row.employer?.name || `Employer #${row.employerId}`}
                                                    </span>
                                                    {row.employer?.isEmploying && (
                                                        <span className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase bg-amber-100 text-amber-800">
                                                            Employing
                                                        </span>
                                                    )}
                                                </div>
                                                {row.employer?.websiteUrl && (
                                                    <a
                                                        href={row.employer.websiteUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-[10px] text-blue-500 hover:underline inline-flex items-center gap-0.5"
                                                    >
                                                        {row.employer.websiteUrl}
                                                        <span className="material-symbols-outlined text-[10px]">open_in_new</span>
                                                    </a>
                                                )}
                                            </td>

                                            <td className="px-6 py-5">
                                                {isEditing ? (
                                                    <div className="flex items-center gap-2 max-w-md">
                                                        <input
                                                            type="url"
                                                            value={tempUrl}
                                                            onChange={(e) => setTempUrl(e.target.value)}
                                                            placeholder="https://company.com/careers/job-123"
                                                            className="w-full px-3 py-1.5 text-xs rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-900/10"
                                                        />
                                                    </div>
                                                ) : row.vacancyUrl ? (
                                                    <a
                                                        href={row.vacancyUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-mono max-w-sm truncate"
                                                    >
                                                        {row.vacancyUrl}
                                                        <span className="material-symbols-outlined text-xs">open_in_new</span>
                                                    </a>
                                                ) : (
                                                    <span className="text-xs text-slate-400 italic">No direct vacancy URL configured</span>
                                                )}
                                            </td>

                                            <td className="px-6 py-5 text-right">
                                                {isEditing ? (
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => handleSave(row.id)}
                                                            disabled={isSaving}
                                                            className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-emerald-700 disabled:opacity-50"
                                                        >
                                                            {isSaving ? 'Saving...' : 'Save'}
                                                        </button>
                                                        <button
                                                            onClick={cancelEditing}
                                                            className="text-slate-400 hover:text-slate-600 px-2 py-1 text-[10px] font-bold uppercase tracking-wider"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => startEditing(row)}
                                                        className="text-[10px] font-bold text-blue-600 uppercase tracking-widest hover:text-blue-900"
                                                    >
                                                        {row.vacancyUrl ? 'Edit URL' : '+ Add URL'}
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
