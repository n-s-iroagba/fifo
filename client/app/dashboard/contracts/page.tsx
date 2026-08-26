'use client';

import React, { useState, useRef } from 'react';
import { useApiQuery, useApiMutation } from '@/lib/hooks';
import { uploadFile } from '@/lib/utils';

type UploadTag = 'page1' | 'page15';

export default function ContractsDashboardPage() {
    const { data: appsRes, isLoading: loadingApps } = useApiQuery<any>(
        ['applications'],
        '/applications'
    );
    const application = appsRes?.rows?.[0];
    const appId = application?.id;

    const { data: contracts = [], isLoading: loadingContracts, refetch } = useApiQuery<any[]>(
        ['contracts', appId],
        `/applications/${appId}/contracts`,
        { enabled: !!appId }
    );

    const { mutateAsync: uploadDocument, isPending: isUploading } = useApiMutation<any, any>('post', `/applications/contracts/documents`);

    const [uploadState, setUploadState] = useState<Record<number, Record<UploadTag, boolean>>>({});
    const [uploadingTag, setUploadingTag] = useState<{ contractId: number; tag: UploadTag } | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    const handleFileUpload = async (
        e: React.ChangeEvent<HTMLInputElement>,
        contractId: number,
        tag: UploadTag
    ) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setError(null);
            setSuccessMsg(null);
            setUploadingTag({ contractId, tag });

            const uploadedUrl = await uploadFile(file, 'image');

            await uploadDocument({
                data: {
                    documentUrl: uploadedUrl,
                    documentType: tag === 'page1' ? 'Signed Contract Page 1' : 'Signed Contract Page 15',
                    applicationId: appId,
                    contractId
                }
            });

            setUploadState(prev => ({
                ...prev,
                [contractId]: { ...prev[contractId], [tag]: true }
            }));
            setSuccessMsg(`${tag === 'page1' ? 'Page 1' : 'Page 15'} uploaded successfully! Your contract is now under review.`);
            setTimeout(() => setSuccessMsg(null), 7000);
            await refetch();
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to upload document.');
        } finally {
            setUploadingTag(null);
        }
    };

    if (loadingApps || loadingContracts) {
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

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'approved': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'under-review': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'completed': return 'bg-emerald-50 text-emerald-800 border-emerald-300';
            case 'rejected': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-blue-100 text-blue-700 border-blue-200';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'approved': return 'Approved';
            case 'under-review': return 'Under Review';
            case 'completed': return 'Contract Complete';
            case 'rejected': return 'Rejected';
            case 'ongoing': return 'Awaiting Your Signature';
            default: return status;
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'approved': return 'verified';
            case 'under-review': return 'hourglass_top';
            case 'completed': return 'task_alt';
            case 'rejected': return 'cancel';
            default: return 'pending';
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-blue-900 tracking-tight">My Contracts</h1>
                <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mt-1">Review and return your signed employment contracts</p>
            </div>

            {/* Alerts */}
            {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-[11px] font-bold uppercase tracking-widest flex items-center gap-2">
                    <span className="material-symbols-outlined text-base">error</span>
                    {error}
                </div>
            )}
            {successMsg && (
                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-700 text-[11px] font-bold uppercase tracking-widest flex items-center gap-2">
                    <span className="material-symbols-outlined text-base">check_circle</span>
                    {successMsg}
                </div>
            )}

            {contracts.length === 0 ? (
                <div className="bg-white p-12 rounded-[2rem] border border-blue-100 shadow-sm text-center">
                    <span className="material-symbols-outlined text-blue-200 text-6xl mb-4">description</span>
                    <h3 className="text-sm font-bold text-blue-900 uppercase tracking-widest">No Contracts Yet</h3>
                    <p className="text-xs text-blue-500 mt-2 max-w-sm mx-auto">
                        You have not been issued a contract yet. Once the admin generates your contract, it will appear here for review and upload.
                    </p>
                </div>
            ) : (
                <div className="space-y-8">
                    {contracts.map((contract: any) => {
                        const isApproved = contract.status === 'approved' || contract.status === 'completed' || contract.status === 'accepted';
                        const isUnderReview = contract.status === 'under-review';
                        const isOngoing = contract.status === 'ongoing' || contract.status === 'pending';
                        const contractUploads = uploadState[contract.id] || {};

                        return (
                            <div key={contract.id} className="bg-white rounded-[2rem] border border-blue-100 shadow-sm overflow-hidden">
                                {/* Contract Header */}
                                <div className="p-6 border-b border-blue-50 flex justify-between items-start bg-gradient-to-r from-blue-50/50 to-transparent">
                                    <div>
                                        <h3 className="text-sm font-bold text-blue-900 uppercase tracking-widest">{contract.role}</h3>
                                        <p className="text-xs text-blue-600 font-medium mt-1">{contract.company}</p>
                                    </div>
                                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest border ${getStatusStyle(contract.status)}`}>
                                        <span className="material-symbols-outlined text-[14px]">{getStatusIcon(contract.status)}</span>
                                        {getStatusLabel(contract.status)}
                                    </div>
                                </div>

                                <div className="p-6 space-y-6">
                                    {/* Download contract template */}
                                    {contract.adminDocumentUrl && (
                                        <div className="flex items-center justify-between p-4 bg-blue-50/60 border border-blue-100 rounded-2xl">
                                            <div>
                                                <p className="text-[11px] font-bold text-blue-900 uppercase tracking-widest">Contract Document</p>
                                                <p className="text-[10px] text-blue-500 mt-0.5">Download, sign, and upload Pages 1 and/or 15 below.</p>
                                            </div>
                                            <a
                                                href={contract.adminDocumentUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-blue-800 transition-all"
                                            >
                                                <span className="material-symbols-outlined text-sm">download</span>
                                                Download
                                            </a>
                                        </div>
                                    )}

                                    {/* Approved state */}
                                    {isApproved && (
                                        <div className="p-5 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3">
                                            <span className="material-symbols-outlined text-emerald-500 text-2xl">verified</span>
                                            <div>
                                                <p className="text-[11px] font-bold text-emerald-900 uppercase tracking-widest">Contract Approved</p>
                                                <p className="text-[10px] text-emerald-700 mt-0.5">Your contract has been reviewed and approved by our team.</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Under Review state */}
                                    {isUnderReview && (
                                        <div className="p-5 bg-amber-50 border border-amber-100 rounded-2xl flex items-center gap-3">
                                            <span className="material-symbols-outlined text-amber-500 text-2xl">hourglass_top</span>
                                            <div>
                                                <p className="text-[11px] font-bold text-amber-900 uppercase tracking-widest">Under Review</p>
                                                <p className="text-[10px] text-amber-700 mt-0.5">Your signed contract is being reviewed. This typically takes up to 3 hours.</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Upload section — always shown for ongoing/under-review/approved (per spec: can still upload page 1 if required) */}
                                    {(isOngoing || isUnderReview || isApproved) && (
                                        <div className="space-y-4">
                                            <div>
                                                <h4 className="text-[11px] font-bold text-blue-900 uppercase tracking-widest mb-1">
                                                    {isApproved ? 'Additional Upload (Optional)' : 'Upload Signed Pages'}
                                                </h4>
                                                <p className="text-[10px] text-blue-500">
                                                    {isApproved
                                                        ? 'You may still upload Page 1 if required by your recruiter.'
                                                        : 'Upload Page 15 (required) and Page 1 (if applicable).'}
                                                </p>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {/* Page 15 Upload — required */}
                                                <div>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="text-[10px] font-black text-blue-900 uppercase tracking-widest">Page 15</span>
                                                        <span className="text-[9px] font-bold text-red-500 uppercase bg-red-50 px-2 py-0.5 rounded border border-red-100">Required</span>
                                                        {(contractUploads.page15 || contract.documentUrl15) && (
                                                            <span className="text-[9px] font-bold text-emerald-600 uppercase bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 flex items-center gap-1">
                                                                <span className="material-symbols-outlined text-[12px]">check</span>Uploaded
                                                            </span>
                                                        )}
                                                    </div>
                                                    <label className={`block relative border-2 border-dashed rounded-xl p-6 text-center transition-all
                                                        ${(uploadingTag?.contractId === contract.id && uploadingTag?.tag === 'page15')
                                                            ? 'opacity-50 cursor-not-allowed border-blue-200'
                                                            : (contractUploads.page15 || contract.documentUrl15)
                                                            ? 'border-emerald-300 bg-emerald-50/30 cursor-pointer'
                                                            : 'border-blue-200 hover:bg-blue-50 cursor-pointer'}`}
                                                    >
                                                        <input
                                                            type="file"
                                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                            accept=".pdf,.jpg,.jpeg,.png"
                                                            onChange={(e) => handleFileUpload(e, contract.id, 'page15')}
                                                            disabled={uploadingTag?.contractId === contract.id && uploadingTag?.tag === 'page15'}
                                                        />
                                                        <span className="material-symbols-outlined text-blue-300 text-2xl mb-1">
                                                            {(contractUploads.page15 || contract.documentUrl15) ? 'task_alt' : 'upload_file'}
                                                        </span>
                                                        <p className="text-[10px] font-bold text-blue-900 uppercase tracking-widest">
                                                            {(uploadingTag?.contractId === contract.id && uploadingTag?.tag === 'page15')
                                                                ? 'Uploading...'
                                                                : (contractUploads.page15 || contract.documentUrl15)
                                                                ? 'Re-upload Page 15'
                                                                : 'Upload Page 15'}
                                                        </p>
                                                    </label>
                                                    {contract.documentUrl15 && (
                                                        <a href={contract.documentUrl15} target="_blank" rel="noreferrer" className="block mt-1 text-[10px] text-blue-500 hover:underline text-center">
                                                            View Uploaded Page 15
                                                        </a>
                                                    )}
                                                </div>

                                                {/* Page 1 Upload — optional */}
                                                <div>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="text-[10px] font-black text-blue-900 uppercase tracking-widest">Page 1</span>
                                                        <span className="text-[9px] font-bold text-blue-500 uppercase bg-blue-50 px-2 py-0.5 rounded border border-blue-100">Optional</span>
                                                        {(contractUploads.page1 || contract.documentUrl1) && (
                                                            <span className="text-[9px] font-bold text-emerald-600 uppercase bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 flex items-center gap-1">
                                                                <span className="material-symbols-outlined text-[12px]">check</span>Uploaded
                                                            </span>
                                                        )}
                                                    </div>
                                                    <label className={`block relative border-2 border-dashed rounded-xl p-6 text-center transition-all
                                                        ${(uploadingTag?.contractId === contract.id && uploadingTag?.tag === 'page1')
                                                            ? 'opacity-50 cursor-not-allowed border-blue-200'
                                                            : (contractUploads.page1 || contract.documentUrl1)
                                                            ? 'border-emerald-300 bg-emerald-50/30 cursor-pointer'
                                                            : 'border-blue-200 hover:bg-blue-50 cursor-pointer'}`}
                                                    >
                                                        <input
                                                            type="file"
                                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                            accept=".pdf,.jpg,.jpeg,.png"
                                                            onChange={(e) => handleFileUpload(e, contract.id, 'page1')}
                                                            disabled={uploadingTag?.contractId === contract.id && uploadingTag?.tag === 'page1'}
                                                        />
                                                        <span className="material-symbols-outlined text-blue-300 text-2xl mb-1">
                                                            {(contractUploads.page1 || contract.documentUrl1) ? 'task_alt' : 'upload_file'}
                                                        </span>
                                                        <p className="text-[10px] font-bold text-blue-900 uppercase tracking-widest">
                                                            {(uploadingTag?.contractId === contract.id && uploadingTag?.tag === 'page1')
                                                                ? 'Uploading...'
                                                                : (contractUploads.page1 || contract.documentUrl1)
                                                                ? 'Re-upload Page 1'
                                                                : 'Upload Page 1'}
                                                        </p>
                                                    </label>
                                                    {contract.documentUrl1 && (
                                                        <a href={contract.documentUrl1} target="_blank" rel="noreferrer" className="block mt-1 text-[10px] text-blue-500 hover:underline text-center">
                                                            View Uploaded Page 1
                                                        </a>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Show existing single documentUrl for backwards compat */}
                                            {contract.documentUrl && !contract.documentUrl15 && !contract.documentUrl1 && (
                                                <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl flex items-center gap-3">
                                                    <span className="material-symbols-outlined text-emerald-500">task_alt</span>
                                                    <div>
                                                        <p className="text-[11px] font-bold text-emerald-900 uppercase tracking-widest">Signed Contract Received</p>
                                                        <a href={contract.documentUrl} target="_blank" rel="noreferrer" className="text-[10px] text-emerald-600 hover:underline">
                                                            View Document
                                                        </a>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
