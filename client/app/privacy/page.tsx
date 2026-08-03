'use client';

import React from 'react';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { PublicFooter } from '@/components/layout/PublicFooter';

export default function PrivacyPolicyPage() {
    return (
        <div className="bg-white text-on-surface antialiased flex flex-col min-h-screen font-sans">
            <PublicHeader />

            <main className="pt-32 pb-32 flex-1 px-8 lg:px-16">
                <div className="max-w-[1200px] mx-auto">
                    <header className="mb-24 lg:mb-32">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-12 h-1 bg-primary rounded-full"></span>
                            <span className="text-[10px] font-bold text-primary uppercase tracking-[0.4em]">Privacy Excellence</span>
                        </div>
                        <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-on-surface mb-8">Data Protection <br /><span className="text-primary">& Transparency</span></h1>
                        <p className="text-on-surface-variant text-base lg:text-lg max-w-[640px] leading-relaxed font-light">
                            At BlueCollar, we prioritize your professional privacy. Our practices are designed to ensure your data is handled with clarity, security, and absolute integrity.
                        </p>
                    </header>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-20 gap-y-32">
                        {/* Section 01 */}
                        <section className="space-y-8">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-primary/5 rounded-xl text-primary">
                                    <span className="material-symbols-outlined text-3xl">fingerprint</span>
                                </div>
                                <h2 className="text-[10px] font-bold text-on-surface uppercase tracking-[0.4em]">01. Data Collection</h2>
                            </div>
                            <div className="space-y-6 text-on-surface-variant leading-[1.8] text-sm font-medium">
                                <p>We collect essential professional identifiers including your name, email, and verified career history. This information is utilized solely to facilitate high-fidelity job matches within our curated network.</p>
                                <ul className="space-y-3 list-none p-0">
                                    <li className="flex gap-3 items-center">
                                        <span className="material-symbols-outlined text-primary text-lg">check_circle</span>
                                        <span>Encrypted Profile Intelligence</span>
                                    </li>
                                    <li className="flex gap-3 items-center">
                                        <span className="material-symbols-outlined text-primary text-lg">check_circle</span>
                                        <span>Verified Career Artifacts</span>
                                    </li>
                                </ul>
                            </div>
                        </section>

                        {/* Section 02 */}
                        <section className="space-y-8">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-secondary-container/30 rounded-xl text-primary">
                                    <span className="material-symbols-outlined text-3xl">hub</span>
                                </div>
                                <h2 className="text-[10px] font-bold text-on-surface uppercase tracking-[0.4em]">02. Information Usage</h2>
                            </div>
                            <div className="space-y-6 text-on-surface-variant leading-[1.8] text-sm font-medium">
                                <p>Your data is processed to optimize recruitment outcomes. We analyze skill matrices and interaction patterns to ensure you are only presented with roles that align with your professional trajectory.</p>
                                <div className="p-6 bg-surface-container-low rounded-2xl border border-blue-100 italic text-xs">
                                    "We do not sell your data. We curate opportunities based on your explicit professional goals."
                                </div>
                            </div>
                        </section>

                        {/* Section 03 */}
                        <section className="space-y-8">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-primary/5 rounded-xl text-primary">
                                    <span className="material-symbols-outlined text-3xl">encrypted</span>
                                </div>
                                <h2 className="text-[10px] font-bold text-on-surface uppercase tracking-[0.4em]">03. Security Integrity</h2>
                            </div>
                            <div className="space-y-6 text-on-surface-variant leading-[1.8] text-sm font-medium">
                                <p>We implement bank-grade encryption and multi-factor authentication protocols. Your professional assets are stored in isolated, access-controlled cloud infrastructure monitored 24/7/365.</p>
                                <p>Continuous threat detection (NFR-SEC-006) ensures that your registry profile remains invulnerable to unauthorized access attempts.</p>
                            </div>
                        </section>

                        {/* Section 04 */}
                        <section className="space-y-8">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-secondary-container/30 rounded-xl text-primary">
                                    <span className="material-symbols-outlined text-3xl">verified_user</span>
                                </div>
                                <h2 className="text-[10px] font-bold text-on-surface uppercase tracking-[0.4em]">04. User Empowerment</h2>
                            </div>
                            <div className="space-y-6 text-on-surface-variant leading-[1.8] text-sm font-medium">
                                <p>You retain full sovereignty over your professional profile. You may request data erasure or rectification at any moment through our centralized compliance portal.</p>
                                <div className="pt-8">
                                    <a href="mailto:privacy@BlueCollar.com" className="inline-flex items-center gap-3 bg-on-surface text-surface px-8 py-4 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] shadow-xl hover:bg-blue-800 transition-all active:scale-[0.98]">
                                        <span className="material-symbols-outlined text-lg">mail</span>
                                        Request Data Erasure
                                    </a>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </main>

            <PublicFooter />
        </div>
    );
}
