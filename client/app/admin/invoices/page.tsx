'use client';

import React, { useState, useEffect } from 'react';
import { Mail, CheckCircle2, User as UserIcon, RefreshCw, FileText, Send, DollarSign, Calculator } from 'lucide-react';
import api from '@/lib/api';

export default function AdminInvoicesPage() {
    const [applicants, setApplicants] = useState<any[]>([]);
    const [tickets, setTickets] = useState<any[]>([]);
    const [invoices, setInvoices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [dispatching, setDispatching] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');

    const [selectedUserId, setSelectedUserId] = useState('');
    const [invoiceType, setInvoiceType] = useState('aveling-partial');
    const [partAmount, setPartAmount] = useState('');
    
    const [totalCost, setTotalCost] = useState(0);
    const [calculatedSubsidy, setCalculatedSubsidy] = useState(0);
    const [finalAmountDue, setFinalAmountDue] = useState(0);
    const [calculationDone, setCalculationDone] = useState(false);
    const [exchangeRate, setExchangeRate] = useState(0.65); // Default fallback
    const [previewInvoice, setPreviewInvoice] = useState<any>(null);

    const fetchInvoices = async () => {
        try {
            const res = await api.get('/admin/invoices');
            setInvoices(res.data || []);
        } catch (e) { console.error('Failed to fetch invoices', e); }
    };

    useEffect(() => {
        Promise.all([
            api.get('/admin/users'),
            api.get('/admin/tickets'),
            fetchInvoices()
        ]).then(([usersRes, ticketsRes]) => {
            fetch('https://api.frankfurter.app/latest?from=AUD&to=USD')
                .then(r => r.json())
                .then(data => {
                    if (data?.rates?.USD) setExchangeRate(data.rates.USD);
                })
                .catch(e => console.error('Exchange rate fetch failed', e));

            setApplicants(usersRes.data?.rows || usersRes.data?.users || (Array.isArray(usersRes.data) ? usersRes.data : []));
            setTickets(ticketsRes.data || []);
            setLoading(false);
        }).catch(err => {
            console.error('Failed to load data', err);
            setLoading(false);
        });
    }, []);

    const selectedUser = applicants.find(a => a.id === parseInt(selectedUserId));

    const handleCalculate = () => {
        if (!selectedUser) return;
        
        // 1. Retrieve total cost of applicant tickets
        const userTickets = tickets.filter(t => t.applicantId === parseInt(selectedUserId));
        const cost = userTickets.reduce((sum, t) => sum + (t.price || 280), 0); // fallback 280
        setTotalCost(cost);

        // 2. Apply subsidy percentage to it
        const subsidyPercent = selectedUser.subsidyPercentage || 70; // 70% default per To_do
        const subsidyVal = cost * (subsidyPercent / 100);
        setCalculatedSubsidy(subsidyVal);

        let finalDue = 0;
        const enteredPart = parseFloat(partAmount) || 0;

        switch (invoiceType) {
            case 'aveling-partial':
                // Part Aveling: entered part amount
                finalDue = enteredPart;
                break;
            case 'aveling-complete-after-partial':
                // Full After part aveling
                finalDue = (cost - subsidyVal) - enteredPart;
                break;
            case 'second-attempt':
                // Aveling Second attempt
                finalDue = enteredPart;
                break;
            case 'aveling-complete':
                // Full Aveling - Apply 10% full discount
                const baseCostAfterSubsidy = cost - subsidyVal;
                finalDue = baseCostAfterSubsidy - (baseCostAfterSubsidy * 0.10);
                break;
            case 'visa-blue-collar':
                // Visa Blue Collar - just the entered amount
                finalDue = enteredPart;
                break;
        }

        setFinalAmountDue(Math.max(0, finalDue));
        setCalculationDone(true);
    };

    const handleDispatch = async () => {
        if (!selectedUser || !calculationDone) return;
        setDispatching(true);
        setSuccessMsg('');

        try {
            await api.post('/admin/invoices/dispatch', {
                applicantId: selectedUser.id,
                email: selectedUser.email,
                invoiceType,
                partAmount: parseFloat(partAmount || '0') * exchangeRate,
                totalCost: totalCost * exchangeRate,
                subsidyPercentage: selectedUser.subsidyPercentage || 70,
                finalAmountDue: finalAmountDue * exchangeRate
            });
            setSuccessMsg(`Invoice dispatched successfully to ${selectedUser.fullName}!`);
            fetchInvoices();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to dispatch invoice');
        } finally {
            setDispatching(false);
        }
    };

    if (loading) {
        return <div className="flex h-screen items-center justify-center font-bold text-zinc-400 uppercase tracking-widest text-xs">Loading Invoice Module...</div>;
    }

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="border-b-2 border-zinc-200 pb-5">
                <h1 className="text-3xl font-black tracking-tight text-zinc-900 flex items-center gap-3">
                    <FileText className="h-8 w-8 text-[#FFC700]" />
                    Invoice Generator
                </h1>
                <p className="mt-2 text-sm font-medium text-zinc-500">Select applicant and invoice type to calculate and dispatch the correct billing statement.</p>
            </div>

            {successMsg && (
                <div className="bg-emerald-50 border-2 border-emerald-200 p-4 rounded-xl flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    <p className="text-emerald-800 text-sm font-bold">{successMsg}</p>
                </div>
            )}

            <div className="bg-white border-2 border-zinc-200 rounded-2xl p-8 shadow-sm">
                <h2 className="text-sm font-black uppercase tracking-widest text-zinc-900 mb-6 border-b-2 border-zinc-100 pb-4 flex items-center gap-2">
                    <Calculator className="h-4 w-4 text-zinc-400" />
                    Configure Invoice
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-zinc-700 mb-2">Select Applicant</label>
                        <select
                            value={selectedUserId}
                            onChange={(e) => { setSelectedUserId(e.target.value); setCalculationDone(false); }}
                            className="w-full bg-zinc-50 border-2 border-zinc-200 p-4 rounded-xl text-sm font-bold text-zinc-900 outline-none focus:border-[#FFC700] transition-all"
                        >
                            <option value="">-- Choose Applicant --</option>
                            {applicants.map(app => (
                                <option key={app.id} value={app.id}>{app.candidateNumber || `CND-${10000 + app.id}`} - {app.fullName}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-zinc-700 mb-2">Invoice Type</label>
                        <select
                            value={invoiceType}
                            onChange={(e) => { setInvoiceType(e.target.value); setCalculationDone(false); }}
                            className="w-full bg-zinc-50 border-2 border-zinc-200 p-4 rounded-xl text-sm font-bold text-zinc-900 outline-none focus:border-[#FFC700] transition-all"
                        >
                            <option value="aveling-partial">1. Part Aveling</option>
                            <option value="aveling-complete-after-partial">2. Full After Part Aveling</option>
                            <option value="second-attempt">3. Aveling Second Attempt</option>
                            <option value="aveling-complete">4. Full Aveling</option>
                            <option value="visa-blue-collar">5. Visa & Blue Collar Processing</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-zinc-700 mb-2">
                            {invoiceType === 'visa-blue-collar' ? 'Full Amount (AUD)' : 'Part Amount (AUD)'}
                        </label>
                        <input
                            type="number"
                            value={partAmount}
                            onChange={(e) => { setPartAmount(e.target.value); setCalculationDone(false); }}
                            placeholder="e.g. 500"
                            disabled={invoiceType === 'aveling-complete'}
                            className="w-full bg-zinc-50 border-2 border-zinc-200 p-4 rounded-xl text-sm font-bold text-zinc-900 outline-none focus:border-[#FFC700] transition-all disabled:opacity-50"
                        />
                        {invoiceType === 'aveling-complete' && <p className="text-[10px] text-zinc-500 mt-2 font-bold uppercase">Automatically Calculated based on Subsidy + 10% Discount</p>}
                    </div>

                    <div className="flex items-end">
                        <button
                            onClick={handleCalculate}
                            disabled={!selectedUserId}
                            className="w-full h-[56px] inline-flex items-center justify-center gap-2 bg-zinc-900 text-white font-black text-xs rounded-xl hover:bg-zinc-800 transition-all uppercase tracking-widest shadow-md disabled:opacity-50"
                        >
                            <Calculator className="h-4 w-4" />
                            Calculate Tickets & Subsidy
                        </button>
                    </div>
                </div>

                {calculationDone && selectedUser && (
                    <div className="bg-zinc-50 border-2 border-zinc-200 rounded-xl p-6 space-y-4 mb-8">
                        <h3 className="text-xs font-black uppercase tracking-widest text-zinc-900 border-b-2 border-zinc-200 pb-3">Calculation Breakdown</h3>
                        
                        <div className="flex justify-between text-sm font-medium text-zinc-600">
                            <span>Total Ticket Cost:</span>
                            <div className="text-right">
                                <span className="font-bold text-zinc-900 block">A${totalCost.toFixed(2)}</span>
                                <span className="text-[10px] text-zinc-400">≈ ${(totalCost * exchangeRate).toFixed(2)} USDT</span>
                            </div>
                        </div>
                        
                        <div className="flex justify-between text-sm font-medium text-zinc-600">
                            <span>Applied Subsidy ({selectedUser.subsidyPercentage || 70}%):</span>
                            <div className="text-right">
                                <span className="font-bold text-emerald-600 block">-A${calculatedSubsidy.toFixed(2)}</span>
                                <span className="text-[10px] text-emerald-400">≈ -${(calculatedSubsidy * exchangeRate).toFixed(2)} USDT</span>
                            </div>
                        </div>

                        {invoiceType === 'aveling-complete-after-partial' && (
                            <div className="flex justify-between text-sm font-medium text-zinc-600">
                                <span>Part Amount Deducted:</span>
                                <div className="text-right">
                                    <span className="font-bold text-emerald-600 block">-A${(parseFloat(partAmount) || 0).toFixed(2)}</span>
                                    <span className="text-[10px] text-emerald-400">≈ -${((parseFloat(partAmount) || 0) * exchangeRate).toFixed(2)} USDT</span>
                                </div>
                            </div>
                        )}

                        {invoiceType === 'aveling-complete' && (
                            <div className="flex justify-between text-sm font-medium text-zinc-600">
                                <span>10% Full Payment Discount:</span>
                                <div className="text-right">
                                    <span className="font-bold text-emerald-600 block">-A${((totalCost - calculatedSubsidy) * 0.10).toFixed(2)}</span>
                                    <span className="text-[10px] text-emerald-400">≈ -${(((totalCost - calculatedSubsidy) * 0.10) * exchangeRate).toFixed(2)} USDT</span>
                                </div>
                            </div>
                        )}

                        <div className="pt-4 border-t-2 border-zinc-200 flex justify-between items-center">
                            <div>
                                <span className="text-sm font-black uppercase tracking-widest text-zinc-900 block">Final Amount Due:</span>
                                <span className="text-[10px] font-bold text-zinc-500 uppercase">Payable in USDT on TRC-20 Tron Network</span>
                            </div>
                            <div className="text-right">
                                <span className="text-2xl font-black text-[#FFC700] block">${(finalAmountDue * exchangeRate).toFixed(2)} USDT</span>
                                <span className="text-xs font-bold text-zinc-400">A${finalAmountDue.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                )}

                <button
                    onClick={handleDispatch}
                    disabled={!calculationDone || dispatching}
                    className="w-full inline-flex items-center justify-center gap-2 bg-[#FFC700] text-black font-black text-xs py-5 rounded-xl hover:bg-yellow-400 transition-all uppercase tracking-widest shadow-md disabled:opacity-50"
                >
                    {dispatching ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    {dispatching ? 'Dispatching...' : 'Dispatch Invoice via Email'}
                </button>
            </div>

            {/* Generated Invoices Table */}
            <div className="bg-white border-2 border-zinc-200 rounded-2xl p-8 shadow-sm">
                <h2 className="text-sm font-black uppercase tracking-widest text-zinc-900 mb-6 border-b-2 border-zinc-100 pb-4">
                    Generated Invoices History
                </h2>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-zinc-50 border-b-2 border-zinc-200">
                            <tr>
                                <th className="p-4 font-black uppercase tracking-widest text-xs text-zinc-500">Applicant</th>
                                <th className="p-4 font-black uppercase tracking-widest text-xs text-zinc-500">Purpose</th>
                                <th className="p-4 font-black uppercase tracking-widest text-xs text-zinc-500 text-right">Amount (USDT)</th>
                                <th className="p-4 font-black uppercase tracking-widest text-xs text-zinc-500">Date</th>
                                <th className="p-4 font-black uppercase tracking-widest text-xs text-zinc-500 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                            {invoices.length > 0 ? invoices.map((inv, idx) => (
                                <tr key={idx} className="hover:bg-zinc-50 transition-colors">
                                    <td className="p-4 font-bold text-zinc-900">
                                        <div className="flex items-center gap-2">
                                            <div className="h-8 w-8 rounded-full bg-zinc-200 flex items-center justify-center">
                                                <UserIcon className="h-4 w-4 text-zinc-500" />
                                            </div>
                                            <div>
                                                <div>{inv.applicant?.fullName || 'Unknown'}</div>
                                                <div className="text-[10px] text-zinc-500 font-mono">{inv.applicant?.candidateNumber}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 font-medium text-zinc-600">
                                        <span className="bg-blue-50 text-blue-800 border border-blue-200 px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest">
                                            {inv.purpose}
                                        </span>
                                    </td>
                                    <td className="p-4 font-black text-emerald-600 text-right">
                                        ${parseFloat(inv.amountInUSD || '0').toFixed(2)} USDT
                                    </td>
                                    <td className="p-4 font-medium text-zinc-500 text-xs">
                                        {new Date(inv.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end items-center gap-2">
                                            <button 
                                                onClick={() => setPreviewInvoice(inv)}
                                                className="bg-white border-2 border-zinc-200 text-zinc-600 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded hover:bg-zinc-50 transition-colors"
                                            >
                                                Preview
                                            </button>
                                            {!inv.isPaid ? (
                                                <button 
                                                    onClick={async () => {
                                                        if (!confirm('Mark this invoice as Paid and generate a receipt?')) return;
                                                        try {
                                                            await api.post(`/admin/invoices/${inv.id}/receipt`);
                                                            fetchInvoices();
                                                        } catch (e) {
                                                            alert('Failed to generate receipt');
                                                        }
                                                    }}
                                                    className="bg-zinc-900 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded hover:bg-zinc-800 transition-colors"
                                                >
                                                    Generate Receipt
                                                </button>
                                            ) : (
                                                <span className="text-emerald-600 text-[10px] font-black uppercase tracking-widest bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded flex items-center justify-end gap-1">
                                                    <CheckCircle2 className="w-3 h-3" /> Paid
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-zinc-500 font-medium text-sm">No invoices have been generated yet.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Invoice Preview Modal */}
            {previewInvoice && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="bg-zinc-900 text-white p-6 relative">
                            <button 
                                onClick={() => setPreviewInvoice(null)}
                                className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                            <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400 mb-1">Invoice Preview</h3>
                            <div className="text-2xl font-black">#{previewInvoice.id.toString().padStart(6, '0')}</div>
                        </div>
                        
                        {/* Body */}
                        <div className="p-8 space-y-8">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">Billed To</p>
                                    <p className="font-bold text-zinc-900">{previewInvoice.applicant?.fullName}</p>
                                    <p className="text-sm text-zinc-500">{previewInvoice.applicant?.email}</p>
                                    <p className="text-xs font-mono text-zinc-400 mt-1">{previewInvoice.applicant?.candidateNumber}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">Date Issued</p>
                                    <p className="font-bold text-zinc-900">{new Date(previewInvoice.createdAt).toLocaleDateString()}</p>
                                    
                                    <div className="mt-4 flex flex-col items-end">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">Status</p>
                                        <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded flex items-center gap-1 ${previewInvoice.isPaid ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                            {previewInvoice.isPaid ? <><CheckCircle2 className="w-3 h-3"/> Paid</> : 'Unpaid'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2 border-b-2 border-zinc-100 pb-2">Line Items</p>
                                <div className="flex justify-between items-center py-3">
                                    <span className="font-medium text-zinc-700 uppercase text-xs tracking-wider">{previewInvoice.purpose.replace(/-/g, ' ')}</span>
                                    <span className="font-black text-zinc-900">${parseFloat(previewInvoice.amountInUSD || '0').toFixed(2)} USDT</span>
                                </div>
                            </div>
                            
                            <div className="bg-zinc-50 border-2 border-zinc-200 p-4 rounded-xl flex justify-between items-center">
                                <span className="text-sm font-black uppercase tracking-widest text-zinc-900">Total Due</span>
                                <span className="text-2xl font-black text-[#FFC700]">${parseFloat(previewInvoice.amountInUSD || '0').toFixed(2)} USDT</span>
                            </div>
                            
                            <div className="text-center">
                                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Payable via TRC-20 Tron Network</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
