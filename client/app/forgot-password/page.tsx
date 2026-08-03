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
            setMessage(data.message || 'Recovery coordinates dispatched. Please check your system email.');
        },
        onError: (error: any) => {
            setStatus('error');
            setMessage(error.response?.data?.error || 'Failed to dispatch recovery link.');
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
                    <Link href="/" className="text-xl font-black italic uppercase tracking-[0.1em] text-blue-900 block mb-12">
                        BlueCollar
                    </Link>
                    <h1 className="text-4xl font-bold text-blue-900 tracking-tight uppercase">Recover Access</h1>
                    <p className="text-blue-400 text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                        Enter your registered email address to receive a secure recovery bridge.
                    </p>
                </div>

                {status === 'success' ? (
                    <div className="space-y-10 py-8">
                        <div className="p-8 bg-blue-50 border border-blue-100 rounded-2xl text-blue-600 text-[10px] font-bold uppercase tracking-widest leading-relaxed italic text-center">
                            {message}
                        </div>
                        <Link href={CONSTANTS.ROUTES.LOGIN} className="block w-full">
                            <button className="w-full py-4 bg-blue-900 text-white rounded-xl font-bold text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-blue-900/10 hover:bg-blue-800 transition-all active:scale-[0.98]">
                                Proceed to Login
                            </button>
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                        {status === 'error' && (
                            <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-[10px] font-bold uppercase tracking-widest flex items-center gap-3">
                                <span className="material-symbols-outlined text-base">error</span>
                                {message}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-blue-400 px-1" htmlFor="email">Email Bridge</label>
                            <input
                                {...register('email')}
                                className="w-full bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 focus:bg-white focus:ring-2 focus:ring-blue-900/5 transition-all outline-none text-sm font-bold text-blue-900 placeholder:text-blue-300"
                                id="email"
                                placeholder="operator@domain.com"
                                type="email"
                                disabled={mutation.isPending}
                            />
                            {errors.email && <p className="text-red-600 text-[10px] font-bold px-1 tracking-tight">{errors.email.message}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={mutation.isPending}
                            className="w-full py-4 bg-blue-900 text-white rounded-xl font-bold text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-blue-900/10 hover:bg-blue-800 transition-all active:scale-[0.98] disabled:opacity-50"
                        >
                            {mutation.isPending ? 'Processing...' : 'Request Recovery Link'}
                        </button>

                        <div className="text-center pt-4">
                            <Link href={CONSTANTS.ROUTES.LOGIN} className="text-[10px] font-bold text-blue-400 uppercase tracking-widest hover:text-blue-900 transition-colors">
                                Back to Authentication
                            </Link>
                        </div>
                    </form>
                )}
            </main>

            <footer className="mt-20 py-12 px-8 border-t border-blue-50 w-full max-w-[1440px]">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-[9px] font-bold text-blue-400 uppercase tracking-widest">
                    <p>© 2026 JOBNEXE ENTERPRISE</p>
                    <p>System Security Protocol Enabled</p>
                </div>
            </footer>
        </div>
    );
}
