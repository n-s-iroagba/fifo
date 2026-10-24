'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
    ShoppingBag, 
    Menu, 
    X, 
    ChevronDown, 
    User, 
    LogOut, 
    LayoutDashboard, 
    BookOpen, 
    ShieldCheck, 
    CreditCard, 
    Brain,
    HelpCircle,
    Phone,
    Info,
    ExternalLink
} from 'lucide-react';

export function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const [user, setUser] = useState<{ fullName?: string; name?: string; role?: string; candidateNumber?: string } | null>(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);
    const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);

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

    const services = [
        { name: 'Overseas Skills Assessment', href: '/#about' },
        { name: 'Mining & FIFO Certification', href: '/catalog?category=civil_mining' },
        { name: 'Offshore Certification', href: '/catalog?category=high_risk' },
        { name: 'Apprenticeship Support', href: '/catalog' },
        { name: 'Site Certification & Tickets', href: '/catalog?category=safety' },
        { name: 'Career Development', href: '/#contact' },
    ];

    return (
        <header className="sticky top-0 z-50 bg-white text-slate-900 border-b border-slate-200 shadow-sm transition-all">
            {/* Top compliance & partner announcement ribbon */}
            <div className="bg-[#0b0f19] px-4 py-1.5 text-[11px] text-slate-300">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="inline-block w-2 h-2 rounded-full bg-[#EAA240] animate-pulse" />
                        <span className="font-medium">
                            Cert Hero • Trade Certification, Australian Skills Assessment & FIFO Pathways
                        </span>
                    </div>
                    <div className="hidden sm:flex items-center gap-4 text-slate-400">
                        <Link href="/psychometric" className="text-[#EAA240] hover:underline font-semibold flex items-center gap-1">
                            <Brain className="w-3 h-3" /> Psychometric Testing Portal
                        </Link>
                        <span>•</span>
                        <a 
                            href={process.env.NEXT_PUBLIC_CLIENT_URL || 'https://www.bluecollarrecruitment.co'} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="hover:text-white transition-colors flex items-center gap-1"
                        >
                            BlueCollar Recruitment <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                    </div>
                </div>
            </div>

            {/* Main Navbar */}
            <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                {/* Mobile View: Left Bag (Matches Screenshot 1) */}
                <div className="flex md:hidden items-center">
                    <Link 
                        href="/catalog" 
                        className="relative p-2 text-amber-500 hover:text-amber-600 transition-colors"
                        title="Your Course Bag"
                    >
                        <ShoppingBag className="w-7 h-7 text-[#EAA240]" />
                        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[20%] text-[10px] font-black text-[#EAA240]">
                            0
                        </span>
                    </Link>
                </div>

                {/* Brand Logo (Matches Screenshots 1 & 2) */}
                <div className="flex items-center gap-8">
                    <Link href="/" className="flex items-center gap-2 group">
                        <img
                            src="/certhero-logo.png"
                            alt="Cert Hero"
                            className="h-12 w-auto object-contain group-hover:scale-105 transition-transform"
                        />
                    </Link>

                    {/* Desktop Navigation Links */}
                    <nav className="hidden md:flex md:items-center md:gap-6 text-sm font-bold tracking-tight">
                        <Link
                            href="/"
                            className={`transition-colors py-2 border-b-2 ${pathname === '/' ? 'text-black border-[#EAA240]' : 'text-slate-800 hover:text-black border-transparent'}`}
                        >
                            Home
                        </Link>
                        
                        <Link
                            href="/#about"
                            className="text-slate-800 hover:text-black transition-colors py-2"
                        >
                            About Us
                        </Link>

                        {/* Services Dropdown */}
                        <div 
                            className="relative"
                            onMouseEnter={() => setServicesDropdownOpen(true)}
                            onMouseLeave={() => setServicesDropdownOpen(false)}
                        >
                            <button
                                className="flex items-center gap-1 text-slate-800 hover:text-black transition-colors py-2 font-bold"
                                onClick={() => setServicesDropdownOpen(!servicesDropdownOpen)}
                            >
                                Services
                                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${servicesDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>
                            {servicesDropdownOpen && (
                                <div className="absolute top-full left-0 w-64 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                                    {services.map((s) => (
                                        <Link
                                            key={s.name}
                                            href={s.href}
                                            onClick={() => setServicesDropdownOpen(false)}
                                            className="block px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-amber-50 hover:text-[#EAA240] transition-colors"
                                        >
                                            {s.name}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>

                        <Link
                            href="/catalog"
                            className={`transition-colors py-2 border-b-2 ${pathname.startsWith('/catalog') ? 'text-black border-[#EAA240]' : 'text-slate-800 hover:text-black border-transparent'}`}
                        >
                            Pathways & Pricing
                        </Link>

                        {/* More Dropdown */}
                        <div 
                            className="relative"
                            onMouseEnter={() => setMoreDropdownOpen(true)}
                            onMouseLeave={() => setMoreDropdownOpen(false)}
                        >
                            <button
                                className="flex items-center gap-1 text-slate-800 hover:text-black transition-colors py-2 font-bold"
                                onClick={() => setMoreDropdownOpen(!moreDropdownOpen)}
                            >
                                More
                                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${moreDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>
                            {moreDropdownOpen && (
                                <div className="absolute top-full left-0 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                                    <Link
                                        href="/psychometric"
                                        onClick={() => setMoreDropdownOpen(false)}
                                        className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-amber-50 hover:text-[#EAA240]"
                                    >
                                        <Brain className="w-4 h-4 text-[#EAA240]" /> Psychometric Portal
                                    </Link>
                                    <Link
                                        href="/#faq"
                                        onClick={() => setMoreDropdownOpen(false)}
                                        className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-amber-50 hover:text-[#EAA240]"
                                    >
                                        <HelpCircle className="w-4 h-4 text-slate-400" /> FAQs
                                    </Link>
                                    <Link
                                        href="/#contact"
                                        onClick={() => setMoreDropdownOpen(false)}
                                        className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-amber-50 hover:text-[#EAA240]"
                                    >
                                        <Phone className="w-4 h-4 text-slate-400" /> Contact Us
                                    </Link>
                                    {user && (
                                        <>
                                            <div className="border-t border-slate-100 my-1" />
                                            <Link
                                                href="/my-certifications"
                                                onClick={() => setMoreDropdownOpen(false)}
                                                className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-amber-50 hover:text-[#EAA240]"
                                            >
                                                <ShieldCheck className="w-4 h-4 text-emerald-600" /> My Certifications
                                            </Link>
                                            <Link
                                                href="/payments"
                                                onClick={() => setMoreDropdownOpen(false)}
                                                className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-amber-50 hover:text-[#EAA240]"
                                            >
                                                <CreditCard className="w-4 h-4 text-blue-600" /> Payments & Invoices
                                            </Link>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </nav>
                </div>

                {/* Right Area (Desktop): Bag icon + Candidate Auth */}
                <div className="hidden md:flex items-center gap-5">
                    {/* Shopping Bag Icon with 0 counter (Matches Screenshot 2) */}
                    <Link
                        href="/catalog"
                        className="relative p-2 text-amber-500 hover:text-amber-600 transition-colors"
                        title="Your Course Bag"
                    >
                        <ShoppingBag className="w-7 h-7 text-[#EAA240]" />
                        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[20%] text-[10px] font-black text-[#EAA240]">
                            0
                        </span>
                    </Link>

                    {user ? (
                        <div className="flex items-center gap-3 border-l border-slate-200 pl-4">
                            <Link
                                href="/dashboard"
                                className="flex items-center gap-2 text-xs font-bold text-slate-900 hover:text-[#EAA240]"
                            >
                                <div className="w-8 h-8 rounded-full bg-slate-900 text-[#EAA240] flex items-center justify-center font-bold text-xs">
                                    <User className="w-4 h-4" />
                                </div>
                                <span className="hidden xl:inline">{user.fullName || user.name || 'Candidate'}</span>
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="p-2 text-slate-500 hover:text-red-600 transition-colors"
                                title="Log Out"
                            >
                                <LogOut className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <Link
                            href="/login"
                            className="bg-black hover:bg-slate-900 text-white px-5 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all shadow-sm flex items-center gap-1.5"
                        >
                            <User className="w-3.5 h-3.5 text-[#EAA240]" /> Candidate Login
                        </Link>
                    )}
                </div>

                {/* Mobile Hamburger Menu Toggle (Matches Screenshot 1) */}
                <div className="flex md:hidden items-center">
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="p-2 text-slate-900 hover:text-[#EAA240] rounded-lg"
                        aria-label="Toggle Navigation Menu"
                    >
                        {mobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
                    </button>
                </div>
            </div>

            {/* Mobile Navigation Drawer */}
            {mobileMenuOpen && (
                <div className="md:hidden border-t border-slate-200 bg-white px-5 pt-4 pb-6 space-y-2 shadow-lg animate-in slide-in-from-top-2 duration-150">
                    <Link
                        href="/"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block px-3 py-2 text-sm font-bold text-slate-900 hover:bg-amber-50 rounded-lg"
                    >
                        Home
                    </Link>
                    <Link
                        href="/#about"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block px-3 py-2 text-sm font-bold text-slate-900 hover:bg-amber-50 rounded-lg"
                    >
                        About Us
                    </Link>
                    <Link
                        href="/catalog"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block px-3 py-2 text-sm font-bold text-slate-900 hover:bg-amber-50 rounded-lg"
                    >
                        Pathways & Pricing
                    </Link>
                    <div className="border-t border-slate-100 pt-2 pb-1">
                        <span className="px-3 text-[11px] font-black uppercase tracking-wider text-slate-400">Services</span>
                        {services.map((s) => (
                            <Link
                                key={s.name}
                                href={s.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className="block px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-[#EAA240]"
                            >
                                • {s.name}
                            </Link>
                        ))}
                    </div>
                    <div className="border-t border-slate-100 pt-2 space-y-1">
                        <Link
                            href="/psychometric"
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-[#EAA240]"
                        >
                            <Brain className="w-4 h-4" /> Psychometric Testing
                        </Link>
                        <Link
                            href="/#faq"
                            onClick={() => setMobileMenuOpen(false)}
                            className="block px-3 py-2 text-sm font-semibold text-slate-700"
                        >
                            Frequently Asked Questions
                        </Link>
                        <Link
                            href="/#contact"
                            onClick={() => setMobileMenuOpen(false)}
                            className="block px-3 py-2 text-sm font-semibold text-slate-700"
                        >
                            Contact Us
                        </Link>
                    </div>
                    <div className="pt-3 border-t border-slate-100">
                        {user ? (
                            <div className="flex items-center justify-between">
                                <Link
                                    href="/dashboard"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="text-sm font-bold text-slate-900"
                                >
                                    Dashboard ({user.fullName || user.name || 'Candidate'})
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="text-xs text-red-600 font-bold"
                                >
                                    Log Out
                                </button>
                            </div>
                        ) : (
                            <Link
                                href="/login"
                                onClick={() => setMobileMenuOpen(false)}
                                className="block text-center bg-black text-white py-2.5 rounded-lg text-xs font-black uppercase tracking-wider"
                            >
                                Candidate Login
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}
