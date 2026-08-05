'use client';

// STEP-017, STEP-018
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BookOpen, CheckCircle2, PlayCircle, Lock, Calendar, FileText, ArrowRight, ShieldCheck, ChevronRight, Award, Download } from 'lucide-react';
import { apiClient } from '../../../lib/axios';

export default function CoursePlayerPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [activeModule, setActiveModule] = useState(0);
    const [completedModules, setCompletedModules] = useState<number[]>([0, 1]);

    const [courseData, setCourseData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const res = await apiClient.get(`/courses/${params.id}`);
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
                            videoUrl: m.videoUrl,
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

    const toggleComplete = (idx: number) => {
        if (completedModules.includes(idx)) {
            setCompletedModules(completedModules.filter(i => i !== idx));
        } else {
            setCompletedModules([...completedModules, idx]);
        }
    };

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
                    {isTheoryComplete ? (
                        <div className="flex items-center gap-3">
                            <Link
                                href={`/courses/${courseData.id}/exam`}
                                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-500 transition-all"
                            >
                                <Award className="h-4 w-4" />
                                Take Theory Exam Now
                            </Link>
                            <Link
                                href={`/courses/${courseData.id}/practical`}
                                className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-purple-600/20 hover:bg-purple-500 transition-all"
                            >
                                <Calendar className="h-4 w-4" />
                                Book Practical Session
                            </Link>
                        </div>
                    ) : (
                        <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-2 text-xs text-amber-900 dark:border-amber-900 dark:bg-amber-950/60 dark:text-amber-200 flex items-center gap-2 font-medium">
                            <Lock className="h-4 w-4 text-amber-600" />
                            Complete all theory modules (100%) to unlock exam & practical session booking.
                        </div>
                    )}
                </div>
            </div>

            {/* Content Player & Progress Bar */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
                {/* Video Player Main View */}
                <div className="md:col-span-8 space-y-4">
                    <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-zinc-950 shadow-lg flex items-center justify-center border border-zinc-800">
                        <div className="text-center space-y-3 p-6">
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-600/20 text-amber-500 hover:scale-105 transition-transform cursor-pointer">
                                <PlayCircle className="h-10 w-10" />
                            </div>
                            <p className="text-sm font-bold text-white">{courseData.modules[activeModule]?.title || 'No Modules Available'}</p>
                            <span className="text-xs font-mono text-zinc-400">Duration: {courseData.modules[activeModule]?.duration || '0 mins'}</span>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 space-y-3">
                        <div className="flex items-center justify-between">
                            <h2 className="text-base font-bold text-zinc-900 dark:text-white">
                                {courseData.modules[activeModule]?.title || 'Module Overview'}
                            </h2>
                            <button
                                onClick={() => toggleComplete(activeModule)}
                                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                                    completedModules.includes(activeModule)
                                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                        : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300'
                                }`}
                            >
                                <CheckCircle2 className="h-4 w-4" />
                                {completedModules.includes(activeModule) ? 'Completed' : 'Mark Complete'}
                            </button>
                        </div>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400">
                            {courseData.modules[activeModule]?.description || 'Key Learning Outcomes: Understand safe working parameters, harness pre-inspection requirements, and emergency descent procedures.'}
                        </p>
                    </div>
                </div>

                {/* STEP-018: Course Player Sidebar */}
                <div className="md:col-span-4 space-y-4">
                    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs font-bold">
                                <span className="text-zinc-500">Course Progress:</span>
                                <span className="text-amber-600">{progressPct}%</span>
                            </div>
                            <div className="h-2.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                                <div className="h-full bg-amber-600 transition-all duration-300" style={{ width: `${progressPct}%` }}></div>
                            </div>
                        </div>

                        <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                            <span className="text-xs font-bold uppercase text-zinc-400">Course Modules</span>
                            {courseData.modules && courseData.modules.length > 0 ? (
                                courseData.modules.map((mod: any, idx: number) => {
                                    const isDone = completedModules.includes(idx);
                                    const isActive = activeModule === idx;

                                return (
                                    <button
                                        key={mod.id}
                                        onClick={() => setActiveModule(idx)}
                                        className={`w-full flex items-center justify-between rounded-xl p-3 text-left text-xs font-medium transition-all ${
                                            isActive
                                                ? 'bg-amber-50 text-amber-900 border border-amber-300 dark:bg-amber-950/60 dark:text-amber-200 dark:border-amber-900'
                                                : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-700 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-800'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            {isDone ? (
                                                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                                            ) : (
                                                <PlayCircle className="h-4 w-4 text-zinc-400 shrink-0" />
                                            )}
                                            <span className="line-clamp-1">{mod.title}</span>
                                        </div>
                                        <span className="text-[10px] font-mono text-zinc-400 shrink-0">{mod.duration}</span>
                                    </button>
                                );
                                })
                            ) : (
                                <p className="text-xs text-zinc-500 py-4 text-center">No modules configured yet.</p>
                            )}
                        </div>
                    </div>

                    {/* Downloadable Course Materials */}
                    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 space-y-3">
                        <span className="text-xs font-bold uppercase text-zinc-400 block">Course Materials & Downloads</span>
                        <div className="space-y-2">
                            <button
                                onClick={() => alert('Downloading official Learner Study Guide (PDF)...')}
                                className="w-full flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 hover:border-[#FFC700] transition-all text-xs font-bold text-zinc-800 dark:text-zinc-200 group"
                            >
                                <div className="flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-[#FFC700]" />
                                    <span>Learner Study Guide & Manual</span>
                                </div>
                                <Download className="h-4 w-4 text-zinc-400 group-hover:text-black dark:group-hover:text-white" />
                            </button>

                            <button
                                onClick={() => alert('Downloading Pre-Start Safety Checklist (PDF)...')}
                                className="w-full flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 hover:border-[#FFC700] transition-all text-xs font-bold text-zinc-800 dark:text-zinc-200 group"
                            >
                                <div className="flex items-center gap-2">
                                    <ShieldCheck className="h-4 w-4 text-emerald-500" />
                                    <span>Pre-Start Inspection Reference</span>
                                </div>
                                <Download className="h-4 w-4 text-zinc-400 group-hover:text-black dark:group-hover:text-white" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
