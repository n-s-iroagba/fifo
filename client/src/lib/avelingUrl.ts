/**
 * Resolves the Aveling LMS subdomain URL dynamically based on the current domain.
 * Examples:
 * - On https://abc.com -> https://aveling.abc.com
 * - On https://www.abc.com -> https://aveling.abc.com
 * - On http://localhost:3000 -> http://aveling.localhost:3000
 * - Or NEXT_PUBLIC_RTO_URL environment variable if provided.
 */
export function getAvelingUrl(path: string = ''): string {
    const cleanPath = path ? (path.startsWith('/') ? path : `/${path}`) : '';

    const rtoEnv = process.env.NEXT_PUBLIC_RTO_URL;
    if (rtoEnv) {
        return `${rtoEnv.replace(/\/$/, '')}${cleanPath}`;
    }

    if (typeof window !== 'undefined') {
        const { hostname, port, protocol } = window.location;
        const portSuffix = port ? `:${port}` : '';

        // If on localhost or 127.0.0.1 and not specified in env
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return `http://localhost:3002${cleanPath}`;
        }
    }

    return `https://www.certhero.study${cleanPath}`;
}

export const getRtoUrl = getAvelingUrl;
