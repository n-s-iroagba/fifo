'use client';

import React from 'react';
import { useApiQuery } from '@/lib/hooks';
import Link from 'next/link';

export default function AdminInterestsPage() {
    const { data: interests = [], isLoading } = useApiQuery<any[]>(['admin', 'interests'], '/admin/interests');

    if (isLoading) return <div className="p-12 text-center text-[10px] font-bold uppercase tracking-widest text-blue-400">Loading Market Interests...</div>;

    return (
        <div className="font-sans antialiased text-blue-900 pb-24 max-w-6xl mx-auto">
            <header className="mb-12">
                <div className="flex items-center gap-4 mb-4">
                    <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em]">Scouting Dashboard</span>
                </div>
                <h1 className="text-4xl font-black italic uppercase tracking-tighter text-blue-900">Applicant Interests</h1>
                <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mt-1">Total Signals Detected: {interests.length}</p>
            </header>

            <div className="grid grid-cols-1 gap-6">
                {interests.length === 0 ? (
                    <div className="p-20 text-center bg-white rounded-[2.5rem] border border-blue-100 border-dashed">
                        <p className="text-[10px] font-black uppercase tracking-widest text-blue-300">No interest signals recorded yet.</p>
                    </div>
                ) : (
                    interests.map((interest) => (
                        <div key={interest.id} className="bg-white p-8 rounded-[2rem] border border-blue-50 shadow-xl shadow-blue-900/5 hover:border-blue-200 transition-all group">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                <div className="flex items-center gap-6">
                                    <div className="w-16 h-16 rounded-2xl bg-blue-900 flex items-center justify-center text-white text-2xl font-black italic shadow-xl shadow-blue-900/20 group-hover:scale-105 transition-transform">
                                        {interest.User?.fullName?.charAt(0) || '?'}
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-black uppercase tracking-tight text-blue-900">{interest.User?.fullName || 'Unknown User'}</h2>
                                        <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">{interest.User?.email}</p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <Link 
                                        href={`/admin/applicants/${interest.userId}`}
                                        className="px-6 py-3 bg-blue-50 text-blue-900 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-blue-900 hover:text-white transition-all shadow-sm"
                                    >
                                        View Profile
                                    </Link>
                                    <Link 
                                        href={`/admin/mail?to=${interest.User?.email}`}
                                        className="px-6 py-3 bg-blue-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-blue-900/20"
                                    >
                                        Scout Candidate
                                    </Link>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-10 pt-10 border-t border-blue-50">
                                <div className="space-y-3">
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-400">Target Roles</span>
                                    <div className="flex flex-wrap gap-2">
                                        {interest.roles?.map((role: string, i: number) => (
                                            <span key={i} className="px-2 py-1 bg-blue-50 text-blue-900 text-[8px] font-bold rounded uppercase tracking-wider">{role}</span>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-400">Key Competencies</span>
                                    <div className="flex flex-wrap gap-2">
                                        {interest.skills?.map((skill: string, i: number) => (
                                            <span key={i} className="px-2 py-1 bg-emerald-50 text-emerald-700 text-[8px] font-bold rounded uppercase tracking-wider">{skill}</span>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-400">Qualifications</span>
                                    <div className="flex flex-wrap gap-2">
                                        {interest.qualifications?.map((q: string, i: number) => (
                                            <span key={i} className="px-2 py-1 bg-indigo-50 text-indigo-700 text-[8px] font-bold rounded uppercase tracking-wider">{q}</span>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-400">Past Trajectory</span>
                                    <div className="space-y-2">
                                        {interest.experience?.map((exp: any, i: number) => (
                                            <div key={i} className="text-[9px] leading-relaxed">
                                                <span className="font-bold text-blue-900">{exp.company}</span>
                                                <span className="text-blue-400 block">{exp.role} · {exp.duration}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
