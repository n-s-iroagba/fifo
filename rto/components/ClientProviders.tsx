'use client';

import React from 'react';
import { AiAssistantProvider } from '@/context/AiAssistantContext';
import { AiStudyAssistant } from '@/components/AiStudyAssistant';

export function ClientProviders({ children }: { children: React.ReactNode }) {
    return (
        <AiAssistantProvider>
            {children}
            <AiStudyAssistant />
        </AiAssistantProvider>
    );
}
