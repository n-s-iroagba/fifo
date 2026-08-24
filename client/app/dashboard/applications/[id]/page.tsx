'use client';

import React, { useState } from 'react';
import { useApiQuery, useApiMutation } from '@/lib/hooks';
import { useParams } from 'next/navigation';
import { CONSTANTS } from '@/constants';
import { PaymentUpload } from '@/components/ui/PaymentUpload';
import Link from 'next/link';
import { JobStage } from '@/types/models';

interface Application {
    id: number;
    status: string;
    visaSponsorshipStatus: string | null;
    currentStageId: number | null;
    JobListing: {
        id: number;
        title: string;
        company: string;
        location: string;
        description: string;
        salary: string;
        employmentType?: string;
        requirements?: string;
        jobType?: string;
        ticketIds?: number[];
        visaSponsorship: boolean;
    };
    JobStages: JobStage[];
    Payments: any[];
    Tickets: any[];
}

interface TicketCatalog {
    id: number;
    name: string;
    description: string;
    normalPrice: number;
}

export default function ApplicationDetailPage() {
    const params = useParams();
    const id = params.id as string;

    const { data: app, isLoading, refetch } = useApiQuery<Application>(
        ['application', id],
        `/applications/${id}`
    );

    const applyVisaMutation = useApiMutation('post', `/applications/${id}/visa-sponsorship`, {
        onSuccess: () => refetch()
    });

    const [showVisaPopup, setShowVisaPopup] = useState(false);

    const { data: catalogsRes, isLoading: catalogsLoading } = useApiQuery<{ success: boolean; data: TicketCatalog[] }>(
        ['ticket-catalogs'],
        '/ticket-catalogs'
    );
    const catalogs = catalogsRes?.data || [];

    if (isLoading || catalogsLoading) return <div className="p-12 text-center text-[10px] font-bold uppercase tracking-widest text-blue-400">Loading Application Details...</div>;
    if (!app) return <div className="p-12 text-center text-[10px] font-bold uppercase tracking-widest text-red-500">Application not found</div>;

    const stages = app?.JobStages?.sort((a: any, b: any) => a.id - b.id) || [];
    const currentStageIndex = stages.findIndex((s: any) => s.id === app.currentStageId);
    const currentStage = (currentStageIndex >= 0 ? stages[currentStageIndex] : stages[0]) || {
        name: 'Initial Review',
        status: 'pending'
    };
    const currentPayment = app.Payments?.find(p => p.stageId === app.currentStageId);

    const parsedTicketIds = typeof app.JobListing?.ticketIds === 'string' ? JSON.parse(app.JobListing.ticketIds) : app.JobListing?.ticketIds;
    const requiredTicketIds = Array.isArray(parsedTicketIds) ? parsedTicketIds : [];
    const requiredCatalogs = catalogs.filter(c => requiredTicketIds.includes(c.id));
    const userTickets = app.Tickets || [];

    const totalRequiredTickets = requiredCatalogs.length;
    const possessedTicketsCount = requiredCatalogs.filter(catalog => {
        const userTicket = userTickets.find(t => t.ticketType === catalog.name);
        return userTicket?.status === 'possessed' || userTicket?.status === 'ticket_issued';
    }).length;
    const missingTicketsCount = Math.max(0, totalRequiredTickets - possessedTicketsCount);
    const readinessPercentage = totalRequiredTickets > 0
        ? Math.round((possessedTicketsCount / totalRequiredTickets) * 100)
        : 100;

    const isPendingVerification = currentPayment?.status === 'Pending';

    const handleVisaSponsorship = () => {
        const hasAllTickets = requiredCatalogs.every(catalog => {
            const userTicket = userTickets.find(t => t.ticketType === catalog.name);
            return userTicket?.status === 'possessed' || userTicket?.status === 'ticket_issued';
        });

        if (!hasAllTickets) {
            setShowVisaPopup(true);
            return;
        }

        applyVisaMutation.mutate({});
    };

    const getStagePayment = (stageId: number) => {
        return app.Payments?.find(p => p.stageId === stageId);
    };

    return (
        <div className="font-sans pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6 pb-8 border-b border-blue-50">
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <Link href="/dashboard" className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-400 hover:bg-blue-900 hover:text-white transition-all">
                            <span className="material-symbols-outlined text-sm">arrow_back</span>
                        </Link>
                        <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em]">Portal / {app.JobListing?.company} / #CC-{id.padStart(5, '0')}</span>
                    </div>
                    <h1 className="text-4xl font-bold text-blue-900 tracking-tight leading-none mb-4">{app.JobListing?.title}</h1>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-blue-300 text-sm">location_on</span>
                            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">{app.JobListing?.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-blue-300 text-sm">payments</span>
                            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">{app.JobListing?.salary}</span>
                        </div>
                    </div>
                </div>
                <div className="flex flex-wrap gap-4 items-center">
                    {currentStage && (
                        <div className="px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] bg-blue-50 text-blue-900 border-2 border-blue-200 shadow-sm flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                            Current Stage: {currentStage.name || 'Unnamed Stage'}
                        </div>
                    )}
                    <div className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border-2 ${app.status === 'ACTIVE' || app.status === 'Active' ? 'bg-blue-900 text-white border-blue-900 shadow-xl shadow-blue-900/10' : 'bg-white text-blue-400 border-blue-50'}`}>
                        Status: {app.status}
                    </div>
                </div>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-12">
                    {/* Active Stage Banner */}
                    <section className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 p-8 rounded-[2.5rem] text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-blue-700/50">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                                <span className="text-[10px] font-black text-blue-200 uppercase tracking-[0.3em]">Active Recruitment Stage</span>
                            </div>
                            <h2 className="text-2xl font-bold tracking-tight uppercase text-white">{currentStage?.name || 'Application Under Review'}</h2>
                        </div>
                    </section>
                    {/* Job Details & Specifications */}
                    <section className="bg-white p-10 rounded-[2.5rem] border border-blue-100 shadow-sm space-y-8">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-blue-50">
                            <div>
                                <h2 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] flex items-center gap-2 mb-1">
                                    <span className="material-symbols-outlined text-sm">work</span>
                                    Job Specifications &amp; Overview
                                </h2>
                                <h3 className="text-xl font-black text-blue-950 uppercase tracking-tight">
                                    {app.JobListing?.title}
                                </h3>
                            </div>
                            <span className="self-start md:self-auto bg-blue-900 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
                                {app.JobListing?.company || 'Australian Resource Group'}
                            </span>
                        </div>

                        {/* Expressive Metadata Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-blue-50/60 p-4 rounded-2xl border border-blue-100/60">
                                <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest block mb-1">Location</span>
                                <span className="text-xs font-bold text-blue-900 uppercase tracking-tight flex items-center gap-1.5">
                                    <span className="material-symbols-outlined text-sm text-blue-600">location_on</span>
                                    {app.JobListing?.location || 'Remote WA/QLD (FIFO)'}
                                </span>
                            </div>
                            <div className="bg-blue-50/60 p-4 rounded-2xl border border-blue-100/60">
                                <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest block mb-1">Remuneration</span>
                                <span className="text-xs font-bold text-blue-900 uppercase tracking-tight flex items-center gap-1.5">
                                    <span className="material-symbols-outlined text-sm text-emerald-600">payments</span>
                                    {app.JobListing?.salary || 'Competitive'}
                                </span>
                            </div>
                            <div className="bg-blue-50/60 p-4 rounded-2xl border border-blue-100/60">
                                <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest block mb-1">Employment Type</span>
                                <span className="text-xs font-bold text-blue-900 uppercase tracking-tight flex items-center gap-1.5">
                                    <span className="material-symbols-outlined text-sm text-blue-600">schedule</span>
                                    {app.JobListing?.employmentType || 'Full-Time (FIFO)'}
                                </span>
                            </div>
                            <div className="bg-blue-50/60 p-4 rounded-2xl border border-blue-100/60">
                                <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest block mb-1">Visa Sponsorship</span>
                                <span className={`text-xs font-bold uppercase tracking-tight flex items-center gap-1.5 ${app.JobListing?.visaSponsorship ? 'text-emerald-700' : 'text-blue-900'}`}>
                                    <span className="material-symbols-outlined text-sm">{app.JobListing?.visaSponsorship ? 'verified_user' : 'info'}</span>
                                    {app.JobListing?.visaSponsorship ? 'Available' : 'Standard'}
                                </span>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-3">Role Description</h4>
                            <p className="text-xs font-medium text-blue-800 leading-relaxed uppercase tracking-tight opacity-90 whitespace-pre-wrap bg-slate-50/80 p-5 rounded-2xl border border-slate-100">
                                {app.JobListing?.description}
                            </p>
                        </div>

                        {/* Requirements */}
                        {app.JobListing?.requirements && (
                            <div>
                                <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-3">Key Role Requirements</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {app.JobListing.requirements.split(',').map((req, idx) => (
                                        <div key={idx} className="flex items-start gap-2.5 bg-blue-50/30 p-3 rounded-xl border border-blue-100/50">
                                            <span className="material-symbols-outlined text-sm text-blue-600 shrink-0 mt-0.5">check_circle</span>
                                            <span className="text-[11px] font-bold text-blue-900 uppercase tracking-tight leading-snug">{req.trim()}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </section>

                    {/* Required Tickets & Certification Readiness Section */}
                    {requiredCatalogs.length > 0 && (
                        <section className="bg-white p-10 rounded-[2.5rem] border border-blue-100 shadow-sm space-y-8">
                            {/* Section Header */}
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-blue-50">
                                <div>
                                    <h2 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] flex items-center gap-2 mb-1">
                                        <span className="material-symbols-outlined text-sm">verified</span>
                                        Certification &amp; Ticket Readiness
                                    </h2>
                                    <p className="text-xs font-bold text-blue-950 uppercase tracking-tight">
                                        Track your required tickets and apply for sponsorship to complete your application
                                    </p>
                                </div>
                                <div className="flex flex-wrap items-center gap-3">
                                    <Link
                                        href="/dashboard/tickets"
                                        className="bg-blue-900 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-800 transition-all flex items-center gap-2 shadow-md"
                                    >
                                        <span className="material-symbols-outlined text-sm">upload_file</span>
                                        Upload / Manage Tickets
                                    </Link>
                                    {missingTicketsCount > 0 && (
                                        <Link
                                            href="/dashboard/tickets"
                                            className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all flex items-center gap-2 shadow-md"
                                        >
                                            <span className="material-symbols-outlined text-sm">school</span>
                                            Apply for Ticket Sponsorship
                                        </Link>
                                    )}
                                </div>
                            </div>

                            {/* Ticket Readiness Counter & Progress Bar */}
                            <div className="bg-gradient-to-r from-blue-50 via-slate-50 to-indigo-50/50 p-6 rounded-2xl border border-blue-100/80 space-y-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div>
                                        <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest block mb-1">Ticket Audit Summary</span>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-2xl font-black text-blue-900">{possessedTicketsCount} of {totalRequiredTickets}</span>
                                            <span className="text-xs font-bold text-blue-700 uppercase tracking-tight">Required Tickets Verified</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-blue-100 shadow-sm">
                                        <span className="text-xs font-black text-blue-900">{readinessPercentage}%</span>
                                        <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Application Ready</span>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="w-full bg-blue-100/80 rounded-full h-2.5 overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-500 rounded-full ${readinessPercentage === 100 ? 'bg-emerald-500' : 'bg-blue-600'}`}
                                        style={{ width: `${readinessPercentage}%` }}
                                    ></div>
                                </div>

                                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
                                    <span className={possessedTicketsCount === totalRequiredTickets ? 'text-emerald-700' : 'text-amber-700'}>
                                        {possessedTicketsCount === totalRequiredTickets
                                            ? '✓ All required certifications verified for placement'
                                            : `⚠️ ${missingTicketsCount} required ticket(s) missing or unverified`}
                                    </span>
                                    <span className="text-blue-500">
                                        {possessedTicketsCount} Verified • {missingTicketsCount} Missing
                                    </span>
                                </div>
                            </div>

                            {/* Required Tickets Cards Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {requiredCatalogs.map(catalog => {
                                    const userTicket = userTickets.find(t => t.ticketType === catalog.name);
                                    const isPossessed = userTicket?.status === 'possessed' || userTicket?.status === 'ticket_issued';

                                    return (
                                        <div key={catalog.id} className={`p-6 rounded-2xl border flex flex-col justify-between transition-all ${isPossessed ? 'border-emerald-200 bg-emerald-50/20' : 'border-amber-200/80 bg-amber-50/10'}`}>
                                            <div>
                                                <div className="flex items-start justify-between mb-2 gap-3">
                                                    <h3 className="font-bold text-blue-900 tracking-tight leading-tight uppercase text-sm">{catalog.name}</h3>
                                                    {isPossessed ? (
                                                        <span className="bg-emerald-100 text-emerald-700 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full flex items-center gap-1 shrink-0">
                                                            <span className="material-symbols-outlined text-xs">check_circle</span> Verified
                                                        </span>
                                                    ) : (
                                                        <span className="bg-amber-100 text-amber-800 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full flex items-center gap-1 shrink-0">
                                                            <span className="material-symbols-outlined text-xs">warning</span> Action Required
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-[11px] font-medium text-slate-600 line-clamp-2 mb-4 leading-relaxed">{catalog.description}</p>
                                            </div>

                                            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                                                {isPossessed ? (
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700 flex items-center gap-1">
                                                        <span className="material-symbols-outlined text-sm">verified_user</span> Certificate Uploaded
                                                    </span>
                                                ) : (
                                                    <div className="w-full flex items-center justify-between gap-4">
                                                        <div>
                                                            <span className="text-[9px] font-black text-amber-700 uppercase tracking-widest block">Normal Price</span>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-sm font-black text-blue-900">${catalog.normalPrice}</span>
                                                            </div>
                                                        </div>
                                                        <Link
                                                            href="/dashboard/tickets"
                                                            className="bg-blue-900 text-white px-3.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-blue-800 transition-all flex items-center gap-1 shrink-0"
                                                        >
                                                            Fix Missing Ticket
                                                        </Link>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    )}

                    {/* Visa Sponsorship Section */}
                    {app.JobListing?.visaSponsorship && (
                        <section className="bg-white p-10 rounded-[2.5rem] border border-blue-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
                            <div>
                                <h2 className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em] mb-2 flex items-center gap-3">
                                    <span className="material-symbols-outlined text-sm">flight_takeoff</span>
                                    Visa Sponsorship
                                </h2>
                                <p className="text-[11px] font-bold text-slate-500 max-w-lg leading-relaxed">
                                    This role is eligible for visa sponsorship. If you have acquired all required certifications, you may apply for sponsorship here.
                                </p>
                            </div>
                            <div className="flex-shrink-0">
                                {app.visaSponsorshipStatus ? (
                                    <div className={`px-6 py-3 rounded-xl border flex flex-col items-center justify-center ${
                                        app.visaSponsorshipStatus === 'Pending' ? 'bg-blue-50 border-blue-100' :
                                        app.visaSponsorshipStatus === 'Approved' ? 'bg-emerald-50 border-emerald-100' :
                                        'bg-red-50 border-red-100'
                                    }`}>
                                        <span className={`text-[9px] font-black uppercase tracking-widest ${
                                            app.visaSponsorshipStatus === 'Pending' ? 'text-blue-500' :
                                            app.visaSponsorshipStatus === 'Approved' ? 'text-emerald-600' :
                                            'text-red-500'
                                        }`}>Sponsorship Status</span>
                                        <span className={`text-sm font-bold ${
                                            app.visaSponsorshipStatus === 'Pending' ? 'text-blue-700' :
                                            app.visaSponsorshipStatus === 'Approved' ? 'text-emerald-800' :
                                            'text-red-700'
                                        }`}>{app.visaSponsorshipStatus}</span>
                                    </div>
                                ) : (
                                    <button
                                        onClick={handleVisaSponsorship}
                                        disabled={applyVisaMutation.isPending}
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold uppercase tracking-widest px-8 py-4 rounded-xl transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50"
                                    >
                                        {applyVisaMutation.isPending ? 'Applying...' : 'Apply for Sponsorship'}
                                    </button>
                                )}
                            </div>
                        </section>
                    )}



                    {/* Application Journey */}
                    <section className="space-y-6">
                        <div className="flex items-center justify-between px-2">
                            <h2 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em]">Your Application Journey</h2>
                            <span className="text-[9px] font-black text-blue-300 uppercase tracking-widest">Official Status</span>
                        </div>
                        <div className="space-y-4">
                            {stages.map((stage: any) => {
                                    const isActive = stage.id === app.currentStageId;
                                    const isCompleted = stage.status === 'completed';

                                    return (
                                        <div key={stage.id} className="p-8 rounded-[2.5rem] border transition-all flex flex-col md:flex-row md:items-center justify-between gap-8 bg-white border-blue-100 shadow-sm">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-4 mb-4">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black ${isCompleted ? 'bg-emerald-500 text-white' : isActive ? 'bg-blue-900 text-white' : 'bg-blue-100 text-blue-400'}`}>
                                                        {isCompleted ? <span className="material-symbols-outlined text-sm">done</span> : <span className="material-symbols-outlined text-sm">pending</span>}
                                                    </div>
                                                    <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-lg ${isCompleted ? 'bg-emerald-50 text-emerald-600' : isActive ? (isPendingVerification ? 'bg-amber-50 text-amber-600' : 'bg-blue-900 text-white') : 'bg-blue-100 text-blue-400'}`}>
                                                        {isCompleted ? 'Completed' : isActive ? (isPendingVerification ? 'Reviewing' : 'Current Stage') : 'Pending'}
                                                    </span>
                                                </div>
                                                <h4 className="font-bold text-blue-900 uppercase tracking-tight text-lg mb-2">{stage.name || 'Unnamed Stage'}</h4>
                                            </div>
                                            <div className="flex flex-col items-end md:min-w-[150px] pt-6 md:pt-0 border-t md:border-t-0 border-blue-50">
                                                <span className="text-[9px] font-black text-blue-300 uppercase tracking-widest mb-2">Status</span>
                                                <div className="flex items-center gap-2 text-blue-500 font-bold uppercase tracking-widest text-[9px]">
                                                    {stage.status}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>
                    </section>
                </div>

                {/* Right Column */}
                <div className="space-y-10">
                    <section className="bg-blue-50 p-8 rounded-[2.5rem] border border-blue-100 border-dashed">
                        <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">info</span>
                            Applicant Notice
                        </h4>
                        <p className="text-[10px] text-blue-600 font-bold uppercase tracking-tight leading-loose opacity-60 italic">
                            All updates on this dashboard are strictly maintained by our recruitment team. Applicants are notified automatically upon each successful verification.
                        </p>
                    </section>
                </div>
            </div>

            {/* Visa Popup Modal */}
            {showVisaPopup && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl relative">
                        <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center mb-6 border border-amber-100">
                            <span className="material-symbols-outlined text-3xl">warning</span>
                        </div>
                        <h3 className="text-xl font-bold text-blue-900 tracking-tight mb-3">Certifications Required</h3>
                        <p className="text-sm font-medium text-slate-500 leading-relaxed mb-8">
                            Please obtain all required certifications and tickets for this role before seeking visa sponsorship. You can manage your tickets in the required tickets section above.
                        </p>
                        <div className="flex justify-end">
                            <button
                                onClick={() => setShowVisaPopup(false)}
                                className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-colors"
                            >
                                Understood
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
