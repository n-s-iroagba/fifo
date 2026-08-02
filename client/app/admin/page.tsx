'use client';

import { useApiQuery } from '@/lib/hooks';
import Link from 'next/link';
import { CONSTANTS } from '@/constants';

export default function AdminDashboardPage() {
    const { data: apps, isLoading: appsLoading } = useApiQuery<any>(['admin', 'apps', 'summary'], '/admin/applications?limit=5');
    const { data: unverified } = useApiQuery<any>(['admin', 'payments', 'unverified'], '/admin/payments/unverified');
    const { data: unpaid } = useApiQuery<any>(['admin', 'payments', 'unpaid'], '/admin/payments/unpaid');
    const { data: health } = useApiQuery<any>(['admin', 'health'], '/admin/health');
    const { data: users } = useApiQuery<any>(['admin', 'users', 'total'], '/admin/users?limit=1');

    const appCount = apps?.count || 0;
    const unpaidCount = unpaid?.count || 0;
    const unverifiedCount = unverified?.rows?.length || unverified?.length || 0;
    const totalUsers = users?.count || 0;

    return (
        <div className="flex flex-col min-h-screen bg-[#fafbfc] selection:bg-blue-600/10 selection:text-blue-700 font-sans antialiased text-blue-900">
            {/* Header */}
            <header className="h-20 px-6 md:px-12 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-xl z-40 border-b border-blue-50/50">
                <div className="min-w-0">
                    <h2 className="text-lg md:text-xl font-black tracking-tight text-blue-900 uppercase italic">Control Terminal</h2>
                    <p className="text-blue-400 text-[9px] font-bold uppercase tracking-[0.3em] truncate opacity-80">System & Database Status</p>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                    <div className="flex items-center gap-2.5 bg-white px-3 md:px-4 py-1.5 md:py-2 rounded-full border border-blue-100 shadow-sm">
                        <span className={`w-2 h-2 rounded-full ${health?.database?.status === 'Connected' ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-red-500'}`}></span>
                        <span className="text-[9px] font-black uppercase tracking-widest text-blue-900 hidden md:block">
                            {health?.database?.status === 'Connected' ? 'Database Online' : 'Database Offline'}
                        </span>
                        <span className="text-[9px] font-black uppercase tracking-widest text-blue-900 md:hidden">Live</span>
                    </div>
                </div>
            </header>

            <div className="p-6 md:p-12 space-y-12 max-w-[1400px]">
                {/* Stats Grid */}
                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Summary Card 1: Applications */}
                    <div className="bg-white p-8 rounded-2xl border border-blue-50/50 shadow-2xl shadow-blue-900/[0.02] flex flex-col justify-between h-44 relative overflow-hidden group">
                        <div className="absolute right-0 top-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-700">
                            <span className="material-symbols-outlined text-8xl font-black">inventory_2</span>
                        </div>
                        <div className="relative z-10">
                            <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] block mb-2">Applicant Records</span>
                            <h3 className="text-5xl font-black tracking-tighter text-blue-900 italic leading-none">{appCount.toString().padStart(2, '0')}</h3>
                        </div>
                        <div className="mt-auto flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-blue-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-900"></span>
                            {totalUsers} Registered Users
                        </div>
                    </div>

                    {/* Summary Card 2: Unpaid */}
                    <div className="bg-white p-8 rounded-2xl border border-blue-50/50 shadow-2xl shadow-blue-900/[0.02] flex flex-col justify-between h-44 relative overflow-hidden group">
                        <div className="absolute right-0 top-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-700 text-red-500">
                            <span className="material-symbols-outlined text-8xl font-black">payments</span>
                        </div>
                        <div className="relative z-10">
                            <span className="text-[10px] font-black text-red-400 uppercase tracking-[0.3em] block mb-2">Payment Queue</span>
                            <h3 className="text-5xl font-black tracking-tighter text-blue-900 italic leading-none">{unpaidCount.toString().padStart(2, '0')}</h3>
                        </div>
                        <div className="mt-auto flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-red-400">
                            <span className={`w-1.5 h-1.5 rounded-full ${unpaidCount > 0 ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`}></span>
                            {unpaidCount > 0 ? 'Action Required' : 'Ledger Clean'}
                        </div>
                    </div>

                    {/* Summary Card 3: Unverified */}
                    <div className="bg-white p-8 rounded-2xl border border-blue-50/50 shadow-2xl shadow-blue-900/[0.02] flex flex-col justify-between h-44 relative overflow-hidden group">
                        <div className="absolute right-0 top-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-700 text-blue-500">
                            <span className="material-symbols-outlined text-8xl font-black">gavel</span>
                        </div>
                        <div className="relative z-10">
                            <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] block mb-2">Verification Queue</span>
                            <h3 className="text-5xl font-black tracking-tighter text-blue-900 italic leading-none">{unverifiedCount.toString().padStart(2, '0')}</h3>
                        </div>
                        <div className="mt-auto flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-blue-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                            Pending Verification
                        </div>
                    </div>
                </section>

                {/* Operations Layer */}
                <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* System Health Widget */}
                    <div className="lg:col-span-4 bg-white rounded-2xl border border-blue-50/50 p-8 shadow-2xl shadow-blue-900/[0.02]">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-900 mb-10 flex items-center gap-3">
                            <span className="material-symbols-outlined text-xl text-emerald-500">health_and_safety</span>
                            Health Matrix
                        </h4>

                        <div className="space-y-12">
                            {/* Sync Status */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-end">
                                    <span className="text-[9px] font-bold text-blue-400 uppercase tracking-widest">Database Status</span>
                                    <span className={`text-[10px] font-black uppercase italic ${health?.database?.status === 'Connected' ? 'text-emerald-500' : 'text-red-500'}`}>
                                        {health?.database?.status === 'Connected' ? 'Active' : 'Disconnected'}
                                    </span>
                                </div>
                                <div className="h-1 w-full bg-blue-50 rounded-full overflow-hidden">
                                    <div className={`h-full bg-emerald-500 transition-all duration-700 ${health?.database?.status === 'Connected' ? 'w-full' : 'w-0'}`}></div>
                                </div>
                            </div>

                            {/* Memory */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-end">
                                    <span className="text-[9px] font-bold text-blue-400 uppercase tracking-widest">Memory Distribution</span>
                                    <span className="text-[10px] font-black uppercase text-blue-900 italic">
                                        {health?.memoryUsage ? `${(health.memoryUsage.heapUsedMb / health.memoryUsage.heapTotalMb * 100).toFixed(0)}% Utilized` : 'Cold'}
                                    </span>
                                </div>
                                <div className="h-1 w-full bg-blue-50 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-blue-900 transition-all duration-1000"
                                        style={{ width: health?.memoryUsage ? `${(health.memoryUsage.heapUsedMb / health.memoryUsage.heapTotalMb * 100).toFixed(0)}%` : '0%' }}
                                    ></div>
                                </div>
                            </div>

                            {/* Uptime */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-end">
                                    <span className="text-[9px] font-bold text-blue-400 uppercase tracking-widest">System Uptime</span>
                                    <span className="text-[10px] font-black uppercase text-blue-900 italic">
                                        {health?.serverUptime ? `${(health.serverUptime / 3600).toFixed(1)}h Active` : 'Online'}
                                    </span>
                                </div>
                                <div className="h-1 w-full bg-blue-50 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-300 w-full"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Operational Logs */}
                    <div className="lg:col-span-8 bg-white rounded-2xl border border-blue-50/50 p-8 shadow-2xl shadow-blue-900/[0.02]">


                        <div className="space-y-1 relative">
                            {apps?.rows?.length > 0 ? (
                                <div className="relative">
                                    <div className="absolute left-1.5 top-0 bottom-0 w-px bg-blue-50"></div>
                                    {apps.rows.map((app: any, i: number) => (
                                        <div key={app.id} className="relative pl-10 pb-10 last:pb-0 group">
                                            <div className="absolute left-0 top-0 w-3 h-3 rounded-full border-2 border-white bg-blue-100 group-hover:bg-blue-900 transition-colors z-10 shadow-sm"></div>
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-2">
                                                <p className="text-[11px] font-black text-blue-900 uppercase tracking-tight">Application received</p>
                                                <span className="text-[8px] font-bold text-blue-400 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded">
                                                    {new Date(app.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <p className="text-[12px] text-blue-500 font-medium leading-relaxed max-w-2xl">
                                                User <span className="text-blue-900 font-bold italic">{app.User?.fullName}</span> has submitted a new job application for <span className="text-blue-900 font-bold underline decoration-blue-100 underline-offset-4">{app.JobListing?.title}</span>.
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-20 text-center flex flex-col items-center">
                                    <span className="material-symbols-outlined text-4xl text-blue-100 mb-4">stream</span>
                                    <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Stream Idle • No Active Sequence</p>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* Support Matrix Banner */}
                <section className="bg-blue-900 p-10 md:p-16 rounded-3xl relative overflow-hidden shadow-2xl shadow-blue-900/10">
                    <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-white/5 to-transparent skew-x-12 transform translate-x-32"></div>
                    <div className="relative z-10 max-w-2xl">
                        <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.4em] block mb-6">Executive Summary</span>
                        <h4 className="text-2xl md:text-3xl font-black text-white italic tracking-tighter mb-8 leading-tight">
                            System managing {appCount} active job applications across {totalUsers} registered candidates.
                        </h4>
                        <div className="flex flex-wrap gap-8">
                            <div className="space-y-1">
                                <p className="text-[9px] font-bold text-blue-400 uppercase tracking-widest">Critical Action Items</p>
                                <p className="text-sm font-black text-white uppercase tracking-widest">{unverifiedCount > 0 ? `${unverifiedCount} UNVERIFIED` : 'ALL CLEAR'}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[9px] font-bold text-blue-400 uppercase tracking-widest">Payment Status</p>
                                <p className="text-sm font-black text-white uppercase tracking-widest">{unpaidCount > 0 ? `${unpaidCount} PENDING` : 'SETTLED'}</p>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
