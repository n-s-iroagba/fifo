'use client';

import { useApiQuery } from '@/lib/hooks';
import Link from 'next/link';

export default function UnpaidPaymentsPage() {
    const { data: payments, isLoading } = useApiQuery<any>(
        ['admin', 'payments', 'unpaid'],
        '/admin/payments/unpaid'
    );

    if (isLoading) return <div className="p-12 text-center text-[10px] font-bold uppercase tracking-widest text-blue-400">Loading Pending Payments...</div>;

    const paymentList = payments?.rows || [];

    return (
        <div className="font-sans antialiased text-blue-900">
            <div className="mb-12">
                <h1 className="text-3xl font-bold tracking-tight uppercase leading-tight">Pending Payments</h1>
                <p className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.3em] mt-2">Track applications awaiting payment processing</p>
            </div>

            <div className="bg-white rounded-[2rem] border border-blue-100 overflow-hidden shadow-2xl shadow-blue-900/5">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-blue-50 border-b border-blue-100">
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">Applicant</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">Target Role</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">Payment Stage</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">Amount Due</th>
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
                                        <p className="text-sm font-bold text-blue-900 uppercase tracking-tight">{pay.Application?.JobListing?.title}</p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="px-3 py-1 bg-amber-50 text-amber-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-amber-100">
                                            {pay.JobStage?.name}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <p className="text-sm font-bold text-blue-900 tracking-tighter">${pay.amount}</p>
                                        <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">{pay.currency}</p>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <Link
                                            href={`/admin/applications/${pay.applicationId}`}
                                            className="inline-flex items-center gap-2 bg-white border border-blue-100 px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] text-blue-400 hover:text-blue-900 hover:border-blue-900 transition-all shadow-sm active:scale-95"
                                        >
                                            View Application
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                            {paymentList.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-8 py-12 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-blue-300 italic">
                                        No pending payments detected
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
