'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, User, AlertCircle, ShieldCheck, ArrowLeft } from 'lucide-react';
import { apiClient } from '@/lib/axios';

export default function LmsLogin() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const response = await apiClient.post('/lms-auth/login', { lmsUsername: username, password });
            if (response.data?.success) {
                const { accessToken, user } = response.data.data;
                localStorage.setItem('lms_token', accessToken);
                localStorage.setItem('lms_user', JSON.stringify(user));
                router.push('/dashboard');
            }
        } catch (err: any) {
            setError(err.response?.status === 401 ? 'Invalid LMS username or password.' : 'An error occurred during authentication. Please check your credentials and try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0f172a] px-4 py-16 relative overflow-hidden">
            {/* Subtle background grid */}
            <div
                className="absolute inset-0 opacity-10 pointer-events-none"
                style={{
                    backgroundImage: 'radial-gradient(circle at 2px 2px, #94a3b8 1px, transparent 0)',
                    backgroundSize: '36px 36px'
                }}
            />

            <div className="relative w-full max-w-md space-y-6">
                {/* Back to home link */}
                <div className="text-left">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" /> Back to CertHero RTO Portal
                    </Link>
                </div>

                {/* Brand Header */}
                <div className="text-center">
                    <img
                        src="/certhero-logo.png"
                        alt="CertHero RTO"
                        className="inline-block h-16 w-16 rounded-2xl object-contain mb-5 mx-auto bg-white p-1 shadow-xl shadow-[#ED9139]/20"
                    />
                    <h1 className="text-3xl font-black text-white tracking-tight">
                        Cert<span className="text-[#ED9139]">Hero</span>
                    </h1>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                        Registered Training Organisation LMS
                    </p>
                    <div className="w-12 h-1 bg-[#ED9139] mx-auto mt-3 rounded-full" />
                    <p className="text-xs text-slate-400 font-medium mt-3">
                        Sign in with your assigned training credentials
                    </p>
                </div>

                {/* Login Card */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-7 shadow-2xl space-y-5">
                    {error && (
                        <div className="flex items-start gap-3 bg-rose-950/60 border border-rose-800/80 rounded-xl p-3.5">
                            <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                            <p className="text-xs text-rose-300 font-medium">{error}</p>
                        </div>
                    )}

                    <form className="space-y-4" onSubmit={handleLogin}>
                        <div>
                            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2" htmlFor="username">
                                LMS Username
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    <User className="h-4 w-4 text-slate-500" />
                                </div>
                                <input
                                    id="username"
                                    name="username"
                                    type="text"
                                    required
                                    placeholder="e.g. CERTHERO-JOHDOE1234"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full bg-slate-800/90 border border-slate-700 text-white placeholder-slate-500 rounded-xl pl-10 pr-4 py-3 text-xs font-medium focus:outline-none focus:border-[#ED9139] focus:ring-1 focus:ring-[#ED9139] transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2" htmlFor="password">
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    <Lock className="h-4 w-4 text-slate-500" />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-slate-800/90 border border-slate-700 text-white placeholder-slate-500 rounded-xl pl-10 pr-4 py-3 text-xs font-medium focus:outline-none focus:border-[#ED9139] focus:ring-1 focus:ring-[#ED9139] transition-all"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-[#ED9139] hover:bg-[#dd7f26] text-[#0f172a] font-bold text-xs py-3.5 rounded-xl transition-all uppercase tracking-wider shadow-lg shadow-[#ED9139]/20 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
                        >
                            {isLoading ? 'Verifying Credentials...' : 'Sign In to LMS Portal'}
                        </button>
                    </form>

                    <div className="pt-3 border-t border-slate-800 text-center">
                        <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400">
                            <ShieldCheck className="h-3.5 w-3.5 text-[#ED9139]" />
                            <span>Encrypted ASQA Accredited Training Session</span>
                        </div>
                    </div>
                </div>

                <div className="text-center text-[11px] text-slate-400">
                    <p>
                        Credentials issued via sponsor notification email. If you have not received credentials, contact candidate support.
                    </p>
                </div>
            </div>
        </div>
    );
}
