'use client';

import React, { useState } from 'react';
import { useApiQuery } from '@/lib/hooks';
import api from '@/lib/api';
import Link from 'next/link';

interface InterviewApplicant {
    id: number;
    fullName: string;
    email: string;
    candidateNumber?: string;
    phoneNumber?: string;
    canPickSchedule?: boolean;
}

interface ScheduleSlot {
    id: number;
    date: string;
    time: string;
    isBooked: boolean;
}

interface InterviewItem {
    id: number;
    scheduleCatalogueId: number;
    applicantId: number;
    overview: string | null;
    outcome: 'Pending' | 'Passed' | 'Failed' | 'Completed' | 'Rescheduled';
    meetingLink: string | null;
    createdAt?: string;
    updatedAt?: string;
    selectedSchedule?: ScheduleSlot;
    applicant?: InterviewApplicant;
}

export default function AdminInterviewsPage() {
    const { data: interviewsRes, isLoading, refetch } = useApiQuery<{ success: boolean; data: InterviewItem[]; count: number }>(
        ['admin-interviews'],
        '/admin/interviews'
    );
    const interviews = interviewsRes?.data || [];

    // Also fetch available schedule slots for assignment
    const { data: availableSlotsRes, refetch: refetchAvailableSlots } = useApiQuery<{ success: boolean; data: ScheduleSlot[] }>(
        ['admin-available-schedules'],
        '/schedule-catalogues?availableOnly=true'
    );
    const availableSlots = availableSlotsRes?.data || [];

    // Also fetch applicants for manual interview creation
    const { data: applicantsRes } = useApiQuery<{ rows: InterviewApplicant[] }>(
        ['admin-users-all'],
        '/admin/users'
    );
    const allApplicants = applicantsRes?.rows || [];

    // Filter states
    const [outcomeFilter, setOutcomeFilter] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');

    // Edit Modal states
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedInterview, setSelectedInterview] = useState<InterviewItem | null>(null);
    const [editOverview, setEditOverview] = useState('');
    const [editOutcome, setEditOutcome] = useState<'Pending' | 'Passed' | 'Failed' | 'Completed' | 'Rescheduled'>('Pending');
    const [editMeetingLink, setEditMeetingLink] = useState('');
    const [editScheduleId, setEditScheduleId] = useState<number | ''>('');
    const [isSavingEdit, setIsSavingEdit] = useState(false);

    // Create Modal states
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [createApplicantId, setCreateApplicantId] = useState<number | ''>('');
    const [createScheduleId, setCreateScheduleId] = useState<number | ''>('');
    const [createOverview, setCreateOverview] = useState('');
    const [createMeetingLink, setCreateMeetingLink] = useState('');
    const [createOutcome, setCreateOutcome] = useState<'Pending' | 'Passed' | 'Failed' | 'Completed' | 'Rescheduled'>('Pending');
    const [isCreating, setIsCreating] = useState(false);

    // Open Edit Modal
    const handleOpenEdit = (interview: InterviewItem) => {
        setSelectedInterview(interview);
        setEditOverview(interview.overview || '');
        setEditOutcome(interview.outcome);
        setEditMeetingLink(interview.meetingLink || '');
        setEditScheduleId(interview.scheduleCatalogueId);
        setIsEditModalOpen(true);
    };

    // Save Edit
    const handleSaveEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedInterview) return;

        setIsSavingEdit(true);
        try {
            await api.put(`/admin/interviews/${selectedInterview.id}`, {
                overview: editOverview,
                outcome: editOutcome,
                meetingLink: editMeetingLink,
                scheduleCatalogueId: editScheduleId || undefined,
            });
            alert('Interview updated successfully.');
            setIsEditModalOpen(false);
            refetch();
            refetchAvailableSlots();
        } catch (err: any) {
            alert(err.response?.data?.error || 'Failed to update interview.');
        } finally {
            setIsSavingEdit(false);
        }
    };

    // Create Interview manually
    const handleCreateInterview = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!createApplicantId || !createScheduleId) {
            alert('Please select both an applicant and an available schedule slot.');
            return;
        }

        setIsCreating(true);
        try {
            await api.post('/admin/interviews', {
                applicantId: Number(createApplicantId),
                scheduleCatalogueId: Number(createScheduleId),
                overview: createOverview,
                meetingLink: createMeetingLink,
                outcome: createOutcome,
            });
            alert('Interview successfully scheduled.');
            setIsCreateModalOpen(false);
            setCreateApplicantId('');
            setCreateScheduleId('');
            setCreateOverview('');
            setCreateMeetingLink('');
            refetch();
            refetchAvailableSlots();
        } catch (err: any) {
            alert(err.response?.data?.error || 'Failed to create interview.');
        } finally {
            setIsCreating(false);
        }
    };

    // Delete Interview
    const handleDeleteInterview = async (id: number) => {
        if (!confirm('Are you sure you want to delete this interview record? This will cancel the booking and free up the schedule slot.')) return;
        try {
            await api.delete(`/admin/interviews/${id}`);
            alert('Interview deleted and schedule slot freed.');
            refetch();
            refetchAvailableSlots();
        } catch (err: any) {
            alert(err.response?.data?.error || 'Failed to delete interview.');
        }
    };

    // Toggle Applicant canPickSchedule authorization
    const handleToggleAuth = async (userId: number, currentVal?: boolean) => {
        const newVal = !currentVal;
        try {
            await api.put(`/admin/users/${userId}/can-pick-schedule`, { canPickSchedule: newVal });
            refetch();
        } catch (err: any) {
            alert('Failed to update applicant authorization.');
        }
    };

    // Filter calculations
    const filteredInterviews = interviews.filter((item) => {
        const matchesOutcome = outcomeFilter === 'all' || item.outcome === outcomeFilter;
        const q = searchQuery.toLowerCase();
        const matchesQuery =
            !searchQuery ||
            item.applicant?.fullName?.toLowerCase().includes(q) ||
            item.applicant?.email?.toLowerCase().includes(q) ||
            item.applicant?.candidateNumber?.toLowerCase().includes(q) ||
            item.overview?.toLowerCase().includes(q);
        return matchesOutcome && matchesQuery;
    });

    const totalCount = interviews.length;
    const pendingCount = interviews.filter((i) => i.outcome === 'Pending').length;
    const passedCount = interviews.filter((i) => i.outcome === 'Passed').length;
    const failedCount = interviews.filter((i) => i.outcome === 'Failed').length;

    const getOutcomeBadge = (outcome: string) => {
        switch (outcome) {
            case 'Passed':
                return 'bg-emerald-100 text-emerald-800 border-emerald-300';
            case 'Failed':
                return 'bg-rose-100 text-rose-800 border-rose-300';
            case 'Completed':
                return 'bg-blue-100 text-blue-800 border-blue-300';
            case 'Rescheduled':
                return 'bg-purple-100 text-purple-800 border-purple-300';
            default:
                return 'bg-amber-100 text-amber-900 border-amber-300';
        }
    };

    if (isLoading) {
        return <div className="p-12 text-center text-[10px] font-bold uppercase tracking-widest text-blue-400">Loading Interviews Management...</div>;
    }

    return (
        <div className="font-sans antialiased text-blue-900 pb-24">
            {/* Header */}
            <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.2em] block mb-1">
                        Administration &bull; Candidate Evaluation
                    </span>
                    <h1 className="text-3xl font-black text-blue-900 tracking-tight uppercase">
                        Interviews Management
                    </h1>
                    <p className="text-sm text-slate-500 mt-2 max-w-xl">
                        Monitor booked appointments, record interview overviews and evaluation outcomes, and manage candidate scheduling permissions.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Link
                        href="/admin/schedules"
                        className="px-4 py-2.5 rounded-xl border border-blue-200 bg-white hover:bg-blue-50 text-blue-900 font-bold text-xs uppercase tracking-wider transition-all shadow-xs inline-flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-base">calendar_month</span>
                        Manage Catalogue
                    </Link>
                    <button
                        type="button"
                        onClick={() => setIsCreateModalOpen(true)}
                        className="px-5 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-blue-900/10 inline-flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-base">add</span>
                        Schedule Interview
                    </button>
                </div>
            </header>

            {/* Quick Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
                <div className="bg-white p-5 rounded-2xl border border-blue-100 shadow-sm flex items-center justify-between">
                    <div>
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1">
                            Total Interviews
                        </span>
                        <span className="text-2xl font-black text-blue-900">{totalCount}</span>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-900 flex items-center justify-center font-bold">
                        <span className="material-symbols-outlined text-xl">group</span>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-blue-100 shadow-sm flex items-center justify-between">
                    <div>
                        <span className="text-[9px] font-black uppercase tracking-widest text-amber-600 block mb-1">
                            Pending Evaluation
                        </span>
                        <span className="text-2xl font-black text-amber-600">{pendingCount}</span>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                        <span className="material-symbols-outlined text-xl">hourglass_top</span>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-blue-100 shadow-sm flex items-center justify-between">
                    <div>
                        <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600 block mb-1">
                            Passed Candidates
                        </span>
                        <span className="text-2xl font-black text-emerald-600">{passedCount}</span>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                        <span className="material-symbols-outlined text-xl">check_circle</span>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-blue-100 shadow-sm flex items-center justify-between">
                    <div>
                        <span className="text-[9px] font-black uppercase tracking-widest text-rose-600 block mb-1">
                            Failed / Unsuccessful
                        </span>
                        <span className="text-2xl font-black text-rose-600">{failedCount}</span>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center font-bold">
                        <span className="material-symbols-outlined text-xl">cancel</span>
                    </div>
                </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="bg-white p-4 rounded-2xl border border-blue-100 shadow-sm mb-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                <div className="flex items-center gap-1.5 p-1 bg-blue-50/60 rounded-xl overflow-x-auto">
                    {['all', 'Pending', 'Passed', 'Failed', 'Completed', 'Rescheduled'].map((status) => (
                        <button
                            key={status}
                            type="button"
                            onClick={() => setOutcomeFilter(status)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                                outcomeFilter === status
                                    ? 'bg-blue-900 text-white shadow-xs'
                                    : 'text-slate-600 hover:text-blue-900'
                            }`}
                        >
                            {status === 'all' ? `All (${totalCount})` : status}
                        </button>
                    ))}
                </div>

                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search candidate name, email, or ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full sm:w-72 bg-slate-50 border border-blue-100 rounded-xl px-3.5 py-2 text-xs text-blue-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-900 transition-colors"
                    />
                </div>
            </div>

            {/* Interviews Table */}
            <div className="bg-white rounded-3xl border border-blue-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-blue-50/50 text-[10px] font-bold uppercase tracking-widest text-blue-400 border-b border-blue-100">
                            <tr>
                                <th className="p-4 pl-6">Candidate</th>
                                <th className="p-4">Selected Schedule</th>
                                <th className="p-4">Overview / Notes</th>
                                <th className="p-4">Outcome</th>
                                <th className="p-4">Meeting Link</th>
                                <th className="p-4 pr-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-blue-50 font-medium text-slate-700">
                            {filteredInterviews.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-12 text-center text-slate-400 italic">
                                        No interviews found matching your filter criteria.
                                    </td>
                                </tr>
                            ) : (
                                filteredInterviews.map((item) => {
                                    const schedule = item.selectedSchedule;
                                    const formattedDate = schedule?.date
                                        ? new Date(schedule.date + 'T00:00:00').toLocaleDateString(undefined, {
                                              weekday: 'short',
                                              month: 'short',
                                              day: 'numeric',
                                              year: 'numeric',
                                          })
                                        : 'Unscheduled';

                                    return (
                                        <tr key={item.id} className="hover:bg-blue-50/30 transition-colors">
                                            {/* Candidate Info */}
                                            <td className="p-4 pl-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-xl bg-blue-900 text-white font-black flex items-center justify-center text-xs shrink-0">
                                                        {item.applicant?.fullName?.charAt(0) || 'A'}
                                                    </div>
                                                    <div>
                                                        <Link
                                                            href={`/admin/applicants/${item.applicantId}`}
                                                            className="font-bold text-blue-900 hover:underline flex items-center gap-1"
                                                        >
                                                            <span>{item.applicant?.fullName || 'Applicant'}</span>
                                                            <span className="text-[10px] text-blue-400">↗</span>
                                                        </Link>
                                                        <span className="text-[11px] text-slate-400 block">
                                                            {item.applicant?.email}
                                                        </span>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            {item.applicant?.candidateNumber && (
                                                                <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                                                                    #{item.applicant.candidateNumber}
                                                                </span>
                                                            )}
                                                            {/* canPickSchedule badge with quick toggle */}
                                                            <button
                                                                type="button"
                                                                onClick={() => handleToggleAuth(item.applicantId, item.applicant?.canPickSchedule)}
                                                                className={`text-[9px] font-bold px-1.5 py-0.5 rounded border transition-colors ${
                                                                    item.applicant?.canPickSchedule
                                                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                                        : 'bg-slate-100 text-slate-500 border-slate-200'
                                                                }`}
                                                                title="Click to toggle candidate scheduling permission"
                                                            >
                                                                {item.applicant?.canPickSchedule ? '✓ Authorized' : 'Lockout'}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Selected Schedule Slot */}
                                            <td className="p-4">
                                                {schedule ? (
                                                    <div>
                                                        <span className="font-bold text-slate-900 block text-xs">
                                                            📅 {formattedDate}
                                                        </span>
                                                        <span className="text-[11px] text-slate-500 font-semibold">
                                                            ⏰ {schedule.time}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-400 italic">No slot linked</span>
                                                )}
                                            </td>

                                            {/* Overview / Notes */}
                                            <td className="p-4 max-w-xs">
                                                <p className="text-slate-600 text-xs line-clamp-2 leading-relaxed">
                                                    {item.overview || <span className="italic text-slate-400">No overview notes added.</span>}
                                                </p>
                                            </td>

                                            {/* Outcome Status */}
                                            <td className="p-4">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${getOutcomeBadge(item.outcome)}`}>
                                                    {item.outcome}
                                                </span>
                                            </td>

                                            {/* Meeting Link */}
                                            <td className="p-4">
                                                {item.meetingLink ? (
                                                    <a
                                                        href={item.meetingLink}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs font-bold underline"
                                                    >
                                                        <span>Join Call</span>
                                                        <span className="text-[10px]">↗</span>
                                                    </a>
                                                ) : (
                                                    <span className="text-slate-400 italic text-[11px]">Not provided</span>
                                                )}
                                            </td>

                                            {/* Actions */}
                                            <td className="p-4 pr-6 text-right space-x-2">
                                                <button
                                                    type="button"
                                                    onClick={() => handleOpenEdit(item)}
                                                    className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-900 text-[10px] font-bold uppercase tracking-wider transition-colors"
                                                >
                                                    Evaluate / Edit
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteInterview(item.id)}
                                                    className="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 text-[10px] font-bold uppercase tracking-wider transition-colors"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit & Evaluation Modal */}
            {isEditModalOpen && selectedInterview && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-blue-950/60 backdrop-blur-sm animate-in fade-in duration-150">
                    <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-blue-100 shadow-2xl">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
                            <div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-blue-400 block">
                                    Interview Evaluation & Configuration
                                </span>
                                <h3 className="text-lg font-black text-blue-900">
                                    {selectedInterview.applicant?.fullName || 'Candidate Interview'}
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsEditModalOpen(false)}
                                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-xs font-bold"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSaveEdit} className="space-y-4">
                            {/* Current Selected Schedule info & Change Schedule */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Interview Schedule Slot
                                </label>
                                <select
                                    value={editScheduleId}
                                    onChange={(e) => setEditScheduleId(Number(e.target.value))}
                                    className="w-full bg-slate-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-900 focus:outline-none focus:border-blue-900"
                                >
                                    {selectedInterview.selectedSchedule && (
                                        <option value={selectedInterview.selectedSchedule.id}>
                                            Current: {selectedInterview.selectedSchedule.date} at {selectedInterview.selectedSchedule.time}
                                        </option>
                                    )}
                                    {availableSlots
                                        .filter((s) => s.id !== selectedInterview.selectedSchedule?.id)
                                        .map((s) => (
                                            <option key={s.id} value={s.id}>
                                                Change to: {s.date} at {s.time}
                                            </option>
                                        ))}
                                </select>
                            </div>

                            {/* Outcome Selector */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Interview Outcome / Status <span className="text-red-500">*</span>
                                </label>
                                <select
                                    required
                                    value={editOutcome}
                                    onChange={(e) => setEditOutcome(e.target.value as any)}
                                    className="w-full bg-slate-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-900 focus:outline-none focus:border-blue-900 font-bold"
                                >
                                    <option value="Pending">Pending Evaluation</option>
                                    <option value="Passed">Passed (Eligible for Placement)</option>
                                    <option value="Failed">Failed</option>
                                    <option value="Completed">Completed</option>
                                    <option value="Rescheduled">Rescheduled</option>
                                </select>
                            </div>

                            {/* Meeting Link */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Meeting Room Link (Zoom, Teams, or Google Meet)
                                </label>
                                <input
                                    type="url"
                                    placeholder="https://meet.google.com/... or https://zoom.us/j/..."
                                    value={editMeetingLink}
                                    onChange={(e) => setEditMeetingLink(e.target.value)}
                                    className="w-full bg-slate-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-900 focus:outline-none focus:border-blue-900"
                                />
                            </div>

                            {/* Overview & Evaluation Notes */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Interview Overview & Evaluation Notes
                                </label>
                                <textarea
                                    rows={4}
                                    placeholder="Enter interview overview, technical observations, behavioral feedback, or agenda items..."
                                    value={editOverview}
                                    onChange={(e) => setEditOverview(e.target.value)}
                                    className="w-full bg-slate-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-900 focus:outline-none focus:border-blue-900 leading-relaxed"
                                />
                            </div>

                            <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSavingEdit}
                                    className="px-5 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-xs font-black uppercase tracking-wider disabled:opacity-50"
                                >
                                    {isSavingEdit ? 'Saving Changes...' : 'Save Evaluation'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Manual Create Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-blue-950/60 backdrop-blur-sm animate-in fade-in duration-150">
                    <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-blue-100 shadow-2xl">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
                            <div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-blue-400 block">
                                    Manual Booking
                                </span>
                                <h3 className="text-lg font-black text-blue-900">
                                    Schedule Interview for Candidate
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsCreateModalOpen(false)}
                                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-xs font-bold"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleCreateInterview} className="space-y-4">
                            {/* Candidate Picker */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Select Candidate <span className="text-red-500">*</span>
                                </label>
                                <select
                                    required
                                    value={createApplicantId}
                                    onChange={(e) => setCreateApplicantId(Number(e.target.value))}
                                    className="w-full bg-slate-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-900 focus:outline-none focus:border-blue-900"
                                >
                                    <option value="">-- Choose Candidate --</option>
                                    {allApplicants.map((a) => (
                                        <option key={a.id} value={a.id}>
                                            {a.fullName} ({a.email}) {a.candidateNumber ? `[#${a.candidateNumber}]` : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Schedule Slot Picker */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Select Available Schedule Slot <span className="text-red-500">*</span>
                                </label>
                                {availableSlots.length === 0 ? (
                                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900">
                                        No unbooked slots available in the catalogue.{' '}
                                        <Link href="/admin/schedules" className="font-bold underline">
                                            Create slots in Schedule Catalogue first →
                                        </Link>
                                    </div>
                                ) : (
                                    <select
                                        required
                                        value={createScheduleId}
                                        onChange={(e) => setCreateScheduleId(Number(e.target.value))}
                                        className="w-full bg-slate-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-900 focus:outline-none focus:border-blue-900"
                                    >
                                        <option value="">-- Choose Date & Time Slot --</option>
                                        {availableSlots.map((s) => (
                                            <option key={s.id} value={s.id}>
                                                {s.date} at {s.time}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>

                            {/* Meeting Link */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Meeting Room Link (Optional)
                                </label>
                                <input
                                    type="url"
                                    placeholder="https://zoom.us/... or https://meet.google.com/..."
                                    value={createMeetingLink}
                                    onChange={(e) => setCreateMeetingLink(e.target.value)}
                                    className="w-full bg-slate-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-900 focus:outline-none focus:border-blue-900"
                                />
                            </div>

                            {/* Overview / Notes */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Interview Overview / Agenda
                                </label>
                                <textarea
                                    rows={3}
                                    placeholder="Enter initial overview notes, topics, or instructions for the interview..."
                                    value={createOverview}
                                    onChange={(e) => setCreateOverview(e.target.value)}
                                    className="w-full bg-slate-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-900 focus:outline-none focus:border-blue-900"
                                />
                            </div>

                            <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isCreating || availableSlots.length === 0}
                                    className="px-5 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-xs font-black uppercase tracking-wider disabled:opacity-50"
                                >
                                    {isCreating ? 'Booking...' : 'Confirm Interview'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
