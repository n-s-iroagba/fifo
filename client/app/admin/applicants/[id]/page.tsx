'use client';

import { useApiQuery } from '@/lib/hooks';
import api from '@/lib/api';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ApplicationStageManager } from '@/components/admin/ApplicationStageManager';
import { LmsAccessPanel } from '@/components/admin/LmsAccessPanel';
import { Application } from '@/types/models';

export default function AdminApplicantDetailPage() {
    const { id } = useParams();
    const { data: userData, isLoading } = useApiQuery<any>(['admin', 'applicants', id], `/admin/users/${id}`);
    const { data: appsData, isLoading: isAppsLoading, refetch: refetchApps } = useApiQuery<{ rows: Application[] }>(['admin', 'applicants', id, 'applications'], `/admin/applications?userId=${id}`);
    const user = userData?.user;
    const applications = appsData?.rows || [];

    if (isLoading) return <div className="p-12 text-center text-[10px] font-bold uppercase tracking-widest text-blue-400">Loading Applicant Profile...</div>;
    if (!user) return <div className="p-12 text-center text-[10px] font-bold uppercase tracking-widest text-red-500">Applicant Record Not Found</div>;

    const DataItem = ({ label, value }: { label: string, value: string | null | undefined }) => (
        <div className="space-y-1">
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-400">{label}</span>
            <p className="text-sm font-bold text-blue-900">{value || 'Not Disclosed'}</p>
        </div>
    );

    const handleSendManualMail = async (type: 'welcome' | 'eoi') => {
        try {
            const res = await api.post(`/admin/users/${id}/${type}-mail`);
            if (res.status === 200) {
                alert(`${type.toUpperCase()} mail sent successfully.`);
            } else {
                alert(`Failed to send ${type} mail.`);
            }
        } catch (e: any) {
            alert(e.response?.data?.error || `Network error while sending ${type} mail.`);
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
                    <button
                        onClick={() => handleSendManualMail('welcome')}
                        className="bg-emerald-50 text-emerald-700 border-2 border-emerald-100 px-6 py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all active:scale-95 flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-base">handshake</span>
                        Send Welcome
                    </button>
                    <button
                        onClick={() => handleSendManualMail('eoi')}
                        className="bg-amber-50 text-amber-700 border-2 border-amber-100 px-6 py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-amber-600 hover:text-white hover:border-amber-600 transition-all active:scale-95 flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-base">verified</span>
                        Send EOI
                    </button>
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
                        <span className="mt-2 px-3 py-1 bg-blue-50 text-blue-400 rounded-lg text-[9px] font-black uppercase tracking-widest">APPLICANT STATUS: VERIFIED</span>

                        <div className="w-full mt-10 pt-10 border-t border-blue-50 grid grid-cols-1 gap-6">
                            <DataItem label="Email Address" value={user.email} />
                            <DataItem label="Primary Phone" value={user.phoneNumber} />
                        </div>
                    </div>

                    {/* LMS Access Management */}
                    <LmsAccessPanel applicantId={id as string} />

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
