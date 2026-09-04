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
    const [showCatalogModal, setShowCatalogModal] = useState(false);
    const [selectedCatalogIds, setSelectedCatalogIds] = useState<Set<number>>(new Set());
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState<number | null>(null);
    const [errMsg, setErrMsg] = useState<string | null>(null);

    // Edit single existing ticket modal state
    const [editTicket, setEditTicket] = useState<TicketReq | null>(null);
    const [editRealPrice, setEditRealPrice] = useState('');
    const [editSubsidisedPrice, setEditSubsidisedPrice] = useState('');
    const [editCanApply, setEditCanApply] = useState(false);
    const [editCourseId, setEditCourseId] = useState('');

    const { data: catalogRes } = useApiQuery<{ success: boolean; data: any[] }>(['admin-ticket-catalogs'], '/ticket-catalogs');
    const { data: coursesRes } = useApiQuery<{ success: boolean; data: any[] }>(['admin-courses'], '/courses');
    const catalogs = catalogRes?.data || [];
    const courses = coursesRes?.data || [];

    // Existing ticket catalog IDs or ticketType names already assigned to this application
    const existingTicketTypes = new Set(
        tickets.map(t => (t.ticketType || '').toLowerCase().trim())
    );

    const toggleCatalogSelection = (catId: number) => {
        setSelectedCatalogIds(prev => {
            const next = new Set(prev);
            if (next.has(catId)) next.delete(catId);
            else next.add(catId);
            return next;
        });
    };

    const openCatalogModal = () => {
        setSelectedCatalogIds(new Set());
        setErrMsg(null);
        setShowCatalogModal(true);
    };

    const handleAddSelectedGaps = async () => {
        if (selectedCatalogIds.size === 0) {
            setErrMsg('Please check at least one ticket catalogue item to add as a gap.');
            return;
        }
        setSaving(true);
        setErrMsg(null);
        try {
            const payload = Array.from(selectedCatalogIds).map(catId => ({ catalogId: catId }));
            await api.post(`/admin/applications/${applicationId}/tickets/batch`, { tickets: payload });
            setShowCatalogModal(false);
            setSelectedCatalogIds(new Set());
            refetch();
        } catch (err: any) {
            setErrMsg(err.response?.data?.message || 'Failed to add ticket gaps.');
        } finally {
            setSaving(false);
        }
    };

    const openEdit = (t: TicketReq) => {
        setEditTicket(t);
        setEditRealPrice(t.realPrice?.toString() || '');
        setEditSubsidisedPrice(t.subsidisedPrice?.toString() || '');
        setEditCanApply(t.canApplySponsorship || false);
        setEditCourseId(t.courseId || '');
        setErrMsg(null);
    };

    const handleSaveEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editTicket) return;
        setSaving(true);
        setErrMsg(null);
        try {
            await api.put(`/admin/tickets/${editTicket.id}`, {
                realPrice: editRealPrice ? parseFloat(editRealPrice) : null,
                subsidisedPrice: editSubsidisedPrice ? parseFloat(editSubsidisedPrice) : null,
                canApplySponsorship: editCanApply,
                courseId: editCourseId || null
            });
            setEditTicket(null);
            refetch();
        } catch (err: any) {
            setErrMsg(err.response?.data?.message || 'Failed to update ticket.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (ticketId: number) => {
        if (!confirm('Delete this ticket requirement gap? This cannot be undone.')) return;
        setDeleting(ticketId);
        try {
            await api.delete(`/admin/tickets/${ticketId}`);
            refetch();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to delete ticket.');
        } finally {
            setDeleting(null);
        }
    };

    return (
        <div className="bg-white p-8 rounded-[2.5rem] border border-blue-100 shadow-2xl shadow-blue-900/5">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-blue-50 flex-wrap gap-3">
                <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-blue-900">confirmation_number</span>
                    <div>
                        <h3 className="text-[10px] font-black text-blue-900 uppercase tracking-[0.2em]">Applicant Ticket Gaps</h3>
                        <p className="text-[9px] font-bold text-blue-400 uppercase mt-0.5">Select catalogue tickets to assign as gaps for coursework & exams</p>
                    </div>
                    <span className="bg-blue-100 text-blue-800 text-[9px] font-black px-2.5 py-0.5 rounded-full">{tickets.length}</span>
                </div>
                <button
                    onClick={openCatalogModal}
                    className="bg-blue-900 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all flex items-center gap-2 shadow-lg shadow-blue-900/10"
                >
                    <span className="material-symbols-outlined text-base">add_task</span> Select Ticket Gaps from Catalogue
                </button>
            </div>
            
            {tickets.length > 0 && (
                <div className="mb-4 flex items-center justify-between bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-900">Total Ticket Gaps Cost</span>
                    <div className="text-right">
                        <span className="text-sm font-black text-blue-900">${tickets.reduce((sum, t) => sum + (t.subsidisedPrice != null ? t.subsidisedPrice : (t.realPrice || 0)), 0).toFixed(2)}</span>
                        {tickets.some(t => t.subsidisedPrice != null && t.realPrice != null && t.realPrice > t.subsidisedPrice) && (
                            <span className="block text-[9px] text-slate-500 line-through">Original: ${tickets.reduce((sum, t) => sum + (t.realPrice || 0), 0).toFixed(2)}</span>
                        )}
                    </div>
                </div>
            )}

            {tickets.length === 0 ? (
                <div className="py-12 text-center bg-slate-50/50 rounded-2xl border-2 border-dashed border-blue-100">
                    <span className="material-symbols-outlined text-4xl text-blue-300 mb-2 block">playlist_add_check</span>
                    <p className="text-[10px] font-black text-blue-900 uppercase tracking-[0.2em] mb-1">No ticket gaps assigned yet</p>
                    <p className="text-[9px] text-slate-400 mb-4 max-w-sm mx-auto">Select tickets from the standardized catalogue to create ticket gaps so the applicant can complete coursework and exams.</p>
                    <button
                        onClick={openCatalogModal}
                        className="bg-blue-900 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all inline-flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-sm">add_task</span> Check Off Catalogue Ticket Gaps
                    </button>
                </div>
            ) : (
                <div className="space-y-3">
                    {tickets.map(t => {
                        const s = SPONS_MAP[t.ticketSponsorship] ?? SPONS_MAP.no_application;
                        const linkedCourse = courses.find((c: any) => c.id === t.courseId);
                        return (
                            <div key={t.id} className="flex items-start justify-between gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-blue-200 transition-all">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap mb-1">
                                        <p className="text-xs font-black text-blue-900">{t.ticketType}</p>
                                        <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${s.cls}`}>{s.label}</span>
                                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${t.status === 'possessed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-800 border-amber-200'}`}>
                                            {t.status === 'possessed' ? 'Possessed' : 'Ticket Gap (Required)'}
                                        </span>
                                        {t.canApplySponsorship && <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest bg-violet-50 text-violet-700 border border-violet-200">Sponsorship Eligible</span>}
                                    </div>
                                    {t.description && <p className="text-[10px] text-slate-500 mb-1">{t.description}</p>}
                                    <div className="flex items-center gap-3 mt-1.5 flex-wrap text-[10px]">
                                        {(t.subsidisedPrice != null || t.realPrice != null) && (
                                            <span className="font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                                                Price: ${t.subsidisedPrice ?? t.realPrice}
                                                {t.subsidisedPrice != null && t.realPrice != null && t.realPrice > t.subsidisedPrice && (
                                                    <span className="line-through text-slate-400 ml-1 font-normal">${t.realPrice}</span>
                                                )}
                                            </span>
                                        )}
                                        {linkedCourse ? (
                                            <span className="font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                                                <span className="material-symbols-outlined text-[12px]">menu_book</span>
                                                Course & Exam Linked: {linkedCourse.code ? `[${linkedCourse.code}] ` : ''}{linkedCourse.title}
                                            </span>
                                        ) : t.courseId ? (
                                            <span className="text-slate-400">Linked Course ID: {t.courseId}</span>
                                        ) : (
                                            <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded text-[9px] font-bold">No Linked Course</span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1.5 flex-shrink-0">
                                    <button onClick={() => openEdit(t)} className="text-[9px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-all flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[12px]">edit</span> Edit
                                    </button>
                                    <button onClick={() => handleDelete(t.id)} disabled={deleting === t.id} className="text-[9px] font-black uppercase tracking-widest text-red-500 bg-red-50 border border-red-100 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-all flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[12px]">delete</span>{deleting === t.id ? '...' : ' Delete'}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Checkbox Catalogue Selection Modal */}
            {showCatalogModal && (
                <div className="fixed inset-0 z-50 bg-blue-950/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl border border-blue-100 max-h-[90vh] flex flex-col">
                        <div className="flex items-center justify-between pb-4 border-b border-blue-50 flex-shrink-0">
                            <div>
                                <span className="text-[9px] font-black uppercase tracking-widest text-blue-400 block mb-0.5">Standardized Catalogue</span>
                                <h2 className="text-lg font-bold text-blue-900">Select Ticket Gaps for Applicant</h2>
                                <p className="text-[10px] text-slate-500 mt-0.5">Check off the certifications required as ticket gaps. Courses and exam questions are auto-linked on creation.</p>
                            </div>
                            <button onClick={() => setShowCatalogModal(false)} className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        {errMsg && (
                            <div className="my-3 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-[10px] font-bold uppercase tracking-widest flex-shrink-0">
                                {errMsg}
                            </div>
                        )}

                        <div className="flex-1 overflow-y-auto py-4 space-y-2 pr-1">
                            {catalogs.length === 0 ? (
                                <p className="text-[10px] text-slate-400 text-center py-8">No catalogue tickets available.</p>
                            ) : (
                                catalogs.map((cat: any) => {
                                    const isAlreadyAssigned = existingTicketTypes.has((cat.name || '').toLowerCase().trim());
                                    const isChecked = selectedCatalogIds.has(cat.id);
                                    
                                    // Match linked course by unit code or title keyword
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

                                    return (
                                        <div
                                            key={cat.id}
                                            role="button"
                                            tabIndex={0}
                                            onClick={() => !isAlreadyAssigned && toggleCatalogSelection(cat.id)}
                                            className={`flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer ${
                                                isAlreadyAssigned
                                                    ? 'bg-slate-100 border-slate-200 opacity-65 cursor-not-allowed'
                                                    : isChecked
                                                    ? 'bg-blue-900 border-blue-900 text-white shadow-md'
                                                    : 'bg-white border-blue-100 hover:border-blue-300 text-blue-900'
                                            }`}
                                        >
                                            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                                                isAlreadyAssigned
                                                    ? 'bg-slate-300 border-slate-300 text-slate-600'
                                                    : isChecked
                                                    ? 'bg-white border-white text-blue-900'
                                                    : 'border-blue-300 bg-white'
                                            }`}>
                                                {(isChecked || isAlreadyAssigned) && (
                                                    <span className="material-symbols-outlined text-sm font-black">check</span>
                                                )}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <p className={`text-xs font-black leading-tight ${isChecked && !isAlreadyAssigned ? 'text-white' : 'text-blue-900'}`}>
                                                        {cat.name}
                                                    </p>
                                                    {isAlreadyAssigned && (
                                                        <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[8px] font-black uppercase tracking-wider">
                                                            Already Added Gap
                                                        </span>
                                                    )}
                                                </div>
                                                {cat.description && (
                                                    <p className={`text-[9px] mt-0.5 truncate ${isChecked && !isAlreadyAssigned ? 'text-blue-200' : 'text-slate-500'}`}>
                                                        {cat.description}
                                                    </p>
                                                )}
                                                <div className="flex items-center gap-3 mt-1.5 flex-wrap text-[9px]">
                                                     <span className={`font-bold ${isChecked && !isAlreadyAssigned ? 'text-blue-100' : 'text-blue-900'}`}>
                                                         Normal Price: ${cat.normalPrice || 0} AUD (Applicant subsidy applies)
                                                     </span>
                                                    {matchedCourse && (
                                                        <span className={`px-2 py-0.5 rounded font-black text-[8px] uppercase tracking-wider ${
                                                            isChecked && !isAlreadyAssigned
                                                                ? 'bg-blue-800 text-blue-100 border border-blue-700'
                                                                : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                                        }`}>
                                                            Course & Exam Auto-Linked: {matchedCourse.code ? `[${matchedCourse.code}] ` : ''}{matchedCourse.title}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        <div className="pt-4 border-t border-blue-50 flex items-center justify-between flex-shrink-0">
                            <span className="text-[10px] font-bold text-slate-500">
                                Selected: <strong className="text-blue-900">{selectedCatalogIds.size}</strong> ticket gaps
                            </span>
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowCatalogModal(false)}
                                    className="px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:bg-slate-100"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleAddSelectedGaps}
                                    disabled={saving || selectedCatalogIds.size === 0}
                                    className="bg-blue-900 hover:bg-black text-white px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-900/10 disabled:opacity-50 transition-all flex items-center gap-2"
                                >
                                    {saving ? 'Adding Gaps...' : `Add Selected Ticket Gaps (${selectedCatalogIds.size})`}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Ticket Requirement Modal */}
            {editTicket && (
                <div className="fixed inset-0 z-50 bg-blue-950/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-blue-100">
                        <div className="flex items-center justify-between mb-4 pb-3 border-b border-blue-50">
                            <h2 className="text-sm font-bold text-blue-900">Edit Ticket Requirement Details</h2>
                            <button onClick={() => setEditTicket(null)} className="text-slate-400 hover:text-slate-600">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        {errMsg && <div className="mb-3 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-[10px] font-bold uppercase">{errMsg}</div>}
                        <form onSubmit={handleSaveEdit} className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-blue-900 mb-1">Ticket Title</label>
                                <input type="text" disabled value={editTicket.ticketType} className="w-full bg-slate-100 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-600 font-bold" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-blue-900 mb-1">Real Price ($)</label>
                                    <input type="number" step="0.01" value={editRealPrice} onChange={e => setEditRealPrice(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-blue-900 font-bold" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-blue-900 mb-1">Subsidised Price ($)</label>
                                    <input type="number" step="0.01" value={editSubsidisedPrice} onChange={e => setEditSubsidisedPrice(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-emerald-700 font-bold" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-blue-900 mb-1">Linked Course</label>
                                <select value={editCourseId} onChange={e => setEditCourseId(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-blue-900 font-medium">
                                    <option value="">-- Select Linked Course --</option>
                                    {courses.map((cr: any) => (
                                        <option key={cr.id} value={cr.id}>
                                            {cr.code ? `[${cr.code}] ` : ''}{cr.title}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl border border-blue-100">
                                <span className="text-xs font-bold text-blue-900">Sponsorship Eligible</span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" checked={editCanApply} onChange={e => setEditCanApply(e.target.checked)} className="sr-only peer" />
                                    <div className="w-9 h-5 bg-slate-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-900" />
                                </label>
                            </div>
                            <div className="flex items-center justify-end gap-3 pt-2">
                                <button type="button" onClick={() => setEditTicket(null)} className="px-4 py-2 rounded-xl text-[10px] font-bold uppercase text-slate-500">Cancel</button>
                                <button type="submit" disabled={saving} className="bg-blue-900 text-white px-4 py-2 rounded-xl text-[10px] font-bold uppercase shadow-lg">Save Changes</button>
                            </div>
                        </form>
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
    const [stageName, setStageName] = useState<string>('');
    const [status, setStatus] = useState('pending');
    const [verifyingPayment, setVerifyingPayment] = useState<any>(null);

    // Cron Trigger State
    const [selectedCron, setSelectedCron] = useState<string>('application');

    const { data: application, isLoading, error, refetch } = useApiQuery<any>(
        ['admin', 'applications', `${id}`],
        `/admin/applications/${id}`,
        { enabled: !!id }
    );



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

    const updateSubsidyMutation = useApiMutation(
        'put',
        `/admin/users/${application?.User?.id}/subsidy-percentage`,
        {
            onSuccess: () => refetch()
        }
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

    const triggerCronMutation = useApiMutation(
        'post',
        '/admin/crons/trigger',
        {
            onSuccess: (data: any) => {
                alert(`Success: ${data.message || 'Cron triggered'}`);
                refetch();
            },
            onError: (err: any) => {
                alert(`Error: ${err.response?.data?.message || 'Failed to trigger cron'}`);
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
        setStageName('');
        setStatus('pending');
    };

    const handleSaveStage = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            name: stageName || 'Application',
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
        setStageName(stage.name || '');
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
                <div className="flex flex-wrap items-center gap-3">
                    <span className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-xl border ${application.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                        application.status === 'COMPLETED' ? 'bg-blue-900 text-white shadow-lg shadow-blue-900/10' :
                            'bg-blue-100 text-blue-600'
                        }`}>
                        {application.status}
                    </span>
                    <Link
                        href={`/admin/nominations?applicantId=${user?.id || ''}`}
                        className="bg-purple-50 text-purple-700 border border-purple-100 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-purple-100 transition-all flex items-center gap-2 active:scale-95"
                    >
                        <span className="material-symbols-outlined text-sm font-bold">assignment_ind</span>
                        Nomination
                    </Link>
                    <Link
                        href={`/admin/contracts?applicantId=${user?.id || ''}`}
                        className="bg-amber-50 text-amber-700 border border-amber-100 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-amber-100 transition-all flex items-center gap-2 active:scale-95"
                    >
                        <span className="material-symbols-outlined text-sm font-bold">contract</span>
                        Contract
                    </Link>
                    <Link
                        href={`/admin/mail?to=${encodeURIComponent(user?.email || '')}&applicantId=${user?.id || ''}`}
                        className="bg-indigo-50 text-indigo-700 border border-indigo-100 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-indigo-100 transition-all flex items-center gap-2 active:scale-95"
                    >
                        <span className="material-symbols-outlined text-sm font-bold">mail</span>
                        Email Applicant
                    </Link>
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
                                                        {stage.name || 'Unnamed Stage'}
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
                                <div className="col-span-1 bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                                    <label className="block text-[8px] font-black uppercase tracking-[0.2em] text-blue-400 mb-1">Subsidy Percentage</label>
                                    <div className="flex items-center gap-2">
                                        <input 
                                            type="number" 
                                            defaultValue={user?.subsidyPercentage ?? 70} 
                                            onBlur={(e) => {
                                                const val = parseInt(e.target.value);
                                                if (val >= 0 && val <= 100 && val !== user?.subsidyPercentage) {
                                                    updateSubsidyMutation.mutate({ data: { subsidyPercentage: val } });
                                                }
                                            }}
                                            className="w-20 bg-white border border-blue-200 rounded p-1.5 text-xs font-bold text-blue-900 text-center" 
                                            min="0" max="100" 
                                        />
                                        <span className="text-xs font-bold text-blue-900">%</span>
                                        {updateSubsidyMutation.isPending && <span className="text-[9px] text-amber-600 animate-pulse ml-2 font-bold">Saving...</span>}
                                    </div>
                                    <p className="text-[8px] text-slate-400 mt-1">Click outside to save</p>
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

                        {/* System Overrides (Cron Triggers) */}
                        <div className="p-5 bg-slate-50/50 rounded-2xl border border-slate-200 mb-6">
                            <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <span className="material-symbols-outlined text-[14px]">bolt</span>
                                System Overrides (Force Execution)
                            </h4>
                            <p className="text-[9px] text-slate-400 mb-4 leading-relaxed">
                                Manually trigger background processes for this applicant, bypassing standard time delays (e.g. 1-hour waits).
                            </p>
                            <div className="space-y-3">
                                <select 
                                    value={selectedCron} 
                                    onChange={(e) => setSelectedCron(e.target.value)}
                                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-[10px] font-bold text-slate-700 uppercase tracking-widest outline-none focus:border-slate-400 transition-colors"
                                >
                                    <option value="application">Application Auto-Accept</option>
                                    <option value="nomination">Nomination Followup</option>
                                    <option value="sponsorship">Sponsorship Auto-Approve</option>
                                    <option value="contract">Contract Auto-Approve</option>
                                    <option value="aveling-welcome">Aveling Welcome Mail</option>
                                    <option value="aveling-delivery">Aveling Ticket Delivery</option>
                                    <option value="psychometric">Psychometric Approval</option>
                                </select>
                                
                                <button
                                    onClick={() => {
                                        if (confirm(`Force execute '${selectedCron}' process for this applicant? This will bypass time restrictions and execute the action immediately if the state matches.`)) {
                                            triggerCronMutation.mutate({ data: { applicantId: user.id, cronName: selectedCron } });
                                        }
                                    }}
                                    disabled={triggerCronMutation.isPending}
                                    className="w-full bg-slate-800 hover:bg-black text-white text-[9px] font-black uppercase tracking-widest py-3 rounded-xl transition-all shadow-lg shadow-slate-900/10 flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    <span className="material-symbols-outlined text-[14px]">play_circle</span>
                                    {triggerCronMutation.isPending ? 'Executing...' : 'Force Execute Process'}
                                </button>
                            </div>
                        </div>
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
