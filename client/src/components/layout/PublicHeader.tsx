'use client';

import Link from 'next/link';
import { CONSTANTS } from '@/constants';

export function PublicHeader() {
    return (
        <nav className="fixed top-0 w-full z-50 bg-white border-b border-blue-100 flex justify-between items-center px-6 md:px-16 h-20 max-w-full font-sans antialiased text-blue-900">
            <div className="flex items-center gap-6 lg:gap-12">
                <Link href={CONSTANTS.ROUTES.HOME} className="flex flex-col shrink-0">
                    <span className="text-lg lg:text-xl font-black italic uppercase tracking-[0.1em] text-blue-900">BlueCollarRecruitment</span>
                </Link>
                <div className="hidden md:flex gap-10 items-center">
                    <Link href={CONSTANTS.ROUTES.HOME} className="text-[10px] font-bold text-blue-900 uppercase tracking-[0.2em] transition-all">
                        Index
                    </Link>
                    <Link href={CONSTANTS.ROUTES.PUBLIC_JOBS} className="text-[10px] font-bold text-blue-400 hover:text-blue-900 uppercase tracking-[0.2em] transition-all">
                        Opportunities
                    </Link>
                    <Link href={CONSTANTS.ROUTES.PRIVACY} className="text-[10px] font-bold text-blue-400 hover:text-blue-900 uppercase tracking-[0.2em] transition-all">
                        Privacy
                    </Link>
                </div>
            </div>
            <div className="flex items-center gap-4 lg:gap-8 min-w-0">
                <Link href={CONSTANTS.ROUTES.LOGIN} className="text-[10px] font-bold text-blue-400 hover:text-blue-900 uppercase tracking-[0.2em] transition-all whitespace-nowrap">
                    Login
                </Link>
                <Link href={CONSTANTS.ROUTES.REGISTER} className="bg-blue-900 text-white px-5 lg:px-8 py-2.5 lg:py-3 rounded-lg text-[9px] lg:text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-blue-800 transition-all shadow-xl shadow-blue-900/10 active:scale-95 whitespace-nowrap">
                    Sign Up
                </Link>
            </div>
        </nav>
    );
}
