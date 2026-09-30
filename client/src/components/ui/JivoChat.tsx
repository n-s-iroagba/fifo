'use client';

import { usePathname } from 'next/navigation';
import Script from 'next/script';

/**
 * JivoChat Widget Integration
 * Conditionally rendered for public and applicant routes, excluding administrative sections.
 */
export default function JivoChat() {
    const pathname = usePathname();

    // Check if the current route is administrative or Aveling LMS
    const isAdminRoute = pathname?.startsWith('/admin');
    const isAvelingRoute = pathname?.startsWith('/aveling');
    const isAvelingHost = typeof window !== 'undefined' && (
        window.location.hostname.toLowerCase().startsWith('aveling.') ||
        window.location.hostname.toLowerCase().includes('aveling.online')
    );

    // Only render for BlueCollar public and applicant (/dashboard) routes
    if (isAdminRoute || isAvelingRoute || isAvelingHost) return null;

    return (
        <Script
            src="//code.jivosite.com/widget/eo6Y2wbQVs"
            strategy="afterInteractive"
        />
    );
}



