'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useApiQuery } from '@/lib/hooks';
import BenefitForm from '@/components/admin/forms/BenefitForm';
import Link from 'next/link';

export default function BenefitEditPage() {
    const params = useParams();
    const id = params?.id;
    const { data: benefit, isLoading, error } = useApiQuery<any>(['admin', 'benefits'], `/admin/benefits/${id}`, {
        enabled: !!id
    });

    if (isLoading) return <div className="p-12 text-center text-[10px] font-bold uppercase tracking-widest text-blue-400">Loading Benefit Details...</div>;
    if (error) return <div className="p-12 text-center text-red-500 text-[10px] font-bold uppercase tracking-widest">Error Loading Benefit</div>;

    return (
        <div className="font-sans">
            <div className="mb-8">
                <div className="flex items-center gap-2 mb-2">
                    <Link href="/admin/benefits" className="text-blue-400 hover:text-blue-900 transition-colors">
                        <span className="material-symbols-outlined text-lg">arrow_back</span>
                    </Link>
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Benefits / {id} / Edit</span>
                </div>
                <h1 className="text-3xl font-bold text-blue-900 tracking-tight">Edit Benefit</h1>
            </div>

            <BenefitForm initialData={benefit} isEdit={true} />
        </div>
    );
}
