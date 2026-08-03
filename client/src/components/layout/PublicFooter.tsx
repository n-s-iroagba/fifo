'use client';

import { CONSTANTS } from '@/constants';
import Link from 'next/link';

export function PublicFooter() {
    return (
        <footer className="bg-white w-full py-24 px-8 lg:px-16 border-t border-blue-100 mt-auto font-sans antialiased text-blue-900">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-16 max-w-[1440px] mx-auto">
                <div className="space-y-8">
                    <span className="text-xl font-black italic uppercase tracking-[0.1em] text-blue-900">BlueCollar</span>
                    <p className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.2em] leading-loose max-w-[200px]">
                        © 2026 BlueCollar Enterprise. Global placement & recruitment infrastructure.
                    </p>
                </div>
                <div>
                    <h6 className="text-[10px] font-bold text-blue-900 uppercase tracking-[0.3em] mb-8">Channel Information</h6>
                    <ul className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.2em] space-y-4">
                        <li><Link href={CONSTANTS.ROUTES.ABOUT} className="hover:text-blue-900 transition-colors">About BlueCollar</Link></li>
                        <li><Link href={CONSTANTS.ROUTES.SUPPORT} className="hover:text-blue-900 transition-colors">Support Portal</Link></li>
                    </ul>
                </div>
                <div>
                    <h6 className="text-[10px] font-bold text-blue-900 uppercase tracking-[0.3em] mb-8">Registry & Terms</h6>
                    <ul className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.2em] space-y-4">
                        <li><Link href={CONSTANTS.ROUTES.PRIVACY} className="hover:text-blue-900 transition-colors">Data Privacy Policy</Link></li>
                        <li><Link href={CONSTANTS.ROUTES.TERMS} className="hover:text-blue-900 transition-colors">Service Agreement</Link></li>
                        <li><Link href={CONSTANTS.ROUTES.COMPLIANCE} className="hover:text-blue-900 transition-colors">Compliance Standards</Link></li>
                    </ul>
                </div>
                <div>
                    <h6 className="text-[10px] font-bold text-blue-900 uppercase tracking-[0.3em] mb-8">Verified Protocols</h6>
                    <div className="flex gap-8">
                        <Link className="text-blue-400 hover:text-blue-900 transition-colors" href="/"><span className="material-symbols-outlined text-xl">language</span></Link>
                        <Link className="text-blue-400 hover:text-blue-900 transition-colors" href="/compliance"><span className="material-symbols-outlined text-xl">shield</span></Link>
                        <a className="text-blue-400 hover:text-blue-900 transition-colors" href="mailto:support@BlueCollar.com"><span className="material-symbols-outlined text-xl">alternate_email</span></a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
