'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
    FileText,
    Send,
    CheckCircle2,
    User as UserIcon,
    RefreshCw,
    Calculator,
    Eye,
    Wallet,
    ChevronRight,
    X,
    AlertCircle,
    Building2,
    ShieldCheck,
    Copy,
    Check,
    Mail,
    ArrowRight,
    Sparkles,
    UploadCloud
} from 'lucide-react';
import api from '@/lib/api';

interface Applicant {
    id: number;
    fullName: string;
    email: string;
    candidateNumber?: string;
    subsidyPercentage?: number;
}

interface WalletAccount {
    id: number;
    bankName: string;
    accountName: string;
    accountNumber: string;
    currency: string;
    routingNumber?: string;
}

interface InvoiceRecord {
    id: number;
    applicantId: number;
    purpose: string;
    amountInUSD: number | string;
    walletAddress?: string | null;
    isPaid: boolean;
    createdAt: string;
    applicant?: {
        id: number;
        fullName: string;
        email: string;
        candidateNumber?: string;
    };
}

const INVOICE_TYPES = [
    {
        id: 'aveling-partial',
        label: 'Aveling - Partial Payment',
        sender: 'aveling',
        senderName: 'Aveling LMS Training',
        senderEmail: 'info@jobnexe.com',
        description: 'Partial Ticket Sponsorship Payment',
        note: 'Partial ticket courses and certification payment.',
        badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
        brandBg: 'bg-[#FFC700] text-black',
    },
    {
        id: 'aveling-complete-after-partial',
        label: 'Aveling - Final Payment (after partial)',
        sender: 'aveling',
        senderName: 'Aveling LMS Training',
        senderEmail: 'info@jobnexe.com',
        description: 'Final Ticket Sponsorship Payment',
        note: 'Completion of partial ticket courses and certification payment.',
        badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
        brandBg: 'bg-[#FFC700] text-black',
    },
    {
        id: 'aveling-complete',
        label: 'Aveling - Full Payment (10% Discount)',
        sender: 'aveling',
        senderName: 'Aveling LMS Training',
        senderEmail: 'info@jobnexe.com',
        description: 'Full Ticket Sponsorship Payment',
        note: 'Completion of full ticket courses and certification payment (10% discount applied).',
        badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
        brandBg: 'bg-[#FFC700] text-black',
    },
    {
        id: 'shipping',
        label: 'Aveling - Ticket Shipping Fee',
        sender: 'aveling',
        senderName: 'Aveling LMS Training',
        senderEmail: 'info@jobnexe.com',
        description: 'Ticket Shipping Fee',
        note: 'Physical shipping of your hardcopy tickets.',
        badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
        brandBg: 'bg-[#FFC700] text-black',
    },
    {
        id: 'visa-blue-collar',
        label: 'BlueCollar - Visa Fee Subsidy',
        sender: 'blue-collar',
        senderName: 'BlueCollar Infrastructure',
        senderEmail: 'donotreply@BlueCollar.com',
        description: 'Visa Fee Subsidy',
        note: 'Visa fee subsidy and infrastructure processing.',
        badgeColor: 'bg-blue-100 text-blue-900 border-blue-300',
        brandBg: 'bg-[#0b3486] text-white',
    },
];

