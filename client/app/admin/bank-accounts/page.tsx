'use client';

import React, { useState } from 'react';
import { useApiQuery, useApiMutation } from '@/lib/hooks';
import Link from 'next/link';
import { BankAccount } from '@/types/models';

export default function BankAccountsPage() {
    const { data: accounts, isLoading, refetch } = useApiQuery<{ rows: BankAccount[], count: number }>(['admin', 'bank-accounts'], '/admin/bank-accounts');

    const deleteMutation = useApiMutation<number, any>('delete', '/admin/bank-accounts', {
        onSuccess: () => refetch()
    });

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this bank account?')) return;
        try {
            await deleteMutation.mutateAsync(id);
        } catch (err) { console.error(err); }
    };

    const accountList = accounts?.rows || [];

    if (isLoading) return <div className="p-12 text-center text-[10px] font-bold uppercase tracking-widest text-blue-400">Loading...</div>;

    return (
        <div className="font-sans">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-blue-900 tracking-tight">Bank Accounts</h1>
                    <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mt-1">Manage company payment accounts</p>
                </div>
                <Link href="/admin/bank-accounts/new">
                    <button className="bg-blue-900 text-white px-5 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-blue-800 transition-all shadow-lg shadow-blue-900/10">
                        Add Account
                    </button>
                </Link>
            </div>

            <div className="bg-white rounded-2xl border border-blue-100 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-blue-50 border-b border-blue-100">
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-blue-400">Bank</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-blue-400">Account</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-blue-400 text-center">Status</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-blue-400 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-blue-50">
                            {accountList.map((acc: BankAccount) => (
                                <tr key={acc.id} className="hover:bg-blue-50/50 transition-colors">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg">
                                                <span className="material-symbols-outlined text-lg">account_balance</span>
                                            </div>
                                            <span className="text-sm font-medium text-blue-900 uppercase tracking-tight">{acc.bankName}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-medium text-blue-900">{acc.accountNumber}</span>
                                            <span className="text-[9px] font-bold text-blue-400 uppercase tracking-widest mt-0.5">{acc.currency} — {acc.routingCode}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-center">
                                        <span className={`px-2 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest ${acc.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-600'}`}>
                                            {acc.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <div className="flex justify-end gap-3">
                                            <Link href={`/admin/bank-accounts/${acc.id}`} className="text-[10px] font-bold text-blue-400 uppercase tracking-widest hover:text-blue-900 transition-colors">
                                                View
                                            </Link>
                                            <Link href={`/admin/bank-accounts/${acc.id}/edit`} className="text-[10px] font-bold text-blue-400 uppercase tracking-widest hover:text-blue-900">
                                                Edit
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(acc.id)}
                                                className="text-[10px] font-bold text-blue-400 uppercase tracking-widest hover:text-red-600"
                                            >
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
        </div>
    );
}
