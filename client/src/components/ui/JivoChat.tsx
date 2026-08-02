'use client';

import { usePathname } from 'next/navigation';
import Script from 'next/script';

/**
 * JivoChat Widget Integration
 * Conditionally rendered for public and applicant routes, excluding administrative sections.
 */
export default function JivoChat() {
    const pathname = usePathname();

    // Check if the current route is administrative
    const isAdminRoute = pathname?.startsWith('/admin');

    // Only render for public and applicant (/dashboard) routes
    if (isAdminRoute) return null;

    return (
        <Script
            src="//code.jivosite.com/widget/bB4cO4DGRO"
            strategy="afterInteractive"
        />
    );
}

