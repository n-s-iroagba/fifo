'use client';

import React from 'react';
import { useApiQuery } from '@/lib/hooks';
import api from '@/lib/api';
import Link from 'next/link';

interface User {
    id: number;
    fullName: string;
    email: string;
    candidateNumber?: string;
}

interface Application {
    id: number;
    status: string;
    currentStageId: number;
    createdAt: string;
}

interface Ticket {
    id: number;
    userId: number;
    applicationId: number | null;
    ticketType: string;
    description: string;
    status: string;
    ticketSponsorship: string;
    User?: User;
    Application?: Application;
    createdAt: string;
}

export default function TicketSponsorshipsPage() {
    const { data: ticketsRes, isLoading, refetch } = useApiQuery<{ success: boolean; data: Ticket[] }>(
        ['admin-tickets', 'applied'],
        '/admin/tickets?sponsorshipStatus=applied'
    );

    const tickets = ticketsRes?.data || [];

    const handleApprove = async (id: number) => {
        if (!confirm('Are you sure you want to approve this sponsorship application?')) return;
        try {
            await api.put(`/admin/tickets/${id}`, {
                ticketSponsorship: 'first_attempt_approved'
            });
            refetch();
        } catch (err: any) {
            alert('Failed to approve sponsorship.');
        }
    };

    if (isLoading) {
        return <div className="p-12 text-center text-[10px] font-bold uppercase tracking-widest text-blue-400">Loading Sponsorships...</div>;
    }

    return (
        <div className="font-sans text-blue-900 pb-24">
            <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.2em] block mb-1">Administration</span>
                    <h1 className="text-3xl font-bold text-blue-900 tracking-tight">Applied Ticket Sponsorships</h1>
                    <p className="text-sm text-slate-500 mt-2 max-w-xl">
                        Review tickets that candidates have applied for sponsorship. You can see the application that owns the sponsorship and its status.
                    </p>
                </div>
            </header>

            <div className="bg-white rounded-3xl border border-blue-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-blue-50/50 text-[10px] font-bold uppercase tracking-widest text-blue-400 border-b border-blue-100">
                            <tr>
                                <th className="p-4 pl-6">Candidate</th>
                                <th className="p-4">Ticket Type</th>
                                <th className="p-4">App ID</th>
                                <th className="p-4">App Status</th>
                                <th className="p-4">Date Applied</th>
                                <th className="p-4 pr-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-blue-50 font-medium text-slate-700">
                            {tickets.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-slate-400 italic">
                                        No pending ticket sponsorship applications found.
                                    </td>
                                </tr>
                            ) : (
                                tickets.map((t) => (
                                    <tr key={t.id} className="hover:bg-blue-50/30 transition-colors">
                                        <td className="p-4 pl-6">
                                            <div className="font-bold text-blue-900">{t.User?.fullName || 'Unknown'}</div>
                                            <div className="text-slate-500 text-[10px]">{t.User?.email}</div>
                                            {t.User?.candidateNumber && <div className="text-[10px] text-blue-400 mt-0.5">{t.User.candidateNumber}</div>}
                                        </td>
                                        <td className="p-4">
                                            <div className="font-bold text-blue-900">{t.ticketType}</div>
                                        </td>
                                        <td className="p-4">
                                            {t.applicationId ? (
                                                <Link href={`/admin/applications?id=${t.applicationId}`} className="text-blue-500 hover:underline">
                                                    #{t.applicationId}
                                                </Link>
                                            ) : (
                                                <span className="text-slate-400 italic">None</span>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            {t.Application ? (
                                                <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                                                    t.Application.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                                                }`}>
                                                    {t.Application.status}
                                                </span>
                                            ) : (
                                                <span className="text-slate-400 italic">N/A</span>
                                            )}
                                        </td>
                                        <td className="p-4 text-slate-500">
                                            {new Date(t.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="p-4 pr-6 text-right space-x-2">
                                            <button
                                                onClick={() => handleApprove(t.id)}
                                                className="text-white bg-blue-600 hover:bg-blue-700 rounded px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest transition-colors"
                                            >
                                                Approve
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
