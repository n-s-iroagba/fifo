'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, AlertTriangle, ChevronRight, Lock, BrainCircuit, Download } from 'lucide-react';
import axios from 'axios';
import { PageShell } from '../../components/PageShell';

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
            <div className="flex flex-col items-center justify-center py-24 space-y-5">
                <div className="animate-spin rounded-full h-14 w-14 border-4 border-zinc-200 border-t-[#FFC700]" />
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest animate-pulse">Loading assessment data...</p>
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
                            className="inline-flex items-center gap-2 bg-[#FFC700] text-black font-extrabold px-8 py-4 rounded-xl hover:bg-yellow-400 uppercase tracking-wider shadow-md transition-all"
                        >
                            Return to Recruitment Dashboard <ChevronRight className="w-5 h-5" />
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

                    <div className="mb-8">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFC700] text-black font-extrabold text-xs uppercase tracking-wider w-fit mb-3">
                            <BrainCircuit className="h-3.5 w-3.5" /> Module {activeModule}
                        </div>
                        <h1 className="text-3xl font-black text-zinc-900 tracking-tight">Psychometric Assessment</h1>

                        <div className="mt-6 w-full bg-zinc-200 rounded-full h-2">
                            <div className="bg-[#FFC700] h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                        </div>
                        <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mt-2">Question {currentQuestionIndex + 1} of {questions.length}</p>
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
                                    <span className={`font-black mr-4 ${currentAnswer === idx ? 'text-[#FFC700]' : 'text-zinc-400'}`}>
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
                                    className="px-8 py-3 rounded-xl font-extrabold text-black bg-[#FFC700] hover:bg-yellow-400 uppercase tracking-wider disabled:opacity-50 transition-colors shadow-md"
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
                    <div className="bg-white border-2 border-[#FFC700] rounded-2xl p-10 text-center shadow-md">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#FFC700] mb-5">
                            <CheckCircle className="w-8 h-8 text-black" />
                        </div>
                        <h2 className="text-3xl font-black text-zinc-900">Module Submitted</h2>
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
            <div className="mb-10 max-w-3xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFC700] text-black font-extrabold text-xs uppercase tracking-wider w-fit mb-4">
                    <BrainCircuit className="h-3.5 w-3.5" /> Mandatory Requirement
                </div>
                <h1 className="text-4xl font-black text-zinc-900 tracking-tight">Psychometric Assessment</h1>
                <p className="text-sm font-medium text-zinc-500 mt-3 leading-relaxed">
                    Before you can apply for FIFO positions, you must complete and pass this two-part assessment on the Aveling portal. This ensures all candidates have the required aptitude, reasoning skills, and understanding of the platform process.
                </p>
            </div>
            <div className="w-full h-0.5 bg-[#FFC700] mb-10" />

            <div className="grid md:grid-cols-2 gap-6">
                {/* MODULE 1 */}
                <div className={`border-2 rounded-2xl p-8 flex flex-col ${status.module1Passed ? "border-emerald-200 bg-emerald-50/50" : "border-zinc-200 shadow-md bg-white hover:border-[#FFC700] transition-all"}`}>
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
                <div className={`border-2 rounded-2xl p-8 flex flex-col ${status.module2Passed ? "border-emerald-200 bg-emerald-50/50" : !status.module1Passed ? "bg-zinc-50 border-zinc-200 opacity-60" : "border-[#FFC700] shadow-md bg-white ring-2 ring-[#FFC700]/20"}`}>
                    <div className="flex justify-between items-start mb-4">
                        <h2 className="text-2xl font-black text-zinc-900">Module 2:<br />Process Literacy</h2>
                        {status.module2Passed && <CheckCircle className="text-emerald-500 w-8 h-8 shrink-0" />}
                        {!status.module1Passed && <Lock className="text-zinc-400 w-6 h-6 shrink-0" />}
                    </div>
                    <div className="text-zinc-500 font-medium text-sm mb-6 flex-1 space-y-3">
                        <p>Ensures you fully understand the Blue Collar Recruitment application process, payments, and Aveling certification.</p>
                        <a href="https://bluecollarrecruitment.co//document" target="_blank" className="text-zinc-900 border-b-2 border-[#FFC700] font-black hover:bg-[#FFC700] transition-all inline-flex items-center gap-1.5 py-1">
                            View Flow Document <Download className="w-3.5 h-3.5" />
                        </a>
                    </div>

                    <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 mb-6">
                        <ul className="space-y-2 text-xs font-bold uppercase tracking-wider text-zinc-600">
                            <li className="flex justify-between"><span>Questions:</span> <strong className="text-zinc-900">20</strong></li>
                            <li className="flex justify-between"><span>Pass Mark:</span> <strong className="text-zinc-900">80%</strong></li>
                            <li className="flex justify-between text-amber-600"><span>Limit:</span> <strong>1 attempt per day</strong></li>
                        </ul>
                    </div>

                    <div>
                        {status.module2Passed ? (
                            <div className="text-emerald-700 font-black uppercase tracking-widest text-xs border-2 border-emerald-200 bg-emerald-100 py-4 rounded-xl text-center">Passed</div>
                        ) : !status.module1Passed ? (
                            <div className="text-zinc-500 font-black uppercase tracking-widest text-xs border-2 border-zinc-200 bg-zinc-100 py-4 rounded-xl flex items-center justify-center">
                                Complete Module 1 first
                            </div>
                        ) : status.lastAttemptToday.module_2 ? (
                            <div className="text-amber-700 font-black uppercase tracking-widest text-xs border-2 border-amber-200 bg-amber-100 py-4 rounded-xl flex items-center justify-center">
                                <CheckCircle className="w-4 h-4 mr-2" /> Pending Review
                            </div>
                        ) : (
                            <button onClick={() => startModule(2)} className="w-full bg-[#FFC700] hover:bg-yellow-400 text-black font-extrabold uppercase tracking-wider py-4 rounded-xl transition-all shadow-md">
                                Start Module 2
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </PageShell>
    );
}
