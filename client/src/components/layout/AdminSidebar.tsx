'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { CONSTANTS } from '@/constants';
import { useAuth } from '@/contexts/AuthContext';

const navItems = [
    { label: 'Overview', href: CONSTANTS.ROUTES.ADMIN.DASHBOARD, icon: 'analytics' },
    { label: 'Applications', href: CONSTANTS.ROUTES.ADMIN.APPLICATIONS, icon: 'assignment' },
    { label: 'Ticket Sponsorships', href: '/admin/tickets', icon: 'confirmation_number' },
    { label: 'Applicants', href: '/admin/applicants', icon: 'groups' },
    { label: 'Interests', href: '/admin/interests', icon: 'psychology' },
    { label: 'Payment Queue', href: CONSTANTS.ROUTES.ADMIN.UNVERIFIED, icon: 'account_tree' },
    { label: 'Payments', href: CONSTANTS.ROUTES.ADMIN.UNPAID, icon: 'receipt_long' },
    { label: 'Jobs', href: CONSTANTS.ROUTES.ADMIN.JOBS, icon: 'business_center' },
    { label: 'Categories', href: CONSTANTS.ROUTES.ADMIN.CATEGORIES, icon: 'layers' },
    { label: 'Benefits', href: CONSTANTS.ROUTES.ADMIN.BENEFITS, icon: 'redeem' },
    { label: 'Conditions', href: CONSTANTS.ROUTES.ADMIN.CONDITIONS, icon: 'fact_check' },
    { label: 'Mail', href: CONSTANTS.ROUTES.ADMIN.MAIL, icon: 'mail' },
    { label: 'Health', href: CONSTANTS.ROUTES.ADMIN.HEALTH, icon: 'health_and_safety' },
    { label: 'Bank Accounts', href: CONSTANTS.ROUTES.ADMIN.BANK_ACCOUNTS, icon: 'account_balance' },
    { label: 'Security', href: '/admin/security', icon: 'lock' },
];

