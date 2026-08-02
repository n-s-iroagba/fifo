'use client';

// STEP-016
import React from 'react';
import Link from 'next/link';
import { CreditCard, FileText, Download, Tag, CheckCircle2 } from 'lucide-react';

export default function PaymentsPage() {
    const receipts = [
        {
            id: 'REC-2026-99182',
            date: '2026-08-01',
            courses: ['RIIWHS204E - Work Safely at Heights', 'HLTAID011 - Provide First Aid Refresher'],
            amountPaid: 75.00,
            subsidiesCovered: 355.00,
            status: 'PAID'
        },
        {
            id: 'REC-2025-44102',
            date: '2025-11-10',
            courses: ['MSMWHS217 - Conduct Gas Testing Activities'],
            amountPaid: 220.00,
            subsidiesCovered: 0.00,
            status: 'PAID'
        }
    ];

    return (
        <div className="space-y-6">
            <div className="border-b border-zinc-200 pb-4 dark:border-zinc-800">
                <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
                    <CreditCard className="h-7 w-7 text-amber-600" />
                    My Payment & Invoice Receipts
                </h1>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                    View payment records, recruiter subsidies applied, and official tax invoices.
                </p>
            </div>

            <div className="space-y-4">
                {receipts.map((rec) => (
                    <div key={rec.id} className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <span className="font-mono text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded dark:bg-emerald-950">
                                    {rec.id}
                                </span>
                                <span className="text-xs text-zinc-400 font-mono">{rec.date}</span>
                            </div>

                            <ul className="text-xs font-bold text-zinc-900 dark:text-white space-y-1">
                                {rec.courses.map((c, i) => (
                                    <li key={i} className="flex items-center gap-1.5">
                                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                                        {c}
                                    </li>
                                ))}
                            </ul>

                            {rec.subsidiesCovered > 0 && (
                                <div className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded dark:bg-amber-950 dark:text-amber-300">
                                    <Tag className="h-3 w-3" />
                                    Recruiter Subsidy Applied: -${rec.subsidiesCovered.toFixed(2)}
                                </div>
                            )}
                        </div>

                        <div className="flex items-center justify-between md:justify-end gap-6 pt-4 md:pt-0 border-t md:border-t-0 border-zinc-100 dark:border-zinc-800">
                            <div className="text-right">
                                <span className="text-[10px] uppercase font-bold text-zinc-400">Learner Paid</span>
                                <p className="text-xl font-extrabold text-zinc-900 dark:text-white">${rec.amountPaid.toFixed(2)}</p>
                            </div>

                            <button
                                onClick={() => alert('Downloading official tax invoice PDF')}
                                className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-300 bg-white px-3 py-2 text-xs font-bold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                            >
                                <Download className="h-3.5 w-3.5" />
                                Tax Invoice
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
