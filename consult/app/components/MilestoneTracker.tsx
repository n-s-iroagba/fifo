'use client';

import React from 'react';
import { useCoaching } from '../context/CoachingContext';

export default function MilestoneTracker() {
  const {
    currentProfile,
    calculatePhaseProgress,
    setActivePhaseFilter,
    setActivePillarTab,
  } = useCoaching();

  const getPhaseStatus = (progress: number) => {
    if (progress === 100) return { label: 'Phase Completed', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
    if (progress > 0) return { label: 'In Progress', color: 'bg-blue-100 text-blue-800 border-blue-300' };
    return { label: 'Upcoming Target', color: 'bg-slate-100 text-slate-600 border-slate-200' };
  };

  return (
    <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
              Outcome Framework (No Hourly Logs)
            </span>
            <span className="text-[10px] font-bold text-slate-400">|</span>
            <span className="text-xs font-bold text-slate-500">90-Day Remote Landing Roadmap</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1 tracking-tight">
            The 3-Phase Transformation Milestones
          </h2>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Unlike traditional consulting models that charge by arbitrary hours, our roadmap is strictly deliverable-based. Every milestone produces a concrete asset necessary to land an asynchronous remote role.
          </p>
        </div>

        {/* Global Remote Target Outcome Badge */}
        <div className="bg-slate-900 text-white p-4 rounded-2xl border border-slate-800 shrink-0 max-w-sm">
          <span className="text-[9px] font-black uppercase tracking-widest text-indigo-400 block mb-1">
            Program Outcome Target
          </span>
          <p className="text-xs font-bold leading-snug text-slate-100">
            {currentProfile.remoteOutcomeTarget}
          </p>
        </div>
      </div>

      {/* 3-Phase Roadmap Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {currentProfile.milestones.map((m) => {
          const phaseProgress = calculatePhaseProgress(m.phase);
          const status = getPhaseStatus(phaseProgress);

          const pillarTabTarget =
            m.phase === 1 ? 'linkedin' : m.phase === 2 ? 'async_interview' : 'job_funnel';

          return (
            <div
              key={m.phase}
              className="rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-indigo-200 transition-all p-5 flex flex-col justify-between shadow-xs hover:shadow-md"
            >
              <div>
                {/* Day Marker & Status Badge */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg">
                    {m.dayRange}
                  </span>
                  <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${status.color}`}>
                    {status.label}
                  </span>
                </div>

                {/* Phase Title & Pillar Tag */}
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">
                  {m.pillar}
                </span>
                <h3 className="text-base font-black text-slate-900 mt-0.5 leading-tight">
                  {m.name}
                </h3>
                <p className="text-xs text-slate-500 font-semibold mt-1">
                  Theme: {m.theme}
                </p>

                {/* Progress Bar for this Phase */}
                <div className="mt-4 bg-white p-3 rounded-xl border border-slate-200/80">
                  <div className="flex items-center justify-between text-[10px] font-black text-slate-600 mb-1.5">
                    <span>Phase Deliverable Progress</span>
                    <span className="text-indigo-600">{phaseProgress}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-blue-600 rounded-full transition-all duration-300"
                      style={{ width: `${phaseProgress}%` }}
                    />
                  </div>
                </div>

                {/* Core Deliverable Box */}
                <div className="mt-4 p-3 rounded-xl bg-indigo-50/60 border border-indigo-100 text-xs">
                  <span className="text-[9px] font-black uppercase tracking-wider text-indigo-700 block mb-1">
                    Primary Deliverable
                  </span>
                  <p className="font-bold text-indigo-950 leading-snug">
                    {m.coreDeliverable}
                  </p>
                  <p className="text-[10px] text-indigo-700/80 mt-1 font-medium">
                    Target: {m.deliverableTarget}
                  </p>
                </div>

                {/* Remote Relevance Note */}
                <div className="mt-3 text-[11px] text-slate-600 leading-relaxed bg-white p-3 rounded-xl border border-slate-100">
                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block mb-0.5">
                    Why Remote Teams Value This
                  </span>
                  {m.remoteFocus}
                </div>

                {/* Tangible Key Outputs */}
                <div className="mt-4 space-y-1.5">
                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">
                    Validated Key Outputs
                  </span>
                  {m.keyOutputs.map((output, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-[11px] text-slate-700">
                      <span className="text-emerald-500 font-bold">✓</span>
                      <span className="leading-snug">{output}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 pt-4 border-t border-slate-200/80 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setActivePhaseFilter(m.phase);
                    setActivePillarTab('checklist');
                  }}
                  className="py-2 px-3 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-black uppercase tracking-wider transition-colors text-center"
                >
                  View Tasks
                </button>
                <button
                  type="button"
                  onClick={() => setActivePillarTab(pillarTabTarget)}
                  className="py-2 px-3 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white text-[10px] font-black uppercase tracking-wider transition-colors text-center"
                >
                  Open Tool →
                </button>
              </div>
            </div>
          );
        })}
      </div>


      {/* Roadmap Active Development Banner */}
      <div className="mt-6 p-4 rounded-2xl bg-amber-50/80 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-950">
        <div className="flex items-start sm:items-center gap-2.5">
          <span className="w-5 h-5 rounded-md bg-amber-200 text-amber-800 flex items-center justify-center font-bold shrink-0 text-[11px]">
            🚧
          </span>
          <p className="leading-snug">
            <strong>Under Active Development:</strong> Cloud mentor review sign-offs and verified milestone completion certificates will be enabled in v1.0. All phase progress calculations and interactive deliverable tools are live and locally persistent.
          </p>
        </div>
        <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 bg-amber-200/70 border border-amber-300 px-2.5 py-1 rounded-md shrink-0 self-start sm:self-auto">
          Roadmap Preview
        </span>
      </div>
    </section>
  );
}

