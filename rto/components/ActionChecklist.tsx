'use client';

import React, { useState } from 'react';
import { useCoaching } from '../context/CoachingContext';

export default function ActionChecklist() {
  const {
    currentProfile,
    checkedItems,
    toggleChecklistItem,
    activePhaseFilter,
    setActivePhaseFilter,
    resetChecklist,
    setAllChecklistItemsForPhase,
    completedChecklistCount,
    totalChecklistCount,
  } = useCoaching();

  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = currentProfile.checklist.filter((item) => {
    const matchesPhase = activePhaseFilter === 'all' || item.phase === activePhaseFilter;
    const matchesQuery =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.remoteRelevance.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesPhase && matchesQuery;
  });

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'Critical':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'High':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  const getPillarBadge = (pillar: string) => {
    switch (pillar) {
      case 'linkedin':
        return { label: 'Pillar 1: LinkedIn', cls: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
      case 'async_interview':
        return { label: 'Pillar 2: Async Interview', cls: 'bg-purple-50 text-purple-700 border-purple-200' };
      case 'job_funnel':
        return { label: 'Pillar 3: Job Funnel', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      default:
        return { label: pillar, cls: 'bg-slate-50 text-slate-700 border-slate-200' };
    }
  };

  return (
    <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
              Interactive Execution Checklists
            </span>
            <span className="text-[10px] font-bold text-slate-400">|</span>
            <span className="text-xs font-bold text-slate-500">Non-Sequential Action Items</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1 tracking-tight">
            Tailored Deliverables for {currentProfile.name}
          </h2>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Every checklist action directly impacts your asynchronous remote credibility. Check items off in any order to immediately update your 90-day progress metrics.
          </p>
        </div>

        {/* Counter & Reset */}
        <div className="flex items-center gap-3">
          <div className="bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl text-right">
            <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">
              Completed Tasks
            </span>
            <span className="text-sm font-black text-slate-900">
              {completedChecklistCount} of {totalChecklistCount}
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              if (confirm('Reset all checklist progress for this profile?')) {
                resetChecklist();
              }
            }}
            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold transition-colors"
            title="Reset checklist"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mt-6">
        {/* Phase Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl overflow-x-auto">
          <button
            type="button"
            onClick={() => setActivePhaseFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activePhaseFilter === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Phases ({currentProfile.checklist.length})
          </button>
          {[1, 2, 3].map((ph) => {
            const count = currentProfile.checklist.filter((i) => i.phase === ph).length;
            const isSelected = activePhaseFilter === ph;
            return (
              <button
                key={ph}
                type="button"
                onClick={() => setActivePhaseFilter(ph as 1 | 2 | 3)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  isSelected
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Phase {ph} ({count})
              </button>
            );
          })}
        </div>

        {/* Search Filter */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search action items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-64 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
      </div>

      {/* Quick Phase Bulk Action */}
      {activePhaseFilter !== 'all' && (
        <div className="flex items-center justify-between mt-4 p-2.5 bg-indigo-50/50 rounded-xl border border-indigo-100 text-xs">
          <span className="text-indigo-900 font-bold">
            Showing Phase {activePhaseFilter} Actions ({filteredItems.length} items)
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setAllChecklistItemsForPhase(activePhaseFilter as 1 | 2 | 3, true)}
              className="text-[10px] font-black uppercase tracking-wider text-indigo-700 hover:underline"
            >
              Check All in Phase
            </button>
            <span className="text-slate-300">|</span>
            <button
              type="button"
              onClick={() => setAllChecklistItemsForPhase(activePhaseFilter as 1 | 2 | 3, false)}
              className="text-[10px] font-black uppercase tracking-wider text-slate-500 hover:underline"
            >
              Uncheck All
            </button>
          </div>
        </div>
      )}

      {/* Checklist Items Stream */}
      <div className="mt-6 space-y-3">
        {filteredItems.length === 0 ? (
          <div className="py-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <p className="text-xs font-bold text-slate-400">No action items match your search filter.</p>
          </div>
        ) : (
          filteredItems.map((item) => {
            const isChecked = !!checkedItems[item.id];
            const pillarInfo = getPillarBadge(item.pillar);

            return (
              <div
                key={item.id}
                onClick={() => toggleChecklistItem(item.id)}
                className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row items-start gap-4 ${
                  isChecked
                    ? 'bg-slate-50/60 border-slate-200 opacity-90'
                    : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-sm'
                }`}
              >
                {/* Custom Big Checkbox */}
                <div
                  className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                    isChecked
                      ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                      : 'border-slate-300 bg-white hover:border-indigo-500'
                  }`}
                >
                  {isChecked && <span className="text-sm font-black">✓</span>}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200">
                      Phase {item.phase}
                    </span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${pillarInfo.cls}`}>
                      {pillarInfo.label}
                    </span>
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${getPriorityBadge(item.priority)}`}>
                      {item.priority}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 ml-auto">
                      Est. Time: {item.estimatedHours}
                    </span>
                  </div>

                  <h3 className={`text-sm font-bold transition-all ${
                    isChecked ? 'line-through text-slate-400' : 'text-slate-900'
                  }`}>
                    {item.title}
                  </h3>

                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {item.description}
                  </p>

                  {/* Remote Relevance Callout (Guardrail Requirement) */}
                  <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2 text-[11px] text-slate-700">
                    <span className="text-indigo-600 font-bold shrink-0">🌐 Remote Relevance:</span>
                    <span className="leading-snug">{item.remoteRelevance}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Checklist Active Development Banner */}
      <div className="mt-6 p-4 rounded-2xl bg-amber-50/80 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-950">
        <div className="flex items-start sm:items-center gap-2.5">
          <span className="w-5 h-5 rounded-md bg-amber-200 text-amber-800 flex items-center justify-center font-bold shrink-0 text-[11px]">
            🚧
          </span>
          <p className="leading-snug">
            <strong>Under Active Development:</strong> Asynchronous mentor reviews and file upload proof verification are coming in v1.0. Non-sequential task toggling, phase filtering, and local state persistence are fully functional.
          </p>
        </div>
        <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 bg-amber-200/70 border border-amber-300 px-2.5 py-1 rounded-md shrink-0 self-start sm:self-auto">
          Checklist Beta
        </span>
      </div>
    </section>
  );
}

