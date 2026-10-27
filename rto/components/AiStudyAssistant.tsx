'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
    Bot, 
    X, 
    Send, 
    Sparkles, 
    BookOpen, 
    ShieldCheck, 
    Lock, 
    RotateCcw, 
    ChevronDown, 
    ChevronUp,
    MessageSquare,
    AlertCircle,
    CheckCircle2
} from 'lucide-react';
import { useAiAssistant } from '@/context/AiAssistantContext';
import { apiClient } from '@/lib/axios';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    isGated?: boolean;
    provider?: string;
    timestamp: Date;
}

export function AiStudyAssistant() {
    const { 
        isOpen, 
        closeAssistant, 
        toggleAssistant, 
        studyContext, 
        hasPaid,
        pendingInitialMessage,
        clearPendingMessage
    } = useAiAssistant();

    const [isMinimized, setIsMinimized] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Initial greeting based on state
    useEffect(() => {
        if (messages.length === 0) {
            const initialGreeting = studyContext?.courseTitle
                ? `G'day! I am your CertHero AI Study Mentor for **${studyContext.courseTitle}** (${studyContext.courseCode || 'Prerequisite Unit'}). How can I assist you with your module theory, safety protocols, or syllabus review today?`
                : `G'day! I am your official CertHero AI Vocational Mentor. I can answer questions regarding the Western Australia FIFO program, course syllabi, employer sponsorships (MACA, MinRes, Northern Star, Rio Tinto), and regulatory requirements. How can I assist you?`;

            setMessages([
                {
                    id: 'init-1',
                    role: 'assistant',
                    content: initialGreeting,
                    timestamp: new Date()
                }
            ]);
        }
    }, [studyContext]);

    // Handle any pending initial message sent via context
    useEffect(() => {
        if (pendingInitialMessage && !loading) {
            sendMessage(pendingInitialMessage);
            clearPendingMessage();
        }
    }, [pendingInitialMessage]);

    // Auto-scroll to bottom of messages
    useEffect(() => {
        if (isOpen && !isMinimized) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isOpen, isMinimized, loading]);

    const sendMessage = async (textToSend?: string) => {
        const text = (textToSend || input).trim();
        if (!text || loading) return;

        const userMsg: Message = {
            id: `usr-${Date.now()}`,
            role: 'user',
            content: text,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        if (!textToSend) setInput('');
        setLoading(true);

        try {
            // Build recent chat history format
            const history = messages.slice(-6).map(m => ({
                role: m.role,
                content: m.content
            }));

            const payload = {
                message: text,
                history,
                hasPaid,
                studyContext: studyContext || undefined
            };

            const res = await apiClient.post('/ai/chat', payload);
            const data = res.data;

            if (data?.reply) {
                const assistantMsg: Message = {
                    id: `ast-${Date.now()}`,
                    role: 'assistant',
                    content: data.reply,
                    isGated: data.isGated,
                    provider: data.provider,
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, assistantMsg]);
            } else {
                throw new Error('Empty response from AI assistant.');
            }
        } catch (err: any) {
            console.error('Error sending message to AI bot:', err);
            const errorMsg: Message = {
                id: `ast-err-${Date.now()}`,
                role: 'assistant',
                content: 'I encountered an issue connecting to the knowledge engine. Please check your connection or try asking your question again.',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const handleClearChat = () => {
        setMessages([
            {
                id: `init-reset-${Date.now()}`,
                role: 'assistant',
                content: studyContext?.courseTitle
                    ? `Conversation reset. I am ready to assist with your study of **${studyContext.courseTitle}**.`
                    : `Conversation reset. How can I help you with your CertHero course syllabus or FIFO career pathway?`,
                timestamp: new Date()
            }
        ]);
    };

    // Quick suggestions depending on context
    const quickPrompts = studyContext?.courseTitle
        ? [
            `What key competencies are covered in ${studyContext.courseCode || 'this unit'}?`,
            studyContext.currentModuleTitle ? `Explain key safety protocols in ${studyContext.currentModuleTitle}` : `What are the safety duties under WA regulations?`,
            `What is the passing standard for this unit?`,
            `Tell me about host employer sponsorship requirements`
        ]
        : [
            `What are the 4 host employers in this program?`,
            `How does the $720 deposit refund guarantee work?`,
            `What tickets are included in the prerequisite package?`,
            `Explain the 9 recruitment pipeline stages`
        ];

    // Format content with bold, bullets, and line breaks
    const renderFormattedMessage = (content: string) => {
        const paragraphs = content.split('\n\n');
        return (
            <div className="space-y-2 text-xs leading-relaxed">
                {paragraphs.map((p, idx) => {
                    if (p.startsWith('- ') || p.startsWith('* ') || p.includes('\n* ') || p.includes('\n- ')) {
                        const items = p.split(/\n(?=[-*]\s|\d+\.\s)/);
                        return (
                            <ul key={idx} className="list-disc pl-4 space-y-1">
                                {items.map((item, i) => {
                                    const cleanItem = item.replace(/^[-*]\s+|\d+\.\s+/, '');
                                    return (
                                        <li key={i} dangerouslySetInnerHTML={{ __html: formatInline(cleanItem) }} />
                                    );
                                })}
                            </ul>
                        );
                    }
                    return (
                        <p key={idx} dangerouslySetInnerHTML={{ __html: formatInline(p) }} />
                    );
                })}
            </div>
        );
    };

    const formatInline = (text: string) => {
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`([^`]+)`/g, '<code class="bg-slate-200 text-slate-800 px-1 py-0.5 rounded text-[11px]">$1</code>');
    };

    return (
        <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end">
            {/* Launcher button (when closed) */}
            {!isOpen && (
                <button
                    onClick={toggleAssistant}
                    className="group flex items-center gap-2.5 bg-[#0F172A] hover:bg-slate-800 text-white pl-4 pr-5 py-3 rounded-full shadow-2xl border-2 border-[#FFC700] hover:scale-105 transition-all duration-200"
                    title="Open CertHero AI Study Assistant"
                >
                    <div className="relative">
                        <div className="h-8 w-8 rounded-full bg-[#FFC700] text-[#0F172A] flex items-center justify-center font-bold">
                            <Bot className="h-5 w-5" />
                        </div>
                        <span className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-[#0F172A]" />
                    </div>
                    <div className="text-left">
                        <span className="block text-xs font-black tracking-wide uppercase text-white">CertHero AI Tutor</span>
                        <span className="block text-[10px] text-amber-300 font-medium">
                            {studyContext?.courseCode ? `Studying: ${studyContext.courseCode}` : 'Study & Career Assistant'}
                        </span>
                    </div>
                </button>
            )}

            {/* Chat Window (when open) */}
            {isOpen && (
                <div 
                    className={`bg-white border border-slate-300 rounded-2xl shadow-2xl overflow-hidden flex flex-col transition-all duration-200 ${
                        isMinimized ? 'w-80 h-16' : 'w-[92vw] sm:w-[420px] h-[580px] max-h-[82vh]'
                    }`}
                >
                    {/* Header */}
                    <div className="bg-[#0F172A] text-white p-3.5 flex items-center justify-between border-b-2 border-[#FFC700] select-none">
                        <div className="flex items-center gap-2.5">
                            <div className="h-9 w-9 rounded-xl bg-[#FFC700] text-[#0F172A] flex items-center justify-center font-black shadow-sm">
                                <Bot className="h-5 w-5" />
                            </div>
                            <div>
                                <div className="flex items-center gap-1.5">
                                    <span className="text-xs font-black uppercase tracking-wider text-white">CertHero Study Mentor</span>
                                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                                </div>
                                <span className="text-[10px] text-slate-300 block">WA Resources Vocational Advisor</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-1">
                            <button
                                onClick={handleClearChat}
                                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                                title="Reset Chat History"
                            >
                                <RotateCcw className="h-3.5 w-3.5" />
                            </button>
                            <button
                                onClick={() => setIsMinimized(prev => !prev)}
                                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                                title={isMinimized ? "Expand Chat" : "Minimize Chat"}
                            >
                                {isMinimized ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </button>
                            <button
                                onClick={closeAssistant}
                                className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                                title="Close Assistant"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    {!isMinimized && (
                        <>
                            {/* Study Context & Access Tier Bar */}
                            <div className="bg-slate-50 border-b border-slate-200 px-3.5 py-2 flex items-center justify-between text-[11px] gap-2">
                                <div className="flex items-center gap-1.5 truncate text-slate-700">
                                    <BookOpen className="h-3.5 w-3.5 text-[#ED9139] shrink-0" />
                                    <span className="truncate font-semibold">
                                        {studyContext?.courseTitle 
                                            ? `${studyContext.courseCode || 'Unit'}: ${studyContext.currentModuleTitle || studyContext.courseTitle}`
                                            : 'WA Mining & High-Risk Induction'
                                        }
                                    </span>
                                </div>

                                {hasPaid ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
                                        <CheckCircle2 className="h-2.5 w-2.5" /> Verified
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200 shrink-0">
                                        <Lock className="h-2.5 w-2.5 text-amber-700" /> Syllabus Mode
                                    </span>
                                )}
                            </div>

                            {/* Message History */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/60">
                                {messages.map((msg) => {
                                    const isUser = msg.role === 'user';
                                    return (
                                        <div
                                            key={msg.id}
                                            className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                                        >
                                            <div
                                                className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-xs shadow-sm ${
                                                    isUser
                                                        ? 'bg-[#0F172A] text-white rounded-br-none'
                                                        : msg.isGated
                                                        ? 'bg-amber-50 text-amber-950 border border-amber-300 rounded-bl-none'
                                                        : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
                                                }`}
                                            >
                                                {msg.isGated && (
                                                    <div className="flex items-center gap-1.5 font-bold text-amber-800 mb-1 text-[11px] pb-1 border-b border-amber-200">
                                                        <Lock className="h-3 w-3 text-amber-700" /> Enrollment Verification Notice
                                                    </div>
                                                )}

                                                {renderFormattedMessage(msg.content)}
                                            </div>

                                            <span className="text-[9px] text-slate-400 mt-1 px-1">
                                                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                {msg.provider && !isUser && (
                                                    <span className="ml-1 text-[9px] text-slate-400 font-mono">
                                                        • {msg.provider}
                                                    </span>
                                                )}
                                            </span>
                                        </div>
                                    );
                                })}

                                {loading && (
                                    <div className="flex items-center gap-2 text-slate-400 text-xs py-1 px-2 bg-white border border-slate-200 rounded-xl w-fit">
                                        <div className="flex space-x-1">
                                            <div className="h-1.5 w-1.5 bg-[#ED9139] rounded-full animate-bounce [animation-delay:-0.3s]" />
                                            <div className="h-1.5 w-1.5 bg-[#ED9139] rounded-full animate-bounce [animation-delay:-0.15s]" />
                                            <div className="h-1.5 w-1.5 bg-[#ED9139] rounded-full animate-bounce" />
                                        </div>
                                        <span className="text-[11px] font-medium text-slate-500">CertHero Mentor is analyzing...</span>
                                    </div>
                                )}

                                <div ref={messagesEndRef} />
                            </div>

                            {/* Suggested Prompts Pills */}
                            <div className="bg-white border-t border-slate-200 px-3 py-2 overflow-x-auto scrollbar-none flex items-center gap-1.5">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
                                    <Sparkles className="h-3 w-3 text-[#ED9139]" /> Suggestions:
                                </span>
                                {quickPrompts.map((prompt, i) => (
                                    <button
                                        key={i}
                                        onClick={() => sendMessage(prompt)}
                                        disabled={loading}
                                        className="shrink-0 text-[11px] bg-slate-100 hover:bg-[#FFC700]/20 hover:text-slate-900 text-slate-700 px-2.5 py-1 rounded-full border border-slate-200 transition-colors whitespace-nowrap disabled:opacity-50"
                                    >
                                        {prompt}
                                    </button>
                                ))}
                            </div>

                            {/* Input Form */}
                            <div className="p-3 bg-white border-t border-slate-200">
                                <div className="flex items-center gap-2 bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 focus-within:border-[#ED9139] focus-within:ring-1 focus-within:ring-[#ED9139] transition-all">
                                    <input
                                        type="text"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        placeholder={
                                            studyContext?.courseTitle
                                                ? `Ask about ${studyContext.courseCode || 'course'} topics or safety standards...`
                                                : "Ask a question about syllabus, employers, or FIFO..."
                                        }
                                        disabled={loading}
                                        className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 outline-none"
                                    />
                                    <button
                                        onClick={() => sendMessage()}
                                        disabled={!input.trim() || loading}
                                        className="h-8 w-8 rounded-lg bg-[#ED9139] hover:bg-[#dd7f26] disabled:bg-slate-300 text-white flex items-center justify-center shrink-0 transition-colors shadow-sm"
                                        title="Send message"
                                    >
                                        <Send className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                                <div className="mt-1 text-[9px] text-center text-slate-400">
                                    CertHero Vocational & RTO Learning Support • ASQA Standards Compliant
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
