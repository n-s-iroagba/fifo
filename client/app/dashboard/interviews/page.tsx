'use client';

import React, { useState } from 'react';
import { useApiQuery } from '@/lib/hooks';
import api from '@/lib/api';
import Link from 'next/link';
import { Interview, ScheduleCatalogue } from '@/types/models';

interface ApplicantInterviewResponse {
    success: boolean;
    canPickSchedule: boolean;
    data: Interview | null;
}

interface ScheduleCatalogueResponse {
    success: boolean;
    data: ScheduleCatalogue[];
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

    const canPickSchedule = interviewData?.canPickSchedule ?? false;
    const currentInterview = interviewData?.data;

    const {
        data: availableSlotsData,
        isLoading: isSlotsLoading,
        refetch: refetchSlots,
    } = useApiQuery<ScheduleCatalogueResponse>(
        ['available-schedules'],
        '/schedule-catalogues?availableOnly=true',
        {
            enabled: Boolean(canPickSchedule && !currentInterview),
        }
    );

    const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);
    const [candidateNotes, setCandidateNotes] = useState('');
    const [isBooking, setIsBooking] = useState(false);
    const [bookingError, setBookingError] = useState<string | null>(null);
    const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);

    const availableSlots = availableSlotsData?.data || [];

    const handleBookSchedule = async () => {
        if (!selectedSlotId) {
            setBookingError('Please select an available date and time slot.');
            return;
        }

        setIsBooking(true);
        setBookingError(null);
        setBookingSuccess(null);

        try {
            const res = await api.post('/interviews/book', {
                scheduleCatalogueId: selectedSlotId,
                overview: candidateNotes.trim() || undefined,
            });

            if (res.data?.success) {
                setBookingSuccess('Your interview has been successfully scheduled!');
                setSelectedSlotId(null);
                setCandidateNotes('');
                await Promise.all([refetchInterview(), refetchSlots()]);
            } else {
                setBookingError(res.data?.error || 'Failed to confirm interview booking.');
            }
        } catch (err: any) {
            const msg = err.response?.data?.error || err.message || 'Error occurred while scheduling interview.';
            setBookingError(msg);
        } finally {
            setIsBooking(false);
        }
    };

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
                        Interview Management
                    </span>
                </div>
                <h1 className="text-3xl lg:text-4xl font-black italic uppercase tracking-tight text-blue-950">
                    Technical & Cultural Interview
                </h1>
                <p className="text-sm font-medium text-slate-500 mt-1">
                    Manage your recruitment screening session, select your slot, and prepare for your interview.
                </p>
            </div>

            {/* CASE 1: Applicant NOT AUTHORIZED to pick schedule */}
            {!canPickSchedule && (
                <div className="space-y-8">
                    {/* Primary Requirement Banner */}
                    <div className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-white border-2 border-amber-200/80 rounded-3xl p-8 lg:p-10 shadow-xl shadow-amber-500/5">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                            <div className="w-16 h-16 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/30 shrink-0">
                                <span className="material-symbols-outlined text-3xl">lock_clock</span>
                            </div>
                            <div className="flex-1 space-y-2">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-700 bg-amber-100 px-3 py-1 rounded-full">
                                    Prerequisite Pending
                                </span>
                                <h2 className="text-xl lg:text-2xl font-black text-amber-950 leading-snug">
                                    Interview Booking is Not Yet Available
                                </h2>
                                <p className="text-amber-900/90 font-semibold text-base leading-relaxed">
                                    An interview will be set after you have passed your third ticket examination.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Progress Step Guide */}
                    <div className="bg-white rounded-3xl border border-blue-100 p-8 shadow-xl shadow-blue-950/5">
                        <h3 className="text-sm font-black uppercase tracking-[0.15em] text-blue-950 mb-6 flex items-center gap-2">
                            <span className="material-symbols-outlined text-blue-600">checklist</span>
                            Recruitment Progression Pathway
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-100 space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-black">
                                        1
                                    </span>
                                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700">
                                        Stage 1
                                    </span>
                                </div>
                                <h4 className="font-bold text-emerald-950 text-sm">Application & Verification</h4>
                                <p className="text-xs text-emerald-800/80 leading-relaxed">
                                    Profile details, resume documentation, and identity verification submitted.
                                </p>
                            </div>

                            <div className="p-6 rounded-2xl bg-blue-50 border-2 border-blue-300 space-y-2 relative">
                                <div className="flex items-center justify-between">
                                    <span className="w-7 h-7 rounded-full bg-blue-700 text-white flex items-center justify-center text-xs font-black">
                                        2
                                    </span>
                                    <span className="text-[10px] font-black uppercase tracking-wider text-blue-700">
                                        Current Gate
                                    </span>
                                </div>
                                <h4 className="font-bold text-blue-950 text-sm">Ticket Examinations (3 Minimum)</h4>
                                <p className="text-xs text-blue-800/80 leading-relaxed">
                                    Complete and pass examinations for your required industrial safety & mining tickets.
                                </p>
                                <div className="pt-2">
                                    <Link
                                        href="/dashboard/tickets"
                                        className="inline-flex items-center gap-1.5 text-xs font-black text-blue-700 hover:text-blue-900 underline"
                                    >
                                        Go to My Tickets
                                        <span className="material-symbols-outlined text-xs">arrow_forward</span>
                                    </Link>
                                </div>
                            </div>

                            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 opacity-70">
                                <div className="flex items-center justify-between">
                                    <span className="w-7 h-7 rounded-full bg-slate-300 text-slate-700 flex items-center justify-center text-xs font-black">
                                        3
                                    </span>
                                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                                        Upcoming
                                    </span>
                                </div>
                                <h4 className="font-bold text-slate-800 text-sm">Panel Interview</h4>
                                <p className="text-xs text-slate-600 leading-relaxed">
                                    Slot selection unlocks automatically once your 3rd ticket exam is verified by administration.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* CASE 2: Applicant AUTHORIZED to pick schedule & ALREADY HAS AN INTERVIEW */}
            {canPickSchedule && currentInterview && (
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
                                        currentInterview.outcome === 'Passed'
                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                            : currentInterview.outcome === 'Failed'
                                            ? 'bg-red-50 text-red-700 border-red-200'
                                            : currentInterview.outcome === 'Completed'
                                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                                            : 'bg-amber-50 text-amber-700 border-amber-200'
                                    }`}>
                                        Status: {currentInterview.outcome || 'Pending'}
                                    </span>
                                </div>
                                <h2 className="text-2xl lg:text-3xl font-black text-blue-950 mt-3">
                                    Your Scheduled Interview Session
                                </h2>
                            </div>

                            {currentInterview.meetingLink && (
                                <a
                                    href={currentInterview.meetingLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center gap-2 bg-blue-900 hover:bg-black text-white px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-blue-900/20 active:scale-95"
                                >
                                    <span className="material-symbols-outlined text-base">video_call</span>
                                    Join Video Meeting
                                </a>
                            )}
                        </div>

                        {/* Date and Time Spotlight */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
                            <div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-6 flex items-center gap-4">
                                <div className="w-14 h-14 rounded-xl bg-blue-900 text-white flex items-center justify-center shrink-0 shadow-md">
                                    <span className="material-symbols-outlined text-2xl">calendar_month</span>
                                </div>
                                <div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-400 block">
                                        Interview Date
                                    </span>
                                    <span className="text-xl font-black text-blue-950">
                                        {currentInterview.selectedSchedule?.date || 'Date Pending'}
                                    </span>
                                </div>
                            </div>

                            <div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-6 flex items-center gap-4">
                                <div className="w-14 h-14 rounded-xl bg-blue-900 text-white flex items-center justify-center shrink-0 shadow-md">
                                    <span className="material-symbols-outlined text-2xl">schedule</span>
                                </div>
                                <div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-400 block">
                                        Interview Time (Perth AWST)
                                    </span>
                                    <span className="text-xl font-black text-blue-950">
                                        {currentInterview.selectedSchedule?.time || 'Time Pending'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Overview or Notes */}
                        {currentInterview.overview && (
                            <div className="mb-8 p-6 rounded-2xl bg-slate-50 border border-slate-200">
                                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-2">
                                    Session Overview & Topics
                                </span>
                                <p className="text-sm font-medium text-slate-700 leading-relaxed whitespace-pre-line">
                                    {currentInterview.overview}
                                </p>
                            </div>
                        )}

                        {/* Meeting Link Notification if not yet provided */}
                        {!currentInterview.meetingLink && (
                            <div className="mb-8 p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center gap-3">
                                <span className="material-symbols-outlined text-amber-600">info</span>
                                <p className="text-xs font-semibold text-amber-900">
                                    Your meeting link will be generated by the recruitment team and displayed here prior to your interview start time.
                                </p>
                            </div>
                        )}

                        {/* Candidate Preparation Guidelines */}
                        <div className="pt-6 border-t border-blue-100">
                            <h4 className="text-xs font-black uppercase tracking-[0.15em] text-blue-950 mb-4">
                                Preparation Checklist
                            </h4>
                            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600 font-medium">
                                <li className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-emerald-600 text-base">check_circle</span>
                                    Quiet environment with stable internet connectivity
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-emerald-600 text-base">check_circle</span>
                                    Valid Australian ID or passport on hand
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-emerald-600 text-base">check_circle</span>
                                    Working webcam and microphone
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-emerald-600 text-base">check_circle</span>
                                    Be logged in 5 minutes prior to start time
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            {/* CASE 3: Applicant AUTHORIZED to pick schedule & HAS NOT BOOKED YET */}
            {canPickSchedule && !currentInterview && (
                <div className="space-y-8">
                    {/* Authorized Banner */}
                    <div className="bg-gradient-to-r from-emerald-500/15 via-emerald-500/5 to-white border-2 border-emerald-300 rounded-3xl p-6 lg:p-8 shadow-lg shadow-emerald-500/5 flex items-center gap-5">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shrink-0">
                            <span className="material-symbols-outlined text-2xl">verified</span>
                        </div>
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-800 bg-emerald-100 px-3 py-0.5 rounded-full">
                                Authorization Approved
                            </span>
                            <h3 className="text-lg font-black text-emerald-950 mt-1">
                                You are authorized to select your interview slot!
                            </h3>
                            <p className="text-xs font-medium text-emerald-900/80">
                                Please choose an available time slot from the schedule catalogue below. Your interview will be booked automatically upon selection.
                            </p>
                        </div>
                    </div>

                    {/* Slot Picker Form */}
                    <div className="bg-white rounded-3xl border border-blue-100 p-8 shadow-xl shadow-blue-950/5">
                        <div className="flex items-center justify-between mb-6 pb-4 border-b border-blue-50">
                            <div>
                                <h3 className="text-base font-black uppercase tracking-wider text-blue-950">
                                    Available Schedule Slots
                                </h3>
                                <p className="text-xs text-slate-500">
                                    Select the date and time that suits your availability.
                                </p>
                            </div>
                            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                                {availableSlots.length} Available Slots
                            </span>
                        </div>

                        {/* Error or Success alerts */}
                        {bookingError && (
                            <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-3">
                                <span className="material-symbols-outlined text-lg text-red-500">error</span>
                                {bookingError}
                            </div>
                        )}

                        {bookingSuccess && (
                            <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-3">
                                <span className="material-symbols-outlined text-lg text-emerald-600">check_circle</span>
                                {bookingSuccess}
                            </div>
                        )}

                        {isSlotsLoading ? (
                            <div className="p-12 text-center text-xs font-bold text-blue-400 uppercase tracking-widest">
                                Loading Schedule Catalogue...
                            </div>
                        ) : availableSlots.length === 0 ? (
                            <div className="p-12 text-center border-2 border-dashed border-slate-200 rounded-2xl">
                                <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">event_busy</span>
                                <h4 className="text-sm font-bold text-slate-700">No Interview Slots Currently Available</h4>
                                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                                    Our recruitment coordinators are currently updating the schedule catalogue. Please check back shortly or contact our support team.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {availableSlots.map((slot) => {
                                        const isSelected = selectedSlotId === slot.id;
                                        return (
                                            <button
                                                key={slot.id}
                                                type="button"
                                                onClick={() => setSelectedSlotId(slot.id)}
                                                className={`p-5 rounded-2xl text-left border-2 transition-all flex flex-col justify-between gap-3 ${
                                                    isSelected
                                                        ? 'border-blue-900 bg-blue-900 text-white shadow-xl shadow-blue-900/20 scale-[1.02]'
                                                        : 'border-slate-100 bg-slate-50/60 hover:bg-blue-50/50 hover:border-blue-200 text-blue-950'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between w-full">
                                                    <span className={`text-[10px] font-black uppercase tracking-widest ${
                                                        isSelected ? 'text-blue-200' : 'text-slate-400'
                                                    }`}>
                                                        Slot #{slot.id}
                                                    </span>
                                                    <span className="material-symbols-outlined text-base">
                                                        {isSelected ? 'check_circle' : 'radio_button_unchecked'}
                                                    </span>
                                                </div>
                                                <div>
                                                    <div className="text-sm font-black tracking-tight">
                                                        {slot.date}
                                                    </div>
                                                    <div className={`text-xs font-semibold ${isSelected ? 'text-blue-100' : 'text-slate-600'}`}>
                                                        {slot.time}
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Optional Candidate Notes */}
                                <div className="pt-6 border-t border-slate-100">
                                    <label className="block text-xs font-black uppercase tracking-wider text-blue-950 mb-2">
                                        Notes for the Interviewer (Optional)
                                    </label>
                                    <textarea
                                        value={candidateNotes}
                                        onChange={(e) => setCandidateNotes(e.target.value)}
                                        placeholder="Add any specific context, preferred contact numbers, or questions you have regarding the role..."
                                        rows={3}
                                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900"
                                    />
                                </div>

                                {/* Confirmation CTA */}
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
                                    <div className="text-xs text-slate-500 font-medium">
                                        {selectedSlotId ? (
                                            <span className="text-blue-900 font-bold">
                                                Selected Slot #{selectedSlotId} ready for confirmation.
                                            </span>
                                        ) : (
                                            'Please click a slot card above to select it.'
                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        disabled={!selectedSlotId || isBooking}
                                        onClick={handleBookSchedule}
                                        className="w-full sm:w-auto px-8 py-4 bg-blue-900 hover:bg-black disabled:opacity-50 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-900/20 active:scale-95 flex items-center justify-center gap-2"
                                    >
                                        {isBooking ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                Booking Interview...
                                            </>
                                        ) : (
                                            <>
                                                <span className="material-symbols-outlined text-base">check</span>
                                                Confirm Interview Booking
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
