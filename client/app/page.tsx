'use client'
import { useState, useEffect, useMemo } from 'react';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { PublicFooter } from '@/components/layout/PublicFooter';
import { useApiQuery } from '@/lib/hooks';
import Link from 'next/link';
import Image from 'next/image';
import { CONSTANTS } from '@/constants';
import { JobListing } from '@/types/models';

const TESTIMONIALS = [
  {
    name: "Elena R.",
    role: "Senior DevOps Engineer",
    text: "BlueCollarRecruitment streamlined my transition to a global tech hub. The curation is unmatched and the process is seamless.",
    location: "Berlin, DE",
    image: "/images/testimonials/elena.png"
  },
  {
    name: "Marcus T.",
    role: "Product Design Lead",
    text: "Minimalist, efficient, and professional. The best platform I've used for high-impact roles. Truly a premium experience.",
    location: "San Francisco, USA",
    image: "/images/testimonials/marcus.png"
  },
  {
    name: "Sofia K.",
    role: "FinTech Consultant",
    text: "The verification process gave me confidence in my new placement. Highly recommend for any serious professional.",
    location: "London, UK",
    image: "/images/testimonials/sofia.png"
  },
  {
    name: "David W.",
    role: "Head of Operations",
    text: "Simple but powerful. They nderstand the needs of executive talent and provide exceptional service levels.",
    location: "Sydney, AU",
    image: "/images/testimonials/david.png"
  },
  {
    name: "Aisha M.",
    role: "Full Stack Developer",
    text: "From application to offer in just 14 days. This platform is a game-changer for international careers.",
    location: "Dubai, UAE",
    image: "/images/testimonials/aisha.png"
  }
];

const PARTNERS = [
  { name: "Microsoft", industry: "Tech", icon: "window" },
  { name: "BP Global", industry: "Energy", icon: "emergency" },
  { name: "Shell Africa", industry: "Energy", icon: "database" },
  { name: "Chevron", industry: "Energy", icon: "featured_play_list" },
  { name: "TotalEnergies", industry: "Energy", icon: "circle" },
  { name: "ExxonMobil", industry: "Energy", icon: "change_history" },
  { name: "Saudi Aramco", industry: "Energy", icon: "hexagon" },
  { name: "Equinor", industry: "Energy", icon: "filter_tilt_shift" },
  { name: "Schlumberger", industry: "Services", icon: "architecture" },
  { name: "Halliburton", industry: "Services", icon: "settings_input_component" },
  { name: "Petronas", industry: "Energy", icon: "shield" },
  { name: "Eni S.p.A.", industry: "Energy", icon: "token" }
];

const GALLERY_IMAGES = [
  { src: "/images/gallery/offshore-rig.png", role: "Offshore Specialist", description: "Precision on the frontiers.", span: "md:col-span-2 md:row-span-2" },
  { src: "/images/gallery/nurse.png", role: "Health Care Professional", description: "Compassion without borders.", span: "md:col-span-1 md:row-span-1" },
  { src: "/images/gallery/electrician.png", role: "Electrician", description: "Power, controlled.", span: "md:col-span-1 md:row-span-1" },
  { src: "/images/gallery/remote-worker.png", role: "Remote Worker", description: "Remote Freelancer.", span: "md:col-span-1 md:row-span-2" },
  { src: "/images/gallery/chemical engineer.png", role: "Chemical Engineer", description: "Engineering the future.", span: "md:col-span-1 md:row-span-1" },
  { src: "/images/gallery/marine-technician.png", role: "Marine Systems Chief", description: "Mastery of the high seas.", span: "md:col-span-2 md:row-span-1" },
  { src: "/images/gallery/chef.png", role: "Chef", description: "Culinary excellence at the edge.", span: "md:col-span-1 md:row-span-1" },
  { src: "/images/gallery/construction-worker.png", role: "Construction Worker", description: "Building the future.", span: "md:col-span-1 md:row-span-1" },
  { src: "/images/gallery/surveyor.png", role: "Geospatial Analyst", description: "Mapping future infrastructure.", span: "md:col-span-1 md:row-span-1" },
  { src: "/images/gallery/oilrig.png", role: "Oil Rig Worker", description: "Powering the world.", span: "md:col-span-1 md:row-span-1" },
];

