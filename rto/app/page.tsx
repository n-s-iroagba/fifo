'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Award,
    BookOpen,
    ShieldCheck,
    CheckCircle2,
    ArrowRight,
    MapPin,
    ExternalLink,
    FileText,
    GraduationCap,
    Clock,
    Layers,
    ChevronRight,
    HelpCircle,
    Building2,
    HardHat
} from 'lucide-react';

export default function RtoHomePage() {
    const [showLocationModal, setShowLocationModal] = useState(false);
    const [modalDismissed, setModalDismissed] = useState(false);

    useEffect(() => {
        // Check if user has already made location choice in this session
        const hasChosen = sessionStorage.getItem('certhero_location_choice');
        if (!hasChosen) {
            setShowLocationModal(true);
        }
    }, []);

    const handleAustraliaChoice = () => {
        sessionStorage.setItem('certhero_location_choice', 'australia');
        window.location.href = 'https://www.certhero.com.au';
    };

    const handleOverseasChoice = () => {
        sessionStorage.setItem('certhero_location_choice', 'overseas');
        setShowLocationModal(false);
        setModalDismissed(true);
    };

    const keyFeatures = [
        {
            icon: ShieldCheck,
            title: 'Nationally Recognised Training',
            desc: 'Delivered in accordance with ASQA Standards for Registered Training Organisations and the Australian Qualifications Framework (AQF).'
        },
        {
            icon: HardHat,
            title: 'High Risk Work & Mining Units',
            desc: 'Curriculum structured specifically for resource sector operations, mining infrastructure, and high-risk work environments.'
        },
        {
            icon: BookOpen,
            title: 'Structured LMS Courseware',
            desc: 'Online theoretical modules, safety standards review, and integrated assessment tools with immediate digital verification.'
        },
        {
            icon: GraduationCap,
            title: 'Statements of Attainment',
            desc: 'Official certified units issued upon successful examination completion, accepted by tier-1 Australian resources contractors.'
        }
    ];

    const trainingPathways = [
        {
            code: 'HRWL-01',
            title: 'High Risk Work Licences',
            units: 'TLILIC0003, TLILIC0004, CPCCLDG3001',
            desc: 'Forklift operations, order picker, dogging and rigging essentials complying with SafeWork Australia standards.',
            badge: 'High Demand'
        },
        {
            code: 'CIV-02',
            title: 'Civil & Mining Plant Operations',
            units: 'RIIMPO320F, RIIMPO318F, RIIMPO338E',
            desc: 'Excavator, front end loader, haul truck, and heavy earthmoving competencies for surface operations.',
            badge: 'FIFO Standard'
        },
        {
            code: 'SAF-03',
            title: 'Site Safety & High-Risk Compliance',
            units: 'RIIWHS204E, RIIWHS202E, MSMWHS217',
            desc: 'Work safely at heights, enter and work in confined spaces, and gas test atmospheres on industrial sites.',
            badge: 'Mandatory'
        },
        {
            code: 'ELEC-04',
            title: 'Electrical & Hazardous Areas',
            units: 'UEERA0007, HLTAID009, UETDRRF004',
            desc: 'EEHA equipment inspection, CPR, low voltage rescue (LVR), and hazardous site electrical compliance.',
            badge: 'Specialist'
        },
        {
            code: 'RPL-05',
            title: 'Skills Recognition & RPL Pathway',
            units: 'AQF Certificate III Equivalent Assessment',
            desc: 'Formal qualification conversion for experienced tradespersons with documented industry service.',
            badge: 'Fast Track'
        },
        {
            code: 'SPS-06',
            title: 'Employer-Sponsored Inductions',
            units: 'Tailored Corporate Training Packages',
            desc: 'Pre-mobilisation technical alignment for overseas candidates entering Australian FIFO projects.',
            badge: 'Sponsored'
        }
    ];

    const fourStepProcess = [
        {
            step: '01',
            title: 'Enrollment & Credentials',
            desc: 'Candidates receive verified CertHero LMS login credentials and formal letters of enrollment outlining course schedules.'
        },
        {
            step: '02',
            title: 'Curriculum Study & Review',
            desc: 'Self-paced completion of interactive safety modules, regulatory standards, and unit-specific knowledge materials.'
        },
        {
            step: '03',
            title: 'Online Competency Exam',
            desc: 'Strictly monitored theoretical examination testing regulatory safety, operational procedures, and hazard identification.'
        },
        {
            step: '04',
            title: 'Statement of Attainment',
            desc: 'Digital issuance and secure storage of Statements of Attainment for site access pass approval and mobilisation.'
        }
    ];

    const faqs = [
        {
            q: 'How does the CertHero LMS integrate with employer sponsorship?',
            a: 'Blue Collar Recruitment and partner resource contractors sponsor theoretical and compliance training for eligible candidates. Course fees and credential allocations are managed through the candidate portal.'
        },
        {
            q: 'Are the certificates nationally recognised across all Australian states?',
            a: 'Yes. All completed competencies follow the Australian Qualifications Framework (AQF) and Nationally Recognised Training (NRT) framework, valid across WA, QLD, NSW, VIC, SA, NT, and TAS.'
        },
        {
            q: 'How are practical assessments handled for overseas candidates?',
            a: 'Candidates complete theoretical components and examinations through this portal prior to arrival. Final hands-on verifications of competency (VOC) are conducted at accredited training centres upon mobilisation in Australia.'
        },
        {
            q: 'What is required to begin training modules?',
            a: 'You will need your assigned CertHero candidate credentials (sent via email upon enrollment) and a valid Unique Student Identifier (USI) or international exemption record.'
        }
    ];

    return (
        <div className="bg-slate-50 min-h-screen text-slate-900">
            {/* Modal: Australia vs Overseas Router (CHANGES.md Prompt 5.1) */}
            {showLocationModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative text-left">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="h-10 w-10 rounded-xl bg-[#ED9139]/10 text-[#ED9139] flex items-center justify-center shrink-0">
                                <MapPin className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 leading-tight">Location Verification</h3>
                                <p className="text-xs text-slate-500">Please confirm your current geographic location</p>
                            </div>
                        </div>

                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6">
                            <p className="text-xs text-slate-700 leading-relaxed font-medium">
                                <strong className="text-slate-900">Important Notice:</strong> Course access on this is only for sponsored overseas candidates use main portal.
                            </p>
                        </div>

                        <div className="space-y-3">
                            <button
                                onClick={handleAustraliaChoice}
                                className="w-full flex items-center justify-between p-4 rounded-xl border-2 border-slate-200 hover:border-[#0f172a] hover:bg-slate-50 transition-all text-left group"
                            >
                                <div>
                                    <div className="text-sm font-bold text-slate-900 group-hover:text-[#0f172a] flex items-center gap-2">
                                        I am currently in Australia
                                        <ExternalLink className="h-3.5 w-3.5 text-slate-400 group-hover:text-slate-900" />
                                    </div>
                                    <p className="text-xs text-slate-500 mt-0.5">Route to domestic portal (certhero.com.au)</p>
                                </div>
                                <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-all" />
                            </button>

                            <button
                                onClick={handleOverseasChoice}
                                className="w-full flex items-center justify-between p-4 rounded-xl border-2 border-[#ED9139] bg-[#ED9139]/5 hover:bg-[#ED9139]/10 transition-all text-left group"
                            >
                                <div>
                                    <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                        I am an Overseas Candidate
                                        <span className="text-[10px] bg-[#ED9139] text-[#0f172a] px-2 py-0.5 rounded font-extrabold uppercase">Sponsored</span>
                                    </div>
                                    <p className="text-xs text-slate-600 mt-0.5">Continue to Blue Collar / CertHero Sponsored Training Portal</p>
                                </div>
                                <ChevronRight className="h-5 w-5 text-[#ED9139] group-hover:translate-x-0.5 transition-all" />
                            </button>
                        </div>

                        <p className="text-[11px] text-slate-400 text-center mt-5">
                            Compliance verification governed under ASQA Standards for RTOs
                        </p>
                    </div>
                </div>
            )}

            {/* Hero Section */}
            <section className="relative bg-[#0f172a] text-white overflow-hidden py-16 sm:py-24 border-b border-slate-800">
                {/* Subtle technical background grid */}
                <div
                    className="absolute inset-0 opacity-10 pointer-events-none"
                    style={{
                        backgroundImage: 'radial-gradient(circle at 2px 2px, #94a3b8 1px, transparent 0)',
                        backgroundSize: '40px 40px'
                    }}
                />

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-3xl">
                        {/* Status chip */}
                        <div className="inline-flex items-center gap-2 bg-slate-800/80 border border-slate-700 rounded-full px-3.5 py-1 text-xs text-slate-300 mb-6">
                            <span className="w-2 h-2 rounded-full bg-[#ED9139] animate-pulse" />
                            <span className="font-semibold text-white">CertHero RTO Partner</span>
                            <span className="text-slate-500">•</span>
                            <span>Australian Trade & FIFO Certification</span>
                        </div>

                        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight mb-6">
                            Trade Certification, Skills Assessment & Work Pathways
                        </h1>

                        <p className="text-base sm:text-lg text-slate-300 leading-relaxed mb-8">
                            Official Registered Training Organisation (RTO) training platform delivering accredited theory coursework, competency assessments, and nationally recognised units of competency for domestic and sponsored workforce candidates.
                        </p>

                        {/* Action buttons */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 mb-10">
                            <Link
                                href="/catalog"
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#ED9139] hover:bg-[#dd7f26] text-[#0f172a] px-6 py-3.5 text-sm font-bold shadow-lg shadow-[#ED9139]/20 transition-all"
                            >
                                <BookOpen className="h-4 w-4" />
                                Browse Course Syllabus
                            </Link>

                            <Link
                                href="/login"
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 px-6 py-3.5 text-sm font-bold transition-all"
                            >
                                <GraduationCap className="h-4 w-4" />
                                Candidate LMS Sign In
                            </Link>
                        </div>

                        {/* Key bullet trust points */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-6 border-t border-slate-800 text-xs text-slate-300">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-[#ED9139] shrink-0" />
                                <span>100% AQF Compliant Units</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-[#ED9139] shrink-0" />
                                <span>SafeWork Recognised</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-[#ED9139] shrink-0" />
                                <span>Official Statements of Attainment</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Accreditation & Regulatory Banner */}
            <section className="bg-white border-b border-slate-200 py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 text-center mb-4">
                        Recognised Standards & Industry Compliance Frameworks
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-12 text-slate-700 font-bold text-xs sm:text-sm">
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4 text-[#ED9139]" />
                            <span>Nationally Recognised Training (NRT)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Award className="h-4 w-4 text-[#ED9139]" />
                            <span>Australian Qualifications Framework (AQF)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-[#ED9139]" />
                            <span>SafeWork Australia</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-[#ED9139]" />
                            <span>VETASSESS & TRA Mapped</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Value Pillars Grid */}
            <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-2xl mx-auto mb-12">
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                        Built for Industry Compliance & Workforce Readiness
                    </h2>
                    <p className="text-sm text-slate-600 mt-2">
                        Designed to deliver high-integrity vocational education and skills verification for critical resource, industrial, and civil infrastructure positions.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {keyFeatures.map((feat, idx) => {
                        const Icon = feat.icon;
                        return (
                            <div
                                key={idx}
                                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                            >
                                <div>
                                    <div className="h-10 w-10 rounded-xl bg-slate-100 text-[#0f172a] flex items-center justify-center mb-4">
                                        <Icon className="h-5 w-5 text-[#ED9139]" />
                                    </div>
                                    <h3 className="text-base font-bold text-slate-900 mb-2">{feat.title}</h3>
                                    <p className="text-xs text-slate-600 leading-relaxed">{feat.desc}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* Core Training Pathways Grid */}
            <section className="py-16 bg-slate-100/60 border-y border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-10">
                        <div>
                            <span className="text-xs font-bold uppercase tracking-wider text-[#ED9139]">Accredited Units</span>
                            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
                                Core Certification & Ticket Pathways
                            </h2>
                        </div>
                        <Link
                            href="/catalog"
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0f172a] hover:text-[#ED9139] transition-colors"
                        >
                            View Complete Syllabus Catalog <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {trainingPathways.map((path, idx) => (
                            <div
                                key={idx}
                                className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                            >
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-[11px] font-mono font-bold text-slate-500 uppercase">{path.code}</span>
                                        <span className="text-[10px] font-bold bg-[#ED9139]/10 text-[#ED9139] px-2.5 py-0.5 rounded-full">
                                            {path.badge}
                                        </span>
                                    </div>
                                    <h3 className="text-base font-bold text-slate-900 mb-1">{path.title}</h3>
                                    <p className="text-[11px] font-semibold text-slate-500 mb-3">{path.units}</p>
                                    <p className="text-xs text-slate-600 leading-relaxed mb-4">{path.desc}</p>
                                </div>
                                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                                    <span className="text-[11px] font-semibold text-slate-500">LMS Theory & VOC</span>
                                    <Link
                                        href="/catalog"
                                        className="text-xs font-bold text-[#0f172a] hover:text-[#ED9139] inline-flex items-center gap-1 transition-colors"
                                    >
                                        Details <ChevronRight className="h-3.5 w-3.5" />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 4-Step Process Section */}
            <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-2xl mx-auto mb-12">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#ED9139]">Training Lifecycle</span>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
                        How the Training & Certification Process Operates
                    </h2>
                    <p className="text-sm text-slate-600 mt-2">
                        A structured progression from corporate registration to official Statement of Attainment issuance.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {fourStepProcess.map((step, idx) => (
                        <div
                            key={idx}
                            className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative flex flex-col justify-between"
                        >
                            <div>
                                <span className="text-3xl font-black text-[#ED9139]/40 mb-3 block font-mono">
                                    {step.step}
                                </span>
                                <h3 className="text-base font-bold text-slate-900 mb-2">{step.title}</h3>
                                <p className="text-xs text-slate-600 leading-relaxed">{step.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Sponsored Candidates Banner */}
            <section className="bg-[#0f172a] text-white py-12 border-y border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-8 sm:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div className="max-w-2xl">
                            <div className="inline-flex items-center gap-2 bg-[#ED9139]/20 text-[#ED9139] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
                                Overseas Sponsorship Protocol
                            </div>
                            <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                                Sponsored FIFO & Mining Induction Program
                            </h3>
                            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                                Candidates enrolled under Blue Collar Recruitment sponsorship receive dedicated LMS credentials, subsidised ticket courses, and structured assessment preparation. Completed units are registered to your permanent candidate portfolio.
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 w-full md:w-auto">
                            <Link
                                href="/login"
                                className="inline-flex items-center justify-center gap-2 bg-[#ED9139] hover:bg-[#dd7f26] text-[#0f172a] px-6 py-3 rounded-xl text-xs font-bold transition-all shadow-md"
                            >
                                Log In With Credentials
                            </Link>
                            <a
                                href="https://www.certhero.com.au"
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 px-5 py-3 rounded-xl text-xs font-bold transition-all"
                            >
                                Main Portal ↗
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-10">
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                        Frequently Asked Questions
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1">
                        Operational and compliance guidelines for trainees and sponsoring employers
                    </p>
                </div>

                <div className="space-y-4">
                    {faqs.map((faq, idx) => (
                        <div key={idx} className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                            <h4 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                                <HelpCircle className="h-4 w-4 text-[#ED9139] shrink-0" />
                                {faq.q}
                            </h4>
                            <p className="text-xs text-slate-600 leading-relaxed pl-6">
                                {faq.a}
                            </p>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
