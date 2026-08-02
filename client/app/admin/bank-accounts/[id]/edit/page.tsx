'use client';

import { useParams } from 'next/navigation';
import { useApiQuery } from '@/lib/hooks';
import BankAccountForm from '@/components/admin/forms/BankAccountForm';
import Link from 'next/link';

export default function BankAccountEditPage() {
    const params = useParams();
    const id = params?.id;
    const { data: bankAccount, isLoading, error } = useApiQuery<any>(['admin', 'bank-account', id], `/admin/bank-accounts/${id}`, {
        enabled: !!id
    });

    if (isLoading) return <div className="p-12 text-center text-[10px] font-bold uppercase tracking-widest text-blue-400">Loading Account Details...</div>;
    if (error) return <div className="p-12 text-center text-red-500 text-[10px] font-bold uppercase tracking-widest">Error Loading Account</div>;

    return (
        <div className="font-sans">
            <div className="mb-8">
                <div className="flex items-center gap-2 mb-2">
                    <Link href="/admin/bank-accounts" className="text-blue-400 hover:text-blue-900 transition-colors">
                        <span className="material-symbols-outlined text-lg">arrow_back</span>
                    </Link>
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Financials / Bank Accounts / {id} / Edit</span>
                </div>
                <h1 className="text-3xl font-bold text-blue-900 tracking-tight">Edit Bank Account</h1>
            </div>

            <BankAccountForm initialData={bankAccount} isEdit={true} />
        </div>
    );
}
