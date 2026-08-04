'use client';

import React, { useState } from 'react';
import { useApiQuery } from '@/lib/hooks';
import api from '@/lib/api';
import Link from 'next/link';
import { AvelingCredentialsCard } from '@/components/AvelingCredentialsCard';

interface UserData {
    id: number;
    fullName?: string;
    email?: string;
    avelingUsername?: string;
    avelingPassword?: string;
}

interface Ticket {
    id: number;
    ticketType: string;
    status: 'not_possessed' | 'possessed';
    ticketNumber?: string;
    description?: string;
    purchasePrice?: number;
    realPrice?: number;
    subsidisedPrice?: number;
    canApplySponsorship?: boolean;
    sponsorshipDeadline?: string;
    ticketSponsorship: 'no_application' | 'applied' | 'first_attempt_approved' | 'first_attempt_failed' | 'second_attempt_approved' | 'second_attempt_failed' | 'ticket_issued';
    ticketSponsorshipRefundAmount?: number;
    refundStatus?: string;
    proof?: string;
    courseId?: string;
    createdAt?: string;
    applicationId?: number;
    User?: UserData;
}

interface UserProfile {
    bankName?: string;
    accountNumber?: string;
    accountName?: string;
    avelingUsername?: string;
    avelingPassword?: string;
}

const sponsorshipInProgress = (s: string) =>
    ['applied', 'first_attempt_approved', 'first_attempt_failed', 'second_attempt_approved', 'second_attempt_failed'].includes(s);

const isSponsorshipActive = (tickets: Ticket[]) =>
    tickets.some(t => sponsorshipInProgress(t.ticketSponsorship));

function PriceDisplay({ ticket }: { ticket: Ticket }) {
    const price = ticket.subsidisedPrice ?? ticket.purchasePrice ?? 0;
    const original = ticket.realPrice;
    const hasSubsidy = original !== undefined && original !== null && ticket.subsidisedPrice !== undefined && ticket.subsidisedPrice !== null && original > ticket.subsidisedPrice;

    return (
        <div className="flex items-baseline gap-2">
            <span className="text-xl font-black text-blue-900">${price.toFixed(2)}</span>
            {hasSubsidy && (
                <span className="text-xs text-slate-400 line-through">${original!.toFixed(2)}</span>
            )}
            {hasSubsidy && (
                <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">Subsidised</span>
            )}
        </div>
    );
}

