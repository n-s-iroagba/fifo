/**
 * Resolves the Aveling LMS subdomain URL dynamically based on the current domain.
 * Examples:
 * - On https://abc.com -> https://aveling.abc.com
 * - On https://www.abc.com -> https://aveling.abc.com
 * - On http://localhost:3000 -> http://aveling.localhost:3000
 * - Or NEXT_PUBLIC_AVELING_URL environment variable if provided.
 */
export function getAvelingUrl(path: string = ''): string {
    const cleanPath = path ? (path.startsWith('/') ? path : `/${path}`) : '';

    if (process.env.NEXT_PUBLIC_AVELING_URL) {
        return `${process.env.NEXT_PUBLIC_AVELING_URL.replace(/\/$/, '')}${cleanPath}`;
    }

    if (typeof window !== 'undefined') {
        const { hostname, port, protocol } = window.location;
        const portSuffix = port ? `:${port}` : '';

        // If already on an aveling subdomain
        if (hostname.toLowerCase().startsWith('aveling.')) {
            return `${protocol}//${hostname}${portSuffix}${cleanPath}`;
        }

        // If on localhost or 127.0.0.1
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return `${protocol}//aveling.localhost${portSuffix}${cleanPath}`;
        }

        // Strip www. if present to get apex/base domain
        const baseDomain = hostname.replace(/^www\./i, '');
        return `${protocol}//aveling.${baseDomain}${portSuffix}${cleanPath}`;
    }

    return `https://aveling.bluecollarrecruitment.co${cleanPath}`;
}
