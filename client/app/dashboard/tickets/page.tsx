'use client';

import React, { useState } from 'react';
import { useApiQuery } from '@/lib/hooks';
import api from '@/lib/api';
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
    createdAt?: string;
}

export default function UserTicketsPage() {
    const { data: ticketsRes, isLoading, refetch } = useApiQuery<{ success: boolean; data: Ticket[] }>(
        ['user-tickets'],
        '/tickets'
    );
    const tickets = ticketsRes?.data || [];

    const [showModal, setShowModal] = useState(false);
    const [ticketType, setTicketType] = useState('');
    const [status, setStatus] = useState<'not_possessed' | 'possessed'>('not_possessed');
    const [purchasePrice, setPurchasePrice] = useState('150');
    const [applySponsorship, setApplySponsorship] = useState(false);
    const [bankName, setBankName] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [accountName, setAccountName] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleCreateTicket = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!ticketType.trim()) {
            setError('Please select or specify a ticket type.');
            return;
        }

        if (applySponsorship && (!bankName || !accountNumber || !accountName)) {
            setError('Please carefully provide complete bank account details for refund processing.');
            return;
        }

        setSubmitting(true);
        try {
            await api.post('/tickets', {
                ticketType,
                status,
                purchasePrice: parseFloat(purchasePrice) || 0,
                applySponsorship,
                bankName,
                accountNumber,
                accountName
            });

            setShowModal(false);
            setTicketType('');
            setBankName('');
            setAccountNumber('');
            setAccountName('');
            refetch();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to add ticket.');
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusBadge = (sponsorshipStatus: string) => {
        switch (sponsorshipStatus) {
            case 'ticket_issued':
                return <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">Ticket Issued</span>;
            case 'first_attempt_approved':
            case 'second_attempt_approved':
                return <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">Sponsorship Approved</span>;
            case 'applied':
                return <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">Under Review</span>;
            case 'first_attempt_failed':
            case 'second_attempt_failed':
                return <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">Exam Failed</span>;
            default:
                return <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">No Sponsorship</span>;
        }
    };

    if (isLoading) {
        return <div className="p-12 text-center text-[10px] font-bold uppercase tracking-widest text-blue-400">Loading Tickets...</div>;
    }

    return (
        <div className="font-sans text-blue-900 pb-24">
            <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.2em] block mb-1">Qualifications & Compliance</span>
                    <h1 className="text-3xl font-bold text-blue-900 tracking-tight">Site Tickets & Sponsorship</h1>
                </div>

                <button
                    onClick={() => setShowModal(true)}
                    className="bg-blue-900 hover:bg-blue-800 text-white px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-blue-900/10 active:scale-95 transition-all self-start md:self-auto"
                >
                    <span className="material-symbols-outlined text-base">add</span>
                    Add / Request Ticket
                </button>
            </header>

            {/* Tickets Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tickets.length === 0 ? (
                    <div className="col-span-full bg-white p-12 rounded-2xl border-2 border-dashed border-blue-200 text-center">
                        <span className="material-symbols-outlined text-4xl text-blue-300 mb-3 block">confirmation_number</span>
                        <h3 className="text-lg font-bold text-blue-900 mb-1">No Tickets Added</h3>
                        <p className="text-blue-500 text-[11px] mb-6">Add your site tickets or apply for employer/agency ticket sponsorship.</p>
                        <button
                            onClick={() => setShowModal(true)}
                            className="bg-blue-900 text-white px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-blue-800 transition-all"
                        >
                            Add Your First Ticket
                        </button>
                    </div>
                ) : (
                    tickets.map((ticket) => (
                        <div key={ticket.id} className="bg-white p-6 rounded-2xl border border-blue-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                            <div>
                                <div className="flex items-center justify-between gap-2 mb-3">
                                    <span className={`px-2.5 py-1 rounded-md text-[9px] font-bold uppercase tracking-widest ${
                                        ticket.status === 'possessed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-50 text-slate-600 border border-slate-200'
                                    }`}>
                                        {ticket.status === 'possessed' ? 'Possessed' : 'Not Possessed'}
                                    </span>
                                    {getStatusBadge(ticket.ticketSponsorship)}
                                </div>

                                <h3 className="font-bold text-lg text-blue-900 mb-2">{ticket.ticketType}</h3>

                                <div className="space-y-1.5 text-[11px] text-slate-600 mb-6">
                                    {ticket.ticketNumber && <p><span className="font-semibold text-blue-950">Ticket #:</span> {ticket.ticketNumber}</p>}
                                    <p><span className="font-semibold text-blue-950">Est. Course Fee:</span> ${ticket.purchasePrice || 0}</p>
                                    {ticket.sponsorshipDeadline && (
                                        <p><span className="font-semibold text-blue-950">Sponsorship Deadline:</span> {new Date(ticket.sponsorshipDeadline).toLocaleDateString()}</p>
                                    )}
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                                <Link
                                    href={`/dashboard/tickets/${ticket.id}`}
                                    className="bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all w-full text-center"
                                >
                                    View Sponsorship Status & Details
                                </Link>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modal for Adding Ticket */}
            {showModal && (
                <div className="fixed inset-0 z-50 bg-blue-950/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl border border-blue-100 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-blue-900">Add or Request Ticket</h2>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleCreateTicket} className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-blue-900 mb-2">
                                    Ticket Type / Certification Name
                                </label>
                                <select
                                    value={ticketType}
                                    onChange={(e) => setTicketType(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-blue-900 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                >
                                    <option value="">-- Select Ticket Type --</option>
                                    <option value="Working at Heights (RIIWHS204D)">Working at Heights (RIIWHS204D)</option>
                                    <option value="Enter & Work in Confined Spaces (RIIWHS202D)">Enter & Work in Confined Spaces (RIIWHS202D)</option>
                                    <option value="Standard 11 Surface Refresher">Standard 11 Surface Refresher</option>
                                    <option value="First Aid & CPR (HLTAID011)">First Aid & CPR (HLTAID011)</option>
                                    <option value="Rigging / Dogging License">Rigging / Dogging License</option>
                                    <option value="White Card (CPCWHS1001)">White Card (CPCWHS1001)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-blue-900 mb-2">
                                    Possession Status
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setStatus('not_possessed')}
                                        className={`py-3 px-4 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all ${
                                            status === 'not_possessed' ? 'bg-blue-900 text-white border-blue-900' : 'bg-slate-50 text-slate-700 border-slate-200'
                                        }`}
                                    >
                                        Not Possessed (Need Ticket)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setStatus('possessed')}
                                        className={`py-3 px-4 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all ${
                                            status === 'possessed' ? 'bg-blue-900 text-white border-blue-900' : 'bg-slate-50 text-slate-700 border-slate-200'
                                        }`}
                                    >
                                        Already Possessed
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-blue-900 mb-2">
                                    Estimated Course Fee ($)
                                </label>
                                <input
                                    type="number"
                                    value={purchasePrice}
                                    onChange={(e) => setPurchasePrice(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-blue-900 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                            </div>

                            {status === 'not_possessed' && (
                                <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 space-y-3">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={applySponsorship}
                                            onChange={(e) => setApplySponsorship(e.target.checked)}
                                            className="w-4 h-4 text-blue-900 rounded border-slate-300 focus:ring-blue-500"
                                        />
                                        <span className="text-[11px] font-bold text-blue-900">Apply for Employer Ticket Sponsorship</span>
                                    </label>

                                    {applySponsorship && (
                                        <div className="space-y-3 pt-2">
                                            <p className="text-[10px] font-medium text-slate-500 italic">
                                                Please carefully provide complete bank account details for refund processing upon successful exam completion.
                                            </p>
                                            <input
                                                type="text"
                                                placeholder="Bank Name (e.g. Commonwealth Bank)"
                                                value={bankName}
                                                onChange={(e) => setBankName(e.target.value)}
                                                className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-blue-900"
                                            />
                                            <input
                                                type="text"
                                                placeholder="Account Number / BSB"
                                                value={accountNumber}
                                                onChange={(e) => setAccountNumber(e.target.value)}
                                                className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-blue-900"
                                            />
                                            <input
                                                type="text"
                                                placeholder="Account Name"
                                                value={accountName}
                                                onChange={(e) => setAccountName(e.target.value)}
                                                className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-blue-900"
                                            />
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="flex items-center justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest text-slate-600 hover:bg-slate-100"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="bg-blue-900 hover:bg-blue-800 text-white px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-blue-900/10"
                                >
                                    {submitting ? 'Submitting...' : 'Save Ticket'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
