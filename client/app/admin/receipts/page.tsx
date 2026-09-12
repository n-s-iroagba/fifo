'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
    FileCheck,
    Send,
    CheckCircle2,
    User as UserIcon,
    RefreshCw,
    Calculator,
    Eye,
    Wallet,
    X,
    AlertCircle,
    Copy,
    Check,
    Mail,
    ArrowRight,
    Sparkles,
    DollarSign,
    Building2,
    ShieldCheck,
    FileText,
    CheckCircle
} from 'lucide-react';
import api from '@/lib/api';

interface Applicant {
    id: number;
    fullName: string;
    email: string;
    candidateNumber?: string;
}

interface InvoiceRecord {
    id: number;
    applicantId: number;
    purpose: string;
    amountInUSD: number | string;
    walletAddress?: string | null;
    isPaid: boolean;
    createdAt: string;
    receiptProofSubmission?: string | null;
    applicant?: Applicant;
}

const PURPOSE_META: Record<string, {
    owner: 'aveling' | 'blue-collar';
    ownerName: string;
    ownerEmail: string;
    title: string;
    note: string;
    brandBg: string;
    badgeColor: string;
}> = {
    'aveling-partial': {
        owner: 'aveling',
        ownerName: 'Aveling LMS Training',
        ownerEmail: 'info@jobnexe.com',
        title: 'Partial Ticket Sponsorship Receipt',
        note: 'Partial ticket courses and certification payment verification.',
        brandBg: 'bg-[#FFC700] text-black',
        badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
    },
    'aveling-complete-after-partial': {
        owner: 'aveling',
        ownerName: 'Aveling LMS Training',
        ownerEmail: 'info@jobnexe.com',
        title: 'Final Ticket Sponsorship Receipt',
        note: 'Completion balance for partial ticket courses & certifications.',
        brandBg: 'bg-[#FFC700] text-black',
        badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
    },
    'aveling-complete': {
        owner: 'aveling',
        ownerName: 'Aveling LMS Training',
        ownerEmail: 'info@jobnexe.com',
        title: 'Full Ticket Sponsorship Receipt',
        note: 'Full ticket courses and certification package (10% discount applied).',
        brandBg: 'bg-[#FFC700] text-black',
        badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
    },
    'shipping': {
        owner: 'aveling',
        ownerName: 'Aveling LMS Training',
        ownerEmail: 'info@jobnexe.com',
        title: 'Ticket Shipping Fee Receipt',
        note: 'Courier shipping and delivery of physical certification cards.',
        brandBg: 'bg-[#FFC700] text-black',
        badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
    },
    'visa-blue-collar': {
        owner: 'blue-collar',
        ownerName: 'BlueCollar Infrastructure',
        ownerEmail: 'donotreply@BlueCollar.com',
        title: 'Visa Fee Subsidy Receipt',
        note: 'Visa application, legal sponsorship, and infrastructure processing.',
        brandBg: 'bg-[#0b3486] text-white',
        badgeColor: 'bg-blue-100 text-blue-900 border-blue-300',
    },
};

