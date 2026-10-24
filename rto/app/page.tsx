'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
    ArrowRight,
    ArrowDownRight,
    CheckCircle2,
    ShieldCheck,
    Mail,
    Phone,
    Send,
    Brain,
    BookOpen,
    HardHat,
    Award,
    Layers,
    ChevronDown,
    ExternalLink,
    Clock,
    FileCheck,
    Compass
} from 'lucide-react';

export default function CertHeroHomePage() {
    // Enquiry form states
    const [enquiryName, setEnquiryName] = useState('');
    const [enquiryEmail, setEnquiryEmail] = useState('');
    const [enquiryPhone, setEnquiryPhone] = useState('');
    const [enquiryService, setEnquiryService] = useState('Overseas Skills Assessment');
    const [enquiryMessage, setEnquiryMessage] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [missionModalOpen, setMissionModalOpen] = useState(false);

    // FAQ Accordion State
    const [openFaq, setOpenFaq] = useState<number | null>(0);

    const handleEnquirySubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);
    };

    const pathways = [
        {
            title: 'OVERSEAS SKILLS ASSESSMENT FOR TRADES IN AUSTRALIA',
            desc: 'Get your international trade qualification formally assessed and recognized across Australia via TRA and accredited RTO pathways.',
            image: '/images/certhero/pathway-overseas.jpg',
            href: '/catalog?category=overseas',
            tag: 'GLOBAL TRADESPEOPLE'
        },
        {
            title: 'MINING & FIFO TRADE CERTIFICATION PATHWAY',
            desc: 'Become fully certified with high-demand plant operations, civil earthmoving, and mining site inductions in Western Australia & Queensland.',
            image: '/images/certhero/pathway-mining.jpg',
            href: '/catalog?category=civil_mining',
            tag: 'RESOURCES & FIFO'
        },
        {
            title: 'OFFSHORE READY CERTIFICATION PATHWAY FOR OIL & GAS AND MARITIME CAREERS',
            desc: 'Fast-track your offshore safety tickets, OPITO compliance, confined space, and height certifications with approved providers.',
            image: '/images/certhero/pathway-offshore.jpg',
            href: '/catalog?category=high_risk',
            tag: 'ENERGY & MARITIME'
        },
        {
            title: 'APPRENTICESHIP SUPPORT FOR SCHOOL LEAVERS & EMERGING TRADESPEOPLE IN AUSTRALIA',
            desc: 'Essential tickets, RTO connections, documentation and structured mentorship to become site-ready and appealing to top employers.',
            image: '/images/certhero/pathway-apprenticeship.jpg',
            href: '/catalog',
            tag: 'EARLY CAREER'
        },
        {
            title: 'SITE READY TICKETS & SAFETY CERTIFICATIONS FOR TRADES',
            desc: 'Get the mandatory cards and verifications you need to step onto Australian commercial and civil work sites without delay.',
            image: '/images/certhero/pathway-site-tickets.jpg',
            href: '/catalog?category=safety',
            tag: 'SITE COMPLIANCE'
        },
        {
            title: 'CAREER DEVELOPMENT & TRADE PATHWAY PLANNING',
            desc: 'Professional resume preparation, employer alignment, licensing roadmap, and interview prep for high-paying trade careers.',
            image: '/images/certhero/pathway-career.jpg',
            href: '/#contact',
            tag: 'CAREER MAPPING'
        }
    ];

    const faqs = [
        {
            q: 'How does Cert Hero assist with Overseas Skills Assessment for Australia?',
            a: 'Cert Hero guides international tradespeople step-by-step through the Trades Recognition Australia (TRA) and offshore skills assessment pathways. We review your overseas credentials, assemble compliant documentary evidence, liaise with approved RTOs, and coordinate technical interviews or practical tests.'
        },
        {
            q: 'What role does the Cert Hero LMS platform serve for candidate assessments?',
            a: 'Our registered LMS provides online theoretical coursework, psychometric testing, safety compliance modules, and timed examinations required prior to mobilization on Australian mining and infrastructure sites.'
        },
        {
            q: 'How do I complete the psychometric test required for my job application?',
            a: 'Candidates invited via BlueCollar Recruitment can launch the psychometric module directly from the top navigation or via their unique candidate invitation link. The assessment evaluates situational safety judgment, problem-solving, and Australian site readiness.'
        },
        {
            q: 'Are certificates and tickets issued through Cert Hero nationally recognized?',
            a: 'Yes. All formal accredited competency units conform to the Australian Qualifications Framework (AQF) and Nationally Recognised Training (NRT) framework, recognized across all Australian states and territories.'
        },
        {
            q: 'How long does it take to complete the theoretical modules and receive results?',
            a: 'LMS theory modules are self-paced. The online theory assessments are timed at 15 minutes each with instant automated grading and digital recording to your candidate profile.'
        }
    ];

    return (
        <div className="flex flex-col min-h-screen bg-white text-slate-900 selection:bg-[#EAA240] selection:text-black">
            
            {/* 1. HERO SECTION (Screenshots 1 & 2) */}
            <section className="relative overflow-hidden border-b border-slate-200">
                {/* Background Image with warm industrial gradient overlay */}
                <div 
                    className="absolute inset-0 bg-cover bg-center z-0 scale-105 transition-transform duration-1000 ease-out"
                    style={{ backgroundImage: `url('/images/certhero/hero-bg.jpg')` }}
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-50/95 via-amber-50/80 to-amber-100/60 md:from-amber-50/90 md:via-amber-50/70 md:to-transparent" />
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 lg:py-28">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                        
                        {/* Hero Text (Left Col) */}
                        <div className="lg:col-span-7 space-y-6">
                            <div className="inline-flex items-center gap-2 bg-black text-[#EAA240] px-3.5 py-1.5 rounded-full text-xs font-black tracking-widest uppercase shadow-sm">
                                <Award className="w-4 h-4 text-[#EAA240]" />
                                TRADE CERTIFICATION & CAREER PATHWAY SUPPORT
                            </div>

                            <h1 className="text-3xl sm:text-5xl lg:text-[3.35rem] font-black tracking-tight text-black leading-[1.12]">
                                Trade Certification, Australian Skills Assessment, Mining/FIFO, Offshore & Apprenticeship Pathways in Australia
                            </h1>

                            <p className="text-lg sm:text-xl font-extrabold uppercase tracking-wide text-slate-900">
                                EMPOWERING TRADESPEOPLE TO REACH NEW HEIGHTS
                            </p>

                            <p className="text-sm sm:text-base text-slate-700 leading-relaxed max-w-2xl font-medium">
                                Cert Hero provides end-to-end support to help clients become certified, qualified and work-ready in Australia. We handle the paperwork, liaise with RTOs and assessment authorities on your behalf, and guide you through the exact steps needed for your industry pathway.
                            </p>

                            <div className="flex flex-wrap items-center gap-3 pt-2">
                                <Link
                                    href="/#pathways"
                                    className="bg-black hover:bg-slate-800 text-white px-7 py-3.5 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all shadow-md flex items-center gap-2"
                                >
                                    Explore Hero Pathways <ArrowRight className="w-4 h-4 text-[#EAA240]" />
                                </Link>

                                <Link
                                    href="/psychometric"
                                    className="bg-[#EAA240] hover:bg-[#de9330] text-black px-6 py-3.5 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all shadow-md flex items-center gap-2"
                                >
                                    <Brain className="w-4 h-4" /> Psychometric Test
                                </Link>

                                <Link
                                    href="/catalog"
                                    className="bg-white/90 hover:bg-white text-slate-900 border border-slate-300 px-6 py-3.5 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider transition-all shadow-sm"
                                >
                                    Course Catalog
                                </Link>
                            </div>
                        </div>

                        {/* Consultation Form Card (Right Col) */}
                        <div className="lg:col-span-5">
                            <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border-2 border-[#EAA240] p-6 sm:p-8">
                                <div className="border-b border-slate-100 pb-4 mb-5">
                                    <span className="text-[11px] font-black text-[#EAA240] uppercase tracking-widest block">
                                        Personalised Guidance
                                    </span>
                                    <h3 className="text-xl sm:text-2xl font-black text-black tracking-tight mt-1">
                                        Enquire Now For a Free Consultation
                                    </h3>
                                    <p className="text-xs text-slate-600 mt-1">
                                        Get tailored advice for your Australian trade certification pathway.
                                    </p>
                                </div>

                                {submitted ? (
                                    <div className="bg-amber-50 border border-[#EAA240] rounded-xl p-6 text-center space-y-3 animate-in fade-in">
                                        <div className="w-12 h-12 rounded-full bg-[#EAA240] text-black flex items-center justify-center mx-auto">
                                            <CheckCircle2 className="w-7 h-7" />
                                        </div>
                                        <h4 className="text-base font-black text-black">Enquiry Received!</h4>
                                        <p className="text-xs text-slate-700">
                                            Thank you, <strong>{enquiryName || 'Candidate'}</strong>. A Cert Hero pathway advisor will reach out to <strong>{enquiryEmail}</strong> within 1 business day.
                                        </p>
                                        <button
                                            onClick={() => setSubmitted(false)}
                                            className="text-xs text-black font-bold underline hover:text-[#EAA240] pt-2"
                                        >
                                            Submit another enquiry
                                        </button>
                                    </div>
                                ) : (
                                    <form onSubmit={handleEnquirySubmit} className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                                                Full Name *
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={enquiryName}
                                                onChange={(e) => setEnquiryName(e.target.value)}
                                                placeholder="e.g. John Smith"
                                                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#EAA240] focus:border-transparent bg-white"
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                                                    Email *
                                                </label>
                                                <input
                                                    type="email"
                                                    required
                                                    value={enquiryEmail}
                                                    onChange={(e) => setEnquiryEmail(e.target.value)}
                                                    placeholder="john@example.com"
                                                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#EAA240] focus:border-transparent bg-white"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                                                    Phone
                                                </label>
                                                <input
                                                    type="tel"
                                                    value={enquiryPhone}
                                                    onChange={(e) => setEnquiryPhone(e.target.value)}
                                                    placeholder="+61 4..."
                                                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#EAA240] focus:border-transparent bg-white"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                                                Pathway Interest
                                            </label>
                                            <select
                                                value={enquiryService}
                                                onChange={(e) => setEnquiryService(e.target.value)}
                                                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#EAA240] focus:border-transparent bg-white"
                                            >
                                                <option>Overseas Skills Assessment</option>
                                                <option>Mining & FIFO Trade Certification</option>
                                                <option>Offshore Ready Oil & Gas Certification</option>
                                                <option>Apprenticeship Support</option>
                                                <option>Site Ready Tickets & Safety Licences</option>
                                                <option>Career Development & Planning</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                                                Enquiry Details
                                            </label>
                                            <textarea
                                                rows={3}
                                                value={enquiryMessage}
                                                onChange={(e) => setEnquiryMessage(e.target.value)}
                                                placeholder="Tell us about your current trade experience and target qualifications..."
                                                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#EAA240] focus:border-transparent bg-white"
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            className="w-full bg-black hover:bg-slate-900 text-[#EAA240] hover:text-white py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                                        >
                                            <Send className="w-3.5 h-3.5" /> Submit Enquiry
                                        </button>
                                    </form>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* 2. ABOUT CERT HERO & HOW WE CAN HELP (Screenshots 3 & 4) */}
            <section id="about" className="py-20 bg-black text-white border-b border-neutral-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                        
                        {/* Left Column: Headings & Services List */}
                        <div className="lg:col-span-7 space-y-8">
                            
                            {/* Section Header with crossed tools icon */}
                            <div className="flex items-center gap-4">
                                <h2 className="text-3xl sm:text-4xl font-black tracking-tight uppercase text-white">
                                    ABOUT CERT HERO
                                </h2>
                                <img
                                    src="/images/certhero/certhero-tools-icon.png"
                                    alt="Cert Hero Icon"
                                    className="w-12 h-12 object-contain bg-neutral-900 border border-neutral-800 rounded-lg p-1.5"
                                />
                            </div>

                            {/* HOW WE CAN HELP Block */}
                            <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6 sm:p-7 space-y-3">
                                <h3 className="text-lg font-black uppercase tracking-wide text-[#EAA240]">
                                    HOW WE CAN HELP
                                </h3>
                                <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-medium">
                                    Cert Hero provides end-to-end support to help clients become certified, qualified and work-ready in Australia. We handle the paperwork, liaise with RTOs and assessment authorities on your behalf, and guide you through the exact steps needed for your industry pathway.
                                </p>
                            </div>

                            {/* OUR SERVICES: List */}
                            <div className="space-y-6">
                                <h4 className="text-xs font-black uppercase tracking-widest text-[#EAA240] border-b border-neutral-800 pb-2">
                                    OUR SERVICES:
                                </h4>

                                <div className="space-y-6">
                                    {/* Service 1 */}
                                    <div className="group border-l-2 border-[#EAA240] pl-4 space-y-1">
                                        <h5 className="text-base font-black uppercase tracking-wide text-white group-hover:text-[#EAA240] transition-colors">
                                            OVERSEAS SKILLS ASSESSMENT FOR TRADES IN AUSTRALIA
                                        </h5>
                                        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                                            Get your international trade skills formally recognised in Australia. We manage your documentation, submit applications to assessment authorities, and guide you to TRA approved RTOs and assessment authorities so you can gain your Australian recognised trade qualification faster.
                                        </p>
                                    </div>

                                    {/* Service 2 */}
                                    <div className="group border-l-2 border-[#EAA240] pl-4 space-y-1">
                                        <h5 className="text-base font-black uppercase tracking-wide text-white group-hover:text-[#EAA240] transition-colors">
                                            MINING & FIFO TRADE CERTIFICATION PATHWAY IN AUSTRALIA
                                        </h5>
                                        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                                            Become fully certified and ready for a career in mining and FIFO work. We help you access the required training, safety tickets, and qualifications while handling submissions and paperwork so you can focus on securing your next role.
                                        </p>
                                    </div>

                                    {/* Service 3 */}
                                    <div className="group border-l-2 border-[#EAA240] pl-4 space-y-1">
                                        <h5 className="text-base font-black uppercase tracking-wide text-white group-hover:text-[#EAA240] transition-colors">
                                            OFFSHORE READY CERTIFICATION PATHWAY FOR OIL & GAS AND MARITIME CAREERS
                                        </h5>
                                        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                                            Fast-track your offshore certifications with confidence. From safety tickets to specialist offshore requirements, we coordinate the entire process, deal with assessment bodies for you, and secure discounted courses.
                                        </p>
                                    </div>

                                    {/* Service 4 */}
                                    <div className="group border-l-2 border-[#EAA240] pl-4 space-y-1">
                                        <h5 className="text-base font-black uppercase tracking-wide text-white group-hover:text-[#EAA240] transition-colors">
                                            APPRENTICESHIP SUPPORT FOR SCHOOL LEAVERS & EMERGING TRADESPEOPLE IN AUSTRALIA
                                        </h5>
                                        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                                            Start or advance your apprenticeship with the right certifications. We assist school leavers and new apprentices with essential tickets, RTO connections, paperwork and guidance to become site-ready and appealing to employers.
                                        </p>
                                    </div>

                                    {/* Service 5 */}
                                    <div className="group border-l-2 border-[#EAA240] pl-4 space-y-1">
                                        <h5 className="text-base font-black uppercase tracking-wide text-white group-hover:text-[#EAA240] transition-colors">
                                            SITE READY TICKETS & SAFETY CERTIFICATIONS FOR TRADES
                                        </h5>
                                        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                                            Get the mandatory certificates you need to step onto site. Whether you’re starting out or beginning a new role, we ensure you meet all safety and compliance requirements efficiently and without confusion.
                                        </p>
                                    </div>

                                    {/* Service 6 */}
                                    <div className="group border-l-2 border-[#EAA240] pl-4 space-y-1">
                                        <h5 className="text-base font-black uppercase tracking-wide text-white group-hover:text-[#EAA240] transition-colors">
                                            CAREER DEVELOPMENT & TRADE PATHWAY PLANNING
                                        </h5>
                                        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                                            Plan your trade career with professional guidance. We provide resume support, job application help, career mapping, and industry connections to accelerate your growth, and help you build a strong, future focussed trade career.
                                        </p>
                                    </div>
                                </div>
                            </div>

                        </div>

                        {/* Right Column: Industrial Refinery Photo (Screenshots 3 & 4) */}
                        <div className="lg:col-span-5 sticky top-28">
                            <div className="rounded-2xl overflow-hidden border border-neutral-800 shadow-2xl relative group">
                                <img
                                    src="/images/certhero/about-refinery.jpg"
                                    alt="Industrial Refinery Sunset"
                                    className="w-full h-[520px] object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                                <div className="absolute bottom-6 left-6 right-6 p-5 rounded-xl bg-black/80 backdrop-blur-md border border-neutral-800">
                                    <span className="text-[10px] font-black tracking-widest uppercase text-[#EAA240] block">
                                        RESOURCES & HEAVY INDUSTRY
                                    </span>
                                    <p className="text-sm font-bold text-white mt-1">
                                        Direct alignment with Tier-1 Australian resource contractors and high-risk work compliance.
                                    </p>
                                    <Link
                                        href="/catalog"
                                        className="inline-flex items-center gap-1.5 text-xs text-[#EAA240] hover:text-amber-300 font-bold mt-2"
                                    >
                                        View Required Tickets & Units <ArrowRight className="w-3.5 h-3.5" />
                                    </Link>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* 3. MUSTARD BANNER & HERO PATHWAYS (Screenshot 5) */}
            <section id="pathways" className="border-b border-slate-200">
                {/* Yellow/Mustard Banner Header */}
                <div className="bg-[#F2B258] px-4 sm:px-6 lg:px-8 py-10">
                    <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <ArrowDownRight className="w-12 h-12 text-black stroke-[2.5]" />
                            <span className="text-xs sm:text-sm font-black tracking-widest uppercase text-black">
                                HOW WE CAN HELP YOU
                            </span>
                        </div>
                        <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-black">
                            HERO PATHWAYS
                        </h2>
                    </div>
                </div>

                {/* 6 Pathway Cards Grid */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {pathways.map((p, idx) => (
                            <Link
                                key={idx}
                                href={p.href}
                                className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-slate-200 hover:border-[#EAA240] shadow-sm hover:shadow-xl transition-all duration-300"
                            >
                                <div className="relative h-60 overflow-hidden bg-slate-900">
                                    <img
                                        src={p.image}
                                        alt={p.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                                    <div className="absolute top-4 left-4">
                                        <span className="bg-black/90 text-[#EAA240] text-[10px] font-black tracking-wider uppercase px-2.5 py-1 rounded">
                                            {p.tag}
                                        </span>
                                    </div>
                                    <div className="absolute bottom-4 left-4 right-4">
                                        <h3 className="text-base sm:text-lg font-black uppercase text-white leading-snug drop-shadow-md">
                                            {p.title}
                                        </h3>
                                    </div>
                                </div>
                                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                                        {p.desc}
                                    </p>
                                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-black group-hover:text-[#EAA240] transition-colors">
                                        <span>View Pathway Syllabus</span>
                                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* 4. PSYCHOMETRIC TEST PORTAL CALLOUT */}
            <section className="bg-gradient-to-br from-neutral-900 via-neutral-950 to-black text-white py-16 border-b border-neutral-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-8 sm:p-12 relative overflow-hidden">
                        <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
                            <Brain className="w-96 h-96 text-[#EAA240]" />
                        </div>
                        <div className="relative z-10 max-w-3xl space-y-5">
                            <div className="inline-flex items-center gap-2 bg-[#EAA240] text-black px-3.5 py-1.5 rounded-full text-xs font-black tracking-wider uppercase">
                                <Brain className="w-4 h-4" /> RECRUITMENT PARTNER TESTING PORTAL
                            </div>
                            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
                                Required Psychometric & Safety Situational Assessment
                            </h2>
                            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-medium">
                                Active candidate for <strong>BlueCollar Recruitment</strong>? Complete your official pre-employment psychometric assessment online. Your verified score feeds directly into your application profile and hiring employer portfolio.
                            </p>
                            <div className="flex flex-wrap items-center gap-4 pt-2">
                                <Link
                                    href="/psychometric"
                                    className="bg-[#EAA240] hover:bg-[#de9330] text-black px-7 py-3.5 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all shadow-md flex items-center gap-2"
                                >
                                    Launch Psychometric Test <ArrowRight className="w-4 h-4" />
                                </Link>
                                <Link
                                    href="/login"
                                    className="bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700 px-6 py-3.5 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider transition-all"
                                >
                                    Candidate LMS Login
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 5. MISSION BANNER (CertHero.html Section 12-15) */}
            <section className="relative overflow-hidden py-24 sm:py-32 border-b border-slate-200">
                <div 
                    className="absolute inset-0 bg-cover bg-center z-0 scale-105"
                    style={{ backgroundImage: `url('/images/certhero/mission-banner.jpg')` }}
                >
                    <div className="absolute inset-0 bg-black/65" />
                </div>
                <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
                    <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white leading-tight uppercase tracking-tight">
                        Every certification journey is a step forward to new opportunities
                    </h2>
                    <p className="text-sm sm:text-base text-slate-200 max-w-2xl mx-auto font-medium">
                        We bridge the gap between hard-working tradespeople and high-paying Australian infrastructure, mining, and civil resources careers.
                    </p>
                    <div>
                        <button
                            onClick={() => setMissionModalOpen(true)}
                            className="bg-[#EAA240] hover:bg-[#de9330] text-black px-8 py-3.5 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all shadow-xl cursor-pointer"
                        >
                            Discover Our Mission
                        </button>
                    </div>
                </div>
            </section>

            {/* 6. ACCREDITATION & INDUSTRY BODIES (CertHero.html Section 16-19) */}
            <section className="py-14 bg-slate-50 border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <p className="text-center text-xs font-black uppercase tracking-widest text-slate-500 mb-8">
                        ACCREDITED FRAMEWORKS & NATIONAL ASSESSMENT BODIES
                    </p>
                    
                    {/* Logos and Badges */}
                    <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14 opacity-90">
                        <img
                            src="/images/certhero/logo-nrt.webp"
                            alt="Nationally Recognised Training Logo"
                            className="h-12 w-auto object-contain grayscale hover:grayscale-0 transition-all"
                        />
                        <img
                            src="/images/certhero/logo-aqf.jpg"
                            alt="Australian Qualifications Framework Logo"
                            className="h-12 w-auto object-contain grayscale hover:grayscale-0 transition-all rounded"
                        />
                        <img
                            src="/images/certhero/logo-opito.png"
                            alt="OPITO Logo"
                            className="h-12 w-auto object-contain grayscale hover:grayscale-0 transition-all"
                        />
                        <div className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-xs font-black uppercase tracking-widest text-slate-800 shadow-sm">
                            TAFE
                        </div>
                        <div className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-xs font-black uppercase tracking-widest text-slate-800 shadow-sm">
                            VETASSESS
                        </div>
                        <div className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-xs font-black uppercase tracking-widest text-slate-800 shadow-sm">
                            TRADES RECOGNITION AUSTRALIA
                        </div>
                    </div>
                </div>
            </section>

            {/* 7. FREQUENTLY ASKED QUESTIONS */}
            <section id="faq" className="py-20 bg-white border-b border-slate-200">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center space-y-3 mb-12">
                        <span className="text-xs font-black text-[#EAA240] uppercase tracking-widest">
                            Got Questions?
                        </span>
                        <h2 className="text-3xl font-black uppercase tracking-tight text-black">
                            Frequently Asked Questions
                        </h2>
                    </div>

                    <div className="space-y-4">
                        {faqs.map((faq, idx) => {
                            const isOpen = openFaq === idx;
                            return (
                                <div
                                    key={idx}
                                    className="border border-slate-200 rounded-xl overflow-hidden transition-all"
                                >
                                    <button
                                        onClick={() => setOpenFaq(isOpen ? null : idx)}
                                        className="w-full flex items-center justify-between p-5 text-left bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
                                    >
                                        <span className="text-sm sm:text-base font-black text-black">
                                            {faq.q}
                                        </span>
                                        <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                                    </button>
                                    {isOpen && (
                                        <div className="p-5 text-xs sm:text-sm text-slate-700 leading-relaxed bg-white border-t border-slate-200">
                                            {faq.a}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* 8. CONTACT US SECTION (CertHero.html Section 20) */}
            <section id="contact" className="py-20 bg-slate-100 border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                        
                        {/* Contact Details */}
                        <div className="lg:col-span-5 space-y-6">
                            <span className="text-xs font-black text-[#EAA240] uppercase tracking-widest">
                                GET IN TOUCH
                            </span>
                            <h2 className="text-3xl sm:text-4xl font-black uppercase text-black tracking-tight">
                                CONTACT US
                            </h2>
                            <p className="text-sm text-slate-600 leading-relaxed font-medium">
                                Reach out with any questions regarding course enrollments, overseas skills assessments, or corporate trade packages.
                            </p>

                            <div className="space-y-4 pt-2">
                                <div className="flex items-center gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                    <div className="w-10 h-10 rounded-lg bg-amber-50 text-[#EAA240] flex items-center justify-center">
                                        <Mail className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">EMAIL</span>
                                        <a href="mailto:Info@certhero.com.au" className="text-sm font-bold text-black hover:text-[#EAA240]">
                                            Info@certhero.com.au
                                        </a>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                    <div className="w-10 h-10 rounded-lg bg-amber-50 text-[#EAA240] flex items-center justify-center">
                                        <Phone className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">PHONE</span>
                                        <a href="tel:+61447000919" className="text-sm font-bold text-black hover:text-[#EAA240]">
                                            +61 447 000 919
                                        </a>
                                    </div>
                                </div>

                                <div className="p-4 bg-white rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
                                    <p className="font-bold text-black">Cert Hero Pty Ltd</p>
                                    <p>ABN: 46 693 035 184 | ACN: 693 035 184</p>
                                    <p className="text-[11px] text-slate-400 pt-1">
                                        Official Website: <a href="https://www.certhero.com.au" target="_blank" rel="noreferrer" className="text-blue-600 underline">certhero.com.au</a>
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Quick Message Card */}
                        <div className="lg:col-span-7">
                            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-md">
                                <h3 className="text-xl font-black text-black mb-1">
                                    Send Us a Direct Message
                                </h3>
                                <p className="text-xs text-slate-500 mb-6">
                                    Our specialist advisors will review your enquiry and respond promptly.
                                </p>

                                <form onSubmit={handleEnquirySubmit} className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                                                Your Name *
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={enquiryName}
                                                onChange={(e) => setEnquiryName(e.target.value)}
                                                placeholder="e.g. Michael Davies"
                                                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#EAA240]"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                                                Your Email *
                                            </label>
                                            <input
                                                type="email"
                                                required
                                                value={enquiryEmail}
                                                onChange={(e) => setEnquiryEmail(e.target.value)}
                                                placeholder="michael@example.com"
                                                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#EAA240]"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                                            Message *
                                        </label>
                                        <textarea
                                            rows={4}
                                            required
                                            value={enquiryMessage}
                                            onChange={(e) => setEnquiryMessage(e.target.value)}
                                            placeholder="Write your message here..."
                                            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#EAA240]"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        className="bg-black hover:bg-slate-900 text-[#EAA240] hover:text-white px-8 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md flex items-center gap-2 cursor-pointer"
                                    >
                                        <Send className="w-3.5 h-3.5" /> Send Message
                                    </button>
                                </form>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* Discover Mission Modal */}
            {missionModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 animate-in fade-in">
                    <div className="bg-white text-slate-900 rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative">
                        <button
                            onClick={() => setMissionModalOpen(false)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-black font-bold text-xl"
                        >
                            ✕
                        </button>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-black text-[#EAA240] flex items-center justify-center">
                                <Award className="w-6 h-6" />
                            </div>
                            <div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-[#EAA240]">OUR PURPOSE</span>
                                <h3 className="text-xl font-black text-black">The Cert Hero Mission</h3>
                            </div>
                        </div>
                        <div className="text-xs sm:text-sm text-slate-700 space-y-3 leading-relaxed">
                            <p>
                                At Cert Hero, our mission is to empower tradespeople across Australia and internationally to achieve formal trade recognition, mandatory site qualifications, and rapid career progression.
                            </p>
                            <p>
                                We eliminate the bureaucratic friction of skills assessment authorities, organize approved RTO verifications, and provide modern online LMS portals so you can step onto site fully compliant and with complete confidence.
                            </p>
                        </div>
                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={() => setMissionModalOpen(false)}
                                className="bg-black text-white px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-slate-800"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
