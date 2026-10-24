'use client';

import React from 'react';
import { useApiQuery } from '@/lib/hooks';
import Link from 'next/link';

interface InterviewDetails {
    id: number;
    applicantId: number;
    interviewDate?: string | null;
    interviewTime?: string | null;
    timezone?: string | null;
    interviewUrl?: string | null;
    meetingLink?: string | null;
    overview?: string | null;
    outcome?: 'Pending' | 'Passed' | 'Failed' | 'Completed' | 'Rescheduled';
    selectedSchedule?: {
        date: string;
        time: string;
    };
}

interface ApplicantInterviewResponse {
    success: boolean;
    canPickSchedule?: boolean;
    data: InterviewDetails | null;
}

export default function ApplicantInterviewPage() {
    const {
        data: interviewData,
        isLoading: isInterviewLoading,
        refetch: refetchInterview,
    } = useApiQuery<ApplicantInterviewResponse>(
        ['applicant-interview'],
        '/interviews/my-interview'
    );

    const interview = interviewData?.data;

    // Determine if interview date is set
    const effectiveDate = interview?.interviewDate || interview?.selectedSchedule?.date || null;
    const effectiveTime = interview?.interviewTime || interview?.selectedSchedule?.time || null;
    const effectiveTimezone = interview?.timezone || 'AWST (UTC+8)';
    const effectiveMeetingLink = interview?.interviewUrl || interview?.meetingLink || null;
    const isInterviewSet = Boolean(effectiveDate && effectiveDate.trim() !== '');

    if (isInterviewLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-900 rounded-full animate-spin" />
                <p className="text-[11px] font-black tracking-[0.25em] uppercase text-blue-400">
                    Loading Interview Status...
                </p>
            </div>
        );
    }

    return (
        <div className="font-sans antialiased text-blue-900 max-w-5xl mx-auto pb-24">
            {/* Header */}
            <div className="mb-10">
                <div className="flex items-center gap-3 mb-2">
                    <span className="text-[10px] font-black tracking-[0.25em] uppercase text-blue-500 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                        Employer Technical Evaluation
                    </span>
                </div>
                <h1 className="text-3xl lg:text-4xl font-black italic uppercase tracking-tight text-blue-950">
                    Host Employer Technical Interview
                </h1>
                <p className="text-sm font-medium text-slate-500 mt-1">
                    Direct technical interview conducted with your prospective Australian sponsoring employer.
                </p>
            </div>

            {/* STATE 1: Interview Date NOT SET */}
            {!isInterviewSet ? (
                <div className="space-y-8">
                    {/* Primary Status Banner - "Interview Date Not Set" */}
                    <div className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-white border-2 border-amber-200/90 rounded-3xl p-8 lg:p-10 shadow-xl shadow-amber-500/5">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                            <div className="w-16 h-16 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/30 shrink-0">
                                <span className="material-symbols-outlined text-3xl">event_busy</span>
                            </div>
                            <div className="flex-1 space-y-2">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-800 bg-amber-100 px-3 py-1 rounded-full border border-amber-200">
                                    Status: Interview Date Not Set
                                </span>
                                <h2 className="text-2xl lg:text-3xl font-black text-amber-950 leading-snug">
                                    Interview Date Not Set
                                </h2>
                                <p className="text-amber-900/90 font-medium text-sm leading-relaxed">
                                    Your technical interview date has not yet been scheduled by your prospective Australian host employer. Once the employer review panel sets your interview date, time, and Zoom meeting room, all details and operational materials will appear here automatically.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* What to Expect Card */}
                    <div className="bg-white rounded-3xl border border-blue-100 p-8 shadow-xl shadow-blue-950/5 space-y-6">
                        <h3 className="text-sm font-black uppercase tracking-[0.15em] text-blue-950 flex items-center gap-2">
                            <span className="material-symbols-outlined text-blue-600">info</span>
                            What to Expect for Your Employer Interview
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="p-6 rounded-2xl bg-blue-50/70 border border-blue-100 space-y-2">
                                <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-full">
                                    Host Employer
                                </span>
                                <h4 className="font-bold text-blue-950 text-sm">Direct Employer Meeting</h4>
                                <p className="text-xs text-blue-800/80 leading-relaxed">
                                    Your interview is held directly with the sponsoring employer (such as MACA Limited or associated mining operations), not Blue Collar Recruitment.
                                </p>
                            </div>

                            <div className="p-6 rounded-2xl bg-amber-50/70 border border-amber-100 space-y-2">
                                <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full">
                                    Preparation
                                </span>
                                <h4 className="font-bold text-amber-950 text-sm">Operational Manual</h4>
                                <p className="text-xs text-amber-900/80 leading-relaxed">
                                    Your conditional invitation email includes the official operational manual for your trade. You are expected to review this document prior to the session.
                                </p>
                            </div>

                            <div className="p-6 rounded-2xl bg-emerald-50/70 border border-emerald-100 space-y-2">
                                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                                    Format
                                </span>
                                <h4 className="font-bold text-emerald-950 text-sm">Zoom Video Conference</h4>
                                <p className="text-xs text-emerald-900/80 leading-relaxed">
                                    Conducted remotely via Zoom. You will receive a direct access link and onboarding guide upon scheduling.
                                </p>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                            <p className="text-xs text-slate-500 font-medium">
                                Questions about your status? Our recruitment team responds personally between 2:00 PM – 4:00 PM AWST.
                            </p>
                            <button
                                type="button"
                                onClick={() => refetchInterview()}
                                className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-900 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
                            >
                                <span className="material-symbols-outlined text-sm">refresh</span>
                                Refresh Status
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                /* STATE 2: Interview Date IS SET */
                <div className="space-y-8">
                    {/* Confirmed Interview Card */}
                    <div className="bg-white rounded-3xl border border-blue-200 p-8 lg:p-10 shadow-2xl shadow-blue-900/5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-blue-100">
                            <div>
                                <div className="flex items-center gap-3">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200">
                                        Interview Confirmed
                                    </span>
                                    <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full border ${
                                        interview?.outcome === 'Passed'
                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                            : interview?.outcome === 'Failed'
                                            ? 'bg-red-50 text-red-700 border-red-200'
                                            : interview?.outcome === 'Completed'
                                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                                            : 'bg-amber-50 text-amber-700 border-amber-200'
                                    }`}>
                                        Status: {interview?.outcome || 'Pending'}
                                    </span>
                                </div>
                                <h2 className="text-2xl lg:text-3xl font-black text-blue-950 mt-3">
                                    Your Scheduled Host Employer Interview
                                </h2>
                            </div>

                            {effectiveMeetingLink && (
                                <a
                                    href={effectiveMeetingLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center gap-2 bg-blue-900 hover:bg-black text-white px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-blue-900/20 active:scale-95"
                                >
                                    <span className="material-symbols-outlined text-base">video_call</span>
                                    Join Zoom Meeting
                                </a>
                            )}
                        </div>

                        {/* Date, Time, and Timezone Spotlight */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
                            <div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-6 flex items-center gap-4">
                                <div className="w-14 h-14 rounded-xl bg-blue-900 text-white flex items-center justify-center shrink-0 shadow-md">
                                    <span className="material-symbols-outlined text-2xl">calendar_month</span>
                                </div>
                                <div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-400 block">
                                        Confirmed Interview Date
                                    </span>
                                    <span className="text-xl font-black text-blue-950">
                                        {effectiveDate}
                                    </span>
                                </div>
                            </div>

                            <div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-6 flex items-center gap-4">
                                <div className="w-14 h-14 rounded-xl bg-blue-900 text-white flex items-center justify-center shrink-0 shadow-md">
                                    <span className="material-symbols-outlined text-2xl">schedule</span>
                                </div>
                                <div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-400 block">
                                        Confirmed Time ({effectiveTimezone})
                                    </span>
                                    <span className="text-xl font-black text-blue-950">
                                        {effectiveTime || 'Time confirmed via employer email'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Direct Zoom Link Details */}
                        {effectiveMeetingLink ? (
                            <div className="mb-8 p-5 rounded-2xl bg-blue-50 border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 block">
                                        Zoom Video Meeting Room
                                    </span>
                                    <a
                                        href={effectiveMeetingLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs font-mono font-bold text-blue-900 hover:underline break-all mt-1 block"
                                    >
                                        {effectiveMeetingLink}
                                    </a>
                                </div>
                                <a
                                    href={effectiveMeetingLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="shrink-0 px-4 py-2 bg-blue-900 text-white text-xs font-bold rounded-xl hover:bg-black transition-all flex items-center gap-1.5"
                                >
                                    <span className="material-symbols-outlined text-sm">open_in_new</span>
                                    Open Link
                                </a>
                            </div>
                        ) : (
                            <div className="mb-8 p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center gap-3">
                                <span className="material-symbols-outlined text-amber-600">info</span>
                                <p className="text-xs font-semibold text-amber-900">
                                    Your meeting link will be dispatched to your email and displayed here prior to your interview start time.
                                </p>
                            </div>
                        )}

                        {/* Overview or Notes */}
                        {interview?.overview && (
                            <div className="mb-8 p-6 rounded-2xl bg-slate-50 border border-slate-200">
                                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-2">
                                    Session Overview & Topics
                                </span>
                                <p className="text-sm font-medium text-slate-700 leading-relaxed whitespace-pre-line">
                                    {interview.overview}
                                </p>
                            </div>
                        )}

                        {/* Candidate Preparation Guidelines */}
                        <div className="pt-6 border-t border-blue-100">
                            <h4 className="text-xs font-black uppercase tracking-[0.15em] text-blue-950 mb-4">
                                Interview Preparation Checklist
                            </h4>
                            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600 font-medium">
                                <li className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-emerald-600 text-base">check_circle</span>
                                    Review the attached Operational Procedure Manual
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-emerald-600 text-base">check_circle</span>
                                    Quiet environment with stable internet connection
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-emerald-600 text-base">check_circle</span>
                                    Valid passport or government photo ID ready
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-emerald-600 text-base">check_circle</span>
                                    Test webcam and microphone 10 minutes prior
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
