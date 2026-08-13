'use client';

// STEP-017, STEP-018
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { BookOpen, Lock, Download, ArrowRight, Award, ChevronRight } from 'lucide-react';
import { apiClient } from '../../../lib/axios';
import { PageShell } from '../../../components/PageShell';

export default function CoursePlayerPage() {
    const router = useRouter();
    const routeParams = useParams();
    const id = routeParams.id as string;

    const [completedModules, setCompletedModules] = useState<number[]>([0, 1]);
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
                        modules: data.modules?.map((m: any, i: number) => ({
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

    const progressPct = courseData?.modules?.length ? Math.round((completedModules.length / courseData.modules.length) * 100) : 0;
    const isTheoryComplete = progressPct === 100 && courseData?.modules?.length > 0;

    if (loading) {
        return (
            <PageShell>
                <div className="flex flex-col items-center justify-center py-24 space-y-5">
                    <div className="animate-spin rounded-full h-14 w-14 border-4 border-zinc-200 border-t-[#FFC700]" />
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest animate-pulse">Loading Course Player...</p>
                </div>
            </PageShell>
        );
    }
    
    if (error || !courseData) {
        return (
            <PageShell>
                <div className="bg-white border-2 border-zinc-200 rounded-2xl p-14 shadow-sm text-center">
                    <p className="text-sm font-extrabold text-rose-500 uppercase tracking-widest">{error || 'Course not found'}</p>
                </div>
            </PageShell>
        );
    }

    return (
        <PageShell>
            <div className="space-y-8">
                {/* Breadcrumb & Navigation */}
                <div className="flex items-center gap-2 text-xs font-extrabold text-zinc-400 uppercase tracking-wider">
                    <Link href="/my-certifications" className="hover:text-zinc-900 transition-colors">My Certifications</Link>
                    <ChevronRight className="h-3 w-3" />
                    <span className="text-zinc-900">{courseData.code}</span>
                </div>

                {/* Course Title Banner */}
                <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between mb-8">
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <span className="font-mono text-xs font-black text-black bg-[#FFC700] px-3 py-1 rounded-full uppercase tracking-widest">
                                {courseData.code}
                            </span>
                            <span className="text-xs font-black text-white bg-zinc-900 px-3 py-1 rounded-full uppercase tracking-widest">
                                {courseData.format} COURSE
                            </span>
                        </div>
                        <h1 className="text-4xl font-black tracking-tight text-zinc-900">
                            {courseData.title}
                        </h1>
                    </div>

                    {/* STEP-015 Sequence Gate Indicator */}
                    <div className="rounded-xl border-2 border-amber-300 bg-amber-50 px-5 py-4 max-w-sm flex items-start gap-4">
                        <Lock className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                            <span className="block text-sm font-black text-amber-900 uppercase tracking-widest mb-1">Sequence Gate Active</span>
                            <p className="text-xs font-bold text-amber-800 leading-relaxed">
                                Complete all theory modules and pass the exam to unlock your certificate. Practicals are guided demonstrations assessed on the job.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="w-full h-0.5 bg-[#FFC700] mb-10" />

                {/* Downloadable Course Materials & Exam Launch */}
                <div className="rounded-2xl border-2 border-zinc-200 bg-white p-8 shadow-sm space-y-6">
                    <h2 className="text-sm font-black uppercase tracking-widest text-zinc-900 border-b-2 border-zinc-100 pb-4">
                        Course Materials & Official Exam
                    </h2>

                    <div className="space-y-4">
                        {courseData.modules && courseData.modules.length > 0 ? (
                            courseData.modules.map((mod: any, idx: number) => (
                                <div key={mod.id || idx} className="space-y-3">
                                    <button
                                        onClick={() => setSelectedModule(selectedModule === idx ? null : idx)}
                                        className={`w-full flex flex-col items-start justify-between p-5 rounded-xl border-2 transition-all text-left group ${selectedModule === idx ? 'bg-amber-50 border-[#FFC700]' : 'bg-zinc-50 border-zinc-200 hover:border-zinc-400'}`}
                                    >
                                        <div className="w-full flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <BookOpen className={`h-5 w-5 ${selectedModule === idx ? 'text-amber-600' : 'text-zinc-400'}`} />
                                                <span className="text-sm font-black text-zinc-900">{mod.title}</span>
                                            </div>
                                            <Download className={`h-5 w-5 ${selectedModule === idx ? 'text-amber-600' : 'text-zinc-400 group-hover:text-zinc-900'}`} />
                                        </div>
                                        <div className="text-xs font-medium text-zinc-500 pl-8 line-clamp-2">
                                            {mod.description}
                                        </div>
                                        <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400 pl-8 mt-3">
                                            Duration: {mod.duration}
                                        </div>
                                    </button>

                                    {/* Real Implementation: Expanded Module Content Reader */}
                                    {selectedModule === idx && (
                                        <div className="ml-2 pl-6 border-l-4 border-[#FFC700] py-6 pr-6 mt-2 bg-zinc-50 rounded-r-2xl border-y-2 border-r-2 border-zinc-200">
                                            <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-zinc-200">
                                                <span className="text-sm font-black text-zinc-900 uppercase tracking-widest flex items-center gap-2">
                                                    <BookOpen className="h-4 w-4 text-[#FFC700]" />
                                                    Study Material
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
                                                    className="text-[10px] font-black text-black bg-[#FFC700] px-4 py-2 rounded-lg hover:bg-yellow-400 transition-colors uppercase tracking-wider shadow-sm"
                                                >
                                                    Download TXT
                                                </button>
                                            </div>
                                            <div className="prose prose-sm max-w-none text-zinc-700 font-medium leading-relaxed">
                                                <p>{mod.description}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="p-10 text-center border-2 border-dashed border-zinc-200 rounded-2xl">
                                <p className="text-xs font-extrabold text-zinc-400 uppercase tracking-widest">No modules assigned to this course yet.</p>
                            </div>
                        )}

                        <div className="pt-6 mt-6 border-t-2 border-zinc-100">
                            <div className="mb-6 rounded-xl border-2 border-amber-200 bg-amber-50 p-4 text-xs font-bold text-amber-900 flex items-start gap-3">
                                <Lock className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                                <p><strong>Note:</strong> Starting the exam cannot be cancelled once initiated. Standard exam duration is 40 minutes. Ensure you have a stable connection.</p>
                            </div>

                            <button
                                onClick={() => router.push(`/courses/${courseData.id}/exam`)}
                                className="w-full flex items-center justify-between p-5 rounded-xl bg-zinc-900 text-[#FFC700] hover:bg-black transition-all text-sm font-black uppercase tracking-wider shadow-md group"
                            >
                                <div className="flex items-center gap-3">
                                    <Award className="h-6 w-6" />
                                    <span>Start Official Exam</span>
                                </div>
                                <ArrowRight className="h-6 w-6 group-hover:translate-x-2 transition-transform" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </PageShell>
    );
}
