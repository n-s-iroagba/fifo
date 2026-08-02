'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useApiQuery } from '@/lib/hooks';
import CryptoWalletForm from '@/components/admin/forms/CryptoWalletForm';
import Link from 'next/link';

export default function CryptoWalletEditPage() {
    const params = useParams();
    const id = params?.id;
    const { data: wallet, isLoading, error } = useApiQuery<any>(['admin', 'crypto-wallets', `${id}`], `/admin/crypto-wallets/${id}`, {
        enabled: !!id
    });

    if (isLoading) return <div className="p-12 text-center text-[10px] font-bold uppercase tracking-widest text-blue-400">Loading Wallet Details...</div>;
    if (error) return <div className="p-12 text-center text-red-500 text-[10px] font-bold uppercase tracking-widest">Error Loading Wallet</div>;

    return (
        <div className="font-sans">
            <div className="mb-8">
                <div className="flex items-center gap-2 mb-2">
                    <Link href="/admin/crypto-wallets" className="text-blue-400 hover:text-blue-900 transition-colors">
                        <span className="material-symbols-outlined text-lg">arrow_back</span>
                    </Link>
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Finance / Crypto Wallets / {id} / Edit</span>
                </div>
                <h1 className="text-3xl font-bold text-blue-900 tracking-tight">Edit Wallet</h1>
            </div>

            <CryptoWalletForm initialData={wallet} isEdit={true} />
        </div>
    );
}
