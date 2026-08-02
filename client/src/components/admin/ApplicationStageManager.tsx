'use client';

import React, { useState } from 'react';
import { useApiMutation, useApiQuery } from '@/lib/hooks';
import { JobStage } from '@/types/models';

interface StageManagerProps {
    applicationId: number;
    initialStages?: JobStage[];
    onRefresh: () => void;
}

export function ApplicationStageManager({ applicationId, initialStages = [], onRefresh }: StageManagerProps) {
    const [isEditing, setIsEditing] = useState<number | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    const [formData, setFormData] = useState<any>({});

    const addStageMutation = useApiMutation('post', '/admin/applications/:id/stages');
    const updateStageMutation = useApiMutation('put', '/admin/applications/:id/stages/:stageId');
    const deleteStageMutation = useApiMutation('delete', '/admin/applications/:id/stages/:stageId');

    const handleAdd = async () => {
        try {
            await addStageMutation.mutateAsync({
                params: { id: applicationId },
                body: { ...formData, applicationId }
            });
            setIsAdding(false);
            setFormData({ shouldNotify: true });
            onRefresh();
        } catch (error) {
            alert('Failure adding stage.');
        }
    };

    const handleUpdate = async (stageId: number) => {
        try {
            await updateStageMutation.mutateAsync({
                params: { id: applicationId, stageId },
                body: formData
            });
            setIsEditing(null);
            setFormData({ shouldNotify: true });
            onRefresh();
        } catch (error) {
            alert('Failed to update stage details.');
        }
    };

    const handleDelete = async (stageId: number) => {
        if (confirm('Permanently delete this stage from the application workflow?')) {
            try {
                await deleteStageMutation.mutateAsync({ params: { id: applicationId, stageId } });
                onRefresh();
            } catch (error) {
                alert('Deletion failed: system dependency or access error.');
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-900 flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm font-bold">account_tree</span>
                    Process Configuration
                </h3>
                {!isAdding && (
                    <button
                        onClick={() => { setIsAdding(true); setFormData({ orderPosition: initialStages.length + 1, shouldNotify: true }); }}
                        className="bg-blue-900 text-white px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] hover:bg-black transition-all shadow-lg shadow-blue-900/10 active:scale-95 flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-xs font-bold">add</span>
                        Add Stage
                    </button>
                )}
            </div>

            <div className="space-y-4">
                {/* Add Form */}
                {isAdding && (
                    <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100 space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                        <div className="grid grid-cols-2 gap-4">
                            <InputField label="Stage Name" value={formData.name || ''} onChange={(v) => setFormData({ ...formData, name: v })} />
                            <InputField label="Position" type="number" value={formData.orderPosition || ''} onChange={(v) => setFormData({ ...formData, orderPosition: parseInt(v) })} />
                            <div className="col-span-2">
                                <InputField label="Description" value={formData.description || ''} onChange={(v) => setFormData({ ...formData, description: v })} />
                            </div>
                            <InputField label="Amt" type="number" value={formData.amount || ''} onChange={(v) => setFormData({ ...formData, amount: parseFloat(v) })} />
                            <InputField label="Curr" value={formData.currency || 'USD'} onChange={(v) => setFormData({ ...formData, currency: v })} />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 pt-2">
                            <label className="flex items-center gap-2 cursor-pointer p-2 bg-white rounded-lg border border-blue-100">
                                <input type="checkbox" checked={formData.setAsCurrent || false} onChange={(e) => setFormData({ ...formData, setAsCurrent: e.target.checked })} className="w-3 h-3 rounded text-blue-900 focus:ring-blue-900" />
                                <span className="text-[9px] font-black uppercase tracking-widest text-blue-900">Activate Stage</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer p-2 bg-white rounded-lg border border-blue-100">
                                <input type="checkbox" checked={formData.shouldNotify ?? true} onChange={(e) => setFormData({ ...formData, shouldNotify: e.target.checked })} className="w-3 h-3 rounded text-blue-900 focus:ring-blue-900" />
                                <span className="text-[9px] font-black uppercase tracking-widest text-blue-900">Notify Applicant</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer p-2 bg-white rounded-lg border border-blue-100 col-span-2">
                                <input type="checkbox" checked={formData.requiresPayment || false} onChange={(e) => setFormData({ ...formData, requiresPayment: e.target.checked })} className="w-3 h-3 rounded text-blue-900 focus:ring-blue-900" />
                                <span className="text-[9px] font-black uppercase tracking-widest text-blue-900">Requires Payment</span>
                            </label>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-blue-100">
                            <button onClick={() => setIsAdding(false)} className="px-4 py-2 text-[9px] font-black uppercase tracking-widest text-blue-400 hover:text-blue-900">Cancel</button>
                            <button onClick={handleAdd} className="bg-blue-900 text-white px-6 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-black">Confirm Add</button>
                        </div>
                    </div>
                )}

                {/* Stages List */}
                {initialStages.sort((a, b) => a.orderPosition - b.orderPosition).map((stage) => (
                    <div key={stage.id} className="group relative bg-white p-6 rounded-2xl border border-blue-50 hover:border-blue-200 transition-all shadow-sm hover:shadow-xl hover:shadow-blue-900/5">
                        {isEditing === stage.id ? (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <InputField label="Stage Name" value={formData.name || ''} onChange={(v) => setFormData({ ...formData, name: v })} />
                                    <InputField label="Position" type="number" value={formData.orderPosition || ''} onChange={(v) => setFormData({ ...formData, orderPosition: parseInt(v) })} />
                                    <div className="col-span-2">
                                        <InputField label="Description" value={formData.description || ''} onChange={(v) => setFormData({ ...formData, description: v })} />
                                    </div>
                                    <InputField label="Amt" type="number" value={formData.amount || ''} onChange={(v) => setFormData({ ...formData, amount: parseFloat(v) })} />
                                    <InputField label="Curr" value={formData.currency || 'USD'} onChange={(v) => setFormData({ ...formData, currency: v })} />
                                </div>
                                <div className="flex justify-end gap-3 pt-4 border-t border-blue-100">
                                    <button onClick={() => setIsEditing(null)} className="px-4 py-2 text-[9px] font-black uppercase tracking-widest text-blue-400">Cancel</button>
                                    <button onClick={() => handleUpdate(stage.id)} className="bg-blue-900 text-white px-6 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest">Save Changes</button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <span className="w-5 h-5 bg-blue-50 text-blue-900 rounded-md flex items-center justify-center text-[10px] font-black italic">{stage.orderPosition}</span>
                                        <h4 className="text-xs font-black uppercase tracking-tight text-blue-900">{stage.name}</h4>
                                        {stage.requiresPayment && (
                                            <span className="px-2 py-0.5 bg-amber-50 text-amber-600 rounded text-[8px] font-black uppercase tracking-widest border border-amber-100">Paid: {stage.currency} {stage.amount}</span>
                                        )}
                                    </div>
                                    <p className="text-[11px] font-bold text-blue-400 uppercase tracking-tight leading-relaxed">{stage.description}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => { setIsEditing(stage.id); setFormData(stage); }}
                                        className="p-2 text-blue-400 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-all"
                                    >
                                        <span className="material-symbols-outlined text-sm">edit</span>
                                    </button>
                                    <button
                                        onClick={() => handleDelete(stage.id)}
                                        className="p-2 text-blue-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                    >
                                        <span className="material-symbols-outlined text-sm">delete</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

function InputField({ label, value, onChange, type = 'text' }: { label: string, value: any, onChange: (v: string) => void, type?: string }) {
    return (
        <div className="space-y-1">
            <label className="text-[8px] font-black uppercase tracking-widest text-blue-400">{label}</label>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full bg-white border border-blue-100 rounded-lg px-3 py-2 text-xs font-bold text-blue-900 focus:outline-none focus:border-blue-900 transition-colors"
            />
        </div>
    );
}
