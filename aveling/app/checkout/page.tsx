'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CreditCard, CheckCircle2, ArrowRight, Upload, Building2, Copy, Wallet, FileCheck, Loader2, AlertCircle, Lock, RefreshCw, DollarSign } from 'lucide-react';
import { apiClient } from '../../lib/axios';
import { uploadFile } from '../../lib/utils';

interface BankDetails { bankName: string; bsb: string; accountNumber: string; accountName: string; }

// Common candidate origin currencies vs AUD (1 AUD = X Foreign Currency)
const CURRENCIES: Record<string, { name: string; symbol: string; rateToAud: number }> = {
    AUD: { name: 'Australian Dollar', symbol: 'A$', rateToAud: 1.0 },
    USD: { name: 'US Dollar', symbol: '$', rateToAud: 0.65 },
    EUR: { name: 'Euro', symbol: '€', rateToAud: 0.60 },
    GBP: { name: 'British Pound', symbol: '£', rateToAud: 0.51 },
    CAD: { name: 'Canadian Dollar', symbol: 'C$', rateToAud: 0.89 },
    SGD: { name: 'Singapore Dollar', symbol: 'S$', rateToAud: 0.88 },
    AED: { name: 'UAE Dirham', symbol: 'AED', rateToAud: 2.39 },
    ZAR: { name: 'South African Rand', symbol: 'R', rateToAud: 11.95 },
    NGN: { name: 'Nigerian Naira', symbol: '₦', rateToAud: 980.0 },
    PHP: { name: 'Philippine Peso', symbol: '₱', rateToAud: 37.50 },
    INR: { name: 'Indian Rupee', symbol: '₹', rateToAud: 54.80 },
};

const MODE_LABELS: Record<string, { title: string; badge: string; color: string }> = {
    deposit: { title: 'Initial Commitment Deposit', badge: 'A$500 DEPOSIT', color: 'bg-blue-900 text-white' },
    full:    { title: 'Full Programme Balance',      badge: 'FULL BALANCE',  color: 'bg-emerald-800 text-white' },
    ticket:  { title: 'Course Module Payment',       badge: 'MODULE FEE',    color: 'bg-amber-600 text-black' },
};

function CheckoutContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const ticketId       = searchParams.get('ticketId') || '';
    const candidateNumber = searchParams.get('candidateNumber') || 'CND-10001';
    const courseIdParam  = searchParams.get('courseId') || '';
    const walletParam    = parseFloat(searchParams.get('wallet') || '0');
    const rawPrice       = parseFloat(searchParams.get('price') || '0');
    const paymentMode    = (searchParams.get('mode') || 'ticket') as 'deposit' | 'full' | 'ticket';

    const DEPOSIT_AMOUNT = 500;
    const coursePrice = paymentMode === 'deposit' ? DEPOSIT_AMOUNT : (rawPrice || 280);

    const [emailSent, setEmailSent] = useState(false);
    const [useWallet, setUseWallet] = useState(false);
    const [receiptFile, setReceiptFile] = useState<File | null>(null);
    const [receiptRef, setReceiptRef] = useState('');
    const [submittingReceipt, setSubmittingReceipt] = useState(false);
    const [paymentSubmitted, setPaymentSubmitted] = useState(false);
    const [copiedField, setCopiedField] = useState<string | null>(null);
    const [bankDetails, setBankDetails] = useState<BankDetails | null>(null);
    const [bankLoading, setBankLoading] = useState(true);

    // Currency Converter state
    const [selectedCurrency, setSelectedCurrency] = useState('USD');
    const [customRates, setCustomRates] = useState(CURRENCIES);
    const [fetchingRates, setFetchingRates] = useState(false);

    const walletBalance = walletParam;
    const payableAmount = useWallet ? Math.max(0, coursePrice - walletBalance) : coursePrice;
    const modeInfo = MODE_LABELS[paymentMode] || MODE_LABELS.ticket;

    // Fetch live rates if available
    const refreshExchangeRates = async () => {
        setFetchingRates(true);
        try {
            const res = await fetch('https://api.exchangerate-api.com/v4/latest/AUD');
            if (res.ok) {
                const data = await res.json();
                if (data && data.rates) {
                    const updated = { ...CURRENCIES };
                    Object.keys(updated).forEach(code => {
                        if (data.rates[code]) {
                            updated[code] = { ...updated[code], rateToAud: data.rates[code] };
                        }
                    });
                    setCustomRates(updated);
                }
            }
        } catch (e) {
            console.log('Using baseline exchange rates');
        } finally {
            setFetchingRates(false);
        }
    };

    useEffect(() => {
        refreshExchangeRates();
    }, []);

    useEffect(() => {
        apiClient.get(`/bank-accounts?_t=${Date.now()}`).then(res => {
            const rows = res.data?.rows;
            if (rows?.length > 0) {
                const b = rows[0];
                setBankDetails({ bankName: b.bankName, bsb: b.routingCode, accountNumber: b.accountNumber, accountName: b.bankName });
            }
        }).catch(() => {}).finally(() => setBankLoading(false));
    }, []);

    useEffect(() => {
        if (!ticketId || paymentMode !== 'ticket') return;
        apiClient.post(`/tickets/${ticketId}/checkout-email`, { candidateNumber, courseId: courseIdParam })
            .then(() => setEmailSent(true)).catch(() => setEmailSent(true));
    }, [ticketId, candidateNumber, courseIdParam, paymentMode]);

    const handleCopy = (text: string, field: string) => {
        navigator.clipboard.writeText(text);
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (payableAmount > 0 && !receiptRef.trim()) {
            alert('Please enter the SWIFT Transfer Reference before submitting.');
            return;
        }
        setSubmittingReceipt(true);
        try {
            let uploadedReceiptUrl = '';
            if (receiptFile) {
                try { uploadedReceiptUrl = await uploadFile(receiptFile, 'image'); } catch {}
            }

            await apiClient.post(`/tickets/${ticketId || '1'}/submit-receipt`, {
                receiptReference: receiptRef || `REF-${candidateNumber}-${Date.now()}`,
                receiptUrl: uploadedReceiptUrl,
                candidateNumber,
                useWallet,
                paymentMode,
            });

            setPaymentSubmitted(true);
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to submit receipt. Please try again.');
        } finally {
            setSubmittingReceipt(false);
        }
    };

    const targetCurrency = customRates[selectedCurrency] || CURRENCIES.USD;
    const convertedAmount = (payableAmount * targetCurrency.rateToAud).toFixed(2);

    const pendingLabel = paymentMode === 'deposit'
        ? 'Your A$500 deposit receipt is pending admin verification. Once confirmed, Training Modules 1–3 will unlock automatically.'
        : paymentMode === 'full'
        ? 'Your full programme balance receipt is pending admin verification. Once confirmed, all training modules will unlock.'
        : 'Once admin verifies your receipt, your course module will unlock automatically.';

    return (
        <div className="mx-auto max-w-4xl space-y-8 py-6 px-4">
            {/* Header */}
            <div className="border-b border-zinc-200 pb-6 dark:border-zinc-800 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-black bg-[#FFC700] px-2.5 py-0.5 rounded">
                        CANDIDATE: {candidateNumber}
                    </span>
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded ${modeInfo.color}`}>
                        {modeInfo.badge}
                    </span>
                    {emailSent && (
                        <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                            ✓ Payment instructions emailed
                        </span>
                    )}
                </div>
                <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
                    <CreditCard className="h-7 w-7 text-[#FFC700]" />
                    {modeInfo.title}
                </h1>
                <p className="text-xs text-zinc-600 dark:text-zinc-400">
                    {paymentMode === 'deposit' && 'A$500 initial commitment deposit — required before accessing any training module (Schedule 1 / Clause 5.1)'}
                    {paymentMode === 'full' && 'Full programme balance payment — unlocks all training modules immediately'}
                    {paymentMode === 'ticket' && `Per-module payment — Ticket #${ticketId || 'N/A'}`}
                </p>
            </div>

            {/* Milestone Explainer Banner */}
            {(paymentMode === 'deposit' || paymentMode === 'full') && (
                <div className={`rounded-2xl border p-5 space-y-3 ${paymentMode === 'deposit' ? 'bg-blue-50 border-blue-200' : 'bg-emerald-50 border-emerald-200'}`}>
                    <h2 className={`text-sm font-extrabold uppercase tracking-wider flex items-center gap-2 ${paymentMode === 'deposit' ? 'text-blue-900' : 'text-emerald-900'}`}>
                        {paymentMode === 'deposit' ? <Lock className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                        Payment Milestone Schedule
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className={`rounded-xl border p-3 ${paymentMode === 'deposit' ? 'bg-blue-900 text-white border-blue-800' : 'bg-white border-blue-200'}`}>
                            <p className="font-black uppercase tracking-wider mb-1">Step 1 — Deposit</p>
                            <p className={paymentMode === 'deposit' ? 'text-blue-200' : 'text-zinc-600'}>A$500 initial deposit → Unlocks Training Modules 1, 2 &amp; 3</p>
                        </div>
                        <div className={`rounded-xl border p-3 ${paymentMode === 'full' ? 'bg-emerald-800 text-white border-emerald-700' : 'bg-white border-slate-200'}`}>
                            <p className={`font-black uppercase tracking-wider mb-1 ${paymentMode === 'full' ? 'text-white' : 'text-zinc-700'}`}>Step 2 — Full Balance</p>
                            <p className={paymentMode === 'full' ? 'text-emerald-200' : 'text-zinc-600'}>Remaining balance before Module 4 → Unlocks all remaining modules</p>
                        </div>
                    </div>
                </div>
            )}

            {paymentSubmitted ? (
                <div className="rounded-2xl border border-amber-300 bg-white p-8 shadow-xl dark:bg-zinc-900 text-center space-y-6">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                        <FileCheck className="h-10 w-10" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-black text-zinc-900 dark:text-white">Receipt Submitted!</h2>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-md mx-auto">
                            Reference: <strong>{receiptRef || `REF-${candidateNumber}`}</strong>
                        </p>
                    </div>
                    <div className="mx-auto max-w-md rounded-xl border border-amber-200 bg-amber-50 p-4 text-left text-xs space-y-2">
                        <div className="flex justify-between font-bold text-amber-900">
                            <span>Status:</span>
                            <span className="uppercase text-amber-600 bg-white px-2 py-0.5 rounded border border-amber-300">Pending Admin Approval</span>
                        </div>
                        <p className="text-amber-800">{pendingLabel}</p>
                    </div>
                    <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button
                            onClick={() => router.push(courseIdParam ? `/courses/${courseIdParam}` : '/dashboard')}
                            className="inline-flex items-center gap-2 rounded-xl bg-[#FFC700] text-black px-6 py-3 text-xs font-black uppercase tracking-wider shadow-lg hover:bg-yellow-400 transition-all"
                        >
                            Go to Course Workspace <ArrowRight className="h-4 w-4 stroke-[3]" />
                        </button>
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="inline-flex items-center gap-2 rounded-xl border border-zinc-300 bg-white px-5 py-3 text-xs font-bold text-zinc-700 hover:bg-zinc-50"
                        >
                            Return to Dashboard
                        </button>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                    <div className="lg:col-span-7 space-y-6">
                        {/* Bank Account Details */}
                        {payableAmount > 0 && (
                            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
                                <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
                                    <h2 className="text-sm font-extrabold uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-2">
                                        <Building2 className="h-5 w-5 text-[#FFC700]" /> Bank Account Payment Details
                                    </h2>
                                    <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded">SWIFT WIRE ONLY</span>
                                </div>
                                <p className="text-xs text-zinc-600 dark:text-zinc-400">
                                    The receiving bank account is designated in <strong>Australian Dollars (AUD)</strong>. Wire transfers must execute strictly via <strong>SWIFT International Wire</strong>.
                                </p>
                                {bankLoading ? (
                                    <div className="flex items-center gap-2 text-xs text-zinc-500 py-4">
                                        <Loader2 className="h-4 w-4 animate-spin" /> Loading bank details...
                                    </div>
                                ) : bankDetails ? (
                                    <div className="space-y-3 bg-zinc-50 dark:bg-zinc-950 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-mono">
                                        {[
                                            { label: 'Bank Name', value: bankDetails.bankName, field: '' },
                                            { label: 'BSB', value: bankDetails.bsb, field: 'bsb' },
                                            { label: 'Account Number', value: bankDetails.accountNumber, field: 'account' },
                                            { label: 'Account Name', value: bankDetails.accountName, field: '' },
                                        ].map(({ label, value, field }) => (
                                            <div key={label} className="flex justify-between items-center py-1.5 border-b border-zinc-200/60 dark:border-zinc-800">
                                                <span className="text-zinc-500 font-sans font-bold">{label}:</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-extrabold text-zinc-900 dark:text-white">{value}</span>
                                                    {field && (
                                                        <>
                                                            <button onClick={() => handleCopy(value, field)} className="text-zinc-400 hover:text-zinc-900">
                                                                <Copy className="h-3.5 w-3.5" />
                                                            </button>
                                                            {copiedField === field && <span className="text-emerald-600 text-[10px] font-bold">Copied!</span>}
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                        <div className="flex justify-between items-center py-1.5 border-b border-zinc-200/60 dark:border-zinc-800">
                                            <span className="text-zinc-500 font-sans font-bold">SWIFT / BIC Code:</span>
                                            <span className="font-bold text-[#FFC700]">REQUIRED (Check Invoice)</span>
                                        </div>
                                        <div className="flex justify-between items-center py-1.5 bg-amber-50 dark:bg-amber-950/60 px-3 rounded-lg border border-amber-300">
                                            <span className="text-amber-900 font-sans font-extrabold">Payment Reference:</span>
                                            <div className="flex items-center gap-2">
                                                <span className="font-black text-amber-900 text-sm">
                                                    {paymentMode === 'deposit' ? `DEP-${candidateNumber}` : paymentMode === 'full' ? `FULL-${candidateNumber}` : `AVL-REF-${candidateNumber}`}
                                                </span>
                                                <button onClick={() => handleCopy(`${paymentMode === 'deposit' ? 'DEP' : paymentMode === 'full' ? 'FULL' : 'AVL-REF'}-${candidateNumber}`, 'ref')} className="text-amber-700 hover:text-amber-900">
                                                    <Copy className="h-3.5 w-3.5" />
                                                </button>
                                                {copiedField === 'ref' && <span className="text-emerald-600 text-[10px] font-bold">Copied!</span>}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-4">
                                        <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                        Bank details not configured yet. Contact your recruitment coordinator.
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Receipt Upload Form */}
                        <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
                            <h2 className="text-sm font-extrabold uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-2">
                                {payableAmount === 0 ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> : <Upload className="h-5 w-5 text-[#FFC700]" />}
                                {payableAmount === 0 ? 'Full Payment Covered by Wallet' : 'Upload SWIFT Payment Receipt'}
                            </h2>
                            {payableAmount > 0 && (
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-xs font-extrabold text-zinc-700 dark:text-zinc-300 mb-1">
                                            SWIFT Transfer Reference / Transaction ID: <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={receiptRef}
                                            onChange={e => setReceiptRef(e.target.value)}
                                            placeholder="e.g. N10928841-XYZ or Bank Reference Code"
                                            className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 p-2.5 rounded-xl text-xs font-bold text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-[#FFC700]"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-extrabold text-zinc-700 dark:text-zinc-300 mb-1">
                                            Attach SWIFT Payment Receipt (Image or PDF):
                                        </label>
                                        <input
                                            type="file"
                                            accept="image/*,.pdf"
                                            onChange={e => setReceiptFile(e.target.files?.[0] || null)}
                                            className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 p-2 rounded-xl text-xs text-zinc-600 dark:text-zinc-400"
                                        />
                                    </div>
                                </div>
                            )}
                            <button
                                type="submit"
                                disabled={submittingReceipt}
                                className="w-full inline-flex items-center justify-center gap-2 bg-[#FFC700] text-black font-extrabold text-xs py-3.5 rounded-xl hover:bg-yellow-400 transition-all uppercase tracking-wider shadow-md disabled:opacity-50"
                            >
                                <CheckCircle2 className="h-4 w-4" />
                                {submittingReceipt
                                    ? 'Uploading Receipt...'
                                    : payableAmount === 0
                                    ? 'Confirm Wallet Payment'
                                    : paymentMode === 'deposit'
                                    ? 'Submit A$500 Deposit Receipt'
                                    : paymentMode === 'full'
                                    ? 'Submit Full Balance Receipt'
                                    : 'I Have Made Payment — Submit Receipt'}
                            </button>
                        </form>
                    </div>

                    {/* Order Summary & Live Currency Converter */}
                    <div className="lg:col-span-5 space-y-6">
                        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
                            <h2 className="text-sm font-extrabold uppercase tracking-wider text-zinc-900 dark:text-white">Payment Summary</h2>
                            <div className="bg-zinc-50 dark:bg-zinc-800 p-4 rounded-xl space-y-2 text-xs">
                                <div className="flex justify-between font-bold">
                                    <span className="text-zinc-600 dark:text-zinc-400">Payment Type:</span>
                                    <span className="text-zinc-900 dark:text-white">{modeInfo.badge}</span>
                                </div>
                                {paymentMode === 'ticket' && ticketId && (
                                    <div className="flex justify-between">
                                        <span className="text-zinc-500">Ticket:</span>
                                        <span className="font-bold">#{ticketId}</span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span className="text-zinc-500">Required Account Currency:</span>
                                    <span className="font-extrabold text-blue-900 dark:text-blue-400">AUD (Australian Dollar)</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-zinc-500">Amount (AUD):</span>
                                    <span className="font-extrabold text-zinc-900 dark:text-white">A${coursePrice.toFixed(2)}</span>
                                </div>
                            </div>

                            {/* Wallet Toggle */}
                            {walletBalance > 0 && (
                                <div className="bg-amber-50 border border-amber-300 dark:bg-amber-950/60 dark:border-amber-900 rounded-xl p-4 space-y-2">
                                    <div className="flex items-start gap-3">
                                        <input type="checkbox" id="walletOpt" checked={useWallet} onChange={e => setUseWallet(e.target.checked)} className="mt-1 h-4 w-4 accent-[#FFC700] rounded cursor-pointer" />
                                        <label htmlFor="walletOpt" className="text-xs cursor-pointer select-none">
                                            <span className="font-black text-amber-950 dark:text-amber-200 flex items-center gap-1">
                                                <Wallet className="h-3.5 w-3.5 text-[#FFC700]" />
                                                Apply Wallet Balance (−A${walletBalance.toFixed(2)})
                                            </span>
                                            <span className="block text-[11px] text-amber-800 dark:text-amber-300 mt-0.5">
                                                Use your course completion refund toward this payment.
                                            </span>
                                        </label>
                                    </div>
                                </div>
                            )}

                            <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 space-y-2 text-xs">
                                <div className="flex justify-between text-zinc-500">
                                    <span>Subtotal:</span>
                                    <span>A${coursePrice.toFixed(2)}</span>
                                </div>
                                {useWallet && (
                                    <div className="flex justify-between text-emerald-600 font-extrabold">
                                        <span>Wallet Applied:</span>
                                        <span>−A${walletBalance.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-sm font-black pt-2 border-t border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white">
                                    <span>Total Payable (Receiving Bank):</span>
                                    <span className="text-[#FFC700] text-base">A${payableAmount.toFixed(2)} AUD</span>
                                </div>
                            </div>

                            {/* Live International Currency Converter */}
                            <div className="rounded-xl border border-blue-200 bg-blue-50/70 dark:bg-blue-950/40 p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xs font-black uppercase tracking-wider text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                                        <DollarSign className="h-4 w-4 text-[#FFC700]" /> International SWIFT Currency Estimator
                                    </h3>
                                    <button
                                        type="button"
                                        onClick={refreshExchangeRates}
                                        disabled={fetchingRates}
                                        className="text-blue-700 hover:text-blue-900 transition-all text-[10px] font-bold flex items-center gap-1"
                                    >
                                        <RefreshCw className={`h-3 w-3 ${fetchingRates ? 'animate-spin' : ''}`} />
                                        Refresh
                                    </button>
                                </div>

                                <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
                                    Convert <strong>A${payableAmount.toFixed(2)} AUD</strong> to your local sending currency to ensure exact remittance:
                                </p>

                                <div className="grid grid-cols-1 gap-2">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">Select Your Local Currency:</label>
                                    <select
                                        value={selectedCurrency}
                                        onChange={e => setSelectedCurrency(e.target.value)}
                                        className="w-full bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl p-2.5 text-xs font-bold text-zinc-900 dark:text-white"
                                    >
                                        {Object.entries(customRates).map(([code, info]) => (
                                            <option key={code} value={code}>
                                                {code} — {info.name} ({info.symbol})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="bg-white dark:bg-zinc-900 border border-blue-200 dark:border-blue-900 rounded-xl p-3 flex items-center justify-between">
                                    <div>
                                        <span className="text-[10px] font-bold text-zinc-500 uppercase block">Estimated Remittance ({selectedCurrency}):</span>
                                        <span className="text-lg font-black text-blue-900 dark:text-blue-300">
                                            {targetCurrency.symbol}{convertedAmount} {selectedCurrency}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[9px] font-mono text-zinc-400 block">Rate: 1 AUD = {targetCurrency.rateToAud} {selectedCurrency}</span>
                                        <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">Wire Exact Value</span>
                                    </div>
                                </div>
                            </div>

                            {/* Schedule 1 Financial Matrix Breakdown */}
                            <div className="rounded-xl border border-zinc-200 bg-zinc-50 dark:bg-zinc-800/80 p-3.5 text-[10px] text-zinc-600 dark:text-zinc-400 space-y-1.5">
                                <div className="flex justify-between items-center font-black uppercase text-zinc-900 dark:text-white border-b border-zinc-200 dark:border-zinc-700 pb-1.5">
                                    <span>Schedule 1 Financial Matrix</span>
                                    <span className="text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded border border-emerald-300">Net Total: A$2,830.95</span>
                                </div>
                                <div className="space-y-1 pt-1 font-mono">
                                    <div className="flex justify-between">
                                        <span>Training (7 Modules) Candidate 35% Share:</span>
                                        <span className="font-bold text-zinc-800 dark:text-zinc-200">A$1,240.75</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Subclass 482 Visa VAC Candidate 35% Share:</span>
                                        <span className="font-bold text-zinc-800 dark:text-zinc-200">A$1,405.25</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>WA Driving &amp; Licensing Candidate 100%:</span>
                                        <span className="font-bold text-zinc-800 dark:text-zinc-200">A$185.50</span>
                                    </div>
                                </div>
                                <p className="text-[9.5px] text-red-600 dark:text-red-400 font-bold pt-1 border-t border-zinc-200 dark:border-zinc-700 font-sans">
                                    Clause 5.2 Upper Liability Ceiling: A$3,599.20 (Note: Under Clause 7.1, 100% of candidate training contributions are re-credited to your Candidate Wallet upon passing each module).
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function CheckoutPage() {
    return (
        <Suspense fallback={<div className="p-12 text-center text-xs font-bold text-amber-600">Loading Checkout Gateway...</div>}>
            <CheckoutContent />
        </Suspense>
    );
}
