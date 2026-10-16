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
    const [showScamModal, setShowScamModal] = useState(false);

    useEffect(() => {
        const savedState = localStorage.getItem('applicantSidebarCollapsed');
        if (savedState !== null) {
            setIsCollapsed(JSON.parse(savedState));
        }

        const scamDismissed = sessionStorage.getItem('bcr_scam_modal_dismissed');
        if (!scamDismissed) {
            setShowScamModal(true);
        }
    }, []);

    const dismissScamModal = () => {
        sessionStorage.setItem('bcr_scam_modal_dismissed', 'true');
        setShowScamModal(false);
    };

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

            {/* Beware of Scam Modal */}
            {showScamModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl p-6 sm:p-7 relative">
                        <div className="flex items-start justify-between gap-4 mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
                                    <span className="material-symbols-outlined text-amber-600 text-xl">security</span>
                                </div>
                                <div>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-amber-700 block">
                                        Security Notice
                                    </span>
                                    <h3 className="text-base font-extrabold text-slate-900 uppercase tracking-tight">
                                        BEWARE OF SCAM
                                    </h3>
                                </div>
                            </div>
                            <button
                                onClick={dismissScamModal}
                                aria-label="Close modal"
                                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
                            >
                                <span className="material-symbols-outlined text-lg">close</span>
                            </button>
                        </div>

                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl mb-6">
                            <p className="text-xs text-slate-700 leading-relaxed font-semibold">
                                &ldquo;Legitimate companies do not ask for payment to get a job, however they help you offset cost for training.&rdquo;
                            </p>
                        </div>

                        <div className="flex justify-end">
                            <button
                                onClick={dismissScamModal}
                                className="w-full sm:w-auto px-5 py-2.5 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
                            >
                                I Understand
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
