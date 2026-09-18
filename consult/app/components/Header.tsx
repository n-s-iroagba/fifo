'use client';

import React, { useState } from 'react';
import { useCoaching } from '../context/CoachingContext';
import DevelopmentNoticeModal from './DevelopmentNoticeModal';

export default function Header() {
  const {
    currentProfile,
    calculateOverallProgress,
    completedChecklistCount,
    totalChecklistCount,
    setShowNicheModal,
    activePillarTab,
    setActivePillarTab,
  } = useCoaching();

  const [showDevModal, setShowDevModal] = useState(false);
  const progress = calculateOverallProgress();

  const navTabs = [
    { id: 'overview', label: 'Dashboard', icon: 'dashboard' },
    { id: 'milestones', label: '90-Day Roadmap', icon: 'timeline' },
    { id: 'checklist', label: 'Action Checklist', icon: 'checklist' },
    { id: 'linkedin', label: 'Pillar 1: LinkedIn Scorecard', icon: 'badge' },
    { id: 'async_interview', label: 'Pillar 2: Async Trials', icon: 'videocam' },
    { id: 'job_funnel', label: 'Pillar 3: Job Funnel', icon: 'filter_alt' },
  ] as const;

  return (
    <>
      <DevelopmentNoticeModal isOpen={showDevModal} onClose={() => setShowDevModal(false)} />

      {/* Top Banner: Site Under Active Development Notification */}
      <aside aria-label="Development status banner" className="bg-amber-500/10 border-b border-amber-200/80 px-4 py-1.5 text-xs text-amber-950">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1.5 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-900 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border border-amber-300">
              <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse" />
              Under Active Development
            </span>
            <span className="text-[11px] font-medium text-amber-950">
              RemoteLaunch OS MVP Preview • Candidate simulation & local progress tracking active.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowDevModal(true)}
            className="text-[11px] font-bold text-amber-900 hover:text-amber-950 underline shrink-0 hover:opacity-80 transition-opacity"
          >
            View Dev Status & Roadmap →
          </button>
        </div>
      </aside>

      <header className="border-b border-slate-200 bg-white/95 backdrop-blur-md sticky top-0 z-40">
        {/* Top Banner: Niche Context & Progress Meter */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Brand & Niche Identifier */}
          <div className="flex items-center gap-3.5 w-full md:w-auto justify-between md:justify-start">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-500 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-500/20">
                R
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-[0.25em] text-indigo-600">RemoteLaunch</span>
                  <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-slate-200">
                    90-Day OS
                  </span>
                  <span className="bg-amber-50 text-amber-800 text-[9px] font-black uppercase px-2 py-0.5 rounded-full border border-amber-200">
                    v0.9 Beta
                  </span>
                </div>
                <h1 className="text-base font-extrabold text-slate-900 leading-tight">
                  Remote Job Coaching Platform
                </h1>
              </div>
            </div>

            {/* Current Niche Badge Button */}
            <button
              type="button"
              onClick={() => setShowNicheModal(true)}
              className="group flex items-center gap-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/80 px-3 py-1.5 rounded-xl text-left transition-all active:scale-95"
              title="Click to switch your target niche"
            >
              <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
              <div>
                <span className="text-[9px] font-black uppercase tracking-wider text-indigo-500 block leading-none">
                  Active Profile
                </span>
                <span className="text-xs font-black text-indigo-900 group-hover:text-indigo-950 flex items-center gap-1">
                  {currentProfile.name}
                  <span className="text-indigo-400 group-hover:translate-x-0.5 transition-transform text-[10px]">▼</span>
                </span>
              </div>
            </button>
          </div>

          {/* Global 90-Day Deliverable Progress Gauge */}
          <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end bg-slate-50/80 md:bg-transparent p-2.5 md:p-0 rounded-xl border md:border-none border-slate-200">
            <div className="text-right">
              <div className="flex items-center gap-2 justify-end">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                  90-Day Milestone Completion
                </span>
                <span className="text-xs font-black text-slate-900 bg-white border border-slate-200 px-2 py-0.5 rounded-md shadow-xs">
                  {completedChecklistCount}/{totalChecklistCount} Tasks
                </span>
              </div>
              <div className="w-48 sm:w-56 h-2.5 bg-slate-200 rounded-full overflow-hidden mt-1.5 border border-slate-300/60 relative">
                <div
                  className="h-full bg-gradient-to-r from-indigo-600 via-blue-600 to-emerald-500 transition-all duration-500 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            <div className="text-center font-black text-lg text-indigo-900 bg-indigo-50/70 border border-indigo-100 rounded-xl px-2.5 py-1 min-w-[54px]">
              {progress}%
            </div>
          </div>
        </div>

        {/* Navigation Sub-bar */}
        <div className="border-t border-slate-100 bg-slate-50/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2 scrollbar-none" aria-label="Dashboard Navigation Tabs">
              {navTabs.map((tab) => {
                const isActive = activePillarTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActivePillarTab(tab.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    }`}
                  >
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </header>
    </>
  );
}

