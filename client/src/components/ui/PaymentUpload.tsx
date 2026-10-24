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
    const [paymentMode, setPaymentMode] = useState<'bank' | null>(null);
    const [selectedCurrency, setSelectedCurrency] = useState<string | null>(null);

    const { data: details, isLoading } = useApiQuery<any>(
        ['payment', 'details', paymentId],
        `/payments/${paymentId}`,
        { enabled: !!paymentId }
    );

    const { data: walletData } = useApiQuery<any>(
        ['public-crypto-wallet'],
        '/wallet'
    );

    const bankAccounts = details?.bankAccounts || [];

    // Dynamically filtered lists based on mode/currency selection
    const availableCurrencies = useMemo(() => {
        if (paymentMode === 'bank') {
            const list = Array.from(new Set(bankAccounts.map((acc: any) => acc.currency)));
            if (walletData?.currency && !list.includes(walletData.currency)) {
                list.push(walletData.currency);
            }
            return list.length > 0 ? list : ['USDT'];
        }
        return [];
    }, [paymentMode, bankAccounts, walletData]);

    const filteredBanks = bankAccounts.filter((acc: any) => acc.currency === selectedCurrency);

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
                <div className="grid grid-cols-1 gap-4">
                    <button
                        onClick={() => { setPaymentMode('bank'); setSelectedCurrency(null); }}
                        className={`p-6 rounded-2xl border transition-all text-left ${paymentMode === 'bank' ? 'bg-blue-900 border-blue-900 text-white shadow-xl shadow-blue-900/10' : 'bg-white border-blue-100 text-blue-900 hover:border-blue-300'}`}
                    >
                        <span className="material-symbols-outlined mb-4 block">account_balance_wallet</span>
                        <p className="text-xs font-bold uppercase tracking-widest">Crypto Transfer</p>
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
                                    : "You are to make payment to the corporate designated account for this process."}
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

                    {/* USDT TRC-20 Crypto Wallet Display */}
                    {walletData?.address && (
                        <div className="p-6 bg-gradient-to-br from-slate-900 to-blue-950 text-white rounded-3xl shadow-xl border border-blue-900/50 space-y-6">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-2xl border border-emerald-500/30">
                                        <span className="material-symbols-outlined text-2xl">currency_exchange</span>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-base font-bold text-white tracking-wide">Tether (USDT)</span>
                                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                                TRC-20 (TRON)
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-slate-300 mt-0.5">Official Company Receiving Address</p>
                                    </div>
                                </div>
                                <span className="text-xs font-mono text-emerald-400 font-bold bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
                                    Network: TRC20
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                                {/* Scannable QR Code */}
                                <div className="md:col-span-4 flex flex-col items-center justify-center p-4 bg-white rounded-2xl shadow-md">
                                    <img
                                        src={walletData.qrCodeUrl || `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(walletData.address)}`}
                                        alt="USDT TRC20 QR Code"
                                        className="w-40 h-40 object-contain rounded-lg"
                                    />
                                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 mt-2 flex items-center gap-1">
                                        <span className="material-symbols-outlined text-xs">qr_code_scanner</span>
                                        Scan with Bitget / Wallet
                                    </span>
                                </div>

                                {/* Address Details */}
                                <div className="md:col-span-8 space-y-4">
                                    <div>
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-1.5">
                                            TRC-20 Deposit Address
                                        </label>
                                        <div className="p-3.5 bg-black/40 rounded-xl border border-white/10 flex items-center justify-between gap-3 font-mono text-xs text-emerald-300 break-all">
                                            <span>{walletData.address}</span>
                                            <button
                                                type="button"
                                                onClick={() => handleCopy(walletData.address, 'crypto-wallet-main')}
                                                className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-lg text-[10px] font-bold uppercase tracking-wider shrink-0 transition-colors"
                                            >
                                                {copied === 'crypto-wallet-main' ? 'Copied!' : 'Copy Address'}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-[11px] text-slate-300 space-y-1">
                                        <p className="font-semibold text-amber-300 flex items-center gap-1.5">
                                            <span className="material-symbols-outlined text-sm">warning</span>
                                            Important Settlement Instructions
                                        </p>
                                        <p className="text-slate-300 leading-relaxed text-[11px]">
                                            Send only <strong className="text-white">USDT</strong> via the <strong className="text-white">TRON (TRC-20)</strong> network to this address. Sending other assets or via different networks will result in permanent loss.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Bitget Wallet Instructions */}
                            <div className="pt-4 border-t border-white/10 space-y-3">
                                <h5 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                    <span className="material-symbols-outlined text-base text-emerald-400">help</span>
                                    Recommended: Pay via Bitget Wallet (Mobile & Desktop)
                                </h5>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <a
                                        href="https://apps.apple.com/app/bitget-wallet-crypto-story/id1450122757"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all text-center block"
                                    >
                                        <span className="text-xs font-bold text-white block">Download for iOS</span>
                                        <span className="text-[10px] text-slate-400">Apple App Store &rarr;</span>
                                    </a>
                                    <a
                                        href="https://play.google.com/store/apps/details?id=com.bitkeep.wallet"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all text-center block"
                                    >
                                        <span className="text-xs font-bold text-white block">Download for Android</span>
                                        <span className="text-[10px] text-slate-400">Google Play Store &rarr;</span>
                                    </a>
                                    <a
                                        href="https://web3.bitget.com/en/wallet-download"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all text-center block"
                                    >
                                        <span className="text-xs font-bold text-white block">PC / Chrome Extension</span>
                                        <span className="text-[10px] text-slate-400">Bitget Web3 &rarr;</span>
                                    </a>
                                </div>

                                <ol className="list-decimal list-inside text-[11px] text-slate-300 space-y-1 pt-1 leading-relaxed">
                                    <li>Open Bitget Wallet, tap <strong className="text-white">Send</strong>, and select <strong className="text-white">USDT</strong>.</li>
                                    <li>Choose <strong className="text-white">TRON (TRC-20)</strong> as the transfer network.</li>
                                    <li>Scan the QR code above or paste the copied deposit address.</li>
                                    <li>Confirm the transfer and capture a screenshot of the successful transaction receipt to upload below.</li>
                                </ol>
                            </div>
                        </div>
                    )}

                    <div className="space-y-3">
                        {filteredBanks.map((acc: any) => (
                            <div key={acc.id} className="p-6 bg-white border border-blue-100 rounded-2xl shadow-sm space-y-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-[9px] font-bold text-blue-400 uppercase tracking-widest mb-1">Wallet Beneficiary</p>
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
                                        <p className="text-[8px] font-bold text-blue-400 uppercase tracking-widest mb-1">Payment Account / Address</p>
                                        <p className="text-xs font-mono font-bold text-blue-900 break-all">{acc.accountNumber}</p>
                                        <button
                                            onClick={() => handleCopy(acc.accountNumber, `bank-num-${acc.id}`)}
                                            className="absolute top-4 right-4 text-[9px] font-bold text-blue-400 hover:text-blue-900 uppercase tracking-widest"
                                        >
                                            {copied === `bank-num-${acc.id}` ? 'Done' : 'Copy'}
                                        </button>
                                    </div>
                                    <div className="bg-blue-50 p-4 rounded-xl relative">
                                        <p className="text-[8px] font-bold text-blue-400 uppercase tracking-widest mb-1">Network</p>
                                        <p className="text-xs font-mono font-bold text-blue-900 break-all">{acc.routingCode || 'TRC-20'}</p>
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
                        ))}
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
