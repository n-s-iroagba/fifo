'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useApiMutation } from '@/lib/hooks';
import { CONSTANTS } from '@/constants';
import Link from 'next/link';

const forgotPasswordSchema = z.object({
    email: z.string().email('Invalid email address'),
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordForm>({
        resolver: zodResolver(forgotPasswordSchema),
    });

    const mutation = useApiMutation<ForgotPasswordForm, any>('post', '/auth/forgot-password', {
        onSuccess: (data: any) => {
            setStatus('success');
            setMessage(data.message || 'A password reset link has been sent to your email address.');
        },
        onError: (error: any) => {
            setStatus('error');
            setMessage(error.response?.data?.error || 'Unable to send reset link. Please check your email and try again.');
        }
    });

    const onSubmit = (data: ForgotPasswordForm) => {
        setStatus('idle');
        mutation.mutate(data);
    };

    return (
        <div className="min-h-screen bg-white text-blue-900 antialiased flex flex-col items-center justify-center p-8 font-sans">
            <main className="max-w-[448px] w-full space-y-12">
                <div className="space-y-4 text-center lg:text-left">
                    <Link href="/" className="text-xl font-bold tracking-tight text-blue-900 block mb-12">
                        BlueCollar
                    </Link>
                    <h1 className="text-3xl font-bold text-blue-900 tracking-tight">Forgot Password?</h1>
                    <p className="text-blue-600 text-xs leading-relaxed font-medium">
                        Enter your registered email address and we'll send you a link to reset your password.
                    </p>
                </div>

                {status === 'success' ? (
                    <div className="space-y-8 py-4">
                        <div className="p-6 bg-blue-50 border border-blue-100 rounded-xl text-blue-900 text-xs font-medium leading-relaxed text-center">
                            {message}
                        </div>
                        <Link href={CONSTANTS.ROUTES.LOGIN} className="block w-full">
                            <button className="w-full py-4 bg-blue-900 text-white rounded-lg font-bold text-xs uppercase tracking-[0.2em] shadow-xl shadow-blue-900/10 hover:bg-blue-800 transition-all active:scale-[0.98]">
                                Back to Sign In
                            </button>
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {status === 'error' && (
                            <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs font-semibold flex items-center gap-3">
                                <span className="material-symbols-outlined text-base">error</span>
                                {message}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-blue-900 px-1" htmlFor="email">Email Address</label>
                            <input
                                {...register('email')}
                                className="w-full bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 focus:bg-white focus:ring-2 focus:ring-blue-900/5 transition-all outline-none text-sm font-medium text-blue-900 placeholder:text-blue-300"
                                id="email"
                                placeholder="name@email.com"
                                type="email"
                                disabled={mutation.isPending}
                            />
                            {errors.email && <p className="text-red-600 text-xs font-medium px-1 tracking-tight">{errors.email.message}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={mutation.isPending}
                            className="w-full py-4 bg-blue-900 text-white rounded-lg font-bold text-xs uppercase tracking-[0.2em] shadow-xl shadow-blue-900/10 hover:bg-blue-800 transition-all active:scale-[0.98] disabled:opacity-50"
                        >
                            {mutation.isPending ? 'Sending...' : 'Send Reset Link'}
                        </button>

                        <div className="text-center pt-2">
                            <Link href={CONSTANTS.ROUTES.LOGIN} className="text-xs font-semibold text-blue-500 hover:text-blue-900 transition-colors">
                                Back to Sign In
                            </Link>
                        </div>
                    </form>
                )}
            </main>

            <footer className="mt-20 py-8 px-6 border-t border-blue-50 w-full max-w-[1440px]">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium text-blue-400">
                    <p>© 2026 Blue Collar Recruitment</p>
                    <p>All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
