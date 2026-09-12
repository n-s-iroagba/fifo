'use client';

import React from 'react';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { PublicFooter } from '@/components/layout/PublicFooter';

// ─── Types ────────────────────────────────────────────────────────────────────
interface DocRow { doc: string; notes: string; }
interface StepItem { step: string; action: string; }

// ─── Data ─────────────────────────────────────────────────────────────────────

const preEmploymentSteps = [
    {
        number: '01',
        title: 'Application',
        color: 'bg-blue-500',
        items: [
            'Update your biodata (full personal and professional information).',
            'Upload your CV in ATS-compliant format (use the provided template).',
            'Complete Psychometric Assessment — Module 1 (automatic pass at grade on submission).',
            'Complete Psychometric Assessment — Module 2 (reviewed and approved by admin).',
        ],
    },
    {
        number: '02',
        title: 'Nomination',
        color: 'bg-blue-600',
        items: [
            'Upon passing all Step 1 requirements, you will be nominated to top FIFO companies.',
            'You will receive a formal Notification of Nomination document.',
            'Review the nomination, select your preferred company and role, and upload your signed nomination document.',
            'A member of our team will review and confirm your nomination.',
        ],
    },
    {
        number: '03',
        title: 'Ticket Upload & Partial Sponsorship',
        color: 'bg-blue-700',
        items: [
            'Upload proof of any compliance tickets or certifications you already hold.',
            'Apply for sponsorship on any tickets you do not currently possess.',
            'Note: Ticket sponsorship is partial — applicants are responsible for a portion of the ticket cost (below 50%).',
            'Applicants will be refunded 100% of their contribution upon passing the ticket exams.',
        ],
    },
    {
        number: '04',
        title: 'Hiring Process Sponsorship Contract Ratification',
        color: 'bg-blue-800',
        items: [
            'A formal Sponsorship Contract will be issued based on your selected nomination and ticket bundle.',
            'Review the contract carefully — it details your cost-sharing obligations and refund conditions.',
            'Sign and upload page 1 and/or page 15 of the contract as instructed.',
            'The contract is ratified and your sponsorship programme is formally activated.',
        ],
    },
    {
        number: '05',
        title: 'Ticket Courses & Examination',
        color: 'bg-sky-600',
        items: [
            'Access the Aveling LMS portal using credentials provided by our team.',
            'Complete all assigned training modules for your ticket bundle (theory + practical).',
            'Sit and pass the examination for each ticket course.',
            'Note: Trade Certifications (tickets) are a mandatory requirement when applying for your Australian visa.',
            'You have two attempts per exam — first attempt is fully graded; a failed first attempt results in an automatic pass on your second attempt at the pass mark.',
        ],
    },
    {
        number: '06',
        title: 'Video Call Interview',
        color: 'bg-sky-700',
        items: [
            'A video call interview will be conducted to verify your training outcomes.',
            'The interview also confirms your application details and suitability for the roles nominated.',
            'Ensure your environment is professional and your identification documents are available.',
        ],
    },
    {
        number: '07',
        title: 'Physical Ticket Certificate Shipping',
        color: 'bg-sky-800',
        items: [
            'Upon successfully completing the video call and all training requirements, your physical ticket certificates will be shipped.',
            'Certificates will be delivered to your specified address anywhere in the world.',
            'Aveling will issue your Statements of Attainment and trade certificates at this stage.',
        ],
    },
    {
        number: '08',
        title: 'Employment Contract Ratification',
        color: 'bg-indigo-700',
        items: [
            'Your final Employment Contract with your nominated FIFO company will be issued.',
            'Review and sign the Employment Contract to formally confirm your position.',
            'This completes the Pre-Employment phase — you will then proceed to the Post-Employment and Visa Sponsorship phase.',
        ],
    },
];

