'use client';

import React, { useState, Suspense } from 'react';
import { useApiMutation, useApiQuery } from '@/lib/hooks';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const CustomEditor = dynamic(() => import('@/components/admin/Editor'), {
    ssr: false,
    loading: () => (
        <div className="h-[250px] w-full bg-blue-50/50 rounded-lg animate-pulse border border-blue-200 flex items-center justify-center">
            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Initializing Rich Text Editor...</span>
        </div>
    )
});

function MailComposerContent() {
    const [fromType, setFromType] = useState<'auth' | 'info'>('info');
    const searchParams = useSearchParams();
    const [to, setTo] = useState(searchParams.get('to') || '');
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [attachments, setAttachments] = useState<File[]>([]);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [editorMode, setEditorMode] = useState<'rich' | 'html'>('rich');

    const { mutateAsync: sendMail, isPending: sending } = useApiMutation<any, any>('post', '/admin/mail');

    // Disable activity query as backend doesn't support it yet
    const recentActivity: any[] = [];
    // const { data: recentActivity = [] } = useApiQuery<any[]>(['admin', 'mail-activity'], '/admin/mail/activity');

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!to || !subject || !body || body === '<p><br></p>' || body.trim() === '') return;

        setError(null);
        setSuccess(false);

        try {
            const formData = new FormData();
            formData.append('email', to);
            formData.append('subject', subject);
            formData.append('message', body);
            formData.append('fromType', fromType);
            
            attachments.forEach(file => {
                formData.append('attachments', file);
            });

            // We pass an empty headers object to allow Axios to automatically detect
            // the FormData and set the correct 'Content-Type' with its boundary.
            await sendMail({ 
                data: formData,
                headers: { 'Content-Type': undefined } 
            });
            setSuccess(true);
            setSubject('');
            setBody('');
            setAttachments([]);
            setTimeout(() => setSuccess(false), 5000);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to send email.');
            console.error(err);
        }
    };

    const applyTemplate = (tmplSubject: string, tmplBody: string) => {
        setSubject(tmplSubject);
        if (!/<[a-z][\s\S]*>/i.test(tmplBody)) {
            const formatted = tmplBody
                .split('\n\n')
                .map(para => `<p>${para.replace(/\n/g, '<br />')}</p>`)
                .join('');
            setBody(formatted);
        } else {
            setBody(tmplBody);
        }
    };

    return (
        <div className="font-sans">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-blue-900 tracking-tight">Mail Composer</h1>
                    <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mt-1">Communicate with applicants and segments</p>
                </div>
            </div>

            {success && (
                <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-700 text-[11px] font-bold uppercase tracking-widest">
                    Message sent successfully to {to}
                </div>
            )}
            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-[11px] font-bold uppercase tracking-widest">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <form onSubmit={handleSend} className="bg-white p-8 rounded-2xl border border-blue-100 shadow-sm space-y-6">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-blue-400 uppercase tracking-widest px-1">Dispatch Origin</label>
                            <div className="flex gap-4 px-1">
                                <button
                                    type="button"
                                    onClick={() => setFromType('info')}
                                    className={`flex-1 py-3 px-4 rounded-xl border text-[10px] font-bold uppercase tracking-widest transition-all ${fromType === 'info' ? 'bg-blue-900 text-white border-blue-900 shadow-lg shadow-blue-900/10' : 'bg-blue-50 text-blue-400 border-blue-100 hover:border-blue-300'}`}
                                >
                                    Info Service
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFromType('auth')}
                                    className={`flex-1 py-3 px-4 rounded-xl border text-[10px] font-bold uppercase tracking-widest transition-all ${fromType === 'auth' ? 'bg-blue-900 text-white border-blue-900 shadow-lg shadow-blue-900/10' : 'bg-blue-50 text-blue-400 border-blue-100 hover:border-blue-300'}`}
                                >
                                    Auth Protocol
                                </button>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-blue-400 uppercase tracking-widest px-1">Recipients</label>
                            <input
                                className="w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg text-sm font-medium focus:bg-white outline-none focus:ring-2 focus:ring-blue-900/5 transition-all"
                                placeholder="applicant@example.com..."
                                type="text"
                                value={to}
                                onChange={(e) => setTo(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-blue-400 uppercase tracking-widest px-1">Subject</label>
                            <input
                                className="w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg text-sm font-medium focus:bg-white outline-none focus:ring-2 focus:ring-blue-900/5 transition-all"
                                placeholder="Message subject..."
                                type="text"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex justify-between items-center px-1 mb-1">
                                <label className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Message Body</label>
                                <div className="flex gap-2 bg-blue-50 p-1 rounded-lg border border-blue-100">
                                    <button
                                        type="button"
                                        onClick={() => setEditorMode('rich')}
                                        className={`px-3 py-1 rounded text-[9px] font-bold uppercase tracking-wider transition-all ${editorMode === 'rich' ? 'bg-blue-900 text-white shadow-sm' : 'text-blue-400 hover:text-blue-900'}`}
                                    >
                                        Rich Editor
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setEditorMode('html')}
                                        className={`px-3 py-1 rounded text-[9px] font-bold uppercase tracking-wider transition-all ${editorMode === 'html' ? 'bg-blue-900 text-white shadow-sm' : 'text-blue-400 hover:text-blue-900'}`}
                                    >
                                        Plain HTML (Canva)
                                    </button>
                                </div>
                            </div>
                            <div className="bg-white rounded-lg overflow-hidden border border-blue-200">
                                {editorMode === 'rich' ? (
                                    <CustomEditor
                                        value={body}
                                        onChange={setBody}
                                        placeholder="Write your message here..."
                                    />
                                ) : (
                                    <textarea
                                        value={body}
                                        onChange={(e) => setBody(e.target.value)}
                                        placeholder="Paste your raw HTML email here (e.g. Canva export)..."
                                        className="w-full h-[250px] p-4 bg-white border-0 text-sm font-mono focus:outline-none focus:ring-0 resize-y text-blue-900"
                                    />
                                )}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-bold text-blue-400 uppercase tracking-widest px-1 block">Attachments</label>
                            <div className="flex flex-wrap gap-3">
                                {attachments.map((file, idx) => (
                                    <div key={idx} className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-xl">
                                        <span className="material-symbols-outlined text-sm text-blue-900">attachment</span>
                                        <span className="text-[10px] font-bold text-blue-900 truncate max-w-[150px]">{file.name}</span>
                                        <button 
                                            type="button"
                                            onClick={() => setAttachments(prev => prev.filter((_, i) => i !== idx))}
                                            className="ml-1 text-red-500 hover:text-red-700 transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-sm">close</span>
                                        </button>
                                    </div>
                                ))}
                                <label className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-blue-100 rounded-xl hover:bg-blue-50 hover:border-blue-300 transition-all cursor-pointer group">
                                    <input 
                                        type="file" 
                                        multiple 
                                        className="hidden" 
                                        onChange={(e) => {
                                            if (e.target.files) {
                                                setAttachments(prev => [...prev, ...Array.from(e.target.files!)]);
                                            }
                                        }}
                                    />
                                    <span className="material-symbols-outlined text-sm text-blue-400 group-hover:text-blue-900">add_circle</span>
                                    <span className="text-[10px] font-bold text-blue-400 group-hover:text-blue-900 uppercase tracking-widest">Add Files</span>
                                </label>
                            </div>
                            <p className="text-[9px] text-blue-300 font-medium px-1 italic">Maximum total size: 10MB</p>
                        </div>

                        <div className="pt-4 flex justify-end">
                            <button
                                type="submit"
                                disabled={sending}
                                className="bg-blue-900 text-white px-8 py-3 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-blue-800 transition-all shadow-lg shadow-blue-900/10 disabled:opacity-50"
                            >
                                {sending ? 'Sending...' : 'Send Message'}
                            </button>
                        </div>
                    </form>
                </div>

                <div className="space-y-8">
                    <section className="bg-white p-6 rounded-2xl border border-blue-100 shadow-sm">
                        <h3 className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-4 pb-3 border-b border-blue-50">Quick Templates</h3>
                        <div className="space-y-2">
                            {[
                                { title: 'Interview Invite', subject: 'Next Steps: Interview Scheduling', body: '<p>Dear Applicant,</p><p>We\'d love to schedule a time to speak with you regarding your application. Please follow the link below to select a time slot.</p>' },
                                { title: 'Action Required', subject: 'Important: Action Required for Application', body: '<p>Dear Applicant,</p><p>We are reviewing your profile but need some additional information before proceeding. Please log in to complete the pending requirements.</p>' },
                                { title: 'Payment Update', subject: 'Payment Verification Update', body: '<p>Dear Applicant,</p><p>Your recent payment proof submission has been reviewed. See your dashboard for the detailed status.</p>' }
                            ].map((tmpl, i) => (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => applyTemplate(tmpl.subject, tmpl.body)}
                                    className="w-full text-left p-4 rounded-xl border border-blue-100 hover:border-blue-900 hover:bg-blue-50 transition-all group"
                                >
                                    <p className="text-[10px] font-bold text-blue-900 uppercase tracking-widest">{tmpl.title}</p>
                                    <p className="text-[10px] text-blue-400 line-clamp-1 mt-1 font-medium">{tmpl.subject}</p>
                                </button>
                            ))}
                        </div>
                    </section>

                    <section className="bg-white p-6 rounded-2xl border border-blue-100 shadow-sm">
                        <h3 className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-4 pb-3 border-b border-blue-50">Recent Communication</h3>
                        <div className="space-y-4">
                            {recentActivity.map((activity, i) => (
                                <div key={i} className="flex gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-400">
                                        <span className="material-symbols-outlined text-base">mail</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[11px] font-bold text-blue-900 uppercase tracking-tight leading-tight">{activity.title}</span>
                                        <span className="text-[9px] font-bold text-blue-400 uppercase tracking-widest mt-0.5">{activity.desc}</span>
                                    </div>
                                </div>
                            ))}
                            {recentActivity.length === 0 && <p className="text-[9px] font-bold text-blue-300 uppercase tracking-widest text-center">No recent activity</p>}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}

export default function MailComposerPage() {
    return (
        <Suspense fallback={<div className="p-12 text-center text-[10px] font-bold uppercase tracking-widest text-blue-400">Loading Mail System...</div>}>
            <MailComposerContent />
        </Suspense>
    );
}
