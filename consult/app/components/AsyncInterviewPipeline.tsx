'use client';

import React, { useState } from 'react';
import { useCoaching } from '../context/CoachingContext';

export default function AsyncInterviewPipeline() {
  const { currentProfile } = useCoaching();
  const asyncData = currentProfile.asyncInterview;

  const [submissionType, setSubmissionType] = useState<'video' | 'written'>('video');
  const [videoUrl, setVideoUrl] = useState('');
  const [writtenResponse, setWrittenResponse] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [checkedRubric, setCheckedRubric] = useState<Record<number, boolean>>({});
  const [showGuide, setShowGuide] = useState(false);

  const toggleRubric = (index: number) => {
    setCheckedRubric((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const calculatedScore = asyncData.evaluationRubric.reduce((acc, item, idx) => {
    return acc + (checkedRubric[idx] ? item.points : 0);
  }, 0);

  const handleSimulatedSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoUrl && !writtenResponse) {
      alert('Please provide either a video URL or a written response to submit for asynchronous evaluation.');
      return;
    }
    setIsSubmitted(true);
    // Pre-check 2 items for demonstration
    setCheckedRubric({ 0: true, 1: true });
  };

  return (
    <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-purple-600 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-100">
              Pillar 2 Core Deliverable
            </span>
            <span className="text-[10px] font-bold text-slate-400">|</span>
            <span className="text-xs font-bold text-slate-500">Days 31–60 Strategy</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1 tracking-tight">
            Asynchronous Interview & Take-Home Review Pipeline
          </h2>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Remote companies assess autonomy through recorded video screenings (Loom, Spark Hire) and written scenario take-homes. Submit your response below to evaluate against our validated hiring rubric.
          </p>
        </div>

        {/* Rubric Score Badge */}
        <div className="bg-purple-50 border border-purple-200 px-4 py-3 rounded-2xl text-right shrink-0">
          <span className="text-[9px] font-black uppercase tracking-wider text-purple-600 block">
            Rubric Evaluation Score
          </span>
          <span className="text-2xl font-black text-purple-950">
            {calculatedScore} / 100
          </span>
          <span className="text-[10px] block font-bold text-purple-700 mt-0.5">
            {calculatedScore >= 80 ? 'Passing Standard' : 'Needs Polish'}
          </span>
        </div>
      </div>

      {/* Main Scenario Prompt Card */}
      <div className="mt-6 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <span className="text-[10px] font-black uppercase tracking-widest bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2.5 py-1 rounded-full">
            Active Mock Scenario: {asyncData.format}
          </span>
          <span className="text-xs font-bold text-slate-300">
            Target Audience: {currentProfile.name}
          </span>
        </div>

        <h3 className="text-lg font-black leading-snug mt-2 text-white">
          "{asyncData.promptQuestion}"
        </h3>

        <div className="mt-4 p-3.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 text-xs text-slate-200">
          <span className="font-black text-indigo-300 uppercase text-[9px] tracking-wider block mb-1">
            Scenario Context
          </span>
          {asyncData.contextScenario}
        </div>
      </div>

      {/* Submission & Rubric Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        {/* Left: Submission Form */}
        <div className="lg:col-span-7 bg-slate-50 p-6 rounded-2xl border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
              Your Asynchronous Trial Submission
            </h4>
            {/* Format toggle */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setSubmissionType('video')}
                className={`px-3 py-1 rounded-lg font-bold transition-colors ${
                  submissionType === 'video'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                📹 Loom / Video Link
              </button>
              <button
                type="button"
                onClick={() => setSubmissionType('written')}
                className={`px-3 py-1 rounded-lg font-bold transition-colors ${
                  submissionType === 'written'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ✍️ Written Response
              </button>
            </div>
          </div>

          <form onSubmit={handleSimulatedSubmit} className="space-y-4">
            {submissionType === 'video' ? (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Loom, Vimeo, or Drive Video Link (60–90 seconds)
                  </label>
                  <a
                    href="https://www.loom.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-bold text-purple-700 hover:text-purple-900 inline-flex items-center gap-1 underline"
                  >
                    <span>Record on Loom</span>
                    <span>↗</span>
                  </a>
                </div>
                <input
                  type="url"
                  placeholder="https://www.loom.com/share/..."
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-purple-600 transition-colors"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Tip: Keep your video under 90 seconds. Speak clearly, look directly into the webcam, and begin with an executive summary.
                </p>

              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Structured Asynchronous Text Response
                </label>
                <textarea
                  rows={6}
                  placeholder="Draft your structured async response here. Use bullet points and clear priority labels..."
                  value={writtenResponse}
                  onChange={(e) => setWrittenResponse(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-purple-600 transition-colors font-mono leading-relaxed"
                />
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setShowGuide(!showGuide)}
                className="text-xs font-bold text-purple-700 hover:text-purple-900 underline"
              >
                {showGuide ? 'Hide Sample Guide' : 'View Sample Model Guide'}
              </button>

              <button
                type="submit"
                className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-black uppercase tracking-wider px-5 py-2.5 rounded-xl shadow-md shadow-purple-600/20 transition-all"
              >
                {isSubmitted ? 'Update Submission' : 'Submit for Rubric Evaluation'}
              </button>
            </div>

            {isSubmitted && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs font-bold flex items-center gap-2">
                <span>✓</span> Submission registered! Use the rubric checklist on the right to grade your performance.
              </div>
            )}
          </form>

          {/* Model Answer Guide Accordion */}
          {showGuide && (
            <div className="mt-4 p-4 rounded-xl bg-purple-50/70 border border-purple-200 text-xs text-purple-950">
              <span className="font-black uppercase text-[10px] tracking-wider block mb-1">
                Model High-Signal Response Framework
              </span>
              <p className="leading-relaxed font-medium">
                {asyncData.sampleGoodResponseGuide}
              </p>
            </div>
          )}
        </div>

        {/* Right: Rubric Evaluation */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
                Evaluation Rubric (Self or Coach)
              </h4>
              <span className="text-[10px] font-bold text-slate-400">Click to score</span>
            </div>

            <div className="space-y-3">
              {asyncData.evaluationRubric.map((item, idx) => {
                const isChecked = !!checkedRubric[idx];
                return (
                  <div
                    key={idx}
                    onClick={() => toggleRubric(idx)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                      isChecked
                        ? 'bg-purple-50/50 border-purple-300 text-purple-950'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 text-xs font-black transition-colors ${
                        isChecked
                          ? 'bg-purple-600 border-purple-600 text-white'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {isChecked && '✓'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold leading-tight">
                          {item.criterion}
                        </span>
                        <span className="text-[10px] font-black text-purple-600 shrink-0">
                          +{item.points} pts
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                        {item.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Review Verdict */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="font-bold text-slate-600">Total Validated Score:</span>
            <span className="font-black text-sm text-purple-900">
              {calculatedScore} / 100 Points
            </span>
          </div>
        </div>
      </div>

      {/* Pillar 2 Active Development Banner */}
      <div className="mt-6 p-4 rounded-2xl bg-amber-50/80 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-950">
        <div className="flex items-start sm:items-center gap-2.5">
          <span className="w-5 h-5 rounded-md bg-amber-200 text-amber-800 flex items-center justify-center font-bold shrink-0 text-[11px]">
            🚧
          </span>
          <p className="leading-snug">
            <strong>Under Active Development:</strong> AI speech-to-text transcript processing and automated filler-word detection are undergoing training. Video link registration, written async response drafting, and the validated 100-point rubric are fully functional.
          </p>
        </div>
        <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 bg-amber-200/70 border border-amber-300 px-2.5 py-1 rounded-md shrink-0 self-start sm:self-auto">
          Phase 2 Beta
        </span>
      </div>
    </section>
  );
}

