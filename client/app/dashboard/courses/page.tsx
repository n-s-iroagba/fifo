'use client';

import React from 'react';
import Link from 'next/link';
import { useApiQuery } from '@/lib/hooks';

export default function CandidateCoursesPage() {
    const { data: coursesRes, isLoading, error } = useApiQuery<any>(
        ['courses', 'published'],
        '/courses'
    );

    const courses = coursesRes?.data || [];

    const handleOpenAiStudy = (course: any) => {
        window.dispatchEvent(new CustomEvent('open-ai-bot', {
            detail: {
                studyContext: {
                    courseId: course.id,
                    courseTitle: course.title,
                    courseCode: course.code,
                    syllabus: course.syllabus || course.description
                }
            }
        }));
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-blue-900 tracking-tight">Courses &amp; Syllabus</h1>
                    <p className="text-[11px] font-bold text-blue-500 uppercase tracking-widest mt-1">
                        Western Australia Mining &amp; Civil Trade Competency Curriculum
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1.5 rounded-xl uppercase tracking-wider flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        CertHero RTO Accredited
                    </span>
                </div>
            </div>

            {/* Educational Banner */}
            <div className="p-6 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-3xl border border-amber-500/30 shadow-lg relative overflow-hidden">
                <div className="relative z-10 max-w-2xl">
                    <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-lg border border-amber-400/20">
                        Vocational Readiness Hub
                    </span>
                    <h2 className="text-lg font-bold mt-2 text-white">Review Your Syllabi &amp; Learn with AI</h2>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                        Access official competency syllabus breakdowns, download approved training manuals directly from Cloudinary, and use CertHero AI Mentor for real-time exam and interview preparation.
                    </p>
                </div>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-10 hidden md:block">
                    <span className="material-symbols-outlined text-9xl">school</span>
                </div>
            </div>

            {/* Courses Grid */}
            {isLoading ? (
                <div className="flex items-center justify-center py-24">
                    <div className="w-9 h-9 border-4 border-blue-200 border-t-blue-900 rounded-full animate-spin" />
                </div>
            ) : courses.length === 0 ? (
                <div className="bg-white p-12 rounded-3xl border border-blue-100 text-center shadow-xs">
                    <span className="material-symbols-outlined text-5xl text-blue-200 mb-3">menu_book</span>
                    <h3 className="text-sm font-bold text-blue-900 uppercase tracking-widest">Core Mining Units Under Verification</h3>
                    <p className="text-xs text-blue-500 mt-2 max-w-md mx-auto">
                        Your assigned courses are synchronizing with CertHero RTO. If you have recently accepted your contract, your curriculum will display shortly.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {courses.map((course: any) => {
                        const contentUrl = course.contentUrl || course.content_url;

                        return (
                            <div
                                key={course.id}
                                className="bg-white rounded-3xl border border-blue-100 shadow-xs hover:shadow-md transition-all p-6 flex flex-col justify-between"
                            >
                                <div>
                                    <div className="flex items-center justify-between gap-2 mb-3">
                                        <span className="text-[10px] font-black uppercase tracking-widest bg-blue-50 text-blue-900 px-2.5 py-1 rounded-lg border border-blue-100">
                                            {course.code || 'MINE-UNIT'}
                                        </span>
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-50 px-2 py-0.5 rounded">
                                            {course.format || 'Theory + Practical'}
                                        </span>
                                    </div>

                                    <h3 className="text-base font-bold text-blue-950 tracking-tight mb-2">
                                        {course.title}
                                    </h3>
                                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-4">
                                        {course.description}
                                    </p>
                                </div>

                                <div className="space-y-3 pt-4 border-t border-slate-100">
                                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                                        <span>Delivery: <strong>ASQA Accredited</strong></span>
                                        {course.price > 0 && (
                                            <span className="font-bold text-blue-900">A${course.price} AUD</span>
                                        )}
                                    </div>

                                    <div className="flex flex-wrap items-center gap-2">
                                        <Link
                                            href={`/dashboard/courses/${course.id}`}
                                            className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
                                        >
                                            <span className="material-symbols-outlined text-[16px]">menu_book</span>
                                            View Syllabus
                                        </Link>

                                        {contentUrl && (
                                            <a
                                                href={contentUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                download
                                                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
                                                title="Download Course Material from Cloudinary"
                                            >
                                                <span className="material-symbols-outlined text-[16px]">download</span>
                                                Manual
                                            </a>
                                        )}

                                        <button
                                            onClick={() => handleOpenAiStudy(course)}
                                            className="inline-flex items-center justify-center gap-1 px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
                                            title="Ask CertHero AI Mentor about this unit"
                                        >
                                            <span className="material-symbols-outlined text-[16px] text-amber-600">smart_toy</span>
                                            Study
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
