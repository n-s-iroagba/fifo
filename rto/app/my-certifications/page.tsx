'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Award, AlertTriangle, CheckCircle2, Clock, ArrowRight, ShieldCheck, Download, X, Calendar } from 'lucide-react';
import { apiClient } from '@/lib/axios';
import { PageShell } from '@/components/PageShell';

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
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6">
                <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ED9139]/10 text-[#ED9139] font-bold text-xs uppercase tracking-wider w-fit mb-2">
                        <ShieldCheck className="h-3.5 w-3.5" /> Official Certification Records
                    </div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Statements of Attainment</h1>
                    <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1 max-w-2xl">
                        Monitor required ticket units for high-risk work and mining compliance. Validated units are synchronised with your recruiter placement file.
                    </p>
                </div>
                <Link
                    href="/catalog"
                    className="inline-flex items-center gap-2 bg-[#ED9139] hover:bg-[#dd7f26] text-[#0f172a] px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm transition-all"
                >
                    Browse Units Catalog <ArrowRight className="h-4 w-4" />
                </Link>
            </div>
            <div className="w-full h-0.5 bg-[#ED9139] mb-8" />

            {/* Expiry warning */}
            {expiredGaps.length > 0 && (
                <div className="flex items-start gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 mb-6 shadow-sm">
                    <AlertTriangle className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
                    <div>
                        <p className="font-bold text-amber-900 text-xs sm:text-sm">
                            Attention: {expiredGaps.length} expired ticket unit(s) require renewal for site clearance.
                        </p>
                        <p className="text-xs text-amber-700 mt-0.5">
                            Mobilisation clearance cannot proceed until all regulatory tickets reflect active status.
                        </p>
                    </div>
                </div>
            )}

            {/* Summary Stats */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-8">
                {[
                    { label: 'Attained Units', count: validCerts.length, sub: 'Verified for site pass', icon: CheckCircle2, color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
                    { label: 'Outstanding Gaps', count: missingGaps.length, sub: 'Study & exam required', icon: AlertTriangle, color: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200' },
                    { label: 'Expired Tickets', count: expiredGaps.length, sub: 'Refresher unit needed', icon: Clock, color: 'text-amber-800', bg: 'bg-amber-50', border: 'border-amber-200' },
                ].map(({ label, count, sub, icon: Icon, color, bg, border }) => (
                    <div key={label} className={`bg-white rounded-2xl border ${border} p-5 shadow-sm`}>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</span>
                            <div className={`rounded-lg ${bg} p-2 ${color}`}><Icon className="h-4 w-4" /></div>
                        </div>
                        <p className={`text-3xl font-black ${color}`}>{count}</p>
                        <p className={`mt-1 text-xs font-semibold ${color}`}>{sub}</p>
                    </div>
                ))}
            </div>

            {/* Certs Grid */}
            <div className="space-y-4">
                <h2 className="text-lg font-bold text-slate-900">Assigned Units of Competency</h2>
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 space-y-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-[#ED9139]" />
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest animate-pulse">
                            Loading official records...
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {certificates.map((cert) => {
                            const isValid = cert.status === 'VALID';
                            const isMissing = cert.status === 'MISSING';
                            return (
                                <div
                                    key={cert.id}
                                    className={`relative flex flex-col justify-between rounded-2xl border p-5 shadow-sm transition-all ${
                                        isValid 
                                            ? 'border-emerald-200 bg-emerald-50/20' 
                                            : isMissing 
                                            ? 'border-rose-200 bg-rose-50/20' 
                                            : 'border-amber-200 bg-amber-50/20'
                                    }`}
                                >
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-mono text-xs font-bold text-slate-500 uppercase">{cert.code}</span>
                                            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ${
                                                isValid 
                                                    ? 'bg-emerald-100 text-emerald-800' 
                                                    : isMissing 
                                                    ? 'bg-rose-100 text-rose-800' 
                                                    : 'bg-amber-100 text-amber-800'
                                            }`}>
                                                {isValid && <CheckCircle2 className="h-3 w-3" />}
                                                {isMissing && <AlertTriangle className="h-3 w-3" />}
                                                {cert.status}
                                            </span>
                                        </div>
                                        <h3 className="text-base font-bold text-slate-900">{cert.certName}</h3>
                                        {isValid ? (
                                            <div className="mt-2.5 space-y-1 text-xs text-slate-600">
                                                <p className="flex items-center gap-1">
                                                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                                                    Ticket #: <span className="font-mono font-bold text-slate-900">{cert.certificateNumber}</span>
                                                </p>
                                                <p className="flex items-center gap-1">
                                                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                                                    Expires: {cert.expiresAt || 'Indefinite (VOC Periodic)'}
                                                </p>
                                            </div>
                                        ) : (
                                            <p className="mt-2 text-xs text-slate-500">
                                                Required by Australian site safety regulations prior to deployment.
                                            </p>
                                        )}
                                    </div>
                                    <div className="mt-4 pt-3 border-t border-slate-200/70 flex items-center justify-between">
                                        {isValid ? (
                                            <button
                                                onClick={() => setSelectedCert(cert)}
                                                className="inline-flex items-center gap-1 text-xs font-bold text-[#0f172a] hover:text-[#ED9139] transition-colors"
                                            >
                                                View Digital Statement →
                                            </button>
                                        ) : (
                                            <Link
                                                href={`/catalog?cert=${cert.code}`}
                                                className="inline-flex items-center gap-1.5 rounded-xl bg-[#0f172a] hover:bg-slate-800 px-3.5 py-2 text-xs font-bold text-white transition-all uppercase tracking-wider"
                                            >
                                                Start Unit <ArrowRight className="h-3.5 w-3.5" />
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
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
                    <div className="w-full max-w-lg rounded-2xl bg-white p-7 shadow-2xl border border-slate-200 relative space-y-5">
                        <button
                            onClick={() => setSelectedCert(null)}
                            className="absolute top-4 right-4 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all"
                        >
                            <X className="h-5 w-5" />
                        </button>
                        <div className="text-center space-y-1.5">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#ED9139]/10 text-[#ED9139]">
                                <Award className="h-6 w-6" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-900">Statement of Attainment</h2>
                            <p className="text-[11px] uppercase tracking-widest font-bold text-slate-400">
                                CertHero RTO Training Services — Accredited Partner
                            </p>
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                            <div>
                                <span className="text-[10px] uppercase font-bold text-slate-400">Unit of Competency</span>
                                <p className="text-sm font-bold text-slate-900">{selectedCert.certName}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-3 text-xs">
                                <div>
                                    <span className="text-[10px] uppercase font-bold text-slate-400">Ticket Number</span>
                                    <p className="font-mono font-bold text-emerald-700">{selectedCert.certificateNumber}</p>
                                </div>
                                <div>
                                    <span className="text-[10px] uppercase font-bold text-slate-400">Status</span>
                                    <p className="font-bold text-emerald-700 flex items-center gap-1">
                                        <CheckCircle2 className="h-3 w-3" /> VERIFIED VALID
                                    </p>
                                </div>
                                <div>
                                    <span className="text-[10px] uppercase font-bold text-slate-400">Issue Date</span>
                                    <p className="font-medium text-slate-700">{selectedCert.issuedAt || '—'}</p>
                                </div>
                                <div>
                                    <span className="text-[10px] uppercase font-bold text-slate-400">Expiry Date</span>
                                    <p className="font-medium text-slate-700">{selectedCert.expiresAt || 'Indefinite'}</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center justify-between pt-1">
                            <p className="text-[11px] text-slate-400">Nationally Recognised Training (NRT)</p>
                            <button
                                onClick={() => alert('Certificate document ready for download.')}
                                className="inline-flex items-center gap-1.5 rounded-xl bg-[#0f172a] hover:bg-slate-800 px-4 py-2 text-xs font-bold text-white transition-all uppercase tracking-wider"
                            >
                                <Download className="h-3.5 w-3.5" /> Download PDF
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </PageShell>
    );
}
