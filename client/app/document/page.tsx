'use client';

import React from 'react';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { PublicFooter } from '@/components/layout/PublicFooter';

export default function DocumentPage() {
    return (
        <div className="bg-white text-blue-900 antialiased flex flex-col min-h-screen font-sans">
            <PublicHeader />
            <main className="pt-32 pb-32 flex-1 px-8 lg:px-16">
                <div className="max-w-[1200px] mx-auto">
                    <header className="mb-24 text-center">
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-400 block mb-6">Official Process Document</span>
                        <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-blue-900 mb-8 leading-tight">Recruitment & Placement <br /><span className="text-blue-400">Framework.</span></h1>
                        <p className="text-blue-500 text-lg lg:text-xl max-w-[800px] mx-auto leading-relaxed font-medium">
                            This document outlines the standard operating procedures, policies, and the complete 6-step recruitment lifecycle for all applicants on the BlueCollar platform.
                        </p>
                    </header>
                    <div className="bg-white p-12 lg:p-16 rounded-[3rem] border border-blue-100 mb-12 shadow-sm">
                        <h2 className="text-2xl font-black italic text-blue-900 mb-8 uppercase tracking-tight">Introduction & Ecosystem Overview</h2>
                        <div className="space-y-6 text-sm text-blue-600 leading-loose">
                            <p>
                                Welcome to the <strong>Blue Collar Recruitment Ecosystem</strong>. This platform is designed as an end-to-end recruitment and placement portal specifically built for Fly-In-Fly-Out (FIFO) professionals. Our infrastructure seamlessly links two main hubs:
                            </p>
                            <ul className="list-disc pl-5 space-y-2">
                                <li><strong>The Recruitment Portal:</strong> Where applicants submit their ATS-compliant CVs, manage their biodata, take psychometric assessments, and track their nomination status.</li>
                                <li><strong>The LMS / Training Portal (Aveling):</strong> Where applicants access mandated training courses, complete theoretical and practical assessments, and earn the critical compliance tickets (such as EEHA, Standard 11, Working at Heights, etc.) necessary for site deployment.</li>
                            </ul>
                            <p>
                                By unifying these systems, we eliminate redundant data entry. Certification gaps identified during the recruitment phase are automatically synchronized with your training dashboard, ensuring you only take the courses you absolutely need.
                            </p>
                            <p>
                                The following framework details the step-by-step pathway from initial application to final visa processing and deployment. Adherence to this framework is mandatory, and it forms the basis of all process literacy assessments.
                            </p>
                        </div>
                    </div>

                    <div className="bg-blue-50/50 p-12 lg:p-20 rounded-[3rem] border border-blue-50 mb-20 shadow-xl shadow-blue-900/5">
                        <h2 className="text-3xl font-black italic text-blue-900 mb-12 uppercase tracking-tighter">The 7-Step Pathway</h2>

                        <div className="space-y-16">
                            <section className="relative pl-12 border-l-4 border-blue-100">
                                <div className="absolute -left-[14px] top-0 w-6 h-6 rounded-full bg-blue-400 border-4 border-white shadow-sm"></div>
                                <h3 className="text-[14px] font-black uppercase tracking-[0.2em] text-blue-900 mb-4">Step 1: Application</h3>
                                <p className="text-sm text-blue-500 leading-loose mb-4">
                                    Applicants must complete their application by fulfilling the following mandatory sub-steps:
                                </p>
                                <ul className="list-disc pl-5 space-y-2 text-sm text-blue-500 leading-loose">
                                    <li>Upload your CV in ATS format (using the provided standardized template).</li>
                                    <li>Provide comprehensive and accurate biodata.</li>
                                    <li>Pass the initial Psychometric Assessment, which tests behavioral suitability for remote and demanding work environments.</li>
                                </ul>
                            </section>

                            <section className="relative pl-12 border-l-4 border-blue-100">
                                <div className="absolute -left-[14px] top-0 w-6 h-6 rounded-full bg-blue-400 border-4 border-white shadow-sm"></div>
                                <h3 className="text-[14px] font-black uppercase tracking-[0.2em] text-blue-900 mb-4">Step 2: Voice Call Interview</h3>
                                <p className="text-sm text-blue-500 leading-loose">
                                    A brief voice call interview will be conducted to verify your application details and suitability for the roles you've applied for.
                                </p>
                            </section>

                            <section className="relative pl-12 border-l-4 border-blue-100">
                                <div className="absolute -left-[14px] top-0 w-6 h-6 rounded-full bg-blue-400 border-4 border-white shadow-sm"></div>
                                <h3 className="text-[14px] font-black uppercase tracking-[0.2em] text-blue-900 mb-4">Step 3: Nomination</h3>
                                <p className="text-sm text-blue-500 leading-loose">
                                    Upon successfully passing all requirements in Step 1 and 2, you shall be nominated to top FIFO companies. You will receive a Notification of Nomination, which you can choose to accept or decline.
                                </p>
                            </section>

                            <section className="relative pl-12 border-l-4 border-blue-100">
                                <div className="absolute -left-[14px] top-0 w-6 h-6 rounded-full bg-blue-400 border-4 border-white shadow-sm"></div>
                                <h3 className="text-[14px] font-black uppercase tracking-[0.2em] text-blue-900 mb-4">Step 4: Contract Signing</h3>
                                <p className="text-sm text-blue-500 leading-loose">
                                    If you accept the nomination in Step 3, a binding contract will be drafted and signed by both parties (Blue Collar and the Applicant). This establishes the legal framework for your deployment.
                                </p>
                            </section>

                            <section className="relative pl-12 border-l-4 border-blue-100">
                                <div className="absolute -left-[14px] top-0 w-6 h-6 rounded-full bg-blue-400 border-4 border-white shadow-sm"></div>
                                <h3 className="text-[14px] font-black uppercase tracking-[0.2em] text-blue-900 mb-4">Step 5: Ticket Sponsorship Payment</h3>
                                <p className="text-sm text-blue-500 leading-loose mb-4">
                                    You shall pay your financial responsibility under the ticket sponsorship program. This can be paid in part (to be completed before taking the 4th ticket) or paid completely upfront at an extra 10% discount.
                                </p>
                                <div className="bg-white p-6 rounded-2xl border border-blue-100">
                                    <h4 className="text-[10px] font-black text-blue-900 uppercase tracking-widest mb-2 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-blue-400 text-sm">public</span> International Payments
                                    </h4>
                                    <p className="text-sm text-blue-500 leading-loose">
                                        <strong>Note:</strong> International payments from outside Australia are made using USDT crypto currency on the TRON network to ensure fast, borderless, and secure transactions.
                                    </p>
                                </div>
                            </section>

                            <section className="relative pl-12 border-l-4 border-blue-100">
                                <div className="absolute -left-[14px] top-0 w-6 h-6 rounded-full bg-blue-400 border-4 border-white shadow-sm"></div>
                                <h3 className="text-[14px] font-black uppercase tracking-[0.2em] text-blue-900 mb-4">Step 6: Ticket Delivery</h3>
                                <p className="text-sm text-blue-500 leading-loose">
                                    Upon successfully passing your ticket courses, your physical tickets/certifications will be delivered to your specified address anywhere in the globe.
                                </p>
                            </section>

                            <section className="relative pl-12 border-l-4 border-blue-100">
                                <div className="absolute -left-[14px] top-0 w-6 h-6 rounded-full bg-blue-400 border-4 border-white shadow-sm"></div>
                                <h3 className="text-[14px] font-black uppercase tracking-[0.2em] text-blue-900 mb-4">Step 7: Visa Sponsorship & Processing</h3>
                                <p className="text-sm text-blue-500 leading-loose">
                                    A final email will be sent detailing the Visa Sponsorship and Processing steps as you prepare for deployment. This phase includes medical checks and immigration clearances.
                                </p>
                            </section>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
                        <div className="space-y-6">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-900">Compliance & Accuracy</h3>
                            <p className="text-sm text-blue-500 leading-loose">
                                All information provided during the application and assessment phases must be strictly accurate. This documentation forms the basis for your psychometric and course examinations.
                            </p>
                        </div>
                        <div className="space-y-6">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-900">Verification Rights</h3>
                            <p className="text-sm text-blue-500 leading-loose">
                                BlueCollar reserves the right to verify all credentials, payment records, and course outcomes to ensure compliance with our platform's standards.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
            <PublicFooter />
        </div>
    );
}
