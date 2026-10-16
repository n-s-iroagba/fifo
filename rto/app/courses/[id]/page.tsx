'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { BookOpen, Lock, Download, ArrowRight, Award, ChevronRight, ShieldCheck } from 'lucide-react';
import { apiClient } from '@/lib/axios';
import { PageShell } from '@/components/PageShell';

export default function CoursePlayerPage() {
    const router = useRouter();
    const routeParams = useParams();
    const id = routeParams.id as string;

    const [selectedModule, setSelectedModule] = useState<number | null>(null);
    const [courseData, setCourseData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const res = await apiClient.get(`/courses/${id}`);
                const data = res.data?.data;
                if (data?.course) {
                    setCourseData({
                        id: data.course.id,
                        code: data.course.code,
                        title: data.course.name,
                        format: data.course.format,
                        certification: data.course.CertificationType?.name || 'N/A',
                        modules: data.modules?.map((m: any) => ({
                            id: m.id,
                            title: m.title,
                            duration: `${m.durationMinutes} mins`,
                            description: m.content
                        })) || []
                    });
                }
            } catch (err: any) {
                console.error("Failed to fetch course:", err);
                setError(err.response?.data?.message || 'Failed to load course details.');
            } finally {
                setLoading(false);
            }
        };

        fetchCourse();
    }, [id]);

    if (loading) {
        return (
            <PageShell>
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-[#ED9139]" />
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest animate-pulse">
                        Loading Course Modules...
                    </p>
                </div>
            </PageShell>
        );
    }
    
    if (error || !courseData) {
        return (
            <PageShell>
                <div className="bg-white border border-slate-200 rounded-2xl p-12 shadow-sm text-center max-w-lg mx-auto">
                    <p className="text-xs font-bold text-rose-500 uppercase tracking-widest">{error || 'Course not found'}</p>
                    <Link href="/catalog" className="mt-4 inline-block text-xs font-bold text-[#0f172a] underline">
                        Return to Course Catalog
                    </Link>
                </div>
            </PageShell>
        );
    }

    return (
        <PageShell>
            <div className="space-y-6">
                {/* Breadcrumb & Navigation */}
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <Link href="/catalog" className="hover:text-slate-900 transition-colors">Course Catalog</Link>
                    <ChevronRight className="h-3 w-3" />
                    <span className="text-slate-900">{courseData.code}</span>
                </div>

                {/* Course Title Banner */}
                <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between mb-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2.5">
                            <span className="font-mono text-xs font-bold text-[#0f172a] bg-[#ED9139]/20 px-2.5 py-0.5 rounded uppercase tracking-wider">
                                {courseData.code}
                            </span>
                            <span className="text-[11px] font-bold text-white bg-slate-800 px-2.5 py-0.5 rounded uppercase tracking-wider">
                                {courseData.format} UNIT
                            </span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                            {courseData.title}
                        </h1>
                    </div>

                    {/* Sequence Gate Indicator */}
                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 max-w-sm flex items-start gap-3">
                        <Lock className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
                        <div>
                            <span className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-0.5">
                                Progression Requirement
                            </span>
                            <p className="text-xs text-slate-600 leading-relaxed">
                                Complete module theory and pass the online competency exam to generate your Statement of Attainment.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="w-full h-0.5 bg-[#ED9139] mb-8" />

                {/* Course Materials & Exam Launch */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-[#ED9139]" />
                            Course Modules & Curriculum
                        </h2>
                        <span className="text-xs text-slate-400">
                            {courseData.modules?.length || 0} module(s)
                        </span>
                    </div>

                    <div className="space-y-3">
                        {courseData.modules && courseData.modules.length > 0 ? (
                            courseData.modules.map((mod: any, idx: number) => (
                                <div key={mod.id || idx} className="space-y-2">
                                    <button
                                        onClick={() => setSelectedModule(selectedModule === idx ? null : idx)}
                                        className={`w-full flex flex-col items-start justify-between p-4 rounded-xl border transition-all text-left ${
                                            selectedModule === idx 
                                                ? 'bg-slate-50 border-[#ED9139]' 
                                                : 'bg-white border-slate-200 hover:border-slate-300'
                                        }`}
                                    >
                                        <div className="w-full flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2.5">
                                                <BookOpen className={`h-4 w-4 ${selectedModule === idx ? 'text-[#ED9139]' : 'text-slate-400'}`} />
                                                <span className="text-sm font-bold text-slate-900">{mod.title}</span>
                                            </div>
                                            <span className="text-xs text-[#0f172a] font-semibold">
                                                {selectedModule === idx ? 'Close Module' : 'View Module'}
                                            </span>
                                        </div>
                                        <div className="text-xs text-slate-600 pl-6.5 line-clamp-2">
                                            {mod.description}
                                        </div>
                                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 pl-6.5 mt-2">
                                            Est. Duration: {mod.duration}
                                        </div>
                                    </button>

                                    {/* Expanded Module Content Reader */}
                                    {selectedModule === idx && (
                                        <div className="ml-2 pl-4 border-l-2 border-[#ED9139] py-4 pr-4 bg-slate-50 rounded-r-xl border-y border-r border-slate-200">
                                            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200">
                                                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                                                    Study Reference Material
                                                </span>
                                                <button
                                                    onClick={() => {
                                                        const blob = new Blob([mod.description], { type: 'text/plain' });
                                                        const url = URL.createObjectURL(blob);
                                                        const a = document.createElement('a');
                                                        a.href = url;
                                                        a.download = `${mod.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
                                                        a.click();
                                                        URL.revokeObjectURL(url);
                                                    }}
                                                    className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-800 hover:text-black bg-white border border-slate-200 px-3 py-1 rounded-md transition-colors uppercase"
                                                >
                                                    <Download className="h-3 w-3 text-[#ED9139]" /> Download TXT
                                                </button>
                                            </div>
                                            <div className="text-xs text-slate-700 leading-relaxed font-normal whitespace-pre-line">
                                                {mod.description}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center border border-dashed border-slate-200 rounded-xl">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                    No modules uploaded for this course yet.
                                </p>
                            </div>
                        )}

                        <div className="pt-5 mt-5 border-t border-slate-100">
                            <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-xs text-amber-900 flex items-start gap-2.5">
                                <Lock className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
                                <p>
                                    <strong>Examination Notice:</strong> Once initiated, the competency examination must be completed in a single session. Ensure you have reviewed all regulatory module materials before beginning.
                                </p>
                            </div>

                            <button
                                onClick={() => router.push(`/courses/${courseData.id}/exam`)}
                                className="w-full flex items-center justify-between p-4 rounded-xl bg-[#0f172a] hover:bg-slate-800 text-white transition-all text-xs font-bold uppercase tracking-wider shadow-md group"
                            >
                                <div className="flex items-center gap-2.5">
                                    <Award className="h-5 w-5 text-[#ED9139]" />
                                    <span>Launch Competency Examination</span>
                                </div>
                                <ArrowRight className="h-4 w-4 text-[#ED9139] group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </PageShell>
    );
}
