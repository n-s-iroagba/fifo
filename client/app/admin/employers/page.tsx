'use client';

import React, { useState } from 'react';
import { useApiQuery, useApiMutation } from '@/lib/hooks';

interface Employer {
    id: number;
    name: string;
    websiteUrl: string;
    companyDescription: string;
    isEmploying: boolean;
    location: string | null;
    logoUrl: string | null;
    createdAt?: string;
    updatedAt?: string;
}

export default function EmployersAdminPage() {
    const { data: employersRes, isLoading, refetch } = useApiQuery<any>(
        ['admin', 'employers'],
        '/admin/employers'
    );

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEmployer, setEditingEmployer] = useState<Employer | null>(null);

    const [formName, setFormName] = useState('');
    const [formWebsiteUrl, setFormWebsiteUrl] = useState('');
    const [formCompanyDescription, setFormCompanyDescription] = useState('');
    const [formLocation, setFormLocation] = useState('');
    const [formLogoUrl, setFormLogoUrl] = useState('');
    const [formIsEmploying, setFormIsEmploying] = useState(false);
    const [formError, setFormError] = useState('');

    const createMutation = useApiMutation('post', '/admin/employers', {
        onSuccess: () => {
            refetch();
            closeModal();
        },
        onError: (err: any) => {
            setFormError(err.response?.data?.error || err.response?.data?.message || 'Failed to save employer');
        }
    });

    const updateMutation = useApiMutation('put', '/admin/employers/:id', {
        onSuccess: () => {
            refetch();
            closeModal();
        },
        onError: (err: any) => {
            setFormError(err.response?.data?.error || err.response?.data?.message || 'Failed to update employer');
        }
    });

    const deleteMutation = useApiMutation('delete', '/admin/employers/:id', {
        onSuccess: () => refetch(),
        onError: (err: any) => {
            alert(err.response?.data?.error || err.response?.data?.message || 'Failed to delete employer');
        }
    });

    const openCreateModal = () => {
        setEditingEmployer(null);
        setFormName('');
        setFormWebsiteUrl('');
        setFormCompanyDescription('');
        setFormLocation('');
        setFormLogoUrl('');
        setFormIsEmploying(false);
        setFormError('');
        setIsModalOpen(true);
    };

    const openEditModal = (emp: Employer) => {
        setEditingEmployer(emp);
        setFormName(emp.name || '');
        setFormWebsiteUrl(emp.websiteUrl || '');
        setFormCompanyDescription(emp.companyDescription || '');
        setFormLocation(emp.location || '');
        setFormLogoUrl(emp.logoUrl || '');
        setFormIsEmploying(Boolean(emp.isEmploying));
        setFormError('');
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingEmployer(null);
        setFormError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError('');

        if (!formName.trim() || !formWebsiteUrl.trim() || !formCompanyDescription.trim()) {
            setFormError('Name, Website URL, and Company Description are required.');
            return;
        }

        const payload = {
            name: formName.trim(),
            websiteUrl: formWebsiteUrl.trim(),
            companyDescription: formCompanyDescription.trim(),
            location: formLocation.trim() || null,
            logoUrl: formLogoUrl.trim() || null,
            isEmploying: formIsEmploying
        };

        if (editingEmployer) {
            await updateMutation.mutateAsync({
                data: payload,
                params: { id: editingEmployer.id }
            });
        } else {
            await createMutation.mutateAsync(payload);
        }
    };

    const handleToggleEmploying = async (emp: Employer) => {
        try {
            await updateMutation.mutateAsync({
                data: {
                    isEmploying: !emp.isEmploying
                },
                params: { id: emp.id }
            });
            refetch();
        } catch (err: any) {
            console.error('Failed to toggle employing status:', err);
            alert(err.response?.data?.error || err.response?.data?.message || 'Failed to toggle employing status');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this employer? Any associated job listing relationships will also be updated.')) {
            return;
        }
        try {
            await deleteMutation.mutateAsync({ params: { id } });
            refetch();
        } catch (err: any) {
            console.error('Failed to delete employer:', err);
            alert(err.response?.data?.error || err.response?.data?.message || 'Failed to delete employer');
        }
    };

    const employerList: Employer[] = Array.isArray(employersRes)
        ? employersRes
        : (employersRes?.data || []);

    return (
        <div className="font-sans">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-blue-900 tracking-tight">Hiring Employers</h1>
                    <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mt-1">
                        Corporate sponsors & partner mining employers (Only 1 active employing partner allowed)
                    </p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="bg-blue-900 text-white px-5 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-blue-800 transition-all shadow-lg shadow-blue-900/10 flex items-center gap-2"
                >
                    <span className="material-symbols-outlined text-sm">add_business</span>
                    Add Employer
                </button>
            </div>

            {isLoading ? (
                <div className="p-12 text-center text-[10px] font-bold uppercase tracking-widest text-blue-400">
                    Loading Employers...
                </div>
            ) : employerList.length === 0 ? (
                <div className="bg-white rounded-2xl border border-blue-100 p-12 text-center">
                    <p className="text-sm font-medium text-slate-500 mb-4">No employers registered yet.</p>
                    <button
                        onClick={openCreateModal}
                        className="bg-blue-900 text-white px-4 py-2 rounded-lg text-xs font-semibold"
                    >
                        Create First Employer
                    </button>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-blue-100 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-blue-50 border-b border-blue-100">
                                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-blue-400">Employer</th>
                                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-blue-400">Website & Location</th>
                                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-blue-400 text-center">Current Employing Status</th>
                                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-blue-400 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-blue-50">
                                {employerList.map((emp) => (
                                    <tr key={emp.id} className="hover:bg-blue-50/50 transition-colors">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 flex items-center justify-center font-bold text-sm overflow-hidden">
                                                    {emp.logoUrl ? (
                                                        <img src={emp.logoUrl} alt={emp.name} className="w-full h-full object-contain p-1" />
                                                    ) : (
                                                        <span className="material-symbols-outlined text-lg">domain</span>
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-semibold text-blue-900 flex items-center gap-2">
                                                        {emp.name}
                                                        {emp.isEmploying && (
                                                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200">
                                                                Primary Employing Partner
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-slate-500 max-w-md line-clamp-2 mt-0.5">
                                                        {emp.companyDescription}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col">
                                                <a
                                                    href={emp.websiteUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-xs font-medium text-blue-600 hover:underline flex items-center gap-1"
                                                >
                                                    {emp.websiteUrl}
                                                    <span className="material-symbols-outlined text-xs">open_in_new</span>
                                                </a>
                                                <span className="text-[10px] font-medium text-slate-400 mt-0.5">
                                                    {emp.location || 'Perth, WA'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <button
                                                onClick={() => handleToggleEmploying(emp)}
                                                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border ${
                                                    emp.isEmploying
                                                        ? 'bg-emerald-500 text-white border-emerald-600 shadow-sm'
                                                        : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                                                }`}
                                            >
                                                {emp.isEmploying ? '✓ Active Employing' : 'Set as Employing'}
                                            </button>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex justify-end gap-3">
                                                <button
                                                    onClick={() => openEditModal(emp)}
                                                    className="text-[10px] font-bold text-blue-600 uppercase tracking-widest hover:text-blue-900"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(emp.id)}
                                                    className="text-[10px] font-bold text-red-500 uppercase tracking-widest hover:text-red-700"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal for Add / Edit */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-blue-950/40 backdrop-blur-sm p-4 overflow-y-auto">
                    <div className="bg-white rounded-2xl max-w-xl w-full p-6 md:p-8 shadow-2xl border border-blue-100 my-8">
                        <div className="flex items-center justify-between pb-4 border-b border-blue-50 mb-6">
                            <h2 className="text-lg font-bold text-blue-900">
                                {editingEmployer ? 'Edit Employer' : 'Add New Employer'}
                            </h2>
                            <button
                                onClick={closeModal}
                                className="w-8 h-8 rounded-lg text-slate-400 hover:text-blue-900 flex items-center justify-center"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        {formError && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
                                {formError}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-blue-900 mb-1">
                                    Company Name *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formName}
                                    onChange={(e) => setFormName(e.target.value)}
                                    placeholder="e.g. MACA Limited"
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-900/10 text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-blue-900 mb-1">
                                    Official Website URL *
                                </label>
                                <input
                                    type="url"
                                    required
                                    value={formWebsiteUrl}
                                    onChange={(e) => setFormWebsiteUrl(e.target.value)}
                                    placeholder="https://www.maca.net.au"
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-900/10 text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-blue-900 mb-1">
                                    Company Description *
                                </label>
                                <textarea
                                    required
                                    rows={3}
                                    value={formCompanyDescription}
                                    onChange={(e) => setFormCompanyDescription(e.target.value)}
                                    placeholder="Brief background about the company and mining operations..."
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-900/10 text-sm"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-blue-900 mb-1">
                                        HQ / Operations Location
                                    </label>
                                    <input
                                        type="text"
                                        value={formLocation}
                                        onChange={(e) => setFormLocation(e.target.value)}
                                        placeholder="e.g. Welshpool, Western Australia"
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-900/10 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-blue-900 mb-1">
                                        Logo URL (Cloudinary or Web)
                                    </label>
                                    <input
                                        type="url"
                                        value={formLogoUrl}
                                        onChange={(e) => setFormLogoUrl(e.target.value)}
                                        placeholder="https://res.cloudinary.com/.../logo.png"
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-900/10 text-sm"
                                    />
                                </div>
                            </div>

                            <div className="pt-2">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formIsEmploying}
                                        onChange={(e) => setFormIsEmploying(e.target.checked)}
                                        className="w-4 h-4 rounded text-blue-900 focus:ring-blue-900 border-slate-300"
                                    />
                                    <span className="text-xs font-medium text-blue-950">
                                        Set as Active Employing Partner (Setting this will automatically make this the primary hiring sponsor)
                                    </span>
                                </label>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-blue-50 mt-6">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-700"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={createMutation.isPending || updateMutation.isPending}
                                    className="bg-blue-900 text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-blue-800 transition-all shadow-lg shadow-blue-900/10 disabled:opacity-50"
                                >
                                    {createMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save Employer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
