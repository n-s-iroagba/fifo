'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
    Key,
    Send,
    CheckCircle2,
    User as UserIcon,
    RefreshCw,
    ShieldCheck,
    Eye,
    EyeOff,
    Copy,
    Check,
    Mail,
    AlertCircle,
    Sparkles,
    Lock,
    ExternalLink,
    Clock,
    Award
} from 'lucide-react';
import api from '@/lib/api';

interface Applicant {
    id: number;
    fullName: string;
    email: string;
    candidateNumber?: string;
    avelingUsername?: string | null;
    avelingPassword?: string | null;
    role?: string;
}

export default function AdminCredentialsPage() {
    const [applicants, setApplicants] = useState<Applicant[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    // Active selection & editing state
    const [selectedUserId, setSelectedUserId] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(true);
    const [copiedField, setCopiedField] = useState<string | null>(null);

    const fetchApplicants = async () => {
        try {
            const res = await api.get('/admin/users');
            const list = res.data?.rows || res.data?.users || (Array.isArray(res.data) ? res.data : []);
            // Filter to applicants only
            const filtered = list.filter((u: any) => u.role !== 'ADMIN');
            setApplicants(filtered);
        } catch (e) {
            console.error('Failed to fetch applicants:', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApplicants();
    }, []);

    const selectedUser = useMemo(() => {
        return applicants.find(a => a.id.toString() === selectedUserId) || null;
    }, [applicants, selectedUserId]);

    // When applicant changes, populate inputs
    useEffect(() => {
        if (selectedUser) {
            setUsername(selectedUser.avelingUsername || '');
            setPassword(selectedUser.avelingPassword || '');
            setSuccessMsg('');
            setErrorMsg('');
        }
    }, [selectedUser]);

    const handleSelectApplicant = (idStr: string) => {
        setSelectedUserId(idStr);
    };

    const handleAutoGenerate = () => {
        if (!selectedUser) {
            setErrorMsg('Please select an applicant first to auto-generate credentials.');
            return;
        }
        const names = (selectedUser.fullName || 'User').trim().split(' ');
        const first = (names[0] || 'App').replace(/[^a-zA-Z]/g, '').slice(0, 3).toUpperCase();
        const last = (names[names.length - 1] || 'User').replace(/[^a-zA-Z]/g, '').slice(0, 3).toUpperCase();
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        const generatedUser = `AV-${first}${last}${randomNum}`;
        const generatedPass = `Av!${Math.random().toString(36).slice(-8)}`;

        setUsername(generatedUser);
        setPassword(generatedPass);
    };

    const handleSaveAndSend = async (sendEmail: boolean = true) => {
        if (!selectedUser) {
            setErrorMsg('Please select an applicant.');
            return;
        }
        if (!username || !password) {
            setErrorMsg('Both username and password are required.');
            return;
        }

        setSaving(true);
        setSuccessMsg('');
        setErrorMsg('');

        try {
            const res = await api.put(`/admin/users/${selectedUser.id}/aveling-credentials`, {
                avelingUsername: username.trim(),
                avelingPassword: password.trim(),
                sendEmail
            });

            const isDispatched = res.data?.emailDispatched;
            if (isDispatched) {
                setSuccessMsg(`Credentials saved in database and officially dispatched via Aveling mail to ${selectedUser.email}!`);
            } else {
                setSuccessMsg(`Credentials successfully saved in database for ${selectedUser.fullName}.`);
            }

            await fetchApplicants();
        } catch (err: any) {
            console.error('Failed to save credentials:', err);
            setErrorMsg(err.response?.data?.message || err.response?.data?.error || 'Failed to save credentials.');
        } finally {
            setSaving(false);
        }
    };

    const copyToClipboard = (text: string, field: string) => {
        navigator.clipboard.writeText(text);
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000);
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center font-bold text-zinc-400 uppercase tracking-widest text-xs gap-3">
                <RefreshCw className="h-4 w-4 animate-spin text-[#FFC700]" />
                Loading Aveling Credentials Module...
            </div>
        );
    }

    const avelingLoginUrl = 'https://aveling.online/login';

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 font-sans">
            {/* Header */}
            <div className="border-b-2 border-zinc-200 pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-zinc-900 flex items-center gap-3">
                        <Key className="h-8 w-8 text-[#FFC700]" />
                        Aveling LMS Credentials Management
                    </h1>
                    <p className="mt-1 text-sm font-medium text-zinc-500">
                        Create, store, and dispatch official Aveling training portal credentials directly to candidates via Aveling mail.
                    </p>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-zinc-500 bg-zinc-100 px-3 py-1.5 rounded-lg border border-zinc-200 w-fit">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Aveling Mail Dispatcher Ready
                </div>
            </div>

            {/* Notification Banners */}
            {successMsg && (
                <div className="bg-emerald-50 border-2 border-emerald-200 p-4 rounded-xl flex items-start gap-3 animate-in fade-in">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-emerald-900 text-sm font-bold">{successMsg}</p>
                        <p className="text-emerald-700 text-xs mt-0.5">Candidate can now log into https://aveling.online/login with these credentials.</p>
                    </div>
                </div>
            )}

            {errorMsg && (
                <div className="bg-rose-50 border-2 border-rose-200 p-4 rounded-xl flex items-start gap-3 animate-in fade-in">
                    <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-rose-900 text-sm font-bold">{errorMsg}</p>
                    </div>
                </div>
            )}

            {/* Workflow Guidance & Business Rule Callout */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border-2 border-zinc-200 bg-white space-y-1">
                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-zinc-900">
                        <Key className="w-4 h-4 text-[#FFC700]" />
                        1. Create & Send
                    </div>
                    <p className="text-xs text-zinc-500">
                        Input or generate credentials. Hitting Send stores them in the DB and dispatches via Aveling mail.
                    </p>
                </div>
                <div className="p-4 rounded-xl border-2 border-zinc-200 bg-white space-y-1">
                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-zinc-900">
                        <Clock className="w-4 h-4 text-emerald-600" />
                        2. 15-Minute Exams
                    </div>
                    <p className="text-xs text-zinc-500">
                        Candidates have strictly 15 minutes per exam attempt. The exam countdown timer auto-submits on expiry.
                    </p>
                </div>
                <div className="p-4 rounded-xl border-2 border-zinc-200 bg-white space-y-1">
                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-zinc-900">
                        <Award className="w-4 h-4 text-blue-600" />
                        3. Grading & Milestones
                    </div>
                    <p className="text-xs text-zinc-500">
                        Attempt 1 is graded on merit; Attempt 2 is auto-pass at pass mark. Ticket 3 requires full balance payment.
                    </p>
                </div>
            </div>

            {/* Main Configuration Workspace & Live Email Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Credentials Form */}
                <div className="lg:col-span-6 bg-white border-2 border-zinc-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
                    <div className="border-b-2 border-zinc-100 pb-4 flex items-center justify-between">
                        <h2 className="text-sm font-black uppercase tracking-widest text-zinc-900 flex items-center gap-2">
                            <Lock className="h-4 w-4 text-zinc-400" />
                            Configure Credentials
                        </h2>
                        <span className="text-xs font-bold text-zinc-400">Step 1 &bull; Create & Save</span>
                    </div>

                    {/* Applicant Selector */}
                    <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-zinc-700 mb-2">
                            Select Candidate
                        </label>
                        <select
                            value={selectedUserId}
                            onChange={(e) => handleSelectApplicant(e.target.value)}
                            className="w-full bg-zinc-50 border-2 border-zinc-200 p-3.5 rounded-xl text-sm font-bold text-zinc-900 outline-none focus:border-[#FFC700] transition-all"
                        >
                            <option value="">-- Choose Candidate --</option>
                            {applicants.map(app => (
                                <option key={app.id} value={app.id}>
                                    {app.candidateNumber || `CND-${10000 + app.id}`} &bull; {app.fullName} ({app.email}) {app.avelingUsername ? '✓ Has Credentials' : '✗ No Credentials'}
                                </option>
                            ))}
                        </select>
                    </div>

                    {selectedUser ? (
                        <div className="space-y-4 pt-2">
                            <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl flex items-center justify-between text-xs">
                                <div>
                                    <span className="text-zinc-400 text-[10px] uppercase font-bold block">Selected Candidate:</span>
                                    <span className="font-bold text-zinc-900">{selectedUser.fullName}</span> &bull; <span className="text-zinc-500">{selectedUser.email}</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleAutoGenerate}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-black text-[#FFC700] text-[10px] font-black uppercase tracking-wider transition-all"
                                >
                                    <Sparkles className="w-3 h-3" /> Auto-Generate
                                </button>
                            </div>

                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-zinc-700 mb-2">
                                    Aveling Candidate ID / Username
                                </label>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="e.g. AV-JOH1092"
                                    className="w-full bg-zinc-50 border-2 border-zinc-200 p-3.5 rounded-xl text-sm font-bold font-mono text-zinc-900 outline-none focus:border-[#FFC700] transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-zinc-700 mb-2">
                                    Aveling Portal Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Enter secure password"
                                        className="w-full bg-zinc-50 border-2 border-zinc-200 p-3.5 pr-12 rounded-xl text-sm font-bold font-mono text-zinc-900 outline-none focus:border-[#FFC700] transition-all"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3.5 top-3.5 text-zinc-400 hover:text-zinc-700"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-zinc-100">
                                <button
                                    type="button"
                                    onClick={() => handleSaveAndSend(true)}
                                    disabled={saving || !username || !password}
                                    className="flex-1 inline-flex items-center justify-center gap-2 bg-[#FFC700] hover:bg-yellow-400 text-black font-black text-xs py-4 px-5 rounded-xl transition-all uppercase tracking-widest shadow-md disabled:opacity-50"
                                >
                                    {saving ? (
                                        <>
                                            <RefreshCw className="h-4 w-4 animate-spin" />
                                            Saving & Sending...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="h-4 w-4" />
                                            Save & Send via Aveling Mail
                                        </>
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleSaveAndSend(false)}
                                    disabled={saving || !username || !password}
                                    className="sm:w-auto inline-flex items-center justify-center gap-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold text-xs py-4 px-4 rounded-xl transition-all uppercase tracking-wider disabled:opacity-50"
                                >
                                    Save Only
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="p-12 text-center border-2 border-dashed border-zinc-200 rounded-xl">
                            <UserIcon className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
                            <p className="text-sm font-bold text-zinc-700">No Candidate Selected</p>
                            <p className="text-xs text-zinc-400 mt-1 max-w-xs mx-auto">
                                Select a candidate above or click an applicant from the ledger below to configure their Aveling LMS account.
                            </p>
                        </div>
                    )}
                </div>

                {/* Right Column: Live Aveling Email Preview */}
                <div className="lg:col-span-6 bg-white border-2 border-zinc-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
                    <div className="border-b-2 border-zinc-100 pb-4 flex items-center justify-between">
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-[#FFC700] bg-black px-2 py-0.5 rounded">
                                Dispatch Preview
                            </span>
                            <h2 className="text-sm font-black uppercase tracking-widest text-zinc-900 mt-1 flex items-center gap-2">
                                <Mail className="h-4 w-4 text-[#FFC700]" />
                                Aveling Official Email Copy
                            </h2>
                        </div>
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                            Server: info@jobnexe.com
                        </span>
                    </div>

                    {/* Email Card Simulation */}
                    <div className="border border-zinc-200 rounded-xl overflow-hidden shadow-sm bg-white">
                        {/* Aveling Gold Brand Banner */}
                        <div className="bg-[#FFC700] text-black p-5 text-center">
                            <p className="text-xs font-black uppercase tracking-[0.2em]">AVELING LMS TRAINING</p>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-800 mt-0.5">FIFO Worker Competency System</p>
                        </div>

                        <div className="p-6 space-y-4 text-xs text-zinc-700">
                            <p className="font-bold text-zinc-900 text-sm">
                                Dear {selectedUser?.fullName || '[Candidate Name]'},
                            </p>
                            <p>
                                Your official <strong>Aveling LMS Training Portal</strong> account has been configured. You can now log in, access your assigned competency tickets, review courseware modules, and sit for your online theory examinations.
                            </p>

                            <div className="bg-zinc-50 border-2 border-[#FFC700] p-4 rounded-xl space-y-2">
                                <span className="text-[10px] font-black uppercase tracking-widest text-black block mb-1">
                                    Your Login Credentials
                                </span>
                                <div className="space-y-1.5 font-mono text-xs">
                                    <div className="flex justify-between items-center">
                                        <span className="text-zinc-500 font-sans text-[11px]">Portal URL:</span>
                                        <a href={avelingLoginUrl} target="_blank" rel="noreferrer" className="text-blue-900 font-bold hover:underline flex items-center gap-1">
                                            {avelingLoginUrl} <ExternalLink className="w-3 h-3" />
                                        </a>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-zinc-500 font-sans text-[11px]">Candidate ID / User:</span>
                                        <span className="font-bold text-zinc-900 bg-zinc-200 px-2 py-0.5 rounded">
                                            {username || '[Pending Username]'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-zinc-500 font-sans text-[11px]">Password:</span>
                                        <span className="font-bold text-zinc-900 bg-zinc-200 px-2 py-0.5 rounded">
                                            {password || '[Pending Password]'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-[11px] text-amber-900 space-y-1">
                                <p className="font-bold flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5 text-amber-700" />
                                    Exam Protocol & Guidelines:
                                </p>
                                <p className="text-amber-800">
                                    Each theory assessment has a strict <strong>15-minute time limit</strong>. The first attempt is graded on submitted score; a second attempt is an automatic pass at the pass mark.
                                </p>
                            </div>

                            <div className="pt-2 text-center">
                                <div className="inline-block bg-[#FFC700] text-black font-black text-[11px] uppercase tracking-widest py-3 px-6 rounded-lg shadow-sm">
                                    Log In to Aveling LMS
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Candidates Credentials Ledger Table */}
            <div className="bg-white border-2 border-zinc-200 rounded-2xl p-8 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b-2 border-zinc-100 pb-4">
                    <div>
                        <h2 className="text-sm font-black uppercase tracking-widest text-zinc-900">
                            Candidate Credentials Ledger
                        </h2>
                        <p className="text-xs text-zinc-500 mt-0.5">
                            Real-time database status of Aveling credentials across all applicants.
                        </p>
                    </div>
                    <button
                        onClick={fetchApplicants}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-600 hover:text-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-50 transition-colors w-fit"
                    >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Refresh List
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-zinc-50 border-b-2 border-zinc-200">
                            <tr>
                                <th className="p-4 font-black uppercase tracking-widest text-[10px] text-zinc-500">Candidate</th>
                                <th className="p-4 font-black uppercase tracking-widest text-[10px] text-zinc-500">Email</th>
                                <th className="p-4 font-black uppercase tracking-widest text-[10px] text-zinc-500">Aveling Username</th>
                                <th className="p-4 font-black uppercase tracking-widest text-[10px] text-zinc-500">Password</th>
                                <th className="p-4 font-black uppercase tracking-widest text-[10px] text-zinc-500 text-center">Status</th>
                                <th className="p-4 font-black uppercase tracking-widest text-[10px] text-zinc-500 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                            {applicants.map((app) => {
                                const hasCreds = !!app.avelingUsername;
                                const isCurrent = selectedUserId === app.id.toString();
                                return (
                                    <tr key={app.id} className={`hover:bg-zinc-50/50 transition-colors ${isCurrent ? 'bg-amber-50/30' : ''}`}>
                                        <td className="p-4 font-bold text-zinc-900">
                                            <div className="flex items-center gap-2">
                                                <div className="bg-zinc-200 p-1.5 rounded-full">
                                                    <UserIcon className="w-3 h-3 text-zinc-600" />
                                                </div>
                                                <div>
                                                    <span>{app.fullName}</span>
                                                    <span className="block text-[10px] text-zinc-400 font-mono">
                                                        {app.candidateNumber || `CND-${10000 + app.id}`}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-zinc-600 text-xs font-mono">{app.email}</td>
                                        <td className="p-4 font-mono font-bold text-zinc-900 text-xs">
                                            {app.avelingUsername ? (
                                                <span className="bg-zinc-100 px-2 py-1 rounded text-zinc-900 select-all">
                                                    {app.avelingUsername}
                                                </span>
                                            ) : (
                                                <span className="text-zinc-400 italic text-xs">Not Created</span>
                                            )}
                                        </td>
                                        <td className="p-4 text-zinc-500 font-mono text-xs">
                                            {app.avelingPassword ? (
                                                <span className="bg-zinc-100 px-2 py-1 rounded text-zinc-800 select-all">
                                                    {app.avelingPassword}
                                                </span>
                                            ) : (
                                                <span className="text-zinc-400 italic text-xs">None</span>
                                            )}
                                        </td>
                                        <td className="p-4 text-center">
                                            {hasCreds ? (
                                                <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full">
                                                    <CheckCircle2 className="w-3 h-3" /> Configured
                                                </span>
                                            ) : (
                                                <span className="inline-flex text-[10px] font-black uppercase tracking-widest bg-zinc-100 text-zinc-500 px-2.5 py-1 rounded-full">
                                                    Pending
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4 text-right">
                                            <button
                                                type="button"
                                                onClick={() => handleSelectApplicant(app.id.toString())}
                                                className={`px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-widest transition-all ${
                                                    isCurrent
                                                        ? 'bg-zinc-900 text-[#FFC700]'
                                                        : 'bg-white border-2 border-zinc-200 text-zinc-700 hover:bg-zinc-50'
                                                }`}
                                            >
                                                {isCurrent ? 'Editing' : 'Manage & Send'}
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
