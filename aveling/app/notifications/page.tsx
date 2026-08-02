'use client';

// STEP-029
import React from 'react';
import { Bell, Tag, CheckCircle2, Award, Calendar, AlertCircle } from 'lucide-react';

export default function NotificationsPage() {
    const notifications = [
        {
            id: 'n1',
            title: 'Recruiter Subsidy Applied!',
            message: 'Your recruiter has applied a 100% full subsidy ($280.00) for RIIWHS204E Work Safely at Heights.',
            time: '2 hours ago',
            icon: Tag,
            type: 'subsidy'
        },
        {
            id: 'n2',
            title: 'Theory Exam Result: Passed (100%)',
            message: 'You successfully passed your theory exam for Work Safely at Heights. Practical session booking unlocked!',
            time: '4 hours ago',
            icon: CheckCircle2,
            type: 'exam'
        },
        {
            id: 'n3',
            title: 'Practical Assessment Booked',
            message: 'Slot confirmed for Monday, 10 August 2026 at Aveling Perth Complex Zone B.',
            time: '1 day ago',
            icon: Calendar,
            type: 'booking'
        },
        {
            id: 'n4',
            title: 'New Certification Gap Assigned',
            message: 'Admin flagged First Aid & CPR (HLTAID011) as expired on your profile.',
            time: '3 days ago',
            icon: AlertCircle,
            type: 'gap'
        }
    ];

    return (
        <div className="space-y-6">
            <div className="border-b border-zinc-200 pb-4 dark:border-zinc-800">
                <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
                    <Bell className="h-7 w-7 text-amber-600" />
                    Notifications & Alerts Center
                </h1>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                    Real-time updates regarding your certification gaps, subsidies, exams, and recruiter syncs.
                </p>
            </div>

            <div className="space-y-3">
                {notifications.map((n) => {
                    const Icon = n.icon;
                    return (
                        <div key={n.id} className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 flex items-start gap-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
                                <Icon className="h-5 w-5" />
                            </div>
                            <div className="flex-1 space-y-1">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-bold text-zinc-900 dark:text-white">{n.title}</h3>
                                    <span className="text-[10px] text-zinc-400 font-mono">{n.time}</span>
                                </div>
                                <p className="text-xs text-zinc-600 dark:text-zinc-400">{n.message}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
