'use client';

// STEP-029
import React from 'react';
import { Bell, Tag, CheckCircle2, Award, Calendar, AlertCircle } from 'lucide-react';

export default function NotificationsPage() {
    const [notifications, setNotifications] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchNotifications = async () => {
            try {
                // Endpoint might not exist yet, removing hardcoded fallback
                // const res = await apiClient.get('/notifications/me');
                // if (res.data?.data) setNotifications(res.data.data);
                setNotifications([]);
            } catch {
                setNotifications([]);
            } finally {
                setLoading(false);
            }
        };
        fetchNotifications();
    }, []);

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
                {loading && <div className="text-xs text-zinc-500 font-bold p-4">Loading notifications...</div>}
                {!loading && notifications.length === 0 && (
                    <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm text-center dark:border-zinc-800 dark:bg-zinc-900">
                        <p className="text-xs font-bold text-zinc-500">No new notifications.</p>
                    </div>
                )}
                {!loading && notifications.map((n) => {
                    const Icon = n.icon || Bell;
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
