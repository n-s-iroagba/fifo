'use client';

import React, { use } from 'react';
import Link from 'next/link';
import { useApiQuery } from '@/lib/hooks';

export default function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);

    const { data: courseRes, isLoading, error } = useApiQuery<any>(
        ['course', id],
        `/courses/${id}`
    );

    const courseData = courseRes?.data;
    const course = courseData?.course;
    const modules: any[] = courseData?.modules || [];
    const contentUrl = course?.contentUrl || course?.content_url;

    const handleAskAiAboutUnit = (moduleTitle?: string, moduleContent?: string) => {
        window.dispatchEvent(new CustomEvent('open-ai-bot', {
            detail: {
                studyContext: {
                    courseId: course?.id,
                    courseTitle: course?.title,
                    courseCode: course?.code,
                    syllabus: course?.syllabus || course?.description,
                    currentModuleTitle: moduleTitle,
                    currentModuleContent: moduleContent
                }
            }
        }));
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-24">
                <div className="w-9 h-9 border-4 border-blue-200 border-t-blue-900 rounded-full animate-spin" />
            </div>
        );
    }

    if (!course) {
        return (
            <div className="max-w-4xl mx-auto text-center py-16 bg-white rounded-3xl border border-blue-100 p-8">
                <span className="material-symbols-outlined text-4xl text-blue-200 mb-2">error</span>
                <h3 className="text-sm font-bold text-blue-900 uppercase tracking-widest">Course Not Found</h3>
                <Link href="/dashboard/courses" className="mt-4 inline-block text-xs font-bold text-blue-600 underline">
                    ← Return to Courses
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Breadcrumb / Back Link */}
            <div className="flex items-center justify-between">
                <Link
                    href="/dashboard/courses"
                    className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-600 hover:text-blue-900 transition-colors"
                >
                    <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                    Back to Courses
                </Link>
                <span className="text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200">
                    {course.code}
                </span>
            </div>

            {/* Course Header Banner */}
            <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-lg border border-amber-500/30">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2 max-w-xl">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 px-2 py-0.5 rounded">
                                {course.format || 'Theory & Practical'}
                            </span>
                            <span className="text-xs text-amber-300 font-semibold">ASQA Nationally Recognised</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                            {course.title}
                        </h1>
                        <p className="text-xs text-slate-300 leading-relaxed">
                            {course.description}
                        </p>
                    </div>

                    {/* Action Bar (Cloudinary Download & AI Study) */}
                    <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0">
                        {contentUrl ? (
                            <a
                                href={contentUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                download
                                className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black rounded-2xl text-xs uppercase tracking-wider shadow-md hover:scale-[1.02] transition-all"
                            >
                                <span className="material-symbols-outlined text-lg">download</span>
                                Download Material
                            </a>
                        ) : (
                            <div className="text-[10px] font-bold text-slate-400 bg-slate-800/60 px-4 py-2.5 rounded-xl border border-slate-700 text-center">
                                Material Delivered via LMS
                            </div>
                        )}

                        <button
                            onClick={() => handleAskAiAboutUnit()}
                            className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black rounded-2xl text-xs uppercase tracking-wider shadow-md hover:scale-[1.02] transition-all"
                        >
                            <span className="material-symbols-outlined text-lg">smart_toy</span>
                            Study with AI Mentor
                        </button>
                    </div>
                </div>
            </div>

            {/* Course Syllabus Overview */}
            <div className="bg-white rounded-3xl border border-blue-100 p-6 sm:p-8 shadow-xs space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                        <h2 className="text-lg font-bold text-blue-950">Official Course Syllabus</h2>
                        <p className="text-xs text-slate-500">Unit breakdown, estimated study durations, and assessment guidelines</p>
                    </div>
                    <span className="text-xs font-bold text-blue-900 bg-blue-50 px-3 py-1 rounded-xl">
                        {modules.length} Modules
                    </span>
                </div>

                {modules.length === 0 ? (
                    <div className="p-8 bg-slate-50 rounded-2xl text-center border border-slate-200">
                        <span className="material-symbols-outlined text-3xl text-slate-400 mb-2">library_books</span>
                        <p className="text-xs text-slate-600">Detailed modules for this unit are currently being formatted. You can view the full syllabus guide in the course manual above or ask CertHero AI.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {modules.map((mod: any, index: number) => (
                            <div
                                key={mod.id || index}
                                className="border border-slate-200 rounded-2xl p-5 hover:border-blue-200 hover:bg-blue-50/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                            >
                                <div className="space-y-1 max-w-xl">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                                            Module {index + 1}
                                        </span>
                                        {mod.durationMinutes && (
                                            <span className="text-[10px] text-slate-400 font-medium">
                                                ⏱ {mod.durationMinutes} mins
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="text-sm font-bold text-slate-900">
                                        {mod.title}
                                    </h3>
                                    {mod.description && (
                                        <p className="text-xs text-slate-600 line-clamp-2">
                                            {mod.description}
                                        </p>
                                    )}
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                    <button
                                        onClick={() => handleAskAiAboutUnit(mod.title, mod.description || mod.content)}
                                        className="inline-flex items-center gap-1.5 px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
                                    >
                                        <span className="material-symbols-outlined text-sm text-amber-600">smart_toy</span>
                                        Explain Unit
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
