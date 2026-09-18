'use client';

import React from 'react';

interface DevelopmentNoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DevelopmentNoticeModal({ isOpen, onClose }: DevelopmentNoticeModalProps) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="dev-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-600 flex items-center justify-center text-lg font-black border border-amber-500/30">
              🚧
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                  System Status
                </span>
                <span className="text-[10px] font-bold text-slate-400">v0.9.4 Preview</span>
              </div>
              <h2 id="dev-modal-title" className="text-lg font-black text-slate-900 mt-0.5">
                RemoteLaunch OS is Under Active Development
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center text-xs font-bold transition-colors"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-600">
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-amber-950 leading-relaxed">
            <strong className="block text-sm font-black mb-1">Notice to Candidates & Mentors</strong>
            You are exploring the early-access MVP of RemoteLaunch OS. The platform is actively being engineered to replace low-yield hourly career coaching with a high-accountability, deliverable-driven framework.
          </div>

          {/* Active Features */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 mb-2 flex items-center gap-1.5">
              <span className="text-emerald-600 font-black">●</span> Currently Live & Functional:
            </h3>
            <ul className="space-y-2 pl-2">
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold">✓</span>
                <span><strong>Interactive Niche Selector:</strong> Dynamic adaptation across Tech Pro, Return-to-Work Mom, and Customer Support profiles.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold">✓</span>
                <span><strong>90-Day Transformation Roadmap:</strong> Visual 3-phase milestone tracker strictly tied to outcomes, not hourly logs.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold">✓</span>
                <span><strong>Contextual Action Checklists:</strong> Priority-filtered items with explicit remote work hiring relevance rationales.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold">✓</span>
                <span><strong>Deliverable Workstations:</strong> LinkedIn Before/After Scorecard with copy tools, Async Interview simulator with 100-point rubric, and 90-Day Application Funnel with verified job boards.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold">✓</span>
                <span><strong>Local State Persistence:</strong> Checklist checks, trial submissions, and funnel counters automatically save to your browser's local cache.</span>
              </li>
            </ul>
          </div>

          {/* In Active Development */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 mb-2 flex items-center gap-1.5">
              <span className="text-amber-500 font-black">●</span> In Active Pipeline (Coming Soon):
            </h3>
            <div className="space-y-2 pl-2">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-bold text-slate-800 block">1. Automated AI Video/Speech Transcription Analyzer</span>
                <p className="text-[11px] text-slate-500 mt-0.5">Automated pacing, filler-word detection, and executive summary scoring for Loom submissions.</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-bold text-slate-800 block">2. Real-Time ATS Greenhouse / Lever Webhook Sync</span>
                <p className="text-[11px] text-slate-500 mt-0.5">Automated inbound screener detection and application status updates without manual entry.</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-bold text-slate-800 block">3. Multi-Device Cloud Synchronization</span>
                <p className="text-[11px] text-slate-500 mt-0.5">Secure cross-device profile syncing and mentor review sharing links.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            Build Target: v1.0 Production
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white font-black text-xs transition-colors"
          >
            Acknowledge & Continue
          </button>
        </div>
      </div>
    </div>
  );
}
