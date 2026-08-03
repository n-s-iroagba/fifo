'use client'
import React, { useState, useEffect, Suspense } from 'react';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { PublicFooter } from '@/components/layout/PublicFooter';
import { useApiQuery } from '@/lib/hooks';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { JobListing } from '@/types/models';

function JobsContent() {
    const searchParams = useSearchParams();
    const initialSearch = searchParams.get('search') || '';
    const [searchQuery, setSearchQuery] = useState(initialSearch);
    const { data, isLoading } = useApiQuery<any>(
        ['jobs', 'active', searchQuery],
        `/jobs?search=${encodeURIComponent(searchQuery)}`
    );
    const jobs = data?.rows || [];

    // Update local state if URL param changes (e.g. back button)
    useEffect(() => {
        const urlSearch = searchParams.get('search');
        if (urlSearch !== null && urlSearch !== searchQuery) {
            setSearchQuery(urlSearch);
        }
    }, [searchParams]);

    return (
        <div className="bg-white text-blue-900 antialiased min-h-screen flex flex-col font-sans">
            <PublicHeader />

            <main className="flex-1 pt-32 pb-24 px-8 lg:px-16 max-w-[1440px] mx-auto w-full">
                <header className="mb-12 max-w-3xl">
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-400">Open Career Opportunities</span>
                    <h1 className="text-4xl md:text-5xl font-black text-blue-900 leading-[1.1] tracking-tight mt-6">
                        Explore our world-class <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-blue-900 to-blue-600">positions</span>.
                    </h1>
                    <p className="text-blue-500 text-sm font-medium max-w-[600px] leading-relaxed mt-4">
                        Explore our global mission. We're sourcing elite talent to bridge industrial gaps and drive professional excellence.
                    </p>
                </header>
                <div className="lg:col-span-4 space-y-8">

                    <div className="p-10 mb-5 rounded-[3rem] bg-white border border-blue-100 relative overflow-hidden group hover:bg-blue-900 transition-all duration-500">
                        <div className="absolute -top-10 -right-10 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <span className="material-symbols-outlined text-blue-900 group-hover:text-white text-[10rem]">verified</span>
                        </div>
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 group-hover:text-blue-300 mb-6 relative z-10 transition-colors">Direct Employment</h4>
                        <p className="text-xs text-blue-900 leading-loose relative z-10 font-bold group-hover:text-white transition-colors">
                            BlueCollar exclusively curates roles that offer direct contractual agreements with verified global entities. No intermediaries involved.
                        </p>
                    </div>
                </div>

                <div className="mb-12">
                    <div className="relative max-w-2xl">
                        <span className="material-symbols-outlined absolute left-6 top-1/2 -translate-y-1/2 text-blue-300">search</span>
                        <input
                            type="text"
                            placeholder="FILTER BY ROLE OR DEPARTMENT..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-blue-50 border border-blue-100 rounded-2xl pl-14 pr-6 py-5 text-[10px] font-black uppercase tracking-widest focus:bg-white focus:ring-4 focus:ring-blue-900/5 transition-all outline-none"
                        />
                    </div>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-64 bg-blue-50 rounded-3xl animate-pulse border border-blue-100" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {jobs.map((job: any) => (
                            <Link
                                href={`/jobs/${job.id}`}
                                key={job.id}
                                className="group bg-white border border-blue-100 p-10 rounded-[2.5rem] hover:border-blue-900 hover:shadow-2xl hover:shadow-blue-900/5 transition-all duration-500 flex flex-col justify-between min-h-[400px]"
                            >
                                <div className="space-y-6">
                                    <div className="flex justify-between items-start">
                                        <span className="text-[9px] font-black bg-blue-50 text-blue-400 px-3 py-1.5 rounded-lg uppercase tracking-widest">
                                            {job.JobCategory?.name || 'GENERIC'}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            {job.visaSponsorship && (
                                                <span className="text-[8px] font-black bg-emerald-50 text-emerald-600 px-2 py-1 rounded-lg uppercase tracking-widest border border-emerald-100">
                                                    Visa Sponsor
                                                </span>
                                            )}
                                            <span className="material-symbols-outlined text-blue-200 group-hover:text-blue-900 transition-colors">east</span>
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-black uppercase tracking-tight group-hover:italic transition-all leading-tight">{job.title}</h3>

                                    <div className="space-y-3">
                                        <div className="text-right">
                                            <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-1 opacity-60">REF-ID</p>
                                            <p className="text-[10px] font-black text-blue-900">#JN-{job.id.toString().padStart(4, '0')}</p>
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-blue-400 uppercase tracking-widest">
                                            <span className="material-symbols-outlined text-sm">location_on</span>
                                            {job.location}
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
                                            <span className="material-symbols-outlined text-sm">payments</span>
                                            {job.salary || 'Undisclosed'}
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-8 pt-6 border-t border-blue-50 flex justify-between items-center">
                                    <span className="text-[9px] font-black text-blue-900 uppercase tracking-widest">{job.employmentType}</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </main>

            <PublicFooter />
        </div>
    );
}

export default function JobsPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-white" />}>
            <JobsContent />
        </Suspense>
    );
}
