'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useApiQuery } from '@/lib/hooks';
import Link from 'next/link';
import { JobCondition } from '@/types/models';

export default function ConditionViewPage() {
    const params = useParams();
    const id = params?.id;
    const { data: condition, isLoading, error } = useApiQuery<JobCondition>(['admin', 'conditions'], `/admin/conditions/${id}`, {
        enabled: !!id
    });

    if (isLoading) return <div className="p-12 text-center font-black uppercase tracking-widest text-blue-400">Loading Condition Details...</div>;
    if (error) return <div className="p-12 text-center text-red-500 font-black uppercase tracking-widest">Error Loading Record</div>;

    return (
        <div className="flex flex-col min-h-screen bg-blue-50">
            {/* Standard Admin Header */}
            <header className="h-16 px-6 bg-white border-b border-blue-200 flex items-center justify-between sticky top-0 z-40">
                <div className="flex items-center gap-4">
                    <Link href="/admin/conditions" className="p-1.5 text-blue-400 hover:text-blue-900 hover:bg-blue-100 rounded-lg transition-all">
                        <span className="material-symbols-outlined text-lg">arrow_back</span>
                    </Link>
                    <h1 className="text-lg font-bold text-blue-800 tracking-tight">Condition Details</h1>
                </div>

                <div className="flex items-center gap-3">
                    <Link href={`/admin/conditions/${id}/edit`}>
                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all shadow-sm">
                            <span className="material-symbols-outlined text-lg">edit</span>
                            Edit Condition
                        </button>
                    </Link>
                </div>
            </header>

            <main className="p-6 lg:p-10 max-w-6xl mx-auto w-full text-blue-900">
                <div className="mb-8">
                    <nav className="flex items-center gap-1.5 text-[11px] font-bold text-blue-400 uppercase tracking-wider mb-2">
                        <span>Settings</span>
                        <span className="material-symbols-outlined text-xs">chevron_right</span>
                        <span>Conditions</span>
                    </nav>
                    <h2 className="text-2xl font-black text-blue-900 tracking-tight leading-none mb-4">{condition?.name}</h2>
                    <div className="flex gap-2">
                        <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[11px] font-bold uppercase tracking-widest rounded-lg border border-emerald-100 flex items-center gap-1.5 shadow-sm">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            Active
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    <div className="lg:col-span-8 bg-white p-8 rounded-xl border border-blue-200 shadow-sm">
                        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-blue-400 mb-6 pb-4 border-b border-blue-50">
                            <span className="material-symbols-outlined text-lg">description</span>
                            Requirement Details
                        </div>
                        <div className="prose prose-blue max-w-none">
                            <p className="text-sm font-medium text-blue-600 leading-relaxed whitespace-pre-wrap italic opacity-90">
                                {condition?.description || 'Standard requirement configured for operational recruitment.'}
                            </p>
                        </div>
                    </div>


                </div>
            </main>
        </div>
    );
}
