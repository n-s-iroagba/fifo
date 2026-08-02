'use client';

import React, { useEffect, useState } from 'react';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { useRouter } from 'next/navigation';
import { CONSTANTS } from '@/constants';

import { useAuth } from '@/contexts/AuthContext';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const { user, isLoading } = useAuth();
    const [authorized, setAuthorized] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    useEffect(() => {
        const savedState = localStorage.getItem('adminSidebarCollapsed');
        if (savedState !== null) {
            setIsCollapsed(JSON.parse(savedState));
        }
    }, []);

    useEffect(() => {
        if (!isLoading) {
            if (!user) {
                router.push(CONSTANTS.ROUTES.LOGIN);
                return;
            }

            if (user.role !== CONSTANTS.ROLES.ADMIN) {
                router.push(CONSTANTS.ROUTES.DASHBOARD);
                return;
            }

            setAuthorized(true);
        }
    }, [user, isLoading, router]);

    const toggleDesktop = () => {
        const newState = !isCollapsed;
        setIsCollapsed(newState);
        localStorage.setItem('adminSidebarCollapsed', JSON.stringify(newState));
    };

    if (!authorized) return null;

    return (
        <div className="flex min-h-screen bg-white overflow-x-hidden font-sans antialiased text-blue-900">
            {/* Mobile Header Trigger */}
            <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-blue-100 flex items-center justify-between px-6 z-[60]">
                <span className="text-lg font-black italic uppercase tracking-widest text-blue-900">BlueCollarRecruitment</span>
                <button
                    onClick={() => setIsMobileOpen(true)}
                    className="w-10 h-10 flex items-center justify-center text-blue-400"
                >
                    <span className="material-symbols-outlined">menu</span>
                </button>
            </header>

            <AdminSidebar
                isCollapsed={isCollapsed}
                isMobileOpen={isMobileOpen}
                onToggle={toggleDesktop}
                onMobileClose={() => setIsMobileOpen(false)}
            />

            {/* Main Content */}
            <main className={`flex-1 transition-all duration-300 min-w-0 pt-16 lg:pt-0 ${isCollapsed ? 'lg:ml-28' : 'lg:ml-64'}`}>
                <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-8 lg:py-12">
                    {children}
                </div>
            </main>
        </div>
    );
}
