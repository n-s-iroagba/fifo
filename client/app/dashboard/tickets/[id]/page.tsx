'use client';

import React, { useState, useEffect } from 'react';
import { useApiQuery } from '@/lib/hooks';
import api from '@/lib/api';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { AvelingCredentialsCard } from '@/components/AvelingCredentialsCard';

interface UserData {
    id: number;
    fullName?: string;
    email?: string;
    bankName?: string;
    accountNumber?: string;
    accountName?: string;
    avelingUsername?: string;
    avelingPassword?: string;
}

interface ApplicationData {
    id: number;
    jobId?: number;
    status?: string;
    isPaid?: boolean;
    JobListing?: {
        id: number;
        title?: string;
        company?: string;
    };
}

interface Ticket {
    id: number;
    userId?: number;
    applicationId?: number;
    ticketType: string;
    status: 'not_possessed' | 'possessed';
    ticketNumber?: string;
    description?: string;
    purchasePrice?: number;
    realPrice?: number;
    subsidisedPrice?: number;
    sponsorshipDeadline?: string;
    ticketSponsorship: string;
    canApplySponsorship?: boolean;
    ticketSponsorshipRefundAmount?: number;
    bankName?: string;
    accountNumber?: string;
    accountName?: string;
    refundStatus?: string;
    courseId?: string;
    paymentStatus?: string;
    courseAccessGranted?: boolean;
    receiptUrl?: string;
    receiptReference?: string;
    createdAt?: string;
    updatedAt?: string;
    User?: UserData;
    Application?: ApplicationData;
}

