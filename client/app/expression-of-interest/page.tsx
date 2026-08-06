'use client';

import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useApiMutation, useApiQuery } from '@/lib/hooks';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { useAuth } from '@/contexts/AuthContext';

const eoiSchema = z.object({
    roles: z.array(z.string()).min(1, 'Select at least one role'),
    skills: z.array(z.string()).min(1, 'Add at least one core skill'),
    qualifications: z.array(z.string()).min(1, 'List your primary qualifications'),
    experience: z.array(z.object({
        company: z.string().min(1, 'Company is required'),
        role: z.string().min(1, 'Role is required'),
        achievements: z.string().min(1, 'Describe your empirical impact'),
    })).min(1, 'Add your most recent experience'),
});

type EOIForm = z.infer<typeof eoiSchema>;

export default function ExpressionOfInterestPage() {
    const router = useRouter();
    const { user, isLoading: authLoading } = useAuth();
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login?redirect=/expression-of-interest');
        }
    }, [user, authLoading, router]);

    const { data: existingInterest, isLoading: isInterestLoading } = useApiQuery<any>(
        ['interests', 'me'],
        '/interests/me',
        { enabled: !!user }
    );

    const { register, control, handleSubmit, formState: { errors }, reset } = useForm<EOIForm>({
        resolver: zodResolver(eoiSchema),
        defaultValues: {
            roles: [''],
            skills: [''],
            qualifications: [''],
            experience: [{ company: '', role: '', achievements: '' }],
        }
    });

    useEffect(() => {
        if (existingInterest) {
            reset({
                roles: existingInterest.roles?.length ? existingInterest.roles : [''],
                skills: existingInterest.skills?.length ? existingInterest.skills : [''],
                qualifications: existingInterest.qualifications?.length ? existingInterest.qualifications : [''],
                experience: existingInterest.experience?.length ? existingInterest.experience : [{ company: '', role: '', achievements: '' }],
            });
        }
    }, [existingInterest, reset]);

    const { fields: roleFields, append: appendRole } = useFieldArray({ control, name: 'roles' as any });
    const { fields: skillFields, append: appendSkill } = useFieldArray({ control, name: 'skills' as any });
    const { fields: qualFields, append: appendQual } = useFieldArray({ control, name: 'qualifications' as any });
    const { fields: expFields, append: appendExp } = useFieldArray({ control, name: 'experience' as any });

    const createMutation = useApiMutation('post', '/interests', {
        onSuccess: () => {
            setSuccess(true);
            setTimeout(() => router.push('/dashboard'), 3000);
        }
    });

    const updateMutation = useApiMutation('put', '/interests/me', {
        onSuccess: () => {
            setSuccess(true);
            setTimeout(() => router.push('/dashboard'), 3000);
        }
    });

    const onSubmit = (data: EOIForm) => {
        if (existingInterest) {
            updateMutation.mutate(data);
        } else {
            createMutation.mutate(data);
        }
    };

    if (authLoading || isInterestLoading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-blue-900 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!user) {
        return null; // Will redirect via useEffect
    }

    if (success) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center space-y-8">
                <div className="w-20 h-20 bg-blue-900 text-white rounded-full flex items-center justify-center animate-bounce">
                    <span className="material-symbols-outlined text-4xl">done_all</span>
                </div>
                <div className="space-y-4">
                    <h2 className="text-3xl font-black text-blue-900 uppercase tracking-tight">{existingInterest ? 'Audit Updated' : 'Audit Initiated'}</h2>
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] max-w-sm mx-auto leading-relaxed">
                        Your professional profile has been {existingInterest ? 'updated and re-submitted' : 'submitted'} for cryptographic verification. You will be notified via secure email if you meet the Apex threshold.
                    </p>
                </div>
                <p className="text-[9px] font-black text-blue-300 uppercase tracking-widest italic animate-pulse">
                    Redirecting to Professional Dashboard...
                </p>
            </div>
        );
    }

    const isPending = createMutation.isPending || updateMutation.isPending;

    return (
        <div className="bg-white min-h-screen text-blue-900 font-sans pb-24">
            <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-blue-50 px-8 h-20 flex items-center justify-between">
                <Link href="/" className="text-xl font-black italic uppercase tracking-[0.1em] text-blue-900">BlueCollar</Link>
                <Link href="/dashboard" className="text-[10px] font-bold text-blue-400 hover:text-blue-900 uppercase tracking-widest transition-colors">Abort Audit</Link>
            </header>

            <main className="max-w-2xl mx-auto pt-40 px-6 space-y-16">
                <div className="space-y-4">
                    <h1 className="text-4xl font-black tracking-tight text-blue-900 uppercase leading-none">Expression of Interest</h1>
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em]">Detailed Apex Verification Audit Form</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-12">
                    {/* Roles Section */}
                    <section className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-[10px] font-black text-blue-900 uppercase tracking-widest border-b-2 border-blue-900 pb-1">Target Roles</h2>
                            <button type="button" onClick={() => appendRole('')} className="text-[9px] font-bold text-blue-400 uppercase hover:text-blue-900">+ Add Role</button>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                            {roleFields.map((field, index) => (
                                <input
                                    key={field.id}
                                    {...register(`roles.${index}` as any)}
                                    placeholder="e.g. VP of Engineering"
                                    className="w-full bg-blue-50 border border-blue-100 rounded-xl px-5 py-4 text-xs font-bold focus:bg-white focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                                />
                            ))}
                        </div>
                        {errors.roles && <p className="text-red-600 text-[10px] font-bold uppercase">{errors.roles.message}</p>}
                    </section>

                    {/* Skills Section */}
                    <section className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-[10px] font-black text-blue-900 uppercase tracking-widest border-b-2 border-blue-900 pb-1">Core Competencies</h2>
                            <button type="button" onClick={() => appendSkill('')} className="text-[9px] font-bold text-blue-400 uppercase hover:text-blue-900">+ Add Skill</button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {skillFields.map((field, index) => (
                                <input
                                    key={field.id}
                                    {...register(`skills.${index}` as any)}
                                    placeholder="e.g. Distributed Systems"
                                    className="w-full bg-blue-50 border border-blue-100 rounded-xl px-5 py-4 text-xs font-bold focus:bg-white focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                                />
                            ))}
                        </div>
                    </section>

                    {/* Experience Section */}
                    <section className="space-y-8">
                        <div className="flex items-center justify-between">
                            <h2 className="text-[10px] font-black text-blue-900 uppercase tracking-widest border-b-2 border-blue-900 pb-1">Professional Impact</h2>
                            <button type="button" onClick={() => appendExp({ company: '', role: '', achievements: '' })} className="text-[9px] font-bold text-blue-400 uppercase hover:text-blue-900">+ Add Experience</button>
                        </div>
                        <div className="space-y-10">
                            {expFields.map((field, index) => (
                                <div key={field.id} className="p-8 bg-blue-50/50 rounded-[2rem] border border-blue-100 space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Company</label>
                                            <input
                                                {...register(`experience.${index}.company` as any)}
                                                className="w-full bg-white border border-blue-100 rounded-xl px-4 py-3 text-xs font-bold outline-none"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Role</label>
                                            <input
                                                {...register(`experience.${index}.role` as any)}
                                                className="w-full bg-white border border-blue-100 rounded-xl px-4 py-3 text-xs font-bold outline-none"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Empirical Achievements (Metrics Required)</label>
                                        <textarea
                                            {...register(`experience.${index}.achievements` as any)}
                                            rows={4}
                                            placeholder="e.g. Scaled infrastructure from 10k to 1M DAU, reducing latency by 40%..."
                                            className="w-full bg-white border border-blue-100 rounded-xl px-4 py-4 text-xs font-bold outline-none resize-none"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full bg-blue-900 text-white py-6 rounded-none font-black text-[11px] uppercase tracking-[0.4em] shadow-2xl shadow-blue-900/20 hover:bg-blue-800 transition-all disabled:opacity-50"
                    >
                        {isPending ? 'Uploading Audit Data...' : (existingInterest ? 'Update Verification Request' : 'Submit Verification Request')}
                    </button>
                </form>
            </main>
        </div>
    );
}
