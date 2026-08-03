'use client';

// STEP-019, STEP-020
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Calendar, MapPin, Users, CheckCircle2, Lock, ShieldCheck, ArrowRight, Clock, ChevronRight } from 'lucide-react';
import { apiClient } from '../../../../lib/axios';

export default function PracticalSchedulingPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
    const [bookingSuccess, setBookingSuccess] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [isTheoryComplete, setIsTheoryComplete] = useState<boolean>(false);
    const [availableSlots, setAvailableSlots] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPrerequisitesAndSlots = async () => {
            try {
                // Check theory gate
                const checkRes = await apiClient.get(`/practical-sessions/prerequisite-check/${params.id}`);
                setIsTheoryComplete(checkRes.data?.data?.cleared || false);

                // Fetch real slots
                const slotsRes = await apiClient.get('/practical-sessions/available-slots');
                setAvailableSlots(slotsRes.data?.data || []);
            } catch (e) {
                console.error("Failed to load practical session data:", e);
                setIsTheoryComplete(false);
                setAvailableSlots([]);
            } finally {
                setLoading(false);
            }
        };

        fetchPrerequisitesAndSlots();
    }, [params.id]);

    const handleConfirmBooking = async () => {
        if (!selectedSlot) return;
        setSubmitting(true);
        try {
            await apiClient.post('/practical-sessions/bookings', {
                sessionId: selectedSlot,
                courseId: params.id
            });
            setBookingSuccess(true);
        } catch (e) {
            console.error("Failed to book slot:", e);
            alert("Failed to book slot. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="p-12 text-center text-xs font-bold text-amber-600">Loading Practical Schedule...</div>;

    return (
        <div className="mx-auto max-w-4xl space-y-6 py-4">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500">
                <Link href={`/courses/${params.id}`} className="hover:text-zinc-900 dark:hover:text-white">Course Player</Link>
                <ChevronRight className="h-3 w-3" />
                <span>Practical Training Booking</span>
            </div>

            {/* Header */}
            <div className="border-b border-zinc-200 pb-4 dark:border-zinc-800">
                <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
                    <Calendar className="h-7 w-7 text-purple-600" />
                    Book Practical Assessment Session
                </h1>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                    RIIWHS204E - Work Safely at Heights (Practical Rigging & Height Assessment)
                </p>
            </div>

            {/* STEP-019: Prerequisites Check Gate */}
            {!isTheoryComplete ? (
                <div className="rounded-2xl border border-amber-300 bg-amber-50 p-8 shadow-sm dark:border-amber-900 dark:bg-amber-950/60 text-center space-y-4">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300">
                        <Lock className="h-8 w-8" />
                    </div>
                    <div className="space-y-1">
                        <h2 className="text-lg font-bold text-amber-950 dark:text-amber-100">Prerequisite Gate Locked</h2>
                        <p className="text-xs text-amber-800 dark:text-amber-300 max-w-md mx-auto">
                            Under certifying body guidelines, you must complete the theory courseware and pass the theory examination before booking a physical practical session.
                        </p>
                    </div>
                    <Link
                        href={`/courses/${params.id}`}
                        className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-amber-500"
                    >
                        Resume Theory Modules
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            ) : bookingSuccess ? (
                /* Booking Confirmation */
                <div className="rounded-2xl border border-purple-200 bg-white p-8 shadow-xl dark:border-purple-900 dark:bg-zinc-900 text-center space-y-6">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-400">
                        <CheckCircle2 className="h-10 w-10" />
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-2xl font-extrabold text-zinc-900 dark:text-white">Practical Slot Confirmed!</h2>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">
                            Your practical assessment booking has been registered with the training facility.
                        </p>
                    </div>

                    <div className="mx-auto max-w-md rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-left dark:border-zinc-800 dark:bg-zinc-950 text-xs space-y-2">
                        <div className="flex justify-between">
                            <span className="text-zinc-500">Date & Time:</span>
                            <span className="font-bold text-zinc-900 dark:text-white">Monday, 10 August 2026 (08:00 AM)</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-zinc-500">Venue:</span>
                            <span className="font-bold text-zinc-900 dark:text-white">Aveling Perth Complex - Zone B</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-zinc-500">Instructor:</span>
                            <span className="font-bold text-zinc-900 dark:text-white">Capt. Marcus Vance</span>
                        </div>
                    </div>

                    <div className="pt-4">
                        <Link
                            href="/my-certifications"
                            className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-amber-600/20 hover:bg-amber-500 transition-all"
                        >
                            Return to My Certifications Dashboard
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </div>
            ) : (
                /* STEP-020: Practical Slot Selector */
                <div className="space-y-6">
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-950/40 text-xs text-emerald-900 dark:text-emerald-200 flex items-center gap-2 font-medium">
                        <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0" />
                        <span>Theory Prerequisite Passed (100%). You are verified eligible for physical practical training.</span>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-base font-bold text-zinc-900 dark:text-white">Select an Available Assessment Slot:</h2>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            {availableSlots.map((slot) => {
                                const isSelected = selectedSlot === slot.id;
                                return (
                                    <div
                                        key={slot.id}
                                        onClick={() => setSelectedSlot(slot.id)}
                                        className={`cursor-pointer rounded-2xl border p-5 transition-all shadow-sm flex flex-col justify-between ${
                                            isSelected
                                                ? 'border-purple-600 bg-purple-50/70 text-purple-950 dark:border-purple-500 dark:bg-purple-950/60 dark:text-purple-100 ring-2 ring-purple-600/20'
                                                : 'border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800'
                                        }`}
                                    >
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-extrabold text-purple-600 dark:text-purple-400">{slot.date}</span>
                                                <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-bold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                                                    {slot.capacityRemaining} slots left
                                                </span>
                                            </div>

                                            <p className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                                                <Clock className="h-4 w-4 text-purple-600" />
                                                {slot.time}
                                            </p>

                                            <div className="text-xs text-zinc-600 dark:text-zinc-400 space-y-1 pt-2">
                                                <p className="flex items-start gap-1">
                                                    <MapPin className="h-3.5 w-3.5 text-zinc-400 shrink-0 mt-0.5" />
                                                    <span><strong>{slot.facility}</strong> ({slot.location})</span>
                                                </p>
                                                <p className="flex items-center gap-1">
                                                    <Users className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                                                    Assessor: {slot.instructor}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
                                            <span className={`text-xs font-bold ${isSelected ? 'text-purple-700 dark:text-purple-300' : 'text-zinc-400'}`}>
                                                {isSelected ? '✓ Selected' : 'Click to Select'}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            onClick={handleConfirmBooking}
                            disabled={!selectedSlot || submitting}
                            className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-purple-600/20 hover:bg-purple-500 transition-all disabled:opacity-50"
                        >
                            Confirm Booking Slot
                            <ArrowRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
