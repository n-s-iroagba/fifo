"use strict";
/**
 * cronRegistry.ts
 * A shared registry that tracks cron job health and provides granular controls:
 * 1. Global pause / resume for all stage crons
 * 2. Granular pause / resume for individual stage crons
 * 3. Individual candidate application cron pause checks
 * 4. DB persistence via `cron_settings` table
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.STAGE_CRONS = void 0;
exports.normalizeCronKey = normalizeCronKey;
exports.initCronSettings = initCronSettings;
exports.setCronsPaused = setCronsPaused;
exports.areCronsPaused = areCronsPaused;
exports.setCronPaused = setCronPaused;
exports.isCronPaused = isCronPaused;
exports.getPausedCrons = getPausedCrons;
exports.isApplicationCronPaused = isApplicationCronPaused;
exports.registerCron = registerCron;
exports.recordCronRun = recordCronRun;
exports.getCronStatus = getCronStatus;
exports.getCronStatusDetails = getCronStatusDetails;
const database_1 = require("../config/database");
exports.STAGE_CRONS = [
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
        name: 'SponsorshipAutoApproval',
        label: '2h Ticket Sponsorship Auto-Approval',
        stageName: 'TicketSponsorship',
        intervalDesc: 'Auto-approves ticket sponsorships > 2h and advances to Contract'
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
const registry = new Map();
let globalCronsPaused = false;
let pausedCronKeys = new Set();
function normalizeCronKey(nameOrKey) {
    const lower = (nameOrKey || '').toLowerCase().trim();
    if (lower === 'applicationautoacceptance' || lower === 'application' || lower === 'applications')
        return 'application';
    if (lower === 'nominationfollowup' || lower === 'nomination' || lower === 'employer-selection' || lower === 'employerselection')
        return 'nomination';
    if (lower === 'onboardingfollowup' || lower === 'onboarding' || lower === 'interview-onboarding' || lower === 'employer-contact')
        return 'onboarding';
    if (lower === 'sponsorshipautoapproval' || lower === 'sponsorship' || lower === 'ticketsponsorship')
        return 'sponsorship';
    if (lower === 'contractautoapproval' || lower === 'contract')
        return 'contract';
    if (lower === 'rtowelcome' || lower === 'rto-welcome' || lower === 'aveling-welcome' || lower === 'avelingwelcome')
        return 'rto-welcome';
    if (lower === 'rtoticketdelivery' || lower === 'rto-delivery' || lower === 'aveling-delivery' || lower === 'avelingdelivery')
        return 'rto-delivery';
    if (lower === 'psychometricautoapproval' || lower === 'psychometric' || lower === 'psychometrics')
        return 'psychometric';
    if (lower === 'rto' || lower === 'aveling')
        return 'rto';
    return lower;
}
async function persistSetting(key, value) {
    try {
        await database_1.sequelize.query('INSERT INTO `cron_settings` (`key`, `value`, `createdAt`, `updatedAt`) VALUES (?, ?, NOW(), NOW()) ON DUPLICATE KEY UPDATE `value` = VALUES(`value`), `updatedAt` = NOW();', { replacements: [key, value] });
    }
    catch (e) {
        console.warn(`[CronRegistry] Could not persist setting "${key}":`, e.message);
    }
}
async function initCronSettings() {
    try {
        const [rows] = await database_1.sequelize.query('SELECT `key`, `value` FROM `cron_settings`;');
        if (Array.isArray(rows)) {
            for (const row of rows) {
                if (row.key === 'global_paused') {
                    globalCronsPaused = row.value === 'true';
                }
                else if (row.key === 'paused_crons') {
                    try {
                        const parsed = JSON.parse(row.value || '[]');
                        if (Array.isArray(parsed)) {
                            pausedCronKeys = new Set(parsed.map(k => normalizeCronKey(k)));
                        }
                    }
                    catch (e) { }
                }
            }
        }
        console.log(`[CronRegistry] Initialized from DB: globalPaused=${globalCronsPaused}, pausedCronKeys=[${Array.from(pausedCronKeys).join(', ')}]`);
    }
    catch (e) {
        console.log('[CronRegistry] Note on initializing settings from DB:', e.message);
    }
}
function setCronsPaused(paused) {
    globalCronsPaused = paused;
    persistSetting('global_paused', paused ? 'true' : 'false').catch(() => { });
}
function areCronsPaused() {
    return globalCronsPaused;
}
function setCronPaused(nameOrKey, paused) {
    const key = normalizeCronKey(nameOrKey);
    if (key === 'all') {
        setCronsPaused(paused);
        return;
    }
    if (key === 'rto') {
        if (paused) {
            pausedCronKeys.add('rto-welcome');
            pausedCronKeys.add('rto-delivery');
            pausedCronKeys.add('rto');
        }
        else {
            pausedCronKeys.delete('rto-welcome');
            pausedCronKeys.delete('rto-delivery');
            pausedCronKeys.delete('rto');
        }
    }
    else {
        if (paused) {
            pausedCronKeys.add(key);
        }
        else {
            pausedCronKeys.delete(key);
        }
    }
    persistSetting('paused_crons', JSON.stringify(Array.from(pausedCronKeys))).catch(() => { });
}
function isCronPaused(nameOrKey) {
    if (globalCronsPaused)
        return true;
    const key = normalizeCronKey(nameOrKey);
    if (pausedCronKeys.has(key))
        return true;
    if (key === 'rto' && (pausedCronKeys.has('rto-welcome') || pausedCronKeys.has('rto-delivery')))
        return true;
    if ((key === 'rto-welcome' || key === 'rto-delivery') && pausedCronKeys.has('rto'))
        return true;
    return false;
}
function getPausedCrons() {
    return Array.from(pausedCronKeys);
}
/**
 * Check if stage crons are paused for a specific applicant application.
 */
