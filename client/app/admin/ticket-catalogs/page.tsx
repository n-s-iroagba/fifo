'use client';

import React, { useState } from 'react';
import { useApiQuery } from '@/lib/hooks';
import api from '@/lib/api';

interface TicketCatalog {
    id: number;
    name: string;
    normalPrice: number;
    sponsorshipPrice: number;
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

    const [selectedCatalog, setSelectedCatalog] = useState<TicketCatalog | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [name, setName] = useState('');
    const [normalPrice, setNormalPrice] = useState('');
    const [sponsorshipPrice, setSponsorshipPrice] = useState('');
    const [description, setDescription] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const openEditModal = (t: TicketCatalog) => {
        setSelectedCatalog(t);
        setIsCreating(false);
        setName(t.name);
        setNormalPrice(t.normalPrice.toString());
        setSponsorshipPrice(t.sponsorshipPrice.toString());
        setDescription(t.description || '');
        setError(null);
    };

    const openCreateModal = () => {
        setSelectedCatalog(null);
        setIsCreating(true);
        setName('');
        setNormalPrice('0');
        setSponsorshipPrice('0');
        setDescription('');
        setError(null);
    };

    const closeModal = () => {
        setSelectedCatalog(null);
        setIsCreating(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);

        const payload = {
            name,
            normalPrice: parseFloat(normalPrice) || 0,
            sponsorshipPrice: parseFloat(sponsorshipPrice) || 0,
            description
        };

        try {
            if (isCreating) {
                await api.post('/admin/ticket-catalogs', payload);
            } else if (selectedCatalog) {
                await api.put(`/admin/ticket-catalogs/${selectedCatalog.id}`, payload);
            }
            closeModal();
            refetch();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to save ticket catalog.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this ticket?')) return;
        try {
            await api.delete(`/admin/ticket-catalogs/${id}`);
            refetch();
        } catch (err: any) {
            alert('Failed to delete.');
        }
    };

    if (isLoading) {
        return <div className="p-12 text-center text-[10px] font-bold uppercase tracking-widest text-blue-400">Loading Catalogs...</div>;
    }

    return (
        <div className="font-sans text-blue-900 pb-24">
            <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.2em] block mb-1">Administration</span>
                    <h1 className="text-3xl font-bold text-blue-900 tracking-tight">Ticket Catalog</h1>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={openCreateModal}
                        className="bg-blue-900 hover:bg-blue-800 text-white px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-sm transition-all flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-[14px]">add</span>
                        New Ticket
                    </button>
                </div>
            </header>

            <div className="bg-white rounded-3xl border border-blue-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-blue-50/50 text-[10px] font-bold uppercase tracking-widest text-blue-400 border-b border-blue-100">
                            <tr>
                                <th className="p-4 pl-6">Ticket Name</th>
                                <th className="p-4">Normal Price</th>
                                <th className="p-4">Sponsorship Price</th>
                                <th className="p-4 pr-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-blue-50 font-medium text-slate-700">
                            {catalogs.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-slate-400 italic">
                                        No tickets found in catalog.
                                    </td>
                                </tr>
                            ) : (
                                catalogs.map((t) => (
                                    <tr key={t.id} className="hover:bg-blue-50/30 transition-colors">
                                        <td className="p-4 pl-6 font-bold text-blue-900">{t.name}</td>
                                        <td className="p-4">${t.normalPrice}</td>
                                        <td className="p-4 font-bold text-blue-600">${t.sponsorshipPrice}</td>
                                        <td className="p-4 pr-6 text-right space-x-2">
                                            <button
                                                onClick={() => openEditModal(t)}
                                                className="text-blue-500 hover:text-blue-700 px-2 py-1 text-[10px] font-bold uppercase tracking-widest"
                                            >
                                                Edit
                                            </button>
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

            {(isCreating || selectedCatalog) && (
                <div className="fixed inset-0 z-50 bg-blue-950/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-blue-100 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest block">Ticket Catalog</span>
                                <h2 className="text-xl font-bold text-blue-900">{isCreating ? 'Create Ticket' : 'Edit Ticket'}</h2>
                            </div>
                            <button onClick={closeModal} className="text-slate-400 hover:text-slate-600">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-blue-900 mb-2">Ticket Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-blue-900 font-medium"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-blue-900 mb-2">Normal Price ($)</label>
                                    <input
                                        type="number"
                                        value={normalPrice}
                                        onChange={(e) => setNormalPrice(e.target.value)}
                                        required
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-blue-900 font-medium"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-blue-900 mb-2">Sponsorship Price ($)</label>
                                    <input
                                        type="number"
                                        value={sponsorshipPrice}
                                        onChange={(e) => setSponsorshipPrice(e.target.value)}
                                        required
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-blue-900 font-medium"
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-blue-900 mb-2">Description (Optional)</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={3}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-blue-900 font-medium resize-none"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest text-slate-600 hover:bg-slate-100"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="bg-blue-900 hover:bg-blue-800 text-white px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-blue-900/10"
                                >
                                    {saving ? 'Saving...' : 'Save Ticket'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
