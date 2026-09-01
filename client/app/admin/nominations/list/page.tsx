'use client';

import { useApiQuery, useApiMutation } from '@/lib/hooks';
import Link from 'next/link';

interface NominationsResponse {
    id: number;
    tradeStream: string;
    hostEmployer: string;
    vacancies: string;
    competitors: string;
    status: string;
    applicationId: number;
    Application: {
        id: number;
        User: {
            id: number;
            fullName: string;
            email: string;
        };
        JobListing?: {
            id: number;
            title: string;
        };
    };
    createdAt: string;
}

export default function AdminNominationsListPage() {
    const { data: nominations, isLoading, refetch } = useApiQuery<NominationsResponse[]>(['admin', 'nominations', 'all'], '/admin/nominations');

    if (isLoading) return <div className="p-12 text-center text-[10px] font-bold uppercase tracking-widest text-blue-400">Loading Nominations...</div>;

    const nomList = nominations || [];

    return (
        <div className="font-sans antialiased text-blue-900">
            <div className="mb-12 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight uppercase leading-tight">All Nominations</h1>
                    <p className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.3em] mt-2">View issued and selected nominations</p>
                </div>
                <Link
                    href="/admin/nominations"
                    className="bg-blue-900 text-white px-8 py-3 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-blue-800 transition-all shadow-lg shadow-blue-900/10"
                >
                    Issue New Nomination
                </Link>
            </div>

            <div className="bg-white rounded-[2rem] border border-blue-100 overflow-hidden shadow-2xl shadow-blue-900/5">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-blue-50 border-b border-blue-100">
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">Candidate</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">Trade / Host Employer</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">Vacancies</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-blue-50">
                            {nomList.map((nom: any) => (
                                <tr key={nom.id} className="hover:bg-blue-50/50 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-blue-900 text-white flex items-center justify-center font-black text-xs uppercase shadow-lg shadow-blue-900/10">
                                                {(nom.Application?.User?.fullName || 'C').charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-blue-900 uppercase tracking-tight">{nom.Application?.User?.fullName || 'Unknown Candidate'}</p>
                                                <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">{nom.Application?.User?.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <p className="text-sm font-bold text-blue-900 uppercase tracking-tight">{nom.tradeStream}</p>
                                        <p className="text-[10px] text-blue-400 font-bold uppercase tracking-[0.2em]">{nom.hostEmployer}</p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <p className="text-sm font-bold text-blue-900 uppercase tracking-tight">{nom.vacancies}</p>
                                        <p className="text-[10px] text-blue-400 font-bold uppercase tracking-[0.2em]">{nom.competitors}</p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2">
                                            <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${nom.status === 'selected' ? 'bg-emerald-500' : 'bg-blue-900'}`}></span>
                                            <span className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${nom.status === 'selected' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-600'}`}>
                                                {nom.status}
                                            </span>
                                        </div>
                                        <div className="text-[9px] mt-2 text-blue-400">
                                            {new Date(nom.createdAt).toLocaleDateString()}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {nomList.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-8 py-12 text-center">
                                        <span className="material-symbols-outlined text-blue-200 text-4xl mb-2">inbox</span>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-blue-400">No nominations found</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
