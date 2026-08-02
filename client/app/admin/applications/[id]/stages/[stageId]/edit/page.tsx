'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useApiQuery, useApiMutation } from '@/lib/hooks';
import Link from 'next/link';

export default function EditApplicationStagePage() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id;
    const stageId = params?.stageId;

    const { data: stage, isLoading, error } = useApiQuery<any>(
        ['admin', 'applications', `${id}`, 'stages', `${stageId}`],
        `/admin/applications/${id}/stages/${stageId}`,
        { enabled: !!stageId }
    );

    const updateMutation = useApiMutation(
        'put',
        `/admin/applications/${id}/stages/${stageId}`,
        {
            onSuccess: () => {
                router.push(`/admin/applications/${id}`);
                router.refresh();
            },
            onError: (err: any) => {
                console.error(err);
            }
        }
    );

    const [form, setForm] = useState({
        name: '',
        description: '',
        requiresPayment: false,
        amount: '',
        currency: 'USD',
        instructions: '',
        deadlineDays: '',
        notifyEmail: true,
        notifyPush: true,
        orderPosition: '',
        isCompleted: false
    });

    useEffect(() => {
        if (stage) {
            setForm({
                name: stage.name || '',
                description: stage.description || '',
                requiresPayment: stage.requiresPayment || false,
                amount: stage.amount || '',
                currency: stage.currency || 'USD',
                instructions: stage.instructions || '',
                deadlineDays: stage.deadlineDays || '',
                notifyEmail: stage.notifyEmail !== undefined ? stage.notifyEmail : true,
                notifyPush: stage.notifyPush !== undefined ? stage.notifyPush : true,
                orderPosition: stage.orderPosition || '',
                isCompleted: stage.isCompleted || false
            });
        }
    }, [stage]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target as any;
        const val = type === 'checkbox' ? (e.target as any).checked : value;
        setForm(prev => ({ ...prev, [name]: val }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await updateMutation.mutateAsync({
                ...form,
                amount: form.requiresPayment ? parseFloat(form.amount as string) : null,
                deadlineDays: form.deadlineDays ? parseInt(form.deadlineDays as string, 10) : null,
                orderPosition: parseInt(form.orderPosition as string, 10)
            });
        } catch (err) {
            console.error(err);
        }
    };

    if (isLoading) return <div className="p-12 text-center text-[10px] font-bold uppercase tracking-widest text-blue-400">Loading Configuration...</div>;
    if (error) return <div className="p-12 text-center text-red-500 text-[10px] font-bold uppercase tracking-widest">Error Loading Configuration</div>;

    return (
        <div className="flex flex-col min-h-screen bg-white font-sans text-blue-900">
            <header className="h-20 px-8 bg-white border-b border-blue-100 flex items-center justify-between sticky top-0 z-40">
                <div className="flex items-center gap-6">
                    <Link href={`/admin/applications/${id}`} className="p-2 text-blue-400 hover:text-blue-900 transition-colors">
                        <span className="material-symbols-outlined text-xl">arrow_back</span>
                    </Link>
                    <div>
                        <span className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.2em] block mb-1">Application Pipeline</span>
                        <h1 className="text-xl font-bold text-blue-900 tracking-tight">Edit Stage</h1>
                    </div>
                </div>
            </header>

            <main className="p-8 md:p-12 max-w-2xl mx-auto w-full">
                <div className="bg-white rounded-2xl border border-blue-100 shadow-sm overflow-hidden">
                    <form onSubmit={handleSubmit} className="space-y-10 p-8 md:p-10">
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="block text-[10px] font-bold text-blue-400 uppercase tracking-widest px-1">Stage Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    value={form.name}
                                    onChange={handleChange}
                                    placeholder="e.g. Video Interview"
                                    className="w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-900/5 focus:border-blue-900 transition-all outline-none"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-[10px] font-bold text-blue-400 uppercase tracking-widest px-1">Description / Internal Logic</label>
                                <textarea
                                    name="description"
                                    rows={4}
                                    required
                                    value={form.description}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-900/5 focus:border-blue-900 transition-all outline-none resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-bold text-blue-400 uppercase tracking-widest px-1">Order Position</label>
                                    <input
                                        type="number"
                                        name="orderPosition"
                                        required
                                        value={form.orderPosition}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg text-sm font-bold focus:bg-white focus:ring-2 focus:ring-blue-900/5 focus:border-blue-900 transition-all outline-none"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-[10px] font-bold text-blue-400 uppercase tracking-widest px-1">Deadline (Days)</label>
                                    <input
                                        type="number"
                                        name="deadlineDays"
                                        value={form.deadlineDays}
                                        onChange={handleChange}
                                        placeholder="Optional"
                                        className="w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg text-sm font-bold focus:bg-white focus:ring-2 focus:ring-blue-900/5 focus:border-blue-900 transition-all outline-none"
                                    />
                                </div>
                            </div>

                            <div className="p-6 bg-blue-50 rounded-xl border border-blue-100 flex items-center justify-between">
                                <div>
                                    <span className="text-xs font-bold text-blue-900 block">Payment Required</span>
                                    <span className="text-[10px] text-blue-400 font-medium uppercase tracking-tight">Candidate must pay to advance</span>
                                </div>
                                <input
                                    type="checkbox"
                                    name="requiresPayment"
                                    checked={form.requiresPayment}
                                    onChange={handleChange}
                                    className="w-5 h-5 rounded border-blue-300 text-blue-900 focus:ring-blue-900 transition-all cursor-pointer"
                                />
                            </div>

                            {form.requiresPayment && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-top-2 duration-300">
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-bold text-blue-400 uppercase tracking-widest px-1">Amount</label>
                                        <input
                                            type="number"
                                            name="amount"
                                            required={form.requiresPayment}
                                            value={form.amount}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 bg-white border border-blue-200 rounded-lg text-sm font-bold focus:ring-2 focus:ring-blue-900/5 focus:border-blue-900 transition-all outline-none"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-bold text-blue-400 uppercase tracking-widest px-1">Currency</label>
                                        <select
                                            name="currency"
                                            value={form.currency}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 bg-white border border-blue-200 rounded-lg text-sm font-bold focus:ring-2 focus:ring-blue-900/5 focus:border-blue-900 transition-all outline-none appearance-none"
                                        >
                                            <option value="USD">USD - American Dollar</option>
                                            <option value="EUR">EUR - Euro</option>
                                            <option value="GBP">GBP - British Pound</option>
                                            <option value="NGN">NGN - Nigerian Naira</option>
                                        </select>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                                <div className="flex items-center justify-between p-4 bg-blue-50/50 rounded-lg border border-blue-100">
                                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Email Alerts</span>
                                    <input
                                        type="checkbox"
                                        name="notifyEmail"
                                        checked={form.notifyEmail}
                                        onChange={handleChange}
                                        className="w-4 h-4 rounded border-blue-300 text-blue-900 focus:ring-blue-900 transition-all cursor-pointer"
                                    />
                                </div>
                                <div className="flex items-center justify-between p-4 bg-blue-50/50 rounded-lg border border-blue-100">
                                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Push Alerts</span>
                                    <input
                                        type="checkbox"
                                        name="notifyPush"
                                        checked={form.notifyPush}
                                        onChange={handleChange}
                                        className="w-4 h-4 rounded border-blue-300 text-blue-900 focus:ring-blue-900 transition-all cursor-pointer"
                                    />
                                </div>
                            </div>
                            <div className="p-4 bg-emerald-50/50 rounded-lg border border-emerald-100 flex items-center justify-between mt-4">
                                <div>
                                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest block mb-1">Stage Completed</span>
                                    <span className="text-[9px] text-emerald-500 uppercase">Manually override completion status</span>
                                </div>
                                <input
                                    type="checkbox"
                                    name="isCompleted"
                                    checked={form.isCompleted}
                                    onChange={handleChange}
                                    className="w-4 h-4 rounded border-emerald-300 text-emerald-600 focus:ring-emerald-600 transition-all cursor-pointer"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-4 pt-6 border-t border-blue-50">
                            <Link
                                href={`/admin/applications/${id}`}
                                className="px-6 py-3 text-[10px] font-bold text-blue-400 uppercase tracking-widest hover:text-blue-900 transition-all"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={updateMutation.isPending}
                                className="flex-1 bg-blue-900 text-white py-4 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] shadow-lg shadow-blue-900/10 hover:bg-blue-800 active:scale-[0.98] transition-all disabled:opacity-50"
                            >
                                {updateMutation.isPending ? 'Saving...' : 'Save Configuration'}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}
