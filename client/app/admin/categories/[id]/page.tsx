'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useApiQuery } from '@/lib/hooks';
import Link from 'next/link';
import { JobCategory } from '@/types/models';

export default function CategoryViewPage() {
    const params = useParams();
    const id = params?.id;
    const { data: category, isLoading, error } = useApiQuery<JobCategory>(['admin', 'categories'], `/admin/categories/${id}`, {
        enabled: !!id
    });

    if (isLoading) return <div className="p-12 text-center text-[10px] font-bold uppercase tracking-widest text-blue-400">Loading Category Details...</div>;
    if (error) return <div className="p-12 text-center text-red-500 text-[10px] font-bold uppercase tracking-widest">Error Loading Category</div>;

    return (
        <div className="font-sans">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Link href="/admin/categories" className="text-blue-400 hover:text-blue-900 transition-colors">
                            <span className="material-symbols-outlined text-lg">arrow_back</span>
                        </Link>
                        <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Category Details / {id}</span>
                    </div>
                    <h1 className="text-3xl font-bold text-blue-900 tracking-tight">{category?.name}</h1>
                </div>
                <Link href={`/admin/categories/${id}/edit`}>
                    <button className="bg-blue-900 text-white px-5 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-blue-800 transition-all shadow-lg shadow-blue-900/10 flex items-center gap-2">
                        <span className="material-symbols-outlined text-base">edit</span>
                        Edit Category
                    </button>
                </Link>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-blue-100 shadow-sm max-w-3xl">
                <h3 className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-6 pb-4 border-b border-blue-50">Description</h3>
                <p className="text-sm text-blue-600 leading-relaxed whitespace-pre-wrap">
                    {category?.description || 'No description provided.'}
                </p>
            </div>
        </div>
    );
}
