'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useApiMutation } from '@/lib/hooks';
import { useRouter } from 'next/navigation';
import { CONSTANTS } from '@/constants';
import Link from 'next/link';

const registerSchema = z.object({
    fullName: z.string().min(2, 'Full name is required'),
    email: z.string().email('Invalid email address'),
    password: z.string()
        .min(8, 'Min 8 characters')
        .regex(/[A-Z]/, 'One uppercase')
        .regex(/[a-z]/, 'One lowercase')
        .regex(/[0-9]/, 'One number')
        .regex(/[^A-Za-z0-9]/, 'One special character'),
    countryOfResidence: z.string().min(2, 'Country is required'),
    phoneNumber: z.string().min(5, 'Contact number is required'),
    confirmPassword: z.string(),
    agreeTerms: z.boolean().refine(v => v === true, 'You must agree to the terms'),
}).refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
    const router = useRouter();
    const [regError, setRegError] = useState<string | null>(null);
    const [isRegistered, setIsRegistered] = useState(false);
    const [registeredEmail, setRegisteredEmail] = useState('');

    const { register, handleSubmit, formState: { errors } } = useForm<RegisterForm>({
        resolver: zodResolver(registerSchema),
    });

    const registerMutation = useApiMutation<RegisterForm, any>('post', '/auth/register', {
        onSuccess: (data: any, variables) => {
            setRegisteredEmail(variables.email);
            setIsRegistered(true);
        },
        onError: (error: any) => {
            setRegError(error.response?.data?.error || 'Registration failed.');
        }
    });

    const resendMutation = useApiMutation<{ email: string }, any>('post', '/auth/resend-verification', {
        onSuccess: () => {
            console.log('Verification link resent to ' + registeredEmail);
        },
        onError: (err: any) => {
            console.error(err.response?.data?.error || 'Failed to resend link.');
        }
    });

    const handleResend = () => {
        if (registeredEmail) {
            resendMutation.mutate({ email: registeredEmail });
        }
    };

    const onSubmit = (data: RegisterForm) => {
        setRegError(null);
        registerMutation.mutate(data);
    };

    return (
        <div className="bg-white text-blue-900 antialiased min-h-screen flex flex-col font-sans">
            {/* Top Navigation */}
            <header className="fixed top-0 w-full z-50 bg-white border-b border-blue-100 px-8 h-20 flex items-center justify-between">
                <Link href="/" className="text-xl font-black italic uppercase tracking-[0.1em] text-blue-900">BlueCollar</Link>
                <Link href="/login" className="text-[10px] font-bold text-blue-400 hover:text-blue-900 uppercase tracking-widest transition-colors">Sign In</Link>
            </header>

            <main className="flex-grow w-full flex flex-col items-center justify-center pt-32 pb-24 px-6">
                <div className="w-full max-w-[448px]">
                    {isRegistered ? (
                        <div className="text-center space-y-10 py-12">
                            <div className="flex justify-center">
                                <div className="w-20 h-20 rounded-2xl bg-blue-900 text-white flex items-center justify-center shadow-xl shadow-blue-900/10">
                                    <span className="material-symbols-outlined text-4xl">mail</span>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <h2 className="text-3xl font-bold text-blue-900 tracking-tight uppercase">Verify Identity</h2>
                                <p className="text-blue-500 text-sm leading-relaxed max-w-[320px] mx-auto">
                                    We've dispatched a secure verification bridge to <span className="text-blue-900 font-bold">{registeredEmail}</span>. Please authorize your access to continue.
                                </p>
                            </div>
                            <Link href="/login" className="block w-full">
                                <button className="w-full bg-blue-900 text-white py-4 rounded-xl font-bold text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-blue-900/10 hover:bg-blue-800 transition-all active:scale-[0.98]">
                                    Proceed to Login
                                </button>
                            </Link>
                            <div className="text-[10px] font-bold text-blue-400 uppercase tracking-widest leading-loose text-center pt-4">
                                No receipt? <button
                                    onClick={handleResend}
                                    disabled={resendMutation.isPending}
                                    className="text-blue-900 underline disabled:opacity-50 hover:text-blue-700 ml-1"
                                >
                                    {resendMutation.isPending ? 'Propagating...' : 'Trigger Resend'}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-12">
                            <div>
                                <h1 className="text-4xl font-bold text-blue-900 tracking-tight">Access Registry</h1>
                                <p className="text-blue-400 text-[10px] font-bold uppercase tracking-widest mt-2">Initialize your professional presence</p>
                            </div>

                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                                {regError && (
                                    <div className="bg-red-50 text-red-600 text-[10px] p-4 rounded-xl border border-red-100 flex items-center gap-3 font-bold uppercase tracking-widest">
                                        <span className="material-symbols-outlined text-base">error</span>
                                        {regError}
                                    </div>
                                )}

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-blue-400 px-1" htmlFor="fullName">Legal Full Name</label>
                                        <input
                                            {...register('fullName')}
                                            className="w-full bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 focus:bg-white focus:ring-2 focus:ring-blue-900/5 transition-all outline-none text-sm font-bold text-blue-900 placeholder:text-blue-300"
                                            id="fullName"
                                            placeholder="e.g. Elena Rodriguez"
                                            type="text"
                                        />
                                        {errors.fullName && <p className="text-red-600 text-[10px] font-bold px-1 tracking-tight">{errors.fullName.message}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-blue-400 px-1" htmlFor="email">Email Address</label>
                                        <input
                                            {...register('email')}
                                            className="w-full bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 focus:bg-white focus:ring-2 focus:ring-blue-900/5 transition-all outline-none text-sm font-bold text-blue-900 placeholder:text-blue-300"
                                            id="email"
                                            placeholder="name@domain.com"
                                            type="email"
                                        />
                                        {errors.email && <p className="text-red-600 text-[10px] font-bold px-1 tracking-tight">{errors.email.message}</p>}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-blue-400 px-1" htmlFor="countryOfResidence">Country of Residence</label>
                                            <input
                                                {...register('countryOfResidence')}
                                                className="w-full bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 focus:bg-white focus:ring-2 focus:ring-blue-900/5 transition-all outline-none text-sm font-bold text-blue-900 placeholder:text-blue-300"
                                                id="countryOfResidence"
                                                placeholder="e.g. Nigeria"
                                                type="text"
                                            />
                                            {errors.countryOfResidence && <p className="text-red-600 text-[10px] font-bold px-1 tracking-tight">{errors.countryOfResidence.message}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-blue-400 px-1" htmlFor="phoneNumber">Contact Number</label>
                                            <input
                                                {...register('phoneNumber')}
                                                className="w-full bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 focus:bg-white focus:ring-2 focus:ring-blue-900/5 transition-all outline-none text-sm font-bold text-blue-900 placeholder:text-blue-300"
                                                id="phoneNumber"
                                                placeholder="+234 ..."
                                                type="text"
                                            />
                                            {errors.phoneNumber && <p className="text-red-600 text-[10px] font-bold px-1 tracking-tight">{errors.phoneNumber.message}</p>}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-blue-400 px-1" htmlFor="password">Password</label>
                                            <input
                                                {...register('password')}
                                                className="w-full bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 focus:bg-white focus:ring-2 focus:ring-blue-900/5 transition-all outline-none text-sm font-bold text-blue-900 placeholder:text-blue-300"
                                                id="password"
                                                placeholder="••••••••"
                                                type="password"
                                            />
                                            {errors.password && <p className="text-red-600 text-[10px] font-bold px-1 tracking-tight leading-tight">{errors.password.message}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-blue-400 px-1" htmlFor="confirmPassword">Confirm Password</label>
                                            <input
                                                {...register('confirmPassword')}
                                                className="w-full bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 focus:bg-white focus:ring-2 focus:ring-blue-900/5 transition-all outline-none text-sm font-bold text-blue-900 placeholder:text-blue-300"
                                                id="confirmPassword"
                                                placeholder="••••••••"
                                                type="password"
                                            />
                                            {errors.confirmPassword && <p className="text-red-600 text-[10px] font-bold px-1 tracking-tight">{errors.confirmPassword.message}</p>}
                                        </div>
                                    </div>

                                    <div className="px-1 py-2">
                                        <div className="flex items-start gap-4">
                                            <input
                                                {...register('agreeTerms')}
                                                className="mt-1 rounded border-blue-300 text-blue-900 focus:ring-blue-900 h-5 w-5 bg-blue-50 transition-all cursor-pointer"
                                                id="privacy"
                                                type="checkbox"
                                            />
                                            <label className="text-[11px] text-blue-500 font-medium leading-relaxed" htmlFor="privacy">
                                                By registering, you authorize access and agree to the <Link className="text-blue-900 font-bold hover:underline" href={CONSTANTS.ROUTES.PRIVACY}>Privacy Protocol</Link> and Terms of Service.
                                            </label>
                                        </div>
                                        {errors.agreeTerms && <p className="text-red-600 text-[10px] font-bold mt-2 px-1">{errors.agreeTerms.message}</p>}
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={registerMutation.isPending}
                                    className="w-full bg-blue-900 text-white py-4 rounded-xl font-bold text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-blue-900/10 hover:bg-blue-800 transition-all duration-300 active:scale-[0.98] disabled:opacity-50"
                                >
                                    {registerMutation.isPending ? 'Authorizing...' : 'Initialize Registry'}
                                </button>
                            </form>

                            <div className="pt-8 border-t border-blue-50 text-center">
                                <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">
                                    Already part of the network? <Link className="text-blue-900 hover:underline ml-1" href={CONSTANTS.ROUTES.LOGIN}>Sign In</Link>
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            <footer className="py-12 px-8 border-t border-blue-50 mt-auto">
                <div className="flex flex-col md:flex-row justify-between items-center max-w-[1440px] mx-auto gap-6 text-[9px] font-bold text-blue-400 uppercase tracking-widest">
                    <p>© 2026 JOBNEXE ENTERPRISE</p>
                    <div className="flex gap-10">
                        <Link className="hover:text-blue-900 transition-colors" href={CONSTANTS.ROUTES.PRIVACY}>Data Protection</Link>
                        <a className="hover:text-blue-900 transition-colors" href="#">Support</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
