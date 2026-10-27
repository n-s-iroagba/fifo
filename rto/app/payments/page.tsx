'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CreditCard, CheckCircle2, Tag, ShieldCheck } from 'lucide-react';
import { apiClient } from '@/lib/axios';
import { PageShell } from '@/components/PageShell';

export default function PaymentsPage() {
    const router = useRouter();
    const [receipts, setReceipts] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const token = typeof window !== 'undefined' ? (localStorage.getItem('lms_token') || localStorage.getItem('accessToken')) : null;
        const user = typeof window !== 'undefined' ? localStorage.getItem('lms_user') : null;
        if (!token && !user) {
            router.push('/login?redirect=/payments');
            return;
        }

        apiClient.get('/payments/me')
            .then(res => { if (res.data?.data) setReceipts(res.data.data); })
            .catch(() => setReceipts([]))
            .finally(() => setLoading(false));
    }, [router]);

    return (
        <PageShell>
            <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ED9139]/10 text-[#ED9139] font-bold text-xs uppercase tracking-wider w-fit mb-2">
                        <ShieldCheck className="h-3.5 w-3.5" /> Official Invoicing Records
                    </div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Payment &amp; Receipt History</h1>
                    <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1 max-w-2xl">
                        Review payment receipts, verified transaction references, and sponsor subsidies applied to your training modules.
                    </p>
                </div>
                <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
                    <button
                        type="button"
                        onClick={() => router.push('/payments/crypto')}
                        className="py-2.5 px-4 bg-[#EAA240] hover:bg-[#d89130] text-[#000000] font-black rounded-xl text-xs uppercase tracking-wider transition-all shadow-xs"
                    >
                        Crypto Checkout
                    </button>
                    <button
                        type="button"
                        onClick={() => router.push('/payments/card')}
                        className="py-2.5 px-4 bg-[#000000] hover:bg-slate-900 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-xs"
                    >
                        Card Gateway
                    </button>
                </div>
            </div>
            <div className="w-full h-0.5 bg-[#ED9139] mb-8" />

            {loading && (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-[#ED9139]" />
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest animate-pulse">
                        Loading financial records...
                    </p>
                </div>
            )}

            {!loading && receipts.length === 0 && (
                <div className="bg-white border border-slate-200 rounded-2xl p-12 shadow-sm text-center max-w-lg mx-auto">
                    <CreditCard className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">No payment records found.</p>
                    <p className="text-xs text-slate-400 mt-1">
                        Course transaction receipts will appear here once an invoice payment is verified.
                    </p>
                </div>
            )}

            {!loading && receipts.length > 0 && (
                <div className="space-y-4">
                    {receipts.map((rec) => (
                        <div
                            key={rec.id}
                            className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center md:justify-between gap-5"
                        >
                            <div className="space-y-2.5">
                                <div className="flex items-center gap-2.5 flex-wrap">
                                    <span className="font-mono text-xs font-bold text-[#0f172a] bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200">
                                        RECEIPT #{rec.id}
                                    </span>
                                    <span className="text-xs text-slate-500 font-mono">{rec.date}</span>
                                </div>
                                <ul className="text-xs sm:text-sm font-bold text-slate-900 space-y-1">
                                    {rec.courses?.map((c: string, i: number) => (
                                        <li key={i} className="flex items-center gap-1.5">
                                            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />{c}
                                        </li>
                                    ))}
                                </ul>
                                {rec.subsidiesCovered > 0 && (
                                    <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
                                        <Tag className="h-3.5 w-3.5 text-amber-700" />
                                        Employer Subsidy Applied: −${rec.subsidiesCovered?.toFixed(2)} AUD
                                    </div>
                                )}
                            </div>
                            <div className="shrink-0 text-right md:border-l md:border-slate-200 md:pl-6">
                                <span className="text-[10px] uppercase font-bold text-slate-400 block">Net Learner Paid</span>
                                <p className="text-2xl font-black text-slate-900">${rec.amountPaid?.toFixed(2)}</p>
                                <span className="text-xs font-bold text-emerald-700">AUD Verified</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </PageShell>
    );
}
