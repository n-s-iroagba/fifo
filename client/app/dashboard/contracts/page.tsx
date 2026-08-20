'use client';

import React, { useState } from 'react';
import { useApiQuery, useApiMutation } from '@/lib/hooks';
import { uploadFile } from '@/lib/utils';

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

    const { mutateAsync: acceptContract, isPending: isAccepting } = useApiMutation<any, any>('put', `/applications/${appId}/contracts/:contractId/accept`);
    const { mutateAsync: rejectContract, isPending: isRejecting } = useApiMutation<any, any>('put', `/applications/${appId}/contracts/:contractId/reject`);
    const { mutateAsync: uploadDocument, isPending: isUploading } = useApiMutation<any, any>('post', `/applications/contracts/documents`);

    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAccept = async (contractId: number) => {
        try {
            setError(null);
            await acceptContract({ params: { contractId } });
            await refetch();
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.error || 'Failed to accept contract.');
        }
    };

    const handleReject = async (contractId: number) => {
        try {
            setError(null);
            await rejectContract({ params: { contractId } });
            await refetch();
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.error || 'Failed to reject contract.');
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, contractId: number) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setError(null);
            setUploadSuccess(false);

            const uploadedUrl = await uploadFile(file, 'image');

            await uploadDocument({
                data: {
                    documentUrl: uploadedUrl,
                    documentType: 'Signed Contract',
                    applicationId: appId,
                    contractId
                }
            });

            setUploadSuccess(true);
            setTimeout(() => setUploadSuccess(false), 5000);
            await refetch();
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.error || 'Failed to upload document.');
        }
    };

    if (loadingApps || loadingContracts) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-900 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!application) {
        return (
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="bg-white p-8 rounded-2xl border border-blue-100 shadow-sm text-center">
                    <p className="text-sm font-medium text-blue-900">You do not have an active application yet.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-blue-900 tracking-tight">My Contracts</h1>
                    <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mt-1">Review and accept your employment contracts</p>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-[11px] font-bold uppercase tracking-widest">
                    {error}
                </div>
            )}
            
            {uploadSuccess && (
                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-700 text-[11px] font-bold uppercase tracking-widest">
                    Signed contract uploaded successfully!
                </div>
            )}

            {contracts.length === 0 ? (
                <div className="bg-white p-12 rounded-2xl border border-blue-100 shadow-sm text-center">
                    <span className="material-symbols-outlined text-blue-200 text-6xl mb-4">description_empty</span>
                    <h3 className="text-sm font-bold text-blue-900 uppercase tracking-widest">No Contracts Yet</h3>
                    <p className="text-xs text-blue-500 mt-2 max-w-sm mx-auto">You have not been issued any contracts. Once a contract is generated, it will appear here for your review and signature.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {contracts.map(contract => (
                        <div key={contract.id} className="bg-white rounded-2xl border border-blue-100 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-blue-50 flex justify-between items-start bg-blue-50/30">
                                <div>
                                    <h3 className="text-sm font-bold text-blue-900 uppercase tracking-widest">{contract.role}</h3>
                                    <p className="text-xs text-blue-600 font-medium">{contract.company}</p>
                                </div>
                                <div className={`px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-widest ${
                                    contract.status === 'accepted' ? 'bg-emerald-100 text-emerald-700' :
                                    contract.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                    'bg-amber-100 text-amber-700'
                                }`}>
                                    {contract.status}
                                </div>
                            </div>
                            
                            <div className="p-6 space-y-6">
                                {contract.adminDocumentUrl && (
                                    <div className="flex justify-end border-b border-blue-50 pb-4 mb-4">
                                        <a 
                                            href={contract.adminDocumentUrl} 
                                            target="_blank" 
                                            rel="noreferrer" 
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-900 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-blue-800 transition-all"
                                        >
                                            <span className="material-symbols-outlined text-sm">download</span>
                                            Download Contract Template
                                        </a>
                                    </div>
                                )}
                                
                                {contract.status === 'pending' && (
                                    <>
                                        <div className="flex gap-4">
                                            <button
                                                onClick={() => handleAccept(contract.id)}
                                                disabled={isAccepting || isRejecting}
                                                className="flex-1 py-3 bg-blue-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-blue-800 transition-all shadow-lg shadow-blue-900/10 disabled:opacity-50"
                                            >
                                                {isAccepting ? 'Processing...' : 'Accept Contract'}
                                            </button>
                                            <button
                                                onClick={() => handleReject(contract.id)}
                                                disabled={isAccepting || isRejecting}
                                                className="flex-1 py-3 bg-white border border-red-200 text-red-600 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-red-50 transition-all disabled:opacity-50"
                                            >
                                                {isRejecting ? 'Processing...' : 'Reject Contract'}
                                            </button>
                                        </div>
                                    </>
                                )}

                                {contract.status === 'accepted' && (
                                    <div className="space-y-4">
                                        <h4 className="text-[11px] font-bold text-blue-900 uppercase tracking-widest">Upload Signed Contract</h4>
                                        <label className={`block relative border-2 border-dashed border-blue-200 rounded-xl p-8 text-center transition-all ${isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-50 cursor-pointer'}`}>
                                            <input 
                                                type="file" 
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                accept=".pdf,.jpg,.jpeg,.png"
                                                onChange={(e) => handleFileUpload(e, contract.id)}
                                                disabled={isUploading}
                                            />
                                            <span className="material-symbols-outlined text-blue-300 text-3xl mb-2">upload_file</span>
                                            <p className="text-xs font-bold text-blue-900 uppercase tracking-widest">
                                                {isUploading ? 'Uploading...' : 'Click to Upload Signed Contract'}
                                            </p>
                                        </label>
                                        
                                        {contract.documentUrl && (
                                            <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl flex items-center gap-3">
                                                <span className="material-symbols-outlined text-emerald-500">task_alt</span>
                                                <div>
                                                    <p className="text-[11px] font-bold text-emerald-900 uppercase tracking-widest">Signed Document Received</p>
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
                    ))}
                </div>
            )}
        </div>
    );
}
