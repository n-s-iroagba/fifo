'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Award, AlertTriangle, CheckCircle2, Clock, ArrowRight, ShieldCheck, Download, X, Calendar } from 'lucide-react';
import { apiClient } from '../../lib/axios';
import { PageShell } from '../../components/PageShell';

interface CertGap {
    id: string; certName: string; code: string;
    status: 'VALID' | 'MISSING' | 'EXPIRED';
    expiresAt?: string; issuedAt?: string; certificateNumber?: string; courseId?: string;
}

export default function MyCertificationsPage() {
    const [loading, setLoading] = useState(true);
    const [certificates, setCertificates] = useState<CertGap[]>([]);
    const [selectedCert, setSelectedCert] = useState<CertGap | null>(null);

    useEffect(() => {
        apiClient.get('/certificates/learner/me')
            .then(res => { if (res.data?.success) setCertificates(res.data.data); })
            .catch(() => setCertificates([]))
            .finally(() => setLoading(false));
    }, []);

    const missingGaps = certificates.filter(c => c.status === 'MISSING');
    const expiredGaps = certificates.filter(c => c.status === 'EXPIRED');
    const validCerts = certificates.filter(c => c.status === 'VALID');

    return (
        <PageShell>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFC700] text-black font-extrabold text-xs uppercase tracking-wider w-fit mb-3">
                        <Award className="h-3.5 w-3.5" /> Certification Management
                    </div>
                    <h1 className="text-4xl font-black text-zinc-900 tracking-tight">My Compliance Status</h1>
                    <p className="text-sm font-medium text-zinc-500 mt-2">Track required tickets for FIFO deployment and resolve gaps to maintain site clearance.</p>
                </div>
                <Link href="/catalog" className="inline-flex items-center gap-2 bg-[#FFC700] text-black px-5 py-3 rounded-xl text-xs font-extrabold uppercase tracking-wider shadow-md hover:bg-yellow-400 transition-all">
                    Browse Gap Courses <ArrowRight className="h-4 w-4" />
                </Link>
            </div>
            <div className="w-full h-0.5 bg-[#FFC700] mb-10" />

            {/* Expiry warning */}
            {expiredGaps.length > 0 && (
                <div className="flex items-start gap-4 rounded-2xl border-2 border-amber-300 bg-amber-50 p-5 mb-8 shadow-sm">
                    <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                        <p className="font-extrabold text-amber-900 text-sm">Attention: {expiredGaps.length} expired ticket(s) required for FIFO site clearance.</p>
                        <p className="text-xs text-amber-700 mt-1">Recruiters cannot confirm your site mobilizations until all expired tickets are renewed.</p>
                    </div>
                </div>
            )}

            {/* Summary Stats */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-10">
                {[
                    { label: 'Valid Tickets', count: validCerts.length, sub: 'Ready for deployment', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
                    { label: 'Missing Gaps', count: missingGaps.length, sub: 'Action required', icon: AlertTriangle, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200' },
                    { label: 'Expired Tickets', count: expiredGaps.length, sub: 'Refresher needed', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
                ].map(({ label, count, sub, icon: Icon, color, bg, border }) => (
                    <div key={label} className={`bg-white rounded-2xl border-2 ${border} p-6 shadow-sm`}>
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-extrabold uppercase tracking-wider text-zinc-500">{label}</span>
                            <div className={`rounded-xl ${bg} p-2 ${color}`}><Icon className="h-5 w-5" /></div>
                        </div>
                        <p className={`text-4xl font-black ${color}`}>{count}</p>
                        <p className={`mt-1 text-xs font-bold ${color}`}>{sub}</p>
                    </div>
                ))}
            </div>

            {/* Certs Grid */}
            <div className="space-y-5">
                <h2 className="text-xl font-black text-zinc-900">Assigned Role Certification Requirements</h2>
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 space-y-5">
                        <div className="animate-spin rounded-full h-14 w-14 border-4 border-zinc-200 border-t-[#FFC700]" />
                        <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest animate-pulse">Loading certifications...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {certificates.map((cert) => {
                            const isValid = cert.status === 'VALID';
                            const isMissing = cert.status === 'MISSING';
                            return (
                                <div key={cert.id} className={`relative flex flex-col justify-between rounded-2xl border-2 p-5 shadow-sm transition-all ${isValid ? 'border-emerald-200 bg-emerald-50/30' : isMissing ? 'border-rose-200 bg-rose-50/20' : 'border-amber-200 bg-amber-50/20'}`}>
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-mono text-xs font-bold text-zinc-400 uppercase">{cert.code}</span>
                                            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-extrabold uppercase tracking-wider ${isValid ? 'bg-emerald-900 text-white' : isMissing ? 'bg-rose-900 text-white' : 'bg-amber-600 text-white'}`}>
                                                {isValid && <CheckCircle2 className="h-3 w-3" />}
                                                {isMissing && <AlertTriangle className="h-3 w-3" />}
                                                {cert.status}
                                            </span>
                                        </div>
                                        <h3 className="text-base font-extrabold text-zinc-900">{cert.certName}</h3>
                                        {isValid ? (
                                            <div className="mt-3 space-y-1 text-xs text-zinc-600">
                                                <p className="flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Ticket #: <span className="font-mono font-bold text-zinc-800">{cert.certificateNumber}</span></p>
                                                <p className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5 text-zinc-400" /> Expires: {cert.expiresAt}</p>
                                            </div>
                                        ) : (
                                            <p className="mt-2 text-xs text-zinc-500">Required by site safety regulations before deployment.</p>
                                        )}
                                    </div>
                                    <div className="mt-5 pt-4 border-t border-zinc-200/60 flex items-center justify-between">
                                        {isValid ? (
                                            <button onClick={() => setSelectedCert(cert)} className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800">
                                                View Digital Ticket →
                                            </button>
                                        ) : (
                                            <Link href={`/catalog?cert=${cert.code}`} className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-900 px-4 py-2 text-xs font-extrabold text-white hover:bg-black shadow-sm transition-all uppercase tracking-wider">
                                                Resolve & Enroll <ArrowRight className="h-3.5 w-3.5" />
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Cert Modal */}
            {selectedCert && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                    <div className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-2xl border-2 border-[#FFC700] relative space-y-6">
                        <button onClick={() => setSelectedCert(null)} className="absolute top-4 right-4 rounded-full p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition-all">
                            <X className="h-5 w-5" />
                        </button>
                        <div className="text-center space-y-2">
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFC700] text-black"><Award className="h-8 w-8" /></div>
                            <h2 className="text-2xl font-black text-zinc-900">Statement of Attainment</h2>
                            <p className="text-xs uppercase tracking-widest font-bold text-zinc-400">Aveling Training Academy — Accredited RTO</p>
                        </div>
                        <div className="rounded-2xl border-2 border-zinc-200 bg-zinc-50 p-5 space-y-4">
                            <div><span className="text-[10px] uppercase font-bold text-zinc-400">Unit of Competency</span><p className="text-base font-extrabold text-zinc-900">{selectedCert.certName}</p></div>
                            <div className="grid grid-cols-2 gap-4 text-xs">
                                <div><span className="text-[10px] uppercase font-bold text-zinc-400">Ticket Number</span><p className="font-mono font-black text-emerald-600">{selectedCert.certificateNumber}</p></div>
                                <div><span className="text-[10px] uppercase font-bold text-zinc-400">Status</span><p className="font-extrabold text-emerald-600 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> VERIFIED VALID</p></div>
                                <div><span className="text-[10px] uppercase font-bold text-zinc-400">Issue Date</span><p className="font-medium text-zinc-700">{selectedCert.issuedAt || '—'}</p></div>
                                <div><span className="text-[10px] uppercase font-bold text-zinc-400">Expiry Date</span><p className="font-medium text-zinc-700">{selectedCert.expiresAt}</p></div>
                            </div>
                        </div>
                        <div className="flex items-center justify-between pt-2">
                            <p className="text-[11px] text-zinc-400">Synced with FIFO Recruiter Placement Engine</p>
                            <button onClick={() => alert('Certificate downloaded as PDF')} className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 text-xs font-extrabold text-[#FFC700] hover:bg-black transition-all uppercase tracking-wider">
                                <Download className="h-3.5 w-3.5" /> Download PDF
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </PageShell>
    );
}
