'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useApiMutation } from '@/lib/hooks';

const passwordSchema = z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string()
        .min(8, 'New password must be at least 8 characters')
        .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
        .regex(/[0-9]/, 'Must contain at least one number')
        .regex(/[\W_]/, 'Must contain at least one special character'),
    confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
    message: "New passwords don't match",
    path: ["confirmPassword"],
});

type PasswordForm = z.infer<typeof passwordSchema>;

export default function AdminSecurityPage() {
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const { register, handleSubmit, reset, formState: { errors } } = useForm<PasswordForm>({
        resolver: zodResolver(passwordSchema),
    });

    const mutation = useApiMutation<any, any>('put', '/auth/change-password', {
        onSuccess: (data: any) => {
            setStatus('success');
            setMessage(data.message || 'Passphrase successfully updated.');
            reset();
            setTimeout(() => setStatus('idle'), 5000);
        },
        onError: (error: any) => {
            setStatus('error');
            setMessage(error.response?.data?.error || 'Failed to update passphrase.');
        }
    });

    const onSubmit = (data: PasswordForm) => {
        setStatus('idle');
        mutation.mutate({
            currentPassword: data.currentPassword,
            newPassword: data.newPassword
        });
    };

    return (
        <div className="space-y-12 animate-in fade-in duration-500">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-8 bg-blue-900 rounded-full" />
                        <h1 className="text-4xl font-black text-blue-900 tracking-tight uppercase italic">Security Protocol</h1>
                    </div>
                    <p className="text-blue-400 text-[10px] font-bold uppercase tracking-[0.3em] pl-5">Manage Administrative Access Credentials</p>
                </div>
            </div>

            <div className="max-w-2xl">
                <div className="bg-white rounded-3xl border border-blue-50 shadow-sm overflow-hidden">
                    <div className="p-8 border-b border-blue-50 bg-blue-50/30">
                        <h2 className="text-sm font-black text-blue-900 uppercase tracking-widest flex items-center gap-3">
                            <span className="material-symbols-outlined text-blue-400">lock_reset</span>
                            Update Passphrase
                        </h2>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-8">
                        {status !== 'idle' && (
                            <div className={`p-4 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-3 ${status === 'success' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                                <span className="material-symbols-outlined text-base">
                                    {status === 'success' ? 'check_circle' : 'error'}
                                </span>
                                {message}
                            </div>
                        )}

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-blue-400 px-1">Current Passphrase</label>
                                <input
                                    {...register('currentPassword')}
                                    type="password"
                                    className="w-full bg-blue-50/50 border border-blue-100 rounded-xl px-4 py-4 focus:bg-white focus:ring-4 focus:ring-blue-900/5 transition-all outline-none text-sm font-bold text-blue-900"
                                    placeholder="••••••••"
                                />
                                {errors.currentPassword && <p className="text-red-500 text-[10px] font-bold px-1 mt-1">{errors.currentPassword.message}</p>}
                            </div>

                            <hr className="border-blue-50" />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-blue-400 px-1">New Passphrase</label>
                                    <input
                                        {...register('newPassword')}
                                        type="password"
                                        className="w-full bg-blue-50/50 border border-blue-100 rounded-xl px-4 py-4 focus:bg-white focus:ring-4 focus:ring-blue-900/5 transition-all outline-none text-sm font-bold text-blue-900"
                                        placeholder="••••••••"
                                    />
                                    {errors.newPassword && <p className="text-red-500 text-[10px] font-bold px-1 mt-1">{errors.newPassword.message}</p>}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-blue-400 px-1">Verify New Passphrase</label>
                                    <input
                                        {...register('confirmPassword')}
                                        type="password"
                                        className="w-full bg-blue-50/50 border border-blue-100 rounded-xl px-4 py-4 focus:bg-white focus:ring-4 focus:ring-blue-900/5 transition-all outline-none text-sm font-bold text-blue-900"
                                        placeholder="••••••••"
                                    />
                                    {errors.confirmPassword && <p className="text-red-500 text-[10px] font-bold px-1 mt-1">{errors.confirmPassword.message}</p>}
                                </div>
                            </div>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={mutation.isPending}
                                className="w-full md:w-auto px-12 py-4 bg-blue-900 text-white rounded-xl font-bold text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-blue-900/10 hover:bg-blue-800 transition-all active:scale-[0.98] disabled:opacity-50"
                            >
                                {mutation.isPending ? 'Propagating Changes...' : 'Authorize Update'}
                            </button>
                        </div>
                    </form>
                </div>

                <div className="mt-8 p-6 bg-blue-50/50 rounded-2xl border border-blue-100 flex gap-4">
                    <span className="material-symbols-outlined text-blue-400">info</span>
                    <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest leading-relaxed">
                        Security Notice: Strong passphrases should be at least 12 characters long and contain a mix of symbols, numbers, and capital letters. Avoid reusing keys across different nodes.
                    </p>
                </div>
            </div>
        </div>
    );
}
