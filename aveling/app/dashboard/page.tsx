'use client';

// STEP-1.1.2, STEP-1.1.3, STEP-1.1.4, STEP-1.1.5, STEP-1.1.17, STEP-1.1.18
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Award, Search, User, CreditCard, ArrowRight, ShieldCheck, CheckCircle2, AlertCircle, Wallet, Lock, Sparkles } from 'lucide-react';
import { apiClient } from '../../lib/axios';

interface MappedTicket {
    id: number | string;
    userId: number | string;
    applicationId: number | string;
    status: string;
    ticketNumber: string | null;
    ticketType: string;
    description: string | null;
    purchasePrice: number;
    realPrice: number;
    subsidisedPrice: number | null;
    purchaseDate: string | null;
    expiryDate: string | null;
    proof: string | null;
    proofThumbnail: string | null;
    sponsorshipDeadline: string | null;
    ticketSponsorship: string | null;
    canApplySponsorship: boolean;
    ticketSponsorshipRefundAmount: number | null;
    refundStatus: string | null;
    courseId: string | null;
    receiptUrl: string | null;
    receiptReference: string | null;
    paymentStatus: string | null;
    courseAccessGranted: boolean;
    createdAt: string;
    updatedAt: string;
    Course: {
        id: string;
        name: string;
        code: string;
        format: 'THEORY' | 'PRACTICAL' | 'MIXED';
        price: number;
    } | null;
}

interface CandidateProfile {
    id: string;
    fullName: string;
    email: string;
    candidateNumber: string;
    walletBalance: number;
    tickets: MappedTicket[];
}

