'use client';

import React from 'react';
import { CreditCard, CheckCircle2, Tag } from 'lucide-react';
import { apiClient } from '@/lib/axios';
import { PageShell } from '../../components/PageShell';

export default function PaymentsPage() {
    const [receipts, setReceipts] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        apiClient.get('/payments/me')
            .then(res => { if (res.data?.data) setReceipts(res.data.data); })
            .catch(() => setReceipts([]))
            .finally(() => setLoading(false));
    }, []);

    return (
        <PageShell>
            <div className="mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFC700] text-black font-extrabold text-xs uppercase tracking-wider w-fit mb-3">
                    <CreditCard className="h-3.5 w-3.5" /> Aveling Payments
                </div>
                <h1 className="text-4xl font-black text-zinc-900 tracking-tight">My Payment Records</h1>
                <p className="text-sm font-medium text-zinc-500 mt-2">View payment records and recruiter subsidies applied to your training fees.</p>
            </div>
            <div className="w-full h-0.5 bg-[#FFC700] mb-10" />

            {loading && (
                <div className="flex flex-col items-center justify-center py-24 space-y-5">
                    <div className="animate-spin rounded-full h-14 w-14 border-4 border-zinc-200 border-t-[#FFC700]" />
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest animate-pulse">Loading payment records...</p>
                </div>
            )}

            {!loading && receipts.length === 0 && (
                <div className="bg-white border-2 border-zinc-200 rounded-2xl p-14 shadow-sm text-center">
                    <CreditCard className="h-12 w-12 text-zinc-300 mx-auto mb-4" />
                    <p className="text-sm font-extrabold text-zinc-400 uppercase tracking-widest">No payment records found.</p>
                    <p className="text-xs text-zinc-400 mt-2">Payment records will appear here once a course payment has been processed.</p>
                </div>
            )}

            {!loading && receipts.length > 0 && (
                <div className="space-y-5">
                    {receipts.map((rec) => (
                        <div key={rec.id} className="bg-white border-2 border-zinc-200 rounded-2xl p-6 shadow-md hover:border-zinc-300 transition-all flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 flex-wrap">
                                    <span className="font-mono text-xs font-extrabold text-black bg-[#FFC700] px-2.5 py-0.5 rounded">{rec.id}</span>
                                    <span className="text-xs text-zinc-400 font-mono">{rec.date}</span>
                                </div>
                                <ul className="text-sm font-bold text-zinc-900 space-y-1">
                                    {rec.courses?.map((c: string, i: number) => (
                                        <li key={i} className="flex items-center gap-2">
                                            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />{c}
                                        </li>
                                    ))}
                                </ul>
                                {rec.subsidiesCovered > 0 && (
                                    <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
                                        <Tag className="h-3.5 w-3.5" />
                                        Recruiter Subsidy Applied: −${rec.subsidiesCovered?.toFixed(2)}
                                    </div>
                                )}
                            </div>
                            <div className="shrink-0 text-right md:border-l md:border-zinc-200 md:pl-6">
                                <span className="text-[10px] uppercase font-bold text-zinc-400 block">Learner Paid</span>
                                <p className="text-3xl font-black text-zinc-900">${rec.amountPaid?.toFixed(2)}</p>
                                <span className="text-xs font-bold text-emerald-600">AUD</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </PageShell>
    );
}