import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);
  // Decouple query from search input to prevent re-fetching on every keystroke
  const { data: jobs, isLoading } = useApiQuery<{ rows: JobListing[], count: number }>(
    ['jobs', 'public', 'featured'],
    `/jobs?featured=true&limit=6`
  );

  const jobList = jobs?.rows || [];
  const doubledPartners = useMemo(() => PARTNERS.concat(PARTNERS), []);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/jobs?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/jobs');
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-white text-blue-900 min-h-screen flex flex-col font-sans antialiased overflow-x-hidden">
      <PublicHeader />

      <main className="pt-24 lg:pt-32 flex-1 pb-24">
        {/* Simplified Hero */}
        <div className="max-w-[900px] mx-auto text-center mb-16 lg:mb-24 px-6">
          <div className="inline-block px-4 py-1.5 bg-blue-50 border border-blue-100 rounded-full text-[8px] md:text-[9px] font-bold text-blue-400 uppercase tracking-[0.2em] mb-8 animate-fade-in">
            Global Placement Infrastructure
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-8 text-blue-900 leading-[1.1] lg:px-0 px-4">
            Curated Career <br /><span className="text-blue-400 italic">Excellence.</span>
          </h1>
          <p className="text-blue-500 text-base md:text-lg lg:text-xl font-medium max-w-[600px] mx-auto leading-relaxed">
            A minimalist approach to career advancement. We connect high-impact professionals with vetted global roles.
          </p>
        </div>

        <div className="max-w-[700px] mx-auto mb-16 md:mb-24 px-6">
          <div className="flex flex-col sm:flex-row gap-3 p-2 bg-blue-50 rounded-2xl border border-blue-100 shadow-sm">
            <div className="flex-1 flex items-center px-4">
              <span className="material-symbols-outlined text-blue-400 mr-3">search</span>
              <input
                className="w-full bg-transparent border-none focus:ring-0 text-[10px] md:text-sm font-bold uppercase tracking-widest py-3 placeholder:text-blue-300 outline-none"
                placeholder="Job title or keywords"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <button
              onClick={handleSearch}
              className="bg-blue-900 text-white px-6 md:px-10 py-3.5 md:py-4 rounded-xl text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] shadow-xl shadow-blue-900/10 hover:bg-black transition-all active:scale-95"
            >
              Explore Roles
            </button>
          </div>
        </div>

        {/* Trusted By Section */}
        <section className="mb-32 overflow-hidden border-y border-blue-50 py-12 lg:py-16">
          <div className="max-w-[1280px] mx-auto px-8 mb-10 text-center">
            <span className="text-[10px] font-black text-blue-300 uppercase tracking-[0.4em]">Integrated with Global Infrastructure</span>
          </div>
          <div className="flex whitespace-nowrap overflow-hidden">
            <div className="flex gap-20 md:gap-32 animate-marquee items-center min-w-full justify-around opacity-60 hover:opacity-100 transition-all duration-700 grayscale hover:grayscale-0">
              {doubledPartners.map((partner, i) => (
                <div key={i} className="flex flex-col items-center gap-2 group">
                  <div className="flex items-center gap-4">
                    <span className="material-symbols-outlined text-3xl md:text-4xl text-blue-900 transition-transform group-hover:scale-110 group-hover:text-blue-600">
                      {partner.icon}
                    </span>
                    <span className="text-xl md:text-3xl font-black italic uppercase tracking-tighter text-blue-900 transition-all group-hover:italic group-hover:tracking-tight">
                      {partner.name}
                    </span>
                  </div>
                  <span className="text-[8px] font-black text-blue-300 uppercase tracking-[0.4em] group-hover:text-blue-900 transition-colors ml-12">{partner.industry}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Inspirational Gallery */}
        <section className="mb-40 px-6 max-w-[1440px] mx-auto">
          <div className="text-center mb-20">
            <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] block mb-6 animate-fade-in">Visualizing Success</span>
            <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter text-blue-900 leading-none">
              The Faces of <br />Industry Excellence.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 auto-rows-[300px]">
            {GALLERY_IMAGES.map((img, i) => (
              <div
                key={i}
                className={`group relative overflow-hidden rounded-[3rem] border border-blue-50 shadow-sm hover:shadow-2xl hover:shadow-blue-900/20 transition-all duration-700 ${img.span}`}
              >
                <Image
                  src={img.src}
                  alt={img.role}
                  fill
                  className="object-cover transition-transform duration-1000 group-hover:scale-110"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-950/90 via-blue-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-10 backdrop-blur-[2px] group-hover:backdrop-blur-none">
                  <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">{img.role}</span>
                  <h4 className="text-2xl font-black text-white italic tracking-tighter translate-y-4 group-hover:translate-y-0 transition-transform duration-700 delay-75">{img.description}</h4>
                </div>
                {/* Minimal Overlay Badge */}
                <div className="absolute top-8 left-8 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full opacity-100 group-hover:opacity-0 transition-opacity duration-300">
                  <span className="text-[8px] font-bold text-white uppercase tracking-widest">{img.role.split(' ')[0]}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Job Listings Grid */}
        <section className="max-w-[1280px] mx-auto mb-40 px-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 px-2 gap-6">
            <div className="space-y-1">
              <h2 className="text-[10px] font-black text-blue-900 uppercase tracking-[0.4em]">Open Positions</h2>
              <p className="text-[9px] font-bold text-blue-300 uppercase tracking-widest">Hand-vetted global opportunities</p>
            </div>
            <div className="h-px bg-blue-100 flex-1 mx-12 hidden md:block"></div>
            <Link href={CONSTANTS.ROUTES.PUBLIC_JOBS} className="text-[10px] font-black text-blue-500 hover:text-blue-900 uppercase tracking-widest transition-colors border border-blue-100 px-6 py-3 rounded-xl hover:bg-blue-50 w-fit">
              View All Registry
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {isLoading ? (
              [1, 2, 3].map(i => (
                <div key={i} className="bg-blue-50 border border-blue-100 p-8 rounded-[2.5rem] h-80 animate-pulse" />
              ))
            ) : jobList.length === 0 ? (
              <div className="col-span-full py-24 text-center bg-blue-50/50 rounded-[3rem] border border-dashed border-blue-200">
                <span className="material-symbols-outlined text-4xl text-blue-200 mb-4">clinical_notes</span>
                <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">No featured roles currently available.</p>
                <Link
                  href="/jobs"
                  className="mt-6 text-[8px] font-black text-blue-900 uppercase tracking-widest border-b-2 border-blue-900 pb-1 inline-block"
                >
                  View Full Registry
                </Link>
              </div>
            ) : (
              jobList.slice(0, 6).map((job: JobListing) => (
                <Link
                  key={job.id}
                  href={`/jobs/${job.id}`}
                  className="bg-white p-10 rounded-[2.5rem] border border-blue-50 hover:border-blue-900 hover:shadow-2xl hover:shadow-blue-900/5 transition-all duration-500 flex flex-col justify-between h-full group relative overflow-hidden"
                >
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-8">
                      <span className="px-3 py-1.5 bg-blue-50 rounded-lg text-[9px] font-black italic text-blue-400 uppercase tracking-widest group-hover:bg-blue-900 group-hover:text-white transition-all">
                        {job.JobCategory?.name || 'Vetted'}
                      </span>
                    </div>
                    <h3 className="text-xl md:text-2xl font-black text-blue-900 mb-3 tracking-tight leading-tight group-hover:italic transition-all">{job.title}</h3>
                    <p className="text-[9px] font-bold text-blue-400 uppercase tracking-widest flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm">location_on</span> {job.location}
                    </p>
                  </div>
                  <div className="mt-12 flex items-center justify-between pt-6 border-t border-blue-50 relative z-10">
                    <span className="text-[8px] font-black text-blue-900 uppercase tracking-widest px-3 py-1 bg-blue-50 rounded-full">{job.employmentType}</span>
                    <span className="material-symbols-outlined text-blue-900 group-hover:translate-x-2 transition-transform font-black">east</span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>

        {/* Global Presence Section */}
        <section className="bg-blue-900 py-32 mb-40 text-white overflow-hidden relative rounded-[4rem] mx-6">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full mix-blend-overlay filter blur-3xl"></div>
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-500 rounded-full mix-blend-overlay filter blur-3xl"></div>
          </div>

          <div className="max-w-[1280px] mx-auto px-8 relative z-10">
            <div className="flex flex-col lg:flex-row items-center gap-20">
              <div className="flex-1 text-center lg:text-left">
                <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] block mb-6">Global Hubs</span>
                <h2 className="text-4xl lg:text-6xl font-black italic tracking-tighter mb-8 leading-none">
                  A Unified Network of <br />Elite Talent.
                </h2>
                <p className="text-blue-400 text-lg font-medium leading-relaxed max-w-[500px] mx-auto lg:mx-0">
                  Our physical presence in key economic zones ensures localized expertise and cultural alignment for every placement.
                </p>
              </div>

              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-8 w-full">
                <div className="p-10 bg-white/5 backdrop-blur-md rounded-[3rem] border border-white/10 group hover:bg-white/10 transition-all">
                  <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-10 block">Region 01</span>
                  <h4 className="text-2xl font-black mb-4 italic uppercase tracking-tighter">Australia</h4>
                  <p className="text-xs text-blue-400 leading-relaxed font-bold uppercase tracking-widest">100 Mount St, North Sydney NSW 2060</p>
                </div>

                <div className="p-10 bg-white/5 backdrop-blur-md rounded-[3rem] border border-white/10 group hover:bg-white/10 transition-all">
                  <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-10 block">Region 02</span>
                  <h4 className="text-2xl font-black mb-4 italic uppercase tracking-tighter">United States</h4>
                  <p className="text-xs text-blue-400 leading-relaxed font-bold uppercase tracking-widest">500 Seventh Avenue, New York, NY 10018</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Carousel */}
        <section className="max-w-[1100px] mx-auto mb-40 px-6">
          <div className="text-center mb-20">
            <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.4em] block mb-4">Success Stories</span>
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-blue-900 uppercase italic">Validation.</h2>
          </div>

          <div className="relative bg-blue-50/50 rounded-[4rem] p-12 lg:p-24 overflow-hidden border border-blue-50">
            <div className="relative z-10 transition-all duration-700 min-h-[300px] flex flex-col items-center justify-center text-center">
              <div className="mb-12 relative">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-white shadow-2xl relative z-10">
                  <Image
                    src={TESTIMONIALS[currentSlide].image}
                    alt={TESTIMONIALS[currentSlide].name}
                    fill
                    priority
                    className="object-cover transition-all duration-500 scale-105"
                    sizes="128px"
                  />
                </div>
                <div className="absolute -bottom-2 -right-2 w-10 h-10 md:w-12 md:h-12 bg-blue-900 rounded-full flex items-center justify-center text-white shadow-xl z-20">
                  <span className="material-symbols-outlined text-sm md:text-xl">format_quote</span>
                </div>
              </div>

              <p className="text-xl md:text-3xl font-medium text-blue-900 leading-relaxed max-w-[800px] mb-12 italic tracking-tight">
                "{TESTIMONIALS[currentSlide].text}"
              </p>

              <div className="space-y-1">
                <h5 className="font-black text-blue-900 uppercase tracking-widest text-base md:text-lg">{TESTIMONIALS[currentSlide].name}</h5>
                <p className="text-[9px] md:text-[10px] font-bold text-blue-400 uppercase tracking-widest">{TESTIMONIALS[currentSlide].role} • {TESTIMONIALS[currentSlide].location}</p>
              </div>
            </div>

            <div className="flex justify-center gap-3 mt-16 relative z-10">
              {TESTIMONIALS.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-1 transition-all duration-500 rounded-full ${idx === currentSlide ? 'w-12 bg-blue-900' : 'w-4 bg-blue-200'}`}
                />
              ))}
            </div>

            <button
              onClick={() => setCurrentSlide((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length)}
              className="absolute left-8 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full border border-blue-100 bg-white flex items-center justify-center text-blue-400 hover:text-blue-900 hover:border-blue-900 transition-all z-20 hidden lg:flex shadow-xl shadow-blue-900/5"
            >
              <span className="material-symbols-outlined font-black">west</span>
            </button>
            <button
              onClick={() => setCurrentSlide((prev) => (prev + 1) % TESTIMONIALS.length)}
              className="absolute right-8 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full border border-blue-100 bg-white flex items-center justify-center text-blue-400 hover:text-blue-900 hover:border-blue-900 transition-all z-20 hidden lg:flex shadow-xl shadow-blue-900/5"
            >
              <span className="material-symbols-outlined font-black">east</span>
            </button>
          </div>
        </section>

        {/* CTA Section */}
        <section className="max-w-[1280px] mx-auto px-6 mb-24">
          <div className="bg-blue-50/50 rounded-[5rem] px-8 py-24 text-center border border-blue-50 flex flex-col items-center">
            <div className="w-20 h-20 bg-white rounded-3xl shadow-xl shadow-blue-900/5 flex items-center justify-center mb-10">
              <span className="material-symbols-outlined text-4xl text-blue-900">verified_user</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold tracking-tight text-blue-900 mb-8 uppercase italic tracking-tighter">Ready for the Next Protocol?</h2>
            <p className="text-blue-500 text-lg mb-12 max-w-sm mx-auto font-medium leading-relaxed">Join the registry and unlock access to hand-curated global opportunities.</p>
            <Link href={CONSTANTS.ROUTES.REGISTER} className="bg-blue-900 text-white px-10 md:px-14 py-4 md:py-5 rounded-2xl text-[10px] md:text-xs font-black uppercase tracking-[0.3em] shadow-2xl shadow-blue-900/20 hover:bg-black transition-all hover:scale-[1.02] active:scale-95">
              Begin Enrollment
            </Link>
          </div>
        </section>
      </main>

      <PublicFooter />

    </div>
  );
}