const postEmploymentSteps = [
    {
        number: '09',
        title: 'Employer Visa Nomination',
        color: 'bg-violet-600',
        items: [
            'Your employer (the nominated FIFO company) lodges your nomination application through ImmiAccount for a Subclass 482 Skills in Demand visa (Specialist Skills Stream).',
            'The Department of Home Affairs generates a Transaction Reference Number (TRN) for the nomination.',
            'Your employer provides you with the TRN — you will need this to link your own visa application.',
            'You can lodge your visa application as soon as you receive the TRN, even before the nomination is formally approved.',
        ],
    },
    {
        number: '10',
        title: 'Visa Application & Processing',
        color: 'bg-violet-700',
        items: [
            'Lodge your visa application via your own ImmiAccount and enter the TRN provided by your employer.',
            'You must meet all visa requirements: Skills Assessment, English Language Proficiency, Health Examination, and Character Checks (see Section 2 below for full detail).',
            'Lodgement must occur within 12 months of your nomination approval or the nomination expires.',
            'The Specialist Skills Stream can be processed in as little as 7 working days.',
        ],
    },
    {
        number: '11',
        title: 'Arrival to Australia',
        color: 'bg-violet-800',
        items: [
            'Travel to Australia on your granted Subclass 482 visa.',
            'Complete all required site inductions and onboarding with your employer upon arrival.',
        ],
    },
    {
        number: '12',
        title: 'Completion of Practical Modules & Deployment',
        color: 'bg-indigo-800',
        items: [
            'Complete any remaining practical assessment modules required on-site in Australia.',
            'Be deployed to your nominated company and commence your FIFO employment.',
            'After 2 years on your 482 visa, you may be eligible to apply for a Subclass 186 Employer Nomination Scheme (ENS) permanent residency visa.',
        ],
    },
];

const visaTimeline = [
    { item: 'Visa Subclass', detail: 'Subclass 482 (Skills in Demand) — Specialist Skills Stream' },
    { item: 'Processing Time', detail: 'Can be processed in as little as 7 working days' },
    { item: 'Income Threshold (Specialist Skills)', detail: 'Minimum salary: $146,576 AUD (effective 1 July 2026)' },
    { item: 'Income Threshold (Core Skills)', detail: 'Minimum salary: $79,423 AUD (effective 1 July 2026)' },
    { item: 'Pathway to PR', detail: 'After 2 years on 482 visa, eligible for Subclass 186 (ENS) permanent residency' },
];

const skillsAssessmentSteps: StepItem[] = [
    { step: '1', action: 'For Trades (Electrician, Mechanic, Chef, Plumber, etc.): Visit Trades Recognition Australia (TRA) at tradesrecognitionaustralia.gov.au' },
    { step: '2', action: 'Upload all tickets (trade certificates) acquired from Aveling, plus identity documents, qualification documents, and detailed employer reference letters (on letterhead, stating title, duties, exact dates, hours per week).' },
    { step: '3', action: 'Submit your application through the assessing authority\'s online portal.' },
    { step: '4', action: 'Pay the assessment fee (typically $795–$1,500 AUD) — fee to be funded by employer.' },
    { step: '5', action: 'Wait for the outcome — processing typically takes 4 weeks.' },
];

const skillsDocs: DocRow[] = [
    { doc: 'Passport (bio-data page)', notes: 'Clear colour copy' },
    { doc: 'Passport-sized photograph', notes: 'Recent (within last 6 months)' },
    { doc: 'National ID Card', notes: 'If applicable' },
    { doc: 'Birth Certificate', notes: 'Official government-issued' },
    { doc: "Driver's Licence", notes: 'If applicable' },
    { doc: 'Change of Name Documents', notes: 'If applicable (e.g., marriage certificate)' },
    { doc: 'Degree Certificate', notes: 'Certified copy (if applicable)' },
    { doc: 'Diploma Certificate', notes: 'Certified copy (if applicable)' },
    { doc: 'Trade Certificate (tickets from Aveling)', notes: 'Certified copy' },
    { doc: 'Academic Transcripts', notes: 'Official, all subjects and grades' },
    { doc: 'Reference Letter — Employer #1', notes: 'On letterhead; job title, duties, exact dates, hours/week, signed' },
    { doc: 'Reference Letter — Employer #2', notes: 'If applicable' },
    { doc: 'Reference Letter — Employer #3', notes: 'If applicable' },
    { doc: 'Payslips', notes: 'Supplementary evidence' },
    { doc: 'Tax Records', notes: 'Supplementary evidence (if available)' },
    { doc: 'Bank Statements (salary deposits)', notes: 'Supplementary evidence (if available)' },
    { doc: 'CV / Resume', notes: 'Up-to-date career history' },
];

