'use client';

import React, { useState } from 'react';
import { CoachingProvider, useCoaching } from './context/CoachingContext';
import Header from './components/Header';
import NicheSelectorModal from './components/NicheSelectorModal';
import NicheVocabularyCard from './components/NicheVocabularyCard';
import MilestoneTracker from './components/MilestoneTracker';
import ActionChecklist from './components/ActionChecklist';
import LinkedInScorecard from './components/LinkedInScorecard';
import AsyncInterviewPipeline from './components/AsyncInterviewPipeline';
import JobFunnelTracker from './components/JobFunnelTracker';
import DevelopmentNoticeModal from './components/DevelopmentNoticeModal';

function DashboardContent() {
  const { activePillarTab, setActivePillarTab, currentProfile, setShowNicheModal } = useCoaching();
  const [showDevModal, setShowDevModal] = useState(false);

  const handleNavClick = (tab: any) => {
    setActivePillarTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-100/70 flex flex-col font-sans antialiased text-slate-900">
      <Header />
      <NicheSelectorModal />
      <DevelopmentNoticeModal isOpen={showDevModal} onClose={() => setShowDevModal(false)} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Niche Hero & Vocabulary Banner (Always contextualized to active niche) */}
        <NicheVocabularyCard />

        {/* Tab-based View Orchestration */}
        {activePillarTab === 'overview' && (
          <div className="space-y-8">
            {/* Feature B: 90-Day Milestone Tracker */}
            <MilestoneTracker />

            {/* Feature C: Interactive Action Checklist */}
            <ActionChecklist />

            {/* Quick Interactive Pillar Deliverable Jump Cards */}
            <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-6 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-[0.25em] text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
                    Core Outcome Pillars
                  </span>
                  <h3 className="text-xl font-black text-slate-900 mt-1">
                    Specialized Deliverable Workstations
                  </h3>
                </div>
                <span className="text-xs text-slate-400 font-bold">
                  Select a workstation to launch its interactive review tool
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6">
                {/* Pillar 1 Workstation */}
                <div
                  onClick={() => handleNavClick('linkedin')}
                  className="group p-5 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100 inline-block mb-2">
                      Pillar 1: Days 1–30
                    </span>
                    <h4 className="text-base font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
                      LinkedIn Before & After Scorecard
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Transform your profile into an ATS-indexed magnet with tailored remote headlines, about hooks, and keyword density matrices.
                    </p>
                  </div>
                  <div className="mt-5 pt-3 border-t border-slate-200 flex items-center justify-between text-xs font-bold text-indigo-600">
                    <span>Open Scorecard</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>

                {/* Pillar 2 Workstation */}
                <div
                  onClick={() => handleNavClick('async_interview')}
                  className="group p-5 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-purple-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-wider text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100 inline-block mb-2">
                      Pillar 2: Days 31–60
                    </span>
                    <h4 className="text-base font-black text-slate-900 group-hover:text-purple-600 transition-colors">
                      Async Interview & Take-Home Trials
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Practice pre-recorded video screenings and asynchronous written triage scenarios evaluated against a validated 100-point rubric.
                    </p>
                  </div>
                  <div className="mt-5 pt-3 border-t border-slate-200 flex items-center justify-between text-xs font-bold text-purple-600">
                    <span>Launch Trial Simulator</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>

                {/* Pillar 3 Workstation */}
                <div
                  onClick={() => handleNavClick('job_funnel')}
                  className="group p-5 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 inline-block mb-2">
                      Pillar 3: Days 61–90
                    </span>
                    <h4 className="text-base font-black text-slate-900 group-hover:text-emerald-600 transition-colors">
                      90-Day Remote Application Funnel
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Track your conversion velocity toward a validated remote role, filter listings by timezone overlap, and target verified async employers.
                    </p>
                  </div>
                  <div className="mt-5 pt-3 border-t border-slate-200 flex items-center justify-between text-xs font-bold text-emerald-600">
                    <span>View Funnel Velocity</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {activePillarTab === 'milestones' && <MilestoneTracker />}

        {activePillarTab === 'checklist' && <ActionChecklist />}

        {activePillarTab === 'linkedin' && <LinkedInScorecard />}

        {activePillarTab === 'async_interview' && <AsyncInterviewPipeline />}

        {activePillarTab === 'job_funnel' && <JobFunnelTracker />}
      </main>

      {/* Comprehensive High-Integrity Footer */}
      <footer className="mt-16 border-t border-slate-200 bg-white pt-10 pb-8 text-xs text-slate-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Site Under Development Callout */}
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/90 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-amber-950">
            <div className="flex items-start sm:items-center gap-2.5">
              <span className="w-5 h-5 rounded-md bg-amber-200 text-amber-800 flex items-center justify-center font-black shrink-0 text-xs">
                🚧
              </span>
              <div>
                <span className="font-bold text-slate-900">Platform Development Status:</span>{' '}
                RemoteLaunch OS is currently an active MVP build (v0.9). Live metrics and deliverable submissions are cached locally in your browser.
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowDevModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-200/80 hover:bg-amber-300 text-amber-950 font-black text-[11px] transition-colors shrink-0"
            >
              <span>View Development Roadmap</span>
              <span>→</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Column 1: Brand & Current Niche */}
            <div className="space-y-3 md:col-span-1">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-black flex items-center justify-center text-sm">
                  R
                </div>
                <span className="font-black text-slate-900 text-sm tracking-tight">RemoteLaunch OS</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Transforming remote job placement through high-accountability outcome deliverables, zero hourly coaching sessions.
              </p>
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setShowNicheModal(true)}
                  className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 underline"
                >
                  Switch Profile ({currentProfile.name}) →
                </button>
              </div>
            </div>

            {/* Column 2: Dashboard Navigation */}
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
                Deliverable Workstations
              </span>
              <ul className="space-y-1.5 text-[11px]">
                <li>
                  <button
                    type="button"
                    onClick={() => handleNavClick('overview')}
                    className="hover:text-indigo-600 transition-colors"
                  >
                    Overview Dashboard
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleNavClick('milestones')}
                    className="hover:text-indigo-600 transition-colors"
                  >
                    90-Day Milestone Tracker
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleNavClick('checklist')}
                    className="hover:text-indigo-600 transition-colors"
                  >
                    Action Execution Checklists
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleNavClick('linkedin')}
                    className="hover:text-indigo-600 transition-colors"
                  >
                    Pillar 1: LinkedIn Scorecard
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleNavClick('async_interview')}
                    className="hover:text-indigo-600 transition-colors"
                  >
                    Pillar 2: Async Trials & Rubric
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleNavClick('job_funnel')}
                    className="hover:text-indigo-600 transition-colors"
                  >
                    Pillar 3: Application Funnel
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 3: Remote Standards & Playbooks (Verified Links) */}
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
                Remote Culture References
              </span>
              <ul className="space-y-1.5 text-[11px]">
                <li>
                  <a
                    href="https://about.gitlab.com/company/culture/all-remote/manifesto/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-indigo-600 transition-colors inline-flex items-center gap-1"
                  >
                    <span>GitLab All-Remote Manifesto</span>
                    <span className="text-[9px] text-slate-400">↗</span>
                  </a>
                </li>
                <li>
                  <a
                    href="https://doist.com/blog/asynchronous-communication/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-indigo-600 transition-colors inline-flex items-center gap-1"
                  >
                    <span>Doist Asynchronous Work Guide</span>
                    <span className="text-[9px] text-slate-400">↗</span>
                  </a>
                </li>
                <li>
                  <a
                    href="https://basecamp.com/books/remote"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-indigo-600 transition-colors inline-flex items-center gap-1"
                  >
                    <span>Basecamp: Remote Playbook</span>
                    <span className="text-[9px] text-slate-400">↗</span>
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.jobscan.co"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-indigo-600 transition-colors inline-flex items-center gap-1"
                  >
                    <span>Jobscan ATS Optimization</span>
                    <span className="text-[9px] text-slate-400">↗</span>
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 4: Verified Job Boards */}
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
                Verified Remote Portals
              </span>
              <ul className="space-y-1.5 text-[11px]">
                <li>
                  <a
                    href="https://himalayas.app/jobs"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-indigo-600 transition-colors inline-flex items-center gap-1"
                  >
                    <span>Himalayas Remote Jobs</span>
                    <span className="text-[9px] text-slate-400">↗</span>
                  </a>
                </li>
                <li>
                  <a
                    href="https://weworkremotely.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-indigo-600 transition-colors inline-flex items-center gap-1"
                  >
                    <span>We Work Remotely</span>
                    <span className="text-[9px] text-slate-400">↗</span>
                  </a>
                </li>
                <li>
                  <a
                    href="https://wellfound.com/jobs"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-indigo-600 transition-colors inline-flex items-center gap-1"
                  >
                    <span>Wellfound Remote Startups</span>
                    <span className="text-[9px] text-slate-400">↗</span>
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.themomproject.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-indigo-600 transition-colors inline-flex items-center gap-1"
                  >
                    <span>The Mom Project</span>
                    <span className="text-[9px] text-slate-400">↗</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
            <div>
              &copy; {new Date().getFullYear()} RemoteLaunch OS. Outcome-driven remote acceleration architecture.
            </div>
            <div className="flex items-center gap-4">
              <span className="text-amber-700 font-bold">● Beta Status: Under Active Development</span>
              <span>•</span>
              <button
                type="button"
                onClick={() => setShowDevModal(true)}
                className="hover:text-slate-700 underline"
              >
                Development Changelog
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function Home() {
  return (
    <CoachingProvider>
      <DashboardContent />
    </CoachingProvider>
  );
}

