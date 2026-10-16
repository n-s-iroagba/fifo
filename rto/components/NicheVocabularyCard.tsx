'use client';

import React from 'react';
import { useCoaching } from '../context/CoachingContext';

export default function NicheVocabularyCard() {
  const { currentProfile, setShowNicheModal } = useCoaching();

  return (
    <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 relative overflow-hidden">
      {/* Background ambient gradient */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-start justify-between gap-6">
        {/* Main Hero & Niche Narrative */}
        <div className="max-w-2xl">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
              {currentProfile.badge}
            </span>
            <span className="bg-white/10 text-slate-300 text-[10px] font-bold px-3 py-1 rounded-full border border-white/10">
              Target Audience: {currentProfile.shortTag}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
            {currentProfile.heroHeadline}
          </h2>

          <p className="text-sm text-slate-300 font-medium mt-2 leading-relaxed">
            {currentProfile.heroSubtitle}
          </p>

          {/* Pain Point vs Opportunity */}
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-xs">
              <span className="text-[9px] font-black uppercase tracking-wider text-red-300 block mb-1">
                Identified Remote Friction
              </span>
              <p className="text-slate-300 leading-normal">
                {currentProfile.corePainPoint}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs">
              <span className="text-[9px] font-black uppercase tracking-wider text-emerald-300 block mb-1">
                90-Day Placement Target
              </span>
              <p className="text-emerald-100 font-bold leading-normal">
                {currentProfile.remoteOutcomeTarget}
              </p>
            </div>
          </div>
        </div>

        {/* Niche Specific Vocabulary Box (Feature A Requirement) */}
        <div className="lg:w-80 w-full bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/15 shrink-0">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300">
              Niche Vocabulary Adaptation
            </span>
            <button
              onClick={() => setShowNicheModal(true)}
              className="text-[10px] font-bold text-slate-300 hover:text-white underline"
            >
              Switch Niche
            </button>
          </div>

          <div className="space-y-2.5">
            {currentProfile.vocabularyTerms.map((v) => (
              <div key={v.term} className="p-2.5 rounded-xl bg-black/20 border border-white/5">
                <span className="text-xs font-bold text-indigo-200 block">
                  {v.term}
                </span>
                <p className="text-[11px] text-slate-300 leading-snug mt-0.5">
                  {v.definition}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
