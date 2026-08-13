'use client';

import React from 'react';

interface PageShellProps {
    children: React.ReactNode;
    className?: string;
}

/** Consistent inner-page container matching the home page layout style */
export function PageShell({ children, className }: PageShellProps) {
    return (
        <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full ${className || ''}`}>
            {children}
        </div>
    );
}
