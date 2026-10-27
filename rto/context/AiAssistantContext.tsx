'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface CourseStudyContext {
    courseId?: number | string;
    courseTitle?: string;
    courseCode?: string;
    syllabus?: any;
    currentModuleTitle?: string;
    currentModuleContent?: string;
}

interface AiAssistantContextType {
    isOpen: boolean;
    openAssistant: (customMessage?: string) => void;
    closeAssistant: () => void;
    toggleAssistant: () => void;
    studyContext: CourseStudyContext | null;
    setStudyContext: (context: CourseStudyContext | null) => void;
    hasPaid: boolean;
    setHasPaid: (paid: boolean) => void;
    pendingInitialMessage: string | null;
    clearPendingMessage: () => void;
}

const AiAssistantContext = createContext<AiAssistantContextType | undefined>(undefined);

export function AiAssistantProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [studyContext, setStudyContext] = useState<CourseStudyContext | null>(null);
    const [hasPaid, setHasPaid] = useState<boolean>(false);
    const [pendingInitialMessage, setPendingInitialMessage] = useState<string | null>(null);

    const openAssistant = (customMessage?: string) => {
        if (customMessage) {
            setPendingInitialMessage(customMessage);
        }
        setIsOpen(true);
    };

    const closeAssistant = () => {
        setIsOpen(false);
    };

    const toggleAssistant = () => {
        setIsOpen(prev => !prev);
    };

    const clearPendingMessage = () => {
        setPendingInitialMessage(null);
    };

    return (
        <AiAssistantContext.Provider
            value={{
                isOpen,
                openAssistant,
                closeAssistant,
                toggleAssistant,
                studyContext,
                setStudyContext,
                hasPaid,
                setHasPaid,
                pendingInitialMessage,
                clearPendingMessage
            }}
        >
            {children}
        </AiAssistantContext.Provider>
    );
}

export function useAiAssistant() {
    const context = useContext(AiAssistantContext);
    if (!context) {
        throw new Error('useAiAssistant must be used within an AiAssistantProvider');
    }
    return context;
}
