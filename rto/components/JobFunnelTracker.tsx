'use client';

import React from 'react';
import { useCoaching, FunnelCounts } from '../context/CoachingContext';

const JOB_BOARD_URLS: Record<string, string> = {
  'Himalayas.app': 'https://himalayas.app/jobs',
  'Wellfound Remote': 'https://wellfound.com/jobs',
  'RemoteOK': 'https://remoteok.com',
  'Y Combinator Jobs': 'https://www.ycombinator.com/jobs',
  'Remotive Tech': 'https://remotive.com/remote-tech-jobs',
  'The Mom Project': 'https://www.themomproject.com',
  'InHerSight': 'https://www.inhersight.com/jobs',
  'FlexJobs Remote': 'https://www.flexjobs.com/remote-jobs',
  'Himalayas Async': 'https://himalayas.app/jobs?async=true',
  'We Work Remotely': 'https://weworkremotely.com',
  'SupportDriven Job Board': 'https://supportdriven.com/jobs/',
  'Himalayas Customer Support': 'https://himalayas.app/jobs/customer-support',
  'Wellfound CS': 'https://wellfound.com/jobs?role=customer-support',
  'We Work Remotely CS': 'https://weworkremotely.com/categories/remote-customer-support-jobs',
  'Remote.co': 'https://remote.co/remote-jobs/customer-service/',
};

const ASYNC_COMPANY_URLS: Record<string, { url: string; description: string }> = {
  'GitLab': {
    url: 'https://about.gitlab.com/company/culture/all-remote/',
    description: 'World’s largest all-remote handbook & async culture.',
  },
  'Automattic': {
    url: 'https://automattic.com/work-with-us/',
    description: '100% distributed across 90+ countries since inception.',
  },
  'Automattic (Happiness Engineers)': {
    url: 'https://automattic.com/work-with-us/',
    description: 'Premier global customer advocacy & Happiness Engineering team.',
  },
  'Zapier': {
    url: 'https://zapier.com/jobs',
    description: 'Pioneering async team with transparent salary formulas.',
  },
  'Doist': {
    url: 'https://doist.com/about',
    description: 'Creators of Twist & Todoist; leaders in asynchronous work.',
  },
  'Buffer': {
    url: 'https://buffer.com/journey',
    description: 'Radically transparent remote workplace with open salaries.',
  },
  'Basecamp (37signals)': {
    url: 'https://basecamp.com/about',
    description: 'Authors of Remote: Office Not Required.',
  },
  'Supabase': {
    url: 'https://supabase.com/careers',
    description: 'Open-source remote infrastructure team worldwide.',
  },
  'Help Scout': {
    url: 'https://www.helpscout.com/careers/',
    description: 'Async customer support platform built 100% remotely.',
  },
  'DuckDuckGo': {
    url: 'https://duckduckgo.com/hiring',
    description: 'Fully remote with flexible hours and zero tracking.',
  },
  'Ghost Foundation': {
    url: 'https://ghost.org/careers/',
    description: 'Independent remote publishing platform with deep doc culture.',
  },
  'Stripe Support': {
    url: 'https://stripe.com/jobs',
    description: 'World-class financial infrastructure support and merchant ops.',
  },
  'Linear': {
    url: 'https://linear.app/careers',
    description: 'Pacesetter for product craftsmanship and async cycles.',
  },
  'Loom': {
    url: 'https://www.loom.com/careers',
    description: 'The pioneer of asynchronous video messaging.',
  },
  'Notion Support': {
    url: 'https://www.notion.so/careers',
    description: 'Distributed support operations for global workspace users.',
  },
};

function getJobBoardUrl(boardName: string): string {
  return JOB_BOARD_URLS[boardName] || `https://www.google.com/search?q=${encodeURIComponent(boardName + ' remote jobs')}`;
}

function getCompanyInfo(companyName: string): { url: string; description: string } {
  return (
    ASYNC_COMPANY_URLS[companyName] || {
      url: `https://www.google.com/search?q=${encodeURIComponent(companyName + ' remote careers')}`,
      description: 'Distributed employer with async remote opportunities.',
    }
  );
}

