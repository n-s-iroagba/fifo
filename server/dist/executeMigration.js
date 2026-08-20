"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const runMigration_1 = require("./runMigration");
const database_1 = require("./config/database");
async function execute() {
    await (0, database_1.connectDB)();
    await (0, runMigration_1.run)();
    process.exit(0);
}
execute();