export default function SponsoredCourseLookupPage() {
    const router = useRouter();
    const [candidateInput, setCandidateInput] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [profile, setProfile] = useState<CandidateProfile | null>(null);

    React.useEffect(() => {
        const fetchProfile = async () => {
            const userStr = localStorage.getItem('lms_user');
            if (!userStr) {
                router.push('/login');
                return;
            }
            const user = JSON.parse(userStr);
            const lookupValue = user.lmsUsername;
            
            try {
                const res = await apiClient.post('/candidate/lookup', {
                    candidateNumber: lookupValue,
                    email: lookupValue
                });

                if (res.data && res.data.success) {
                    setProfile(res.data.data);
                } else {
                    setError(res.data?.message || 'Candidate record not found.');
                }
            } catch (err: any) {
                console.error('Failed to lookup candidate:', err);
                setError(err.response?.data?.message || 'Failed to fetch your dashboard profile.');
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [router]);


    return (
        <div className="max-w-5xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-8">
            {/* Header */}
            <div className="border-b border-zinc-200 pb-6 dark:border-zinc-800 space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFC700] text-black font-extrabold text-xs uppercase tracking-wider">
                    <Sparkles className="h-3.5 w-3.5" />
                    Aveling FIFO Ticket Sponsorship Portal
                </div>
                <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
                    Candidate Dashboard
                </h1>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    View your recruiter-assigned ticket sponsorships, check your wallet refund balance, and access your required compliance courses.
                </p>
            </div>

            {/* Candidate Lookup Form (Hidden for Auth Users) */}
            {error && (
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-md space-y-4">
                    <div className="flex flex-col items-center gap-4 py-6">
                        <AlertCircle className="h-12 w-12 text-rose-500" />
                        <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Profile Not Found</h3>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 text-center max-w-md">
                            {error}
                        </p>
                        <button
                            onClick={() => router.push('/login')}
                            className="mt-4 bg-[#FFC700] text-black font-extrabold text-sm px-8 py-3 rounded-xl hover:bg-yellow-400"
                        >
                            Return to Login
                        </button>
                    </div>
                </div>
            )}

            {loading && !error && (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-zinc-200 border-t-[#FFC700]"></div>
                    <p className="text-sm font-bold text-zinc-500 animate-pulse">Loading your training profile...</p>
                </div>
            )}

            {/* Candidate Details & Assigned Tickets View (1.1.4, 1.1.5, 1.1.17, 1.1.18) */}
            {profile && (
                <div className="space-y-6">
                    {/* Candidate Profile Summary Banner */}
                    <div className="bg-gradient-to-r from-zinc-900 to-zinc-800 text-white rounded-2xl p-6 shadow-xl border border-zinc-700 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-[#FFC700] text-black font-bold flex items-center justify-center">
                                    <User className="h-5 w-5" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-extrabold">{profile.fullName}</h2>
                                    <p className="text-xs font-mono text-amber-400">Registration ID: {profile.candidateNumber}</p>
                                </div>
                            </div>
                            <p className="text-xs text-zinc-300 pl-13">{profile.email}</p>
                        </div>

                        {/* Wallet Balance Highlight (1.1.17 & 1.1.18) */}
                        <div className="bg-zinc-800/90 border border-amber-500/40 rounded-xl p-4 flex items-center gap-4">
                            <div className="h-12 w-12 rounded-xl bg-amber-500/20 text-[#FFC700] flex items-center justify-center">
                                <Wallet className="h-6 w-6" />
                            </div>
                            <div>
                                <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider block">
                                    Available Ticket Sponsorship Wallet Balance
                                </span>
                                <span className="text-2xl font-black text-[#FFC700]">
                                    ${Number(profile.walletBalance || 0).toFixed(2)} AUD
                                </span>
                                <span className="block text-[11px] text-emerald-400 font-semibold mt-0.5">
                                    ✓ Available for ticket sponsorship pay-ahead
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Assigned Ticket Courses List (1.1.4 & 1.1.5) */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-extrabold text-zinc-900 dark:text-white flex items-center gap-2">
                            <Award className="h-6 w-6 text-[#FFC700]" />
                            Assigned Sponsored Tickets & Required Courses
                        </h2>

                        <div className="grid grid-cols-1 gap-6">
                            {profile.tickets.map((tkt) => {
                                const isApproved = tkt.ticketSponsorship === 'first_attempt_approved' || tkt.status === 'possessed';
                                return (
                                    <div
                                        key={tkt.id}
                                        className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col lg:flex-row justify-between lg:items-center gap-6"
                                    >
                                        <div className="space-y-3 flex-1">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="font-mono text-xs font-bold text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded">
                                                    TICKET ID: {tkt.id}
                                                </span>
                                                <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${tkt.ticketSponsorship === 'first_attempt_approved'
                                                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300'
                                                        : tkt.ticketSponsorship === 'ticket_issued'
                                                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border border-purple-300'
                                                            : 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 border border-amber-300'
                                                    }`}>
                                                    SPONSORSHIP STATE: {tkt.ticketSponsorship || tkt.status}
                                                </span>
                                                {tkt.Course?.format && (
                                                    <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-zinc-800 text-white">
                                                        {tkt.Course.format} FORMAT
                                                    </span>
                                                )}
                                            </div>

                                            <div>
                                                <h3 className="text-lg font-extrabold text-zinc-900 dark:text-white">
                                                    {tkt.ticketType}
                                                </h3>
                                                {tkt.Course && (
                                                    <p className="text-xs font-bold text-[#FFC700] mt-1">
                                                        Mapped Course: {tkt.Course.name} ({tkt.Course.code})
                                                    </p>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-4 text-xs text-zinc-600 dark:text-zinc-400">
                                                <span>
                                                    Course Price:{' '}
                                                    <span className="line-through text-zinc-400 dark:text-zinc-500 mr-2">
                                                        ${Number(tkt.realPrice || 0).toFixed(2)}
                                                    </span>
                                                    <strong className="text-zinc-900 dark:text-white">
                                                        ${Number(tkt.subsidisedPrice !== null ? tkt.subsidisedPrice : tkt.purchasePrice || 0).toFixed(2)}
                                                    </strong>
                                                </span>
                                                <span>•</span>
                                                <span>100% Refundable on Completion</span>
                                            </div>
                                        </div>

                                        <div className="shrink-0 pt-2 lg:pt-0">
                                            {tkt.paymentStatus === 'payment_verified' || tkt.courseAccessGranted ? (
                                                <button
                                                    onClick={() => router.push(`/courses/${tkt.Course?.id || ''}`)}
                                                    className="w-full lg:w-auto inline-flex items-center justify-center gap-2 bg-emerald-500 text-white font-extrabold text-xs px-8 py-4 rounded-xl hover:bg-emerald-600 transition-all uppercase tracking-wider shadow-md"
                                                >
                                                    <span>Go to Course Workspace</span>
                                                    <ArrowRight className="h-4 w-4 stroke-[3]" />
                                                </button>
                                            ) : tkt.paymentStatus === 'receipt_submitted' ? (
                                                <button
                                                    disabled
                                                    className="w-full lg:w-auto inline-flex items-center justify-center gap-2 bg-amber-200 text-amber-800 font-extrabold text-xs px-8 py-4 rounded-xl uppercase tracking-wider shadow-inner cursor-not-allowed"
                                                >
                                                    <Lock className="h-4 w-4 stroke-[3]" />
                                                    <span>Awaiting Admin Verification</span>
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => router.push(`/checkout?ticketId=${tkt.id}&candidateNumber=${profile.candidateNumber}&courseId=${tkt.Course?.id || ''}&price=${tkt.subsidisedPrice !== null ? tkt.subsidisedPrice : tkt.purchasePrice}&wallet=${profile.walletBalance}`)}
                                                    className="w-full lg:w-auto inline-flex items-center justify-center gap-2 bg-[#FFC700] text-black font-extrabold text-xs px-8 py-4 rounded-xl hover:bg-yellow-400 transition-all uppercase tracking-wider shadow-md"
                                                >
                                                    <span>Start Course & Checkout</span>
                                                    <ArrowRight className="h-4 w-4 stroke-[3]" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
