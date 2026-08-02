'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApiMutation } from '@/lib/hooks';
import { useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { CONSTANTS } from '@/constants';
import { BankAccount } from '@/types/models';

interface BankAccountFormProps {
    initialData?: BankAccount;
    isEdit?: boolean;
}

export default function BankAccountForm({ initialData, isEdit = false }: BankAccountFormProps) {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [bankName, setBankName] = useState(initialData?.bankName || '');
    const [accountNumber, setAccountNumber] = useState(initialData?.accountNumber || '');
    const [accountType, setAccountType] = useState(initialData?.accountType || CONSTANTS.BANK_ACCOUNT_TYPES.NORMAL);
    const [routingCode, setRoutingCode] = useState(initialData?.routingCode || '');
    const [currency, setCurrency] = useState(initialData?.currency || 'USD');
    const [isActive, setIsActive] = useState(initialData?.isActive ?? true);


    useEffect(() => {
        if (initialData) {
            setBankName(initialData.bankName);
            setAccountNumber(initialData.accountNumber);
            setAccountType(initialData.accountType);
            setRoutingCode(initialData.routingCode || '');
            setCurrency(initialData.currency);
            setIsActive(initialData.isActive);

        }
    }, [initialData]);

    const mutation = useApiMutation(
        isEdit ? 'put' : 'post',
        isEdit ? `/admin/bank-accounts/${initialData?.id}` : '/admin/bank-accounts',
        {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['admin', 'bank-accounts'] });
                router.push('/admin/bank-accounts');
            }
        }
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await mutation.mutateAsync({
                bankName,
                accountNumber,
                accountType,
                routingCode,
                currency,
                isActive,
            });
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="bg-white rounded-2xl border border-blue-100 overflow-hidden text-blue-900 font-sans">
            <div className="p-6 md:p-10">
                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="space-y-2">
                        <label className="block text-[10px] font-bold text-blue-400 uppercase tracking-widest px-1" htmlFor="bank_name">Bank Name</label>
                        <input
                            className="w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg text-sm font-medium text-blue-900 placeholder:text-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-900/5 focus:border-blue-900 transition-all outline-none"
                            id="bank_name"
                            placeholder="e.g. JPMorgan Chase"
                            type="text"
                            value={bankName}
                            onChange={(e) => setBankName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="block text-[10px] font-bold text-blue-400 uppercase tracking-widest px-1" htmlFor="account_number">Account Number</label>
                            <input
                                className="w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg text-sm font-medium text-blue-900 placeholder:text-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-900/5 focus:border-blue-900 transition-all outline-none"
                                id="account_number"
                                placeholder="..."
                                type="text"
                                value={accountNumber}
                                onChange={(e) => setAccountNumber(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-[10px] font-bold text-blue-400 uppercase tracking-widest px-1" htmlFor="account_type">Account Type</label>
                            <select
                                className="w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg text-sm font-medium text-blue-900 focus:bg-white focus:ring-2 focus:ring-blue-900/5 focus:border-blue-900 transition-all outline-none appearance-none"
                                id="account_type"
                                value={accountType}
                                onChange={(e) => setAccountType(e.target.value)}
                            >
                                <option value={CONSTANTS.BANK_ACCOUNT_TYPES.NORMAL}>Standard / Normal</option>
                                <option value={CONSTANTS.BANK_ACCOUNT_TYPES.OPEN_BENEFICIARY}>Open Beneficiary</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="block text-[10px] font-bold text-blue-400 uppercase tracking-widest px-1" htmlFor="routing_code">Routing / Sort Code</label>
                            <input
                                className="w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg text-sm font-medium text-blue-900 placeholder:text-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-900/5 focus:border-blue-900 transition-all outline-none"
                                id="routing_code"
                                placeholder="..."
                                type="text"
                                value={routingCode}
                                onChange={(e) => setRoutingCode(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-[10px] font-bold text-blue-400 uppercase tracking-widest px-1" htmlFor="currency">Currency Code</label>
                            <select
                                className="w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg text-sm font-medium text-blue-900 focus:bg-white focus:ring-2 focus:ring-blue-900/5 focus:border-blue-900 transition-all outline-none appearance-none"
                                id="currency"
                                value={currency}
                                onChange={(e) => setCurrency(e.target.value)}
                            >
                                <option value="USD">USD</option>
                                <option value="EUR">EUR</option>
                                <option value="GBP">GBP</option>
                                <option value="SGD">SGD</option>

                            </select>
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-100">
                        <div>
                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-blue-900">Active Status</h4>
                            <p className="text-[9px] font-bold text-blue-400 uppercase tracking-[0.2em] mt-1">Enable for public usage</p>
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



                    <div className="pt-8 flex items-center justify-end gap-4 border-t border-blue-50">
                        <Link href="/admin/bank-accounts" className="text-[10px] font-bold text-blue-400 uppercase tracking-widest hover:text-blue-900 transition-all px-4">
                            Cancel
                        </Link>
                        <button
                            className="px-8 py-3 bg-blue-900 text-white font-bold text-[10px] uppercase tracking-widest rounded-lg shadow-lg shadow-blue-900/10 hover:bg-blue-800 transition-all active:scale-95 disabled:opacity-50"
                            type="submit"
                            disabled={mutation.isPending}
                        >
                            {mutation.isPending ? 'Saving...' : isEdit ? 'Update Account' : 'Save Account'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
