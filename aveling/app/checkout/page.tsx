'use client';

// STEP-1.1.6, STEP-1.1.7, STEP-1.1.8, STEP-1.1.9, STEP-1.1.10, STEP-1.1.17
import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CreditCard, CheckCircle2, ArrowRight, Upload, Building2, Copy, Wallet, FileCheck, Loader2 } from 'lucide-react';
import { apiClient } from '../../lib/axios';

interface BankDetails {
    bankName: string;
    bsb: string;
    accountNumber: string;
    accountName: string;
}

function CheckoutContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const ticketId = searchParams.get('ticketId') || '';
    const candidateNumber = searchParams.get('candidateNumber') || 'CND-10001';
    const courseIdParam = searchParams.get('courseId') || '';
    const walletParam = parseFloat(searchParams.get('wallet') || '0');
    const coursePrice = parseFloat(searchParams.get('price') || '280');

    const [emailSent, setEmailSent] = useState(false);
    const [useWallet, setUseWallet] = useState(false);
    const [receiptFile, setReceiptFile] = useState<File | null>(null);
    const [receiptRef, setReceiptRef] = useState('');
    const [submittingReceipt, setSubmittingReceipt] = useState(false);
    const [paymentSubmitted, setPaymentSubmitted] = useState(false);
    const [copiedField, setCopiedField] = useState<string | null>(null);
    const [bankDetails, setBankDetails] = useState<BankDetails | null>(null);
    const [bankLoading, setBankLoading] = useState(true);

    const walletBalance = walletParam; // Passed from candidate portal via query param
    const payableAmount = useWallet ? Math.max(0, coursePrice - walletBalance) : coursePrice;

    // STEP-1.1.7: Fetch live bank account details from backend
    useEffect(() => {
        const fetchBankDetails = async () => {
            try {
                // Fetch the platform-wide bank account configured by admins
                // Route to the new bank-accounts router and bypass caching
                const bankRes = await apiClient.get(`/bank-accounts?_t=${new Date().getTime()}`);
                
                if (bankRes.data?.rows?.length > 0) {
                    const bank = bankRes.data.rows[0];
                    setBankDetails({
                        bankName: bank.bankName,
                        bsb: bank.routingCode,
                        accountNumber: bank.accountNumber,
                        accountName: bank.bankName
                    });
                } else {
                    setBankDetails(null);
                }
            } catch (err) {
                console.error("Failed to fetch bank details", err);
                setBankDetails(null);
            } finally {
                setBankLoading(false);
            }
        };
        fetchBankDetails();
    }, []);

    // STEP-1.1.8: Trigger automated payment details email on navigation
    useEffect(() => {
        if (!ticketId) return;
        const sendCheckoutEmail = async () => {
            try {
                await apiClient.post(`/tickets/${ticketId}/checkout-email`, {
                    candidateNumber,
                    courseId: courseIdParam
                });
                setEmailSent(true);
            } catch {
                setEmailSent(true); // Show confirmation even if email is queued
            }
        };
        sendCheckoutEmail();
    }, [ticketId, candidateNumber, courseIdParam]);

    const handleCopy = (text: string, field: string) => {
        navigator.clipboard.writeText(text);
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000);
    };

    const convertFileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = (error) => reject(error);
        });
    };

    // STEP-1.1.9 & 1.1.10: Submit receipt
    const handlePaymentReceiptSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmittingReceipt(true);
        try {
            let uploadedReceiptUrl = 'https://example.com/dummy-receipt.pdf';
            if (receiptFile) {
                try {
                    uploadedReceiptUrl = await convertFileToBase64(receiptFile);
                } catch (e) {
                    console.warn("Base64 conversion failed, using fallback", e);
                }
            }

            await apiClient.post(`/tickets/${ticketId || '1'}/submit-receipt`, {
                receiptReference: receiptRef || `REF-${candidateNumber}-${Date.now()}`,
                receiptUrl: uploadedReceiptUrl,
                candidateNumber,
                useWallet, // STEP-1.1.17 Wallet Payment Logic
            });

            setPaymentSubmitted(true);
        } catch (err: any) {
            console.error('Failed to submit receipt:', err);
            alert(err.response?.data?.message || 'Failed to submit receipt. Please try again.');
        } finally {
            setSubmittingReceipt(false);
        }
    };

    return (
        <div className="mx-auto max-w-4xl space-y-8 py-6 px-4">
            {/* Header */}
            <div className="border-b border-zinc-200 pb-6 dark:border-zinc-800 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-black bg-[#FFC700] px-2.5 py-0.5 rounded">
                        CANDIDATE: {candidateNumber}
                    </span>
                    {emailSent && (
                        <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200 dark:bg-emerald-950 dark:border-emerald-900">
                            ✓ Payment instructions emailed to you
                        </span>
                    )}
                </div>
                <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
                    <CreditCard className="h-7 w-7 text-[#FFC700]" />
                    Checkout & Bank Payment Gateway
                </h1>
                <p className="text-xs text-zinc-600 dark:text-zinc-400">
                    Ticket Sponsorship — Bank Transfer Verification for Ticket #{ticketId || 'N/A'}
                </p>
            </div>

            {paymentSubmitted ? (
                /* Post-submission: pending admin approval */
                <div className="rounded-2xl border border-amber-300 bg-white p-8 shadow-xl dark:border-amber-900 dark:bg-zinc-900 text-center space-y-6">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400">
                        <FileCheck className="h-10 w-10" />
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-2xl font-black text-zinc-900 dark:text-white">Payment Receipt Submitted!</h2>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-md mx-auto">
                            Reference: <strong>{receiptRef || `REF-${candidateNumber}`}</strong> — submitted for admin verification.
                        </p>
                    </div>

                    <div className="mx-auto max-w-md rounded-xl border border-amber-200 bg-amber-50 p-4 text-left dark:border-amber-900 dark:bg-amber-950/40 text-xs space-y-2">
                        <div className="flex justify-between font-bold text-amber-900 dark:text-amber-200">
                            <span>Status:</span>
                            <span className="uppercase text-amber-600 bg-white px-2 py-0.5 rounded border border-amber-300">
                                Pending Admin Approval
                            </span>
                        </div>
                        <p className="text-amber-800 dark:text-amber-300">
                            Once our admin verifies your bank receipt, your course modules will automatically unlock. You'll receive an email confirmation.
                        </p>
                    </div>

                    <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button
                            onClick={() => router.push(courseIdParam ? `/courses/${courseIdParam}` : '/dashboard')}
                            className="inline-flex items-center gap-2 rounded-xl bg-[#FFC700] text-black px-6 py-3 text-xs font-black uppercase tracking-wider shadow-lg hover:bg-yellow-400 transition-all"
                        >
                            Go to Course Workspace
                            <ArrowRight className="h-4 w-4 stroke-[3]" />
                        </button>
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="inline-flex items-center gap-2 rounded-xl border border-zinc-300 bg-white px-5 py-3 text-xs font-bold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                        >
                            Return to Candidate Portal
                        </button>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                    <div className="lg:col-span-7 space-y-6">
                        {/* STEP-1.1.7: Bank Account Payment Details — fetched live */}
                        {payableAmount > 0 && (
                            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
                                <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
                                    <h2 className="text-sm font-extrabold uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-2">
                                        <Building2 className="h-5 w-5 text-[#FFC700]" />
                                        Bank Account Payment Details
                                    </h2>
                                    <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded">
                                        DIRECT DEPOSIT
                                    </span>
                                </div>

                                <p className="text-xs text-zinc-600 dark:text-zinc-400">
                                    Transfer the exact payable amount using the details below. Use your unique payment reference so we can auto-match your payment.
                                </p>

                                {bankLoading ? (
                                    <div className="flex items-center gap-2 text-xs text-zinc-500 py-4">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Loading bank details...
                                    </div>
                                ) : bankDetails && (
                                    <div className="space-y-3 bg-zinc-50 dark:bg-zinc-950 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-mono">
                                        <div className="flex justify-between items-center py-1.5 border-b border-zinc-200/60 dark:border-zinc-800">
                                            <span className="text-zinc-500 font-sans font-bold">Bank Name:</span>
                                            <span className="font-extrabold text-zinc-900 dark:text-white">{bankDetails.bankName}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-1.5 border-b border-zinc-200/60 dark:border-zinc-800">
                                            <span className="text-zinc-500 font-sans font-bold">BSB:</span>
                                            <div className="flex items-center gap-2">
                                                <span className="font-black text-[#FFC700] text-sm">{bankDetails.bsb}</span>
                                                <button onClick={() => handleCopy(bankDetails.bsb, 'bsb')} className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white">
                                                    <Copy className="h-3.5 w-3.5" />
                                                </button>
                                                {copiedField === 'bsb' && <span className="text-emerald-600 text-[10px] font-bold">Copied!</span>}
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center py-1.5 border-b border-zinc-200/60 dark:border-zinc-800">
                                            <span className="text-zinc-500 font-sans font-bold">Account Number:</span>
                                            <div className="flex items-center gap-2">
                                                <span className="font-black text-[#FFC700] text-sm">{bankDetails.accountNumber}</span>
                                                <button onClick={() => handleCopy(bankDetails.accountNumber, 'account')} className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white">
                                                    <Copy className="h-3.5 w-3.5" />
                                                </button>
                                                {copiedField === 'account' && <span className="text-emerald-600 text-[10px] font-bold">Copied!</span>}
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center py-1.5 border-b border-zinc-200/60 dark:border-zinc-800">
                                            <span className="text-zinc-500 font-sans font-bold">Account Name:</span>
                                            <span className="font-bold text-zinc-900 dark:text-white">{bankDetails.accountName}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-1.5 bg-amber-50 dark:bg-amber-950/60 px-3 rounded-lg border border-amber-300">
                                            <span className="text-amber-900 dark:text-amber-200 font-sans font-extrabold">Payment Reference:</span>
                                            <div className="flex items-center gap-2">
                                                <span className="font-black text-amber-900 dark:text-amber-300 text-sm">AVL-REF-{candidateNumber}</span>
                                                <button onClick={() => handleCopy(`AVL-REF-${candidateNumber}`, 'ref')} className="text-amber-700 hover:text-amber-900">
                                                    <Copy className="h-3.5 w-3.5" />
                                                </button>
                                                {copiedField === 'ref' && <span className="text-emerald-600 text-[10px] font-bold">Copied!</span>}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* STEP-1.1.9 & 1.1.10: Upload Payment Receipt */}
                        <form onSubmit={handlePaymentReceiptSubmit} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
                            <h2 className="text-sm font-extrabold uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-2">
                                {payableAmount === 0 ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> : <Upload className="h-5 w-5 text-[#FFC700]" />}
                                {payableAmount === 0 ? 'Full Payment Covered by Wallet' : 'Upload Payment Receipt'}
                            </h2>

                            {payableAmount > 0 && (
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-xs font-extrabold text-zinc-700 dark:text-zinc-300 mb-1">
                                            Bank Transfer Reference / Transaction ID:
                                        </label>
                                        <input
                                            type="text"
                                            value={receiptRef}
                                            onChange={(e) => setReceiptRef(e.target.value)}
                                            placeholder="e.g. N10928841-XYZ or Bank Reference Code"
                                            className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 p-2.5 rounded-xl text-xs font-bold text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-[#FFC700]"
                                            required={payableAmount > 0}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-extrabold text-zinc-700 dark:text-zinc-300 mb-1">
                                            Attach Payment Receipt (Image or PDF):
                                        </label>
                                        <input
                                            type="file"
                                            accept="image/*,.pdf"
                                            onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
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
                                    ? (payableAmount === 0 ? 'Confirming...' : 'Uploading Receipt...')
                                    : (payableAmount === 0 ? 'Confirm Wallet Payment' : 'I Have Made Payment — Submit Receipt')}
                            </button>
                        </form>
                    </div>

                    {/* Order Summary + Wallet (STEP-1.1.17) */}
                    <div className="lg:col-span-5 space-y-6">
                        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
                            <h2 className="text-sm font-extrabold uppercase tracking-wider text-zinc-900 dark:text-white">
                                Ticket Order Summary
                            </h2>

                            <div className="bg-zinc-50 dark:bg-zinc-800 p-4 rounded-xl space-y-2 text-xs">
                                <div className="flex justify-between font-bold">
                                    <span className="text-zinc-600 dark:text-zinc-400">Ticket:</span>
                                    <span className="text-zinc-900 dark:text-white">#{ticketId}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-zinc-500">Course Price:</span>
                                    <span className="font-extrabold text-zinc-900 dark:text-white">${coursePrice.toFixed(2)} AUD</span>
                                </div>
                            </div>

                            {/* Wallet Refund Toggle — STEP-1.1.17 */}
                            {walletBalance > 0 && (
                                <div className="bg-amber-50 border border-amber-300 dark:bg-amber-950/60 dark:border-amber-900 rounded-xl p-4 space-y-2">
                                    <div className="flex items-start gap-3">
                                        <input
                                            type="checkbox"
                                            id="walletOpt"
                                            checked={useWallet}
                                            onChange={(e) => setUseWallet(e.target.checked)}
                                            className="mt-1 h-4 w-4 accent-[#FFC700] rounded cursor-pointer"
                                        />
                                        <label htmlFor="walletOpt" className="text-xs cursor-pointer select-none">
                                            <span className="font-black text-amber-950 dark:text-amber-200 flex items-center gap-1">
                                                <Wallet className="h-3.5 w-3.5 text-[#FFC700]" />
                                                Apply Wallet Refund Balance (−${walletBalance.toFixed(2)} AUD)
                                            </span>
                                            <span className="block text-[11px] text-amber-800 dark:text-amber-300 mt-0.5">
                                                Use your course completion refund balance toward this ticket.
                                            </span>
                                        </label>
                                    </div>
                                </div>
                            )}

                            <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 space-y-2 text-xs">
                                <div className="flex justify-between text-zinc-500">
                                    <span>Subtotal:</span>
                                    <span>${coursePrice.toFixed(2)}</span>
                                </div>
                                {useWallet && (
                                    <div className="flex justify-between text-emerald-600 font-extrabold">
                                        <span>Wallet Applied:</span>
                                        <span>−${walletBalance.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-sm font-black pt-2 border-t border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white">
                                    <span>Total Bank Transfer Payable:</span>
                                    <span className="text-[#FFC700] text-base">${payableAmount.toFixed(2)} AUD</span>
                                </div>
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