export default function JobFunnelTracker() {
  const { currentProfile, funnelCounts, updateFunnelCount } = useCoaching();
  const config = currentProfile.jobFunnel;

  const funnelStages: {
    key: keyof FunnelCounts;
    name: string;
    target: number;
    description: string;
    badgeColor: string;
  }[] = [
    {
      key: 'applications',
      name: '1. Targeted Applications',
      target: config.targetApplications,
      description: 'High-fit tailored outbound pitches directly to remote managers & async listings.',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    },
    {
      key: 'screenings',
      name: '2. Async Screenings Passed',
      target: config.targetScreenings,
      description: 'Recruiter video pitches or written questionnaire screenings successfully cleared.',
      badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    },
    {
      key: 'trials',
      name: '3. Take-Homes & Paid Trials',
      target: config.targetTrials,
      description: 'In-depth asynchronous architectural, scenario, or coding take-home trials.',
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
    },
    {
      key: 'offers',
      name: '4. Validated Remote Offers',
      target: config.targetOffers,
      description: 'Signed remote contracts with competitive comp and guaranteed async flexibility.',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    },
  ];

  // Calculate funnel conversion health
  const appToScreen = funnelCounts.applications > 0
    ? Math.round((funnelCounts.screenings / funnelCounts.applications) * 100)
    : 0;
  const screenToTrial = funnelCounts.screenings > 0
    ? Math.round((funnelCounts.trials / funnelCounts.screenings) * 100)
    : 0;

  return (
    <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
              Pillar 3 Core Deliverable
            </span>
            <span className="text-[10px] font-bold text-slate-400">|</span>
            <span className="text-xs font-bold text-slate-500">Days 61–90 Scaling</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1 tracking-tight">
            90-Day Remote Application Funnel & Velocity Tracker
          </h2>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Eliminate low-yield spray-and-pray job submissions. Track a calibrated high-conversion funnel targeted strictly toward securing a validated remote offer within 90 days.
          </p>
        </div>

        {/* 90-Day Outcome Target Card */}
        <div className="bg-emerald-50/80 border border-emerald-200 p-4 rounded-2xl text-right shrink-0">
          <span className="text-[9px] font-black uppercase tracking-wider text-emerald-700 block">
            90-Day Landing Target
          </span>
          <span className="text-xl font-black text-emerald-950">
            {config.targetOffers} Validated Offer
          </span>
          <span className="text-[10px] text-emerald-700 block font-semibold mt-0.5">
            Target Timeline: &le; {config.targetDays} Days
          </span>
        </div>
      </div>

      {/* Visual Funnel Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {funnelStages.map((stage) => {
          const current = funnelCounts[stage.key];
          const pct = Math.min(100, Math.round((current / stage.target) * 100));

          return (
            <div
              key={stage.key}
              className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 flex flex-col justify-between"
            >
              <div>
                <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${stage.badgeColor} inline-block mb-2`}>
                  {stage.name}
                </span>

                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-3xl font-black text-slate-900">{current}</span>
                  <span className="text-xs font-bold text-slate-400">Target: {stage.target}</span>
                </div>

                {/* Progress bar */}
                <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden mt-3 border border-slate-300/60">
                  <div
                    className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <p className="text-[11px] text-slate-500 mt-3 leading-relaxed">
                  {stage.description}
                </p>
              </div>

              {/* Counter Controls */}
              <div className="mt-5 pt-3 border-t border-slate-200 flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400">Log Count:</span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => updateFunnelCount(stage.key, current - 1)}
                    className="w-7 h-7 rounded-lg bg-white hover:bg-slate-200 border border-slate-300 text-slate-700 text-xs font-black flex items-center justify-center transition-colors"
                    title="Decrement"
                  >
                    -
                  </button>
                  <span className="text-xs font-bold text-slate-800 w-6 text-center">{current}</span>
                  <button
                    type="button"
                    onClick={() => updateFunnelCount(stage.key, current + 1)}
                    className="w-7 h-7 rounded-lg bg-slate-900 hover:bg-indigo-600 text-white text-xs font-black flex items-center justify-center transition-colors"
                    title="Increment"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Conversion Rate Insights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
              Application → Screening Conversion
            </span>
            <p className="text-xs text-slate-600 mt-0.5">Benchmark healthy target is &ge; 15%</p>
          </div>
          <span className={`text-xl font-black ${appToScreen >= 15 ? 'text-emerald-600' : 'text-amber-600'}`}>
            {appToScreen}%
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
              Screening → Take-Home Trial Conversion
            </span>
            <p className="text-xs text-slate-600 mt-0.5">Benchmark healthy target is &ge; 30%</p>
          </div>
          <span className={`text-xl font-black ${screenToTrial >= 30 ? 'text-emerald-600' : 'text-indigo-600'}`}>
            {screenToTrial}%
          </span>
        </div>
      </div>

      {/* Timezone Strategy & Curated Remote Boards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Timezone Strategy Box */}
        <div className="p-5 rounded-2xl bg-indigo-50/40 border border-indigo-100">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-md">
              Timezone Protocol
            </span>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
              Optimal Overlap Guidelines
            </h4>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed">
            {config.timezoneStrategy}
          </p>
          <div className="mt-3 p-3 rounded-xl bg-white border border-indigo-100 text-[11px] text-slate-600">
            <span className="font-bold text-slate-900 block mb-0.5">Pro Tip:</span>
            Always state your operational overlap window right in your initial application note: "Available for synchronous overlap from 9am to 1pm EST; fully asynchronous for remaining deep-work hours."
          </div>
        </div>

        {/* Recommended Job Boards & High-Trust Companies */}
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 mb-2">
              Primary Remote Job Boards ({currentProfile.name})
            </h4>
            <div className="flex flex-wrap gap-2 mb-4">
              {config.primaryJobBoards.map((board) => {
                const url = getJobBoardUrl(board);
                return (
                  <a
                    key={board}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-1.5 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-slate-800 hover:text-indigo-700 text-xs font-semibold px-3 py-1.5 rounded-xl transition-all shadow-2xs"
                    title={`Open verified board in new tab: ${board}`}
                  >
                    <span>🔗</span>
                    <span>{board}</span>
                    <span className="text-[10px] text-slate-400 group-hover:text-indigo-600 transition-transform group-hover:translate-x-0.5">↗</span>
                  </a>
                );
              })}
            </div>

            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 mb-2">
              Benchmark Asynchronous Employers
            </h4>
            <div className="flex flex-wrap gap-2">
              {config.asyncCompanyHighlights.map((comp) => {
                const info = getCompanyInfo(comp);
                return (
                  <a
                    key={comp}
                    href={info.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 text-emerald-900 text-xs font-bold px-3 py-1.5 rounded-xl transition-all"
                    title={`${comp}: ${info.description}`}
                  >
                    <span>🏢</span>
                    <span>{comp}</span>
                    <span className="text-[10px] text-emerald-600 group-hover:translate-x-0.5 transition-transform">↗</span>
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Pillar 3 Active Development Banner */}
      <div className="mt-6 p-4 rounded-2xl bg-amber-50/80 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-950">
        <div className="flex items-start sm:items-center gap-2.5">
          <span className="w-5 h-5 rounded-md bg-amber-200 text-amber-800 flex items-center justify-center font-bold shrink-0 text-[11px]">
            🚧
          </span>
          <p className="leading-snug">
            <strong>Under Active Development:</strong> Direct API sync for Greenhouse, Lever, and Ashby applicant tracking systems is underway. Manual velocity tracking, conversion calculators, and verified external job board links are fully live.
          </p>
        </div>
        <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 bg-amber-200/70 border border-amber-300 px-2.5 py-1 rounded-md shrink-0 self-start sm:self-auto">
          Phase 3 Beta
        </span>
      </div>
    </section>
  );
}

