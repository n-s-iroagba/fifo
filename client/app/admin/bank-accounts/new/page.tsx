'use client';

import BankAccountForm from '@/components/admin/forms/BankAccountForm';
import Link from 'next/link';

export default function BankAccountFormPage() {
    return (
        <div className="font-sans">
            <div className="mb-8">
                <div className="flex items-center gap-2 mb-2">
                    <Link href="/admin/bank-accounts" className="text-blue-400 hover:text-blue-900 transition-colors">
                        <span className="material-symbols-outlined text-lg">arrow_back</span>
                    </Link>
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Financials / Bank Accounts / New</span>
                </div>
                <h1 className="text-3xl font-bold text-blue-900 tracking-tight">Create Bank Account</h1>
            </div>

            <BankAccountForm />
        </div>
    );
}
