'use client';

// STEP-1.1.19, STEP-1.1.20, STEP-1.1.21, STEP-1.1.23, STEP-1.1.24
import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { Award, CheckCircle2, XCircle, ShieldCheck, ChevronRight, ArrowRight, Wallet, RotateCcw, Banknote, Mail } from 'lucide-react';
import { apiClient } from '../../../../lib/axios';
import { PageShell } from '../../../../components/PageShell';

interface ExamQuestion {
    id: string;
    question: string;
    type: 'MCQ' | 'ESSAY' | 'INPUT_ANSWER';
    options?: string[];
    correctIdx?: number;
    expectedKeyword?: string;
}

type ExamPhase = 'instructions' | 'active' | 'review_awaiting' | 'passed' | 'failed' | 'refund_choice';

function ExamPortalContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const routeParams = useParams();
    const id = routeParams.id as string;
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

    const [questions, setQuestions] = useState<any[]>([]);
    const [attemptId, setAttemptId] = useState('');
    const [starting, setStarting] = useState(false);
    
    const [showRestoredNotification, setShowRestoredNotification] = useState(false);
    const isRestoring = React.useRef(true);

    React.useEffect(() => {
        const savedStateStr = localStorage.getItem(`course_exam_state_${id}`);
        if (savedStateStr) {
            try {
                const savedState = JSON.parse(savedStateStr);
                if (savedState.phase === 'active' && savedState.questions?.length > 0) {
                    setQuestions(savedState.questions);
                    setAttemptId(savedState.attemptId);
                    setCurrentIdx(savedState.currentIdx);
                    setAnswers(savedState.answers);
                    setPhase('active');
                    setShowRestoredNotification(true);
                    setTimeout(() => setShowRestoredNotification(false), 5000);
                }
            } catch (e) {
                console.error("Failed to restore exam state", e);
            }
        }
        isRestoring.current = false;
    }, [id]);

    React.useEffect(() => {
        if (isRestoring.current) return;
        if (phase === 'active') {
            localStorage.setItem(`course_exam_state_${id}`, JSON.stringify({
                phase,
                questions,
                attemptId,
                currentIdx,
                answers
            }));
        }
    }, [phase, questions, attemptId, currentIdx, answers, id]);

    const startAssessment = async () => {
        setStarting(true);
        try {
            const res = await apiClient.post('/exams/attempts/start', { courseId: id });
            const attempt = res.data?.data;
            if (attempt?.id) {
                setAttemptId(attempt.id);
                // Fetch questions for this attempt
                const detailsRes = await apiClient.get(`/exams/attempts/${attempt.id}`);
                const fetchedQuestions = detailsRes.data?.data?.questions || [];
                if (fetchedQuestions.length > 0) {
                    setQuestions(fetchedQuestions);
                    setPhase('active');
                } else {
                    alert("No questions configured in the database for this course exam.");
                    setStarting(false);
                }
            }
        } catch (err: any) {
            console.error("Failed to start assessment:", err);
            if (err.response?.status !== 401) {
                alert(err.response?.data?.error || err.response?.data?.message || "Failed to start assessment");
            }
            setStarting(false);
        }
    };

    const handleSelectOption = (qId: string, optionIdx: number) => {
        setAnswers(prev => ({ ...prev, [qId]: optionIdx }));
    };

    const handleTextChange = (qId: string, val: string) => {
        setAnswers(prev => ({ ...prev, [qId]: val }));
    };

    const handleSubmitExam = async () => {
        setSubmitting(true);

        // STEP-1.1.20: Immediately set to review-awaiting
        if (ticketId) {
            try {
                await apiClient.post(`/tickets/${ticketId}/set-review-awaiting`);
            } catch { /* non-blocking */ }
        }

        try {
            await apiClient.post(`/exams/attempts/${attemptId}/submit`, { answers });
            setPhase('review_awaiting');
            localStorage.removeItem(`course_exam_state_${id}`);
        } catch (err) {
            console.error("Failed to submit exam:", err);
            alert("Failed to submit exam. Please try again.");
        } finally {
            setSubmitting(false);
        }
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
        setTimeout(() => router.push('/dashboard'), 2000);
    };

    return (
        <PageShell>
            <div className="mx-auto max-w-3xl space-y-8">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-xs font-extrabold text-zinc-400 uppercase tracking-wider">
                    <Link href={`/courses/${id}`} className="hover:text-zinc-900 transition-colors">Course Player</Link>
                    <ChevronRight className="h-3 w-3" />
                    <span className="text-zinc-900">Theory Assessment</span>
                </div>

                {/* PHASE: Instructions */}
                {phase === 'instructions' && (
                    <div className="rounded-2xl border-2 border-zinc-200 bg-white p-10 shadow-md space-y-8">
                        <div className="flex items-center gap-4">
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FFC700] text-black shadow-sm">
                                <Award className="h-8 w-8" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black text-zinc-900">Official Theory Assessment</h1>
                                <p className="text-xs font-bold text-zinc-500 font-mono mt-1 uppercase tracking-widest">
                                    Course Code: {id} • Ticket #{ticketId || 'N/A'}
                                </p>
                            </div>
                        </div>

                        <div className="rounded-xl border-2 border-amber-300 bg-amber-50 p-6 text-sm text-amber-900 space-y-3">
                            <p className="font-black uppercase tracking-widest text-xs">Assessment Structure:</p>
                            <ul className="list-disc list-inside space-y-1.5 text-amber-800 font-medium">
                                <li>Includes <strong>MCQ</strong>, <strong>Input Answer</strong>, and <strong>Essay Response</strong> question types.</li>
                                <li>Submission sets status to <strong>Review-Awaiting</strong> while being graded.</li>
                                <li>On passing, your ticket is issued and a refund is credited to your wallet.</li>
                            </ul>
                        </div>

                        <button
                            onClick={startAssessment}
                            disabled={starting}
                            className="w-full inline-flex items-center justify-center gap-2 bg-[#FFC700] text-black py-4 text-sm font-black uppercase tracking-wider rounded-xl shadow-md hover:bg-yellow-400 transition-all disabled:opacity-50 group"
                        >
                            {starting ? 'Preparing Exam Engine...' : 'Begin Assessment'}
                            <ArrowRight className="h-5 w-5 stroke-[3] group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                )}

                {/* PHASE: Active Questions */}
                {phase === 'active' && questions.length > 0 && (
                    <div className="bg-white border-2 border-zinc-200 rounded-2xl shadow-sm overflow-hidden relative">
                        {showRestoredNotification && (
                            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-full flex items-center gap-2 text-emerald-800 shadow-sm animate-fade-in">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                <span className="text-xs font-bold">Previous progress successfully restored.</span>
                            </div>
                        )}
                        <div className="p-8 border-b-2 border-zinc-100 bg-zinc-50 pt-16">
                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-2">
                                Question {currentIdx + 1} of {questions.length} • {questions[currentIdx]?.questionType}
                            </span>
                            <h2 className="text-xl font-extrabold text-zinc-900 leading-relaxed">
                                {questions[currentIdx]?.questionText}
                            </h2>
                        </div>

                        <div className="p-8 space-y-4">
                            {questions[currentIdx]?.questionType === 'mcq' && (
                                <div className="space-y-3">
                                    {questions[currentIdx]?.options?.map((opt: string, optIdx: number) => {
                                        const selected = answers[questions[currentIdx].id] === optIdx;
                                        return (
                                            <button
                                                key={optIdx}
                                                onClick={() => handleSelectOption(questions[currentIdx].id, optIdx)}
                                                className={`w-full flex items-center p-5 rounded-xl border-2 transition-all text-left ${
                                                    selected
                                                        ? 'border-zinc-900 bg-zinc-900 text-white shadow-md'
                                                        : 'border-zinc-200 bg-white hover:border-zinc-400 text-zinc-700 hover:bg-zinc-50'
                                                }`}
                                            >
                                                <span className={`mr-4 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-black ${
                                                    selected ? 'bg-[#FFC700] text-black' : 'bg-zinc-200 text-zinc-500'
                                                }`}>
                                                    {String.fromCharCode(65 + optIdx)}
                                                </span>
                                                <span className="font-bold">{opt}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}

                            {questions[currentIdx]?.questionType === 'input_answer' && (
                                <input
                                    type="text"
                                    value={answers[questions[currentIdx].id] || ''}
                                    onChange={(e) => handleTextChange(questions[currentIdx].id, e.target.value)}
                                    placeholder="Enter your numerical or short answer"
                                    className="w-full bg-zinc-50 border-2 border-zinc-200 p-4 rounded-xl text-sm font-bold text-zinc-900 outline-none focus:border-zinc-900 focus:bg-white transition-all"
                                />
                            )}

                            {questions[currentIdx]?.questionType === 'essay' && (
                                <textarea
                                    rows={5}
                                    value={answers[questions[currentIdx].id] || ''}
                                    onChange={(e) => handleTextChange(questions[currentIdx].id, e.target.value)}
                                    placeholder="Write your detailed response here..."
                                    className="w-full bg-zinc-50 border-2 border-zinc-200 p-4 rounded-xl text-sm font-medium text-zinc-900 outline-none focus:border-zinc-900 focus:bg-white transition-all resize-none"
                                />
                            )}
                        </div>

                        <div className="flex items-center justify-between p-6 border-t-2 border-zinc-100 bg-zinc-50">
                            <button
                                disabled={currentIdx === 0}
                                onClick={() => setCurrentIdx(currentIdx - 1)}
                                className="rounded-xl border-2 border-zinc-200 bg-white px-6 py-3 text-xs font-black uppercase tracking-wider text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 disabled:opacity-40 transition-all"
                            >
                                Previous
                            </button>

                            {currentIdx < questions.length - 1 ? (
                                <button
                                    onClick={() => setCurrentIdx(currentIdx + 1)}
                                    className="inline-flex items-center gap-2 bg-zinc-900 text-white px-8 py-3 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-black transition-all shadow-md"
                                >
                                    Next Question
                                    <ChevronRight className="h-4 w-4 stroke-[3]" />
                                </button>
                            ) : (
                                <button
                                    onClick={handleSubmitExam}
                                    disabled={submitting}
                                    className="inline-flex items-center gap-2 bg-[#FFC700] text-black px-8 py-3 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-yellow-400 disabled:opacity-50 transition-all shadow-md"
                                >
                                    {submitting ? 'Submitting...' : 'Submit Exam'}
                                    <CheckCircle2 className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* PHASE: Review-Awaiting (STEP-1.1.20) */}
                {phase === 'review_awaiting' && (
                    <div className="rounded-2xl border-2 border-[#FFC700] bg-white p-12 text-center shadow-xl space-y-6">
                        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#FFC700]">
                            <Award className="h-10 w-10 text-black" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-zinc-900 mb-2">Submission Under Review</h2>
                            <p className="text-sm font-medium text-zinc-500 leading-relaxed max-w-sm mx-auto">
                                Your exam has been submitted and is now in <strong>Review-Awaiting</strong> status. You will receive an email notification once graded by an admin.
                            </p>
                        </div>
                        <div className="pt-4">
                            <Link href="/dashboard" className="inline-flex items-center gap-2 bg-zinc-900 text-white px-8 py-4 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-black transition-all shadow-md">
                                Return to Dashboard
                            </Link>
                        </div>
                    </div>
                )}

                {/* PHASE: Passed (STEP-1.1.21 + STEP-1.1.18) */}
                {phase === 'passed' && !refundDone && (
                    <div className="rounded-2xl border-2 border-emerald-400 bg-white p-10 text-center space-y-8 shadow-xl">
                        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                            <CheckCircle2 className="h-12 w-12" />
                        </div>

                        <div className="space-y-2">
                            <h2 className="text-4xl font-black text-zinc-900">ASSESSMENT PASSED!</h2>
                            <p className="text-3xl font-black text-emerald-600">{scorePct}% Score</p>
                        </div>

                        <div className="space-y-4 max-w-lg mx-auto">
                            <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-5 text-sm text-emerald-900 text-left space-y-1.5">
                                <p className="font-black flex items-center gap-2 uppercase tracking-widest text-[10px]">
                                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                                    Ticket Status Updated
                                </p>
                                <p className="font-bold">Your certification result has been sent to your recruiter dashboard.</p>
                            </div>

                            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-5 text-sm text-blue-900 text-left space-y-1.5">
                                <p className="font-black flex items-center gap-2 text-blue-900 uppercase tracking-widest text-[10px]">
                                    <Mail className="h-4 w-4 text-blue-600" />
                                    Results Delivered via Mail
                                </p>
                                <p className="font-medium text-blue-800">
                                    Your exam score breakdown and official digital Statement of Attainment ticket have been dispatched directly to your registered email address.
                                </p>
                            </div>

                            <div className="bg-zinc-50 border-2 border-zinc-200 rounded-xl p-5 text-sm text-zinc-900 text-left space-y-1.5">
                                <p className="font-black flex items-center gap-2 text-zinc-900 uppercase tracking-widest text-[10px]">
                                    <Wallet className="h-4 w-4 text-[#FFC700]" />
                                    Sponsorship Refund: ${refundAmount.toFixed(2)} AUD
                                </p>
                                <p className="font-bold text-zinc-600">Choose how you'd like to apply your sponsorship refund:</p>
                            </div>
                        </div>

                        {/* STEP-1.1.17 & 1.1.18: Refund Choice */}
                        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
                            <button
                                onClick={() => handleRefundChoice('use_for_another_ticket')}
                                disabled={refundProcessing}
                                className="inline-flex flex-1 items-center justify-center gap-2 bg-[#FFC700] text-black px-6 py-4 text-xs font-black uppercase tracking-wider rounded-xl shadow-md hover:bg-yellow-400 transition-all disabled:opacity-50"
                            >
                                <ArrowRight className="h-4 w-4 stroke-[3]" />
                                Use Refund for Another Ticket
                            </button>
                            <button
                                onClick={() => handleRefundChoice('refund_to_bank')}
                                disabled={refundProcessing}
                                className="inline-flex flex-1 items-center justify-center gap-2 bg-zinc-900 text-white px-6 py-4 text-xs font-black uppercase tracking-wider rounded-xl shadow-md hover:bg-black transition-all disabled:opacity-50"
                            >
                                <Banknote className="h-4 w-4" />
                                No Thanks, Refund to My Bank
                            </button>
                        </div>
                        {refundProcessing && <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest animate-pulse mt-4">Processing your choice...</p>}
                    </div>
                )}

                {refundDone && (
                    <div className="rounded-2xl border-2 border-emerald-400 bg-white p-12 text-center space-y-5 shadow-xl">
                        <CheckCircle2 className="mx-auto h-16 w-16 text-emerald-600" />
                        <h2 className="text-2xl font-black text-zinc-900">Refund Processed!</h2>
                        <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest animate-pulse">Redirecting to your Candidate Portal...</p>
                    </div>
                )}

                {/* PHASE: Failed */}
                {phase === 'failed' && (
                    <div className="rounded-2xl border-2 border-rose-400 bg-white p-12 text-center space-y-8 shadow-xl">
                        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                            <XCircle className="h-12 w-12" />
                        </div>

                        <div className="space-y-2">
                            <h2 className="text-4xl font-black text-zinc-900">
                                {attemptParam >= 2 ? 'SECOND ATTEMPT FAILED' : 'RETAKE REQUIRED'}
                            </h2>
                            <p className="text-3xl font-black text-rose-600">{scorePct}% Score</p>
                            <p className="text-sm font-medium text-zinc-500 max-w-sm mx-auto mt-4 leading-relaxed">
                                {attemptParam >= 2
                                    ? 'You have exhausted both attempts for this ticket sponsorship.'
                                    : 'You need to pay the course fee again to attempt the exam a second time.'}
                            </p>
                        </div>

                        {attemptParam < 2 && (
                            <div className="max-w-md mx-auto bg-amber-50 border-2 border-amber-200 rounded-xl p-6 text-sm text-amber-900 space-y-2 text-left">
                                <p className="font-black uppercase tracking-widest text-[10px]">Second Attempt Available</p>
                                <p className="font-medium text-amber-800">To retake this exam, you will need to return to checkout and pay the course fee again. Upon passing your second attempt, your refund will be doubled (purchase price × 2).</p>
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
                            {attemptParam < 2 && (
                                <Link
                                    href={`/checkout?ticketId=${ticketId}&candidateNumber=${searchParams.get('candidateNumber') || ''}&attempt=2`}
                                    className="inline-flex items-center justify-center gap-2 bg-[#FFC700] text-black px-8 py-4 text-xs font-black uppercase tracking-wider rounded-xl shadow-md hover:bg-yellow-400 transition-all"
                                >
                                    <RotateCcw className="h-4 w-4 stroke-[3]" />
                                    Pay & Book Second Attempt
                                </Link>
                            )}
                            <Link
                                href="/dashboard"
                                className="inline-flex items-center justify-center gap-2 border-2 border-zinc-200 bg-white px-8 py-4 text-xs font-black uppercase tracking-wider text-zinc-500 rounded-xl hover:border-zinc-900 hover:text-zinc-900 transition-all"
                            >
                                Return to Candidate Portal
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </PageShell>
    );
}

export default function ExamPortalPage() {
    return (
        <Suspense fallback={
            <PageShell>
                <div className="flex flex-col items-center justify-center py-24 space-y-5">
                    <div className="animate-spin rounded-full h-14 w-14 border-4 border-zinc-200 border-t-[#FFC700]" />
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest animate-pulse">Loading Exam Portal...</p>
                </div>
            </PageShell>
        }>
            <ExamPortalContent />
        </Suspense>
    );
}
