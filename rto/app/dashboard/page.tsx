'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Award, User, CreditCard, ArrowRight, Wallet, Lock, ShieldCheck, AlertCircle, FileText, Download, Mail, BookOpen, Bot, Sparkles } from 'lucide-react';
import { apiClient } from '@/lib/axios';
import { PageShell } from '@/components/PageShell';
import { useAiAssistant } from '@/context/AiAssistantContext';

interface MappedTicket {
    id: number | string; userId: number | string; applicationId: number | string;
    status: string; ticketNumber: string | null; ticketType: string;
    description: string | null; purchasePrice: number; realPrice: number;
    subsidisedPrice: number | null; purchaseDate: string | null; expiryDate: string | null;
    proof: string | null; proofThumbnail: string | null; sponsorshipDeadline: string | null;
    ticketSponsorship: string | null; canApplySponsorship: boolean;
    ticketSponsorshipRefundAmount: number | null; refundStatus: string | null;
    courseId: string | null; receiptUrl: string | null; receiptReference: string | null;
    paymentStatus: string | null; courseAccessGranted: boolean;
    createdAt: string; updatedAt: string;
    Course: { id: string; name: string; code: string; format: 'THEORY' | 'PRACTICAL' | 'MIXED'; price: number; } | null;
}

interface CandidateProfile {
    id: string; fullName: string; email: string;
    candidateNumber: string; walletBalance: number; tickets: MappedTicket[];
}