export default function TicketDetailPage() {
    const params = useParams();
    const router = useRouter();
    const ticketId = params.id as string;

    const { data: ticketRes, isLoading, refetch } = useApiQuery<any>(
        ['ticket-detail', ticketId],
        `/tickets/${ticketId}`
    );

    // Support both wrapped res.data and unwrapped response objects
    const ticket: Ticket | undefined = ticketRes?.data?.id
        ? ticketRes.data
        : ticketRes?.id
            ? ticketRes
            : undefined;

    const { data: userRes } = useApiQuery<any>(
        ['auth', 'me'],
        '/auth/me'
    );
    const currentUser = userRes?.data || userRes;
    const userWalletBalance = currentUser?.walletBalance || 0;

    const [bankName, setBankName] = useState('TRC-20');
    const [accountNumber, setAccountNumber] = useState('');
    const [accountName, setAccountName] = useState('');
    const [applyError, setApplyError] = useState<string | null>(null);
    const [applySuccess, setApplySuccess] = useState<string | null>(null);
    const [applying, setApplying] = useState(false);
    const [refundProcessing, setRefundProcessing] = useState(false);
    const [refundMessage, setRefundMessage] = useState<string | null>(null);
    const [requestingRetake, setRequestingRetake] = useState(false);
    const [retakeError, setRetakeError] = useState<string | null>(null);

    // Prefill bank account details when user or ticket User data loads
    useEffect(() => {
        const u = ticket?.User || currentUser;
        if (u) {
            setBankName('TRC-20');
            if (u.accountNumber && !accountNumber) setAccountNumber(u.accountNumber);
            if (u.accountName && !accountName) setAccountName(u.accountName);
        }
    }, [ticket, currentUser]);

    const handleApplySponsorship = async (e: React.FormEvent) => {
        e.preventDefault();
        setApplyError(null);
        setApplySuccess(null);

        if (!accountNumber.trim() || !accountName.trim()) {
            setApplyError('Please carefully provide complete TRC-20 wallet details for refund processing.');
            return;
        }

        setApplying(true);
        try {
            await api.post(`/tickets/${ticketId}/apply-sponsorship`, {
                bankName,
                accountNumber,
                accountName
            });
            setApplySuccess('Sponsorship request submitted successfully!');
            refetch();
        } catch (err: any) {
            setApplyError(err.response?.data?.message || 'Failed to apply for sponsorship.');
        } finally {
            setApplying(false);
        }
    };

    const handleRefundChoice = async (action: 'use_for_another_ticket' | 'refund_to_bank') => {
        setRefundProcessing(true);
        setRefundMessage(null);
        try {
            await api.post(`/tickets/${ticketId}/refund-choice`, { action });
            setRefundMessage(
                action === 'use_for_another_ticket'
                    ? 'Refund successfully applied to your next ticket sponsorship credit!'
                    : 'Refund request submitted! Payout queued to your bank account.'
            );
            refetch();
        } catch (err: any) {
            setRefundMessage(err.response?.data?.message || 'Failed to process refund action.');
        } finally {
            setRefundProcessing(false);
        }
    };

    const handleRequestRetake = async () => {
        setRetakeError(null);
        setRequestingRetake(true);
        try {
            await api.post(`/tickets/${ticketId}/request-retake`);
            refetch();
        } catch (err: any) {
            setRetakeError(err.response?.data?.message || 'Failed to request retake.');
        } finally {
            setRequestingRetake(false);
        }
    };

    if (isLoading) {
        return (
            <div className="p-12 text-center">
                <div className="inline-flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-900 rounded-full animate-spin" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400">Loading Ticket Details...</span>
                </div>
            </div>
        );
    }

    if (!ticket) {
        return (
            <div className="p-12 text-center bg-white rounded-3xl border border-blue-100 max-w-xl mx-auto my-12">
                <span className="material-symbols-outlined text-4xl text-red-400 mb-3 block">confirmation_number</span>
                <p className="text-red-600 font-bold text-sm mb-4">Ticket details could not be found.</p>
                <Link href="/dashboard/tickets" className="inline-flex items-center gap-2 bg-blue-900 text-white px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-blue-800 transition-all">
                    <span className="material-symbols-outlined text-sm">arrow_back</span>
                    Return to Tickets
                </Link>
            </div>
        );
    }

    // Pricing calculation
    const payablePrice = ticket.subsidisedPrice ?? ticket.purchasePrice ?? 0;
    const originalPrice = ticket.realPrice;
    const isSubsidised = originalPrice !== undefined && originalPrice !== null && payablePrice < originalPrice;

    // Bank information source
    const effectiveBankName = ticket.bankName || ticket.User?.bankName;
    const effectiveAccountNumber = ticket.accountNumber || ticket.User?.accountNumber;
    const effectiveAccountName = ticket.accountName || ticket.User?.accountName;

    // Aveling LMS Link
    const avelingBaseUrl = typeof window !== 'undefined'
        ? (`${window.location.protocol}//${window.location.hostname}:3002`)
        : 'https://aveling.online';
    const avelingPayUrl = 'https://aveling.online'
    // `${avelingBaseUrl}/checkout?ticketId=${ticket.id}&courseId=${ticket.courseId || ''}&wallet=${userWalletBalance}`;

    const canSubmitSponsorshipForm =
        ticket.canApplySponsorship &&
        (ticket.ticketSponsorship === 'no_application' || ticket.ticketSponsorship === 'none' || !ticket.ticketSponsorship);

    return (
        <div className="font-sans text-blue-900 pb-24 max-w-4xl mx-auto">
            <Link href="/dashboard/tickets" className="inline-flex items-center gap-2 text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-6 hover:text-blue-600">
                <span className="material-symbols-outlined text-sm">arrow_back</span>
                Back to All Tickets
            </Link>

            {/* Header Card */}
            <header className="mb-8 bg-white p-8 rounded-3xl border border-blue-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-3">
                        <span className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.2em]">Ticket Details</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${ticket.status === 'possessed'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}>
                            {ticket.status === 'possessed' ? 'Possessed' : 'Not Possessed'}
                        </span>
                    </div>
                    <h1 className="text-2xl font-bold text-blue-900">{ticket.ticketType}</h1>
                    {ticket.description && (
                        <p className="text-xs text-slate-600 font-medium max-w-2xl leading-relaxed">{ticket.description}</p>
                    )}
                    {ticket.ticketNumber && (
                        <p className="text-xs text-slate-500">
                            Ticket Number: <strong className="text-blue-950">{ticket.ticketNumber}</strong>
                        </p>
                    )}
                </div>

                <div className="text-left md:text-right bg-blue-50/50 md:bg-transparent p-4 md:p-0 rounded-2xl border md:border-none border-blue-100 shrink-0">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Course Fee</span>
                    <div className="flex items-baseline gap-2 md:justify-end">
                        <span className="text-3xl font-extrabold text-blue-900">${payablePrice.toFixed(2)}</span>
                        {isSubsidised && (
                            <span className="text-xs text-slate-400 line-through">${originalPrice.toFixed(2)}</span>
                        )}
                    </div>
                    {isSubsidised && (
                        <span className="inline-block mt-1 text-[9px] font-black text-emerald-700 uppercase tracking-widest bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                            Subsidised
                        </span>
                    )}
                </div>
            </header>

            {/* Refund Claim Banner when Ticket is Issued */}
            {ticket.ticketSponsorship === 'ticket_issued' && (
                <section className="mb-8 p-8 bg-emerald-900 text-white rounded-3xl shadow-xl shadow-emerald-900/10 border border-emerald-800 animate-in fade-in slide-in-from-top-4">
                    <div className="flex items-start gap-4 mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-800 flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-3xl text-emerald-300">verified</span>
                        </div>
                        <div>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-300 block">Ticket Issued & Verified</span>
                            <h2 className="text-xl font-bold text-white mt-1">Claim Your Sponsorship Refund</h2>
                            <p className="text-xs text-emerald-200 mt-1 leading-relaxed">
                                You passed your exam! Eligible Refund Amount: <strong className="text-white">${ticket.ticketSponsorshipRefundAmount || payablePrice}</strong>
                            </p>
                        </div>
                    </div>

                    {refundMessage ? (
                        <div className="p-4 bg-emerald-800/80 rounded-2xl text-xs font-bold text-emerald-100 border border-emerald-700">
                            {refundMessage}
                        </div>
                    ) : ticket.refundStatus && ticket.refundStatus !== 'none' ? (
                        <div className="p-4 bg-emerald-800/80 rounded-2xl text-xs font-bold text-emerald-100 border border-emerald-700">
                            Refund Status: <span className="uppercase">{ticket.refundStatus.replace(/_/g, ' ')}</span>
                        </div>
                    ) : (
                        <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
                            <button
                                onClick={() => handleRefundChoice('use_for_another_ticket')}
                                disabled={refundProcessing}
                                className="w-full sm:w-auto bg-emerald-400 hover:bg-emerald-300 text-emerald-950 px-6 py-3.5 rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-md transition-all"
                            >
                                Use refund for another ticket credit
                            </button>
                            <button
                                onClick={() => handleRefundChoice('refund_to_bank')}
                                disabled={refundProcessing}
                                className="w-full sm:w-auto bg-emerald-800 hover:bg-emerald-700 text-white border border-emerald-700 px-6 py-3.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all"
                            >
                                Refund to my bank account
                            </button>
                        </div>
                    )}
                </section>
            )}

            {/* Action Banner when First Attempt Failed */}
            {ticket.ticketSponsorship === 'first_attempt_failed' && (
                <section className="mb-8 p-8 bg-amber-900 text-white rounded-3xl shadow-xl shadow-amber-900/10 border border-amber-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                        <span className="text-[10px] font-bold text-amber-300 uppercase tracking-widest block">Exam Failed</span>
                        <h2 className="text-xl font-bold text-white">Unlock Second Attempt</h2>
                        <p className="text-xs text-amber-200">
                            Your first attempt was unsuccessful. You can request a retake which requires a new payment.
                        </p>
                        {retakeError && (
                            <p className="text-xs font-bold text-red-300 mt-2">{retakeError}</p>
                        )}
                    </div>
                    <button
                        onClick={handleRequestRetake}
                        disabled={requestingRetake}
                        className="bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-amber-950 px-6 py-3.5 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg transition-all shrink-0"
                    >
                        <span>{requestingRetake ? 'Processing...' : 'Apply for Retake'}</span>
                        <span className="material-symbols-outlined text-base">refresh</span>
                    </button>
                </section>
            )}

            {/* Action Banner when Sponsorship Approved */}
            {(ticket.ticketSponsorship === 'first_attempt_approved' || ticket.ticketSponsorship === 'second_attempt_approved') && (
                <section className="mb-8 p-8 bg-blue-900 text-white rounded-3xl shadow-xl shadow-blue-900/10 border border-blue-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                        <span className="text-[10px] font-bold text-blue-300 uppercase tracking-widest block">Sponsorship Approved</span>
                        <h2 className="text-xl font-bold text-white">Complete Course Payment on Aveling LMS</h2>
                        <p className="text-xs text-blue-200">
                            Deadline: <strong className="text-white">{ticket.sponsorshipDeadline ? new Date(ticket.sponsorshipDeadline).toLocaleDateString() : '3 days'}</strong>
                        </p>
                    </div>

                    <a
                        href={avelingPayUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-emerald-500 hover:bg-emerald-400 text-emerald-950 px-6 py-3.5 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg transition-all shrink-0"
                    >
                        <span>Proceed to Aveling LMS Payment</span>
                        <span className="material-symbols-outlined text-base">arrow_forward</span>
                    </a>
                </section>
            )}

            {/* Aveling Candidate Credentials Card */}
            {(ticket.User?.avelingUsername || currentUser?.avelingUsername) && (
                <section className="mb-8">
                    <AvelingCredentialsCard
                        username={ticket.User?.avelingUsername || currentUser?.avelingUsername}
                        password={ticket.User?.avelingPassword || currentUser?.avelingPassword}
                        ticketType={ticket.ticketType}
                        courseId={ticket.courseId}
                    />
                </section>
            )}

            {/* Course & LMS Training Card */}
            <section className="mb-8 bg-white p-8 rounded-3xl border border-blue-100 shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-blue-50 pb-4">
                    <div>
                        <span className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.2em] block mb-1">Aveling Training LMS</span>
                        <h3 className="text-base font-bold text-blue-900">Course & LMS Delivery</h3>
                    </div>
                    {ticket.paymentStatus && (
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${ticket.paymentStatus === 'paid'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}>
                            Payment: {ticket.paymentStatus}
                        </span>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Course Reference</span>
                        <p className="text-xs font-bold text-blue-950 mt-1">{ticket.courseId || 'Not Assigned'}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Payment Status</span>
                        <p className="text-xs font-bold text-blue-950 mt-1 uppercase">{ticket.paymentStatus || 'Unpaid'}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Course Access</span>
                        <p className={`text-xs font-bold mt-1 ${ticket.courseAccessGranted ? 'text-emerald-700' : 'text-amber-700'}`}>
                            {ticket.courseAccessGranted ? 'Access Granted ✓' : 'Pending Payment'}
                        </p>
                    </div>
                </div>
            </section>

            {/* Sponsorship Form if Eligible to Apply */}
            {canSubmitSponsorshipForm && (
                <section className="mb-8 bg-white p-8 rounded-3xl border border-blue-100 shadow-sm">
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.2em] block mb-2">Apply For Sponsorship</span>
                    <h2 className="text-lg font-bold text-blue-900 mb-2">Submit USDT (TRC-20) Wallet Details</h2>
                    <p className="text-xs text-slate-500 mb-6">
                        Please carefully provide complete USDT wallet details on the TRC-20 network for refund processing upon passing your training exam.
                    </p>

                    {applyError && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                            {applyError}
                        </div>
                    )}
                    {applySuccess && (
                        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-700 text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                            {applySuccess}
                        </div>
                    )}

                    <form onSubmit={handleApplySponsorship} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-blue-900 mb-2">Network</label>
                                <input
                                    type="text"
                                    value="TRC-20"
                                    readOnly
                                    className="w-full bg-slate-100 border border-slate-200 rounded-xl p-3 text-xs text-slate-500 font-mono cursor-not-allowed"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-blue-900 mb-2">USDT Wallet Address</label>
                                <input
                                    type="text"
                                    placeholder="e.g. T..."
                                    value={accountNumber}
                                    onChange={(e) => setAccountNumber(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-blue-900 font-mono"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-blue-900 mb-2">Wallet Nickname</label>
                                <input
                                    type="text"
                                    placeholder="e.g. My Binance Wallet"
                                    value={accountName}
                                    onChange={(e) => setAccountName(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-blue-900 font-medium"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={applying}
                            className="bg-blue-900 hover:bg-blue-800 text-white px-8 py-3.5 rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-blue-900/10 transition-all"
                        >
                            {applying ? 'Submitting Application...' : 'Submit Sponsorship Request'}
                        </button>
                    </form>
                </section>
            )}

            {/* Sponsorship Progress Tracker */}
            <section className="bg-white p-8 rounded-3xl border border-blue-100 shadow-sm space-y-6">
                <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wider">Sponsorship Lifecycle Status</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Stage 1</span>
                        <p className="text-xs font-bold text-blue-950 mt-1">Application</p>
                        <p className="text-[11px] text-slate-500 mt-1">
                            Status: <span className="font-semibold uppercase">{ticket.ticketSponsorship || 'No Application'}</span>
                        </p>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Stage 2</span>
                        <p className="text-xs font-bold text-blue-950 mt-1">Wallet Refund Info</p>
                        <p className="text-[11px] text-slate-500 mt-1 font-medium">
                            {effectiveAccountNumber ? `TRC-20: ${effectiveAccountNumber}` : 'Not Provided'}
                        </p>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Stage 3</span>
                        <p className="text-xs font-bold text-blue-950 mt-1">Exam & Refund</p>
                        <p className="text-[11px] text-slate-500 mt-1">
                            Refund Amount: ${ticket.ticketSponsorshipRefundAmount || payablePrice}
                        </p>
                    </div>
                </div>
            </section>

            {/* Application Handoff Card if linked */}
            {ticket.Application && (
                <section className="mt-8 bg-white p-8 rounded-3xl border border-blue-100 shadow-sm flex items-center justify-between">
                    <div>
                        <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest block mb-1">Associated Application</span>
                        <h4 className="text-sm font-bold text-blue-900">Application #{ticket.Application.id}</h4>
                        <p className="text-xs text-slate-500">Status: <span className="font-semibold">{ticket.Application.status}</span></p>
                    </div>
                    <Link
                        href={`/dashboard/applications/${ticket.Application.id}`}
                        className="bg-blue-50 text-blue-900 border border-blue-200 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-blue-100 transition-all"
                    >
                        View Application
                    </Link>
                </section>
            )}
        </div>
    );
}

