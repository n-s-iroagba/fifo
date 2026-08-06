'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useApiMutation, useApiQuery } from '@/lib/hooks';
import { CONSTANTS } from '@/constants';
import Link from 'next/link';

function VerifyEmailContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get('token');
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('Synchronizing Verification Tokens...');
    const [email, setEmail] = useState('');
    const [resendStatus, setResendStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

    const rawRedirect = searchParams.get('returnTo') || searchParams.get('redirect');
    const redirectParam = rawRedirect
        ? (rawRedirect.startsWith('/jobs/') ? rawRedirect.replace('/jobs/', '/dashboard/jobs/') : rawRedirect)
        : null;

    const loginUrl = `/login${redirectParam ? `?redirect=${encodeURIComponent(redirectParam)}` : ''}`;

    const { data, error } = useApiQuery<any>(
        ['auth', 'verify-email', token || ''],
        `/auth/verify-email?token=${token}`,
        { enabled: !!token }
    );

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('Missing Protocol Token.');
            return;
        }

        if (data) {
            setStatus('success');
            setMessage(data.message || 'Identity verified successfully.');
            const timer = setTimeout(() => router.push(loginUrl), 3000);
            return () => clearTimeout(timer);
        }

        if (error) {
            setStatus('error');
            setMessage((error as any).response?.data?.error || 'Verification failed. Bridge link may be expired.');
        }
    }, [data, error, token, router, loginUrl]);

    const resendMutation = useApiMutation<any, any>('post', '/auth/resend-verification', {
        onSuccess: () => {
            setResendStatus('success');
            setMessage('A new verification protocol has been dispatched to your email.');
        },
        onError: (err: any) => {
            setResendStatus('error');
            setMessage(err.response?.data?.error || 'Failed to dispatch new link.');
        }
    });

    const handleResend = () => {
        if (!email.trim()) return;
        setResendStatus('loading');
        resendMutation.mutate({ email });
    };

    return (
        <main className="max-w-[448px] w-full space-y-12 text-center">
            <div className="space-y-6">
                <Link href="/" className="text-xl font-black italic uppercase tracking-[0.1em] text-blue-900 block mb-12">
                    BlueCollar
                </Link>
                <div>
                    <div className={`w-20 h-20 rounded-2xl mx-auto flex items-center justify-center transition-all duration-700 shadow-xl ${status === 'loading' ? 'bg-blue-50 text-blue-300 shadow-blue-100' : status === 'success' ? 'bg-blue-900 text-white shadow-blue-900/10' : 'bg-red-50 text-red-600 shadow-red-100'}`}>
                        <span className={`material-symbols-outlined text-4xl ${status === 'loading' ? 'animate-spin' : ''}`}>
                            {status === 'loading' ? 'sync' : status === 'success' ? 'verified' : 'gpp_bad'}
                        </span>
                    </div>
                </div>
                <h1 className="text-3xl font-bold text-blue-900 pt-8 uppercase tracking-tight">
                    {status === 'loading' ? 'Verifying Profile' : status === 'success' ? 'Identity Secured' : 'Access Denied'}
                </h1>
                <p className="text-blue-400 text-[10px] font-bold uppercase tracking-widest leading-relaxed max-w-[280px] mx-auto italic">
                    {message}
                </p>
            </div>

            {status === 'success' && (
                <p className="text-[9px] font-black text-blue-900 uppercase tracking-widest animate-pulse">
                    Routing to Authentication Gateway...
                </p>
            )}

            {status === 'error' && (
                <div className="space-y-6 pt-4 animate-in fade-in slide-in-from-bottom-4">
                    {resendStatus === 'success' && (
                        <div className="p-4 bg-green-50 border border-green-100 rounded-xl text-green-600 text-[10px] font-bold uppercase tracking-widest flex items-center gap-3">
                            <span className="material-symbols-outlined text-base">check_circle</span>
                            A new pulse has been dispatched. Check your inbox.
                        </div>
                    )}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-blue-400 px-1 text-left block">Recovery Email</label>
                        <input
                            type="email"
                            placeholder="operator@domain.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 focus:bg-white focus:ring-2 focus:ring-blue-900/5 transition-all outline-none text-sm font-bold text-blue-900 placeholder:text-blue-300"
                        />
                    </div>
                    <button
                        onClick={handleResend}
                        disabled={resendStatus === 'loading' || !email.trim()}
                        className="w-full py-4 bg-white border-2 border-blue-900 text-blue-900 rounded-xl font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-blue-50 transition-all active:scale-[0.98] disabled:opacity-50"
                    >
                        {resendStatus === 'loading' ? 'Dispatching...' : 'Request New Link'}
                    </button>
                </div>
            )}

            {(status === 'error' || status === 'success') && (
                <Link href={loginUrl} className="block w-full">
                    <button className="w-full py-4 bg-blue-900 text-white rounded-xl font-bold text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-blue-900/10 hover:bg-blue-800 transition-all active:scale-[0.98]">
                        Return to Login
                    </button>
                </Link>
            )}
        </main>
    );
}

export default function VerifyEmailPage() {
    return (
        <div className="min-h-screen bg-white text-blue-900 antialiased flex flex-col items-center justify-center p-8 font-sans">
            <Suspense fallback={<div className="text-[10px] font-bold uppercase tracking-widest text-blue-400">Initializing Core...</div>}>
                <VerifyEmailContent />
            </Suspense>

            <footer className="mt-24 py-12 border-t border-blue-50 w-full max-w-[1440px]">
                <div className="flex justify-center flex-col items-center gap-4">
                    <p className="text-blue-300 text-[9px] font-bold uppercase tracking-[0.3em]">© 2026 JOBNEXE ENTERPRISE</p>
                </div>
            </footer>
        </div>
    );
}
