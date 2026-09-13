"use strict";
/**
 * cronRegistry.ts
 * A shared in-memory registry that tracks cron job health.
 * Each cron updates its last-run timestamp and status after every execution.
 * Exposed via GET /health/crons for production observability.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.setCronsPaused = setCronsPaused;
exports.areCronsPaused = areCronsPaused;
exports.registerCron = registerCron;
exports.recordCronRun = recordCronRun;
exports.getCronStatus = getCronStatus;
const registry = new Map();
let globalCronsPaused = false;
function setCronsPaused(paused) {
    globalCronsPaused = paused;
}
function areCronsPaused() {
    return globalCronsPaused;
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