export default function AdminInvoicesPage() {
    const [applicants, setApplicants] = useState<Applicant[]>([]);
    const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
    const [wallets, setWallets] = useState<WalletAccount[]>([]);
    const [loading, setLoading] = useState(true);
    const [dispatching, setDispatching] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    // Form inputs (Steps 1, 2, 3)
    const [selectedUserId, setSelectedUserId] = useState('');
    const [invoiceTypeId, setInvoiceTypeId] = useState('aveling-partial');
    const [amountUSD, setAmountUSD] = useState('');
    const [selectedWalletId, setSelectedWalletId] = useState('');
    const [invoiceFile, setInvoiceFile] = useState<File | null>(null);

    // Step 4 & 5: Preview modals
    const [showDraftPreviewModal, setShowDraftPreviewModal] = useState(false);
    const [previewPastInvoice, setPreviewPastInvoice] = useState<InvoiceRecord | null>(null);
    const [copiedWallet, setCopiedWallet] = useState(false);

    const fetchInvoices = async () => {
        try {
            const res = await api.get('/admin/invoices');
            setInvoices(Array.isArray(res.data) ? res.data : (res.data?.data || res.data?.rows || []));
        } catch (e) {
            console.error('Failed to fetch invoices', e);
        }
    };

    useEffect(() => {
        Promise.all([
            api.get('/admin/users'),
            api.get('/admin/bank-accounts'),
            fetchInvoices()
        ]).then(([usersRes, walletsRes]) => {
            const rawUsers = usersRes.data?.rows || usersRes.data?.users || (Array.isArray(usersRes.data) ? usersRes.data : []);
            setApplicants(rawUsers);
            const rawWallets = walletsRes.data?.rows || (Array.isArray(walletsRes.data) ? walletsRes.data : []);
            setWallets(rawWallets);
            // Default wallet if available
            if (rawWallets.length > 0 && !selectedWalletId) {
                setSelectedWalletId(rawWallets[0].id.toString());
            }
            setLoading(false);
        }).catch(err => {
            console.error('Failed to load initial data', err);
            setLoading(false);
        });
    }, []);

    // Derived values for Step 4 (System Drafts Invoice)
    const selectedUser = useMemo(() => {
        return applicants.find(a => a.id === parseInt(selectedUserId));
    }, [applicants, selectedUserId]);

    const selectedTypeConfig = useMemo(() => {
        return INVOICE_TYPES.find(t => t.id === invoiceTypeId) || INVOICE_TYPES[0];
    }, [invoiceTypeId]);

    const selectedWallet = useMemo(() => {
        return wallets.find(w => w.id === parseInt(selectedWalletId));
    }, [wallets, selectedWalletId]);

    const parsedAmount = useMemo(() => {
        const val = parseFloat(amountUSD);
        return isNaN(val) ? 0 : val;
    }, [amountUSD]);

    const isAveling = selectedTypeConfig.sender === 'aveling';

    // Step status indicator
    const isStep1Complete = !!selectedUserId && !!invoiceTypeId;
    const isStep2Complete = parsedAmount > 0;
    const isStep3Complete = !!selectedWalletId;
    const canPreview = isStep1Complete && isStep2Complete && isStep3Complete;

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopiedWallet(true);
        setTimeout(() => setCopiedWallet(false), 2000);
    };

    // Step 6 & 7: Admin Confirms & Sends → System saves attributes to DB & sends invoice
    const handleConfirmAndSend = async () => {
        if (!selectedUser || parsedAmount <= 0) return;

        setDispatching(true);
        setErrorMsg('');
        setSuccessMsg('');

        try {
            const formData = new FormData();
            formData.append('applicantId', selectedUser.id.toString());
            formData.append('email', selectedUser.email);
            formData.append('invoiceType', invoiceTypeId);
            formData.append('finalAmountDue', parsedAmount.toString());
            formData.append('partAmount', parsedAmount.toString());
            formData.append('totalCost', parsedAmount.toString());

            if (selectedUser.subsidyPercentage) {
                formData.append('subsidyPercentage', selectedUser.subsidyPercentage.toString());
            }

            if (selectedWallet) {
                formData.append('walletAddress', selectedWallet.accountNumber);
            }

            if (invoiceFile) {
                formData.append('invoiceFile', invoiceFile);
            }

            await api.post('/admin/invoices/dispatch', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setSuccessMsg(`Invoice successfully generated, saved to DB, and dispatched to ${selectedUser.fullName} via ${selectedTypeConfig.senderName}!`);
            setShowDraftPreviewModal(false);

            // Reset inputs
            setAmountUSD('');
            setInvoiceFile(null);

            // Refresh invoices history
            await fetchInvoices();
        } catch (err: any) {
            console.error('Failed to dispatch invoice:', err);
            setErrorMsg(err.response?.data?.message || 'Failed to dispatch invoice. Please verify details and try again.');
        } finally {
            setDispatching(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center font-bold text-zinc-400 uppercase tracking-widest text-xs gap-3">
                <RefreshCw className="h-4 w-4 animate-spin text-[#FFC700]" />
                Loading Invoice Module...
            </div>
        );
    }

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="border-b-2 border-zinc-200 pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-zinc-900 flex items-center gap-3">
                        <FileText className="h-8 w-8 text-[#FFC700]" />
                        Invoice Generator & Dispatch
                    </h1>
                    <p className="mt-1 text-sm font-medium text-zinc-500">
                        Select type, enter amount, select wallet, review drafted invoice, and dispatch directly via branded email.
                    </p>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-zinc-500 bg-zinc-100 px-3 py-1.5 rounded-lg border border-zinc-200 w-fit">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    TRC-20 USDT Gateway Active
                </div>
            </div>

            {/* Notification Banners */}
            {successMsg && (
                <div className="bg-emerald-50 border-2 border-emerald-200 p-4 rounded-xl flex items-start gap-3 animate-in fade-in">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-emerald-900 text-sm font-bold">{successMsg}</p>
                        <p className="text-emerald-700 text-xs mt-0.5">Attributes saved to database; recipient notified.</p>
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

            {/* Step Sequence Guide */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className={`p-3 rounded-xl border-2 transition-all ${isStep1Complete ? 'bg-emerald-50 border-emerald-300' : 'bg-white border-zinc-200'}`}>
                    <div className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Step 1</div>
                    <div className="text-xs font-black text-zinc-900 mt-0.5">Pick Type & Candidate</div>
                </div>
                <div className={`p-3 rounded-xl border-2 transition-all ${isStep2Complete ? 'bg-emerald-50 border-emerald-300' : 'bg-white border-zinc-200'}`}>
                    <div className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Step 2</div>
                    <div className="text-xs font-black text-zinc-900 mt-0.5">Enter Amount</div>
                </div>
                <div className={`p-3 rounded-xl border-2 transition-all ${isStep3Complete ? 'bg-emerald-50 border-emerald-300' : 'bg-white border-zinc-200'}`}>
                    <div className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Step 3</div>
                    <div className="text-xs font-black text-zinc-900 mt-0.5">Pick Wallet</div>
                </div>
                <div className={`p-3 rounded-xl border-2 transition-all ${canPreview ? 'bg-[#FFC700]/10 border-[#FFC700]' : 'bg-zinc-50 border-zinc-200 opacity-60'}`}>
                    <div className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Steps 4 - 7</div>
                    <div className="text-xs font-black text-zinc-900 mt-0.5">Draft, Preview & Send</div>
                </div>
            </div>

            {/* Main Configuration Form & Live Draft Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Form Steps 1, 2, 3 */}
                <div className="lg:col-span-7 bg-white border-2 border-zinc-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
                    <h2 className="text-sm font-black uppercase tracking-widest text-zinc-900 border-b-2 border-zinc-100 pb-4 flex items-center justify-between">
                        <span className="flex items-center gap-2">
                            <Calculator className="h-4 w-4 text-zinc-400" />
                            Invoice Parameters
                        </span>
                        <span className="text-[10px] font-bold text-zinc-400">Steps 1 to 3</span>
                    </h2>

                    {/* Step 1: Candidate & Invoice Type */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-zinc-700 mb-2">
                                1. Select Candidate
                            </label>
                            <select
                                value={selectedUserId}
                                onChange={(e) => setSelectedUserId(e.target.value)}
                                className="w-full bg-zinc-50 border-2 border-zinc-200 p-3.5 rounded-xl text-sm font-bold text-zinc-900 outline-none focus:border-[#FFC700] transition-all"
                            >
                                <option value="">-- Choose Candidate --</option>
                                {applicants.map(app => (
                                    <option key={app.id} value={app.id}>
                                        {app.candidateNumber || `CND-${10000 + app.id}`} — {app.fullName} ({app.email})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-zinc-700 mb-2">
                                2. Pick Invoice Type
                            </label>
                            <div className="space-y-2">
                                {INVOICE_TYPES.map(t => {
                                    const isSelected = invoiceTypeId === t.id;
                                    return (
                                        <div
                                            key={t.id}
                                            onClick={() => setInvoiceTypeId(t.id)}
                                            className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                                                isSelected
                                                    ? 'border-zinc-900 bg-zinc-50 ring-2 ring-zinc-900/10'
                                                    : 'border-zinc-200 hover:border-zinc-300 bg-white'
                                            }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <input
                                                    type="radio"
                                                    checked={isSelected}
                                                    onChange={() => setInvoiceTypeId(t.id)}
                                                    className="mt-1 accent-zinc-900"
                                                />
                                                <div>
                                                    <p className="text-xs font-black text-zinc-900">{t.label}</p>
                                                    <p className="text-[11px] text-zinc-500 mt-0.5">{t.note}</p>
                                                </div>
                                            </div>
                                            <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded border shrink-0 ${t.badgeColor}`}>
                                                {t.sender === 'aveling' ? 'Aveling' : 'BlueCollar'}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Step 2: Amount Due & Optional Attachment */}
                    <div className="border-t-2 border-zinc-100 pt-6 space-y-4">
                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-zinc-700 mb-2">
                                3. Enter Amount Due (USDT / USD)
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-3.5 text-zinc-500 font-bold">$</span>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={amountUSD}
                                    onChange={(e) => setAmountUSD(e.target.value)}
                                    placeholder="e.g. 750.00"
                                    className="w-full bg-zinc-50 border-2 border-zinc-200 p-3.5 pl-8 rounded-xl text-sm font-bold text-zinc-900 outline-none focus:border-[#FFC700] transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-zinc-700 mb-2">
                                Attach Official PDF (Optional)
                            </label>
                            <div className="relative">
                                <input
                                    type="file"
                                    accept=".pdf"
                                    onChange={(e) => setInvoiceFile(e.target.files?.[0] || null)}
                                    className="w-full bg-zinc-50 border-2 border-zinc-200 p-3 rounded-xl text-xs font-bold text-zinc-700 outline-none focus:border-[#FFC700] transition-all file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[11px] file:font-black file:bg-zinc-900 file:text-white hover:file:bg-zinc-800"
                                />
                            </div>
                            {invoiceFile && (
                                <p className="text-[11px] font-bold text-emerald-600 mt-1 flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3" /> Attached: {invoiceFile.name} ({(invoiceFile.size / 1024).toFixed(1)} KB)
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Step 3: Pick Receiving Wallet */}
                    <div className="border-t-2 border-zinc-100 pt-6">
                        <label className="block text-xs font-black uppercase tracking-widest text-zinc-700 mb-2">
                            4. Pick Receiving Wallet (TRC-20 USDT)
                        </label>
                        <select
                            value={selectedWalletId}
                            onChange={(e) => setSelectedWalletId(e.target.value)}
                            className="w-full bg-zinc-50 border-2 border-zinc-200 p-3.5 rounded-xl text-sm font-bold text-zinc-900 outline-none focus:border-[#FFC700] transition-all"
                        >
                            <option value="">-- Choose Wallet --</option>
                            {wallets.map(w => (
                                <option key={w.id} value={w.id}>
                                    {w.bankName} - {w.accountName} ({w.currency})
                                </option>
                            ))}
                        </select>

                        {selectedWallet && (
                            <div className="mt-3 p-3 bg-zinc-900 text-white rounded-xl text-xs font-mono flex items-center justify-between">
                                <div className="truncate mr-2">
                                    <span className="text-zinc-400 text-[10px] uppercase font-sans font-bold block">Wallet Address:</span>
                                    <span className="break-all font-bold text-yellow-400">{selectedWallet.accountNumber}</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => copyToClipboard(selectedWallet.accountNumber)}
                                    className="p-1.5 hover:bg-zinc-800 rounded text-zinc-300 hover:text-white shrink-0"
                                    title="Copy address"
                                >
                                    {copiedWallet ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Step 4 (System Drafts Invoice) & Step 5 Trigger */}
                <div className="lg:col-span-5 space-y-6">
                    <div className="bg-white border-2 border-zinc-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
                        <div className="flex items-center justify-between border-b-2 border-zinc-100 pb-4">
                            <div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-[#FFC700] bg-black px-2 py-0.5 rounded">
                                    Step 4
                                </span>
                                <h3 className="text-sm font-black uppercase tracking-widest text-zinc-900 mt-1 flex items-center gap-1.5">
                                    <Sparkles className="h-4 w-4 text-[#FFC700]" />
                                    System Drafted Invoice
                                </h3>
                            </div>
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                                Live Calculation
                            </span>
                        </div>

                        {/* System Drafted Card */}
                        <div className="border-2 border-dashed border-zinc-300 rounded-xl p-5 bg-zinc-50/70 space-y-4">
                            {/* Issuer Badge */}
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Issuer / Sender:</span>
                                <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md ${selectedTypeConfig.brandBg}`}>
                                    {selectedTypeConfig.senderName}
                                </span>
                            </div>

                            {/* Candidate Info */}
                            <div className="pt-2 border-t border-zinc-200 text-xs">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 block mb-1">Billed To:</span>
                                {selectedUser ? (
                                    <div>
                                        <p className="font-black text-zinc-900">{selectedUser.fullName}</p>
                                        <p className="text-zinc-500">{selectedUser.email}</p>
                                        <p className="text-[10px] text-zinc-400 font-mono mt-0.5">
                                            {selectedUser.candidateNumber || `CND-${10000 + selectedUser.id}`}
                                        </p>
                                    </div>
                                ) : (
                                    <p className="text-zinc-400 italic">Select a candidate in Step 1</p>
                                )}
                            </div>

                            {/* Purpose Description */}
                            <div className="pt-2 border-t border-zinc-200 text-xs">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 block mb-1">Purpose / Scope:</span>
                                <p className="font-bold text-zinc-800">{selectedTypeConfig.description}</p>
                                <p className="text-[11px] text-zinc-500 mt-0.5">{selectedTypeConfig.note}</p>
                            </div>

                            {/* Receiving Network */}
                            <div className="pt-2 border-t border-zinc-200 text-xs">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 block mb-1">Destination Wallet:</span>
                                {selectedWallet ? (
                                    <p className="font-mono text-[11px] text-zinc-800 break-all font-bold">
                                        {selectedWallet.bankName} • {selectedWallet.accountNumber}
                                    </p>
                                ) : (
                                    <p className="text-zinc-400 italic">Select a wallet in Step 3</p>
                                )}
                            </div>

                            {/* Total Due Callout */}
                            <div className="pt-3 border-t-2 border-zinc-200 flex items-center justify-between bg-white p-3 rounded-lg border">
                                <span className="text-xs font-black uppercase tracking-widest text-zinc-700">Amount Due:</span>
                                <span className="text-xl font-black text-zinc-900">
                                    ${parsedAmount.toFixed(2)} <span className="text-xs font-bold text-zinc-500">USDT</span>
                                </span>
                            </div>
                        </div>

                        {/* Step 5 Action: Preview Invoice Modal */}
                        <button
                            type="button"
                            disabled={!canPreview}
                            onClick={() => setShowDraftPreviewModal(true)}
                            className="w-full inline-flex items-center justify-center gap-2 bg-zinc-900 text-white font-black text-xs py-4 rounded-xl hover:bg-zinc-800 transition-all uppercase tracking-widest shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <Eye className="h-4 w-4 text-[#FFC700]" />
                            Step 5: Preview Invoice Before Sending
                        </button>

                        {!canPreview && (
                            <p className="text-[11px] text-zinc-400 text-center font-medium">
                                Complete Steps 1 to 3 above to unlock draft invoice preview.
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Invoices History Table (Steps 6 & 7 outcomes saved here) */}
            <div className="bg-white border-2 border-zinc-200 rounded-2xl p-8 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b-2 border-zinc-100 pb-4">
                    <div>
                        <h2 className="text-sm font-black uppercase tracking-widest text-zinc-900">
                            Dispatched Invoices History
                        </h2>
                        <p className="text-xs text-zinc-500 mt-0.5">
                            All invoices saved to database with real-time payment status.
                        </p>
                    </div>
                    <button
                        onClick={fetchInvoices}
                        className="inline-flex items-center gap-1 text-xs font-bold text-zinc-600 hover:text-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-50 transition-colors w-fit"
                    >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Refresh List
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-zinc-50 border-b-2 border-zinc-200">
                            <tr>
                                <th className="p-4 font-black uppercase tracking-widest text-[10px] text-zinc-500">Invoice ID</th>
                                <th className="p-4 font-black uppercase tracking-widest text-[10px] text-zinc-500">Date</th>
                                <th className="p-4 font-black uppercase tracking-widest text-[10px] text-zinc-500">Candidate</th>
                                <th className="p-4 font-black uppercase tracking-widest text-[10px] text-zinc-500">Purpose / Type</th>
                                <th className="p-4 font-black uppercase tracking-widest text-[10px] text-zinc-500 text-right">Amount (USD)</th>
                                <th className="p-4 font-black uppercase tracking-widest text-[10px] text-zinc-500 text-center">Status</th>
                                <th className="p-4 font-black uppercase tracking-widest text-[10px] text-zinc-500 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                            {invoices.length > 0 ? invoices.map((inv) => {
                                const isBlueCollar = inv.purpose === 'visa-blue-collar';
                                return (
                                    <tr key={inv.id} className="hover:bg-zinc-50/50 transition-colors">
                                        <td className="p-4 font-bold text-zinc-900">
                                            #{inv.id.toString().padStart(6, '0')}
                                        </td>
                                        <td className="p-4 text-zinc-500 text-xs">
                                            {new Date(inv.createdAt).toLocaleDateString()}
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
                                            <span className={`px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-wider border ${
                                                isBlueCollar
                                                    ? 'bg-blue-50 text-blue-800 border-blue-200'
                                                    : 'bg-amber-50 text-amber-800 border-amber-200'
                                            }`}>
                                                {inv.purpose.replace(/-/g, ' ')}
                                            </span>
                                        </td>
                                        <td className="p-4 font-black text-right text-zinc-900">
                                            ${parseFloat(String(inv.amountInUSD || '0')).toFixed(2)}{' '}
                                            <span className="text-[10px] text-zinc-400 font-bold">USDT</span>
                                        </td>
                                        <td className="p-4 text-center">
                                            {inv.isPaid ? (
                                                <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full">
                                                    <CheckCircle2 className="w-3 h-3" /> Paid
                                                </span>
                                            ) : (
                                                <span className="inline-flex text-[10px] font-black uppercase tracking-widest bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full">
                                                    Unpaid
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end items-center gap-2">
                                                <button
                                                    onClick={() => setPreviewPastInvoice(inv)}
                                                    className="bg-white border-2 border-zinc-200 text-zinc-700 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded hover:bg-zinc-50 transition-colors inline-flex items-center gap-1"
                                                >
                                                    <Eye className="w-3 h-3" /> Preview
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
                                                    <span className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest px-2 py-1">
                                                        Completed
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan={7} className="p-8 text-center text-zinc-500 font-medium">
                                        No invoices generated yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* STEP 5 MODAL: Live Invoice Preview Before Dispatching */}
            {showDraftPreviewModal && selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-zinc-200 my-8">
                        {/* Branded Modal Header */}
                        <div className={`p-6 relative ${selectedTypeConfig.brandBg}`}>
                            <button
                                onClick={() => setShowDraftPreviewModal(false)}
                                className="absolute top-5 right-5 text-current opacity-70 hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-black/10"
                            >
                                <X className="h-5 w-5" />
                            </button>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-black/20 text-current">
                                    Official Invoice Preview
                                </span>
                                <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-black/10 text-current">
                                    Sent via {selectedTypeConfig.senderName}
                                </span>
                            </div>
                            <h3 className="text-2xl font-black tracking-tight">{selectedTypeConfig.description}</h3>
                            <p className="text-xs opacity-80 mt-0.5">Email Sender: {selectedTypeConfig.senderEmail}</p>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 sm:p-8 space-y-6">
                            {/* Candidate & Dispatch Meta */}
                            <div className="grid grid-cols-2 gap-4 pb-5 border-b border-zinc-200">
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">Billed To (Applicant)</p>
                                    <p className="font-bold text-zinc-900 text-sm">{selectedUser.fullName}</p>
                                    <p className="text-xs text-zinc-500">{selectedUser.email}</p>
                                    <p className="text-[10px] font-mono text-zinc-400 mt-1">
                                        ID: {selectedUser.candidateNumber || `CND-${10000 + selectedUser.id}`}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">Date Drafted</p>
                                    <p className="font-bold text-zinc-900 text-sm">{new Date().toLocaleDateString()}</p>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mt-3 mb-1">Protocol</p>
                                    <span className="inline-block text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-100 text-zinc-700">
                                        TRC-20 USDT
                                    </span>
                                </div>
                            </div>

                            {/* Itemized Line Items */}
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-3">Line Items & Statement</p>
                                <div className="border border-zinc-200 rounded-xl overflow-hidden">
                                    <div className="bg-zinc-50 p-3 text-[10px] font-black uppercase tracking-widest text-zinc-500 flex justify-between">
                                        <span>Item Description</span>
                                        <span className="text-right">Amount (USD)</span>
                                    </div>
                                    <div className="p-4 flex justify-between items-center text-sm border-t border-zinc-100">
                                        <div>
                                            <p className="font-bold text-zinc-800">{selectedTypeConfig.description}</p>
                                            <p className="text-xs text-zinc-500 mt-0.5">{selectedTypeConfig.note}</p>
                                        </div>
                                        <span className="font-black text-zinc-900">${parsedAmount.toFixed(2)} USDT</span>
                                    </div>
                                </div>
                            </div>

                            {/* Total Due Card */}
                            <div className="bg-zinc-50 border-2 border-zinc-200 p-4 rounded-xl flex justify-between items-center">
                                <div>
                                    <span className="text-xs font-black uppercase tracking-widest text-zinc-700 block">
                                        Total Final Amount Due
                                    </span>
                                    <span className="text-[10px] text-zinc-400">Fixed rate pegged 1:1 to USDT</span>
                                </div>
                                <span className="text-2xl font-black text-zinc-900">
                                    ${parsedAmount.toFixed(2)}{' '}
                                    <span className="text-xs font-bold text-zinc-500">USDT</span>
                                </span>
                            </div>

                            {/* Payment Instructions & Wallet */}
                            <div className="bg-zinc-900 text-white p-5 rounded-xl space-y-2">
                                <div className="flex items-center justify-between">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-yellow-400">
                                        Payment Instructions (Candidate Email Copy)
                                    </p>
                                    <span className="text-[10px] font-bold text-zinc-400">TRON Network</span>
                                </div>
                                <p className="text-xs text-zinc-300">
                                    Please send the Final Amount Due as <strong>USDT on the TRC-20 Tron network</strong>.
                                </p>
                                {selectedWallet ? (
                                    <div className="p-3 bg-zinc-800 rounded-lg text-xs font-mono break-all flex items-center justify-between gap-2 border border-zinc-700">
                                        <div>
                                            <span className="text-[10px] text-zinc-400 font-sans block">USDT TRC-20 Address:</span>
                                            <span className="text-yellow-400 font-bold">{selectedWallet.accountNumber}</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => copyToClipboard(selectedWallet.accountNumber)}
                                            className="p-2 hover:bg-zinc-700 rounded text-zinc-300 hover:text-white shrink-0"
                                            title="Copy address"
                                        >
                                            {copiedWallet ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                                        </button>
                                    </div>
                                ) : (
                                    <p className="text-xs text-rose-400">Warning: No wallet selected.</p>
                                )}
                                <p className="text-[10px] text-zinc-400">
                                    Ensure candidate uses the TRC-20 network to avoid loss of funds.
                                </p>
                            </div>

                            {/* Attachment info */}
                            {invoiceFile && (
                                <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 font-bold">
                                    <FileText className="w-4 h-4 text-blue-600" />
                                    <span>Attached Document: {invoiceFile.name}</span>
                                </div>
                            )}

                            {/* Action Buttons (Step 5 -> Step 6/7) */}
                            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-zinc-200">
                                <button
                                    type="button"
                                    onClick={() => setShowDraftPreviewModal(false)}
                                    className="w-full sm:w-auto px-5 py-3 border-2 border-zinc-200 text-zinc-700 font-black text-xs rounded-xl hover:bg-zinc-50 transition-colors uppercase tracking-wider"
                                >
                                    ← Back to Edit
                                </button>
                                <button
                                    type="button"
                                    onClick={handleConfirmAndSend}
                                    disabled={dispatching}
                                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#FFC700] text-black font-black text-xs px-6 py-3 rounded-xl hover:bg-yellow-400 transition-all uppercase tracking-widest shadow-md disabled:opacity-50"
                                >
                                    {dispatching ? (
                                        <>
                                            <RefreshCw className="h-4 w-4 animate-spin" />
                                            Saving & Sending...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="h-4 w-4" />
                                            Confirm & Send Invoice
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal for viewing past dispatched invoice */}
            {previewPastInvoice && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in zoom-in-95 duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-zinc-200">
                        {/* Header */}
                        <div className={`p-6 relative ${previewPastInvoice.purpose === 'visa-blue-collar' ? 'bg-[#0b3486] text-white' : 'bg-zinc-900 text-white'}`}>
                            <button
                                onClick={() => setPreviewPastInvoice(null)}
                                className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                            <h3 className="text-xs font-black uppercase tracking-widest opacity-70 mb-1">
                                Invoice Record
                            </h3>
                            <div className="text-2xl font-black">
                                #{previewPastInvoice.id.toString().padStart(6, '0')}
                            </div>
                        </div>

                        {/* Body */}
                        <div className="p-6 space-y-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">Billed To</p>
                                    <p className="font-bold text-zinc-900">{previewPastInvoice.applicant?.fullName || `User #${previewPastInvoice.applicantId}`}</p>
                                    <p className="text-xs text-zinc-500">{previewPastInvoice.applicant?.email}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">Date Issued</p>
                                    <p className="font-bold text-zinc-900 text-sm">{new Date(previewPastInvoice.createdAt).toLocaleDateString()}</p>
                                    <div className="mt-2">
                                        <span className={`px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest rounded-full inline-flex items-center gap-1 ${
                                            previewPastInvoice.isPaid ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                        }`}>
                                            {previewPastInvoice.isPaid ? <><CheckCircle2 className="w-3 h-3" /> Paid</> : 'Unpaid'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2 border-b border-zinc-100 pb-1">Line Items</p>
                                <div className="flex justify-between items-center py-2 text-sm">
                                    <span className="font-bold text-zinc-700">{previewPastInvoice.purpose.replace(/-/g, ' ')}</span>
                                    <span className="font-black text-zinc-900">${parseFloat(String(previewPastInvoice.amountInUSD || '0')).toFixed(2)} USDT</span>
                                </div>
                            </div>

                            {previewPastInvoice.walletAddress && (
                                <div className="p-3 bg-zinc-900 text-white rounded-xl text-xs font-mono break-all">
                                    <span className="text-[10px] text-zinc-400 font-sans block mb-1">TRC-20 Receiving Wallet:</span>
                                    <span className="text-yellow-400 font-bold">{previewPastInvoice.walletAddress}</span>
                                </div>
                            )}

                            <div className="bg-zinc-50 border-2 border-zinc-200 p-4 rounded-xl flex justify-between items-center">
                                <span className="text-xs font-black uppercase tracking-widest text-zinc-900">Total Recorded</span>
                                <span className="text-xl font-black text-[#FFC700]">
                                    ${parseFloat(String(previewPastInvoice.amountInUSD || '0')).toFixed(2)} USDT
                                </span>
                            </div>

                            <button
                                type="button"
                                onClick={() => setPreviewPastInvoice(null)}
                                className="w-full py-3 bg-zinc-100 text-zinc-700 hover:bg-zinc-200 font-black text-xs uppercase tracking-wider rounded-xl transition-colors"
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
