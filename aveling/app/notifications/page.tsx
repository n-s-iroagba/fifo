'use client';

import React from 'react';
import { Bell } from 'lucide-react';
import { PageShell } from '../../components/PageShell';

export default function NotificationsPage() {
    const [notifications, setNotifications] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        // Endpoint pending implementation
        setTimeout(() => { setNotifications([]); setLoading(false); }, 500);
    }, []);

    return (
        <PageShell>
            <div className="mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFC700] text-black font-extrabold text-xs uppercase tracking-wider w-fit mb-3">
                    <Bell className="h-3.5 w-3.5" /> Alerts
                </div>
                <h1 className="text-4xl font-black text-zinc-900 tracking-tight">Notifications & Alerts</h1>
                <p className="text-sm font-medium text-zinc-500 mt-2">Real-time updates on certification gaps, subsidies, exams, and recruiter syncs.</p>
            </div>
            <div className="w-full h-0.5 bg-[#FFC700] mb-10" />

            {loading && (
                <div className="flex flex-col items-center justify-center py-24 space-y-5">
                    <div className="animate-spin rounded-full h-14 w-14 border-4 border-zinc-200 border-t-[#FFC700]" />
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest animate-pulse">Loading notifications...</p>
                </div>
            )}

            {!loading && notifications.length === 0 && (
                <div className="bg-white border-2 border-zinc-200 rounded-2xl p-14 shadow-sm text-center">
                    <Bell className="h-12 w-12 text-zinc-300 mx-auto mb-4" />
                    <p className="text-sm font-extrabold text-zinc-400 uppercase tracking-widest">No new notifications.</p>
                    <p className="text-xs text-zinc-400 mt-2">Updates on your certifications and sponsorships will appear here.</p>
                </div>
            )}

            {!loading && notifications.length > 0 && (
                <div className="space-y-3">
                    {notifications.map((n) => {
                        const Icon = n.icon || Bell;
                        return (
                            <div key={n.id} className="bg-white border-2 border-zinc-200 rounded-2xl p-5 shadow-md hover:border-[#FFC700] transition-all flex items-start gap-4">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FFC700]/20 text-[#FFC700]">
                                    <Icon className="h-5 w-5" />
                                </div>
                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center justify-between gap-4">
                                        <h3 className="text-sm font-extrabold text-zinc-900">{n.title}</h3>
                                        <span className="text-[10px] text-zinc-400 font-mono shrink-0">{n.time}</span>
                                    </div>
                                    <p className="text-xs text-zinc-500">{n.message}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </PageShell>
    );
}
