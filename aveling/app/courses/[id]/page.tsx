'use client';

// STEP-017, STEP-018
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { BookOpen, CheckCircle2, PlayCircle, Lock, Calendar, FileText, ArrowRight, ShieldCheck, ChevronRight, Award, Download } from 'lucide-react';
import { apiClient } from '../../../lib/axios';

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
    }, [params.id]);


    const progressPct = courseData?.modules?.length ? Math.round((completedModules.length / courseData.modules.length) * 100) : 0;
    const isTheoryComplete = progressPct === 100 && courseData?.modules?.length > 0;

    if (loading) return <div className="p-12 text-center text-xs font-bold text-amber-600">Loading Course Player...</div>;
    if (error || !courseData) return <div className="p-12 text-center text-xs font-bold text-rose-600">{error || 'Course not found'}</div>;

    return (
        <div className="space-y-6">
            {/* Breadcrumb & Navigation */}
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500">
                <Link href="/my-certifications" className="hover:text-zinc-900 dark:hover:text-white">My Certifications</Link>
                <ChevronRight className="h-3 w-3" />
                <span>{courseData.code}</span>
            </div>

            {/* Course Title Banner */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-zinc-200 pb-4 dark:border-zinc-800">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded dark:bg-amber-950">
                            {courseData.code}
                        </span>
                        <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded dark:bg-purple-950 uppercase">
                            {courseData.format} COURSE
                        </span>
                    </div>
                    <h1 className="mt-2 text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
                        {courseData.title}
                    </h1>
                </div>

                {/* STEP-015 Sequence Gate Indicator */}
                <div className="flex items-center gap-3">

                    <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-2 text-xs text-amber-900 dark:border-amber-900 dark:bg-amber-950/60 dark:text-amber-200 flex items-center gap-2 font-medium">
                        <Lock className="h-4 w-4 text-amber-600" />
                        Complete all theory modules (100%) praticals are guided demonstrations and are not scored upon starting the jobs.
                    </div>

                </div>
            </div>




            {/* Downloadable Course Materials & Exam Launch */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
                <span className="text-xs font-bold uppercase text-zinc-400 block">Course Materials & Official Exam</span>

                <div className="space-y-3">
                    {courseData.modules && courseData.modules.length > 0 ? (
                        courseData.modules.map((mod: any, idx: number) => (
                            <div key={mod.id || idx} className="space-y-2">
                                <button
                                    onClick={() => setSelectedModule(selectedModule === idx ? null : idx)}
                                    className={`w-full flex flex-col items-start justify-between p-3.5 rounded-xl border transition-all text-left group ${selectedModule === idx ? 'bg-amber-50 border-amber-300 dark:bg-amber-950/40 dark:border-amber-800' : 'bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 hover:border-[#FFC700]'}`}
                                >
                                    <div className="w-full flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-3">
                                            <BookOpen className={`h-5 w-5 ${selectedModule === idx ? 'text-amber-600' : 'text-[#FFC700]'}`} />
                                            <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">{mod.title}</span>
                                        </div>
                                        <Download className="h-4 w-4 text-zinc-400 group-hover:text-black dark:group-hover:text-white" />
                                    </div>
                                    <div className="text-[11px] text-zinc-500 dark:text-zinc-400 pl-8 line-clamp-2">
                                        {mod.description}
                                    </div>
                                    <div className="text-[10px] font-mono text-zinc-400 pl-8 mt-2">
                                        Duration: {mod.duration}
                                    </div>
                                </button>
                                
                                {/* Real Implementation: Expanded Module Content Reader */}
                                {selectedModule === idx && (
                                    <div className="ml-4 pl-4 border-l-2 border-[#FFC700] py-3 pr-3 text-xs leading-relaxed text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 rounded-r-xl shadow-sm">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-bold text-zinc-900 dark:text-white">Module Content Reader</span>
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
                                                className="text-[10px] font-bold text-[#FFC700] hover:underline"
                                            >
                                                Download as TXT
                                            </button>
                                        </div>
                                        {mod.description}
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="p-4 text-center text-xs text-zinc-500 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
                            No modules assigned to this course yet.
                        </div>
                    )}

                    <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
                        <div className="mb-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200">
                            <strong>Note:</strong> Starting the exam cannot be cancelled once initiated. Standard exam duration is 40 minutes. Ensure you have a stable connection.
                        </div>

                        <button
                            onClick={() => router.push(`/courses/${courseData.id}/exam`)}
                            className="w-full flex items-center justify-between p-4 rounded-xl bg-[#FFC700] text-black hover:bg-yellow-400 transition-all text-sm font-black uppercase tracking-wider shadow-md group"
                        >
                            <div className="flex items-center gap-3">
                                <Award className="h-5 w-5" />
                                <span>Start Official Exam</span>
                            </div>
                            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>
            </div>
        </div>

    );
}
