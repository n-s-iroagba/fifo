'use client';

import { PaymentUpload } from '@/components/ui/PaymentUpload';
import { useApiQuery } from '@/lib/hooks';
import Link from 'next/link';
import { useState } from 'react';

export default function ApplicantDashboard() {
    const { data: summary, isLoading, refetch } = useApiQuery<any>(['applicant', 'dashboard'], '/dashboard');
    const { data: user } = useApiQuery<any>(['auth', 'me'], '/auth/me');
    const [selectedPaymentApp, setSelectedPaymentApp] = useState<any>(null);
    const [appFilter, setAppFilter] = useState('All');
    const hasFinancialActivity = (summary?.allPayments?.length > 0);

    const availableFilters = ['All', 'Active', 'Completed'];

    if (isLoading) return <div className="p-12 text-center text-[10px] font-bold uppercase tracking-widest text-blue-400 animate-pulse">Loading Dashboard...</div>;

    const pendingStages = summary?.pendingStages || [];
    const activeJobs = summary?.activeJobs?.rows || summary?.activeJobs || [];

    const completedGroups = summary?.completedGroups || [];

    const filteredStages = pendingStages.filter((app: any) => {
        if (appFilter === 'All') return true;
        if (appFilter === 'Active') return !app.isCompleted;
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



            {/* Refund Wallet Section */}
            {user && (
                <div className="mb-12">
                    <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white p-8 md:p-10 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl shadow-blue-900/20">
                        <div className="flex items-center gap-6 w-full md:w-auto">
                            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center shrink-0 border border-white/20">
                                <span className="material-symbols-outlined text-3xl">account_balance_wallet</span>
                            </div>
                            <div>
                                <h4 className="text-[10px] font-black text-blue-300 uppercase tracking-[0.3em] mb-1">Available Sponsorship Refund Wallet</h4>
                                <div className="text-3xl md:text-4xl font-black tracking-tight">${(user?.walletBalance || 0).toFixed(2)}</div>
                                <p className="text-[9px] font-bold text-blue-200 mt-1 uppercase tracking-widest">Available for Tickets or Withdrawal</p>
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                            <a
                                href={`mailto:support@fifo.com?subject=Refund%20Withdrawal%20Request%20-%20${user?.email}&body=I%20would%20like%20to%20request%20a%20withdrawal%20of%20my%20refund%20wallet%20balance.%0A%0AMy%20details:%0AEmail:%20${user?.email}%0ABalance:%20$${user?.walletBalance}`}
                                className="bg-white text-blue-900 px-6 py-4 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] hover:bg-blue-50 transition-all text-center"
                            >
                                Request Withdrawal
                            </a>
                            <a
                                href={`mailto:support@fifo.com?subject=Ticket%20Purchase%20via%20Wallet%20-%20${user?.email}&body=I%20would%20like%20to%20use%20my%20refund%20wallet%20balance%20to%20purchase%20a%20ticket.%0A%0AMy%20details:%0AEmail:%20${user?.email}%0ABalance:%20$${user?.walletBalance}%0A%0APlease%20specify%20which%20ticket:`}
                                className="bg-blue-800 text-white border border-blue-700 px-6 py-4 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] hover:bg-blue-700 transition-all text-center"
                            >
                                Use for Ticket
                            </a>
                        </div>
                    </div>
                </div>
            )}

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
                                                        <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded border whitespace-nowrap self-start ${app.isCompleted ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                                                            {app.isCompleted ? 'Stage Completed' : 'Under Review'}
                                                        </span>
                                                    </div>
                                                    <p className="text-[10px] font-bold text-blue-400 uppercase tracking-tight leading-relaxed italic opacity-90 mb-4 whitespace-pre-wrap line-clamp-3">
                                                        {app.stageDescription}
                                                    </p>
                                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 pt-4 border-t border-blue-100/50">
                                                        <span className="text-[8px] font-black text-blue-300 uppercase tracking-[0.2em]">Application Status:</span>
                                                        <span className="text-[8px] font-bold text-blue-900 uppercase">
                                                            {app.isCompleted ? 'Awaiting Next Phase' : 'Awaiting Final Review'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                        </div>



                                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between pt-6 border-t border-blue-50 gap-4">
                                            <div className="flex items-center gap-2">
                                                <Link
                                                    href={`/dashboard/applications/${app.applicationId}`}
                                                    className="px-5 py-2.5 rounded-xl text-[9px] font-black text-blue-400 uppercase tracking-[0.2em] hover:bg-blue-50 hover:text-blue-900 transition-all text-center border border-transparent hover:border-blue-100"
                                                >
                                                    Details
                                                </Link>
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
                    {((summary?.allPayments?.length > 0)) && (
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


                </div>
            </div>


        </div>
    );
}
