'use client';

import React from 'react';
import { useApiQuery } from '@/lib/hooks';
import { Faq } from '@/types/models';

interface FaqApiResponse {
    success: boolean;
    data: Faq[];
    slots: {
        process: Faq | null;
        payment: Faq | null;
    };
    count: number;
}

export default function ApplicantFaqsPage() {
    const { data: faqRes, isLoading } = useApiQuery<FaqApiResponse>(
        ['applicant-faqs'],
        '/faqs'
    );

    const faqs = faqRes?.data || [];
    const processFaq = faqRes?.slots?.process || faqs.find((f) => f.type === 'process') || null;
    const paymentFaq = faqRes?.slots?.payment || faqs.find((f) => f.type === 'payment') || null;

    return (
        <div className="font-sans max-w-6xl mx-auto space-y-8 pb-16">
            {/* Hero / Header */}
            <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 rounded-3xl p-8 md:p-10 text-white relative overflow-hidden shadow-xl shadow-blue-900/10">
                <div className="relative z-10 max-w-2xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-blue-200 text-xs font-bold uppercase tracking-wider mb-4 border border-white/10">
                        <span className="material-symbols-outlined text-sm">smart_toy</span>
                        24/7 AI Guidance Hub
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-3">
                        Frequently Asked Questions & AI Assistants
                    </h1>
                    <p className="text-blue-200 text-sm leading-relaxed">
                        Need immediate help with your application journey or payment milestones? Access our interactive AI shared chats below for instant, clear answers at every step.
                    </p>
                </div>

                <div className="absolute right-6 -bottom-6 opacity-10 hidden md:block select-none pointer-events-none">
                    <span className="material-symbols-outlined text-[200px]">forum</span>
                </div>
            </div>

            {/* AI Assistant Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 1. PROCESS AI ASSISTANT */}
                <div className="bg-white rounded-3xl border border-blue-100 shadow-sm hover:shadow-md transition-all p-8 flex flex-col justify-between group">
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                                <span className="material-symbols-outlined text-3xl">account_tree</span>
                            </div>
                            <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-blue-100 text-blue-800">
                                FIFO Process Guide
                            </span>
                        </div>

                        <h2 className="text-xl font-bold text-blue-900 mb-2">
                            {processFaq?.title || 'FIFO Process & Vetting AI Assistant'}
                        </h2>

                        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                            {processFaq?.description ||
                                'Get instant guidance on your application journey, vetting checks, ticket exam prerequisites, Aveling courseware, interview bookings, and job nominations.'}
                        </p>

                        <div className="bg-blue-50/60 rounded-2xl p-4 border border-blue-100 mb-6 space-y-2">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-blue-900">Example Questions to Ask:</p>
                            <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
                                <li>&quot;How do I complete my Aveling ticket examination?&quot;</li>
                                <li>&quot;When am I eligible to book my interview schedule?&quot;</li>
                                <li>&quot;What happens after passing all module tickets?&quot;</li>
                            </ul>
                        </div>
                    </div>

                    <div>
                        {isLoading ? (
                            <div className="w-full py-3.5 bg-slate-100 text-slate-400 rounded-2xl text-xs font-bold uppercase tracking-wider text-center animate-pulse">
                                Loading assistant...
                            </div>
                        ) : processFaq?.link ? (
                            <a
                                href={processFaq.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl text-xs font-bold uppercase tracking-wider bg-blue-900 text-white hover:bg-blue-800 transition-all shadow-lg shadow-blue-900/10 group-hover:shadow-blue-900/20"
                            >
                                <span className="material-symbols-outlined text-lg">chat</span>
                                Chat with Process AI
                                <span className="material-symbols-outlined text-sm">open_in_new</span>
                            </a>
                        ) : (
                            <button
                                disabled
                                className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                            >
                                <span className="material-symbols-outlined text-base">schedule</span>
                                Available Soon
                            </button>
                        )}
                    </div>
                </div>

                {/* 2. PAYMENT AI ASSISTANT */}
                <div className="bg-white rounded-3xl border border-emerald-100 shadow-sm hover:shadow-md transition-all p-8 flex flex-col justify-between group">
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                                <span className="material-symbols-outlined text-3xl">payments</span>
                            </div>
                            <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-emerald-100 text-emerald-800">
                                Payment & Subsidies
                            </span>
                        </div>

                        <h2 className="text-xl font-bold text-slate-900 mb-2">
                            {paymentFaq?.title || 'Payment & Subsidies AI Assistant'}
                        </h2>

                        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                            {paymentFaq?.description ||
                                'Have questions regarding ticket invoices, payment milestones, official receipts, supported bank transfer details, or government training subsidies?'}
                        </p>

                        <div className="bg-emerald-50/60 rounded-2xl p-4 border border-emerald-100 mb-6 space-y-2">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-900">Example Questions to Ask:</p>
                            <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
                                <li>&quot;How do I pay for my ticket training invoice?&quot;</li>
                                <li>&quot;How are mining training subsidies applied to my fees?&quot;</li>
                                <li>&quot;Where can I find and download my official payment receipt?&quot;</li>
                            </ul>
                        </div>
                    </div>

                    <div>
                        {isLoading ? (
                            <div className="w-full py-3.5 bg-slate-100 text-slate-400 rounded-2xl text-xs font-bold uppercase tracking-wider text-center animate-pulse">
                                Loading assistant...
                            </div>
                        ) : paymentFaq?.link ? (
                            <a
                                href={paymentFaq.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl text-xs font-bold uppercase tracking-wider bg-emerald-600 text-white hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/10 group-hover:shadow-emerald-600/20"
                            >
                                <span className="material-symbols-outlined text-lg">chat</span>
                                Chat with Payment AI
                                <span className="material-symbols-outlined text-sm">open_in_new</span>
                            </a>
                        ) : (
                            <button
                                disabled
                                className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                            >
                                <span className="material-symbols-outlined text-base">schedule</span>
                                Available Soon
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Information & Usage Guide */}
            <div className="bg-white rounded-3xl border border-blue-100 p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-900 flex items-center justify-center">
                        <span className="material-symbols-outlined text-xl">help</span>
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-blue-900">How to Use Shared AI Chats</h3>
                        <p className="text-xs text-slate-500">Quick steps to get the most accurate answers from our AI models</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                        <div className="w-8 h-8 rounded-lg bg-blue-900 text-white text-xs font-bold flex items-center justify-center mb-3">1</div>
                        <h4 className="text-sm font-bold text-slate-800 mb-1">Click to Open</h4>
                        <p className="text-xs text-slate-600 leading-relaxed">
                            Click &ldquo;Chat with AI&rdquo; to launch the conversation in an external browser tab. No login is required.
                        </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                        <div className="w-8 h-8 rounded-lg bg-blue-900 text-white text-xs font-bold flex items-center justify-center mb-3">2</div>
                        <h4 className="text-sm font-bold text-slate-800 mb-1">Ask Your Questions</h4>
                        <p className="text-xs text-slate-600 leading-relaxed">
                            Type your questions naturally. The AI has been trained on our FIFO onboarding, ticket requirements, and payment policies.
                        </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                        <div className="w-8 h-8 rounded-lg bg-blue-900 text-white text-xs font-bold flex items-center justify-center mb-3">3</div>
                        <h4 className="text-sm font-bold text-slate-800 mb-1">Human Recruitment Support</h4>
                        <p className="text-xs text-slate-600 leading-relaxed">
                            For urgent personalized support with your documents or contracts, you can also contact the recruitment team via the platform.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
