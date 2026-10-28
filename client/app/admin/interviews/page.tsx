'use client';

import React, { useState } from 'react';
import { useApiQuery } from '@/lib/hooks';
import api from '@/lib/api';

interface InterviewApplicant {
    id: number;
    fullName: string;
    email: string;
    candidateNumber?: string;
    phoneNumber?: string;
    canPickSchedule?: boolean;
    interviewDate?: string | null;
    interviewTime?: string | null;
    interviewLink?: string | null;
    interviewEmailSentAt?: string | null;
    onboardingEmailSentAt?: string | null;
    onboardingEmailSent?: boolean;
}

interface InterviewItem {
    id: number;
    scheduleCatalogueId?: number | null;
    applicantId: number;
    interviewDate?: string | null;
    interviewTime?: string | null;
    timezone?: string | null;
    interviewUrl?: string | null;
    meetingLink?: string | null;
    overview: string | null;
    outcome: 'Pending' | 'Passed' | 'Failed' | 'Completed' | 'Rescheduled';
    interviewEmailSentAt?: string | null;
    onboardingEmailSentAt?: string | null;
    onboardingEmailSent?: boolean;
    createdAt?: string;
    updatedAt?: string;
    selectedSchedule?: {
        id: number;
        date: string;
        time: string;
        isBooked: boolean;
    };
    applicant?: InterviewApplicant;
}

