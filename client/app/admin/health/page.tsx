'use client';

import React from 'react';
import { useApiQuery } from '@/lib/hooks';

export default function SystemHealthDashboardPage() {
    const { data: healthVars, isLoading } = useApiQuery<any>(['admin', 'health'], '/admin/health');

    const formatUptime = (seconds: number) => {
        const d = Math.floor(seconds / (3600 * 24));
        const h = Math.floor((seconds % (3600 * 24)) / 3600);
        return { days: d, hours: h };
    };

    const metrics = healthVars ? {
        cpu: { usage: 0 }, // Backend doesn't provide real-time CPU yet
        ram: {
            usage: (healthVars.memoryUsage?.heapUsedMb / 1024).toFixed(2),
            total: (healthVars.memoryUsage?.heapTotalMb / 1024).toFixed(2)
        },
        uptime: formatUptime(healthVars.serverUptime || 0),
        requests: { active: 0, rate: 0 },
        db: healthVars.database?.status || 'Unknown'
    } : {
        cpu: { usage: 0 },
        ram: { usage: 0, total: 1 },
        uptime: { days: 0, hours: 0 },
        requests: { active: 0, rate: 0 },
        db: 'Searching...'
    };

    if (isLoading) return <div className="p-12 text-center text-[10px] font-bold uppercase tracking-widest text-blue-400">Loading System Metrics...</div>;

    return (
        <div className="font-sans text-blue-900">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                <div>
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.2em] block mb-2">Operations Center</span>
                    <h1 className="text-3xl font-bold text-blue-900 tracking-tight">System Health</h1>
                </div>
                <div className="flex items-center gap-3 px-6 py-2 bg-blue-50 border border-blue-100 rounded-lg">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span className="text-[10px] font-bold text-blue-900 uppercase tracking-widest">System Online</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                <div className="bg-white p-8 rounded-2xl border border-blue-100 shadow-sm">
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest block mb-6">Processor Usage</span>
                    <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold text-blue-900 tracking-tight">{metrics.cpu.usage}%</span>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-2xl border border-blue-100 shadow-sm">
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest block mb-6">Memory Usage</span>
                    <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold text-blue-900 tracking-tight">{metrics.ram.usage}GB</span>
                        <span className="text-blue-400 text-[10px] font-bold uppercase tracking-widest">/ {metrics.ram.total}GB</span>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-2xl border border-blue-100 shadow-sm">
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest block mb-6">System Uptime</span>
                    <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold text-blue-900 tracking-tight">{metrics.uptime.days}D</span>
                        <span className="text-blue-400 text-xl font-bold tracking-tight">{metrics.uptime.hours}H</span>
                    </div>
                </div>

                <div className="bg-blue-900 text-white p-8 rounded-2xl shadow-xl shadow-blue-900/10">
                    <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest block mb-6">Server Traffic</span>
                    <div className="flex flex-col">
                        <span className="text-4xl font-bold tracking-tight">{metrics.requests.active}</span>
                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mt-2">{metrics.requests.rate} REQ/S</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <section className="bg-white p-8 rounded-2xl border border-blue-100 shadow-sm lg:col-span-2">
                    <h3 className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-8 pb-4 border-b border-blue-50">System Status</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { name: 'Database', role: 'Storage', status: metrics.db === 'Connected' ? 'Healthy' : 'Disconnected' },
                            { name: 'Server Logic', role: 'Node.js', status: 'Healthy' },
                            { name: 'Content Delivery', role: 'Edge', status: 'Optimized' }
                        ].map((node, i) => (
                            <div key={i} className="p-6 rounded-xl bg-blue-50 border border-blue-100">
                                <span className={`w-2 h-2 rounded-full inline-block mb-3 ${node.status === 'Healthy' || node.status === 'Optimized' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-red-400'}`}></span>
                                <h4 className="text-sm font-bold text-blue-900 mb-1">{node.name}</h4>
                                <p className="text-[9px] font-bold text-blue-400 uppercase tracking-widest">{node.role}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="bg-blue-50 p-8 rounded-2xl border border-blue-100 shadow-sm">
                    <h3 className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-8 pb-4 border-b border-blue-200">System Information</h3>
                    <div className="space-y-6">
                        <div>
                            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest block mb-1">System Architecture</span>
                            <span className="text-xs font-bold text-blue-900 uppercase">x64 Node v20.10</span>
                        </div>
                        <div>
                            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest block mb-1">Deployment Environment</span>
                            <span className="text-xs font-bold text-blue-900 uppercase">Production Gateway</span>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
