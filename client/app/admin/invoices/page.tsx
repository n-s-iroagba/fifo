'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
    FileText, 
    Send, 
    Printer, 
    Building2, 
    User as UserIcon, 
    DollarSign, 
    CheckCircle2, 
    RefreshCw, 
    ArrowLeft,
    ShieldAlert,
    Calculator,
    Lock
} from 'lucide-react';
import api from '@/lib/api';

interface BankAccount {
    id: string;
    bankName: string;         // Wallet Nickname
    accountNumber: string;    // USDT Wallet Address
    accountName: string;      // Legal entity name
    bsb?: string;             // Deprecated — not in DB
    swiftCode?: string;       // Deprecated — not in DB
    routingCode?: string;     // Network label (TRC-20)
    isDefault?: boolean;
}

interface Applicant {
    id: number;
    fullName: string;
    email: string;
    candidateNumber?: string;
    depositPaid?: boolean;
    fullBalancePaid?: boolean;
}

const CURRENCIES: Record<string, { name: string; symbol: string; defaultRate: number }> = {
    USD: { name: 'US Dollar ($)', symbol: '$', defaultRate: 0.65 },
    EUR: { name: 'Euro (€)', symbol: '€', defaultRate: 0.60 },
    GBP: { name: 'British Pound (£)', symbol: '£', defaultRate: 0.51 },
    CAD: { name: 'Canadian Dollar (C$)', symbol: 'C$', defaultRate: 0.89 },
    SGD: { name: 'Singapore Dollar (S$)', symbol: 'S$', defaultRate: 0.88 },
    AED: { name: 'UAE Dirham (AED)', symbol: 'AED', defaultRate: 2.39 },
    ZAR: { name: 'South African Rand (R)', symbol: 'R', defaultRate: 11.95 },
    NGN: { name: 'Nigerian Naira (₦)', symbol: '₦', defaultRate: 980.0 },
    PHP: { name: 'Philippine Peso (₱)', symbol: '₱', defaultRate: 37.50 },
    INR: { name: 'Indian Rupee (₹)', symbol: '₹', defaultRate: 54.80 },
    AUD: { name: 'Australian Dollar (A$)', symbol: 'A$', defaultRate: 1.0 },
};

