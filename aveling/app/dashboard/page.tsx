'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Award, User, CreditCard, ArrowRight, Wallet, Lock, Sparkles, AlertCircle, FileText, Download, Mail } from 'lucide-react';
import { apiClient } from '../../lib/axios';
import { PageShell } from '../../components/PageShell';

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

export default function SponsoredCourseLookupPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [profile, setProfile] = useState<CandidateProfile | null>(null);

    React.useEffect(() => {
        const fetchProfile = async () => {
            const userStr = localStorage.getItem('lms_user');
            if (!userStr) { router.push('/login'); return; }
            const user = JSON.parse(userStr);
            try {
                const res = await apiClient.post('/candidate/lookup', { candidateNumber: user.lmsUsername, email: user.lmsUsername });
                if (res.data?.success) setProfile(res.data.data);
                else setError(res.data?.message || 'Candidate record not found.');
            } catch (err: any) {
                setError(err.response?.data?.message || 'Failed to fetch your dashboard profile.');
            } finally { setLoading(false); }
        };
        fetchProfile();
    }, [router]);

    return (
        <PageShell>
            <div className="mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFC700] text-black font-extrabold text-xs uppercase tracking-wider w-fit mb-3">
                    <Sparkles className="h-3.5 w-3.5" /> FIFO Ticket Sponsorship Portal
                </div>
                <h1 className="text-4xl font-black text-zinc-900 tracking-tight">Candidate Dashboard</h1>
                <p className="text-sm font-medium text-zinc-500 mt-2 max-w-2xl">View your recruiter-assigned ticket sponsorships, check your wallet balance, and access your compliance courses.</p>
            </div>
            <div className="w-full h-0.5 bg-[#FFC700] mb-10" />

            {error && (
                <div className="bg-white border-2 border-zinc-200 rounded-2xl p-10 shadow-md text-center space-y-5">
                    <AlertCircle className="h-12 w-12 text-rose-400 mx-auto" />
                    <h3 className="text-xl font-black text-zinc-900">Profile Not Found</h3>
                    <p className="text-sm text-zinc-500">{error}</p>
                    <button onClick={() => router.push('/login')} className="bg-[#FFC700] text-black font-extrabold text-xs px-8 py-3.5 rounded-xl hover:bg-yellow-400 uppercase tracking-wider shadow-md">Return to Login</button>
                </div>
            )}

            {loading && !error && (
                <div className="flex flex-col items-center justify-center py-24 space-y-5">
                    <div className="animate-spin rounded-full h-14 w-14 border-4 border-zinc-200 border-t-[#FFC700]" />
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest animate-pulse">Loading training profile...</p>
                </div>
            )}

            {profile && (
                <div className="space-y-8">
                    <div className="bg-zinc-900 text-white rounded-2xl p-6 shadow-xl border border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-full bg-[#FFC700] text-black flex items-center justify-center shrink-0"><User className="h-6 w-6" /></div>
                            <div>
                                <h2 className="text-xl font-extrabold">{profile.fullName}</h2>
                                <p className="text-xs font-mono text-[#FFC700]">ID: {profile.candidateNumber}</p>
                                <p className="text-xs text-zinc-400 mt-0.5">{profile.email}</p>
                            </div>
                        </div>
                        <div className="bg-zinc-800/90 border border-[#FFC700]/30 rounded-xl p-4 flex items-center gap-4">
                            <div className="h-10 w-10 rounded-xl bg-[#FFC700]/20 text-[#FFC700] flex items-center justify-center shrink-0"><Wallet className="h-5 w-5" /></div>
                            <div>
                                <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider block">Wallet Credit</span>
                                <span className="text-2xl font-black text-[#FFC700]">${Number(profile.walletBalance || 0).toFixed(2)} AUD</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-xl font-black text-zinc-900 flex items-center gap-2"><Award className="h-6 w-6 text-[#FFC700]" />Assigned Sponsored Tickets & Required Courses</h2>
                        {profile.tickets.length === 0 && (
                            <div className="bg-white border border-zinc-200 rounded-2xl p-10 text-center shadow-sm">
                                <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest">No sponsored tickets assigned yet.</p>
                            </div>
                        )}
                        <div className="grid grid-cols-1 gap-6">
                            {profile.tickets.map((tkt) => {
                                const coursePrice = tkt.subsidisedPrice !== null ? tkt.subsidisedPrice : tkt.purchasePrice;
                                const isAccessGranted = tkt.paymentStatus === 'payment_verified' || tkt.courseAccessGranted;
                                return (
                                    <div key={tkt.id} className="bg-white border-2 border-zinc-200 rounded-2xl p-6 shadow-md hover:border-[#FFC700] transition-all">
                                        <div className="flex flex-col lg:flex-row justify-between lg:items-start gap-6">
                                            <div className="space-y-3 flex-1">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="font-mono text-xs font-bold text-black bg-[#FFC700] px-2.5 py-0.5 rounded">TICKET #{tkt.id}</span>
                                                    <span className={`text-xs font-bold px-3 py-0.5 rounded-full uppercase tracking-wider border ${tkt.ticketSponsorship?.includes('approved') ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : tkt.ticketSponsorship?.includes('rejected') ? 'bg-rose-100 text-rose-800 border-rose-300' : 'bg-amber-100 text-amber-900 border-amber-300'}`}>
                                                        {tkt.ticketSponsorship || tkt.status}
                                                    </span>
                                                    {tkt.Course?.format && <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-zinc-900 text-white">{tkt.Course.format}</span>}
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-extrabold text-zinc-900">{tkt.ticketType}</h3>
                                                    {tkt.description && <p className="text-sm text-zinc-500 mt-1">{tkt.description}</p>}
                                                    {tkt.Course && <p className="text-xs font-bold text-[#FFC700] mt-1">Course: {tkt.Course.name} ({tkt.Course.code})</p>}
                                                </div>
                                                <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-xs space-y-1">
                                                    <div className="flex justify-between font-bold text-zinc-500"><span>Original:</span><span className="line-through">${Number(tkt.realPrice || 0).toFixed(2)}</span></div>
                                                    <div className="flex justify-between font-black border-t border-zinc-200 pt-1"><span className="text-zinc-900">Payable:</span><span className="text-[#FFC700]">${Number(coursePrice || 0).toFixed(2)} AUD</span></div>
                                                </div>
                                            </div>
                                            <div className="shrink-0 flex flex-col gap-3">
                                                <div className="flex gap-2">
                                                    <button onClick={() => alert('Downloading Study Guide...')} className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-700 hover:text-black bg-zinc-100 px-3 py-2 rounded-lg border border-zinc-200">
                                                        <FileText className="h-3.5 w-3.5 text-[#FFC700]" /> Study Guide
                                                    </button>
                                                    <button onClick={() => alert('Downloading Safety Checklist...')} className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-700 hover:text-black bg-zinc-100 px-3 py-2 rounded-lg border border-zinc-200">
                                                        <Download className="h-3.5 w-3.5 text-emerald-500" /> Checklist
                                                    </button>
                                                </div>
                                                {isAccessGranted ? (
                                                    <button onClick={() => router.push(tkt.Course?.id ? `/courses/${tkt.Course.id}` : '/courses/default')} className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 text-white font-extrabold text-xs px-8 py-4 rounded-xl hover:bg-emerald-500 uppercase tracking-wider shadow-md">
                                                        Start Course <ArrowRight className="h-4 w-4 stroke-[3]" />
                                                    </button>
                                                ) : (tkt.paymentStatus && tkt.paymentStatus !== 'unpaid') ? (
                                                    <button disabled className="w-full inline-flex items-center justify-center gap-2 bg-amber-100 text-amber-800 font-extrabold text-xs px-8 py-4 rounded-xl uppercase tracking-wider cursor-not-allowed">
                                                        <Lock className="h-4 w-4 stroke-[3]" /> Awaiting Approval
                                                    </button>
                                                ) : (
                                                    <button onClick={() => router.push(`/checkout?ticketId=${tkt.id}&candidateNumber=${profile.candidateNumber}&courseId=${tkt.Course?.id || ''}&price=${coursePrice}&wallet=${profile.walletBalance}`)} className="w-full inline-flex items-center justify-center gap-2 bg-[#FFC700] text-black font-extrabold text-xs px-8 py-4 rounded-xl hover:bg-yellow-400 uppercase tracking-wider shadow-md">
                                                        <CreditCard className="h-4 w-4" /> Start & Checkout <ArrowRight className="h-4 w-4 stroke-[3]" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        <div className="mt-4 bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-xs text-zinc-500 flex items-center gap-2">
                                            <Mail className="h-4 w-4 shrink-0" />
                                            <span>Upon passing your exam, results and your digital ticket will be sent to <strong className="text-zinc-700">{profile.email}</strong> and synced to your recruiter portal.</span>
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
