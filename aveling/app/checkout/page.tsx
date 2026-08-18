'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CreditCard, CheckCircle2, ArrowRight, Upload, Building2, Wallet, FileCheck, AlertCircle, Lock, RefreshCw, DollarSign } from 'lucide-react';
import { apiClient } from '../../lib/axios';
import { uploadFile } from '../../lib/utils';
import { PageShell } from '../../components/PageShell';

interface BankDetails { bankName: string; bsb: string; accountNumber: string; accountName: string; }

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

const MODE_LABELS: Record<string, { title: string; badge: string; color: string; border: string }> = {
    deposit: { title: 'Initial Commitment Deposit', badge: 'A$500 DEPOSIT', color: 'bg-blue-100 text-blue-900', border: 'border-blue-300' },
    full: { title: 'Full Programme Balance', badge: 'FULL BALANCE', color: 'bg-emerald-100 text-emerald-900', border: 'border-emerald-300' },
    ticket: { title: 'Course Module Payment', badge: 'MODULE FEE', color: 'bg-[#FFC700] text-black', border: 'border-[#FFC700]' },
};

function CheckoutContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const ticketId = searchParams.get('ticketId') || '';
    const candidateNumber = searchParams.get('candidateNumber') || 'CND-10001';
    const courseIdParam = searchParams.get('courseId') || '';
    const walletParam = parseFloat(searchParams.get('wallet') || '0');
    const rawPrice = parseFloat(searchParams.get('price') || '0');
    const paymentMode = (searchParams.get('mode') || 'ticket') as 'deposit' | 'full' | 'ticket';

    const DEPOSIT_AMOUNT = 500;
    const coursePrice = paymentMode === 'deposit' ? DEPOSIT_AMOUNT : (rawPrice || 280);

    const [emailSent, setEmailSent] = useState(false);
    const [useWallet, setUseWallet] = useState(false);
    const [receiptFile, setReceiptFile] = useState<File | null>(null);
    const [receiptRef, setReceiptRef] = useState('');
    const [submittingReceipt, setSubmittingReceipt] = useState(false);
    const [paymentSubmitted, setPaymentSubmitted] = useState(false);
    const [bankDetails, setBankDetails] = useState<BankDetails | null>(null);
    const [bankLoading, setBankLoading] = useState(true);

    const [selectedCurrency, setSelectedCurrency] = useState('USD');
    const [customRates, setCustomRates] = useState(CURRENCIES);
    const [fetchingRates, setFetchingRates] = useState(false);

    const walletBalance = walletParam;
    const payableAmount = useWallet ? Math.max(0, coursePrice - walletBalance) : coursePrice;
    const modeInfo = MODE_LABELS[paymentMode] || MODE_LABELS.ticket;

    const refreshExchangeRates = async () => {
        setFetchingRates(true);
        try {
            const res = await fetch('https://api.exchangerate-api.com/v4/latest/AUD');
            if (res.ok) {
                const data = await res.json();
                if (data && data.rates) {
                    const updated = { ...CURRENCIES };
                    Object.keys(updated).forEach(code => {
                        if (data.rates[code]) updated[code] = { ...updated[code], rateToAud: data.rates[code] };
                    });
                    setCustomRates(updated);
                }
            }
        } catch (e) {} finally {
            setFetchingRates(false);
        }
    };

    useEffect(() => { refreshExchangeRates(); }, []);

    useEffect(() => {
        apiClient.get(`/bank-accounts?_t=${Date.now()}`).then(res => {
            const rows = res.data?.rows;
            if (rows?.length > 0) {
                const b = rows[0];
                setBankDetails({ bankName: b.bankName, bsb: b.routingCode, accountNumber: b.accountNumber, accountName: b.bankName });
            }
        }).catch(() => { }).finally(() => setBankLoading(false));
    }, []);

    useEffect(() => {
        if (!ticketId || paymentMode !== 'ticket') return;
        apiClient.post(`/tickets/${ticketId}/checkout-email`, { candidateNumber, courseId: courseIdParam })
            .then(() => setEmailSent(true)).catch(() => setEmailSent(true));
    }, [ticketId, candidateNumber, courseIdParam, paymentMode]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (payableAmount > 0 && !receiptRef.trim()) {
            alert('Please enter the USDT Transaction Hash before submitting.');
            return;
        }
        setSubmittingReceipt(true);
        try {
            let uploadedReceiptUrl = '';
            if (receiptFile) {
                try { uploadedReceiptUrl = await uploadFile(receiptFile, 'image'); } catch { }
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
        <PageShell>
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-2 flex-wrap mb-4">
                    <span className="font-mono text-xs font-black text-white bg-zinc-900 px-3 py-1 rounded-full uppercase tracking-widest">
                        CANDIDATE: {candidateNumber}
                    </span>
                    <span className={`text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest border-2 ${modeInfo.color} ${modeInfo.border}`}>
                        {modeInfo.badge}
                    </span>
                    {emailSent && (
                        <span className="text-xs font-black text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full border-2 border-emerald-300 uppercase tracking-widest">
                            ✓ Invoice Emailed
                        </span>
                    )}
                </div>
                <h1 className="text-4xl font-black tracking-tight text-zinc-900 flex items-center gap-3">
                    <CreditCard className="h-8 w-8 text-[#FFC700]" />
                    {modeInfo.title}
                </h1>
                <p className="mt-3 text-sm font-medium text-zinc-500 max-w-2xl">
                    {paymentMode === 'deposit' && 'A$500 initial commitment deposit — required before accessing any training module (Schedule 1 / Clause 5.1)'}
                    {paymentMode === 'full' && 'Full programme balance payment — unlocks all training modules immediately'}
                    {paymentMode === 'ticket' && `Per-module payment — Ticket #${ticketId || 'N/A'}`}
                </p>
            </div>
            <div className="w-full h-0.5 bg-[#FFC700] mb-10" />

            {/* Milestone Explainer Banner */}
            {(paymentMode === 'deposit' || paymentMode === 'full') && (
                <div className={`rounded-2xl border-2 p-6 mb-8 ${paymentMode === 'deposit' ? 'bg-blue-50 border-blue-200' : 'bg-emerald-50 border-emerald-200'}`}>
                    <h2 className={`text-sm font-black uppercase tracking-widest flex items-center gap-2 mb-4 ${paymentMode === 'deposit' ? 'text-blue-900' : 'text-emerald-900'}`}>
                        {paymentMode === 'deposit' ? <Lock className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                        Payment Milestone Schedule
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className={`rounded-xl border-2 p-4 ${paymentMode === 'deposit' ? 'bg-blue-900 text-white border-blue-900 shadow-md' : 'bg-white border-blue-200'}`}>
                            <p className="text-xs font-black uppercase tracking-widest mb-1.5">Step 1 — Deposit</p>
                            <p className={`text-sm font-medium ${paymentMode === 'deposit' ? 'text-blue-200' : 'text-zinc-600'}`}>A$500 initial deposit → Unlocks Training Modules 1, 2 & 3</p>
                        </div>
                        <div className={`rounded-xl border-2 p-4 ${paymentMode === 'full' ? 'bg-emerald-800 text-white border-emerald-800 shadow-md' : 'bg-white border-zinc-200'}`}>
                            <p className={`text-xs font-black uppercase tracking-widest mb-1.5 ${paymentMode === 'full' ? 'text-white' : 'text-zinc-700'}`}>Step 2 — Full Balance</p>
                            <p className={`text-sm font-medium ${paymentMode === 'full' ? 'text-emerald-200' : 'text-zinc-600'}`}>Remaining balance before Module 4 → Unlocks all remaining modules</p>
                        </div>
                    </div>
                </div>
            )}

            {paymentSubmitted ? (
                <div className="rounded-2xl border-2 border-zinc-200 bg-white p-12 shadow-xl text-center">
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#FFC700] mb-6">
                        <FileCheck className="h-10 w-10 text-black" />
                    </div>
                    <h2 className="text-3xl font-black text-zinc-900 mb-2">Receipt Submitted!</h2>
                    <p className="text-sm font-medium text-zinc-500 max-w-md mx-auto mb-8">
                        Reference: <strong className="text-zinc-900">{receiptRef || `REF-${candidateNumber}`}</strong>
                    </p>
                    <div className="mx-auto max-w-lg rounded-xl border-2 border-zinc-200 bg-zinc-50 p-6 text-left mb-8">
                        <div className="flex justify-between font-black text-zinc-900 mb-2 uppercase tracking-widest text-xs border-b-2 border-zinc-200 pb-3">
                            <span>Status:</span>
                            <span className="text-amber-600">Pending Admin Approval</span>
                        </div>
                        <p className="text-zinc-600 font-medium text-sm pt-2">{pendingLabel}</p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button
                            onClick={() => router.push(courseIdParam ? `/courses/${courseIdParam}` : '/dashboard')}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#FFC700] text-black px-8 py-4 text-xs font-black uppercase tracking-wider shadow-md hover:bg-yellow-400 transition-all w-full sm:w-auto"
                        >
                            Go to Course Workspace <ArrowRight className="h-4 w-4 stroke-[3]" />
                        </button>
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-zinc-900 bg-white px-8 py-4 text-xs font-black text-zinc-900 hover:bg-zinc-900 hover:text-white transition-all uppercase tracking-wider w-full sm:w-auto"
                        >
                            Return to Dashboard
                        </button>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                    <div className="lg:col-span-7 space-y-8">
                        {/* Official Invoice Dispatch Notice */}
                        {payableAmount > 0 && (
                            <div className="bg-white border-2 border-blue-200 rounded-2xl p-8 shadow-sm">
                                <div className="flex items-center justify-between border-b-2 border-zinc-100 pb-4 mb-4">
                                    <h2 className="text-sm font-black uppercase tracking-widest text-zinc-900 flex items-center gap-2">
                                        <Wallet className="h-5 w-5 text-blue-600" /> Crypto Payment Instructions
                                    </h2>
                                    <span className="text-[10px] font-black uppercase tracking-widest bg-blue-100 text-blue-900 px-2.5 py-1 rounded-full">USDT ONLY</span>
                                </div>
                                <div className="bg-blue-50/50 p-5 rounded-xl border border-blue-100 space-y-4">
                                    <p className="text-blue-900 text-sm font-medium">
                                        Official corporate invoices are dispatched directly to your registered candidate email address. All payments must be made in USDT on the Tron (TRC-20) network.
                                    </p>
                                    <div className="flex items-start gap-3 bg-white p-4 rounded-xl border-2 border-blue-200 text-sm font-bold text-blue-900">
                                        <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                                        <p>Please inspect your email inbox for your assigned invoice and our USDT wallet address. Once paid, submit your Transaction Hash below.</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Receipt Upload Form */}
                        <form onSubmit={handleSubmit} className="bg-white border-2 border-zinc-200 rounded-2xl p-8 shadow-sm">
                            <h2 className="text-sm font-black uppercase tracking-widest text-zinc-900 flex items-center gap-2 mb-6 border-b-2 border-zinc-100 pb-4">
                                {payableAmount === 0 ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> : <Upload className="h-5 w-5 text-zinc-400" />}
                                {payableAmount === 0 ? 'Full Payment Covered by Wallet' : 'Submit Crypto Payment'}
                            </h2>
                            {payableAmount > 0 && (
                                <div className="space-y-5 mb-6">
                                    <div>
                                        <label className="block text-xs font-black uppercase tracking-widest text-zinc-700 mb-2">
                                            USDT (TRC-20) Transaction Hash <span className="text-rose-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={receiptRef}
                                            onChange={e => setReceiptRef(e.target.value)}
                                            placeholder="e.g. 5d5...2c"
                                            className="w-full bg-zinc-50 border-2 border-zinc-200 p-4 rounded-xl text-sm font-bold text-zinc-900 outline-none focus:border-[#FFC700] transition-all"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black uppercase tracking-widest text-zinc-700 mb-2">
                                            Attach Screenshot (Optional)
                                        </label>
                                        <input
                                            type="file"
                                            accept="image/*,.pdf"
                                            onChange={e => setReceiptFile(e.target.files?.[0] || null)}
                                            className="w-full bg-zinc-50 border-2 border-zinc-200 p-3 rounded-xl text-sm font-medium text-zinc-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-black file:uppercase file:tracking-wider file:bg-zinc-200 file:text-zinc-700 hover:file:bg-zinc-300"
                                        />
                                    </div>
                                </div>
                            )}
                            <button
                                type="submit"
                                disabled={submittingReceipt}
                                className="w-full inline-flex items-center justify-center gap-2 bg-[#FFC700] text-black font-black text-xs py-4 rounded-xl hover:bg-yellow-400 transition-all uppercase tracking-widest shadow-md disabled:opacity-50"
                            >
                                <CheckCircle2 className="h-4 w-4" />
                                {submittingReceipt
                                    ? 'Uploading Receipt...'
                                    : paymentMode === 'deposit'
                                        ? 'Submit A$500 Deposit Receipt'
                                        : paymentMode === 'full'
                                            ? 'Submit Full Balance Receipt'
                                            : 'I Have Made Payment — Submit Receipt'}
                            </button>
                        </form>
                    </div>

                    {/* Order Summary & Live Currency Converter */}
                    <div className="lg:col-span-5 space-y-8">
                        <div className="bg-white border-2 border-zinc-200 rounded-2xl p-8 shadow-sm">
                            <h2 className="text-sm font-black uppercase tracking-widest text-zinc-900 mb-6 border-b-2 border-zinc-100 pb-4">Payment Summary</h2>
                            
                            <div className="bg-zinc-50 border-2 border-zinc-200 p-5 rounded-xl space-y-3 text-sm mb-6">
                                <div className="flex justify-between font-bold text-zinc-600">
                                    <span>Payment Type:</span>
                                    <span className="text-zinc-900">{modeInfo.badge}</span>
                                </div>
                                {paymentMode === 'ticket' && ticketId && (
                                    <div className="flex justify-between font-bold text-zinc-600">
                                        <span>Ticket:</span>
                                        <span className="text-zinc-900">#{ticketId}</span>
                                    </div>
                                )}
                                <div className="flex justify-between font-bold text-zinc-600">
                                    <span>Currency:</span>
                                    <span className="text-zinc-900">AUD (Australian Dollar)</span>
                                </div>
                            </div>

                            <div className="space-y-3 text-sm border-t-2 border-zinc-100 pt-6">
                                <div className="flex justify-between font-bold text-zinc-600">
                                    <span>Subtotal:</span>
                                    <span>A${coursePrice.toFixed(2)}</span>
                                </div>

                                <div className="flex justify-between text-base font-black pt-4 border-t-2 border-zinc-200 text-zinc-900 mt-2">
                                    <span>Total Payable:</span>
                                    <span className="text-[#FFC700] text-xl">A${payableAmount.toFixed(2)} AUD</span>
                                </div>
                            </div>
                        </div>

                        {/* Live International Currency Converter */}
                        <div className="bg-blue-50/50 border-2 border-blue-200 rounded-2xl p-8">
                            <div className="flex items-center justify-between mb-4 border-b-2 border-blue-100 pb-4">
                                <h3 className="text-xs font-black uppercase tracking-widest text-blue-900 flex items-center gap-2">
                                    <DollarSign className="h-4 w-4 text-blue-600" /> Currency Estimator
                                </h3>
                                <button
                                    type="button"
                                    onClick={refreshExchangeRates}
                                    disabled={fetchingRates}
                                    className="text-blue-600 hover:text-blue-900 transition-all text-[10px] font-black uppercase tracking-widest flex items-center gap-1 bg-white px-2 py-1 rounded-md border border-blue-200 shadow-sm"
                                >
                                    <RefreshCw className={`h-3 w-3 ${fetchingRates ? 'animate-spin' : ''}`} />
                                    Refresh
                                </button>
                            </div>

                            <p className="text-xs font-medium text-blue-900/80 mb-5 leading-relaxed">
                                Convert <strong>A${payableAmount.toFixed(2)} AUD</strong> to your local sending currency to ensure exact remittance:
                            </p>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-blue-900 mb-1.5 block">Select Your Local Currency:</label>
                                    <select
                                        value={selectedCurrency}
                                        onChange={e => setSelectedCurrency(e.target.value)}
                                        className="w-full bg-white border-2 border-blue-200 rounded-xl p-3 text-sm font-bold text-zinc-900 outline-none focus:border-blue-500"
                                    >
                                        {Object.entries(customRates).map(([code, info]) => (
                                            <option key={code} value={code}>{code} — {info.name} ({info.symbol})</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="bg-white border-2 border-blue-300 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
                                    <div>
                                        <span className="text-[10px] font-black text-blue-900/60 uppercase tracking-widest block mb-1">Estimated Remittance ({selectedCurrency}):</span>
                                        <span className="text-2xl font-black text-blue-900">
                                            {targetCurrency.symbol}{convertedAmount} <span className="text-lg">{selectedCurrency}</span>
                                        </span>
                                    </div>
                                    <div className="text-left md:text-right">
                                        <span className="text-[10px] font-mono text-zinc-500 block mb-1">Rate: 1 AUD = {targetCurrency.rateToAud} {selectedCurrency}</span>
                                        <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 border border-emerald-300 px-2 py-1 rounded-md uppercase tracking-widest inline-block">Wire Exact Value</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </PageShell>
    );
}

export default function CheckoutPage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center text-xs font-bold text-zinc-400 uppercase tracking-widest animate-pulse">Loading Checkout Gateway...</div>}>
            <CheckoutContent />
        </Suspense>
    );
}
