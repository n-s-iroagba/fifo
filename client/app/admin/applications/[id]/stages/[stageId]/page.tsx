'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useApiQuery } from '@/lib/hooks';
import NextLink from 'next/link';

export default function ApplicationStageDetailPage() {
    const params = useParams();
    const id = params?.id;
    const stageId = params?.stageId;

    const { data: stage, isLoading, error } = useApiQuery<any>(
        ['admin', 'applications', `${id}`, 'stages', `${stageId}`],
        `/admin/applications/${id}/stages/${stageId}`,
        { enabled: !!stageId }
    );

    if (isLoading) return <div className="p-12 text-center text-[10px] font-bold uppercase tracking-widest text-blue-400">Loading Stage Details...</div>;
    if (error) return <div className="p-12 text-center text-red-600 text-[10px] font-bold uppercase tracking-widest">Error Loading Stage</div>;

    return (
        <div className="flex flex-col min-h-screen bg-white font-sans text-blue-900">
            <header className="h-20 px-8 bg-white border-b border-blue-100 flex items-center justify-between sticky top-0 z-40">
                <div className="flex items-center gap-6">
                    <NextLink href={`/admin/applications/${id}`} className="p-2 text-blue-400 hover:text-blue-900 transition-colors">
                        <span className="material-symbols-outlined text-xl">arrow_back</span>
                    </NextLink>
                    <div>
                        <span className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.2em] block mb-1">Application Pipeline</span>
                        <h1 className="text-xl font-bold text-blue-900 tracking-tight">Stage Details</h1>
                    </div>
                </div>
                <NextLink
                    href={`/admin/applications/${id}/stages/${stageId}/edit`}
                    className="bg-blue-900 text-white px-6 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all hover:bg-blue-800 shadow-lg shadow-blue-900/10"
                >
                    Edit Stage
                </NextLink>
            </header>

            <main className="p-8 md:p-12 max-w-3xl mx-auto w-full">
                <div className="grid grid-cols-1 gap-12">
                    <section className="space-y-8">
                        <div>
                            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.3em] block mb-4">Core Metadata</span>
                            <div className="bg-blue-50 p-8 rounded-2xl border border-blue-100 space-y-6">
                                <div>
                                    <label className="text-[10px] font-bold text-blue-400 uppercase tracking-widest block mb-2 px-1">Stage Name</label>
                                    <h3 className="text-2xl font-bold text-blue-900 px-1 uppercase tracking-tight">{stage.name}</h3>
                                </div>
                                <div className="pt-6 border-t border-blue-200/60">
                                    <label className="text-[10px] font-bold text-blue-400 uppercase tracking-widest block mb-3 px-1">Description / Internal Goal</label>
                                    <p className="text-sm font-medium text-blue-600 leading-relaxed px-1">
                                        {stage.description}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <label className="text-[10px] font-bold text-blue-400 uppercase tracking-widest block mb-4 px-1">Workflow Logic</label>
                                <div className="space-y-4">
                                    <div className="p-5 bg-white border border-blue-100 rounded-xl flex items-center justify-between shadow-sm">
                                        <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Sequence Order</span>
                                        <span className="text-sm font-bold text-blue-900">Index {stage.orderPosition}</span>
                                    </div>
                                    <div className="p-5 bg-white border border-blue-100 rounded-xl flex items-center justify-between shadow-sm">
                                        <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Deadline</span>
                                        <span className="text-sm font-bold text-blue-900">{stage.deadlineDays ? `${stage.deadlineDays} Days` : 'Indefinite'}</span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-bold text-blue-400 uppercase tracking-widest block mb-4 px-1">Notifications</label>
                                <div className="space-y-4">
                                    <div className={`p-5 rounded-xl border flex items-center justify-between ${stage.notifyEmail ? 'bg-emerald-50 border-emerald-100' : 'bg-blue-50 border-blue-100'}`}>
                                        <span className={`text-[10px] font-bold uppercase tracking-widest ${stage.notifyEmail ? 'text-emerald-700' : 'text-blue-400'}`}>Email Alerts</span>
                                        <span className="material-symbols-outlined text-lg">{stage.notifyEmail ? 'check_circle' : 'cancel'}</span>
                                    </div>
                                    <div className={`p-5 rounded-xl border flex items-center justify-between ${stage.notifyPush ? 'bg-emerald-50 border-emerald-100' : 'bg-blue-50 border-blue-100'}`}>
                                        <span className={`text-[10px] font-bold uppercase tracking-widest ${stage.notifyPush ? 'text-emerald-700' : 'text-blue-400'}`}>Push Notifications</span>
                                        <span className="material-symbols-outlined text-lg">{stage.notifyPush ? 'check_circle' : 'cancel'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {stage.requiresPayment && (
                            <div>
                                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.3em] block mb-4 px-1">Financial Requirements</span>
                                <div className="bg-blue-900 text-white p-8 rounded-2xl shadow-xl flex items-center justify-between overflow-hidden relative">
                                    <div className="relative z-10">
                                        <p className="text-[10px] text-blue-400 font-bold uppercase tracking-[0.2em] mb-2">Requirement Active</p>
                                        <p className="text-3xl font-bold tracking-tight">{stage.amount?.toLocaleString()} <span className="text-sm font-medium text-blue-400">{stage.currency}</span></p>
                                    </div>
                                    <span className="material-symbols-outlined text-6xl text-white/5 absolute -right-2 top-1/2 -translate-y-1/2">payments</span>
                                </div>
                            </div>
                        )}
                    </section>
                </div>
            </main>
        </div>
    );
}
