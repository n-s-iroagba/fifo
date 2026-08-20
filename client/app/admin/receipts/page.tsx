'use client';

import React, { useState, useEffect } from 'react';
import { Mail, CheckCircle2, FileText, Send, DollarSign, Calculator } from 'lucide-react';
import api from '@/lib/api';

export default function AdminReceiptsPage() {
    const [invoices, setInvoices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [dispatching, setDispatching] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    
    const [selectedInvoiceId, setSelectedInvoiceId] = useState('');
    const [previewInvoice, setPreviewInvoice] = useState<any>(null);

    const fetchInvoices = async () => {
        try {
            const res = await api.get('/admin/invoices');
            // Filter to only show unpaid invoices since paid invoices already have receipts generated
            setInvoices((res.data || []).filter((inv: any) => !inv.isPaid));
        } catch (e) {
            console.error('Failed to fetch invoices', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInvoices();
    }, []);

    const handleSelectInvoice = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const id = e.target.value;
        setSelectedInvoiceId(id);
        const inv = invoices.find(i => i.id.toString() === id);
        setPreviewInvoice(inv || null);
    };

    const generateAndDispatchReceipt = async () => {
        if (!previewInvoice) return;
        
        try {
            setDispatching(true);
            setSuccessMsg('');
            
            // 5. Create at server & 6. Send with mail as attachment
            await api.post(`/admin/invoices/${previewInvoice.id}/receipt`);
            
            setSuccessMsg(`Receipt generated and dispatched to ${previewInvoice.applicant?.email} successfully.`);
            setPreviewInvoice(null);
            setSelectedInvoiceId('');
            await fetchInvoices();
        } catch (err) {
            console.error('Failed to dispatch receipt', err);
            alert('Failed to generate receipt. Please try again.');
        } finally {
            setDispatching(false);
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-12">
            <div>
                <h1 className="text-2xl font-black uppercase tracking-widest text-zinc-900 flex items-center gap-3">
                    <FileText className="w-8 h-8 text-emerald-600" />
                    Receipt Generation
                </h1>
                <p className="text-zinc-500 font-medium mt-2">Generate and dispatch official receipts for paid invoices</p>
            </div>

            {loading ? (
                <div className="flex justify-center p-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Invoice Selection Panel */}
                    <div className="bg-white rounded-2xl shadow-xl border border-zinc-200 overflow-hidden">
                        <div className="bg-zinc-900 text-white p-6">
                            <h2 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                                <DollarSign className="w-4 h-4 text-emerald-400" />
                                1. Select Invoice
                            </h2>
                            <p className="text-zinc-400 text-xs font-medium mt-1">Select a pending invoice to generate a receipt for</p>
                        </div>
                        <div className="p-6 space-y-6">
                            {successMsg && (
                                <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl text-sm font-medium border border-emerald-200 flex items-start gap-3">
                                    <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                                    {successMsg}
                                </div>
                            )}

                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Pending Invoices</label>
                                <select 
                                    className="w-full bg-zinc-50 border-2 border-zinc-200 rounded-xl p-3 text-sm font-medium text-zinc-900 focus:border-zinc-900 focus:ring-0 transition-colors"
                                    value={selectedInvoiceId}
                                    onChange={handleSelectInvoice}
                                >
                                    <option value="">-- Select an invoice --</option>
                                    {invoices.map(inv => (
                                        <option key={inv.id} value={inv.id}>
                                            INV-#{inv.id.toString().padStart(5, '0')} - {inv.applicant?.fullName || 'Unknown'} - ${inv.amountInUSD} USDT
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Receipt Preview Panel */}
                    <div className="bg-white rounded-2xl shadow-xl border border-zinc-200 overflow-hidden">
                        <div className="bg-zinc-900 text-white p-6">
                            <h2 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                                <FileText className="w-4 h-4 text-emerald-400" />
                                2. Receipt Preview
                            </h2>
                            <p className="text-zinc-400 text-xs font-medium mt-1">Review the receipt details before dispatching</p>
                        </div>
                        <div className="p-6">
                            {previewInvoice ? (
                                <div className="space-y-6">
                                    <div className="bg-zinc-50 border-2 border-zinc-100 rounded-xl p-6">
                                        <div className="flex justify-between items-start mb-6">
                                            <div>
                                                <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">Bill To</h3>
                                                <p className="font-bold text-zinc-900">{previewInvoice.applicant?.fullName}</p>
                                                <p className="text-sm text-zinc-500">{previewInvoice.applicant?.email}</p>
                                                <p className="text-xs font-mono text-zinc-400 mt-1">{previewInvoice.applicant?.candidateNumber}</p>
                                            </div>
                                            <div className="text-right">
                                                <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">Receipt Date</h3>
                                                <p className="font-bold text-zinc-900">{new Date().toLocaleDateString()}</p>
                                                <p className="text-xs font-mono text-zinc-400 mt-1">For: INV-#{previewInvoice.id.toString().padStart(5, '0')}</p>
                                            </div>
                                        </div>

                                        <div className="border-t border-b border-zinc-200 py-4 my-4 space-y-3">
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="font-medium text-zinc-600">Payment Purpose</span>
                                                <span className="font-bold text-zinc-900 uppercase text-xs tracking-wider bg-zinc-200 px-2 py-1 rounded">{previewInvoice.purpose.replace(/-/g, ' ')}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="font-medium text-zinc-600">Amount Paid</span>
                                                <span className="font-black text-emerald-600">${parseFloat(previewInvoice.amountInUSD || '0').toFixed(2)} USDT</span>
                                            </div>
                                        </div>

                                        <div className="bg-emerald-50 text-emerald-800 text-xs font-medium p-4 rounded-lg flex items-center justify-center gap-2">
                                            <CheckCircle2 className="w-4 h-4" />
                                            Payment verified and marked as PAID
                                        </div>
                                    </div>

                                    <button 
                                        onClick={generateAndDispatchReceipt}
                                        disabled={dispatching}
                                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-widest py-4 rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {dispatching ? (
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        ) : (
                                            <>
                                                <Send className="w-4 h-4" />
                                                Generate & Dispatch Receipt
                                            </>
                                        )}
                                    </button>
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <Calculator className="w-12 h-12 text-zinc-200 mx-auto mb-3" />
                                    <p className="text-zinc-500 font-medium text-sm">Select an invoice to preview the receipt.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
