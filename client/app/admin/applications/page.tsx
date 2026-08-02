'use client';

import { Application } from '@/types/models';
import { useApiQuery, useApiMutation } from '@/lib/hooks';
import Link from 'next/link';

interface ApplicationsResponse {
    rows: Application[];
    count: number;
}

export default function AdminApplicationsPage() {
    const { data: apps, isLoading, refetch } = useApiQuery<ApplicationsResponse>(['admin', 'applications', 'all'], '/admin/applications');
    const deleteMutation = useApiMutation('delete', '/admin/applications');
    const appList = apps?.rows || [];

    if (isLoading) return <div className="p-12 text-center text-[10px] font-bold uppercase tracking-widest text-blue-400">Loading Applications...</div>;

    return (
        <div className="font-sans antialiased text-blue-900">
            <div className="mb-12">
                <h1 className="text-3xl font-bold tracking-tight uppercase leading-tight">Application Management</h1>
                <p className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.3em] mt-2">Manage candidate applications and recruitment workflows</p>
            </div>

            <div className="bg-white rounded-[2rem] border border-blue-100 overflow-hidden shadow-2xl shadow-blue-900/5">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-blue-50 border-b border-blue-100">
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">Applicant</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">Job / Role</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">Application Status</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-blue-50">
                            {appList.map((app: any) => (
                                <tr key={app.id} className="hover:bg-blue-50/50 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-blue-900 text-white flex items-center justify-center font-black text-xs uppercase shadow-lg shadow-blue-900/10">
                                                {(app.User?.fullName || 'U').charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-blue-900 uppercase tracking-tight">{app.User?.fullName}</p>
                                                <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">{app.User?.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <p className="text-sm font-bold text-blue-900 uppercase tracking-tight">{app.JobListing?.title}</p>
                                        <p className="text-[10px] text-blue-400 font-bold uppercase tracking-[0.2em]">{app.JobListing?.employmentType}</p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-blue-900 animate-pulse"></span>
                                            <span className="px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest bg-blue-100 text-blue-600">
                                                {app.status}
                                            </span>
                                        </div>
                                    </td>

                                    <td className="px-8 py-6 text-right">
                                        <div className="flex items-center justify-end gap-3">
                                            <Link
                                                href={`/admin/applications/${app.id}`}
                                                className="inline-flex items-center gap-2 bg-white border border-blue-100 px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] text-blue-400 hover:text-blue-900 hover:border-blue-900 transition-all shadow-sm active:scale-95"
                                            >
                                                View Details
                                            </Link>
                                            <button
                                                onClick={async () => {
                                                    if (confirm('Are you sure you want to permanently delete this application? This will also remove all associated stages and payments.')) {
                                                        try {
                                                            await deleteMutation.mutateAsync(app.id);
                                                            refetch();
                                                        } catch (err) {
                                                            console.error('Delete failed:', err);
                                                        }
                                                    }
                                                }}
                                                className="p-2.5 text-blue-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                                title="Delete Application"
                                            >
                                                <span className="material-symbols-outlined text-lg">delete</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-blue-900 p-8 rounded-[2rem] text-white shadow-2xl shadow-blue-900/10">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500 mb-4">Current Applications</h3>
                    <p className="text-3xl font-black italic uppercase tracking-tighter">{appList.length} Active Applications</p>
                </div>

                
            </div>
        </div>
    );
}
