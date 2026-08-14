'use client';

import React, { useState } from 'react';

interface AvelingCredentialsCardProps {
    username?: string | null;
    password?: string | null;
    ticketType?: string;
    courseId?: string;
    avelingUrl?: string;
}

export function AvelingCredentialsCard({
    username,
    password,
    ticketType,
    courseId,
    avelingUrl,
}: AvelingCredentialsCardProps) {
    const [copiedField, setCopiedField] = useState<'username' | 'password' | null>(null);

    if (!username && !password) return null;

    const copyToClipboard = (text: string, field: 'username' | 'password') => {
        navigator.clipboard.writeText(text);
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000);
    };

    const targetUrl = avelingUrl || (typeof window !== 'undefined'
        ? (`${window.location.protocol}//${window.location.hostname}:3002/login`)
        : 'https://aveling.online/login');

    return (
        <div className="bg-gradient-to-br from-blue-950 via-blue-900 to-slate-900 text-white p-8 rounded-[2.5rem] shadow-2xl shadow-blue-950/20 border border-blue-800/50 space-y-6 relative overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-blue-800/60 pb-5">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 shadow-inner">
                        <span className="material-symbols-outlined text-2xl">school</span>
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-[9px] font-black uppercase tracking-[0.25em] text-emerald-400">Aveling LMS Training Portal</span>
                            <span className="px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest bg-emerald-500 text-slate-950">Active Credentials</span>
                        </div>
                        <h3 className="text-lg font-black uppercase tracking-tight text-white mt-0.5">
                            {ticketType ? `${ticketType} Course Access` : 'Candidate Login Credentials'}
                        </h3>
                    </div>
                </div>

                {courseId && (
                    <div className="self-start sm:self-auto px-3 py-1.5 rounded-xl bg-blue-900/80 border border-blue-700/50 text-[10px] font-bold text-blue-200 uppercase tracking-wider">
                        Course Code: <span className="font-mono text-white font-black">{courseId}</span>
                    </div>
                )}
            </div>

            {/* Credentials Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Username / Candidate ID Box */}
                <div className="bg-blue-900/40 backdrop-blur-md p-5 rounded-2xl border border-blue-700/40 relative group hover:border-emerald-500/50 transition-all">
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-300 block mb-1">
                        Candidate ID / Aveling Username
                    </span>
                    <div className="flex items-center justify-between gap-2 mt-1">
                        <span className="font-mono text-sm font-black text-emerald-300 tracking-wider select-all break-all">
                            {username || 'N/A'}
                        </span>
                        {username && (
                            <button
                                type="button"
                                onClick={() => copyToClipboard(username, 'username')}
                                className="px-3 py-1.5 rounded-xl bg-blue-800/80 hover:bg-emerald-500 hover:text-slate-950 text-blue-200 text-[9px] font-bold uppercase tracking-widest transition-all shrink-0 flex items-center gap-1 border border-blue-600/50"
                            >
                                <span className="material-symbols-outlined text-xs">
                                    {copiedField === 'username' ? 'check' : 'content_copy'}
                                </span>
                                {copiedField === 'username' ? 'Copied' : 'Copy'}
                            </button>
                        )}
                    </div>
                </div>

                {/* Password Box */}
                <div className="bg-blue-900/40 backdrop-blur-md p-5 rounded-2xl border border-blue-700/40 relative group hover:border-emerald-500/50 transition-all">
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-300 block mb-1">
                        LMS Login Password
                    </span>
                    <div className="flex items-center justify-between gap-2 mt-1">
                        <span className="font-mono text-sm font-black text-amber-300 tracking-wider select-all break-all">
                            {password || 'N/A'}
                        </span>
                        {password && (
                            <button
                                type="button"
                                onClick={() => copyToClipboard(password, 'password')}
                                className="px-3 py-1.5 rounded-xl bg-blue-800/80 hover:bg-emerald-500 hover:text-slate-950 text-blue-200 text-[9px] font-bold uppercase tracking-widest transition-all shrink-0 flex items-center gap-1 border border-blue-600/50"
                            >
                                <span className="material-symbols-outlined text-xs">
                                    {copiedField === 'password' ? 'check' : 'content_copy'}
                                </span>
                                {copiedField === 'password' ? 'Copied' : 'Copy'}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Candidate Instructions */}
            <div className="bg-blue-900/30 border border-blue-800/40 rounded-2xl p-5 space-y-3">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-200 flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm text-emerald-400">format_list_numbered</span>
                    How to Access Your Training Course
                </h4>
                <ol className="space-y-2 text-xs text-blue-100/90 leading-relaxed font-medium">
                    <li className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">1</span>
                        <span>Click <strong>Launch Aveling LMS Portal</strong> below to open the official training login page.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">2</span>
                        <span>Enter your Candidate ID (<code className="bg-blue-950 px-1.5 py-0.5 rounded text-emerald-300 font-mono text-[11px]">{username}</code>) and Password (<code className="bg-blue-950 px-1.5 py-0.5 rounded text-amber-300 font-mono text-[11px]">{password}</code>).</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">3</span>
                        <span>Complete your theory materials and take your auto-scored exam. Upon passing, your ticket status updates automatically on your recruiter dashboard!</span>
                    </li>
                </ol>
            </div>

            {/* Launch Button */}
            <div className="pt-2">
                <a
                    href={targetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 py-4 px-6 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-3 active:scale-[0.99]"
                >
                    <span>Launch Aveling LMS Portal</span>
                    <span className="material-symbols-outlined text-base">open_in_new</span>
                </a>
            </div>
        </div>
    );
}
