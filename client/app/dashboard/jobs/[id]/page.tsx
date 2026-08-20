'use client';

import React, { useState } from 'react';
import { useApiQuery, useApiMutation } from '@/lib/hooks';
import { useParams, useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { CONSTANTS } from '@/constants';
import Link from 'next/link';

export default function JobDetailPage() {
    const params = useParams();
    const jobId = params.id as string;
    const router = useRouter();
    const queryClient = useQueryClient();
    const { data: job, isLoading } = useApiQuery<any>(['job', jobId], `/jobs/${jobId}`);
    const { data: userData } = useApiQuery<any>(['auth', 'me'], '/auth/me');

    const applyMutation = useApiMutation('post', '/applications', {
        onSuccess: (data: any) => {
            queryClient.invalidateQueries({ queryKey: ['applicant', 'dashboard'] });
            router.push(`${CONSTANTS.ROUTES.APPLICATIONS}/${data.id}`);
        }
    });

    const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
    const [tickets, setTickets] = useState<{ ticketType: string }[]>([]);

    const handleInitialApplyClick = () => {
        const user = userData?.user;
        const isBiodataComplete = !!(user?.fullName && user?.phoneNumber && user?.nationality);
        const isPsychometricComplete = !!(user?.psychometricModule1Passed && user?.psychometricModule2Passed);
        const isCvUploaded = !!user?.cvUrl;

        if (!isBiodataComplete) {
            alert('Your professional profile is incomplete. Please complete your basic biodata (Name, Phone, Nationality) before proceeding.');
            router.push(`${CONSTANTS.ROUTES.PROFILE}?redirect=/dashboard/jobs/${jobId}`);
            return;
        }

        if (!isPsychometricComplete) {
            alert('You must pass the Aveling Psychometric Test before proceeding.');
            const token = localStorage.getItem('accessToken');
            const avelingUrl = 'https://aveling.online';
            window.location.href = `${avelingUrl}/psychometric?token=${token}`;
            return;
        }

        if (!isCvUploaded) {
            alert('A CV/Resume document is required for screening. Redirecting to your document vault.');
            router.push(`${CONSTANTS.ROUTES.CV}?redirect=/dashboard/jobs/${jobId}`);
            return;
        }

        // Open modal to add tickets
        setIsApplyModalOpen(true);
    };

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
        // filter out empty tickets
        const validTickets = tickets.filter(t => t.ticketType.trim() !== '');
        applyMutation.mutate({ jobId: parseInt(jobId, 10), tickets: validTickets });
        setIsApplyModalOpen(false);
    };

    const isReadyToApply = userData?.user?.fullName && userData?.user?.phoneNumber && userData?.user?.nationality && userData?.user?.cvUrl && userData?.user?.psychometricModule1Passed && userData?.user?.psychometricModule2Passed;

    const renderRichText = (text: string) => {
        if (!text) return null;
        const lines = text.split('\n');
        return (
            <div className="space-y-3">
                {lines.map((line, idx) => {
                    const trimmed = line.trim();
                    if (!trimmed) return null;

                    const listMatch = trimmed.match(/^(\d+\.)\s*(.*)/);
                    if (listMatch) {
                        return (
                            <div key={idx} className="flex gap-4 items-start bg-white p-5 rounded-2xl border border-blue-50/60 shadow-sm shadow-blue-900/5 group hover:border-blue-200 hover:shadow-md transition-all">
                                <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-blue-50 rounded-full text-[10px] font-black text-blue-900 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                    {listMatch[1].replace('.', '')}
                                </span>
                                <span className="text-sm font-medium text-slate-600 leading-relaxed pt-1.5">
                                    {listMatch[2]}
                                </span>
                            </div>
                        );
                    }

                    if (trimmed.includes(':') && trimmed.split(':')[0].length < 30) {
                        const parts = trimmed.split(':');
                        const label = parts[0];
                        const rest = parts.slice(1).join(':');
                        return (
                            <div key={idx} className="text-sm md:text-base text-slate-600 leading-relaxed bg-blue-50/30 p-4 rounded-xl border border-blue-50/50 flex items-start gap-3">
                                <span className="material-symbols-outlined text-blue-300 mt-0.5 text-lg">info</span>
                                <div>
                                    <span className="font-bold text-blue-900 mr-2">{label}:</span>
                                    <span>{rest}</span>
                                </div>
                            </div>
                        );
                    }

                    if (trimmed.length < 40 && !trimmed.endsWith('.') && !trimmed.includes(',')) {
                        return (
                            <h3 key={idx} className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 mt-10 mb-4 pb-2 flex items-center gap-3">
                                <span className="w-6 h-[1px] bg-blue-100" />
                                {trimmed}
                            </h3>
                        );
                    }

                    return (
                        <p key={idx} className="text-sm md:text-base text-slate-600 leading-loose font-medium">
                            {trimmed}
                        </p>
                    );
                })}
            </div>
        );
    };

    if (isLoading) return (
        <div className="space-y-12 animate-pulse">
            <div className="h-64 bg-blue-50/50 rounded-[3rem]" />
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                <div className="lg:col-span-8 h-96 bg-blue-50/50 rounded-[3rem]" />
                <div className="lg:col-span-4 h-96 bg-blue-50/50 rounded-[3rem]" />
            </div>
        </div>
    );

    if (!job) return (
        <div className="py-20 text-center bg-blue-50 rounded-[3rem] border border-blue-100 mt-12 flex flex-col items-center">
            <span className="material-symbols-outlined text-blue-300 text-6xl mb-6">search_off</span>
            <h2 className="text-xl font-bold text-blue-900 uppercase tracking-widest">Listing Unavailable</h2>
            <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mt-2 mb-8 max-w-sm">
                The requested job listing does not exist or is no longer active. However, our requirements are constantly evolving.
            </p>
            <Link href="/expression-of-interest" className="bg-blue-900 text-white px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-black transition-all">
                Register Expression of Interest
            </Link>
            <Link href="/dashboard/jobs" className="inline-block mt-6 text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] hover:text-blue-900 transition-all">
                Return to Jobs
            </Link>
        </div>
    );

    // Extract salary (Prioritize explicit field, fallback to benefits)
    const salaryDisplay = job.salary || (job.JobBenefits?.find((b: any) => b.benefitType.toLowerCase().includes('salary'))?.value || 'Salary Undisclosed');

    const requirements = job.requirements ? job.requirements.split('\n').filter((line: string) => line.trim()) : [];


    return (
        <div className="space-y-10 selection:bg-blue-100 selection:text-blue-900 pb-10 antialiased">
            {/* Hero Job Header */}
            <div className="flex flex-col xl:flex-row gap-12 items-start">
                <div className="flex-1 space-y-8">
                    <div className="flex items-center gap-4 flex-wrap">
                        <span className="bg-blue-900 text-white px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.3em]">Verified Listing</span>
                        <span className="text-blue-400 text-[9px] font-black uppercase tracking-[0.2em]">{job.employmentType}</span>
                        {job.visaSponsorship && (
                            <span className="bg-emerald-50 text-emerald-600 px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.3em] border border-emerald-100">Visa Sponsor</span>
                        )}
                    </div>
                    <h1 className="text-5xl lg:text-7xl font-bold leading-[1.1] tracking-tighter text-blue-900 drop-shadow-sm">{job.title}</h1>
                    <div className="flex flex-wrap gap-6 text-blue-400 font-bold">
                        <div className="flex items-center gap-3 bg-blue-50/50 border border-blue-100 px-6 py-3 rounded-2xl">
                            <span className="material-symbols-outlined text-blue-900">corporate_fare</span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-blue-900">{job.JobCategory?.name || 'Uncategorized'}</span>
                        </div>
                        <div className="flex items-center gap-3 bg-blue-50/50 border border-blue-100 px-6 py-3 rounded-2xl">
                            <span className="material-symbols-outlined text-blue-900">location_on</span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-blue-900">{job.location || 'Location Undisclosed'}</span>
                        </div>
                        <div className="flex items-center gap-3 bg-emerald-50/50 border border-emerald-100 px-6 py-3 rounded-2xl">
                            <span className="material-symbols-outlined text-emerald-600">payments</span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700">{salaryDisplay}</span>
                        </div>
                    </div>
                </div>

                <div className="w-full xl:w-96 flex flex-col gap-6">
                    <button
                        onClick={handleInitialApplyClick}
                        disabled={applyMutation.isPending}
                        className={`w-full py-6 rounded-3xl font-black text-[8.5px] uppercase tracking-[0.4em] transition-all active:scale-95 disabled:opacity-50 shadow-2xl ${isReadyToApply ? 'bg-blue-900 text-white shadow-blue-900/20 hover:bg-black' : 'bg-blue-100 text-blue-400'}`}
                    >
                        {applyMutation.isPending ? 'Processing...' : isReadyToApply ? 'Submit Application' : 'Complete Your Profile To Apply'}
                    </button>

                    <div className="bg-white p-8 rounded-[2.5rem] border border-blue-100 shadow-sm space-y-6">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-900 flex items-center gap-3">
                            <span className="material-symbols-outlined text-base">task_alt</span>
                            Application Readiness
                        </h4>

                        <div className="space-y-4">
                            <ReadinessItem
                                label="Personal Information"
                                isComplete={!!(userData?.user?.fullName && userData?.user?.phoneNumber && userData?.user?.nationality)}
                                link={`${CONSTANTS.ROUTES.PROFILE}?redirect=/dashboard/jobs/${jobId}`}
                            />
                            <ReadinessItem
                                label="Aveling Psychometric Test"
                                isComplete={!!(userData?.user?.psychometricModule1Passed && userData?.user?.psychometricModule2Passed)}
                                link={process.env.NEXT_PUBLIC_AVELING_URL ? `${process.env.NEXT_PUBLIC_AVELING_URL}/psychometric?token=${typeof window !== 'undefined' ? localStorage.getItem('accessToken') : ''}` : '#'}
                                external={true}
                            />
                            <ReadinessItem
                                label="CV / Career History"
                                isComplete={!!userData?.user?.cvUrl}
                                link={`${CONSTANTS.ROUTES.CV}?redirect=/dashboard/jobs/${jobId}`}
                            />
                        </div>

                        <p className="text-[9px] text-blue-400 font-bold uppercase tracking-widest leading-relaxed pt-2 border-t border-blue-50">
                            Status: {isReadyToApply ? 'Ready to Apply' : 'Action Required'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Content Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                <div className="lg:col-span-8 space-y-16">
                    <section className="space-y-8">
                        <div>
                            <h2 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.4em] mb-8 pb-4 border-b border-blue-50 flex items-center gap-4">
                                <span className="w-10 h-[1px] bg-blue-100" />
                                01. Job Description
                            </h2>
                            {renderRichText(job.description)}
                        </div>

                        {job.requirements && (
                            <div>
                                <h2 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.4em] mb-8 pb-4 border-b border-blue-50 flex items-center gap-4">
                                    <span className="w-10 h-[1px] bg-blue-100" />
                                    02. Key Requirements
                                </h2>
                                <div className="bg-slate-50/50 p-6 md:p-10 rounded-[2.5rem] border border-blue-50">
                                    {renderRichText(job.requirements)}
                                </div>
                            </div>
                        )}

                        {job.RequiredTickets?.length > 0 && (
                            <div>
                                <h2 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.4em] mb-8 pb-4 border-b border-blue-50 flex items-center gap-4">
                                    <span className="w-10 h-[1px] bg-blue-100" />
                                    03. Required Certifications
                                </h2>
                                <div className="p-6 bg-blue-50/50 border border-blue-100 rounded-[2.5rem] space-y-6">
                                    <div className="flex items-start gap-4 mb-8">
                                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                                            <span className="material-symbols-outlined text-blue-900">school</span>
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-black text-blue-900 uppercase tracking-widest mb-2">Training & Sponsorship Available</h3>
                                            <p className="text-xs text-blue-500 font-medium leading-relaxed">
                                                Do not have these tickets? We provide full training and partial sponsorship for required certifications. You can still apply without them!
                                            </p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {job.RequiredTickets.map((ticket: any, i: number) => (
                                            <div key={i} className="bg-white p-5 rounded-2xl border border-blue-50 hover:border-blue-200 transition-colors">
                                                <div className="flex flex-col h-full justify-between gap-4">
                                                    <div>
                                                        <h4 className="text-xs font-black text-blue-900 uppercase tracking-widest mb-1">{ticket.name}</h4>
                                                        {ticket.description && (
                                                            <p className="text-[10px] text-blue-400 font-medium line-clamp-2">{ticket.description}</p>
                                                        )}
                                                    </div>
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-widest w-fit border border-emerald-100">
                                                        <span className="material-symbols-outlined text-[10px]">stars</span>
                                                        Over 50% sponsorship available depending on role
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {(job.JobBenefits?.length > 0 || job.JobConditions?.length > 0) && (
                            <div className="bg-blue-900 text-white p-12 rounded-[4rem] shadow-2xl shadow-blue-900/10 space-y-12 relative overflow-hidden">
                                <span className="absolute -top-10 -right-10 material-symbols-outlined text-[20rem] opacity-5 text-white italic">award_star</span>

                                <div className="relative z-10 grid grid-cols-1 gap-16">
                                    <div className="space-y-10">
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-300">Employee Benefits</h3>
                                        <div className="space-y-6">
                                            {job.JobBenefits?.map((benefit: any) => (
                                                <div key={benefit.id} className="group flex items-start gap-4">
                                                    <span className="material-symbols-outlined text-blue-300 text-xl group-hover:text-white transition-colors">check_circle</span>
                                                    <div>
                                                        <h4 className="text-sm font-bold text-white leading-relaxed group-hover:text-blue-100 transition-colors">{benefit.description || benefit.benefitType}</h4>
                                                        {benefit.value && <span className="inline-block mt-2 px-3 py-1 bg-white/10 rounded-lg text-[9px] font-black uppercase tracking-widest text-blue-100">{benefit.value}</span>}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </section>
                </div>

                {/* Vertical Application Journey */}

            </div>

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

function ReadinessItem({ label, isComplete, link, external }: { label: string, isComplete: boolean, link: string, external?: boolean }) {
    return (
        <div className="flex items-center justify-between group">
            <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${isComplete ? 'bg-emerald-500 text-white' : 'bg-blue-50 text-blue-300'}`}>
                    <span className="material-symbols-outlined text-[14px] font-bold">
                        {isComplete ? 'check' : 'pending'}
                    </span>
                </div>
                <span className={`text-[11px] font-bold uppercase tracking-tight transition-colors ${isComplete ? 'text-blue-900' : 'text-blue-400'}`}>
                    {label}
                </span>
            </div>
            {!isComplete && (
                external ? (
                    <a href={link} className="text-[9px] font-black uppercase tracking-widest text-blue-900 hover:underline decoration-2 underline-offset-4">
                        Update
                    </a>
                ) : (
                    <Link href={link} className="text-[9px] font-black uppercase tracking-widest text-blue-900 hover:underline decoration-2 underline-offset-4">
                        Update
                    </Link>
                )
            )}
        </div>
    );
}
