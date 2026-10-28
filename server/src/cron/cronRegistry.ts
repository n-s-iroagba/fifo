/**
 * cronRegistry.ts
 * A shared registry that tracks cron job health and provides granular controls:
 * 1. Global pause / resume for all stage crons
 * 2. Granular pause / resume for individual stage crons
 * 3. Individual candidate application cron pause checks
 * 4. DB persistence via `cron_settings` table
 */

import { sequelize } from '../config/database';

export interface CronDefinition {
    key: string;              // Normalized identifier e.g. 'application', 'nomination', etc.
    name: string;             // Registered class/job name e.g. 'ApplicationAutoAcceptance'
    label: string;            // Human-readable title
    stageName: string;        // Correlated application stage
    intervalDesc: string;     // Timing threshold description
}

export const STAGE_CRONS: CronDefinition[] = [
    {
        key: 'application',
        name: 'ApplicationAutoAcceptance',
        label: '12h Application Auto-Acceptance',
        stageName: 'Application',
        intervalDesc: 'Auto-accepts applications under review > 12h'
    },
    {
        key: 'nomination',
        name: 'NominationFollowup',
        label: '1h Employer Selection Followup',
        stageName: 'Nomination',
        intervalDesc: 'Advances selected MACA nominations > 1h to Interview Scheduling'
    },
    {
        key: 'onboarding',
        name: 'OnboardingFollowup',
        label: '1h Post-Interview Onboarding Process Email',
        stageName: 'Interview Scheduling',
        intervalDesc: 'Dispatches MACA Onboarding Guide PDF & regional contact channels 1h post-interview mail'
    },
    {
        key: 'sponsorship',
        name: 'SponsorshipDualCron',
        label: 'Ticket Sponsorship (Call/Invite & Auto-Approval)',
        stageName: 'TicketSponsorship',
        intervalDesc: 'Dispatches Blue Collar call & Employer refund mail, and auto-approves submitted sponsorships > 2h'
    },
    {
        key: 'contract',
        name: 'ContractAutoApproval',
        label: '3h Contract Auto-Approval',
        stageName: 'Contract',
        intervalDesc: 'Auto-approves signed contracts > 3h'
    },
    {
        key: 'rto-welcome',
        name: 'RtoWelcome',
        label: '3h CertHero RTO Welcome & Billing',
        stageName: 'RTO Courses',
        intervalDesc: 'Dispatches RTO credentials and payment notifications > 3h'
    },
    {
        key: 'rto-delivery',
        name: 'RtoTicketDelivery',
        label: '4h Digital Tickets & Statements of Attainment',
        stageName: 'Ticket Delivery',
        intervalDesc: 'Delivers digital tickets and Statement of Attainment > 4h'
    },
    {
        key: 'psychometric',
        name: 'PsychometricAutoApproval',
        label: '1h Psychometric Module 2 Auto-Pass',
        stageName: 'Psychometric Test',
        intervalDesc: 'Auto-passes psychometric module 2 attempts > 1h'
    }
];

export interface CronRecord {
    name: string;
    lastRunAt: Date | null;
    lastStatus: 'ok' | 'error' | 'never';
    lastError: string | null;
    runCount: number;
}

export interface DetailedCronStatus {
    key: string;
    name: string;
    label: string;
    stageName: string;
    intervalDesc: string;
    isPaused: boolean;               // True if globally paused OR individually paused
    isIndividuallyPaused: boolean;  // True if specifically paused
    lastRunAt: Date | null;
    lastStatus: 'ok' | 'error' | 'never';
    lastError: string | null;
    runCount: number;
}

const registry = new Map<string, CronRecord>();
let globalCronsPaused = false;
let pausedCronKeys = new Set<string>();

export function normalizeCronKey(nameOrKey: string): string {
    const lower = (nameOrKey || '').toLowerCase().trim();
    if (lower === 'applicationautoacceptance' || lower === 'application' || lower === 'applications') return 'application';
    if (lower === 'nominationfollowup' || lower === 'nomination' || lower === 'nominations' || lower === 'employer-selection' || lower === 'employerselection') return 'nomination';
    if (lower === 'onboardingfollowup' || lower === 'onboarding' || lower === 'onboardings' || lower === 'interview-onboarding' || lower === 'employer-contact') return 'onboarding';
    if (lower === 'sponsorshipautoapproval' || lower === 'sponsorshipdualcron' || lower === 'sponsorshipcallandrefundnotice' || lower === 'sponsorship' || lower === 'sponsorships' || lower === 'ticketsponsorship' || lower === 'ticket-sponsorship') return 'sponsorship';
    if (lower === 'contractautoapproval' || lower === 'contract' || lower === 'contracts') return 'contract';
    if (lower === 'rtowelcome' || lower === 'rto-welcome' || lower === 'aveling-welcome' || lower === 'avelingwelcome') return 'rto-welcome';
    if (lower === 'rtoticketdelivery' || lower === 'rto-delivery' || lower === 'aveling-delivery' || lower === 'avelingdelivery') return 'rto-delivery';
    if (lower === 'psychometricautoapproval' || lower === 'psychometric' || lower === 'psychometrics') return 'psychometric';
    if (lower === 'rto' || lower === 'aveling') return 'rto';
    if (lower === 'all' || lower === '*') return 'all';
    return lower;
}

