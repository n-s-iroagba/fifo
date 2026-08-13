'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApiMutation, useApiQuery } from '@/lib/hooks';
import Link from 'next/link';

export default function EOIPage() {
    const router = useRouter();
    const { data: user } = useApiQuery<any>(['auth', 'me'], '/auth/me');

    // Fetch existing interest if any
    const { data: existingInterest, isLoading: isFetching } = useApiQuery<any>(['interest', 'me'], '/interests/me');

    const [roles, setRoles] = useState('');
    const [skills, setSkills] = useState('');
    const [qualifications, setQualifications] = useState('');
    const [experienceText, setExperienceText] = useState('');

    const [successMessage, setSuccessMessage] = useState('');

    const mutation = useApiMutation<any, any>('post', '/interests');
    const updateMutation = useApiMutation<any, any>('put', '/interests/me');

    useEffect(() => {
        if (existingInterest) {
            setRoles(existingInterest.roles?.join(', ') || '');
            setSkills(existingInterest.skills?.join(', ') || '');
            setQualifications(existingInterest.qualifications?.join(', ') || '');
            setExperienceText(existingInterest.experience?.[0]?.description || '');
        }
    }, [existingInterest]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const payload = {
            roles: roles.split(',').map(s => s.trim()).filter(Boolean),
            skills: skills.split(',').map(s => s.trim()).filter(Boolean),
            qualifications: qualifications.split(',').map(s => s.trim()).filter(Boolean),
            experience: [{ description: experienceText.trim() }] // Simplified for UI
        };

        try {
            if (existingInterest) {
                await updateMutation.mutateAsync(payload);
            } else {
                await mutation.mutateAsync(payload);
            }
            setSuccessMessage('Expression of Interest submitted successfully. Our scouting team has been notified.');
            setTimeout(() => {
                router.push('/dashboard/jobs');
            }, 3000);
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to submit Expression of Interest');
        }
    };

    if (isFetching) {
        return (
            <div className="flex justify-center py-20">
                <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-900 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 pt-12">
            <div className="mb-10">
                <Link href="/dashboard/jobs" className="inline-flex items-center gap-2 text-xs font-bold text-blue-400 hover:text-blue-900 uppercase tracking-widest transition-colors mb-6">
                    <span className="material-symbols-outlined text-sm">west</span>
                    Back to Jobs
                </Link>
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
                        <span className="material-symbols-outlined text-blue-900">campaign</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black text-blue-900 tracking-tight">Expression of Interest</h1>
                </div>
                <p className="text-blue-500 font-medium">
                    Let our scouting team know what you're looking for. We will notify you directly when a matching role becomes available.
                </p>
            </div>

            {successMessage ? (
                <div className="bg-emerald-50 border border-emerald-200 p-8 rounded-[2rem] text-center">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl shadow-emerald-900/5 text-emerald-500">
                        <span className="material-symbols-outlined text-3xl">check_circle</span>
                    </div>
                    <h3 className="text-xl font-bold text-emerald-900 mb-2">Success!</h3>
                    <p className="text-emerald-700 font-medium">{successMessage}</p>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="bg-white border border-blue-100 rounded-[3rem] p-8 md:p-12 space-y-8 shadow-xl shadow-blue-900/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                    <div className="space-y-2 relative z-10">
                        <label className="block text-[10px] font-black text-blue-900 uppercase tracking-widest">Desired Roles</label>
                        <input
                            type="text"
                            value={roles}
                            onChange={(e) => setRoles(e.target.value)}
                            placeholder="e.g. Senior Software Engineer, Technical Lead"
                            className="w-full bg-blue-50/50 border border-blue-100 rounded-2xl py-4 px-5 text-sm font-bold text-blue-900 focus:bg-white focus:border-blue-900 focus:ring-4 focus:ring-blue-900/5 transition-all outline-none"
                            required
                        />
                        <p className="text-[10px] font-bold text-blue-400">Separate multiple roles with commas.</p>
                    </div>

                    <div className="space-y-2 relative z-10">
                        <label className="block text-[10px] font-black text-blue-900 uppercase tracking-widest">Core Skills</label>
                        <input
                            type="text"
                            value={skills}
                            onChange={(e) => setSkills(e.target.value)}
                            placeholder="e.g. React, Node.js, System Architecture"
                            className="w-full bg-blue-50/50 border border-blue-100 rounded-2xl py-4 px-5 text-sm font-bold text-blue-900 focus:bg-white focus:border-blue-900 focus:ring-4 focus:ring-blue-900/5 transition-all outline-none"
                            required
                        />
                        <p className="text-[10px] font-bold text-blue-400">Separate multiple skills with commas.</p>
                    </div>

                    <div className="space-y-2 relative z-10">
                        <label className="block text-[10px] font-black text-blue-900 uppercase tracking-widest">Qualifications</label>
                        <input
                            type="text"
                            value={qualifications}
                            onChange={(e) => setQualifications(e.target.value)}
                            placeholder="e.g. BSc Computer Science, AWS Certified"
                            className="w-full bg-blue-50/50 border border-blue-100 rounded-2xl py-4 px-5 text-sm font-bold text-blue-900 focus:bg-white focus:border-blue-900 focus:ring-4 focus:ring-blue-900/5 transition-all outline-none"
                            required
                        />
                        <p className="text-[10px] font-bold text-blue-400">Separate multiple qualifications with commas.</p>
                    </div>

                    <div className="space-y-2 relative z-10">
                        <label className="block text-[10px] font-black text-blue-900 uppercase tracking-widest">Brief Experience Summary</label>
                        <textarea
                            value={experienceText}
                            onChange={(e) => setExperienceText(e.target.value)}
                            placeholder="Briefly describe your relevant professional background..."
                            rows={4}
                            className="w-full bg-blue-50/50 border border-blue-100 rounded-2xl py-4 px-5 text-sm font-medium text-blue-900 focus:bg-white focus:border-blue-900 focus:ring-4 focus:ring-blue-900/5 transition-all outline-none resize-none"
                            required
                        />
                    </div>

                    <div className="pt-4 relative z-10 border-t border-blue-50">
                        <button
                            type="submit"
                            disabled={mutation.isPending || updateMutation.isPending}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-blue-900 text-white px-10 py-5 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-800 transition-all shadow-xl shadow-blue-900/20 hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
                        >
                            {mutation.isPending || updateMutation.isPending ? 'Submitting...' : 'Submit Expression of Interest'}
                            <span className="material-symbols-outlined text-sm">send</span>
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}
