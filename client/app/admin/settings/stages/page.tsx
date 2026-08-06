'use client';

import React, { useState, useEffect } from 'react';
import { useApiQuery, useApiMutation } from '@/lib/hooks';
import api from '@/lib/api';
import Link from 'next/link';

export default function PrefillStagesPage() {
    const { data: response, isLoading, refetch } = useApiQuery<any>(
        ['admin', 'prefill-stages'],
        '/admin/prefill-stages'
    );
    const stages = response?.data || [];

    const [editingStage, setEditingStage] = useState<any>(null);
    const [name, setName] = useState('');
    const [type, setType] = useState('applicant_display');
    const [showModal, setShowModal] = useState(false);

    // Reorder State
    const [items, setItems] = useState<any[]>([]);
    const [draggedItem, setDraggedItem] = useState<number | null>(null);
    const [isReordering, setIsReordering] = useState(false);

    useEffect(() => {
        setItems([...stages].sort((a, b) => a.orderIndex - b.orderIndex));
    }, [stages]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingStage) {
                await api.put(`/admin/prefill-stages/${editingStage.id}`, { name, type });
            } else {
                await api.post('/admin/prefill-stages', { name, type });
            }
            setShowModal(false);
            setEditingStage(null);
            setName('');
            setType('applicant_display');
            refetch();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Error saving stage');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this stage?')) return;
        try {
            await api.delete(`/admin/prefill-stages/${id}`);
            refetch();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Error deleting stage');
        }
    };

    const handleDragStart = (e: React.DragEvent, index: number) => {
        setDraggedItem(index);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (draggedItem === null || draggedItem === index) return;
        const newItems = [...items];
        const dragged = newItems[draggedItem];
        newItems.splice(draggedItem, 1);
        newItems.splice(index, 0, dragged);
        setDraggedItem(index);
        setItems(newItems);
    };

    const handleDragEnd = () => {
        setDraggedItem(null);
    };

    const saveOrder = async () => {
        const pwd = prompt('Enter password to save ordering:');
        if (!pwd) return;
        setIsReordering(true);
        try {
            const reorderedData = items.map((item, idx) => ({ id: item.id, orderIndex: idx + 1 }));
            await api.post('/admin/prefill-stages/reorder', {
                password: pwd,
                stages: reorderedData
            });
            alert('Order saved successfully.');
            refetch();
        } catch (error: any) {
            alert(error.response?.data?.error || 'Failed to save order. Password may be incorrect.');
            setItems([...stages].sort((a, b) => a.orderIndex - b.orderIndex));
        } finally {
            setIsReordering(false);
        }
    };

    if (isLoading) return <div className="p-12 text-center text-[10px] font-bold uppercase tracking-widest text-blue-400">Loading Stages...</div>;

    return (
        <div className="font-sans antialiased text-blue-900 max-w-6xl mx-auto pb-24">
            <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-blue-50 pb-8">
                <div>
                    <h1 className="text-4xl font-black italic uppercase tracking-tighter text-blue-900">Prefill Stages</h1>
                    <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mt-1">Manage Application Pipeline Configuration</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={saveOrder}
                        disabled={isReordering}
                        className="bg-white text-blue-900 border-2 border-blue-900 px-6 py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-blue-50 transition-all active:scale-95 disabled:opacity-50"
                    >
                        Save Stage Order
                    </button>
                    <button
                        onClick={() => { setEditingStage(null); setName(''); setType('applicant_display'); setShowModal(true); }}
                        className="bg-blue-900 text-white px-6 py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-black transition-all shadow-xl shadow-blue-900/20 active:scale-95"
                    >
                        Add New Stage
                    </button>
                </div>
            </header>

            <div className="bg-white p-10 rounded-[2.5rem] border border-blue-100 shadow-2xl shadow-blue-900/5">
                <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest mb-6 border-b border-blue-50 pb-4">
                    Drag and drop to reorder the stages across all types. Reordering requires password authorization.
                </p>
                <div className="space-y-4">
                    {items.map((stage: any, index: number) => (
                        <div
                            key={stage.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, index)}
                            onDragOver={(e) => handleDragOver(e, index)}
                            onDragEnd={handleDragEnd}
                            className={`flex items-center justify-between p-5 rounded-2xl border transition-all cursor-move ${draggedItem === index ? 'bg-blue-50 border-blue-200 opacity-50 shadow-inner' : 'bg-white border-blue-100 hover:border-blue-300 hover:shadow-lg shadow-blue-900/5'}`}
                        >
                            <div className="flex items-center gap-6">
                                <span className="material-symbols-outlined text-blue-300">drag_indicator</span>
                                <div>
                                    <h4 className="text-sm font-black text-blue-900 uppercase tracking-tight">{stage.name}</h4>
                                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg border mt-2 inline-block ${stage.type === 'admin_display' ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'}`}>
                                        {stage.type === 'admin_display' ? 'Admin Display' : 'Applicant Display'}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => { setEditingStage(stage); setName(stage.name); setType(stage.type); setShowModal(true); }}
                                    className="p-2 rounded-xl text-blue-600 bg-blue-50 hover:bg-blue-100 transition-all text-[10px] font-black uppercase tracking-widest"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(stage.id)}
                                    className="p-2 rounded-xl text-red-600 bg-red-50 hover:bg-red-100 transition-all text-[10px] font-black uppercase tracking-widest"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                    {items.length === 0 && (
                        <div className="py-20 text-center bg-blue-50/50 rounded-[3rem] border-2 border-dashed border-blue-100">
                            <span className="material-symbols-outlined text-3xl text-blue-200 mb-2">linear_scale</span>
                            <p className="text-[9px] font-black text-blue-300 uppercase tracking-[0.3em]">No prefill stages defined</p>
                        </div>
                    )}
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-8">
                    <div className="absolute inset-0 bg-blue-900/80 backdrop-blur-xl animate-in fade-in duration-300" onClick={() => setShowModal(false)}></div>
                    <div className="relative bg-white rounded-[3rem] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-300">
                        <div className="p-10 border-b border-blue-50 flex items-center justify-between shrink-0">
                            <div>
                                <h3 className="text-xs font-black text-blue-900 uppercase tracking-[0.3em]">{editingStage ? 'Edit Stage' : 'Add New Stage'}</h3>
                                <p className="text-[9px] font-bold text-blue-400 uppercase mt-1">Configure predefined pipeline stage</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="w-10 h-10 rounded-xl hover:bg-blue-50 text-blue-400 hover:text-blue-900 transition-all flex items-center justify-center">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <form onSubmit={handleSave} className="p-10 space-y-8 overflow-y-auto custom-scrollbar">
                            <div className="space-y-2">
                                <label className="block text-[9px] font-black text-blue-400 uppercase tracking-widest">Stage Name</label>
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. Technical Interview"
                                    className="w-full px-6 py-4 bg-blue-50 border border-transparent rounded-2xl text-sm font-bold text-blue-900 focus:bg-white focus:border-blue-900 outline-none transition-all placeholder:text-blue-200"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-[9px] font-black text-blue-400 uppercase tracking-widest">Display Type</label>
                                <select
                                    required
                                    value={type}
                                    onChange={(e) => setType(e.target.value)}
                                    className="w-full px-6 py-4 bg-blue-50 border border-transparent rounded-2xl text-sm font-bold text-blue-900 focus:bg-white focus:border-blue-900 outline-none transition-all"
                                >
                                    <option value="applicant_display">Applicant Display (Visible to User)</option>
                                    <option value="admin_display">Admin Display (Internal Tracking)</option>
                                </select>
                            </div>
                            <button
                                type="submit"
                                className="w-full py-5 bg-blue-900 text-white font-black text-[10px] uppercase tracking-[0.4em] rounded-2xl hover:bg-black transition-all shadow-2xl shadow-blue-900/20 active:scale-95"
                            >
                                Save Configuration
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
