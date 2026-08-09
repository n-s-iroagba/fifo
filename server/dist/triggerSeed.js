"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const seedDatabase_1 = require("./seedDatabase");
const database_1 = require("./config/database");
async function run() {
    await (0, database_1.connectDB)();
    await (0, seedDatabase_1.seedDatabase)();
    process.exit(0);
}
run();
