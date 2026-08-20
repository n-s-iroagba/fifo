'use client';

import React, { useState } from 'react';
import { useApiMutation } from '@/lib/hooks';
import { uploadFile } from '@/lib/utils';

export function NominationUpload({ applicationId }: { applicationId: number }) {
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { mutateAsync: uploadDocument } = useApiMutation<any, any>('post', '/applications/documents'); // wait, do we have an endpoint for this?

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return;

        setIsUploading(true);
        setError(null);

        try {
            const cloudinaryUrl = await uploadFile(file, 'image'); // We can use 'image' or create a 'document' preset

            if (!cloudinaryUrl) {
                throw new Error('Cloudinary returned an invalid URL');
            }

            await uploadDocument({
                data: {
                    applicationId,
                    documentUrl: cloudinaryUrl,
                    documentType: 'Nomination Form'
                }
            });

            setSuccess(true);
            setFile(null);
            setTimeout(() => setSuccess(false), 5000);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to upload document');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="bg-gradient-to-r from-emerald-900 to-emerald-800 text-white p-8 md:p-10 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl shadow-emerald-900/20 mb-12">
            <div className="flex items-center gap-6 w-full md:w-auto">
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center shrink-0 border border-white/20">
                    <span className="material-symbols-outlined text-3xl">upload_file</span>
                </div>
                <div>
                    <h4 className="text-[10px] font-black text-emerald-300 uppercase tracking-[0.3em] mb-1">Signed Nomination Form</h4>
                    <p className="text-[11px] font-bold text-emerald-100 mt-1 uppercase tracking-widest">Upload your signed nomination document here</p>
                </div>
            </div>
            
            <div className="w-full md:w-auto">
                {success ? (
                    <div className="bg-white/10 text-emerald-100 px-6 py-4 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] text-center border border-emerald-400/30">
                        Document Uploaded Successfully
                    </div>
                ) : (
                    <form onSubmit={handleUpload} className="flex flex-col sm:flex-row gap-3">
                        <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                            required
                            className="bg-white/10 text-white px-4 py-3 rounded-xl text-[10px] font-bold file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-[9px] file:font-black file:uppercase file:tracking-widest file:bg-emerald-500 file:text-white hover:file:bg-emerald-400 transition-all border border-white/20 outline-none"
                        />
                        <button
                            type="submit"
                            disabled={!file || isUploading}
                            className="bg-white text-emerald-900 px-6 py-4 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] hover:bg-emerald-50 transition-all text-center disabled:opacity-50"
                        >
                            {isUploading ? 'Uploading...' : 'Submit'}
                        </button>
                    </form>
                )}
                {error && <p className="text-red-300 text-[10px] mt-2 font-bold">{error}</p>}
            </div>
        </div>
    );
}
