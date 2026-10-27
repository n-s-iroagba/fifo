import { sequelize } from '../config/database';
import { seedEmployers, seedJobListings } from '../seedDatabase';

async function run() {
    try {
        console.log('[Script] Connecting to DB and seeding new employers...');
        await sequelize.authenticate();
        console.log('[Script] DB Connected.');
        const { maca, minRes, northernStar, rioTinto } = await seedEmployers();
        await seedJobListings(maca, minRes, northernStar, rioTinto);
        console.log('[Script] Successfully seeded Northern Star Resources Ltd. and Rio Tinto and linked them to job listings!');
        process.exit(0);
    } catch (err) {
        console.error('[Script] Seeding error:', err);
        process.exit(1);
    }
}

run();
