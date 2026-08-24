import { runAllMigrations } from './migrations';

export async function run() {
    await runAllMigrations();
}

