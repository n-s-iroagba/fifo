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
            setMessage(data.message || 'Your password has been reset successfully. Redirecting you to sign in...');
            setTimeout(() => router.push(CONSTANTS.ROUTES.LOGIN), 3000);
        },
        onError: (error: any) => {
            setStatus('error');
            setMessage(error.response?.data?.error || 'Unable to reset password. The link may have expired or is invalid.');
        }
    });

    const onSubmit = (data: ResetPasswordForm) => {
        if (!token) {
            setStatus('error');
            setMessage('This password reset link is missing or invalid. Please request a new one.');
            return;
        }
        setStatus('idle');
        mutation.mutate({ token, password: data.password });
    };

    return (
        <main className="max-w-[448px] w-full space-y-12">
            <div className="space-y-4 text-center lg:text-left">
                <Link href="/" className="text-xl font-bold tracking-tight text-blue-900 block mb-12">
                    BlueCollar
                </Link>
                <h1 className="text-3xl font-bold text-blue-900 tracking-tight">Create New Password</h1>
                <p className="text-blue-600 text-xs leading-relaxed font-medium">
                    Please enter your new password below.
                </p>
            </div>

            {status === 'success' ? (
                <div className="space-y-6 py-6 text-center lg:text-left">
                    <div className="p-6 bg-blue-50 border border-blue-100 rounded-xl text-blue-900 text-xs font-medium leading-relaxed">
                        {message}
                    </div>
                    <p className="text-xs font-semibold text-blue-600 animate-pulse">
                        Taking you to the sign in page...
                    </p>
                </div>
            ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {status === 'error' && (
                        <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs font-semibold flex items-center gap-3">
                            <span className="material-symbols-outlined text-base">error</span>
                            {message}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-blue-900 px-1" htmlFor="password">New Password</label>
                            <input
                                {...register('password')}
                                className="w-full bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 focus:bg-white focus:ring-2 focus:ring-blue-900/5 transition-all outline-none text-sm font-medium text-blue-900 placeholder:text-blue-300"
                                id="password"
                                placeholder="••••••••"
                                type="password"
                                disabled={mutation.isPending}
                            />
                            {errors.password && <p className="text-red-600 text-xs font-medium px-1 tracking-tight">{errors.password.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-blue-900 px-1" htmlFor="confirmPassword">Confirm New Password</label>
                            <input
                                {...register('confirmPassword')}
                                className="w-full bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 focus:bg-white focus:ring-2 focus:ring-blue-900/5 transition-all outline-none text-sm font-medium text-blue-900 placeholder:text-blue-300"
                                id="confirmPassword"
                                placeholder="••••••••"
                                type="password"
                                disabled={mutation.isPending}
                            />
                            {errors.confirmPassword && <p className="text-red-600 text-xs font-medium px-1 tracking-tight">{errors.confirmPassword.message}</p>}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={mutation.isPending || !token}
                        className="w-full py-4 bg-blue-900 text-white rounded-lg font-bold text-xs uppercase tracking-[0.2em] shadow-xl shadow-blue-900/10 hover:bg-blue-800 transition-all active:scale-[0.98] disabled:opacity-50"
                    >
                        {mutation.isPending ? 'Saving...' : 'Reset Password'}
                    </button>
                    {!token && (
                        <p className="text-red-600 text-xs font-semibold text-center">
                            This reset link is missing or invalid. Please request a new link.
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
            <Suspense fallback={<div className="text-xs font-semibold text-blue-400">Loading...</div>}>
                <ResetPasswordContent />
            </Suspense>

            <footer className="mt-20 py-8 px-6 border-t border-blue-50 w-full max-w-[1440px]">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium text-blue-400">
                    <p>© 2026 Blue Collar Recruitment</p>
                    <p>All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
