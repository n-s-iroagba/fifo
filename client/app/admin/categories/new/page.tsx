'use client';

import Link from 'next/link';
import CategoryForm from '@/components/admin/forms/CategoryForm';

export default function CategoryFormPage() {
    return (
        <div className="font-sans">
            <div className="mb-8">
                <div className="flex items-center gap-2 mb-2">
                    <Link href="/admin/categories" className="text-blue-400 hover:text-blue-900 transition-colors">
                        <span className="material-symbols-outlined text-lg">arrow_back</span>
                    </Link>
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Categories / New</span>
                </div>
                <h1 className="text-3xl font-bold text-blue-900 tracking-tight">Create Category</h1>
            </div>

            <CategoryForm />
        </div>
    );
}
