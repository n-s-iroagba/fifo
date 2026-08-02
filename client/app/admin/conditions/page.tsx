'use client'
import { useState } from 'react';
import { useApiQuery, useApiMutation } from '@/lib/hooks';
import { JobCondition, JobCategory } from '@/types/models';
import Link from 'next/link';

export default function ConditionsManagementPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryId, setCategoryId] = useState<string | number>('');
    const [page, setPage] = useState(1);
    const limit = 10;

    const { data: categoriesResult } = useApiQuery<{ rows: JobCategory[], count: number }>(['admin', 'categories'], '/admin/categories?limit=1000');
    const categories = categoriesResult?.rows || [];

    const { data: conditions, isLoading, refetch } = useApiQuery<{ rows: JobCondition[], count: number }>(
        ['admin', 'conditions', 'list', String(page), searchQuery, String(categoryId)],
        `/admin/conditions?limit=${limit}&offset=${(page - 1) * limit}${searchQuery ? `&searchQuery=${encodeURIComponent(searchQuery)}` : ''}${categoryId ? `&categoryId=${categoryId}` : ''}`
    );

    const deleteMutation = useApiMutation<number, any>('delete', '/admin/conditions', {
        onSuccess: () => refetch()
    });

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure?')) return;
        try {
            await deleteMutation.mutateAsync(id);
        } catch (err) { console.error(err); }
    };

    if (isLoading) return <div className="p-12 text-center text-[10px] font-bold uppercase tracking-widest text-blue-400">Loading Conditions...</div>;

    const conditionsList = conditions?.rows || [];
    const totalCount = conditions?.count || 0;
    const totalPages = Math.ceil(totalCount / limit);

    return (
        <div className="font-sans">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-blue-900 tracking-tight">Conditions</h1>
                    <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mt-1">Manage standard job prerequisites</p>
                </div>
                <div className="flex items-center gap-4 flex-wrap">
                    <input
                        className="px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg text-sm focus:bg-white outline-none focus:ring-2 focus:ring-blue-900/5 transition-all w-48"
                        placeholder="Search conditions..."
                        type="text"
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setPage(1);
                        }}
                    />
                    <select
                        className="px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg text-xs font-bold uppercase tracking-widest outline-none focus:bg-white focus:ring-2 focus:ring-blue-900/5 transition-all"
                        value={categoryId}
                        onChange={(e) => {
                            setCategoryId(e.target.value);
                            setPage(1);
                        }}
                    >
                        <option value="">All Categories</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                    <Link href="/admin/conditions/new">
                        <button className="bg-blue-900 text-white px-5 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-blue-800 transition-all shadow-lg shadow-blue-900/10">
                            Add Condition
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
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-blue-400">Description</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-blue-400 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-blue-50">
                            {conditionsList.map((cond: JobCondition) => (
                                <tr key={cond.id} className="hover:bg-blue-50/50 transition-colors group">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                                                <span className="material-symbols-outlined text-lg">fact_check</span>
                                            </div>
                                            <span className="text-sm font-medium text-blue-900">{cond.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <p className="text-[11px] text-blue-500 line-clamp-1 max-w-sm">{cond.description}</p>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <div className="flex justify-end gap-3">
                                            <Link href={`/admin/conditions/${cond.id}`} className="text-[10px] font-bold text-blue-400 uppercase tracking-widest hover:text-blue-900 transition-colors">
                                                View
                                            </Link>
                                            <Link href={`/admin/conditions/${cond.id}/edit`} className="text-[10px] font-bold text-blue-400 uppercase tracking-widest hover:text-blue-600 transition-colors">
                                                Edit
                                            </Link>
                                            <button onClick={() => handleDelete(cond.id)} className="text-[10px] font-bold text-blue-400 uppercase tracking-widest hover:text-red-500 transition-colors">
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {conditionsList.length === 0 && (
                                <tr>
                                    <td colSpan={3} className="px-6 py-12 text-center">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-blue-300">No conditions found</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="p-6 border-t border-blue-50 flex items-center justify-between">
                    <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">
                        Showing {conditionsList.length} of {totalCount} records
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

