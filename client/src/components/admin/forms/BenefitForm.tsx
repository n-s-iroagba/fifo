'use client';

import { JobBenefit, JobCategory } from '@/types/models';
import { useApiQuery, useApiMutation } from '@/lib/hooks';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';

interface BenefitFormProps {
    initialData?: JobBenefit;
    isEdit?: boolean;
}

export default function BenefitForm({ initialData, isEdit = false }: BenefitFormProps) {
    const router = useRouter();
    const { data: categoriesResult } = useApiQuery<{ rows: JobCategory[], count: number }>(['admin', 'categories'], '/admin/categories?limit=1000');
    const categories = categoriesResult?.rows || [];

    const [type, setType] = useState(initialData?.benefitType || 'Salary & Wages');
    const [value, setValue] = useState(initialData?.value || '');
    const [description, setDescription] = useState(initialData?.description || '');
    const [categoryId, setCategoryId] = useState<string | number>(initialData?.categoryId || '');

    useEffect(() => {
        if (initialData) {
            setType(initialData.benefitType);
            setValue(initialData.value || '');
            setDescription(initialData.description);
            setCategoryId(initialData.categoryId || '');
        }
    }, [initialData]);

    const mutation = useApiMutation(
        isEdit ? 'put' : 'post',
        isEdit ? `/admin/benefits/${initialData?.id}` : '/admin/benefits',
        {
            onSuccess: () => {
                router.push('/admin/benefits');
                router.refresh();
            }
        }
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await mutation.mutateAsync({
                benefitType: type,
                value,
                description,
                categoryId: categoryId ? parseInt(categoryId.toString(), 10) : null
            });
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="font-sans">
            <div className="max-w-[800px]">
                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="bg-white p-6 md:p-10 rounded-2xl border border-blue-100 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="block text-[10px] font-bold text-blue-400 uppercase tracking-widest px-1">Benefit Type</label>
                                <select
                                    className="w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg text-sm font-medium text-blue-900 focus:bg-white focus:ring-2 focus:ring-blue-900/5 focus:border-blue-900 transition-all outline-none appearance-none"
                                    value={type}
                                    onChange={(e) => setType(e.target.value)}
                                    required
                                >
                                    <option value="Salary & Wages">Salary & Wages</option>
                                    <option value="Paid Time Off">Paid Time Off</option>
                                    <option value="Health & Medical">Health & Medical</option>
                                    <option value="Retirement">Retirement</option>
                                    <option value="Performance Bonus">Performance Bonus</option>
                                    <option value="Equity & Stock">Equity & Stock Options</option>
                                    <option value="Utility">Utility / Stipends</option>
                                </select>
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
                            <label className="block text-[10px] font-bold text-blue-400 uppercase tracking-widest px-1">Benefit Value</label>
                            <input
                                className="w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg text-sm font-medium text-blue-900 placeholder:text-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-900/5 focus:border-blue-900 transition-all outline-none"
                                placeholder="e.g. $150,000 / year"
                                type="text"
                                value={value}
                                onChange={(e) => setValue(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-[10px] font-bold text-blue-400 uppercase tracking-widest px-1">Description</label>
                            <textarea
                                className="w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg text-sm font-medium text-blue-900 placeholder:text-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-900/5 focus:border-blue-900 transition-all outline-none resize-none leading-relaxed"
                                placeholder="Describe this benefit..."
                                rows={6}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                required
                            ></textarea>
                        </div>
                    </div>

                    <div className="pt-4 flex items-center justify-end gap-4">
                        <Link href="/admin/benefits" className="text-[10px] font-bold text-blue-400 uppercase tracking-widest hover:text-blue-900 transition-all px-4">
                            Cancel
                        </Link>
                        <button
                            className="px-10 py-3 bg-blue-900 text-white font-bold text-[10px] uppercase tracking-widest rounded-lg shadow-lg shadow-blue-900/10 hover:bg-blue-800 transition-all active:scale-95 disabled:opacity-50"
                            type="submit"
                            disabled={mutation.isPending}
                        >
                            {mutation.isPending ? 'Saving...' : 'Save Benefit'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