export default function InvoiceCreationPage() {
    const [applicants, setApplicants] = useState<Applicant[]>([]);
    const [selectedApplicantId, setSelectedApplicantId] = useState<string>('');
    const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);

    const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
    const [selectedBankId, setSelectedBankId] = useState<string>('');
    
    // Invoice details
    const [amountAud, setAmountAud] = useState<number>(3599.20);
    const [paymentMilestone, setPaymentMilestone] = useState<'partial' | 'complete' | 'unpaid'>('partial');
    const [invoiceDescription, setInvoiceDescription] = useState<string>(
        'FIFO Ticket Sponsorship Package (7 Competencies + Visa Share & Licensing)'
    );

    // Currency & Exchange Rate
    const [currency, setCurrency] = useState<string>('USD');
    const [exchangeRate, setExchangeRate] = useState<number>(0.65);
    const [fetchingRates, setFetchingRates] = useState<boolean>(false);

    // Status state
    const [loading, setLoading] = useState<boolean>(true);
    const [submittingEmail, setSubmittingEmail] = useState<boolean>(false);
    const [updatingStatus, setUpdatingStatus] = useState<boolean>(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Print Modal State
    const [printModalOpen, setPrintModalOpen] = useState<boolean>(false);
    const [generatedInvoiceNum, setGeneratedInvoiceNum] = useState<string>('');

    // Converted Amount calculation
    const convertedAmount = parseFloat((amountAud * exchangeRate).toFixed(2));

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [usersRes, banksRes] = await Promise.all([
                api.get('/admin/users'),
                api.get('/admin/platform-bank-accounts')
            ]);

            const usersList = usersRes.data?.data || usersRes.data?.rows || usersRes.data || [];
            const applicantUsers = usersList.filter((u: any) => u.role !== 'admin');
            setApplicants(applicantUsers);

            if (applicantUsers.length > 0) {
                setSelectedApplicantId(String(applicantUsers[0].id));
                setSelectedApplicant(applicantUsers[0]);
            }

            const banksList = banksRes.data?.data || banksRes.data || [];
            setBankAccounts(banksList);
            if (banksList.length > 0) {
                const defaultBank = banksList.find((b: BankAccount) => b.isDefault) || banksList[0];
                setSelectedBankId(defaultBank.id);
            }
        } catch (err: any) {
            console.error('Failed to load invoice creation data:', err);
            setErrorMessage('Failed to load applicants or bank accounts.');
        } finally {
            setLoading(false);
        }
    };

    const handleApplicantChange = (idStr: string) => {
        setSelectedApplicantId(idStr);
        const app = applicants.find(a => String(a.id) === idStr) || null;
        setSelectedApplicant(app);
    };

    const handleCurrencyChange = (currCode: string) => {
        setCurrency(currCode);
        const currObj = CURRENCIES[currCode];
        if (currObj) {
            setExchangeRate(currObj.defaultRate);
        }
    };

    const fetchLiveRate = async () => {
        setFetchingRates(true);
        try {
            const res = await fetch(`https://api.exchangerate-api.com/v4/latest/AUD`);
            if (res.ok) {
                const data = await res.json();
                if (data?.rates?.[currency]) {
                    setExchangeRate(data.rates[currency]);
                }
            }
        } catch (e) {
            console.log('Using static exchange rate');
        } finally {
            setFetchingRates(false);
        }
    };

    const handleUpdatePaymentStatus = async (status: 'partial' | 'complete' | 'unpaid') => {
        if (!selectedApplicant) return;
        setUpdatingStatus(true);
        setErrorMessage(null);
        setSuccessMessage(null);
        try {
            await api.post(`/admin/users/${selectedApplicant.id}/update-payment-status`, { status });
            setPaymentMilestone(status);
            setSuccessMessage(`Payment status updated to ${status.toUpperCase()} for ${selectedApplicant.fullName}`);
            // update local state
            setSelectedApplicant({
                ...selectedApplicant,
                depositPaid: status === 'partial' || status === 'complete',
                fullBalancePaid: status === 'complete'
            });
        } catch (err: any) {
            setErrorMessage(err.response?.data?.message || 'Failed to update payment status.');
        } finally {
            setUpdatingStatus(false);
        }
    };

    const handleSendInvoiceEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedApplicant) return;
        setSubmittingEmail(true);
        setErrorMessage(null);
        setSuccessMessage(null);

        try {
            const res = await api.post('/admin/invoices/create-and-send', {
                userId: selectedApplicant.id,
                bankAccountId: selectedBankId,
                amountAud,
                currency,
                exchangeRate,
                convertedAmount,
                description: invoiceDescription
            });

            const invNum = res.data?.data?.invoiceNumber || `INV-BCR-${Math.floor(10000 + Math.random() * 90000)}`;
            setGeneratedInvoiceNum(invNum);
            setSuccessMessage(`Invoice ${invNum} successfully dispatched to ${selectedApplicant.email}`);
        } catch (err: any) {
            setErrorMessage(err.response?.data?.message || 'Failed to send invoice email.');
        } finally {
            setSubmittingEmail(false);
        }
    };

    const selectedBank = bankAccounts.find(b => b.id === selectedBankId) || bankAccounts[0];

    const handlePrintInvoice = () => {
        if (!generatedInvoiceNum) {
            setGeneratedInvoiceNum(`INV-BCR-2026-${Math.floor(10000 + Math.random() * 90000)}`);
        }
        setPrintModalOpen(true);
    };

    if (loading) {
        return (
            <div className="p-12 text-center">
                <div className="inline-flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-900 rounded-full animate-spin" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400">Loading Invoice Creation System...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="font-sans text-blue-900 pb-24 max-w-5xl mx-auto px-4">
            {/* Header */}
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-blue-100 pb-6">
                <div>
                    <Link href="/admin/tickets" className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-500 hover:text-blue-700 uppercase tracking-widest mb-2">
                        <ArrowLeft className="h-3 w-3" /> Back to Ticket Dashboard
                    </Link>
                    <h1 className="text-3xl font-black text-blue-900 tracking-tight flex items-center gap-2">
                        <FileText className="h-8 w-8 text-amber-500" /> Administrative Invoice Creator
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">Generate multi-bank corporate tax invoices with currency conversion &amp; Schedule 1 compliance.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handlePrintInvoice}
                        className="bg-white border border-blue-200 text-blue-900 font-bold text-[10px] uppercase tracking-widest px-4 py-3 rounded-xl shadow-sm hover:bg-blue-50 transition-all flex items-center gap-2"
                    >
                        <Printer className="h-4 w-4 text-blue-700" /> Preview &amp; Print PDF Invoice
                    </button>
                </div>
            </div>

            {/* Success / Error Banners */}
            {successMessage && (
                <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center justify-between shadow-sm">
                    <span className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                        {successMessage}
                    </span>
                    <button onClick={() => setSuccessMessage(null)} className="text-emerald-600 hover:text-emerald-900 text-xs">Dismiss</button>
                </div>
            )}
            {errorMessage && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-2xl text-xs font-bold flex items-center justify-between shadow-sm">
                    <span className="flex items-center gap-2">
                        <ShieldAlert className="h-5 w-5 text-red-600 flex-shrink-0" />
                        {errorMessage}
                    </span>
                    <button onClick={() => setErrorMessage(null)} className="text-red-600 hover:text-red-900 text-xs">Dismiss</button>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Main Form (Left 7 Cols) */}
                <div className="lg:col-span-7 space-y-6">
                    <form onSubmit={handleSendInvoiceEmail} className="space-y-6">
                        {/* 1. Select Applicant */}
                        <div className="bg-white rounded-3xl border border-blue-100 p-6 shadow-sm space-y-4">
                            <h2 className="text-xs font-black uppercase tracking-wider text-blue-900 flex items-center gap-2">
                                <UserIcon className="h-4 w-4 text-amber-500" /> 1. Select Target Candidate / Applicant
                            </h2>
                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                                    Select Candidate:
                                </label>
                                <select
                                    value={selectedApplicantId}
                                    onChange={e => handleApplicantChange(e.target.value)}
                                    className="w-full bg-slate-50 border border-blue-100 rounded-xl p-3 text-xs font-bold text-blue-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
                                >
                                    {applicants.map(app => (
                                        <option key={app.id} value={app.id}>
                                            {app.fullName} ({app.email}) — ID: {app.candidateNumber || `CND-${10000 + app.id}`}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Candidate Status Summary & Payment Status Updater */}
                            {selectedApplicant && (
                                <div className="bg-blue-50/60 rounded-2xl p-4 border border-blue-100 space-y-3">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-slate-500 font-medium">Current Candidate Status:</span>
                                        <span className="font-mono font-bold text-blue-900 bg-white px-2.5 py-1 rounded-lg border border-blue-200">
                                            {selectedApplicant.fullBalancePaid ? 'COMPLETE PAYMENT' : selectedApplicant.depositPaid ? 'PARTIAL (DEPOSIT PAID)' : 'UNPAID'}
                                        </span>
                                    </div>
                                    
                                    <div className="pt-2 border-t border-blue-100 flex items-center justify-between gap-2 flex-wrap">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Update Candidate Milestone Status:</span>
                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                disabled={updatingStatus}
                                                onClick={() => handleUpdatePaymentStatus('partial')}
                                                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
                                                    selectedApplicant.depositPaid && !selectedApplicant.fullBalancePaid
                                                        ? 'bg-amber-400 text-blue-950 font-black shadow-sm'
                                                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-amber-50'
                                                }`}
                                            >
                                                Partial (Deposit)
                                            </button>
                                            <button
                                                type="button"
                                                disabled={updatingStatus}
                                                onClick={() => handleUpdatePaymentStatus('complete')}
                                                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
                                                    selectedApplicant.fullBalancePaid
                                                        ? 'bg-emerald-600 text-white font-black shadow-sm'
                                                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-emerald-50'
                                                }`}
                                            >
                                                Complete Balance
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 2. Select Corporate Bank Account -> Crypto Wallet */}
                        <div className="bg-white rounded-3xl border border-blue-100 p-6 shadow-sm space-y-4">
                            <h2 className="text-xs font-black uppercase tracking-wider text-blue-900 flex items-center gap-2">
                                <Building2 className="h-4 w-4 text-amber-500" /> 2. Corporate Receiving Crypto Wallet
                            </h2>
                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                                    Select Corporate USDT Wallet:
                                </label>
                                <div className="relative">
                                    <select
                                        value={selectedBankId}
                                        onChange={e => setSelectedBankId(e.target.value)}
                                        className="w-full bg-slate-50 border border-blue-100 rounded-xl p-3 text-xs font-bold text-blue-900 focus:outline-none focus:ring-2 focus:ring-amber-400 appearance-none pr-10"
                                    >
                                        {bankAccounts.map(bank => (
                                            <option key={bank.id} value={bank.id}>
                                                {bank.bankName} {bank.isDefault ? '(PRIMARY)' : ''}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                        <Lock className="h-4 w-4 text-slate-400" />
                                    </div>
                                </div>
                            </div>
                            {selectedBank && (
                                <div className="bg-gradient-to-br from-blue-900 to-blue-950 p-4 rounded-xl border border-blue-800 text-xs space-y-3 font-mono shadow-inner">
                                    <div className="flex justify-between items-center pb-2 border-b border-blue-800/50">
                                        <span className="text-blue-300 font-sans text-[10px] uppercase tracking-wider">Account Name</span> 
                                        <span className="font-bold text-white">{selectedBank.accountName}</span>
                                    </div>
                                    <div className="flex justify-between items-center pb-2 border-b border-blue-800/50">
                                        <span className="text-blue-300 font-sans text-[10px] uppercase tracking-wider">Network</span> 
                                        <span className="font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded">TRC-20</span>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-blue-300 font-sans text-[10px] uppercase tracking-wider">USDT Wallet Address</span> 
                                        <div className="flex items-center justify-between bg-black/20 p-2 rounded border border-blue-800/50">
                                            <span className="font-bold text-emerald-400 break-all">{selectedBank.accountNumber}</span>
                                            <button 
                                                type="button"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    navigator.clipboard.writeText(selectedBank.accountNumber);
                                                }}
                                                className="ml-2 bg-blue-800 hover:bg-blue-700 text-white p-1.5 rounded transition-colors"
                                                title="Copy to clipboard"
                                            >
                                                <FileText className="h-3 w-3" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 3. Amount & Currency Conversion */}
                        <div className="bg-white rounded-3xl border border-blue-100 p-6 shadow-sm space-y-4">
                            <h2 className="text-xs font-black uppercase tracking-wider text-blue-900 flex items-center gap-2">
                                <Calculator className="h-4 w-4 text-amber-500" /> 3. Financial Amount &amp; Currency Conversion
                            </h2>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                                        Base Amount in AUD (A$):
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={amountAud}
                                        onChange={e => setAmountAud(parseFloat(e.target.value) || 0)}
                                        className="w-full bg-slate-50 border border-blue-100 rounded-xl p-3 text-xs font-bold text-blue-900 outline-none focus:ring-2 focus:ring-amber-400"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                                        Target Remittance Currency:
                                    </label>
                                    <select
                                        value={currency}
                                        onChange={e => handleCurrencyChange(e.target.value)}
                                        className="w-full bg-slate-50 border border-blue-100 rounded-xl p-3 text-xs font-bold text-blue-900 outline-none focus:ring-2 focus:ring-amber-400"
                                    >
                                        {Object.entries(CURRENCIES).map(([code, info]) => (
                                            <option key={code} value={code}>
                                                {code} — {info.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                            Applied Conversion Rate (1 AUD = X):
                                        </label>
                                        <button
                                            type="button"
                                            onClick={fetchLiveRate}
                                            disabled={fetchingRates}
                                            className="text-[9px] font-bold text-blue-500 hover:text-blue-700 flex items-center gap-1"
                                        >
                                            <RefreshCw className={`h-3 w-3 ${fetchingRates ? 'animate-spin' : ''}`} /> Fetch Live Rate
                                        </button>
                                    </div>
                                    <input
                                        type="number"
                                        step="0.0001"
                                        value={exchangeRate}
                                        onChange={e => setExchangeRate(parseFloat(e.target.value) || 1)}
                                        className="w-full bg-slate-50 border border-blue-100 rounded-xl p-3 text-xs font-bold text-blue-900 outline-none focus:ring-2 focus:ring-amber-400"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                                        Total Converted Payable Amount:
                                    </label>
                                    <div className="w-full bg-amber-50 border border-amber-300 rounded-xl p-3 text-sm font-black text-amber-950 flex items-center justify-between">
                                        <span>{currency}</span>
                                        <span>{convertedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                                    Invoice Particulars / Line Item Description:
                                </label>
                                <input
                                    type="text"
                                    value={invoiceDescription}
                                    onChange={e => setInvoiceDescription(e.target.value)}
                                    className="w-full bg-slate-50 border border-blue-100 rounded-xl p-3 text-xs font-bold text-blue-900 outline-none focus:ring-2 focus:ring-amber-400"
                                    required
                                />
                            </div>
                        </div>

                        {/* Submit Action */}
                        <button
                            type="submit"
                            disabled={submittingEmail}
                            className="w-full bg-amber-400 hover:bg-amber-300 text-blue-950 font-black text-xs py-4 rounded-2xl shadow-xl transition-all uppercase tracking-widest flex items-center justify-center gap-2"
                        >
                            <Send className="h-4 w-4" />
                            {submittingEmail ? 'Dispatching Official Invoice Email...' : 'Dispatch Invoice Email to Applicant'}
                        </button>
                    </form>
                </div>

                {/* Live Preview Sidebar (Right 5 Cols) */}
                <div className="lg:col-span-5 space-y-6">
                    <div className="bg-white rounded-3xl border border-blue-100 p-6 shadow-sm space-y-4 sticky top-6">
                        <div className="flex items-center justify-between border-b border-blue-100 pb-3">
                            <h2 className="text-xs font-black uppercase tracking-wider text-blue-900">
                                Live Invoice Summary
                            </h2>
                            <span className="text-[9px] font-bold uppercase tracking-widest bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">
                                PREVIEW
                            </span>
                        </div>

                        <div className="space-y-3 text-xs">
                            <div className="flex justify-between py-1 border-b border-slate-100">
                                <span className="text-slate-500">Candidate Billed:</span>
                                <span className="font-bold text-blue-900">{selectedApplicant?.fullName || 'Selected Candidate'}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-slate-100">
                                <span className="text-slate-500">Candidate Email:</span>
                                <span className="font-bold text-blue-900">{selectedApplicant?.email || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-slate-100">
                                <span className="text-slate-500">Base Amount (AUD):</span>
                                <span className="font-bold text-blue-900">A${amountAud.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-slate-100">
                                <span className="text-slate-500">Selected Currency:</span>
                                <span className="font-bold text-blue-900">{currency}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-slate-100">
                                <span className="text-slate-500">FX Conversion Rate:</span>
                                <span className="font-mono text-slate-700">1 AUD = {exchangeRate} {currency}</span>
                            </div>
                            <div className="flex justify-between py-2 bg-amber-50 px-3 rounded-xl border border-amber-200 font-extrabold text-amber-950">
                                <span>Total Payable ({currency}):</span>
                                <span>{currency} {convertedAmount.toFixed(2)}</span>
                            </div>
                        </div>

                        {/* Statutory Cap Reminder */}
                        <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 text-[11px] space-y-2">
                            <div className="font-bold text-blue-900 flex items-center gap-1.5">
                                <Lock className="h-3.5 w-3.5 text-amber-500" /> Clause 5.2 Contractual Liability Cap
                            </div>
                            <p className="text-slate-600 leading-relaxed">
                                Statutory maximum liability per candidate is strictly capped at <strong>A$3,599.20</strong> under agreement BCR-FIFO-2026-0810.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Printable PDF-Ready Modal (Crypto Redesign) */}
            {printModalOpen && (
                <div className="fixed inset-0 z-50 bg-blue-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white rounded-xl max-w-3xl w-full shadow-2xl my-8 print:m-0 print:p-0 print:shadow-none print:w-full overflow-hidden border border-slate-200">
                        
                        {/* Premium Crypto Header */}
                        <div className="bg-blue-950 text-white p-8 border-b-4 border-amber-400 print:bg-white print:text-blue-950 print:border-b-2 print:border-blue-900">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h1 className="text-3xl font-black uppercase tracking-tighter text-white print:text-blue-900 flex items-center gap-3">
                                        <ShieldAlert className="h-8 w-8 text-amber-400" />
                                        Blue Collar Recruitment
                                    </h1>
                                    <div className="mt-3 space-y-1">
                                        <p className="text-[11px] font-bold text-blue-200 print:text-slate-500 uppercase tracking-widest">Digital Asset Tax Invoice</p>
                                        <p className="text-[10px] text-blue-300 print:text-slate-400">ABN: 67 105 263 152 | FIFO Talent Placement</p>
                                        <p className="text-[10px] text-blue-300 print:text-slate-400">Level 12, 108 St Georges Terrace, Perth WA</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="inline-block bg-white/10 print:bg-blue-50 px-4 py-2 rounded-lg backdrop-blur-sm border border-white/20 print:border-blue-200">
                                        <p className="text-[10px] uppercase tracking-widest text-blue-200 print:text-blue-700 font-bold mb-1">Invoice Reference</p>
                                        <p className="text-lg font-black font-mono text-amber-400 print:text-blue-900">{generatedInvoiceNum}</p>
                                    </div>
                                    <p className="text-[11px] text-blue-300 print:text-slate-500 mt-3 font-medium">Issued: {new Date().toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 space-y-8">
                            {/* Candidate & Contract Info */}
                            <div className="flex flex-col md:flex-row gap-6">
                                <div className="flex-1 bg-slate-50 rounded-xl p-5 border border-slate-200">
                                    <p className="text-slate-400 uppercase text-[9px] font-black tracking-widest mb-3">Billed To Candidate</p>
                                    <p className="font-black text-blue-950 text-lg uppercase">{selectedApplicant?.fullName}</p>
                                    <div className="mt-2 space-y-1 text-xs text-slate-600 font-medium">
                                        <p>Candidate ID: <span className="font-bold text-slate-900">{selectedApplicant?.candidateNumber || `CND-${10000 + (selectedApplicant?.id || 1)}`}</span></p>
                                        <p>{selectedApplicant?.email}</p>
                                    </div>
                                </div>
                                <div className="flex-1 bg-slate-50 rounded-xl p-5 border border-slate-200">
                                    <p className="text-slate-400 uppercase text-[9px] font-black tracking-widest mb-3">Sponsorship Agreement</p>
                                    <p className="font-bold text-blue-900 text-sm font-mono">BCR-FIFO-2026-0810</p>
                                    <p className="text-xs text-slate-600 mt-2 font-medium">
                                        Milestone: <span className="font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">{paymentMilestone === 'partial' ? 'Initial Deposit (Modules 1-3)' : 'Full Programme Balance'}</span>
                                    </p>
                                </div>
                            </div>

                            {/* Line Items Table */}
                            <div className="rounded-xl overflow-hidden border border-slate-200">
                                <table className="w-full text-left text-xs border-collapse">
                                    <thead>
                                        <tr className="bg-slate-100 text-slate-500 font-black text-[10px] uppercase tracking-wider">
                                            <th className="p-4 border-b border-slate-200">Description of Services</th>
                                            <th className="p-4 border-b border-slate-200 text-right">Fiat Base (AUD)</th>
                                            <th className="p-4 border-b border-slate-200 text-right bg-blue-50/50">Crypto Due ({currency})</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        <tr>
                                            <td className="p-4 font-semibold text-blue-950 leading-relaxed">{invoiceDescription}</td>
                                            <td className="p-4 text-right font-medium text-slate-600">A${amountAud.toFixed(2)}</td>
                                            <td className="p-4 text-right font-black text-blue-900 bg-blue-50/50">{currency} {convertedAmount.toFixed(2)}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {/* Conversion & Remittance Split */}
                            <div className="flex flex-col md:flex-row gap-6">
                                {/* Conversion Breakdown */}
                                <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-5 text-xs space-y-3">
                                    <div className="flex items-center gap-2 text-slate-500 font-black uppercase text-[10px] tracking-widest border-b border-slate-200 pb-2 mb-2">
                                        <RefreshCw className="h-3 w-3" /> Fiat-to-Crypto Conversion
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Fiat Base Amount:</span>
                                        <span className="font-bold text-slate-800">A${amountAud.toFixed(2)} AUD</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Locked Rate:</span>
                                        <span className="font-mono font-bold text-slate-800 bg-white px-1 border border-slate-200 rounded">1 AUD = {exchangeRate} {currency}</span>
                                    </div>
                                    <div className="flex justify-between items-center pt-3 border-t border-slate-200 mt-2">
                                        <span className="text-blue-900 font-black uppercase text-[10px] tracking-wider">Final Settlement Amount</span>
                                        <span className="text-lg font-black text-blue-900">{currency} {convertedAmount.toFixed(2)}</span>
                                    </div>
                                </div>

                                {/* Crypto Remittance Details */}
                                {selectedBank && (
                                    <div className="flex-[1.5] bg-blue-950 text-white rounded-xl p-5 shadow-inner print:bg-white print:text-blue-950 print:border print:border-blue-900">
                                        <div className="flex items-center justify-between border-b border-blue-800 pb-3 mb-4 print:border-blue-200">
                                            <div className="font-black uppercase text-[10px] tracking-widest text-amber-400 print:text-blue-900 flex items-center gap-2">
                                                <Lock className="h-3.5 w-3.5" /> Secure Remittance Details
                                            </div>
                                            <span className="bg-amber-400/20 text-amber-400 print:bg-blue-100 print:text-blue-800 px-2 py-0.5 rounded font-bold text-[9px] uppercase tracking-wider border border-amber-400/30 print:border-blue-300">
                                                Strictly TRC-20 Network
                                            </span>
                                        </div>
                                        
                                        <div className="space-y-3 text-xs font-mono">
                                            <div>
                                                <div className="text-[9px] font-sans font-bold text-blue-400 print:text-slate-500 uppercase tracking-widest mb-0.5">Asset / Network</div>
                                                <div className="text-sm font-bold flex items-center gap-2">
                                                    USDT <span className="text-blue-300 print:text-slate-400 text-xs">on</span> TRON (TRC-20)
                                                </div>
                                            </div>
                                            
                                            <div>
                                                <div className="text-[9px] font-sans font-bold text-blue-400 print:text-slate-500 uppercase tracking-widest mb-0.5">Destination Address</div>
                                                <div className="bg-black/30 print:bg-slate-100 p-2 rounded border border-blue-800 print:border-slate-300 font-bold text-emerald-400 print:text-blue-900 break-all">
                                                    {selectedBank.accountNumber}
                                                </div>
                                            </div>
                                            
                                            <div className="grid grid-cols-2 gap-4 pt-2">
                                                <div>
                                                    <div className="text-[9px] font-sans font-bold text-blue-400 print:text-slate-500 uppercase tracking-widest mb-0.5">Entity Name</div>
                                                    <div className="font-bold print:text-slate-800">{selectedBank.accountName}</div>
                                                </div>
                                                <div>
                                                    <div className="text-[9px] font-sans font-bold text-blue-400 print:text-slate-500 uppercase tracking-widest mb-0.5">Payment Ref</div>
                                                    <div className="font-bold text-amber-400 print:text-amber-600">{generatedInvoiceNum}</div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="mt-4 pt-3 border-t border-blue-800/50 print:border-blue-100 text-[9px] text-blue-300 print:text-slate-500 font-sans leading-relaxed">
                                            <strong>WARNING:</strong> Sending any other asset to this address or using a non-TRC20 network will result in permanent loss of funds. Blue Collar Recruitment is not liable for incorrect transfers.
                                        </div>
                                    </div>
                                )}
                            </div>

                        </div>

                        {/* Modal Actions */}
                        <div className="bg-slate-50 p-6 border-t border-slate-200 flex items-center justify-between print:hidden">
                            <button
                                onClick={() => setPrintModalOpen(false)}
                                className="px-6 py-3 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-white transition-colors"
                            >
                                Close Preview
                            </button>
                            <button
                                onClick={() => window.print()}
                                className="bg-blue-900 text-amber-400 hover:bg-blue-800 px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-blue-900/20 transition-all active:scale-95"
                            >
                                <Printer className="h-4 w-4" /> Save / Print Crypto Invoice
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
