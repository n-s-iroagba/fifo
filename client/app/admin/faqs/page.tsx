'use client';

import React, { useState } from 'react';
import { useApiQuery } from '@/lib/hooks';
import api from '@/lib/api';
import { Faq, FaqType } from '@/types/models';

interface FaqApiResponse {
    success: boolean;
    data: Faq[];
    slots: {
        process: Faq | null;
        payment: Faq | null;
    };
    count: number;
}

export default function AdminFaqsPage() {
    const { data: faqRes, isLoading, refetch } = useApiQuery<FaqApiResponse>(
        ['admin-faqs'],
        '/admin/faqs'
    );

    const faqs = faqRes?.data || [];
    const processFaq = faqRes?.slots?.process || faqs.find((f) => f.type === 'process') || null;
    const paymentFaq = faqRes?.slots?.payment || faqs.find((f) => f.type === 'payment') || null;

    // Modal state for Create / Edit
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingFaq, setEditingFaq] = useState<Faq | null>(null);
    const [formType, setFormType] = useState<FaqType>('process');
    const [formLink, setFormLink] = useState('');
    const [formTitle, setFormTitle] = useState('');
    const [formDescription, setFormDescription] = useState('');
    const [formError, setFormError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Delete state
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deletingFaq, setDeletingFaq] = useState<Faq | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Copied feedback
    const [copiedId, setCopiedId] = useState<number | null>(null);

    const handleCopy = (id: number, text: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const openCreateModal = (suggestedType?: FaqType) => {
        setEditingFaq(null);
        setFormError('');

        // If a type is specified, use it. Otherwise, choose the slot that's still free.
        if (suggestedType) {
            setFormType(suggestedType);
            setFormTitle(suggestedType === 'process' ? 'Process AI Assistant' : 'Payment AI Assistant');
        } else if (!processFaq) {
            setFormType('process');
            setFormTitle('Process AI Assistant');
        } else if (!paymentFaq) {
            setFormType('payment');
            setFormTitle('Payment AI Assistant');
        } else {
            setFormType('process');
            setFormTitle('Process AI Assistant');
        }

        setFormLink('');
        setFormDescription(
            suggestedType === 'payment'
                ? 'Answers candidate queries regarding payment milestones, invoice receipts, account details, and subsidies.'
                : 'Answers candidate queries regarding application progress, vetting, ticket exams, interviews, and nominations.'
        );
        setIsEditModalOpen(true);
    };

    const openEditModal = (faq: Faq) => {
        setEditingFaq(faq);
        setFormError('');
        setFormType(faq.type);
        setFormLink(faq.link);
        setFormTitle(faq.title || (faq.type === 'process' ? 'Process AI Assistant' : 'Payment AI Assistant'));
        setFormDescription(faq.description || '');
        setIsEditModalOpen(true);
    };

    const handleSaveFaq = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError('');

        // Basic URL validation
        try {
            const parsed = new URL(formLink.trim());
            if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
                setFormError('Please enter a valid URL starting with http:// or https://');
                return;
            }
        } catch {
            setFormError('Please enter a valid URL (e.g. https://chatgpt.com/share/...)');
            return;
        }

        setIsSubmitting(true);
        try {
            if (editingFaq) {
                // Update
                await api.put(`/admin/faqs/${editingFaq.id}`, {
                    type: formType,
                    link: formLink.trim(),
                    title: formTitle.trim(),
                    description: formDescription.trim(),
                });
            } else {
                // Create
                await api.post('/admin/faqs', {
                    type: formType,
                    link: formLink.trim(),
                    title: formTitle.trim(),
                    description: formDescription.trim(),
                });
            }

            await refetch();
            setIsEditModalOpen(false);
        } catch (err: any) {
            const msg = err.response?.data?.error || err.message || 'Failed to save FAQ link';
            setFormError(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    const openDeleteModal = (faq: Faq) => {
        setDeletingFaq(faq);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteFaq = async () => {
        if (!deletingFaq) return;
        setIsDeleting(true);
        try {
            await api.delete(`/admin/faqs/${deletingFaq.id}`);
            await refetch();
            setIsDeleteModalOpen(false);
            setDeletingFaq(null);
        } catch (err: any) {
            alert(err.response?.data?.error || 'Failed to delete FAQ link');
        } finally {
            setIsDeleting(false);
        }
    };

    const isSlotLimitReached = faqs.length >= 2;

    return (
        <div className="font-sans max-w-7xl mx-auto space-y-8 pb-12">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-blue-100 pb-6">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-blue-600 text-2xl">smart_toy</span>
                        <h1 className="text-2xl font-bold text-blue-900 tracking-tight">AI Chat FAQs Management</h1>
                    </div>
                    <p className="text-[11px] font-bold text-blue-400 uppercase tracking-widest mt-1">
                        Configure public AI shared chat links for candidate guidance. Strictly limited to 2 links: Process & Payment.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => openCreateModal()}
                        disabled={isSlotLimitReached}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all shadow-md ${
                            isSlotLimitReached
                                ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                                : 'bg-blue-900 text-white hover:bg-blue-800 shadow-blue-900/10'
                        }`}
                        title={isSlotLimitReached ? 'Both Process and Payment FAQ slots are already configured' : 'Add FAQ link'}
                    >
                        <span className="material-symbols-outlined text-base">add_link</span>
                        Add FAQ Link
                    </button>
                </div>
            </div>

            {/* Overview / Slot Status Bar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-blue-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-blue-400">Database Slots</p>
                        <p className="text-2xl font-black text-blue-900 mt-1">{faqs.length} / 2 Active</p>
                    </div>
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${
                        faqs.length === 2 ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
                    }`}>
                        <span className="material-symbols-outlined">data_usage</span>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-blue-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-blue-400">Process AI Chat</p>
                        <p className={`text-base font-bold mt-1 ${processFaq ? 'text-blue-600' : 'text-amber-600'}`}>
                            {processFaq ? 'Configured & Active' : 'Slot Unset'}
                        </p>
                    </div>
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${
                        processFaq ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'
                    }`}>
                        <span className="material-symbols-outlined">{processFaq ? 'check_circle' : 'pending'}</span>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-blue-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-blue-400">Payment AI Chat</p>
                        <p className={`text-base font-bold mt-1 ${paymentFaq ? 'text-emerald-600' : 'text-amber-600'}`}>
                            {paymentFaq ? 'Configured & Active' : 'Slot Unset'}
                        </p>
                    </div>
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${
                        paymentFaq ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                    }`}>
                        <span className="material-symbols-outlined">{paymentFaq ? 'check_circle' : 'pending'}</span>
                    </div>
                </div>
            </div>

            {/* Interactive Primary Slot Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 1. PROCESS FAQ CARD */}
                <div className="bg-white rounded-2xl border border-blue-200/80 shadow-sm overflow-hidden flex flex-col justify-between transition-all hover:border-blue-300 hover:shadow-md">
                    <div className="p-6">
                        <div className="flex items-start justify-between gap-4 mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-2xl">account_tree</span>
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest bg-blue-100 text-blue-800">
                                            PROCESS
                                        </span>
                                        {processFaq ? (
                                            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                Active Link
                                            </span>
                                        ) : (
                                            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                                                Unconfigured
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="text-lg font-bold text-blue-900 mt-1">
                                        {processFaq?.title || 'FIFO Process AI Assistant'}
                                    </h3>
                                </div>
                            </div>
                        </div>

                        <p className="text-xs text-slate-600 mb-5 leading-relaxed">
                            {processFaq?.description ||
                                'Dedicated AI assistant answering candidate questions regarding onboarding, vetting stages, ticket exams, Aveling courseware, interviews, and nominations.'}
                        </p>

                        {processFaq ? (
                            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 mb-4 space-y-2">
                                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                    <span>AI Shared Chat URL</span>
                                    {processFaq.updatedAt && (
                                        <span className="text-slate-400 font-normal">
                                            Updated: {new Date(processFaq.updatedAt).toLocaleDateString()}
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        readOnly
                                        value={processFaq.link}
                                        className="w-full text-xs font-mono bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none select-all truncate"
                                    />
                                    <button
                                        onClick={() => handleCopy(processFaq.id, processFaq.link)}
                                        className="p-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-lg transition-colors flex-shrink-0"
                                        title="Copy Link"
                                    >
                                        <span className="material-symbols-outlined text-base">
                                            {copiedId === processFaq.id ? 'check' : 'content_copy'}
                                        </span>
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-amber-50/50 border border-dashed border-amber-200 rounded-xl p-6 text-center mb-4">
                                <span className="material-symbols-outlined text-amber-500 text-3xl mb-1">link_off</span>
                                <p className="text-xs font-bold text-amber-900">No Process FAQ link configured yet</p>
                                <p className="text-[11px] text-amber-700/80 mt-1 max-w-sm mx-auto">
                                    Candidates currently won't see an AI assistant link for the FIFO process until you configure one.
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex items-center justify-between gap-3">
                        {processFaq ? (
                            <>
                                <div className="flex items-center gap-2">
                                    <a
                                        href={processFaq.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-white border border-slate-200 text-slate-700 hover:text-blue-700 hover:border-blue-300 transition-all shadow-sm"
                                    >
                                        <span className="material-symbols-outlined text-sm">open_in_new</span>
                                        Test AI Chat
                                    </a>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => openEditModal(processFaq)}
                                        className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-blue-900 text-white hover:bg-blue-800 transition-all shadow-sm"
                                    >
                                        <span className="material-symbols-outlined text-sm">edit</span>
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => openDeleteModal(processFaq)}
                                        className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-all"
                                    >
                                        <span className="material-symbols-outlined text-sm">delete</span>
                                        Delete
                                    </button>
                                </div>
                            </>
                        ) : (
                            <button
                                onClick={() => openCreateModal('process')}
                                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest bg-blue-900 text-white hover:bg-blue-800 transition-all shadow-md shadow-blue-900/10"
                            >
                                <span className="material-symbols-outlined text-base">add_link</span>
                                Configure Process AI Chat Link
                            </button>
                        )}
                    </div>
                </div>

                {/* 2. PAYMENT FAQ CARD */}
                <div className="bg-white rounded-2xl border border-emerald-200/80 shadow-sm overflow-hidden flex flex-col justify-between transition-all hover:border-emerald-300 hover:shadow-md">
                    <div className="p-6">
                        <div className="flex items-start justify-between gap-4 mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-2xl">payments</span>
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest bg-emerald-100 text-emerald-800">
                                            PAYMENT
                                        </span>
                                        {paymentFaq ? (
                                            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                Active Link
                                            </span>
                                        ) : (
                                            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                                                Unconfigured
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 mt-1">
                                        {paymentFaq?.title || 'Payment & Subsidies AI Assistant'}
                                    </h3>
                                </div>
                            </div>
                        </div>

                        <p className="text-xs text-slate-600 mb-5 leading-relaxed">
                            {paymentFaq?.description ||
                                'Dedicated AI assistant answering candidate questions regarding milestone invoices, receipts, payment schedules, bank accounts, and training subsidies.'}
                        </p>

                        {paymentFaq ? (
                            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 mb-4 space-y-2">
                                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                    <span>AI Shared Chat URL</span>
                                    {paymentFaq.updatedAt && (
                                        <span className="text-slate-400 font-normal">
                                            Updated: {new Date(paymentFaq.updatedAt).toLocaleDateString()}
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        readOnly
                                        value={paymentFaq.link}
                                        className="w-full text-xs font-mono bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none select-all truncate"
                                    />
                                    <button
                                        onClick={() => handleCopy(paymentFaq.id, paymentFaq.link)}
                                        className="p-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-lg transition-colors flex-shrink-0"
                                        title="Copy Link"
                                    >
                                        <span className="material-symbols-outlined text-base">
                                            {copiedId === paymentFaq.id ? 'check' : 'content_copy'}
                                        </span>
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-amber-50/50 border border-dashed border-amber-200 rounded-xl p-6 text-center mb-4">
                                <span className="material-symbols-outlined text-amber-500 text-3xl mb-1">link_off</span>
                                <p className="text-xs font-bold text-amber-900">No Payment FAQ link configured yet</p>
                                <p className="text-[11px] text-amber-700/80 mt-1 max-w-sm mx-auto">
                                    Candidates currently won't see an AI assistant link for payments until you configure one.
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex items-center justify-between gap-3">
                        {paymentFaq ? (
                            <>
                                <div className="flex items-center gap-2">
                                    <a
                                        href={paymentFaq.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-white border border-slate-200 text-slate-700 hover:text-emerald-700 hover:border-emerald-300 transition-all shadow-sm"
                                    >
                                        <span className="material-symbols-outlined text-sm">open_in_new</span>
                                        Test AI Chat
                                    </a>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => openEditModal(paymentFaq)}
                                        className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-emerald-600 text-white hover:bg-emerald-700 transition-all shadow-sm"
                                    >
                                        <span className="material-symbols-outlined text-sm">edit</span>
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => openDeleteModal(paymentFaq)}
                                        className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-all"
                                    >
                                        <span className="material-symbols-outlined text-sm">delete</span>
                                        Delete
                                    </button>
                                </div>
                            </>
                        ) : (
                            <button
                                onClick={() => openCreateModal('payment')}
                                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest bg-emerald-600 text-white hover:bg-emerald-700 transition-all shadow-md shadow-emerald-600/10"
                            >
                                <span className="material-symbols-outlined text-base">add_link</span>
                                Configure Payment AI Chat Link
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Database Records Table */}
            <div className="bg-white rounded-2xl border border-blue-100 overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-blue-100 flex items-center justify-between">
                    <div>
                        <h2 className="text-sm font-bold uppercase tracking-wider text-blue-900">Configured FAQ Links In Database</h2>
                        <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mt-0.5">
                            Table view of all active FAQ records (Maximum 2 rows allowed)
                        </p>
                    </div>
                    <span className="text-xs font-bold px-3 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-100">
                        {faqs.length} / 2 Stored
                    </span>
                </div>

                {isLoading ? (
                    <div className="p-12 text-center text-xs font-bold uppercase tracking-widest text-blue-400">
                        Loading FAQ records...
                    </div>
                ) : faqs.length === 0 ? (
                    <div className="p-12 text-center text-slate-500">
                        <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">smart_toy</span>
                        <p className="text-sm font-medium">No FAQ links have been created in the database yet.</p>
                        <p className="text-xs text-slate-400 mt-1">Use the cards above or click &quot;Add FAQ Link&quot; to configure them.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-blue-50/70 border-b border-blue-100">
                                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-blue-500">Type</th>
                                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-blue-500">Title</th>
                                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-blue-500">AI Chat Link</th>
                                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-blue-500">Last Updated</th>
                                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-blue-500 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-blue-50">
                                {faqs.map((faq) => (
                                    <tr key={faq.id} className="hover:bg-blue-50/40 transition-colors">
                                        <td className="px-6 py-4">
                                            <span
                                                className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${
                                                    faq.type === 'process'
                                                        ? 'bg-blue-100 text-blue-800'
                                                        : 'bg-emerald-100 text-emerald-800'
                                                }`}
                                            >
                                                {faq.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-semibold text-blue-900">{faq.title || 'Untitled'}</div>
                                            {faq.description && (
                                                <div className="text-xs text-slate-500 truncate max-w-xs">{faq.description}</div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 max-w-sm">
                                                <span className="text-xs font-mono text-blue-600 truncate underline" title={faq.link}>
                                                    {faq.link}
                                                </span>
                                                <button
                                                    onClick={() => handleCopy(faq.id, faq.link)}
                                                    className="text-slate-400 hover:text-slate-600 p-1"
                                                    title="Copy URL"
                                                >
                                                    <span className="material-symbols-outlined text-sm">
                                                        {copiedId === faq.id ? 'check' : 'content_copy'}
                                                    </span>
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-slate-500">
                                            {faq.updatedAt ? new Date(faq.updatedAt).toLocaleString() : '—'}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <a
                                                    href={faq.link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Open & Test AI Chat in new tab"
                                                >
                                                    <span className="material-symbols-outlined text-base">open_in_new</span>
                                                </a>
                                                <button
                                                    onClick={() => openEditModal(faq)}
                                                    className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Edit FAQ"
                                                >
                                                    <span className="material-symbols-outlined text-base">edit</span>
                                                </button>
                                                <button
                                                    onClick={() => openDeleteModal(faq)}
                                                    className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete FAQ"
                                                >
                                                    <span className="material-symbols-outlined text-base">delete</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Create / Edit Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 bg-blue-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-blue-100 animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between pb-4 border-b border-blue-100">
                            <div>
                                <h3 className="text-lg font-bold text-blue-900">
                                    {editingFaq ? 'Edit AI Chat FAQ Link' : 'Add AI Chat FAQ Link'}
                                </h3>
                                <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mt-0.5">
                                    {editingFaq ? `Update configuration for ${editingFaq.type} FAQ` : 'Connect shared AI chat link'}
                                </p>
                            </div>
                            <button
                                onClick={() => setIsEditModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <form onSubmit={handleSaveFaq} className="space-y-4 pt-4">
                            {formError && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-medium text-red-700">
                                    {formError}
                                </div>
                            )}

                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-600 mb-1.5">
                                    FAQ Type <span className="text-red-500">*</span>
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        disabled={editingFaq ? editingFaq.type !== 'process' : !!processFaq}
                                        onClick={() => {
                                            setFormType('process');
                                            if (!editingFaq) setFormTitle('Process AI Assistant');
                                        }}
                                        className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                                            formType === 'process'
                                                ? 'bg-blue-50/80 border-blue-400 text-blue-900 shadow-sm'
                                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                        } ${!editingFaq && processFaq ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold uppercase tracking-wider">Process</span>
                                            {formType === 'process' && (
                                                <span className="material-symbols-outlined text-sm text-blue-600">check_circle</span>
                                            )}
                                        </div>
                                        <span className="text-[10px] text-slate-500">
                                            {!editingFaq && processFaq ? 'Already configured' : 'Vetting, stages & interviews'}
                                        </span>
                                    </button>

                                    <button
                                        type="button"
                                        disabled={editingFaq ? editingFaq.type !== 'payment' : !!paymentFaq}
                                        onClick={() => {
                                            setFormType('payment');
                                            if (!editingFaq) setFormTitle('Payment AI Assistant');
                                        }}
                                        className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                                            formType === 'payment'
                                                ? 'bg-emerald-50/80 border-emerald-400 text-emerald-900 shadow-sm'
                                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                        } ${!editingFaq && paymentFaq ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold uppercase tracking-wider">Payment</span>
                                            {formType === 'payment' && (
                                                <span className="material-symbols-outlined text-sm text-emerald-600">check_circle</span>
                                            )}
                                        </div>
                                        <span className="text-[10px] text-slate-500">
                                            {!editingFaq && paymentFaq ? 'Already configured' : 'Invoices, receipts & subsidies'}
                                        </span>
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-600 mb-1.5">
                                    AI Shared Chat URL <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="url"
                                    required
                                    placeholder="https://chatgpt.com/share/... or https://gemini.google.com/share/..."
                                    value={formLink}
                                    onChange={(e) => setFormLink(e.target.value)}
                                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono transition-all"
                                />
                                <p className="text-[10px] text-slate-400 mt-1">
                                    Paste the link generated from the AI provider&apos;s &ldquo;Share Chat&rdquo; feature.
                                </p>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-600 mb-1.5">
                                    Display Title
                                </label>
                                <input
                                    type="text"
                                    placeholder={formType === 'process' ? 'FIFO Process AI Assistant' : 'Payment AI Assistant'}
                                    value={formTitle}
                                    onChange={(e) => setFormTitle(e.target.value)}
                                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500 transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-600 mb-1.5">
                                    Description / Instructions for Candidates
                                </label>
                                <textarea
                                    rows={3}
                                    placeholder="Brief explanation of what questions candidates can ask this AI assistant..."
                                    value={formDescription}
                                    onChange={(e) => setFormDescription(e.target.value)}
                                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500 transition-all resize-none"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex items-center gap-2 bg-blue-900 text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-blue-800 transition-all shadow-md shadow-blue-900/10 disabled:opacity-50"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined text-base">save</span>
                                            {editingFaq ? 'Save Changes' : 'Create FAQ Link'}
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && deletingFaq && (
                <div className="fixed inset-0 bg-blue-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-red-100 animate-in fade-in zoom-in-95 duration-150">
                        <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mb-4">
                            <span className="material-symbols-outlined text-2xl">warning</span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">Delete FAQ Link</h3>
                        <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                            Are you sure you want to delete the <span className="font-bold uppercase text-red-600">{deletingFaq.type}</span> FAQ link?
                            Candidates will no longer be able to access this AI chat until a new link is configured.
                        </p>

                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 my-4">
                            <p className="text-[10px] font-bold uppercase text-slate-500">Current Link:</p>
                            <p className="text-xs font-mono text-slate-700 truncate mt-0.5">{deletingFaq.link}</p>
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setIsDeleteModalOpen(false)}
                                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={isDeleting}
                                onClick={handleDeleteFaq}
                                className="flex items-center gap-1.5 bg-red-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-red-700 transition-all shadow-md shadow-red-600/10 disabled:opacity-50"
                            >
                                {isDeleting ? (
                                    <>
                                        <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Deleting...
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-base">delete</span>
                                        Confirm Delete
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
