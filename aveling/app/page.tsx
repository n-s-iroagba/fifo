'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
    Search,
    Calendar,
    ChevronLeft,
    ChevronRight,
    BookOpen,
    Award,
    Users,
    Dna,
    ShieldCheck,
    ArrowRight,
    MapPin,
    Phone,
    Mail,
    CheckCircle2,
    Lock,
    CreditCard,
    Download,
    Wallet,
    FileText,
    Sparkles,
    AlertCircle,
    User,
    LogOut
} from 'lucide-react';
import { apiClient } from '../lib/axios';

interface MappedTicket {
    id: string;
    ticketType: string;
    status: 'missing' | 'applied' | 'first_attempt_approved' | 'ticket_issued' | 'possessed';
    ticketSponsorship?: 'applied' | 'first_attempt_approved' | 'ticket_issued';
    purchasePrice: number;
    paymentStatus?: 'unpaid' | 'receipt_submitted' | 'payment_verified';
    courseAccessGranted?: boolean;
    assignedCourse?: {
        id: string;
        name: string;
        code: string;
        format: 'THEORY' | 'PRACTICAL' | 'MIXED';
        price: number;
    };
}

interface CandidateProfile {
    id: string;
    name: string;
    email: string;
    candidateNumber: string;
    walletBalance: number;
    tickets: MappedTicket[];
}

