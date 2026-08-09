import { seedDatabase } from './seedDatabase';
import { connectDB } from './config/database';
async function run() {
    await connectDB();
    await seedDatabase();
    process.exit(0);
}
run();
