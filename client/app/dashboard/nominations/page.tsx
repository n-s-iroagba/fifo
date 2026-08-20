'use client';

import React, { useState, useEffect } from 'react';
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

    const { mutateAsync: selectNomination, isPending: isSelecting } = useApiMutation<any, any>('put', `/applications/${appId}/nominations/:nominationId/select`);
    const { mutateAsync: uploadDocument, isPending: isUploading } = useApiMutation<any, any>('post', `/applications/documents`);

    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSelect = async (nominationId: number) => {
        try {
            setError(null);
            await selectNomination({ params: { nominationId } });
            await refetch();
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.error || 'Failed to select nomination.');
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setError(null);
            setUploadSuccess(false);

            // Use real uploadFile utility
            const uploadedUrl = await uploadFile(file, 'image'); // The utility accepts 'image', 'video', 'thumbnail'. Since it's a doc (PDF/Image), we pass 'image' which routes to 'auto'.

            await uploadDocument({
                data: {
                    documentUrl: uploadedUrl,
                    documentType: 'Nomination Form',
                    applicationId: appId
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

    if (loadingApps || loadingNoms) {
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

    const hasSelected = nominations.some(n => n.isSelected);

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-blue-900 tracking-tight">My Nominations</h1>
                    <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mt-1">Review and select your trade options</p>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-[11px] font-bold uppercase tracking-widest">
                    {error}
                </div>
            )}
            
            {uploadSuccess && (
                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-700 text-[11px] font-bold uppercase tracking-widest">
                    Document uploaded successfully!
                </div>
            )}

            {nominations.length === 0 ? (
                <div className="bg-white p-8 rounded-2xl border border-blue-100 shadow-sm text-center">
                    <span className="material-symbols-outlined text-blue-200 text-4xl mb-3">stars</span>
                    <h3 className="text-sm font-bold text-blue-900 uppercase tracking-widest">No Nominations Yet</h3>
                    <p className="text-xs text-blue-500 mt-2">You have not been issued any nominations at this time.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                        <h2 className="text-sm font-bold text-blue-900 uppercase tracking-widest mb-2">Instructions</h2>
                        <p className="text-xs text-blue-700 leading-relaxed">
                            Please review the available options below and select exactly one (1) interconnected option. Selecting one will automatically reject the others.
                            After making your selection, please upload your signed Official Notice of Nomination document.
                        </p>
                        {nominations[0]?.adminDocumentUrl && (
                            <a 
                                href={nominations[0].adminDocumentUrl} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-900 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-blue-800 transition-all"
                            >
                                <span className="material-symbols-outlined text-sm">download</span>
                                Download Official Notice Template
                            </a>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {nominations.map(nom => (
                            <div key={nom.id} className={`p-6 bg-white rounded-2xl border transition-all ${nom.isSelected ? 'border-emerald-500 shadow-emerald-500/10 shadow-lg' : 'border-blue-100 shadow-sm'}`}>
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-sm font-bold text-blue-900 uppercase tracking-widest">{nom.tradeStream}</h3>
                                        <p className="text-xs text-blue-500 font-medium">{nom.hostEmployer}</p>
                                    </div>
                                    <div className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${nom.isSelected ? 'bg-emerald-100 text-emerald-700' : hasSelected ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-600'}`}>
                                        {nom.isSelected ? 'Accepted' : hasSelected ? 'Rejected' : 'Pending'}
                                    </div>
                                </div>
                                <div className="space-y-2 mb-6">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-blue-400 font-medium">Vacancies</span>
                                        <span className="text-blue-900 font-bold">{nom.vacancies}</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-blue-400 font-medium">Competitors</span>
                                        <span className="text-blue-900 font-bold">{nom.competitors}</span>
                                    </div>
                                </div>
                                
                                <button
                                    onClick={() => handleSelect(nom.id)}
                                    disabled={isSelecting || nom.isSelected}
                                    className={`w-full py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
                                        nom.isSelected 
                                            ? 'bg-emerald-50 text-emerald-600 cursor-default' 
                                            : 'bg-blue-50 text-blue-600 hover:bg-blue-900 hover:text-white'
                                    }`}
                                >
                                    {isSelecting && !nom.isSelected ? 'Processing...' : nom.isSelected ? 'Selected' : 'Select Option'}
                                </button>
                            </div>
                        ))}
                    </div>

                    {hasSelected && (
                        <div className="bg-white p-8 rounded-2xl border border-blue-100 shadow-sm space-y-6">
                            <div>
                                <h3 className="text-sm font-bold text-blue-900 uppercase tracking-widest mb-1">Upload Signed Document</h3>
                                <p className="text-xs text-blue-500">Upload your signed Official Notice of Nomination & Trade Selection form here.</p>
                            </div>
                            
                            <div className="flex items-center gap-4">
                                <label className={`flex-1 relative border-2 border-dashed border-blue-200 rounded-xl p-8 text-center transition-all ${isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-50 cursor-pointer'}`}>
                                    <input 
                                        type="file" 
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        onChange={handleFileUpload}
                                        disabled={isUploading}
                                    />
                                    <span className="material-symbols-outlined text-blue-300 text-3xl mb-2">upload_file</span>
                                    <p className="text-xs font-bold text-blue-900 uppercase tracking-widest">
                                        {isUploading ? 'Uploading...' : 'Click to Upload Document'}
                                    </p>
                                </label>
                            </div>
                            
                            {nominations.find(n => n.isSelected)?.documentUrl && (
                                <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-center gap-3">
                                    <span className="material-symbols-outlined text-emerald-500">check_circle</span>
                                    <div>
                                        <p className="text-[11px] font-bold text-blue-900 uppercase tracking-widest">Document Uploaded</p>
                                        <a href={nominations.find(n => n.isSelected)?.documentUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline">
                                            View Document
                                        </a>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
