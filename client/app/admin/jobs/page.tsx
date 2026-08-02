'use client';

import React, { useState, useEffect } from 'react';
import { useApiQuery, useApiMutation } from '@/lib/hooks';
import Link from 'next/link';
import { JobListing, JobCategory } from '@/types/models';
import { useQueryClient } from '@tanstack/react-query';

export default function AdminJobsPage() {
    const queryClient = useQueryClient();
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [page, setPage] = useState(1);
    const [selectedCategory, setSelectedCategory] = useState<number | undefined>(undefined);
    const [sortBy, setSortBy] = useState<string>('createdAt');
    const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');
    const limit = 10;

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const { data: stats } = useApiQuery<any>(['admin', 'jobs', 'stats'], '/admin/jobs/stats');
    const { data: categoriesResult } = useApiQuery<{ rows: JobCategory[], count: number }>(['admin', 'categories', 'all'], '/admin/categories?limit=1000');
    const categories = categoriesResult?.rows || [];

    const { data: jobs, isLoading, refetch } = useApiQuery<{ rows: JobListing[], count: number }>(
        ['admin', 'jobs', 'list', String(page), debouncedSearch, selectedCategory, sortBy, sortOrder],
        `/admin/jobs?limit=${limit}&offset=${(page - 1) * limit}${debouncedSearch ? `&searchQuery=${encodeURIComponent(debouncedSearch.trim())}` : ''}${selectedCategory ? `&categoryId=${selectedCategory}` : ''}${sortBy ? `&sortBy=${sortBy}&sortOrder=${sortOrder}` : ''}`
    );

    const toggleStatusMutation = useApiMutation<any, any>('put', '/admin/jobs/:id', {
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'jobs'] });
        }
    });

    const deleteMutation = useApiMutation<any, any>('delete', '/admin/jobs/:id', {
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'jobs'] });
            refetch();
        }
    });

    const jobList = jobs?.rows || [];
    const totalListings = jobs?.count || 0;
    const totalPages = Math.ceil(totalListings / limit);

    const handleToggleStatus = (id: number, currentStatus: boolean) => {
        toggleStatusMutation.mutate({ data: { isActive: !currentStatus }, params: { id } });
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this job?')) return;
        try {
            await deleteMutation.mutateAsync({ params: { id } });
        } catch (err) {
            console.error(err);
        }
    };

    const toggleSort = (column: string) => {
        if (sortBy === column) {
            setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
        } else {
            setSortBy(column);
            setSortOrder('DESC');
        }
        setPage(1);
    };

    return (
        <div className="font-sans">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-blue-900 tracking-tight">Job Postings</h1>
                    <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mt-1">Overview of all active job listings</p>
                </div>
                <div className="flex items-center gap-4">
                    <input
                        className="px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg text-sm focus:bg-white outline-none focus:ring-2 focus:ring-blue-900/5 transition-all w-64"
                        placeholder="Search jobs..."
                        type="text"
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setPage(1);
                        }}
                    />
                    <Link href="/admin/jobs/new">
                        <button className="bg-blue-900 text-white px-5 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-blue-800 transition-all shadow-lg shadow-blue-900/10">
                            Add Job
                        </button>
                    </Link>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-blue-100 overflow-hidden shadow-sm">
                <div className="p-4 border-b border-blue-50 bg-blue-50/50">
                    <select
                        value={selectedCategory || ''}
                        onChange={(e) => {
                            setSelectedCategory(e.target.value ? parseInt(e.target.value) : undefined);
                            setPage(1);
                        }}
                        className="px-4 py-2 bg-white border border-blue-200 rounded-lg text-[10px] font-bold uppercase tracking-widest outline-none focus:ring-2 focus:ring-blue-900/5"
                    >
                        <option value="">All Categories</option>
                        {categories?.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white">
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-blue-400 cursor-pointer" onClick={() => toggleSort('title')}>Title</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-blue-400">Category</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-blue-400">Location</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-blue-400">Salary</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-blue-400 text-center">Status</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-blue-400 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-blue-50">
                            {isLoading ? (
                                <tr className="animate-pulse h-28"><td colSpan={5} className="bg-blue-50/10"></td></tr>
                            ) : jobList.map((job: JobListing) => (
                                <tr key={job.id} className="hover:bg-blue-50/50 transition-all">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-blue-900 text-white flex items-center justify-center font-bold text-xs uppercase">
                                                {job.title.charAt(0)}
                                            </div>
                                            <span className="text-sm font-medium text-blue-900">{job.title}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">
                                            {job.JobCategory?.name}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <p className="text-sm text-blue-600">{job.location}</p>
                                        <p className="text-[9px] text-blue-400 font-bold uppercase">{job.employmentType}</p>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className="text-sm font-bold text-emerald-600">{job.salary || 'Undisclosed'}</span>
                                    </td>
                                    <td className="px-6 py-5 text-center">
                                        <button
                                            onClick={() => handleToggleStatus(job.id, job.isActive)}
                                            disabled={toggleStatusMutation.isPending}
                                            className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-all duration-300 ${job.isActive ? 'bg-blue-900' : 'bg-blue-200'}`}
                                        >
                                            <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white transition duration-300 ease-in-out ${job.isActive ? 'translate-x-4' : 'translate-x-0'}`}></span>
                                        </button>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <div className="flex justify-end gap-3">
                                            <Link href={`/admin/jobs/${job.id}`} className="text-[10px] font-bold text-blue-400 uppercase tracking-widest hover:text-blue-900 transition-colors">
                                                View
                                            </Link>
                                            <Link href={`/admin/jobs/${job.id}/edit`} className="text-[10px] font-bold text-blue-400 uppercase tracking-widest hover:text-blue-900">
                                                Edit
                                            </Link>
                                            <button onClick={() => handleDelete(job.id)} className="text-[10px] font-bold text-blue-400 uppercase tracking-widest hover:text-red-600">
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
                        Showing {jobList.length} of {totalListings} jobs
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
