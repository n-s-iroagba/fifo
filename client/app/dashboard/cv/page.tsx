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
        const templateContent = `[FIRST NAME] [LAST NAME]
Email: applicant@example.com | Phone: +61 400 000 000 | Location: Perth, WA
FIFO Candidate Profile — ATS Standard Format

PROFESSIONAL SUMMARY
Experienced FIFO Specialist with active site certifications. Proven track record in mining operations, site safety compliance, and heavy equipment operation.

CERTIFICATIONS & TICKETS
• Working at Heights (RIIWHS204D) — Active
• Enter & Work in Confined Spaces (RIIWHS202D) — Active
• Standard 11 Surface Refresher — Active
• First Aid & CPR (HLTAID011) — Active
• C Class Driver's License — Active

WORK EXPERIENCE
FIFO Site Worker | Mining Operations Corp (2022 - Present)
• Completed scheduled operational maintenance and safety compliance protocols.
• Enforced site safety standards and emergency response protocols.

EDUCATION & TRAINING
• Certificate III in Surface Extraction Operations`;

        const blob = new Blob([templateContent], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'ATS_CV_Template.txt';
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
