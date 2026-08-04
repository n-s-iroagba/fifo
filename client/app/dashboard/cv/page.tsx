'use client';

import React, { useState, Suspense } from 'react';
import { useApiQuery, useApiMutation } from '@/lib/hooks';
import { useQueryClient } from '@tanstack/react-query';
import { CONSTANTS } from '@/constants';
import api from '@/lib/api';
import { useSearchParams, useRouter } from 'next/navigation';
import { uploadFile } from '@/lib/utils';

interface Cv {
    id: number;
    fileName?: string;
    fileUrl: string;
    fileSize?: number;
    createdAt?: string;
}

function CvContent() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const searchParams = useSearchParams();
    const redirectPath = searchParams.get('redirect');
    const { data: cv, isLoading, refetch } = useApiQuery<Cv | null>(['cv', 'current'], '/cv');
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const deleteMutation = useApiMutation('delete', '/cv', {
        onSuccess: () => {
            refetch();
            queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
        }
    });

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setError(null);
        setSuccess(false);
        setUploading(true);

        // Requirement 1.1: Notify user via toast message that CV should be in ATS format
        setToastMessage("Note: Please ensure your CV is in ATS format for optimal job matching and automated parsing.");
        setTimeout(() => setToastMessage(null), 6000);

        if (file.size > CONSTANTS.FILE_CONSTRAINTS.CV_LIMIT_MB * 1024 * 1024) {
            setError(`File size exceeds ${CONSTANTS.FILE_CONSTRAINTS.CV_LIMIT_MB}MB limit.`);
            setUploading(false);
            return;
        }

        try {
            const cloudinaryUrl = await uploadFile(file, 'image');

            await api.post('/cv', {
                cvUrl: cloudinaryUrl,
                fileName: file.name,
                fileType: file.type,
                fileSizeMb: parseFloat((file.size / (1024 * 1024)).toFixed(2))
            });
            
            setSuccess(true);
            await refetch();
            await queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
            
            if (redirectPath) {
                setTimeout(() => router.push(redirectPath), 1500);
            } else {
                setTimeout(() => router.push('/dashboard'), 1500);
            }
        } catch (err: any) {
            setError(err.response?.data?.error || 'Upload failed.');
        } finally {
            setUploading(false);
        }
    };

    const handleDownloadTemplate = () => {
        const templateContent = `BILLY MEGA BERLIN
Phone: +61-417593439 | Email: Billymega26@gmail.com

================================================================================
PROFILE
================================================================================
Dedicated and hardworking professional with strong integrity and a proven ability to exceed expectations. Highly adaptable and communicative, with a proactive mindset and strong commitment to delivering quality results. A valuable team player in any organization or work environment.

================================================================================
SKILLS & PERSONALITY
================================================================================
• Strategic Planning
• Problem Solving
• Tool Setup and Cleanup
• Creative Thinking
• Hard Work
• Initiative and knowing priorities
• Power Tools Operation
• Hand Tools Proficiency
• Fast Learner and Fast Adaptation
• Safety Procedures Compliance
• Manual Handling
• Operate Machine
• Inventory Management

================================================================================
WORK EXPERIENCE
================================================================================
Baiada Poultry                                                Aug 2025 - Present
Cleaner Factory Machine
References: Didik (Leader) +614399283454
  • Cleaner (Cleaning the factory and Machine)
    - Cleaning hanging room, hanging machine and conveyor belt, vacuum packing machine, and marinate machine.
    - Chemical handling and working with PPE (Topax686, Chlorine, Sanitize)
    - Safety and hygiene

Howe Farm Enterprises (Heavy Labour)                           Jan 2025 - Sept 2025
Banana Farm Shed & Paddock
References: Jerome (Manager) +61413856221 | Yansiy (Supervisor) +61422187016
  • Unloading, operate hydraulic hang machine to hang the bunch, after open bag and put chain
  • Dehanding the bunch, cutting all banana from running hook into a hand of bananas.
  • Clustering hand of bananas, cutting in running belt from a hand of bananas into a small cut and also grading at the same time.
  • Stacking the box of bananas, with 4 different box with 14-15kg for small box and 17-18kg for big box, put the lids before and also filling the boxes, big plastic, small plastic, paper and lids for the packers.
  • Boxes, operate Visy Box machine to make box from cut board.
  • Recycle, operate recycle machine to make a big box of plastic recycle.
  • Dieseling the trees of bananas after they harvest it.
  • Dileaving the leaves, cutting the broken Leaves
  • Drive Tractor with the trailer before do unloading
  • Humping the banana around 40 - 80kg/bunch and put in trailer
  • Cleaning Shed and all the machine with chemical handling

PT. Intersoft Solutions (iSeller)                             Apr 2021 - Nov 2024
Pre - Sales officer and Lead of Pre-Sales (Product Specialist)
References: Imam (Head of Pre-Sales) +6282129244224 | Moses (Head of Enterprise) +6281210719909
  • Pitching Enterprise client.
  • Lead the project.
  • Giving efficient flow for back system.
  • Make PRD and lead programmer also Product Owner Team base on client requirements.
  • Connecting API to third party (WMS, ERP, In house client system, etc).

PT. Albarsha Group Persada                                    Feb 2018 - Apr 2021
Entertainment Providers (Event Organizer and Event Production)
References: Aldira Akbar (CEO) +6287763764359 | Nm. Arief (Manager) +628111198919
  • Trade Assistant Rigging (Setup Stage and Event)
    - Assisting with tools and equipment
    - Help tradies do their job
    - Site preparation and clean up
    - Equipment maintenance
  • General Labourer (Setup Stage and Event)
    - Pallet Jack Operation
    - Loading & Unloading Deliveries
    - Lifting weights stuff for installment
    - Waste Removal & Site Cleanup

================================================================================
EDUCATION
================================================================================
• Bina Nusantara University (Binus) - School of Computer Science

================================================================================
TICKET (CERTIFICATIONS & LICENSES)
================================================================================
• White Card - CPCWHS1001
• Driving License Australia - Class C 'Manual'
• HLTAID009, HLTAID010, HLTAID011
ps: Another ticket would be taken immediately if it's necessary as a requirement, thank you.`;

        const blob = new Blob([templateContent], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'ATS_Compliance_CV_Template.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    if (isLoading) return <div className="p-12 text-center text-[10px] font-bold uppercase tracking-widest text-blue-400">Loading Profile...</div>;

    return (
        <div className="font-sans text-blue-900 pb-24 relative">
            {/* Requirement 1.1 Toast Message */}
            {toastMessage && (
                <div className="fixed top-6 right-6 z-50 bg-blue-900 text-white p-4 rounded-xl shadow-2xl border border-blue-700 max-w-md flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                    <span className="material-symbols-outlined text-blue-400">info</span>
                    <div>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-blue-300">ATS Format Notice</p>
                        <p className="text-[11px] text-slate-200 mt-1">{toastMessage}</p>
                    </div>
                    <button onClick={() => setToastMessage(null)} className="ml-auto text-blue-300 hover:text-white">
                        <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                </div>
            )}

            <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.2em] block mb-2">Career Profile</span>
                    <h1 className="text-3xl font-bold text-blue-900 tracking-tight">Professional Resume</h1>
                </div>

                {/* Requirement 1.2: Download ATS CV Template Button */}
                <div className="flex flex-wrap items-center gap-3">
                    <button
                        onClick={handleDownloadTemplate}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 shadow-sm transition-all"
                    >
                        <span className="material-symbols-outlined text-base">download</span>
                        Download ATS CV Template
                    </button>

                    {/* Requirement 1.3: Google Search Link */}
                    <a
                        href="https://www.google.com/search?q=What+is+ATS+CV+format%3F+and+how+to+create+one%3F+and+Why+is+it+important%3F"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-blue-50 text-blue-900 border border-blue-200 hover:bg-blue-100 px-4 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 transition-all"
                    >
                        <span className="material-symbols-outlined text-base">open_in_new</span>
                        Learn ATS Format
                    </a>
                </div>
            </header>

            {success && (
                <div className="mb-8 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
                    <span className="material-symbols-outlined text-emerald-500">check_circle</span>
                    <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest">Resume Uploaded Successfully {redirectPath ? '— Returning to Application...' : ''}</p>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2 space-y-8">
                    {!cv ? (
                        <section className="bg-white p-8 md:p-12 rounded-2xl border-2 border-dashed border-blue-200 flex flex-col items-center justify-center text-center">
                            <div className="w-12 h-12 md:w-16 md:h-16 bg-blue-50 rounded-full flex items-center justify-center text-blue-400 mb-6">
                                <span className="material-symbols-outlined text-3xl md:text-4xl">cloud_upload</span>
                            </div>
                            <h3 className="text-lg md:text-xl font-bold text-blue-900 mb-2">Upload Your Resume</h3>
                            <div className="mb-8 p-6 bg-blue-50 border border-blue-100 rounded-2xl text-center max-w-sm">
                                <p className="text-[10px] font-bold text-blue-900 uppercase tracking-widest mb-3">ATS Compatibility</p>
                                <p className="text-blue-500 text-[11px] leading-relaxed">
                                    Upload your professional resume in ATS format so recruiters can parse your qualifications and match you with FIFO roles.
                                </p>
                            </div>
                            <label className="w-full md:w-auto bg-blue-900 text-white px-8 py-4 md:py-3.5 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-blue-800 transition-all cursor-pointer shadow-lg shadow-blue-900/10 active:scale-95 text-center">
                                {uploading ? 'Processing...' : 'Select Resume'}
                                <input
                                    type="file"
                                    className="hidden"
                                    onChange={handleFileUpload}
                                    disabled={uploading}
                                />
                            </label>
                            {error && (
                                <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                                    <span className="material-symbols-outlined text-sm block mb-2">warning</span>
                                    {error}
                                </div>
                            )}
                        </section>
                    ) : (
                        <section className="space-y-4">
                            <h2 className="text-[10px] font-bold text-blue-400 uppercase tracking-widest px-1">Active Resume</h2>
                            <div className="bg-white p-6 md:p-8 rounded-2xl border border-blue-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="flex items-center gap-4 md:gap-6">
                                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-blue-900 text-white flex items-center justify-center shrink-0">
                                        <span className="material-symbols-outlined text-2xl md:text-3xl">
                                            {cv.fileName?.endsWith('.pdf') ? 'picture_as_pdf' : 'description'}
                                        </span>
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <h4 className="font-bold text-base md:text-lg text-blue-900 truncate pr-2">{cv.fileName || 'Document.pdf'}</h4>
                                        <div className="flex flex-wrap items-center gap-2 md:gap-4 text-[9px] font-bold text-blue-400 uppercase tracking-widest mt-1">
                                            <span>{cv.fileSize ? (cv.fileSize / 1024 / 1024).toFixed(2) : '1.20'} MB</span>
                                            <span className="hidden md:inline">•</span>
                                            <span>Uploaded {cv.createdAt ? new Date(cv.createdAt).toLocaleDateString() : 'Just now'}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-wrap items-center gap-3 md:gap-4 border-t md:border-t-0 pt-4 md:pt-0">
                                    <button
                                        onClick={() => window.open(cv.fileUrl, '_blank')}
                                        className="flex-1 md:flex-none bg-blue-50 text-blue-900 border border-blue-200 px-4 py-2.5 md:py-2 rounded-lg text-[9px] font-bold uppercase tracking-widest hover:bg-blue-100 transition-all text-center"
                                    >
                                        View
                                    </button>
                                    <label className="flex-1 md:flex-none bg-blue-900 text-white px-4 py-2.5 md:py-2 rounded-lg text-[9px] font-bold uppercase tracking-widest hover:bg-blue-800 transition-all cursor-pointer shadow-lg shadow-blue-900/10 active:scale-95 text-center">
                                        {uploading ? 'Processing...' : 'Update'}
                                        <input
                                            type="file"
                                            className="hidden"
                                            onChange={handleFileUpload}
                                            disabled={uploading}
                                        />
                                    </label>
                                    <button
                                        onClick={() => deleteMutation.mutate({})}
                                        disabled={deleteMutation.isPending}
                                        className="w-full md:w-auto text-[9px] font-bold text-red-600 uppercase tracking-widest hover:underline px-4 py-2 text-center"
                                    >
                                        {deleteMutation.isPending ? 'Removing...' : 'Delete'}
                                    </button>
                                </div>
                            </div>
                        </section>
                    )}

                    <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 italic text-[10px] text-blue-400 font-medium uppercase tracking-tight">
                        Note: Ensure your resume remains up to date in ATS format so FIFO recruiters can quickly assess site certifications.
                    </div>

                    {/* ATS Compliance Template Visual Card */}
                    <section className="bg-white p-6 md:p-8 rounded-2xl border border-blue-200 shadow-lg space-y-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-blue-100 pb-4">
                            <div>
                                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
                                    Official Standard
                                </span>
                                <h3 className="text-lg font-bold text-blue-900 mt-1">ATS Compliance Resume Template</h3>
                            </div>
                            <button
                                onClick={handleDownloadTemplate}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 shadow-sm transition-all"
                            >
                                <span className="material-symbols-outlined text-sm">download</span>
                                Download Template
                            </button>
                        </div>

                        {/* Interactive ATS Resume Preview Container */}
                        <div className="bg-white border border-slate-300 rounded-xl p-6 md:p-8 font-sans text-slate-800 text-xs shadow-inner max-w-4xl mx-auto space-y-6">
                            {/* Header */}
                            <div className="border-b-2 border-slate-900 pb-4 flex flex-col md:flex-row justify-between items-start md:items-end gap-2">
                                <div>
                                    <h2 className="text-2xl font-extrabold uppercase tracking-tight text-slate-900">BILLY MEGA BERLIN</h2>
                                </div>
                                <div className="text-[11px] font-medium text-slate-600 space-y-0.5 md:text-right">
                                    <p>📱 +61-417593439</p>
                                    <p>✉️ Billymega26@gmail.com</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {/* Left Sidebar Column */}
                                <div className="space-y-6 md:border-r md:border-slate-200 md:pr-6">
                                    {/* Profile */}
                                    <div className="space-y-2">
                                        <h4 className="font-bold uppercase tracking-wider text-slate-900 text-[11px] border-b border-slate-300 pb-1">PROFILE</h4>
                                        <p className="text-[11px] leading-relaxed text-slate-600">
                                            Dedicated and hardworking professional with strong integrity and a proven ability to exceed expectations. Highly adaptable and communicative, with a proactive mindset and strong commitment to delivering quality results. A valuable team player in any organization or work environment.
                                        </p>
                                    </div>

                                    {/* Skills & Personality */}
                                    <div className="space-y-2">
                                        <h4 className="font-bold uppercase tracking-wider text-slate-900 text-[11px] border-b border-slate-300 pb-1">SKILLS & PERSONALITY</h4>
                                        <ul className="text-[11px] space-y-1 text-slate-700 list-disc list-inside">
                                            <li>Strategic Planning</li>
                                            <li>Problem Solving</li>
                                            <li>Tool Setup and Cleanup</li>
                                            <li>Creative Thinking</li>
                                            <li>Hard Work</li>
                                            <li>Initiative & Priorities</li>
                                            <li>Power Tools Operation</li>
                                            <li>Hand Tools Proficiency</li>
                                            <li>Fast Learner & Adaptation</li>
                                            <li>Safety Compliance</li>
                                            <li>Manual Handling</li>
                                            <li>Machine Operation</li>
                                            <li>Inventory Management</li>
                                        </ul>
                                    </div>

                                    {/* Education */}
                                    <div className="space-y-2">
                                        <h4 className="font-bold uppercase tracking-wider text-slate-900 text-[11px] border-b border-slate-300 pb-1">EDUCATION</h4>
                                        <p className="text-[11px] font-semibold text-slate-900">Bina Nusantara University (Binus)</p>
                                        <p className="text-[10px] text-slate-600">School of Computer Science</p>
                                    </div>

                                    {/* Ticket */}
                                    <div className="space-y-2">
                                        <h4 className="font-bold uppercase tracking-wider text-slate-900 text-[11px] border-b border-slate-300 pb-1">TICKETS & LICENSES</h4>
                                        <ul className="text-[11px] space-y-1 text-slate-700 list-disc list-inside">
                                            <li>White Card - CPCWHS1001</li>
                                            <li>Driving License Class C (Manual)</li>
                                            <li>HLTAID009, HLTAID010, HLTAID011</li>
                                        </ul>
                                        <p className="text-[9px] italic text-slate-500 mt-2">
                                            ps: Additional tickets taken immediately as required by site.
                                        </p>
                                    </div>
                                </div>

                                {/* Main Experience Column */}
                                <div className="md:col-span-2 space-y-6">
                                    <h4 className="font-bold uppercase tracking-wider text-slate-900 text-[11px] border-b border-slate-300 pb-1">WORK EXPERIENCE</h4>

                                    {/* Exp 1 */}
                                    <div className="space-y-1.5">
                                        <div className="flex justify-between items-baseline">
                                            <h5 className="font-bold text-slate-900 text-[12px]">Baiada Poultry</h5>
                                            <span className="text-[10px] text-slate-500 font-medium">Aug 2025 – Present</span>
                                        </div>
                                        <p className="font-semibold text-slate-700 text-[11px]">Cleaner Factory Machine</p>
                                        <p className="text-[10px] text-slate-500 italic">References: Didik (Leader) +614399283454</p>
                                        <ul className="text-[11px] space-y-1 text-slate-600 list-disc list-inside pt-1">
                                            <li>Cleaner (Cleaning factory & machinery: hanging room, conveyor belt, vacuum packing, marinate machine).</li>
                                            <li>Chemical handling with required PPE (Topax686, Chlorine, Sanitize).</li>
                                            <li>Safety and hygiene compliance.</li>
                                        </ul>
                                    </div>

                                    {/* Exp 2 */}
                                    <div className="space-y-1.5 pt-2">
                                        <div className="flex justify-between items-baseline">
                                            <h5 className="font-bold text-slate-900 text-[12px]">Howe Farm Enterprises (Heavy Labour)</h5>
                                            <span className="text-[10px] text-slate-500 font-medium">Jan 2025 – Sept 2025</span>
                                        </div>
                                        <p className="font-semibold text-slate-700 text-[11px]">Banana Farm Shed & Paddock</p>
                                        <p className="text-[10px] text-slate-500 italic">References: Jerome (Manager) +61413856221 | Yansiy (Supervisor) +61422187016</p>
                                        <ul className="text-[11px] space-y-1 text-slate-600 list-disc list-inside pt-1">
                                            <li>Operated hydraulic hang machines for unloading bunches; dehanding & clustering bananas.</li>
                                            <li>Operated Visy Box machine and plastic recycling machine.</li>
                                            <li>Tractor driving with trailers, field dieseling, dileaving, and humping 40-80kg bunches.</li>
                                        </ul>
                                    </div>

                                    {/* Exp 3 */}
                                    <div className="space-y-1.5 pt-2">
                                        <div className="flex justify-between items-baseline">
                                            <h5 className="font-bold text-slate-900 text-[12px]">PT. Intersoft Solutions (iSeller)</h5>
                                            <span className="text-[10px] text-slate-500 font-medium">Apr 2021 – Nov 2024</span>
                                        </div>
                                        <p className="font-semibold text-slate-700 text-[11px]">Lead of Pre-Sales (Product Specialist)</p>
                                        <p className="text-[10px] text-slate-500 italic">References: Imam (Head of Pre-Sales) +6282129244224 | Moses (Head of Enterprise) +6281210719909</p>
                                        <ul className="text-[11px] space-y-1 text-slate-600 list-disc list-inside pt-1">
                                            <li>Enterprise client pitching, system flow design, and PRD ownership.</li>
                                            <li>API third-party integrations (WMS, ERP, In-house client systems).</li>
                                        </ul>
                                    </div>

                                    {/* Exp 4 */}
                                    <div className="space-y-1.5 pt-2">
                                        <div className="flex justify-between items-baseline">
                                            <h5 className="font-bold text-slate-900 text-[12px]">PT. Albarsha Group Persada</h5>
                                            <span className="text-[10px] text-slate-500 font-medium">Feb 2018 – Apr 2021</span>
                                        </div>
                                        <p className="font-semibold text-slate-700 text-[11px]">Trade Assistant Rigging / General Labourer</p>
                                        <p className="text-[10px] text-slate-500 italic">References: Aldira Akbar (CEO) +6287763764359 | Nm. Arief (Manager) +628111198919</p>
                                        <ul className="text-[11px] space-y-1 text-slate-600 list-disc list-inside pt-1">
                                            <li>Setup stage & event rigging, site preparation, and tool maintenance.</li>
                                            <li>Pallet jack operation, heavy lifting, loading/unloading deliveries, and waste removal.</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                <aside className="space-y-8">
                    <section className="bg-white p-8 rounded-2xl border border-blue-100 shadow-sm">
                        <span className="text-[10px] font-bold text-blue-900 uppercase tracking-widest block mb-4">ATS Document Guidelines</span>
                        <p className="text-[11px] text-blue-500 leading-relaxed mb-4">
                            ATS (Applicant Tracking System) CVs use clear headers, standard bullet points, and plain text keywords to ensure automatic parsing by recruiters.
                        </p>
                        <a
                            href="https://www.google.com/search?q=What+is+ATS+CV+format%3F+and+how+to+create+one%3F+and+Why+is+it+important%3F"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] font-bold text-blue-600 uppercase tracking-wider underline hover:text-blue-800"
                        >
                            Why is ATS Format Important? →
                        </a>
                    </section>
                    <section className="bg-blue-900 text-white p-8 rounded-2xl shadow-xl shadow-blue-900/10">
                        <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest block mb-6">Security & Privacy</span>
                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <span className="material-symbols-outlined text-blue-400">lock</span>
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest mb-1">Secure Access</p>
                                    <p className="text-[10px] text-blue-500 font-medium leading-relaxed italic">Your resume is encrypted at rest and only accessible via secure recruitment protocols.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <span className="material-symbols-outlined text-blue-400">visibility_off</span>
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest mb-1">Restricted View</p>
                                    <p className="text-[10px] text-blue-500 font-medium leading-relaxed italic">Only verified recruiters assigned to your application can view this document.</p>
                                </div>
                            </div>
                        </div>
                    </section>
                </aside>
            </div>
        </div>
    );
}

export default function CvManagementPage() {
    return (
        <Suspense fallback={<div className="p-12 text-center text-[10px] font-bold uppercase tracking-widest text-blue-400">Loading Profile...</div>}>
            <CvContent />
        </Suspense>
    );
}
