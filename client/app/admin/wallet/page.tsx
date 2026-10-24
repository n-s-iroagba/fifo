'use client';

import React, { useState, useEffect } from 'react';
import { useApiQuery, useApiMutation } from '@/lib/hooks';

interface WalletData {
    id?: number;
    address: string;
    network: string;
    currency: string;
    qrCodeUrl?: string | null;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export default function AdminWalletPage() {
    const { data: wallet, isLoading, refetch } = useApiQuery<WalletData | null>(
        ['admin', 'wallet'],
        '/admin/wallet'
    );

    const [address, setAddress] = useState('');
    const [network, setNetwork] = useState('TRC20');
    const [currency, setCurrency] = useState('USDT');
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [isActive, setIsActive] = useState(true);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        if (wallet) {
            setAddress(wallet.address || '');
            setNetwork(wallet.network || 'TRC20');
            setCurrency(wallet.currency || 'USDT');
            setQrCodeUrl(wallet.qrCodeUrl || '');
            setIsActive(wallet.isActive !== false);
        }
    }, [wallet]);

    const saveMutation = useApiMutation('post', '/admin/wallet', {
        onSuccess: () => {
            refetch();
            setMessage({ type: 'success', text: 'Crypto wallet configuration saved successfully.' });
            setTimeout(() => setMessage(null), 4000);
        },
        onError: (err: any) => {
            setMessage({
                type: 'error',
                text: err.response?.data?.message || 'Failed to save crypto wallet configuration'
            });
        }
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        if (!address.trim()) {
            setMessage({ type: 'error', text: 'Wallet address is required.' });
            return;
        }

        await saveMutation.mutateAsync({
            address: address.trim(),
            network: network.trim() || 'TRC20',
            currency: currency.trim() || 'USDT',
            qrCodeUrl: qrCodeUrl.trim() || null,
            isActive
        });
    };

    return (
        <div className="font-sans max-w-4xl">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-blue-900 tracking-tight">Company Crypto Receiving Wallet</h1>
                <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mt-1">
                    Manage the single active USDT (TRC-20) receiving address for candidate payments
                </p>
            </div>

            {message && (
                <div
                    className={`mb-6 p-4 rounded-xl text-xs font-semibold flex items-center gap-2 border ${
                        message.type === 'success'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-red-50 text-red-800 border-red-200'
                    }`}
                >
                    <span className="material-symbols-outlined text-sm">
                        {message.type === 'success' ? 'check_circle' : 'error'}
                    </span>
                    {message.text}
                </div>
            )}

            {isLoading ? (
                <div className="p-12 text-center text-[10px] font-bold uppercase tracking-widest text-blue-400">
                    Loading Wallet Settings...
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-blue-100 p-8 shadow-sm">
                    <div className="flex items-center gap-4 mb-8 pb-6 border-b border-blue-50">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-2xl">
                            <span className="material-symbols-outlined">account_balance_wallet</span>
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-blue-900">USDT (TRC-20) Wallet Configuration</h2>
                            <p className="text-xs text-slate-500">
                                This address is automatically shown to candidates with QR code and instructions for mobile & desktop Bitget wallet.
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-blue-900 mb-2">
                                Receiving Address (Tron / TRC20) *
                            </label>
                            <input
                                type="text"
                                required
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                placeholder="e.g. TLyHZ2iU8XwK..."
                                className="w-full px-4 py-3 rounded-xl border border-blue-100 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/10"
                            />
                            <p className="text-[11px] text-slate-400 mt-1">
                                Must be a valid TRON TRC-20 address starting with 'T'.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-blue-900 mb-2">
                                    Network Protocol
                                </label>
                                <input
                                    type="text"
                                    value={network}
                                    onChange={(e) => setNetwork(e.target.value)}
                                    placeholder="TRC20"
                                    className="w-full px-4 py-3 rounded-xl border border-blue-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/10"
                                />
                                <p className="text-[11px] text-slate-400 mt-1">Standard: TRC20 (Tron)</p>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-blue-900 mb-2">
                                    Currency Asset
                                </label>
                                <input
                                    type="text"
                                    value={currency}
                                    onChange={(e) => setCurrency(e.target.value)}
                                    placeholder="USDT"
                                    className="w-full px-4 py-3 rounded-xl border border-blue-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/10"
                                />
                                <p className="text-[11px] text-slate-400 mt-1">Standard: Tether USDT</p>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-blue-900 mb-2">
                                Custom QR Code Image URL (Optional)
                            </label>
                            <input
                                type="url"
                                value={qrCodeUrl}
                                onChange={(e) => setQrCodeUrl(e.target.value)}
                                placeholder="https://res.cloudinary.com/.../wallet-qr.png"
                                className="w-full px-4 py-3 rounded-xl border border-blue-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/10"
                            />
                            <p className="text-[11px] text-slate-400 mt-1">
                                If omitted, the candidate payment screen automatically generates a live, scannable QR code from the address above.
                            </p>
                        </div>

                        <div className="pt-2">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={isActive}
                                    onChange={(e) => setIsActive(e.target.checked)}
                                    className="w-4 h-4 rounded text-blue-900 focus:ring-blue-900 border-slate-300"
                                />
                                <span className="text-xs font-medium text-blue-950">
                                    Wallet is active and accepting candidate payments
                                </span>
                            </label>
                        </div>

                        <div className="pt-6 border-t border-blue-50 flex items-center justify-between">
                            <div className="text-xs text-slate-500">
                                {wallet?.updatedAt && (
                                    <span>Last updated: {new Date(wallet.updatedAt).toLocaleString()}</span>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={saveMutation.isPending}
                                className="bg-blue-900 text-white px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-blue-800 transition-all shadow-lg shadow-blue-900/10 disabled:opacity-50 flex items-center gap-2"
                            >
                                <span className="material-symbols-outlined text-sm">save</span>
                                {saveMutation.isPending ? 'Saving...' : 'Save Configuration'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