async function persistSetting(key: string, value: string): Promise<void> {
    try {
        await sequelize.query(
            'INSERT INTO `cron_settings` (`key`, `value`, `createdAt`, `updatedAt`) VALUES (?, ?, NOW(), NOW()) ON DUPLICATE KEY UPDATE `value` = VALUES(`value`), `updatedAt` = NOW();',
            { replacements: [key, value] }
        );
    } catch (e: any) {
        console.warn(`[CronRegistry] Could not persist setting "${key}":`, e.message);
    }
}

export async function initCronSettings(): Promise<void> {
    try {
        const [rows] = await sequelize.query('SELECT `key`, `value` FROM `cron_settings`;') as any[];
        if (Array.isArray(rows)) {
            for (const row of rows) {
                if (row.key === 'global_paused') {
                    globalCronsPaused = row.value === 'true';
                } else if (row.key === 'paused_crons') {
                    try {
                        const parsed = JSON.parse(row.value || '[]');
                        if (Array.isArray(parsed)) {
                            pausedCronKeys = new Set(parsed.map(k => normalizeCronKey(k)));
                        }
                    } catch (e) {}
                }
            }
        }
        console.log(`[CronRegistry] Initialized from DB: globalPaused=${globalCronsPaused}, pausedCronKeys=[${Array.from(pausedCronKeys).join(', ')}]`);
    } catch (e: any) {
        console.log('[CronRegistry] Note on initializing settings from DB:', e.message);
    }
}

export function setCronsPaused(paused: boolean): void {
    globalCronsPaused = paused;
    if (paused) {
        for (const def of STAGE_CRONS) {
            pausedCronKeys.add(def.key);
        }
        pausedCronKeys.add('rto');
    } else {
        pausedCronKeys.clear();
    }
    persistSetting('global_paused', paused ? 'true' : 'false').catch(() => {});
    persistSetting('paused_crons', JSON.stringify(Array.from(pausedCronKeys))).catch(() => {});
}

export function areCronsPaused(): boolean {
    return globalCronsPaused;
}

export function setCronPaused(nameOrKey: string, paused: boolean): void {
    const key = normalizeCronKey(nameOrKey);
    if (key === 'all') {
        setCronsPaused(paused);
        return;
    }

    if (!paused) {
        // Resuming/starting an individual cron:
        // If all crons were globally paused, break global pause into individual pauses
        // so that the specific cron is now active and can start/run.
        if (globalCronsPaused) {
            globalCronsPaused = false;
            persistSetting('global_paused', 'false').catch(() => {});
            for (const def of STAGE_CRONS) {
                if (def.key !== key && !(key === 'rto' && (def.key === 'rto-welcome' || def.key === 'rto-delivery'))) {
                    pausedCronKeys.add(def.key);
                }
            }
        }
        if (key === 'rto') {
            pausedCronKeys.delete('rto-welcome');
            pausedCronKeys.delete('rto-delivery');
            pausedCronKeys.delete('rto');
        } else {
            pausedCronKeys.delete(key);
            if (key === 'rto-welcome' || key === 'rto-delivery') {
                pausedCronKeys.delete('rto');
            }
        }
    } else {
        // Pausing/stopping an individual cron
        if (key === 'rto') {
            pausedCronKeys.add('rto-welcome');
            pausedCronKeys.add('rto-delivery');
            pausedCronKeys.add('rto');
        } else {
            pausedCronKeys.add(key);
        }
        // If all individual crons are paused, set globalCronsPaused = true
        const allPaused = STAGE_CRONS.every(def => pausedCronKeys.has(def.key));
        if (allPaused) {
            globalCronsPaused = true;
            persistSetting('global_paused', 'true').catch(() => {});
        }
    }
    persistSetting('paused_crons', JSON.stringify(Array.from(pausedCronKeys))).catch(() => {});
}

