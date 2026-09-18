'use client';

import React, { useState } from 'react';
import { useCoaching } from '../context/CoachingContext';

export default function LinkedInScorecard() {
  const { currentProfile } = useCoaching();
  const scorecard = currentProfile.linkedInScorecard;
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
              Pillar 1 Core Deliverable
            </span>
            <span className="text-[10px] font-bold text-slate-400">|</span>
            <span className="text-xs font-bold text-slate-500">Days 1–30 Foundation</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1 tracking-tight">
            LinkedIn Optimization: Before vs. After Scorecard
          </h2>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Remote recruiters do not read long paragraphs; they scan for immediate stack alignment, timezone compatibility, and proof of autonomous execution. Compare your baseline vs. target positioning below.
          </p>
        </div>

        {/* Live Profile Score Comparison */}
        <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 p-3 rounded-2xl shrink-0">
          <div className="text-center px-2">
            <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">
              Before Score
            </span>
            <span className="text-xl font-black text-red-500">{scorecard.initialScore}</span>
            <span className="text-[10px] text-slate-400">/100</span>
          </div>
          <div className="text-xl font-black text-slate-300">→</div>
          <div className="text-center px-2">
            <span className="text-[9px] font-black uppercase tracking-wider text-emerald-600 block">
              Target Score
            </span>
            <span className="text-2xl font-black text-emerald-600">{scorecard.targetScore}</span>
            <span className="text-[10px] text-emerald-600">/100</span>
          </div>
        </div>
      </div>

      {/* Before vs After Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* BEFORE CARD */}
        <div className="rounded-2xl border border-red-200 bg-red-50/20 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="bg-red-100 text-red-800 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border border-red-200">
                ❌ Baseline (Generic / Low-Signal)
              </span>
              <span className="text-[11px] font-bold text-red-600">Score: {scorecard.initialScore}/100</span>
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                  Headline Example
                </span>
                <div className="p-3 bg-white rounded-xl border border-red-100 text-xs font-semibold text-slate-700 italic">
                  "{scorecard.beforeHeadline}"
                </div>
              </div>

              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                  About Section Baseline
                </span>
                <div className="p-3 bg-white rounded-xl border border-red-100 text-xs text-slate-600 leading-relaxed italic">
                  "{scorecard.beforeSummary}"
                </div>
              </div>

              <div className="p-3 rounded-xl bg-red-100/50 text-[11px] text-red-900 border border-red-200">
                <span className="font-bold block mb-0.5">Why this fails in remote hiring:</span>
                Lacks specific tech/tool keywords, omits operational timezone overlap, and signals passivity rather than proactive remote output.
              </div>
            </div>
          </div>
        </div>

        {/* AFTER CARD */}
        <div className="rounded-2xl border border-emerald-300 bg-emerald-50/30 p-5 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg shadow-xs">
                ✅ Target Remote Profile (High-Signal)
              </span>
              <span className="text-[11px] font-bold text-emerald-700">Target Score: {scorecard.targetScore}/100</span>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800">
                    Optimized Remote Headline
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(scorecard.afterHeadline, 'headline')}
                    className="text-[10px] font-bold text-emerald-700 hover:text-emerald-900 underline"
                  >
                    {copiedKey === 'headline' ? 'Copied!' : 'Copy Headline'}
                  </button>
                </div>
                <div className="p-3 bg-white rounded-xl border border-emerald-200 text-xs font-bold text-slate-900 shadow-xs leading-snug">
                  {scorecard.afterHeadline}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800">
                    Optimized Asynchronous About Summary
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(scorecard.afterSummary, 'summary')}
                    className="text-[10px] font-bold text-emerald-700 hover:text-emerald-900 underline"
                  >
                    {copiedKey === 'summary' ? 'Copied!' : 'Copy Summary'}
                  </button>
                </div>
                <div className="p-3 bg-white rounded-xl border border-emerald-200 text-xs text-slate-800 leading-relaxed shadow-xs">
                  {scorecard.afterSummary}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-100/60 text-[11px] text-emerald-950 border border-emerald-200">
                <span className="font-bold block mb-0.5">Why this wins remote offers:</span>
                Directly matches ATS keyword scrapers, proves autonomous metric-based output, and confirms timezone harmony.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ATS Keyword Matrix Section */}
      <div className="mt-6 p-5 rounded-2xl bg-slate-50 border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
              ATS Keyword Density Matrix ({currentProfile.name})
            </h4>
            <p className="text-[11px] text-slate-500">
              Ensure these exact terms are distributed throughout your Experience, Skills, and Headline sections.
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleCopy(scorecard.atsKeywords.join(', '), 'all_keywords')}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-white border border-slate-200 px-3 py-1 rounded-lg shrink-0"
          >
            {copiedKey === 'all_keywords' ? 'Copied All!' : 'Copy Keyword String'}
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {scorecard.atsKeywords.map((kw) => (
            <span
              key={kw}
              onClick={() => handleCopy(kw, kw)}
              className="cursor-pointer bg-white hover:bg-indigo-50 hover:border-indigo-300 border border-slate-200 text-slate-800 text-xs font-bold px-3 py-1 rounded-lg transition-colors shadow-2xs flex items-center gap-1.5"
              title="Click to copy"
            >
              <span>{kw}</span>
              <span className="text-[9px] text-slate-400">📋</span>
            </span>
          ))}
        </div>
      </div>

      {/* Key Improvements Checklist */}
      <div className="mt-6 space-y-2">
        <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
          Core Profile Optimization Deliverables
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {scorecard.keyImprovements.map((imp, idx) => (
            <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700">
              <span className="text-emerald-600 font-black">✓</span>
              <span className="leading-snug">{imp}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Pillar 1 Active Development Banner & Live Link */}
      <div className="mt-6 p-4 rounded-2xl bg-amber-50/80 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-950">
        <div className="flex items-start sm:items-center gap-2.5">
          <span className="w-5 h-5 rounded-md bg-amber-200 text-amber-800 flex items-center justify-center font-bold shrink-0 text-[11px]">
            🚧
          </span>
          <p className="leading-snug">
            <strong>Under Active Development:</strong> Direct LinkedIn OAuth profile scraping and automated ATS density scoring are in development. Copy your generated headline and summary to your live LinkedIn profile.
          </p>
        </div>
        <a
          href="https://www.linkedin.com/in/me/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white font-bold text-xs transition-colors shrink-0 self-start sm:self-auto shadow-xs"
          title="Open your real LinkedIn profile in a new tab"
        >
          <span>Open My LinkedIn Profile</span>
          <span className="text-[10px]">↗</span>
        </a>
      </div>
    </section>
  );
}

