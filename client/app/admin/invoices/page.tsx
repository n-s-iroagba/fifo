'use client';

import React, { useState, useEffect } from 'react';
import { Mail, CheckCircle2, User as UserIcon, RefreshCw, FileText, Send, DollarSign, Calculator } from 'lucide-react';
import api from '@/lib/api';

export default function AdminInvoicesPage() {
    const [applicants, setApplicants] = useState<any[]>([]);
    const [invoices, setInvoices] = useState<any[]>([]);
    const [wallets, setWallets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [dispatching, setDispatching] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');

    const [selectedUserId, setSelectedUserId] = useState('');
    const [selectedWalletId, setSelectedWalletId] = useState('');
    const [invoiceType, setInvoiceType] = useState('aveling-partial');
    const [amountUSD, setAmountUSD] = useState('');
    const [invoiceFile, setInvoiceFile] = useState<File | null>(null);

    const [previewInvoice, setPreviewInvoice] = useState<any>(null);

    const fetchInvoices = async () => {
        try {
            const res = await api.get('/admin/invoices');
            setInvoices(Array.isArray(res.data) ? res.data : (res.data?.data || res.data?.rows || []));
        } catch (e) { console.error('Failed to fetch invoices', e); }
    };

    useEffect(() => {
        Promise.all([
            api.get('/admin/users'),
            api.get('/admin/bank-accounts'),
            fetchInvoices()
        ]).then(([usersRes, walletsRes]) => {
            setApplicants(usersRes.data?.rows || usersRes.data?.users || (Array.isArray(usersRes.data) ? usersRes.data : []));
            setWallets(walletsRes.data?.rows || (Array.isArray(walletsRes.data) ? walletsRes.data : []));
            setLoading(false);
        }).catch(err => {
            console.error('Failed to load data', err);
            setLoading(false);
        });
    }, []);

    const selectedUser = applicants.find(a => a.id === parseInt(selectedUserId));

    const handleDispatch = async () => {
        if (!selectedUser || !amountUSD) return;
        setDispatching(true);
        setSuccessMsg('');

        try {
            const selectedWallet = wallets.find(w => w.id === parseInt(selectedWalletId));
            const finalAmount = parseFloat(amountUSD);

            const formData = new FormData();
            formData.append('applicantId', selectedUser.id.toString());
            formData.append('email', selectedUser.email);
            formData.append('invoiceType', invoiceType);

            formData.append('finalAmountDue', finalAmount.toString());
            
            if (selectedWallet) {
                formData.append('walletAddress', selectedWallet.accountNumber);
            }
            if (invoiceFile) {
                formData.append('invoiceFile', invoiceFile);
            }

            await api.post('/admin/invoices/dispatch', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            setSuccessMsg(`Invoice dispatched successfully to ${selectedUser.fullName}!`);
            setInvoiceFile(null);
            setAmountUSD('');
            fetchInvoices();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to dispatch invoice');
        } finally {
            setDispatching(false);
        }
    };

    if (loading) {
        return <div className="flex h-screen items-center justify-center font-bold text-zinc-400 uppercase tracking-widest text-xs">Loading Invoice Module...</div>;
    }

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="border-b-2 border-zinc-200 pb-5">
                <h1 className="text-3xl font-black tracking-tight text-zinc-900 flex items-center gap-3">
                    <FileText className="h-8 w-8 text-[#FFC700]" />
                    Invoice Generator
                </h1>
                <p className="mt-2 text-sm font-medium text-zinc-500">Select applicant and invoice type to dispatch the correct billing statement directly via email.</p>
            </div>

            {successMsg && (
                <div className="bg-emerald-50 border-2 border-emerald-200 p-4 rounded-xl flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    <p className="text-emerald-800 text-sm font-bold">{successMsg}</p>
                </div>
            )}

            <div className="bg-white border-2 border-zinc-200 rounded-2xl p-8 shadow-sm">
                <h2 className="text-sm font-black uppercase tracking-widest text-zinc-900 mb-6 border-b-2 border-zinc-100 pb-4 flex items-center gap-2">
                    <Calculator className="h-4 w-4 text-zinc-400" />
                    Configure Invoice
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-zinc-700 mb-2">Select Applicant</label>
                        <select
                            value={selectedUserId}
                            onChange={(e) => setSelectedUserId(e.target.value)}
                            className="w-full bg-zinc-50 border-2 border-zinc-200 p-4 rounded-xl text-sm font-bold text-zinc-900 outline-none focus:border-[#FFC700] transition-all"
                        >
                            <option value="">-- Choose Applicant --</option>
                            {applicants.map(app => (
                                <option key={app.id} value={app.id}>{app.candidateNumber || `CND-${10000 + app.id}`} - {app.fullName}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-zinc-700 mb-2">Invoice Type</label>
                        <select
                            value={invoiceType}
                            onChange={(e) => setInvoiceType(e.target.value)}
                            className="w-full bg-zinc-50 border-2 border-zinc-200 p-4 rounded-xl text-sm font-bold text-zinc-900 outline-none focus:border-[#FFC700] transition-all"
                        >
                            <option value="aveling-partial">Aveling - Partial Payment</option>
                            <option value="aveling-complete-after-partial">Aveling - Final Payment (after partial)</option>
                            <option value="aveling-complete">Aveling - Full Payment</option>
                            <option value="shipping">Shipping</option>
                            <option value="visa-blue-collar">Visa</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-zinc-700 mb-2">Select Wallet</label>
                        <select
                            value={selectedWalletId}
                            onChange={(e) => setSelectedWalletId(e.target.value)}
                            className="w-full bg-zinc-50 border-2 border-zinc-200 p-4 rounded-xl text-sm font-bold text-zinc-900 outline-none focus:border-[#FFC700] transition-all"
                        >
                            <option value="">-- Choose Wallet --</option>
                            {wallets.map(w => (
                                <option key={w.id} value={w.id}>{w.bankName} - {w.accountName} ({w.currency})</option>
                            ))}
                        </select>
                    </div>
                    
                    <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-zinc-700 mb-2">
                            Amount Due (USD)
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-4 text-zinc-500 font-bold">$</span>
                            <input
                                type="number"
                                value={amountUSD}
                                onChange={(e) => setAmountUSD(e.target.value)}
                                placeholder="e.g. 500.00"
                                className="w-full bg-zinc-50 border-2 border-zinc-200 p-4 pl-8 rounded-xl text-sm font-bold text-zinc-900 outline-none focus:border-[#FFC700] transition-all"
                            />
                        </div>
                    </div>
                </div>

                <div className="mb-8 border-t-2 border-zinc-100 pt-6">
                    <label className="block text-xs font-black uppercase tracking-widest text-zinc-700 mb-2">Attach Official Invoice (PDF)</label>
                    <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => setInvoiceFile(e.target.files?.[0] || null)}
                        className="w-full bg-zinc-50 border-2 border-zinc-200 p-4 rounded-xl text-sm font-bold text-zinc-900 outline-none focus:border-[#FFC700] transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-black file:bg-[#FFC700] file:text-black hover:file:bg-yellow-400"
                    />
                </div>

                <button
                    onClick={handleDispatch}
                    disabled={!selectedUserId || !amountUSD || dispatching}
                    className="w-full inline-flex items-center justify-center gap-2 bg-[#FFC700] text-black font-black text-xs py-5 rounded-xl hover:bg-yellow-400 transition-all uppercase tracking-widest shadow-md disabled:opacity-50"
                >
                    {dispatching ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    {dispatching ? 'Dispatching...' : 'Dispatch Invoice via Email'}
                </button>
            </div>

            {/* Invoices History Table */}
            <div className="bg-white border-2 border-zinc-200 rounded-2xl p-8 shadow-sm">
                <h2 className="text-sm font-black uppercase tracking-widest text-zinc-900 mb-6 border-b-2 border-zinc-100 pb-4">
                    Generated Invoices History
                </h2>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-zinc-50 border-b-2 border-zinc-200">
                            <tr>
                                <th className="p-4 font-black uppercase tracking-widest text-[10px] text-zinc-500">ID</th>
                                <th className="p-4 font-black uppercase tracking-widest text-[10px] text-zinc-500">Date</th>
                                <th className="p-4 font-black uppercase tracking-widest text-[10px] text-zinc-500">Applicant</th>
                                <th className="p-4 font-black uppercase tracking-widest text-[10px] text-zinc-500">Purpose</th>
                                <th className="p-4 font-black uppercase tracking-widest text-[10px] text-zinc-500 text-right">Amount (USD)</th>
                                <th className="p-4 font-black uppercase tracking-widest text-[10px] text-zinc-500 text-center">Status</th>
                                <th className="p-4 font-black uppercase tracking-widest text-[10px] text-zinc-500 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                            {invoices.length > 0 ? invoices.map((inv, idx) => (
                                <tr key={inv.id} className="hover:bg-zinc-50/50 transition-colors">
                                    <td className="p-4 font-bold text-zinc-900">#{inv.id.toString().padStart(6, '0')}</td>
                                    <td className="p-4 text-zinc-500">{new Date(inv.createdAt).toLocaleDateString()}</td>
                                    <td className="p-4 font-bold text-zinc-900">
                                        <div className="flex items-center gap-2">
                                            <div className="bg-zinc-200 p-1.5 rounded-full"><UserIcon className="w-3 h-3 text-zinc-600" /></div>
                                            {inv.applicant?.fullName || `User #${inv.applicantId}`}
                                        </div>
                                    </td>
                                    <td className="p-4 text-zinc-600">
                                        <span className="bg-zinc-100 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider">{inv.purpose.replace(/-/g, ' ')}</span>
                                    </td>
                                    <td className="p-4 font-black text-[#FFC700] text-right">${parseFloat(inv.amountInUSD || '0').toFixed(2)} USDT</td>
                                    <td className="p-4 text-center">
                                        {inv.isPaid ? (
                                            <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-700 px-2 py-1 rounded">
                                                <CheckCircle2 className="w-3 h-3" /> Paid
                                            </span>
                                        ) : (
                                            <span className="inline-flex text-[10px] font-black uppercase tracking-widest bg-amber-100 text-amber-700 px-2 py-1 rounded">
                                                Unpaid
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end items-center gap-2">
                                            <button
                                                onClick={() => setPreviewInvoice(inv)}
                                                className="bg-white border-2 border-zinc-200 text-zinc-600 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded hover:bg-zinc-50 transition-colors"
                                            >
                                                Preview
                                            </button>
                                            {!inv.isPaid ? (
                                                <button
                                                    onClick={async () => {
                                                        if (!confirm('Mark this invoice as Paid and generate a receipt?')) return;
                                                        try {
                                                            await api.post(`/admin/invoices/${inv.id}/receipt`);
                                                            fetchInvoices();
                                                        } catch (err) {
                                                            alert('Failed to process receipt.');
                                                        }
                                                    }}
                                                    className="bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded hover:bg-emerald-700 transition-colors"
                                                >
                                                    Mark Paid
                                                </button>
                                            ) : (
                                                <span className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest">Completed</span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={7} className="p-8 text-center text-zinc-500 font-medium">No invoices generated yet.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal for Invoice Preview */}
            {previewInvoice && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="bg-zinc-900 text-white p-6 relative">
                            <button
                                onClick={() => setPreviewInvoice(null)}
                                className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors"
                            >
                                ✕
                            </button>
                            <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400 mb-1">Invoice Preview</h3>
                            <div className="text-2xl font-black">#{previewInvoice.id.toString().padStart(6, '0')}</div>
                        </div>

                        {/* Body */}
                        <div className="p-8 space-y-8">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">Billed To</p>
                                    <p className="font-bold text-zinc-900">{previewInvoice.applicant?.fullName}</p>
                                    <p className="text-sm text-zinc-500">{previewInvoice.applicant?.email}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">Date Issued</p>
                                    <p className="font-bold text-zinc-900">{new Date(previewInvoice.createdAt).toLocaleDateString()}</p>

                                    <div className="mt-4 flex flex-col items-end">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">Status</p>
                                        <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded flex items-center gap-1 ${previewInvoice.isPaid ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                            {previewInvoice.isPaid ? <><CheckCircle2 className="w-3 h-3" /> Paid</> : 'Unpaid'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2 border-b-2 border-zinc-100 pb-2">Line Items</p>
                                <div className="flex justify-between items-center py-3">
                                    <span className="font-bold text-zinc-700">{previewInvoice.purpose.replace(/-/g, ' ')}</span>
                                    <span className="font-black text-zinc-900">${parseFloat(previewInvoice.amountInUSD || '0').toFixed(2)} USDT</span>
                                </div>
                            </div>

                            <div className="bg-zinc-50 border-2 border-zinc-200 p-4 rounded-xl flex justify-between items-center">
                                <span className="text-sm font-black uppercase tracking-widest text-zinc-900">Total Due</span>
                                <span className="text-2xl font-black text-[#FFC700]">${parseFloat(previewInvoice.amountInUSD || '0').toFixed(2)} USDT</span>
                            </div>

                            <div className="text-center">
                                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Payable via TRC-20 Tron Network</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
