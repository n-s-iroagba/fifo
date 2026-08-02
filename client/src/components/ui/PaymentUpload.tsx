'use client';

import React, { useState, useMemo } from 'react';
import { useApiQuery } from '@/lib/hooks';
import api from '@/lib/api';
import { uploadFile } from '@/lib/utils';

interface PaymentUploadProps {
    paymentId: number;
    amount: number;
    onSuccess: () => void;
}

export function PaymentUpload({ paymentId, amount, onSuccess }: PaymentUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [copied, setCopied] = useState<string | null>(null);
    const [paymentMode, setPaymentMode] = useState<'bank' | 'crypto' | null>(null);
    const [selectedCurrency, setSelectedCurrency] = useState<string | null>(null);

    const { data: details, isLoading } = useApiQuery<any>(
        ['payment', 'details', paymentId],
        `/payments/${paymentId}`,
        { enabled: !!paymentId }
    );

    const bankAccounts = details?.bankAccounts || [];
    const wallets = details?.cryptoWallets || [];

    // Dynamically filtered lists based on mode/currency selection
    const availableCurrencies = useMemo(() => {
        if (paymentMode === 'bank') {
            return Array.from(new Set(bankAccounts.map((acc: any) => acc.currency)));
        }
        if (paymentMode === 'crypto') {
            return Array.from(new Set(wallets.map((w: any) => w.currencyName)));
        }
        return [];
    }, [paymentMode, bankAccounts, wallets]);

    const filteredBanks = bankAccounts.filter((acc: any) => acc.currency === selectedCurrency);
    const filteredWallets = wallets.filter((w: any) => w.currencyName === selectedCurrency);

    const handleCopy = (val: string, key: string) => {
        navigator.clipboard.writeText(val);
        setCopied(key);
        setTimeout(() => setCopied(null), 2000);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);

        try {
            const cloudinaryUrl = await uploadFile(file, 'image');

            if (!cloudinaryUrl) {
                throw new Error('Cloudinary returned an invalid URL');
            }

            await api.post(`/payments/${paymentId}/proof`, {
                proofUrl: cloudinaryUrl
            });
            onSuccess();
        } catch (err: any) {
            console.error('[PaymentUpload Error]', err);
            alert(`Upload Failed: ${err.message || 'Check your Cloudinary credentials'}`);
        } finally {
            setUploading(false);
        }
    };

    if (isLoading) return <div className="p-12 text-center text-[10px] font-bold uppercase tracking-widest text-blue-400 animate-pulse">Synchronizing Settlement Nodes...</div>;

    const isHighValue = amount >= 5000;

    return (
        <div className="space-y-10">
            {/* Mode Selection */}
            <div className="space-y-4">
                <h4 className="text-[10px] font-bold text-blue-400 uppercase tracking-widest px-1">Initial Selection: Payment Protocol</h4>
                <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={() => { setPaymentMode('bank'); setSelectedCurrency(null); }}
                        className={`p-6 rounded-2xl border transition-all text-left ${paymentMode === 'bank' ? 'bg-blue-900 border-blue-900 text-white shadow-xl shadow-blue-900/10' : 'bg-white border-blue-100 text-blue-900 hover:border-blue-300'}`}
                    >
                        <span className="material-symbols-outlined mb-4 block">account_balance</span>
                        <p className="text-xs font-bold uppercase tracking-widest">Bank Transfer</p>
                    </button>
                    <button
                        onClick={() => { setPaymentMode('crypto'); setSelectedCurrency(null); }}
                        className={`p-6 rounded-2xl border transition-all text-left ${paymentMode === 'crypto' ? 'bg-blue-900 border-blue-900 text-white shadow-xl shadow-blue-900/10' : 'bg-white border-blue-100 text-blue-900 hover:border-blue-300'}`}
                    >
                        <span className="material-symbols-outlined mb-4 block">currency_bitcoin</span>
                        <p className="text-xs font-bold uppercase tracking-widest">Digital Asset</p>
                    </button>
                </div>
            </div>

            {/* Currency Selection */}
            {paymentMode && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                    <h4 className="text-[10px] font-bold text-blue-400 uppercase tracking-widest px-1">Secondary Selection: Currency Node</h4>
                    <div className="flex flex-wrap gap-2">
                        {availableCurrencies.map((cur: any) => (
                            <button
                                key={cur}
                                onClick={() => setSelectedCurrency(cur)}
                                className={`px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${selectedCurrency === cur ? 'bg-blue-100 text-blue-900 border border-blue-200' : 'bg-blue-50 text-blue-400 border border-transparent hover:border-blue-100'}`}
                            >
                                {cur}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Account Details */}
            {selectedCurrency && (
                <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
                    <h4 className="text-[10px] font-bold text-blue-400 uppercase tracking-widest px-1">Settlement Instruction Set</h4>

                    {paymentMode === 'bank' && isHighValue && (
                        <div className="p-5 bg-amber-50 border border-amber-100 rounded-xl flex items-start gap-3">
                            <span className="material-symbols-outlined text-amber-600">info</span>
                            <p className="text-[10px] text-amber-700 font-bold uppercase tracking-widest leading-relaxed">
                                {details?.stage?.feeType === 'APEX_FEE' 
                                    ? "This infrastructure fee activates your Apex Network nodes. Access is guaranteed within 3 weeks of verification."
                                    : "You are to make payment to the recruitment manager's company account for this process."}
                            </p>
                        </div>
                    )}

                    {details?.stage?.refundMessage && (
                        <div className="p-5 bg-blue-900 text-white rounded-xl flex items-start gap-3 shadow-xl shadow-blue-900/20">
                            <span className="material-symbols-outlined">verified_user</span>
                            <p className="text-[9px] font-bold uppercase tracking-widest leading-relaxed">
                                {details.stage.refundMessage}
                            </p>
                        </div>
                    )}

                    <div className="space-y-3">
                        {paymentMode === 'bank' ? (
                            filteredBanks.map((acc: any) => (
                                <div key={acc.id} className="p-6 bg-white border border-blue-100 rounded-2xl shadow-sm space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-[9px] font-bold text-blue-400 uppercase tracking-widest mb-1">Account Beneficiary</p>
                                            <p className="text-sm font-bold text-blue-900 uppercase tracking-tight">
                                                {isHighValue ? `${acc.accountHolderName}` : 'JOBNEXE LLC'}
                                            </p>
                                            <p className="text-[11px] text-blue-500 font-bold uppercase mt-1">{acc.bankName}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[9px] font-bold text-blue-400 uppercase tracking-widest mb-1">Currency</p>
                                            <p className="text-sm font-bold text-blue-900">{acc.currency}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-blue-50">
                                        <div className="bg-blue-50 p-4 rounded-xl relative group">
                                            <p className="text-[8px] font-bold text-blue-400 uppercase tracking-widest mb-1">Account Number</p>
                                            <p className="text-xs font-mono font-bold text-blue-900 break-all">{acc.accountNumber}</p>
                                            <button
                                                onClick={() => handleCopy(acc.accountNumber, `bank-num-${acc.id}`)}
                                                className="absolute top-4 right-4 text-[9px] font-bold text-blue-400 hover:text-blue-900 uppercase tracking-widest"
                                            >
                                                {copied === `bank-num-${acc.id}` ? 'Done' : 'Copy'}
                                            </button>
                                        </div>
                                        <div className="bg-blue-50 p-4 rounded-xl relative">
                                            <p className="text-[8px] font-bold text-blue-400 uppercase tracking-widest mb-1">Routing / Sort Code</p>
                                            <p className="text-xs font-mono font-bold text-blue-900 break-all">{acc.routingCode || 'N/A'}</p>
                                            {acc.routingCode && (
                                                <button
                                                    onClick={() => handleCopy(acc.routingCode, `bank-route-${acc.id}`)}
                                                    className="absolute top-4 right-4 text-[9px] font-bold text-blue-400 hover:text-blue-900 uppercase tracking-widest"
                                                >
                                                    {copied === `bank-route-${acc.id}` ? 'Done' : 'Copy'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            filteredWallets.map((w: any) => (
                                <div key={w.id} className="p-6 bg-white border border-blue-100 rounded-2xl shadow-sm space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-[9px] font-bold text-blue-400 uppercase tracking-widest mb-1">Blockchain Network</p>
                                            <p className="text-sm font-bold text-blue-900 uppercase tracking-tight">{w.networkType}</p>
                                            <p className="text-[11px] text-blue-500 font-bold uppercase mt-1">{w.displayLabel}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[9px] font-bold text-blue-400 uppercase tracking-widest mb-1">Asset</p>
                                            <p className="text-sm font-bold text-blue-900">{w.currencyName}</p>
                                        </div>
                                    </div>
                                    <div className="bg-blue-900 p-5 rounded-xl space-y-3">
                                        <div className="flex justify-between items-center">
                                            <p className="text-[8px] font-bold text-blue-400 uppercase tracking-widest">Network Address</p>
                                            <button
                                                onClick={() => handleCopy(w.walletAddress, `crypto-${w.id}`)}
                                                className="text-[9px] font-bold text-blue-500 hover:text-white uppercase tracking-widest transition-colors"
                                            >
                                                {copied === `crypto-${w.id}` ? 'Success' : 'Copy Address'}
                                            </button>
                                        </div>
                                        <p className="text-[10px] font-mono font-medium text-white break-all leading-relaxed select-all">
                                            {w.walletAddress}
                                        </p>
                                        {w.memoTag && (
                                            <div className="pt-3 border-t border-blue-800 flex justify-between items-center">
                                                <p className="text-[8px] font-bold text-blue-400 uppercase tracking-widest">Memo / Tag</p>
                                                <p className="text-[10px] font-mono text-white font-bold">{w.memoTag}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* Submission Section */}
            {selectedCurrency && (
                <div className="pt-10 border-t border-blue-50 animate-in fade-in duration-700">
                    <h4 className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-4 px-1">Protocol Conclusion: Documentary Proof</h4>
                    <p className="text-[10px] text-blue-500 font-medium mb-8 leading-relaxed px-1">
                        Please upload a clear, legible screenshot or PDF of your transaction receipt. <br />
                        Required Metadata: <span className="font-bold text-blue-900">#CC-{paymentId.toString().padStart(5, '0')}</span> must be quoted in remarks.
                    </p>

                    <div className="relative group">
                        <input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={handleFileUpload}
                            disabled={uploading}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div className="w-full bg-blue-50 text-blue-900 py-5 rounded-2xl border-2 border-dashed border-blue-200 group-hover:bg-white group-hover:border-blue-900 transition-all flex flex-col items-center justify-center gap-3">
                            <span className="material-symbols-outlined text-3xl">cloud_upload</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest">
                                {uploading ? 'Archiving Settlement Node...' : 'Drop Transaction Receipt Here'}
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