function SponsorshipBadge({ status }: { status: string }) {
    const map: Record<string, { label: string; cls: string }> = {
        ticket_issued: { label: 'Ticket Issued ✓', cls: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
        first_attempt_approved: { label: 'Approved – Enrol Now', cls: 'bg-blue-100 text-blue-800 border-blue-200' },
        second_attempt_approved: { label: 'Re-Approved – Enrol Now', cls: 'bg-blue-100 text-blue-800 border-blue-200' },
        applied: { label: 'Under Review', cls: 'bg-amber-100 text-amber-800 border-amber-200' },
        first_attempt_failed: { label: 'Exam Failed (1st)', cls: 'bg-red-100 text-red-800 border-red-200' },
        second_attempt_failed: { label: 'Exam Failed (2nd)', cls: 'bg-red-100 text-red-800 border-red-200' },
        no_application: { label: 'No Sponsorship', cls: 'bg-slate-100 text-slate-600 border-slate-200' },
    };
    const cfg = map[status] ?? map.no_application;
    return <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${cfg.cls}`}>{cfg.label}</span>;
}

export default function UserTicketsPage() {
    const { data: ticketsRes, isLoading, refetch } = useApiQuery<{ success: boolean; data: Ticket[] }>(
        ['user-tickets'],
        '/tickets'
    );
    const { data: profileRes } = useApiQuery<{ success: boolean; data: UserProfile }>(
        ['user-profile'],
        '/auth/me'
    );
    const tickets = ticketsRes?.data || [];
    const profile = profileRes?.data;
    const hasActiveSponsor = isSponsorshipActive(tickets);

    // Upload proof modal
    const [uploadTicket, setUploadTicket] = useState<Ticket | null>(null);
    const [proofFile, setProofFile] = useState<File | null>(null);
    const [ticketNumber, setTicketNumber] = useState('');
    const [uploadSubmitting, setUploadSubmitting] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);

    // Sponsorship modal
    const [sponsorTicket, setSponsorTicket] = useState<Ticket | null>(null);
    const [bankName, setBankName] = useState(profile?.bankName || '');
    const [accountNumber, setAccountNumber] = useState(profile?.accountNumber || '');
    const [accountName, setAccountName] = useState(profile?.accountName || '');
    const [sponsorSubmitting, setSponsorSubmitting] = useState(false);
    const [sponsorError, setSponsorError] = useState<string | null>(null);
    const [sponsorSuccess, setSponsorSuccess] = useState<string | null>(null);

    const openSponsorModal = (t: Ticket) => {
        setSponsorTicket(t);
        setBankName(profile?.bankName || '');
        setAccountNumber(profile?.accountNumber || '');
        setAccountName(profile?.accountName || '');
        setSponsorError(null);
        setSponsorSuccess(null);
    };

    const handleUploadProof = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!uploadTicket) return;
        setUploadError(null);
        setUploadSubmitting(true);
        try {
            await api.put(`/tickets/${uploadTicket.id}`, {
                status: 'possessed',
                ticketNumber: ticketNumber || null,
            });
            setUploadTicket(null);
            setProofFile(null);
            setTicketNumber('');
            refetch();
        } catch (err: any) {
            setUploadError(err.response?.data?.message || 'Failed to update ticket.');
        } finally {
            setUploadSubmitting(false);
        }
    };

    const handleApplySponsorship = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!sponsorTicket) return;
        setSponsorError(null);
        setSponsorSuccess(null);

        if (!bankName || !accountNumber || !accountName) {
            setSponsorError('Please provide complete bank account details for refund processing.');
            return;
        }

        setSponsorSubmitting(true);
        try {
            await api.post(`/tickets/${sponsorTicket.id}/apply-sponsorship`, { bankName, accountNumber, accountName });
            setSponsorSuccess('Sponsorship application submitted successfully. We will review and notify you shortly.');
            setTimeout(() => { setSponsorTicket(null); refetch(); }, 2000);
        } catch (err: any) {
            setSponsorError(err.response?.data?.message || 'Failed to apply for sponsorship.');
        } finally {
            setSponsorSubmitting(false);
        }
    };

    if (isLoading) return (
        <div className="p-12 text-center">
            <div className="inline-flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-900 rounded-full animate-spin" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400">Loading Tickets...</span>
            </div>
        </div>
    );

    return (
        <div className="font-sans text-blue-900 pb-24">
            <header className="mb-10">
                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.2em] block mb-1">Qualifications & Compliance</span>
                <h1 className="text-3xl font-bold text-blue-900 tracking-tight">Site Tickets & Sponsorship</h1>
                <p className="text-sm text-slate-500 mt-2">Below are the ticket requirements for your applications. Upload proof if you hold a ticket, or apply for sponsorship if you need one.</p>
            </header>

            {/* Active sponsorship notice */}
            {hasActiveSponsor && (
                <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
                    <span className="material-symbols-outlined text-amber-500 text-xl mt-0.5">info</span>
                    <div>
                        <p className="text-xs font-bold text-amber-800">Active Sponsorship In Progress</p>
                        <p className="text-[11px] text-amber-700 mt-1">You currently have an active sponsorship application. You can only have one sponsorship active at a time. Complete or cancel the active one before applying for another.</p>
                    </div>
                </div>
            )}

            {/* Tickets Grid */}
            {tickets.length === 0 ? (
                <div className="bg-white p-16 rounded-3xl border-2 border-dashed border-blue-200 text-center">
                    <span className="material-symbols-outlined text-5xl text-blue-200 mb-4 block">confirmation_number</span>
                    <h3 className="text-lg font-bold text-blue-900 mb-2">No Ticket Requirements Yet</h3>
                    <p className="text-blue-400 text-[11px]">Your recruiter will assign ticket requirements to your application. Check back soon.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {tickets.map((ticket) => {
                        const isPossessed = ticket.status === 'possessed';
                        const isIssued = ticket.ticketSponsorship === 'ticket_issued';
                        const canApply = ticket.canApplySponsorship && !isPossessed && !isIssued && !hasActiveSponsor;
                        const inSponsorship = sponsorshipInProgress(ticket.ticketSponsorship);
                        const showPrice = !isPossessed && !isIssued;

                        return (
                            <div key={ticket.id} className={`bg-white rounded-3xl border shadow-sm flex flex-col transition-all hover:shadow-md ${
                                isPossessed || isIssued ? 'border-emerald-200' : 'border-blue-100'
                            }`}>
                                {/* Card top accent */}
                                <div className={`h-1 rounded-t-3xl ${
                                    isIssued ? 'bg-emerald-500' : isPossessed ? 'bg-emerald-400' : inSponsorship ? 'bg-amber-400' : 'bg-blue-200'
                                }`} />

                                <div className="p-6 flex flex-col flex-1">
                                    <div className="flex items-start justify-between gap-2 mb-4">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Ticket Requirement</p>
                                            <h3 className="font-bold text-base text-blue-900 leading-tight">{ticket.ticketType}</h3>
                                        </div>
                                        <span className={`flex-shrink-0 px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border ${
                                            isPossessed || isIssued ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-600 border-slate-200'
                                        }`}>
                                            {isIssued ? 'Issued' : isPossessed ? 'Possessed' : 'Required'}
                                        </span>
                                    </div>

                                    {ticket.description && (
                                        <p className="text-[11px] text-slate-500 mb-4 leading-relaxed">{ticket.description}</p>
                                    )}

                                    <div className="space-y-2 mb-4">
                                        {ticket.ticketNumber && (
                                            <div className="flex items-center gap-2">
                                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Ticket #</span>
                                                <span className="text-[11px] font-bold text-blue-900">{ticket.ticketNumber}</span>
                                            </div>
                                        )}
                                        {ticket.sponsorshipDeadline && (
                                            <div className="flex items-center gap-2">
                                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Deadline</span>
                                                <span className="text-[11px] font-bold text-amber-700">{new Date(ticket.sponsorshipDeadline).toLocaleDateString()}</span>
                                            </div>
                                        )}
                                        {ticket.ticketSponsorshipRefundAmount && isIssued && (
                                            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                                                <p className="text-[9px] font-black uppercase tracking-widest text-emerald-600 mb-1">Refund Earned</p>
                                                <p className="text-lg font-black text-emerald-700">${ticket.ticketSponsorshipRefundAmount}</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Price – only shown for tickets that are not possessed / issued */}
                                    {showPrice && (ticket.realPrice !== undefined || ticket.subsidisedPrice !== undefined || ticket.purchasePrice !== undefined) && (
                                        <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl mb-4">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-blue-400 mb-1">Course Fee</p>
                                            <PriceDisplay ticket={ticket} />
                                        </div>
                                    )}

                                    <div className="mb-4">
                                        <SponsorshipBadge status={ticket.ticketSponsorship} />
                                    </div>

                                    {/* Action buttons */}
                                    <div className="mt-auto flex flex-col gap-2">
                                        {!isPossessed && !isIssued && (
                                            <button
                                                onClick={() => { setUploadTicket(ticket); setTicketNumber(''); setProofFile(null); setUploadError(null); }}
                                                className="w-full py-2.5 px-4 rounded-xl text-[10px] font-bold uppercase tracking-widest border border-blue-200 bg-blue-50 text-blue-900 hover:bg-blue-100 transition-all"
                                            >
                                                <span className="flex items-center justify-center gap-1.5">
                                                    <span className="material-symbols-outlined text-sm">upload</span>
                                                    Upload Ticket Proof
                                                </span>
                                            </button>
                                        )}

                                        {canApply && (
                                            <button
                                                onClick={() => openSponsorModal(ticket)}
                                                className="w-full py-2.5 px-4 rounded-xl text-[10px] font-bold uppercase tracking-widest bg-blue-900 text-white hover:bg-blue-800 shadow-md shadow-blue-900/10 transition-all"
                                            >
                                                <span className="flex items-center justify-center gap-1.5">
                                                    <span className="material-symbols-outlined text-sm">volunteer_activism</span>
                                                    Apply for Sponsorship
                                                </span>
                                            </button>
                                        )}

                                        {!canApply && !isPossessed && !isIssued && ticket.canApplySponsorship && hasActiveSponsor && (
                                            <p className="text-center text-[10px] text-amber-600 font-bold">Complete active sponsorship first</p>
                                        )}

                                        {!ticket.canApplySponsorship && !isPossessed && !isIssued && (
                                            <p className="text-center text-[10px] text-slate-400 italic">Sponsorship not available for this ticket</p>
                                        )}

                                        <Link
                                            href={`/dashboard/tickets/${ticket.id}`}
                                            className="w-full py-2.5 px-4 rounded-xl text-[10px] font-bold uppercase tracking-widest text-center border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all"
                                        >
                                            View Full Details
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Upload Proof Modal */}
            {uploadTicket && (
                <div className="fixed inset-0 z-50 bg-blue-950/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-blue-100">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <span className="text-[9px] font-black uppercase tracking-widest text-blue-400 block mb-1">Upload Proof</span>
                                <h2 className="text-lg font-bold text-blue-900">{uploadTicket.ticketType}</h2>
                            </div>
                            <button onClick={() => setUploadTicket(null)} className="text-slate-400 hover:text-slate-600">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        {uploadError && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-[10px] font-bold uppercase tracking-widest">{uploadError}</div>
                        )}

                        <form onSubmit={handleUploadProof} className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-blue-900 mb-2">Ticket / Certificate Number</label>
                                <input
                                    type="text"
                                    placeholder="e.g. CERT-12345"
                                    value={ticketNumber}
                                    onChange={e => setTicketNumber(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-blue-900 font-medium"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-blue-900 mb-2">Proof Document (PDF/Image)</label>
                                <input
                                    type="file"
                                    accept="image/*,.pdf"
                                    onChange={e => setProofFile(e.target.files?.[0] || null)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-blue-900 font-medium"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-2">
                                <button type="button" onClick={() => setUploadTicket(null)} className="px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:bg-slate-100">Cancel</button>
                                <button type="submit" disabled={uploadSubmitting} className="bg-blue-900 hover:bg-blue-800 text-white px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-blue-900/10">
                                    {uploadSubmitting ? 'Uploading...' : 'Mark as Possessed'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Apply Sponsorship Modal */}
            {sponsorTicket && (
                <div className="fixed inset-0 z-50 bg-blue-950/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-blue-100 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <span className="text-[9px] font-black uppercase tracking-widest text-blue-400 block mb-1">Apply for Sponsorship</span>
                                <h2 className="text-lg font-bold text-blue-900">{sponsorTicket.ticketType}</h2>
                            </div>
                            <button onClick={() => setSponsorTicket(null)} className="text-slate-400 hover:text-slate-600">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        {/* Price breakdown */}
                        {(sponsorTicket.realPrice || sponsorTicket.subsidisedPrice || sponsorTicket.purchasePrice) && (
                            <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-2xl">
                                <p className="text-[9px] font-black uppercase tracking-widest text-blue-400 mb-2">Course Fee to be Sponsored</p>
                                <PriceDisplay ticket={sponsorTicket} />
                                <p className="text-[10px] text-slate-500 mt-2">Upon passing your exam, this amount will be refunded to your registered bank account or wallet.</p>
                            </div>
                        )}

                        {sponsorError && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-[10px] font-bold uppercase tracking-widest">{sponsorError}</div>
                        )}
                        {sponsorSuccess && (
                            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-700 text-[10px] font-bold uppercase tracking-widest">{sponsorSuccess}</div>
                        )}

                        <form onSubmit={handleApplySponsorship} className="space-y-4">
                            <div>
                                <p className="text-[10px] font-bold text-blue-900 uppercase tracking-widest mb-3">Bank Account for Refund</p>
                                <p className="text-[11px] text-slate-500 mb-4">Provide your bank details for refund processing upon successful exam completion. This will update your profile bank details.</p>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-blue-900 mb-2">Bank Name</label>
                                <input type="text" placeholder="e.g. Commonwealth Bank" value={bankName} onChange={e => setBankName(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-blue-900" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-blue-900 mb-2">Account Number / BSB</label>
                                <input type="text" placeholder="Account Number" value={accountNumber} onChange={e => setAccountNumber(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-blue-900" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-blue-900 mb-2">Account Name</label>
                                <input type="text" placeholder="Account Name" value={accountName} onChange={e => setAccountName(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-blue-900" />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-2">
                                <button type="button" onClick={() => setSponsorTicket(null)} className="px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:bg-slate-100">Cancel</button>
                                <button type="submit" disabled={sponsorSubmitting} className="bg-blue-900 hover:bg-blue-800 text-white px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-blue-900/10">
                                    {sponsorSubmitting ? 'Submitting...' : 'Submit Sponsorship Application'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
