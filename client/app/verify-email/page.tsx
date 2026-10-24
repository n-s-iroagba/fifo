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
    const [message, setMessage] = useState('Verifying your email...');
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
            setMessage('This verification link is invalid or has expired.');
            return;
        }

        if (data) {
            setStatus('success');
            setMessage(data.message || 'Your email has been verified successfully!');
            const timer = setTimeout(() => router.push(loginUrl), 3000);
            return () => clearTimeout(timer);
        }

        if (error) {
            setStatus('error');
            setMessage((error as any).response?.data?.error || 'Email verification failed. The link may have expired or is invalid.');
        }
    }, [data, error, token, router, loginUrl]);

    const resendMutation = useApiMutation<any, any>('post', '/auth/resend-verification', {
        onSuccess: () => {
            setResendStatus('success');
            setMessage('A new verification link has been sent to your email.');
        },
        onError: (err: any) => {
            setResendStatus('error');
            setMessage(err.response?.data?.error || 'Unable to send verification email. Please try again.');
        }
    });

    const handleResend = () => {
        if (!email.trim()) return;
        setResendStatus('loading');
        resendMutation.mutate({ email, redirectUrl: redirectParam || undefined });
    };

    return (
        <main className="max-w-[448px] w-full space-y-12 text-center">
            <div className="space-y-6">
                <Link href="/" className="text-xl font-bold tracking-tight text-blue-900 block mb-12">
                    BlueCollar
                </Link>
                <div>
                    <div className={`w-20 h-20 rounded-2xl mx-auto flex items-center justify-center transition-all duration-700 shadow-xl ${status === 'loading' ? 'bg-blue-50 text-blue-400 shadow-blue-100' : status === 'success' ? 'bg-blue-900 text-white shadow-blue-900/10' : 'bg-red-50 text-red-600 shadow-red-100'}`}>
                        <span className={`material-symbols-outlined text-4xl ${status === 'loading' ? 'animate-spin' : ''}`}>
                            {status === 'loading' ? 'sync' : status === 'success' ? 'verified' : 'gpp_bad'}
                        </span>
                    </div>
                </div>
                <h1 className="text-3xl font-bold text-blue-900 pt-8 tracking-tight">
                    {status === 'loading' ? 'Verifying Your Email' : status === 'success' ? 'Email Verified' : 'Verification Failed'}
                </h1>
                <p className="text-blue-600 text-xs leading-relaxed max-w-[320px] mx-auto font-medium">
                    {message}
                </p>
            </div>

            {status === 'success' && (
                <p className="text-xs font-semibold text-blue-600 animate-pulse">
                    Redirecting you to sign in...
                </p>
            )}

            {status === 'error' && (
                <div className="space-y-6 pt-4 animate-in fade-in slide-in-from-bottom-4">
                    {resendStatus === 'success' && (
                        <div className="p-4 bg-green-50 border border-green-100 rounded-xl text-green-700 text-xs font-semibold flex items-center gap-3 text-left">
                            <span className="material-symbols-outlined text-base">check_circle</span>
                            A new verification link has been sent. Please check your inbox.
                        </div>
                    )}
                    <div className="space-y-2 text-left">
                        <label className="text-xs font-semibold text-blue-900 px-1 block">Your Email Address</label>
                        <input
                            type="email"
                            placeholder="name@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 focus:bg-white focus:ring-2 focus:ring-blue-900/5 transition-all outline-none text-sm font-medium text-blue-900 placeholder:text-blue-300"
                        />
                    </div>
                    <button
                        onClick={handleResend}
                        disabled={resendStatus === 'loading' || !email.trim()}
                        className="w-full py-4 bg-white border-2 border-blue-900 text-blue-900 rounded-lg font-bold text-xs uppercase tracking-[0.2em] hover:bg-blue-50 transition-all active:scale-[0.98] disabled:opacity-50"
                    >
                        {resendStatus === 'loading' ? 'Sending...' : 'Resend Verification Link'}
                    </button>

                    <div className="mt-6 p-5 bg-blue-50/80 border border-blue-100 rounded-xl text-left flex items-start gap-3 shadow-inner">
                        <span className="material-symbols-outlined text-blue-400 text-xl mt-0.5 animate-pulse">mark_email_unread</span>
                        <div>
                            <p className="text-blue-900 text-xs font-bold mb-1">Check your spam folder</p>
                            <p className="text-blue-600 text-xs leading-relaxed font-normal">
                                If you don't see the email within a couple of minutes, please check your spam or junk folder. Mark our emails as &quot;Not Spam&quot; so you don't miss important updates.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {(status === 'error' || status === 'success') && (
                <Link href={loginUrl} className="block w-full">
                    <button className="w-full py-4 bg-blue-900 text-white rounded-lg font-bold text-xs uppercase tracking-[0.2em] shadow-xl shadow-blue-900/10 hover:bg-blue-800 transition-all active:scale-[0.98]">
                        Go to Sign In
                    </button>
                </Link>
            )}
        </main>
    );
}

export default function VerifyEmailPage() {
    return (
        <div className="min-h-screen bg-white text-blue-900 antialiased flex flex-col items-center justify-center p-8 font-sans">
            <Suspense fallback={<div className="text-xs font-semibold text-blue-400">Verifying...</div>}>
                <VerifyEmailContent />
            </Suspense>

            <footer className="mt-24 py-8 border-t border-blue-50 w-full max-w-[1440px]">
                <div className="flex justify-center flex-col items-center gap-2 text-xs font-medium text-blue-400">
                    <p>© 2026 Blue Collar Recruitment</p>
                    <p>All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
