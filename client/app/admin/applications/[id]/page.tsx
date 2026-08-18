'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useApiQuery, useApiMutation } from '@/lib/hooks';
import Link from 'next/link';
import api from '@/lib/api';

interface TicketReq {
    id: number; ticketType: string; description?: string;
    status: 'not_possessed' | 'possessed'; ticketSponsorship: string;
    realPrice?: number; subsidisedPrice?: number; purchasePrice?: number;
    canApplySponsorship?: boolean; courseId?: string;
}

const SPONS_MAP: Record<string, { label: string; cls: string }> = {
    ticket_issued: { label: 'Issued', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    first_attempt_approved: { label: 'Approved', cls: 'bg-blue-50 text-blue-700 border-blue-200' },
    second_attempt_approved: { label: 'Re-Approved', cls: 'bg-blue-50 text-blue-700 border-blue-200' },
    applied: { label: 'Under Review', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
    first_attempt_failed: { label: 'Failed (1st)', cls: 'bg-red-50 text-red-700 border-red-200' },
    second_attempt_failed: { label: 'Failed (2nd)', cls: 'bg-red-50 text-red-700 border-red-200' },
    no_application: { label: 'No Sponsorship', cls: 'bg-slate-50 text-slate-600 border-slate-200' },
};

interface BatchItem {
    id: string;
    catalogId?: string;
    ticketType: string;
    description: string;
    realPrice: string;
    subsidisedPrice: string;
    canApplySponsorship: boolean;
    courseId: string;
}

function TicketRequirementsPanel({ applicationId, tickets, refetch }: { applicationId: string; tickets: TicketReq[]; refetch: () => void; }) {
    const [showAdd, setShowAdd] = useState(false);
    const [editTicket, setEditTicket] = useState<TicketReq | null>(null);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState<number | null>(null);
    const [errMsg, setErrMsg] = useState<string | null>(null);
    const [ticketType, setTicketType] = useState('');
    const [description, setDescription] = useState('');
    const [realPrice, setRealPrice] = useState('');
    const [subsidisedPrice, setSubsidisedPrice] = useState('');
    const [canApply, setCanApply] = useState(false);
    const [courseId, setCourseId] = useState('');
    const [catalogId, setCatalogId] = useState('');

    // Batch ticket requirement creation state
    const [showBatchAdd, setShowBatchAdd] = useState(false);
    const [batchItems, setBatchItems] = useState<BatchItem[]>([]);
    const [batchSaving, setBatchSaving] = useState(false);
    const [batchErrMsg, setBatchErrMsg] = useState<string | null>(null);

    const { data: catalogRes } = useApiQuery<{ success: boolean; data: any[] }>(['admin-ticket-catalogs'], '/ticket-catalogs');
    const { data: coursesRes } = useApiQuery<{ success: boolean; data: any[] }>(['admin-courses'], '/courses');
    const catalogs = catalogRes?.data || [];
    const courses = coursesRes?.data || [];

    const openAdd = () => {
        setEditTicket(null);
        setTicketType('');
        setDescription('');
        setRealPrice('');
        setSubsidisedPrice('');
        setCanApply(false);
        setCourseId('');
        setCatalogId('');
        setErrMsg(null);
        setShowAdd(true);
    };

    const openEdit = (t: TicketReq) => {
        setEditTicket(t);
        setTicketType(t.ticketType);
        setDescription(t.description || '');
        setRealPrice(t.realPrice?.toString() || '');
        setSubsidisedPrice(t.subsidisedPrice?.toString() || '');
        setCanApply(t.canApplySponsorship || false);
        setCourseId(t.courseId || '');
        setCatalogId('');
        setErrMsg(null);
        setShowAdd(true);
    };

    const createBatchItemFromCatalog = (cat: any): BatchItem => {
        const catNameLower = (cat.name || '').toLowerCase();
        const matchedCourse = courses.find((cr: any) => {
            const cTitle = (cr.title || '').toLowerCase();
            const cCode = (cr.code || '').toLowerCase();
            return (
                (cCode && catNameLower.includes(cCode)) ||
                (cTitle && catNameLower.includes(cTitle)) ||
                (cTitle && cTitle.split(' ').some((w: string) => w.length > 3 && catNameLower.includes(w)))
            );
        });

        return {
            id: Math.random().toString(36).substring(2, 9),
            catalogId: cat.id.toString(),
            ticketType: cat.name,
            description: cat.description || '',
            realPrice: cat.normalPrice != null ? cat.normalPrice.toString() : '',
            subsidisedPrice: cat.sponsorshipPrice != null ? cat.sponsorshipPrice.toString() : '',
            canApplySponsorship: true,
            courseId: matchedCourse ? matchedCourse.id : ''
        };
    };

    const openBatchAdd = () => {
        setBatchItems([]);
        setBatchErrMsg(null);
        setShowBatchAdd(true);
    };

    const handlePopulateAllCatalogues = () => {
        if (!catalogs || catalogs.length === 0) return;
        const items = catalogs.map((cat: any) => createBatchItemFromCatalog(cat));
        setBatchItems(items);
    };

    const handleAddCatalogItemToBatch = (catId: string) => {
        if (!catId) return;
        const cat = catalogs.find((c: any) => c.id.toString() === catId);
        if (cat) {
            setBatchItems(prev => [...prev, createBatchItemFromCatalog(cat)]);
        }
    };

    const handleRowCatalogChange = (rowId: string, catId: string) => {
        if (!catId) return;
        const cat = catalogs.find((c: any) => c.id.toString() === catId);
        if (cat) {
            const newItem = createBatchItemFromCatalog(cat);
            setBatchItems(prev => prev.map(item => item.id === rowId ? { ...newItem, id: rowId } : item));
        }
    };

    const handleAddBlankRow = () => {
        setBatchItems(prev => [...prev, {
            id: Math.random().toString(36).substring(2, 9),
            ticketType: '',
            description: '',
            realPrice: '',
            subsidisedPrice: '',
            canApplySponsorship: true,
            courseId: ''
        }]);
    };

    const handleUpdateBatchField = (id: string, field: keyof BatchItem, val: any) => {
        setBatchItems(prev => prev.map(item => item.id === id ? { ...item, [field]: val } : item));
    };

    const handleRemoveBatchItem = (id: string) => {
        setBatchItems(prev => prev.filter(item => item.id !== id));
    };

    const handleSaveBatch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (batchItems.length === 0) {
            setBatchErrMsg('Please select or add at least one ticket requirement to the batch.');
            return;
        }
        for (let i = 0; i < batchItems.length; i++) {
            if (!batchItems[i].ticketType.trim()) {
                setBatchErrMsg(`Requirement #${i + 1} is missing a ticket title.`);
                return;
            }
        }
        setBatchSaving(true);
        setBatchErrMsg(null);
        try {
            const payload = batchItems.map(item => ({
                catalogId: item.catalogId || null,
                ticketType: item.ticketType,
                description: item.description || null,
                realPrice: item.realPrice ? parseFloat(item.realPrice) : null,
                subsidisedPrice: item.subsidisedPrice ? parseFloat(subsidisedPrice) : null,
                canApplySponsorship: item.canApplySponsorship,
                courseId: item.courseId || null
            }));

            await api.post(`/admin/applications/${applicationId}/tickets/batch`, { tickets: payload });
            setShowBatchAdd(false);
            setBatchItems([]);
            refetch();
        } catch (err: any) {
            setBatchErrMsg(err.response?.data?.message || 'Failed to save batch requirements.');
        } finally {
            setBatchSaving(false);
        }
    };

    const handleSelectCatalogTemplate = (selectedId: string) => {
        setCatalogId(selectedId);
        if (!selectedId) return;
        const cat = catalogs.find((c: any) => c.id.toString() === selectedId);
        if (cat) {
            setTicketType(cat.name);
            setDescription(cat.description || '');
            setRealPrice(cat.normalPrice != null ? cat.normalPrice.toString() : '');
            setSubsidisedPrice(cat.sponsorshipPrice != null ? cat.sponsorshipPrice.toString() : '');
            setCanApply(true);
            
            // Auto-match courseId by unit code or title keyword
            const catNameLower = cat.name.toLowerCase();
            const matchedCourse = courses.find((cr: any) => {
                const cTitle = (cr.title || '').toLowerCase();
                const cCode = (cr.code || '').toLowerCase();
                return (
                    (cCode && catNameLower.includes(cCode)) ||
                    (cTitle && catNameLower.includes(cTitle)) ||
                    (cTitle && cTitle.split(' ').some((w: string) => w.length > 3 && catNameLower.includes(w)))
                );
            });
            if (matchedCourse) {
                setCourseId(matchedCourse.id);
            }
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!ticketType.trim()) { setErrMsg('Please select a ticket requirement from the catalog.'); return; }
        setSaving(true); setErrMsg(null);
        try {
            const payload = {
                catalogId: catalogId || null,
                ticketType,
                description: description || null,
                realPrice: realPrice ? parseFloat(realPrice) : null,
                subsidisedPrice: subsidisedPrice ? parseFloat(subsidisedPrice) : null,
                canApplySponsorship: canApply,
                courseId: courseId || null
            };
            if (editTicket) {
                await api.put(`/admin/tickets/${editTicket.id}`, payload);
            } else {
                await api.post(`/admin/applications/${applicationId}/tickets`, payload);
            }
            setShowAdd(false);
            setEditTicket(null);
            refetch();
        } catch (err: any) {
            setErrMsg(err.response?.data?.message || 'Failed to save.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (ticketId: number) => {
        if (!confirm('Delete this ticket requirement? This cannot be undone.')) return;
        setDeleting(ticketId);
        try { await api.delete(`/admin/tickets/${ticketId}`); refetch(); }
        catch (err: any) { alert(err.response?.data?.message || 'Failed to delete.'); }
        finally { setDeleting(null); }
    };

    const selectedCatalog = catalogs.find((c: any) => c.id.toString() === catalogId);
    const selectedCourse = courses.find((c: any) => c.id === courseId);

    return (
        <div className="bg-white p-8 rounded-[2.5rem] border border-blue-100 shadow-2xl shadow-blue-900/5">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-blue-50 flex-wrap gap-3">
                <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-blue-900">confirmation_number</span>
                    <h3 className="text-[10px] font-black text-blue-900 uppercase tracking-[0.2em]">Ticket Requirements</h3>
                    <span className="bg-blue-100 text-blue-800 text-[9px] font-black px-2 py-0.5 rounded-full">{tickets.length}</span>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={openBatchAdd} className="bg-indigo-900 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all flex items-center gap-1.5 shadow-lg shadow-indigo-900/10">
                        <span className="material-symbols-outlined text-sm">library_add</span> Batch Add Catalogue
                    </button>
                    <button onClick={openAdd} className="bg-blue-900 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all flex items-center gap-1.5 shadow-lg shadow-blue-900/10">
                        <span className="material-symbols-outlined text-sm">add</span> Single Requirement
                    </button>
                </div>
            </div>
            {tickets.length === 0 ? (
                <div className="py-10 text-center">
                    <span className="material-symbols-outlined text-3xl text-blue-200 mb-2 block">confirmation_number</span>
                    <p className="text-[9px] font-black text-blue-300 uppercase tracking-[0.3em] mb-3">No ticket requirements assigned</p>
                    <div className="flex items-center justify-center gap-3">
                        <button onClick={openBatchAdd} className="text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-4 py-2 rounded-xl hover:bg-indigo-100 transition-all flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">auto_awesome</span> Populate Batch from Catalogue
                        </button>
                        <button onClick={openAdd} className="text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-100 px-4 py-2 rounded-xl hover:bg-blue-100 transition-all flex items-center gap-1">
                            + Add Single Requirement
                        </button>
                    </div>
                </div>
            ) : (
                <div className="space-y-3">
                    {tickets.map(t => {
                        const s = SPONS_MAP[t.ticketSponsorship] ?? SPONS_MAP.no_application;
                        const linkedCourse = courses.find((c: any) => c.id === t.courseId);
                        return (
                            <div key={t.id} className="flex items-start justify-between gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap mb-1">
                                        <p className="text-xs font-black text-blue-900">{t.ticketType}</p>
                                        <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${s.cls}`}>{s.label}</span>
                                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${t.status === 'possessed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>{t.status === 'possessed' ? 'Possessed' : 'Not Possessed'}</span>
                                        {t.canApplySponsorship && <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest bg-violet-50 text-violet-700 border border-violet-200">Sponsorship Eligible</span>}
                                    </div>
                                    {t.description && <p className="text-[10px] text-slate-500 mb-1">{t.description}</p>}
                                    <div className="flex items-center gap-4 mt-1 flex-wrap text-[10px]">
                                        {(t.subsidisedPrice != null || t.realPrice != null) && (
                                            <span className="font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                                                Price: ${t.subsidisedPrice ?? t.realPrice}
                                                {t.subsidisedPrice != null && t.realPrice != null && t.realPrice > t.subsidisedPrice && (
                                                    <span className="line-through text-slate-400 ml-1 font-normal">${t.realPrice}</span>
                                                )}
                                            </span>
                                        )}
                                        {linkedCourse ? (
                                            <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 flex items-center gap-1">
                                                <span className="material-symbols-outlined text-[12px]">menu_book</span>
                                                Course: {linkedCourse.code ? `[${linkedCourse.code}] ` : ''}{linkedCourse.title}
                                            </span>
                                        ) : t.courseId ? (
                                            <span className="text-slate-400">Course ID: {t.courseId}</span>
                                        ) : null}
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1.5 flex-shrink-0">
                                    <button onClick={() => openEdit(t)} className="text-[9px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-all flex items-center gap-1"><span className="material-symbols-outlined text-[12px]">edit</span> Edit</button>
                                    <button onClick={() => handleDelete(t.id)} disabled={deleting === t.id} className="text-[9px] font-black uppercase tracking-widest text-red-500 bg-red-50 border border-red-100 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-all flex items-center gap-1"><span className="material-symbols-outlined text-[12px]">delete</span>{deleting === t.id ? '...' : ' Delete'}</button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
            {showAdd && (
                <div className="fixed inset-0 z-50 bg-blue-950/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl border border-blue-100 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6 pb-3 border-b border-blue-50">
                            <div>
                                <span className="text-[9px] font-black uppercase tracking-widest text-blue-400 block mb-0.5">{editTicket ? 'Edit' : 'Clone Catalog Item'} Ticket Requirement</span>
                                <h2 className="text-lg font-bold text-blue-900">{editTicket?.ticketType || 'Select Ticket from Catalog'}</h2>
                            </div>
                            <button onClick={() => { setShowAdd(false); setEditTicket(null); }} className="text-slate-400 hover:text-slate-600"><span className="material-symbols-outlined">close</span></button>
                        </div>
                        {errMsg && <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-[10px] font-bold uppercase tracking-widest">{errMsg}</div>}
                        
                        <form onSubmit={handleSave} className="space-y-5">
                            {!editTicket && (
                                <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50/50 border border-blue-200 rounded-2xl space-y-3 shadow-inner">
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-blue-900 flex items-center gap-1.5">
                                        <span className="material-symbols-outlined text-base text-blue-700">style</span>
                                        Catalogue Ticket Item *
                                    </label>
                                    <select
                                        value={catalogId}
                                        onChange={(e) => handleSelectCatalogTemplate(e.target.value)}
                                        className="w-full bg-white border border-blue-300 rounded-xl p-3 text-xs text-blue-900 font-bold outline-none shadow-sm focus:ring-2 focus:ring-blue-600"
                                        required
                                    >
                                        <option value="">-- Choose Catalogue Ticket to Clone --</option>
                                        {catalogs.map((cat: any) => (
                                            <option key={cat.id} value={cat.id}>
                                                {cat.name} — Normal: ${cat.normalPrice || 0} | Subsidised: ${cat.sponsorshipPrice || 0}
                                            </option>
                                        ))}
                                    </select>
                                    <p className="text-[9px] text-blue-800 font-semibold leading-relaxed">
                                        Selecting an item clones its title, description, pricing, and links its standardized exam & course materials automatically.
                                    </p>
                                </div>
                            )}

                            {(selectedCatalog || ticketType) && (
                                <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center justify-between text-[10px]">
                                    <div className="flex items-center gap-2 text-emerald-900 font-bold">
                                        <span className="material-symbols-outlined text-base text-emerald-600">verified</span>
                                        <span>Active Template: <strong>{ticketType}</strong></span>
                                    </div>
                                    {selectedCourse && (
                                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-black text-[9px]">
                                            Course: {selectedCourse.code || selectedCourse.title}
                                        </span>
                                    )}
                                </div>
                            )}

                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-blue-900 mb-2">Ticket / Certification Title *</label>
                                <input type="text" value={ticketType} onChange={e => setTicketType(e.target.value)} placeholder="e.g. White Card (CPCWHS1001)" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-blue-900 font-medium" />
                            </div>
                            
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-blue-900 mb-2">Description</label>
                                <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-blue-900 font-medium resize-none" />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-blue-900 mb-2">Real Price ($)</label>
                                    <input type="number" step="0.01" value={realPrice} onChange={e => setRealPrice(e.target.value)} placeholder="120.00" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-blue-900 font-bold" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-blue-900 mb-2">Subsidised Price ($)</label>
                                    <input type="number" step="0.01" value={subsidisedPrice} onChange={e => setSubsidisedPrice(e.target.value)} placeholder="60.00" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-blue-900 font-bold text-emerald-700" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-blue-900 mb-2">Linked Course (Auto-Attached Exam & Materials)</label>
                                <select
                                    value={courseId}
                                    onChange={e => setCourseId(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-blue-900 font-medium"
                                >
                                    <option value="">-- Select Linked Course --</option>
                                    {courses.map((cr: any) => (
                                        <option key={cr.id} value={cr.id}>
                                            {cr.code ? `[${cr.code}] ` : ''}{cr.title}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-[9px] text-slate-400 mt-1">
                                    Ensures all applicants write the exact same standardized exam regardless of pricing.
                                </p>
                            </div>

                            <div className="flex items-center justify-between p-3.5 bg-blue-50 rounded-xl border border-blue-100">
                                <div>
                                    <p className="text-xs font-bold text-blue-900">Allow Sponsorship Applications</p>
                                    <p className="text-[10px] text-slate-500">Applicant can apply for sponsorship for this ticket.</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" checked={canApply} onChange={e => setCanApply(e.target.checked)} className="sr-only peer" />
                                    <div className="w-11 h-6 bg-slate-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-900" />
                                </label>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-2">
                                <button type="button" onClick={() => { setShowAdd(false); setEditTicket(null); }} className="px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:bg-slate-100">Cancel</button>
                                <button type="submit" disabled={saving} className="bg-blue-900 hover:bg-blue-800 text-white px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-blue-900/10">
                                    {saving ? 'Saving...' : (editTicket ? 'Save Changes' : 'Save Cloned Requirement')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Batch Creation Modal */}
            {showBatchAdd && (
                <div className="fixed inset-0 z-50 bg-blue-950/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-4xl w-full shadow-2xl border border-blue-100 max-h-[92vh] flex flex-col">
                        <div className="flex items-center justify-between pb-4 border-b border-blue-50 flex-shrink-0">
                            <div>
                                <span className="text-[9px] font-black uppercase tracking-widest text-indigo-500 block mb-0.5">Catalogue Batch Creation</span>
                                <h2 className="text-xl font-bold text-blue-900">Batch Create Ticket Requirements</h2>
                                <p className="text-xs text-slate-500 mt-0.5">Selecting catalogue tickets populates form fields automatically for each item in the batch.</p>
                            </div>
                            <button onClick={() => setShowBatchAdd(false)} className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition-all">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        {/* Top Action Controls */}
                        <div className="py-4 border-b border-blue-50 flex items-center justify-between flex-wrap gap-3 flex-shrink-0 bg-indigo-50/50 -mx-8 px-8 my-2">
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={handlePopulateAllCatalogues}
                                    className="bg-indigo-900 hover:bg-black text-white px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-md shadow-indigo-900/20"
                                >
                                    <span className="material-symbols-outlined text-sm text-indigo-300">auto_awesome</span>
                                    Populate All Catalogue Tickets ({catalogs.length})
                                </button>
                                <button
                                    type="button"
                                    onClick={handleAddBlankRow}
                                    className="bg-white border border-indigo-200 text-indigo-900 hover:bg-indigo-50 px-4 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-1.5"
                                >
                                    <span className="material-symbols-outlined text-sm">add</span>
                                    Add Blank Item
                                </button>
                            </div>

                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Add catalogue item:</span>
                                <select
                                    onChange={(e) => {
                                        handleAddCatalogItemToBatch(e.target.value);
                                        e.target.value = '';
                                    }}
                                    className="bg-white border border-indigo-300 rounded-xl px-3 py-2 text-xs text-blue-900 font-bold outline-none shadow-sm focus:ring-2 focus:ring-indigo-600"
                                >
                                    <option value="">+ Select Ticket Catalogue Item...</option>
                                    {catalogs.map((cat: any) => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.name} (${cat.sponsorshipPrice || cat.normalPrice || 0})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {batchErrMsg && (
                            <div className="my-3 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-[10px] font-bold uppercase tracking-widest flex-shrink-0">
                                {batchErrMsg}
                            </div>
                        )}

                        {/* Batch Form Items List */}
                        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
                            {batchItems.length === 0 ? (
                                <div className="py-16 text-center border-2 border-dashed border-indigo-100 rounded-3xl bg-indigo-50/20">
                                    <span className="material-symbols-outlined text-4xl text-indigo-300 mb-2 block">library_add</span>
                                    <p className="text-xs font-bold text-indigo-900 mb-1">No ticket requirements added to this batch yet.</p>
                                    <p className="text-[10px] text-slate-400 max-w-md mx-auto mb-4">Click "Populate All Catalogue Tickets" to load all standardized FIFO ticket templates at once, or choose individual templates from the catalogue dropdown above.</p>
                                    <button
                                        type="button"
                                        onClick={handlePopulateAllCatalogues}
                                        className="bg-indigo-900 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all inline-flex items-center gap-2"
                                    >
                                        <span className="material-symbols-outlined text-sm text-indigo-300">auto_awesome</span>
                                        Populate All ({catalogs.length}) Catalogue Tickets
                                    </button>
                                </div>
                            ) : (
                                batchItems.map((item, idx) => {
                                    const linkedCourse = courses.find((c: any) => c.id === item.courseId);
                                    return (
                                        <div key={item.id} className="p-5 bg-gradient-to-br from-slate-50 to-indigo-50/30 rounded-2xl border border-indigo-100 shadow-sm relative group">
                                            <div className="flex items-center justify-between mb-4 pb-3 border-b border-indigo-100/60">
                                                <div className="flex items-center gap-3 flex-wrap">
                                                    <span className="w-6 h-6 rounded-full bg-indigo-900 text-white text-[10px] font-black flex items-center justify-center">
                                                        {idx + 1}
                                                    </span>
                                                    <span className="text-xs font-black text-blue-900">
                                                        {item.ticketType || 'New Ticket Requirement'}
                                                    </span>
                                                    {item.catalogId && (
                                                        <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 text-[8px] font-black uppercase tracking-widest flex items-center gap-1">
                                                            <span className="material-symbols-outlined text-[10px]">verified</span> Catalogue Template
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    {/* Catalogue Template Switcher for this row */}
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-[9px] font-bold text-slate-400 uppercase">Template:</span>
                                                        <select
                                                            value={item.catalogId || ''}
                                                            onChange={(e) => handleRowCatalogChange(item.id, e.target.value)}
                                                            className="bg-white border border-indigo-200 rounded-lg text-[10px] font-bold text-blue-900 py-1 px-2 outline-none"
                                                        >
                                                            <option value="">-- Custom --</option>
                                                            {catalogs.map((cat: any) => (
                                                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                                                            ))}
                                                        </select>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveBatchItem(item.id)}
                                                        className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-all"
                                                        title="Remove from batch"
                                                    >
                                                        <span className="material-symbols-outlined text-base">delete</span>
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                <div className="lg:col-span-2">
                                                    <label className="block text-[9px] font-black uppercase tracking-widest text-blue-900 mb-1">Ticket / Certification Title *</label>
                                                    <input
                                                        type="text"
                                                        value={item.ticketType}
                                                        onChange={(e) => handleUpdateBatchField(item.id, 'ticketType', e.target.value)}
                                                        placeholder="e.g. EEHA Certification"
                                                        className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-blue-900 font-bold focus:border-indigo-600 outline-none"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-[9px] font-black uppercase tracking-widest text-blue-900 mb-1">Linked LMS Course</label>
                                                    <select
                                                        value={item.courseId}
                                                        onChange={(e) => handleUpdateBatchField(item.id, 'courseId', e.target.value)}
                                                        className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-blue-900 font-medium focus:border-indigo-600 outline-none"
                                                    >
                                                        <option value="">-- No Linked Course --</option>
                                                        {courses.map((cr: any) => (
                                                            <option key={cr.id} value={cr.id}>
                                                                {cr.code ? `[${cr.code}] ` : ''}{cr.title}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div className="lg:col-span-3">
                                                    <label className="block text-[9px] font-black uppercase tracking-widest text-blue-900 mb-1">Description</label>
                                                    <input
                                                        type="text"
                                                        value={item.description}
                                                        onChange={(e) => handleUpdateBatchField(item.id, 'description', e.target.value)}
                                                        placeholder="Description / Module Details..."
                                                        className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs text-slate-700 font-medium focus:border-indigo-600 outline-none"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-[9px] font-black uppercase tracking-widest text-blue-900 mb-1">Real Price ($)</label>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        value={item.realPrice}
                                                        onChange={(e) => handleUpdateBatchField(item.id, 'realPrice', e.target.value)}
                                                        placeholder="1850.00"
                                                        className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs font-bold text-blue-900 focus:border-indigo-600 outline-none"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-[9px] font-black uppercase tracking-widest text-blue-900 mb-1">Subsidised Price ($)</label>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        value={item.subsidisedPrice}
                                                        onChange={(e) => handleUpdateBatchField(item.id, 'subsidisedPrice', e.target.value)}
                                                        placeholder="647.50"
                                                        className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs font-bold text-emerald-700 focus:border-indigo-600 outline-none"
                                                    />
                                                </div>

                                                <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200">
                                                    <span className="text-[10px] font-bold text-blue-900">Sponsorship Eligible</span>
                                                    <label className="relative inline-flex items-center cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={item.canApplySponsorship}
                                                            onChange={(e) => handleUpdateBatchField(item.id, 'canApplySponsorship', e.target.checked)}
                                                            className="sr-only peer"
                                                        />
                                                        <div className="w-9 h-5 bg-slate-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-900" />
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Footer Actions */}
                        <div className="pt-4 border-t border-blue-50 flex items-center justify-between flex-shrink-0 flex-wrap gap-3">
                            <div className="text-[10px] font-bold text-slate-500">
                                Total Batch Items: <span className="font-black text-indigo-900 text-xs">{batchItems.length}</span>
                                {batchItems.length > 0 && (
                                    <span className="ml-3 text-emerald-700 font-bold bg-emerald-50 px-2 py-1 rounded border border-emerald-100">
                                        Total Subsidised: ${batchItems.reduce((acc, i) => acc + (parseFloat(i.subsidisedPrice) || parseFloat(i.realPrice) || 0), 0).toFixed(2)} AUD
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowBatchAdd(false)}
                                    className="px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:bg-slate-100 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSaveBatch}
                                    disabled={batchSaving || batchItems.length === 0}
                                    className="bg-indigo-900 hover:bg-black text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-900/20 disabled:opacity-50 transition-all flex items-center gap-2"
                                >
                                    {batchSaving ? (
                                        <>
                                            <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Saving Batch...
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined text-sm">check_circle</span>
                                            Create Batch Requirements ({batchItems.length})
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function ApplicantExamScoresTable({
    tickets = [],
    examAttempts = [],
    courses = []
}: {
    tickets: TicketReq[];
    examAttempts: any[];
    courses: any[];
}) {
    return (
        <div className="bg-white p-8 rounded-[2.5rem] border border-blue-100 shadow-2xl shadow-blue-900/5 mt-8">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-blue-50">
                <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-blue-900">quiz</span>
                    <div>
                        <h3 className="text-[10px] font-black text-blue-900 uppercase tracking-[0.2em]">
                            Applicant Exam Scores & Performance
                        </h3>
                        <p className="text-[9px] font-bold text-blue-400 uppercase mt-0.5">
                            Standardized LMS exam performance tracked per required ticket
                        </p>
                    </div>
                </div>
                <span className="bg-blue-100 text-blue-800 text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                    {tickets.length} Required {tickets.length === 1 ? 'Ticket' : 'Tickets'}
                </span>
            </div>

            {tickets.length === 0 ? (
                <div className="py-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <span className="material-symbols-outlined text-2xl text-slate-300 mb-1 block">assignment_late</span>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                        No ticket requirements assigned to track exam scores
                    </p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-blue-50 text-[8px] font-black uppercase tracking-widest text-blue-400">
                                <th className="py-3 px-4">Ticket Requirement</th>
                                <th className="py-3 px-4">Linked Course / Unit</th>
                                <th className="py-3 px-4 text-center">Attempts</th>
                                <th className="py-3 px-4 text-center">Highest Score</th>
                                <th className="py-3 px-4 text-right">Exam Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs">
                            {tickets.map(t => {
                                const linkedCourse = courses.find((c: any) => c.id === t.courseId) ||
                                    courses.find((c: any) => {
                                        const cTitle = (c.title || '').toLowerCase();
                                        const tType = t.ticketType.toLowerCase();
                                        return cTitle && tType.includes(cTitle);
                                    });
                                
                                const attemptsForCourse = examAttempts.filter((a: any) =>
                                    t.courseId ? a.courseId === t.courseId : (linkedCourse ? a.courseId === linkedCourse.id : false)
                                );
                                
                                const bestAttempt = attemptsForCourse.reduce((highest: any, curr: any) => {
                                    if (!highest || curr.score > highest.score) return curr;
                                    return highest;
                                }, null);

                                return (
                                    <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="py-4 px-4 font-black text-blue-900">
                                            {t.ticketType}
                                            {t.description && (
                                                <p className="text-[9px] font-normal text-slate-400 line-clamp-1">{t.description}</p>
                                            )}
                                        </td>
                                        <td className="py-4 px-4">
                                            {linkedCourse ? (
                                                <div>
                                                    <span className="font-bold text-blue-800 text-[11px]">
                                                        {linkedCourse.code ? `[${linkedCourse.code}] ` : ''}{linkedCourse.title}
                                                    </span>
                                                    <p className="text-[9px] text-slate-400">Format: {linkedCourse.format || 'Mixed'}</p>
                                                </div>
                                            ) : (
                                                <span className="text-[10px] italic text-slate-400">No linked course</span>
                                            )}
                                        </td>
                                        <td className="py-4 px-4 text-center font-bold text-slate-700">
                                            {attemptsForCourse.length > 0 ? (
                                                <span className="px-2.5 py-1 rounded-full bg-slate-100 text-[9px] font-black text-slate-700">
                                                    {attemptsForCourse.length} {attemptsForCourse.length === 1 ? 'attempt' : 'attempts'}
                                                </span>
                                            ) : (
                                                <span className="text-[9px] text-slate-400 font-semibold">0</span>
                                            )}
                                        </td>
                                        <td className="py-4 px-4 text-center font-black">
                                            {bestAttempt ? (
                                                <span className={bestAttempt.isPass ? 'text-emerald-600 text-sm' : 'text-red-500 text-sm'}>
                                                    {bestAttempt.score}%
                                                </span>
                                            ) : (
                                                <span className="text-[10px] text-slate-400 font-normal">--</span>
                                            )}
                                        </td>
                                        <td className="py-4 px-4 text-right">
                                            {bestAttempt ? (
                                                bestAttempt.isPass ? (
                                                    <span className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1">
                                                        <span className="material-symbols-outlined text-[12px]">check_circle</span> PASSED
                                                    </span>
                                                ) : (
                                                    <span className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-red-50 text-red-700 border border-red-200 inline-flex items-center gap-1">
                                                        <span className="material-symbols-outlined text-[12px]">cancel</span> FAILED
                                                    </span>
                                                )
                                            ) : (
                                                <span className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-slate-100 text-slate-500 border border-slate-200 inline-flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-[12px]">hourglass_empty</span> PENDING
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default function ApplicationDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id;
    const [showAddStage, setShowAddStage] = useState(false);

    // Form state for stage
    const [editingStage, setEditingStage] = useState<any>(null);
    const [prefillStageId, setPrefillStageId] = useState<number | ''>('');
    const [status, setStatus] = useState('pending');
    const [verifyingPayment, setVerifyingPayment] = useState<any>(null);

    const { data: application, isLoading, error, refetch } = useApiQuery<any>(
        ['admin', 'applications', `${id}`],
        `/admin/applications/${id}`,
        { enabled: !!id }
    );

    const { data: prefillStagesResponse } = useApiQuery<any>(
        ['admin', 'prefill-stages'],
        '/admin/prefill-stages'
    );
    const prefillStages = (prefillStagesResponse?.data || []).filter((s: any) => s.type === 'applicant_display');

    const { data: coursesResponse } = useApiQuery<any>(
        ['admin', 'courses'],
        '/courses'
    );
    const coursesList = coursesResponse?.data || [];

    const addStageMutation = useApiMutation(
        'post',
        `/admin/applications/${id}/stages`,
        {
            onSuccess: () => {
                setShowAddStage(false);
                resetStageForm();
                refetch();
            }
        }
    );

    const updateStageMutation = useApiMutation(
        'put',
        `/admin/applications/${id}/stages/:stageId`,
        {
            onSuccess: () => {
                setEditingStage(null);
                resetStageForm();
                refetch();
            }
        }
    );

    const deleteStageMutation = useApiMutation(
        'delete',
        `/admin/applications/${id}/stages/:stageId`,
        { onSuccess: () => refetch() }
    );

    const advanceMutation = useApiMutation(
        'post',
        `/admin/applications/${id}/advance`,
        { onSuccess: () => refetch() }
    );

    const completeStageMutation = useApiMutation(
        'post',
        `/admin/applications/${id}/stages/:stageId/complete`,
        { onSuccess: () => refetch() }
    );

    const verifyPaymentMutation = useApiMutation(
        'post',
        '/admin/payments/:paymentId/verify',
        {
            onSuccess: () => {
                setVerifyingPayment(null);
                refetch();
            }
        }
    );

    const completeApplicationMutation = useApiMutation(
        'post',
        `/admin/applications/${id}/complete`,
        {
            onSuccess: () => {
                refetch();
            }
        }
    );

    const visaSponsorshipMutation = useApiMutation(
        'put',
        `/admin/applications/${id}/visa-sponsorship`,
        {
            onSuccess: () => {
                refetch();
            }
        }
    );

    const resetStageForm = () => {
        setPrefillStageId('');
        setStatus('pending');
    };

    const handleSaveStage = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            prefillStageId: prefillStageId ? Number(prefillStageId) : 1,
            status: status
        };

        try {
            if (editingStage) {
                await updateStageMutation.mutateAsync({
                    params: { stageId: editingStage.id },
                    data: payload
                });
            } else {
                await addStageMutation.mutateAsync(payload);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleEditClick = (stage: any) => {
        setEditingStage(stage);
        setPrefillStageId(stage.prefillStageId || 1);
        setStatus(stage.status || 'pending');
    };



    const handleMarkStageComplete = async (stageId: number) => {
        if (confirm('Mark Stage Complete: This will mark this specific stage as completed. Confirm?')) {
            try {
                await completeStageMutation.mutateAsync({ params: { stageId } });
            } catch (err) {
                console.error(err);
            }
        }
    };

    const handleComplete = async () => {
        if (confirm('Finalize Application: Are you sure you want to mark this application as COMPLETED? This will notify the applicant and finalize the process.')) {
            try {
                await completeApplicationMutation.mutateAsync({});
            } catch (err) {
                console.error(err);
            }
        }
    };

    if (isLoading) return <div className="p-12 text-center text-[10px] font-bold uppercase tracking-widest text-blue-400">Loading Application Status...</div>;
    if (error) return <div className="p-12 text-center text-red-500 text-[10px] font-bold uppercase tracking-widest">Error Loading Application Data</div>;

    const user = application?.User;
    const job = application?.JobListing;
    const stages = application?.JobStages || [];
    const payments = application?.Payments || [];

    const getStagePayment = (stageId: number) => {
        return payments.find((p: any) => p.stageId === stageId);
    };

    const DataItem = ({ label, value }: { label: string, value: string | null | undefined }) => (
        <div className="space-y-1">
            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-blue-400">{label}</span>
            <p className="text-[11px] font-bold text-blue-900 uppercase">{value || 'Not Disclosed'}</p>
        </div>
    );

    return (
        <div className="font-sans antialiased text-blue-900 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6 pb-8 border-b border-blue-50">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <Link href="/admin/applications" className="text-blue-400 hover:text-blue-900 transition-colors">
                            <span className="material-symbols-outlined text-sm font-bold">arrow_back</span>
                        </Link>
                        <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em]">Application Management / {id}</span>
                    </div>
                    <h1 className="text-3xl font-black italic uppercase tracking-tighter text-blue-900">{user?.fullName}</h1>
                    <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mt-1">
                        Application Target: {job?.title}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <span className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-xl border ${application.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                        application.status === 'COMPLETED' ? 'bg-blue-900 text-white shadow-lg shadow-blue-900/10' :
                            'bg-blue-100 text-blue-600'
                        }`}>
                        {application.status}
                    </span>
                    <Link
                        href={`/admin/mail?to=${encodeURIComponent(user?.email || '')}&applicantId=${user?.id || ''}`}
                        className="bg-indigo-50 text-indigo-700 border border-indigo-100 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-indigo-100 transition-all flex items-center gap-2 active:scale-95"
                    >
                        <span className="material-symbols-outlined text-sm font-bold">mail</span>
                        Email Applicant
                    </Link>
                    <button
                        onClick={() => setShowAddStage(true)}
                        className="bg-blue-900 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-black transition-all shadow-xl shadow-blue-900/10 active:scale-95"
                    >
                        Add Workflow Stage
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Main Process Logic */}
                <div className="lg:col-span-8 space-y-8">
                    <div className="bg-white p-10 rounded-[2.5rem] border border-blue-100 shadow-2xl shadow-blue-900/5">
                        <div className="flex items-center justify-between mb-10">
                            <h3 className="text-[10px] font-black text-blue-900 uppercase tracking-[0.3em] flex items-center gap-2">
                                <span className="material-symbols-outlined text-sm font-bold">account_tree</span>
                                Application Process
                            </h3>
                        </div>

                        <div className="space-y-4">
                            {stages.sort((a: any, b: any) => a.id - b.id).map((stage: any, index: number) => {
                                const isCurrent = stage.id === application.currentStageId;
                                const payment = getStagePayment(stage.id);

                                return (
                                    <div
                                        key={stage.id}
                                        className={`p-6 rounded-[2rem] border transition-all group ${isCurrent ? 'bg-blue-50 border-blue-200 shadow-xl shadow-blue-900/5' : 'bg-white border-blue-50'
                                            }`}
                                    >
                                        <div className="flex justify-between items-start gap-4">
                                            <div className="flex gap-6">
                                                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-black italic shrink-0 transition-all ${isCurrent ? 'bg-blue-900 text-white shadow-2xl shadow-blue-900/20' : 'bg-blue-50 text-blue-300'
                                                    }`}>
                                                    {index + 1}
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-black uppercase tracking-tight text-blue-900 flex items-center gap-3">
                                                        {stage.PrefillStage?.name || 'Unnamed Stage'}
                                                    </h4>
                                                    <p className="text-[11px] font-bold text-blue-400 mt-1 leading-relaxed uppercase">
                                                        Status: {stage.status}
                                                    </p>

                                                    {payment && (
                                                        <div className="mt-6 flex items-center gap-3">
                                                            <div className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 border ${payment.status === 'Paid' || payment.status === 'Verified' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                                payment.status === 'Pending' ? 'bg-amber-50 text-amber-600 border-amber-100 animate-pulse' : 'bg-red-50 text-red-600 border-red-100'
                                                                }`}>
                                                                <span className="material-symbols-outlined text-xs font-bold">payments</span>
                                                                Payment {payment.status}
                                                                {payment.status === 'Pending' && (
                                                                    <button
                                                                        onClick={() => setVerifyingPayment(payment)}
                                                                        className="ml-4 underline hover:text-amber-800 transition-colors"
                                                                    >
                                                                        Inspect Proof
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-3">
                                                {isCurrent && (
                                                    <span className="text-[8px] font-black text-white uppercase tracking-widest bg-blue-900 px-3 py-1 rounded-lg shadow-lg shadow-blue-900/10">
                                                        Current Stage
                                                    </span>
                                                )}
                                                {stage.isCompleted && (
                                                    <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-lg flex items-center gap-1">
                                                        <span className="material-symbols-outlined text-[10px] font-bold">check</span>
                                                        Completed
                                                    </span>
                                                )}
                                                <div className="flex flex-col sm:flex-row gap-2 mt-2">
                                                    {!stage.isCompleted && (
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleMarkStageComplete(stage.id); }}
                                                            className="px-3 py-1.5 flex items-center justify-center gap-1.5 text-[9px] font-black uppercase text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-all border border-emerald-100"
                                                        >
                                                            <span className="material-symbols-outlined text-[14px]">done_all</span>
                                                            <span className="hidden sm:inline">Mark Complete</span>
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleEditClick(stage); }}
                                                        className="px-3 py-1.5 flex items-center justify-center gap-1.5 text-[9px] font-black uppercase text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all border border-blue-100"
                                                    >
                                                        <span className="material-symbols-outlined text-[14px]">edit</span>
                                                        <span className="hidden sm:inline">Edit</span>
                                                    </button>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); if (confirm('Delete Stage: Permanently delete this stage?')) deleteStageMutation.mutate({ params: { stageId: stage.id } }); }}
                                                        className="px-3 py-1.5 flex items-center justify-center gap-1.5 text-[9px] font-black uppercase text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-all border border-red-100"
                                                    >
                                                        <span className="material-symbols-outlined text-[14px]">delete</span>
                                                        <span className="hidden sm:inline">Delete</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            {stages.length === 0 && (
                                <div className="py-20 text-center bg-blue-50/50 rounded-[3rem] border-2 border-dashed border-blue-100">
                                    <span className="material-symbols-outlined text-3xl text-blue-200 mb-2">account_tree</span>
                                    <p className="text-[9px] font-black text-blue-300 uppercase tracking-[0.3em]">No stages defined</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── Ticket Requirements ── */}
                    <TicketRequirementsPanel applicationId={id as string} tickets={application?.Tickets || []} refetch={refetch} />

                    {/* ── Applicant Exam Performance & Scores Table ── */}
                    <ApplicantExamScoresTable
                        tickets={application?.Tickets || []}
                        examAttempts={application?.ExamAttempts || []}
                        courses={coursesList}
                    />
                </div>

                {/* Applicant Overview Sidebar */}
                <div className="lg:col-span-4 space-y-8">
                    {/* Bio Card */}
                    <div className="bg-white p-10 rounded-[2.5rem] border border-blue-100 shadow-2xl shadow-blue-900/5">
                        <div className="flex items-center gap-4 mb-8 pb-4 border-b border-blue-50">
                            <span className="material-symbols-outlined text-blue-900">badge</span>
                            <h3 className="text-[10px] font-black text-blue-900 uppercase tracking-[0.2em]">Applicant Profile</h3>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-16 h-16 rounded-2xl bg-blue-900 flex items-center justify-center text-white text-2xl font-black italic shadow-2xl shadow-blue-900/10">
                                    {user?.fullName?.charAt(0)}
                                </div>
                                <div>
                                    <p className="text-sm font-black uppercase tracking-tight text-blue-900">{user?.fullName}</p>
                                    <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">{user?.email}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-6">
                                <DataItem label="Nationality" value={user?.nationality} />
                                <DataItem label="Gender" value={user?.gender} />
                                <DataItem label="Date of Birth" value={user?.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : 'N/A'} />
                                <DataItem label="Phone Number" value={user?.phoneNumber} />
                                <div className="col-span-1">
                                    <DataItem label="Residential Address" value={user?.address} />
                                </div>
                            </div>

                            <div className="pt-8 border-t border-blue-50">
                                {user?.cvUrl ? (
                                    <a
                                        href={user.cvUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full py-4 bg-white border-2 border-blue-900 text-blue-900 rounded-xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-blue-50 transition-all flex items-center justify-center gap-3 shadow-xl shadow-blue-900/5 active:scale-95"
                                    >
                                        <span className="material-symbols-outlined text-base font-bold">description</span>
                                        View Resume
                                    </a>
                                ) : (
                                    <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 text-center">
                                        <p className="text-[8px] font-black text-amber-600 uppercase tracking-widest">No resume detected</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Internal Ops Card */}
                    <div className="bg-white p-10 rounded-[2.5rem] border border-blue-100 shadow-2xl shadow-blue-900/5">
                        <div className="flex items-center gap-4 mb-8 pb-4 border-b border-blue-50">
                            <span className="material-symbols-outlined text-blue-900">settings_input_component</span>
                            <h3 className="text-[10px] font-black text-blue-900 uppercase tracking-[0.2em]">Process Status</h3>
                        </div>

                        {application.visaSponsorshipStatus && (
                            <div className="p-5 bg-blue-50/50 rounded-2xl border border-blue-100 mb-6">
                                <h4 className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-3">Visa Sponsorship Request</h4>
                                <div className="flex items-center justify-between mb-4">
                                    <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border ${
                                        application.visaSponsorshipStatus === 'Pending' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                                        application.visaSponsorshipStatus === 'Approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                                        'bg-red-50 text-red-600 border-red-200'
                                    }`}>
                                        {application.visaSponsorshipStatus}
                                    </span>
                                </div>
                                {application.visaSponsorshipStatus === 'Pending' && (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => { if (confirm('Approve visa sponsorship request?')) visaSponsorshipMutation.mutate({ data: { status: 'Approved' } }) }}
                                            disabled={visaSponsorshipMutation.isPending}
                                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-black uppercase tracking-widest py-3 rounded-xl transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50"
                                        >
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => { if (confirm('Reject visa sponsorship request?')) visaSponsorshipMutation.mutate({ data: { status: 'Rejected' } }) }}
                                            disabled={visaSponsorshipMutation.isPending}
                                            className="flex-1 bg-white hover:bg-red-50 text-red-600 border-2 border-red-100 hover:border-red-200 text-[9px] font-black uppercase tracking-widest py-3 rounded-xl transition-all disabled:opacity-50"
                                        >
                                            Reject
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="bg-blue-900 p-10 rounded-[3rem] text-white shadow-2xl shadow-blue-900/20">
                        <div className="flex flex-col gap-2">
                            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-blue-500">Log Timestamp</span>
                            <span className="text-xs font-bold uppercase">{new Date(application.createdAt).toLocaleString()}</span>
                            <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center text-[8px] font-black uppercase tracking-widest opacity-60">
                                <span>Application ID {id}</span>
                                <span>SSL Secure</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stage Addition/Edit Modal */}
            {(showAddStage || editingStage) && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-8">
                    <div className="absolute inset-0 bg-blue-900/80 backdrop-blur-xl animate-in fade-in duration-500" onClick={() => { setShowAddStage(false); setEditingStage(null); }}></div>
                    <div className="relative bg-white rounded-[3rem] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-300">
                        <div className="p-10 border-b border-blue-50 flex items-center justify-between shrink-0">
                            <div>
                                <h3 className="text-xs font-black text-blue-900 uppercase tracking-[0.3em]">{editingStage ? 'Edit Stage' : 'Add New Stage'}</h3>
                                <p className="text-[9px] font-bold text-blue-400 uppercase mt-1">Configuring application process stage</p>
                            </div>
                            <button onClick={() => { setShowAddStage(false); setEditingStage(null); }} className="w-10 h-10 rounded-xl hover:bg-blue-50 text-blue-400 hover:text-blue-900 transition-all flex items-center justify-center">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <form onSubmit={handleSaveStage} className="p-10 space-y-8 overflow-y-auto custom-scrollbar">
                            <div className="space-y-2">
                                <label className="block text-[9px] font-black text-blue-400 uppercase tracking-widest">Stage Type</label>
                                <select
                                    required
                                    value={prefillStageId}
                                    onChange={(e) => setPrefillStageId(Number(e.target.value))}
                                    className="w-full px-6 py-4 bg-blue-50 border border-transparent rounded-2xl text-sm font-bold text-blue-900 focus:bg-white focus:border-blue-900 outline-none transition-all"
                                >
                                    <option value="" disabled>Select Applicant Display Stage</option>
                                    {prefillStages.map((s: any) => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="block text-[9px] font-black text-blue-400 uppercase tracking-widest">Stage Status</label>
                                <select
                                    required
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    className="w-full px-6 py-4 bg-blue-50 border border-transparent rounded-2xl text-sm font-bold text-blue-900 focus:bg-white focus:border-blue-900 outline-none transition-all"
                                >
                                    <option value="pending">Pending</option>
                                    <option value="completed">Completed</option>
                                    <option value="failed">Failed</option>
                                    <option value="approved">Approved</option>
                                    <option value="rejected">Rejected</option>
                                </select>
                            </div>
                            <button
                                type="submit"
                                disabled={addStageMutation.isPending || updateStageMutation.isPending}
                                className="w-full py-5 bg-blue-900 text-white font-black text-[10px] uppercase tracking-[0.4em] rounded-2xl hover:bg-black transition-all shadow-2xl shadow-blue-900/20 disabled:opacity-50 active:scale-95"
                            >
                                {addStageMutation.isPending || updateStageMutation.isPending ? 'Loading...' : 'Save Stage Configuration'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Proof Verification Modal */}
            {verifyingPayment && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8">
                    <div className="absolute inset-0 bg-blue-900/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setVerifyingPayment(null)}></div>
                    <div className="relative bg-white rounded-[2.5rem] shadow-2xl shadow-blue-900/20 w-full max-w-5xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
                        {/* Header */}
                        <div className="p-6 md:px-10 md:py-8 border-b border-blue-50 flex items-center justify-between bg-white/50 shrink-0">
                            <div>
                                <h3 className="text-xs font-black text-blue-900 uppercase tracking-[0.3em]">Payment Verification</h3>
                                <p className="text-[10px] font-bold text-blue-400 uppercase mt-1">Reviewing visual proof of transaction</p>
                            </div>
                            <button onClick={() => setVerifyingPayment(null)} className="w-10 h-10 rounded-full hover:bg-blue-50 text-blue-400 hover:text-blue-900 transition-all flex items-center justify-center border border-transparent hover:border-blue-100">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        
                        {/* Content Area */}
                        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                            {/* Receipt Viewer Column */}
                            <div className="flex-1 bg-blue-50/30 p-6 md:p-10 flex items-start justify-center overflow-y-auto custom-scrollbar border-b md:border-b-0 md:border-r border-blue-50">
                                {verifyingPayment.proofUrl ? (
                                    <img
                                        src={verifyingPayment.proofUrl}
                                        alt="Payment Proof"
                                        className="max-w-full h-auto rounded-2xl shadow-xl shadow-blue-900/10 border border-blue-100"
                                    />
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-blue-200 mt-20 md:mt-0">
                                        <span className="material-symbols-outlined text-6xl mb-4">image_not_supported</span>
                                        <p className="text-[10px] uppercase font-black tracking-[0.3em]">No receipt detected</p>
                                    </div>
                                )}
                            </div>
                            
                            {/* Actions Column */}
                            <div className="w-full md:w-[380px] p-6 md:p-10 bg-white flex flex-col shrink-0 overflow-y-auto custom-scrollbar">
                                <div className="space-y-8 flex-1">
                                    <div>
                                        <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-1.5">Target Requirement</p>
                                        <p className="text-sm font-bold text-blue-900 uppercase">{verifyingPayment.JobStage?.name || 'Application Stage'}</p>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-6 bg-blue-50/50 p-6 rounded-[1.5rem] border border-blue-50">
                                        <div>
                                            <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-1">Expected Amount</p>
                                            <p className="text-2xl font-black text-blue-900">${verifyingPayment.amount}</p>
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-1">Currency</p>
                                            <p className="text-2xl font-black text-blue-900">{verifyingPayment.currency}</p>
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-2">Current Status</p>
                                        <span className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                                            verifyingPayment.status === 'Paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                            verifyingPayment.status === 'Rejected' ? 'bg-red-50 text-red-600 border-red-100' :
                                            'bg-amber-50 text-amber-600 border-amber-100'
                                        }`}>
                                            {verifyingPayment.status}
                                        </span>
                                    </div>
                                </div>
                                
                                {/* Buttons at bottom */}
                                <div className="mt-10 flex flex-col gap-3 pt-6 border-t border-blue-50">
                                    <button
                                        onClick={() => { if (confirm('Approve Payment: Confirm payment and advance application?')) verifyPaymentMutation.mutate({ params: { paymentId: verifyingPayment.id }, data: { isApproved: true } }); }}
                                        disabled={verifyPaymentMutation.isPending || verifyingPayment.status === 'Paid'}
                                        className="w-full py-4 bg-emerald-600 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-900/20 active:scale-95 disabled:opacity-50 disabled:active:scale-100"
                                    >
                                        {verifyPaymentMutation.isPending ? 'Processing...' : 'Approve Payment'}
                                    </button>
                                    <button
                                        onClick={() => {
                                            const note = prompt('Specify rejection details (required):');
                                            if (note) verifyPaymentMutation.mutate({ params: { paymentId: verifyingPayment.id }, data: { isApproved: false, note } });
                                        }}
                                        disabled={verifyPaymentMutation.isPending || verifyingPayment.status === 'Paid'}
                                        className="w-full py-4 bg-white text-red-500 border-2 border-red-100 font-black text-[10px] uppercase tracking-[0.2em] rounded-xl hover:bg-red-50 hover:border-red-200 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100"
                                    >
                                        Reject & Request Redo
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>

    );
}
