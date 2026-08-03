'use client';

import React, { useState } from 'react';
import { useApiQuery } from '@/lib/hooks';
import Link from 'next/link';

interface Job {
    id: number;
    title: string;
    location: string;
    salary: string;
    type: string;
    description: string;
    company: string;
    visaSponsorship: boolean;
    JobCategory?: { name: string };
}

export default function BrowseJobsPage() {
    const { data: user } = useApiQuery<any>(['auth', 'me'], '/auth/me');
    const [showApexModal, setShowApexModal] = useState(false);
    const [viewType, setViewType] = useState<'NORMAL' | 'APEX'>('NORMAL');
    const [searchQuery, setSearchQuery] = useState('');
    const [locationQuery, setLocationQuery] = useState('');
    const [employmentType, setEmploymentType] = useState('');
    const [sortBy, setSortBy] = useState<'Recommended' | 'Newest'>('Recommended');

    const { data: jobs, isLoading } = useApiQuery<any>(
        ['jobs', 'list', searchQuery, employmentType, sortBy, viewType],
        `/jobs?searchQuery=${searchQuery}&employmentType=${employmentType}&sortBy=${sortBy === 'Newest' ? 'createdAt' : ''}&sortOrder=DESC&jobType=${viewType}`
    );

    const handleToggleApex = (checked: boolean) => {
        if (checked && !user?.isApexMember) {
            setShowApexModal(true);
            return;
        }
        setViewType(checked ? 'APEX' : 'NORMAL');
    };

    const jobList = jobs?.rows || [];

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 selection:bg-blue-100 selection:text-blue-900 pb-24">
            {/* Header Section */}
            <header className="py-12 md:py-16 text-center md:text-left flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-blue-50 mb-12">
                <div className="max-w-2xl">
                    <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
                        <span className="w-2 h-2 rounded-full bg-blue-900" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400">Executive Talent Network</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tight text-blue-900 leading-[0.9] mb-6">
                        Discover your next <br />
                        <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-blue-900 via-blue-700 to-blue-400">career milestone</span>
                    </h1>
                    <p className="text-sm md:text-base text-blue-500 font-medium leading-relaxed max-w-xl mx-auto md:mx-0">
                        Curated high-impact roles for specialized talent. Navigate verified opportunities within the global recruitment process.
                    </p>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-6">
                    {/* Ghost Toggle */}
                    <div className="flex items-center gap-4 bg-blue-50/50 p-2 pl-4 rounded-2xl border border-blue-100">
                        <span className={`text-[9px] font-black uppercase tracking-widest ${viewType === 'APEX' ? 'text-blue-900' : 'text-blue-400'}`}>Apex Network</span>
                        <button
                            onClick={() => handleToggleApex(viewType === 'NORMAL')}
                            className={`w-12 h-6 rounded-full transition-all relative ${viewType === 'APEX' ? 'bg-blue-900' : 'bg-blue-200'}`}
                        >
                            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${viewType === 'APEX' ? 'left-7' : 'left-1'}`} />
                        </button>
                    </div>

                    <div className="flex items-center gap-1 bg-blue-50 p-1.5 rounded-2xl self-center md:self-end border border-blue-100 shadow-sm">
                        {(['Recommended', 'Newest'] as const).map((option) => (
                            <button
                                key={option}
                                onClick={() => setSortBy(option)}
                                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${sortBy === option ? 'bg-white text-blue-900 shadow-lg shadow-blue-900/5' : 'text-blue-400 hover:text-blue-600'}`}
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            {/* Unified Control Bar (Sticky) */}
            <div className="sticky top-4 z-40 mb-16 px-1">
                <div className="bg-white/80 backdrop-blur-xl border border-blue-100 rounded-[2rem] p-3 shadow-2xl shadow-blue-900/10 flex flex-col lg:flex-row items-center gap-3">
                    <div className="relative w-full lg:w-1/3 group">
                        <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-blue-300 group-focus-within:text-blue-900 transition-colors text-xl">search</span>
                        <input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Role, keyword, stack..."
                            className="w-full bg-blue-50/50 border-transparent rounded-[1.5rem] py-4 pl-14 pr-6 text-[11px] font-bold text-blue-900 focus:ring-4 focus:ring-blue-100 focus:bg-white transition-all outline-none placeholder:text-blue-300"
                        />
                    </div>
                    <div className="relative w-full lg:w-1/4 group border-t lg:border-t-0 lg:border-l border-blue-50 lg:pl-3 pt-3 lg:pt-0">
                        <span className="material-symbols-outlined absolute left-8 lg:left-8 top-[calc(50%+6px)] lg:top-1/2 -translate-y-1/2 text-blue-300 group-focus-within:text-blue-900 transition-colors text-lg">location_on</span>
                        <input
                            value={locationQuery}
                            onChange={(e) => setLocationQuery(e.target.value)}
                            placeholder="City or remote"
                            className="w-full bg-transparent border-transparent rounded-[1.5rem] py-4 pl-14 pr-6 text-[11px] font-bold text-blue-900 focus:bg-blue-50/50 transition-all outline-none placeholder:text-blue-300"
                        />
                    </div>
                    <div className="w-full lg:flex-1 flex items-center gap-2 overflow-x-auto no-scrollbar py-2 lg:py-0 px-2 lg:px-4 border-t lg:border-t-0 lg:border-l border-blue-50">
                        {['Full-time', 'Contract', 'Freelance'].map((type) => (
                            <button
                                key={type}
                                onClick={() => setEmploymentType(employmentType === type ? '' : type)}
                                className={`flex-shrink-0 px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${employmentType === type
                                    ? 'bg-blue-900 text-white border-blue-900 shadow-lg'
                                    : 'bg-white text-blue-400 border-blue-100 hover:border-blue-300 hover:text-blue-600'
                                    }`}
                            >
                                {type}
                            </button>
                        ))}
                        {employmentType && (
                            <button onClick={() => setEmploymentType('')} className="p-2 text-red-400 hover:text-red-600 transition-colors">
                                <span className="material-symbols-outlined text-lg">cancel</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Content Feed */}
            {isLoading ? (
                <div className="space-y-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-64 bg-blue-50/50 rounded-[3rem] animate-pulse border border-blue-50" />
                    ))}
                </div>
            ) : (
                <div className="space-y-8">
                    {jobList.map((job: Job) => (
                        <Link
                            href={`/dashboard/jobs/${job.id}`}
                            key={job.id}
                            className="group block outline-none focus:ring-8 focus:ring-blue-100 rounded-[3rem] transition-all"
                        >
                            <article className="bg-white border border-blue-100 rounded-[3rem] p-8 md:p-10 flex flex-col md:flex-row items-center gap-10 transition-all duration-500 group-hover:border-blue-900 group-hover:shadow-[0_40px_80px_-20px_rgba(30,58,138,0.12)] relative overflow-hidden">
                                {/* Aesthetic Background Element */}
                                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity -translate-y-1/2 translate-x-1/2 -z-10" />

                                <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center flex-shrink-0 transition-all duration-500 group-hover:bg-blue-900 group-hover:text-white group-hover:scale-110 group-hover:rotate-6">
                                    <span className="text-3xl material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                                        {job.id % 2 === 0 ? 'token' : 'architecture'}
                                    </span>
                                </div>

                                <div className="flex-1 text-center md:text-left space-y-5">
                                    <div className="flex flex-wrap justify-center md:justify-start items-center gap-4">
                                        <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-900 text-white text-[8px] font-black uppercase tracking-[0.2em] rounded-lg">
                                            <span className="material-symbols-outlined text-[10px]">verified</span>
                                            Verified Position
                                        </div>
                                        <span className="text-[9px] font-black text-blue-300 uppercase tracking-widest leading-none bg-blue-50 px-3 py-1 rounded-lg">
                                            {job.JobCategory?.name || 'High Impact'}
                                        </span>
                                        {job.visaSponsorship && (
                                            <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest leading-none bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100">
                                                Visa Sponsor
                                            </span>
                                        )}
                                        {viewType === 'APEX' && (
                                            <div className="flex items-center gap-1.5 px-3 py-1 bg-black text-white text-[8px] font-black uppercase tracking-[0.2em] rounded-lg">
                                                <span className="material-symbols-outlined text-[10px]">visibility_off</span>
                                                Shadow Role
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <h3 className="text-2xl md:text-3xl font-bold text-blue-900 group-hover:text-blue-900 transition-colors leading-tight mb-2 uppercase tracking-tight">
                                            {job.title}
                                        </h3>
                                        <div className="flex flex-wrap justify-center md:justify-start items-center gap-6 text-[10px] font-black text-blue-400 uppercase tracking-widest">
                                            <div className="flex items-center gap-2">
                                                <span className="material-symbols-outlined text-sm">location_on</span>
                                                {job.location}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="material-symbols-outlined text-sm">work</span>
                                                {job.type}
                                            </div>
                                            <div className="flex items-center gap-2 text-blue-600">
                                                <span className="material-symbols-outlined text-sm">corporate_fare</span>
                                                {job.company}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap justify-center md:justify-start gap-2 pt-2">
                                        {['Premium Benefits', 'Career Growth', 'Remote Native'].map(tag => (
                                            <span key={tag} className="px-4 py-1.5 bg-blue-50/50 rounded-xl text-[8px] font-black text-blue-400 uppercase tracking-widest transition-colors group-hover:bg-blue-100 group-hover:text-blue-900">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex flex-col justify-between items-center md:items-end gap-8 pt-8 md:pt-0 md:border-l border-blue-50 md:pl-10 min-w-[200px]">
                                    <div className="text-center md:text-right">
                                        <p className="text-[9px] font-black text-blue-300 uppercase tracking-widest mb-1">Salary / Package</p>
                                        <span className="text-2xl font-bold text-blue-900 tracking-tighter">
                                            {job.salary || 'Executive Rate'}
                                        </span>
                                    </div>
                                    <div className="w-full flex items-center justify-center gap-3 bg-blue-900 text-white py-4 px-8 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transform transition-all group-hover:scale-105 group-active:scale-95 shadow-xl shadow-blue-900/10">
                                        View Details
                                        <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                    </div>
                                </div>
                            </article>
                        </Link>
                    ))}

                    {jobList.length === 0 && (
                        <div className="py-24 text-center bg-white border border-blue-100 border-dashed rounded-[3rem]">
                            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <span className="material-symbols-outlined text-4xl text-blue-200">search_off</span>
                            </div>
                            <h3 className="text-xl font-bold text-blue-900 uppercase tracking-tight mb-2">No Matching Opportunities</h3>
                            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Refine your filters to find more opportunities.</p>
                        </div>
                    )}
                </div>
            )}
            {/* Apex Access Modal */}

        </div>
    );
}
