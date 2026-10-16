'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Award, BookOpen, CreditCard, LogOut, User, Search, Menu, X, ShieldCheck, LayoutDashboard } from 'lucide-react';

export function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const [user, setUser] = useState<{ fullName?: string; name?: string; role?: string; candidateNumber?: string } | null>(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem('lms_user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                // ignore
            }
        }
    }, [pathname]);

    const handleLogout = () => {
        localStorage.removeItem('lms_token');
        localStorage.removeItem('lms_user');
        setUser(null);
        router.push('/login');
    };

    if (pathname === '/login') return null;

    const publicNavLinks = [
        { name: 'Home', href: '/', icon: Award },
        { name: 'Course Catalog', href: '/catalog', icon: BookOpen },
    ];

    const signedInNavLinks = [
        { name: 'Home', href: '/', icon: Award },
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Course Catalog', href: '/catalog', icon: BookOpen },
        { name: 'My Certifications', href: '/my-certifications', icon: ShieldCheck },
        { name: 'Payments', href: '/payments', icon: CreditCard },
    ];

    const currentNavLinks = user ? signedInNavLinks : publicNavLinks;

    return (
        <header className="sticky top-0 z-50 bg-[#0f172a] text-white border-b border-slate-800 shadow-md">
            {/* Top compliance ribbon */}
            <div className="bg-[#090d16] border-b border-slate-800/80 px-4 py-1 text-[11px] text-slate-300">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#ED9139]" />
                        <span>Registered Training Organisation Partner • Nationally Recognised Training (NRT) • AQF Compliant</span>
                    </div>
                    <div className="hidden sm:flex items-center gap-4 text-slate-400">
                        <span>ASQA Accredited Standards</span>
                        <span>•</span>
                        <a href="https://www.certhero.com.au" target="_blank" rel="noreferrer" className="hover:text-[#ED9139] transition-colors">
                            certhero.com.au ↗
                        </a>
                    </div>
                </div>
            </div>

            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                {/* Brand Logo */}
                <div className="flex items-center gap-8">
                    <Link href="/" className="flex items-center gap-2.5 group">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#ED9139] text-[#0f172a] font-black text-lg shadow-sm group-hover:bg-[#dd7f26] transition-colors">
                            C
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xl font-black tracking-tight text-white leading-none">
                                Cert<span className="text-[#ED9139]">Hero</span>
                            </span>
                            <span className="text-[9px] font-bold tracking-widest text-slate-400 uppercase mt-0.5">
                                RTO Training Portal
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Navigation Links */}
                    <nav className="hidden md:flex md:items-center md:gap-1">
                        {currentNavLinks.map((link) => {
                            const Icon = link.icon;
                            const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-semibold transition-all ${isActive
                                        ? 'bg-[#ED9139] text-[#0f172a] shadow-sm font-bold'
                                        : 'text-slate-200 hover:bg-slate-800 hover:text-white'
                                        }`}
                                >
                                    <Icon className="h-4 w-4" />
                                    {link.name}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* Right Action Area */}
                <div className="flex items-center gap-3">
                    <Link
                        href="/catalog"
                        className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-md transition-all"
                        title="Search Syllabus"
                    >
                        <Search className="h-4 w-4" />
                    </Link>

                    {user ? (
                        <div className="flex items-center gap-3 border-l border-slate-800 pl-3">
                            <div className="flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-[#ED9139] border border-slate-700 font-bold text-xs">
                                    <User className="h-4 w-4" />
                                </div>
                                <div className="hidden lg:flex flex-col text-left">
                                    <span className="text-xs font-bold text-white leading-none">{user.fullName || user.name || 'Candidate'}</span>
                                    {user.candidateNumber && (
                                        <span className="text-[10px] text-slate-400 font-mono leading-none mt-1">{user.candidateNumber}</span>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white px-3 py-1.5 text-xs font-semibold border border-slate-700 transition-all"
                            >
                                <LogOut className="h-3.5 w-3.5" />
                                <span className="hidden sm:inline">Log Out</span>
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Link
                                href="/login"
                                className="flex items-center gap-1.5 rounded-md bg-[#ED9139] hover:bg-[#dd7f26] text-[#0f172a] px-3.5 py-1.5 text-xs font-bold shadow-sm transition-all"
                            >
                                <User className="h-3.5 w-3.5" />
                                Candidate Login
                            </Link>
                        </div>
                    )}

                    {/* Mobile Hamburger Menu */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="p-2 text-slate-300 hover:bg-slate-800 rounded-lg md:hidden"
                        aria-label="Toggle Navigation Menu"
                    >
                        {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </button>
                </div>
            </div>

            {/* Mobile Navigation Dropdown */}
            {mobileMenuOpen && (
                <div className="md:hidden border-t border-slate-800 bg-[#0f172a] px-4 pt-3 pb-4 space-y-1">
                    {currentNavLinks.map((link) => {
                        const Icon = link.icon;
                        const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-semibold ${isActive
                                    ? 'bg-[#ED9139] text-[#0f172a] font-bold'
                                    : 'text-slate-200 hover:bg-slate-800'
                                    }`}
                            >
                                <Icon className="h-4 w-4" />
                                {link.name}
                            </Link>
                        );
                    })}
                </div>
            )}
        </header>
    );
}
