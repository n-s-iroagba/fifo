'use client';

import React from 'react';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { PublicFooter } from '@/components/layout/PublicFooter';

export default function TermsPage() {
    return (
        <div className="bg-white text-blue-900 antialiased flex flex-col min-h-screen font-sans">
            <PublicHeader />
            <main className="pt-32 pb-32 flex-1 px-8 lg:px-16">
                <div className="max-w-[1200px] mx-auto">
                    <header className="mb-24">
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-400 block mb-6">Legal Framework</span>
                        <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-blue-900 mb-8 leading-tight">Service <br /><span className="text-blue-400">Agreement.</span></h1>
                        <p className="text-blue-500 text-lg lg:text-xl max-w-[700px] leading-relaxed font-medium">
                            By accessing the BlueCollar infrastructure, you agree to adhere to our professional conduct protocols and talent verification standards.
                        </p>
                    </header>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
                        <section className="space-y-6">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-900">01. Talent Obligations</h3>
                            <p className="text-sm text-blue-500 leading-loose">Applicants must provide historically accurate career artifacts. Misrepresentation of skills or experience results in immediate registry de-authorization.</p>
                        </section>
                        <section className="space-y-6">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-900">02. Platform Usage</h3>
                            <p className="text-sm text-blue-500 leading-loose">The infrastructure is provided for professional placement only. Automated data extraction or scraping is strictly prohibited under our security protocols.</p>
                        </section>
                        <section className="space-y-6">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-900">03. Verification Authority</h3>
                            <p className="text-sm text-blue-500 leading-loose">BlueCollar reserves the right to verify all submitted credentials through third-party specialized auditing services to maintain the integrity of our network.</p>
                        </section>
                        <section className="space-y-6">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-900">04. Liability Protection</h3>
                            <p className="text-sm text-blue-500 leading-loose">While we curate elite roles, the final employment contract is an independent agreement between the talent and the hiring organization.</p>
                        </section>
                    </div>
                </div>
            </main>
            <PublicFooter />
        </div>
    );
}