export default function AvelingHomePage() {
    const router = useRouter();

    // Search state
    const [searchQuery, setSearchQuery] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [topic, setTopic] = useState('Any Topic');

    // LMS Candidate Login & Portal state
    const [loginTab, setLoginTab] = useState<'candidate_id' | 'lms_creds'>('candidate_id');
    const [candidateInput, setCandidateInput] = useState('CND-10001');
    const [lmsUsername, setLmsUsername] = useState('');
    const [lmsPassword, setLmsPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [profile, setProfile] = useState<CandidateProfile | null>(null);

    // Auto-load candidate profile if logged in
    useEffect(() => {
        const storedUser = localStorage.getItem('lms_user');
        if (storedUser) {
            try {
                const parsed = JSON.parse(storedUser);
                if (parsed.email || parsed.candidateNumber) {
                    setCandidateInput(parsed.candidateNumber || parsed.email);
                    autoLookup(parsed.candidateNumber || parsed.email);
                }
            } catch (e) {
                // ignore
            }
        }
    }, []);

    const autoLookup = async (inputStr: string) => {
        if (!inputStr) return;
        setLoading(true);
        try {
            const res = await apiClient.post('/candidate/lookup', {
                candidateNumber: inputStr,
                email: inputStr
            });
            if (res.data?.success) {
                setProfile(res.data.data);
            }
        } catch {
            // ignore initial silent fail
        } finally {
            setLoading(false);
        }
    };

    const handleCandidateLookup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!candidateInput.trim()) return;
        setLoading(true);
        setError(null);

        try {
            const res = await apiClient.post('/candidate/lookup', {
                candidateNumber: candidateInput.trim(),
                email: candidateInput.trim()
            });

            if (res.data && res.data.success) {
                setProfile(res.data.data);
            } else {
                setError(res.data?.message || 'Candidate record not found. Check your Candidate ID.');
            }
        } catch (err: any) {
            console.error('Failed candidate lookup:', err);
            setError(err.response?.data?.message || 'Candidate lookup failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleLmsLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!lmsUsername.trim() || !lmsPassword.trim()) return;
        setLoading(true);
        setError(null);

        try {
            const response = await apiClient.post('/lms-auth/login', {
                lmsUsername,
                password: lmsPassword
            });

            if (response.data?.success) {
                const { token, user } = response.data.data;
                localStorage.setItem('lms_token', token);
                localStorage.setItem('lms_user', JSON.stringify(user));

                // Lookup candidate info for logged in user
                await autoLookup(user.email || user.username || lmsUsername);
            } else {
                setError(response.data?.message || 'Invalid LMS credentials.');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Invalid LMS username or password.');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('lms_token');
        localStorage.removeItem('lms_user');
        setProfile(null);
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        window.location.href = `/catalog?query=${encodeURIComponent(searchQuery)}&topic=${encodeURIComponent(topic)}`;
    };

    return (
        <div className="min-h-screen bg-white text-zinc-900 font-sans">
            {/* ========================================================= */}
            {/* 1. HERO BANNER SECTION                                   */}
            {/* ========================================================= */}
            <section className="relative w-full min-h-[540px] bg-zinc-900 overflow-hidden flex items-center py-12">
                <div className="absolute inset-0 z-0 opacity-40">
                    <Image
                        src="/images/hero.png"
                        alt="Aveling Corporate Training"
                        fill
                        className="object-cover object-center"
                        priority
                    />
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/80 to-transparent z-10" />

                <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                    {/* Left Column: Hero Content */}
                    <div className="lg:col-span-7 space-y-6">
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFC700] text-black font-extrabold text-xs uppercase tracking-wider shadow-md">
                            <Sparkles className="h-4 w-4" />
                            Registered Training Organisation (RTO 50503)
                        </div>

                        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
                            FIFO Compliance & <span className="text-[#FFC700]">Ticket Certification</span> Portal
                        </h1>

                        <div className="w-24 h-1.5 bg-[#FFC700] rounded-full" />

                        <p className="text-base sm:text-lg text-zinc-200 font-medium leading-relaxed max-w-xl">
                            Complete required theory training, take online exams, and manage ticket sponsorships for site mobilization.
                        </p>

                        <div className="pt-2 flex flex-wrap gap-4 items-center">
                            <a
                                href="/login"
                                className="inline-flex items-center gap-2 bg-[#FFC700] text-black font-extrabold text-sm px-8 py-4 rounded-xl hover:bg-yellow-400 transition-all transform hover:-translate-y-0.5 shadow-lg shadow-yellow-500/20 uppercase tracking-wider"
                            >
                                <User className="h-4 w-4 stroke-[3]" />
                                Applicant Login
                            </a>
                            <Link
                                href="/catalog"
                                className="inline-flex items-center gap-2 bg-zinc-900 border-2 border-white text-white font-extrabold text-sm px-8 py-4 rounded-xl hover:bg-white hover:text-black transition-all transform hover:-translate-y-0.5 uppercase tracking-wider"
                            >
                                Browse Course Catalog
                            </Link>
                        </div>
                    </div>

                    {/* Right Column: Quick Applicant Login / Candidate ID Card */}
                    <div id="applicant-lms-portal" className="lg:col-span-5">
                        <div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md rounded-2xl border-2 border-[#FFC700] p-6 shadow-2xl space-y-4">
                            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
                                <div>
                                    <h2 className="text-base font-black text-zinc-900 dark:text-white flex items-center gap-2">
                                        <Lock className="h-4 w-4 text-[#FFC700]" />
                                        Applicant LMS Portal
                                    </h2>
                                    <p className="text-[11px] text-zinc-500">Sign in or enter candidate ID to access assigned courses</p>
                                </div>
                                <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded bg-[#FFC700] text-black">
                                    APPLICANT ACCESS
                                </span>
                            </div>

                            {/* Tab Selection */}
                            <div className="flex rounded-xl bg-zinc-100 dark:bg-zinc-800 p-1">
                                <button
                                    onClick={() => setLoginTab('candidate_id')}
                                    className={`flex-1 py-2 text-xs font-extrabold rounded-lg transition-all ${loginTab === 'candidate_id'
                                            ? 'bg-black text-[#FFC700] shadow'
                                            : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                                        }`}
                                >
                                    Candidate ID
                                </button>
                                <button
                                    onClick={() => setLoginTab('lms_creds')}
                                    className={`flex-1 py-2 text-xs font-extrabold rounded-lg transition-all ${loginTab === 'lms_creds'
                                            ? 'bg-black text-[#FFC700] shadow'
                                            : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                                        }`}
                                >
                                    LMS Login
                                </button>
                            </div>

                            {/* Form 1: Candidate ID Lookup */}
                            {loginTab === 'candidate_id' && (
                                <form onSubmit={handleCandidateLookup} className="space-y-3">
                                    <div>
                                        <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1">
                                            Candidate Number or Email:
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={candidateInput}
                                                onChange={(e) => setCandidateInput(e.target.value)}
                                                placeholder="e.g. CND-10001 or email@example.com"
                                                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 px-3.5 py-2.5 rounded-xl text-xs font-bold text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-[#FFC700]"
                                                required
                                            />
                                            <Search className="absolute right-3 top-2.5 h-4 w-4 text-zinc-400" />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-[#FFC700] text-black font-extrabold text-xs py-3 rounded-xl hover:bg-yellow-400 transition-all uppercase tracking-wider shadow-md disabled:opacity-50"
                                    >
                                        {loading ? 'Searching Record...' : 'View Assigned Courses & Tickets'}
                                    </button>
                                </form>
                            )}

                            {/* Form 2: Full LMS Login */}
                            {loginTab === 'lms_creds' && (
                                <form onSubmit={handleLmsLogin} className="space-y-3">
                                    <div>
                                        <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1">
                                            LMS Username:
                                        </label>
                                        <input
                                            type="text"
                                            value={lmsUsername}
                                            onChange={(e) => setLmsUsername(e.target.value)}
                                            placeholder="e.g. Aveling-JOHDOE1234"
                                            className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 px-3.5 py-2 rounded-xl text-xs font-bold text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-[#FFC700]"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1">
                                            Password:
                                        </label>
                                        <input
                                            type="password"
                                            value={lmsPassword}
                                            onChange={(e) => setLmsPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 px-3.5 py-2 rounded-xl text-xs font-bold text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-[#FFC700]"
                                            required
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-black text-[#FFC700] font-extrabold text-xs py-3 rounded-xl hover:bg-zinc-800 transition-all uppercase tracking-wider shadow-md disabled:opacity-50"
                                    >
                                        {loading ? 'Authenticating...' : 'Sign In to LMS Workspace'}
                                    </button>
                                </form>
                            )}

                            {error && (
                                <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-[11px] font-bold">
                                    <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                                    <span>{error}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* ========================================================= */}
            {/* 1.1 LOGGED-IN APPLICANT WORKSPACE & TICKET COURSES        */}
            {/* ========================================================= */}
            {profile && (
                <section className="bg-amber-50/50 dark:bg-zinc-950 py-12 px-4 sm:px-6 lg:px-8 border-b border-amber-200 dark:border-zinc-800">
                    <div className="max-w-7xl mx-auto space-y-8">
                        {/* Profile Header & Refund Wallet Summary */}
                        <div className="bg-gradient-to-r from-zinc-900 to-zinc-800 text-white rounded-2xl p-6 shadow-xl border border-zinc-700 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                            <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-[#FFC700] text-black font-bold flex items-center justify-center">
                                        <User className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-extrabold">{profile.name}</h2>
                                        <p className="text-xs font-mono text-amber-400">Candidate Registration ID: {profile.candidateNumber}</p>
                                    </div>
                                </div>
                                <p className="text-xs text-zinc-300 pl-13">{profile.email}</p>
                            </div>

                            {/* Wallet Balance Calculator (Refund Balance & Outstanding Handling) */}
                            <div className="bg-zinc-800/90 border border-amber-500/40 rounded-xl p-4 flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-amber-500/20 text-[#FFC700] flex items-center justify-center shrink-0">
                                        <Wallet className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider block">
                                            Ticket Refund Wallet Credit
                                        </span>
                                        <span className="text-xl font-black text-[#FFC700]">
                                            ${profile.walletBalance.toFixed(2)} AUD
                                        </span>
                                    </div>
                                </div>

                                <button
                                    onClick={handleLogout}
                                    className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-700 transition-all text-xs font-bold flex items-center gap-1"
                                    title="Sign Out"
                                >
                                    <LogOut className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        {/* Assigned Ticket Courses Due to Take */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-extrabold text-zinc-900 dark:text-white flex items-center gap-2">
                                    <Award className="h-6 w-6 text-[#FFC700]" />
                                    Your Assigned Ticket Courses
                                </h3>
                                <span className="text-xs font-bold text-zinc-500">
                                    {profile.tickets.length} Course(s) Mapped
                                </span>
                            </div>

                            <div className="grid grid-cols-1 gap-6">
                                {profile.tickets.map((tkt) => {
                                    const coursePrice = tkt.purchasePrice || 280;
                                    const appliedRefund = Math.min(coursePrice, profile.walletBalance);
                                    const netOutstanding = Math.max(0, coursePrice - appliedRefund);
                                    const isAccessGranted = tkt.paymentStatus === 'payment_verified' || tkt.courseAccessGranted;

                                    return (
                                        <div
                                            key={tkt.id}
                                            className="bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-md space-y-4 hover:border-[#FFC700] transition-all"
                                        >
                                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-4">
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className="font-mono text-xs font-bold text-black bg-[#FFC700] px-2.5 py-0.5 rounded">
                                                            TICKET #{tkt.id}
                                                        </span>
                                                        <span className="text-xs font-bold px-3 py-0.5 rounded-full uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                                            STATUS: {tkt.ticketSponsorship || tkt.status}
                                                        </span>
                                                        {tkt.assignedCourse?.format && (
                                                            <span className="text-xs font-bold px-2 py-0.5 rounded bg-zinc-800 text-white">
                                                                {tkt.assignedCourse.format} FORMAT
                                                            </span>
                                                        )}
                                                    </div>

                                                    <h4 className="text-lg font-extrabold text-zinc-900 dark:text-white">
                                                        {tkt.ticketType}
                                                    </h4>
                                                    {tkt.assignedCourse && (
                                                        <p className="text-xs font-bold text-amber-600 dark:text-amber-400">
                                                            Mapped Course: {tkt.assignedCourse.name} ({tkt.assignedCourse.code})
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Price & Refund Outstanding Breakdown */}
                                                <div className="bg-zinc-50 dark:bg-zinc-950 p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs space-y-1 font-mono shrink-0">
                                                    <div className="flex justify-between gap-6">
                                                        <span className="text-zinc-500 font-sans font-bold">Total Course Price:</span>
                                                        <span className="font-bold text-zinc-900 dark:text-white">${coursePrice.toFixed(2)} AUD</span>
                                                    </div>
                                                    {profile.walletBalance > 0 && (
                                                        <div className="flex justify-between gap-6 text-emerald-600 font-bold">
                                                            <span className="font-sans">Applied Refund Credit:</span>
                                                            <span>-${appliedRefund.toFixed(2)} AUD</span>
                                                        </div>
                                                    )}
                                                    <div className="flex justify-between gap-6 pt-1 border-t border-zinc-200 dark:border-zinc-800 font-black text-amber-600">
                                                        <span className="font-sans">Net Outstanding:</span>
                                                        <span>${netOutstanding.toFixed(2)} AUD</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Action Bar (Payment, Take Course, Materials, Exams) */}
                                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                                                {/* Course Materials Downloads */}
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        onClick={() => alert('Downloading official Learner Study Guide PDF...')}
                                                        className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white bg-zinc-100 dark:bg-zinc-800 px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700"
                                                    >
                                                        <FileText className="h-3.5 w-3.5 text-[#FFC700]" />
                                                        <span>Study Guide (PDF)</span>
                                                    </button>
                                                    <button
                                                        onClick={() => alert('Downloading Safety Checklist PDF...')}
                                                        className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white bg-zinc-100 dark:bg-zinc-800 px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700"
                                                    >
                                                        <Download className="h-3.5 w-3.5 text-emerald-500" />
                                                        <span>Safety Checklist</span>
                                                    </button>
                                                </div>

                                                {/* Main Flow Action Buttons */}
                                                <div className="flex items-center gap-3 w-full sm:w-auto">
                                                    {isAccessGranted ? (
                                                        <>
                                                            <Link
                                                                href={`/courses/${tkt.assignedCourse?.id || ''}`}
                                                                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 bg-emerald-600 text-white font-extrabold text-xs px-6 py-3 rounded-xl hover:bg-emerald-500 transition-all uppercase tracking-wider shadow-md"
                                                            >
                                                                <BookOpen className="h-4 w-4" />
                                                                <span>Take Course Modules</span>
                                                            </Link>
                                                            <Link
                                                                href={`/courses/${tkt.assignedCourse?.id || ''}/exam?ticketId=${tkt.id}`}
                                                                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 bg-[#FFC700] text-black font-extrabold text-xs px-6 py-3 rounded-xl hover:bg-yellow-400 transition-all uppercase tracking-wider shadow-md"
                                                            >
                                                                <Award className="h-4 w-4" />
                                                                <span>Take Exam</span>
                                                            </Link>
                                                        </>
                                                    ) : (
                                                        <button
                                                            onClick={() => router.push(`/checkout?ticketId=${tkt.id}&candidateNumber=${profile.candidateNumber}&courseId=${tkt.assignedCourse?.id || ''}&price=${coursePrice}&wallet=${profile.walletBalance}`)}
                                                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#FFC700] text-black font-extrabold text-xs px-8 py-3.5 rounded-xl hover:bg-yellow-400 transition-all uppercase tracking-wider shadow-md"
                                                        >
                                                            <CreditCard className="h-4 w-4" />
                                                            <span>
                                                                {netOutstanding > 0 ? `Pay Outstanding ($${netOutstanding.toFixed(2)} AUD)` : 'Start Course & Checkout'}
                                                            </span>
                                                            <ArrowRight className="h-4 w-4 stroke-[3]" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Mail Delivery Information Notice */}
                                            <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-xl p-3 text-xs text-blue-900 dark:text-blue-300 flex items-center gap-2">
                                                <Mail className="h-4 w-4 text-blue-600 shrink-0" />
                                                <span>
                                                    <strong>Automated Email Delivery:</strong> Upon passing your theory exam, your exam results and official digital ticket/certificate will be sent directly via email to <strong>{profile.email}</strong> and synced to your recruiter placement portal.
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* ========================================================= */}
            {/* 2. COURSE SEARCH SECTION                                  */}
            {/* ========================================================= */}
            <section className="bg-[#18181B] text-white py-10 px-4 sm:px-6 lg:px-8 border-t-4 border-[#FFC700]">
                <div className="max-w-7xl mx-auto space-y-6">
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-center tracking-tight">
                        Find your course
                    </h2>

                    <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 items-end bg-zinc-900 p-6 rounded-xl border border-zinc-800 shadow-xl">
                        {/* Search Query Input */}
                        <div className="lg:col-span-4 space-y-1.5">
                            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                                Search:
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Course name, code or keyword..."
                                    className="w-full bg-white text-zinc-900 px-4 py-3 rounded-md text-sm font-medium focus:ring-2 focus:ring-[#FFC700] outline-none"
                                />
                            </div>
                        </div>

                        {/* Start Date */}
                        <div className="lg:col-span-2 space-y-1.5">
                            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                                Start Date:
                            </label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full bg-white text-zinc-900 px-3 py-3 rounded-md text-sm font-medium focus:ring-2 focus:ring-[#FFC700] outline-none"
                            />
                        </div>

                        {/* End Date */}
                        <div className="lg:col-span-2 space-y-1.5">
                            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                                End Date:
                            </label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full bg-white text-zinc-900 px-3 py-3 rounded-md text-sm font-medium focus:ring-2 focus:ring-[#FFC700] outline-none"
                            />
                        </div>

                        {/* Topic Dropdown */}
                        <div className="lg:col-span-2 space-y-1.5">
                            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                                Topic:
                            </label>
                            <select
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                className="w-full bg-white text-zinc-900 px-3 py-3 rounded-md text-sm font-bold focus:ring-2 focus:ring-[#FFC700] outline-none"
                            >
                                <option value="Any Topic">Any Topic</option>
                                <option value="Work Health and Safety (WHS)">Work Health and Safety (WHS)</option>
                                <option value="Education and Training">Education and Training</option>
                                <option value="Hospitality and Retail">Hospitality and Retail</option>
                                <option value="Leadership & Management">Leadership & Management</option>
                            </select>
                        </div>

                        {/* Submit Search Button */}
                        <div className="lg:col-span-2">
                            <button
                                type="submit"
                                className="w-full bg-[#FFC700] text-black font-extrabold text-sm py-3.5 px-6 rounded-md hover:bg-yellow-400 transition-all uppercase tracking-wider shadow-md"
                            >
                                Search
                            </button>
                        </div>
                    </form>

                    <div className="text-left pt-2">
                        <Link
                            href="/catalog"
                            className="inline-flex items-center gap-2 text-[#FFC700] hover:text-yellow-400 font-bold text-sm tracking-wide group transition-all"
                        >
                            <span>Advanced Search Options</span>
                            <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* ========================================================= */}
            {/* 3. FEATURED CATEGORIES CAROUSEL CARDS                    */}
            {/* ========================================================= */}
            <section className="py-16 px-4 sm:px-6 lg:px-8 bg-zinc-50">
                <div className="max-w-7xl mx-auto space-y-8">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">
                            Explore Training Sectors
                        </h2>
                        {/* Carousel Arrows */}
                        <div className="flex items-center gap-2">
                            <button className="p-2.5 rounded-full bg-white border border-zinc-200 text-[#FFC700] hover:bg-[#FFC700] hover:text-black shadow-sm transition-all">
                                <ChevronLeft className="h-6 w-6 stroke-[3]" />
                            </button>
                            <button className="p-2.5 rounded-full bg-[#FFC700] text-black hover:bg-yellow-400 shadow-sm transition-all">
                                <ChevronRight className="h-6 w-6 stroke-[3]" />
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Card 1: WHS */}
                        <div className="bg-white rounded-xl overflow-hidden border border-zinc-200 shadow-md flex flex-col hover:shadow-xl transition-all group">
                            <div className="relative h-56 w-full overflow-hidden bg-zinc-900">
                                <Image
                                    src="/images/whs.png"
                                    alt="Work Health and Safety (WHS)"
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                            </div>
                            <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                                <div className="space-y-3">
                                    <h3 className="text-xl font-extrabold text-zinc-900 leading-snug">
                                        Work Health and Safety (WHS)
                                    </h3>
                                    <p className="text-sm text-zinc-600 leading-relaxed font-normal">
                                        Work Health and Safety is important in all industries. Explore our selection of courses and find the right one for you.
                                    </p>
                                </div>
                                <div className="pt-2">
                                    <Link
                                        href="/catalog?category=whs"
                                        className="inline-block bg-[#FFC700] text-black font-extrabold text-xs px-6 py-3 rounded-md hover:bg-yellow-400 transition-all uppercase tracking-wider"
                                    >
                                        View Courses
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Card 2: Education & Training */}
                        <div className="bg-white rounded-xl overflow-hidden border border-zinc-200 shadow-md flex flex-col hover:shadow-xl transition-all group">
                            <div className="relative h-56 w-full overflow-hidden bg-zinc-900">
                                <Image
                                    src="/images/hero.png"
                                    alt="Education and Training"
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                            </div>
                            <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                                <div className="space-y-3">
                                    <h3 className="text-xl font-extrabold text-zinc-900 leading-snug">
                                        Education and Training
                                    </h3>
                                    <p className="text-sm text-zinc-600 leading-relaxed font-normal">
                                        Whether you are looking to train others in your organisation or to work in an RTO, our training and assessing skills and qualifications will get you there.
                                    </p>
                                </div>
                                <div className="pt-2">
                                    <Link
                                        href="/catalog?category=education"
                                        className="inline-block bg-[#FFC700] text-black font-extrabold text-xs px-6 py-3 rounded-md hover:bg-yellow-400 transition-all uppercase tracking-wider"
                                    >
                                        View Courses
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Card 3: Hospitality & Retail */}
                        <div className="bg-white rounded-xl overflow-hidden border border-zinc-200 shadow-md flex flex-col hover:shadow-xl transition-all group">
                            <div className="relative h-56 w-full overflow-hidden bg-zinc-900">
                                <Image
                                    src="/images/whs.png"
                                    alt="Hospitality and Retail"
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                            </div>
                            <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                                <div className="space-y-3">
                                    <h3 className="text-xl font-extrabold text-zinc-900 leading-snug">
                                        Hospitality and Retail
                                    </h3>
                                    <p className="text-sm text-zinc-600 leading-relaxed font-normal">
                                        From RSA to customer service, hospitality and retail workers perform best when they have the skills, knowledge and required training.
                                    </p>
                                </div>
                                <div className="pt-2">
                                    <Link
                                        href="/catalog?category=hospitality"
                                        className="inline-block bg-[#FFC700] text-black font-extrabold text-xs px-6 py-3 rounded-md hover:bg-yellow-400 transition-all uppercase tracking-wider"
                                    >
                                        View Courses
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ========================================================= */}
            {/* 4. "ACHIEVE MORE WITH AVELING" SECTION                    */}
            {/* ========================================================= */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white border-t border-zinc-100">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                    {/* Left 3-Image Collage Layout */}
                    <div className="lg:col-span-6 grid grid-cols-2 gap-4">
                        <div className="relative h-[380px] rounded-xl overflow-hidden shadow-lg border border-zinc-200">
                            <Image
                                src="/images/whs.png"
                                alt="Electrical and Technical Inspection"
                                fill
                                className="object-cover"
                            />
                        </div>
                        <div className="space-y-4 flex flex-col justify-between">
                            <div className="relative h-[180px] rounded-xl overflow-hidden shadow-lg border border-zinc-200">
                                <Image
                                    src="/images/hero.png"
                                    alt="Corporate Workshop Presentation"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div className="relative h-[180px] rounded-xl overflow-hidden shadow-lg border border-zinc-200">
                                <Image
                                    src="/images/whs.png"
                                    alt="Professional Learner Collaboration"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Right Content */}
                    <div className="lg:col-span-6 space-y-6">
                        <div className="space-y-2">
                            <h2 className="text-3xl sm:text-4xl font-black text-zinc-900 tracking-tight">
                                Achieve more with Aveling
                            </h2>
                            <div className="w-20 h-1.5 bg-[#FFC700] rounded-full" />
                        </div>

                        <p className="text-base sm:text-lg font-bold text-zinc-800 leading-snug">
                            Aveling is a Registered Training Organisation (RTO), in Perth, Western Australia.
                        </p>

                        <div className="space-y-4 text-sm text-zinc-600 leading-relaxed">
                            <p>
                                With 25 years' experience, we are specialists in safety training, leadership and management, and training and assessment courses.
                            </p>
                            <p>
                                We offer Nationally Recognised qualifications, skill sets and units of competency, as well as world-class vocational short courses and inductions.
                            </p>
                            <p>
                                Our range of Aveling training courses is continuously growing with flexible online options and in-person training at our modern facilities in Jandakot and Karratha, or on-site.
                            </p>
                        </div>

                        <div className="pt-4 flex flex-wrap gap-4">
                            <Link
                                href="/catalog"
                                className="inline-block bg-[#FFC700] text-black font-extrabold text-xs px-8 py-3.5 rounded-md hover:bg-yellow-400 transition-all uppercase tracking-wider shadow-md"
                            >
                                Find Out More
                            </Link>
                            <Link
                                href="/my-certifications"
                                className="inline-block bg-white text-black border-2 border-black font-extrabold text-xs px-8 py-3.5 rounded-md hover:bg-black hover:text-white transition-all uppercase tracking-wider"
                            >
                                Book Now
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* ========================================================= */}
            {/* 5. "OUR ETHOS" GLASSMORPHIC SECTION                       */}
            {/* ========================================================= */}
            <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-zinc-900 text-white overflow-hidden">
                <div className="absolute inset-0 z-0 opacity-30">
                    <Image
                        src="/images/hero.png"
                        alt="Aveling Ethos"
                        fill
                        className="object-cover"
                    />
                </div>
                <div className="absolute inset-0 bg-black/75 z-10" />

                <div className="relative z-20 max-w-7xl mx-auto space-y-12">
                    <div className="text-center space-y-4">
                        <p className="text-xl sm:text-3xl font-light tracking-[0.4em] text-white uppercase border-b border-zinc-800 pb-4 inline-block">
                            ACHIEVE MORE™
                        </p>
                        <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight pt-2">
                            Our Ethos
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Card 1 */}
                        <div className="bg-zinc-900/80 backdrop-blur-md rounded-2xl border border-zinc-700/60 p-8 space-y-4 hover:border-[#FFC700] transition-all">
                            <div className="w-14 h-14 rounded-full border-2 border-[#FFC700] flex items-center justify-center text-[#FFC700]">
                                <Search className="h-7 w-7 stroke-[2.5]" />
                            </div>
                            <h3 className="text-xl font-extrabold text-white">
                                We Focus On You
                            </h3>
                            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                                We focus on the individual goals of the people who come to Aveling to learn and develop their careers, and the objectives of our corporate clients who come to us for our expert knowledge, track record of success and reputation in the industry.
                            </p>
                        </div>

                        {/* Card 2 */}
                        <div className="bg-zinc-900/80 backdrop-blur-md rounded-2xl border border-zinc-700/60 p-8 space-y-4 hover:border-[#FFC700] transition-all">
                            <div className="w-14 h-14 rounded-full border-2 border-[#FFC700] flex items-center justify-center text-[#FFC700]">
                                <Dna className="h-7 w-7 stroke-[2.5]" />
                            </div>
                            <h3 className="text-xl font-extrabold text-white">
                                Our DNA
                            </h3>
                            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                                At the very heart of Aveling is our DNA: to Develop, Nurture and Appreciate all who come through our doors, from our individual learners, to our corporate clientele and our own employees.
                            </p>
                        </div>

                        {/* Card 3 */}
                        <div className="bg-zinc-900/80 backdrop-blur-md rounded-2xl border border-zinc-700/60 p-8 space-y-4 hover:border-[#FFC700] transition-all">
                            <div className="w-14 h-14 rounded-full border-2 border-[#FFC700] flex items-center justify-center text-[#FFC700]">
                                <Users className="h-7 w-7 stroke-[2.5]" />
                            </div>
                            <h3 className="text-xl font-extrabold text-white">
                                Family Values
                            </h3>
                            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                                As a family-owned and run business we place strong value on connection and relationships, from our clients to our people and the people of Australia.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ========================================================= */}
            {/* 6. "OUR OFFERING" SECTION                                 */}
            {/* ========================================================= */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-zinc-50">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                    <div className="lg:col-span-6 relative h-[420px] rounded-xl overflow-hidden shadow-xl border border-zinc-200">
                        <Image
                            src="/images/hero.png"
                            alt="Classroom Education Offering"
                            fill
                            className="object-cover"
                        />
                    </div>

                    <div className="lg:col-span-6 space-y-8">
                        <div className="space-y-2">
                            <h2 className="text-3xl sm:text-4xl font-black text-zinc-900 tracking-tight">
                                Our Offering
                            </h2>
                            <div className="w-20 h-1.5 bg-[#FFC700] rounded-full" />
                        </div>

                        <p className="text-base text-zinc-700 font-medium">
                            Aveling is your premier Registered Training Organisation (RTO) in Perth for vocational education and training.
                        </p>

                        <div className="space-y-6">
                            <div className="flex gap-4 items-start">
                                <div className="w-12 h-12 rounded-lg bg-emerald-100 border border-emerald-300 flex items-center justify-center shrink-0 text-emerald-700">
                                    <ShieldCheck className="h-6 w-6 stroke-[2.5]" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-lg font-extrabold text-zinc-900">
                                        Nationally Recognised Training
                                    </h3>
                                    <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                                        We offer a variety of accredited courses including BSB41419 Certificate IV in Work Health and Safety, TAE40122 Certificate IV in Training and Assessment, BSB40250 Diploma in Leadership and Management, skill sets and units of competency.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4 items-start">
                                <div className="w-12 h-12 rounded-lg bg-[#FFC700] flex items-center justify-center shrink-0 text-black">
                                    <BookOpen className="h-6 w-6 stroke-[2.5]" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-lg font-extrabold text-zinc-900">
                                        Short courses
                                    </h3>
                                    <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                                        Over 100 online and classroom based short courses, designed to upskill or reskill you in health and safety, leadership and management, hospitality, and a huge variety.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ========================================================= */}
            {/* 7. FOOTER SECTION                                         */}
            {/* ========================================================= */}
            <footer className="bg-zinc-950 text-white border-t-8 border-[#FFC700] pt-12 pb-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-zinc-800">
                    <div className="space-y-4">
                        <span className="text-2xl font-black tracking-[0.25em] text-[#FFC700] font-sans uppercase">
                            AVELING
                        </span>
                        <p className="text-xs text-zinc-400 leading-relaxed">
                            Premier Registered Training Organisation (RTO 50503) delivering Nationally Recognised vocational training, WHS safety compliance, and ticket sponsorship.
                        </p>
                    </div>

                    <div className="space-y-3">
                        <h4 className="text-sm font-extrabold uppercase tracking-wider text-[#FFC700]">
                            Quick Links
                        </h4>
                        <ul className="space-y-2 text-xs font-semibold text-zinc-400">
                            <li><Link href="/catalog" className="hover:text-white transition-colors">Course Catalog</Link></li>
                            <li><Link href="/my-certifications" className="hover:text-white transition-colors">My Certifications & Gaps</Link></li>
                            <li><Link href="/payments" className="hover:text-white transition-colors">Payment Gateway & Receipts</Link></li>
                            <li><Link href="/notifications" className="hover:text-white transition-colors">Notification Center</Link></li>
                        </ul>
                    </div>

                    <div className="space-y-3">
                        <h4 className="text-sm font-extrabold uppercase tracking-wider text-[#FFC700]">
                            Campus Locations
                        </h4>
                        <div className="space-y-2 text-xs text-zinc-400">
                            <p className="flex items-start gap-2">
                                <MapPin className="h-4 w-4 text-[#FFC700] shrink-0 mt-0.5" />
                                <span>Jandakot: 83 Jandakot Rd, Jandakot WA 6164</span>
                            </p>
                            <p className="flex items-start gap-2">
                                <MapPin className="h-4 w-4 text-[#FFC700] shrink-0 mt-0.5" />
                                <span>Karratha: 1/1 Flashman Ave, Karratha WA 6714</span>
                            </p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h4 className="text-sm font-extrabold uppercase tracking-wider text-[#FFC700]">
                            Contact Support
                        </h4>
                        <div className="space-y-2 text-xs text-zinc-400">
                            <p className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-[#FFC700] shrink-0" />
                                <span>+61 8 9379 9999</span>
                            </p>
                            <p className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-[#FFC700] shrink-0" />
                                <span>booking@swiftwings.online</span>
                            </p>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto pt-6 flex flex-col sm:flex-row justify-between items-center text-xs text-zinc-500 gap-4">
                    <p>© 2026 Aveling RTO #50503. All Rights Reserved. FIFO Training & Compliance Platform.</p>
                    <div className="flex gap-6 font-semibold">
                        <a href="#" className="hover:text-zinc-300">Privacy Policy</a>
                        <a href="#" className="hover:text-zinc-300">Terms & Conditions</a>
                        <a href="#" className="hover:text-zinc-300">RTO Accreditation</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
