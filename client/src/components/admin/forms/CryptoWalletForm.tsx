'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApiMutation } from '@/lib/hooks';
import { useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { CryptoWallet } from '@/types/models';

interface CryptoWalletFormProps {
    initialData?: CryptoWallet;
    isEdit?: boolean;
}

const NETWORK_MAPPING: Record<string, { label: string; value: string }[]> = {
    BTC: [
        { label: 'Mainnet (BTC)', value: 'MAINNET' },
        { label: 'Lightning Network', value: 'LIGHTNING' },
        { label: 'BNB Smart Chain (BEP20)', value: 'BEP20' }
    ],
    ETH: [
        { label: 'Mainnet (ERC20)', value: 'MAINNET' },
        { label: 'Base Network', value: 'BASE' },
        { label: 'Arbitrum One', value: 'ARBITRUM' },
        { label: 'Optimism', value: 'OPTIMISM' },
        { label: 'BNB Smart Chain (BEP20)', value: 'BEP20' }
    ],
    USDT: [
        { label: 'Mainnet (ERC20)', value: 'MAINNET' },
        { label: 'Tron (TRC20)', value: 'TRC20' },
        { label: 'BNB Smart Chain (BEP20)', value: 'BEP20' },
        { label: 'Polygon Network', value: 'POLYGON' }
    ],
    USDC: [
        { label: 'Mainnet (ERC20)', value: 'MAINNET' },
        { label: 'Base Network', value: 'BASE' },
        { label: 'Solana', value: 'SOLANA' },
        { label: 'Polygon Network', value: 'POLYGON' }
    ],
    SOL: [{ label: 'Mainnet (Solana)', value: 'SOLANA' }]
};

export default function CryptoWalletForm({ initialData, isEdit = false }: CryptoWalletFormProps) {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [label, setLabel] = useState(initialData?.displayLabel || '');
    const [cryptoType, setCryptoType] = useState(initialData?.currencyName || 'ETH');
    const [network, setNetwork] = useState(initialData?.networkType || 'MAINNET');
    const [address, setAddress] = useState(initialData?.walletAddress || '');
    const [isActive, setIsActive] = useState(initialData?.isActive ?? true);

    useEffect(() => {
        if (initialData) {
            setLabel(initialData.displayLabel || '');
            setCryptoType(initialData.currencyName);
            setNetwork(initialData.networkType);
            setAddress(initialData.walletAddress);
            setIsActive(initialData.isActive);
        }
    }, [initialData]);

    // Handle network dependency
    useEffect(() => {
        const available = NETWORK_MAPPING[cryptoType] || [];
        // If current network is not valid for the new crypto type, reset it
        if (!available.find(n => n.value === network)) {
            setNetwork(available[0]?.value || '');
        }
    }, [cryptoType]);

    const mutation = useApiMutation(
        isEdit ? 'put' : 'post',
        isEdit ? `/admin/crypto-wallets/${initialData?.id}` : '/admin/crypto-wallets',
        {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['admin', 'crypto-wallets'] });
                router.push('/admin/crypto-wallets');
            }
        }
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await mutation.mutateAsync({
                displayLabel: label,
                currencyName: cryptoType,
                networkType: network,
                walletAddress: address,
                isActive
            });
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="font-sans">
            <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <h1 className="text-2xl font-bold tracking-tight text-blue-900">
                    {isEdit ? 'Edit Wallet' : 'New Crypto Wallet'}
                </h1>
                <div className="flex gap-3 w-full sm:w-auto">
                    <Link href="/admin/crypto-wallets" className="text-[10px] font-bold text-blue-400 uppercase tracking-widest hover:text-blue-900 transition-all px-4 py-3">
                        Cancel
                    </Link>
                    <button className="px-8 py-3 bg-blue-900 text-white rounded-lg font-bold text-[10px] uppercase tracking-widest hover:bg-blue-800 transition-all shadow-lg shadow-blue-900/10 disabled:opacity-50" type="submit" disabled={mutation.isPending}>
                        {mutation.isPending ? 'Saving...' : 'Save Wallet'}
                    </button>
                </div>
            </div>

            <div className="bg-white p-6 md:p-10 rounded-2xl border border-blue-100 space-y-8">
                <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-blue-400 uppercase tracking-widest px-1">Display Label</label>
                    <input
                        className="w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg text-sm font-medium text-blue-900 placeholder:text-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-900/5 focus:border-blue-900 transition-all outline-none"
                        placeholder="e.g. Primary Wallet"
                        type="text"
                        value={label}
                        onChange={(e) => setLabel(e.target.value)}
                        required
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                        <label className="block text-[10px] font-bold text-blue-400 uppercase tracking-widest px-1">Currency</label>
                        <select
                            className="w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg text-sm font-medium text-blue-900 focus:bg-white focus:ring-2 focus:ring-blue-900/5 focus:border-blue-900 transition-all outline-none appearance-none"
                            value={cryptoType}
                            onChange={(e) => setCryptoType(e.target.value)}
                        >
                            <option value="BTC">Bitcoin (BTC)</option>
                            <option value="ETH">Ethereum (ETH)</option>
                            <option value="USDT">Tether (USDT)</option>
                            <option value="USDC">USD Coin (USDC)</option>
                            <option value="SOL">Solana (SOL)</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-[10px] font-bold text-blue-400 uppercase tracking-widest px-1">Network</label>
                        <select
                            className="w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg text-sm font-medium text-blue-900 focus:bg-white focus:ring-2 focus:ring-blue-900/5 focus:border-blue-900 transition-all outline-none appearance-none"
                            value={network}
                            onChange={(e) => setNetwork(e.target.value)}
                        >
                            {(NETWORK_MAPPING[cryptoType] || []).map((net) => (
                                <option key={net.value} value={net.value}>
                                    {net.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-blue-400 uppercase tracking-widest px-1">Wallet Address</label>
                    <input
                        className="w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg text-sm font-mono text-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-900/5 focus:border-blue-900 transition-all outline-none"
                        placeholder="0x..."
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        required
                    />
                </div>

                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <div>
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-blue-900">Active Status</h4>
                        <p className="text-[9px] font-bold text-blue-400 uppercase tracking-[0.2em] mt-1">Enable for public transactions</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            className="sr-only peer"
                            type="checkbox"
                            checked={isActive}
                            onChange={() => setIsActive(!isActive)}
                        />
                        <div className="w-11 h-6 bg-blue-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-blue-900 transition-all after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                    </label>
                </div>
            </div>
        </form>
    );
}
