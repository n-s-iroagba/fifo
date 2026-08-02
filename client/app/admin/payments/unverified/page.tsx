'use client';

import { useApiQuery, useApiMutation } from '@/lib/hooks';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

export default function UnverifiedPaymentsPage() {
    const queryClient = useQueryClient();
    const [selectedPayment, setSelectedPayment] = useState<any>(null);
    const [note, setNote] = useState('');

    const { data: payments, isLoading } = useApiQuery<any>(
        ['admin', 'payments', 'unverified'],
        '/admin/payments/unverified'
    );

    const verifyMutation = useApiMutation('post', `/admin/payments/${selectedPayment?.id}/verify`, {
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'payments', 'unverified'] });
            setSelectedPayment(null);
            setNote('');
        }
    });

    if (isLoading) return <div className="p-12 text-center text-[10px] font-bold uppercase tracking-widest text-blue-400">Verifying Payment Receipts...</div>;

    const paymentList = payments?.rows || [];

    return (
        <div className="font-sans antialiased text-blue-900">
            <div className="mb-12">
                <h1 className="text-3xl font-bold tracking-tight uppercase leading-tight">Verification Queue</h1>
                <p className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.3em] mt-2">Verify and approve payment receipts for processing fees</p>
            </div>

            <div className="bg-white rounded-[2rem] border border-blue-100 overflow-hidden shadow-2xl shadow-blue-900/5">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-blue-50 border-b border-blue-100">
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">Applicant</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">Stage / Fee</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">Verification Document</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-blue-50">
                            {paymentList.map((pay: any) => (
                                <tr key={pay.id} className="hover:bg-blue-50/50 transition-colors group">
                                    <td className="px-8 py-6">
                                        <p className="text-sm font-bold text-blue-900 uppercase tracking-tight">{pay.Application?.User?.fullName}</p>
                                        <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">{pay.Application?.User?.email}</p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <p className="text-sm font-bold text-blue-900 uppercase tracking-tight">{pay.JobStage?.name}</p>
                                        <p className="text-[10px] text-blue-500 font-bold uppercase tracking-[0.2em]">${pay.amount}</p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <a 
                                            href={pay.proofUrl} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 text-[10px] font-bold text-blue-400 hover:text-blue-900 transition-colors uppercase tracking-widest"
                                        >
                                            <span className="material-symbols-outlined text-base">image</span>
                                            View Document
                                        </a>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <button
                                            onClick={() => setSelectedPayment(pay)}
                                            className="bg-blue-900 text-white px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] hover:bg-black transition-all shadow-lg shadow-blue-900/10 active:scale-95"
                                        >
                                            Approve Payment
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {paymentList.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-8 py-12 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-blue-300 italic">
                                        No unverified payments detected
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedPayment && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-blue-900/95 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-xl overflow-hidden border border-white/20">
                        <div className="p-8 border-b border-blue-50 flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-bold text-blue-900 uppercase tracking-tight">Payment Verification</h3>
                                <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Payment Reference #CC-{selectedPayment.id.toString().padStart(5, '0')}</p>
                            </div>
                            <button onClick={() => setSelectedPayment(null)} className="text-blue-400 hover:text-blue-900 transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        
                        <div className="p-8 space-y-8">
                            <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100">
                                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-4">Verification Artifact</p>
                                <img 
                                    src={selectedPayment.proofUrl} 
                                    alt="Proof of Payment" 
                                    className="w-full rounded-xl shadow-lg border border-white object-contain max-h-[300px]"
                                />
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest px-1">Internal Note / Disapproval Reason</label>
                                <textarea
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    placeholder="Enter verification notes or disapproval details..."
                                    className="w-full bg-blue-50 border border-blue-100 rounded-2xl p-5 text-sm font-medium text-blue-900 focus:bg-white outline-none focus:ring-4 focus:ring-blue-100 transition-all h-32 resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => verifyMutation.mutate({ isApproved: false, note })}
                                    disabled={verifyMutation.isPending}
                                    className="py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-red-50 text-red-600 hover:bg-red-100 transition-all active:scale-95"
                                >
                                    {verifyMutation.isPending ? 'Processing...' : 'Disapprove Payment'}
                                </button>
                                <button
                                    onClick={() => verifyMutation.mutate({ isApproved: true, note })}
                                    disabled={verifyMutation.isPending}
                                    className="py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-blue-900 text-white shadow-xl shadow-blue-900/10 hover:bg-black transition-all active:scale-95"
                                >
                                    {verifyMutation.isPending ? 'Processing...' : 'Approve Payment'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
