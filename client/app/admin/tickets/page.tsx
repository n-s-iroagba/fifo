'use client';

import React, { useState } from 'react';
import { useApiQuery } from '@/lib/hooks';
import api from '@/lib/api';

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
    User?: {
        id: number;
        fullName?: string;
        email: string;
    };
    Application?: {
        id: number;
        status: string;
    };
    updatedAt?: string;
}

export default function AdminTicketsPage() {
    const [statusFilter, setStatusFilter] = useState('');
    const { data: ticketsRes, isLoading, refetch } = useApiQuery<{ success: boolean; data: Ticket[] }>(
        ['admin-tickets', statusFilter],
        `/admin/tickets${statusFilter ? `?sponsorshipStatus=${statusFilter}` : ''}`
    );
    const tickets = ticketsRes?.data || [];

    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    const [status, setStatus] = useState<'not_possessed' | 'possessed'>('not_possessed');
    const [ticketSponsorship, setTicketSponsorship] = useState('applied');
    const [purchasePrice, setPurchasePrice] = useState('150');
    const [ticketSponsorshipRefundAmount, setTicketSponsorshipRefundAmount] = useState('150');
    const [sponsorshipDeadline, setSponsorshipDeadline] = useState('');
    const [includeMail, setIncludeMail] = useState(true); // Requirement 1.4.4 Include Mail toggle
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const openEditModal = (t: Ticket) => {
        setSelectedTicket(t);
        setStatus(t.status);
        setTicketSponsorship(t.ticketSponsorship);
        setPurchasePrice(t.purchasePrice ? t.purchasePrice.toString() : '150');
        setTicketSponsorshipRefundAmount(
            t.ticketSponsorshipRefundAmount ? t.ticketSponsorshipRefundAmount.toString() : (t.purchasePrice ? t.purchasePrice.toString() : '150')
        );
        setSponsorshipDeadline(
            t.sponsorshipDeadline ? new Date(t.sponsorshipDeadline).toISOString().slice(0, 10) : ''
        );
        setIncludeMail(true);
        setMessage(null);
        setError(null);
    };

    const handleUpdateTicket = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTicket) return;

        setSaving(true);
        setMessage(null);
        setError(null);

        try {
            await api.put(`/admin/tickets/${selectedTicket.id}`, {
                status,
                ticketSponsorship,
                purchasePrice: parseFloat(purchasePrice) || 0,
                ticketSponsorshipRefundAmount: parseFloat(ticketSponsorshipRefundAmount) || 0,
                sponsorshipDeadline: sponsorshipDeadline || null,
                includeMail // Requirement 1.4.4
            });

            setMessage(`Ticket updated successfully! ${includeMail ? 'Notification mail sent to candidate.' : ''}`);
            setTimeout(() => {
                setSelectedTicket(null);
                refetch();
            }, 1200);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to update ticket.');
        } finally {
            setSaving(false);
        }
    };

    const getStatusBadge = (sponsorshipStatus: string) => {
        switch (sponsorshipStatus) {
            case 'ticket_issued':
                return <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">Ticket Issued</span>;
            case 'first_attempt_approved':
            case 'second_attempt_approved':
                return <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">Approved</span>;
            case 'applied':
                return <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">Applied</span>;
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
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.2em] block mb-1">Administration</span>
                    <h1 className="text-3xl font-bold text-blue-900 tracking-tight">Applicant Ticket Sponsorships</h1>
                </div>

                <div className="flex items-center gap-3">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-white border border-blue-100 rounded-xl p-3 text-xs text-blue-900 font-medium shadow-sm focus:outline-none"
                    >
                        <option value="">All Sponsorship Statuses</option>
                        <option value="applied">Applied (Under Review)</option>
                        <option value="first_attempt_approved">First Attempt Approved</option>
                        <option value="first_attempt_failed">First Attempt Failed</option>
                        <option value="second_attempt_approved">Second Attempt Approved</option>
                        <option value="second_attempt_failed">Second Attempt Failed</option>
                        <option value="ticket_issued">Ticket Issued</option>
                    </select>
                </div>
            </header>

            {/* Tickets Table */}
            <div className="bg-white rounded-3xl border border-blue-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-blue-50/50 text-[10px] font-bold uppercase tracking-widest text-blue-400 border-b border-blue-100">
                            <tr>
                                <th className="p-4 pl-6">Applicant</th>
                                <th className="p-4">Ticket Type</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Sponsorship Status</th>
                                <th className="p-4">Bank Details</th>
                                <th className="p-4">Refund Amount</th>
                                <th className="p-4 pr-6 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-blue-50 font-medium text-slate-700">
                            {tickets.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="p-8 text-center text-slate-400 italic">
                                        No tickets found.
                                    </td>
                                </tr>
                            ) : (
                                tickets.map((t) => (
                                    <tr key={t.id} className="hover:bg-blue-50/30 transition-colors">
                                        <td className="p-4 pl-6">
                                            <p className="font-bold text-blue-900">{t.User?.fullName || 'Applicant'}</p>
                                            <p className="text-[10px] text-slate-400">{t.User?.email}</p>
                                        </td>
                                        <td className="p-4 font-bold text-blue-900">{t.ticketType}</td>
                                        <td className="p-4">
                                            <span className={`px-2.5 py-1 rounded-md text-[9px] font-bold uppercase tracking-widest ${
                                                t.status === 'possessed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-50 text-slate-600 border border-slate-200'
                                            }`}>
                                                {t.status === 'possessed' ? 'Possessed' : 'Not Possessed'}
                                            </span>
                                        </td>
                                        <td className="p-4">{getStatusBadge(t.ticketSponsorship)}</td>
                                        <td className="p-4 text-[11px]">
                                            {t.bankName ? (
                                                <div>
                                                    <p className="font-bold text-blue-900">{t.bankName}</p>
                                                    <p className="text-[10px] text-slate-500">{t.accountNumber} ({t.accountName})</p>
                                                </div>
                                            ) : (
                                                <span className="text-slate-400 italic">None</span>
                                            )}
                                        </td>
                                        <td className="p-4 font-bold text-blue-900">
                                            ${t.ticketSponsorshipRefundAmount || t.purchasePrice || 0}
                                        </td>
                                        <td className="p-4 pr-6 text-right">
                                            <button
                                                onClick={() => openEditModal(t)}
                                                className="bg-blue-900 hover:bg-blue-800 text-white px-3.5 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-sm transition-all"
                                            >
                                                Review / Edit
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit Ticket Sponsorship Modal */}
            {selectedTicket && (
                <div className="fixed inset-0 z-50 bg-blue-950/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl border border-blue-100 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest block">Review Sponsorship</span>
                                <h2 className="text-xl font-bold text-blue-900">{selectedTicket.ticketType}</h2>
                                <p className="text-xs text-slate-500">Applicant: {selectedTicket.User?.fullName} ({selectedTicket.User?.email})</p>
                            </div>
                            <button onClick={() => setSelectedTicket(null)} className="text-slate-400 hover:text-slate-600">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        {message && (
                            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-700 text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                                {message}
                            </div>
                        )}

                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleUpdateTicket} className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-blue-900 mb-2">
                                    Possession Status
                                </label>
                                <select
                                    value={status}
                                    onChange={(e: any) => setStatus(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-blue-900 font-medium"
                                >
                                    <option value="not_possessed">Not Possessed</option>
                                    <option value="possessed">Possessed</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-blue-900 mb-2">
                                    Sponsorship Lifecycle Status
                                </label>
                                <select
                                    value={ticketSponsorship}
                                    onChange={(e) => setTicketSponsorship(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-blue-900 font-medium"
                                >
                                    <option value="no_application">No Application</option>
                                    <option value="applied">Applied (Under Review)</option>
                                    <option value="first_attempt_approved">First Attempt Approved</option>
                                    <option value="first_attempt_failed">First Attempt Failed</option>
                                    <option value="second_attempt_approved">Second Attempt Approved</option>
                                    <option value="second_attempt_failed">Second Attempt Failed</option>
                                    <option value="ticket_issued">Ticket Issued</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-blue-900 mb-2">Course Price ($)</label>
                                    <input
                                        type="number"
                                        value={purchasePrice}
                                        onChange={(e) => setPurchasePrice(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-blue-900"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-blue-900 mb-2">Refund Amount ($)</label>
                                    <input
                                        type="number"
                                        value={ticketSponsorshipRefundAmount}
                                        onChange={(e) => setTicketSponsorshipRefundAmount(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-blue-900"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-blue-900 mb-2">Sponsorship Deadline</label>
                                <input
                                    type="date"
                                    value={sponsorshipDeadline}
                                    onChange={(e) => setSponsorshipDeadline(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-blue-900"
                                />
                                <p className="text-[10px] text-slate-400 mt-1 italic">
                                    Defaults to 3 days after approval date.
                                </p>
                            </div>

                            {/* Requirement 1.4.4: Include Mail Toggle Button / Switch */}
                            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold text-blue-900">Include Email Notification</p>
                                    <p className="text-[10px] text-slate-500">Send automated email update with link to applicant.</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={includeMail}
                                        onChange={(e) => setIncludeMail(e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-900"></div>
                                </label>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setSelectedTicket(null)}
                                    className="px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest text-slate-600 hover:bg-slate-100"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="bg-blue-900 hover:bg-blue-800 text-white px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-blue-900/10"
                                >
                                    {saving ? 'Updating...' : 'Save & Update Status'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
