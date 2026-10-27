"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../config/database");
const seedDatabase_1 = require("../seedDatabase");
async function run() {
    try {
        console.log('[Script] Connecting to DB and seeding new employers...');
        await database_1.sequelize.authenticate();
        console.log('[Script] DB Connected.');
        const { maca, minRes, northernStar, rioTinto } = await (0, seedDatabase_1.seedEmployers)();
        await (0, seedDatabase_1.seedJobListings)(maca, minRes, northernStar, rioTinto);
        console.log('[Script] Successfully seeded Northern Star Resources Ltd. and Rio Tinto and linked them to job listings!');
        process.exit(0);
    }
    catch (err) {
        console.error('[Script] Seeding error:', err);
        process.exit(1);
    }
}
run();
