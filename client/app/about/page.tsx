'use client';

import React from 'react';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { PublicFooter } from '@/components/layout/PublicFooter';

export default function AboutPage() {
    return (
        <div className="bg-white text-blue-900 antialiased flex flex-col min-h-screen font-sans">
            <PublicHeader />
            <main className="pt-32 pb-32 flex-1 px-8 lg:px-16">
                <div className="max-w-[1200px] mx-auto">
                    <header className="mb-24">
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-400 block mb-6">Our Protocol</span>
                        <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-blue-900 mb-8 leading-tight">Global Placement <br /><span className="text-blue-400">Simplified.</span></h1>
                        <p className="text-blue-500 text-lg lg:text-xl max-w-[700px] leading-relaxed font-medium">
                            BlueCollar is a minimalist infrastructure for elite talent placement. We bridge the gap between high-impact professionals and verified global opportunities through a streamlined, secure registry.
                        </p>
                    </header>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        <div className="space-y-6">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-900">The Mission</h3>
                            <p className="text-sm text-blue-500 leading-loose">To digitize and accelerate the global recruitment cycle while maintaining the highest levels of data integrity and talent verification.</p>
                        </div>
                        <div className="space-y-6">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-900">The Method</h3>
                            <p className="text-sm text-blue-500 leading-loose">By stripping away the noise of traditional job boards, we provide a focused, high-fidelity experience for both talent and employers.</p>
                        </div>
                        <div className="space-y-6">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-900">The Result</h3>
                            <p className="text-sm text-blue-500 leading-loose">Direct, friction-less connections that result in faster placements and better cultural alignment across international borders.</p>
                        </div>
                    </div>
                </div>
            </main>
            <PublicFooter />
        </div>
    );
}