export function isCronPaused(nameOrKey: string): boolean {
    const key = normalizeCronKey(nameOrKey);
    if (key === 'all') return globalCronsPaused;
    if (globalCronsPaused) return true;
    if (pausedCronKeys.has(key)) return true;
    if (key === 'rto' && (pausedCronKeys.has('rto-welcome') || pausedCronKeys.has('rto-delivery'))) return true;
    if ((key === 'rto-welcome' || key === 'rto-delivery') && pausedCronKeys.has('rto')) return true;
    return false;
}

export function getPausedCrons(): string[] {
    return Array.from(pausedCronKeys);
}

/**
 * Check if stage crons are paused for a specific applicant application.
 */
export function isApplicationCronPaused(application: any, cronKey?: string): boolean {
    if (!application) return false;

    // Normalize boolean flag (MySQL tinyint 1/0 or strings 'true'/'1')
    const isAppGloballyPaused = 
        application.isCronPaused === true || 
        application.isCronPaused === 1 || 
        String(application.isCronPaused) === 'true' || 
        String(application.isCronPaused) === '1';

    // 1. If application is marked paused overall, all crons for this application are paused
    if (isAppGloballyPaused) {
        return true;
    }

    // 2. If a specific cron is checked, verify application's pausedStageCrons array
    if (cronKey && application.pausedStageCrons) {
        let pausedList: string[] = [];
        if (Array.isArray(application.pausedStageCrons)) {
            pausedList = application.pausedStageCrons;
        } else if (typeof application.pausedStageCrons === 'string') {
            try {
                const parsed = JSON.parse(application.pausedStageCrons);
                if (Array.isArray(parsed)) pausedList = parsed;
            } catch (e) {
                pausedList = [];
            }
        }

        const normalizedTarget = normalizeCronKey(cronKey);
        for (const item of pausedList) {
            const normalizedItem = normalizeCronKey(item);
            if (normalizedItem === 'all') return true;
            if (normalizedItem === normalizedTarget) return true;
            if (normalizedTarget === 'rto' && (normalizedItem === 'rto-welcome' || normalizedItem === 'rto-delivery')) return true;
            if ((normalizedTarget === 'rto-welcome' || normalizedTarget === 'rto-delivery') && (normalizedItem === 'rto' || normalizedItem === normalizedTarget)) return true;
        }
    }

    return false;
}

export function registerCron(name: string): void {
    const key = normalizeCronKey(name);
    const rec: CronRecord = {
        name: key,
        lastRunAt: null,
        lastStatus: 'never',
        lastError: null,
        runCount: 0
    };
    registry.set(key, rec);
    registry.set(name, rec);
}

export function recordCronRun(nameOrKey: string, status: 'ok' | 'error', error?: string): void {
    const key = normalizeCronKey(nameOrKey);
    const existing = (registry.get(key) || registry.get(nameOrKey)) ?? {
        name: key,
        lastRunAt: null,
        lastStatus: 'never',
        lastError: null,
        runCount: 0
    };
    const updated: CronRecord = {
        ...existing,
        name: key,
        lastRunAt: new Date(),
        lastStatus: status,
        lastError: error ?? null,
        runCount: (existing.runCount || 0) + 1
    };
    registry.set(key, updated);
    registry.set(nameOrKey, updated);
}

export function getCronStatus(): CronRecord[] {
    return Array.from(registry.values());
}

export function getCronStatusDetails(): {
    globalPaused: boolean;
    pausedCrons: string[];
    crons: DetailedCronStatus[];
} {
    const list: DetailedCronStatus[] = STAGE_CRONS.map(def => {
        const record = registry.get(def.key) || registry.get(def.name);
        const isIndividuallyPaused = pausedCronKeys.has(def.key) || (def.key.startsWith('rto-') && pausedCronKeys.has('rto'));
        const isPaused = globalCronsPaused || isIndividuallyPaused;

        return {
            key: def.key,
            name: def.name,
            label: def.label,
            stageName: def.stageName,
            intervalDesc: def.intervalDesc,
            isPaused,
            isIndividuallyPaused,
            lastRunAt: record?.lastRunAt || null,
            lastStatus: record?.lastStatus || 'never',
            lastError: record?.lastError || null,
            runCount: record?.runCount || 0
        };
    });

    return {
        globalPaused: globalCronsPaused,
        pausedCrons: Array.from(pausedCronKeys),
        crons: list
    };
}
