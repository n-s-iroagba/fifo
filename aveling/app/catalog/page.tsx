'use client';

// STEP-010, STEP-011, STEP-012
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, CheckCircle2, Clock, ShieldAlert, Tag, ArrowRight, Info, Filter, ShoppingBag } from 'lucide-react';
import { apiClient } from '../../lib/axios';

interface Course {
    id: string;
    name: string;
    code: string;
    format: 'THEORY' | 'PRACTICAL' | 'MIXED';
    certificationName: string;
    description: string;
    durationHours: number;
    price: number;
    subsidyAmount?: number;
    subsidyReason?: string;
    isGapRecommended?: boolean;
}

export default function CourseCatalogPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [cart, setCart] = useState<Course[]>([]);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const res = await apiClient.get('/courses');
                if (res.data && res.data.success) {
                    setCourses(res.data.data);
                }
            } catch (err) {
                // Fallback demonstration courses mapped to FIFO gaps
                setCourses([
                    {
                        id: 'crs-wah-101',
                        name: 'RIIWHS204E - Work Safely at Heights',
                        code: 'WAH-01',
                        format: 'MIXED',
                        certificationName: 'Working at Heights (RIIWHS204E)',
                        description: 'Comprehensive training covering risk assessment, fall arrest equipment selection, inspection, and practical height simulation.',
                        durationHours: 8,
                        price: 280,
                        subsidyAmount: 280, // 100% Subsidized by recruiter!
                        subsidyReason: 'Recruiter Subsidized Placement Incentive',
                        isGapRecommended: true
                    },
                    {
                        id: 'crs-fa-301',
                        name: 'HLTAID011 - Provide First Aid Refresher',
                        code: 'FA-03',
                        format: 'THEORY',
                        certificationName: 'First Aid & CPR (HLTAID011)',
                        description: 'Refresher course covering CPR techniques, automated external defibrillator (AED) usage, and emergency scene management.',
                        durationHours: 4,
                        price: 150,
                        subsidyAmount: 75, // 50% Subsidized
                        subsidyReason: 'FIFO Agency partial subsidy',
                        isGapRecommended: true
                    },
                    {
                        id: 'crs-cse-202',
                        name: 'RIIWHS202E - Enter and Work in Confined Spaces',
                        code: 'CSE-02',
                        format: 'MIXED',
                        certificationName: 'Confined Space Entry (RIIWHS202E)',
                        description: 'Teaches atmospheric testing, gas monitoring, permit-to-work procedures, and emergency evacuation tactics.',
                        durationHours: 12,
                        price: 340,
                        subsidyAmount: 0,
                        isGapRecommended: false
                    },
                    {
                        id: 'crs-gd-217',
                        name: 'MSMWHS217 - Conduct Gas Testing Activities',
                        code: 'GD-04',
                        format: 'PRACTICAL',
                        certificationName: 'Gas Detection (MSMWHS217)',
                        description: 'Hands-on practical calibration and operation of multi-gas detection equipment for site safety officers.',
                        durationHours: 6,
                        price: 220,
                        subsidyAmount: 0,
                        isGapRecommended: false
                    }
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, []);

    const addToCart = (course: Course) => {
        if (!cart.some(item => item.id === course.id)) {
            setCart([...cart, course]);
        }
    };

    const removeFromCart = (id: string) => {
        setCart(cart.filter(item => item.id !== id));
    };

    const recommendedCourses = courses.filter(c => c.isGapRecommended);
    const otherCourses = courses.filter(c => !c.isGapRecommended);

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-zinc-200 pb-6 dark:border-zinc-800">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
                        <BookOpen className="h-7 w-7 text-amber-600" />
                        Aveling Training Course Catalog
                    </h1>
                    <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                        Enroll in accredited certification courses tailored to your assigned FIFO role requirements.
                    </p>
                </div>

                {/* Cart Drawer Trigger */}
                {cart.length > 0 && (
                    <Link
                        href="/checkout"
                        className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-500 transition-all"
                    >
                        <ShoppingBag className="h-4 w-4" />
                        Checkout ({cart.length} course{cart.length > 1 ? 's' : ''})
                    </Link>
                )}
            </div>

            {/* STEP-010: Recommended Courses Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                        <Tag className="h-5 w-5 text-amber-600" />
                        Recommended for Your Missing Gaps
                    </h2>
                    <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 dark:bg-amber-950 dark:border-amber-900">
                        Target Role Matched
                    </span>
                </div>

                {loading ? (
                    <p className="text-sm text-zinc-500">Loading course catalog...</p>
                ) : (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        {recommendedCourses.map((course) => {
                            const finalPrice = Math.max(0, course.price - (course.subsidyAmount || 0));
                            const isSubsidized = (course.subsidyAmount || 0) > 0;
                            const inCart = cart.some(item => item.id === course.id);

                            return (
                                <div
                                    key={course.id}
                                    className="flex flex-col justify-between rounded-2xl border border-amber-200 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-amber-900/50 dark:bg-zinc-900 relative"
                                >
                                    {/* Subsidized Banner (F-009 / STEP-014) */}
                                    {isSubsidized && (
                                        <div className="mb-4 rounded-xl bg-amber-50 border border-amber-200 p-3 dark:bg-amber-950/60 dark:border-amber-900/60 flex items-start gap-2.5">
                                            <Tag className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                                            <div className="text-xs text-amber-900 dark:text-amber-200">
                                                <span className="font-bold">Fee Subsidy Applied: </span>
                                                ${course.subsidyAmount} covered ({course.subsidyReason})
                                            </div>
                                        </div>
                                    )}

                                    <div>
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="font-mono text-xs font-bold text-zinc-500">{course.code}</span>
                                            {/* STEP-005: Course Format Indicator */}
                                            <span
                                                className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                                                    course.format === 'MIXED'
                                                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                                                        : course.format === 'THEORY'
                                                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                                                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                                }`}
                                            >
                                                {course.format} FORMAT
                                            </span>
                                        </div>

                                        <h3 className="mt-3 text-lg font-bold text-zinc-900 dark:text-white">
                                            {course.name}
                                        </h3>
                                        <p className="mt-1 text-xs font-semibold text-amber-600">
                                            Satisfies: {course.certificationName}
                                        </p>

                                        <p className="mt-3 text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2">
                                            {course.description}
                                        </p>

                                        {/* Format Note for Mixed courses */}
                                        {course.format === 'MIXED' && (
                                            <p className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-purple-600 dark:text-purple-400">
                                                <Info className="h-3.5 w-3.5" />
                                                Requires Theory Exam before booking Practical session.
                                            </p>
                                        )}
                                    </div>

                                    <div className="mt-6 flex items-center justify-between border-t border-zinc-100 pt-4 dark:border-zinc-800">
                                        <div>
                                            <span className="text-[10px] font-bold uppercase text-zinc-400">Total Learner Payable</span>
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-xl font-extrabold text-zinc-900 dark:text-white">
                                                    ${finalPrice.toFixed(2)}
                                                </span>
                                                {isSubsidized && (
                                                    <span className="text-xs text-zinc-400 line-through">
                                                        ${course.price.toFixed(2)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {inCart ? (
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                                                    <CheckCircle2 className="h-4 w-4" /> Added
                                                </span>
                                                <button
                                                    onClick={() => removeFromCart(course.id)}
                                                    className="text-xs text-rose-500 underline hover:text-rose-700"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => addToCart(course)}
                                                className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2 text-xs font-bold text-white hover:bg-amber-500 shadow-sm transition-all"
                                            >
                                                Select & Enroll
                                                <ArrowRight className="h-3.5 w-3.5" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Other Available Courses */}
            <div className="space-y-4 pt-4">
                <h2 className="text-lg font-bold text-zinc-900 dark:text-white">All Available Training Courses</h2>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {otherCourses.map((course) => {
                        const inCart = cart.some(item => item.id === course.id);
                        return (
                            <div key={course.id} className="flex flex-col justify-between rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                                <div>
                                    <div className="flex items-center justify-between">
                                        <span className="font-mono text-xs font-bold text-zinc-500">{course.code}</span>
                                        <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-bold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                                            {course.format}
                                        </span>
                                    </div>
                                    <h3 className="mt-3 text-base font-bold text-zinc-900 dark:text-white">{course.name}</h3>
                                    <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">{course.description}</p>
                                </div>

                                <div className="mt-6 flex items-center justify-between border-t border-zinc-100 pt-4 dark:border-zinc-800">
                                    <span className="text-lg font-bold text-zinc-900 dark:text-white">${course.price}</span>
                                    {inCart ? (
                                        <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                                            <CheckCircle2 className="h-4 w-4" /> Added
                                        </span>
                                    ) : (
                                        <button
                                            onClick={() => addToCart(course)}
                                            className="rounded-xl border border-zinc-300 bg-white px-3 py-1.5 text-xs font-bold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                                        >
                                            Add to Cart
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