export default function AdminInterviewsPage() {
    const { data: interviewsRes, isLoading, refetch } = useApiQuery<{ success: boolean; data: InterviewItem[]; count: number }>(
        ['admin-interviews'],
        '/admin/interviews'
    );
    const interviews = interviewsRes?.data || [];

    // Fetch applicants for interview creation
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
    const [editDate, setEditDate] = useState('');
    const [editTime, setEditTime] = useState('');
    const [editTimezone, setEditTimezone] = useState('AWST (UTC+8)');
    const [isSavingEdit, setIsSavingEdit] = useState(false);

    // INAS01 / Employer Notification Modal states
    const [isNotifyModalOpen, setIsNotifyModalOpen] = useState(false);
    const [notifyApplicantId, setNotifyApplicantId] = useState<number | ''>('');
    const [notifyDate, setNotifyDate] = useState('');
    const [notifyTime, setNotifyTime] = useState('10:00 AM');
    const [notifyTimezone, setNotifyTimezone] = useState('AWST (UTC+8)');
    const [notifyZoomLink, setNotifyZoomLink] = useState('');
    const [notifyManualUrl, setNotifyManualUrl] = useState('');
    const [isSendingNotify, setIsSendingNotify] = useState(false);
    const [dispatchingId, setDispatchingId] = useState<number | null>(null);

    const handleOpenNotify = (applicant?: InterviewApplicant, defaultDate?: string, defaultTime?: string, defaultMeetingLink?: string) => {
        if (applicant) {
            setNotifyApplicantId(applicant.id);
        } else {
            setNotifyApplicantId('');
        }
        setNotifyDate(defaultDate || '');
        setNotifyTime(defaultTime || '10:00 AM');
        setNotifyTimezone('AWST (UTC+8)');
        setNotifyZoomLink(defaultMeetingLink || '');
        setNotifyManualUrl('');
        setIsNotifyModalOpen(true);
    };

    // INAS01 Execution Handler
    const handleSendScheduleNotify = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!notifyApplicantId) {
            alert('Please select an applicant from the dropdown.');
            return;
        }

        if (!notifyDate.trim() || !notifyTime.trim()) {
            alert('Please specify the interview date and time.');
            return;
        }

        if (!notifyZoomLink.trim()) {
            alert('A mandatory Zoom meeting link is required.');
            return;
        }

        setIsSendingNotify(true);
        try {
            const { data } = await api.post('/admin/interviews/schedule-notify', {
                applicantId: Number(notifyApplicantId),
                interviewDate: notifyDate.trim(),
                interviewTime: notifyTime.trim(),
                timezone: notifyTimezone.trim(),
                zoomLink: notifyZoomLink.trim(),
                interviewLink: notifyZoomLink.trim(),
                manualUrl: notifyManualUrl.trim() || undefined
            });
            alert(data.message || 'Conditional Invitation dispatched from Employer email with Operational Manual attached. MACA onboarding guide scheduled for 1 hour later.');
            setIsNotifyModalOpen(false);
            refetch();
        } catch (err: any) {
            alert(err.response?.data?.message || err.response?.data?.error || 'Failed to dispatch interview notification.');
        } finally {
            setIsSendingNotify(false);
        }
    };

    // INA02 Manual / Immediate Trigger
    const handleDispatchOnboardingGuide = async (applicantId: number) => {
        if (!confirm('Dispatch the second-contact employer onboarding guide (maca-employee-onboarding-guide.pdf) now?')) return;
        setDispatchingId(applicantId);
        try {
            const { data } = await api.post('/admin/interviews/dispatch-onboarding-guide', { applicantId });
            alert(data.message || 'Onboarding guide PDF successfully dispatched via employer email.');
        } catch (err: any) {
            alert(err.response?.data?.message || err.response?.data?.error || 'Failed to dispatch onboarding guide.');
        } finally {
            setDispatchingId(null);
        }
    };

    // Open Edit Modal
    const handleOpenEdit = (interview: InterviewItem) => {
        setSelectedInterview(interview);
        setEditOverview(interview.overview || '');
        setEditOutcome(interview.outcome);
        setEditMeetingLink(interview.meetingLink || interview.interviewUrl || '');
        setEditDate(interview.interviewDate || interview.selectedSchedule?.date || '');
        setEditTime(interview.interviewTime || interview.selectedSchedule?.time || '');
        setEditTimezone(interview.timezone || 'AWST (UTC+8)');
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
                interviewUrl: editMeetingLink,
                interviewDate: editDate,
                interviewTime: editTime,
                timezone: editTimezone,
            });
            alert('Interview details updated successfully.');
            setIsEditModalOpen(false);
            refetch();
        } catch (err: any) {
            alert(err.response?.data?.error || 'Failed to update interview.');
        } finally {
            setIsSavingEdit(false);
        }
    };

    // Delete Interview
    const handleDeleteInterview = async (id: number) => {
        if (!confirm('Are you sure you want to delete this interview record?')) return;
        try {
            await api.delete(`/admin/interviews/${id}`);
            alert('Interview deleted successfully.');
            refetch();
        } catch (err: any) {
            alert(err.response?.data?.error || 'Failed to delete interview.');
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
                        Schedule employer competency interviews (INAS01), attach job operational materials, and dispatch onboarding documentation (INA02).
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => handleOpenNotify()}
                        className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-500/10 inline-flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-base">outgoing_mail</span>
                        Schedule &amp; Notify (INAS01)
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
                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                        <span className="material-symbols-outlined text-xl">hourglass_empty</span>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-blue-100 shadow-sm flex items-center justify-between">
                    <div>
                        <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600 block mb-1">
                            Passed
                        </span>
                        <span className="text-2xl font-black text-emerald-600">{passedCount}</span>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                        <span className="material-symbols-outlined text-xl">check_circle</span>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-blue-100 shadow-sm flex items-center justify-between">
                    <div>
                        <span className="text-[9px] font-black uppercase tracking-widest text-rose-600 block mb-1">
                            Failed / Ineligible
                        </span>
                        <span className="text-2xl font-black text-rose-600">{failedCount}</span>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                        <span className="material-symbols-outlined text-xl">cancel</span>
                    </div>
                </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="bg-white p-4 rounded-2xl border border-blue-100 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Status:</span>
                    <select
                        value={outcomeFilter}
                        onChange={(e) => setOutcomeFilter(e.target.value)}
                        className="bg-slate-50 border border-slate-200 text-xs font-bold text-blue-900 rounded-xl px-3 py-2 focus:outline-none focus:border-blue-900"
                    >
                        <option value="all">All Outcomes</option>
                        <option value="Pending">Pending</option>
                        <option value="Passed">Passed</option>
                        <option value="Failed">Failed</option>
                        <option value="Completed">Completed</option>
                        <option value="Rescheduled">Rescheduled</option>
                    </select>
                </div>

                <div className="w-full sm:w-80 relative">
                    <input
                        type="text"
                        placeholder="Search candidate, email, or notes..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-900"
                    />
                    <span className="material-symbols-outlined text-slate-400 absolute left-2.5 top-2.5 text-base">
                        search
                    </span>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-3xl border border-blue-100 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-blue-50 bg-slate-50/50">
                                <th className="p-4 pl-6 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                    Candidate Details
                                </th>
                                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                    Scheduled Time (AWST)
                                </th>
                                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                    Evaluation / Notes
                                </th>
                                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                    Outcome
                                </th>
                                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                    Employer Contact Stage
                                </th>
                                <th className="p-4 pr-6 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-blue-50 text-xs font-medium">
                            {filteredInterviews.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-12 text-center text-slate-400 italic">
                                        No scheduled interview sessions found matching your filters.
                                    </td>
                                </tr>
                            ) : (
                                filteredInterviews.map((item) => {
                                    const effectiveDate = item.interviewDate || item.selectedSchedule?.date || item.applicant?.interviewDate || null;
                                    const effectiveTime = item.interviewTime || item.selectedSchedule?.time || item.applicant?.interviewTime || null;
                                    const effectiveLink = item.interviewUrl || item.meetingLink || item.applicant?.interviewLink || null;

                                    return (
                                        <tr key={item.id} className="hover:bg-blue-50/30 transition-colors">
                                            {/* Candidate Details */}
                                            <td className="p-4 pl-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-full bg-blue-900 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-xs">
                                                        {item.applicant?.fullName?.charAt(0) || 'U'}
                                                    </div>
                                                    <div>
                                                        <span className="font-bold text-blue-950 block">
                                                            {item.applicant?.fullName || 'Unknown Candidate'}
                                                        </span>
                                                        <span className="text-[11px] text-slate-500 font-mono">
                                                            {item.applicant?.email}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Scheduled Date & Time */}
                                            <td className="p-4">
                                                {effectiveDate ? (
                                                    <div>
                                                        <span className="font-bold text-slate-900 block text-xs">
                                                            📅 {effectiveDate}
                                                        </span>
                                                        <span className="text-[11px] text-slate-500 font-semibold">
                                                            ⏰ {effectiveTime || 'Time confirmed'} ({item.timezone || 'AWST'})
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full text-[10px] font-bold border border-amber-200">
                                                        Interview Date Not Set
                                                    </span>
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

                                            {/* Employer Contact Stage (Stage 1 & Stage 2) */}
                                            <td className="p-4">
                                                <div className="flex flex-col gap-1.5 text-[10px]">
                                                    {effectiveLink && (
                                                        <a
                                                            href={effectiveLink}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs font-bold underline mb-0.5"
                                                        >
                                                            <span>Join Zoom</span>
                                                            <span className="text-[10px]">↗</span>
                                                        </a>
                                                    )}
                                                    {item.interviewEmailSentAt || item.applicant?.interviewEmailSentAt ? (
                                                        <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                                            Stage 1: Interview Mail Sent
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                                                            Stage 1: Pending Interview Mail
                                                        </span>
                                                    )}
                                                    {item.onboardingEmailSent || item.applicant?.onboardingEmailSent ? (
                                                        <span className="inline-flex items-center gap-1 font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                                                            Stage 2: Onboarding Guide Sent
                                                        </span>
                                                    ) : (item.interviewEmailSentAt || item.applicant?.interviewEmailSentAt) ? (
                                                        <span className="inline-flex items-center gap-1 font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
                                                            Stage 2: 1h Cron Pending
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                                                            Stage 2: Awaiting Interview
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Actions */}
                                            <td className="p-4 pr-6 text-right">
                                                <div className="flex items-center justify-end gap-1.5 flex-wrap">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleOpenNotify(item.applicant, effectiveDate || undefined, effectiveTime || undefined, effectiveLink || undefined)}
                                                        className="px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-bold uppercase tracking-wider transition-colors flex items-center gap-1 shadow-sm"
                                                        title="Send formal interview invitation from Employer email with Operational Manual file attached (INAS01)"
                                                    >
                                                        <span className="material-symbols-outlined text-[13px]">mail</span>
                                                        Employer Notify
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDispatchOnboardingGuide(item.applicantId)}
                                                        disabled={dispatchingId === item.applicantId}
                                                        className="px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10px] font-bold uppercase tracking-wider transition-colors disabled:opacity-50"
                                                        title="Dispatch MACA Onboarding Guide PDF now (INA02)"
                                                    >
                                                        {dispatchingId === item.applicantId ? 'Sending...' : 'Dispatch Guide'}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleOpenEdit(item)}
                                                        className="px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-900 text-[10px] font-bold uppercase tracking-wider transition-colors"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteInterview(item.id)}
                                                        className="px-2.5 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 text-[10px] font-bold uppercase tracking-wider transition-colors"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
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
                                    Interview Configuration &amp; Evaluation
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
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        Interview Date
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. 5 November 2026"
                                        value={editDate}
                                        onChange={(e) => setEditDate(e.target.value)}
                                        className="w-full bg-slate-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-900 focus:outline-none focus:border-blue-900"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        Interview Time
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. 10:00 AM"
                                        value={editTime}
                                        onChange={(e) => setEditTime(e.target.value)}
                                        className="w-full bg-slate-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-900 focus:outline-none focus:border-blue-900"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Timezone
                                </label>
                                <input
                                    type="text"
                                    value={editTimezone}
                                    onChange={(e) => setEditTimezone(e.target.value)}
                                    className="w-full bg-slate-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-900 focus:outline-none focus:border-blue-900"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Zoom Video Call Link
                                </label>
                                <input
                                    type="url"
                                    placeholder="https://zoom.us/j/..."
                                    value={editMeetingLink}
                                    onChange={(e) => setEditMeetingLink(e.target.value)}
                                    className="w-full bg-slate-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-900 font-mono focus:outline-none focus:border-blue-900"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Outcome Evaluation
                                </label>
                                <select
                                    value={editOutcome}
                                    onChange={(e) => setEditOutcome(e.target.value as any)}
                                    className="w-full bg-slate-50 border border-blue-200 rounded-xl p-3 text-xs font-bold text-blue-900 focus:outline-none focus:border-blue-900"
                                >
                                    <option value="Pending">Pending</option>
                                    <option value="Passed">Passed (Recommend for Deployment)</option>
                                    <option value="Failed">Failed</option>
                                    <option value="Completed">Completed</option>
                                    <option value="Rescheduled">Rescheduled</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Interview Overview / Evaluator Notes
                                </label>
                                <textarea
                                    rows={3}
                                    placeholder="Add evaluation summary or preparation notes..."
                                    value={editOverview}
                                    onChange={(e) => setEditOverview(e.target.value)}
                                    className="w-full bg-slate-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-900 focus:outline-none focus:border-blue-900"
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
                                    {isSavingEdit ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* INAS01: Conditional Invitation / Employer Notification Modal */}
            {isNotifyModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-blue-950/60 backdrop-blur-sm animate-in fade-in duration-150">
                    <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-amber-200 shadow-2xl">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
                            <div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 block">
                                    Action INA01 &bull; INAS01
                                </span>
                                <h3 className="text-lg font-black text-blue-900">
                                    Conditional Invitation for Interview
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsNotifyModalOpen(false)}
                                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-xs font-bold"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSendScheduleNotify} className="space-y-4">
                            {/* Applicant Dropdown */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Select Candidate <span className="text-red-500">*</span>
                                </label>
                                <select
                                    required
                                    value={notifyApplicantId}
                                    onChange={(e) => setNotifyApplicantId(Number(e.target.value))}
                                    className="w-full bg-slate-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-900 font-bold focus:outline-none focus:border-blue-900"
                                >
                                    <option value="">-- Choose Candidate from Dropdown --</option>
                                    {allApplicants.map((a) => (
                                        <option key={a.id} value={a.id}>
                                            {a.fullName} ({a.email}) {a.candidateNumber ? `[#${a.candidateNumber}]` : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        Interview Date <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. 5 November 2026"
                                        value={notifyDate}
                                        onChange={(e) => setNotifyDate(e.target.value)}
                                        className="w-full bg-slate-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-900 focus:outline-none focus:border-blue-900"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        Interview Time <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. 10:00 AM"
                                        value={notifyTime}
                                        onChange={(e) => setNotifyTime(e.target.value)}
                                        className="w-full bg-slate-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-900 focus:outline-none focus:border-blue-900"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Timezone <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={notifyTimezone}
                                    onChange={(e) => setNotifyTimezone(e.target.value)}
                                    className="w-full bg-slate-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-900 focus:outline-none focus:border-blue-900"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Mandatory Zoom Meeting Link <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="url"
                                    required
                                    placeholder="https://zoom.us/j/1234567890?pwd=..."
                                    value={notifyZoomLink}
                                    onChange={(e) => setNotifyZoomLink(e.target.value)}
                                    className="w-full bg-slate-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-900 font-mono focus:outline-none focus:border-blue-900"
                                />
                                <p className="text-[10px] text-slate-500 mt-1">
                                    Dispatched from the Employer mail account. The role operational document is downloaded from Cloudinary and attached as a file. The email notifies candidate that their Onboarding Guide email arrives in less than 2 hours (1-hour cron).
                                </p>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Operational Manual URL (Optional override)
                                </label>
                                <input
                                    type="url"
                                    placeholder="Leave blank to use the applied job listing operational manual"
                                    value={notifyManualUrl}
                                    onChange={(e) => setNotifyManualUrl(e.target.value)}
                                    className="w-full bg-slate-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-900 font-mono focus:outline-none focus:border-blue-900"
                                />
                            </div>

                            <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setIsNotifyModalOpen(false)}
                                    className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSendingNotify}
                                    className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black uppercase tracking-wider disabled:opacity-50 flex items-center gap-1.5 shadow-md"
                                >
                                    <span className="material-symbols-outlined text-sm">send</span>
                                    {isSendingNotify ? 'Dispatching...' : 'Dispatch Invitation (INAS01)'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
