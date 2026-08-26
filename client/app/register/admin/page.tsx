'use client';

import React, { useState, Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useApiMutation } from '@/lib/hooks';
import { useRouter, useSearchParams } from 'next/navigation';
import { CONSTANTS } from '@/constants';
import Link from 'next/link';

const registerAdminSchema = z.object({
    fullName: z.string().min(1, 'Full name is required'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password')
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

type RegisterAdminForm = z.infer<typeof registerAdminSchema>;

function RegisterAdminContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const requestedRedirect = searchParams.get('redirect');
    const [registerError, setRegisterError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const { register, handleSubmit, formState: { errors } } = useForm<RegisterAdminForm>({
        resolver: zodResolver(registerAdminSchema),
    });

    const registerMutation = useApiMutation<Omit<RegisterAdminForm, 'confirmPassword'>, any>('post', '/auth/register-admin', {
        onSuccess: (data: any) => {
            setSuccessMessage("Admin account created successfully.");
            setTimeout(() => {
                router.push(CONSTANTS.ROUTES.LOGIN);
            }, 2000);
        },
        onError: (error: any) => {
            const errorMsg = error.response?.data?.error || 'An unexpected error occurred. Please try again.';
            setRegisterError(errorMsg);
        }
    });

    const onSubmit = (data: RegisterAdminForm) => {
        setRegisterError(null);
        setSuccessMessage(null);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { confirmPassword, ...submitData } = data;
        registerMutation.mutate(submitData as any);
    };

    return (
        <div className="bg-slate-900 text-white min-h-screen flex flex-col antialiased font-sans">
            <main className="flex-grow w-full flex flex-col items-center justify-center px-6 py-12">
                <div className="w-full max-w-[450px]">
                    <div className="mb-8">
                        <Link
                            href="/"
                            className="group inline-flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-white transition-all"
                        >
                            <span className="material-symbols-outlined text-[14px] transition-transform group-hover:-translate-x-1">arrow_back</span>
                            Back to Home
                        </Link>
                    </div>

                    <div className="mb-10">
                        <Link href="/" className="inline-flex items-center gap-2 text-xl font-bold tracking-tight text-white">
                            BlueCollar Admin
                        </Link>
                        <p className="text-slate-400 mt-1 text-sm">Create an administrator account</p>
                    </div>

                    {successMessage ? (
                        <div className="space-y-8 py-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="text-center space-y-4">
                                <div className="w-20 h-20 bg-slate-800 text-green-400 rounded-3xl mx-auto flex items-center justify-center shadow-xl shadow-black/20">
                                    <span className="material-symbols-outlined text-4xl">check_circle</span>
                                </div>
                                <h2 className="text-2xl font-bold text-white uppercase tracking-tight">Account Created</h2>
                                <p className="text-slate-400 text-xs leading-relaxed max-w-[280px] mx-auto uppercase tracking-widest font-bold italic">
                                    {successMessage} Redirecting to login...
                                </p>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            {registerError && (
                                <div className="bg-red-900/50 text-red-400 text-[11px] p-3 rounded-lg border border-red-900/50 flex items-center gap-2 font-bold uppercase tracking-wider">
                                    <span className="material-symbols-outlined text-sm">error</span>
                                    {registerError}
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1" htmlFor="fullName">Full Name</label>
                                <input
                                    {...register('fullName')}
                                    className={`w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:bg-slate-700 focus:ring-2 focus:ring-white/5 transition-all outline-none text-sm font-medium text-white ${errors.fullName ? 'border-red-500/50' : 'focus:border-slate-600'}`}
                                    id="fullName"
                                    placeholder="Admin Name"
                                    type="text"
                                />
                                {errors.fullName && <p className="text-red-400 text-[10px] font-bold uppercase tracking-tighter px-1">{errors.fullName.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1" htmlFor="email">Email</label>
                                <input
                                    {...register('email')}
                                    className={`w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:bg-slate-700 focus:ring-2 focus:ring-white/5 transition-all outline-none text-sm font-medium text-white ${errors.email ? 'border-red-500/50' : 'focus:border-slate-600'}`}
                                    id="email"
                                    placeholder="admin@bluecollar.com"
                                    type="email"
                                />
                                {errors.email && <p className="text-red-400 text-[10px] font-bold uppercase tracking-tighter px-1">{errors.email.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1" htmlFor="password">Password</label>
                                <div className="relative">
                                    <input
                                        {...register('password')}
                                        className={`w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:bg-slate-700 focus:ring-2 focus:ring-white/5 transition-all outline-none text-sm font-medium text-white ${errors.password ? 'border-red-500/50' : 'focus:border-slate-600'}`}
                                        id="password"
                                        placeholder="••••••••"
                                        type={showPassword ? 'text' : 'password'}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
                                    </button>
                                </div>
                                {errors.password && <p className="text-red-400 text-[10px] font-bold uppercase tracking-tighter px-1">{errors.password.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1" htmlFor="confirmPassword">Confirm Password</label>
                                <div className="relative">
                                    <input
                                        {...register('confirmPassword')}
                                        className={`w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:bg-slate-700 focus:ring-2 focus:ring-white/5 transition-all outline-none text-sm font-medium text-white ${errors.confirmPassword ? 'border-red-500/50' : 'focus:border-slate-600'}`}
                                        id="confirmPassword"
                                        placeholder="••••••••"
                                        type={showPassword ? 'text' : 'password'}
                                    />
                                </div>
                                {errors.confirmPassword && <p className="text-red-400 text-[10px] font-bold uppercase tracking-tighter px-1">{errors.confirmPassword.message}</p>}
                            </div>

                            <button
                                type="submit"
                                disabled={registerMutation.isPending}
                                className="w-full py-4 bg-white text-slate-900 font-bold text-xs uppercase tracking-[0.2em] rounded-lg hover:bg-slate-200 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 shadow-lg shadow-black/20"
                            >
                                {registerMutation.isPending ? 'Processing...' : 'Create Admin Account'}
                            </button>
                        </form>
                    )}

                    <div className="mt-10 pt-6 text-center border-t border-slate-800">
                        <p className="text-xs text-slate-400">
                            Already have an account?
                            <Link href={`${CONSTANTS.ROUTES.LOGIN}${requestedRedirect ? `?redirect=${encodeURIComponent(requestedRedirect)}` : ''}`} className="font-bold text-white hover:underline ml-1 uppercase tracking-wider text-[11px]">Sign In</Link>
                        </p>
                    </div>
                </div>
            </main>

            <footer className="py-8 px-6 border-t border-slate-800">
                <div className="max-w-[1280px] mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <p>© 2026 BlueCollar</p>
                    <div className="flex gap-6">
                        <Link className="hover:text-white transition-colors" href={CONSTANTS.ROUTES.PRIVACY}>Privacy</Link>
                        <a className="hover:text-white transition-colors" href="#">Terms</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default function RegisterAdminPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
        }>
            <RegisterAdminContent />
        </Suspense>
    );
}
