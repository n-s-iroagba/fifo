'use client';

import React from 'react';
import { useApiQuery } from '@/lib/hooks';
import Link from 'next/link';

export function AvelingInvoicesPanel({ applicantId }: { applicantId: string }) {
    const { data: response, isLoading } = useApiQuery<any>(
        ['admin', 'applicants', applicantId, 'aveling-invoices'],
        `/admin/users/${applicantId}/aveling-invoices`
    );

    const invoices = response?.data || [];

    return (
        <div className="bg-white p-10 rounded-[2.5rem] border border-blue-100 shadow-2xl shadow-blue-900/5 mt-8">
            <div className="flex items-center gap-4 mb-10 pb-4 border-b border-blue-50">
                <span className="material-symbols-outlined text-amber-500">receipt_long</span>
                <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-900">Aveling Payment Invoices</h2>
            </div>

            {isLoading ? (
                <div className="p-12 text-center text-[10px] font-bold uppercase tracking-widest text-blue-400">Loading Invoices...</div>
            ) : invoices.length === 0 ? (
                <div className="p-12 text-center bg-blue-50 rounded-3xl">
                    <p className="text-[9px] font-black uppercase tracking-widest text-blue-400">No Aveling payment records found.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {invoices.map((inv: any) => (
                        <div key={inv.id} className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-blue-50/50 rounded-2xl border border-blue-100 gap-4">
                            <div>
                                <span className="font-mono text-[10px] font-black bg-blue-100 text-blue-900 px-2 py-1 rounded">
                                    {inv.id}
                                </span>
                                <div className="mt-2 text-xs font-bold text-blue-900">
                                    {inv.courses?.join(', ')}
                                </div>
                                <div className="mt-1 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                                    Date: {inv.date}
                                </div>
                            </div>
                            <div className="flex flex-col md:items-end gap-3">
                                <div className="text-right">
                                    <div className="text-[9px] uppercase font-black tracking-widest text-slate-500">Learner Paid</div>
                                    <div className="text-lg font-black text-emerald-600">${inv.amountPaid?.toFixed(2)}</div>
                                </div>
                                <Link
                                    href={`/admin/applicants/${applicantId}/invoice/${inv.id}`}
                                    className="bg-white border border-blue-200 text-blue-900 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-900 hover:text-white transition-all shadow-sm"
                                >
                                    Generate / Print
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
