'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useApiQuery } from '@/lib/hooks';
import Link from 'next/link';
import { BankAccount } from '@/types/models';
import { CONSTANTS } from '@/constants';

export default function BankAccountViewPage() {
    const params = useParams();
    const id = params?.id;
    const { data: bankAccount, isLoading, error } = useApiQuery<BankAccount>(['admin', 'bank-accounts', `${id}`], `/admin/bank-accounts/${id}`, {
        enabled: !!id
    });

    if (isLoading) return <div className="p-12 text-center text-[10px] font-bold uppercase tracking-widest text-blue-400">Loading Account Details...</div>;
    if (error) return <div className="p-12 text-center text-red-600 text-[10px] font-bold uppercase tracking-widest">Error Loading Record</div>;

    return (
        <div className="flex flex-col min-h-screen bg-white font-sans text-blue-900">
            <header className="h-20 px-8 bg-white border-b border-blue-100 flex items-center justify-between sticky top-0 z-40">
                <div className="flex items-center gap-6">
                    <Link href="/admin/bank-accounts" className="p-2 text-blue-400 hover:text-blue-900 transition-colors">
                        <span className="material-symbols-outlined text-xl">arrow_back</span>
                    </Link>
                    <div>
                        <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest block mb-1">Bank Details</span>
                        <h1 className="text-xl font-bold text-blue-900 tracking-tight">Bank Account</h1>
                    </div>
                </div>
                <Link href={`/admin/bank-accounts/${id}/edit`}>
                    <button className="bg-blue-900 text-white px-6 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all hover:bg-blue-800 shadow-lg shadow-blue-900/10 flex items-center gap-2">
                        <span className="material-symbols-outlined text-base">edit</span>
                        Edit Account
                    </button>
                </Link>
            </header>

            <main className="p-8 md:p-12 max-w-3xl mx-auto w-full">
                <div className="space-y-12">
                    <div>
                        <h1 className="text-4xl font-bold text-blue-900 mb-6">{bankAccount?.bankName}</h1>
                        <div className="flex gap-3">
                            <span className="px-3 py-1 bg-blue-900 text-white text-[9px] font-bold uppercase tracking-widest rounded-lg">
                                {bankAccount?.currency}
                            </span>
                            <span className="px-3 py-1 bg-blue-100 text-blue-500 text-[9px] font-bold uppercase tracking-widest rounded-lg border border-blue-200">
                                {bankAccount?.accountType === CONSTANTS.BANK_ACCOUNT_TYPES.OPEN_BENEFICIARY ? 'Open Beneficiary' : 'Standard Account'}
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-white p-8 rounded-2xl border border-blue-100 shadow-sm space-y-8">
                            <div>
                                <label className="text-[10px] font-bold text-blue-400 uppercase tracking-widest block mb-2 px-1">Account Number</label>
                                <p className="text-xl font-bold tracking-tight text-blue-900 px-1">{bankAccount?.accountNumber}</p>
                            </div>
                            <div className="pt-6 border-t border-blue-50">
                                <label className="text-[10px] font-bold text-blue-400 uppercase tracking-widest block mb-2 px-1">Routing / Sort Code</label>
                                <p className="text-lg font-bold text-blue-900 px-1">{bankAccount?.routingCode || 'N/A'}</p>
                            </div>
                        </div>


                    </div>
                </div>
            </main>
        </div>
    );
}
