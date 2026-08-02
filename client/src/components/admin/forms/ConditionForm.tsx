'use client'
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useApiQuery, useApiMutation } from '@/lib/hooks';
import { JobCondition, JobCategory } from '@/types/models';

interface ConditionFormProps {
    initialData?: JobCondition;
    isEdit?: boolean;
}

export default function ConditionForm({ initialData, isEdit = false }: ConditionFormProps) {
    const router = useRouter();
    const { data: categoriesResult } = useApiQuery<{ rows: JobCategory[], count: number }>(['admin', 'categories'], '/admin/categories?limit=1000');
    const categories = categoriesResult?.rows || [];

    const [name, setName] = useState(initialData?.name || '');
    const [description, setDescription] = useState(initialData?.description || '');
    const [categoryId, setCategoryId] = useState<string | number>(initialData?.categoryId || '');

    useEffect(() => {
        if (initialData) {
            setName(initialData.name);
            setDescription(initialData.description);
            setCategoryId(initialData.categoryId || '');
        }
    }, [initialData]);

    const mutation = useApiMutation(
        isEdit ? 'put' : 'post',
        isEdit ? `/admin/conditions/${initialData?.id}` : '/admin/conditions',
        {
            onSuccess: () => {
                router.push('/admin/conditions');
                router.refresh();
            }
        }
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await mutation.mutateAsync({
                name,
                description,
                categoryId: categoryId ? parseInt(categoryId.toString(), 10) : null
            });
        } catch (err) {
            alert(`Failed to ${isEdit ? 'update' : 'create'} condition`);
        }
    };

    return (
        <div className="font-sans">
            <div className="max-w-[800px]">
                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="bg-white p-6 md:p-10 rounded-2xl border border-blue-100 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="block text-[10px] font-bold text-blue-400 uppercase tracking-widest px-1">Prerequisite Name</label>
                                <input
                                    className="w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg text-sm font-medium text-blue-900 placeholder:text-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-900/5 focus:border-blue-900 transition-all outline-none"
                                    placeholder="e.g. Bachelor's Degree"
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-[10px] font-bold text-blue-400 uppercase tracking-widest px-1">Category (Optional)</label>
                                <select
                                    className="w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg text-sm font-medium text-blue-900 focus:bg-white focus:ring-2 focus:ring-blue-900/5 focus:border-blue-900 transition-all outline-none appearance-none"
                                    value={categoryId}
                                    onChange={(e) => setCategoryId(e.target.value)}
                                >
                                    <option value="">Global</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-[10px] font-bold text-blue-400 uppercase tracking-widest px-1">Description</label>
                            <textarea
                                className="w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg text-sm font-medium text-blue-900 placeholder:text-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-900/5 focus:border-blue-900 transition-all outline-none resize-none leading-relaxed"
                                placeholder="Describe this prerequisite..."
                                rows={8}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                required
                            ></textarea>
                        </div>
                    </div>

                    <div className="pt-4 flex items-center justify-end gap-4">
                        <Link href="/admin/conditions" className="text-[10px] font-bold text-blue-400 uppercase tracking-widest hover:text-blue-900 transition-all px-4">
                            Cancel
                        </Link>
                        <button
                            className="px-10 py-3 bg-blue-900 text-white font-bold text-[10px] uppercase tracking-widest rounded-lg shadow-lg shadow-blue-900/10 hover:bg-blue-800 transition-all active:scale-95 disabled:opacity-50"
                            type="submit"
                            disabled={mutation.isPending}
                        >
                            {mutation.isPending ? 'Saving...' : 'Save Condition'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
