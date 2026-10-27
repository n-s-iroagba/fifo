'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { 
    HelpCircle, ShieldCheck, Wallet, Lock, CheckCircle2, ArrowRight,
    RefreshCw, AlertCircle, Building2, ExternalLink, CreditCard
} from 'lucide-react';
import { PageShell } from '@/components/PageShell';

export default function PaymentFaqPage() {
    const router = useRouter();

    const faqs = [
        {
            q: "Why does CertHero offer and recommend Cryptocurrency (USDT TRC20)?",
            a: "International candidates operating from Africa, Asia, and other offshore jurisdictions frequently face arbitrary cross-border banking limits, high foreign exchange conversion markups (3–5%), and multi-day SWIFT wire holds. By partnering with Bitget Web3 to accept USDT on the TRON network, CertHero eliminates intermediary banking delays. Payments are confirmed in seconds with near-zero transfer fees, ensuring your training enrollment and Australian visa timeline stay on schedule without administrative holdups."
        },
        {
            q: "Is Bitget safe and how is CertHero affiliated with Bitget?",
            a: "Bitget is one of the world's leading, fully compliant Web3 financial institutions with over 30 million global users and audited 100% proof-of-reserves. CertHero maintains an accredited enterprise partnership with Bitget Web3 to provide candidates with seamless, secure non-custodial transactions. You retain full control of your private funds, and transfers are publicly verifiable on the TRON blockchain ledger."
        },
        {
            q: "What is the Host Employer Refund Guarantee (Policy 3G)?",
            a: "Under our formal corporate covenant with MACA Limited: The host employer refunds 100% of your training expenditure upon successful completion of your training modules and acquisition of the required High Risk Work / competency tickets. In the event of assessment failure, the employer refunds 80% (with the remaining 20% retained for institutional RTO administrative and assessment processing fees). In either outcome, your financial exposure is strictly protected."
        },
        {
            q: "Can I pay in installments?",
            a: "Yes. Candidates are permitted to pay an initial 50% commitment deposit ($360.00 AUD) to unlock their course syllabus and begin coursework. The remaining 50% balance can be settled midway through your study or prior to sitting your final credentialing examinations."
        },
        {
            q: "How does the Bitget DeepLink QR work?",
            a: "Our QR code integrates Bitget's official universal deep linking protocol (bkcode.vip). When scanned with your mobile camera or clicked on your device, it automatically detects if Bitget Wallet is installed and opens directly to our checkout interface. If the app is not installed, it safely redirects you to the Apple App Store, Google Play Store, or Chrome Web Store to install the official application."
        },
        {
            q: "Can I send USDT from other exchanges like Binance, Bybit, or OKX?",
            a: "Yes. While Bitget is our preferred partner, you can transfer USDT from any international exchange (including Binance, Bybit, OKX, KuCoin) or personal wallet (Trust Wallet, TronLink). Ensure that you select the TRON (TRC20) network when withdrawing to our official address."
        },
        {
            q: "What happens after I make payment?",
            a: "Once your transfer is broadcast, take a screenshot of your confirmation or copy the Transaction Hash (TxID) and submit it on the Crypto Checkout page, or reply directly to your invoice email. Our finance desk verifies the block immediately, records your payment in our national registry, unlocks your full LMS modules, and issues your official Tax Receipt."
        },
        {
            q: "How do I schedule live assistance with an application manager?",
            a: "Simply reply to your Tax Invoice email with your preferred date and local time (including timezone). Your assigned application manager will be online in real time to guide you step-by-step through the process and ensure an effortless transaction."
        }
    ];

    return (
        <PageShell>
            {/* Header */}
            <div className="mb-6">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAA240]/15 text-[#EAA240] font-bold text-xs uppercase tracking-wider w-fit mb-2">
                    <HelpCircle className="h-3.5 w-3.5" /> Candidate Guidance Desk
                </div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                    Payment &amp; Cryptocurrency FAQ
                </h1>
                <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1 max-w-2xl">
                    Clear, transparent answers regarding payment channels, Bitget Web3 safety, the 100% employer refund covenant, and step-by-step transfer procedures.
                </p>
            </div>
            <div className="w-full h-0.5 bg-[#EAA240] mb-8" />

            {/* REFUND HIGHLIGHT CARD */}
            <div className="mb-8 bg-emerald-50 border-2 border-emerald-500/40 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-emerald-600 text-white rounded-xl shrink-0 mt-0.5">
                        <ShieldCheck className="h-6 w-6" />
                    </div>
                    <div>
                        <span className="text-xs font-black uppercase tracking-wider text-emerald-950 block">
                            Policy 3G Host Employer Refund Covenant
                        </span>
                        <p className="text-xs sm:text-sm text-emerald-800 font-medium leading-relaxed mt-1">
                            MACA Limited guarantees <strong>100% refund</strong> upon successful completion of your training and ticket acquisition, and <strong>80% refund</strong> in the event of failure (20% institutional admin fee).
                        </p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={() => router.push('/payments/crypto')}
                    className="shrink-0 py-3 px-6 bg-[#000000] hover:bg-slate-900 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                >
                    <Wallet className="h-4 w-4 text-[#EAA240]" /> Go to Crypto Checkout
                </button>
            </div>

            {/* FAQS ACCORDION / LIST */}
            <div className="space-y-4">
                {faqs.map((faq, idx) => (
                    <div 
                        key={idx} 
                        className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs hover:border-slate-300 transition-colors"
                    >
                        <h3 className="text-base font-bold text-slate-900 flex items-start gap-2.5 mb-2">
                            <span className="text-[#EAA240] font-black text-sm shrink-0 mt-0.5">Q{idx + 1}.</span>
                            {faq.q}
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pl-6 font-medium">
                            {faq.a}
                        </p>
                    </div>
                ))}
            </div>

            {/* ACTION FOOTER */}
            <div className="mt-10 p-8 bg-slate-900 text-white rounded-3xl text-center space-y-4">
                <span className="text-xs font-bold text-[#EAA240] uppercase tracking-widest block">
                    Ready to Complete Your Prerequisite Certification?
                </span>
                <h2 className="text-xl sm:text-2xl font-black">
                    Fast, Protected, and Fully Refundable Settlement
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
                    Have your invoice reference ready and choose your preferred settlement route. Your application manager is on standby to assist you at every step.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                    <button
                        type="button"
                        onClick={() => router.push('/payments/crypto')}
                        className="py-3.5 px-6 bg-[#EAA240] hover:bg-[#d89130] text-[#000000] font-black rounded-xl text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-md"
                    >
                        <Wallet className="h-4 w-4" /> Open Bitget Crypto Checkout
                    </button>
                    <button
                        type="button"
                        onClick={() => router.push('/payments/card')}
                        className="py-3.5 px-6 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all flex items-center gap-2 border border-slate-700"
                    >
                        <CreditCard className="h-4 w-4 text-[#EAA240]" /> Try Card Gateway
                    </button>
                </div>
            </div>
        </PageShell>
    );
}
