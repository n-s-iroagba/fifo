'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useApiMutation } from '@/lib/hooks';
import { useRouter } from 'next/navigation';
import { CONSTANTS } from '@/constants';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

const registerSchema = z.object({
    fullName: z.string().min(2, 'Full name is required'),
    email: z.string().email('Invalid email address'),
    password: z.string()
        .min(8, 'Min 8 characters')
        .regex(/[A-Z]/, 'One uppercase')
        .regex(/[a-z]/, 'One lowercase')
        .regex(/[0-9]/, 'One number')
        .regex(/[^A-Za-z0-9]/, 'One special character'),
    confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function AdminRegisterPage() {
    const router = useRouter();
    const { login } = useAuth();
    const [regError, setRegError] = useState<string | null>(null);

    const { register, handleSubmit, formState: { errors } } = useForm<RegisterForm>({
        resolver: zodResolver(registerSchema),
    });

    const registerMutation = useApiMutation<RegisterForm, any>('post', '/auth/register-admin', {
        onSuccess: (data: any) => {
            login(data.accessToken, data.user);
            router.push(CONSTANTS.ROUTES.ADMIN.DASHBOARD);
        },
        onError: (error: any) => {
            setRegError(error.response?.data?.error || 'Registration failed.');
            console.error(error);
        }
    });

    const onSubmit = (data: RegisterForm) => {
        setRegError(null);
        registerMutation.mutate(data);
    };

    return (
        <div className="bg-white text-blue-900 antialiased min-h-screen flex flex-col font-sans">
            {/* Header */}
            <header className="h-20 px-8 lg:px-16 flex items-center border-b border-blue-100 sticky top-0 bg-white z-50 justify-between">
                <Link href="/" className="flex items-center gap-1">
                    <span className="text-xl font-black italic uppercase tracking-[0.1em] text-blue-900">BlueCollar</span>
                </Link>
                <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-blue-900"></span>
                    <span className="text-[10px] font-bold text-blue-900 uppercase tracking-widest">Administrative Portal</span>
                </div>
            </header>

            <main className="flex-grow flex items-center justify-center p-8 lg:p-24 bg-blue-50/50">
                <div className="max-w-[1200px] w-full grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
                    {/* Brand Messaging */}
                    <div className="hidden lg:block space-y-8">
                        <div>
                            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.3em] block mb-4">Governance & Operations</span>
                            <h1 className="text-5xl font-extrabold tracking-tight text-blue-900 leading-tight">
                                Orchestrate human capital at <span className="italic">scale.</span>
                            </h1>
                        </div>
                        <p className="text-blue-500 text-lg font-medium leading-relaxed max-w-[440px]">
                            Join the BlueCollar control plane to manage institutional grade talent acquisitions and automated pipeline logistics.
                        </p>
                        <div className="flex items-center gap-4 pt-10 border-t border-blue-200">
                            <div className="flex -space-x-3">
                                {[1, 2, 3].map(i => <div key={i} className="w-10 h-10 rounded-full bg-blue-200 border-2 border-white shadow-sm"></div>)}
                            </div>
                            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Verified Controller Network</span>
                        </div>
                    </div>

                    {/* Registry Form */}
                    <div className="w-full max-w-[480px] mx-auto lg:mx-0 bg-white p-10 md:p-14 rounded-[2.5rem] shadow-2xl shadow-blue-900/5 border border-blue-100">
                        <div className="mb-12">
                            <h2 className="text-3xl font-bold text-blue-900 tracking-tight mb-2 uppercase">Create Admin</h2>
                            <p className="text-blue-400 text-[10px] font-bold uppercase tracking-widest leading-relaxed">System Operator Registration & Identity Provision</p>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                            {regError && (
                                <div className="bg-red-50 text-red-600 text-[10px] p-4 rounded-xl border border-red-100 font-bold uppercase tracking-widest flex items-center gap-3">
                                    <span className="material-symbols-outlined text-base">error</span>
                                    {regError}
                                </div>
                            )}

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-blue-400 px-1" htmlFor="fullName">Full Name</label>
                                    <input
                                        {...register('fullName')}
                                        className="w-full bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 focus:bg-white focus:ring-2 focus:ring-blue-900/5 transition-all outline-none text-sm font-bold text-blue-900 placeholder:text-blue-300"
                                        id="fullName"
                                        placeholder="Identity Label"
                                        type="text"
                                    />
                                    {errors.fullName && <p className="text-red-600 text-[10px] font-bold px-1 tracking-tight">{errors.fullName.message}</p>}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-blue-400 px-1" htmlFor="email">Email</label>
                                    <input
                                        {...register('email')}
                                        className="w-full bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 focus:bg-white focus:ring-2 focus:ring-blue-900/5 transition-all outline-none text-sm font-bold text-blue-900 placeholder:text-blue-300"
                                        id="email"
                                        placeholder="operator@curator.io"
                                        type="email"
                                    />
                                    {errors.email && <p className="text-red-600 text-[10px] font-bold px-1 tracking-tight">{errors.email.message}</p>}
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
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-blue-400 px-1" htmlFor="confirmPassword">Confirm password</label>
                                        <input
                                            {...register('confirmPassword')}
                                            className="w-full bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 focus:bg-white focus:ring-2 focus:ring-blue-900/5 transition-all outline-none text-sm font-bold text-blue-900 placeholder:text-blue-300"
                                            id="confirmPassword"
                                            placeholder="••••••••"
                                            type="password"
                                        />
                                    </div>
                                </div>
                                {errors.password && <p className="text-red-600 text-[10px] font-bold px-1 tracking-tight">{errors.password.message}</p>}
                                {errors.confirmPassword && <p className="text-red-600 text-[10px] font-bold px-1 tracking-tight">{errors.confirmPassword.message}</p>}
                            </div>

                            <button
                                type="submit"
                                disabled={registerMutation.isPending}
                                className="w-full py-4 bg-blue-900 text-white rounded-xl font-bold text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-blue-900/20 hover:bg-blue-800 transition-all active:scale-[0.98] disabled:opacity-50 mt-4"
                            >
                                {registerMutation.isPending ? 'Provisioning Identity...' : 'Initialize Controller Registry'}
                            </button>
                        </form>

                        <div className="text-center pt-10 border-t border-blue-50 mt-10">
                            <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">
                                Authorized Operator? <Link className="text-blue-900 hover:underline ml-1" href={CONSTANTS.ROUTES.LOGIN}>Authenticate</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="py-12 flex items-center justify-center border-t border-blue-100 bg-white">
                <p className="text-blue-400 text-[9px] font-bold uppercase tracking-[0.3em]">© 2026 JOBNEXE ENTERPRISE • ADMINISTRATIVE ZONE</p>
            </footer>
        </div>
    );
}
