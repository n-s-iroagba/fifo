'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, ExternalLink, CheckCircle2 } from 'lucide-react';

export function Footer() {
    return (
        <footer className="bg-[#0f172a] text-slate-300 border-t border-slate-800 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
                    {/* Brand Col */}
                    <div className="space-y-4 md:col-span-1">
                        <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#ED9139] text-[#0f172a] font-black text-base">
                                C
                            </div>
                            <span className="text-xl font-black tracking-tight text-white">
                                Cert<span className="text-[#ED9139]">Hero</span>
                            </span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            Authorised Registered Training Organisation delivery portal for Australian Trade Certification, High-Risk Work Licensing (HRWL), Mining, and FIFO Operations.
                        </p>
                        <div className="flex items-center gap-2 text-xs font-semibold text-[#ED9139]">
                            <ShieldCheck className="h-4 w-4" />
                            <span>ASQA & AQF Compliant Partner</span>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Training Pathways</h4>
                        <ul className="space-y-2 text-xs text-slate-400">
                            <li><Link href="/catalog" className="hover:text-[#ED9139] transition-colors">Course Catalog</Link></li>
                            <li><Link href="/catalog?category=high_risk" className="hover:text-[#ED9139] transition-colors">High Risk Work Licences</Link></li>
                            <li><Link href="/catalog?category=civil_mining" className="hover:text-[#ED9139] transition-colors">Civil & Mining Operations</Link></li>
                            <li><Link href="/catalog?category=safety" className="hover:text-[#ED9139] transition-colors">Site Safety & Compliance</Link></li>
                        </ul>
                    </div>

                    {/* Candidate Portal */}
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Candidate Services</h4>
                        <ul className="space-y-2 text-xs text-slate-400">
                            <li><Link href="/login" className="hover:text-[#ED9139] transition-colors">LMS Sign In</Link></li>
                            <li><Link href="/dashboard" className="hover:text-[#ED9139] transition-colors">Candidate Dashboard</Link></li>
                            <li><Link href="/my-certifications" className="hover:text-[#ED9139] transition-colors">Digital Statements of Attainment</Link></li>
                            <li><Link href="/payments" className="hover:text-[#ED9139] transition-colors">Payment Invoices & Receipts</Link></li>
                        </ul>
                    </div>

                    {/* National Frameworks */}
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Accreditation Standards</h4>
                        <ul className="space-y-2 text-xs text-slate-400">
                            <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Nationally Recognised Training</li>
                            <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Australian Qualifications Framework</li>
                            <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> SafeWork Australia Compliant</li>
                            <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Employer-Sponsored RPL Support</li>
                        </ul>
                        <div className="mt-4 pt-4 border-t border-slate-800">
                            <a
                                href="https://www.certhero.com.au"
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-[#ED9139] transition-colors"
                            >
                                Official Portal: certhero.com.au <ExternalLink className="h-3 w-3" />
                            </a>
                        </div>
                    </div>
                </div>

                <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
                    <p>© {new Date().getFullYear()} CertHero RTO Training Services. All rights reserved.</p>
                    <p className="text-slate-400">
                        Overseas candidate portal operated in technical partnership with Blue Collar Recruitment Pty Ltd.
                    </p>
                </div>
            </div>
        </footer>
    );
}
