'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useApiQuery, useApiMutation } from '@/lib/hooks';
import Link from 'next/link';

export default function ApplicationDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id;
    const [showAddStage, setShowAddStage] = useState(false);

    // Form state for stage
    const [editingStage, setEditingStage] = useState<any>(null);
    const [stageName, setStageName] = useState('');
    const [stageDesc, setStageDesc] = useState('');
    const [requiresPayment, setRequiresPayment] = useState(false);
    const [amount, setAmount] = useState('');
    const [setAsCurrent, setSetAsCurrent] = useState(false);
    const [notifyInApp, setNotifyInApp] = useState(true);
    const [notifyEmail, setNotifyEmail] = useState(false);
    const [verifyingPayment, setVerifyingPayment] = useState<any>(null);

    const { data: application, isLoading, error, refetch } = useApiQuery<any>(
        ['admin', 'applications', `${id}`],
        `/admin/applications/${id}`,
        { enabled: !!id }
    );

    const addStageMutation = useApiMutation(
        'post',
        `/admin/applications/${id}/stages`,
        {
            onSuccess: () => {
                setShowAddStage(false);
                resetStageForm();
                refetch();
            }
        }
    );

    const updateStageMutation = useApiMutation(
        'put',
        `/admin/applications/${id}/stages/:stageId`,
        {
            onSuccess: () => {
                setEditingStage(null);
                resetStageForm();
                refetch();
            }
        }
    );

    const deleteStageMutation = useApiMutation(
        'delete',
        `/admin/applications/${id}/stages/:stageId`,
        { onSuccess: () => refetch() }
    );

    const advanceMutation = useApiMutation(
        'post',
        `/admin/applications/${id}/advance`,
        { onSuccess: () => refetch() }
    );

    const completeStageMutation = useApiMutation(
        'post',
        `/admin/applications/${id}/stages/:stageId/complete`,
        { onSuccess: () => refetch() }
    );

    const verifyPaymentMutation = useApiMutation(
        'post',
        '/admin/payments/:paymentId/verify',
        {
            onSuccess: () => {
                setVerifyingPayment(null);
                refetch();
            }
        }
    );

    const completeApplicationMutation = useApiMutation(
        'post',
        `/admin/applications/${id}/complete`,
        {
            onSuccess: () => {
                refetch();
            }
        }
    );

    const resetStageForm = () => {
        setStageName('');
        setStageDesc('');
        setRequiresPayment(false);
        setAmount('');
        setSetAsCurrent(false);
        setNotifyInApp(true);
        setNotifyEmail(false);
    };

    const handleSaveStage = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            name: stageName,
            description: stageDesc,
            requiresPayment,
            amount: requiresPayment ? parseFloat(amount) : null,
            currency: requiresPayment ? 'USD' : null,
            orderPosition: editingStage ? editingStage.orderPosition : (application?.JobStages?.length || 0) + 1,
            setAsCurrent,
            notifyInApp,
            notifyEmail
        };

        try {
            if (editingStage) {
                await updateStageMutation.mutateAsync({
                    params: { stageId: editingStage.id },
                    data: payload
                });
            } else {
                await addStageMutation.mutateAsync(payload);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleEditClick = (stage: any) => {
        setEditingStage(stage);
        setStageName(stage.name);
        setStageDesc(stage.description);
        setRequiresPayment(stage.requiresPayment);
        setAmount(stage.amount?.toString() || '');
        setSetAsCurrent(stage.id === application?.currentStageId);
    };



    const handleMarkStageComplete = async (stageId: number) => {
        if (confirm('Mark Stage Complete: This will mark this specific stage as completed. Confirm?')) {
            try {
                await completeStageMutation.mutateAsync({ params: { stageId } });
            } catch (err) {
                console.error(err);
            }
        }
    };

    const handleComplete = async () => {
        if (confirm('Finalize Application: Are you sure you want to mark this application as COMPLETED? This will notify the applicant and finalize the process.')) {
            try {
                await completeApplicationMutation.mutateAsync({});
            } catch (err) {
                console.error(err);
            }
        }
    };

    if (isLoading) return <div className="p-12 text-center text-[10px] font-bold uppercase tracking-widest text-blue-400">Loading Application Status...</div>;
    if (error) return <div className="p-12 text-center text-red-500 text-[10px] font-bold uppercase tracking-widest">Error Loading Application Data</div>;

    const user = application?.User;
    const job = application?.JobListing;
    const stages = application?.JobStages || [];
    const payments = application?.Payments || [];

    const getStagePayment = (stageId: number) => {
        return payments.find((p: any) => p.stageId === stageId);
    };

    const DataItem = ({ label, value }: { label: string, value: string | null | undefined }) => (
        <div className="space-y-1">
            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-blue-400">{label}</span>
            <p className="text-[11px] font-bold text-blue-900 uppercase">{value || 'Not Disclosed'}</p>
        </div>
    );

    return (
        <div className="font-sans antialiased text-blue-900 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6 pb-8 border-b border-blue-50">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <Link href="/admin/applications" className="text-blue-400 hover:text-blue-900 transition-colors">
                            <span className="material-symbols-outlined text-sm font-bold">arrow_back</span>
                        </Link>
                        <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em]">Application Management / {id}</span>
                    </div>
                    <h1 className="text-3xl font-black italic uppercase tracking-tighter text-blue-900">{user?.fullName}</h1>
                    <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mt-1">
                        Application Target: {job?.title}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <span className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-xl border ${application.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                        application.status === 'COMPLETED' ? 'bg-blue-900 text-white shadow-lg shadow-blue-900/10' :
                            'bg-blue-100 text-blue-600'
                        }`}>
                        {application.status}
                    </span>
                    <button
                        onClick={() => setShowAddStage(true)}
                        className="bg-blue-900 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-black transition-all shadow-xl shadow-blue-900/10 active:scale-95"
                    >
                        Add Workflow Stage
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Main Process Logic */}
                <div className="lg:col-span-8 space-y-8">
                    <div className="bg-white p-10 rounded-[2.5rem] border border-blue-100 shadow-2xl shadow-blue-900/5">
                        <div className="flex items-center justify-between mb-10">
                            <h3 className="text-[10px] font-black text-blue-900 uppercase tracking-[0.3em] flex items-center gap-2">
                                <span className="material-symbols-outlined text-sm font-bold">account_tree</span>
                                Application Process
                            </h3>
                        </div>

                        <div className="space-y-4">
                            {stages.sort((a: any, b: any) => a.orderPosition - b.orderPosition).map((stage: any, index: number) => {
                                const isCurrent = stage.id === application.currentStageId;
                                const payment = getStagePayment(stage.id);

                                return (
                                    <div
                                        key={stage.id}
                                        className={`p-6 rounded-[2rem] border transition-all group ${isCurrent ? 'bg-blue-50 border-blue-200 shadow-xl shadow-blue-900/5' : 'bg-white border-blue-50'
                                            }`}
                                    >
                                        <div className="flex justify-between items-start gap-4">
                                            <div className="flex gap-6">
                                                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-black italic shrink-0 transition-all ${isCurrent ? 'bg-blue-900 text-white shadow-2xl shadow-blue-900/20' : 'bg-blue-50 text-blue-300'
                                                    }`}>
                                                    {index + 1}
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-black uppercase tracking-tight text-blue-900 flex items-center gap-3">
                                                        {stage.name}
                                                        {stage.requiresPayment && (
                                                            <div className="flex items-center gap-2">
                                                                {payment ? (
                                                                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${payment.status === 'Verified' || payment.status === 'Paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                                        payment.status === 'Pending' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-red-50 text-red-600 border-red-100'
                                                                        }`}>
                                                                        {payment.status === 'Verified' || payment.status === 'Paid' ? 'Payment Verified' :
                                                                            payment.status === 'Pending' ? 'Review Needed' : 'Unpaid Entry'}
                                                                    </span>
                                                                ) : (
                                                                    <span className="px-2 py-0.5 bg-blue-50 text-blue-400 rounded text-[8px] font-black uppercase tracking-widest border border-blue-100">
                                                                        Payment Due: ${stage.amount}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        )}
                                                    </h4>
                                                    <p className="text-[11px] font-bold text-blue-400 mt-1 leading-relaxed uppercase">
                                                        {stage.description}
                                                    </p>

                                                    {payment && (
                                                        <div className="mt-6 flex items-center gap-3">
                                                            <div className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 border ${payment.status === 'Paid' || payment.status === 'Verified' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                                payment.status === 'Pending' ? 'bg-amber-50 text-amber-600 border-amber-100 animate-pulse' : 'bg-red-50 text-red-600 border-red-100'
                                                                }`}>
                                                                <span className="material-symbols-outlined text-xs font-bold">payments</span>
                                                                Payment {payment.status}
                                                                {payment.status === 'Pending' && (
                                                                    <button
                                                                        onClick={() => setVerifyingPayment(payment)}
                                                                        className="ml-4 underline hover:text-amber-800 transition-colors"
                                                                    >
                                                                        Inspect Proof
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-3">
                                                {isCurrent && (
                                                    <span className="text-[8px] font-black text-white uppercase tracking-widest bg-blue-900 px-3 py-1 rounded-lg shadow-lg shadow-blue-900/10">
                                                        Current Stage
                                                    </span>
                                                )}
                                                {stage.isCompleted && (
                                                    <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-lg flex items-center gap-1">
                                                        <span className="material-symbols-outlined text-[10px] font-bold">check</span>
                                                        Completed
                                                    </span>
                                                )}
                                                <div className="flex flex-col sm:flex-row gap-2 mt-2">
                                                    {!stage.isCompleted && (
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleMarkStageComplete(stage.id); }}
                                                            className="px-3 py-1.5 flex items-center justify-center gap-1.5 text-[9px] font-black uppercase text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-all border border-emerald-100"
                                                        >
                                                            <span className="material-symbols-outlined text-[14px]">done_all</span>
                                                            <span className="hidden sm:inline">Mark Complete</span>
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleEditClick(stage); }}
                                                        className="px-3 py-1.5 flex items-center justify-center gap-1.5 text-[9px] font-black uppercase text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all border border-blue-100"
                                                    >
                                                        <span className="material-symbols-outlined text-[14px]">edit</span>
                                                        <span className="hidden sm:inline">Edit</span>
                                                    </button>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); if (confirm('Delete Stage: Permanently delete this stage?')) deleteStageMutation.mutate({ params: { stageId: stage.id } }); }}
                                                        className="px-3 py-1.5 flex items-center justify-center gap-1.5 text-[9px] font-black uppercase text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-all border border-red-100"
                                                    >
                                                        <span className="material-symbols-outlined text-[14px]">delete</span>
                                                        <span className="hidden sm:inline">Delete</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            {stages.length === 0 && (
                                <div className="py-20 text-center bg-blue-50/50 rounded-[3rem] border-2 border-dashed border-blue-100">
                                    <span className="material-symbols-outlined text-3xl text-blue-200 mb-2">account_tree</span>
                                    <p className="text-[9px] font-black text-blue-300 uppercase tracking-[0.3em]">No stages defined</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Applicant Overview Sidebar */}
                <div className="lg:col-span-4 space-y-8">
                    {/* Bio Card */}
                    <div className="bg-white p-10 rounded-[2.5rem] border border-blue-100 shadow-2xl shadow-blue-900/5">
                        <div className="flex items-center gap-4 mb-8 pb-4 border-b border-blue-50">
                            <span className="material-symbols-outlined text-blue-900">badge</span>
                            <h3 className="text-[10px] font-black text-blue-900 uppercase tracking-[0.2em]">Applicant Profile</h3>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-16 h-16 rounded-2xl bg-blue-900 flex items-center justify-center text-white text-2xl font-black italic shadow-2xl shadow-blue-900/10">
                                    {user?.fullName?.charAt(0)}
                                </div>
                                <div>
                                    <p className="text-sm font-black uppercase tracking-tight text-blue-900">{user?.fullName}</p>
                                    <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">{user?.email}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-6">
                                <DataItem label="Nationality" value={user?.nationality} />
                                <DataItem label="Gender" value={user?.gender} />
                                <DataItem label="Date of Birth" value={user?.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : 'N/A'} />
                                <DataItem label="Phone Number" value={user?.phoneNumber} />
                                <div className="col-span-1">
                                    <DataItem label="Residential Address" value={user?.address} />
                                </div>
                            </div>

                            <div className="pt-8 border-t border-blue-50">
                                {user?.cvUrl ? (
                                    <a
                                        href={user.cvUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full py-4 bg-white border-2 border-blue-900 text-blue-900 rounded-xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-blue-50 transition-all flex items-center justify-center gap-3 shadow-xl shadow-blue-900/5 active:scale-95"
                                    >
                                        <span className="material-symbols-outlined text-base font-bold">description</span>
                                        View Resume
                                    </a>
                                ) : (
                                    <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 text-center">
                                        <p className="text-[8px] font-black text-amber-600 uppercase tracking-widest">No resume detected</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Internal Ops Card */}
                    <div className="bg-white p-10 rounded-[2.5rem] border border-blue-100 shadow-2xl shadow-blue-900/5">
                        <div className="flex items-center gap-4 mb-8 pb-4 border-b border-blue-50">
                            <span className="material-symbols-outlined text-blue-900">settings_input_component</span>
                            <h3 className="text-[10px] font-black text-blue-900 uppercase tracking-[0.2em]">Process Status</h3>
                        </div>


                    </div>

                    <div className="bg-blue-900 p-10 rounded-[3rem] text-white shadow-2xl shadow-blue-900/20">
                        <div className="flex flex-col gap-2">
                            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-blue-500">Log Timestamp</span>
                            <span className="text-xs font-bold uppercase">{new Date(application.createdAt).toLocaleString()}</span>
                            <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center text-[8px] font-black uppercase tracking-widest opacity-60">
                                <span>Application ID {id}</span>
                                <span>SSL Secure</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stage Addition/Edit Modal */}
            {(showAddStage || editingStage) && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-8">
                    <div className="absolute inset-0 bg-blue-900/80 backdrop-blur-xl animate-in fade-in duration-500" onClick={() => { setShowAddStage(false); setEditingStage(null); }}></div>
                    <div className="relative bg-white rounded-[3rem] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-300">
                        <div className="p-10 border-b border-blue-50 flex items-center justify-between shrink-0">
                            <div>
                                <h3 className="text-xs font-black text-blue-900 uppercase tracking-[0.3em]">{editingStage ? 'Edit Stage' : 'Add New Stage'}</h3>
                                <p className="text-[9px] font-bold text-blue-400 uppercase mt-1">Configuring application process stage</p>
                            </div>
                            <button onClick={() => { setShowAddStage(false); setEditingStage(null); }} className="w-10 h-10 rounded-xl hover:bg-blue-50 text-blue-400 hover:text-blue-900 transition-all flex items-center justify-center">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <form onSubmit={handleSaveStage} className="p-10 space-y-8 overflow-y-auto custom-scrollbar">
                            <div className="space-y-2">
                                <label className="block text-[9px] font-black text-blue-400 uppercase tracking-widest">Stage Name</label>
                                <input
                                    type="text"
                                    required
                                    value={stageName}
                                    onChange={(e) => setStageName(e.target.value)}
                                    placeholder="Enter stage identifier"
                                    className="w-full px-6 py-4 bg-blue-50 border border-transparent rounded-2xl text-sm font-bold text-blue-900 focus:bg-white focus:border-blue-900 outline-none transition-all placeholder:text-blue-200"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-[9px] font-black text-blue-400 uppercase tracking-widest">Stage Description</label>
                                <textarea
                                    rows={4}
                                    required
                                    value={stageDesc}
                                    onChange={(e) => setStageDesc(e.target.value)}
                                    placeholder="Define stage requirements..."
                                    className="w-full px-6 py-4 bg-blue-50 border border-transparent rounded-2xl text-sm font-bold text-blue-900 focus:bg-white focus:border-blue-900 outline-none transition-all resize-none placeholder:text-blue-200"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center gap-4 p-5 bg-blue-50/50 rounded-2xl border border-blue-50">
                                    <div className="flex items-center h-5">
                                        <input
                                            type="checkbox"
                                            id="setAsCurrent"
                                            checked={setAsCurrent}
                                            onChange={(e) => setSetAsCurrent(e.target.checked)}
                                            className="w-5 h-5 rounded-lg border-blue-200 text-blue-900 focus:ring-blue-900"
                                        />
                                    </div>
                                    <label htmlFor="setAsCurrent" className="text-[10px] font-black text-blue-900 uppercase tracking-[0.2em] cursor-pointer">Mark as Current Stage</label>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center gap-4 p-5 bg-blue-50/50 rounded-2xl border border-blue-50">
                                    <div className="flex items-center h-5">
                                        <input
                                            type="checkbox"
                                            id="notifyInApp"
                                            checked={notifyInApp}
                                            onChange={(e) => setNotifyInApp(e.target.checked)}
                                            className="w-5 h-5 rounded-lg border-blue-200 text-blue-900 focus:ring-blue-900"
                                        />
                                    </div>
                                    <label htmlFor="notifyInApp" className="text-[10px] font-black text-blue-900 uppercase tracking-[0.2em] cursor-pointer">Alert on Dashboard</label>
                                </div>
                                <div className="flex items-center gap-4 p-5 bg-blue-50/50 rounded-2xl border border-blue-50">
                                    <div className="flex items-center h-5">
                                        <input
                                            type="checkbox"
                                            id="notifyEmail"
                                            checked={notifyEmail}
                                            onChange={(e) => setNotifyEmail(e.target.checked)}
                                            className="w-5 h-5 rounded-lg border-blue-200 text-blue-900 focus:ring-blue-900"
                                        />
                                    </div>
                                    <label htmlFor="notifyEmail" className="text-[10px] font-black text-blue-900 uppercase tracking-[0.2em] cursor-pointer">Dispatch Email</label>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 p-5 bg-blue-50/50 rounded-2xl border border-blue-50">
                                <div className="flex items-center h-5">
                                    <input
                                        type="checkbox"
                                        id="paywall"
                                        checked={requiresPayment}
                                        onChange={(e) => setRequiresPayment(e.target.checked)}
                                        className="w-5 h-5 rounded-lg border-blue-200 text-blue-900 focus:ring-blue-900"
                                    />
                                </div>
                                <label htmlFor="paywall" className="text-[10px] font-black text-blue-900 uppercase tracking-[0.2em] cursor-pointer">Payment Required</label>
                            </div>
                            {requiresPayment && (
                                <div className="space-y-2 animate-in slide-in-from-top-4 duration-300">
                                    <label className="block text-[9px] font-black text-blue-400 uppercase tracking-widest">Requested Amount (USD)</label>
                                    <input
                                        type="number"
                                        required
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        placeholder="0.00"
                                        className="w-full px-6 py-4 bg-blue-50 border border-transparent rounded-2xl text-sm font-bold text-blue-900 focus:bg-white focus:border-blue-900 outline-none transition-all"
                                    />
                                </div>
                            )}
                            <button
                                type="submit"
                                disabled={addStageMutation.isPending || updateStageMutation.isPending}
                                className="w-full py-5 bg-blue-900 text-white font-black text-[10px] uppercase tracking-[0.4em] rounded-2xl hover:bg-black transition-all shadow-2xl shadow-blue-900/20 disabled:opacity-50 active:scale-95"
                            >
                                {addStageMutation.isPending || updateStageMutation.isPending ? 'Loading...' : 'Save Stage Configuration'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Proof Verification Modal */}
            {verifyingPayment && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8">
                    <div className="absolute inset-0 bg-blue-900/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setVerifyingPayment(null)}></div>
                    <div className="relative bg-white rounded-[2.5rem] shadow-2xl shadow-blue-900/20 w-full max-w-5xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
                        {/* Header */}
                        <div className="p-6 md:px-10 md:py-8 border-b border-blue-50 flex items-center justify-between bg-white/50 shrink-0">
                            <div>
                                <h3 className="text-xs font-black text-blue-900 uppercase tracking-[0.3em]">Payment Verification</h3>
                                <p className="text-[10px] font-bold text-blue-400 uppercase mt-1">Reviewing visual proof of transaction</p>
                            </div>
                            <button onClick={() => setVerifyingPayment(null)} className="w-10 h-10 rounded-full hover:bg-blue-50 text-blue-400 hover:text-blue-900 transition-all flex items-center justify-center border border-transparent hover:border-blue-100">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        
                        {/* Content Area */}
                        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                            {/* Receipt Viewer Column */}
                            <div className="flex-1 bg-blue-50/30 p-6 md:p-10 flex items-start justify-center overflow-y-auto custom-scrollbar border-b md:border-b-0 md:border-r border-blue-50">
                                {verifyingPayment.proofUrl ? (
                                    <img
                                        src={verifyingPayment.proofUrl}
                                        alt="Payment Proof"
                                        className="max-w-full h-auto rounded-2xl shadow-xl shadow-blue-900/10 border border-blue-100"
                                    />
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-blue-200 mt-20 md:mt-0">
                                        <span className="material-symbols-outlined text-6xl mb-4">image_not_supported</span>
                                        <p className="text-[10px] uppercase font-black tracking-[0.3em]">No receipt detected</p>
                                    </div>
                                )}
                            </div>
                            
                            {/* Actions Column */}
                            <div className="w-full md:w-[380px] p-6 md:p-10 bg-white flex flex-col shrink-0 overflow-y-auto custom-scrollbar">
                                <div className="space-y-8 flex-1">
                                    <div>
                                        <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-1.5">Target Requirement</p>
                                        <p className="text-sm font-bold text-blue-900 uppercase">{verifyingPayment.JobStage?.name || 'Application Stage'}</p>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-6 bg-blue-50/50 p-6 rounded-[1.5rem] border border-blue-50">
                                        <div>
                                            <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-1">Expected Amount</p>
                                            <p className="text-2xl font-black text-blue-900">${verifyingPayment.amount}</p>
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-1">Currency</p>
                                            <p className="text-2xl font-black text-blue-900">{verifyingPayment.currency}</p>
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-2">Current Status</p>
                                        <span className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                                            verifyingPayment.status === 'Paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                            verifyingPayment.status === 'Rejected' ? 'bg-red-50 text-red-600 border-red-100' :
                                            'bg-amber-50 text-amber-600 border-amber-100'
                                        }`}>
                                            {verifyingPayment.status}
                                        </span>
                                    </div>
                                </div>
                                
                                {/* Buttons at bottom */}
                                <div className="mt-10 flex flex-col gap-3 pt-6 border-t border-blue-50">
                                    <button
                                        onClick={() => { if (confirm('Approve Payment: Confirm payment and advance application?')) verifyPaymentMutation.mutate({ params: { paymentId: verifyingPayment.id }, data: { isApproved: true } }); }}
                                        disabled={verifyPaymentMutation.isPending || verifyingPayment.status === 'Paid'}
                                        className="w-full py-4 bg-emerald-600 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-900/20 active:scale-95 disabled:opacity-50 disabled:active:scale-100"
                                    >
                                        {verifyPaymentMutation.isPending ? 'Processing...' : 'Approve Payment'}
                                    </button>
                                    <button
                                        onClick={() => {
                                            const note = prompt('Specify rejection details (required):');
                                            if (note) verifyPaymentMutation.mutate({ params: { paymentId: verifyingPayment.id }, data: { isApproved: false, note } });
                                        }}
                                        disabled={verifyPaymentMutation.isPending || verifyingPayment.status === 'Paid'}
                                        className="w-full py-4 bg-white text-red-500 border-2 border-red-100 font-black text-[10px] uppercase tracking-[0.2em] rounded-xl hover:bg-red-50 hover:border-red-200 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100"
                                    >
                                        Reject & Request Redo
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>

    );
}
