'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, CheckCircle2, Tag, ArrowRight, Info, ShoppingBag } from 'lucide-react';
import { apiClient } from '../../lib/axios';
import { PageShell } from '../../components/PageShell';

interface Course {
    id: string; name: string; code: string; format: 'THEORY' | 'PRACTICAL' | 'MIXED';
    certificationName: string; description: string; durationHours: number;
    price: number; subsidyAmount?: number; subsidyReason?: string; isGapRecommended?: boolean;
}

const FORMAT_STYLE: Record<string, string> = {
    MIXED: 'bg-purple-100 text-purple-800',
    THEORY: 'bg-blue-100 text-blue-800',
    PRACTICAL: 'bg-emerald-100 text-emerald-800',
};

export default function CourseCatalogPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [cart, setCart] = useState<Course[]>([]);

    useEffect(() => {
        apiClient.get('/courses')
            .then(res => { if (res.data?.success) setCourses(res.data.data); })
            .catch(() => setCourses([]))
            .finally(() => setLoading(false));
    }, []);

    const addToCart = (c: Course) => { if (!cart.some(i => i.id === c.id)) setCart([...cart, c]); };
    const removeFromCart = (id: string) => setCart(cart.filter(i => i.id !== id));

    const recommended = courses.filter(c => c.isGapRecommended);
    const others = courses.filter(c => !c.isGapRecommended);

    return (
        <PageShell>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFC700] text-black font-extrabold text-xs uppercase tracking-wider w-fit mb-3">
                        <BookOpen className="h-3.5 w-3.5" /> Aveling Training
                    </div>
                    <h1 className="text-4xl font-black text-zinc-900 tracking-tight">Course Catalog</h1>
                    <p className="text-sm font-medium text-zinc-500 mt-2">Enroll in accredited certification courses tailored to your assigned FIFO role requirements. Save over 50% with our partner labour hiring companies.</p>
                </div>
                {cart.length > 0 && (
                    <Link href="/checkout" className="inline-flex items-center gap-2 bg-zinc-900 text-[#FFC700] px-5 py-3 rounded-xl text-xs font-extrabold uppercase tracking-wider shadow-md hover:bg-black transition-all">
                        <ShoppingBag className="h-4 w-4" /> Checkout ({cart.length})
                    </Link>
                )}
            </div>
            <div className="w-full h-0.5 bg-[#FFC700] mb-10" />

            {loading && (
                <div className="flex flex-col items-center justify-center py-24 space-y-5">
                    <div className="animate-spin rounded-full h-14 w-14 border-4 border-zinc-200 border-t-[#FFC700]" />
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest animate-pulse">Loading catalog...</p>
                </div>
            )}

            {!loading && (
                <div className="space-y-12">
                    {/* Recommended */}
                    {recommended.length > 0 && (
                        <div className="space-y-5">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-black text-zinc-900 flex items-center gap-2">
                                    <Tag className="h-5 w-5 text-[#FFC700]" /> Recommended for Your Gaps
                                </h2>
                                <span className="text-xs font-extrabold text-black bg-[#FFC700] px-3 py-1 rounded-full uppercase tracking-wider">Role Matched</span>
                            </div>
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                {recommended.map((course) => {
                                    const finalPrice = Math.max(0, course.price - (course.subsidyAmount || 0));
                                    const isSubsidized = (course.subsidyAmount || 0) > 0;
                                    const inCart = cart.some(i => i.id === course.id);
                                    return (
                                        <div key={course.id} className="bg-white border-2 border-[#FFC700]/50 rounded-2xl p-6 shadow-md hover:border-[#FFC700] transition-all flex flex-col justify-between">
                                            {isSubsidized && (
                                                <div className="mb-4 rounded-xl bg-amber-50 border border-amber-200 p-3 flex items-start gap-2.5">
                                                    <Tag className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                                                    <div className="text-xs text-amber-900"><span className="font-bold">Fee Subsidy Applied: </span>${course.subsidyAmount} covered ({course.subsidyReason})</div>
                                                </div>
                                            )}
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className="font-mono text-xs font-bold text-zinc-400">{course.code}</span>
                                                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${FORMAT_STYLE[course.format] || 'bg-zinc-100 text-zinc-700'}`}>{course.format}</span>
                                                </div>
                                                <h3 className="text-lg font-extrabold text-zinc-900">{course.name}</h3>
                                                <p className="text-xs font-bold text-[#FFC700]">Satisfies: {course.certificationName}</p>
                                                <p className="text-xs text-zinc-500 line-clamp-2">{course.description}</p>
                                                {course.format === 'MIXED' && (
                                                    <p className="flex items-center gap-1.5 text-[11px] font-semibold text-purple-600">
                                                        <Info className="h-3.5 w-3.5" /> Theory exam must be passed before booking practical session.
                                                    </p>
                                                )}
                                            </div>
                                            <div className="mt-6 flex items-center justify-between border-t border-zinc-100 pt-4">
                                                <div>
                                                    <span className="text-[10px] font-bold uppercase text-zinc-400">Learner Payable</span>
                                                    <div className="flex items-baseline gap-2">
                                                        <span className="text-2xl font-black text-zinc-900">${finalPrice.toFixed(2)}</span>
                                                        {isSubsidized && <span className="text-xs text-zinc-400 line-through">${course.price.toFixed(2)}</span>}
                                                    </div>
                                                </div>
                                                {inCart ? (
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-xs font-bold text-emerald-600 flex items-center gap-1"><CheckCircle2 className="h-4 w-4" /> Added</span>
                                                        <button onClick={() => removeFromCart(course.id)} className="text-xs text-rose-500 underline hover:text-rose-700">Remove</button>
                                                    </div>
                                                ) : (
                                                    <button onClick={() => addToCart(course)} className="inline-flex items-center gap-2 bg-[#FFC700] text-black px-5 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider hover:bg-yellow-400 shadow-sm transition-all">
                                                        Enroll <ArrowRight className="h-3.5 w-3.5" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* All Courses */}
                    <div className="space-y-5">
                        <h2 className="text-xl font-black text-zinc-900">All Available Training Courses</h2>
                        {others.length === 0 && recommended.length === 0 && (
                            <div className="bg-white border border-zinc-200 rounded-2xl p-10 text-center shadow-sm">
                                <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest">No courses available yet.</p>
                            </div>
                        )}
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            {others.map((course) => {
                                const inCart = cart.some(i => i.id === course.id);
                                return (
                                    <div key={course.id} className="bg-white border-2 border-zinc-200 rounded-2xl p-6 shadow-md hover:border-zinc-400 transition-all flex flex-col justify-between">
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="font-mono text-xs font-bold text-zinc-400">{course.code}</span>
                                                <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${FORMAT_STYLE[course.format] || 'bg-zinc-100 text-zinc-700'}`}>{course.format}</span>
                                            </div>
                                            <h3 className="text-base font-extrabold text-zinc-900">{course.name}</h3>
                                            <p className="text-xs text-zinc-500">{course.description}</p>
                                        </div>
                                        <div className="mt-6 flex items-center justify-between border-t border-zinc-100 pt-4">
                                            <span className="text-xl font-black text-zinc-900">${course.price}</span>
                                            {inCart ? (
                                                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1"><CheckCircle2 className="h-4 w-4" /> Added</span>
                                            ) : (
                                                <button onClick={() => addToCart(course)} className="inline-flex items-center gap-1.5 border-2 border-zinc-900 bg-white px-4 py-2 rounded-xl text-xs font-extrabold text-zinc-900 hover:bg-zinc-900 hover:text-white transition-all uppercase tracking-wider">
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
            )}
        </PageShell>
    );
}
