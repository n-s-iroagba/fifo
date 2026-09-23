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
}

interface ScheduleSlot {
    id: number;
    date: string;
    time: string;
    isBooked: boolean;
    createdAt?: string;
    updatedAt?: string;
    interview?: {
        id: number;
        outcome: string;
        overview?: string;
        applicant?: InterviewApplicant;
    };
}

export default function AdminScheduleCataloguePage() {
    const { data: schedulesRes, isLoading, refetch } = useApiQuery<{ success: boolean; data: ScheduleSlot[]; count: number }>(
        ['admin-schedules'],
        '/schedule-catalogues'
    );
    const schedules = schedulesRes?.data || [];

    // Filter states
    const [filterStatus, setFilterStatus] = useState<'all' | 'available' | 'booked'>('all');
    const [searchDate, setSearchDate] = useState('');

    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSlot, setEditingSlot] = useState<ScheduleSlot | null>(null);
    const [formDate, setFormDate] = useState('');
    const [formTime, setFormTime] = useState('');
    const [formIsBooked, setFormIsBooked] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const openCreateModal = () => {
        setEditingSlot(null);
        setFormDate(new Date().toISOString().split('T')[0]);
        setFormTime('10:00 AM');
        setFormIsBooked(false);
        setIsModalOpen(true);
    };

    const openEditModal = (slot: ScheduleSlot) => {
        setEditingSlot(slot);
        setFormDate(slot.date);
        setFormTime(slot.time);
        setFormIsBooked(slot.isBooked);
        setIsModalOpen(true);
    };

    const handleSaveSlot = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formDate || !formTime) {
            alert('Please select both a date and time.');
            return;
        }

        setIsSubmitting(true);
        try {
            if (editingSlot) {
                await api.put(`/admin/schedule-catalogues/${editingSlot.id}`, {
                    date: formDate,
                    time: formTime,
                    isBooked: formIsBooked,
                });
                alert('Schedule slot updated successfully.');
            } else {
                await api.post('/admin/schedule-catalogues', {
                    date: formDate,
                    time: formTime,
                });
                alert('Schedule slot added to catalogue.');
            }
            setIsModalOpen(false);
            refetch();
        } catch (err: any) {
            alert(err.response?.data?.error || 'Failed to save schedule slot.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this schedule slot? If an interview was booked, it will also be cancelled.')) return;
        try {
            await api.delete(`/admin/schedule-catalogues/${id}`);
            refetch();
        } catch (err: any) {
            alert(err.response?.data?.error || 'Failed to delete schedule slot.');
        }
    };

    // Filter calculations
    const filteredSchedules = schedules.filter((s) => {
        const matchesStatus =
            filterStatus === 'all' ||
            (filterStatus === 'available' && !s.isBooked) ||
            (filterStatus === 'booked' && s.isBooked);
        const matchesDate = !searchDate || s.date.includes(searchDate);
        return matchesStatus && matchesDate;
    });

    const totalSlots = schedules.length;
    const availableSlots = schedules.filter((s) => !s.isBooked).length;
    const bookedSlots = schedules.filter((s) => s.isBooked).length;

    const timePresets = [
        '09:00 AM',
        '09:30 AM',
        '10:00 AM',
        '10:30 AM',
        '11:00 AM',
        '11:30 AM',
        '01:00 PM',
        '01:30 PM',
        '02:00 PM',
        '02:30 PM',
        '03:00 PM',
        '03:30 PM',
        '04:00 PM',
    ];

    if (isLoading) {
        return <div className="p-12 text-center text-[10px] font-bold uppercase tracking-widest text-blue-400">Loading Schedule Catalogue...</div>;
    }

    return (
        <div className="font-sans antialiased text-blue-900 pb-24">
            {/* Header */}
            <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.2em] block mb-1">
                        Administration &bull; Interview Operations
                    </span>
                    <h1 className="text-3xl font-black text-blue-900 tracking-tight uppercase">
                        Schedule Catalogue
                    </h1>
                    <p className="text-sm text-slate-500 mt-2 max-w-xl">
                        Maintain available interview appointment slots. Authorized applicants can choose slots from this catalogue to automatically schedule their interviews.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Link
                        href="/admin/interviews"
                        className="px-4 py-2.5 rounded-xl border border-blue-200 bg-white hover:bg-blue-50 text-blue-900 font-bold text-xs uppercase tracking-wider transition-all shadow-xs inline-flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-base">video_camera_front</span>
                        View Interviews
                    </Link>
                    <button
                        type="button"
                        onClick={openCreateModal}
                        className="px-5 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-blue-900/10 inline-flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-base">add</span>
                        Add Schedule Slot
                    </button>
                </div>
            </header>

            {/* Quick Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
                <div className="bg-white p-6 rounded-2xl border border-blue-100 shadow-sm flex items-center justify-between">
                    <div>
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1">
                            Total Slots in Catalogue
                        </span>
                        <span className="text-2xl font-black text-blue-900">{totalSlots}</span>
                    </div>
                    <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-900 flex items-center justify-center font-bold">
                        <span className="material-symbols-outlined">calendar_month</span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-blue-100 shadow-sm flex items-center justify-between">
                    <div>
                        <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600 block mb-1">
                            Available for Booking
                        </span>
                        <span className="text-2xl font-black text-emerald-600">{availableSlots}</span>
                    </div>
                    <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                        <span className="material-symbols-outlined">event_available</span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-blue-100 shadow-sm flex items-center justify-between">
                    <div>
                        <span className="text-[9px] font-black uppercase tracking-widest text-blue-600 block mb-1">
                            Booked Interviews
                        </span>
                        <span className="text-2xl font-black text-blue-900">{bookedSlots}</span>
                    </div>
                    <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                        <span className="material-symbols-outlined">how_to_reg</span>
                    </div>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white p-4 rounded-2xl border border-blue-100 shadow-sm mb-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                <div className="flex items-center gap-1.5 p-1 bg-blue-50/60 rounded-xl overflow-x-auto">
                    <button
                        type="button"
                        onClick={() => setFilterStatus('all')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                            filterStatus === 'all'
                                ? 'bg-blue-900 text-white shadow-xs'
                                : 'text-slate-600 hover:text-blue-900'
                        }`}
                    >
                        All Slots ({totalSlots})
                    </button>
                    <button
                        type="button"
                        onClick={() => setFilterStatus('available')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                            filterStatus === 'available'
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'text-slate-600 hover:text-emerald-700'
                        }`}
                    >
                        Available Only ({availableSlots})
                    </button>
                    <button
                        type="button"
                        onClick={() => setFilterStatus('booked')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                            filterStatus === 'booked'
                                ? 'bg-blue-900 text-white shadow-xs'
                                : 'text-slate-600 hover:text-blue-900'
                        }`}
                    >
                        Booked ({bookedSlots})
                    </button>
                </div>

                <div className="flex items-center gap-3">
                    <label className="text-xs font-bold text-slate-500 whitespace-nowrap">Filter Date:</label>
                    <input
                        type="date"
                        value={searchDate}
                        onChange={(e) => setSearchDate(e.target.value)}
                        className="bg-slate-50 border border-blue-100 rounded-xl px-3 py-1.5 text-xs text-blue-900 focus:outline-none focus:border-blue-900"
                    />
                    {searchDate && (
                        <button
                            type="button"
                            onClick={() => setSearchDate('')}
                            className="text-xs text-slate-400 hover:text-slate-700"
                        >
                            Clear
                        </button>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-3xl border border-blue-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-blue-50/50 text-[10px] font-bold uppercase tracking-widest text-blue-400 border-b border-blue-100">
                            <tr>
                                <th className="p-4 pl-6">Scheduled Date</th>
                                <th className="p-4">Time Window</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Linked Applicant</th>
                                <th className="p-4 pr-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-blue-50 font-medium text-slate-700">
                            {filteredSchedules.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-12 text-center text-slate-400 italic">
                                        No schedule catalogue slots found matching current criteria.
                                    </td>
                                </tr>
                            ) : (
                                filteredSchedules.map((slot) => {
                                    const formattedDate = new Date(slot.date + 'T00:00:00').toLocaleDateString(undefined, {
                                        weekday: 'short',
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric',
                                    });

                                    return (
                                        <tr key={slot.id} className="hover:bg-blue-50/30 transition-colors">
                                            <td className="p-4 pl-6 font-bold text-blue-900">
                                                <div className="flex items-center gap-2.5">
                                                    <span className="material-symbols-outlined text-base text-blue-400">calendar_today</span>
                                                    <span>{formattedDate}</span>
                                                    <span className="text-[10px] text-slate-400 font-normal">({slot.date})</span>
                                                </div>
                                            </td>
                                            <td className="p-4 font-bold text-slate-800">
                                                <span className="bg-slate-100 text-slate-800 px-2.5 py-1 rounded-md text-[11px]">
                                                    ⏰ {slot.time}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                {slot.isBooked ? (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-900 border border-blue-200">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-700" />
                                                        Booked
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                        Available
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                {slot.interview?.applicant ? (
                                                    <div className="flex flex-col">
                                                        <Link
                                                            href={`/admin/applicants/${slot.interview.applicant.id}`}
                                                            className="font-bold text-blue-900 hover:underline flex items-center gap-1"
                                                        >
                                                            <span>{slot.interview.applicant.fullName}</span>
                                                            <span className="text-[10px] text-blue-400">↗</span>
                                                        </Link>
                                                        <span className="text-[11px] text-slate-400">
                                                            {slot.interview.applicant.email}
                                                        </span>
                                                        {slot.interview.applicant.candidateNumber && (
                                                            <span className="text-[10px] font-bold text-indigo-600">
                                                                #{slot.interview.applicant.candidateNumber}
                                                            </span>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-400 italic text-[11px]">Unassigned</span>
                                                )}
                                            </td>
                                            <td className="p-4 pr-6 text-right space-x-2">
                                                <button
                                                    type="button"
                                                    onClick={() => openEditModal(slot)}
                                                    className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-900 text-[10px] font-bold uppercase tracking-wider transition-colors"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(slot.id)}
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

            {/* Create / Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-blue-950/60 backdrop-blur-sm animate-in fade-in duration-150">
                    <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-blue-100 shadow-2xl">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
                            <div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-blue-400 block">
                                    Schedule Management
                                </span>
                                <h3 className="text-lg font-black text-blue-900">
                                    {editingSlot ? 'Edit Schedule Slot' : 'Create Catalogue Slot'}
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-xs font-bold"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSaveSlot} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Interview Date <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    required
                                    value={formDate}
                                    onChange={(e) => setFormDate(e.target.value)}
                                    className="w-full bg-slate-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-900 focus:outline-none focus:border-blue-900"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Time Slot <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. 10:00 AM or 14:30"
                                    value={formTime}
                                    onChange={(e) => setFormTime(e.target.value)}
                                    className="w-full bg-slate-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-900 focus:outline-none focus:border-blue-900 mb-2"
                                />

                                <div className="text-[10px] text-slate-400 font-bold mb-1">Quick Select Preset:</div>
                                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                                    {timePresets.map((tp) => (
                                        <button
                                            key={tp}
                                            type="button"
                                            onClick={() => setFormTime(tp)}
                                            className={`px-2 py-1 rounded-md text-[10px] font-bold border transition-colors ${
                                                formTime === tp
                                                    ? 'bg-blue-900 text-white border-blue-900'
                                                    : 'bg-white border-slate-200 text-slate-600 hover:bg-blue-50'
                                            }`}
                                        >
                                            {tp}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {editingSlot && (
                                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                                    <div>
                                        <span className="text-xs font-bold text-slate-800 block">Slot Booking Status</span>
                                        <span className="text-[10px] text-slate-500">Toggle whether this slot is reserved</span>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formIsBooked}
                                            onChange={(e) => setFormIsBooked(e.target.checked)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-900"></div>
                                    </label>
                                </div>
                            )}

                            <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-5 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-xs font-black uppercase tracking-wider disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Saving...' : editingSlot ? 'Update Slot' : 'Add to Catalogue'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
