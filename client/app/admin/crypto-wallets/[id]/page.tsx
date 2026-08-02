'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useApiQuery } from '@/lib/hooks';
import Link from 'next/link';
import { CryptoWallet } from '@/types/models';

export default function CryptoWalletViewPage() {
    const params = useParams();
    const id = params?.id;
    const { data: wallet, isLoading, error } = useApiQuery<CryptoWallet>(['admin', 'crypto-wallets', `${id}`], `/admin/crypto-wallets/${id}`, {
        enabled: !!id
    });

    if (isLoading) return <div className="p-12 text-center text-[10px] font-bold uppercase tracking-widest text-blue-400">Loading Wallet Details...</div>;
    if (error) return <div className="p-12 text-center text-red-500 text-[10px] font-bold uppercase tracking-widest">Error Loading Record</div>;

    const copyAddress = () => {
        navigator.clipboard.writeText(wallet?.walletAddress || '');
        // Silent success or console log instead of alert
    };

    return (
        <div className="font-sans">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Link href="/admin/crypto-wallets" className="text-blue-400 hover:text-blue-900 transition-colors">
                            <span className="material-symbols-outlined text-lg">arrow_back</span>
                        </Link>
                        <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Payment Destinations / {id}</span>
                    </div>
                    <h1 className="text-3xl font-bold text-blue-900 tracking-tight">{wallet?.displayLabel || wallet?.currencyName}</h1>
                </div>
                <Link href={`/admin/crypto-wallets/${id}/edit`}>
                    <button className="bg-blue-900 text-white px-5 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-blue-800 transition-all shadow-lg shadow-blue-900/10 flex items-center gap-2">
                        <span className="material-symbols-outlined text-base">edit</span>
                        Edit Wallet
                    </button>
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-blue-900">
                <div className="lg:col-span-2 space-y-8">
                    <section className="bg-white p-8 rounded-2xl border border-blue-100 shadow-sm">
                        <h3 className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-6 pb-4 border-b border-blue-50">Wallet Address</h3>
                        <div className="flex items-center gap-4 bg-blue-50 p-6 rounded-xl border border-blue-100 group relative">
                            <p className="text-lg font-mono font-bold text-blue-900 break-all leading-relaxed pr-12">
                                {wallet?.walletAddress}
                            </p>
                            <button
                                onClick={copyAddress}
                                className="absolute right-6 text-blue-400 hover:text-blue-900 transition-colors"
                            >
                                <span className="material-symbols-outlined">content_copy</span>
                            </button>
                        </div>
                    </section>
                </div>

                <div className="space-y-8">
                    <section className="bg-blue-900 text-white p-8 rounded-2xl shadow-xl shadow-blue-900/10">
                        <h3 className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-6 pb-4 border-b border-blue-800">Wallet Information</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Currency</span>
                                <span className="text-sm font-medium">{wallet?.currencyName}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Network</span>
                                <span className="text-sm font-medium">{wallet?.networkType}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Status</span>
                                <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${wallet?.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                                    {wallet?.isActive ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
