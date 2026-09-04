/**
 * cronRegistry.ts
 * A shared in-memory registry that tracks cron job health.
 * Each cron updates its last-run timestamp and status after every execution.
 * Exposed via GET /health/crons for production observability.
 */

interface CronRecord {
    name: string;
    lastRunAt: Date | null;
    lastStatus: 'ok' | 'error' | 'never';
    lastError: string | null;
    runCount: number;
}

const registry = new Map<string, CronRecord>();
let globalCronsPaused = false;

export function setCronsPaused(paused: boolean): void {
    globalCronsPaused = paused;
}

export function areCronsPaused(): boolean {
    return globalCronsPaused;
}

export function registerCron(name: string): void {
    registry.set(name, {
        name,
        lastRunAt: null,
        lastStatus: 'never',
        lastError: null,
        runCount: 0
    });
}

export function recordCronRun(name: string, status: 'ok' | 'error', error?: string): void {
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

export function getCronStatus(): CronRecord[] {
    return Array.from(registry.values());
}
