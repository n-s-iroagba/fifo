'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useApiMutation, useApiQuery } from '@/lib/hooks';
import Link from 'next/link';
import { JobListing, JobCategory, JobBenefit, JobCondition } from '@/types/models';

interface JobFormProps {
    initialData?: JobListing & { JobBenefits?: JobBenefit[], JobConditions?: JobCondition[] };
    isEdit?: boolean;
}

export default function JobForm({ initialData, isEdit = false }: JobFormProps) {
    const router = useRouter();
    const { data: categoriesResult } = useApiQuery<{ rows: JobCategory[], count: number }>(['admin', 'categories'], '/admin/categories?limit=1000');
    const categories = categoriesResult?.rows || [];

    const { data: benefitsResult } = useApiQuery<{ rows: JobBenefit[], count: number }>(['admin', 'benefits'], '/admin/benefits');
    const { data: conditionsResult } = useApiQuery<{ rows: JobCondition[], count: number }>(['admin', 'conditions'], '/admin/conditions');

    const allBenefits = benefitsResult?.rows || [];
    const allConditions = conditionsResult?.rows || [];

    const [title, setTitle] = useState(initialData?.title || '');
    const [categoryId, setCategoryId] = useState(initialData?.categoryId || '');
    const [employmentType, setEmploymentType] = useState(initialData?.employmentType || 'Full-time');
    const [location, setLocation] = useState(initialData?.location || '');
    const [description, setDescription] = useState(initialData?.description || '');
    const [requirements, setRequirements] = useState(initialData?.requirements || '');
    const [isActive, setIsActive] = useState(initialData?.isActive ?? true);
    const [salary, setSalary] = useState(initialData?.salary || '');
    const [jobType, setJobType] = useState<'NORMAL' | 'APEX'>(initialData?.jobType || 'NORMAL');

    const [selectedBenefits, setSelectedBenefits] = useState<number[]>(
        initialData?.JobBenefits?.map(b => b.id) || []
    );
    const [selectedConditions, setSelectedConditions] = useState<number[]>(
        initialData?.JobConditions?.map(c => c.id) || []
    );

    const [company, setCompany] = useState(initialData?.company || '');
    const [visaSponsorship, setVisaSponsorship] = useState(initialData?.visaSponsorship || false);

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [categorySearch, setCategorySearch] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (initialData) {
            setTitle(initialData.title);
            setCategoryId(initialData.categoryId);
            setEmploymentType(initialData.employmentType);
            setLocation(initialData.location as string);
            setDescription(initialData.description);
            setRequirements(initialData.requirements || '');
            setIsActive(initialData.isActive);
            setSalary(initialData.salary || '');
            setCompany(initialData.company || '');
            setVisaSponsorship(initialData.visaSponsorship || false);
            setJobType(initialData.jobType || 'NORMAL');
            setSelectedBenefits(initialData.JobBenefits?.map(b => b.id) || []);
            setSelectedConditions(initialData.JobConditions?.map(c => c.id) || []);
        }
    }, [initialData]);

    const mutation = useApiMutation(
        isEdit ? 'put' : 'post',
        isEdit ? `/admin/jobs/${initialData?.id}` : '/admin/jobs',
        {
            onSuccess: () => {
                router.push('/admin/jobs');
                router.refresh();
            }
        }
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!categoryId) {
            alert('Please select a category.');
            return;
        }
        try {
            await mutation.mutateAsync({
                title,
                categoryId: parseInt(categoryId.toString(), 10),
                employmentType,
                location,
                description,
                requirements,
                isActive,
                salary,
                company,
                visaSponsorship,
                jobType,
                benefitsIds: selectedBenefits,
                conditionsIds: selectedConditions
            });
        } catch (err) {
            console.error(err);
        }
    };

    return (

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-sans">
            <div className="lg:col-span-8 space-y-6">
                <div className="bg-white p-6 md:p-10 rounded-2xl border border-blue-100 space-y-8">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-blue-400 uppercase tracking-widest px-1">Job Title</label>
                        <input
                            className="w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg text-sm font-medium text-blue-900 placeholder:text-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-900/5 focus:border-blue-900 transition-all outline-none"
                            placeholder="e.g. Senior Software Engineer"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2 relative" ref={dropdownRef}>
                            <label className="text-[10px] font-bold text-blue-400 uppercase tracking-widest px-1">Category</label>
                            <button
                                type="button"
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg text-sm font-medium text-blue-900 focus:bg-white focus:ring-2 focus:ring-blue-900/5 focus:border-blue-900 transition-all outline-none text-left flex justify-between items-center"
                            >
                                <span>
                                    {categories.find(c => c.id.toString() === categoryId.toString())?.name || 'Select Category'}
                                </span>
                                <span className="material-symbols-outlined text-sm text-blue-400 transition-transform duration-200" style={{ transform: isDropdownOpen ? 'rotate(180deg)' : 'none' }}>
                                    keyboard_arrow_down
                                </span>
                            </button>

                            {isDropdownOpen && (
                                <div className="absolute z-50 w-full mt-1 bg-white border border-blue-200 rounded-xl shadow-xl p-2 space-y-2">
                                    <div className="flex items-center gap-2 px-2 py-1.5 bg-blue-50/50 rounded-lg border border-blue-100">
                                        <span className="material-symbols-outlined text-sm text-blue-400">search</span>
                                        <input
                                            type="text"
                                            className="w-full bg-transparent text-xs outline-none text-blue-900 placeholder:text-blue-300 font-semibold"
                                            placeholder="Search categories..."
                                            value={categorySearch}
                                            onChange={(e) => setCategorySearch(e.target.value)}
                                        />
                                        {categorySearch && (
                                            <button type="button" onClick={() => setCategorySearch('')} className="text-blue-400 hover:text-blue-950">
                                                <span className="material-symbols-outlined text-xs">close</span>
                                            </button>
                                        )}
                                    </div>
                                    <div className="max-h-48 overflow-y-auto space-y-1 pr-1 scrollbar-thin">
                                        {categories
                                            .filter(cat => cat.name.toLowerCase().includes(categorySearch.toLowerCase()))
                                            .map(cat => {
                                                const isSelected = cat.id.toString() === categoryId.toString();
                                                return (
                                                    <button
                                                        key={cat.id}
                                                        type="button"
                                                        onClick={() => {
                                                            setCategoryId(cat.id.toString());
                                                            setIsDropdownOpen(false);
                                                            setCategorySearch('');
                                                        }}
                                                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all flex justify-between items-center ${
                                                            isSelected 
                                                            ? 'bg-blue-900 text-white shadow-md' 
                                                            : 'text-blue-900 hover:bg-blue-50/70'
                                                        }`}
                                                    >
                                                        <span>{cat.name}</span>
                                                        {isSelected && (
                                                            <span className="material-symbols-outlined text-xs text-blue-200">check</span>
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        {categories.filter(cat => cat.name.toLowerCase().includes(categorySearch.toLowerCase())).length === 0 && (
                                            <p className="text-[10px] text-blue-400 font-bold text-center py-4 uppercase tracking-widest">No categories match</p>
                                        )}
                                    </div>
                                </div>
                            )}
                            <input type="hidden" name="categoryId" value={categoryId} required />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-blue-400 uppercase tracking-widest px-1">Employment Type</label>
                            <select
                                className="w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg text-sm font-medium text-blue-900 focus:bg-white focus:ring-2 focus:ring-blue-900/5 focus:border-blue-900 transition-all outline-none appearance-none"
                                value={employmentType}
                                onChange={(e) => setEmploymentType(e.target.value)}
                                required
                            >
                                <option value="Full-time">Full-time</option>
                                <option value="Contract">Contract</option>
                                <option value="Part-time">Part-time</option>
                                <option value="Internship">Internship</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-blue-400 uppercase tracking-widest px-1">Job Tier</label>
                            <select
                                className="w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg text-sm font-medium text-blue-900 focus:bg-white focus:ring-2 focus:ring-blue-900/5 focus:border-blue-900 transition-all outline-none appearance-none"
                                value={jobType}
                                onChange={(e) => setJobType(e.target.value as any)}
                                required
                            >
                                <option value="NORMAL">Standard Recruitment</option>
                                <option value="APEX">Apex Network Exclusive</option>
                            </select>
                        </div>
                    </div>


                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-blue-400 uppercase tracking-widest px-1">Salary Range</label>
                    <input
                        className="w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg text-sm font-medium text-blue-900 placeholder:text-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-900/5 focus:border-blue-900 transition-all outline-none"
                        placeholder="e.g. $120,000 - $160,000"
                        type="text"
                        value={salary}
                        onChange={(e) => setSalary(e.target.value)}
                    />
                </div>

                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <div>
                        <label className="text-[10px] font-bold text-blue-900 uppercase tracking-widest block">Visa Sponsorship</label>
                        <p className="text-[9px] font-bold text-blue-400 uppercase tracking-widest mt-0.5">Offered for this position</p>
                    </div>
                    <input
                        className="w-5 h-5 accent-blue-900 cursor-pointer"
                        type="checkbox"
                        checked={visaSponsorship}
                        onChange={(e) => setVisaSponsorship(e.target.checked)}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-blue-400 uppercase tracking-widest px-1">Location</label>
                    <input
                        className="w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg text-sm font-medium text-blue-900 placeholder:text-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-900/5 focus:border-blue-900 transition-all outline-none"
                        placeholder="City, Country or Remote"
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        required
                    />
                </div>


                <div className="bg-white p-6 md:p-10 rounded-2xl border border-blue-100 space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-blue-400 uppercase tracking-widest px-1">Job Description</label>
                        <textarea
                            className="w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg text-sm font-medium text-blue-900 placeholder:text-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-900/5 focus:border-blue-900 transition-all outline-none resize-none leading-relaxed"
                            placeholder="Enter the job description..."
                            rows={10}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                        ></textarea>
                    </div>
                </div>

                <div className="bg-white p-6 md:p-10 rounded-2xl border border-blue-100 space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-blue-400 uppercase tracking-widest px-1">Requirements</label>
                        <textarea
                            className="w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg text-sm font-medium text-blue-900 placeholder:text-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-900/5 focus:border-blue-900 transition-all outline-none resize-none leading-relaxed"
                            placeholder="List requirements..."
                            rows={8}
                            value={requirements}
                            onChange={(e) => setRequirements(e.target.value)}
                            required
                        ></textarea>
                    </div>
                </div>

                <div className="bg-white p-6 md:p-10 rounded-2xl border border-blue-100 space-y-10">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-[10px] font-bold text-blue-400 uppercase tracking-widest px-1">Global Benefits Selection</label>
                            <Link href="/admin/benefits" className="text-[9px] font-bold text-blue-900 uppercase tracking-widest hover:underline">
                                Manage Benefits
                            </Link>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            {allBenefits.map(benefit => {
                                const isSelected = selectedBenefits.includes(benefit.id);
                                return (
                                    <button
                                        key={benefit.id}
                                        type="button"
                                        onClick={() => setSelectedBenefits(prev => isSelected ? prev.filter(id => id !== benefit.id) : [...prev, benefit.id])}
                                        className={`px-5 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border text-left flex flex-col gap-1 ${isSelected
                                            ? 'bg-blue-900 text-white border-blue-900 shadow-lg shadow-blue-900/10'
                                            : 'bg-white text-blue-900 border-blue-100 hover:border-blue-300 hover:bg-blue-50/50'
                                            }`}
                                    >
                                        <span className={isSelected ? 'text-blue-200' : 'text-blue-400'}>{benefit.benefitType}</span>
                                        <span>{benefit.description}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="space-y-4 border-t border-blue-50 pt-10">
                        <div className="flex items-center justify-between">
                            <label className="text-[10px] font-bold text-blue-400 uppercase tracking-widest px-1">Global Conditions Selection</label>
                            <Link href="/admin/conditions" className="text-[9px] font-bold text-blue-900 uppercase tracking-widest hover:underline">
                                Manage Conditions
                            </Link>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            {allConditions.map(condition => {
                                const isSelected = selectedConditions.includes(condition.id);
                                return (
                                    <button
                                        key={condition.id}
                                        type="button"
                                        onClick={() => setSelectedConditions(prev => isSelected ? prev.filter(id => id !== condition.id) : [...prev, condition.id])}
                                        className={`px-5 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border text-left flex flex-col gap-1 ${isSelected
                                            ? 'bg-blue-900 text-white border-blue-900 shadow-lg shadow-blue-900/10'
                                            : 'bg-white text-blue-900 border-blue-100 hover:border-blue-300 hover:bg-blue-50/50'
                                            }`}
                                    >
                                        <span className={isSelected ? 'text-blue-200' : 'text-blue-400'}>{condition.name}</span>
                                        <span>{condition.description}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            <div className="lg:col-span-4 space-y-6">
                <div className="bg-blue-50 p-6 md:p-8 rounded-2xl border border-blue-100 space-y-8 sticky top-24">
                    <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-blue-100">
                        <div>
                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-blue-900">Active Status</h4>
                            <p className="text-[9px] font-bold text-blue-400 uppercase tracking-[0.2em] mt-1">Accepting applications</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                className="sr-only peer"
                                type="checkbox"
                                checked={isActive}
                                onChange={() => setIsActive(!isActive)}
                            />
                            <div className="w-11 h-6 bg-blue-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-blue-900 transition-all after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                        </label>
                    </div>

                    <div className="flex flex-col gap-3">
                        <button
                            className="w-full py-4 bg-blue-900 text-white rounded-lg font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-blue-900/10 hover:bg-blue-800 transition-all active:scale-[0.98] disabled:opacity-50"
                            type="submit"
                            disabled={mutation.isPending}
                        >
                            {mutation.isPending ? 'Saving...' : isEdit ? 'Update Listing' : 'Publish Listing'}
                        </button>
                        <Link href="/admin/jobs" className="w-full text-center py-4 text-[10px] font-bold text-blue-400 uppercase tracking-widest hover:text-blue-900 transition-all">
                            Cancel
                        </Link>
                    </div>
                </div>
            </div>
        </form>
    );
}