function isApplicationCronPaused(application, cronKey) {
    if (!application)
        return false;
    // 1. If application has isCronPaused = true, all crons for this application are paused
    if (application.isCronPaused === true || application.isCronPaused === 1) {
        return true;
    }
    // 2. If a specific cron is checked, verify application's pausedStageCrons array
    if (cronKey && application.pausedStageCrons) {
        let pausedList = [];
        if (Array.isArray(application.pausedStageCrons)) {
            pausedList = application.pausedStageCrons;
        }
        else if (typeof application.pausedStageCrons === 'string') {
            try {
                const parsed = JSON.parse(application.pausedStageCrons);
                if (Array.isArray(parsed))
                    pausedList = parsed;
            }
            catch (e) {
                pausedList = [];
            }
        }
        const normalizedTarget = normalizeCronKey(cronKey);
        for (const item of pausedList) {
            const normalizedItem = normalizeCronKey(item);
            if (normalizedItem === 'all')
                return true;
            if (normalizedItem === normalizedTarget)
                return true;
            if (normalizedTarget === 'rto' && (normalizedItem === 'rto-welcome' || normalizedItem === 'rto-delivery'))
                return true;
            if ((normalizedTarget === 'rto-welcome' || normalizedTarget === 'rto-delivery') && normalizedItem === 'rto')
                return true;
        }
    }
    return false;
}
function registerCron(name) {
    registry.set(name, {
        name,
        lastRunAt: null,
        lastStatus: 'never',
        lastError: null,
        runCount: 0
    });
}
function recordCronRun(name, status, error) {
    const existing = registry.get(name) ?? {
        name,
        lastRunAt: null,
        lastStatus: 'never',
        lastError: null,
        runCount: 0
    };
    registry.set(name, {
        ...existing,
        lastRunAt: new Date(),
        lastStatus: status,
        lastError: error ?? null,
        runCount: existing.runCount + 1
    });
}
function getCronStatus() {
    return Array.from(registry.values());
}
function getCronStatusDetails() {
    const list = exports.STAGE_CRONS.map(def => {
        const record = registry.get(def.name);
        const isIndividuallyPaused = pausedCronKeys.has(def.key);
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
