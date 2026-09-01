'use client';

import React, { useState } from 'react';
import { useApiQuery } from '@/lib/hooks';
import api from '@/lib/api';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ApplicationStageManager } from '@/components/admin/ApplicationStageManager';
import { LmsAccessPanel } from '@/components/admin/LmsAccessPanel';
import { AvelingInvoicesPanel } from '@/components/admin/AvelingInvoicesPanel';
import { Application } from '@/types/models';

export default function AdminApplicantDetailPage() {
    const { id } = useParams();
    const { data: userData, isLoading, refetch: refetchUser } = useApiQuery<any>(['admin', 'applicants', id], `/admin/users/${id}`);
    const { data: appsData, isLoading: isAppsLoading, refetch: refetchApps } = useApiQuery<{ rows: Application[] }>(['admin', 'applicants', id, 'applications'], `/admin/applications?userId=${id}`);


    const user = userData?.user;
    const applications = appsData?.rows || [];

    const [isEditingWallet, setIsEditingWallet] = useState(false);
    const [walletAmount, setWalletAmount] = useState('');
    const [isUpdatingWallet, setIsUpdatingWallet] = useState(false);
    const [isUpdatingStage, setIsUpdatingStage] = useState(false);
    const [isEditingSubsidy, setIsEditingSubsidy] = useState(false);
    const [subsidyValue, setSubsidyValue] = useState('');
    const [isUpdatingSubsidy, setIsUpdatingSubsidy] = useState(false);

    const [isAddingTicket, setIsAddingTicket] = useState(false);
    const [newTicketType, setNewTicketType] = useState('');
    const [newTicketStatus, setNewTicketStatus] = useState('not_possessed');
    const [isSubmittingTicket, setIsSubmittingTicket] = useState(false);
    const [isDeletingTicket, setIsDeletingTicket] = useState<number | null>(null);

    if (isLoading) return <div className="p-12 text-center text-[10px] font-bold uppercase tracking-widest text-blue-400">Loading Applicant Profile...</div>;
    if (!user) return <div className="p-12 text-center text-[10px] font-bold uppercase tracking-widest text-red-500">Applicant Record Not Found</div>;

    const DataItem = ({ label, value }: { label: string, value: string | null | undefined }) => (
        <div className="space-y-1">
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-400">{label}</span>
            <p className="text-sm font-bold text-blue-900">{value || 'Not Disclosed'}</p>
        </div>
    );



    const handleUpdateWallet = async () => {
        setIsUpdatingWallet(true);
        try {
            const res = await api.put(`/admin/users/${id}/wallet`, { walletBalance: parseFloat(walletAmount) || 0 });
            if (res.status === 200) {
                alert('Refund wallet updated successfully.');
                setIsEditingWallet(false);
                refetchUser();
            } else {
                alert('Failed to update wallet.');
            }
        } catch (e: any) {
            alert(e.response?.data?.error || 'Network error while updating wallet.');
        } finally {
            setIsUpdatingWallet(false);
        }
    };

    const handleUpdateSubsidy = async () => {
        setIsUpdatingSubsidy(true);
        try {
            const res = await api.put(`/admin/users/${id}/subsidy-percentage`, { subsidyPercentage: parseInt(subsidyValue) || 0 });
            if (res.status === 200) {
                alert('Subsidy percentage updated successfully.');
                setIsEditingSubsidy(false);
                refetchUser();
            } else {
                alert('Failed to update subsidy.');
            }
        } catch (e: any) {
            alert(e.response?.data?.error || 'Network error while updating subsidy.');
        } finally {
            setIsUpdatingSubsidy(false);
        }
    };

    const handleUpdateAdminStage = async (newStageId: string) => {
        setIsUpdatingStage(true);
        try {
            const res = await api.put(`/admin/users/${id}/admin-stage`, { adminStageId: parseInt(newStageId, 10) });
            if (res.status === 200) {
                alert('Admin stage updated successfully. Notification sent.');
                refetchUser();
            } else {
                alert('Failed to update stage.');
            }
        } catch (e: any) {
            alert(e.response?.data?.error || 'Network error while updating stage.');
        } finally {
            setIsUpdatingStage(false);
        }
    };

    const handleAddTicket = async () => {
        if (!newTicketType.trim()) {
            alert('Please enter a ticket/certification name.');
            return;
        }
        setIsSubmittingTicket(true);
        try {
            const res = await api.post(`/admin/users/${id}/tickets`, {
                ticketType: newTicketType,
                status: newTicketStatus
            });
            if (res.status === 201) {
                alert('Ticket added successfully.');
                setIsAddingTicket(false);
                setNewTicketType('');
                setNewTicketStatus('not_possessed');
                refetchUser();
            }
        } catch (e: any) {
            alert(e.response?.data?.error || 'Failed to add ticket.');
        } finally {
            setIsSubmittingTicket(false);
        }
    };

    const handleRemoveTicket = async (ticketId: number) => {
        if (!confirm('Are you sure you want to remove this ticket from the applicant?')) return;
        setIsDeletingTicket(ticketId);
        try {
            const res = await api.delete(`/admin/tickets/${ticketId}`);
            if (res.status === 200) {
                alert('Ticket removed successfully.');
                refetchUser();
            }
        } catch (e: any) {
            alert(e.response?.data?.error || 'Failed to remove ticket.');
        } finally {
            setIsDeletingTicket(null);
        }
    };

    return (
        <div className="font-sans antialiased text-blue-900 pb-24 max-w-6xl mx-auto">
            <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <div className="flex items-center gap-4 mb-4">
                        <Link href="/admin/applicants" className="p-2 rounded-xl bg-blue-50 text-blue-400 hover:bg-blue-900 hover:text-white transition-all shadow-sm">
                            <span className="material-symbols-outlined text-sm font-bold">arrow_back</span>
                        </Link>
                        <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em]">Applicant Profile</span>
                    </div>
                    <h1 className="text-4xl font-black italic uppercase tracking-tighter text-blue-900">{user.fullName}</h1>
                    <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mt-1">Record ID: {user.id} · {user.email}</p>
                </div>

                <div className="flex flex-wrap gap-3 justify-end">
                    <Link
                        href={`/admin/mail?to=${user.email}`}
                        className="bg-blue-900 text-white px-6 py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-black transition-all shadow-xl shadow-blue-900/20 active:scale-95 flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-base">mail</span>
                        Direct Message
                    </Link>
                    <button
                        onClick={async () => {
                            if (confirm('DANGER: This will permanently delete this applicant profile from the system. This action is irreversible.')) {
                                try {
                                    const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
                                    if (res.ok) {
                                        alert('Profile deleted successfully.');
                                        window.location.href = '/admin/applicants';
                                    } else {
                                        alert('Delete failed: Access denied.');
                                    }
                                } catch (e) {
                                    alert('Delete failed: Network error.');
                                }
                            }
                        }}
                        className="bg-red-50 text-red-600 border-2 border-red-100 px-6 py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-red-500 hover:text-white hover:border-red-500 transition-all active:scale-95 flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-base">delete_forever</span>
                        Delete Profile
                    </button>
                    {user.cvUrl && (
                        <a
                            href={user.cvUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-white border-2 border-blue-900 text-blue-900 px-6 py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-blue-50 transition-all active:scale-95 flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined text-base">description</span>
                            View Resume
                        </a>
                    )}
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Identity Summary Card */}
                <div className="lg:col-span-1 space-y-8">
                    <div className="bg-white p-10 rounded-[2.5rem] border border-blue-100 shadow-2xl shadow-blue-900/5 flex flex-col items-center">
                        <div className="w-24 h-24 rounded-3xl bg-blue-900 flex items-center justify-center text-white text-4xl font-black italic shadow-2xl shadow-blue-900/20 mb-6">
                            {user.fullName.charAt(0)}
                        </div>
                        <h2 className="text-xl font-black uppercase tracking-tight text-blue-900 text-center">{user.fullName}</h2>



                        <div className="w-full mt-10 pt-10 border-t border-blue-50 grid grid-cols-1 gap-6">
                            <DataItem label="Email Address" value={user.email} />
                            <DataItem label="Primary Phone" value={user.phoneNumber} />
                        </div>
                    </div>

                    {/* Refund Wallet Card */}
                    <div className="bg-white p-10 rounded-[2.5rem] border border-blue-100 shadow-2xl shadow-blue-900/5">
                        <div className="flex items-center justify-between mb-6 pb-4 border-b border-blue-50">
                            <div className="flex items-center gap-4">
                                <span className="material-symbols-outlined text-blue-900">account_balance_wallet</span>
                                <h3 className="text-[10px] font-black text-blue-900 uppercase tracking-[0.2em]">Refund Wallet</h3>
                            </div>
                        </div>

                        {!isEditingWallet ? (
                            <div className="flex flex-col items-center">
                                <span className="text-3xl font-black text-blue-900">${(user.walletBalance || 0).toFixed(2)}</span>
                                <button
                                    onClick={() => {
                                        setWalletAmount((user.walletBalance || 0).toString());
                                        setIsEditingWallet(true);
                                    }}
                                    className="mt-6 w-full py-3 bg-blue-50 text-blue-900 text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-100 transition-all"
                                >
                                    Adjust Balance
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-4">
                                <div>
                                    <label className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-2 block">New Balance (USD)</label>
                                    <input
                                        type="number"
                                        value={walletAmount}
                                        onChange={(e) => setWalletAmount(e.target.value)}
                                        className="w-full px-4 py-3 bg-blue-50 rounded-xl text-blue-900 font-bold border-none outline-none"
                                        placeholder="0.00"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleUpdateWallet}
                                        disabled={isUpdatingWallet}
                                        className="flex-1 py-3 bg-blue-900 text-white text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-black transition-all disabled:opacity-50"
                                    >
                                        Save
                                    </button>
                                    <button
                                        onClick={() => setIsEditingWallet(false)}
                                        className="flex-1 py-3 bg-white text-blue-400 border border-blue-100 text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-50 transition-all"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Subsidy Card */}
                    <div className="bg-white p-10 rounded-[2.5rem] border border-blue-100 shadow-2xl shadow-blue-900/5">
                        <div className="flex items-center justify-between mb-6 pb-4 border-b border-blue-50">
                            <div className="flex items-center gap-4">
                                <span className="material-symbols-outlined text-blue-900">percent</span>
                                <h3 className="text-[10px] font-black text-blue-900 uppercase tracking-[0.2em]">Subsidy Percentage</h3>
                            </div>
                        </div>

                        {!isEditingSubsidy ? (
                            <div className="flex flex-col items-center">
                                <span className="text-3xl font-black text-blue-900">{user.subsidyPercentage || 0}%</span>
                                <button
                                    onClick={() => {
                                        setSubsidyValue((user.subsidyPercentage || 0).toString());
                                        setIsEditingSubsidy(true);
                                    }}
                                    className="mt-6 w-full py-3 bg-blue-50 text-blue-900 text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-100 transition-all"
                                >
                                    Adjust Subsidy
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-4">
                                <div>
                                    <label className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-2 block">New Percentage (0-100)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={subsidyValue}
                                        onChange={(e) => setSubsidyValue(e.target.value)}
                                        className="w-full px-4 py-3 bg-blue-50 rounded-xl text-blue-900 font-bold border-none outline-none"
                                        placeholder="0"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleUpdateSubsidy}
                                        disabled={isUpdatingSubsidy}
                                        className="flex-1 py-3 bg-blue-900 text-white text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-black transition-all disabled:opacity-50"
                                    >
                                        Save
                                    </button>
                                    <button
                                        onClick={() => setIsEditingSubsidy(false)}
                                        className="flex-1 py-3 bg-white text-blue-400 border border-blue-100 text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-50 transition-all"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* LMS Access Management */}
                    <LmsAccessPanel
                        applicantId={id as string}
                        initialUsername={user.avelingUsername}
                        initialPassword={user.avelingPassword}
                        onUpdated={refetchUser}
                    />

                    <AvelingInvoicesPanel applicantId={id as string} />

                </div>

                {/* Extended Biodata */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Identity Details */}
                    <div className="bg-white p-10 rounded-[2.5rem] border border-blue-100 shadow-2xl shadow-blue-900/5">
                        <div className="flex items-center gap-4 mb-10 pb-4 border-b border-blue-50">
                            <span className="material-symbols-outlined text-blue-900">badge</span>
                            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-900">Personal Information</h2>
                        </div>

                        <div className="grid grid-cols-2 gap-x-8 gap-y-10">
                            <DataItem label="Nationality" value={user.nationality} />
                            <DataItem label="Gender" value={user.gender} />
                            <DataItem label="Date of Birth" value={user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : 'N/A'} />
                        </div>
                    </div>

                    {/* Residential Details */}
                    <div className="bg-white p-10 rounded-[2.5rem] border border-blue-100 shadow-2xl shadow-blue-900/5">
                        <div className="flex items-center gap-4 mb-10 pb-4 border-b border-blue-50">
                            <span className="material-symbols-outlined text-blue-900">location_on</span>
                            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-900">Location & Residence</h2>
                        </div>

                        <div className="grid grid-cols-2 gap-x-8 gap-y-10">
                            <div className="col-span-2">
                                <DataItem label="Principal Residence Address" value={user.address} />
                            </div>
                            <DataItem label="City" value={user.city} />
                            <DataItem label="State / Province" value={user.state} />
                            <DataItem label="Country" value={user.country} />
                            <DataItem label="Postal Code" value={user.zipCode} />
                        </div>
                    </div>

                    {/* Documentation Summary */}
                    {!user.cvUrl && (
                        <div className="p-10 rounded-[2.5rem] bg-amber-50 border-2 border-dashed border-amber-200 text-center">
                            <span className="material-symbols-outlined text-amber-500 mb-2">warning</span>
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-700">Missing Information</h3>
                            <p className="text-[11px] font-bold text-amber-600 mt-1 uppercase">No resume has been uploaded to this profile.</p>
                        </div>
                    )}

                    {/* Tickets Overview */}
                    <div className="bg-white p-10 rounded-[2.5rem] border border-blue-100 shadow-2xl shadow-blue-900/5">
                        <div className="flex items-center justify-between mb-10 pb-4 border-b border-blue-50">
                            <div className="flex items-center gap-4">
                                <span className="material-symbols-outlined text-blue-900">confirmation_number</span>
                                <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-900">Tickets & Certifications</h2>
                            </div>
                            <button
                                onClick={() => setIsAddingTicket(!isAddingTicket)}
                                className="bg-blue-50 text-blue-900 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-blue-100 transition-all flex items-center gap-2"
                            >
                                <span className="material-symbols-outlined text-sm">{isAddingTicket ? 'close' : 'add'}</span>
                                {isAddingTicket ? 'Cancel' : 'Add Ticket'}
                            </button>
                        </div>

                        {isAddingTicket && (
                            <div className="mb-8 p-6 bg-blue-50/50 rounded-2xl border border-blue-100 flex flex-col gap-4">
                                <div>
                                    <label className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-2 block">Ticket / Certification Name</label>
                                    <input
                                        type="text"
                                        value={newTicketType}
                                        onChange={(e) => setNewTicketType(e.target.value)}
                                        className="w-full px-4 py-3 bg-white rounded-xl text-blue-900 font-bold border-none outline-none shadow-inner"
                                        placeholder="e.g. Working at Heights"
                                    />
                                </div>
                                <div>
                                    <label className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-2 block">Status</label>
                                    <select
                                        value={newTicketStatus}
                                        onChange={(e) => setNewTicketStatus(e.target.value)}
                                        className="w-full px-4 py-3 bg-white rounded-xl text-blue-900 font-bold border-none outline-none shadow-inner"
                                    >
                                        <option value="not_possessed">Not Possessed (Needs Training)</option>
                                        <option value="possessed">Already Possessed</option>
                                    </select>
                                </div>
                                <button
                                    onClick={handleAddTicket}
                                    disabled={isSubmittingTicket}
                                    className="w-full py-3 bg-blue-900 text-white text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-black transition-all disabled:opacity-50 mt-2"
                                >
                                    {isSubmittingTicket ? 'Adding...' : 'Confirm & Add Ticket'}
                                </button>
                            </div>
                        )}

                        <div className="space-y-6">
                            {user.Tickets && user.Tickets.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {user.Tickets.map((ticket: any) => (
                                        <div key={ticket.id} className="p-4 border rounded-2xl flex flex-col gap-2 relative overflow-hidden group">
                                            <div className="flex items-center justify-between">
                                                <h4 className="font-black text-sm uppercase text-blue-900 pr-8">{ticket.ticketType}</h4>
                                                <div className="flex flex-col items-end gap-2">
                                                    <span className={`px-2 py-1 text-[8px] font-black uppercase tracking-widest rounded ${ticket.status === 'possessed' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                                                        {ticket.status === 'possessed' ? 'Possessed' : 'Not Possessed'}
                                                    </span>
                                                </div>
                                            </div>
                                            {ticket.status === 'possessed' && ticket.ticketNumber && (
                                                <p className="text-xs font-bold text-blue-400"># {ticket.ticketNumber}</p>
                                            )}
                                            <button
                                                onClick={() => handleRemoveTicket(ticket.id)}
                                                disabled={isDeletingTicket === ticket.id}
                                                className="absolute top-2 right-2 p-1.5 bg-red-50 text-red-600 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white disabled:opacity-50"
                                                title="Remove Ticket"
                                            >
                                                <span className="material-symbols-outlined text-sm">delete</span>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-[10px] font-bold uppercase tracking-widest text-blue-400 text-center py-4">No tickets recorded for this applicant.</p>
                            )}
                        </div>
                    </div>

                    {/* Application History - Active Applications */}
                    <div className="bg-white p-10 rounded-[2.5rem] border border-blue-100 shadow-2xl shadow-blue-900/5">
                        <div className="flex items-center gap-4 mb-10 pb-4 border-b border-blue-50">
                            <span className="material-symbols-outlined text-blue-900">analytics</span>
                            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-900">Application History</h2>
                        </div>

                        {isAppsLoading ? (
                            <div className="p-12 text-center text-[10px] font-bold uppercase tracking-widest text-blue-400">Loading Applications...</div>
                        ) : applications.length === 0 ? (
                            <div className="p-12 text-center bg-blue-50 rounded-3xl">
                                <p className="text-[9px] font-black uppercase tracking-widest text-blue-400">No application history found.</p>
                            </div>
                        ) : (
                            <div className="space-y-12">
                                {applications.map((app) => (
                                    <div key={app.id} className="space-y-8 p-10 bg-blue-50/30 rounded-[2.5rem] border border-blue-100/50">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="text-xl font-black italic uppercase tracking-tight text-blue-900">{app.JobListing?.title}</h3>
                                                <div className="flex items-center gap-3 mt-2">
                                                    <span className={`px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest ${app.status === 'COMPLETED' ? 'bg-green-500 text-white' : 'bg-blue-900 text-white'}`}>
                                                        {app.status}
                                                    </span>

                                                </div>
                                            </div>
                                            <Link
                                                href={`/admin/jobs/${app.jobId}`}
                                                className="text-[9px] font-black uppercase tracking-widest text-blue-400 hover:text-blue-900 flex items-center gap-1"
                                            >
                                                View Job Details
                                                <span className="material-symbols-outlined text-xs">arrow_forward</span>
                                            </Link>
                                        </div>

                                        <ApplicationStageManager
                                            applicationId={app.id}
                                            initialStages={app.JobStages}
                                            onRefresh={refetchApps}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
