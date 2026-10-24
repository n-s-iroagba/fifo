'use client';

import React, { useState, useEffect } from 'react';
import { Globe, MapPin, ExternalLink, ShieldAlert, ArrowRight, Check } from 'lucide-react';

export function GeoRoutingModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [acknowledgedOverseas, setAcknowledgedOverseas] = useState(false);
    const [showBanner, setShowBanner] = useState(false);

    useEffect(() => {
        const selected = sessionStorage.getItem('certhero_geo_selected');
        if (!selected) {
            setIsOpen(true);
        } else if (selected === 'overseas') {
            setShowBanner(true);
        }
    }, []);

    const handleAustraliaSelect = () => {
        sessionStorage.setItem('certhero_geo_selected', 'australia');
        window.location.href = 'https://certhero.com.au';
    };

    const handleOverseasSelect = () => {
        setAcknowledgedOverseas(true);
    };

    const handleConfirmOverseas = () => {
        sessionStorage.setItem('certhero_geo_selected', 'overseas');
        setIsOpen(false);
        setShowBanner(true);
    };

    return (
        <>
            {/* Top compliance notice banner for overseas candidates */}
            {showBanner && (
                <div className="bg-[#0b0f19] text-amber-200 text-xs px-4 py-2 border-b border-amber-900/50 flex items-center justify-between gap-3 z-40">
                    <div className="max-w-7xl mx-auto flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-[#EAA240] shrink-0" />
                        <span>
                            <strong>Regional Notice:</strong> Course access on this portal is only for sponsored overseas candidates. Australian residents please use the main portal at{' '}
                            <a
                                href="https://certhero.com.au"
                                target="_blank"
                                rel="noreferrer"
                                className="underline font-bold text-white hover:text-[#EAA240]"
                            >
                                certhero.com.au
                            </a>.
                        </span>
                    </div>
                    <button
                        onClick={() => setShowBanner(false)}
                        className="text-slate-400 hover:text-white text-xs px-1"
                        aria-label="Dismiss banner"
                    >
                        ✕
                    </button>
                </div>
            )}

            {/* Geo Location Determination Modal */}
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl max-w-lg w-full border-2 border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6 relative overflow-hidden">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-[#EAA240]/15 flex items-center justify-center shrink-0 text-[#EAA240]">
                                <Globe className="w-6 h-6 text-[#0f172a]" />
                            </div>
                            <div>
                                <span className="text-[11px] font-black uppercase tracking-widest text-[#EAA240] block">
                                    Location Verification
                                </span>
                                <h3 className="text-xl font-black text-slate-900 tracking-tight">
                                    Are you located in Australia?
                                </h3>
                            </div>
                        </div>

                        {!acknowledgedOverseas ? (
                            <>
                                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                                    To ensure compliance with Australian training frameworks and licensing regulations, please indicate your current location:
                                </p>

                                <div className="space-y-3 pt-1">
                                    <button
                                        type="button"
                                        onClick={handleAustraliaSelect}
                                        className="w-full flex items-center justify-between p-4 rounded-2xl border-2 border-slate-200 hover:border-[#0f172a] hover:bg-slate-50 transition-all text-left group"
                                    >
                                        <div className="flex items-center gap-3.5">
                                            <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 group-hover:bg-[#0f172a] group-hover:text-white transition-colors">
                                                <MapPin className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-extrabold text-slate-900">
                                                    Yes, I am in Australia
                                                </div>
                                                <div className="text-xs text-slate-500">
                                                    Redirects to main national portal (certhero.com.au)
                                                </div>
                                            </div>
                                        </div>
                                        <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-slate-900 transition-colors" />
                                    </button>

                                    <button
                                        type="button"
                                        onClick={handleOverseasSelect}
                                        className="w-full flex items-center justify-between p-4 rounded-2xl border-2 border-[#EAA240]/40 bg-amber-50/40 hover:bg-amber-50 hover:border-[#EAA240] transition-all text-left group"
                                    >
                                        <div className="flex items-center gap-3.5">
                                            <div className="w-9 h-9 rounded-xl bg-[#EAA240] text-slate-950 flex items-center justify-center font-bold">
                                                <Globe className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-extrabold text-slate-900">
                                                    No, I am outside Australia
                                                </div>
                                                <div className="text-xs text-slate-600">
                                                    Access RTO Candidate LMS & Overseas Skills Assessment
                                                </div>
                                            </div>
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-[#EAA240] group-hover:translate-x-0.5 transition-transform" />
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="space-y-5 animate-in fade-in duration-200">
                                <div className="p-4 bg-amber-50 border-2 border-[#EAA240] rounded-2xl space-y-2">
                                    <div className="flex items-center gap-2 text-amber-950 font-black text-sm">
                                        <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0" />
                                        <span>Candidate LMS Access Notice</span>
                                    </div>
                                    <p className="text-xs text-slate-800 leading-relaxed font-semibold">
                                        Course access on this portal is only for sponsored overseas candidates; Australian residents please use the main portal.
                                    </p>
                                </div>

                                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={handleAustraliaSelect}
                                        className="w-full sm:w-auto text-xs font-bold text-slate-500 hover:text-slate-900 underline"
                                    >
                                        Switch to certhero.com.au
                                    </button>

                                    <button
                                        type="button"
                                        onClick={handleConfirmOverseas}
                                        className="w-full sm:w-auto px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider bg-[#0f172a] hover:bg-black text-white shadow-md flex items-center justify-center gap-2"
                                    >
                                        <Check className="w-4 h-4 text-[#EAA240]" />
                                        Acknowledge & Continue
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
