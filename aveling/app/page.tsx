'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
    Search, 
    Calendar, 
    ChevronLeft, 
    ChevronRight, 
    BookOpen, 
    Award, 
    Users, 
    Dna, 
    ShieldCheck, 
    ArrowRight,
    MapPin,
    Phone,
    Mail,
    CheckCircle2
} from 'lucide-react';

export default function AvelingHomePage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [topic, setTopic] = useState('Any Topic');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        window.location.href = `/catalog?query=${encodeURIComponent(searchQuery)}&topic=${encodeURIComponent(topic)}`;
    };

    return (
        <div className="min-h-screen bg-white text-zinc-900 font-sans">
            {/* ========================================================= */}
            {/* 1. HERO BANNER SECTION (Attachment 1)                     */}
            {/* ========================================================= */}
            <section className="relative w-full h-[520px] md:h-[580px] bg-zinc-900 overflow-hidden flex items-center">
                <div className="absolute inset-0 z-0 opacity-45">
                    <Image 
                        src="/images/hero.png" 
                        alt="Aveling Corporate Training" 
                        fill 
                        className="object-cover object-center"
                        priority
                    />
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent z-10" />

                <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                    <div className="max-w-2xl space-y-6">
                        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
                            BSB50420 <span className="text-[#FFC700]">Diploma of Leadership and Management</span>
                        </h1>

                        <div className="w-24 h-1.5 bg-[#FFC700] rounded-full" />

                        <p className="text-lg sm:text-xl text-zinc-200 font-medium leading-relaxed">
                            Elevate your leadership. Four sessions. Your pace. Real impact.
                        </p>

                        <div className="pt-2 flex flex-wrap gap-4 items-center">
                            <Link 
                                href="/sponsored-course"
                                className="inline-flex items-center gap-2 bg-[#FFC700] text-black font-extrabold text-base px-8 py-4 rounded-md hover:bg-yellow-400 transition-all transform hover:-translate-y-0.5 shadow-lg shadow-yellow-500/20 uppercase tracking-wider"
                            >
                                Take Sponsored Course
                            </Link>
                            <Link 
                                href="/catalog"
                                className="inline-flex items-center gap-2 bg-zinc-900 border-2 border-white text-white font-extrabold text-base px-8 py-4 rounded-md hover:bg-white hover:text-black transition-all transform hover:-translate-y-0.5 uppercase tracking-wider"
                            >
                                Browse Catalog
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* ========================================================= */}
            {/* 2. COURSE SEARCH SECTION (Attachment 1)                   */}
            {/* ========================================================= */}
            <section className="bg-[#18181B] text-white py-10 px-4 sm:px-6 lg:px-8 border-t-4 border-[#FFC700]">
                <div className="max-w-7xl mx-auto space-y-6">
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-center tracking-tight">
                        Find your course
                    </h2>

                    <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 items-end bg-zinc-900 p-6 rounded-xl border border-zinc-800 shadow-xl">
                        {/* Search Query Input */}
                        <div className="lg:col-span-4 space-y-1.5">
                            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                                Search:
                            </label>
                            <div className="relative">
                                <input 
                                    type="text" 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Course name, code or keyword..." 
                                    className="w-full bg-white text-zinc-900 px-4 py-3 rounded-md text-sm font-medium focus:ring-2 focus:ring-[#FFC700] outline-none"
                                />
                            </div>
                        </div>

                        {/* Start Date */}
                        <div className="lg:col-span-2 space-y-1.5">
                            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                                Start Date:
                            </label>
                            <input 
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full bg-white text-zinc-900 px-3 py-3 rounded-md text-sm font-medium focus:ring-2 focus:ring-[#FFC700] outline-none"
                            />
                        </div>

                        {/* End Date */}
                        <div className="lg:col-span-2 space-y-1.5">
                            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                                End Date:
                            </label>
                            <input 
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full bg-white text-zinc-900 px-3 py-3 rounded-md text-sm font-medium focus:ring-2 focus:ring-[#FFC700] outline-none"
                            />
                        </div>

                        {/* Topic Dropdown */}
                        <div className="lg:col-span-2 space-y-1.5">
                            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                                Topic:
                            </label>
                            <select 
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                className="w-full bg-white text-zinc-900 px-3 py-3 rounded-md text-sm font-bold focus:ring-2 focus:ring-[#FFC700] outline-none"
                            >
                                <option value="Any Topic">Any Topic</option>
                                <option value="Work Health and Safety (WHS)">Work Health and Safety (WHS)</option>
                                <option value="Education and Training">Education and Training</option>
                                <option value="Hospitality and Retail">Hospitality and Retail</option>
                                <option value="Leadership & Management">Leadership & Management</option>
                            </select>
                        </div>

                        {/* Submit Search Button */}
                        <div className="lg:col-span-2">
                            <button 
                                type="submit"
                                className="w-full bg-[#FFC700] text-black font-extrabold text-sm py-3.5 px-6 rounded-md hover:bg-yellow-400 transition-all uppercase tracking-wider shadow-md"
                            >
                                Search
                            </button>
                        </div>
                    </form>

                    <div className="text-left pt-2">
                        <Link 
                            href="/catalog" 
                            className="inline-flex items-center gap-2 text-[#FFC700] hover:text-yellow-400 font-bold text-sm tracking-wide group transition-all"
                        >
                            <span>Advanced Search Options</span>
                            <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* ========================================================= */}
            {/* 3. FEATURED CATEGORIES CAROUSEL CARDS (Attachment 2)       */}
            {/* ========================================================= */}
            <section className="py-16 px-4 sm:px-6 lg:px-8 bg-zinc-50">
                <div className="max-w-7xl mx-auto space-y-8">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">
                            Explore Training Sectors
                        </h2>
                        {/* Carousel Arrows */}
                        <div className="flex items-center gap-2">
                            <button className="p-2.5 rounded-full bg-white border border-zinc-200 text-[#FFC700] hover:bg-[#FFC700] hover:text-black shadow-sm transition-all">
                                <ChevronLeft className="h-6 w-6 stroke-[3]" />
                            </button>
                            <button className="p-2.5 rounded-full bg-[#FFC700] text-black hover:bg-yellow-400 shadow-sm transition-all">
                                <ChevronRight className="h-6 w-6 stroke-[3]" />
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Card 1: WHS */}
                        <div className="bg-white rounded-xl overflow-hidden border border-zinc-200 shadow-md flex flex-col hover:shadow-xl transition-all group">
                            <div className="relative h-56 w-full overflow-hidden bg-zinc-900">
                                <Image 
                                    src="/images/whs.png"
                                    alt="Work Health and Safety (WHS)"
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                            </div>
                            <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                                <div className="space-y-3">
                                    <h3 className="text-xl font-extrabold text-zinc-900 leading-snug">
                                        Work Health and Safety (WHS)
                                    </h3>
                                    <p className="text-sm text-zinc-600 leading-relaxed font-normal">
                                        Work Health and Safety is important in all industries. Explore our selection of courses and find the right one for you.
                                    </p>
                                </div>
                                <div className="pt-2">
                                    <Link 
                                        href="/catalog?category=whs"
                                        className="inline-block bg-[#FFC700] text-black font-extrabold text-xs px-6 py-3 rounded-md hover:bg-yellow-400 transition-all uppercase tracking-wider"
                                    >
                                        View Courses
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Card 2: Education & Training */}
                        <div className="bg-white rounded-xl overflow-hidden border border-zinc-200 shadow-md flex flex-col hover:shadow-xl transition-all group">
                            <div className="relative h-56 w-full overflow-hidden bg-zinc-900">
                                <Image 
                                    src="/images/hero.png"
                                    alt="Education and Training"
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                            </div>
                            <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                                <div className="space-y-3">
                                    <h3 className="text-xl font-extrabold text-zinc-900 leading-snug">
                                        Education and Training
                                    </h3>
                                    <p className="text-sm text-zinc-600 leading-relaxed font-normal">
                                        Whether you are looking to train others in your organisation or to work in an RTO, our training and assessing skills and qualifications will get you there.
                                    </p>
                                </div>
                                <div className="pt-2">
                                    <Link 
                                        href="/catalog?category=education"
                                        className="inline-block bg-[#FFC700] text-black font-extrabold text-xs px-6 py-3 rounded-md hover:bg-yellow-400 transition-all uppercase tracking-wider"
                                    >
                                        View Courses
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Card 3: Hospitality & Retail */}
                        <div className="bg-white rounded-xl overflow-hidden border border-zinc-200 shadow-md flex flex-col hover:shadow-xl transition-all group">
                            <div className="relative h-56 w-full overflow-hidden bg-zinc-900">
                                <Image 
                                    src="/images/whs.png"
                                    alt="Hospitality and Retail"
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                            </div>
                            <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                                <div className="space-y-3">
                                    <h3 className="text-xl font-extrabold text-zinc-900 leading-snug">
                                        Hospitality and Retail
                                    </h3>
                                    <p className="text-sm text-zinc-600 leading-relaxed font-normal">
                                        From RSA to customer service, hospitality and retail workers perform best when they have the skills, knowledge and required training.
                                    </p>
                                </div>
                                <div className="pt-2">
                                    <Link 
                                        href="/catalog?category=hospitality"
                                        className="inline-block bg-[#FFC700] text-black font-extrabold text-xs px-6 py-3 rounded-md hover:bg-yellow-400 transition-all uppercase tracking-wider"
                                    >
                                        View Courses
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ========================================================= */}
            {/* 4. "ACHIEVE MORE WITH AVELING" SECTION (Attachment 3)     */}
            {/* ========================================================= */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white border-t border-zinc-100">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                    {/* Left 3-Image Collage Layout */}
                    <div className="lg:col-span-6 grid grid-cols-2 gap-4">
                        <div className="relative h-[380px] rounded-xl overflow-hidden shadow-lg border border-zinc-200">
                            <Image 
                                src="/images/whs.png" 
                                alt="Electrical and Technical Inspection" 
                                fill 
                                className="object-cover" 
                            />
                        </div>
                        <div className="space-y-4 flex flex-col justify-between">
                            <div className="relative h-[180px] rounded-xl overflow-hidden shadow-lg border border-zinc-200">
                                <Image 
                                    src="/images/hero.png" 
                                    alt="Corporate Workshop Presentation" 
                                    fill 
                                    className="object-cover" 
                                />
                            </div>
                            <div className="relative h-[180px] rounded-xl overflow-hidden shadow-lg border border-zinc-200">
                                <Image 
                                    src="/images/whs.png" 
                                    alt="Professional Learner Collaboration" 
                                    fill 
                                    className="object-cover" 
                                />
                            </div>
                        </div>
                    </div>

                    {/* Right Content */}
                    <div className="lg:col-span-6 space-y-6">
                        <div className="space-y-2">
                            <h2 className="text-3xl sm:text-4xl font-black text-zinc-900 tracking-tight">
                                Achieve more with Aveling
                            </h2>
                            <div className="w-20 h-1.5 bg-[#FFC700] rounded-full" />
                        </div>

                        <p className="text-base sm:text-lg font-bold text-zinc-800 leading-snug">
                            Aveling is a Registered Training Organisation (RTO), in Perth, Western Australia.
                        </p>

                        <div className="space-y-4 text-sm text-zinc-600 leading-relaxed">
                            <p>
                                With 25 years' experience, we are specialists in safety training, leadership and management, and training and assessment courses.
                            </p>
                            <p>
                                We offer Nationally Recognised qualifications, skill sets and units of competency, as well as world-class vocational short courses and inductions.
                            </p>
                            <p>
                                Our range of Aveling training courses is continuously growing with flexible online options and in-person training at our modern facilities in Jandakot and Karratha, or on-site.
                            </p>
                        </div>

                        <div className="pt-4 flex flex-wrap gap-4">
                            <Link 
                                href="/catalog"
                                className="inline-block bg-[#FFC700] text-black font-extrabold text-xs px-8 py-3.5 rounded-md hover:bg-yellow-400 transition-all uppercase tracking-wider shadow-md"
                            >
                                Find Out More
                            </Link>
                            <Link 
                                href="/my-certifications"
                                className="inline-block bg-white text-black border-2 border-black font-extrabold text-xs px-8 py-3.5 rounded-md hover:bg-black hover:text-white transition-all uppercase tracking-wider"
                            >
                                Book Now
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* ========================================================= */}
            {/* 5. "OUR ETHOS" GLASSMORPHIC SECTION (Attachment 4)        */}
            {/* ========================================================= */}
            <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-zinc-900 text-white overflow-hidden">
                {/* Background image overlay */}
                <div className="absolute inset-0 z-0 opacity-30">
                    <Image 
                        src="/images/hero.png" 
                        alt="Aveling Ethos" 
                        fill 
                        className="object-cover" 
                    />
                </div>
                <div className="absolute inset-0 bg-black/75 z-10" />

                <div className="relative z-20 max-w-7xl mx-auto space-y-12">
                    {/* Header Banner */}
                    <div className="text-center space-y-4">
                        <p className="text-xl sm:text-3xl font-light tracking-[0.4em] text-white uppercase border-b border-zinc-800 pb-4 inline-block">
                            ACHIEVE MORE™
                        </p>
                        <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight pt-2">
                            Our Ethos
                        </h2>
                    </div>

                    {/* 3 Glassmorphic Overlay Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Card 1 */}
                        <div className="bg-zinc-900/80 backdrop-blur-md rounded-2xl border border-zinc-700/60 p-8 space-y-4 hover:border-[#FFC700] transition-all">
                            <div className="w-14 h-14 rounded-full border-2 border-[#FFC700] flex items-center justify-center text-[#FFC700]">
                                <Search className="h-7 w-7 stroke-[2.5]" />
                            </div>
                            <h3 className="text-xl font-extrabold text-white">
                                We Focus On You
                            </h3>
                            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                                We focus on the individual goals of the people who come to Aveling to learn and develop their careers, and the objectives of our corporate clients who come to us for our expert knowledge, track record of success and reputation in the industry.
                            </p>
                        </div>

                        {/* Card 2 */}
                        <div className="bg-zinc-900/80 backdrop-blur-md rounded-2xl border border-zinc-700/60 p-8 space-y-4 hover:border-[#FFC700] transition-all">
                            <div className="w-14 h-14 rounded-full border-2 border-[#FFC700] flex items-center justify-center text-[#FFC700]">
                                <Dna className="h-7 w-7 stroke-[2.5]" />
                            </div>
                            <h3 className="text-xl font-extrabold text-white">
                                Our DNA
                            </h3>
                            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                                At the very heart of Aveling is our DNA: to Develop, Nurture and Appreciate all who come through our doors, from our individual learners, to our corporate clientele and our own employees.
                            </p>
                        </div>

                        {/* Card 3 */}
                        <div className="bg-zinc-900/80 backdrop-blur-md rounded-2xl border border-zinc-700/60 p-8 space-y-4 hover:border-[#FFC700] transition-all">
                            <div className="w-14 h-14 rounded-full border-2 border-[#FFC700] flex items-center justify-center text-[#FFC700]">
                                <Users className="h-7 w-7 stroke-[2.5]" />
                            </div>
                            <h3 className="text-xl font-extrabold text-white">
                                Family Values
                            </h3>
                            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                                As a family-owned and run business we place strong value on connection and relationships, from our clients to our people and the people of Australia.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ========================================================= */}
            {/* 6. "OUR OFFERING" SECTION (Attachment 5)                  */}
            {/* ========================================================= */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-zinc-50">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                    {/* Left Classroom Photo */}
                    <div className="lg:col-span-6 relative h-[420px] rounded-xl overflow-hidden shadow-xl border border-zinc-200">
                        <Image 
                            src="/images/hero.png" 
                            alt="Classroom Education Offering" 
                            fill 
                            className="object-cover" 
                        />
                    </div>

                    {/* Right Offering Details */}
                    <div className="lg:col-span-6 space-y-8">
                        <div className="space-y-2">
                            <h2 className="text-3xl sm:text-4xl font-black text-zinc-900 tracking-tight">
                                Our Offering
                            </h2>
                            <div className="w-20 h-1.5 bg-[#FFC700] rounded-full" />
                        </div>

                        <p className="text-base text-zinc-700 font-medium">
                            Aveling is your premier Registered Training Organisation (RTO) in Perth for vocational education and training.
                        </p>

                        <div className="space-y-6">
                            {/* Feature 1: Nationally Recognised Training */}
                            <div className="flex gap-4 items-start">
                                <div className="w-12 h-12 rounded-lg bg-emerald-100 border border-emerald-300 flex items-center justify-center shrink-0 text-emerald-700">
                                    <ShieldCheck className="h-6 w-6 stroke-[2.5]" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-lg font-extrabold text-zinc-900">
                                        Nationally Recognised Training
                                    </h3>
                                    <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                                        We offer a variety of accredited courses including BSB41419 Certificate IV in Work Health and Safety, TAE40122 Certificate IV in Training and Assessment, BSB40250 Diploma in Leadership and Management, skill sets and units of competency.
                                    </p>
                                </div>
                            </div>

                            {/* Feature 2: Short Courses */}
                            <div className="flex gap-4 items-start">
                                <div className="w-12 h-12 rounded-lg bg-[#FFC700] flex items-center justify-center shrink-0 text-black">
                                    <BookOpen className="h-6 w-6 stroke-[2.5]" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-lg font-extrabold text-zinc-900">
                                        Short courses
                                    </h3>
                                    <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                                        Over 100 online and classroom based short courses, designed to upskill or reskill you in health and safety, leadership and management, hospitality, and a huge variety.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ========================================================= */}
            {/* 7. FOOTER SECTION                                         */}
            {/* ========================================================= */}
            <footer className="bg-zinc-950 text-white border-t-8 border-[#FFC700] pt-12 pb-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-zinc-800">
                    <div className="space-y-4">
                        <span className="text-2xl font-black tracking-[0.25em] text-[#FFC700] font-sans uppercase">
                            AVELING
                        </span>
                        <p className="text-xs text-zinc-400 leading-relaxed">
                            Premier Registered Training Organisation (RTO 50503) delivering Nationally Recognised vocational training, WHS safety compliance, and ticket sponsorship.
                        </p>
                    </div>

                    <div className="space-y-3">
                        <h4 className="text-sm font-extrabold uppercase tracking-wider text-[#FFC700]">
                            Quick Links
                        </h4>
                        <ul className="space-y-2 text-xs font-semibold text-zinc-400">
                            <li><Link href="/catalog" className="hover:text-white transition-colors">Course Catalog</Link></li>
                            <li><Link href="/my-certifications" className="hover:text-white transition-colors">My Certifications & Gaps</Link></li>
                            <li><Link href="/payments" className="hover:text-white transition-colors">Payment Gateway & Receipts</Link></li>
                            <li><Link href="/notifications" className="hover:text-white transition-colors">Notification Center</Link></li>
                        </ul>
                    </div>

                    <div className="space-y-3">
                        <h4 className="text-sm font-extrabold uppercase tracking-wider text-[#FFC700]">
                            Campus Locations
                        </h4>
                        <div className="space-y-2 text-xs text-zinc-400">
                            <p className="flex items-start gap-2">
                                <MapPin className="h-4 w-4 text-[#FFC700] shrink-0 mt-0.5" />
                                <span>Jandakot: 83 Jandakot Rd, Jandakot WA 6164</span>
                            </p>
                            <p className="flex items-start gap-2">
                                <MapPin className="h-4 w-4 text-[#FFC700] shrink-0 mt-0.5" />
                                <span>Karratha: 1/1 Flashman Ave, Karratha WA 6714</span>
                            </p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h4 className="text-sm font-extrabold uppercase tracking-wider text-[#FFC700]">
                            Contact Support
                        </h4>
                        <div className="space-y-2 text-xs text-zinc-400">
                            <p className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-[#FFC700] shrink-0" />
                                <span>+61 8 9379 9999</span>
                            </p>
                            <p className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-[#FFC700] shrink-0" />
                                <span>booking@swiftwings.online</span>
                            </p>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto pt-6 flex flex-col sm:flex-row justify-between items-center text-xs text-zinc-500 gap-4">
                    <p>© 2026 Aveling RTO #50503. All Rights Reserved. FIFO Training & Compliance Platform.</p>
                    <div className="flex gap-6 font-semibold">
                        <a href="#" className="hover:text-zinc-300">Privacy Policy</a>
                        <a href="#" className="hover:text-zinc-300">Terms & Conditions</a>
                        <a href="#" className="hover:text-zinc-300">RTO Accreditation</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
