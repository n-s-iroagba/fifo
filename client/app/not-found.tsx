'use client';

import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-white text-blue-900 antialiased flex flex-col items-center justify-center p-6 text-center font-sans">
            <h1 className="text-[120px] font-bold text-blue-50 leading-none mb-4">404</h1>
            <h2 className="text-xl font-bold uppercase tracking-[0.2em] mb-4">Page Deferred</h2>
            <p className="text-blue-500 text-sm font-medium max-w-[320px] mx-auto leading-relaxed mb-10">
                The requested resource is unavailable or has been relocated within our system.
            </p>
            <Link href="/" className="bg-blue-900 text-white px-8 py-4 rounded-xl text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-blue-800 transition-all shadow-lg shadow-blue-900/10">
                Return Home
            </Link>
        </div>
    );
}
