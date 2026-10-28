'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';

interface Message {
    id: string;
    role: 'assistant' | 'user';
    content: string;
    timestamp: string;
    isGated?: boolean;
}

export interface CourseStudyContext {
    courseId?: string | number;
    courseTitle?: string;
    courseCode?: string;
    syllabus?: any;
    currentModuleTitle?: string;
    currentModuleContent?: string;
}

export function AiStudyBot() {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'welcome-1',
            role: 'assistant',
            content: `G'day ${user?.fullName ? user.fullName.split(' ')[0] : 'there'}! I am **CertHero AI**, your dedicated FIFO Vocational Study Assistant and Training Mentor.\n\nI can help you review your course syllabi, explain Western Australian safety standards (STD11, Working at Heights, Confined Spaces), and answer any questions about your mining placement journey!`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [studyContext, setStudyContext] = useState<CourseStudyContext | undefined>(undefined);
    const [showFirstLoginBanner, setShowFirstLoginBanner] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Check for first login or prominent notice
    useEffect(() => {
        const hasNoticed = localStorage.getItem('certhero_ai_bot_noticed');
        if (!hasNoticed) {
            setShowFirstLoginBanner(true);
        }

        // Listen for external open triggers from course/syllabus pages
        const handleOpenBot = (event: any) => {
            if (event.detail?.studyContext) {
                setStudyContext(event.detail.studyContext);
                const ctx = event.detail.studyContext;
                const promptMsg = ctx.currentModuleTitle 
                    ? `I'd like to understand the unit: "${ctx.currentModuleTitle}" (${ctx.courseTitle || ''}). Can you summarize the core learning objectives and key safety guidelines?`
                    : `Can you walk me through the syllabus for "${ctx.courseTitle || 'this course'}"?`;

                setIsOpen(true);
                setShowFirstLoginBanner(false);
                localStorage.setItem('certhero_ai_bot_noticed', 'true');
                
                // Add contextual assistant prompt
                setMessages(prev => [
                    ...prev,
                    {
                        id: `ctx-${Date.now()}`,
                        role: 'assistant',
                        content: `I have loaded your active study context for **${ctx.courseTitle || 'this unit'}** ${ctx.currentModuleTitle ? `— *${ctx.currentModuleTitle}*` : ''}. Ask me any technical questions, safety protocols, or practical scenario questions!`,
                        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    }
                ]);
            } else {
                setIsOpen(true);
            }
        };

        window.addEventListener('open-ai-bot', handleOpenBot);
        return () => window.removeEventListener('open-ai-bot', handleOpenBot);
    }, []);

    useEffect(() => {
        if (isOpen) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isOpen]);

    const handleSendMessage = async (textToSend?: string) => {
        const text = (textToSend || input).trim();
        if (!text || isLoading) return;

        const userMsg: Message = {
            id: `usr-${Date.now()}`,
            role: 'user',
            content: text,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            const history = messages.slice(-6).map(m => ({
                role: m.role,
                content: m.content
            }));

            const response = await api.post('/ai/chat', {
                message: text,
                history,
                studyContext,
                userId: user?.id,
                hasPaid: Boolean((user as any)?.depositPaid)
            });

            const reply = response.data?.reply || 'I am currently processing your request. Please ask again in a moment.';
            const isGated = Boolean(response.data?.isGated);

            setMessages(prev => [
                ...prev,
                {
                    id: `asst-${Date.now()}`,
                    role: 'assistant',
                    content: reply,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    isGated
                }
            ]);
        } catch (error: any) {
            console.error('[AiStudyBot] Chat failed:', error);
            setMessages(prev => [
                ...prev,
                {
                    id: `err-${Date.now()}`,
                    role: 'assistant',
                    content: 'I apologize, but our study connection experienced a momentary interruption. Please try asking your question again.',
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const dismissNotice = () => {
        setShowFirstLoginBanner(false);
        localStorage.setItem('certhero_ai_bot_noticed', 'true');
    };

    const openAndDismiss = () => {
        dismissNotice();
        setIsOpen(true);
    };

    return (
        <aside aria-label="AI Study Assistant" className="fixed bottom-6 right-6 z-50 flex flex-col items-end select-none">
            {/* Prominent First Login / New User Notice */}
            {showFirstLoginBanner && !isOpen && (
                <div className="mb-3 max-w-xs sm:max-w-sm bg-gradient-to-br from-slate-900 to-blue-950 text-white p-4 rounded-2xl shadow-2xl border-2 border-amber-400 animate-bounce duration-1000 relative">
                    <button
                        onClick={dismissNotice}
                        aria-label="Close notification"
                        className="absolute top-2 right-2 text-slate-400 hover:text-white text-xs p-1"
                    >
                        ✕
                    </button>
                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-900 flex items-center justify-center font-black text-xl shrink-0 shadow-md">
                            ⚡
                        </div>
                        <div>
                            <div className="flex items-center gap-1.5 mb-1">
                                <span className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-400 text-slate-900">
                                    New Feature
                                </span>
                                <span className="text-[11px] font-bold text-amber-200">CertHero AI Mentor</span>
                            </div>
                            <p className="text-xs text-slate-200 leading-snug">
                                Have questions about your FIFO courses, syllabus, or ticket exams? Your AI Study Assistant is ready to help 24/7!
                            </p>
                            <button
                                onClick={openAndDismiss}
                                className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-900 px-3 py-1.5 rounded-lg transition-all"
                            >
                                Chat with AI Mentor →
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Chat Drawer */}
            {isOpen && (
                <div className="w-[360px] sm:w-[420px] h-[580px] max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden mb-3 animate-in slide-in-from-bottom-5 duration-200">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 p-4 text-white flex items-center justify-between border-b border-amber-500/40">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 flex items-center justify-center font-black text-lg shadow-inner">
                                    <span className="material-symbols-outlined text-[22px]">smart_toy</span>
                                </div>
                                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-900 animate-pulse" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold tracking-tight flex items-center gap-1.5">
                                    CertHero AI Mentor
                                    <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-amber-400 text-slate-950">
                                        RTO AI
                                    </span>
                                </h3>
                                <p className="text-[11px] text-slate-300 font-medium">Western Australia Mining &amp; Vocational Guide</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            aria-label="Close CertHero AI Mentor chat"
                            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Active Study Context Ribbon */}
                    {studyContext && (
                        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-1.5 text-amber-900 font-medium truncate">
                                <span className="material-symbols-outlined text-sm text-amber-600">menu_book</span>
                                <span className="truncate">Active: <strong>{studyContext.courseTitle}</strong></span>
                            </div>
                            <button
                                onClick={() => setStudyContext(undefined)}
                                aria-label="Clear active study context"
                                className="text-[10px] font-bold text-amber-700 hover:text-amber-900 uppercase tracking-wider shrink-0 ml-2"
                            >
                                Clear
                            </button>
                        </div>
                    )}

                    {/* Message Area */}
                    <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50">
                        {messages.map(msg => (
                            <div
                                key={msg.id}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed shadow-xs ${
                                        msg.role === 'user'
                                            ? 'bg-blue-900 text-white rounded-br-xs'
                                            : msg.isGated
                                            ? 'bg-amber-50 text-slate-800 border border-amber-200 rounded-bl-xs'
                                            : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs'
                                    }`}
                                >
                                    <div className="whitespace-pre-wrap font-sans">
                                        {msg.content}
                                    </div>
                                    <div className={`text-[9px] mt-1 text-right ${msg.role === 'user' ? 'text-blue-200' : 'text-slate-400'}`}>
                                        {msg.timestamp}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white border border-slate-200 rounded-2xl px-4 py-2.5 text-xs rounded-bl-xs flex items-center gap-1.5 text-slate-400">
                                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce" />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Suggestion Chips */}
                    <div className="p-2.5 bg-white border-t border-slate-100 flex gap-1.5 overflow-x-auto no-scrollbar">
                        {[
                            'What is STD11 mining induction?',
                            'Explain Working at Heights vs Confined Spaces',
                            'How does the 100% refund work?',
                            'What are the 9 recruitment stages?'
                        ].map((chip, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleSendMessage(chip)}
                                className="text-[11px] bg-slate-100 hover:bg-amber-50 hover:text-amber-900 hover:border-amber-300 text-slate-700 px-2.5 py-1 rounded-full whitespace-nowrap border border-slate-200 transition-all shrink-0"
                            >
                                {chip}
                            </button>
                        ))}
                    </div>

                    {/* Input Bar */}
                    <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask about your course syllabus, tickets, or FIFO readiness..."
                            rows={1}
                            className="flex-1 bg-slate-100 border border-slate-200 focus:bg-white focus:border-amber-500 focus:outline-hidden rounded-xl px-3.5 py-2 text-xs resize-none text-slate-900 placeholder:text-slate-400 transition-all"
                        />
                        <button
                            onClick={() => handleSendMessage()}
                            disabled={!input.trim() || isLoading}
                            aria-label="Send message to AI Mentor"
                            className="w-9 h-9 bg-gradient-to-tr from-amber-500 to-amber-400 hover:from-amber-600 hover:to-amber-500 disabled:opacity-40 text-slate-950 font-bold rounded-xl flex items-center justify-center shrink-0 shadow-md transition-all"
                        >
                            <span className="material-symbols-outlined text-[18px]">send</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Launcher Floating Button */}
            <button
                onClick={() => {
                    dismissNotice();
                    setIsOpen(!isOpen);
                }}
                className={`flex items-center gap-2.5 px-4 py-3 rounded-full shadow-2xl transition-all duration-300 group ${
                    isOpen
                        ? 'bg-slate-900 text-white border border-slate-700'
                        : 'bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 text-white border-2 border-amber-400 hover:scale-105 hover:shadow-amber-500/20'
                }`}
            >
                <div className="relative">
                    <span className="material-symbols-outlined text-amber-400 text-2xl group-hover:rotate-12 transition-transform">
                        {isOpen ? 'close' : 'smart_toy'}
                    </span>
                    {!isOpen && (
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-slate-900 animate-ping" />
                    )}
                </div>
                <div className="text-left">
                    <p className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5">
                        CertHero AI
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    </p>
                    <p className="text-[10px] text-amber-300 font-semibold leading-none">Vocational Mentor</p>
                </div>
            </button>
        </aside>
    );
}
