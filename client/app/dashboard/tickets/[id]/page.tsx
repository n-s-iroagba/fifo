'use client';

import React, { useState, useEffect } from 'react';
import { useApiQuery } from '@/lib/hooks';
import api from '@/lib/api';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { AvelingCredentialsCard } from '@/components/AvelingCredentialsCard';
import { getAvelingUrl } from '@/lib/avelingUrl';

interface UserData {
    id: number;
    fullName?: string;
    email?: string;
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

    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [applyError, setApplyError] = useState<string | null>(null);
    const [applySuccess, setApplySuccess] = useState<string | null>(null);
    const [applying, setApplying] = useState(false);
    const [refundProcessing, setRefundProcessing] = useState(false);
    const [refundMessage, setRefundMessage] = useState<string | null>(null);
    const [requestingRetake, setRequestingRetake] = useState(false);
    const [retakeError, setRetakeError] = useState<string | null>(null);

    const handleApplySponsorship = async (e: React.FormEvent) => {
        e.preventDefault();
        setApplyError(null);
        setApplySuccess(null);

        if (!agreedToTerms) {
            setApplyError('You must agree to the Refund Policy and commit to fulfilling your responsibilities before applying.');
            return;
        }

        setApplying(true);
        try {
            await api.post(`/tickets/${ticketId}/apply-sponsorship`, {
                agreedToTerms: true
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

    // Aveling LMS Link
    const avelingBaseUrl = getAvelingUrl();
    const avelingPayUrl = getAvelingUrl(`/checkout?ticketId=${ticket.id}&courseId=${ticket.courseId || ''}&wallet=${userWalletBalance}`);

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
                    <h2 className="text-lg font-bold text-blue-900 mb-2">Ticket Sponsorship & Refund Policy</h2>
                    <p className="text-xs text-slate-500 mb-6">
                        Review the official refund terms and confirm your commitment to fulfilling all training requirements.
                    </p>

                    {/* Official Refund Policy Card */}
                    <div className="mb-6 p-4 bg-amber-50/80 border border-amber-200 rounded-2xl space-y-2.5">
                        <div className="flex items-center gap-2 text-amber-950 font-black text-xs uppercase tracking-wider">
                            <span className="material-symbols-outlined text-amber-600 text-lg">verified_user</span>
                            <span>Official Refund Policy & Terms</span>
                        </div>
                        <ul className="text-xs text-slate-700 space-y-2 pl-1 leading-relaxed">
                            <li className="flex items-start gap-2">
                                <span className="text-emerald-600 font-black text-sm mt-[-2px]">&#10003;</span>
                                <span>
                                    <strong className="text-blue-950">100% Refund upon Passing:</strong> Upon successfully passing and acquiring your ticket certifications, 100% of your candidate contribution will be refunded.
                                </span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-amber-600 font-black text-sm mt-[-2px]">&#9679;</span>
                                <span>
                                    <strong className="text-blue-950">60% Refund after Two Attempts:</strong> In the event you are unable to acquire the tickets after two examination attempts, 60% of your candidate contribution will be refunded.
                                </span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-blue-600 font-black text-sm mt-[-2px]">&#9679;</span>
                                <span>
                                    <strong className="text-blue-950">Corporate Risk Mitigation:</strong> Your partial contribution is a commitment deposit to ensure candidates complete their sponsored training and prevent corporate wastage.
                                </span>
                            </li>
                        </ul>
                    </div>

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
                        <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-3">
                            <p className="text-[10px] font-black text-blue-900 uppercase tracking-widest">
                                Applicant Responsibility Agreement
                            </p>
                            <p className="text-xs text-slate-600 leading-relaxed">
                                By applying, you commit that if approved for corporate ticket sponsorship, you will diligently complete all assigned Aveling coursework modules, participate in required assessments, and fulfill your obligations under the recruitment and placement agreement.
                            </p>
                            <label className="flex items-start gap-3 cursor-pointer select-none pt-1">
                                <input
                                    type="checkbox"
                                    checked={agreedToTerms}
                                    onChange={e => setAgreedToTerms(e.target.checked)}
                                    className="mt-0.5 w-4 h-4 rounded text-blue-900 border-slate-300 focus:ring-blue-800"
                                    required
                                />
                                <span className="text-xs font-bold text-blue-950 leading-snug">
                                    I have read and agree to the Refund Policy, and I commit to fulfilling my responsibilities if granted ticket sponsorship.
                                </span>
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={applying || !agreedToTerms}
                            className="bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-blue-950 px-8 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg transition-all"
                        >
                            {applying ? 'Submitting Application...' : 'Agree & Submit Sponsorship Request'}
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
                        <p className="text-xs font-bold text-blue-950 mt-1">Training & Assessment</p>
                        <p className="text-[11px] text-slate-500 mt-1 font-medium">
                            {ticket.courseAccessGranted ? 'Course In Progress' : 'Pending Enrollment'}
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

