'use client';

import React from 'react';
import { useApiQuery, useApiMutation } from '@/lib/hooks';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User } from '@/types/models';

export default function AdminApplicantsPage() {
    const { data: users, isLoading, refetch } = useApiQuery<{ rows: User[], count: number }>(['admin', 'users', 'all'], '/admin/users');
    const deleteMutation = useApiMutation('delete', '/admin/users/:id');
    const userList = users?.rows || [];

    const handleDelete = async (id: number) => {
        if (confirm('CAUTION: This will permanently delete this applicant profile and all associated data. Continue?')) {
            try {
                await deleteMutation.mutateAsync({ params: { id } });
                refetch();
            } catch (error) {
                alert('Delete failed: Access denied or system error.');
            }
        }
    };

    if (isLoading) return <div className="p-12 text-center text-[10px] font-bold uppercase tracking-widest text-blue-400">Refreshing Database...</div>;

    return (
        <div className="font-sans antialiased text-blue-900">
            <div className="mb-12">
                <h1 className="text-3xl font-bold tracking-tight uppercase">Applicant Database</h1>
                <p className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.3em] mt-2">Manage administrator and applicant profiles</p>
            </div>

            <div className="bg-white rounded-[2rem] border border-blue-100 overflow-hidden shadow-2xl shadow-blue-900/5">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-blue-50 border-b border-blue-100">
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">Name</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">Email Address</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">Role</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-blue-50">
                            {userList.map((u: User) => (
                                <tr key={u.id} className="hover:bg-blue-50/50 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-blue-900 flex items-center justify-center text-white font-black text-xs shadow-lg shadow-blue-900/10">
                                                {u.fullName.charAt(0)}
                                            </div>
                                            <span className="text-sm font-bold text-blue-900 uppercase tracking-tight">{u.fullName}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="text-xs font-bold text-blue-400 uppercase tracking-tight">{u.email}</span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${u.role === 'ADMIN' ? 'bg-blue-900 text-white shadow-lg shadow-blue-900/10' : 'bg-blue-100 text-blue-500'}`}>
                                            {u.role === 'ADMIN' ? 'Admin' : 'Applicant'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Link
                                                href={`/admin/applicants/${u.id}`}
                                                className="inline-flex items-center gap-2 bg-white border border-blue-100 px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] text-blue-400 hover:text-blue-900 hover:border-blue-900 transition-all shadow-sm active:scale-95"
                                            >
                                                <span className="material-symbols-outlined text-sm font-bold">visibility</span>
                                                Profile
                                            </Link>
                                            <Link
                                                href={`/admin/mail?to=${u.email}`}
                                                className="inline-flex items-center gap-2 bg-white border border-blue-100 px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] text-blue-400 hover:text-blue-900 hover:border-blue-900 transition-all shadow-sm active:scale-95"
                                            >
                                                <span className="material-symbols-outlined text-sm font-bold">mail</span>
                                                Message
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(u.id)}
                                                className="inline-flex items-center gap-2 bg-white border border-red-100 px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] text-red-400 hover:text-white hover:bg-red-500 hover:border-red-500 transition-all shadow-sm active:scale-95"
                                            >
                                                <span className="material-symbols-outlined text-sm font-bold">delete</span>
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="mt-12 p-8 bg-blue-900 rounded-[2rem] text-white flex items-center justify-between shadow-2xl shadow-blue-900/10">
                <div>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500 mb-2">Database Summary</h3>
                    <p className="text-2xl font-black italic uppercase tracking-tighter">{userList.length} Total Registered Users</p>
                </div>
                <div className="flex gap-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-500">System Monitoring Active</span>
                </div>
            </div>
        </div>
    );
}