export default function CandidateDashboardPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [profile, setProfile] = useState<CandidateProfile | null>(null);

    const { openAssistant, setHasPaid, setStudyContext } = useAiAssistant();

    React.useEffect(() => {
        // Reset to general program study context on dashboard
        setStudyContext(null);

        const fetchProfile = async () => {
            const userStr = localStorage.getItem('lms_user');
            if (!userStr) { router.push('/login'); return; }
            const user = JSON.parse(userStr);
            try {
                const res = await apiClient.post('/candidate/lookup', { candidateNumber: user.lmsUsername, email: user.lmsUsername });
                if (res.data?.success) {
                    const data = res.data.data;
                    setProfile(data);
                    const tickets = data.tickets || [];
                    const hasAnyVerified = tickets.some((t: any) => t.paymentStatus === 'payment_verified' || t.courseAccessGranted);
                    if (hasAnyVerified) {
                        setHasPaid(true);
                    }
                } else {
                    setError(res.data?.message || 'Candidate record not found.');
                }
            } catch (err: any) {
                setError(err.response?.data?.message || 'Failed to fetch your candidate profile.');
            } finally { setLoading(false); }
        };
        fetchProfile();
    }, [router, setHasPaid, setStudyContext]);

    return (
        <PageShell>
            {/* Header section */}
            <div className="mb-6">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ED9139]/10 text-[#ED9139] font-bold text-xs uppercase tracking-wider w-fit mb-2">
                    <ShieldCheck className="h-3.5 w-3.5" /> CertHero Candidate LMS Portal
                </div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Candidate Dashboard</h1>
                <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1 max-w-2xl">
                    View your assigned ticket courses, verify enrollment records, and complete required theoretical examinations.
                </p>
            </div>
            <div className="w-full h-0.5 bg-[#ED9139] mb-8" />

            {error && (
                <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm text-center space-y-4 max-w-lg mx-auto">
                    <AlertCircle className="h-10 w-10 text-rose-500 mx-auto" />
                    <h3 className="text-lg font-bold text-slate-900">Profile Not Found</h3>
                    <p className="text-xs text-slate-500">{error}</p>
                    <button
                        onClick={() => router.push('/login')}
                        className="bg-[#0f172a] text-white font-bold text-xs px-6 py-2.5 rounded-xl hover:bg-slate-800 uppercase tracking-wider transition-all"
                    >
                        Return to Login
                    </button>
                </div>
            )}

            {loading && !error && (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-[#ED9139]" />
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest animate-pulse">
                        Loading training records...
                    </p>
                </div>
            )}

            {profile && (
                <div className="space-y-6">
                    {/* Profile Banner */}
                    <div className="bg-[#0f172a] text-white rounded-2xl p-6 shadow-md border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-xl bg-[#ED9139] text-[#0f172a] flex items-center justify-center font-black text-xl shrink-0">
                                <User className="h-6 w-6" />
                            </div>
                            <div>
                                <h2 className="text-lg font-extrabold text-white">{profile.fullName}</h2>
                                <p className="text-xs font-mono text-[#ED9139] font-semibold">ID: {profile.candidateNumber}</p>
                                <p className="text-xs text-slate-400 mt-0.5">{profile.email}</p>
                            </div>
                        </div>
                        <div className="bg-slate-800/90 border border-slate-700 rounded-xl p-4 flex items-center gap-4">
                            <div className="h-10 w-10 rounded-lg bg-[#ED9139]/10 text-[#ED9139] flex items-center justify-center shrink-0">
                                <Wallet className="h-5 w-5" />
                            </div>
                            <div>
                                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Candidate Wallet Balance</span>
                                <span className="text-xl font-black text-[#ED9139]">${Number(profile.walletBalance || 0).toFixed(2)} AUD</span>
                            </div>
                        </div>
                    </div>

                    {/* CertHero AI Vocational Advisor Card */}
                    <div className="bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0F172A] text-white rounded-2xl p-5 border border-slate-700 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                            <div className="h-11 w-11 rounded-xl bg-[#FFC700] text-[#0F172A] flex items-center justify-center font-bold shrink-0 shadow-sm mt-0.5">
                                <Bot className="h-6 w-6" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="text-sm font-black uppercase tracking-wider text-white">CertHero AI Study & FIFO Career Mentor</h3>
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FFC700]/20 text-[#FFC700] border border-[#FFC700]/30">
                                        24/7 Vocational Support
                                    </span>
                                </div>
                                <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                                    Have questions regarding your mining ticket syllabus, Western Australia FIFO mobilization, host employer requirements (MACA, MinRes, Northern Star, Rio Tinto), or refund guarantees? Chat with your AI mentor now.
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => openAssistant("G'day! Can you give me an overview of the required prerequisite tickets and the next steps in my WA FIFO placement?")}
                            className="inline-flex items-center justify-center gap-2 bg-[#FFC700] hover:bg-[#f0bb00] text-[#0F172A] font-extrabold text-xs px-5 py-3 rounded-xl uppercase tracking-wider transition-all shrink-0 shadow-md hover:scale-105"
                        >
                            <Sparkles className="h-4 w-4 text-[#0F172A]" /> Ask Career Mentor
                        </button>
                    </div>

                    {/* Assigned Tickets & Courseware */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <Award className="h-5 w-5 text-[#ED9139]" /> Assigned Course Units & Qualifications
                            </h2>
                            <Link href="/catalog" className="text-xs font-bold text-[#0f172a] hover:text-[#ED9139] inline-flex items-center gap-1 transition-colors">
                                View Full Syllabus <ArrowRight className="h-3.5 w-3.5" />
                            </Link>
                        </div>

                        {profile.tickets.length === 0 && (
                            <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center shadow-sm">
                                <BookOpen className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                    No sponsored course units currently assigned.
                                </p>
                            </div>
                        )}

                        <div className="grid grid-cols-1 gap-5">
                            {profile.tickets.map((tkt) => {
                                const coursePrice = tkt.subsidisedPrice !== null ? tkt.subsidisedPrice : tkt.purchasePrice;
                                const isAccessGranted = tkt.paymentStatus === 'payment_verified' || tkt.courseAccessGranted;
                                return (
                                    <div
                                        key={tkt.id}
                                        className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:border-slate-300 transition-all"
                                    >
                                        <div className="flex flex-col lg:flex-row justify-between lg:items-start gap-6">
                                            <div className="space-y-3 flex-1">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="font-mono text-xs font-bold text-[#0f172a] bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200">
                                                        UNIT #{tkt.id}
                                                    </span>
                                                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider border ${
                                                        tkt.ticketSponsorship?.includes('approved') 
                                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                                            : tkt.ticketSponsorship?.includes('rejected') 
                                                            ? 'bg-rose-50 text-rose-700 border-rose-200' 
                                                            : 'bg-amber-50 text-amber-800 border-amber-200'
                                                    }`}>
                                                        {tkt.ticketSponsorship || tkt.status}
                                                    </span>
                                                    {tkt.Course?.format && (
                                                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-white">
                                                            {tkt.Course.format}
                                                        </span>
                                                    )}
                                                </div>

                                                <div>
                                                    <h3 className="text-base font-bold text-slate-900">{tkt.ticketType}</h3>
                                                    {tkt.description && <p className="text-xs text-slate-500 mt-1">{tkt.description}</p>}
                                                    {tkt.Course && (
                                                        <p className="text-xs font-semibold text-[#ED9139] mt-1">
                                                            Unit: {tkt.Course.name} ({tkt.Course.code})
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs space-y-1 max-w-sm">
                                                    <div className="flex justify-between text-slate-500 font-medium">
                                                        <span>Full Standard Price:</span>
                                                        <span className="line-through">${Number(tkt.realPrice || 0).toFixed(2)}</span>
                                                    </div>
                                                    <div className="flex justify-between font-bold border-t border-slate-200 pt-1">
                                                        <span className="text-slate-800">Sponsor Subsidised Price:</span>
                                                        <span className="text-[#0f172a]">${Number(coursePrice || 0).toFixed(2)} AUD</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="shrink-0 flex flex-col gap-3 min-w-[200px]">
                                                {isAccessGranted ? (
                                                    <button
                                                        onClick={() => router.push(tkt.Course?.id ? `/courses/${tkt.Course.id}` : '/courses/default')}
                                                        className="w-full inline-flex items-center justify-center gap-2 bg-[#ED9139] hover:bg-[#dd7f26] text-[#0f172a] font-bold text-xs px-6 py-3.5 rounded-xl uppercase tracking-wider shadow-sm transition-all"
                                                    >
                                                        Access Courseware <ArrowRight className="h-4 w-4" />
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => router.push(tkt.Course?.id ? `/courses/${tkt.Course.id}` : '/courses/default')}
                                                        className="w-full inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-6 py-3.5 rounded-xl uppercase tracking-wider transition-all"
                                                    >
                                                        Review Syllabus <ArrowRight className="h-4 w-4" />
                                                    </button>
                                                )}

                                                <div className="text-[11px] text-center text-slate-400">
                                                    <span>Theory Examination & VOC</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-4 bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-500 flex items-center gap-2">
                                            <Mail className="h-4 w-4 shrink-0 text-slate-400" />
                                            <span>
                                                Upon passing your exam, your official Statement of Attainment will be delivered to <strong className="text-slate-700">{profile.email}</strong> and saved to your credentials archive.
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </PageShell>
    );
}
