'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useApiQuery } from '@/lib/hooks';
import ConditionForm from '@/components/admin/forms/ConditionForm';
import Link from 'next/link';

export default function ConditionEditPage() {
    const params = useParams();
    const id = params?.id;
    const { data: condition, isLoading, error } = useApiQuery<any>(['admin', 'conditions'], `/admin/conditions/${id}`, {
        enabled: !!id
    });

    if (isLoading) return <div className="p-12 text-center text-[10px] font-bold uppercase tracking-widest text-blue-400">Loading Condition Details...</div>;
    if (error) return <div className="p-12 text-center text-red-500 text-[10px] font-bold uppercase tracking-widest">Error Loading Condition</div>;

    return (
        <div className="font-sans">
            <div className="mb-8">
                <div className="flex items-center gap-2 mb-2">
                    <Link href="/admin/conditions" className="text-blue-400 hover:text-blue-900 transition-colors">
                        <span className="material-symbols-outlined text-lg">arrow_back</span>
                    </Link>
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Conditions / {id} / Edit</span>
                </div>
                <h1 className="text-3xl font-bold text-blue-900 tracking-tight">Edit Condition</h1>
            </div>

            <ConditionForm initialData={condition} isEdit={true} />
        </div>
    );
}
