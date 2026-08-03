'use client';

import React from 'react';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { PublicFooter } from '@/components/layout/PublicFooter';

export default function SupportPage() {
    return (
        <div className="bg-white text-blue-900 antialiased flex flex-col min-h-screen font-sans">
            <PublicHeader />
            <main className="pt-32 pb-32 flex-1 px-8 lg:px-16">
                <div className="max-w-[1200px] mx-auto text-center">
                    <header className="mb-24 flex flex-col items-center">
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-400 block mb-6">Concierge Services</span>
                        <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-blue-900 mb-8 leading-tight uppercase italic tracking-tighter">Support <br /><span className="text-blue-400">Terminal.</span></h1>
                        <p className="text-blue-500 text-base lg:text-lg max-w-[600px] leading-relaxed font-medium">
                            Our team provides elite-level support for talent and hiring partners. Reach out to our specialized descriptors for immediate assistance.
                        </p>
                    </header>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-[800px] mx-auto text-left">
                        <div className="bg-white p-12 rounded-[3rem] border border-blue-100 shadow-2xl shadow-blue-900/5 group hover:border-blue-900 transition-all">
                            <span className="material-symbols-outlined text-3xl mb-6 text-blue-400 group-hover:text-blue-900">chat</span>
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-900 mb-4">Talent Support</h3>
                            <p className="text-sm text-blue-500 mb-8 font-medium">Assistance with profile synchronization, CV verification, or application tracking.</p>
                            <a href="mailto:support@BlueCollar.com" className="text-[10px] font-black uppercase tracking-widest text-blue-900 underline">support@BlueCollar.com</a>
                        </div>
                        <div className="bg-white p-12 rounded-[3rem] border border-blue-100 shadow-2xl shadow-blue-900/5 group hover:border-blue-900 transition-all">
                            <span className="material-symbols-outlined text-3xl mb-6 text-blue-400 group-hover:text-blue-900">business_center</span>
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-900 mb-4">Partner Relations</h3>
                            <p className="text-sm text-blue-500 mb-8 font-medium">Inquiries regarding enterprise placement, role curation, and talent registry access.</p>
                            <a href="mailto:partners@BlueCollar.com" className="text-[10px] font-black uppercase tracking-widest text-blue-900 underline">partners@BlueCollar.com</a>
                        </div>
                    </div>
                </div>
            </main>
            <PublicFooter />
        </div>
    );
}
