'use client';

import React from 'react';
import { useCoaching } from '../context/CoachingContext';
import { NicheId, NICHES_DATA } from '../data/nicheData';

export default function NicheSelectorModal() {
  const { showNicheModal, setShowNicheModal, selectedNiche, setNiche } = useCoaching();

  if (!showNicheModal) return null;

  const nichesList: NicheId[] = ['tech_pro', 'returning_mom', 'customer_support'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-5 sm:px-8 border-b border-slate-100 bg-gradient-to-r from-slate-50 via-indigo-50/40 to-slate-50 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-indigo-600 bg-indigo-100/80 px-2.5 py-0.5 rounded-full">
                Step 1 of 1: Profile Alignment
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Select Your Specialized Remote Transformation Niche
            </h2>
            <p className="text-xs text-slate-600 mt-1 max-w-xl">
              The coaching dashboard dynamically tailors all terminology, ATS keyword strategies, asynchronous interview trials, and 90-day deliverables to your chosen profile.
            </p>
          </div>
          <button
            onClick={() => setShowNicheModal(false)}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors text-sm font-bold shrink-0 ml-4"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Niche Selection Grid */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {nichesList.map((id) => {
              const niche = NICHES_DATA[id];
              const isSelected = selectedNiche === id;

              return (
                <div
                  key={id}
                  onClick={() => setNiche(id)}
                  className={`rounded-2xl p-5 border-2 transition-all cursor-pointer flex flex-col justify-between text-left relative group ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/30 shadow-lg shadow-indigo-600/10 ring-2 ring-indigo-600/20'
                      : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50/80 bg-white'
                  }`}
                >
                  {/* Top Header Tag */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span
                        className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        {niche.badge}
                      </span>
                      {isSelected && (
                        <span className="text-[10px] font-black text-indigo-600 flex items-center gap-1">
                          ✓ Selected
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {niche.name}
                    </h3>

                    <p className="text-[11px] text-slate-500 font-medium mt-1 leading-relaxed line-clamp-2">
                      {niche.targetAudience}
                    </p>

                    {/* Core Remote Pain Point Box */}
                    <div className="mt-4 p-3 rounded-xl bg-slate-100/80 border border-slate-200/80 text-[11px]">
                      <span className="text-[9px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                        Core Remote Pain Point
                      </span>
                      <p className="text-slate-700 font-medium leading-normal">
                        {niche.corePainPoint}
                      </p>
                    </div>

                    {/* Outcome Target */}
                    <div className="mt-3 p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/70 text-[11px]">
                      <span className="text-[9px] font-black uppercase tracking-wider text-emerald-700 block mb-0.5">
                        Target 90-Day Outcome
                      </span>
                      <p className="text-emerald-950 font-bold leading-normal">
                        {niche.remoteOutcomeTarget}
                      </p>
                    </div>

                    {/* Sample Niche Vocabulary Chips */}
                    <div className="mt-3.5">
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1.5">
                        Vocabulary Adapted
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {niche.vocabularyTerms.slice(0, 2).map((item) => (
                          <span
                            key={item.term}
                            className="bg-white border border-slate-200 text-slate-600 text-[10px] font-semibold px-2 py-0.5 rounded-md"
                          >
                            {item.term}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Select Button */}
                  <div className="mt-5 pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setNiche(id);
                      }}
                      className={`w-full py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                        isSelected
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                          : 'bg-slate-900 hover:bg-indigo-600 text-white'
                      }`}
                    >
                      {isSelected ? 'Active Selection' : 'Select This Niche'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Note */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
          <span>
            💡 <strong>In Active Development:</strong> Additional tracks (Executive Ops, Tech Writing) launching in v1.0. The 3 core profiles are fully live.
          </span>
          <button
            type="button"
            onClick={() => setShowNicheModal(false)}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 underline shrink-0"
          >
            Continue to Dashboard →
          </button>
        </div>

      </div>
    </div>
  );
}
