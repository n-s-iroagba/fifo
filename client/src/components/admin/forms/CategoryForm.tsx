'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApiMutation } from '@/lib/hooks';
import Link from 'next/link';
import { JobCategory } from '@/types/models';

interface CategoryFormProps {
    initialData?: JobCategory;
    isEdit?: boolean;
}

export default function CategoryForm({ initialData, isEdit = false }: CategoryFormProps) {
    const router = useRouter();
    const [name, setName] = useState(initialData?.name || '');
    const [description, setDescription] = useState(initialData?.description || '');

    useEffect(() => {
        if (initialData) {
            setName(initialData.name);
            setDescription(initialData.description || '');
        }
    }, [initialData]);

    const mutation = useApiMutation(
        isEdit ? 'put' : 'post',
        isEdit ? `/admin/categories/${initialData?.id}` : '/admin/categories',
        {
            onSuccess: () => {
                router.push('/admin/categories');
                router.refresh();
            }
        }
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await mutation.mutateAsync({ name, description });
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="font-sans">
            <div className="max-w-[800px]">
                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="bg-white p-6 md:p-10 rounded-2xl border border-blue-100 space-y-8">
                        <div className="space-y-2">
                            <label className="block text-[10px] font-bold text-blue-400 uppercase tracking-widest px-1" htmlFor="category-name">Category Name</label>
                            <input
                                className="w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg text-sm font-medium text-blue-900 placeholder:text-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-900/5 focus:border-blue-900 transition-all outline-none"
                                id="category-name"
                                name="category-name"
                                placeholder="e.g. Design"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-[10px] font-bold text-blue-400 uppercase tracking-widest px-1" htmlFor="description">Description</label>
                            <textarea
                                className="w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg text-sm font-medium text-blue-900 placeholder:text-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-900/5 focus:border-blue-900 transition-all outline-none resize-none leading-relaxed"
                                id="description"
                                name="description"
                                placeholder="Describe this category..."
                                rows={8}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                required
                            ></textarea>
                        </div>
                    </div>

                    <div className="pt-4 flex items-center justify-end gap-4">
                        <Link href="/admin/categories" className="text-[10px] font-bold text-blue-400 uppercase tracking-widest hover:text-blue-900 transition-all px-4">
                            Cancel
                        </Link>
                        <button
                            className="px-10 py-3 bg-blue-900 text-white font-bold text-[10px] uppercase tracking-widest rounded-lg shadow-lg shadow-blue-900/10 hover:bg-blue-800 transition-all active:scale-95 disabled:opacity-50"
                            type="submit"
                            disabled={mutation.isPending}
                        >
                            {mutation.isPending ? 'Saving...' : 'Save Category'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
