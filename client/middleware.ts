import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
    const url = req.nextUrl;
    const hostname = req.headers.get('host') || '';
    const { pathname, search } = url;

    // 1. Pass through Next.js internals, API routes, and static assets
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api') ||
        pathname.includes('.') ||
        pathname.startsWith('/uploads')
    ) {
        return NextResponse.next();
    }

    const hostLower = hostname.toLowerCase();

    // 2. Redirect legacy aveling.online traffic to aveling.domainname
    if (hostLower === 'aveling.online' || hostLower === 'www.aveling.online') {
        const canonicalBase = process.env.NEXT_PUBLIC_SITE_DOMAIN || 'bluecollarrecruitment.co';
        const targetHost = `aveling.${canonicalBase.replace(/^www\./i, '')}`;
        const redirectUrl = new URL(`${pathname}${search}`, `https://${targetHost}`);
        return NextResponse.redirect(redirectUrl, 301);
    }

    // 3. Detect if request is targeting an Aveling subdomain (e.g., aveling.domain.com, aveling.localhost:3000)
    const isAvelingSubdomain = hostLower.startsWith('aveling.');

    if (isAvelingSubdomain) {
        // Prevent double-prefixing if path already includes /aveling
        if (pathname.startsWith('/aveling')) {
            return NextResponse.next();
        }

        // Rewrite internally to /aveling route while preserving the browser subdomain URL
        const rewrittenPath = `/aveling${pathname === '/' ? '' : pathname}`;
        const rewriteUrl = new URL(`${rewrittenPath}${search}`, req.url);
        return NextResponse.rewrite(rewriteUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico, images, etc.
         */
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};