export function AdminSidebar({
    isCollapsed,
    isMobileOpen,
    onToggle,
    onMobileClose
}: {
    isCollapsed: boolean;
    isMobileOpen: boolean;
    onToggle: () => void;
    onMobileClose: () => void;
}) {
    const pathname = usePathname();
    const { user, logout } = useAuth();

    const handleLogout = async () => {
        await logout();
    };

    const initials = user?.fullName ? user.fullName.split(' ').map((n: any) => n[0]).join('').toUpperCase() : 'AU';

    return (
        <>
            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-blue-900/60 backdrop-blur-sm z-[60] lg:hidden transition-opacity"
                    onClick={onMobileClose}
                />
            )}

            <aside
                className={`h-screen fixed left-0 top-0 bg-blue-900 flex flex-col transition-all duration-300 z-[70] font-sans text-white overflow-hidden
                    ${isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'}
                    ${isCollapsed ? 'lg:w-28' : 'lg:w-64'}
                `}
            >
                {/* Brand / Toggle Integration */}
                {/* Brand / Toggle Integration */}
                <div className={`py-10 border-b border-white/5 relative flex flex-col items-center ${isCollapsed ? 'px-0' : 'px-8 items-start'}`}>
                    <Link href="/admin" className="flex flex-col items-center lg:items-start group">
                        <div className={`flex items-center gap-3 transition-all ${isCollapsed ? 'flex-col gap-1' : 'flex-row'}`}>
                            <div className="w-10 h-10 bg-white text-blue-900 rounded-xl flex items-center justify-center font-black text-xl italic shadow-lg shadow-white/10 group-hover:scale-105 transition-transform">J</div>
                            <div className={`flex flex-col transition-all duration-300 ${isCollapsed ? 'items-center' : 'items-start'}`}>
                                <span className={`font-black italic uppercase tracking-[0.1em] text-white transition-all ${isCollapsed ? 'text-[8px]' : 'text-xl'}`}>BlueCollarRecruitment</span>
                                <span className={`font-bold text-blue-500 uppercase tracking-widest transition-all ${isCollapsed ? 'text-[6px] mt-0' : 'text-[9px] mt-1'}`}>Management Dashboard</span>
                            </div>
                        </div>
                    </Link>

                    {/* Desktop Toggle Button */}
                    <button
                        onClick={onToggle}
                        className="hidden lg:flex absolute -right-3 top-10 w-6 h-6 bg-blue-800 rounded-full items-center justify-center text-blue-400 hover:text-white border border-white/10 shadow-xl transition-all z-20"
                    >
                        <span className="material-symbols-outlined text-[14px]">
                            {isCollapsed ? 'chevron_right' : 'chevron_left'}
                        </span>
                    </button>

                    {/* Mobile Close Button */}
                    <button
                        onClick={onMobileClose}
                        className="lg:hidden absolute right-4 top-1/2 -translate-y-1/2 text-blue-400 hover:text-white"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Navigation */}
                <nav className={`flex-1 flex flex-col py-8 space-y-1 overflow-y-auto ${isCollapsed ? 'px-2' : 'px-4'}`}>
                    {navItems.map((item) => {
                        const active = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => isMobileOpen && onMobileClose()}
                                className={`flex transition-all duration-200 group rounded-xl ${isCollapsed
                                    ? 'flex-col justify-center items-center py-3 px-1 mx-auto w-24 mb-1'
                                    : 'flex-row items-center gap-4 py-3 px-6 mb-1'} ${active
                                        ? 'bg-white text-blue-900 shadow-xl shadow-white/10'
                                        : 'text-blue-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <span
                                    className={`material-symbols-outlined transition-transform group-hover:scale-110 ${active ? 'font-bold' : ''}`}
                                    style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0", fontSize: '20px' }}
                                >
                                    {item.icon}
                                </span>
                                <span className={`font-bold uppercase tracking-[0.05em] transition-all duration-300 text-center ${isCollapsed
                                    ? 'text-[10px] mt-2 opacity-100 leading-tight w-full px-1'
                                    : 'text-[10px] tracking-[0.2em]'}`}>
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Profile & Logout */}
                <div className={`p-4 border-t border-white/5 flex flex-col gap-3 ${isCollapsed ? 'items-center' : ''}`}>
                    <div className={`flex items-center bg-white/5 rounded-2xl border border-white/5 transition-all ${isCollapsed ? 'w-14 h-14 justify-center p-0 flex-col' : 'gap-4 p-4'}`}>
                        <div className={`rounded-xl bg-white text-blue-900 flex items-center justify-center font-bold overflow-hidden shadow-sm ${isCollapsed ? 'w-8 h-8 text-[10px]' : 'w-10 h-10 text-sm'}`}>
                            {initials}
                        </div>
                        {!isCollapsed && (
                            <div className="min-w-0">
                                <p className="text-[11px] font-bold text-white truncate">
                                    {user?.fullName || 'Admin'}
                                </p>
                                <p className="text-[9px] text-blue-500 uppercase font-bold tracking-widest mt-0.5">Administrator</p>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={handleLogout}
                        className={`flex items-center justify-center bg-transparent border border-white/10 text-blue-500 hover:text-red-400 hover:border-red-900/30 hover:bg-red-900/10 rounded-xl transition-all duration-200 group ${isCollapsed ? 'w-20 h-12 flex-col' : 'w-full py-4 px-4 gap-2'}`}
                        title={isCollapsed ? 'Sign Out' : ''}
                    >
                        <span className={`material-symbols-outlined transition-transform group-hover:translate-x-1 ${isCollapsed ? 'text-base' : 'text-lg'}`}>logout</span>
                        <span className={`font-bold uppercase tracking-widest ${isCollapsed ? 'text-[8px] mt-0.5' : 'text-[10px]'}`}>Sign Out</span>
                    </button>
                </div>
            </aside>
        </>
    );
}
