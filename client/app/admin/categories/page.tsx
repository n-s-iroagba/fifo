'use client';

import React, { useState } from 'react';
import { useApiQuery, useApiMutation } from '@/lib/hooks';
import Link from 'next/link';
import { JobCategory } from '@/types/models';

export default function CategoryManagementPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const limit = 10;

    const { data: categoriesResult, isLoading, refetch } = useApiQuery<{ rows: JobCategory[], count: number }>(
        ['admin', 'categories', 'list', page, searchQuery],
        `/admin/categories?limit=${limit}&offset=${(page - 1) * limit}${searchQuery ? `&searchQuery=${encodeURIComponent(searchQuery)}` : ''}`
    );

    const deleteMutation = useApiMutation<number, any>('delete', '/admin/categories', {
        onSuccess: () => refetch()
    });

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this industry? All associated information will be affected.')) return;
        try {
            await deleteMutation.mutateAsync(id);
        } catch (err) { console.error(err); }
    };

    const categoryList = categoriesResult?.rows || [];
    const totalCount = categoriesResult?.count || 0;
    const totalPages = Math.ceil(totalCount / limit);

    if (isLoading) return <div className="p-12 text-center text-[10px] font-bold uppercase tracking-widest text-blue-400">Loading Categories...</div>;

    return (
        <div className="font-sans">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-blue-900 tracking-tight">Categories</h1>
                    <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mt-1">Manage job industries and categories</p>
                </div>
                <div className="flex items-center gap-4">
                    <input
                        className="px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg text-sm focus:bg-white outline-none focus:ring-2 focus:ring-blue-900/5 transition-all w-64"
                        placeholder="Search categories..."
                        type="text"
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setPage(1);
                        }}
                    />
                    <Link href="/admin/categories/new">
                        <button className="bg-blue-900 text-white px-5 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-blue-800 transition-all shadow-lg shadow-blue-900/10">
                            Add Category
                        </button>
                    </Link>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-blue-100 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-blue-50 border-b border-blue-100">
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-blue-400">Name</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-blue-400 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-blue-50">
                            {categoryList.map((category: JobCategory) => (
                                <tr key={category.id} className="hover:bg-blue-50/50 transition-colors">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                                                <span className="material-symbols-outlined text-lg">folder</span>
                                            </div>
                                            <span className="text-sm font-medium text-blue-900">{category.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <div className="flex justify-end gap-3">
                                            <Link href={`/admin/categories/${category.id}`} className="text-[10px] font-bold text-blue-400 uppercase tracking-widest hover:text-blue-900 transition-colors">
                                                View
                                            </Link>
                                            <Link href={`/admin/categories/${category.id}/edit`} className="text-[10px] font-bold text-blue-400 uppercase tracking-widest hover:text-blue-900 transition-colors">
                                                Edit
                                            </Link>
                                            <button onClick={() => handleDelete(category.id)} className="text-[10px] font-bold text-blue-400 uppercase tracking-widest hover:text-red-500 transition-colors">
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="p-6 border-t border-blue-50 flex items-center justify-between">
                    <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">
                        Showing {categoryList.length} of {totalCount} categories
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="px-3 py-1 bg-white border border-blue-200 rounded text-[10px] font-bold uppercase text-blue-400 hover:bg-blue-50 disabled:opacity-30"
                        >
                            Prev
                        </button>
                        <span className="px-3 py-1 bg-blue-900 text-white rounded text-[10px] font-bold uppercase">
                            {page}
                        </span>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages || totalPages === 0}
                            className="px-3 py-1 bg-white border border-blue-200 rounded text-[10px] font-bold uppercase text-blue-400 hover:bg-blue-50 disabled:opacity-30"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