const englishScores = [
    { test: 'IELTS Academic', listening: '8.0', reading: '7.0', writing: '7.0', speaking: '7.0' },
    { test: 'TOEFL iBT', listening: '28', reading: '24', writing: '27', speaking: '23' },
    { test: 'PTE Academic', listening: '79', reading: '79', writing: '79', speaking: '79' },
    { test: 'Cambridge C1/C2', listening: '185', reading: '185', writing: '185', speaking: '185' },
];

const englishDocs: DocRow[] = [
    { doc: 'Approved English Test Results', notes: 'Must be taken within 3 years of visa application' },
    { doc: 'Passport (to prove nationality)', notes: 'If claiming passport exemption' },
    { doc: 'Academic Transcripts', notes: 'If claiming 5 years of English-medium study exemption' },
];

const healthSteps: StepItem[] = [
    { step: '1', action: "Use the 'My Health Declarations' system or follow instructions on the Department's website." },
    { step: '2', action: 'Obtain a Health Assessment Program (HAP) ID.' },
    { step: '3', action: 'Book your health examination with an approved panel physician using your HAP ID.' },
    { step: '4', action: 'Complete the examination.' },
    { step: '5', action: 'Ensure results are valid for 12 months from the date of examination.' },
];

const healthDocs: DocRow[] = [
    { doc: 'HAP ID', notes: "Obtained via 'My Health Declarations' system" },
    { doc: 'Appointment Confirmation', notes: 'With approved panel physician' },
    { doc: 'Passport', notes: 'Must bring to your medical appointment' },
    { doc: 'Medical History', notes: 'Be prepared to provide full medical history' },
];

const healthTests = [
    { test: 'Full Medical Examination', detail: 'Physical examination by panel physician' },
    { test: 'Chest X-Ray', detail: 'Screening for tuberculosis' },
    { test: 'Blood Tests', detail: 'HIV, hepatitis B, and other tests as required' },
    { test: 'Additional Tests', detail: 'May be required based on age, nationality, or occupation (e.g., healthcare workers have extra requirements)' },
];

const characterSteps: StepItem[] = [
    { step: '1', action: 'List all countries where you (and any family member over 16) have lived for 12 months or more in the past 10 years since turning 16.' },
    { step: '2', action: 'Apply for official police certificates from each of those countries.' },
    { step: '3', action: 'If a police certificate is not in English, obtain a certified translation.' },
    { step: '4', action: 'Declare all criminal conduct, including charges awaiting legal action.' },
    { step: '5', action: 'Complete Form 80 — Personal Particulars for Character Assessment.' },
    { step: '6', action: 'Complete Form 1563 — Statement of Character (if requested by the Department).' },
    { step: '7', action: 'Ensure police certificates are valid — generally 12 months from issue date.' },
];

const characterDocs: DocRow[] = [
    { doc: 'Police Certificate — Country 1', notes: 'Official clearance from every country where you lived 12+ months in last 10 years' },
    { doc: 'Police Certificate — Country 2', notes: 'If applicable' },
    { doc: 'Police Certificate — Country 3', notes: 'If applicable' },
    { doc: 'Police Certificate — Country 4+', notes: 'If applicable' },
    { doc: 'Certified Translations', notes: 'For any police certificates not in English' },
    { doc: 'Form 80', notes: 'Personal Particulars for Character Assessment' },
    { doc: 'Form 1563', notes: 'Statement of Character (if requested)' },
    { doc: 'Military Certificate', notes: 'If applicable (e.g., Form 1399 — Declaration of Service)' },
];

