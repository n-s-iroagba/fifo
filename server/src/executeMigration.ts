import { run } from './runMigration';
import { connectDB } from './config/database';

async function execute() {
    await connectDB();
    await run();
    process.exit(0);
}
execute();
