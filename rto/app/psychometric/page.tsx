'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, AlertTriangle, ChevronRight, Lock, BrainCircuit, Mail, X, Download, FileText } from 'lucide-react';
import axios from 'axios';
import { PageShell } from '@/components/PageShell';

interface Question {
    questionText: string;
    questionType: string;
    options: string[];
    weight: number;
}

interface PsychometricStatus {
    module1Passed: boolean;
    module2Passed: boolean;
    completedAt: string | null;
    lastAttemptToday: {
        module_1: boolean;
        module_2: boolean;
    };
}

export default function PsychometricTestPage() {
    return (
        <React.Suspense fallback={<div className="flex h-screen items-center justify-center text-zinc-500 font-medium">Loading assessment...</div>}>
            <PsychometricTestContent />
        </React.Suspense>
    );
}

function PsychometricTestContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [status, setStatus] = useState<PsychometricStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');

    const [activeModule, setActiveModule] = useState<number | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<{ questionText: string, selectedOption: number }[]>([]);

    const [testState, setTestState] = useState<'intro' | 'testing' | 'result'>('intro');
    const [result, setResult] = useState<{ message: string } | null>(null);

    const [token, setToken] = useState<string | null>(null);
    const [showModule2Reminder, setShowModule2Reminder] = useState(false);
    const [downloadTriggered, setDownloadTriggered] = useState(false);
    const [agreedModule2Read, setAgreedModule2Read] = useState(false);

    useEffect(() => {
        const urlToken = searchParams.get('token');
        let activeToken = urlToken || localStorage.getItem('accessToken') || localStorage.getItem('lms_token');

        if (urlToken) localStorage.setItem('accessToken', urlToken);

        if (!activeToken) {
            setErrorMsg('Authentication token missing. Please sign up or log in via the recruitment portal first.');
            setLoading(false);
            return;
        }

        setToken(activeToken);
    }, [searchParams]);

    useEffect(() => {
        if (token) fetchStatus(token);
    }, [token]);

    const apiCall = async (endpoint: string, method: string = 'GET', data?: any, currentToken?: string, retryCount = 0): Promise<any> => {
        const t = currentToken || token;
        const baseUrl = process.env.NEXT_PUBLIC_API_URL
            ? `${process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '')}/api`
            : 'http://localhost:3001/api';

        try {
            const res = await axios({
                url: `${baseUrl}${endpoint}`,
                method,
                data,
                headers: { Authorization: `Bearer ${t}` }
            });
            return res.data;
        } catch (error: any) {
            // If token expired, attempt one silent refresh before failing
            if (error.response?.status === 401 && retryCount === 0) {
                try {
                    const refreshRes = await axios.post(`${baseUrl}/auth/refresh`, {}, { withCredentials: true });
                    const newAccessToken = refreshRes.data.accessToken;

                    if (newAccessToken) {
                        localStorage.setItem('accessToken', newAccessToken);
                        localStorage.setItem('lms_token', newAccessToken);
                        setToken(newAccessToken);

                        // Retry the original request with the fresh token
                        return await apiCall(endpoint, method, data, newAccessToken, 1);
                    }
                } catch (refreshError) {
                    console.error('Session refresh failed', refreshError);
                    // Fall through to throw the original 401 error
                }
            }
            throw error;
        }
    };

    const fetchStatus = async (activeToken: string) => {
        try {
            setLoading(true);
            const response = await apiCall('/psychometric/status', 'GET', undefined, activeToken);
            setStatus(response);
            if (response.module1Passed && response.module2Passed) setTestState('result');
        } catch (error: any) {
            setErrorMsg(error.response?.data?.error || 'Failed to fetch psychometric status');
        } finally {
            setLoading(false);
        }
    };

    const [showRestoredNotification, setShowRestoredNotification] = useState(false);
    const isRestoring = React.useRef(true);

    useEffect(() => {
        const savedStateStr = localStorage.getItem('psychometric_test_state');
        if (savedStateStr) {
            try {
                const savedState = JSON.parse(savedStateStr);
                if (savedState.testState === 'testing' && savedState.questions?.length > 0) {
                    setQuestions(savedState.questions);
                    setActiveModule(savedState.activeModule);
                    setCurrentQuestionIndex(savedState.currentQuestionIndex);
                    setAnswers(savedState.answers);
                    setTestState(savedState.testState);
                    setShowRestoredNotification(true);
                    setTimeout(() => setShowRestoredNotification(false), 5000);
                }
            } catch (e) {
                console.error("Failed to restore test state", e);
            }
        }
        isRestoring.current = false;
    }, []);

    useEffect(() => {
        if (isRestoring.current) return;
        if (testState === 'testing') {
            localStorage.setItem('psychometric_test_state', JSON.stringify({
                activeModule,
                questions,
                currentQuestionIndex,
                answers,
                testState
            }));
        }
    }, [activeModule, questions, currentQuestionIndex, answers, testState]);

    const startModule = async (moduleNum: number) => {
        try {
            setLoading(true);
            const response = await apiCall(`/psychometric/module/${moduleNum}/questions`);

            if (response.alreadyPassed) {
                alert('You have already passed this module.');
                fetchStatus(token!);
                return;
            }
            if (response.cooldownActive) {
                alert('You have already attempted this module today. Please try again tomorrow.');
                return;
            }

            setQuestions(response.questions);
            setActiveModule(moduleNum);
            setCurrentQuestionIndex(0);
            setAnswers([]);
            setTestState('testing');
        } catch (error: any) {
            alert(error.response?.data?.error || 'Failed to start module');
        } finally {
            setLoading(false);
        }
    };

    const handleAnswer = (optionIndex: number) => {
        const currentQ = questions[currentQuestionIndex];
        const newAnswers = [...answers];
        newAnswers[currentQuestionIndex] = { questionText: currentQ.questionText, selectedOption: optionIndex };
        setAnswers(newAnswers);
    };

    const nextQuestion = () => {
        if (currentQuestionIndex < questions.length - 1) setCurrentQuestionIndex(currentQuestionIndex + 1);
    };

    const previousQuestion = () => {
        if (currentQuestionIndex > 0) setCurrentQuestionIndex(currentQuestionIndex - 1);
    };

    const submitTest = async () => {
        if (answers.length < questions.length || answers.includes(undefined as any)) {
            alert('Please answer all questions before submitting.');
            return;
        }

        try {
            setLoading(true);
            const response = await apiCall(`/psychometric/module/${activeModule}/submit`, 'POST', { answers });
            setResult({ message: response.message });
            setTestState('result');
            localStorage.removeItem('psychometric_test_state');
            fetchStatus(token!);
        } catch (error: any) {
            alert(error.response?.data?.error || 'Failed to submit test');
        } finally {
            setLoading(false);
        }
    };

    if (errorMsg) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4">
                <div className="bg-zinc-900 border-2 border-rose-800 text-white p-8 rounded-2xl max-w-md w-full text-center space-y-4">
                    <AlertTriangle className="mx-auto w-14 h-14 text-rose-400" />
                    <h2 className="text-2xl font-black">Access Denied</h2>
                    <p className="text-zinc-400 text-sm">{errorMsg}</p>
                </div>
            </div>
        );
    }

    if (loading && !status && !errorMsg) {
        return (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-[#ED9139]" />
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest animate-pulse">Loading assessment data...</p>
            </div>
        );
    }

    if (!status) return null;

    if (status.module1Passed && status.module2Passed) {
        return (
            <PageShell>
                <div className="max-w-3xl mx-auto py-12">
                    <div className="bg-white border-2 border-emerald-300 rounded-2xl p-10 shadow-md text-center space-y-5">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                            <CheckCircle className="w-10 h-10 text-emerald-600" />
                        </div>
                        <h2 className="text-3xl font-black text-zinc-900">Assessment Cleared</h2>
                        <p className="text-zinc-500 text-sm max-w-md mx-auto">
                            You have successfully passed both modules of the mandatory psychometric assessment. You are now cleared to apply for FIFO positions.
                        </p>
                        <button
                            onClick={() => window.location.href = 'https://bluecollarrecruitment.co/dashboard'}
                            className="inline-flex items-center gap-2 bg-[#ED9139] hover:bg-[#dd7f26] text-[#0f172a] font-bold px-7 py-3 rounded-xl uppercase tracking-wider shadow-sm transition-all text-xs"
                        >
                            Return to Recruitment Dashboard <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </PageShell>
        );
    }

    if (testState === 'testing' && questions.length > 0) {
        const currentQ = questions[currentQuestionIndex];
        const currentAnswer = answers[currentQuestionIndex]?.selectedOption;
        const progress = ((currentQuestionIndex) / questions.length) * 100;

        return (
            <PageShell>
                <div className="max-w-3xl mx-auto">
                    {showRestoredNotification && (
                        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-800 shadow-sm animate-fade-in">
                            <CheckCircle className="w-5 h-5 text-emerald-500" />
                            <div>
                                <h3 className="font-bold text-sm">Session Restored</h3>
                                <p className="text-xs font-medium opacity-90">Your previous progress for Module {activeModule} has been seamlessly restored.</p>
                            </div>
                        </div>
                    )}

                    <div className="mb-6">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ED9139]/10 text-[#ED9139] font-bold text-xs uppercase tracking-wider w-fit mb-2">
                            <BrainCircuit className="h-3.5 w-3.5" /> Module {activeModule}
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Psychometric Assessment</h1>

                        <div className="mt-4 w-full bg-slate-200 rounded-full h-2">
                            <div className="bg-[#ED9139] h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                        </div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1.5">Question {currentQuestionIndex + 1} of {questions.length}</p>

                        {activeModule === 2 && (
                            <div className="mt-3 p-3 bg-amber-50/90 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center gap-2">
                                <Mail className="w-4 h-4 text-amber-600 shrink-0" />
                                <span>Based on the official Hiring Process Document and FAQ from your welcome email.</span>
                            </div>
                        )}
                    </div>

                    <div className="bg-white border-2 border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
                        <div className="p-8 border-b-2 border-zinc-100 bg-zinc-50">
                            <h2 className="text-xl font-extrabold text-zinc-900 leading-relaxed">
                                {currentQ.questionText}
                            </h2>
                        </div>
                        <div className="p-8 space-y-3">
                            {currentQ.options.map((opt, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleAnswer(idx)}
                                    className={`w-full text-left p-5 rounded-xl border-2 transition-all font-medium ${currentAnswer === idx
                                        ? 'border-zinc-900 bg-zinc-900 text-white'
                                        : 'border-zinc-200 hover:border-zinc-400 text-zinc-700 hover:bg-zinc-50'
                                        }`}
                                >
                                    <span className={`font-bold mr-4 ${currentAnswer === idx ? 'text-[#ED9139]' : 'text-slate-400'}`}>
                                        {String.fromCharCode(65 + idx)}.
                                    </span>
                                    {opt}
                                </button>
                            ))}
                        </div>
                        <div className="flex justify-between items-center p-6 border-t-2 border-zinc-100 bg-zinc-50">
                            <button
                                onClick={previousQuestion}
                                disabled={currentQuestionIndex === 0}
                                className="px-6 py-3 rounded-xl font-extrabold text-zinc-500 uppercase tracking-wider border-2 border-zinc-200 hover:bg-zinc-100 disabled:opacity-50 transition-colors"
                            >
                                Previous
                            </button>

                            {currentQuestionIndex === questions.length - 1 ? (
                                <button
                                    onClick={submitTest}
                                    disabled={loading || currentAnswer === undefined}
                                    className="px-7 py-2.5 rounded-xl font-bold text-xs text-[#0f172a] bg-[#ED9139] hover:bg-[#dd7f26] uppercase tracking-wider disabled:opacity-50 transition-colors shadow-sm"
                                >
                                    {loading ? 'Submitting...' : 'Submit Test'}
                                </button>
                            ) : (
                                <button
                                    onClick={nextQuestion}
                                    disabled={currentAnswer === undefined}
                                    className="px-8 py-3 rounded-xl font-extrabold text-white bg-zinc-900 hover:bg-black uppercase tracking-wider disabled:opacity-50 transition-colors shadow-md"
                                >
                                    Next
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </PageShell>
        );
    }

    if (testState === 'result' && result) {
        return (
            <PageShell>
                <div className="max-w-3xl mx-auto py-12">
                    <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-sm">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#ED9139]/10 text-[#ED9139] mb-4">
                            <CheckCircle className="w-7 h-7" />
                        </div>
                        <h2 className="text-2xl font-extrabold text-slate-900">Module Submitted</h2>
                        <p className="my-4 font-bold text-zinc-600 text-lg">
                            {result.message}
                        </p>
                        <button
                            onClick={() => {
                                setResult(null);
                                setTestState('intro');
                                fetchStatus(token!);
                            }}
                            className="mt-4 bg-zinc-900 text-white font-extrabold px-8 py-4 rounded-xl uppercase tracking-wider hover:bg-black transition-all shadow-md"
                        >
                            Return to Assessment Overview
                        </button>
                    </div>
                </div>
            </PageShell>
        );
    }

    return (
        <PageShell>
            <div className="mb-6 max-w-3xl">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ED9139]/10 text-[#ED9139] font-bold text-xs uppercase tracking-wider w-fit mb-2">
                    <BrainCircuit className="h-3.5 w-3.5" /> Mandatory Requirement
                </div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Psychometric Assessment</h1>
                <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1 leading-relaxed">
                    Before you can apply for FIFO positions, you must complete and pass this two-part assessment on the CertHero RTO portal. This ensures all candidates have the required aptitude, reasoning skills, and understanding of the platform process.
                </p>
            </div>
            <div className="w-full h-0.5 bg-[#ED9139] mb-8" />

            <div className="grid md:grid-cols-2 gap-6">
                {/* MODULE 1 */}
                <div className={`border rounded-2xl p-6 flex flex-col ${status.module1Passed ? "border-emerald-200 bg-emerald-50/50" : "border-slate-200 shadow-sm bg-white hover:border-slate-300 transition-all"}`}>
                    <div className="flex justify-between items-start mb-4">
                        <h2 className="text-2xl font-black text-zinc-900">Module 1:<br />Psychometric Assessment</h2>
                        {status.module1Passed && <CheckCircle className="text-emerald-500 w-8 h-8 shrink-0" />}
                    </div>
                    <p className="text-zinc-500 font-medium text-sm mb-6 flex-1">
                        Evaluates your logical reasoning, situational judgment, and suitability for high-risk FIFO work environments.
                    </p>

                    <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 mb-6">
                        <ul className="space-y-2 text-xs font-bold uppercase tracking-wider text-zinc-600">
                            <li className="flex justify-between"><span>Questions:</span> <strong className="text-zinc-900">25</strong></li>
                            <li className="flex justify-between"><span>Pass Mark:</span> <strong className="text-zinc-900">70%</strong></li>
                            <li className="flex justify-between text-amber-600"><span>Limit:</span> <strong>1 attempt per day</strong></li>
                        </ul>
                    </div>

                    <div>
                        {status.module1Passed ? (
                            <div className="text-emerald-700 font-black uppercase tracking-widest text-xs border-2 border-emerald-200 bg-emerald-100 py-4 rounded-xl text-center">Passed</div>
                        ) : status.lastAttemptToday.module_1 ? (
                            <div className="text-amber-700 font-black uppercase tracking-widest text-xs border-2 border-amber-200 bg-amber-100 py-4 rounded-xl flex items-center justify-center">
                                <CheckCircle className="w-4 h-4 mr-2" /> Pending Review
                            </div>
                        ) : (
                            <button onClick={() => startModule(1)} className="w-full bg-zinc-900 hover:bg-black text-white font-extrabold uppercase tracking-wider py-4 rounded-xl transition-all shadow-md">
                                Start Module 1
                            </button>
                        )}
                    </div>
                </div>

                {/* MODULE 2 */}
                <div className={`border rounded-2xl p-6 flex flex-col ${status.module2Passed ? "border-emerald-200 bg-emerald-50/50" : !status.module1Passed ? "bg-slate-50 border-slate-200 opacity-60" : "border-slate-200 shadow-sm bg-white"}`}>
                    <div className="flex justify-between items-start mb-4">
                        <h2 className="text-xl font-bold text-slate-900">Module 2:<br />Process Literacy</h2>
                        {status.module2Passed && <CheckCircle className="text-emerald-500 w-7 h-7 shrink-0" />}
                        {!status.module1Passed && <Lock className="text-slate-400 w-5 h-5 shrink-0" />}
                    </div>
                    <div className="text-slate-500 font-medium text-xs mb-6 flex-1 space-y-3">
                        <p>Evaluates your comprehension of the 9-step recruitment workflow, sponsorship terms, and placement process.</p>
                        
                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1 text-xs">
                            <div className="flex items-center gap-1.5 font-bold text-amber-950 uppercase tracking-wider text-[10px]">
                                <Mail className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                                <span>Essential Preparation Notice</span>
                            </div>
                            <p className="text-slate-700 leading-relaxed font-normal">
                                Before attempting this module, ensure you have read the <strong className="text-slate-900">Hiring Process document</strong> and <strong className="text-slate-900">Process FAQ</strong> by clicking the link in your <strong className="text-slate-900">Welcome Email</strong>.
                            </p>
                        </div>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 mb-6">
                        <ul className="space-y-1.5 text-xs font-semibold uppercase tracking-wider text-slate-600">
                            <li className="flex justify-between"><span>Questions:</span> <strong className="text-slate-900">12</strong></li>
                            <li className="flex justify-between"><span>Pass Mark:</span> <strong className="text-slate-900">Knowledge Based</strong></li>
                            <li className="flex justify-between text-amber-700"><span>Limit:</span> <strong>1 attempt per day</strong></li>
                        </ul>
                    </div>

                    <div>
                        {status.module2Passed ? (
                            <div className="text-emerald-700 font-bold uppercase tracking-wider text-xs border border-emerald-200 bg-emerald-50 py-3 rounded-xl text-center">Passed</div>
                        ) : !status.module1Passed ? (
                            <div className="text-slate-500 font-bold uppercase tracking-wider text-xs border border-slate-200 bg-slate-100 py-3 rounded-xl flex items-center justify-center">
                                Complete Module 1 first
                            </div>
                        ) : status.lastAttemptToday.module_2 ? (
                            <div className="text-amber-700 font-bold uppercase tracking-wider text-xs border border-amber-200 bg-amber-50 py-3 rounded-xl flex items-center justify-center">
                                <CheckCircle className="w-4 h-4 mr-2" /> Pending Review
                            </div>
                        ) : (
                            <button onClick={() => setShowModule2Reminder(true)} className="w-full bg-[#ED9139] hover:bg-[#dd7f26] text-[#0f172a] font-bold text-xs uppercase tracking-wider py-3 rounded-xl transition-all shadow-sm">
                                Start Module 2
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Module 2 Pre-Start Document Verification Modal */}
            {showModule2Reminder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl max-w-lg w-full border border-zinc-200 shadow-2xl p-6 sm:p-8 space-y-6">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center shrink-0">
                                    <FileText className="w-6 h-6 text-amber-600" />
                                </div>
                                <div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-amber-700 block">
                                        Mandatory Verification
                                    </span>
                                    <h3 className="text-lg font-black text-zinc-900 leading-snug">
                                        Hiring Process Document Gating
                                    </h3>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowModule2Reminder(false);
                                    setDownloadTriggered(false);
                                }}
                                className="text-zinc-400 hover:text-zinc-600 p-1 rounded-lg hover:bg-zinc-100 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {!downloadTriggered ? (
                            <>
                                <div className="space-y-3 text-xs text-zinc-700 leading-relaxed bg-zinc-50 border border-zinc-200 rounded-2xl p-5">
                                    <p className="font-bold text-sm text-zinc-900">
                                        Have you read the <span className="text-[#0f172a] underline">HIRING_PROCESS_INFORMATION.pdf</span> file attached to your welcome email?
                                    </p>
                                    <p className="text-zinc-600">
                                        Module 2 is an assessment of process literacy strictly testing your understanding of:
                                    </p>
                                    <ul className="space-y-1.5 pl-2 text-zinc-600 font-medium">
                                        <li className="flex items-start gap-2">
                                            <span className="text-[#ED9139] font-bold">&#9679;</span>
                                            <span><strong>Section 1:</strong> Introduction, BC Recruit Pty Ltd details, CertHero RTO intermediary partnership, and zero-cost migration benefits.</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-[#ED9139] font-bold">&#9679;</span>
                                            <span><strong>Section 2:</strong> 9-step recruitment workflow, 48-hour communication rule, online vs practical modules, 2-attempt policy, and 100% refund policy.</span>
                                        </li>
                                    </ul>
                                </div>

                                <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const link = document.createElement('a');
                                            link.href = '/HIRING_PROCESS_INFORMATION.pdf';
                                            link.setAttribute('download', 'HIRING_PROCESS_INFORMATION.pdf');
                                            document.body.appendChild(link);
                                            link.click();
                                            document.body.removeChild(link);
                                            setDownloadTriggered(true);
                                        }}
                                        className="w-full sm:w-auto px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Download className="w-4 h-4 text-amber-700" />
                                        No, download file now
                                    </button>
                                    <button
                                        type="button"
                                        disabled={loading}
                                        onClick={() => {
                                            setShowModule2Reminder(false);
                                            setDownloadTriggered(false);
                                            startModule(2);
                                        }}
                                        className="w-full sm:w-auto px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider bg-[#ED9139] hover:bg-[#dd7f26] text-[#0f172a] shadow-sm disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                                    >
                                        Yes, I have read it &rarr;
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="space-y-3 text-xs text-zinc-700 leading-relaxed bg-emerald-50 border border-emerald-200 rounded-2xl p-5">
                                    <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                                        <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                                        <span>Download Initiated</span>
                                    </div>
                                    <p className="text-emerald-800">
                                        <strong>HIRING_PROCESS_INFORMATION.pdf</strong> has been downloaded to your device.
                                    </p>
                                    <p className="text-zinc-600">
                                        Please take time to thoroughly read <strong>Section 1</strong> and <strong>Section 2</strong> (including the 100% refund policy upon ticket acquisition). All questions in Module 2 directly test these sections.
                                    </p>
                                </div>

                                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const link = document.createElement('a');
                                            link.href = '/HIRING_PROCESS_INFORMATION.pdf';
                                            link.setAttribute('download', 'HIRING_PROCESS_INFORMATION.pdf');
                                            document.body.appendChild(link);
                                            link.click();
                                            document.body.removeChild(link);
                                        }}
                                        className="text-[11px] font-bold text-zinc-500 hover:text-zinc-800 underline uppercase tracking-wider"
                                    >
                                        Download again
                                    </button>
                                    <button
                                        type="button"
                                        disabled={loading}
                                        onClick={() => {
                                            setShowModule2Reminder(false);
                                            setDownloadTriggered(false);
                                            startModule(2);
                                        }}
                                        className="w-full sm:w-auto px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider bg-[#ED9139] hover:bg-[#dd7f26] text-[#0f172a] shadow-sm disabled:opacity-50 transition-all"
                                    >
                                        I Have Read The Document — Begin Module 2
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </PageShell>
    );
}
