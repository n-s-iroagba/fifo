'use client';

import React from 'react';
import { useApiQuery, useApiMutation } from '@/lib/hooks';
import { useParams } from 'next/navigation';
import { CONSTANTS } from '@/constants';
import { PaymentUpload } from '@/components/ui/PaymentUpload';
import Link from 'next/link';
import { JobStage } from '@/types/models';

interface Application {
    id: number;
    status: string;

    currentStageId: number | null;
    JobListing: {
        id: number;
        title: string;
        company: string;
        location: string;
        description: string;
        salary: string;
    };
    JobStages: JobStage[];
    Payments: any[];
}

export default function ApplicationDetailPage() {
    const params = useParams();
    const id = params.id as string;

    const { data: app, isLoading, refetch } = useApiQuery<Application>(
        ['application', id],
        `/applications/${id}`
    );

    if (isLoading) return <div className="p-12 text-center text-[10px] font-bold uppercase tracking-widest text-blue-400">Loading Application Details...</div>;
    if (!app) return <div className="p-12 text-center text-[10px] font-bold uppercase tracking-widest text-red-500">Application not found</div>;

    const stages = app?.JobStages?.sort((a: any, b: any) => a.orderPosition - b.orderPosition) || [];
    const currentStageIndex = stages.findIndex((s: any) => s.id === app.currentStageId);
    const currentStage = stages[currentStageIndex];
    const currentPayment = app.Payments?.find(p => p.stageId === app.currentStageId);

    const isPendingVerification = currentPayment?.status === 'Pending';

    const getStagePayment = (stageId: number) => {
        return app.Payments?.find(p => p.stageId === stageId);
    };

    return (
        <div className="font-sans pb-20">
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
                <div className="flex gap-4">
                    <div className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border-2 ${app.status === 'ACTIVE' ? 'bg-blue-900 text-white border-blue-900 shadow-xl shadow-blue-900/10' : 'bg-white text-blue-400 border-blue-50'
                        }`}>
                        Application Status: {app.status}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2 space-y-12">
                    {/* Job Specification Card */}
                    <section className="bg-white p-10 rounded-[2.5rem] border border-blue-100 shadow-sm">
                        <h2 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] mb-8 pb-4 border-b border-blue-50 flex items-center gap-3">
                            <span className="material-symbols-outlined text-sm">description</span>
                            Detailed Job Description
                        </h2>
                        <div className="prose prose-blue max-w-none">
                            <p className="text-sm font-medium text-blue-700 leading-relaxed uppercase tracking-tight opacity-80 whitespace-pre-wrap">
                                {app.JobListing?.description}
                            </p>
                        </div>
                    </section>

                    {/* Required Actions Section */}
                    {currentStage?.requiresPayment && currentPayment?.status !== 'Verified' && currentPayment?.status !== 'Paid' && (
                        <section className="bg-blue-900 rounded-[2.5rem] p-10 relative overflow-hidden text-white shadow-2xl shadow-blue-900/20">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-800 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2" />
                            <div className="relative z-10">
                                {isPendingVerification ? (
                                    <div className="text-center py-12">
                                        <div className="w-20 h-20 bg-blue-800 text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-8 animate-pulse border border-blue-700">
                                            <span className="material-symbols-outlined text-4xl">hourglass_empty</span>
                                        </div>
                                        <h3 className="text-2xl font-bold tracking-tight mb-4 uppercase tracking-[0.1em]">Verification In Progress</h3>
                                        <p className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.25em] max-w-[450px] mx-auto leading-loose italic">
                                            The verification process has been initiated. Our recruitment team is currently reviewing your payment confirmation against our records.
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                                                <span className="material-symbols-outlined text-blue-400 text-sm">payments</span>
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400">Required Financial Action</span>
                                        </div>
                                        <h3 className="text-3xl font-bold tracking-tight mb-4 uppercase">Payment Required to Proceed</h3>
                                        <p className="text-[11px] font-bold text-blue-400 uppercase tracking-widest mb-10 max-w-[500px] leading-relaxed">
                                            To continue with your application, a required processing fee of <span className="text-white text-lg ml-1">${currentStage.amount} {currentStage.currency}</span> is pending.
                                        </p>

                                        <div className="bg-white rounded-3xl p-8 shadow-2xl">
                                            <PaymentUpload
                                                paymentId={currentPayment?.id}
                                                amount={currentStage.amount || 0}
                                                onSuccess={refetch}
                                            />
                                        </div>
                                    </>
                                )}
                            </div>
                        </section>
                    )}

                    <section className="space-y-6">
                        <div className="flex items-center justify-between px-2">
                            <h2 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em]">Your Application Journey</h2>
                            <span className="text-[9px] font-black text-blue-300 uppercase tracking-widest">Official Status</span>
                        </div>
                        <div className="space-y-4">
                            {stages
                                .filter((stage: any) => stage.isCompleted || stage.id === app.currentStageId)
                                .map((stage: any, index: number) => {
                                    const isActive = stage.id === app.currentStageId;
                                    const isCompleted = stage.isCompleted;
                                    const payment = getStagePayment(stage.id);

                                    return (
                                        <div key={stage.id} className={`p-8 rounded-[2.5rem] border transition-all flex flex-col md:flex-row md:items-center justify-between gap-8 bg-white border-blue-100 shadow-sm`}>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-4 mb-4">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black ${isCompleted ? 'bg-emerald-500 text-white' : isActive ? 'bg-blue-900 text-white' : 'bg-blue-100 text-blue-400'
                                                        }`}>
                                                        {isCompleted ? <span className="material-symbols-outlined text-sm">done</span> : <span className="material-symbols-outlined text-sm">pending</span>}
                                                    </div>
                                                    <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-lg ${isCompleted ? 'bg-emerald-50 text-emerald-600' :
                                                        isActive ? (isPendingVerification ? 'bg-amber-50 text-amber-600' : 'bg-blue-900 text-white') : 'bg-blue-100 text-blue-400'
                                                        }`}>
                                                        {isCompleted ? 'Completed' : isActive ? (isPendingVerification ? 'Reviewing' : 'Current Stage') : 'Pending'}
                                                    </span>
                                                </div>
                                                <h4 className="font-bold text-blue-900 uppercase tracking-tight text-lg mb-2">{stage.name}</h4>
                                                <p className="text-[10px] text-blue-400 font-black uppercase tracking-widest leading-relaxed line-clamp-2 max-w-[400px]">{stage.description}</p>
                                            </div>

                                            <div className="flex flex-col items-end md:min-w-[150px] pt-6 md:pt-0 border-t md:border-t-0 border-blue-50">
                                                <span className="text-[9px] font-black text-blue-300 uppercase tracking-widest mb-2">Requirement Status</span>
                                                {stage.requiresPayment ? (
                                                    <div className="text-right">
                                                        <span className="text-sm font-bold text-blue-900">${stage.amount} {stage.currency}</span>
                                                        {payment && (
                                                            <div className={`text-[8px] font-black uppercase mt-1 tracking-widest ${payment.status === 'Verified' || payment.status === 'Paid' ? 'text-emerald-500' :
                                                                payment.status === 'Pending' ? 'text-amber-500' : 'text-red-400'
                                                                }`}>
                                                                {payment.status === 'Verified' || payment.status === 'Paid' ? 'Receipt Verified' : `Status: ${payment.status}`}
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2 text-emerald-500 font-bold">
                                                        <span className="material-symbols-outlined text-sm">check_circle</span>
                                                        <span className="text-[9px] uppercase tracking-widest">Included</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>
                    </section>
                </div>

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
        </div>
    );
}