const masterChecklist = [
    { cat: 'Identity', doc: 'Passport (bio-data page)' },
    { cat: 'Identity', doc: 'Passport-sized photograph (recent)' },
    { cat: 'Identity', doc: 'National ID Card' },
    { cat: 'Identity', doc: 'Birth Certificate' },
    { cat: 'Identity', doc: "Driver's Licence" },
    { cat: 'Identity', doc: 'Change of Name Documents (if applicable)' },
    { cat: 'Qualifications', doc: 'Degree Certificate (certified copy, if applicable)' },
    { cat: 'Qualifications', doc: 'Diploma Certificate (certified copy, if applicable)' },
    { cat: 'Qualifications', doc: 'Trade Certificate / Tickets (certified copy)' },
    { cat: 'Qualifications', doc: 'Academic Transcripts (official, all subjects and grades)' },
    { cat: 'Employment', doc: 'Reference Letter — Employer #1 (on letterhead, signed, with duties, dates, hours)' },
    { cat: 'Employment', doc: 'Reference Letter — Employer #2 (if applicable)' },
    { cat: 'Employment', doc: 'Reference Letter — Employer #3 (if applicable)' },
    { cat: 'Employment', doc: 'Payslips (supplementary evidence)' },
    { cat: 'Employment', doc: 'Tax Records (supplementary evidence, if available)' },
    { cat: 'Employment', doc: 'Bank Statements showing salary deposits (if available)' },
    { cat: 'CV/Resume', doc: 'Up-to-date Curriculum Vitae / Resume' },
    { cat: 'English', doc: 'Approved English Test Results (or proof of exemption)' },
    { cat: 'Health', doc: 'HAP ID (obtained via My Health Declarations)' },
    { cat: 'Health', doc: 'Medical Examination completed with approved panel physician' },
    { cat: 'Character', doc: 'Police Certificate — Country 1' },
    { cat: 'Character', doc: 'Police Certificate — Country 2 (if applicable)' },
    { cat: 'Character', doc: 'Police Certificate — Country 3 (if applicable)' },
    { cat: 'Character', doc: 'Police Certificate — Country 4+ (if applicable)' },
    { cat: 'Character', doc: 'Certified Translations for all non-English police certificates' },
    { cat: 'Character', doc: 'Form 80 — Personal Particulars for Character Assessment' },
    { cat: 'Character', doc: 'Form 1563 — Statement of Character (if requested)' },
    { cat: 'Character', doc: 'Military Certificate (if applicable)' },
    { cat: 'Nomination', doc: 'TRN (Transaction Reference Number) from your employer' },
];

