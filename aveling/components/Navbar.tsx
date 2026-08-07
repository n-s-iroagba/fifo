'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Award, BookOpen, CreditCard, Bell, LogOut, User, CheckCircle2, Search, Phone, Menu, X, Sparkles, Database } from 'lucide-react';

export function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const [user, setUser] = useState<{ name?: string; role?: string } | null>(null);
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
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('lms_token');
        localStorage.removeItem('lms_user');
        router.push('/login');
    };

    if (pathname === '/login') return null;

    const navLinks = [
        { name: 'Home', href: '/', icon: Award },
        { name: 'Sponsored Ticket Portal', href: '/sponsored-course', icon: Sparkles },
        { name: 'My Certifications', href: '/my-certifications', icon: Award },
        { name: 'Course Catalog', href: '/catalog', icon: BookOpen },
        { name: 'My Payments', href: '/payments', icon: CreditCard },

    ];

    return (
        <header className="sticky top-0 z-50 bg-[#FFC700] text-black shadow-md border-b border-amber-400">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                {/* Brand Logo matching Attachment 1 */}
                <div className="flex items-center gap-8">
                    <Link href="/" className="flex items-center gap-2">
                        <span className="text-2xl font-black tracking-[0.25em] text-black font-sans uppercase">
                            AVELING
                        </span>
                    </Link>

                    {/* Desktop Navigation Links */}
                    <nav className="hidden lg:flex lg:items-center lg:gap-1">
                        {navLinks.map((link) => {
                            const Icon = link.icon;
                            const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-bold transition-all ${isActive
                                            ? 'bg-black text-white shadow-sm'
                                            : 'text-black hover:bg-black/10'
                                        }`}
                                >
                                    <Icon className="h-4 w-4" />
                                    {link.name}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* Right Action Icons matching Attachment 1 */}
                <div className="flex items-center gap-4">
                    <Link
                        href="/catalog"
                        className="p-2 text-black hover:bg-black/10 rounded-full transition-all"
                        title="Search Courses"
                    >
                        <Search className="h-5 w-5 stroke-[2.5]" />
                    </Link>

                    <a
                        href="mailto:booking@swiftwings.online"
                        className="p-2 text-black hover:bg-black/10 rounded-full transition-all hidden sm:flex items-center gap-1.5 text-xs font-bold"
                        title="Contact Support"
                    >
                        <Phone className="h-5 w-5 stroke-[2.5]" />
                    </a>

                    {user ? (
                        <div className="flex items-center gap-3 border-l border-black/20 pl-3">
                            <div className="flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-[#FFC700] font-bold text-xs">
                                    <User className="h-4 w-4" />
                                </div>
                                <span className="hidden xl:inline text-xs font-bold text-black">{user.name || 'Learner'}</span>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-1 rounded-md bg-black px-3 py-1.5 text-xs font-bold text-white hover:bg-zinc-800 transition-all"
                            >
                                <LogOut className="h-3.5 w-3.5" />
                                <span className="hidden sm:inline">Log Out</span>
                            </button>
                        </div>
                    ) : (
                        <Link
                            href="/login"
                            className="flex items-center gap-1 rounded-md bg-black px-3 py-1.5 text-xs font-bold text-white hover:bg-zinc-800 transition-all"
                        >
                            <User className="h-4 w-4" />
                            Log In
                        </Link>
                    )}

                    {/* Mobile Hamburger Menu button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="p-2 text-black hover:bg-black/10 rounded-lg lg:hidden"
                    >
                        {mobileMenuOpen ? <X className="h-6 w-6 stroke-[3]" /> : <Menu className="h-6 w-6 stroke-[3]" />}
                    </button>
                </div>
            </div>

            {/* Mobile Dropdown Menu */}
            {mobileMenuOpen && (
                <div className="lg:hidden border-t border-amber-400 bg-[#FFC700] px-4 pt-2 pb-4 space-y-2">
                    {navLinks.map((link) => {
                        const Icon = link.icon;
                        const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-bold ${isActive ? 'bg-black text-white' : 'text-black hover:bg-black/10'
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
