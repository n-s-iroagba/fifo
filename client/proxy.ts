import { NextRequest, NextResponse } from 'next/server';

export function proxy(req: NextRequest) {
    const url = req.nextUrl;
    const { pathname, search } = url;

    // 1. Pass through Next.js internals, API routes, and static assets
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api') ||
        pathname.startsWith('/uploads') ||
        /\.(ico|png|jpg|jpeg|svg|webp|gif|css|js|woff|woff2|ttf|eot|json|map|pdf)$/i.test(pathname)
    ) {
        return NextResponse.next();
    }

    const rawHost = req.headers.get('x-forwarded-host') || req.headers.get('host') || url.host || '';
    const hostname = rawHost.split(',')[0].trim().toLowerCase();
    const hostWithoutPort = hostname.split(':')[0];

    // 2. Detect if request is targeting an Aveling domain
    // Matches: aveling.domain, aveling.bluecollarrecruitment.co, aveling.localhost, aveling.online, www.aveling.online, etc.
    const isAvelingSubdomain =
        hostWithoutPort.startsWith('aveling.') ||
        hostWithoutPort === 'aveling.online' ||
        hostWithoutPort === 'www.aveling.online';

    if (isAvelingSubdomain) {
        const requestHeaders = new Headers(req.headers);
        requestHeaders.set('x-is-aveling', 'true');
        requestHeaders.set('x-aveling-host', hostWithoutPort);

        // If already on /aveling, pass through with Aveling headers
        if (pathname.startsWith('/aveling')) {
            return NextResponse.next({
                request: {
                    headers: requestHeaders,
                },
            });
        }

        // Rewrite internally to /aveling route while preserving the browser URL
        const rewriteUrl = req.nextUrl.clone();
        rewriteUrl.pathname = `/aveling${pathname === '/' ? '' : pathname}`;
        return NextResponse.rewrite(rewriteUrl, {
            request: {
                headers: requestHeaders,
            },
        });
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
