'use client';

import React from 'react';
import { useApiQuery, useApiMutation } from '@/lib/hooks';

interface Notification {
    id: number;
    title: string;
    message: string;
    type: string;
    isRead: boolean;
    createdAt: string;
}

export default function NotificationsPage() {
    const { data: notifications, isLoading, refetch } = useApiQuery<Notification[]>(
        ['notifications', 'user'],
        '/notifications'
    );

    const markAllReadMutation = useApiMutation('put', '/notifications/mark-all-read', {
        onSuccess: () => refetch()
    });

    const markSingleReadMutation = useApiMutation('put', '/notifications/:id/read', {
        onSuccess: () => refetch()
    });

    const handleMarkAllRead = () => {
        markAllReadMutation.mutate({});
    };

    if (isLoading) return <div className="p-12 text-center text-[10px] font-bold uppercase tracking-widest text-blue-400">Loading Updates...</div>;

    const notificationRows = (notifications as any)?.rows || [];

    return (
        <div className="font-sans text-blue-900 pb-24 max-w-4xl">
            <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.2em] block mb-2">Inbox</span>
                    <h1 className="text-3xl font-bold text-blue-900 tracking-tight">System Notifications</h1>
                </div>
                {notificationRows.length > 0 && (
                    <button
                        onClick={handleMarkAllRead}
                        className="text-[10px] font-bold text-blue-900 uppercase tracking-widest px-6 py-2.5 border border-blue-200 rounded-lg hover:bg-blue-50 transition-all flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-lg">done_all</span>
                        Mark All Read
                    </button>
                )}
            </header>

            <div className="space-y-6">
                {notificationRows.length === 0 ? (
                    <div className="py-24 text-center bg-blue-50 rounded-2xl border border-blue-100 italic">
                        <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">No New Notifications</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {notificationRows.map((n: Notification) => (
                            <div
                                key={n.id}
                                className={`p-6 rounded-2xl border transition-all flex items-start gap-6 ${!n.isRead
                                    ? 'bg-white border-blue-900 shadow-xl shadow-blue-900/5'
                                    : 'bg-blue-50 border-blue-100 opacity-60'
                                    }`}
                            >
                                <div className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${!n.isRead ? 'bg-blue-900' : 'bg-transparent'}`} />
                                <div className="flex-grow">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="text-sm font-bold text-blue-900 uppercase tracking-tight">{n.title}</h4>
                                        <span className="text-[9px] font-bold text-blue-400 uppercase tracking-widest">{new Date(n.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-sm text-blue-600 font-medium leading-relaxed mb-4">{n.message}</p>
                                    {!n.isRead && (
                                        <button
                                            onClick={() => markSingleReadMutation.mutate({ params: { id: n.id } })}
                                            className="text-[9px] font-bold text-blue-900 uppercase tracking-widest hover:underline"
                                        >
                                            Mark as Read
                                        </button>
                                    )}
                                </div>
                                <div className={`flex-shrink-0 p-2 rounded-lg ${n.type === 'SUCCESS' ? 'text-emerald-600' : n.type === 'ALERT' ? 'text-amber-600' : 'text-blue-400'}`}>
                                    <span className="material-symbols-outlined text-xl">
                                        {n.type === 'SUCCESS' ? 'check_circle' : n.type === 'ALERT' ? 'warning' : 'info'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <footer className="mt-16 p-8 rounded-2xl bg-white border border-blue-100">
                <p className="text-[10px] text-blue-400 font-bold uppercase tracking-[0.2em] mb-4">Security Notice</p>
                <p className="text-sm text-blue-500 font-medium leading-relaxed italic">
                    BlueCollarRecruitment verifies all system communications. We will never ask for your password or financial credentials via the notification stream.
                </p>
            </footer>
        </div>
    );
}
