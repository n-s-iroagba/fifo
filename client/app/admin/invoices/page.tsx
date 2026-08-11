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
    bankName: string;
    bsb: string;
    accountNumber: string;
    accountName: string;
    swiftCode?: string;
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

                        {/* 2. Select Corporate Bank Account */}
                        <div className="bg-white rounded-3xl border border-blue-100 p-6 shadow-sm space-y-4">
                            <h2 className="text-xs font-black uppercase tracking-wider text-blue-900 flex items-center gap-2">
                                <Building2 className="h-4 w-4 text-amber-500" /> 2. Corporate Receiving Bank Account
                            </h2>
                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                                    Select Corporate Bank Account Dropdown:
                                </label>
                                <select
                                    value={selectedBankId}
                                    onChange={e => setSelectedBankId(e.target.value)}
                                    className="w-full bg-slate-50 border border-blue-100 rounded-xl p-3 text-xs font-bold text-blue-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
                                >
                                    {bankAccounts.map(bank => (
                                        <option key={bank.id} value={bank.id}>
                                            {bank.bankName} — BSB: {bank.bsb} | Acc: {bank.accountNumber} {bank.isDefault ? '(PRIMARY)' : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            {selectedBank && (
                                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1 font-mono">
                                    <div className="flex justify-between"><span className="text-slate-500">Account Name:</span> <span className="font-bold text-blue-900">{selectedBank.accountName}</span></div>
                                    <div className="flex justify-between"><span className="text-slate-500">BSB Code:</span> <span className="font-bold">{selectedBank.bsb}</span></div>
                                    <div className="flex justify-between"><span className="text-slate-500">Account Number:</span> <span className="font-bold">{selectedBank.accountNumber}</span></div>
                                    {selectedBank.swiftCode && <div className="flex justify-between"><span className="text-slate-500">SWIFT / BIC Code:</span> <span className="font-bold text-amber-600">{selectedBank.swiftCode}</span></div>}
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

            {/* Printable PDF-Ready Modal */}
            {printModalOpen && (
                <div className="fixed inset-0 z-50 bg-blue-950/60 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white rounded-3xl max-w-3xl w-full p-8 shadow-2xl space-y-6 my-8 print:m-0 print:p-0 print:shadow-none print:w-full">
                        {/* Printable Header */}
                        <div className="flex justify-between items-start border-b-2 border-blue-900 pb-4">
                            <div>
                                <h1 className="text-2xl font-black uppercase text-blue-900 tracking-tight">Blue Collar Recruitment Pty Ltd</h1>
                                <p className="text-xs font-bold text-slate-500">ABN: 67 105 263 152 | FIFO Talent &amp; Training Placement Services</p>
                                <p className="text-[11px] text-slate-400">Level 12, 108 St Georges Terrace, Perth WA 6000</p>
                            </div>
                            <div className="text-right">
                                <span className="bg-blue-900 text-amber-400 font-black text-xs uppercase px-3 py-1 rounded">TAX INVOICE</span>
                                <p className="text-xs font-bold text-blue-900 mt-2">Ref: {generatedInvoiceNum}</p>
                                <p className="text-[11px] text-slate-500">Date: {new Date().toLocaleDateString()}</p>
                            </div>
                        </div>

                        {/* Candidate Billing Info */}
                        <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                            <div>
                                <p className="text-slate-400 uppercase text-[9px] font-bold">Billed To Candidate:</p>
                                <p className="font-bold text-blue-900 text-sm">{selectedApplicant?.fullName}</p>
                                <p className="text-slate-600">ID: {selectedApplicant?.candidateNumber || `CND-${10000 + (selectedApplicant?.id || 1)}`}</p>
                                <p className="text-slate-600">{selectedApplicant?.email}</p>
                            </div>
                            <div>
                                <p className="text-slate-400 uppercase text-[9px] font-bold">Sponsorship Agreement:</p>
                                <p className="font-bold text-blue-900">BCR-FIFO-2026-0810</p>
                                <p className="text-slate-600">Milestone: {paymentMilestone === 'partial' ? 'Initial Deposit (Modules 1-3)' : 'Full Programme Balance'}</p>
                            </div>
                        </div>

                        {/* Invoice Table */}
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="bg-blue-900 text-white font-bold text-[10px] uppercase">
                                    <th className="p-3">Item Description</th>
                                    <th className="p-3 text-right">Amount (AUD)</th>
                                    <th className="p-3 text-right">Converted ({currency})</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                <tr>
                                    <td className="p-3 font-semibold text-blue-950">{invoiceDescription}</td>
                                    <td className="p-3 text-right font-bold">A${amountAud.toFixed(2)}</td>
                                    <td className="p-3 text-right font-black text-blue-900">{currency} {convertedAmount.toFixed(2)}</td>
                                </tr>
                            </tbody>
                        </table>

                        {/* Exchange Rate Box */}
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs space-y-1">
                            <div className="font-bold text-amber-950 uppercase text-[10px]">Foreign Currency Conversion Breakdown</div>
                            <p className="text-amber-900">Base Currency Amount: <strong>A${amountAud.toFixed(2)} AUD</strong></p>
                            <p className="text-amber-900">Exchange Rate Applied: <strong>1 AUD = {exchangeRate} {currency}</strong></p>
                            <p className="text-amber-950 font-black text-sm pt-1 border-t border-amber-200">
                                Net Remittance Due: {currency} {convertedAmount.toFixed(2)}
                            </p>
                        </div>

                        {/* Remittance Details */}
                        {selectedBank && (
                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-1 font-mono">
                                <div className="font-sans font-bold text-blue-900 uppercase text-[10px] mb-2">Corporate Remittance Details (SWIFT Wire)</div>
                                <div><span className="font-sans text-slate-500">Bank Name:</span> <strong>{selectedBank.bankName}</strong></div>
                                <div><span className="font-sans text-slate-500">BSB Code:</span> <strong>{selectedBank.bsb}</strong></div>
                                <div><span className="font-sans text-slate-500">Account Number:</span> <strong>{selectedBank.accountNumber}</strong></div>
                                <div><span className="font-sans text-slate-500">Account Name:</span> <strong>{selectedBank.accountName}</strong></div>
                                {selectedBank.swiftCode && <div><span className="font-sans text-slate-500">SWIFT / BIC Code:</span> <strong>{selectedBank.swiftCode}</strong></div>}
                                <div><span className="font-sans text-slate-500">Payment Reference:</span> <strong className="text-amber-700">{generatedInvoiceNum}</strong></div>
                            </div>
                        )}

                        <div className="border-t border-slate-200 pt-4 flex items-center justify-between print:hidden">
                            <button
                                onClick={() => setPrintModalOpen(false)}
                                className="px-5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-50"
                            >
                                Close Preview
                            </button>
                            <button
                                onClick={() => window.print()}
                                className="bg-blue-900 text-amber-400 hover:bg-blue-800 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg"
                            >
                                <Printer className="h-4 w-4" /> Print / Save as PDF
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
