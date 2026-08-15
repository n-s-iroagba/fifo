'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, User, AlertCircle } from 'lucide-react';
import { apiClient } from '../../lib/axios';

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
            setError(err.response?.status === 401 ? 'Invalid LMS username or password.' : 'An error occurred during login. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4 py-16">
            {/* Background texture */}
            <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />

            <div className="relative w-full max-w-md space-y-8">
                {/* Brand */}
                <div className="text-center">
                    <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-[#FFC700] text-black mb-6 mx-auto shadow-2xl shadow-[#FFC700]/20">
                        <Lock className="h-8 w-8 stroke-[3]" />
                    </div>
                    <h1 className="text-4xl font-black text-white tracking-tight">AVELING</h1>
                    <p className="text-xs font-extrabold text-zinc-500 uppercase tracking-[0.4em] mt-2">LMS Training Portal</p>
                    <div className="w-16 h-0.5 bg-[#FFC700] mx-auto mt-4" />
                    <p className="text-sm text-zinc-400 font-medium mt-4">Sign in with your specialized training credentials</p>
                </div>

                {/* Card */}
                <div className="bg-zinc-900 border-2 border-zinc-800 rounded-2xl p-8 shadow-2xl space-y-6">
                    {error && (
                        <div className="flex items-start gap-3 bg-rose-950/50 border border-rose-800 rounded-xl p-4">
                            <AlertCircle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
                            <p className="text-sm text-rose-300 font-medium">{error}</p>
                        </div>
                    )}

                    <form className="space-y-5" onSubmit={handleLogin}>
                        <div>
                            <label className="block text-xs font-extrabold text-zinc-400 uppercase tracking-wider mb-2" htmlFor="username">LMS Username</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    <User className="h-4 w-4 text-zinc-500" />
                                </div>
                                <input
                                    id="username"
                                    name="username"
                                    type="text"
                                    required
                                    placeholder="e.g. Aveling-JOHDOE1234"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full bg-zinc-800 border-2 border-zinc-700 text-white placeholder-zinc-600 rounded-xl pl-10 pr-4 py-3 text-sm font-medium focus:outline-none focus:border-[#FFC700] focus:ring-1 focus:ring-[#FFC700] transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-extrabold text-zinc-400 uppercase tracking-wider mb-2" htmlFor="password">Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    <Lock className="h-4 w-4 text-zinc-500" />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-zinc-800 border-2 border-zinc-700 text-white placeholder-zinc-600 rounded-xl pl-10 pr-4 py-3 text-sm font-medium focus:outline-none focus:border-[#FFC700] focus:ring-1 focus:ring-[#FFC700] transition-all"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-[#FFC700] text-black font-extrabold text-sm py-4 rounded-xl hover:bg-yellow-400 transition-all uppercase tracking-wider shadow-lg shadow-[#FFC700]/20 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
                        >
                            {isLoading ? 'Authenticating...' : 'Sign In to LMS Portal'}
                        </button>
                    </form>
                </div>


            </div>
        </div>
    );
}
