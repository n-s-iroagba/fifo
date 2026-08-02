'use client';

import React, { useState } from 'react';
import { useApiQuery } from '@/lib/hooks';
import api from '@/lib/api';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface Ticket {
    id: number;
    ticketType: string;
    status: 'not_possessed' | 'possessed';
    ticketNumber?: string;
    description?: string;
    purchasePrice?: number;
    sponsorshipDeadline?: string;
    ticketSponsorship: string;
    ticketSponsorshipRefundAmount?: number;
    bankName?: string;
    accountNumber?: string;
    accountName?: string;
    refundStatus?: string;
    courseId?: string;
}

export default function TicketDetailPage() {
    const params = useParams();
    const router = useRouter();
    const ticketId = params.id as string;

    const { data: ticketRes, isLoading, refetch } = useApiQuery<{ success: boolean; data: Ticket }>(
        ['ticket-detail', ticketId],
        `/tickets/${ticketId}`
    );
    const ticket = ticketRes?.data;

    const [bankName, setBankName] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [accountName, setAccountName] = useState('');
    const [applyError, setApplyError] = useState<string | null>(null);
    const [applying, setApplying] = useState(false);
    const [refundProcessing, setRefundProcessing] = useState(false);
    const [refundMessage, setRefundMessage] = useState<string | null>(null);

    const handleApplySponsorship = async (e: React.FormEvent) => {
        e.preventDefault();
        setApplyError(null);

        if (!bankName.trim() || !accountNumber.trim() || !accountName.trim()) {
            setApplyError('Please carefully provide complete bank account details for refund processing.');
            return;
        }

        setApplying(true);
        try {
            await api.post(`/tickets/${ticketId}/apply-sponsorship`, {
                bankName,
                accountNumber,
                accountName
            });
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
            const res = await api.post(`/tickets/${ticketId}/refund-choice`, { action });
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

    if (isLoading) {
        return <div className="p-12 text-center text-[10px] font-bold uppercase tracking-widest text-blue-400">Loading Ticket Details...</div>;
    }

    if (!ticket) {
        return (
            <div className="p-12 text-center">
                <p className="text-red-500 font-bold text-sm mb-4">Ticket not found.</p>
                <Link href="/dashboard/tickets" className="text-blue-900 underline text-xs">Back to Tickets</Link>
            </div>
        );
    }

    const avelingPayUrl = `http://localhost:3002/checkout?ticketId=${ticket.id}&courseId=${ticket.courseId || ''}`;

    return (
        <div className="font-sans text-blue-900 pb-24 max-w-4xl mx-auto">
            <Link href="/dashboard/tickets" className="inline-flex items-center gap-2 text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-6 hover:text-blue-600">
                <span className="material-symbols-outlined text-sm">arrow_back</span>
                Back to All Tickets
            </Link>

            <header className="mb-8 bg-white p-8 rounded-3xl border border-blue-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.2em] block mb-1">Ticket Details</span>
                    <h1 className="text-2xl font-bold text-blue-900">{ticket.ticketType}</h1>
                    <p className="text-xs text-slate-500 mt-1">
                        Status: <span className="font-semibold text-blue-900">{ticket.status === 'possessed' ? 'Possessed' : 'Not Possessed'}</span>
                    </p>
                </div>

                <div className="text-right">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Estimated Fee</span>
                    <span className="text-2xl font-extrabold text-blue-900">${ticket.purchasePrice || 0}</span>
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
                                You passed your exam! Eligible Refund Amount: <strong className="text-white">${ticket.ticketSponsorshipRefundAmount || ticket.purchasePrice || 0}</strong>
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
                                Use the refund for another ticket
                            </button>
                            <button
                                onClick={() => handleRefundChoice('refund_to_bank')}
                                disabled={refundProcessing}
                                className="w-full sm:w-auto bg-emerald-800 hover:bg-emerald-700 text-white border border-emerald-700 px-6 py-3.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all"
                            >
                                No thanks, refund to my bank account
                            </button>
                        </div>
                    )}
                </section>
            )}

            {/* Approval Action Banner when Sponsorship Approved */}
            {(ticket.ticketSponsorship === 'first_attempt_approved' || ticket.ticketSponsorship === 'second_attempt_approved') && (
                <section className="mb-8 p-8 bg-blue-900 text-white rounded-3xl shadow-xl shadow-blue-900/10 border border-blue-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <span className="text-[10px] font-bold text-blue-300 uppercase tracking-widest block">Sponsorship Approved!</span>
                        <h2 className="text-xl font-bold text-white mt-1">Complete Course Payment on Aveling LMS</h2>
                        <p className="text-xs text-blue-200 mt-1">
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

            {/* Sponsorship Form if No Sponsorship Application Yet */}
            {ticket.ticketSponsorship === 'no_application' && (
                <section className="mb-8 bg-white p-8 rounded-3xl border border-blue-100 shadow-sm">
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.2em] block mb-2">Apply For Sponsorship</span>
                    <h2 className="text-lg font-bold text-blue-900 mb-2">Submit Bank Account Details</h2>
                    <p className="text-xs text-slate-500 mb-6">
                        Please carefully provide complete bank account details for refund processing upon passing your training exam.
                    </p>

                    {applyError && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                            {applyError}
                        </div>
                    )}

                    <form onSubmit={handleApplySponsorship} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-blue-900 mb-2">Bank Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Westpac / ANZ"
                                    value={bankName}
                                    onChange={(e) => setBankName(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-blue-900"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-blue-900 mb-2">Account Number / BSB</label>
                                <input
                                    type="text"
                                    placeholder="e.g. 062-000 12345678"
                                    value={accountNumber}
                                    onChange={(e) => setAccountNumber(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-blue-900"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-blue-900 mb-2">Account Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g. John Doe"
                                    value={accountName}
                                    onChange={(e) => setAccountName(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-blue-900"
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
                            Status: <span className="font-semibold uppercase">{ticket.ticketSponsorship}</span>
                        </p>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Stage 2</span>
                        <p className="text-xs font-bold text-blue-950 mt-1">Bank Refund Info</p>
                        <p className="text-[11px] text-slate-500 mt-1">
                            {ticket.bankName ? `${ticket.bankName} (${ticket.accountNumber})` : 'Not Provided'}
                        </p>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Stage 3</span>
                        <p className="text-xs font-bold text-blue-950 mt-1">Exam & Refund</p>
                        <p className="text-[11px] text-slate-500 mt-1">
                            Refund Amount: ${ticket.ticketSponsorshipRefundAmount || ticket.purchasePrice || 0}
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}
