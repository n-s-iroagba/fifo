'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, AlertTriangle, ChevronRight, Lock } from 'lucide-react';
import axios from 'axios';

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
    const [result, setResult] = useState<{ score: number, passed: boolean } | null>(null);

    // Get token from URL or localStorage
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        const urlToken = searchParams.get('token');
        let activeToken = urlToken || localStorage.getItem('accessToken') || localStorage.getItem('lms_token');
        
        if (urlToken) {
            localStorage.setItem('accessToken', urlToken);
        }

        if (!activeToken) {
            setErrorMsg('Authentication token missing. Please sign up or log in via the recruitment portal first.');
            setLoading(false);
            return;
        }
        
        setToken(activeToken);
    }, [searchParams]);

    useEffect(() => {
        if (token) {
            fetchStatus(token);
        }
    }, [token]);

    const apiCall = async (endpoint: string, method: string = 'GET', data?: any, currentToken?: string) => {
        const t = currentToken || token;
        const res = await axios({
            url: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}${endpoint}`,
            method,
            data,
            headers: {
                Authorization: `Bearer ${t}`
            }
        });
        return res.data;
    };

    const fetchStatus = async (activeToken: string) => {
        try {
            setLoading(true);
            const response = await apiCall('/psychometric/status', 'GET', undefined, activeToken);
            setStatus(response);
            
            if (response.module1Passed && response.module2Passed) {
                setTestState('result');
            }
        } catch (error: any) {
            setErrorMsg(error.response?.data?.error || 'Failed to fetch psychometric status');
        } finally {
            setLoading(false);
        }
    };

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
        newAnswers[currentQuestionIndex] = {
            questionText: currentQ.questionText,
            selectedOption: optionIndex
        };
        setAnswers(newAnswers);
    };

    const nextQuestion = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
    };

    const previousQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        }
    };

    const submitTest = async () => {
        if (answers.length < questions.length || answers.includes(undefined as any)) {
            alert('Please answer all questions before submitting.');
            return;
        }

        try {
            setLoading(true);
            const response = await apiCall(`/psychometric/module/${activeModule}/submit`, 'POST', {
                answers
            });
            setResult({ score: response.score, passed: response.passed });
            setTestState('result');
            
            fetchStatus(token!);
        } catch (error: any) {
            alert(error.response?.data?.error || 'Failed to submit test');
        } finally {
            setLoading(false);
        }
    };

    if (loading && !status && !errorMsg) {
        return <div className="flex h-screen items-center justify-center text-zinc-500 font-medium">Loading assessment data...</div>;
    }

    if (errorMsg) {
        return (
            <div className="flex h-screen items-center justify-center p-4">
                <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl max-w-md w-full text-center">
                    <AlertTriangle className="mx-auto w-12 h-12 mb-4 text-red-500" />
                    <h2 className="text-xl font-bold mb-2">Access Denied</h2>
                    <p>{errorMsg}</p>
                </div>
            </div>
        );
    }

    if (!status) return null;

    if (status.module1Passed && status.module2Passed) {
        return (
            <div className="container max-w-3xl mx-auto py-12 px-4">
                <div className="border border-emerald-200 bg-emerald-50 rounded-2xl p-8 shadow-sm">
                    <div className="flex flex-col items-center text-center">
                        <CheckCircle className="w-16 h-16 text-emerald-500 mb-4" />
                        <h2 className="text-2xl font-bold text-emerald-800 mb-2">Psychometric Assessment Cleared</h2>
                        <p className="text-emerald-700 mb-6 max-w-md">
                            You have successfully passed both modules of the mandatory psychometric assessment. You are now cleared to apply for FIFO positions.
                        </p>
                        <button 
                            onClick={() => window.location.href = 'http://localhost:3000/dashboard'} // Or production URL
                            className="bg-emerald-600 text-white hover:bg-emerald-700 font-bold px-6 py-3 rounded-xl flex items-center transition-all"
                        >
                            Return to Recruitment Dashboard <ChevronRight className="ml-2 w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (testState === 'testing' && questions.length > 0) {
        const currentQ = questions[currentQuestionIndex];
        const currentAnswer = answers[currentQuestionIndex]?.selectedOption;
        const progress = ((currentQuestionIndex) / questions.length) * 100;

        return (
            <div className="container max-w-3xl mx-auto py-8 px-4">
                <div className="mb-8">
                    <h1 className="text-2xl font-black text-zinc-900 dark:text-white mb-4">
                        Module {activeModule} Assessment
                    </h1>
                    <div className="w-full bg-zinc-200 rounded-full h-2.5 mb-2">
                        <div className="bg-[#FFC700] h-2.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                    </div>
                    <p className="text-sm font-medium text-zinc-500">Question {currentQuestionIndex + 1} of {questions.length}</p>
                </div>

                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
                    <div className="p-6 md:p-8 border-b border-zinc-100 dark:border-zinc-800">
                        <h2 className="text-xl font-bold text-zinc-900 dark:text-white leading-relaxed">
                            {currentQ.questionText}
                        </h2>
                    </div>
                    <div className="p-6 md:p-8 bg-zinc-50 dark:bg-zinc-900/50">
                        <div className="flex flex-col space-y-3">
                            {currentQ.options.map((opt, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleAnswer(idx)}
                                    className={`text-left p-4 rounded-xl border-2 transition-all font-medium ${
                                        currentAnswer === idx 
                                        ? 'border-[#1E3A8A] bg-blue-50 dark:bg-blue-900/20 text-[#1E3A8A] dark:text-blue-300' 
                                        : 'border-zinc-200 dark:border-zinc-700 hover:border-blue-300 hover:bg-white dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                                    }`}
                                >
                                    <span className={`font-bold mr-3 ${currentAnswer === idx ? 'text-[#1E3A8A] dark:text-blue-300' : 'text-zinc-400'}`}>
                                        {String.fromCharCode(65 + idx)}.
                                    </span>
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="flex justify-between items-center p-6 border-t border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                        <button 
                            onClick={previousQuestion} 
                            disabled={currentQuestionIndex === 0}
                            className="px-6 py-2.5 rounded-xl font-bold text-zinc-600 bg-zinc-100 hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Previous
                        </button>
                        
                        {currentQuestionIndex === questions.length - 1 ? (
                            <button 
                                onClick={submitTest} 
                                disabled={loading || currentAnswer === undefined} 
                                className="px-8 py-2.5 rounded-xl font-bold text-white bg-[#1E3A8A] hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center shadow-md"
                            >
                                {loading ? 'Submitting...' : 'Submit Test'}
                            </button>
                        ) : (
                            <button 
                                onClick={nextQuestion} 
                                disabled={currentAnswer === undefined} 
                                className="px-8 py-2.5 rounded-xl font-bold text-white bg-[#1E3A8A] hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md"
                            >
                                Next
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    if (testState === 'result' && result) {
        return (
            <div className="container max-w-3xl mx-auto py-12 px-4">
                <div className={`border rounded-2xl p-8 text-center shadow-sm ${result.passed ? "border-emerald-200 bg-emerald-50" : "border-rose-200 bg-rose-50"}`}>
                    <div className="flex flex-col items-center">
                        {result.passed ? (
                            <CheckCircle className="w-16 h-16 text-emerald-500 mb-4" />
                        ) : (
                            <AlertTriangle className="w-16 h-16 text-rose-500 mb-4" />
                        )}
                        <h2 className={`text-2xl font-black mb-2 ${result.passed ? 'text-emerald-800' : 'text-rose-800'}`}>
                            {result.passed ? 'Module Passed!' : 'Module Failed'}
                        </h2>
                        <div className="text-5xl font-black my-6 text-zinc-800">
                            {Math.round(result.score)}%
                        </div>
                        <p className={`mb-8 font-medium ${result.passed ? 'text-emerald-700' : 'text-rose-700'}`}>
                            {result.passed 
                                ? 'Congratulations, you have passed this module of the assessment.' 
                                : 'Unfortunately, you did not meet the required pass mark. You may attempt this module again tomorrow.'}
                        </p>
                        
                        <button 
                            onClick={() => {
                                setResult(null);
                                setTestState('intro');
                                fetchStatus(token!);
                            }} 
                            className="bg-[#1E3A8A] text-white hover:bg-blue-800 font-bold px-8 py-3 rounded-xl transition-all shadow-md"
                        >
                            Continue
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container max-w-4xl mx-auto py-12 px-4">
            <div className="mb-10 text-center">
                <div className="inline-flex items-center justify-center p-3 bg-blue-50 text-[#1E3A8A] rounded-2xl mb-4">
                    <Lock className="w-8 h-8" />
                </div>
                <h1 className="text-3xl font-black text-zinc-900 dark:text-white mb-4 tracking-tight">Mandatory Psychometric Assessment</h1>
                <p className="text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto font-medium">
                    Before you can apply for FIFO positions, you must complete and pass this two-part assessment on the Aveling portal. This ensures all candidates have the required aptitude, reasoning skills, and understanding of the platform process.
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* MODULE 1 */}
                <div className={`border rounded-2xl p-6 md:p-8 flex flex-col ${status.module1Passed ? "border-emerald-200 bg-emerald-50 opacity-80" : "border-zinc-200 shadow-md bg-white dark:bg-zinc-900"}`}>
                    <div className="flex justify-between items-start mb-4">
                        <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Module 1:<br/>Psychometric Assessment</h2>
                        {status.module1Passed && <CheckCircle className="text-emerald-500 w-8 h-8 shrink-0" />}
                    </div>
                    <p className="text-zinc-600 dark:text-zinc-400 font-medium mb-6 flex-1">
                        Evaluates your logical reasoning, situational judgment, and suitability for high-risk FIFO work environments.
                    </p>
                    
                    <div className="bg-zinc-50 dark:bg-zinc-800 rounded-xl p-4 mb-6">
                        <ul className="space-y-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                            <li className="flex justify-between"><span>Questions:</span> <strong>25</strong></li>
                            <li className="flex justify-between"><span>Pass Mark:</span> <strong>70%</strong></li>
                            <li className="flex justify-between text-amber-600"><span>Limit:</span> <strong>1 attempt per day</strong></li>
                        </ul>
                    </div>
                    
                    <div>
                        {status.module1Passed ? (
                            <div className="text-emerald-700 font-bold bg-emerald-100 py-3 px-4 rounded-xl text-center w-full">Passed</div>
                        ) : status.lastAttemptToday.module_1 ? (
                            <div className="text-amber-700 font-bold bg-amber-100 py-3 px-4 rounded-xl flex items-center justify-center w-full">
                                <AlertTriangle className="w-5 h-5 mr-2" /> Limit reached for today
                            </div>
                        ) : (
                            <button onClick={() => startModule(1)} className="w-full bg-[#1E3A8A] hover:bg-blue-800 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md">
                                Start Module 1
                            </button>
                        )}
                    </div>
                </div>

                {/* MODULE 2 */}
                <div className={`border rounded-2xl p-6 md:p-8 flex flex-col ${status.module2Passed ? "border-emerald-200 bg-emerald-50 opacity-80" : !status.module1Passed ? "bg-zinc-50 dark:bg-zinc-900/50 opacity-60 border-dashed border-zinc-300" : "border-[#FFC700] shadow-md bg-white dark:bg-zinc-900 ring-1 ring-[#FFC700]/50"}`}>
                    <div className="flex justify-between items-start mb-4">
                        <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Module 2:<br/>Process Literacy</h2>
                        {status.module2Passed && <CheckCircle className="text-emerald-500 w-8 h-8 shrink-0" />}
                        {!status.module1Passed && <Lock className="text-zinc-400 w-6 h-6 shrink-0" />}
                    </div>
                    <p className="text-zinc-600 dark:text-zinc-400 font-medium mb-6 flex-1">
                        Ensures you fully understand the Blue Collar Recruitment application process, payments, and Aveling certification.
                    </p>
                    
                    <div className="bg-zinc-50 dark:bg-zinc-800 rounded-xl p-4 mb-6">
                        <ul className="space-y-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                            <li className="flex justify-between"><span>Questions:</span> <strong>20</strong></li>
                            <li className="flex justify-between"><span>Pass Mark:</span> <strong>80%</strong></li>
                            <li className="flex justify-between text-amber-600"><span>Limit:</span> <strong>1 attempt per day</strong></li>
                        </ul>
                    </div>
                    
                    <div>
                        {status.module2Passed ? (
                            <div className="text-emerald-700 font-bold bg-emerald-100 py-3 px-4 rounded-xl text-center w-full">Passed</div>
                        ) : !status.module1Passed ? (
                            <div className="text-zinc-500 font-bold bg-zinc-200 py-3 px-4 rounded-xl flex items-center justify-center w-full">
                                Complete Module 1 first
                            </div>
                        ) : status.lastAttemptToday.module_2 ? (
                            <div className="text-amber-700 font-bold bg-amber-100 py-3 px-4 rounded-xl flex items-center justify-center w-full">
                                <AlertTriangle className="w-5 h-5 mr-2" /> Limit reached for today
                            </div>
                        ) : (
                            <button onClick={() => startModule(2)} className="w-full bg-[#FFC700] hover:bg-yellow-400 text-black font-extrabold py-3 px-4 rounded-xl transition-all shadow-md">
                                Start Module 2
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
