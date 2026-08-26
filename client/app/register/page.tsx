'use client';

import React, { useState, Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useApiMutation } from '@/lib/hooks';
import { useRouter, useSearchParams } from 'next/navigation';
import { CONSTANTS } from '@/constants';
import Link from 'next/link';

const registerSchema = z.object({
    fullName: z.string().min(1, 'Full name is required'),
    email: z.string().email('Invalid email address'),
    phoneNumber: z.string().min(1, 'Phone number is required'),
    countryOfResidence: z.string().min(1, 'Country of residence is required'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password')
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

type RegisterForm = z.infer<typeof registerSchema>;

function RegisterContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const requestedRedirect = searchParams.get('redirect');
    const [registerError, setRegisterError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const { register, handleSubmit, formState: { errors } } = useForm<RegisterForm>({
        resolver: zodResolver(registerSchema),
    });

    const registerMutation = useApiMutation<Omit<RegisterForm, 'confirmPassword'> & { redirectUrl?: string }, any>('post', '/auth/register', {
        onSuccess: (data: any) => {
            setSuccessMessage("Registration successful! Please check your email to verify your account.");
        },
        onError: (error: any) => {
            const errorMsg = error.response?.data?.error || 'An unexpected error occurred. Please try again.';
            setRegisterError(errorMsg);
        }
    });

    const onSubmit = (data: RegisterForm) => {
        setRegisterError(null);
        setSuccessMessage(null);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { confirmPassword, ...submitData } = data;
        registerMutation.mutate({ ...submitData, redirectUrl: requestedRedirect || undefined } as any);
    };

    return (
        <div className="bg-white text-blue-900 min-h-screen flex flex-col antialiased font-sans">
            <main className="flex-grow w-full flex flex-col items-center justify-center px-6 py-12">
                <div className="w-full max-w-[450px]">
                    <div className="mb-8">
                        <Link
                            href="/"
                            className="group inline-flex items-center gap-2 text-[10px] font-bold text-blue-400 uppercase tracking-widest hover:text-blue-900 transition-all"
                        >
                            <span className="material-symbols-outlined text-[14px] transition-transform group-hover:-translate-x-1">arrow_back</span>
                            Back to Home
                        </Link>
                    </div>

                    <div className="mb-10">
                        <Link href="/" className="inline-flex items-center gap-2 text-xl font-bold tracking-tight text-blue-900">
                            BlueCollar
                        </Link>
                        <p className="text-blue-500 mt-1 text-sm">Create an applicant account</p>
                    </div>

                    {successMessage ? (
                        <div className="space-y-8 py-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="text-center space-y-4">
                                <div className="w-20 h-20 bg-blue-50 text-blue-900 rounded-3xl mx-auto flex items-center justify-center shadow-xl shadow-blue-900/5">
                                    <span className="material-symbols-outlined text-4xl animate-pulse">mail</span>
                                </div>
                                <h2 className="text-2xl font-bold text-blue-900 uppercase tracking-tight">Verify Your Identity</h2>
                                <p className="text-blue-500 text-xs leading-relaxed max-w-[280px] mx-auto uppercase tracking-widest font-bold italic">
                                    {successMessage}
                                </p>
                            </div>

                            <Link
                                href="/login"
                                className="block text-center w-full py-4 bg-white border-2 border-blue-900 text-blue-900 font-bold text-[10px] uppercase tracking-[0.2em] rounded-lg hover:bg-blue-50 transition-all active:scale-[0.98]"
                            >
                                Proceed to Login
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            {registerError && (
                                <div className="bg-red-50 text-red-600 text-[11px] p-3 rounded-lg border border-red-100 flex items-center gap-2 font-bold uppercase tracking-wider">
                                    <span className="material-symbols-outlined text-sm">error</span>
                                    {registerError}
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="block text-[10px] font-bold text-blue-400 uppercase tracking-widest px-1" htmlFor="fullName">Full Name</label>
                                <input
                                    {...register('fullName')}
                                    className={`w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-900/5 transition-all outline-none text-sm font-medium ${errors.fullName ? 'border-red-300' : 'focus:border-blue-900'}`}
                                    id="fullName"
                                    placeholder="John Doe"
                                    type="text"
                                />
                                {errors.fullName && <p className="text-red-600 text-[10px] font-bold uppercase tracking-tighter px-1">{errors.fullName.message}</p>}
                            </div>

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

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-bold text-blue-400 uppercase tracking-widest px-1" htmlFor="phoneNumber">Phone Number</label>
                                    <input
                                        {...register('phoneNumber')}
                                        className={`w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-900/5 transition-all outline-none text-sm font-medium ${errors.phoneNumber ? 'border-red-300' : 'focus:border-blue-900'}`}
                                        id="phoneNumber"
                                        placeholder="+1234567890"
                                        type="text"
                                    />
                                    {errors.phoneNumber && <p className="text-red-600 text-[10px] font-bold uppercase tracking-tighter px-1">{errors.phoneNumber.message}</p>}
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-[10px] font-bold text-blue-400 uppercase tracking-widest px-1" htmlFor="countryOfResidence">Country</label>
                                    <input
                                        {...register('countryOfResidence')}
                                        className={`w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-900/5 transition-all outline-none text-sm font-medium ${errors.countryOfResidence ? 'border-red-300' : 'focus:border-blue-900'}`}
                                        id="countryOfResidence"
                                        placeholder="Australia"
                                        type="text"
                                    />
                                    {errors.countryOfResidence && <p className="text-red-600 text-[10px] font-bold uppercase tracking-tighter px-1">{errors.countryOfResidence.message}</p>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-[10px] font-bold text-blue-400 uppercase tracking-widest px-1" htmlFor="password">Password</label>
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

                            <div className="space-y-2">
                                <label className="block text-[10px] font-bold text-blue-400 uppercase tracking-widest px-1" htmlFor="confirmPassword">Confirm Password</label>
                                <div className="relative">
                                    <input
                                        {...register('confirmPassword')}
                                        className={`w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-900/5 transition-all outline-none text-sm font-medium ${errors.confirmPassword ? 'border-red-300' : 'focus:border-blue-900'}`}
                                        id="confirmPassword"
                                        placeholder="••••••••"
                                        type={showPassword ? 'text' : 'password'}
                                    />
                                </div>
                                {errors.confirmPassword && <p className="text-red-600 text-[10px] font-bold uppercase tracking-tighter px-1">{errors.confirmPassword.message}</p>}
                            </div>

                            <button
                                type="submit"
                                disabled={registerMutation.isPending}
                                className="w-full py-4 bg-blue-900 text-white font-bold text-xs uppercase tracking-[0.2em] rounded-lg hover:bg-blue-800 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 shadow-lg shadow-blue-900/10"
                            >
                                {registerMutation.isPending ? 'Processing...' : 'Create Account'}
                            </button>
                        </form>
                    )}

                    <div className="mt-10 pt-6 text-center border-t border-blue-50">
                        <p className="text-xs text-blue-500">
                            Already have an account?
                            <Link href={`${CONSTANTS.ROUTES.LOGIN}${requestedRedirect ? `?redirect=${encodeURIComponent(requestedRedirect)}` : ''}`} className="font-bold text-blue-900 hover:underline ml-1 uppercase tracking-wider text-[11px]">Sign In</Link>
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

export default function RegisterPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-surface flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        }>
            <RegisterContent />
        </Suspense>
    );
}
