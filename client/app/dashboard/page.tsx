'use client';

import { PaymentUpload } from '@/components/ui/PaymentUpload';
import { useApiQuery } from '@/lib/hooks';
import Link from 'next/link';
import { useState } from 'react';

export default function ApplicantDashboard() {
    const { data: summary, isLoading, refetch } = useApiQuery<any>(['applicant', 'dashboard'], '/dashboard');
    const { data: user } = useApiQuery<any>(['auth', 'me'], '/auth/me');
    const [selectedPaymentApp, setSelectedPaymentApp] = useState<any>(null);
    const [appFilter, setAppFilter] = useState<'All' | 'Active' | 'Completed' | 'Payments'>('All');

    const hasFinancialActivity = (summary?.allPayments?.length > 0) ||
        (summary?.pendingStages?.some((ap: any) => ap.requiresPayment));

    const availableFilters = ['All', 'Active', 'Payments', 'Completed'].filter(f => {
        if (f === 'Payments') return hasFinancialActivity;
        return true;
    });

    if (isLoading) return <div className="p-12 text-center text-[10px] font-bold uppercase tracking-widest text-blue-400 animate-pulse">Loading Dashboard...</div>;

    const pendingStages = summary?.pendingStages || [];
    const activeJobs = summary?.activeJobs?.rows || summary?.activeJobs || [];

    const completedGroups = summary?.completedGroups || [];

    const filteredStages = pendingStages.filter((app: any) => {
        if (appFilter === 'All') return true;
        if (appFilter === 'Active') return !app.requiresPayment || app.paymentStatus === 'Verified' || app.paymentStatus === 'Paid';
        if (appFilter === 'Payments') return app.requiresPayment && app.paymentStatus !== 'Verified' && app.paymentStatus !== 'Paid';
        if (appFilter === 'Completed') return false;
        return true;
    });

    const getPaymentForApp = (app: any) => {
        return summary?.unpaidPayments?.find(
            (p: any) => p.applicationId === app.applicationId && p.stageId === app.stageId
        );
    };

    return (
        <div className="font-sans antialiased text-blue-900 selection:bg-blue-100 selection:text-blue-900">
            <div className="mb-12">
                <h1 className="text-3xl font-bold tracking-tight text-blue-900">Applicant Dashboard</h1>
                <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] mt-2">Overview / Application Status</p>
            </div>

            {/* Applicant Notification Hub */}
            {pendingStages.some((app: any) => app.requiresPayment && (app.paymentStatus !== 'Verified' && app.paymentStatus !== 'Paid')) && (() => {
                const payApp = pendingStages.find((app: any) => app.requiresPayment && (app.paymentStatus !== 'Verified' && app.paymentStatus !== 'Paid'));
                return (
                    <div className="mb-12 animate-in slide-in-from-top-6 duration-700">
                        <div className="bg-white border border-red-100 p-6 md:p-10 rounded-[2.5rem] flex flex-col md:flex-row items-center md:items-start lg:items-center justify-between gap-8 shadow-2xl shadow-red-900/5 relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-1.5 h-full bg-red-500" />
                            <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8 w-full">
                                <div className="w-14 h-14 md:w-16 md:h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center shrink-0 border border-red-100 shadow-inner">
                                    <span className="material-symbols-outlined font-black text-2xl">payments</span>
                                </div>
                                <div className="space-y-3 text-center md:text-left flex-1 min-w-0">
                                    <div className="max-w-full">
                                        <h4 className="text-[9px] md:text-[10px] font-black text-red-500 uppercase tracking-[0.3em] mb-1">Action Required</h4>
                                        <h2 className="text-lg md:text-xl font-black text-blue-900 uppercase tracking-tight leading-none break-words">{payApp?.stageName || 'Recruitment Phase'}</h2>
                                    </div>
                                    <p className="text-[10px] md:text-[11px] font-bold text-blue-400 uppercase tracking-widest max-w-lg leading-relaxed opacity-80 italic line-clamp-2 md:line-clamp-none">
                                        {payApp?.stageDescription}
                                    </p>
                                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
                                        <span className="px-2 py-0.5 md:px-3 md:py-1 bg-red-50 text-red-600 text-[8px] md:text-[9px] font-black uppercase tracking-widest rounded-lg border border-red-100">
                                            Awaiting Action
                                        </span>
                                        <span className="text-[8px] md:text-[10px] font-black text-blue-900 uppercase tracking-tight">
                                            Complete this step to move forward with your application
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    if (payApp) setSelectedPaymentApp(payApp);
                                    setAppFilter('Payments');
                                }}
                                className="w-full md:w-auto bg-blue-900 text-white px-8 md:px-10 py-4 md:py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-black transition-all shadow-2xl shadow-blue-900/20 active:scale-95 shrink-0"
                            >
                                Make Payment
                            </button>
                        </div>
                    </div>
                );
            })()}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20">
                <div className="lg:col-span-2 space-y-8">
                    <section>
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 pb-6 border-b border-blue-50">
                            <div>
                                <h2 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">Your Progress</h2>
                                <p className="text-[9px] text-blue-300 font-bold uppercase mt-1">{filteredStages.length} Active Applications</p>
                            </div>
                            <div className="flex flex-wrap bg-blue-50 p-1 rounded-xl border border-blue-100 self-start">
                                {availableFilters.map((filter: any) => (
                                    <button
                                        key={filter}
                                        onClick={() => setAppFilter(filter)}
                                        className={`px-3 sm:px-4 py-2 rounded-lg text-[8px] sm:text-[9px] font-black uppercase tracking-widest transition-all ${appFilter === filter ? 'bg-white text-blue-900 shadow-md shadow-blue-900/5' : 'text-blue-400 hover:text-blue-600'}`}
                                    >
                                        {filter}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            {appFilter === 'Completed' ? (
                                completedGroups.map((group: any) => (
                                    <div key={group.applicationId} className="bg-white p-6 rounded-[2rem] border border-blue-100 shadow-sm transition-all hover:shadow-xl">
                                        <div className="flex flex-wrap items-center gap-3 mb-4">
                                            <span className="text-[9px] font-black text-blue-300 uppercase tracking-widest bg-blue-50 px-2 py-1 rounded break-all">#{group.applicationId}</span>
                                            <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-1 rounded break-words">{group.jobCompany}</span>
                                        </div>
                                        <h3 className="text-lg font-bold text-blue-900 tracking-tight leading-tight mb-4 break-words">{group.jobTitle}</h3>
                                        <div className="space-y-3">
                                            {group.stages.map((stage: any, index: number) => (
                                                <div key={stage.stageId} className="bg-blue-50/50 p-4 rounded-2xl border-l-4 border-l-emerald-500 border border-blue-50 group-hover:bg-white group-hover:border-blue-100 transition-all flex items-start gap-4">
                                                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                                                        <span className="material-symbols-outlined text-sm font-bold">check</span>
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <h4 className="text-[10px] font-black text-blue-900 uppercase tracking-[0.2em] break-words leading-relaxed">{stage.stageName}</h4>
                                                        {stage.stageDescription && (
                                                            <p className="text-[9px] font-bold text-blue-400 mt-1 uppercase tracking-tight leading-relaxed italic line-clamp-2">{stage.stageDescription}</p>
                                                        )}
                                                        <p className="text-[9px] font-bold text-emerald-500 mt-1 uppercase opacity-80">{new Date(stage.completedAt).toLocaleString()}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                filteredStages.map((app: any) => (
                                    <div key={app.applicationId} className="bg-white p-6 rounded-[2rem] border border-blue-100 shadow-sm transition-all hover:shadow-xl hover:shadow-blue-900/5 hover:border-blue-900/20">
                                        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8">
                                            <div className="flex-1">
                                                <div className="flex flex-wrap items-center gap-3 mb-2">
                                                    <span className="text-[9px] font-black text-blue-300 uppercase tracking-widest leading-none bg-blue-50 px-2 py-1 rounded break-all">#{app.applicationId}</span>
                                                    <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest leading-none bg-emerald-50 px-2 py-1 rounded break-words">{app.jobCompany}</span>
                                                </div>
                                                <h3 className="text-xl font-bold text-blue-900 tracking-tight leading-tight mb-2 break-words">{app.jobTitle}</h3>
                                                <div className="flex flex-wrap items-center gap-4 mb-6">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="material-symbols-outlined text-[14px] text-blue-300">location_on</span>
                                                        <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">{app.jobLocation}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-blue-400">
                                                        <span className="material-symbols-outlined text-[14px] text-blue-300">payments</span>
                                                        <span className="text-[10px] font-bold uppercase tracking-widest">{app.jobSalary}</span>
                                                    </div>
                                                </div>

                                                <div className="bg-blue-50/50 p-6 rounded-[2rem] border border-blue-50 mb-6 group-hover:bg-white group-hover:border-blue-100 transition-all border-l-4 border-l-blue-900">
                                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-2 mb-3">
                                                        <div className="flex items-start sm:items-center gap-2">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-blue-900 animate-pulse mt-1.5 sm:mt-0 shrink-0" />
                                                            <span className="text-[10px] font-black text-blue-900 uppercase tracking-[0.2em] break-words">{app.stageName}</span>
                                                        </div>
                                                        <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded border whitespace-nowrap self-start ${app.isCompleted ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : app.requiresPayment ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                                                            {app.isCompleted ? 'Stage Completed' : app.requiresPayment ? 'Payment Required' : 'Under Review'}
                                                        </span>
                                                    </div>
                                                    <p className="text-[10px] font-bold text-blue-400 uppercase tracking-tight leading-relaxed italic opacity-90 mb-4 whitespace-pre-wrap line-clamp-3">
                                                        {app.stageDescription}
                                                    </p>
                                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 pt-4 border-t border-blue-100/50">
                                                        <span className="text-[8px] font-black text-blue-300 uppercase tracking-[0.2em]">Application Status:</span>
                                                        <span className="text-[8px] font-bold text-blue-900 uppercase">
                                                            {app.isCompleted ? 'Awaiting Next Phase' : `Awaiting ${app.requiresPayment && app.paymentStatus !== 'Paid' && app.paymentStatus !== 'Verified' ? 'Your Action' : 'Final Review'}`}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                        </div>



                                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between pt-6 border-t border-blue-50 gap-4">
                                            <div className="flex items-center gap-2">
                                                {app.requiresPayment ? (
                                                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${app.paymentStatus === 'Verified' || app.paymentStatus === 'Paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                        app.paymentStatus === 'Pending' ? 'bg-amber-50 text-amber-600 border-amber-100 animate-pulse' :
                                                            'bg-amber-50 text-amber-700 border-amber-100'
                                                        }`}>
                                                        <span className="material-symbols-outlined text-[14px]">
                                                            {app.paymentStatus === 'Verified' || app.paymentStatus === 'Paid' ? 'verified' :
                                                                app.paymentStatus === 'Pending' ? 'hourglass_empty' : 'payments'}
                                                        </span>
                                                        <span className="text-[9px] font-black uppercase tracking-widest whitespace-normal sm:whitespace-nowrap leading-tight text-left">
                                                            {app.paymentStatus === 'Verified' || app.paymentStatus === 'Paid' ? 'Verified' :
                                                                app.paymentStatus === 'Pending' ? 'Review in Progress' : `Due: $${app.amount}`}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2 bg-emerald-50/50 text-emerald-600 px-3 py-1.5 rounded-xl border border-emerald-100">
                                                        <span className="material-symbols-outlined text-[14px]">task_alt</span>
                                                        <span className="text-[10px] font-bold uppercase tracking-widest leading-none">Complimentary</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex flex-col sm:flex-row gap-2">
                                                <Link
                                                    href={`/dashboard/applications/${app.applicationId}`}
                                                    className="px-5 py-2.5 rounded-xl text-[9px] font-black text-blue-400 uppercase tracking-[0.2em] hover:bg-blue-50 hover:text-blue-900 transition-all text-center border border-transparent hover:border-blue-100"
                                                >
                                                    Details
                                                </Link>
                                                {app.requiresPayment && (app.paymentStatus !== 'Verified' && app.paymentStatus !== 'Paid') && (
                                                    <button
                                                        onClick={() => setSelectedPaymentApp(app)}
                                                        className="bg-blue-900 text-white px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] hover:bg-black transition-all shadow-xl shadow-blue-900/10 active:scale-95 whitespace-nowrap"
                                                    >
                                                        {app.paymentStatus === 'Pending' ? 'Update Proof' : 'Process settlement'}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )))}

                            {(appFilter === 'Completed' ? completedGroups.length === 0 : filteredStages.length === 0) && (
                                <div className="py-20 text-center bg-blue-50/50 rounded-[3rem] border-2 border-dashed border-blue-100">
                                    <span className="material-symbols-outlined text-4xl text-blue-200 mb-4">clinical_notes</span>
                                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">No applications found in this filter</p>
                                    <button
                                        onClick={() => setAppFilter('All')}
                                        className="mt-6 text-[9px] font-black text-blue-900 uppercase tracking-[0.3em] hover:underline"
                                    >
                                        View All Applications
                                    </button>
                                </div>
                            )}
                        </div>
                    </section>
                </div>

                <div className="space-y-8">
                    {((summary?.allPayments?.length > 0) || pendingStages.some((ap: any) => ap.requiresPayment)) && (
                        <section className="bg-white p-6 rounded-[2.5rem] border border-blue-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-right-4 duration-500">
                            <h2 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-8 pb-4 border-b border-blue-50">Payment History</h2>
                            <div className="space-y-3">
                                {summary.allPayments.map((pay: any) => (
                                    <div key={pay.id} className="p-4 bg-blue-50/50 border border-blue-100 rounded-2xl group hover:bg-white hover:shadow-lg hover:shadow-blue-900/5 transition-all">
                                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-4 mb-2">
                                            <p className="text-[9px] font-black text-blue-900 uppercase tracking-tight break-words flex-1 leading-relaxed" title={pay.JobStage?.name}>{pay.JobStage?.name}</p>
                                            <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg border shrink-0 ${pay.status === 'Verified' || pay.status === 'Paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                pay.status === 'Pending' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-red-50 text-red-600 border-red-100'
                                                }`}>
                                                {pay.status === 'Pending' ? 'Pending Review' : pay.status}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center text-[8px] text-blue-400 font-black uppercase tracking-widest">
                                            <span>Amount: ${pay.amount}</span>
                                            <span>Ref: #{pay.id.toString().padStart(4, '0')}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    <section className="bg-white p-6 rounded-[2.5rem] border border-blue-100 shadow-sm animate-in fade-in slide-in-from-right-8 duration-700">
                        <h2 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-8 pb-4 border-b border-blue-50">Recommended Roles</h2>
                        <div className="space-y-2">
                            {activeJobs.slice(0, 5).map((job: any) => (
                                <Link key={job.id} href={`/dashboard/jobs/${job.id}`} className="block p-4 rounded-2xl hover:bg-blue-900 hover:text-white transition-all group group-hover:shadow-xl group-hover:shadow-blue-900/10">
                                    <h4 className="text-xs font-bold transition-colors mb-2">{job.title}</h4>
                                    <div className="flex items-center justify-between">
                                        <p className="text-[8px] font-black uppercase tracking-widest opacity-60 group-hover:opacity-100">{job.location}</p>
                                        <span className="material-symbols-outlined text-sm opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1">arrow_forward</span>
                                    </div>
                                </Link>
                            ))}
                            <Link href="/dashboard/jobs" className="block text-center pt-6 text-[9px] font-black text-blue-400 uppercase tracking-widest hover:text-blue-900 transition-colors">
                                Browse All Jobs
                            </Link>
                        </div>
                    </section>

                    {/* Black Box Dashboard — Apex Locked */}
                    <section className={`relative overflow-hidden p-8 rounded-[2.5rem] border transition-all duration-500 ${user?.user?.isApexMember ? 'bg-blue-900 text-white border-blue-900 shadow-2xl' : 'bg-white border-blue-100 grayscale-[0.8] opacity-60'}`}>
                        {!user?.user?.isApexMember && (
                            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/40 backdrop-blur-[2px] p-6 text-center">
                                <span className="material-symbols-outlined text-3xl text-blue-900 mb-3">lock</span>
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-900 mb-1">Black Box Dashboard</h4>
                                <p className="text-[8px] font-bold text-blue-400 uppercase leading-tight">Apex Membership Required</p>
                                <Link href="/apex/audit" className="mt-4 text-[8px] font-black text-blue-900 underline uppercase tracking-widest">Apply for Audit</Link>
                            </div>
                        )}
                        <div className="space-y-6 relative z-0">
                            <h3 className={`text-[10px] font-black uppercase tracking-[0.3em] mb-4 flex items-center gap-2 ${user?.user?.isApexMember ? 'text-white/60' : 'text-blue-400'}`}>
                                <span className="material-symbols-outlined text-base">monitoring</span>
                                Market Intelligence
                            </h3>
                            <div className="space-y-5">
                                <div className="space-y-1">
                                    <p className={`text-[8px] font-bold uppercase tracking-widest ${user?.user?.isApexMember ? 'text-white/40' : 'text-blue-300'}`}>Budget Ceiling (Avg)</p>
                                    <p className="text-xl font-black tabular-nums tracking-tighter">$142,500 - $190,000</p>
                                </div>
                                <div className="space-y-1">
                                    <p className={`text-[8px] font-bold uppercase tracking-widest ${user?.user?.isApexMember ? 'text-white/40' : 'text-blue-300'}`}>Avg. Engineering Turnover</p>
                                    <p className="text-xl font-black tabular-nums tracking-tighter">4.2% / Year</p>
                                </div>
                                <div className="space-y-1">
                                    <p className={`text-[8px] font-bold uppercase tracking-widest ${user?.user?.isApexMember ? 'text-white/40' : 'text-blue-300'}`}>Time-to-Hire Metric</p>
                                    <p className="text-xl font-black tabular-nums tracking-tighter">18.5 Days</p>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>

            {selectedPaymentApp && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-blue-900/95 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] border border-white/20">
                        <div className="p-8 bg-white border-b border-blue-50 flex items-center justify-between">
                            <div>
                                <h3 className="text-xs font-black text-blue-900 uppercase tracking-widest">Payment Gateway</h3>
                                <p className="text-[9px] font-bold text-blue-400 uppercase mt-1">Ref ID: #TXN-{selectedPaymentApp.applicationId.toString().padStart(5, '0')}897XVB</p>
                            </div>
                            <button onClick={() => setSelectedPaymentApp(null)} className="w-10 h-10 rounded-xl hover:bg-blue-50 text-blue-400 hover:text-blue-900 transition-all flex items-center justify-center">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
                            {getPaymentForApp(selectedPaymentApp) ? (
                                <PaymentUpload
                                    paymentId={getPaymentForApp(selectedPaymentApp).id}
                                    amount={selectedPaymentApp.amount}
                                    onSuccess={() => {
                                        setSelectedPaymentApp(null);
                                        refetch();
                                    }}
                                />
                            ) : (
                                <div className="p-12 text-center">
                                    <span className="material-symbols-outlined text-5xl text-red-100 mb-4">error</span>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-red-500">
                                        Notice: No payment record found for this stage.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
