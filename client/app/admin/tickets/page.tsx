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
    realPrice?: number;
    subsidisedPrice?: number;
    canApplySponsorship?: boolean;
    sponsorshipDeadline?: string;
    ticketSponsorship: string;
    ticketSponsorshipRefundAmount?: number;
    refundStatus?: string;
    proof?: string;
    courseId?: string;
    User?: { id: number; fullName?: string; email: string; bankName?: string; accountNumber?: string; accountName?: string; };
    Application?: { id: number; status: string; };
    updatedAt?: string;
}

type ModalTab = 'status' | 'pricing' | 'config';

const SPONSORSHIP_STATUS_LABELS: Record<string, string> = {
    no_application: 'No Application',
    applied: 'Applied – Under Review',
    first_attempt_approved: 'First Attempt Approved',
    first_attempt_failed: 'First Attempt Failed',
    second_attempt_approved: 'Second Attempt Approved',
    second_attempt_failed: 'Second Attempt Failed',
    ticket_issued: 'Ticket Issued',
};

function SponsorshipBadge({ status }: { status: string }) {
    const map: Record<string, string> = {
        ticket_issued: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        first_attempt_approved: 'bg-blue-100 text-blue-800 border-blue-200',
        second_attempt_approved: 'bg-blue-100 text-blue-800 border-blue-200',
        applied: 'bg-amber-100 text-amber-800 border-amber-200',
        first_attempt_failed: 'bg-red-100 text-red-800 border-red-200',
        second_attempt_failed: 'bg-red-100 text-red-800 border-red-200',
        no_application: 'bg-slate-100 text-slate-600 border-slate-200',
    };
    return (
        <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${map[status] ?? map.no_application}`}>
            {SPONSORSHIP_STATUS_LABELS[status] ?? status}
        </span>
    );
}

export default function AdminTicketsPage() {
    const [statusFilter, setStatusFilter] = useState('');
    const { data: ticketsRes, isLoading, refetch } = useApiQuery<{ success: boolean; data: Ticket[] }>(
        ['admin-tickets', statusFilter],
        `/admin/tickets${statusFilter ? `?sponsorshipStatus=${statusFilter}` : ''}`
    );
    const tickets = ticketsRes?.data || [];

    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    const [activeTab, setActiveTab] = useState<ModalTab>('status');

    // Status tab state
    const [status, setStatus] = useState<'not_possessed' | 'possessed'>('not_possessed');
    const [ticketSponsorship, setTicketSponsorship] = useState('applied');
    const [ticketSponsorshipRefundAmount, setTicketSponsorshipRefundAmount] = useState('');
    const [sponsorshipDeadline, setSponsorshipDeadline] = useState('');
    const [includeMail, setIncludeMail] = useState(true);

    // Pricing tab state
    const [realPrice, setRealPrice] = useState('');
    const [subsidisedPrice, setSubsidisedPrice] = useState('');
    const [purchasePrice, setPurchasePrice] = useState('');

    // Config tab state
    const [canApplySponsorship, setCanApplySponsorship] = useState(false);
    const [courseId, setCourseId] = useState('');
    const [description, setDescription] = useState('');
    const [ticketType, setTicketType] = useState('');

    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);

    const openEditModal = (t: Ticket) => {
        setSelectedTicket(t);
        setActiveTab('status');
        setStatus(t.status);
        setTicketSponsorship(t.ticketSponsorship);
        setTicketSponsorshipRefundAmount(t.ticketSponsorshipRefundAmount?.toString() ?? '');
        setSponsorshipDeadline(t.sponsorshipDeadline ? new Date(t.sponsorshipDeadline).toISOString().slice(0, 10) : '');
        setIncludeMail(true);
        setRealPrice(t.realPrice?.toString() ?? '');
        setSubsidisedPrice(t.subsidisedPrice?.toString() ?? '');
        setPurchasePrice(t.purchasePrice?.toString() ?? '');
        setCanApplySponsorship(t.canApplySponsorship ?? false);
        setCourseId(t.courseId ?? '');
        setDescription(t.description ?? '');
        setTicketType(t.ticketType);
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
                ticketSponsorshipRefundAmount: ticketSponsorshipRefundAmount ? parseFloat(ticketSponsorshipRefundAmount) : null,
                sponsorshipDeadline: sponsorshipDeadline || null,
                realPrice: realPrice ? parseFloat(realPrice) : null,
                subsidisedPrice: subsidisedPrice ? parseFloat(subsidisedPrice) : null,
                purchasePrice: purchasePrice ? parseFloat(purchasePrice) : null,
                canApplySponsorship,
                courseId: courseId || null,
                description: description || null,
                ticketType,
                includeMail,
            });
            setMessage(`Ticket updated.${includeMail ? ' Notification email sent to applicant.' : ''}`);
            setTimeout(() => { setSelectedTicket(null); refetch(); }, 1500);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to update ticket.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedTicket) return;
        if (!confirm(`Delete ticket requirement "${selectedTicket.ticketType}" for ${selectedTicket.User?.fullName || 'this applicant'}? This cannot be undone.`)) return;
        setDeleting(true);
        try {
            await api.delete(`/admin/tickets/${selectedTicket.id}`);
            setSelectedTicket(null);
            refetch();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to delete ticket.');
        } finally {
            setDeleting(false);
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
            <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.2em] block mb-1">Administration</span>
                    <h1 className="text-3xl font-bold text-blue-900 tracking-tight">Applicant Ticket Requirements</h1>
                    <p className="text-sm text-slate-500 mt-1">Manage all ticket requirements across applications. Add requirements per application from the application detail page.</p>
                </div>
                <div className="flex items-center gap-3">
                    <select
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                        className="bg-white border border-blue-100 rounded-xl p-3 text-xs text-blue-900 font-medium shadow-sm focus:outline-none"
                    >
                        <option value="">All Sponsorship Statuses</option>
                        {Object.entries(SPONSORSHIP_STATUS_LABELS).map(([v, l]) => (
                            <option key={v} value={v}>{l}</option>
                        ))}
                    </select>
                </div>
            </header>

            <div className="bg-white rounded-3xl border border-blue-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-blue-50/50 text-[10px] font-bold uppercase tracking-widest text-blue-400 border-b border-blue-100">
                            <tr>
                                <th className="p-4 pl-6">Applicant</th>
                                <th className="p-4">Ticket Type</th>
                                <th className="p-4">Possession</th>
                                <th className="p-4">Sponsorship Status</th>
                                <th className="p-4">Can Apply</th>
                                <th className="p-4">Bank (Applicant)</th>
                                <th className="p-4">Price</th>
                                <th className="p-4 pr-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-blue-50 font-medium text-slate-700">
                            {tickets.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="p-8 text-center text-slate-400 italic text-[11px]">No tickets found.</td>
                                </tr>
                            ) : (
                                tickets.map(t => (
                                    <tr key={t.id} className="hover:bg-blue-50/30 transition-colors">
                                        <td className="p-4 pl-6">
                                            <p className="font-bold text-blue-900">{t.User?.fullName || 'Applicant'}</p>
                                            <p className="text-[10px] text-slate-400">{t.User?.email}</p>
                                            {t.Application?.id && (
                                                <Link href={`/admin/applications/${t.Application.id}`} className="text-[9px] text-blue-500 hover:underline">
                                                    App #{t.Application.id}
                                                </Link>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <p className="font-bold text-blue-900">{t.ticketType}</p>
                                            {t.description && <p className="text-[10px] text-slate-400 truncate max-w-[160px]">{t.description}</p>}
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2.5 py-1 rounded-md text-[9px] font-bold uppercase tracking-widest border ${
                                                t.status === 'possessed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-600 border-slate-200'
                                            }`}>
                                                {t.status === 'possessed' ? 'Possessed' : 'Not Possessed'}
                                            </span>
                                        </td>
                                        <td className="p-4"><SponsorshipBadge status={t.ticketSponsorship} /></td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest ${t.canApplySponsorship ? 'text-emerald-700 bg-emerald-50' : 'text-slate-400'}`}>
                                                {t.canApplySponsorship ? 'Yes' : 'No'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-[11px]">
                                            {t.User?.bankName ? (
                                                <div>
                                                    <p className="font-bold text-blue-900">{t.User.bankName}</p>
                                                    <p className="text-[10px] text-slate-500">{t.User.accountNumber}</p>
                                                </div>
                                            ) : <span className="text-slate-400 italic">Not set</span>}
                                        </td>
                                        <td className="p-4 text-[11px]">
                                            {t.subsidisedPrice != null ? (
                                                <div>
                                                    <p className="font-bold text-blue-900">${t.subsidisedPrice}</p>
                                                    {t.realPrice != null && <p className="text-slate-400 line-through text-[10px]">${t.realPrice}</p>}
                                                </div>
                                            ) : t.purchasePrice != null ? (
                                                <p className="font-bold text-blue-900">${t.purchasePrice}</p>
                                            ) : <span className="text-slate-400">—</span>}
                                        </td>
                                        <td className="p-4 pr-6 text-right">
                                            <button
                                                onClick={() => openEditModal(t)}
                                                className="bg-blue-900 hover:bg-blue-800 text-white px-3.5 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-sm transition-all"
                                            >
                                                Manage
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit/Manage Ticket Modal */}
            {selectedTicket && (
                <div className="fixed inset-0 z-50 bg-blue-950/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl border border-blue-100 max-h-[92vh] overflow-y-auto">
                        <div className="flex items-start justify-between mb-6">
                            <div>
                                <span className="text-[9px] font-black uppercase tracking-widest text-blue-400 block mb-1">Manage Ticket Requirement</span>
                                <h2 className="text-xl font-bold text-blue-900">{selectedTicket.ticketType}</h2>
                                <p className="text-xs text-slate-500">{selectedTicket.User?.fullName} · {selectedTicket.User?.email}</p>
                            </div>
                            <button onClick={() => setSelectedTicket(null)} className="text-slate-400 hover:text-slate-600 mt-1">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="flex bg-slate-100 rounded-xl p-1 mb-6 gap-1">
                            {(['status', 'pricing', 'config'] as ModalTab[]).map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                                        activeTab === tab ? 'bg-white text-blue-900 shadow-sm' : 'text-slate-500 hover:text-blue-900'
                                    }`}
                                >
                                    {tab === 'status' ? 'Status' : tab === 'pricing' ? 'Pricing' : 'Configuration'}
                                </button>
                            ))}
                        </div>

                        {message && <div className="mb-4 p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-700 text-[10px] font-bold uppercase tracking-widest">{message}</div>}
                        {error && <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-[10px] font-bold uppercase tracking-widest">{error}</div>}

                        <form onSubmit={handleUpdateTicket} className="space-y-4">
                            {/* Status Tab */}
                            {activeTab === 'status' && (
                                <>
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-blue-900 mb-2">Possession Status</label>
                                        <select value={status} onChange={e => setStatus(e.target.value as any)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-blue-900 font-medium">
                                            <option value="not_possessed">Not Possessed</option>
                                            <option value="possessed">Possessed</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-blue-900 mb-2">Sponsorship Lifecycle</label>
                                        <select value={ticketSponsorship} onChange={e => setTicketSponsorship(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-blue-900 font-medium">
                                            {Object.entries(SPONSORSHIP_STATUS_LABELS).map(([v, l]) => (
                                                <option key={v} value={v}>{l}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-bold uppercase tracking-widest text-blue-900 mb-2">Refund Amount ($)</label>
                                            <input type="number" value={ticketSponsorshipRefundAmount} onChange={e => setTicketSponsorshipRefundAmount(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-blue-900" placeholder="0.00" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold uppercase tracking-widest text-blue-900 mb-2">Sponsorship Deadline</label>
                                            <input type="date" value={sponsorshipDeadline} onChange={e => setSponsorshipDeadline(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-blue-900" />
                                        </div>
                                    </div>

                                    {/* Applicant bank details (read only) */}
                                    {selectedTicket.User?.bankName && (
                                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Applicant Bank Details</p>
                                            <p className="text-xs font-bold text-blue-900">{selectedTicket.User.bankName}</p>
                                            <p className="text-[10px] text-slate-600">{selectedTicket.User.accountNumber} · {selectedTicket.User.accountName}</p>
                                        </div>
                                    )}

                                    <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-bold text-blue-900">Include Email Notification</p>
                                            <p className="text-[10px] text-slate-500">Send automated email update to applicant.</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" checked={includeMail} onChange={e => setIncludeMail(e.target.checked)} className="sr-only peer" />
                                            <div className="w-11 h-6 bg-slate-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-900" />
                                        </label>
                                    </div>
                                </>
                            )}

                            {/* Pricing Tab */}
                            {activeTab === 'pricing' && (
                                <>
                                    <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                                        <p className="text-[10px] font-bold text-blue-800 mb-1">Pricing Rules</p>
                                        <p className="text-[10px] text-slate-600">Set <strong>Real Price</strong> and <strong>Subsidised Price</strong> together to show a strikethrough with subsidy badge. Leave subsidised blank to show real price as normal. Applicants only see the price for their current or active sponsorship ticket.</p>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-blue-900 mb-2">Real Price ($) — shown with strikethrough if subsidised</label>
                                        <input type="number" step="0.01" value={realPrice} onChange={e => setRealPrice(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-blue-900" placeholder="e.g. 500.00" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-blue-900 mb-2">Subsidised Price ($) — what applicant actually pays</label>
                                        <input type="number" step="0.01" value={subsidisedPrice} onChange={e => setSubsidisedPrice(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-blue-900" placeholder="e.g. 250.00" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-blue-900 mb-2">Purchase / Course Price ($) — legacy / fallback</label>
                                        <input type="number" step="0.01" value={purchasePrice} onChange={e => setPurchasePrice(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-blue-900" placeholder="e.g. 150.00" />
                                    </div>
                                    {/* Preview */}
                                    {(realPrice || subsidisedPrice || purchasePrice) && (
                                        <div className="p-4 bg-white border border-blue-100 rounded-xl">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-blue-400 mb-2">Applicant Preview</p>
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-xl font-black text-blue-900">${subsidisedPrice || purchasePrice || realPrice}</span>
                                                {subsidisedPrice && realPrice && parseFloat(subsidisedPrice) < parseFloat(realPrice) && (
                                                    <>
                                                        <span className="text-xs text-slate-400 line-through">${realPrice}</span>
                                                        <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full uppercase tracking-widest">Subsidised</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}

                            {/* Config Tab */}
                            {activeTab === 'config' && (
                                <>
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-blue-900 mb-2">Ticket Type / Name</label>
                                        <input type="text" value={ticketType} onChange={e => setTicketType(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-blue-900 font-medium" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-blue-900 mb-2">Description</label>
                                        <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-blue-900 font-medium resize-none" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-blue-900 mb-2">Aveling Course ID</label>
                                        <input type="text" value={courseId} onChange={e => setCourseId(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-blue-900 font-medium" placeholder="e.g. course-abc123" />
                                        <p className="text-[10px] text-slate-400 mt-1">Links this ticket requirement to the Aveling LMS course for payment and exam.</p>
                                    </div>
                                    <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-bold text-blue-900">Allow Sponsorship Applications</p>
                                            <p className="text-[10px] text-slate-500">When enabled, applicant can apply for sponsorship for this ticket.</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" checked={canApplySponsorship} onChange={e => setCanApplySponsorship(e.target.checked)} className="sr-only peer" />
                                            <div className="w-11 h-6 bg-slate-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-900" />
                                        </label>
                                    </div>
                                </>
                            )}

                            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={handleDelete}
                                    disabled={deleting}
                                    className="text-red-500 hover:text-red-700 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-sm">delete</span>
                                    {deleting ? 'Deleting...' : 'Delete Ticket'}
                                </button>
                                <div className="flex items-center gap-3">
                                    <button type="button" onClick={() => setSelectedTicket(null)} className="px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:bg-slate-100">Cancel</button>
                                    <button type="submit" disabled={saving} className="bg-blue-900 hover:bg-blue-800 text-white px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-blue-900/10">
                                        {saving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
