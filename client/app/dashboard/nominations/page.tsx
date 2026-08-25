'use client';

import React, { useState } from 'react';
import { useApiQuery, useApiMutation } from '@/lib/hooks';
import { uploadFile } from '@/lib/utils';

export default function NominationsPage() {
    const { data: appsRes, isLoading: loadingApps } = useApiQuery<any>(
        ['applications'],
        '/applications'
    );
    const application = appsRes?.rows?.[0];
    const appId = application?.id;

    const { data: nominations = [], isLoading: loadingNoms, refetch } = useApiQuery<any[]>(
        ['nominations', appId],
        `/applications/${appId}/nominations`,
        { enabled: !!appId }
    );

    const { mutateAsync: selectNomination } = useApiMutation<any, any>('put', `/applications/${appId}/nominations/:nominationId/select`);
    const { mutateAsync: uploadDocument, isPending: isUploading } = useApiMutation<any, any>('post', `/applications/documents`);

    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const alreadyApproved = nominations.some((n: any) => n.status === 'approved' || n.isSelected);
    const underReview = nominations.some((n: any) => n.documentUrl);

    const handleCheckbox = (nominationId: number) => {
        if (alreadyApproved || underReview) return;
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(nominationId)) {
                next.delete(nominationId);
            } else {
                next.add(nominationId);
            }
            return next;
        });
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (selectedIds.size === 0 && !alreadyApproved && !underReview) {
            setError('Please check your selected nomination(s) before uploading the signed document.');
            return;
        }

        try {
            setError(null);
            setUploadSuccess(false);

            const uploadedUrl = await uploadFile(file, 'image');

            // Select nominations if they haven't been finalized yet
            if (!alreadyApproved && !underReview) {
                for (const nomId of Array.from(selectedIds)) {
                    await selectNomination({ params: { nominationId: nomId } });
                }
            }

            await uploadDocument({
                data: {
                    documentUrl: uploadedUrl,
                    documentType: 'Nomination Form',
                    applicationId: appId
                }
            });

            setUploadSuccess(true);
            setTimeout(() => setUploadSuccess(false), 6000);
            await refetch();
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to complete nomination process.');
        }
    };

    if (loadingApps || loadingNoms) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-900 rounded-full animate-spin" />
            </div>
        );
    }

    if (!application) {
        return (
            <div className="max-w-4xl mx-auto">
                <div className="bg-white p-12 rounded-[2rem] border border-blue-100 shadow-sm text-center">
                    <span className="material-symbols-outlined text-5xl text-blue-200 mb-4">person_off</span>
                    <p className="text-sm font-bold text-blue-900 uppercase tracking-widest">No active application found.</p>
                </div>
            </div>
        );
    }

    // Step 16: all nominations approved — no further changes allowed
    const isLocked = nominations.some((n: any) => n.status === 'approved' || n.isSelected);

    // Stage-driven banner
    const getStageInfo = () => {
        if (nominations.length === 0) return null;
        if (nominations.some((n: any) => n.status === 'approved'))
            return { label: 'Nomination Approved', color: 'emerald', icon: 'verified' };
        if (nominations.some((n: any) => n.documentUrl))
            return { label: 'Nomination Under Review', color: 'amber', icon: 'hourglass_top' };
        if (nominations.some((n: any) => n.isSelected))
            return { label: 'Nomination Selected – Awaiting Admin Approval', color: 'blue', icon: 'pending' };
        return { label: 'Action Required – Select & Upload', color: 'red', icon: 'priority_high' };
    };

    const stageInfo = getStageInfo();

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-blue-900 tracking-tight">My Nominations</h1>
                    <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mt-1">Review, select, and sign your trade options</p>
                </div>
                {stageInfo && (
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest
                        ${stageInfo.color === 'emerald' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                          stageInfo.color === 'amber' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                          stageInfo.color === 'red' ? 'bg-red-50 text-red-600 border border-red-100' :
                          'bg-blue-50 text-blue-700 border border-blue-100'}`}
                    >
                        <span className="material-symbols-outlined text-base">{stageInfo.icon}</span>
                        {stageInfo.label}
                    </div>
                )}
            </div>

            {/* Alerts */}
            {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-[11px] font-bold uppercase tracking-widest">
                    {error}
                </div>
            )}
            {uploadSuccess && (
                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-700 text-[11px] font-bold uppercase tracking-widest flex items-center gap-2">
                    <span className="material-symbols-outlined text-base">check_circle</span>
                    Signed document uploaded successfully! Your nomination is now under review.
                </div>
            )}

            {nominations.length === 0 ? (
                <div className="bg-white p-12 rounded-[2rem] border border-blue-100 shadow-sm text-center">
                    <span className="material-symbols-outlined text-blue-200 text-6xl mb-4">inbox</span>
                    <h3 className="text-sm font-bold text-blue-900 uppercase tracking-widest">No Nominations Yet</h3>
                    <p className="text-xs text-blue-500 mt-2 max-w-sm mx-auto">
                        You haven't been issued any nominations at this time. You will receive an email when your nominations are ready.
                    </p>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Instructions */}
                    <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                        <h2 className="text-sm font-bold text-blue-900 uppercase tracking-widest mb-2">Instructions</h2>
                        <ol className="text-xs text-blue-700 leading-relaxed space-y-1 list-decimal list-inside">
                            <li>Review all available nomination options below.</li>
                            <li>Check the option(s) you wish to select using the checkbox.</li>
                            <li>Download the Official Nomination document, print, sign it.</li>
                            <li>Upload your signed document using the upload section below.</li>
                        </ol>
                        {nominations[0]?.adminDocumentUrl && (
                            <a
                                href={nominations[0].adminDocumentUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-900 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-blue-800 transition-all"
                            >
                                <span className="material-symbols-outlined text-sm">download</span>
                                Download Official Nomination Document
                            </a>
                        )}
                    </div>

                    {/* Nomination Cards with Checkboxes */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {nominations.map((nom: any) => {
                            const isApproved = nom.status === 'approved' || nom.isSelected;
                            const isChecked = selectedIds.has(nom.id) || isApproved;

                            return (
                                <div
                                    key={nom.id}
                                    onClick={() => !isLocked && handleCheckbox(nom.id)}
                                    className={`p-6 bg-white rounded-2xl border-2 transition-all cursor-pointer select-none
                                        ${isApproved ? 'border-emerald-500 bg-emerald-50/20 shadow-emerald-500/10 shadow-lg' :
                                          isChecked ? 'border-blue-900 shadow-blue-900/10 shadow-lg' :
                                          'border-blue-100 shadow-sm hover:border-blue-300'}
                                        ${isLocked ? 'cursor-default' : ''}`}
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-start gap-3">
                                            {/* Checkbox */}
                                            {!isLocked && (
                                                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all
                                                    ${isChecked ? 'bg-blue-900 border-blue-900' : 'border-blue-300 bg-white'}`}
                                                >
                                                    {isChecked && (
                                                        <span className="material-symbols-outlined text-white text-[14px]">check</span>
                                                    )}
                                                </div>
                                            )}
                                            <div>
                                                <h3 className="text-sm font-bold text-blue-900 uppercase tracking-widest">{nom.tradeStream || nom.role}</h3>
                                                <p className="text-xs text-blue-500 font-medium mt-0.5">{nom.hostEmployer || nom.company}</p>
                                            </div>
                                        </div>
                                        <div className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest shrink-0
                                            ${isApproved ? 'bg-emerald-100 text-emerald-700' :
                                              nom.documentUrl ? 'bg-amber-100 text-amber-700' :
                                              'bg-blue-50 text-blue-600'}`}
                                        >
                                            {isApproved ? 'Approved' : nom.documentUrl ? 'Under Review' : 'Pending'}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs">
                                            <span className="text-blue-400 font-medium">Vacancies</span>
                                            <span className="text-blue-900 font-bold">{nom.vacancies || '—'}</span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                            <span className="text-blue-400 font-medium">Competitors</span>
                                            <span className="text-blue-900 font-bold">{nom.competitors || '—'}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Upload Section — shown after selection is confirmed or if under review/approved */}
                    {(selectedIds.size > 0 || isLocked || underReview) && (
                        <div className="bg-white p-8 rounded-2xl border border-blue-100 shadow-sm space-y-6">
                            <div>
                                <h3 className="text-sm font-bold text-blue-900 uppercase tracking-widest mb-1">
                                    {isLocked && nominations.some((n: any) => n.status === 'approved')
                                        ? 'Signed Document'
                                        : 'Upload Signed Nomination Document'}
                                </h3>
                                <p className="text-xs text-blue-500">
                                    {isLocked && nominations.some((n: any) => n.status === 'approved')
                                        ? 'Your nomination has been approved. No further action is required.'
                                        : 'Upload your signed Official Notice of Nomination & Trade Selection form here.'}
                                </p>
                            </div>

                            {/* Show uploaded doc if exists */}
                            {nominations.find((n: any) => n.documentUrl)?.documentUrl && (
                                <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-center gap-3">
                                    <span className="material-symbols-outlined text-emerald-500">check_circle</span>
                                    <div>
                                        <p className="text-[11px] font-bold text-blue-900 uppercase tracking-widest">Document Uploaded</p>
                                        <a
                                            href={nominations.find((n: any) => n.documentUrl)?.documentUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-xs text-blue-600 hover:underline"
                                        >
                                            View Document
                                        </a>
                                    </div>
                                </div>
                            )}

                            {/* Upload drop zone — hide if locked/approved */}
                            {!isLocked && (
                                <label className={`block relative border-2 border-dashed border-blue-200 rounded-xl p-8 text-center transition-all ${isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-50 cursor-pointer'}`}>
                                    <input
                                        type="file"
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        onChange={handleFileUpload}
                                        disabled={isUploading}
                                    />
                                    <span className="material-symbols-outlined text-blue-300 text-3xl mb-2">upload_file</span>
                                    <p className="text-xs font-bold text-blue-900 uppercase tracking-widest">
                                        {isUploading ? 'Uploading...' : 'Click to Upload Signed Document'}
                                    </p>
                                    <p className="text-[10px] text-blue-400 mt-1">PDF, JPG, or PNG accepted</p>
                                </label>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
