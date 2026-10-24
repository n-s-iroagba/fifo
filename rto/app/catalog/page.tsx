'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BookOpen, CheckCircle2, Tag, ArrowRight, Info, ShieldCheck } from 'lucide-react';
import { apiClient } from '@/lib/axios';
import { PageShell } from '@/components/PageShell';

interface Course {
    id: string; name: string; code: string; format: 'THEORY' | 'PRACTICAL' | 'MIXED';
    certificationName: string; description: string; durationHours: number;
    price: number; subsidyAmount?: number; subsidyReason?: string; isGapRecommended?: boolean;
}

const FORMAT_STYLE: Record<string, string> = {
    MIXED: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    THEORY: 'bg-blue-50 text-blue-700 border-blue-200',
    PRACTICAL: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

export default function CourseCatalogPage() {
    const router = useRouter();
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiClient.get('/courses')
            .then(res => { if (res.data?.success) setCourses(res.data.data); })
            .catch(() => setCourses([]))
            .finally(() => setLoading(false));
    }, []);

    const handleCourseAction = (courseId?: string) => {
        const user = typeof window !== 'undefined' ? (localStorage.getItem('lms_user') || localStorage.getItem('lms_token')) : null;
        if (!user) {
            router.push('/login?redirect=/catalog');
            return;
        }
        router.push(courseId ? `/courses/${courseId}` : '/dashboard');
    };

    const recommended = courses.filter(c => c.isGapRecommended);
    const others = courses.filter(c => !c.isGapRecommended);

    return (
        <PageShell>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6">
                <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ED9139]/10 text-[#ED9139] font-bold text-xs uppercase tracking-wider w-fit mb-2">
                        <ShieldCheck className="h-3.5 w-3.5" /> CertHero RTO Training Syllabus
                    </div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Accredited Course Catalog</h1>
                    <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1 max-w-2xl">
                        Comprehensive vocational units mapped to Australian resource sector, civil mining, and high-risk licensing requirements.
                    </p>
                </div>
            </div>
            <div className="w-full h-0.5 bg-[#ED9139] mb-8" />

            {loading && (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-[#ED9139]" />
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest animate-pulse">
                        Loading accredited catalog...
                    </p>
                </div>
            )}

            {!loading && (
                <div className="space-y-10">
                    {/* Recommended for gaps */}
                    {recommended.length > 0 && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                    <Tag className="h-4 w-4 text-[#ED9139]" /> Recommended for Your Verification Gaps
                                </h2>
                                <span className="text-[11px] font-bold text-[#0f172a] bg-[#ED9139]/20 px-3 py-0.5 rounded-full uppercase tracking-wider">
                                    Role Priority
                                </span>
                            </div>
                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                {recommended.map((course) => {
                                    const finalPrice = Math.max(0, course.price - (course.subsidyAmount || 0));
                                    const isSubsidized = (course.subsidyAmount || 0) > 0;
                                    return (
                                        <div
                                            key={course.id}
                                            className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                                        >
                                            {isSubsidized && (
                                                <div className="mb-3 rounded-xl bg-amber-50 border border-amber-200 p-2.5 flex items-start gap-2">
                                                    <Tag className="h-3.5 w-3.5 text-amber-700 shrink-0 mt-0.5" />
                                                    <div className="text-xs text-amber-900 font-medium">
                                                        <span className="font-bold">Sponsor Subsidy Applied: </span>${course.subsidyAmount} covered ({course.subsidyReason || 'Labour Sponsor Contribution'})
                                                    </div>
                                                </div>
                                            )}
                                            <div className="space-y-2.5">
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className="font-mono text-xs font-bold text-slate-500">{course.code}</span>
                                                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold border ${FORMAT_STYLE[course.format] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                                                        {course.format}
                                                    </span>
                                                </div>
                                                <h3 className="text-base font-bold text-slate-900">{course.name}</h3>
                                                <p className="text-xs font-semibold text-[#ED9139]">Satisfies: {course.certificationName}</p>
                                                <p className="text-xs text-slate-600 line-clamp-2">{course.description}</p>
                                                {course.format === 'MIXED' && (
                                                    <p className="flex items-center gap-1 text-[11px] font-medium text-slate-500">
                                                        <Info className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                                                        Online theory exam must be completed before practical VOC scheduling.
                                                    </p>
                                                )}
                                            </div>
                                            <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                                                <div>
                                                    <span className="text-[10px] font-bold uppercase text-slate-400">Learner Payable</span>
                                                    <div className="flex items-baseline gap-2">
                                                        <span className="text-xl font-extrabold text-slate-900">${finalPrice.toFixed(2)} AUD</span>
                                                        {isSubsidized && <span className="text-xs text-slate-400 line-through">${course.price.toFixed(2)}</span>}
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleCourseAction(course.id)}
                                                    className="inline-flex items-center gap-1.5 bg-[#ED9139] hover:bg-[#dd7f26] text-[#0f172a] px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-sm"
                                                >
                                                    Enrol Now <ArrowRight className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* All Courses */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-bold text-slate-900">All Available CertHero Training Units</h2>
                        {others.length === 0 && recommended.length === 0 && (
                            <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center shadow-sm">
                                <BookOpen className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                    No courses currently published in this catalog view.
                                </p>
                            </div>
                        )}
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                            {others.map((course) => (
                                <div
                                    key={course.id}
                                    className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                                >
                                    <div className="space-y-2.5">
                                        <div className="flex items-center justify-between">
                                            <span className="font-mono text-xs font-bold text-slate-500">{course.code}</span>
                                            <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold border ${FORMAT_STYLE[course.format] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                                                {course.format}
                                            </span>
                                        </div>
                                        <h3 className="text-base font-bold text-slate-900">{course.name}</h3>
                                        <p className="text-xs text-slate-600">{course.description}</p>
                                    </div>
                                    <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                                        <span className="text-lg font-extrabold text-slate-900">${course.price} AUD</span>
                                        <button
                                            onClick={() => handleCourseAction(course.id)}
                                            className="inline-flex items-center gap-1.5 border border-slate-300 bg-slate-50 hover:bg-slate-100 px-4 py-2 rounded-xl text-xs font-bold text-slate-800 transition-all uppercase tracking-wider"
                                        >
                                            View Details
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </PageShell>
    );
}
