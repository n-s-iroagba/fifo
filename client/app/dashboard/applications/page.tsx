'use client';

import React from 'react';
import { useApiQuery } from '@/lib/hooks';
import { CONSTANTS } from '@/constants';
import Link from 'next/link';

interface Application {
    id: number;
    status: string;

    updatedAt: string;
    JobListing: { title: string; visaSponsorship: boolean };
}

interface ApplicationsResponse {
    rows: Application[];
    count: number;
}

export default function ApplicationsListPage() {
    const { data, isLoading } = useApiQuery<ApplicationsResponse>(
        ['applications', 'list'],
        '/applications'
    );
    const { data: userData } = useApiQuery<any>(['auth', 'me'], '/auth/me');

    const user = userData?.user;
    const isProfileIncomplete = user && !(user.fullName && user.phoneNumber && user.nationality);

    const activeCount = data?.rows?.filter(a => a.status === 'Active').length || 0;

    if (isLoading) return <div className="p-12 text-center text-[10px] font-bold uppercase tracking-widest text-blue-400">Loading Applications...</div>;

    return (
        <div className="font-sans">
            <div className="mb-12">
                <h1 className="text-3xl font-bold text-blue-900 tracking-tight">Active Hub</h1>
                <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mt-1">Track your progress and active career paths</p>
            </div>

            {isProfileIncomplete && (
                <div className="mb-12 p-6 bg-blue-900 text-white rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-blue-900/20">
                    <div className="flex items-center gap-6">
                        <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                            <span className="material-symbols-outlined text-white">person_edit</span>
                        </div>
                        <div>
                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-blue-300">Profile Integrity Alert</h4>
                            <p className="text-sm font-bold tracking-tight">Your professional biodata is incomplete. This may affect your recruitment priority.</p>
                        </div>
                    </div>
                    <Link
                        href={`${CONSTANTS.ROUTES.PROFILE}?redirect=/dashboard/applications`}
                        className="bg-white text-blue-900 px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-blue-50 transition-all shrink-0"
                    >
                        Reconcile Now
                    </Link>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="bg-white p-6 rounded-2xl border border-blue-100 shadow-sm flex flex-col gap-1">
                    <span className="text-[9px] font-bold text-blue-400 uppercase tracking-widest">Active Paths</span>
                    <span className="text-2xl font-bold text-blue-900">{activeCount}</span>
                </div>
            </div>

            <section className="space-y-4">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Recent Submissions</h2>
                </div>

                {!data?.rows || data.rows.length === 0 ? (
                    <div className="p-16 text-center bg-blue-50 rounded-2xl border border-blue-100 border-dashed">
                        <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">No history found</p>
                        <Link href="/dashboard/jobs" className="inline-block mt-4 text-[10px] font-bold text-blue-900 uppercase tracking-widest hover:underline">Start New Application</Link>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {data.rows.map((app) => (
                            <div key={app.id} className="group bg-white p-6 rounded-2xl border border-blue-100 shadow-sm flex flex-col md:flex-row md:items-center gap-6 hover:shadow-md transition-all">
                                <div className="flex-grow">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest ${app.status === 'Active' ? 'bg-blue-900 text-white' : 'bg-blue-100 text-blue-500'
                                            }`}>
                                            {app.status}
                                        </span>
                                        <span className="text-blue-400 text-[9px] font-bold uppercase tracking-widest">• Updated {new Date(app.updatedAt).toLocaleDateString()}</span>
                                    </div>
                                    <h3 className="text-lg font-bold text-blue-900 tracking-tight group-hover:text-blue-600 transition-colors uppercase">{app.JobListing?.title || 'Unknown Job'}</h3>


                                </div>

                                <div className="flex md:flex-col items-end gap-2 shrink-0">
                                    <Link
                                        href={`/dashboard/applications/${app.id}`}
                                        className="bg-blue-50 text-blue-900 px-6 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-blue-100 transition-all border border-blue-100 text-center w-full"
                                    >
                                        View Detail
                                    </Link>
                                    {app.JobListing?.visaSponsorship && (
                                        <Link
                                            href={`/dashboard/applications/${app.id}/sponsorship`}
                                            className="bg-blue-900 text-white px-6 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-blue-800 transition-all shadow-md text-center w-full"
                                        >
                                            Apply for Visa Sponsorship
                                        </Link>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