const finalReminders = [
    'Positive skills assessment obtained before visa application.',
    'English test taken within 3 years of visa application (or proof of exemption).',
    'Health examination completed with an approved panel physician.',
    'Police certificates obtained from every country where you lived for 12+ months in the past 10 years.',
    'Form 80 completed.',
    'Form 1563 completed (if requested).',
    'All non-English documents have certified translations.',
    'All copies of original documents are certified.',
    'All names are consistent across all documents.',
    'You have the TRN from your employer to link your visa application.',
    'You lodge your visa application within 12 months of nomination approval.',
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionDivider({ label }: { label: string }) {
    return (
        <div className="flex items-center gap-6 my-20">
            <div className="flex-1 h-px bg-blue-100" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-400 whitespace-nowrap">{label}</span>
            <div className="flex-1 h-px bg-blue-100" />
        </div>
    );
}

function DocTable({ rows }: { rows: DocRow[] }) {
    return (
        <div className="overflow-x-auto mt-4">
            <table className="w-full text-sm border-collapse">
                <thead>
                    <tr className="bg-blue-50">
                        <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-blue-700 border border-blue-100">#</th>
                        <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-blue-700 border border-blue-100">Document</th>
                        <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-blue-700 border border-blue-100">Notes</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((r, i) => (
                        <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-blue-50/40'}>
                            <td className="px-4 py-3 text-blue-400 font-bold border border-blue-100">{i + 1}</td>
                            <td className="px-4 py-3 text-blue-700 font-medium border border-blue-100">{r.doc}</td>
                            <td className="px-4 py-3 text-blue-500 border border-blue-100">{r.notes}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function StepTable({ rows }: { rows: StepItem[] }) {
    return (
        <div className="overflow-x-auto mt-4">
            <table className="w-full text-sm border-collapse">
                <thead>
                    <tr className="bg-blue-50">
                        <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-blue-700 border border-blue-100 w-16">Step</th>
                        <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-blue-700 border border-blue-100">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((r, i) => (
                        <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-blue-50/40'}>
                            <td className="px-4 py-3 text-blue-400 font-bold border border-blue-100 align-top">{r.step}</td>
                            <td className="px-4 py-3 text-blue-600 border border-blue-100 leading-relaxed">{r.action}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function AccordionStep({ step }: { step: typeof preEmploymentSteps[0] }) {
    return (
        <section className="relative pl-14 border-l-4 border-blue-100">
            <div className={`absolute -left-5 top-0 w-9 h-9 rounded-full ${step.color} flex items-center justify-center shadow-md`}>
                <span className="text-white text-[10px] font-black">{step.number}</span>
            </div>
            <h3 className="text-[13px] font-black uppercase tracking-[0.18em] text-blue-900 mb-4">
                Step {step.number}: {step.title}
            </h3>
            <ul className="space-y-2">
                {step.items.map((item, i) => (
                    <li key={i} className="flex gap-3 text-sm text-blue-500 leading-relaxed">
                        <span className="mt-1.5 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-blue-300" />
                        {item}
                    </li>
                ))}
            </ul>
        </section>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DocumentPage() {
    return (
        <div className="bg-white text-blue-900 antialiased flex flex-col min-h-screen font-sans">
            <PublicHeader />
            <main className="pt-32 pb-32 flex-1 px-6 lg:px-16">
                <div className="max-w-[1100px] mx-auto">

                    {/* ── Hero ─────────────────────────────────────────────── */}
                    <header className="mb-20 text-center">
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-400 block mb-4">
                            Blue Collar Recruitment Pty Ltd · ABN: 67 105 263 152
                        </span>
                        <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-blue-900 mb-6 leading-tight">
                            Hiring Process<br />
                            <span className="text-blue-400">Framework.</span>
                        </h1>
                        <p className="text-blue-500 text-lg max-w-[720px] mx-auto leading-relaxed font-medium">
                            This document is divided into two sections. <strong className="text-blue-700">Section 1</strong> covers the
                            Applicant Pre-Employment Process. <strong className="text-blue-700">Section 2</strong> covers the
                            Employer-Sponsored Visa (Subclass 482) actionables and document checklist for employees.
                        </p>
                    </header>

                    {/* ── Introduction ─────────────────────────────────────── */}
                    <div className="bg-white p-10 lg:p-14 rounded-[2.5rem] border border-blue-100 mb-12 shadow-sm">
                        <h2 className="text-xl font-black italic text-blue-900 mb-6 uppercase tracking-tight">
                            Introduction & Ecosystem Overview
                        </h2>
                        <div className="space-y-5 text-sm text-blue-600 leading-loose">
                            <p>
                                Welcome to the <strong>Blue Collar Recruitment Ecosystem</strong>. This platform is an
                                end-to-end recruitment and placement portal built specifically for Fly-In-Fly-Out (FIFO)
                                professionals. It seamlessly links two main hubs:
                            </p>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>
                                    <strong>The Recruitment Portal:</strong> Where applicants submit ATS-compliant CVs,
                                    manage biodata, take psychometric assessments, and track nomination status.
                                </li>
                                <li>
                                    <strong>The LMS / Training Portal (Aveling):</strong> Where applicants access mandated
                                    training courses, complete theoretical and practical assessments, and earn the compliance
                                    tickets (EEHA, Standard 11, Working at Heights, etc.) required for site deployment.
                                </li>
                            </ul>
                            <p>
                                By unifying these systems, certification gaps identified during recruitment are automatically
                                synchronised with your training dashboard — you only take courses you absolutely need.
                                Adherence to this framework is mandatory, and it forms the basis of all process literacy
                                assessments.
                            </p>
                        </div>
                    </div>

                    {/* ══════════════════════════════════════════════════════════
                        SECTION 1 — PRE-EMPLOYMENT PROCESS
                    ══════════════════════════════════════════════════════════ */}
                    <SectionDivider label="Section 1 — Pre-Employment Process" />

                    <div className="bg-blue-50/40 p-10 lg:p-16 rounded-[2.5rem] border border-blue-100 mb-12 shadow-lg shadow-blue-900/5">
                        <div className="mb-10">
                            <span className="text-[10px] font-black uppercase tracking-[0.35em] text-blue-400 block mb-2">A. Steps</span>
                            <h2 className="text-3xl font-black italic text-blue-900 uppercase tracking-tighter">
                                The 8-Step Pre-Employment Pathway
                            </h2>
                        </div>
                        <div className="space-y-14">
                            {preEmploymentSteps.map(step => (
                                <AccordionStep key={step.number} step={step} />
                            ))}
                        </div>
                    </div>

                    {/* ── Payments ─────────────────────────────────────────── */}
                    <div className="bg-white p-10 lg:p-14 rounded-[2.5rem] border border-blue-100 mb-12 shadow-sm">
                        <span className="text-[10px] font-black uppercase tracking-[0.35em] text-blue-400 block mb-2">B. Payments</span>
                        <h2 className="text-xl font-black italic text-blue-900 mb-6 uppercase tracking-tight">
                            Payment Method — International Applicants
                        </h2>
                        <div className="space-y-4 text-sm text-blue-600 leading-loose">
                            <p>
                                All ticket course payments for international applicants are made in{' '}
                                <strong className="text-blue-800">USDT (USD Tether) on the TRC-20 Network (Tron)</strong>.
                            </p>
                            <p>
                                We prefer this method due to transfer speed — USDT transactions on TRC-20 complete in under
                                30 minutes, compared to international wire transfers which can take multiple business days.
                                This helps us meet client deployment deadlines at the shortest possible time.
                            </p>
                            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 mt-4">
                                <p className="font-semibold text-blue-800 mb-1 text-[11px] uppercase tracking-widest">Payment Options</p>
                                <ul className="list-disc pl-5 space-y-2 text-blue-600">
                                    <li>
                                        <strong>Partial Payment:</strong> Pay your portion before starting — you can complete
                                        tickets 1–3 immediately. Full balance must be settled before commencing ticket 4.
                                    </li>
                                    <li>
                                        <strong>Full Payment Upfront:</strong> Pay the complete amount upfront and receive an
                                        additional <strong>10% discount</strong> on your total ticket bundle.
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* ══════════════════════════════════════════════════════════
                        SECTION 2 — POST-EMPLOYMENT / VISA SPONSORSHIP
                    ══════════════════════════════════════════════════════════ */}
                    <SectionDivider label="Section 2 — Employer-Sponsored Visa (Post-Employment)" />

                    {/* ── Post-Employment Steps ─────────────────────────────── */}
                    <div className="bg-violet-50/40 p-10 lg:p-16 rounded-[2.5rem] border border-violet-100 mb-12 shadow-lg shadow-violet-900/5">
                        <div className="mb-10">
                            <span className="text-[10px] font-black uppercase tracking-[0.35em] text-violet-400 block mb-2">C. Post-Employment Steps</span>
                            <h2 className="text-3xl font-black italic text-blue-900 uppercase tracking-tighter">
                                Steps 9–12: Visa, Arrival & Deployment
                            </h2>
                        </div>
                        <div className="space-y-14">
                            {postEmploymentSteps.map(step => (
                                <section key={step.number} className="relative pl-14 border-l-4 border-violet-100">
                                    <div className={`absolute -left-5 top-0 w-9 h-9 rounded-full ${step.color} flex items-center justify-center shadow-md`}>
                                        <span className="text-white text-[10px] font-black">{step.number}</span>
                                    </div>
                                    <h3 className="text-[13px] font-black uppercase tracking-[0.18em] text-blue-900 mb-4">
                                        Step {step.number}: {step.title}
                                    </h3>
                                    <ul className="space-y-2">
                                        {step.items.map((item, i) => (
                                            <li key={i} className="flex gap-3 text-sm text-blue-500 leading-relaxed">
                                                <span className="mt-1.5 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-violet-300" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </section>
                            ))}
                        </div>
                    </div>

                    {/* ── Visa Subclass 482 Detail ──────────────────────────── */}
                    <div className="bg-white p-10 lg:p-14 rounded-[2.5rem] border border-blue-100 mb-10 shadow-sm">
                        <h2 className="text-xl font-black italic text-blue-900 mb-2 uppercase tracking-tight">
                            Visa Subclass 482 — Skills in Demand Visa
                        </h2>
                        <p className="text-sm text-blue-500 mb-6 leading-relaxed">
                            Specialist Skills Stream · Processing &amp; Timeline Overview
                        </p>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm border-collapse">
                                <tbody>
                                    {visaTimeline.map((r, i) => (
                                        <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-blue-50/40'}>
                                            <td className="px-4 py-3 text-blue-700 font-semibold border border-blue-100 w-1/3">{r.item}</td>
                                            <td className="px-4 py-3 text-blue-500 border border-blue-100">{r.detail}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Critical Timing */}
                        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
                                <p className="text-[10px] font-black uppercase tracking-widest text-amber-700 mb-2">⚠ Critical: Visa Lodgement Deadline</p>
                                <p className="text-sm text-amber-800 leading-relaxed">
                                    You <strong>must</strong> lodge your visa application within <strong>12 months</strong> of
                                    your nomination being approved, or the nomination expires.
                                </p>
                            </div>
                            <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
                                <p className="text-[10px] font-black uppercase tracking-widest text-green-700 mb-2">✓ Early Lodge Allowed</p>
                                <p className="text-sm text-green-800 leading-relaxed">
                                    You can lodge your visa application as soon as your employer gives you the TRN —
                                    even if the nomination has not yet been formally approved.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* ── Part 1: Skills Assessment ─────────────────────────── */}
                    <div className="bg-white p-10 lg:p-14 rounded-[2.5rem] border border-blue-100 mb-10 shadow-sm">
                        <h2 className="text-xl font-black italic text-blue-900 mb-2 uppercase tracking-tight">
                            Employee Actionables — Part 1: Skills Assessment
                        </h2>
                        <p className="text-sm text-blue-500 mb-6 leading-relaxed">
                            A formal validation of your qualifications and work experience for your nominated occupation.
                            You must obtain a <strong>positive skills assessment outcome</strong> before lodging your visa
                            application.
                        </p>
                        <StepTable rows={skillsAssessmentSteps} />
                        <h3 className="text-[11px] font-black uppercase tracking-widest text-blue-900 mt-8 mb-2">Documents Required</h3>
                        <DocTable rows={skillsDocs} />
                    </div>

                    {/* ── Part 2: English Language ──────────────────────────── */}
                    <div className="bg-white p-10 lg:p-14 rounded-[2.5rem] border border-blue-100 mb-10 shadow-sm">
                        <h2 className="text-xl font-black italic text-blue-900 mb-2 uppercase tracking-tight">
                            Employee Actionables — Part 2: English Language Proficiency
                        </h2>
                        <p className="text-sm text-blue-500 mb-4 leading-relaxed">
                            You may be exempt if you hold a passport from the UK, USA, Canada, New Zealand, or Ireland, or
                            if you completed at least 5 years of full-time study in English at secondary or tertiary level.
                            Otherwise, you must sit an approved English test.
                        </p>
                        <h3 className="text-[11px] font-black uppercase tracking-widest text-blue-900 mt-6 mb-3">Minimum Score Requirements (Specialist Skills Stream)</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm border-collapse">
                                <thead>
                                    <tr className="bg-blue-50">
                                        {['Test', 'Listening', 'Reading', 'Writing', 'Speaking'].map(h => (
                                            <th key={h} className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-blue-700 border border-blue-100">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {englishScores.map((r, i) => (
                                        <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-blue-50/40'}>
                                            <td className="px-4 py-3 text-blue-700 font-semibold border border-blue-100">{r.test}</td>
                                            <td className="px-4 py-3 text-blue-500 border border-blue-100 text-center">{r.listening}</td>
                                            <td className="px-4 py-3 text-blue-500 border border-blue-100 text-center">{r.reading}</td>
                                            <td className="px-4 py-3 text-blue-500 border border-blue-100 text-center">{r.writing}</td>
                                            <td className="px-4 py-3 text-blue-500 border border-blue-100 text-center">{r.speaking}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <h3 className="text-[11px] font-black uppercase tracking-widest text-blue-900 mt-8 mb-2">Documents Required</h3>
                        <DocTable rows={englishDocs} />
                    </div>

                    {/* ── Part 3: Health Examinations ───────────────────────── */}
                    <div className="bg-white p-10 lg:p-14 rounded-[2.5rem] border border-blue-100 mb-10 shadow-sm">
                        <h2 className="text-xl font-black italic text-blue-900 mb-2 uppercase tracking-tight">
                            Employee Actionables — Part 3: Health Examinations
                        </h2>
                        <p className="text-sm text-blue-500 mb-4 leading-relaxed">
                            A mandatory medical examination conducted by an approved panel physician. You cannot use a local
                            general practitioner.
                        </p>
                        <StepTable rows={healthSteps} />
                        <h3 className="text-[11px] font-black uppercase tracking-widest text-blue-900 mt-8 mb-2">Documents Required</h3>
                        <DocTable rows={healthDocs} />
                        <h3 className="text-[11px] font-black uppercase tracking-widest text-blue-900 mt-8 mb-2">Typical Health Tests</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm border-collapse">
                                <thead>
                                    <tr className="bg-blue-50">
                                        <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-blue-700 border border-blue-100">Test</th>
                                        <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-blue-700 border border-blue-100">Details</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {healthTests.map((r, i) => (
                                        <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-blue-50/40'}>
                                            <td className="px-4 py-3 text-blue-700 font-semibold border border-blue-100">{r.test}</td>
                                            <td className="px-4 py-3 text-blue-500 border border-blue-100">{r.detail}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* ── Part 4: Character Checks ──────────────────────────── */}
                    <div className="bg-white p-10 lg:p-14 rounded-[2.5rem] border border-blue-100 mb-10 shadow-sm">
                        <h2 className="text-xl font-black italic text-blue-900 mb-2 uppercase tracking-tight">
                            Employee Actionables — Part 4: Character Checks
                        </h2>
                        <p className="text-sm text-blue-500 mb-4 leading-relaxed">
                            You must obtain official police clearance certificates from every country where you (and any
                            family member over 16) have lived for 12 months or more in the past 10 years since turning 16.
                        </p>
                        <StepTable rows={characterSteps} />
                        <h3 className="text-[11px] font-black uppercase tracking-widest text-blue-900 mt-8 mb-2">Documents Required</h3>
                        <DocTable rows={characterDocs} />
                    </div>

                    {/* ── Master Checklist ──────────────────────────────────── */}
                    <div className="bg-blue-900 p-10 lg:p-14 rounded-[2.5rem] mb-10 shadow-2xl shadow-blue-900/30">
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-300 block mb-2">
                            Complete Master Document Checklist
                        </span>
                        <h2 className="text-2xl font-black italic text-white mb-8 uppercase tracking-tighter">
                            All Documents You Must Provide
                        </h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm border-collapse">
                                <thead>
                                    <tr>
                                        {['#', 'Category', 'Document'].map(h => (
                                            <th key={h} className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-blue-300 border border-blue-700">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {masterChecklist.map((r, i) => (
                                        <tr key={i} className={i % 2 === 0 ? 'bg-blue-800/40' : 'bg-blue-800/70'}>
                                            <td className="px-4 py-3 text-blue-400 font-bold border border-blue-700/60">{i + 1}</td>
                                            <td className="px-4 py-3 text-blue-300 font-semibold border border-blue-700/60 whitespace-nowrap">{r.cat}</td>
                                            <td className="px-4 py-3 text-blue-100 border border-blue-700/60">{r.doc}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* ── Final Reminders ───────────────────────────────────── */}
                    <div className="bg-white p-10 lg:p-14 rounded-[2.5rem] border border-blue-100 mb-12 shadow-sm">
                        <h2 className="text-xl font-black italic text-blue-900 mb-6 uppercase tracking-tight">
                            Final Reminders — Zero Omissions Check
                        </h2>
                        <ul className="space-y-3">
                            {finalReminders.map((r, i) => (
                                <li key={i} className="flex items-start gap-4 text-sm text-blue-600 leading-relaxed">
                                    <span className="flex-shrink-0 mt-0.5 w-6 h-6 rounded-full bg-blue-100 border-2 border-blue-300 flex items-center justify-center text-[10px] font-black text-blue-700">
                                        {i + 1}
                                    </span>
                                    {r}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* ── Disclaimer ────────────────────────────────────────── */}
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center">
                        <p className="text-[10px] font-black uppercase tracking-widest text-amber-700 mb-2">Important Disclaimer</p>
                        <p className="text-sm text-amber-800 leading-relaxed max-w-[760px] mx-auto">
                            Immigration policies, income thresholds, fees, and test requirements are subject to change.
                            Always refer to the Australian Department of Home Affairs official website at{' '}
                            <strong>immi.homeaffairs.gov.au</strong> for the most current and legally binding information.
                        </p>
                    </div>

                </div>
            </main>
            <PublicFooter />
        </div>
    );
}
