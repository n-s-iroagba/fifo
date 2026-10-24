'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, ShieldCheck } from 'lucide-react';
import { PageShell } from '@/components/PageShell';

export default function NotificationsPage() {
    const router = useRouter();
    const [notifications, setNotifications] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const token = typeof window !== 'undefined' ? (localStorage.getItem('lms_token') || localStorage.getItem('accessToken')) : null;
        const user = typeof window !== 'undefined' ? localStorage.getItem('lms_user') : null;
        if (!token && !user) {
            router.push('/login?redirect=/notifications');
            return;
        }

        setTimeout(() => { setNotifications([]); setLoading(false); }, 400);
    }, [router]);

    return (
        <PageShell>
            <div className="mb-6">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ED9139]/10 text-[#ED9139] font-bold text-xs uppercase tracking-wider w-fit mb-2">
                    <ShieldCheck className="h-3.5 w-3.5" /> LMS System Alerts
                </div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Notifications & Compliance Alerts</h1>
                <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1 max-w-2xl">
                    Real-time operational alerts regarding course enrollment milestones, exam outcomes, and Statement of Attainment synchronisations.
                </p>
            </div>
            <div className="w-full h-0.5 bg-[#ED9139] mb-8" />

            {loading && (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-[#ED9139]" />
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest animate-pulse">
                        Loading notifications...
                    </p>
                </div>
            )}

            {!loading && notifications.length === 0 && (
                <div className="bg-white border border-slate-200 rounded-2xl p-12 shadow-sm text-center max-w-lg mx-auto">
                    <Bell className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">No active alerts.</p>
                    <p className="text-xs text-slate-400 mt-1">
                        Updates regarding course approvals, exam grades, and compliance files will appear here.
                    </p>
                </div>
            )}

            {!loading && notifications.length > 0 && (
                <div className="space-y-3">
                    {notifications.map((n) => {
                        const Icon = n.icon || Bell;
                        return (
                            <div
                                key={n.id}
                                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-slate-300 transition-all flex items-start gap-4"
                            >
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#ED9139]/10 text-[#ED9139]">
                                    <Icon className="h-5 w-5" />
                                </div>
                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center justify-between gap-4">
                                        <h3 className="text-sm font-bold text-slate-900">{n.title}</h3>
                                        <span className="text-[10px] text-slate-400 font-mono shrink-0">{n.time}</span>
                                    </div>
                                    <p className="text-xs text-slate-600">{n.message}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </PageShell>
    );
}
