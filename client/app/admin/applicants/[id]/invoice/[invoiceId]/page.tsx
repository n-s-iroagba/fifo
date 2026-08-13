'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import Link from 'next/link';
import { Printer, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function AdminAvelingInvoicePage() {
    const params = useParams();
    const router = useRouter();
    const applicantId = params?.id as string;
    const invoiceId = params?.invoiceId as string;

    const [invoice, setInvoice] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const fetchInvoice = async () => {
            try {
                // Fetch user for name
                const userRes = await api.get(`/admin/users/${applicantId}`);
                setUser(userRes.data?.user);

                // Fetch invoices
                const res = await api.get(`/admin/users/${applicantId}/aveling-invoices`);
                if (res.data?.data) {
                    const found = res.data.data.find((r: any) => r.id === invoiceId);
                    if (found) setInvoice(found);
                }
            } catch (err) {
                console.error('Failed to fetch invoice', err);
            } finally {
                setLoading(false);
            }
        };
        fetchInvoice();
    }, [applicantId, invoiceId]);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center font-bold text-zinc-500">Loading invoice...</div>;
    }

    if (!invoice) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4">
                <p className="font-bold text-zinc-500 mb-4">Invoice not found.</p>
                <button onClick={() => router.back()} className="text-blue-600 font-bold hover:underline">
                    &larr; Go Back
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50 p-4 md:p-8 font-sans">
            {/* Action Bar */}
            <div className="max-w-3xl mx-auto mb-6 flex items-center justify-between print:hidden">
                <Link href={`/admin/applicants/${applicantId}`} className="inline-flex items-center gap-2 text-sm font-bold text-blue-500 hover:text-blue-900 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Applicant Profile
                </Link>
                <div className="flex items-center gap-3">
                    <button onClick={() => window.print()} className="inline-flex items-center gap-2 bg-white border border-blue-200 shadow-sm rounded-lg px-4 py-2 text-sm font-bold text-blue-900 hover:bg-blue-50 transition-colors">
                        <Printer className="w-4 h-4" /> Print
                    </button>
                </div>
            </div>

            {/* A4 Invoice Container */}
            <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-2xl overflow-hidden print:shadow-none print:rounded-none border border-zinc-200">
                {/* Header (Aveling Branded) */}
                <div className="bg-[#FFC700] p-8 md:p-12 text-black flex flex-col md:flex-row md:items-end justify-between gap-6 print:bg-[#FFC700] print:border-b-4 print:border-black">
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-tight">PAYMENT INVOICE & RECEIPT</h1>
                        <p className="mt-2 font-bold opacity-80 uppercase tracking-widest text-xs">Official Document</p>
                    </div>
                    <div className="text-left md:text-right">
                        <div className="text-3xl font-black italic tracking-tighter">AVELING</div>
                        <p className="text-sm font-bold opacity-80 mt-1">Training & Certification</p>
                        <p className="text-xs font-semibold opacity-70 mt-1">ABN: 12 345 678 910</p>
                    </div>
                </div>

                {/* Details Section */}
                <div className="p-8 md:p-12">
                    <div className="flex flex-col md:flex-row justify-between border-b border-zinc-200 pb-8 mb-8 gap-8">
                        <div>
                            <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Invoice Number</p>
                            <p className="font-mono font-bold text-zinc-900 text-lg">{invoice.id}</p>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Date of Issue</p>
                            <p className="font-bold text-zinc-900">{invoice.date}</p>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Billed To</p>
                            <p className="font-bold text-zinc-900 uppercase">{user?.fullName || 'Candidate'}</p>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Payment Status</p>
                            <div className="inline-flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg font-bold text-sm">
                                <CheckCircle2 className="w-4 h-4" /> PAID IN FULL
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="mb-12">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b-2 border-zinc-900">
                                    <th className="py-3 text-xs font-black text-zinc-900 uppercase tracking-wider">Description</th>
                                    <th className="py-3 text-xs font-black text-zinc-900 uppercase tracking-wider text-right w-32">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100">
                                {invoice.courses.map((course: string, i: number) => (
                                    <tr key={i}>
                                        <td className="py-4 font-bold text-zinc-800">{course}</td>
                                        <td className="py-4 font-mono font-bold text-zinc-800 text-right">
                                            ${(invoice.amountPaid + invoice.subsidiesCovered).toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Totals */}
                    <div className="flex flex-col items-end gap-3 border-t-2 border-zinc-900 pt-6">
                        <div className="flex items-center justify-between w-full md:w-80 text-sm">
                            <span className="font-bold text-zinc-500">Subtotal</span>
                            <span className="font-mono font-bold text-zinc-900">${(invoice.amountPaid + invoice.subsidiesCovered).toFixed(2)}</span>
                        </div>
                        
                        {invoice.subsidiesCovered > 0 && (
                            <div className="flex items-center justify-between w-full md:w-80 text-sm">
                                <span className="font-bold text-amber-600 flex-1">
                                    {invoice.type === 'psychometric' 
                                        ? 'Covered by Blue Collar Recruitment' 
                                        : 'Blue Collar Subsidy / Part Deposit'}
                                </span>
                                <span className="font-mono font-bold text-amber-600">-${invoice.subsidiesCovered.toFixed(2)}</span>
                            </div>
                        )}

                        <div className="flex items-center justify-between w-full md:w-80 text-lg border-t border-zinc-200 mt-2 pt-4">
                            <span className="font-black text-zinc-900 uppercase">Learner Paid</span>
                            <span className="font-mono font-black text-emerald-600">${invoice.amountPaid.toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Footer Notes */}
                    {(invoice.note || invoice.type === 'psychometric') && (
                        <div className="mt-16 bg-blue-50 border border-blue-100 p-6 rounded-xl text-blue-900 print:bg-white print:border-blue-900">
                            <p className="text-sm font-bold flex items-start gap-3">
                                <span className="material-symbols-outlined text-blue-500 shrink-0">info</span>
                                <span>
                                    {invoice.note || 'This fee was paid on behalf of the applicant by Blue Collar Recruitment as part of the candidate assessment process. No further action is required from the learner.'}
                                </span>
                            </p>
                        </div>
                    )}

                    <div className="mt-16 text-center text-xs font-bold text-zinc-400">
                        <p>Thank you for choosing Aveling Training.</p>
                        <p>This is a computer-generated document. No signature is required.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
