'use client';

import React, { useEffect, useState } from 'react';
import { ApplicantSidebar } from '@/components/layout/ApplicantSidebar';
import { useApiQuery } from '@/lib/hooks';

function NotificationIndicator() {
    const { data: notifications } = useApiQuery<any>(
        ['notifications', 'sidebar'],
        '/notifications',
        { refetchInterval: 60000 }
    );
    const hasUnread = notifications?.rows?.some((n: any) => !n.isRead);

    if (!hasUnread) return null;

    return (
        <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-600 rounded-full border-2 border-white animate-pulse" />
    );
}

export default function ApplicantLayout({ children }: { children: React.ReactNode }) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    useEffect(() => {
        const savedState = localStorage.getItem('applicantSidebarCollapsed');
        if (savedState !== null) {
            setIsCollapsed(JSON.parse(savedState));
        }
    }, []);

    const toggleDesktop = () => {
        const newState = !isCollapsed;
        setIsCollapsed(newState);
        localStorage.setItem('applicantSidebarCollapsed', JSON.stringify(newState));
    };

    return (
        <div className="flex min-h-screen bg-white overflow-x-hidden font-sans antialiased text-blue-900">
            {/* Mobile Header Trigger */}
            <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-blue-100 flex items-center justify-between px-6 z-[60]">
                <span className="text-lg font-black italic uppercase tracking-widest">BlueCollar</span>
                <button
                    onClick={() => setIsMobileOpen(true)}
                    className="w-10 h-10 flex items-center justify-center text-blue-400 relative"
                >
                    <span className="material-symbols-outlined">menu</span>
                    <NotificationIndicator />
                </button>
            </header>

            <ApplicantSidebar
                isCollapsed={isCollapsed}
                isMobileOpen={isMobileOpen}
                onToggle={toggleDesktop}
                onMobileClose={() => setIsMobileOpen(false)}
            />

            {/* Main Content */}
            <main className={`flex-1 transition-all duration-300 min-w-0 pt-16 lg:pt-0 ${isCollapsed ? 'lg:ml-28' : 'lg:ml-64'}`}>
                <div className="max-w-[1280px] mx-auto px-4 md:px-8 py-8 lg:py-12">
                    {children}
                </div>
            </main>
        </div>
    );
}
