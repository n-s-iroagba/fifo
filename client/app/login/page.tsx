'use client';

import React, { useState, Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useApiMutation } from '@/lib/hooks';
import { useRouter, useSearchParams } from 'next/navigation';
import { CONSTANTS } from '@/constants';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

function LoginContent() {
    const router = useRouter();
    const { user, login, logout } = useAuth();
    const searchParams = useSearchParams();
    const requestedRedirect = searchParams.get('redirect');
    const [loginError, setLoginError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [isUnverified, setIsUnverified] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
        resolver: zodResolver(loginSchema),
    });

    const loginMutation = useApiMutation<LoginForm, any>('post', '/auth/login', {
        onSuccess: (data: any) => {
            login(data.accessToken, data.user);

            let targetRedirect = requestedRedirect;
            if (targetRedirect && targetRedirect.startsWith('/jobs/')) {
                targetRedirect = targetRedirect.replace('/jobs/', '/dashboard/jobs/');
            }

            if (targetRedirect) {
                router.push(targetRedirect);
            } else {
                const targetPath = data.user.role === CONSTANTS.ROLES.ADMIN
                    ? CONSTANTS.ROUTES.ADMIN.DASHBOARD
                    : CONSTANTS.ROUTES.DASHBOARD;
                router.push(targetPath);
            }
        },
        onError: (error: any) => {
            const errorMsg = error.response?.data?.error || 'An unexpected error occurred. Please try again.';
            if (errorMsg === 'Email not verified') {
                setIsUnverified(true);
            } else {
                setLoginError(errorMsg);
            }
        }
    });

    const onSubmit = (data: LoginForm) => {
        setLoginError(null);
        loginMutation.mutate({ ...data, redirectUrl: requestedRedirect || undefined } as any);
    };

    return (
        <div className="bg-white text-blue-900 min-h-screen flex flex-col antialiased font-sans">
            <main className="flex-grow w-full flex flex-col items-center justify-center px-6 py-12">
                <div className="w-full max-w-[400px]">
                    {/* Navigation Back */}
                    <div className="mb-8">
                        <Link
                            href="/"
                            className="group inline-flex items-center gap-2 text-[10px] font-bold text-blue-400 uppercase tracking-widest hover:text-blue-900 transition-all"
                        >
                            <span className="material-symbols-outlined text-[14px] transition-transform group-hover:-translate-x-1">arrow_back</span>
                            Back to Home
                        </Link>
                    </div>

                    {/* Branding Header */}
                    <div className="mb-10">
                        <Link href="/" className="inline-flex items-center gap-2 text-xl font-bold tracking-tight text-blue-900">
                            BlueCollar
                        </Link>
                        <p className="text-blue-500 mt-1 text-sm">Sign in to your account</p>
                    </div>

                    {/* Form Section */}
                    {user ? (
                        <div className="space-y-8 py-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <div className="text-center space-y-4">
                                <div className="w-20 h-20 bg-blue-900 text-white rounded-3xl mx-auto flex items-center justify-center shadow-xl shadow-blue-900/10">
                                    <span className="material-symbols-outlined text-4xl">how_to_reg</span>
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-blue-900 uppercase tracking-tight">Session Detected</h2>
                                    <p className="text-blue-500 text-[10px] uppercase font-black tracking-widest mt-1">Logged in as {user.fullName}</p>
                                </div>
                                <p className="text-blue-400 text-xs leading-relaxed max-w-[280px] mx-auto uppercase tracking-widest font-bold italic">
                                    An active protocol is already initialized. Would you like to proceed or switch nodes?
                                </p>
                            </div>

                            <div className="space-y-4">
                                <button
                                    onClick={() => {
                                        const target = user.role === CONSTANTS.ROLES.ADMIN
                                            ? CONSTANTS.ROUTES.ADMIN.DASHBOARD
                                            : CONSTANTS.ROUTES.DASHBOARD;
                                        router.push(target);
                                    }}
                                    className="w-full py-4 bg-blue-900 text-white font-bold text-xs uppercase tracking-[0.2em] rounded-lg hover:bg-blue-800 active:scale-[0.98] transition-all duration-200 shadow-lg shadow-blue-900/10"
                                >
                                    Continue to Dashboard
                                </button>
                                <button
                                    onClick={() => logout()}
                                    className="w-full py-4 bg-white border-2 border-red-100 text-red-600 font-bold text-[10px] uppercase tracking-[0.2em] rounded-lg hover:bg-red-50 hover:border-red-200 transition-all active:scale-[0.98]"
                                >
                                    Sign Out and Switch
                                </button>
                            </div>
                        </div>
                    ) : isUnverified ? (
                        <div className="space-y-8 py-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="text-center space-y-4">
                                <div className="w-20 h-20 bg-blue-50 text-blue-900 rounded-3xl mx-auto flex items-center justify-center shadow-xl shadow-blue-900/5">
                                    <span className="material-symbols-outlined text-4xl animate-pulse">mail</span>
                                </div>
                                <h2 className="text-2xl font-bold text-blue-900 uppercase tracking-tight">Verify Your Identity</h2>
                                <p className="text-blue-500 text-xs leading-relaxed max-w-[280px] mx-auto uppercase tracking-widest font-bold italic">
                                    A fresh verification protocol has been dispatched to your inbox. Please secure your account before proceeding.
                                </p>
                            </div>

                            <button
                                onClick={() => setIsUnverified(false)}
                                className="w-full py-4 bg-white border-2 border-blue-900 text-blue-900 font-bold text-[10px] uppercase tracking-[0.2em] rounded-lg hover:bg-blue-50 transition-all active:scale-[0.98]"
                            >
                                Back to Login
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            {loginError && (
                                <div className="bg-red-50 text-red-600 text-[11px] p-3 rounded-lg border border-red-100 flex items-center gap-2 font-bold uppercase tracking-wider">
                                    <span className="material-symbols-outlined text-sm">error</span>
                                    {loginError}
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="block text-[10px] font-bold text-blue-400 uppercase tracking-widest px-1" htmlFor="email">Email</label>
                                <input
                                    {...register('email')}
                                    className={`w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-900/5 transition-all outline-none text-sm font-medium ${errors.email ? 'border-red-300' : 'focus:border-blue-900'}`}
                                    id="email"
                                    placeholder="name@email.com"
                                    type="email"
                                />
                                {errors.email && <p className="text-red-600 text-[10px] font-bold uppercase tracking-tighter px-1">{errors.email.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center px-1">
                                    <label className="block text-[10px] font-bold text-blue-400 uppercase tracking-widest" htmlFor="password">Password</label>
                                    <Link className="text-[10px] font-bold text-blue-400 hover:text-blue-900 uppercase tracking-widest transition-colors" href="/forgot-password">Forgot password?</Link>
                                </div>
                                <div className="relative">
                                    <input
                                        {...register('password')}
                                        className={`w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-900/5 transition-all outline-none text-sm font-medium ${errors.password ? 'border-red-300' : 'focus:border-blue-900'}`}
                                        id="password"
                                        placeholder="••••••••"
                                        type={showPassword ? 'text' : 'password'}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-400 hover:text-blue-900 transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
                                    </button>
                                </div>
                                {errors.password && <p className="text-red-600 text-[10px] font-bold uppercase tracking-tighter px-1">{errors.password.message}</p>}
                            </div>

                            <button
                                type="submit"
                                disabled={loginMutation.isPending}
                                className="w-full py-4 bg-blue-900 text-white font-bold text-xs uppercase tracking-[0.2em] rounded-lg hover:bg-blue-800 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 shadow-lg shadow-blue-900/10"
                            >
                                {loginMutation.isPending ? 'Processing...' : 'Sign In'}
                            </button>
                        </form>
                    )}

                    <div className="mt-10 pt-6 text-center border-t border-blue-50">
                        <p className="text-xs text-blue-500">
                            Don't have an account?
                            <Link href={`${CONSTANTS.ROUTES.REGISTER}${requestedRedirect ? `?redirect=${encodeURIComponent(requestedRedirect)}` : ''}`} className="font-bold text-blue-900 hover:underline ml-1 uppercase tracking-wider text-[11px]">Create Account</Link>
                        </p>
                    </div>
                </div>
            </main>

            <footer className="py-8 px-6 border-t border-blue-50">
                <div className="max-w-[1280px] mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] font-bold text-blue-400 uppercase tracking-widest">
                    <p>© 2026 BlueCollar</p>
                    <div className="flex gap-6">
                        <Link className="hover:text-blue-900 transition-colors" href={CONSTANTS.ROUTES.PRIVACY}>Privacy</Link>
                        <a className="hover:text-blue-900 transition-colors" href="#">Terms</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}


export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-surface flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        }>
            <LoginContent />
        </Suspense>
    );
}

