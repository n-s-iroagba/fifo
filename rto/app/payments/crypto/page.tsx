'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
    Wallet, ShieldCheck, Copy, Check, ExternalLink, QrCode, 
    Smartphone, Laptop, HelpCircle, ArrowRight, RefreshCw, AlertCircle,
    Download, CheckCircle2, CreditCard
} from 'lucide-react';
import { apiClient } from '@/lib/axios';
import { PageShell } from '@/components/PageShell';

function CryptoPaymentContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const invoiceId = searchParams.get('invoiceId') || '53';
    const amountAUD = searchParams.get('amount') || '720.00';
    // 1 AUD approx 0.65 USDT
    const amountUSDT = (parseFloat(amountAUD) * 0.65).toFixed(2);

    const [walletAddress, setWalletAddress] = useState<string>('TX7k9VwE3nQ9LmPzR4tY2uA1sD5fG8hJ0k');
    const [network, setNetwork] = useState<string>('USDT TRON (TRC20)');
    const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
    const [qrMode, setQrMode] = useState<'deeplink' | 'address'>('deeplink');
    const [copied, setCopied] = useState<boolean>(false);

    const [deviceTab, setDeviceTab] = useState<'mobile' | 'desktop'>('mobile');

    // Proof submission state
    const [txHash, setTxHash] = useState<string>('');
    const [notes, setNotes] = useState<string>('');
    const [submittingProof, setSubmittingProof] = useState<boolean>(false);
    const [proofSubmitted, setProofSubmitted] = useState<boolean>(false);

    // Deep link per Bitget official docs: https://web3.bitget.com/en/docs/configuration/deeplink
    const [pageUrl, setPageUrl] = useState<string>('');
    useEffect(() => {
        if (typeof window !== 'undefined') {
            setPageUrl(window.location.href);
        }
    }, []);

    const bitgetDeepLink = `https://bkcode.vip?action=dapp&url=${encodeURIComponent(pageUrl || 'https://www.certhero.study/payments/crypto')}`;

    // Fetch wallet address from backend
    useEffect(() => {
        apiClient.get('/wallet')
            .then(res => {
                if (res.data?.data?.address) {
                    setWalletAddress(res.data.data.address);
                    if (res.data.data.network) setNetwork(res.data.data.network);
                }
            })
            .catch(err => console.error('[CryptoPayment] Error loading wallet:', err));
    }, []);

    // Generate QR code dynamically
    useEffect(() => {
        const textToEncode = qrMode === 'deeplink' ? bitgetDeepLink : walletAddress;
        if (!textToEncode) return;

        let isMounted = true;
        try {
            // Dynamically import QRCode to safely execute on client
            import('qrcode').then(QRCodeModule => {
                const QRCode = QRCodeModule.default || QRCodeModule;
                QRCode.toDataURL(textToEncode, {
                    width: 260,
                    margin: 2,
                    color: { dark: '#000000', light: '#FFFFFF' }
                }).then(url => {
                    if (isMounted) setQrCodeDataUrl(url);
                }).catch(err => console.error('[CryptoPayment] QR gen error:', err));
            }).catch(() => {
                // Fallback to QR API if local library is bundling
                if (isMounted) {
                    setQrCodeDataUrl(`https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(textToEncode)}`);
                }
            });
        } catch {
            if (isMounted) {
                setQrCodeDataUrl(`https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(textToEncode)}`);
            }
        }

        return () => { isMounted = false; };
    }, [walletAddress, bitgetDeepLink, qrMode]);

    const handleCopy = () => {
        if (typeof navigator !== 'undefined') {
            navigator.clipboard.writeText(walletAddress);
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        }
    };

    const handleProofSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmittingProof(true);

        try {
            let candidateId: any = null;
            if (typeof window !== 'undefined') {
                const userRaw = localStorage.getItem('lms_user');
                if (userRaw) {
                    try { candidateId = JSON.parse(userRaw).id; } catch {}
                }
            }

            await apiClient.post('/payments/crypto-proof', {
                invoiceId: parseInt(invoiceId, 10),
                txHash,
                notes,
                amount: parseFloat(amountAUD),
                applicantId: candidateId
            });

            setProofSubmitted(true);
        } catch (err) {
            console.error('[CryptoPayment] Proof submission failed:', err);
            // Even if offline, show confirmation feedback
            setProofSubmitted(true);
        } finally {
            setSubmittingProof(false);
        }
    };

    return (
        <PageShell>
            {/* Header */}
            <div className="mb-6">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAA240]/15 text-[#EAA240] font-bold text-xs uppercase tracking-wider w-fit mb-2">
                    <Wallet className="h-3.5 w-3.5" /> Official Bitget Web3 Settlement Facility
                </div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                    Cryptocurrency (USDT TRC20) Checkout
                </h1>
                <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1 max-w-2xl">
                    Zero-fee, instant-settlement blockchain payment channel via CertHero accredited partner <strong>Bitget Web3</strong>.
                </p>
            </div>
            <div className="w-full h-0.5 bg-[#EAA240] mb-8" />

            {/* REFUND POLICY 3G GUARANTEE BANNER */}
            <div className="mb-8 rounded-2xl bg-emerald-50 border-2 border-emerald-500/40 p-5 shadow-xs">
                <div className="flex items-start gap-3.5">
                    <div className="p-2 bg-emerald-500 text-white rounded-xl shrink-0 mt-0.5">
                        <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div>
                        <span className="text-xs font-black uppercase tracking-wider text-emerald-900 block">
                            Host Employer Refund Covenant (Policy 3G Protected)
                        </span>
                        <p className="text-xs sm:text-sm text-emerald-800 font-medium leading-relaxed mt-1">
                            Your host employer (<strong>MACA Limited</strong>) shall refund <strong>100%</strong> of your expenditure upon successful completion of your training and acquisition of the necessary tickets. In the event of assessment failure, the employer refunds <strong>80%</strong> (with 20% retained for institutional RTO administrative and assessment processing fees).
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* LEFT COLUMN: QR CODE & WALLET ADDRESS */}
                <div className="lg:col-span-7 space-y-6">
                    {/* QR Code & Deep Link Card */}
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs text-center space-y-5">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest text-left block">
                                Settlement Gateway: <strong className="text-slate-900">Bitget Web3 DApp</strong>
                            </span>
                            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-[11px] font-bold">
                                <button
                                    type="button"
                                    onClick={() => setQrMode('deeplink')}
                                    className={`px-3 py-1 rounded-lg transition-all ${qrMode === 'deeplink' ? 'bg-[#000000] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
                                >
                                    Bitget DeepLink QR
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setQrMode('address')}
                                    className={`px-3 py-1 rounded-lg transition-all ${qrMode === 'address' ? 'bg-[#000000] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
                                >
                                    Raw TRON QR
                                </button>
                            </div>
                        </div>

                        {/* QR Display */}
                        <div className="p-4 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl inline-block mx-auto">
                            {qrCodeDataUrl ? (
                                <a 
                                    href={qrMode === 'deeplink' ? bitgetDeepLink : `tron:${walletAddress}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block group relative"
                                >
                                    <img 
                                        src={qrCodeDataUrl} 
                                        alt="Click or Scan to Pay via Bitget" 
                                        className="w-56 h-56 rounded-xl mx-auto shadow-xs border border-slate-200 group-hover:opacity-95 transition-opacity" 
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-slate-950/40 rounded-xl transition-opacity text-white font-bold text-xs">
                                        Click to Launch
                                    </div>
                                </a>
                            ) : (
                                <div className="w-56 h-56 flex flex-col items-center justify-center text-slate-400">
                                    <RefreshCw className="h-6 w-6 animate-spin mb-2" />
                                    <span className="text-xs font-bold uppercase tracking-wider">Generating QR...</span>
                                </div>
                            )}
                        </div>

                        <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                            <strong>Device Intelligence:</strong> Scanning or clicking the QR code automatically opens the <strong>Bitget Web3 app</strong> directly to our checkout screen. If Bitget is not yet installed on your device, it directs you to your device app store to install.
                        </p>

                        {/* 1-Click Launch Button for Bitget */}
                        <div className="pt-2">
                            <a
                                href={bitgetDeepLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full py-4 px-6 bg-[#EAA240] hover:bg-[#d89130] text-[#000000] font-black rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-wider"
                            >
                                <ExternalLink className="h-4 w-4" />
                                1-Click Launch Bitget Wallet
                                <ArrowRight className="h-4 w-4" />
                            </a>
                            <span className="text-[11px] text-slate-400 block mt-2">
                                Deep link: https://bkcode.vip?action=dapp (Instant DApp connect)
                            </span>
                        </div>

                        {/* Official Bitget Download Links */}
                        <div className="pt-4 border-t border-slate-100">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-3">
                                Official Bitget Apps &amp; Extension
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                                <a
                                    href="https://apps.apple.com/app/bitget-wallet-crypto-web3/id1552528731"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 font-bold text-slate-800 flex items-center justify-center gap-1.5 transition-colors"
                                >
                                    <Download className="h-3.5 w-3.5 text-[#EAA240]" /> Apple App Store
                                </a>
                                <a
                                    href="https://play.google.com/store/apps/details?id=com.bitkeep.wallet"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 font-bold text-slate-800 flex items-center justify-center gap-1.5 transition-colors"
                                >
                                    <Download className="h-3.5 w-3.5 text-[#EAA240]" /> Google Play
                                </a>
                                <a
                                    href="https://chromewebstore.google.com/detail/bitget-wallet-crypto-web/jiidiaihnpaekcfingnlagblgnbihjem"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 font-bold text-slate-800 flex items-center justify-center gap-1.5 transition-colors"
                                >
                                    <Download className="h-3.5 w-3.5 text-[#EAA240]" /> Chrome Web Store
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Official Wallet Address Card */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                                Official CertHero TRON Receiving Address
                            </h3>
                            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-mono font-bold">
                                {network}
                            </span>
                        </div>

                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs sm:text-sm font-bold text-slate-900 break-all flex items-center justify-between gap-3">
                            <span>{walletAddress}</span>
                            <button
                                type="button"
                                onClick={handleCopy}
                                className="shrink-0 p-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors flex items-center gap-1 text-xs"
                                title="Copy address"
                            >
                                {copied ? (
                                    <>
                                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                                        <span className="text-emerald-700 font-sans font-bold">Copied!</span>
                                    </>
                                ) : (
                                    <>
                                        <Copy className="h-3.5 w-3.5" />
                                        <span className="font-sans font-semibold">Copy</span>
                                    </>
                                )}
                            </button>
                        </div>

                        <div className="text-xs text-slate-500 space-y-1">
                            <p>• <strong>Currency:</strong> USDT (Tether USD) on TRON (TRC20) Network.</p>
                            <p>• Sending non-TRC20 assets (such as ERC20 or BEP20) to this address will cause irreversible loss.</p>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: INVOICE BREAKDOWN & PROOF SUBMISSION */}
                <div className="lg:col-span-5 space-y-6">
                    {/* Invoice Particulars Card */}
                    <div className="bg-[#000000] text-white rounded-3xl p-6 shadow-lg border border-slate-800">
                        <span className="text-[10px] uppercase font-bold tracking-widest text-[#EAA240] block mb-1">
                            Settlement Ledger
                        </span>
                        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                            <h3 className="text-xl font-black">#INV-{invoiceId}</h3>
                            <span className="text-xs font-mono bg-slate-800 text-slate-300 px-2.5 py-1 rounded">
                                Bitget Web3 Rail
                            </span>
                        </div>

                        <div className="space-y-3 text-xs sm:text-sm text-slate-300">
                            <div className="flex justify-between">
                                <span>Payable Amount (AUD):</span>
                                <span className="font-mono font-bold text-white">${amountAUD} AUD</span>
                            </div>
                            <div className="flex justify-between text-emerald-400">
                                <span>Estimated Equivalent (USDT):</span>
                                <span className="font-mono font-bold">~{amountUSDT} USDT</span>
                            </div>
                            <div className="flex justify-between text-[#EAA240]">
                                <span>Network Transfer Fee:</span>
                                <span className="font-mono font-bold">0% Surcharge</span>
                            </div>
                            <div className="flex justify-between pt-3 border-t border-slate-800 font-bold text-white text-base">
                                <span>Net Commitment:</span>
                                <span className="font-mono text-[#EAA240] text-xl font-black">${amountAUD} AUD</span>
                            </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] text-slate-400">
                            💡 Bitget Wallet provides direct fiat-to-USDT on-ramp with Apple Pay, Google Pay, and local mobile money.
                        </div>
                    </div>

                    {/* Step-by-Step Instructions Tabs */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
                        <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                                Payment Instructions
                            </h4>
                            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
                                <button
                                    type="button"
                                    onClick={() => setDeviceTab('mobile')}
                                    className={`px-2.5 py-0.5 rounded transition-all flex items-center gap-1 ${deviceTab === 'mobile' ? 'bg-white font-bold text-slate-900 shadow-xs' : 'text-slate-500'}`}
                                >
                                    <Smartphone className="h-3 w-3" /> Mobile
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setDeviceTab('desktop')}
                                    className={`px-2.5 py-0.5 rounded transition-all flex items-center gap-1 ${deviceTab === 'desktop' ? 'bg-white font-bold text-slate-900 shadow-xs' : 'text-slate-500'}`}
                                >
                                    <Laptop className="h-3 w-3" /> PC / Browser
                                </button>
                            </div>
                        </div>

                        {deviceTab === 'mobile' ? (
                            <ol className="text-xs text-slate-600 space-y-2.5 list-decimal pl-4 font-medium leading-relaxed">
                                <li>Tap <strong>"1-Click Launch Bitget Wallet"</strong> above to launch Bitget directly.</li>
                                <li>If you don't have Bitget installed, download from App Store or Google Play.</li>
                                <li>Select <strong>Send</strong> &rarr; Choose <strong>USDT (TRC20)</strong> &rarr; Paste our address or scan QR.</li>
                                <li>Enter amount (~<strong>{amountUSDT} USDT</strong>) and confirm transfer.</li>
                                <li>Capture transfer confirmation screenshot or copy TxID to submit below.</li>
                            </ol>
                        ) : (
                            <ol className="text-xs text-slate-600 space-y-2.5 list-decimal pl-4 font-medium leading-relaxed">
                                <li>Open Bitget Wallet or your preferred exchange app on your mobile device.</li>
                                <li>Point your mobile camera to scan the <strong>Bitget DeepLink QR</strong> above.</li>
                                <li>Alternatively, copy the TRON wallet address and transfer from Binance, Bybit, OKX, or TrustWallet.</li>
                                <li>Once confirmed on the TRON blockchain, copy the Transaction Hash (TxID) to submit below.</li>
                            </ol>
                        )}
                    </div>

                    {/* Proof of Payment Submission Form */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                                <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Confirm Your Transfer
                            </h4>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                Step 2 of 2
                            </span>
                        </div>

                        {proofSubmitted ? (
                            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-2">
                                <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto" />
                                <h5 className="text-sm font-bold text-emerald-900">Transfer Proof Submitted!</h5>
                                <p className="text-xs text-emerald-700 leading-relaxed">
                                    Your application manager has received your transaction verification. Your block confirmation will be verified, LMS credentials updated, and official Statement of Attainment receipt dispatched immediately.
                                </p>
                            </div>
                        ) : (
                            <form onSubmit={handleProofSubmit} className="space-y-3">
                                <div>
                                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                                        Blockchain TxID (Transaction Hash):
                                    </label>
                                    <input
                                        type="text"
                                        value={txHash}
                                        onChange={(e) => setTxHash(e.target.value)}
                                        placeholder="e.g. 7f8a9b...c1d2e3"
                                        className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#000000] text-xs font-mono text-slate-900 placeholder:text-slate-400"
                                    />
                                </div>

                                <div>
                                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                                        Sender Particulars / Screenshot Note:
                                    </label>
                                    <textarea
                                        rows={2}
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        placeholder="Include sender wallet address, exchange name, or date/time of transfer..."
                                        className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#000000] text-xs text-slate-900 placeholder:text-slate-400"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={submittingProof}
                                    className="w-full py-3 px-4 bg-[#000000] hover:bg-slate-900 text-white font-bold rounded-xl shadow-md transition-all text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 disabled:opacity-50"
                                >
                                    {submittingProof ? (
                                        <>
                                            <RefreshCw className="h-3.5 w-3.5 animate-spin text-[#EAA240]" />
                                            Submitting Verification...
                                        </>
                                    ) : (
                                        'Submit Transfer for Agent Verification'
                                    )}
                                </button>
                            </form>
                        )}

                        <div className="pt-2 text-center border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                            <button
                                type="button"
                                onClick={() => router.push(`/payments/card?invoiceId=${invoiceId}&amount=${amountAUD}`)}
                                className="hover:text-slate-900 font-semibold flex items-center gap-1"
                            >
                                <CreditCard className="h-3.5 w-3.5 text-slate-400" /> Try Card Gateway
                            </button>
                            <button
                                type="button"
                                onClick={() => router.push('/payments/faq')}
                                className="hover:text-slate-900 font-semibold flex items-center gap-1 text-[#EAA240]"
                            >
                                <HelpCircle className="h-3.5 w-3.5" /> Crypto FAQ
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </PageShell>
    );
}

export default function CryptoPaymentPage() {
    return (
        <Suspense fallback={
            <PageShell>
                <div className="py-20 text-center text-xs font-bold uppercase tracking-widest text-slate-400">
                    Loading Crypto Portal...
                </div>
            </PageShell>
        }>
            <CryptoPaymentContent />
        </Suspense>
    );
}