export default function AdminReceiptsPage() {
    const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [dispatching, setDispatching] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    // Step 1 & 2: Selected invoice & drafting
    const [selectedInvoiceId, setSelectedInvoiceId] = useState('');
    const [receiptAttachment, setReceiptAttachment] = useState<File | null>(null);

    // Step 3: Preview Modal
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [copiedWallet, setCopiedWallet] = useState(false);

    // Historical receipt preview modal
    const [viewHistoricalReceipt, setViewHistoricalReceipt] = useState<InvoiceRecord | null>(null);

    // Active tab: 'pending' or 'history'
    const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');

    const fetchInvoices = async () => {
        try {
            const res = await api.get('/admin/invoices');
            const data = Array.isArray(res.data) ? res.data : (res.data?.data || res.data?.rows || []);
            setInvoices(data);
        } catch (e) {
            console.error('Failed to fetch invoices', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInvoices();
    }, []);

    // Filtered lists
    const pendingInvoices = useMemo(() => invoices.filter(inv => !inv.isPaid), [invoices]);
    const paidInvoices = useMemo(() => invoices.filter(inv => inv.isPaid), [invoices]);

    // Selected invoice details for live drafting
    const selectedInvoice = useMemo(() => {
        return invoices.find(inv => inv.id.toString() === selectedInvoiceId) || null;
    }, [invoices, selectedInvoiceId]);

    // Owner metadata based on invoice purpose
    const ownerMeta = useMemo(() => {
        if (!selectedInvoice) return null;
        return PURPOSE_META[selectedInvoice.purpose] || {
            owner: 'aveling' as const,
            ownerName: 'Aveling LMS Training',
            ownerEmail: 'info@jobnexe.com',
            title: 'Official Payment Receipt',
            note: 'Verification of payment.',
            brandBg: 'bg-[#FFC700] text-black',
            badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
        };
    }, [selectedInvoice]);

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopiedWallet(true);
        setTimeout(() => setCopiedWallet(false), 2000);
    };

    // Step 4: Record receipt in DB and send via email of the owner
    const handleRecordAndSendReceipt = async () => {
        if (!selectedInvoice) return;

        setDispatching(true);
        setErrorMsg('');
        setSuccessMsg('');

        try {
            const formData = new FormData();
            if (receiptAttachment) {
                formData.append('receiptFile', receiptAttachment);
            }

            await api.post(`/admin/invoices/${selectedInvoice.id}/receipt`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const ownerLabel = ownerMeta?.ownerName || 'the issuing provider';
            setSuccessMsg(`Receipt #REC-${selectedInvoice.id.toString().padStart(6, '0')} recorded and dispatched to ${selectedInvoice.applicant?.fullName || 'candidate'} via ${ownerLabel}!`);

            setShowPreviewModal(false);
            setSelectedInvoiceId('');
            setReceiptAttachment(null);

            await fetchInvoices();
        } catch (err: any) {
            console.error('Failed to dispatch receipt:', err);
            setErrorMsg(err.response?.data?.message || 'Failed to record and dispatch receipt. Please try again.');
        } finally {
            setDispatching(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center font-bold text-zinc-400 uppercase tracking-widest text-xs gap-3">
                <RefreshCw className="h-4 w-4 animate-spin text-emerald-600" />
                Loading Receipts Module...
            </div>
        );
    }

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="border-b-2 border-zinc-200 pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-zinc-900 flex items-center gap-3">
                        <FileCheck className="h-8 w-8 text-emerald-600" />
                        Official Receipt Dispatch & Verification
                    </h1>
                    <p className="mt-1 text-sm font-medium text-zinc-500">
                        1. Select invoice &bull; 2. System drafts receipt &bull; 3. Preview document &bull; 4. Record & dispatch via Aveling or BlueCollar
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="bg-amber-50 text-amber-900 border border-amber-200 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                        {pendingInvoices.length} Pending
                    </div>
                    <div className="bg-emerald-50 text-emerald-900 border border-emerald-200 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                        {paidInvoices.length} Dispatched
                    </div>
                </div>
            </div>

            {/* Notification Alerts */}
            {successMsg && (
                <div className="bg-emerald-50 border-2 border-emerald-200 p-4 rounded-xl flex items-start gap-3 animate-in fade-in">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-emerald-900 text-sm font-bold">{successMsg}</p>
                        <p className="text-emerald-700 text-xs mt-0.5">Invoice marked as Paid; candidate received official email confirmation.</p>
                    </div>
                </div>
            )}

            {errorMsg && (
                <div className="bg-rose-50 border-2 border-rose-200 p-4 rounded-xl flex items-start gap-3 animate-in fade-in">
                    <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-rose-900 text-sm font-bold">{errorMsg}</p>
                    </div>
                </div>
            )}

            {/* Step Indicators */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className={`p-3 rounded-xl border-2 transition-all ${selectedInvoiceId ? 'bg-emerald-50 border-emerald-300' : 'bg-white border-zinc-200'}`}>
                    <div className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Step 1</div>
                    <div className="text-xs font-black text-zinc-900 mt-0.5">Select Invoice</div>
                </div>
                <div className={`p-3 rounded-xl border-2 transition-all ${selectedInvoice ? 'bg-emerald-50 border-emerald-300' : 'bg-white border-zinc-200'}`}>
                    <div className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Step 2</div>
                    <div className="text-xs font-black text-zinc-900 mt-0.5">System Drafts Receipt</div>
                </div>
                <div className={`p-3 rounded-xl border-2 transition-all ${selectedInvoice ? 'bg-[#FFC700]/10 border-[#FFC700]' : 'bg-zinc-50 border-zinc-200 opacity-60'}`}>
                    <div className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Step 3</div>
                    <div className="text-xs font-black text-zinc-900 mt-0.5">Preview Document</div>
                </div>
                <div className={`p-3 rounded-xl border-2 transition-all ${selectedInvoice ? 'bg-emerald-50 border-emerald-300' : 'bg-zinc-50 border-zinc-200 opacity-60'}`}>
                    <div className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Step 4</div>
                    <div className="text-xs font-black text-zinc-900 mt-0.5">Record & Dispatch Mail</div>
                </div>
            </div>

            {/* Workflow Workspace (Step 1 Selection + Step 2 Draft) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Step 1: Admin Selects Invoice */}
                <div className="lg:col-span-6 bg-white border-2 border-zinc-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
                    <div className="border-b-2 border-zinc-100 pb-4 flex items-center justify-between">
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                                Step 1
                            </span>
                            <h2 className="text-sm font-black uppercase tracking-widest text-zinc-900 mt-1 flex items-center gap-2">
                                <DollarSign className="h-4 w-4 text-emerald-600" />
                                Select Invoice for Receipt
                            </h2>
                        </div>
                        <span className="text-xs font-bold text-zinc-400">
                            {pendingInvoices.length} Pending Invoices
                        </span>
                    </div>

                    <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-zinc-700 mb-2">
                            Select Pending Invoice
                        </label>
                        <select
                            value={selectedInvoiceId}
                            onChange={(e) => setSelectedInvoiceId(e.target.value)}
                            className="w-full bg-zinc-50 border-2 border-zinc-200 p-3.5 rounded-xl text-sm font-bold text-zinc-900 outline-none focus:border-emerald-500 transition-all"
                        >
                            <option value="">-- Choose an unpaid invoice --</option>
                            {pendingInvoices.map(inv => {
                                const isBlueCollar = inv.purpose === 'visa-blue-collar';
                                return (
                                    <option key={inv.id} value={inv.id}>
                                        #{inv.id.toString().padStart(6, '0')} &bull; {inv.applicant?.fullName || `User #${inv.applicantId}`} &bull; ${parseFloat(String(inv.amountInUSD || '0')).toFixed(2)} USDT &bull; [{isBlueCollar ? 'BlueCollar' : 'Aveling'}]
                                    </option>
                                );
                            })}
                        </select>
                    </div>

                    {/* Quick Select Grid of Pending Invoices */}
                    <div className="space-y-2">
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                            Or pick directly from pending list:
                        </p>
                        <div className="max-h-[300px] overflow-y-auto space-y-2 pr-1">
                            {pendingInvoices.length > 0 ? pendingInvoices.map(inv => {
                                const isSelected = selectedInvoiceId === inv.id.toString();
                                const isBlueCollar = inv.purpose === 'visa-blue-collar';
                                return (
                                    <div
                                        key={inv.id}
                                        onClick={() => setSelectedInvoiceId(inv.id.toString())}
                                        className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                                            isSelected
                                                ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-600/10'
                                                : 'border-zinc-200 hover:border-zinc-300 bg-white'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="radio"
                                                checked={isSelected}
                                                onChange={() => setSelectedInvoiceId(inv.id.toString())}
                                                className="accent-emerald-600"
                                            />
                                            <div>
                                                <p className="text-xs font-black text-zinc-900">
                                                    #{inv.id.toString().padStart(6, '0')} &bull; {inv.applicant?.fullName || `Applicant #${inv.applicantId}`}
                                                </p>
                                                <p className="text-[11px] text-zinc-500 mt-0.5">
                                                    {inv.purpose.replace(/-/g, ' ')} &bull; {new Date(inv.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-black text-zinc-900">${parseFloat(String(inv.amountInUSD || '0')).toFixed(2)} USDT</p>
                                            <span className={`inline-block text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border mt-0.5 ${
                                                isBlueCollar ? 'bg-blue-50 text-blue-800 border-blue-200' : 'bg-amber-50 text-amber-800 border-amber-200'
                                            }`}>
                                                {isBlueCollar ? 'BlueCollar' : 'Aveling'}
                                            </span>
                                        </div>
                                    </div>
                                );
                            }) : (
                                <div className="p-6 text-center text-zinc-400 text-xs font-medium border-2 border-dashed rounded-xl">
                                    No pending invoices requiring receipts!
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Optional Official PDF Attachment */}
                    {selectedInvoice && (
                        <div className="border-t-2 border-zinc-100 pt-5">
                            <label className="block text-xs font-black uppercase tracking-widest text-zinc-700 mb-2">
                                Attach Stamped / Signed PDF Receipt (Optional)
                            </label>
                            <input
                                type="file"
                                accept=".pdf,image/*"
                                onChange={(e) => setReceiptAttachment(e.target.files?.[0] || null)}
                                className="w-full bg-zinc-50 border-2 border-zinc-200 p-3 rounded-xl text-xs font-bold text-zinc-700 outline-none focus:border-emerald-500 transition-all file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[11px] file:font-black file:bg-emerald-600 file:text-white hover:file:bg-emerald-700"
                            />
                            {receiptAttachment && (
                                <p className="text-[11px] font-bold text-emerald-700 mt-1 flex items-center gap-1">
                                    <CheckCircle2 className="w-3.5 h-3.5" /> Attached: {receiptAttachment.name} ({(receiptAttachment.size / 1024).toFixed(1)} KB)
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {/* Step 2: System Drafts Receipt (Live Reactive Draft Card) */}
                <div className="lg:col-span-6 bg-white border-2 border-zinc-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
                    <div className="border-b-2 border-zinc-100 pb-4 flex items-center justify-between">
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-[#FFC700] bg-black px-2 py-0.5 rounded">
                                Step 2
                            </span>
                            <h2 className="text-sm font-black uppercase tracking-widest text-zinc-900 mt-1 flex items-center gap-2">
                                <Sparkles className="h-4 w-4 text-[#FFC700]" />
                                System Drafted Receipt
                            </h2>
                        </div>
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                            Real-time Drafting
                        </span>
                    </div>

                    {selectedInvoice && ownerMeta ? (
                        <div className="border-2 border-dashed border-zinc-300 rounded-xl p-5 bg-zinc-50/70 space-y-4">
                            {/* Issuer Ownership Stamp */}
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                                    Receipt Owner & Issuing Server:
                                </span>
                                <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md ${ownerMeta.brandBg}`}>
                                    {ownerMeta.ownerName}
                                </span>
                            </div>

                            {/* Linked Invoice & Draft ID */}
                            <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-zinc-200">
                                <div>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 block">
                                        Draft Receipt #:
                                    </span>
                                    <span className="font-mono font-black text-zinc-900">
                                        REC-{selectedInvoice.id.toString().padStart(6, '0')}
                                    </span>
                                </div>
                                <div className="text-right">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 block">
                                        Linked Invoice:
                                    </span>
                                    <span className="font-mono font-bold text-zinc-600">
                                        INV-{selectedInvoice.id.toString().padStart(6, '0')}
                                    </span>
                                </div>
                            </div>

                            {/* Candidate Details */}
                            <div className="pt-2 border-t border-zinc-200 text-xs">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 block mb-1">
                                    Recipient (Candidate):
                                </span>
                                <p className="font-black text-zinc-900">
                                    {selectedInvoice.applicant?.fullName || `Applicant #${selectedInvoice.applicantId}`}
                                </p>
                                <p className="text-zinc-500">{selectedInvoice.applicant?.email}</p>
                                {selectedInvoice.applicant?.candidateNumber && (
                                    <p className="text-[10px] font-mono text-zinc-400 mt-0.5">
                                        {selectedInvoice.applicant.candidateNumber}
                                    </p>
                                )}
                            </div>

                            {/* Purpose Details */}
                            <div className="pt-2 border-t border-zinc-200 text-xs">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 block mb-1">
                                    Payment Purpose:
                                </span>
                                <p className="font-bold text-zinc-800">{ownerMeta.title}</p>
                                <p className="text-[11px] text-zinc-500 mt-0.5">{ownerMeta.note}</p>
                            </div>

                            {/* Receiving Wallet */}
                            {selectedInvoice.walletAddress && (
                                <div className="pt-2 border-t border-zinc-200 text-xs">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 block mb-1">
                                        Verified TRC-20 Wallet:
                                    </span>
                                    <p className="font-mono text-[11px] text-zinc-800 break-all font-bold">
                                        {selectedInvoice.walletAddress}
                                    </p>
                                </div>
                            )}

                            {/* Total Verified Amount */}
                            <div className="pt-3 border-t-2 border-zinc-200 flex items-center justify-between bg-white p-3 rounded-lg border">
                                <div>
                                    <span className="text-xs font-black uppercase tracking-widest text-zinc-700 block">
                                        Amount Received:
                                    </span>
                                    <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                                        <CheckCircle className="w-3 h-3" /> Marked as Verified & Paid
                                    </span>
                                </div>
                                <span className="text-2xl font-black text-emerald-600">
                                    ${parseFloat(String(selectedInvoice.amountInUSD || '0')).toFixed(2)}{' '}
                                    <span className="text-xs font-bold text-zinc-500">USDT</span>
                                </span>
                            </div>

                            {/* Step 3 Trigger Button */}
                            <button
                                type="button"
                                onClick={() => setShowPreviewModal(true)}
                                className="w-full inline-flex items-center justify-center gap-2 bg-zinc-900 text-white font-black text-xs py-4 rounded-xl hover:bg-zinc-800 transition-all uppercase tracking-widest shadow-md"
                            >
                                <Eye className="h-4 w-4 text-[#FFC700]" />
                                Step 3: Preview Receipt Document
                            </button>
                        </div>
                    ) : (
                        <div className="text-center py-16 border-2 border-dashed border-zinc-200 rounded-xl">
                            <Calculator className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
                            <p className="text-sm font-bold text-zinc-700">No Invoice Selected</p>
                            <p className="text-xs text-zinc-400 mt-1 max-w-xs mx-auto">
                                Pick an unpaid invoice in Step 1 to auto-draft the official payment receipt.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* STEP 3 MODAL: Receipt Document Preview & Step 4 Dispatch Action */}
            {showPreviewModal && selectedInvoice && ownerMeta && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-zinc-200 my-8 animate-in zoom-in-95">
                        {/* Branded Header based on Receipt Owner */}
                        <div className={`p-6 relative ${ownerMeta.brandBg}`}>
                            <button
                                onClick={() => setShowPreviewModal(false)}
                                className="absolute top-5 right-5 text-current opacity-70 hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-black/10"
                            >
                                <X className="h-5 w-5" />
                            </button>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-black/20 text-current">
                                    Official Payment Receipt
                                </span>
                                <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-black/10 text-current">
                                    Issued By: {ownerMeta.ownerName}
                                </span>
                            </div>
                            <h3 className="text-2xl font-black tracking-tight">{ownerMeta.title}</h3>
                            <p className="text-xs opacity-80 mt-0.5">Dispatched via {ownerMeta.ownerEmail}</p>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 sm:p-8 space-y-6">
                            {/* Receipt Header Details */}
                            <div className="grid grid-cols-2 gap-4 pb-5 border-b border-zinc-200">
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">Recipient (Candidate)</p>
                                    <p className="font-bold text-zinc-900 text-sm">{selectedInvoice.applicant?.fullName}</p>
                                    <p className="text-xs text-zinc-500">{selectedInvoice.applicant?.email}</p>
                                    <p className="text-[10px] font-mono text-zinc-400 mt-1">
                                        ID: {selectedInvoice.applicant?.candidateNumber || `CND-${10000 + selectedInvoice.applicantId}`}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">Receipt Number</p>
                                    <p className="font-black text-zinc-900 text-sm font-mono">
                                        #REC-{selectedInvoice.id.toString().padStart(6, '0')}
                                    </p>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mt-2 mb-0.5">Invoice Ref</p>
                                    <p className="text-xs font-mono font-bold text-zinc-600">
                                        #INV-{selectedInvoice.id.toString().padStart(6, '0')}
                                    </p>
                                    <p className="text-[10px] text-zinc-400 mt-1">Date: {new Date().toLocaleDateString()}</p>
                                </div>
                            </div>

                            {/* Itemized Receipt Table */}
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Itemized Particulars</p>
                                <div className="border border-zinc-200 rounded-xl overflow-hidden">
                                    <div className="bg-zinc-50 p-3 text-[10px] font-black uppercase tracking-widest text-zinc-500 flex justify-between">
                                        <span>Description</span>
                                        <span className="text-right">Amount Received</span>
                                    </div>
                                    <div className="p-4 flex justify-between items-center text-sm border-t border-zinc-100">
                                        <div>
                                            <p className="font-bold text-zinc-800">{ownerMeta.title}</p>
                                            <p className="text-xs text-zinc-500 mt-0.5">{ownerMeta.note}</p>
                                        </div>
                                        <span className="font-black text-emerald-600 text-base">
                                            ${parseFloat(String(selectedInvoice.amountInUSD || '0')).toFixed(2)} USDT
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Method & Verified Receiving Wallet */}
                            <div className="bg-zinc-900 text-white p-5 rounded-xl space-y-2">
                                <div className="flex items-center justify-between">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-yellow-400">
                                        Settlement & Network Verification
                                    </p>
                                    <span className="text-[10px] font-bold text-zinc-400">TRC-20 Tron Network</span>
                                </div>
                                <p className="text-xs text-zinc-300">
                                    Payment settled via USDT Tether on TRC-20 Tron blockchain.
                                </p>
                                {selectedInvoice.walletAddress && (
                                    <div className="p-3 bg-zinc-800 rounded-lg text-xs font-mono break-all flex items-center justify-between gap-2 border border-zinc-700">
                                        <div>
                                            <span className="text-[10px] text-zinc-400 font-sans block">Receiving Wallet:</span>
                                            <span className="text-yellow-400 font-bold">{selectedInvoice.walletAddress}</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => copyToClipboard(selectedInvoice.walletAddress || '')}
                                            className="p-2 hover:bg-zinc-700 rounded text-zinc-300 hover:text-white shrink-0"
                                            title="Copy address"
                                        >
                                            {copiedWallet ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Verified Status Banner */}
                            <div className="bg-emerald-50 border-2 border-emerald-200 p-4 rounded-xl flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="bg-emerald-600 text-white p-2 rounded-full">
                                        <CheckCircle2 className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black uppercase tracking-wider text-emerald-900">
                                            Official Receipt Status: Verified & Paid
                                        </p>
                                        <p className="text-[11px] text-emerald-700 mt-0.5">
                                            Upon confirmation, invoice #{selectedInvoice.id} will be permanently marked as Paid.
                                        </p>
                                    </div>
                                </div>
                                <span className="text-xl font-black text-emerald-700">
                                    ${parseFloat(String(selectedInvoice.amountInUSD || '0')).toFixed(2)} USDT
                                </span>
                            </div>

                            {/* Attachment Notice */}
                            {receiptAttachment && (
                                <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 font-bold">
                                    <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                                    <span>Attached Official Receipt File: {receiptAttachment.name}</span>
                                </div>
                            )}

                            {/* Step 4: Record & Send Action */}
                            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-zinc-200">
                                <button
                                    type="button"
                                    onClick={() => setShowPreviewModal(false)}
                                    className="w-full sm:w-auto px-5 py-3 border-2 border-zinc-200 text-zinc-700 font-black text-xs rounded-xl hover:bg-zinc-50 transition-colors uppercase tracking-wider"
                                >
                                    ← Back to Edit
                                </button>
                                <button
                                    type="button"
                                    onClick={handleRecordAndSendReceipt}
                                    disabled={dispatching}
                                    className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 font-black text-xs px-6 py-3.5 rounded-xl transition-all uppercase tracking-widest shadow-md disabled:opacity-50 ${
                                        ownerMeta.owner === 'blue-collar'
                                            ? 'bg-[#0b3486] text-white hover:bg-[#08296a]'
                                            : 'bg-[#FFC700] text-black hover:bg-yellow-400'
                                    }`}
                                >
                                    {dispatching ? (
                                        <>
                                            <RefreshCw className="h-4 w-4 animate-spin" />
                                            Recording & Sending via {ownerMeta.ownerName}...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="h-4 w-4" />
                                            Step 4: Record & Send Receipt via {ownerMeta.ownerName}
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Dispatched Receipts History Table */}
            <div className="bg-white border-2 border-zinc-200 rounded-2xl p-8 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b-2 border-zinc-100 pb-4">
                    <div>
                        <h2 className="text-sm font-black uppercase tracking-widest text-zinc-900">
                            Dispatched Receipts History
                        </h2>
                        <p className="text-xs text-zinc-500 mt-0.5">
                            Audit ledger of all verified invoices and dispatched receipts.
                        </p>
                    </div>
                    <button
                        onClick={fetchInvoices}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-600 hover:text-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-50 transition-colors w-fit"
                    >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Refresh Ledger
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-zinc-50 border-b-2 border-zinc-200">
                            <tr>
                                <th className="p-4 font-black uppercase tracking-widest text-[10px] text-zinc-500">Receipt ID</th>
                                <th className="p-4 font-black uppercase tracking-widest text-[10px] text-zinc-500">Date Paid</th>
                                <th className="p-4 font-black uppercase tracking-widest text-[10px] text-zinc-500">Candidate</th>
                                <th className="p-4 font-black uppercase tracking-widest text-[10px] text-zinc-500">Issuing Owner</th>
                                <th className="p-4 font-black uppercase tracking-widest text-[10px] text-zinc-500 text-right">Amount (USD)</th>
                                <th className="p-4 font-black uppercase tracking-widest text-[10px] text-zinc-500 text-center">Status</th>
                                <th className="p-4 font-black uppercase tracking-widest text-[10px] text-zinc-500 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                            {paidInvoices.length > 0 ? paidInvoices.map((inv) => {
                                const isBlueCollar = inv.purpose === 'visa-blue-collar';
                                const meta = PURPOSE_META[inv.purpose] || {
                                    ownerName: isBlueCollar ? 'BlueCollar Infrastructure' : 'Aveling LMS Training',
                                    badgeColor: isBlueCollar ? 'bg-blue-50 text-blue-800 border-blue-200' : 'bg-amber-50 text-amber-800 border-amber-200',
                                };
                                return (
                                    <tr key={inv.id} className="hover:bg-zinc-50/50 transition-colors">
                                        <td className="p-4 font-bold text-zinc-900 font-mono">
                                            #REC-{inv.id.toString().padStart(6, '0')}
                                        </td>
                                        <td className="p-4 text-zinc-500 text-xs">
                                            {inv.receiptProofSubmission ? new Date(inv.receiptProofSubmission).toLocaleDateString() : new Date(inv.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="p-4 font-bold text-zinc-900">
                                            <div className="flex items-center gap-2">
                                                <div className="bg-zinc-200 p-1.5 rounded-full">
                                                    <UserIcon className="w-3 h-3 text-zinc-600" />
                                                </div>
                                                <div>
                                                    <span>{inv.applicant?.fullName || `User #${inv.applicantId}`}</span>
                                                    {inv.applicant?.candidateNumber && (
                                                        <span className="block text-[10px] text-zinc-400 font-mono">
                                                            {inv.applicant.candidateNumber}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-zinc-600">
                                            <span className={`px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-wider border ${meta.badgeColor}`}>
                                                {meta.ownerName}
                                            </span>
                                        </td>
                                        <td className="p-4 font-black text-right text-emerald-600">
                                            ${parseFloat(String(inv.amountInUSD || '0')).toFixed(2)}{' '}
                                            <span className="text-[10px] text-zinc-400 font-bold">USDT</span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full">
                                                <CheckCircle2 className="w-3 h-3" /> Paid & Sent
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <button
                                                onClick={() => setViewHistoricalReceipt(inv)}
                                                className="bg-white border-2 border-zinc-200 text-zinc-700 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded hover:bg-zinc-50 transition-colors inline-flex items-center gap-1"
                                            >
                                                <Eye className="w-3 h-3" /> View Receipt
                                            </button>
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan={7} className="p-8 text-center text-zinc-500 font-medium">
                                        No receipts recorded or dispatched yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Historical Receipt View Modal */}
            {viewHistoricalReceipt && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in zoom-in-95 duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-zinc-200">
                        <div className={`p-6 relative ${viewHistoricalReceipt.purpose === 'visa-blue-collar' ? 'bg-[#0b3486] text-white' : 'bg-[#FFC700] text-black'}`}>
                            <button
                                onClick={() => setViewHistoricalReceipt(null)}
                                className="absolute top-4 right-4 opacity-70 hover:opacity-100 transition-opacity p-1"
                            >
                                <X className="h-5 w-5" />
                            </button>
                            <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-black/10">
                                Dispatched Receipt Record
                            </span>
                            <h3 className="text-xl font-black mt-1">
                                #REC-{viewHistoricalReceipt.id.toString().padStart(6, '0')}
                            </h3>
                            <p className="text-xs opacity-80 mt-0.5">
                                Issued by {viewHistoricalReceipt.purpose === 'visa-blue-collar' ? 'BlueCollar Infrastructure' : 'Aveling LMS Training'}
                            </p>
                        </div>

                        <div className="p-6 space-y-5">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">Billed To</p>
                                    <p className="font-bold text-zinc-900">{viewHistoricalReceipt.applicant?.fullName || `User #${viewHistoricalReceipt.applicantId}`}</p>
                                    <p className="text-xs text-zinc-500">{viewHistoricalReceipt.applicant?.email}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">Settlement Date</p>
                                    <p className="font-bold text-zinc-900 text-sm">
                                        {viewHistoricalReceipt.receiptProofSubmission ? new Date(viewHistoricalReceipt.receiptProofSubmission).toLocaleDateString() : new Date(viewHistoricalReceipt.createdAt).toLocaleDateString()}
                                    </p>
                                    <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded-full mt-2">
                                        <CheckCircle2 className="w-3 h-3" /> Paid
                                    </span>
                                </div>
                            </div>

                            <div className="border-t border-zinc-100 pt-3">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Particulars</p>
                                <div className="flex justify-between items-center text-sm py-1">
                                    <span className="font-bold text-zinc-700">{viewHistoricalReceipt.purpose.replace(/-/g, ' ')}</span>
                                    <span className="font-black text-emerald-600">${parseFloat(String(viewHistoricalReceipt.amountInUSD || '0')).toFixed(2)} USDT</span>
                                </div>
                            </div>

                            {viewHistoricalReceipt.walletAddress && (
                                <div className="p-3 bg-zinc-900 text-white rounded-xl text-xs font-mono break-all">
                                    <span className="text-[10px] text-zinc-400 font-sans block mb-1">Payment TRC-20 Wallet:</span>
                                    <span className="text-yellow-400 font-bold">{viewHistoricalReceipt.walletAddress}</span>
                                </div>
                            )}

                            <button
                                type="button"
                                onClick={() => setViewHistoricalReceipt(null)}
                                className="w-full py-3 bg-zinc-100 text-zinc-700 hover:bg-zinc-200 font-black text-xs uppercase tracking-wider rounded-xl transition-colors mt-2"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
