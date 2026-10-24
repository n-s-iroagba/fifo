'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShieldCheck, Phone, Mail, ExternalLink, FileText, CheckCircle2 } from 'lucide-react';

export function Footer() {
    const [activeModal, setActiveModal] = useState<'terms' | 'privacy' | null>(null);

    return (
        <footer className="bg-black text-slate-300 border-t border-neutral-800 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
                    {/* Brand Col */}
                    <div className="space-y-4 md:col-span-1">
                        <Link href="/" className="inline-block">
                            <img
                                src="/certhero-logo.png"
                                alt="Cert Hero"
                                className="h-12 w-auto object-contain bg-white rounded p-1"
                            />
                        </Link>
                        <p className="text-xs text-slate-400 leading-relaxed font-medium">
                            End-to-end support for Australian Trade Certification, Overseas Skills Assessments, Mining/FIFO operations, and Safety Compliance.
                        </p>
                        <div className="text-[11px] text-slate-400 space-y-1">
                            <p className="font-semibold text-slate-300">Cert Hero Pty Ltd</p>
                            <p>ABN: 46 693 035 184 | ACN: 693 035 184</p>
                        </div>
                    </div>

                    {/* Pathways */}
                    <div>
                        <h4 className="text-xs font-black uppercase tracking-widest text-[#EAA240] mb-4">
                            Hero Pathways
                        </h4>
                        <ul className="space-y-2.5 text-xs text-slate-400 font-medium">
                            <li><Link href="/catalog?category=overseas" className="hover:text-white transition-colors">Overseas Skills Assessment</Link></li>
                            <li><Link href="/catalog?category=civil_mining" className="hover:text-white transition-colors">Mining & FIFO Certification</Link></li>
                            <li><Link href="/catalog?category=high_risk" className="hover:text-white transition-colors">Offshore Ready Certification</Link></li>
                            <li><Link href="/catalog" className="hover:text-white transition-colors">Apprenticeship Support</Link></li>
                            <li><Link href="/catalog?category=safety" className="hover:text-white transition-colors">Site Ready Tickets</Link></li>
                            <li><Link href="/#contact" className="hover:text-white transition-colors">Career Development</Link></li>
                        </ul>
                    </div>

                    {/* Candidate Portal */}
                    <div>
                        <h4 className="text-xs font-black uppercase tracking-widest text-[#EAA240] mb-4">
                            Candidate Portal
                        </h4>
                        <ul className="space-y-2.5 text-xs text-slate-400 font-medium">
                            <li><Link href="/login" className="hover:text-white transition-colors">Candidate Sign In</Link></li>
                            <li><Link href="/psychometric" className="hover:text-[#EAA240] text-amber-400 font-bold transition-colors">Psychometric Test Portal</Link></li>
                            <li><Link href="/dashboard" className="hover:text-white transition-colors">LMS Exam Dashboard</Link></li>
                            <li><Link href="/my-certifications" className="hover:text-white transition-colors">Statement of Attainment</Link></li>
                            <li><Link href="/payments" className="hover:text-white transition-colors">Invoice & Receipts</Link></li>
                        </ul>
                    </div>

                    {/* Contact & Legal */}
                    <div>
                        <h4 className="text-xs font-black uppercase tracking-widest text-[#EAA240] mb-4">
                            Contact Us
                        </h4>
                        <ul className="space-y-2.5 text-xs text-slate-400 font-medium">
                            <li className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-[#EAA240]" />
                                <a href="mailto:Info@certhero.com.au" className="hover:text-white transition-colors">Info@certhero.com.au</a>
                            </li>
                            <li className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-[#EAA240]" />
                                <a href="tel:+61447000919" className="hover:text-white transition-colors">+61 447 000 919</a>
                            </li>
                            <li className="pt-2">
                                <a
                                    href="https://www.certhero.com.au"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-bold"
                                >
                                    Official Site: certhero.com.au <ExternalLink className="w-3 h-3" />
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-neutral-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
                    <p>© {new Date().getFullYear()} Cert Hero Pty Ltd | ABN 46 693 035 184 | ACN 693 035 184</p>
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => setActiveModal('terms')}
                            className="hover:text-slate-300 transition-colors underline cursor-pointer"
                        >
                            Terms & Conditions
                        </button>
                        <span>|</span>
                        <button
                            onClick={() => setActiveModal('privacy')}
                            className="hover:text-slate-300 transition-colors underline cursor-pointer"
                        >
                            Privacy Policy
                        </button>
                    </div>
                </div>
            </div>

            {/* Terms Modal */}
            {activeModal === 'terms' && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 animate-in fade-in">
                    <div className="bg-white text-slate-900 rounded-2xl max-w-2xl w-full p-6 max-h-[85vh] overflow-y-auto shadow-2xl">
                        <div className="flex items-center justify-between border-b pb-4 mb-4">
                            <h3 className="text-lg font-black uppercase text-black">Terms & Conditions</h3>
                            <button
                                onClick={() => setActiveModal(null)}
                                className="text-slate-500 hover:text-black font-bold text-xl px-2"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="text-xs text-slate-700 space-y-3 leading-relaxed">
                            <p><strong>1. Introduction:</strong> Welcome to Cert Hero. By accessing our training platform, skills assessment guidance, and candidate evaluation portals, you agree to these Terms and Conditions.</p>
                            <p><strong>2. Services:</strong> Cert Hero provides training coordination, Australian trade skills advisory, and RTO LMS assessment services. All formal examinations are conducted under registered RTO standards and AQF compliance frameworks.</p>
                            <p><strong>3. Examination Integrity:</strong> Candidate examinations and assessments are strictly timed and verified. Any academic dishonesty will result in immediate disqualification and voiding of candidate submissions.</p>
                            <p><strong>4. Intellectual Property:</strong> All curriculum materials, question databases, and brand trademarks remain the sole property of Cert Hero Pty Ltd.</p>
                            <p><strong>5. Governing Law:</strong> These terms are governed by the laws of the Commonwealth of Australia.</p>
                        </div>
                        <div className="mt-6 text-right">
                            <button
                                onClick={() => setActiveModal(null)}
                                className="bg-black text-white px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-slate-800"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Privacy Policy Modal */}
            {activeModal === 'privacy' && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 animate-in fade-in">
                    <div className="bg-white text-slate-900 rounded-2xl max-w-2xl w-full p-6 max-h-[85vh] overflow-y-auto shadow-2xl">
                        <div className="flex items-center justify-between border-b pb-4 mb-4">
                            <h3 className="text-lg font-black uppercase text-black">Privacy Policy</h3>
                            <button
                                onClick={() => setActiveModal(null)}
                                className="text-slate-500 hover:text-black font-bold text-xl px-2"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="text-xs text-slate-700 space-y-3 leading-relaxed">
                            <p><strong>1. Information Collection:</strong> Cert Hero collects candidate personal details, trade qualification records, and assessment submissions solely for the purpose of processing trade certifications and employment verifications.</p>
                            <p><strong>2. Compliance with Privacy Act:</strong> We strictly adhere to the Australian Privacy Principles (APPs) established under the Privacy Act 1988 (Cth).</p>
                            <p><strong>3. Data Security:</strong> Candidate information and test scores are encrypted in transit and at rest. We never sell your personal information to third parties.</p>
                            <p><strong>4. Access & Correction:</strong> Candidates can review and request updates to their profile records by contacting Info@certhero.com.au.</p>
                        </div>
                        <div className="mt-6 text-right">
                            <button
                                onClick={() => setActiveModal(null)}
                                className="bg-black text-white px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-slate-800"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </footer>
    );
}
