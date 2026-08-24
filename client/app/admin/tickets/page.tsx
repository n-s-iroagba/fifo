'use client';

import React from 'react';
import { useApiQuery } from '@/lib/hooks';
import api from '@/lib/api';

interface TicketCatalog {
    id: number;
    name: string;
    normalPrice: number;
    description: string;
    createdAt?: string;
    updatedAt?: string;
}

export default function TicketCatalogsPage() {
    const { data: catalogsRes, isLoading, refetch } = useApiQuery<{ success: boolean; data: TicketCatalog[] }>(
        ['admin-ticket-catalogs'],
        '/ticket-catalogs'
    );
    const catalogs = catalogsRes?.data || [];

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this ticket catalog data?')) return;
        try {
            await api.delete(`/admin/ticket-catalogs/${id}`);
            refetch();
        } catch (err: any) {
            alert('Failed to delete.');
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
                    <h1 className="text-3xl font-bold text-blue-900 tracking-tight">Seeded Tickets</h1>
                    <p className="text-sm text-slate-500 mt-2 max-w-xl">
                        Tickets can only be created alongside courses, exams, and questions via seeded data. This page allows you to read and delete seeded tickets.
                    </p>
                </div>
            </header>

            <div className="bg-white rounded-3xl border border-blue-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-blue-50/50 text-[10px] font-bold uppercase tracking-widest text-blue-400 border-b border-blue-100">
                            <tr>
                                <th className="p-4 pl-6">Ticket Name</th>
                                <th className="p-4">Normal Price</th>
                                <th className="p-4 pr-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-blue-50 font-medium text-slate-700">
                            {catalogs.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="p-8 text-center text-slate-400 italic">
                                        No tickets found.
                                    </td>
                                </tr>
                            ) : (
                                catalogs.map((t) => (
                                    <tr key={t.id} className="hover:bg-blue-50/30 transition-colors">
                                        <td className="p-4 pl-6 font-bold text-blue-900">{t.name}</td>
                                        <td className="p-4">${t.normalPrice}</td>
                                        <td className="p-4 pr-6 text-right space-x-2">
                                            <button
                                                onClick={() => handleDelete(t.id)}
                                                className="text-red-500 hover:text-red-700 px-2 py-1 text-[10px] font-bold uppercase tracking-widest"
                                            >
                                                Delete
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
