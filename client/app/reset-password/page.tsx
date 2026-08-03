'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useApiMutation } from '@/lib/hooks';
import { CONSTANTS } from '@/constants';
import Link from 'next/link';

const resetPasswordSchema = z.object({
    password: z.string()
        .min(8, 'Min 8 characters')
        .regex(/[A-Z]/, 'One uppercase')
        .regex(/[0-9]/, 'One number')
        .regex(/[\W_]/, 'One special character'),
    confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

function ResetPasswordContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get('token');
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const { register, handleSubmit, formState: { errors } } = useForm<ResetPasswordForm>({
        resolver: zodResolver(resetPasswordSchema),
    });

    const mutation = useApiMutation<any, any>('post', '/auth/reset-password', {
        onSuccess: (data: any) => {
            setStatus('success');
            setMessage(data.message || 'Access credentials updated successfully.');
            setTimeout(() => router.push(CONSTANTS.ROUTES.LOGIN), 3000);
        },
        onError: (error: any) => {
            setStatus('error');
            setMessage(error.response?.data?.error || 'Failed to authorize credential update. Link may be invalid.');
        }
    });

    const onSubmit = (data: ResetPasswordForm) => {
        if (!token) {
            setStatus('error');
            setMessage('Missing authorization token.');
            return;
        }
        setStatus('idle');
        mutation.mutate({ token, password: data.password });
    };

    return (
        <main className="max-w-[448px] w-full space-y-12">
            <div className="space-y-4 text-center lg:text-left">
                <Link href="/" className="text-xl font-black italic uppercase tracking-[0.1em] text-blue-900 block mb-12">
                    BlueCollar
                </Link>
                <h1 className="text-4xl font-bold text-blue-900 tracking-tight uppercase">Update Key</h1>
                <p className="text-blue-400 text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                    Establish your new security credentials for account access.
                </p>
            </div>

            {status === 'success' ? (
                <div className="space-y-6 py-8 text-center lg:text-left">
                    <div className="p-8 bg-blue-50 border border-blue-100 rounded-2xl text-blue-900 text-[10px] font-bold uppercase tracking-widest leading-relaxed italic">
                        {message}
                    </div>
                    <p className="text-[9px] font-bold text-blue-400 uppercase tracking-widest animate-pulse">
                        Redirecting to auth gateway...
                    </p>
                </div>
            ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                    {status === 'error' && (
                        <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-[10px] font-bold uppercase tracking-widest flex items-center gap-3">
                            <span className="material-symbols-outlined text-base">error</span>
                            {message}
                        </div>
                    )}

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-blue-400 px-1" htmlFor="password">New Security Case</label>
                            <input
                                {...register('password')}
                                className="w-full bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 focus:bg-white focus:ring-2 focus:ring-blue-900/5 transition-all outline-none text-sm font-bold text-blue-900 placeholder:text-blue-300"
                                id="password"
                                placeholder="••••••••"
                                type="password"
                                disabled={mutation.isPending}
                            />
                            {errors.password && <p className="text-red-600 text-[10px] font-bold px-1 tracking-tight">{errors.password.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-blue-400 px-1" htmlFor="confirmPassword">Verify Security Case</label>
                            <input
                                {...register('confirmPassword')}
                                className="w-full bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 focus:bg-white focus:ring-2 focus:ring-blue-900/5 transition-all outline-none text-sm font-bold text-blue-900 placeholder:text-blue-300"
                                id="confirmPassword"
                                placeholder="••••••••"
                                type="password"
                                disabled={mutation.isPending}
                            />
                            {errors.confirmPassword && <p className="text-red-600 text-[10px] font-bold px-1 tracking-tight">{errors.confirmPassword.message}</p>}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={mutation.isPending || !token}
                        className="w-full py-4 bg-blue-900 text-white rounded-xl font-bold text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-blue-900/10 hover:bg-blue-800 transition-all active:scale-[0.98] disabled:opacity-50"
                    >
                        {mutation.isPending ? 'Propagating...' : 'Authorize New Key'}
                    </button>
                    {!token && (
                        <p className="text-red-600 text-[9px] font-bold uppercase tracking-widest text-center">
                            Missing Protocol Token. Access Denied.
                        </p>
                    )}
                </form>
            )}
        </main>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="min-h-screen bg-white text-blue-900 antialiased flex flex-col items-center justify-center p-8 font-sans">
            <Suspense fallback={<div className="text-[10px] font-bold uppercase tracking-widest text-blue-400">Loading Protocol...</div>}>
                <ResetPasswordContent />
            </Suspense>

            <footer className="mt-20 py-12 px-8 border-t border-blue-50 w-full max-w-[1440px]">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-[9px] font-bold text-blue-400 uppercase tracking-widest">
                    <p>© 2026 JOBNEXE ENTERPRISE</p>
                    <p>Registry Update Authority Active</p>
                </div>
            </footer>
        </div>
    );
}
