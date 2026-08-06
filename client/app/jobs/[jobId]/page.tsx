'use client';

import React, { useState, useEffect } from 'react';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { PublicFooter } from '@/components/layout/PublicFooter';
import { useApiQuery, useApiMutation } from '@/lib/hooks';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

interface JobDetail {
    id: number;
    title: string;
    description: string;
    location: string;
    salary: string;
    employmentType: string;
    JobCategory: { name: string };
    JobBenefits: { benefitType: string; description: string }[];
    JobConditions: { name: string; description: string }[];
    visaSponsorship: boolean;
}

export default function JobDetailPage() {
    const params = useParams();
    const router = useRouter();
    const jobId = params.jobId as string;
    const { user } = useAuth();

    const { data: job, isLoading: isJobLoading } = useApiQuery<JobDetail>(['job', jobId], `/jobs/${jobId}`);
    const { data: userData, isLoading: isUserLoading, refetch: refetchUser } = useApiQuery<any>(['auth', 'me'], '/auth/me', { enabled: !!user });
    const { data: appsData } = useApiQuery<any>(['applications', 'user'], '/applications', { enabled: !!user });

    const applyMutation = useApiMutation('post', '/applications', {
        onSuccess: (data: any) => {
            router.push(`/dashboard/applications/${data.id}`);
        }
    });

    const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
    const [tickets, setTickets] = useState<{ ticketType: string }[]>([]);

    const handleAddTicket = () => setTickets([...tickets, { ticketType: '' }]);
    const handleTicketChange = (index: number, val: string) => {
        const newT = [...tickets];
        newT[index].ticketType = val;
        setTickets(newT);
    };
    const handleRemoveTicket = (index: number) => {
        const newT = [...tickets];
        newT.splice(index, 1);
        setTickets(newT);
    };

    const handleFinalSubmit = () => {
        const validTickets = tickets.filter(t => t.ticketType.trim() !== '');
        applyMutation.mutate({ jobId: parseInt(jobId, 10), tickets: validTickets });
        setIsApplyModalOpen(false);
    };

    if (isJobLoading || (!!user && isUserLoading)) {
        return (
            <div className="bg-white min-h-screen flex flex-col font-sans">
                <PublicHeader />
                <main className="flex-1 pt-32 pb-16 px-6 max-w-[1000px] mx-auto w-full">
                    <div className="h-[600px] bg-blue-50 border border-blue-100 rounded-[3rem] animate-pulse" />
                </main>
                <PublicFooter />
            </div>
        );
    }

    if (!job) return (
        <div className="bg-white min-h-screen flex flex-col font-sans">
            <PublicHeader />
            <main className="flex-1 pt-32 pb-16 text-center px-6 max-w-[600px] mx-auto w-full flex flex-col items-center justify-center space-y-8">
                <div className="w-20 h-20 bg-blue-50 text-blue-900 rounded-3xl flex items-center justify-center mx-auto shadow-xl shadow-blue-900/5">
                    <span className="material-symbols-outlined text-4xl">search_off</span>
                </div>
                <div className="space-y-4">
                    <h1 className="text-3xl font-black text-blue-900 uppercase tracking-tight">Position Unavailable</h1>
                    <p className="text-[12px] font-bold text-blue-500 uppercase tracking-widest leading-relaxed">
                        This specific role is no longer active or could not be found. However, our requirements are constantly evolving.
                    </p>
                </div>
                <div className="w-full space-y-4 pt-4 border-t border-blue-50">
                    <button 
                        onClick={() => {
                            if (!user) {
                                router.push(`/register?redirect=/expression-of-interest`);
                            } else {
                                router.push(`/expression-of-interest`);
                            }
                        }}
                        className="w-full py-4 bg-blue-900 text-white rounded-xl font-bold text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-blue-900/10 hover:bg-blue-800 transition-all active:scale-[0.98]"
                    >
                        Register Expression of Interest
                    </button>
                    <Link href="/jobs" className="block w-full py-4 bg-white border-2 border-blue-100 text-blue-900 rounded-xl font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-blue-50 transition-all active:scale-[0.98]">
                        Return to Listings
                    </Link>
                </div>
            </main>
            <PublicFooter />
        </div>
    );

    const currentUser = userData?.user;
    const userApplications = appsData?.rows || [];
    const hasAlreadyApplied = userApplications.some((app: any) => app.jobId === parseInt(jobId));

    const checkRequirements = () => {
        if (!currentUser) return { complete: false };
        const missingBio = !currentUser.phoneNumber || !currentUser.address || !currentUser.city || !currentUser.country;
        const missingCV = !currentUser.cvUrl;
        return { complete: !missingBio && !missingCV, missingBio, missingCV };
    };

    const requirements = checkRequirements();

    const handleApply = () => {
        if (!user) {
            router.push(`/register?redirect=/dashboard/jobs/${jobId}`);
            return;
        }
        if (requirements.complete) {
            setIsApplyModalOpen(true);
        }
    };
    const salaryDisplay = job.salary || 'Salary Undisclosed';


    return (
        <div className="bg-white text-blue-900 antialiased min-h-screen flex flex-col font-sans">
            <PublicHeader />

            <main className="pt-24 lg:pt-32 pb-24 px-6 max-w-[1100px] mx-auto w-full flex-1">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                    {/* Main Content Area */}
                    <div className="lg:col-span-2 space-y-12">
                        <header className="space-y-6">
                            <div className="flex flex-wrap gap-4 items-center">
                                <span className="text-[10px] font-black italic text-blue-900 uppercase tracking-[0.3em] bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">{job.JobCategory?.name}</span>
                                <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] py-1.5">{job.employmentType}</span>
                                {job.visaSponsorship && (
                                    <span className="text-[9px] font-black bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-lg uppercase tracking-widest border border-emerald-100">
                                        Visa Sponsor
                                    </span>
                                )}
                            </div>
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black italic uppercase tracking-tighter text-blue-900 leading-none">
                                {job.title}
                            </h1>
                            <div className="flex items-center gap-2 text-[10px] font-black text-blue-900 uppercase tracking-widest">
                                <span className="material-symbols-outlined text-sm font-bold">location_on</span>
                                {job.location}
                            </div>
                            <div className="flex items-center gap-3 bg-emerald-50/50 border border-emerald-100 px-6 py-3 rounded-2xl">
                                <span className="material-symbols-outlined text-emerald-600">payments</span>
                                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700">{salaryDisplay}</span>
                            </div>
                        </header>

                        <section className="space-y-8 pt-12 border-t border-blue-50">
                            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-400">Position Overview</h2>
                            <div className="text-blue-500 font-medium leading-relaxed prose prose-lg prose-blue max-w-none text-sm md:text-base" dangerouslySetInnerHTML={{ __html: job.description }} />
                        </section>
                    </div>

                    {/* Sidebar Area */}
                    <aside className="space-y-12 h-fit lg:sticky lg:top-32">
                        <section className="p-8 md:p-10 bg-white border border-blue-100 rounded-[2.5rem] shadow-2xl shadow-blue-900/5 space-y-8">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-900">Application Access</h3>

                            {!user ? (
                                <div className="space-y-4">
                                    <button
                                        onClick={handleApply}
                                        className="w-full bg-blue-900 text-white py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] shadow-xl shadow-blue-900/10 hover:bg-black transition-all active:scale-[0.98]"
                                    >
                                        Apply for Role
                                    </button>
                                    <Link
                                        href={`/login?redirect=/dashboard/jobs/${jobId}`}
                                        className="block text-center w-full bg-blue-50 text-blue-900 border border-blue-100 py-4 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] hover:bg-blue-100 transition-all"
                                    >
                                        Already Registered? Sign In
                                    </Link>
                                    <p className="text-[9px] font-bold text-blue-400 text-center uppercase tracking-widest leading-loose">
                                        Independent verification required. Create an account to access talent dashboard.
                                    </p>
                                </div>
                            ) : hasAlreadyApplied ? (
                                <div className="space-y-6">
                                    <div className="bg-emerald-50 border border-emerald-100 text-emerald-600 p-6 rounded-2xl text-center">
                                        <span className="material-symbols-outlined text-xl mb-2">check_circle</span>
                                        <p className="text-[10px] font-black uppercase tracking-widest leading-tight">Application Received</p>
                                    </div>
                                    <Link
                                        href="/dashboard/applications"
                                        className="w-full bg-blue-900 text-white py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] text-center block"
                                    >
                                        View Application Status
                                    </Link>
                                </div>
                            ) : !requirements.complete ? (
                                <div className="space-y-8">
                                    <div className="bg-amber-50 border border-amber-100 p-6 rounded-2xl space-y-4">
                                        <h4 className="text-[9px] font-black uppercase tracking-widest text-amber-700 flex items-center gap-2">
                                            <span className="material-symbols-outlined text-xs">warning</span>
                                            Profile Incomplete
                                        </h4>
                                        <ul className="text-[10px] font-bold text-amber-600 uppercase tracking-tight space-y-2 list-none p-0">
                                            {requirements.missingBio && <li className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-amber-400"></span>Missing Personal Information</li>}
                                            {requirements.missingCV && <li className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-amber-400"></span>Missing Resume</li>}
                                        </ul>
                                    </div>

                                    <div className="space-y-3">
                                        {requirements.missingBio && (
                                            <Link href="/dashboard/profile" className="block text-center py-4 bg-blue-50 text-blue-900 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] border border-blue-100 hover:bg-blue-100 transition-all">
                                                Update Profile
                                            </Link>
                                        )}
                                        {requirements.missingCV && (
                                            <Link href="/dashboard/cv" className="block text-center py-4 bg-blue-50 text-blue-900 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] border border-blue-100 hover:bg-blue-100 transition-all">
                                                Upload Resume
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <button
                                        onClick={handleApply}
                                        disabled={applyMutation.isPending}
                                        className="w-full bg-blue-900 text-white py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] shadow-xl shadow-blue-900/10 hover:bg-emerald-600 transition-all active:scale-[0.98] disabled:opacity-50"
                                    >
                                        {applyMutation.isPending ? 'Submitting...' : 'Submit Application'}
                                    </button>
                                    <p className="text-[9px] font-bold text-emerald-500 text-center uppercase tracking-widest leading-loose">
                                        Profile Ready • One-click submission active
                                        <br />
                                        <span className="text-blue-500">Training will be provided for any missing tickets.</span>
                                    </p>
                                </div>
                            )}
                        </section>

                        <section className="space-y-8 pt-12 border-t border-blue-50">
                            {job.JobBenefits?.length > 0 && (
                                <div className="space-y-6">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-400">Job Benefits</h3>
                                    <div className="space-y-6">
                                        {job.JobBenefits.map((b, i) => (
                                            <div key={i} className="flex gap-4 group">
                                                <div className="w-1 h-8 bg-blue-100 group-hover:bg-blue-900 transition-all shrink-0"></div>
                                                <div>
                                                    <h4 className="text-xs font-black uppercase tracking-widest mb-1 text-blue-900 italic">{b.benefitType}</h4>
                                                    <p className="text-xs text-blue-500 font-medium leading-relaxed">{b.description}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {job.JobConditions?.length > 0 && (
                                <div className="space-y-6 pt-12">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-400">Requirements & Conditions</h3>
                                    <div className="grid grid-cols-1 gap-4">
                                        {job.JobConditions.map((c, i) => (
                                            <div key={i} className="flex items-center gap-4 bg-blue-50/50 p-4 rounded-xl border border-blue-50">
                                                <span className="material-symbols-outlined text-blue-900 text-sm font-black">check_circle</span>
                                                <span className="text-[10px] font-black text-blue-900 uppercase tracking-widest">{c.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </section>
                    </aside>
                </div>
            </main>

            <PublicFooter />

            {isApplyModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-blue-900/80 backdrop-blur-sm">
                    <div className="bg-white rounded-[3rem] p-10 w-full max-w-2xl shadow-2xl border border-blue-50 relative">
                        <button onClick={() => setIsApplyModalOpen(false)} className="absolute top-8 right-8 text-blue-300 hover:text-blue-900 transition-colors">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                        
                        <h3 className="text-2xl font-bold text-blue-900 tracking-tight mb-2">Finalize Application</h3>
                        <div className="text-sm text-blue-400 mb-8 font-medium space-y-2">
                            <p>Please enter any certifications or tickets you possess before applying.</p>
                            <p className="text-emerald-600 font-bold bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                                <span className="material-symbols-outlined text-sm inline-block align-middle mr-1">info</span>
                                No tickets? No problem! You can submit this application empty. Full training will be provided for any required tickets.
                            </p>
                        </div>
                        
                        <div className="space-y-4 mb-8 max-h-[40vh] overflow-y-auto pr-2">
                            {tickets.map((t, idx) => (
                                <div key={idx} className="flex gap-4 items-center">
                                    <input 
                                        type="text" 
                                        placeholder="e.g. Working at Heights"
                                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={t.ticketType}
                                        onChange={e => handleTicketChange(idx, e.target.value)}
                                    />
                                    <button onClick={() => handleRemoveTicket(idx)} className="text-red-400 hover:text-red-600 p-2">
                                        <span className="material-symbols-outlined">delete</span>
                                    </button>
                                </div>
                            ))}
                            <button onClick={handleAddTicket} className="text-[10px] font-black uppercase tracking-widest text-blue-600 flex items-center gap-2 hover:text-blue-900">
                                <span className="material-symbols-outlined text-sm">add</span> Add Ticket
                            </button>
                        </div>
                        
                        <div className="flex gap-4">
                            <button 
                                onClick={() => setIsApplyModalOpen(false)}
                                className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleFinalSubmit}
                                className="flex-1 py-4 bg-blue-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-colors"
                            >
                                Submit Application
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
