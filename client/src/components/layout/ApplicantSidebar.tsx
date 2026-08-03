'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CONSTANTS } from '@/constants';
import { useAuth } from '@/contexts/AuthContext';
import { useApiQuery } from '@/lib/hooks';

const navItems = [
    { label: 'Dashboard', href: CONSTANTS.ROUTES.DASHBOARD, icon: 'dashboard' },
    { label: 'My Applications', href: CONSTANTS.ROUTES.APPLICATIONS, icon: 'work' },
    { label: 'Active Opportunities', href: CONSTANTS.ROUTES.JOBS, icon: 'search' },
    { label: 'CV / Resume', href: CONSTANTS.ROUTES.CV, icon: 'description' },
    { label: 'Tickets & Sponsorship', href: '/dashboard/tickets', icon: 'confirmation_number' },
    { label: 'Bio', href: CONSTANTS.ROUTES.PROFILE, icon: 'person' },
    { label: 'Notifications', href: CONSTANTS.ROUTES.NOTIFICATIONS, icon: 'notifications' },

];

export function ApplicantSidebar({
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

    // Fetch notifications to check for unread status
    const { data: notifications } = useApiQuery<any>(
        ['notifications', 'sidebar'],
        '/notifications',
        {
            refetchInterval: 60000, // Refresh every minute
            enabled: !!user
        }
    );

    const hasUnread = notifications?.rows?.some((n: any) => !n.isRead);

    const handleLogout = async () => {
        await logout();
    };

    const initials = user?.fullName ? user.fullName.split(' ').map((n: any) => n[0]).join('').toUpperCase() : 'AP';

    return (
        <>
            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-blue-900/40 backdrop-blur-sm z-[60] lg:hidden transition-opacity"
                    onClick={onMobileClose}
                />
            )}

            <aside
                className={`h-screen fixed left-0 top-0 bg-white flex flex-col transition-all duration-300 z-[70] border-r border-blue-100 font-sans text-blue-900 overflow-hidden
                    ${isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'}
                    ${isCollapsed ? 'lg:w-28' : 'lg:w-64'}
                `}
            >
                {/* Brand / Toggle Integration */}
                <div className={`py-10 border-b border-blue-50 relative flex items-center ${isCollapsed ? 'justify-center' : 'px-8'}`}>
                    <Link href="/" className={`${isCollapsed ? 'hidden' : 'flex flex-col'}`}>
                        <span className="text-xl font-black italic uppercase tracking-[0.1em] text-blue-900">BlueCollar</span>
                        <span className="text-[9px] font-bold text-blue-400 uppercase tracking-widest mt-1">Career Portal</span>
                    </Link>
                    {isCollapsed && (
                        <div className="w-10 h-10 bg-blue-900 rounded-xl flex items-center justify-center text-white font-black text-xl italic shadow-lg shadow-blue-900/10">J</div>
                    )}

                    {/* Desktop Toggle Button */}
                    <button
                        onClick={onToggle}
                        className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white border border-blue-200 rounded-full items-center justify-center text-blue-400 hover:text-blue-900 shadow-sm transition-all"
                    >
                        <span className="material-symbols-outlined text-[14px]">
                            {isCollapsed ? 'chevron_right' : 'chevron_left'}
                        </span>
                    </button>

                    {/* Mobile Close Button */}
                    <button
                        onClick={onMobileClose}
                        className="lg:hidden absolute right-4 top-1/2 -translate-y-1/2 text-blue-400"
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
                                title={isCollapsed ? item.label : ''}
                                className={`flex transition-all duration-200 group rounded-xl ${isCollapsed
                                    ? 'flex-col justify-center items-center py-3 px-1 mx-auto w-24 mb-1'
                                    : 'gap-4 py-3.5 px-6'} ${active
                                        ? 'bg-blue-900 text-white shadow-xl shadow-blue-900/10'
                                        : 'text-blue-500 hover:text-blue-900 hover:bg-blue-50'
                                    }`}
                            >
                                <span className={`material-symbols-outlined transition-transform group-hover:scale-110 relative ${active ? 'font-bold' : ''}`} style={{ fontSize: '20px' }}>
                                    {item.icon}
                                    {item.label === 'Notifications' && hasUnread && (
                                        <span className="absolute top-0 right-0 w-2 h-2 bg-red-600 rounded-full border border-white animate-pulse" />
                                    )}
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
                <div className={`p-4 border-t border-blue-50 ${isCollapsed ? 'flex flex-col items-center gap-4' : ''}`}>
                    <div className={`flex items-center bg-blue-50 rounded-2xl border border-blue-100/50 transition-all ${isCollapsed ? 'w-12 h-12 justify-center p-0' : 'gap-4 p-4 mb-4'}`}>
                        <div className={`rounded-xl bg-blue-900 text-white flex items-center justify-center font-bold overflow-hidden ${isCollapsed ? 'w-10 h-10 text-xs' : 'w-10 h-10 text-sm'}`}>
                            {initials}
                        </div>
                        {!isCollapsed && (
                            <div className="min-w-0">
                                <p className="text-[11px] font-bold text-blue-900 truncate">
                                    {user?.fullName || 'Applicant'}
                                </p>
                                <p className="text-[9px] text-blue-400 uppercase font-bold tracking-widest mt-0.5">Candidate</p>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={handleLogout}
                        className={`flex items-center justify-center bg-white border border-blue-200 text-blue-400 hover:text-red-600 hover:border-red-100 hover:bg-red-50 rounded-xl transition-all duration-200 group ${isCollapsed ? 'w-12 h-12' : 'w-full py-4 px-4 gap-2'}`}
                        title={isCollapsed ? 'Sign Out' : ''}
                    >
                        <span className="material-symbols-outlined text-lg transition-transform group-hover:translate-x-1" style={{ fontSize: '18px' }}>logout</span>
                        {!isCollapsed && <span className="text-[10px] font-bold uppercase tracking-widest">Sign Out</span>}
                    </button>
                </div>
            </aside>
        </>
    );
}
