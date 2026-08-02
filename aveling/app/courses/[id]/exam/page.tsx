'use client';

// STEP-1.1.19, STEP-1.1.20, STEP-1.1.21, STEP-1.1.23, STEP-1.1.24
import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Award, CheckCircle2, XCircle, ShieldCheck, ChevronRight, ArrowRight, Wallet, RotateCcw, Banknote } from 'lucide-react';
import { apiClient } from '../../../../lib/axios';

interface ExamQuestion {
    id: string;
    question: string;
    type: 'MCQ' | 'ESSAY' | 'INPUT_ANSWER';
    options?: string[];
    correctIdx?: number;
    expectedKeyword?: string;
}

type ExamPhase = 'instructions' | 'active' | 'review_awaiting' | 'passed' | 'failed' | 'refund_choice';

function ExamPortalContent({ params }: { params: { id: string } }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const ticketId = searchParams.get('ticketId') || '';
    const attemptParam = parseInt(searchParams.get('attempt') || '1', 10);

    const [phase, setPhase] = useState<ExamPhase>('instructions');
    const [currentIdx, setCurrentIdx] = useState(0);
    const [answers, setAnswers] = useState<Record<string, any>>({});
    const [submitting, setSubmitting] = useState(false);
    const [scorePct, setScorePct] = useState(0);
    const [refundAmount, setRefundAmount] = useState(0);
    const [refundProcessing, setRefundProcessing] = useState(false);
    const [refundDone, setRefundDone] = useState(false);

    // STEP-1.1.24: Mixed question types
    const questions: ExamQuestion[] = [
        {
            id: 'q1',
            type: 'MCQ',
            question: 'What is the maximum fall distance allowed before a fall arrest system must lock under Australian WHS regulations?',
            options: ['1.0 metre', '2.0 metres', '3.5 metres', '5.0 metres'],
            correctIdx: 1
        },
        {
            id: 'q2',
            type: 'INPUT_ANSWER',
            question: 'What is the minimum static load strength (in kN) required for a single-person anchor point according to AS/NZS 1891?',
            expectedKeyword: '15'
        },
        {
            id: 'q3',
            type: 'ESSAY',
            question: 'Detail the step-by-step procedures for conducting a pre-use inspection of a full-body safety harness before ascending to a high work area.',
        },
        {
            id: 'q4',
            type: 'MCQ',
            question: 'What action must be taken immediately if a safety harness exhibits fraying or chemical contamination?',
            options: [
                'Wrap duct tape around the frayed webbing',
                'Tag out of service, destroy, and log incident report',
                'Use it only for ground-level tethering',
                'Ignore if used less than 1 hour'
            ],
            correctIdx: 1
        }
    ];

    const handleSelectOption = (qId: string, optionIdx: number) => {
        setAnswers(prev => ({ ...prev, [qId]: optionIdx }));
    };

    const handleTextChange = (qId: string, val: string) => {
        setAnswers(prev => ({ ...prev, [qId]: val }));
    };

    // STEP-1.1.20: On submit, set review-awaiting FIRST, then grade
    const handleSubmitExam = async () => {
        setSubmitting(true);

        // STEP-1.1.20: Immediately set to review-awaiting
        if (ticketId) {
            try {
                await apiClient.post(`/tickets/${ticketId}/set-review-awaiting`);
            } catch { /* non-blocking */ }
        }

        setPhase('review_awaiting');

        // Grade after short delay to simulate review process
        setTimeout(async () => {
            let points = 0;
            questions.forEach(q => {
                if (q.type === 'MCQ' && answers[q.id] === q.correctIdx) points += 100;
                else if (q.type === 'INPUT_ANSWER' && String(answers[q.id] || '').trim().includes(q.expectedKeyword || '15')) points += 100;
                else if (q.type === 'ESSAY' && String(answers[q.id] || '').trim().length > 20) points += 100;
            });

            const score = Math.round(points / questions.length);
            const passed = score >= 75;
            const refund = passed ? (attemptParam >= 2 ? 560 : 280) : 0;

            setScorePct(score);
            setRefundAmount(refund);

            // STEP-1.1.21: Only mark ticket_issued if passed
            if (ticketId) {
                try {
                    await apiClient.post(`/tickets/${ticketId}/exam-outcome`, {
                        passed,
                        attemptNumber: attemptParam
                    });
                } catch { /* non-blocking */ }
            }

            setSubmitting(false);
            setPhase(passed ? 'passed' : 'failed');
        }, 1500);
    };

    // STEP-1.1.17 & 1.1.18: Refund choice handler
    const handleRefundChoice = async (action: 'use_for_another_ticket' | 'refund_to_bank') => {
        setRefundProcessing(true);
        try {
            if (ticketId) {
                await apiClient.post(`/tickets/${ticketId}/refund-choice`, { action });
            }
        } catch { /* non-blocking */ }
        setRefundProcessing(false);
        setRefundDone(true);
        setTimeout(() => router.push('/sponsored-course'), 2000);
    };

    return (
        <div className="mx-auto max-w-3xl space-y-6 py-6 px-4">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-500">
                <Link href={`/courses/${params.id}`} className="hover:text-zinc-900 dark:hover:text-white">Course Player</Link>
                <ChevronRight className="h-3 w-3" />
                <span>Theory Assessment</span>
            </div>

            {/* PHASE: Instructions */}
            {phase === 'instructions' && (
                <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFC700] text-black">
                            <Award className="h-7 w-7" />
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-zinc-900 dark:text-white">Official Theory Assessment</h1>
                            <p className="text-xs text-zinc-500 font-mono">Course Code: RIIWHS204E • Ticket #{ticketId || 'N/A'}</p>
                        </div>
                    </div>

                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/60 dark:bg-amber-950/40 text-xs text-amber-900 dark:text-amber-200 space-y-2">
                        <p className="font-bold">Assessment Structure:</p>
                        <ul className="list-disc list-inside space-y-1 text-amber-800 dark:text-amber-300">
                            <li>Includes <strong>MCQ</strong>, <strong>Input Answer</strong>, and <strong>Essay Response</strong> question types.</li>
                            <li>Passing score: <strong>75% minimum</strong> required.</li>
                            <li>Submission sets status to <strong>Review-Awaiting</strong> while being graded.</li>
                            <li>On passing, your ticket is issued and a refund is credited to your wallet.</li>
                        </ul>
                    </div>

                    <button
                        onClick={() => setPhase('active')}
                        className="w-full inline-flex items-center justify-center gap-2 bg-[#FFC700] text-black py-4 text-xs font-black uppercase tracking-wider rounded-xl shadow-lg hover:bg-yellow-400 transition-all"
                    >
                        Begin Assessment
                        <ArrowRight className="h-4 w-4 stroke-[3]" />
                    </button>
                </div>
            )}

            {/* PHASE: Active Questions */}
            {phase === 'active' && (
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-6">
                    <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
                        <span className="text-xs font-extrabold uppercase tracking-wider text-zinc-500">
                            Question {currentIdx + 1} of {questions.length} • {questions[currentIdx].type}
                        </span>
                        <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                            Pass: 75%
                        </span>
                    </div>

                    <h2 className="text-base font-extrabold text-zinc-900 dark:text-white">
                        {questions[currentIdx].question}
                    </h2>

                    {questions[currentIdx].type === 'MCQ' && (
                        <div className="space-y-2.5">
                            {questions[currentIdx].options?.map((opt, optIdx) => {
                                const selected = answers[questions[currentIdx].id] === optIdx;
                                return (
                                    <button
                                        key={optIdx}
                                        onClick={() => handleSelectOption(questions[currentIdx].id, optIdx)}
                                        className={`w-full flex items-center rounded-xl border p-4 text-left text-xs font-bold transition-all ${
                                            selected
                                                ? 'border-[#FFC700] bg-amber-50 ring-2 ring-[#FFC700]/30 dark:bg-amber-950/60'
                                                : 'border-zinc-200 bg-white hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950'
                                        }`}
                                    >
                                        <span className={`mr-3 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-black ${
                                            selected ? 'bg-[#FFC700] border-black text-black' : 'border-zinc-300 text-zinc-500'
                                        }`}>
                                            {String.fromCharCode(65 + optIdx)}
                                        </span>
                                        {opt}
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {questions[currentIdx].type === 'INPUT_ANSWER' && (
                        <input
                            type="text"
                            value={answers[questions[currentIdx].id] || ''}
                            onChange={(e) => handleTextChange(questions[currentIdx].id, e.target.value)}
                            placeholder="Enter your numerical or short answer"
                            className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 p-3 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-[#FFC700]"
                        />
                    )}

                    {questions[currentIdx].type === 'ESSAY' && (
                        <textarea
                            rows={5}
                            value={answers[questions[currentIdx].id] || ''}
                            onChange={(e) => handleTextChange(questions[currentIdx].id, e.target.value)}
                            placeholder="Write your detailed response here..."
                            className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 p-3 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-[#FFC700]"
                        />
                    )}

                    <div className="flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800">
                        <button
                            disabled={currentIdx === 0}
                            onClick={() => setCurrentIdx(currentIdx - 1)}
                            className="rounded-xl border border-zinc-300 px-4 py-2 text-xs font-bold text-zinc-700 hover:bg-zinc-50 disabled:opacity-40"
                        >
                            Previous
                        </button>

                        {currentIdx < questions.length - 1 ? (
                            <button
                                onClick={() => setCurrentIdx(currentIdx + 1)}
                                className="inline-flex items-center gap-1.5 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 px-5 py-2 rounded-xl text-xs font-black hover:opacity-80"
                            >
                                Next Question
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmitExam}
                                disabled={submitting}
                                className="inline-flex items-center gap-1.5 bg-[#FFC700] text-black px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-yellow-400 disabled:opacity-50"
                            >
                                {submitting ? 'Submitting...' : 'Submit Exam'}
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* PHASE: Review-Awaiting (STEP-1.1.20) */}
            {phase === 'review_awaiting' && (
                <div className="rounded-2xl border border-amber-300 bg-white p-8 shadow-xl dark:border-amber-900 dark:bg-zinc-900 text-center space-y-6">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-700 animate-pulse">
                        <Award className="h-10 w-10" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-zinc-900 dark:text-white">Submission Under Review</h2>
                        <p className="text-xs text-zinc-500 mt-2">Your exam has been submitted and is now in <strong>Review-Awaiting</strong> status while being graded...</p>
                    </div>
                </div>
            )}

            {/* PHASE: Passed (STEP-1.1.21 + STEP-1.1.18) */}
            {phase === 'passed' && !refundDone && (
                <div className="rounded-2xl border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-900 text-center space-y-6 shadow-xl">
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                        <CheckCircle2 className="h-12 w-12" />
                    </div>

                    <div className="space-y-1">
                        <h2 className="text-3xl font-black text-zinc-900 dark:text-white">ASSESSMENT PASSED!</h2>
                        <p className="text-2xl font-black text-emerald-600">{scorePct}% Score</p>
                    </div>

                    <div className="space-y-3 max-w-md mx-auto">
                        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-xs text-emerald-900 text-left space-y-1">
                            <p className="font-extrabold flex items-center gap-1">
                                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                                Ticket Status Updated to 'ticket_issued'
                            </p>
                            <p>Your certification result has been sent to your recruiter dashboard.</p>
                        </div>

                        <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 text-xs text-amber-950 text-left space-y-1">
                            <p className="font-extrabold flex items-center gap-1 text-amber-900">
                                <Wallet className="h-4 w-4 text-[#FFC700]" />
                                Refund Amount: ${refundAmount.toFixed(2)} AUD
                            </p>
                            <p className="text-amber-800">Choose how you'd like to apply your sponsorship refund:</p>
                        </div>
                    </div>

                    {/* STEP-1.1.17 & 1.1.18: Refund Choice (from changes.txt 1.4.6.3 & 1.4.6.4) */}
                    <div className="flex flex-col sm:flex-row justify-center gap-4 pt-2">
                        <button
                            onClick={() => handleRefundChoice('use_for_another_ticket')}
                            disabled={refundProcessing}
                            className="inline-flex items-center justify-center gap-2 bg-[#FFC700] text-black px-6 py-4 text-xs font-black uppercase tracking-wider rounded-xl shadow-lg hover:bg-yellow-400 transition-all disabled:opacity-50"
                        >
                            <ArrowRight className="h-4 w-4 stroke-[3]" />
                            Use Refund for Another Ticket
                        </button>
                        <button
                            onClick={() => handleRefundChoice('refund_to_bank')}
                            disabled={refundProcessing}
                            className="inline-flex items-center justify-center gap-2 bg-zinc-900 text-white px-6 py-4 text-xs font-black uppercase tracking-wider rounded-xl shadow-lg hover:bg-zinc-800 transition-all disabled:opacity-50"
                        >
                            <Banknote className="h-4 w-4" />
                            No Thanks, Refund to My Bank
                        </button>
                    </div>
                    {refundProcessing && <p className="text-xs text-zinc-500">Processing your choice...</p>}
                </div>
            )}

            {refundDone && (
                <div className="rounded-2xl border border-emerald-300 bg-white p-8 dark:border-emerald-800 dark:bg-zinc-900 text-center space-y-4 shadow-xl">
                    <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
                    <h2 className="text-xl font-black text-zinc-900 dark:text-white">Refund Processed!</h2>
                    <p className="text-xs text-zinc-500">Redirecting to your Candidate Portal...</p>
                </div>
            )}

            {/* PHASE: Failed */}
            {phase === 'failed' && (
                <div className="rounded-2xl border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-900 text-center space-y-6 shadow-xl">
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                        <XCircle className="h-12 w-12" />
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-3xl font-black text-zinc-900 dark:text-white">
                            {attemptParam >= 2 ? 'SECOND ATTEMPT FAILED' : 'RETAKE REQUIRED'}
                        </h2>
                        <p className="text-2xl font-black text-rose-600">{scorePct}% Score</p>
                        <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                            {attemptParam >= 2
                                ? 'You have exhausted both attempts for this ticket sponsorship.'
                                : 'You need to pay the course fee again to attempt the exam a second time.'}
                        </p>
                    </div>

                    {attemptParam < 2 && (
                        <div className="max-w-sm mx-auto bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 space-y-2">
                            <p className="font-bold">Second Attempt Available</p>
                            <p>To retake this exam, you will need to return to checkout and pay the course fee again. Upon passing your second attempt, your refund will be doubled (purchase price × 2).</p>
                        </div>
                    )}

                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        {attemptParam < 2 && (
                            <Link
                                href={`/checkout?ticketId=${ticketId}&candidateNumber=${searchParams.get('candidateNumber') || ''}&attempt=2`}
                                className="inline-flex items-center justify-center gap-2 bg-[#FFC700] text-black px-6 py-3.5 text-xs font-black uppercase tracking-wider rounded-xl shadow-lg hover:bg-yellow-400 transition-all"
                            >
                                <RotateCcw className="h-4 w-4" />
                                Pay & Book Second Attempt
                            </Link>
                        )}
                        <Link
                            href="/sponsored-course"
                            className="inline-flex items-center justify-center gap-2 border border-zinc-300 bg-white px-6 py-3.5 text-xs font-bold text-zinc-700 rounded-xl hover:bg-zinc-50 transition-all"
                        >
                            Return to Candidate Portal
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function ExamPortalPage({ params }: { params: { id: string } }) {
    return (
        <Suspense fallback={<div className="p-12 text-center text-xs font-bold text-amber-600">Loading Exam Portal...</div>}>
            <ExamPortalContent params={params} />
        </Suspense>
    );
}
