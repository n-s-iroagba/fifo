'use client';

import React from 'react';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { PublicFooter } from '@/components/layout/PublicFooter';

export default function CompliancePage() {
    return (
        <div className="bg-white text-blue-900 antialiased flex flex-col min-h-screen font-sans">
            <PublicHeader />
            <main className="pt-32 pb-32 flex-1 px-8 lg:px-16">
                <div className="max-w-[1200px] mx-auto">
                    <header className="mb-24">
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-400 block mb-6">Security Integrity</span>
                        <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-blue-900 mb-8 leading-tight">Compliance <br /><span className="text-blue-400">Protocols.</span></h1>
                        <p className="text-blue-500 text-lg lg:text-xl max-w-[700px] leading-relaxed font-medium">
                            BlueCollarRecruitment operates under rigorous regulatory and security frameworks to ensure every interaction within our ecosystem is verified and secure.
                        </p>
                    </header>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                        <div className="p-10 bg-blue-50 rounded-[2.5rem] border border-blue-100 space-y-6">
                            <span className="material-symbols-outlined text-4xl text-blue-900">verified_user</span>
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-900">ISO Standards</h3>
                            <p className="text-xs text-blue-500 leading-relaxed font-bold uppercase tracking-widest">Our documentation and process mapping follow ISO 29148 requirements for quality and traceability.</p>
                        </div>
                        <div className="p-10 bg-blue-50 rounded-[2.5rem] border border-blue-100 space-y-6">
                            <span className="material-symbols-outlined text-4xl text-blue-900">shield</span>
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-900">Data Sovereignty</h3>
                            <p className="text-xs text-blue-500 leading-relaxed font-bold uppercase tracking-widest">Full GDPR and local privacy compliance ensuring you retain ownership of your professional dossier.</p>
                        </div>
                        <div className="p-10 bg-blue-50 rounded-[2.5rem] border border-blue-100 space-y-6">
                            <span className="material-symbols-outlined text-4xl text-blue-900">monitoring</span>
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-900">Audit Logs</h3>
                            <p className="text-xs text-blue-500 leading-relaxed font-bold uppercase tracking-widest">Real-time monitoring and immutable audit logs (NFR-SEC-006) of all high-privilege registry operations.</p>
                        </div>
                    </div>
                </div>
            </main>
            <PublicFooter />
        </div>
    );
}
